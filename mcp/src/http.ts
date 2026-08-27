#!/usr/bin/env node
/**
 * Free Crypto News MCP server, Streamable HTTP transport.
 *
 *   PORT=3333 npm run start:http
 *   POST http://localhost:3333/mcp      JSON-RPC over Streamable HTTP
 *   GET  http://localhost:3333/healthz  liveness probe
 *
 * Stateless: every request gets a fresh server + transport pair, so the
 * process holds no session state and scales horizontally behind any proxy.
 */

import http from 'node:http';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { configFromEnv, SERVER_NAME, SERVER_VERSION } from './api.js';
import { createServer } from './server.js';
import { TOOLS } from './tools.js';

const config = configFromEnv();
const PORT = Number.parseInt(process.env.PORT ?? '3333', 10);
const HOST = process.env.HOST ?? '0.0.0.0';
const MCP_PATH = '/mcp';

const CORS_HEADERS: Record<string, string> = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'Content-Type, Accept, Authorization, Mcp-Session-Id, Mcp-Protocol-Version, Last-Event-ID',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, Mcp-Protocol-Version',
};

function readJsonBody(req: http.IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on('error', reject);
  });
}

function sendJson(res: http.ServerResponse, status: number, payload: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(payload));
}

const httpServer = http.createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://${req.headers.host ?? 'localhost'}`);
  for (const [key, value] of Object.entries(CORS_HEADERS)) res.setHeader(key, value);

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  if (url.pathname === '/healthz' || url.pathname === '/health') {
    sendJson(res, 200, {
      status: 'ok',
      server: SERVER_NAME,
      version: SERVER_VERSION,
      tools: TOOLS.length,
      endpoint: MCP_PATH,
      apiBase: config.baseUrl,
    });
    return;
  }
  if (url.pathname === '/') {
    sendJson(res, 200, {
      name: SERVER_NAME,
      version: SERVER_VERSION,
      transport: 'streamable-http',
      endpoint: MCP_PATH,
      health: '/healthz',
      docs: 'https://github.com/nirholas/cryptocurrency.cv/tree/main/mcp',
    });
    return;
  }
  if (url.pathname !== MCP_PATH) {
    sendJson(res, 404, { error: `Not found. The MCP endpoint is ${MCP_PATH}; health is /healthz.` });
    return;
  }

  const server = createServer(config);
  const transport = new StreamableHTTPServerTransport({ sessionIdGenerator: undefined, enableJsonResponse: true });
  res.on('close', () => {
    void transport.close();
    void server.close();
  });
  try {
    const body = req.method === 'POST' ? await readJsonBody(req) : undefined;
    await server.connect(transport);
    await transport.handleRequest(req, res, body);
  } catch (error) {
    if (!res.headersSent) {
      sendJson(res, 500, {
        jsonrpc: '2.0',
        error: { code: -32603, message: error instanceof Error ? error.message : 'Internal error' },
        id: null,
      });
    }
  }
});

httpServer.listen(PORT, HOST, () => {
  console.log(`free-crypto-news MCP (Streamable HTTP) listening on http://${HOST}:${PORT}${MCP_PATH}`);
  console.log(`${TOOLS.length} tools proxying ${config.baseUrl}; health at /healthz`);
});

for (const signal of ['SIGINT', 'SIGTERM'] as const) {
  process.on(signal, () => {
    httpServer.close(() => process.exit(0));
  });
}
