/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 */

/**
 * Tests for the bot-detection middleware handler
 */

import { describe, it, expect } from 'vitest';
import { NextResponse, NextRequest } from 'next/server';
import { botDetection, isBlockedBot, isApiClient } from '@/middleware/bot-detection';
import type { MiddlewareContext } from '@/middleware/types';

function createContext(overrides: Partial<MiddlewareContext> = {}): MiddlewareContext {
  const url = new URL('http://localhost:3000/api/test');
  return {
    request: new NextRequest(url),
    requestId: 'req_test_123',
    startTime: Date.now(),
    pathname: '/api/test',
    isApiRoute: true,
    isEmbedRoute: false,
    isSperaxOS: false,
    speraxosKeyId: null,
    isTrustedOrigin: false,
    isApiClient: false,
    clientIp: '127.0.0.1',
    apiKeyTier: null,
    apiKeyId: null,
    headers: { 'X-Request-ID': 'req_test_123' },
    ...overrides,
  };
}

function createContextWithUA(
  ua: string,
  overrides: Partial<MiddlewareContext> = {},
): MiddlewareContext {
  const url = new URL('http://localhost:3000' + (overrides.pathname || '/api/test'));
  const request = new NextRequest(url, {
    headers: new Headers({ 'user-agent': ua }),
  });
  return createContext({ ...overrides, request, pathname: overrides.pathname || '/api/test' });
}

// =============================================================================
// Utility function tests
// =============================================================================

describe('isBlockedBot', () => {
  it('should block attack tooling and named scrapers', () => {
    expect(isBlockedBot('sqlmap/1.7')).toBe(true);
    expect(isBlockedBot('Mozilla/5.0 (compatible; Nikto/2.1.6)')).toBe(true);
    expect(isBlockedBot('my-scraper/1.0')).toBe(true);
    expect(isBlockedBot('Scrapy/2.11 (+https://scrapy.org)')).toBe(true);
    expect(isBlockedBot('Mozilla/5.0 (compatible; AhrefsBot/7.0)')).toBe(true);
  });

  it('should allow cURL and wget (the advertised way to use the API)', () => {
    expect(isBlockedBot('curl/7.68.0')).toBe(false);
    expect(isBlockedBot('curl/8.5.0')).toBe(false);
    expect(isBlockedBot('Wget/1.21.4')).toBe(false);
  });

  it('should allow AI agents invited by ai.txt and robots.txt', () => {
    expect(isBlockedBot('Mozilla/5.0 AppleWebKit/537.36 (compatible; GPTBot/1.2)')).toBe(false);
    expect(isBlockedBot('Mozilla/5.0 (compatible; ClaudeBot/1.0)')).toBe(false);
    expect(isBlockedBot('Claude-User/1.0')).toBe(false);
    expect(isBlockedBot('Mozilla/5.0 (compatible; PerplexityBot/1.0)')).toBe(false);
    expect(isBlockedBot('SomeBot/1.0')).toBe(false);
    expect(isBlockedBot('my-crawler/2.0')).toBe(false);
  });

  it('should never let the allowlist be shadowed by the blocklist', () => {
    expect(isBlockedBot('Mozilla/5.0 (compatible; Googlebot/2.1; scraper-test)')).toBe(false);
  });

  it('should allow legitimate HTTP clients handled by rate limiting', () => {
    // python-requests, aiohttp, go-http are no longer blocked;
    // abuse from these callers is handled by rate limiting instead.
    expect(isBlockedBot('python-requests/2.28.0')).toBe(false);
    expect(isBlockedBot('aiohttp/3.8.0')).toBe(false);
    expect(isBlockedBot('Go-http-client/1.1')).toBe(false);
  });

  it('should allow search engine bots', () => {
    expect(isBlockedBot('Googlebot/2.1')).toBe(false);
    expect(isBlockedBot('Bingbot/2.0')).toBe(false);
    expect(isBlockedBot('DuckDuckBot/1.0')).toBe(false);
  });

  it('should allow regular browsers', () => {
    expect(isBlockedBot('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36')).toBe(
      false,
    );
  });

  it('should allow x402 clients', () => {
    expect(isBlockedBot('x402-client/1.0')).toBe(false);
  });

  it('should allow internal bots', () => {
    expect(isBlockedBot('fcn-telegram/1.0')).toBe(false);
    expect(isBlockedBot('fcn-discord/1.0')).toBe(false);
  });
});

describe('isApiClient', () => {
  it('should detect x-api-key header', () => {
    const url = new URL('http://localhost:3000/api/test');
    const request = new NextRequest(url, {
      headers: new Headers({ 'x-api-key': 'cda_test_key' }),
    });
    expect(isApiClient(request)).toBe(true);
  });

  it('should detect JSON-accepting clients', () => {
    const url = new URL('http://localhost:3000/api/test');
    const request = new NextRequest(url, {
      headers: new Headers({ accept: 'application/json' }),
    });
    expect(isApiClient(request)).toBe(true);
  });

  it('should treat cURL and wget as API clients', () => {
    for (const ua of ['curl/8.5.0', 'Wget/1.21.4']) {
      const url = new URL('http://localhost:3000/api/test');
      const request = new NextRequest(url, { headers: new Headers({ 'user-agent': ua }) });
      expect(isApiClient(request)).toBe(true);
    }
  });

  it('should not flag browser visitors', () => {
    const url = new URL('http://localhost:3000/api/test');
    const request = new NextRequest(url, {
      headers: new Headers({ accept: 'text/html, application/json' }),
    });
    expect(isApiClient(request)).toBe(false);
  });
});

// =============================================================================
// Handler tests
// =============================================================================

describe('botDetection handler', () => {
  it('should return plain 403 for bots on page routes', () => {
    const ctx = createContextWithUA('my-scraper/1.0', {
      isApiRoute: false,
      pathname: '/about',
    });
    const result = botDetection(ctx);

    expect(result).toBeInstanceOf(NextResponse);
    expect((result as NextResponse).status).toBe(403);
  });

  it('should return JSON 403 for bots on API routes', async () => {
    const ctx = createContextWithUA('my-scraper/1.0');
    const result = await botDetection(ctx);

    expect(result).toBeInstanceOf(NextResponse);
    const resp = result as NextResponse;
    expect(resp.status).toBe(403);
    const body = await resp.json();
    expect(body.code).toBe('BOT_BLOCKED');
  });


  it('should pass through regular browsers', () => {
    const ctx = createContextWithUA('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');
    const result = botDetection(ctx);

    expect(result).not.toBeInstanceOf(NextResponse);
  });

  it('should pass through search engine bots', () => {
    const ctx = createContextWithUA('Googlebot/2.1', { isApiRoute: false, pathname: '/' });
    const result = botDetection(ctx);

    expect(result).not.toBeInstanceOf(NextResponse);
  });
});
