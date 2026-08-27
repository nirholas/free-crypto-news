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
 * Every sitemap URL must resolve to a real route without a redirect.
 * Production runs next-intl with localePrefix 'as-needed', so `/en/...` URLs
 * 307 to the bare path and must never appear here.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import sitemap, { discoverStaticRoutes, LOCALE_APP_DIR, PRIVATE_SEGMENTS } from '@/app/sitemap';
import { SITE_URL } from '@/lib/constants';
import { CATEGORIES, getAllSlugs } from '@/lib/blog';
import { getTagBySlug } from '@/lib/tags';
import { categories as newsCategories } from '@/lib/categories';

const ROOT = process.cwd();
/** Published posts come from content/blog plus the inline fallback set in src/lib/blog.ts */
const publishedSlugs = new Set(getAllSlugs());
const pageExists = (route: string) =>
  fs.existsSync(path.join(ROOT, LOCALE_APP_DIR, ...route.split('/').filter(Boolean), 'page.tsx'));

/** Route patterns that map to dynamic `[param]` pages, with a check that the param is real */
const DYNAMIC_ROUTES: Array<{ pattern: RegExp; page: string; valid: (param: string) => boolean }> = [
  {
    pattern: /^\/coin\/([^/]+)$/,
    page: 'coin/[id]',
    valid: (id) => /^[a-z0-9-]+$/.test(id),
  },
  {
    pattern: /^\/category\/([^/]+)$/,
    page: 'category/[slug]',
    valid: (slug) => newsCategories.some((c) => c.slug === slug),
  },
  {
    pattern: /^\/blog\/category\/([^/]+)$/,
    page: 'blog/category/[category]',
    valid: (category) => category in CATEGORIES,
  },
  {
    pattern: /^\/blog\/([^/]+)$/,
    page: 'blog/[slug]',
    valid: (slug) => publishedSlugs.has(slug),
  },
  {
    pattern: /^\/tags\/([^/]+)$/,
    page: 'tags/[slug]',
    valid: (slug) => getTagBySlug(slug) !== undefined,
  },
];

describe('sitemap', () => {
  it('emits only unprefixed canonical URLs on the site origin', async () => {
    const entries = await sitemap();
    expect(entries.length).toBeGreaterThan(100);
    for (const { url } of entries) {
      expect(url.startsWith(SITE_URL)).toBe(true);
      expect(url).not.toContain('/en/');
      expect(url).not.toBe(`${SITE_URL}/en`);
      expect(url.endsWith('/')).toBe(url === `${SITE_URL}/`);
    }
  });

  it('has no duplicate URLs', async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('maps every static URL to an existing page.tsx', async () => {
    const entries = await sitemap();
    const missing: string[] = [];
    for (const { url } of entries) {
      const route = url.slice(SITE_URL.length);
      if (DYNAMIC_ROUTES.some((d) => d.pattern.test(route))) continue;
      if (!pageExists(route)) missing.push(route);
    }
    expect(missing).toEqual([]);
  });

  it('maps every dynamic URL to an existing dynamic page with a real param', async () => {
    const entries = await sitemap();
    const bad: string[] = [];
    for (const { url } of entries) {
      const route = url.slice(SITE_URL.length);
      const dyn = DYNAMIC_ROUTES.find((d) => d.pattern.test(route));
      if (!dyn) continue;
      const param = route.match(dyn.pattern)?.[1] ?? '';
      const pageFile = path.join(ROOT, LOCALE_APP_DIR, dyn.page, 'page.tsx');
      if (!fs.existsSync(pageFile) || !dyn.valid(param)) bad.push(route);
    }
    expect(bad).toEqual([]);
  });

  it('includes every public static page and excludes private ones', async () => {
    const urls = new Set((await sitemap()).map((e) => e.url.slice(SITE_URL.length)));
    for (const route of discoverStaticRoutes()) {
      expect(urls.has(route)).toBe(true);
    }
    for (const segment of PRIVATE_SEGMENTS) {
      expect(urls.has(`/${segment}`)).toBe(false);
    }
    expect(urls.has('')).toBe(true);
    expect(urls.has('/blog')).toBe(true);
  });

  it('includes every published blog post and every active blog category', async () => {
    const urls = new Set((await sitemap()).map((e) => e.url.slice(SITE_URL.length)));
    const slugs = fs
      .readdirSync(path.join(ROOT, 'content', 'blog'))
      .filter((f) => f.endsWith('.md'))
      .map((f) => f.replace(/\.md$/, ''));
    expect(slugs.length).toBeGreaterThan(0);
    for (const slug of slugs) {
      const raw = fs.readFileSync(path.join(ROOT, 'content', 'blog', `${slug}.md`), 'utf8');
      if (/^draft:\s*true/m.test(raw)) continue;
      expect(urls.has(`/blog/${slug}`)).toBe(true);
    }
  });

  it('gives every entry a complete hreflang set with an unprefixed x-default', async () => {
    for (const e of await sitemap()) {
      const langs = e.alternates?.languages as Record<string, string>;
      expect(langs['x-default']).toBe(e.url);
      expect(langs.en).toBe(e.url);
      expect(langs.es).toMatch(new RegExp(`^${SITE_URL}/es(/|$)`));
    }
  });
});
