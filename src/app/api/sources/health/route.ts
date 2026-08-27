/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/cryptocurrency.cv
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * GET /api/sources/health
 *
 * Which of the aggregator's RSS sources are actually answering right now.
 *
 * `fetchFeed()` is deliberately forgiving: a source that times out, 404s or
 * 429s contributes an empty array so one dead feed can never break the
 * aggregate. That is the right behaviour for readers and a terrible one for
 * operators, because a source can rot for weeks and look identical to a source
 * that simply had no news. Every fetch now records its outcome in a per-feed
 * ring (lib/source-health), and this endpoint is where that becomes visible.
 *
 * Read-only and unauthenticated on purpose: the point is that anyone relying on
 * this aggregator can check the sourcing themselves rather than taking a
 * "200+ sources" badge on faith.
 *
 * Query:
 *   ?status=failing   only sources whose last check failed
 *   ?category=defi    restrict to one category
 *   ?summary=1        counts only, no per-source rows
 *
 * Numbers cover this server instance's recent history (the last 20 checks per
 * feed), not a global all-time record; `generatedAt` and `attempts` say how much
 * evidence is behind them. A freshly started instance honestly reports zero.
 */

import { type NextRequest, NextResponse } from 'next/server';

import {
  getFeedHealth,
  persistFeedHealthSummary,
  summarizeFeedHealth,
  type FeedHealthRecord,
} from '@/lib/source-health';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status');
  const category = searchParams.get('category');
  const summaryOnly = searchParams.get('summary') === '1' || searchParams.get('summary') === 'true';

  let records: FeedHealthRecord[] = getFeedHealth();
  if (category) records = records.filter((r) => r.category === category);
  if (status === 'failing') records = records.filter((r) => r.lastStatus === 'fail');
  else if (status === 'ok') records = records.filter((r) => r.lastStatus === 'ok');

  // Worst first: an operator opening this wants the broken sources, not an
  // alphabetical list they have to scan.
  records.sort((a, b) => a.successRate - b.successRate || b.failures - a.failures);

  // Best-effort durable snapshot; no-ops without a database and never blocks
  // the response on one.
  void persistFeedHealthSummary().catch(() => {});

  const summary = summarizeFeedHealth(getFeedHealth());
  const body = summaryOnly
    ? { summary }
    : {
        summary,
        filters: { status: status ?? null, category: category ?? null },
        count: records.length,
        sources: records,
      };

  return NextResponse.json(body, {
    headers: {
      // Short cache: this is a liveness view, and a minute-old answer is still
      // useful while keeping a dashboard from hammering the instance.
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
