/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 */

/**
 * Dashboard Overview Page — Key metrics at a glance.
 */

import { setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/blog-seo";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return pageMetadata({
    title: "Developer Dashboard",
    description: "Overview of your API keys, request usage, and account status.",
    path: "/dashboard",
    locale,
    noindex: true,
  });
}

export default async function DashboardPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <DashboardOverview />;
}
