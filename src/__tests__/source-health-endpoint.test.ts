/**
 * The per-source health view.
 *
 * fetchFeed() turns every failure into an empty array so one dead source can
 * never break the aggregate, which means a source can rot silently for weeks.
 * The ring in lib/source-health is what makes that visible, and these tests pin
 * the two things an operator relies on: a failing source is reported as failing
 * (and sorts to the top), and the filters actually narrow the list.
 */

import { describe, it, expect, beforeEach } from 'vitest';

import { GET } from '@/app/api/sources/health/route';
import { recordFeedOutcome, resetFeedHealth } from '@/lib/source-health';

const req = (qs = '') => new Request(`https://cryptocurrency.cv/api/sources/health${qs}`) as never;

describe('GET /api/sources/health', () => {
  beforeEach(() => {
    resetFeedHealth();
  });

  it('reports an empty, honest snapshot before any feed has been checked', async () => {
    const body = await (await GET(req())).json();
    expect(body.summary.totalSources).toBe(0);
    expect(body.summary.totalAttempts).toBe(0);
    expect(body.sources).toEqual([]);
  });

  it('surfaces a failing source with its cause and sorts it first', async () => {
    recordFeedOutcome({
      url: 'https://good.example/rss',
      name: 'Good',
      category: 'defi',
      status: 'ok',
      latencyMs: 100,
    });
    recordFeedOutcome({
      url: 'https://dead.example/rss',
      name: 'Dead',
      category: 'bitcoin',
      status: 'fail',
      latencyMs: 3000,
      error: 'timeout after 3000ms',
      httpStatus: 504,
    });

    const body = await (await GET(req())).json();
    expect(body.summary.totalSources).toBe(2);
    expect(body.summary.failing).toBe(1);
    expect(body.summary.healthy).toBe(1);
    expect(body.sources[0].name).toBe('Dead');
    expect(body.sources[0].lastError).toContain('timeout');
    expect(body.sources[0].lastHttpStatus).toBe(504);
    expect(body.sources[0].lastSuccessAt).toBeNull();
  });

  it('filters by status and by category', async () => {
    recordFeedOutcome({
      url: 'https://a.example/rss',
      name: 'A',
      category: 'defi',
      status: 'ok',
      latencyMs: 10,
    });
    recordFeedOutcome({
      url: 'https://b.example/rss',
      name: 'B',
      category: 'defi',
      status: 'fail',
      latencyMs: 20,
      error: 'boom',
    });
    recordFeedOutcome({
      url: 'https://c.example/rss',
      name: 'C',
      category: 'nft',
      status: 'fail',
      latencyMs: 30,
      error: 'boom',
    });

    const failing = await (await GET(req('?status=failing'))).json();
    expect(failing.sources.map((s: { name: string }) => s.name).sort()).toEqual(['B', 'C']);

    const defi = await (await GET(req('?category=defi'))).json();
    expect(defi.sources.map((s: { name: string }) => s.name).sort()).toEqual(['A', 'B']);

    const summary = await (await GET(req('?summary=1'))).json();
    expect(summary.sources).toBeUndefined();
    expect(summary.summary.totalSources).toBe(3);
  });

  it('tracks the success rate across repeated checks of one feed', async () => {
    for (const status of ['ok', 'fail', 'ok', 'ok'] as const) {
      recordFeedOutcome({
        url: 'https://f.example/rss',
        name: 'F',
        category: 'general',
        status,
        latencyMs: 50,
      });
    }
    const body = await (await GET(req())).json();
    const row = body.sources[0];
    expect(row.attempts).toBe(4);
    expect(row.failures).toBe(1);
    expect(row.successRate).toBeCloseTo(0.75, 5);
    expect(row.lastStatus).toBe('ok');
    expect(row.lastSuccessAt).not.toBeNull();
  });
});
