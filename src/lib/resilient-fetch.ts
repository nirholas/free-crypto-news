/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * Resilient Fetch — fetch wrapper with retries, timeouts, and circuit breaking
 *
 * Every external HTTP call in the app should go through `resilientFetch`
 * instead of bare `fetch`. This gives us:
 *
 *  1. **Automatic retries** with exponential back-off for transient errors
 *     (network failures, 429, 502, 503, 504).
 *  2. **Per-request timeout** so a single slow upstream can't stall the
 *     response pipeline.
 *  3. **Circuit breaker integration** — repeated failures trip the breaker
 *     and short-circuit subsequent calls to the same service.
 *  4. **Stale-on-error** — if every attempt fails and a `staleCache` /
 *     `staleCacheKey` is provided, the last-known-good value is returned
 *     instead of throwing.
 *
 * @example
 *   const data = await resilientFetch<PriceData>('https://api.coingecko.com/...', {
 *     service: 'coingecko',
 *     timeoutMs: 5000,
 *     retries: 2,
 *     staleCache: priceStaleCache,
 *     staleCacheKey: 'prices:btc',
 *   });
 */

import { CircuitBreaker } from './circuit-breaker';
import type MemoryCache from './cache';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ResilientFetchOptions extends Omit<RequestInit, 'signal'> {
  /** Logical service name — used for the circuit breaker singleton (e.g. "coingecko") */
  service?: string;
  /** Request timeout in ms (default 8 000) */
  timeoutMs?: number;
  /** Max retries on transient errors (default 2 → 3 total attempts) */
  retries?: number;
  /** Base delay in ms between retries; doubles each attempt (default 500) */
  retryBaseMs?: number;
  /** If provided along with `staleCacheKey`, stale data is served on total failure */
  staleCache?: MemoryCache;
  /** Cache key for stale-on-error lookup */
  staleCacheKey?: string;
  /** Optional circuit-breaker overrides */
  circuitBreakerOpts?: {
    failureThreshold?: number;
    cooldownMs?: number;
  };
}

export interface ResilientFetchResult<T> {
  data: T;
  /** True if the response was served from the stale cache */
  stale: boolean;
  /** HTTP status from upstream (0 if stale or network error) */
  status: number;
  /** Total elapsed time in ms */
  elapsedMs: number;
  /** Number of attempts made */
  attempts: number;
}

// ─── Retryable status codes ─────────────────────────────────────────────────

const RETRYABLE_STATUS = new Set([408, 429, 500, 502, 503, 504]);

/** Options for `resilientFetchResponse` — everything except stale-cache handling */
export type ResilientFetchResponseOptions = Omit<
  ResilientFetchOptions,
  'staleCache' | 'staleCacheKey'
>;

/**
 * Internal marker thrown inside the breaker when the final attempt still
 * returned a retryable (upstream-degraded) status. It lets the circuit breaker
 * count the failure while the caller still receives the raw Response.
 */
class RetryableStatusError extends Error {
  readonly response: Response;
  constructor(response: Response, url: string) {
    super(`HTTP ${response.status} from ${url}`);
    this.name = 'RetryableStatusError';
    this.response = response;
  }
}

interface RawFetchOutcome {
  response: Response;
  attempts: number;
}

// ─── Core: timeout + retry + circuit breaker, returns the raw Response ───────

