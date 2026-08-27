/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import type { Metadata } from "next";
import { generateSEOMetadata } from "@/lib/seo";

type SEOConfig = Parameters<typeof generateSEOMetadata>[0];
import { SITE_URL } from "@/lib/constants";

export const SITE_NAME = "Crypto Vision News";

/**
 * next-intl runs with localePrefix 'as-needed': the default locale is served at the
 * bare path and `/en/<path>` only 307-redirects there. `generateSEOMetadata` still
 * prefixes every URL with the locale, so pages that go through `pageMetadata` get a canonical
 * that resolves without a redirect. Non-default locales keep their prefix.
 */
export function canonicalUrl(locale: string, path: string): string {
  return locale === "en" ? `${SITE_URL}${path}` : `${SITE_URL}/${locale}${path}`;
}

export function pageMetadata(config: SEOConfig & { locale: string; path: string }): Metadata {
  const base = generateSEOMetadata(config);
  const canonical = canonicalUrl(config.locale, config.path);
  return {
    ...base,
    alternates: {
      ...base.alternates,
      canonical,
      languages: {
        ...(base.alternates?.languages ?? {}),
        "x-default": `${SITE_URL}${config.path}`,
        en: `${SITE_URL}${config.path}`,
      },
    },
    openGraph: { ...base.openGraph, url: canonical },
  };
}
