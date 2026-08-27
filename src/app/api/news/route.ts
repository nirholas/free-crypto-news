/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import { type NextRequest } from 'next/server';
import { getLatestNews } from '@/lib/crypto-news';
import { translateArticles, isLanguageSupported, SUPPORTED_LANGUAGES } from '@/lib/translate';
import { jsonResponse, errorResponse, withTiming } from '@/lib/api-utils';
import { validateQuery } from '@/lib/validation-middleware';
import { newsQuerySchema } from '@/lib/schemas';
import { createRequestLogger } from '@/lib/logger';
import { getBulkEnrichment } from '@/lib/article-enrichment';
import { staleCache, generateCacheKey } from '@/lib/cache';
import { getNewsFallback } from '@/lib/fallback';
import { PREMIUM_URL } from '@/lib/constants';
import { instrumented } from '@/lib/telemetry-middleware';

export const runtime = 'edge';
export const revalidate = 60; // 1 minute for fresher content

/** Race a promise against a timeout; returns fallback on expiry. */
/** Articles an anonymous free-tier caller receives per request. */
const FREE_TIER_ARTICLE_LIMIT = 3;

function withTimeout<T>(promise: Promise<T>, ms: number, fallback: T): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((resolve) => setTimeout(() => resolve(fallback), ms)),
  ]);
}

// Valid news categories (kept for backward compatibility)
const VALID_CATEGORIES = [
  'general',
  'bitcoin',
  'defi',
  'nft',
  'research',
  'institutional',
  'etf',
  'derivatives',
  'onchain',
  'macro',
  'quant',
  'journalism',
  'ethereum',
  'asia',
  'tradfi',
  'mainstream',
  'mining',
  'gaming',
  'altl1',
  'stablecoin',
  'geopolitical',
  'security',
  'developer',
  'layer2',
  'solana',
  'trading',
];

