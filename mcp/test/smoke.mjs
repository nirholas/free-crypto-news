#!/usr/bin/env node
/**
 * Smoke test for the stdio MCP server.
 *
 * Speaks real JSON-RPC over a spawned `dist/index.js` and asserts the
 * handshake, the tool/resource/prompt listings, and the registry's own
 * invariants. Runs offline by default; `--live` additionally calls one tool
 * against the production API.
 *
 * Usage: npm test        (offline)
 *        npm run test:live
 */

import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, '..');
const entry = path.join(root, 'dist/index.js');
const live = process.argv.includes('--live');

const { TOOLS, TOOL_GROUPS } = await import(path.join(root, 'dist/tools.js'));

let failures = 0;
function check(name, fn) {
  try {
    fn();
    console.log(`  ok   ${name}`);
  } catch (error) {
    failures += 1;
    console.error(`  FAIL ${name}\n       ${error.message}`);
  }
}

// ---------------------------------------------------------------------------
// Registry invariants (no process needed)
// ---------------------------------------------------------------------------

console.log('registry');

check('every tool has a unique name', () => {
  const names = TOOLS.map((tool) => tool.name);
  assert.equal(new Set(names).size, names.length);
});

check('every tool has a title, description, group and input schema', () => {
  for (const tool of TOOLS) {
    assert.ok(tool.title, `${tool.name} has no title`);
    assert.ok(tool.description.length > 20, `${tool.name} has a stub description`);
    assert.ok(TOOL_GROUPS.includes(tool.group), `${tool.name} has group ${tool.group}`);
    assert.equal(typeof tool.input, 'object', `${tool.name} has no input shape`);
    assert.equal(typeof tool.run, 'function', `${tool.name} has no run()`);
  }
});

check('every tool documents a real API route', () => {
  for (const tool of TOOLS) {
    assert.match(
      tool.endpoint,
      /^(GET|POST) \/api\//,
      `${tool.name} endpoint "${tool.endpoint}" is not an /api/ route`,
    );
  }
});

check('tool names are snake_case', () => {
  for (const tool of TOOLS) {
    assert.match(tool.name, /^[a-z][a-z0-9_]*$/, `${tool.name} is not snake_case`);
  }
});

// ---------------------------------------------------------------------------
// Protocol round-trip against the built server
// ---------------------------------------------------------------------------

console.log('protocol');

const child = spawn(process.execPath, [entry], { stdio: ['pipe', 'pipe', 'pipe'] });
const pending = new Map();
let buffer = '';

child.stdout.on('data', (chunk) => {
  buffer += chunk;
  let newline;
  while ((newline = buffer.indexOf('\n')) !== -1) {
    const line = buffer.slice(0, newline).trim();
    buffer = buffer.slice(newline + 1);
    if (!line) continue;
    const message = JSON.parse(line);
    const resolve = pending.get(message.id);
    if (resolve) {
      pending.delete(message.id);
      resolve(message);
    }
  }
});

child.stderr.resume();

let nextId = 0;
function call(method, params) {
  const id = ++nextId;
  const message = { jsonrpc: '2.0', id, method, ...(params ? { params } : {}) };
  const answered = new Promise((resolve, reject) => {
    pending.set(id, resolve);
    setTimeout(() => reject(new Error(`${method} timed out`)), 30_000).unref();
  });
  child.stdin.write(JSON.stringify(message) + '\n');
  return answered;
}

function notify(method) {
  child.stdin.write(JSON.stringify({ jsonrpc: '2.0', method }) + '\n');
}

try {
  const init = await call('initialize', {
    protocolVersion: '2025-06-18',
    capabilities: {},
    clientInfo: { name: 'smoke', version: '1.0.0' },
  });
  notify('notifications/initialized');

  check('initialize returns the server identity', () => {
    assert.equal(init.result.serverInfo.name, 'free-crypto-news');
    assert.ok(init.result.capabilities.tools, 'tools capability missing');
    assert.ok(init.result.capabilities.resources, 'resources capability missing');
    assert.ok(init.result.capabilities.prompts, 'prompts capability missing');
  });

  const tools = await call('tools/list');
  check('tools/list matches the registry', () => {
    assert.equal(tools.result.tools.length, TOOLS.length);
    for (const tool of tools.result.tools) {
      assert.ok(tool.inputSchema, `${tool.name} has no inputSchema`);
      assert.equal(tool.inputSchema.type, 'object');
    }
  });

  const resources = await call('resources/list');
  check('resources/list is non-empty', () => {
    assert.ok(resources.result.resources.length > 0);
  });

  const prompts = await call('prompts/list');
  check('prompts/list is non-empty', () => {
    assert.ok(prompts.result.prompts.length > 0);
  });

  const unknown = await call('tools/call', { name: 'no_such_tool', arguments: {} });
  check('an unknown tool is an error, not a crash', () => {
    assert.ok(unknown.error || unknown.result?.isError, 'expected an error result');
  });

  if (live) {
    const result = await call('tools/call', {
      name: 'get_latest_news',
      arguments: { limit: 3 },
    });
    check('get_latest_news returns content from the live API', () => {
      assert.ok(!result.error, `JSON-RPC error: ${JSON.stringify(result.error)}`);
      assert.ok(result.result.content?.[0]?.text, 'no text content returned');
    });
  }
} finally {
  child.kill();
  await once(child, 'exit').catch(() => {});
}

console.log(failures === 0 ? `\nall checks passed (${TOOLS.length} tools)` : `\n${failures} check(s) failed`);
process.exit(failures === 0 ? 0 : 1);
