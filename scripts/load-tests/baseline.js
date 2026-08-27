/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Custom metrics
const errorRate = new Rate('error_rate');
const apiLatency = new Trend('api_latency', true);
const cacheHits = new Counter('cache_hits');

export const options = {
  scenarios: {
    newsReader: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },
        { duration: '4m', target: 500 },
        { duration: '4m', target: 1000 },
        { duration: '4m', target: 500 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'newsReaderScenario',
    },
    priceChecker: {
      executor: 'constant-arrival-rate',
      rate: 200,
      timeUnit: '1s',
      duration: '16m',
      preAllocatedVUs: 100,
      maxVUs: 500,
      exec: 'priceCheckerScenario',
    },
    apiUser: {
      executor: 'ramping-arrival-rate',
      startRate: 10,
      timeUnit: '1s',
      preAllocatedVUs: 50,
      maxVUs: 300,
      stages: [
        { duration: '4m', target: 50 },
        { duration: '4m', target: 100 },
        { duration: '4m', target: 50 },
        { duration: '4m', target: 10 },
      ],
      exec: 'apiUserScenario',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<2000'],
    error_rate: ['rate<0.01'],
    api_latency: ['p(95)<500', 'p(99)<2000'],
    http_req_failed: ['rate<0.01'],
    cache_hits: ['count>1000'],
  },
};

const NEWS_ENDPOINTS = [
  '/api/news',
  '/api/news?category=bitcoin',
  '/api/news?category=ethereum',
  '/api/news?category=defi',
  '/api/news?limit=50',
];

const PRICE_ENDPOINTS = [
  '/api/prices/bitcoin',
  '/api/prices/ethereum',
  '/api/prices?ids=bitcoin,ethereum,solana',
  '/api/market/fear-greed',
];

const DEEP_ENDPOINTS = [
  '/api/defi/tvl',
  '/api/derivatives/funding-rates',
  '/api/onchain/gas',
  '/api/market/dominance',
  '/api/social/trending',
  '/api/search?q=bitcoin',
];

function trackResponse(res, endpointName) {
  const success = res.status === 200;
  errorRate.add(!success);
  apiLatency.add(res.timings.duration);

  const cacheHeader = res.headers['X-Cache'] || res.headers['x-cache'] || '';
  if (cacheHeader.toLowerCase() === 'hit') {
    cacheHits.add(1);
  }

  check(res, {
    [`${endpointName} status 200`]: (r) => r.status === 200,
    [`${endpointName} response time < 2s`]: (r) => r.timings.duration < 2000,
    [`${endpointName} has body`]: (r) => r.body && r.body.length > 0,
  });
}

export function newsReaderScenario() {
  const endpoint = NEWS_ENDPOINTS[Math.floor(Math.random() * NEWS_ENDPOINTS.length)];
  const res = http.get(`${BASE_URL}${endpoint}`, {
    tags: { name: 'newsReader' },
  });
  trackResponse(res, endpoint);
  sleep(Math.random() * 3 + 1); // 1-4s think time (realistic reading)
}

export function priceCheckerScenario() {
  const endpoint = PRICE_ENDPOINTS[Math.floor(Math.random() * PRICE_ENDPOINTS.length)];
  const res = http.get(`${BASE_URL}${endpoint}`, {
    tags: { name: 'priceChecker' },
  });
  trackResponse(res, endpoint);
}

export function apiUserScenario() {
  const endpoints = [...NEWS_ENDPOINTS, ...PRICE_ENDPOINTS, ...DEEP_ENDPOINTS];
  const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
  const res = http.get(`${BASE_URL}${endpoint}`, {
    headers: { 'X-API-Key': __ENV.API_KEY || '' },
    tags: { name: 'apiUser' },
  });

  const ok = res.status === 200 || res.status === 429;
  errorRate.add(res.status >= 500);
  apiLatency.add(res.timings.duration);

  const cacheHeader = res.headers['X-Cache'] || res.headers['x-cache'] || '';
  if (cacheHeader.toLowerCase() === 'hit') {
    cacheHits.add(1);
  }

  check(res, {
    [`${endpoint} api status ok`]: () => ok,
    [`${endpoint} rate limit returns retry-after`]: (r) =>
      r.status !== 429 || r.headers['Retry-After'] !== undefined,
  });

  sleep(0.5);
}

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    metrics: {
      http_req_duration_p95: data.metrics.http_req_duration?.values?.['p(95)'],
      http_req_duration_p99: data.metrics.http_req_duration?.values?.['p(99)'],
      http_req_failed: data.metrics.http_req_failed?.values?.rate,
      error_rate: data.metrics.error_rate?.values?.rate,
      api_latency_p95: data.metrics.api_latency?.values?.['p(95)'],
      api_latency_p99: data.metrics.api_latency?.values?.['p(99)'],
      cache_hits: data.metrics.cache_hits?.values?.count,
      total_requests: data.metrics.http_reqs?.values?.count,
      rps: data.metrics.http_reqs?.values?.rate,
    },
  };

  return {
    stdout: JSON.stringify(summary, null, 2) + '\n',
  };
}
