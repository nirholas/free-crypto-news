/**
 * Fever API mapping tests.
 *
 * The ids these functions produce are a wire contract: a client stores them and
 * sends them back as since_id/max_id, so an id that changes between requests
 * silently re-downloads the whole feed, and ids that do not sort by time break
 * pagination outright.
 */

import { describe, it, expect } from 'vitest';
import {
  FEVER_API_VERSION,
  buildFeedIds,
  groupId,
  itemHtml,
  itemId,
  siteUrlOf,
  stableHash,
  toFeverItem,
} from '../index';
import type { NewsArticle } from '@/lib/crypto-news';

function article(overrides: Partial<NewsArticle> = {}): NewsArticle {
  return {
    title: 'Bitcoin Surges Past $100K',
    link: 'https://example.com/btc-100k',
    description: 'Bitcoin has reached a new all-time high.',
    pubDate: '2026-08-27T12:00:00.000Z',
    source: 'CoinDesk',
    sourceKey: 'coindesk',
    category: 'bitcoin',
    timeAgo: '2h ago',
    ...overrides,
  };
}

describe('stableHash', () => {
  it('is deterministic', () => {
    expect(stableHash('coindesk')).toBe(stableHash('coindesk'));
  });

  it('separates different inputs', () => {
    expect(stableHash('coindesk')).not.toBe(stableHash('theblock'));
  });

  it('stays a non-negative 32-bit integer', () => {
    for (const value of ['', 'a', 'coindesk', 'https://example.com/a-very-long-article-url']) {
      const hash = stableHash(value);
      expect(Number.isInteger(hash)).toBe(true);
      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThan(2 ** 32);
    }
  });
});

describe('itemId', () => {
  it('sorts chronologically so since_id pagination works', () => {
    const older = itemId(article({ pubDate: '2026-08-27T11:00:00.000Z' }));
    const newer = itemId(article({ pubDate: '2026-08-27T12:00:00.000Z' }));
    expect(newer).toBeGreaterThan(older);
  });

  it('is stable for the same article', () => {
    expect(itemId(article())).toBe(itemId(article()));
  });

  it('separates articles published in the same millisecond', () => {
    const a = itemId(article({ link: 'https://example.com/a' }));
    const b = itemId(article({ link: 'https://example.com/b' }));
    expect(a).not.toBe(b);
  });

  it('survives an unparseable date instead of producing NaN', () => {
    expect(Number.isFinite(itemId(article({ pubDate: 'not a date' })))).toBe(true);
  });
});

describe('buildFeedIds', () => {
  it('assigns a stable positive id per source key', () => {
    const first = buildFeedIds(['coindesk', 'theblock', 'decrypt']);
    const second = buildFeedIds(['decrypt', 'coindesk', 'theblock']);
    expect(first.get('coindesk')).toBe(second.get('coindesk'));
    for (const id of first.values()) {
      expect(id).toBeGreaterThan(0);
      expect(id).toBeLessThanOrEqual(2_000_000_000);
    }
  });

  it('never hands two sources the same id', () => {
    const keys = Array.from({ length: 500 }, (_, i) => `source-${i}`);
    const ids = buildFeedIds(keys);
    expect(ids.size).toBe(keys.length);
    expect(new Set(ids.values()).size).toBe(keys.length);
  });
});

describe('groupId', () => {
  it('is stable and positive per category', () => {
    expect(groupId('bitcoin')).toBe(groupId('bitcoin'));
    expect(groupId('bitcoin')).toBeGreaterThan(0);
    expect(groupId('bitcoin')).not.toBe(groupId('defi'));
  });
});

describe('itemHtml', () => {
  it('escapes markup coming from third-party feeds', () => {
    const html = itemHtml(
      article({ description: '<script>alert(1)</script>', link: 'https://example.com/a' }),
    );
    expect(html).not.toContain('<script>');
    expect(html).toContain('&lt;script&gt;');
  });

  it('includes the image only when it is an http(s) URL', () => {
    expect(itemHtml(article({ imageUrl: 'https://example.com/i.jpg' }))).toContain('<img');
    expect(itemHtml(article({ imageUrl: 'javascript:alert(1)' }))).not.toContain('<img');
  });

  it('always links back to the source article', () => {
    expect(itemHtml(article())).toContain('https://example.com/btc-100k');
  });
});

describe('toFeverItem', () => {
  const feedIds = buildFeedIds(['coindesk']);

  it('produces every field a Fever client reads', () => {
    const item = toFeverItem(article(), feedIds);
    expect(item).toMatchObject({
      feed_id: feedIds.get('coindesk'),
      title: 'Bitcoin Surges Past $100K',
      url: 'https://example.com/btc-100k',
      is_read: 0,
      is_saved: 0,
    });
    expect(item.created_on_time).toBe(Math.floor(Date.parse('2026-08-27T12:00:00.000Z') / 1000));
  });

  it('falls back to the source name when an article has no byline', () => {
    expect(toFeverItem(article({ author: undefined }), feedIds).author).toBe('CoinDesk');
  });

  it('reports feed_id 0 for a source missing from the map rather than NaN', () => {
    expect(toFeverItem(article({ sourceKey: 'unknown' }), feedIds).feed_id).toBe(0);
  });
});

describe('siteUrlOf', () => {
  it('reduces a feed URL to its origin', () => {
    expect(siteUrlOf('https://www.coindesk.com/arc/outboundfeeds/rss/')).toBe(
      'https://www.coindesk.com',
    );
  });

  it('returns the input unchanged when it is not a URL', () => {
    expect(siteUrlOf('not-a-url')).toBe('not-a-url');
  });
});

describe('protocol constants', () => {
  it('advertises Fever API version 3', () => {
    expect(FEVER_API_VERSION).toBe(3);
  });
});
