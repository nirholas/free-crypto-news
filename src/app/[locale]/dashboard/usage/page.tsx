/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 */

/**
 * Dashboard > Usage Page
 */

import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/blog-seo";
import UsageDashboard from "@/components/dashboard/UsageDashboard";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    title: "Usage",
    description: "Request volume, rate limits, and quota consumption for your API keys.",
    path: "/dashboard/usage",
    locale,
    noindex: true,
  });
}

export default async function UsagePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <UsageDashboard />;
}
