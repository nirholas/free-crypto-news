/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * Author Extraction & Normalization
 * Extracts, normalizes, and indexes authors from RSS feed data.
 */

import { getLatestNews, type NewsArticle } from '@/lib/crypto-news';
import { swrCached } from '@/lib/page-cache';

/* ------------------------------------------------------------------ */
/*  Types                                                             */
/* ------------------------------------------------------------------ */

export interface Author {
  slug: string;
  name: string;
  sources: string[];
  articleCount: number;
  firstSeen: string;
  lastSeen: string;
  avatarUrl?: string;
  bio?: string;
}

export interface AuthorsResponse {
  authors: Author[];
  total: number;
  hasMore: boolean;
}

export interface AuthorWithArticles {
  author: Author;
  articles: NewsArticle[];
  total: number;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                         */
/* ------------------------------------------------------------------ */

const STAFF_NAMES = new Set([
  'staff',
  'staff writer',
  'editorial team',
  'editor',
  'editors',
  'coindesk staff',
  'cointelegraph staff',
  'decrypt staff',
  'blockworks staff',
  'the block staff',
  'news desk',
  'newsroom',
  'admin',
  'contributor',
  'guest author',
  'anonymous',
  'unknown',
  '',
]);

/* ------------------------------------------------------------------ */
/*  Normalization                                                     */
/* ------------------------------------------------------------------ */

/**
 * Normalise an author name for display:
 * - Trim whitespace
 * - Strip "By " prefix
 * - Title case
 * - Collapse multiple spaces
 */
export function normalizeAuthorName(raw: string): string {
  if (!raw) return '';

  let name = raw.trim();

  // Strip common prefixes
  name = name.replace(/^by\s+/i, '');
  name = name.replace(/^written\s+by\s+/i, '');
  name = name.replace(/^author:\s*/i, '');

  // Collapse whitespace
  name = name.replace(/\s+/g, ' ').trim();

  if (!name) return '';

  // Title case
  name = name
    .split(' ')
    .map((word) => {
      if (word.length === 0) return word;
      // Preserve all-caps acronyms (e.g. "AI", "CEO")
      if (word.length <= 3 && word === word.toUpperCase()) return word;
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');

  return name;
}

/**
 * Generate a URL-safe slug from an author name.
 */
export function authorSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove non-word chars except spaces/hyphens
    .replace(/\s+/g, '-') // Spaces → hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-|-$/g, ''); // Trim leading/trailing hyphens
}

/**
 * Check whether an author name should be excluded (staff / generic).
 */
function isStaffAuthor(name: string): boolean {
  return STAFF_NAMES.has(name.toLowerCase().trim());
}

/* ------------------------------------------------------------------ */
/*  Author extraction from articles                                   */
/* ------------------------------------------------------------------ */

/**
 * Build a map of authors from articles.
 * Returns a Map keyed by author slug.
 */
function buildAuthorMap(articles: NewsArticle[]): Map<string, Author> {
  const map = new Map<string, Author>();

  for (const article of articles) {
    const rawAuthor = article.author;
    if (!rawAuthor) continue;

    const normalized = normalizeAuthorName(rawAuthor);
    if (!normalized || isStaffAuthor(normalized)) continue;

    const slug = authorSlug(normalized);
    if (!slug) continue;

    const existing = map.get(slug);
    if (existing) {
      existing.articleCount += 1;
      if (!existing.sources.includes(article.source)) {
        existing.sources.push(article.source);
      }
      if (article.pubDate < existing.firstSeen) {
        existing.firstSeen = article.pubDate;
      }
      if (article.pubDate > existing.lastSeen) {
        existing.lastSeen = article.pubDate;
      }
    } else {
      map.set(slug, {
        slug,
        name: normalized,
        sources: [article.source],
        articleCount: 1,
        firstSeen: article.pubDate,
        lastSeen: article.pubDate,
      });
    }
  }

  return map;
}

/* ------------------------------------------------------------------ */
/*  Shared author index                                               */
/* ------------------------------------------------------------------ */

interface AuthorIndex {
  authors: Author[];
  articles: NewsArticle[];
}

/**
 * One aggregation feeds both the directory and every author profile.
 * The all-sources feed behind it is the most expensive call on the site, so
 * the derived index is held with a stale-while-revalidate window instead of
 * being rebuilt from a cold feed on every request.
 */
function getAuthorIndex(): Promise<AuthorIndex> {
  return swrCached(
    'authors:index',
    async () => {
      const news = await getLatestNews(50);
      return {
        authors: Array.from(buildAuthorMap(news.articles).values()),
        articles: news.articles,
      };
    },
    { fresh: 300, shouldCache: (index) => index.articles.length > 0 },
  );
}

/* ------------------------------------------------------------------ */
/*  Public API                                                        */
/* ------------------------------------------------------------------ */

/**
 * Get all authors aggregated from current articles.
 */
export async function getAuthors(options?: {
  limit?: number;
  offset?: number;
  sort?: 'articles' | 'recent' | 'name';
  search?: string;
}): Promise<AuthorsResponse> {
  const { limit = 50, offset = 0, sort = 'articles', search } = options ?? {};

  const index = await getAuthorIndex();
  let authors = [...index.authors];

  // Search filter
  if (search) {
    const q = search.toLowerCase();
    authors = authors.filter((a) => a.name.toLowerCase().includes(q));
  }

  // Sort
  switch (sort) {
    case 'recent':
      authors.sort((a, b) => b.lastSeen.localeCompare(a.lastSeen));
      break;
    case 'name':
      authors.sort((a, b) => a.name.localeCompare(b.name));
      break;
    case 'articles':
    default:
      authors.sort((a, b) => b.articleCount - a.articleCount);
      break;
  }

  const total = authors.length;
  const paginated = authors.slice(offset, offset + limit);
  const hasMore = offset + limit < total;

  return { authors: paginated, total, hasMore };
}

/**
 * Get a single author by slug, with their articles.
 */
export async function getAuthorBySlug(
  slug: string,
  options?: { limit?: number; offset?: number; source?: string },
): Promise<AuthorWithArticles | null> {
  const { limit = 20, offset = 0, source } = options ?? {};

  const index = await getAuthorIndex();
  const author = index.authors.find((a) => a.slug === slug);

  if (!author) return null;

  // Get articles for this author
  let articles = index.articles.filter((a) => {
    if (!a.author) return false;
    const normalized = normalizeAuthorName(a.author);
    return authorSlug(normalized) === slug;
  });

  // Optional source filter
  if (source) {
    articles = articles.filter((a) => a.sourceKey === source || a.source === source);
  }

  const total = articles.length;
  const paginated = articles.slice(offset, offset + limit);

  return { author, articles: paginated, total };
}
