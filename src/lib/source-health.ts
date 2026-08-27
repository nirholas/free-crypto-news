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
 * Per-source feed health
 *
 * `fetchFeed()` in crypto-news.ts swallows every upstream failure into an
 * empty article list so one dead RSS source never breaks the aggregate. That
 * is the right contract for callers, but it hides which sources are failing.
 * This module keeps a small in-memory ring of recent outcomes per feed URL
 * (ok/fail, latency, last error, last success) so `/api/sources/health` can
 * report it, and can persist a summary row to `provider_health` when Postgres
 * is configured.
 *
 * The ring lives in module scope, so it reflects the current server instance
 * only. That is intentional: it is a live diagnostic, not an archive.
 */

export type FeedOutcomeStatus = 'ok' | 'fail';

export interface FeedOutcome {
  status: FeedOutcomeStatus;
  latencyMs: number;
  at: number;
  error?: string;
  httpStatus?: number;
}

export interface FeedHealthRecord {
  url: string;
  name: string;
  category: string;
  lastStatus: FeedOutcomeStatus;
  lastLatencyMs: number;
  lastCheckedAt: string;
  lastSuccessAt: string | null;
  lastError: string | null;
  lastHttpStatus: number | null;
  attempts: number;
  failures: number;
  successRate: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  recent: FeedOutcome[];
}

export interface FeedHealthSummary {
  totalSources: number;
  healthy: number;
  failing: number;
  successRate: number;
  avgLatencyMs: number;
  p99LatencyMs: number;
  totalAttempts: number;
  totalFailures: number;
  generatedAt: string;
}

const RING_SIZE = 20;

interface RingEntry {
  name: string;
  category: string;
  outcomes: FeedOutcome[];
}

const ring = new Map<string, RingEntry>();

function pushOutcome(entry: RingEntry, outcome: FeedOutcome): void {
  entry.outcomes.push(outcome);
  if (entry.outcomes.length > RING_SIZE) entry.outcomes.shift();
}

export interface RecordFeedOutcomeInput {
  url: string;
  name: string;
  category: string;
  status: FeedOutcomeStatus;
  latencyMs: number;
  error?: string;
  httpStatus?: number;
}

/**
 * Record one fetch attempt for a feed. Called by fetchFeed() on every real
 * network round-trip (cache hits are not fetches and are not recorded).
 */
export function recordFeedOutcome(input: RecordFeedOutcomeInput): void {
  let entry = ring.get(input.url);
  if (!entry) {
    entry = { name: input.name, category: input.category, outcomes: [] };
    ring.set(input.url, entry);
  }
  pushOutcome(entry, {
    status: input.status,
    latencyMs: Math.max(0, Math.round(input.latencyMs)),
    at: Date.now(),
    error: input.error,
    httpStatus: input.httpStatus,
  });
}

function percentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const idx = Math.min(sorted.length - 1, Math.ceil((p / 100) * sorted.length) - 1);
  return sorted[Math.max(0, idx)];
}

function toRecord(url: string, entry: RingEntry): FeedHealthRecord {
  const outcomes = entry.outcomes;
  const last = outcomes[outcomes.length - 1];
  const failures = outcomes.filter((o) => o.status === 'fail').length;
  const lastSuccess = [...outcomes].reverse().find((o) => o.status === 'ok');
  const lastFailure = [...outcomes].reverse().find((o) => o.status === 'fail');
  const latencies = outcomes.map((o) => o.latencyMs).sort((a, b) => a - b);
  const avg = latencies.length ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;

  return {
    url,
    name: entry.name,
    category: entry.category,
    lastStatus: last.status,
    lastLatencyMs: last.latencyMs,
    lastCheckedAt: new Date(last.at).toISOString(),
    lastSuccessAt: lastSuccess ? new Date(lastSuccess.at).toISOString() : null,
    lastError: lastFailure?.error ?? null,
    lastHttpStatus: last.httpStatus ?? null,
    attempts: outcomes.length,
    failures,
    successRate: outcomes.length ? (outcomes.length - failures) / outcomes.length : 0,
    avgLatencyMs: Math.round(avg),
    p99LatencyMs: percentile(latencies, 99),
    recent: outcomes.slice(-RING_SIZE),
  };
}

