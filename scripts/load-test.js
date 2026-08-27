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
 * Load Testing Script for Free Crypto News
 * 
 * Usage:
 *   npm install -g k6
 *   k6 run scripts/load-test.js
 * 
 * Or with Docker:
 *   docker run -i grafana/k6 run - < scripts/load-test.js
 */

import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend, Counter } from 'k6/metrics';

// =============================================================================
// CONFIGURATION
// =============================================================================

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

// Custom metrics
const errorRate = new Rate('errors');
const newsTrend = new Trend('news_duration');
const marketTrend = new Trend('market_duration');
const healthTrend = new Trend('health_duration');
const cacheHits = new Counter('cache_hits');

// Test scenarios
export const options = {
  scenarios: {
    // Smoke test - basic functionality
    smoke: {
      executor: 'constant-vus',
      vus: 1,
      duration: '30s',
      startTime: '0s',
      tags: { scenario: 'smoke' },
    },
    // Load test - normal traffic
    load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '1m', target: 50 },   // Ramp up
        { duration: '3m', target: 50 },   // Sustain
        { duration: '1m', target: 0 },    // Ramp down
      ],
      startTime: '30s',
      tags: { scenario: 'load' },
    },
    // Stress test - high traffic
    stress: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 100 },  // Ramp up
        { duration: '5m', target: 100 },  // Sustain
        { duration: '2m', target: 200 },  // Push higher
        { duration: '5m', target: 200 },  // Sustain
        { duration: '2m', target: 0 },    // Ramp down
      ],
      startTime: '6m',
      tags: { scenario: 'stress' },
    },
    // Spike test - sudden traffic burst
    spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 200 }, // Spike
        { duration: '1m', target: 200 },  // Sustain
        { duration: '10s', target: 0 },   // Drop
      ],
      startTime: '22m',
      tags: { scenario: 'spike' },
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% under 500ms
    http_req_failed: ['rate<0.01'],                  // Less than 1% failures
    errors: ['rate<0.01'],                           // Custom error rate
  },
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function checkResponse(response, expectedStatus = 200) {
  const passed = check(response, {
    [`status is ${expectedStatus}`]: (r) => r.status === expectedStatus,
    'response time < 500ms': (r) => r.timings.duration < 500,
    'has content': (r) => r.body.length > 0,
  });
  
  if (!passed) {
    errorRate.add(1);
  }
  
  // Check for cache headers
  if (response.headers['X-Cache'] === 'HIT') {
    cacheHits.add(1);
  }
  
  return passed;
}

function getAuthHeaders() {
  const apiKey = __ENV.API_KEY;
  if (apiKey) {
    return { 'X-API-Key': apiKey };
  }
  return {};
}

// =============================================================================
// TEST FUNCTIONS
// =============================================================================

export default function() {
  const headers = {
    'Accept': 'application/json',
    'User-Agent': 'K6-LoadTest/1.0',
    ...getAuthHeaders(),
  };

  // Mix of different endpoints to simulate real usage
  group('News API', () => {
    const start = Date.now();
    const response = http.get(`${BASE_URL}/api/news`, { headers });
    newsTrend.add(Date.now() - start);
    
    checkResponse(response);
    
    if (response.status === 200) {
      const data = JSON.parse(response.body);
      check(data, {
        'has articles': (d) => d.articles && d.articles.length > 0,
      });
    }
  });

  sleep(1);

  group('Market Data', () => {
    const coins = ['bitcoin', 'ethereum', 'solana'];
    const coin = coins[Math.floor(Math.random() * coins.length)];
    
    const start = Date.now();
    const response = http.get(`${BASE_URL}/api/v2/coins/${coin}`, { headers });
    marketTrend.add(Date.now() - start);
    
    checkResponse(response);
  });

  sleep(0.5);

  group('Health Check', () => {
    const start = Date.now();
    const response = http.get(`${BASE_URL}/api/health`, { headers });
    healthTrend.add(Date.now() - start);
    
    check(response, {
      'status is 200': (r) => r.status === 200,
      'system is healthy': (r) => {
        try {
          const data = JSON.parse(r.body);
          return data.status === 'healthy' || data.status === 'degraded';
        } catch {
          return false;
        }
      },
    });
  });

  sleep(0.5);

  // Randomly hit other endpoints
  if (Math.random() < 0.3) {
    group('Trending', () => {
      http.get(`${BASE_URL}/api/v2/trending`, { headers });
    });
    sleep(0.5);
  }

  if (Math.random() < 0.2) {
    group('AI Analysis', () => {
      http.get(`${BASE_URL}/api/ai/sentiment?q=bitcoin`, { headers });
    });
    sleep(1);
  }
}

// =============================================================================
// LIFECYCLE HOOKS
// =============================================================================

export function setup() {
  // Verify the API is accessible
  const response = http.get(`${BASE_URL}/api/health`);
  
  if (response.status !== 200) {
    throw new Error(`API not accessible: ${response.status}`);
  }
  
  console.log(`Testing against: ${BASE_URL}`);
  console.log('API Status:', JSON.parse(response.body).status);
  
  return { startTime: Date.now() };
}

export function teardown(data) {
  const duration = (Date.now() - data.startTime) / 1000;
  console.log(`Test completed in ${duration.toFixed(2)}s`);
}

export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: '  ', enableColors: true }),
    'summary.json': JSON.stringify(data, null, 2),
  };
}

function textSummary(data, options) {
  const { metrics } = data;
  
  const lines = [
    '',
    '='.repeat(60),
    'FREE CRYPTO NEWS - LOAD TEST SUMMARY',
    '='.repeat(60),
    '',
    `Total Requests: ${metrics.http_reqs?.values?.count || 0}`,
    `Failed Requests: ${metrics.http_req_failed?.values?.rate * 100 || 0}%`,
    '',
    'Response Times (ms):',
    `  p50: ${metrics.http_req_duration?.values?.['p(50)']?.toFixed(2) || 'N/A'}`,
    `  p95: ${metrics.http_req_duration?.values?.['p(95)']?.toFixed(2) || 'N/A'}`,
    `  p99: ${metrics.http_req_duration?.values?.['p(99)']?.toFixed(2) || 'N/A'}`,
    '',
    'Endpoint Trends (ms):',
    `  News:   ${metrics.news_duration?.values?.avg?.toFixed(2) || 'N/A'}`,
    `  Market: ${metrics.market_duration?.values?.avg?.toFixed(2) || 'N/A'}`,
    `  Health: ${metrics.health_duration?.values?.avg?.toFixed(2) || 'N/A'}`,
    '',
    `Cache Hits: ${metrics.cache_hits?.values?.count || 0}`,
    `Error Rate: ${(metrics.errors?.values?.rate || 0) * 100}%`,
    '',
    '='.repeat(60),
    '',
  ];
  
  return lines.join('\n');
}
