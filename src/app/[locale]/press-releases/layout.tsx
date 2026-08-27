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
import { setRequestLocale } from "next-intl/server";
import { pageMetadata } from "@/lib/blog-seo";

type Props = {
  params: Promise<{ locale: string }>;
  children: React.ReactNode;
};

/**
 * The page itself is a client component and cannot export metadata, so the
 * title, description, and canonical live in this server layout.
 */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    title: "Press Releases",
    description:
      "Official announcements from crypto projects, exchanges, and blockchain companies, published on Crypto Vision News.",
    path: "/press-releases",
    locale,
  });
}

export default async function Layout({ params, children }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return children;
}