/** Every feed that has been fetched at least once on this instance. */
export function getFeedHealth(): FeedHealthRecord[] {
  const records: FeedHealthRecord[] = [];
  for (const [url, entry] of ring) {
    if (entry.outcomes.length === 0) continue;
    records.push(toRecord(url, entry));
  }
  // Failing sources first, then by name, so the endpoint reads top-down.
  return records.sort((a, b) => {
    if (a.lastStatus !== b.lastStatus) return a.lastStatus === 'fail' ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

export function getFeedHealthByUrl(url: string): FeedHealthRecord | null {
  const entry = ring.get(url);
  return entry && entry.outcomes.length ? toRecord(url, entry) : null;
}

export function summarizeFeedHealth(records: FeedHealthRecord[] = getFeedHealth()): FeedHealthSummary {
  const totalAttempts = records.reduce((n, r) => n + r.attempts, 0);
  const totalFailures = records.reduce((n, r) => n + r.failures, 0);
  const allLatencies = records
    .flatMap((r) => r.recent.map((o) => o.latencyMs))
    .sort((a, b) => a - b);
  const avg = allLatencies.length
    ? allLatencies.reduce((a, b) => a + b, 0) / allLatencies.length
    : 0;
  const failing = records.filter((r) => r.lastStatus === 'fail').length;

  return {
    totalSources: records.length,
    healthy: records.length - failing,
    failing,
    successRate: totalAttempts ? (totalAttempts - totalFailures) / totalAttempts : 0,
    avgLatencyMs: Math.round(avg),
    p99LatencyMs: percentile(allLatencies, 99),
    totalAttempts,
    totalFailures,
    generatedAt: new Date().toISOString(),
  };
}

/** Test hook: clear the ring. */
export function resetFeedHealth(): void {
  ring.clear();
}

// ---------------------------------------------------------------------------
// Persistence (best effort, only when Postgres is configured)
// ---------------------------------------------------------------------------

const PERSIST_INTERVAL_MS = 5 * 60 * 1000;
let lastPersistedAt = 0;

/**
 * Write one `provider_health` row summarising the RSS layer. Throttled to
 * once per five minutes per instance. Silently no-ops when DATABASE_URL is
 * unset or the table has not been migrated yet; the in-memory ring is the
 * source of truth either way.
 *
 * @returns true when a row was written.
 */
export async function persistFeedHealthSummary(force = false): Promise<boolean> {
  const now = Date.now();
  if (!force && now - lastPersistedAt < PERSIST_INTERVAL_MS) return false;

  const { getDb, providerHealth } = await import('@/lib/db');
  const db = getDb();
  if (!db) return false;

  const records = getFeedHealth();
  if (records.length === 0) return false;
  const summary = summarizeFeedHealth(records);
  const worst = records.find((r) => r.lastStatus === 'fail');
  const lastSuccess = records
    .map((r) => r.lastSuccessAt)
    .filter((v): v is string => !!v)
    .sort()
    .pop();

  try {
    await db.insert(providerHealth).values({
      provider: 'rss-sources',
      chain: 'news',
      circuitState: summary.successRate < 0.5 ? 'OPEN' : 'CLOSED',
      isHealthy: summary.successRate >= 0.5,
      avgLatencyMs: summary.avgLatencyMs,
      p99LatencyMs: summary.p99LatencyMs,
      successRate: summary.successRate,
      totalRequests: summary.totalAttempts,
      totalFailures: summary.totalFailures,
      lastError: worst ? `${worst.name}: ${worst.lastError ?? 'unknown error'}` : null,
      lastSuccessAt: lastSuccess ? new Date(lastSuccess) : null,
      lastFailureAt: worst ? new Date(worst.lastCheckedAt) : null,
    });
    lastPersistedAt = now;
    return true;
  } catch (error) {
    console.warn('[source-health] provider_health insert skipped:', error instanceof Error ? error.message : error);
    return false;
  }
}
