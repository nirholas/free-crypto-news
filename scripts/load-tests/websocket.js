/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import { check, sleep } from 'k6';
import ws from 'k6/ws';
import { Rate, Trend, Counter, Gauge } from 'k6/metrics';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const WS_URL = __ENV.WS_URL || BASE_URL.replace(/^http/, 'ws');

// Custom metrics
const wsConnectionTime = new Trend('ws_connection_time', true);
const wsTimeToFirstMessage = new Trend('ws_time_to_first_message', true);
const wsMessageRate = new Counter('ws_messages_received');
const wsDroppedConnections = new Counter('ws_dropped_connections');
const wsActiveConnections = new Gauge('ws_active_connections');
const wsConnectionErrors = new Rate('ws_connection_errors');
const wsMessageLatency = new Trend('ws_message_latency', true);

const CHANNELS = ['bitcoin', 'ethereum', 'defi', 'solana', 'altcoins', 'market', 'news'];

export const options = {
  scenarios: {
    ws_load: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 500 },
        { duration: '3m', target: 2000 },
        { duration: '5m', target: 5000 },
        { duration: '3m', target: 2000 },
        { duration: '2m', target: 0 },
      ],
      gracefulRampDown: '30s',
      exec: 'wsLoadTest',
    },
  },
  thresholds: {
    ws_connection_time: ['p(95)<2000', 'p(99)<5000'],
    ws_time_to_first_message: ['p(95)<5000', 'p(99)<10000'],
    ws_connection_errors: ['rate<0.05'],
    ws_message_latency: ['p(95)<1000'],
  },
};

function getRandomChannels(count) {
  const shuffled = CHANNELS.slice().sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

export function wsLoadTest() {
  const wsUrl = `${WS_URL}/ws`;
  const channels = getRandomChannels(Math.floor(Math.random() * 3) + 1); // 1-3 channels
  let firstMessageReceived = false;
  let messagesReceived = 0;
  const connectionStart = Date.now();

  const res = ws.connect(wsUrl, {}, function (socket) {
    socket.on('open', function () {
      const connectionTime = Date.now() - connectionStart;
      wsConnectionTime.add(connectionTime);
      wsActiveConnections.add(1);

      // Subscribe to random channels
      for (const channel of channels) {
        socket.send(JSON.stringify({
          type: 'subscribe',
          channel: channel,
        }));
      }
    });

    socket.on('message', function (msg) {
      messagesReceived++;
      wsMessageRate.add(1);

      if (!firstMessageReceived) {
        firstMessageReceived = true;
        wsTimeToFirstMessage.add(Date.now() - connectionStart);
      }

      // Try to measure message latency from server timestamp
      try {
        const data = JSON.parse(msg);
        if (data.timestamp) {
          const serverTime = new Date(data.timestamp).getTime();
          const latency = Date.now() - serverTime;
          if (latency >= 0 && latency < 30000) { // sanity check
            wsMessageLatency.add(latency);
          }
        }
      } catch (_e) {
        // Not all messages are JSON with timestamps
      }
    });

    socket.on('close', function () {
      wsActiveConnections.add(-1);
      if (!firstMessageReceived) {
        wsDroppedConnections.add(1);
      }
    });

    socket.on('error', function () {
      wsConnectionErrors.add(1);
      wsDroppedConnections.add(1);
    });

    // Keep connection alive for 30-90 seconds
    const connectionDuration = Math.random() * 60000 + 30000;

    // Periodically send ping to keep alive
    socket.setInterval(function () {
      socket.send(JSON.stringify({ type: 'ping' }));
    }, 15000);

    // Occasionally unsubscribe and resubscribe to different channels
    socket.setTimeout(function () {
      // Unsubscribe from one channel
      if (channels.length > 1) {
        const unsubChannel = channels[Math.floor(Math.random() * channels.length)];
        socket.send(JSON.stringify({
          type: 'unsubscribe',
          channel: unsubChannel,
        }));
      }

      // Subscribe to a new one
      const newChannel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];
      socket.send(JSON.stringify({
        type: 'subscribe',
        channel: newChannel,
      }));
    }, connectionDuration / 2);

    // Close after connection duration
    socket.setTimeout(function () {
      socket.close();
    }, connectionDuration);
  });

  const connected = check(res, {
    'WS connection established': (r) => r && r.status === 101,
  });

  if (!connected) {
    wsConnectionErrors.add(1);
    wsDroppedConnections.add(1);
  }

  sleep(Math.random() * 2 + 1); // brief pause before next connection attempt
}

export function handleSummary(data) {
  const summary = {
    timestamp: new Date().toISOString(),
    scenario: 'websocket-load',
    metrics: {
      ws_connection_time_p95: data.metrics.ws_connection_time?.values?.['p(95)'],
      ws_connection_time_p99: data.metrics.ws_connection_time?.values?.['p(99)'],
      ws_time_to_first_message_p95: data.metrics.ws_time_to_first_message?.values?.['p(95)'],
      ws_time_to_first_message_p99: data.metrics.ws_time_to_first_message?.values?.['p(99)'],
      ws_message_latency_p95: data.metrics.ws_message_latency?.values?.['p(95)'],
      ws_messages_received: data.metrics.ws_messages_received?.values?.count,
      ws_message_rate: data.metrics.ws_messages_received?.values?.rate,
      ws_dropped_connections: data.metrics.ws_dropped_connections?.values?.count,
      ws_connection_errors_rate: data.metrics.ws_connection_errors?.values?.rate,
      peak_active_connections: data.metrics.ws_active_connections?.values?.value,
    },
  };

  return {
    stdout: JSON.stringify(summary, null, 2) + '\n',
  };
}
