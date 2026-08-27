/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 */

import { describe, it, expect } from 'vitest';
import {
  MCP_TOOLS,
  buildToolRequest,
  executeTool,
  formatPaymentRequired,
  getTool,
  toolDescriptor,
  toolInputSchema,
} from '@/lib/mcp/tools';

function tool(name: string) {
  const found = getTool(name);
  if (!found) throw new Error(`tool ${name} missing from registry`);
  return found;
}

describe('MCP tool registry', () => {
  it('has unique snake_case names', () => {
    const names = MCP_TOOLS.map((t) => t.name);
    expect(new Set(names).size).toBe(names.length);
    for (const name of names) expect(name).toMatch(/^[a-z][a-z0-9_]+$/);
  });

  it('gives every tool a description and an object input schema', () => {
    for (const tool of MCP_TOOLS) {
      expect(tool.description.length).toBeGreaterThan(20);
      const schema = toolInputSchema(tool);
      expect(schema.type).toBe('object');
      expect(schema.properties).toBeTypeOf('object');
      for (const key of schema.required ?? []) expect(schema.properties[key]).toBeDefined();
      for (const key of tool.required ?? []) expect(tool.params[key]).toBeDefined();
    }
  });

  it('maps every tool onto an /api/ path', () => {
    for (const tool of MCP_TOOLS) expect(tool.path).toMatch(/^\/api\//);
  });

  it('flags x402 tools in their description', () => {
    for (const tool of MCP_TOOLS.filter((t) => t.x402)) expect(tool.description).toMatch(/x402/);
  });

  it('produces valid MCP descriptors with read-only annotations', () => {
    for (const tool of MCP_TOOLS) {
      const descriptor = toolDescriptor(tool);
      expect(descriptor.name).toBe(tool.name);
      expect(descriptor.inputSchema.type).toBe('object');
      expect(descriptor.annotations.readOnlyHint).toBe(true);
    }
  });

  it('looks tools up by name', () => {
    expect(getTool('get_crypto_news')?.path).toBe('/api/news');
    expect(getTool('does_not_exist')).toBeUndefined();
  });
});

describe('buildToolRequest', () => {
  it('applies defaults, renames and fixed query pairs', () => {
    const req = buildToolRequest(tool('search_crypto_news'), { keywords: 'ETF' });
    expect(req.method).toBe('GET');
    expect(req.url).toBe('https://cryptocurrency.cv/api/search?q=ETF&limit=10');

    const eth = buildToolRequest(tool('get_ethereum_news'), {}, 'https://example.test');
    expect(eth.url).toBe('https://example.test/api/news?category=ethereum&limit=10');

    const compare = buildToolRequest(tool('compare_coins'), { coins: 'bitcoin,ethereum' });
    expect(compare.url).toContain('/api/market/compare?ids=bitcoin%2Cethereum');
  });

  it('sends POST tools as a JSON body', () => {
    const req = buildToolRequest(tool('ask_crypto_question'), { question: 'why?' });
    expect(req.method).toBe('POST');
    expect(req.url).toBe('https://cryptocurrency.cv/api/ask');
    expect(JSON.parse(req.body ?? '{}')).toEqual({ question: 'why?' });
  });

  it('rejects a missing required argument', () => {
    expect(() => buildToolRequest(tool('compare_coins'), {})).toThrow(/coins/);
  });
});

describe('x402 handling', () => {
  const payload = {
    x402Version: 2,
    error: 'Payment Required',
    accepts: [{ scheme: 'exact', network: 'eip155:42161', amount: '1000', extra: { name: 'USD Coin', version: '2' } }],
    resource: { url: 'https://cryptocurrency.cv/api/gas', description: 'Ethereum gas prices' },
  };

  it('formats the 402 payload as one readable line', () => {
    const text = formatPaymentRequired(payload, 'https://cryptocurrency.cv/api/gas?x=1');
    expect(text).toMatch(/^Payment required: https:\/\/cryptocurrency\.cv\/api\/gas /);
    expect(text).toContain('$0.001 USD Coin on eip155:42161');
    expect(text).toContain('x402');
  });

  it('surfaces a 402 from the API as a tool error, with the correct headers sent', async () => {
    let seenHeaders: Record<string, string> = {};
    const fetchImpl = (async (_url: string | URL | Request, init?: RequestInit) => {
      seenHeaders = init?.headers as Record<string, string>;
      return new Response(JSON.stringify(payload), { status: 402, headers: { 'Content-Type': 'application/json' } });
    }) as typeof fetch;

    const result = await executeTool(tool('get_gas_prices'), {}, { userAgent: 'test-agent/1.0', fetchImpl });
    expect(result.isError).toBe(true);
    expect(result.content[0].text).toMatch(/^Payment required: /);
    expect(seenHeaders['User-Agent']).toBe('test-agent/1.0');
    expect(seenHeaders.Accept).toBe('application/json');
  });

  it('returns pretty JSON on success', async () => {
    const fetchImpl = (async () => Response.json({ bitcoin: { usd: 1 } })) as typeof fetch;
    const result = await executeTool(tool('get_crypto_prices'), {}, { userAgent: 'test-agent/1.0', fetchImpl });
    expect(result.isError).toBeUndefined();
    expect(JSON.parse(result.content[0].text)).toEqual({ bitcoin: { usd: 1 } });
  });
});