export const GET = instrumented(
  async function GET(request: NextRequest) {
    const logger = createRequestLogger(request);
    const startTime = Date.now();
    const isFreeTier = request.headers.get('x-free-tier') === '1';

    logger.info('Fetching news');

    // Validate query parameters using Zod schema
    const validation = validateQuery(request, newsQuerySchema);
    if (!validation.success) {
      return validation.error;
    }

    const { limit, source, category, from, to, page, per_page, lang, quality, contentType } =
      validation.data;
    const sort = request.nextUrl.searchParams.get('sort'); // 'impact' → sort by AI impact score
    const sources = request.nextUrl.searchParams.get('sources'); // 'homepage' → curated T1/T2 only

    // Validate language parameter (additional check beyond schema)
    if (lang !== 'en' && !isLanguageSupported(lang)) {
      return errorResponse(
        'Unsupported language',
        `Language '${lang}' is not supported. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`,
        400,
      );
    }

    try {
      const data = await getLatestNews(limit, source, {
        from,
        to,
        page,
        perPage: per_page,
        category,
        homepageOnly: sources === 'homepage',
        quality,
      });

      // Filter by contentType if specified
      if (contentType) {
        data.articles = data.articles.filter((a) => a.contentType === contentType);
        data.totalCount = data.articles.length;
      }

      // Free-tier: cap at 3 articles, strip full content, add upgrade notice
      let articles = data.articles;
      const uncappedCount = articles.length;
      if (isFreeTier) {
        articles = articles.slice(0, FREE_TIER_ARTICLE_LIMIT).map((a) => ({
          ...a,
          content: undefined,
          summary: (a as { summary?: string }).summary?.slice(0, 120)
            ? (a as { summary?: string }).summary!.slice(0, 120) + '…'
            : undefined,
        }));
      }

      // Translate articles if language is not English
      let translatedLang = 'en';

      // Attach AI enrichment (non-blocking — skip silently if KV unavailable)
      // Capped at 10 s to prevent runaway latency contributing to 504s.
      if (!isFreeTier) {
        try {
          const emptyMap = new Map<string, unknown>();
          const enrichmentMap = await withTimeout(
            getBulkEnrichment(articles.map((a) => a.link)),
            10_000,
            emptyMap,
          );
          articles = articles.map((a) => {
            const ai = enrichmentMap.get(a.link);
            return ai ? { ...a, ai } : a;
          });

          // Optional sort by AI impact score (highest first)
          if (sort === 'impact') {
            articles = [...articles].sort((a, b) => {
              const sa = (a as { ai?: { impactScore?: number } }).ai?.impactScore ?? -1;
              const sb = (b as { ai?: { impactScore?: number } }).ai?.impactScore ?? -1;
              return sb - sa;
            });
          }
        } catch {
          // Enrichment is best-effort — continue without it
        }
      }

      // Translation capped at 15 s to prevent 504 timeouts
      if (lang !== 'en' && articles.length > 0) {
        try {
          const translated = await withTimeout(translateArticles(articles, lang), 15_000, articles);
          if (translated !== articles) {
            articles = translated;
            translatedLang = lang;
          }
        } catch (translateError) {
          logger.error('Translation failed', translateError);
          // Continue with original articles on translation failure
        }
      }

      // A cold instance can finish its first aggregation with nothing yet
      // fetched. Serving an empty flagship feed reads as "the API is broken",
      // so fall back to the snapshot the same way an upstream failure does.
      if (articles.length === 0 && data.totalCount === 0) {
        logger.info('Aggregate returned no articles — serving snapshot fallback');
        const fallback = getNewsFallback();
        return jsonResponse(
          withTiming({ ...fallback.data, _fallbackLevel: fallback.level }, startTime),
          { cacheControl: 'realtime', etag: true, request, stale: true },
        );
      }

      // Pagination must describe what the caller actually received. A capped
      // free-tier response used to report perPage: 50 over a totalCount in the
      // thousands, which broke every paginating client.
      const pagination = isFreeTier
        ? {
            page: 1,
            perPage: articles.length,
            totalPages: 1,
            hasMore: uncappedCount > articles.length,
          }
        : data.pagination;

      const responseData = withTiming(
        {
          ...data,
          articles,
          ...(pagination ? { pagination } : {}),
          lang: translatedLang,
          availableLanguages: Object.keys(SUPPORTED_LANGUAGES),
          availableCategories: VALID_CATEGORIES,
          ...(isFreeTier
            ? {
                free_tier: true,
                total: articles.length,
                limited: uncappedCount > articles.length,
                maxResults: FREE_TIER_ARTICLE_LIMIT,
                upgrade: PREMIUM_URL,
              }
            : {}),
        },
        startTime,
      );

      // Persist into stale cache so we can serve it when feeds are unreachable
      const staleCacheKey = generateCacheKey('news', {
        limit,
        source,
        category,
        page,
        per_page,
        lang,
      });
      staleCache.set(staleCacheKey, responseData, 3600); // 1 hour stale window

      return jsonResponse(responseData, {
        cacheControl: 'realtime', // matches ISR revalidate=60; s-maxage=60
        etag: true,
        request,
      });
    } catch (error) {
      logger.error('Failed to fetch news', error);

      // Stale-on-error: serve last-known-good data so API consumers never see a 500
      const staleCacheKey = generateCacheKey('news', {
        limit,
        source,
        category,
        page,
        per_page,
        lang,
      });
      const stale = staleCache.get<Record<string, unknown>>(staleCacheKey);
      if (stale) {
        logger.info('Serving stale news data after upstream failure');
        return jsonResponse(stale, {
          cacheControl: 'realtime',
          etag: true,
          request,
          stale: true,
        });
      }

      // Snapshot fallback → emergency hardcoded data (never returns an error)
      logger.info('Stale cache empty — falling back to snapshot/emergency archive');
      const fallback = getNewsFallback();
      return jsonResponse(
        withTiming({ ...fallback.data, _fallbackLevel: fallback.level }, startTime),
        { cacheControl: 'realtime', etag: true, request, stale: true },
      );
    }
  },
  { name: 'news' },
);