async function fetchWithResilience(
  url: string,
  opts: ResilientFetchResponseOptions,
): Promise<RawFetchOutcome> {
  const {
    service,
    timeoutMs = 8_000,
    retries = 2,
    retryBaseMs = 500,
    circuitBreakerOpts,
    ...fetchInit
  } = opts;

  const maxAttempts = retries + 1;
  let lastError: unknown;
  let attempts = 0;

  const breaker = service
    ? CircuitBreaker.for(service, circuitBreakerOpts)
    : undefined;

  const doFetch = async (): Promise<RawFetchOutcome> => {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      attempts = attempt + 1;

      // Back-off between retries (skip on first attempt)
      if (attempt > 0) {
        const delay = retryBaseMs * Math.pow(2, attempt - 1);
        const jitter = Math.random() * delay * 0.3; // ± 30 % jitter
        await sleep(delay + jitter);
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);

      let res: Response;
      try {
        res = await fetch(url, {
          ...fetchInit,
          signal: controller.signal,
        });
      } catch (err) {
        clearTimeout(timer);
        lastError = err;
        // AbortError = timeout — retryable
        if ((err as Error).name === 'AbortError' && attempt < maxAttempts - 1) {
          continue;
        }
        // Network error — retryable
        if (isNetworkError(err) && attempt < maxAttempts - 1) {
          continue;
        }
        throw err;
      }
      clearTimeout(timer);

      if (!res.ok && RETRYABLE_STATUS.has(res.status)) {
        lastError = new RetryableStatusError(res, url);
        if (attempt < maxAttempts - 1) {
          continue; // retry
        }
        // Final attempt still degraded — count it against the breaker
        throw lastError;
      }

      // Success, or a non-retryable client error the caller must inspect
      return { response: res, attempts };
    }

    // All attempts exhausted
    throw lastError;
  };

  try {
    if (breaker) {
      return await breaker.call(doFetch);
    }
    return await doFetch();
  } catch (err) {
    if (err instanceof RetryableStatusError) {
      return { response: err.response, attempts };
    }
    throw err;
  }
}

// ─── Public: raw Response variant ───────────────────────────────────────────

/**
 * Like `resilientFetch`, but returns the raw `Response` so callers can read
 * `.text()`, headers, or non-JSON bodies. Shares the same timeout, retry and
 * circuit-breaker logic.
 *
 * Semantics match bare `fetch` as closely as possible so it is a drop-in
 * replacement: a non-OK response is RETURNED (after retries for 408/429/5xx),
 * never thrown, so existing `if (!res.ok)` handling keeps working. Timeouts
 * and network failures throw after the retries are exhausted, and an OPEN
 * circuit throws `CircuitOpenError` immediately.
 */
export async function resilientFetchResponse(
  url: string,
  opts: ResilientFetchResponseOptions = {},
): Promise<Response> {
  const { response } = await fetchWithResilience(url, opts);
  return response;
}

// ─── Public: JSON + stale-cache variant ─────────────────────────────────────

export async function resilientFetch<T = unknown>(
  url: string,
  opts: ResilientFetchOptions = {},
): Promise<ResilientFetchResult<T>> {
  const { staleCache, staleCacheKey, ...rest } = opts;
  const start = Date.now();
  let attempts = 0;

  try {
    const outcome = await fetchWithResilience(url, rest);
    attempts = outcome.attempts;
    const res = outcome.response;

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText} from ${url}`);
    }

    const data = (await res.json()) as T;

    // Persist good data into the stale cache so it's available later
    if (staleCache && staleCacheKey) {
      // Store with a very long TTL — this is the "last known good" value
      staleCache.set(staleCacheKey, data, 3600); // 1 hour stale window
    }

    return { data, stale: false, status: res.status, elapsedMs: Date.now() - start, attempts };
  } catch (err) {
    // ── Stale-on-error fallback ─────────────────────────────────────────
    if (staleCache && staleCacheKey) {
      const stale = staleCache.get<T>(staleCacheKey);
      if (stale !== null && stale !== undefined) {
        return {
          data: stale,
          stale: true,
          status: 0,
          elapsedMs: Date.now() - start,
          attempts,
        };
      }
    }

    // CircuitOpenError propagates untouched so callers can detect it
    throw err;
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isNetworkError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  const msg = err.message.toLowerCase();
  return (
    msg.includes('fetch failed') ||
    msg.includes('econnrefused') ||
    msg.includes('enotfound') ||
    msg.includes('econnreset') ||
    msg.includes('network') ||
    msg.includes('socket hang up') ||
    err.name === 'TypeError' // Node 18's fetch throws TypeError on network errors
  );
}
