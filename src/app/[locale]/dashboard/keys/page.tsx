/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 */

/**
 * Dashboard > API Keys Page
 */

import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/blog-seo";
import ApiKeysManager from "@/components/dashboard/ApiKeysManager";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    title: "API Keys",
    description: "Create, rotate, and revoke API keys for the Crypto Vision News API.",
    path: "/dashboard/keys",
    locale,
    noindex: true,
  });
}

export default async function KeysPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <ApiKeysManager />;
}
