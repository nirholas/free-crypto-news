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
import ws from 'k6/ws';
import { Rate, Trend, Counter } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const WS_URL = __ENV.WS_URL || BASE_URL.replace(/^http/, 'ws');

// Custom metrics
const errorRate = new Rate('error_rate');
const apiLatency = new Trend('api_latency', true);
const cacheHits = new Counter('cache_hits');
const wsConnections = new Counter('ws_connections');
const wsTimeToFirstMessage = new Trend('ws_time_to_first_message', true);
const wsDroppedConnections = new Counter('ws_dropped_connections');

export const options = {
  scenarios: {
    normal_traffic: {
      executor: 'constant-vus',
      vus: 50,
      duration: '20m',
      exec: 'normalTraffic',
    },
    breaking_news_spike: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 0 },      // quiet period
        { duration: '30s', target: 2000 },   // spike hits
        { duration: '3m', target: 2000 },    // sustained spike
        { duration: '1m', target: 500 },     // initial settle
        { duration: '5m', target: 100 },     // gradual settle
        { duration: '5m30s', target: 100 },  // steady state
      ],
      gracefulRampDown: '30s',
      exec: 'breakingNewsSpikeTraffic',
    },
    ws_reconnect_storm: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '5m', target: 0 },      // wait for spike
        { duration: '1m', target: 500 },     // WS reconnect storm
        { duration: '4m', target: 500 },     // sustained connections
        { duration: '2m', target: 100 },     // settle
        { duration: '8m', target: 50 },      // steady state
      ],
      exec: 'wsReconnectStorm',
    },
  },
  thresholds: {
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    error_rate: ['rate<0.05'],
    http_req_failed: ['rate<0.05'],
    ws_time_to_first_message: ['p(95)<5000'],
  },
};

const NEWS_ENDPOINTS = [
  '/api/news',
  '/api/news?category=bitcoin',
  '/api/news?category=ethereum',
  '/api/prices/bitcoin',
  '/api/market/fear-greed',
];

const BREAKING_NEWS_ENDPOINTS = [
  '/api/news',
  '/api/news?limit=50',
  '/api/news?category=bitcoin',
  '/api/news?category=bitcoin&limit=50',
  '/api/search?q=breaking',
  '/api/search?q=bitcoin',
  '/api/prices/bitcoin',
  '/api/prices/ethereum',
  '/api/market/fear-greed',
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
    [`${endpointName} status ok`]: (r) => r.status === 200 || r.status === 429,
    [`${endpointName} response time < 5s`]: (r) => r.timings.duration < 5000,
  });
}

export function normalTraffic() {
  const endpoint = NEWS_ENDPOINTS[Math.floor(Math.random() * NEWS_ENDPOINTS.length)];
  const res = http.get(`${BASE_URL}${endpoint}`, {
    tags: { name: 'normal_traffic' },
  });
  trackResponse(res, endpoint);
  sleep(Math.random() * 5 + 2); // 2-7s think time
}

export function breakingNewsSpikeTraffic() {
  // Simulate frantic users refreshing during breaking news
  const endpoint = BREAKING_NEWS_ENDPOINTS[Math.floor(Math.random() * BREAKING_NEWS_ENDPOINTS.length)];
  const res = http.get(`${BASE_URL}${endpoint}`, {
    tags: { name: 'breaking_news_spike' },
  });
  trackResponse(res, endpoint);
  sleep(Math.random() * 1 + 0.2); // 0.2-1.2s frantic refresh
}

export function wsReconnectStorm() {
  const wsUrl = `${WS_URL}/ws`;
  let firstMessageReceived = false;
  const startTime = Date.now();

  const res = ws.connect(wsUrl, {}, function (socket) {
    wsConnections.add(1);

    socket.on('open', function () {
      // Subscribe to bitcoin channel
      socket.send(JSON.stringify({
        type: 'subscribe',
        channel: 'bitcoin',
      }));
    });

    socket.on('message', function (msg) {
      if (!firstMessageReceived) {
        firstMessageReceived = true;
        wsTimeToFirstMessage.add(Date.now() - startTime);
      }
    });

    socket.on('close', function () {
      if (!firstMessageReceived) {
        wsDroppedConnections.add(1);
      }
    });

    socket.on('error', function () {
      wsDroppedConnections.add(1);
    });

    // Simulate reconnection cycle: connect, stay for 10-30s, disconnect
    socket.setTimeout(function () {
      socket.close();
    }, Math.random() * 20000 + 10000);
  });

  check(res, {
    'WS connection established': (r) => r && r.status === 101,
  });

  sleep(Math.random() * 2 + 1); // brief pause before reconnecting
}

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    scenario: 'breaking-news-spike',
    metrics: {
      http_req_duration_p95: data.metrics.http_req_duration?.values?.['p(95)'],
      http_req_duration_p99: data.metrics.http_req_duration?.values?.['p(99)'],
      http_req_failed: data.metrics.http_req_failed?.values?.rate,
      error_rate: data.metrics.error_rate?.values?.rate,
      ws_connections: data.metrics.ws_connections?.values?.count,
      ws_time_to_first_message_p95: data.metrics.ws_time_to_first_message?.values?.['p(95)'],
      ws_dropped_connections: data.metrics.ws_dropped_connections?.values?.count,
      total_requests: data.metrics.http_reqs?.values?.count,
      rps: data.metrics.http_reqs?.values?.rate,
    },
  };

  return {
    stdout: JSON.stringify(summary, null, 2) + '\n',
  };
}
