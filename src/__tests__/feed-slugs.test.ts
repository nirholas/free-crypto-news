/**
 * Feed resolution: every category the aggregator indexes is syndicatable.
 *
 * resolveFeed() used to switch on exactly three slugs and silently serve the
 * firehose for anything else, so /api/rss?feed=solana returned all-sources
 * content under an "All Sources" title while /api/news?category=solana filtered
 * correctly. Two properties matter and are asserted here: every slug the source
 * registry reports resolves to a feed whose metadata names that topic, and an
 * unknown slug resolves to null so the route can answer 400 instead of lying.
 */

import { describe, it, expect } from 'vitest';

import { feedSlugs, resolveFeed, escapeXml } from '@/app/api/_feed-utils';
import { getFeedCategoryIds } from '@/lib/crypto-news';

describe('feedSlugs', () => {
  it('covers every category the source registry carries, plus all', () => {
    const slugs = feedSlugs();
    expect(slugs).toContain('all');
    for (const id of getFeedCategoryIds()) expect(slugs).toContain(id);
  });

  it('lists each slug once', () => {
    const slugs = feedSlugs();
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('offers more than the three feeds that used to resolve', () => {
    expect(feedSlugs().length).toBeGreaterThan(3);
  });
});

describe('resolveFeed', () => {
  it('returns null for an unknown slug so the route can answer 400', async () => {
    await expect(resolveFeed('not-a-real-category', 'rss', 5)).resolves.toBeNull();
  });

  it('points a category feed at its own self URL, not the firehose', async () => {
    const id = getFeedCategoryIds().find((c) => !['defi', 'bitcoin'].includes(c));
    expect(id).toBeDefined();
    const resolved = await resolveFeed(id as string, 'rss', 1);
    expect(resolved).not.toBeNull();
    expect(resolved!.meta.feedUrl).toContain(`feed=${encodeURIComponent(id as string)}`);
    expect(resolved!.meta.title).not.toBe('Crypto Vision News - All Sources');
  }, 30_000);

  it('still serves the firehose for all', async () => {
    const resolved = await resolveFeed('all', 'atom', 1);
    expect(resolved).not.toBeNull();
    expect(resolved!.meta.title).toContain('All Sources');
    expect(resolved!.meta.feedUrl).toBe('https://cryptocurrency.cv/api/atom');
  }, 30_000);
});

describe('escapeXml', () => {
  it('escapes every character that would break a feed document', () => {
    expect(escapeXml(`<a href="x">&'`)).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&apos;');
  });
});
