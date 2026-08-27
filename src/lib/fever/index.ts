/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/cryptocurrency.cv
 *
 * This file is part of cryptocurrency.cv.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * Fever API data mapping.
 *
 * The Fever API is the de-facto protocol every third-party RSS client speaks
 * (Reeder, NetNewsWire, Unread, FeedMe, Fiery Feeds, Readably...). FreshRSS and
 * miniflux implement it, which is how a self-hosted reader shows up inside apps
 * their authors never wrote. Implementing it here turns cryptocurrency.cv into
 * a backend those apps can subscribe to, with no key and no account.
 *
 * Read state is deliberately not stored: this is a public, keyless feed with no
 * per-user rows, so clients track read and saved state locally and the
 * mark endpoints accept-and-ignore. Everything else is the real feed.
 *
 * @module lib/fever
 */

import type { NewsArticle } from '@/lib/crypto-news';

/** Fever clients expect this exact version integer. */
export const FEVER_API_VERSION = 3;

/**
 * 32-bit FNV-1a. Deterministic across processes and runtimes, which matters
 * because a feed's id has to be the same on every request or clients resubscribe.
 */
export function stableHash(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash;
}

/**
 * Item ids are microsecond-resolution timestamps, the same convention FreshRSS
 * uses. Fever pagination (`since_id`, `max_id`) is defined as an id comparison,
 * so ids have to sort chronologically; a plain content hash would break it.
 * The low three digits disambiguate articles published in the same millisecond.
 */
export function itemId(article: NewsArticle): number {
  const published = Date.parse(article.pubDate);
  const ms = Number.isNaN(published) ? 0 : published;
  return ms * 1000 + (stableHash(article.link) % 1000);
}

/**
 * Feed ids are derived from the source key so they survive restarts, source
 * list reordering, and new sources being added. Collisions are resolved
 * deterministically by walking upward, so a given source list always yields
 * the same assignment.
 */
export function buildFeedIds(sourceKeys: string[]): Map<string, number> {
  const ids = new Map<string, number>();
  const taken = new Set<number>();
  for (const key of [...sourceKeys].sort()) {
    let id = (stableHash(key) % 2_000_000_000) + 1;
    while (taken.has(id)) id = id === 2_000_000_000 ? 1 : id + 1;
    taken.add(id);
    ids.set(key, id);
  }
  return ids;
}

/** Group ids come from the category slug for the same stability reason. */
export function groupId(category: string): number {
  return (stableHash(`group:${category}`) % 2_000_000_000) + 1;
}

export interface FeverGroup {
  id: number;
  title: string;
}

export interface FeverFeed {
  id: number;
  favicon_id: number;
  title: string;
  url: string;
  site_url: string;
  is_spark: 0 | 1;
  last_updated_on_time: number;
}

export interface FeverItem {
  id: number;
  feed_id: number;
  title: string;
  author: string;
  html: string;
  url: string;
  is_saved: 0 | 1;
  is_read: 0 | 1;
  created_on_time: number;
}

export interface FeverFeedsGroup {
  group_id: number;
  feed_ids: string;
}

/** Escapes the article description so a client rendering `html` cannot be injected into. */
function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Fever's `html` field is rendered as markup by clients. Article descriptions
 * come from third-party RSS feeds, so they are escaped rather than passed
 * through, and the image (if any) is added as a tag we control.
 */
export function itemHtml(article: NewsArticle): string {
  const parts: string[] = [];
  if (article.imageUrl && /^https?:\/\//.test(article.imageUrl)) {
    parts.push(`<p><img src="${escapeHtml(article.imageUrl)}" alt="" /></p>`);
  }
  if (article.description) {
    parts.push(`<p>${escapeHtml(article.description)}</p>`);
  }
  parts.push(
    `<p><a href="${escapeHtml(article.link)}">Read on ${escapeHtml(article.source)}</a></p>`,
  );
  return parts.join('\n');
}

export function toFeverItem(article: NewsArticle, feedIds: Map<string, number>): FeverItem {
  const published = Date.parse(article.pubDate);
  return {
    id: itemId(article),
    feed_id: feedIds.get(article.sourceKey) ?? 0,
    title: article.title,
    author: article.author ?? article.source,
    html: itemHtml(article),
    url: article.link,
    is_saved: 0,
    is_read: 0,
    created_on_time: Math.floor((Number.isNaN(published) ? Date.now() : published) / 1000),
  };
}

/** The site a feed belongs to, used for the `site_url` field clients link to. */
export function siteUrlOf(feedUrl: string): string {
  try {
    return new URL(feedUrl).origin;
  } catch {
    return feedUrl;
  }
}
