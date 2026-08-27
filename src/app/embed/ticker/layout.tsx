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

/**
 * The ticker widget page is a client component; its metadata lives here so
 * the iframe document still carries a title and a canonical back to the
 * widget URL (embeds stay noindex via the parent embed layout).
 */
export const metadata: Metadata = {
  title: "Crypto Price Ticker Widget | Crypto Vision News",
  description:
    "Embeddable live cryptocurrency price ticker showing top coins with 24h change, powered by Crypto Vision News.",
  alternates: { canonical: "https://cryptocurrency.cv/embed/ticker" },
};

export default function TickerLayout({ children }: { children: React.ReactNode }) {
  return children;
}
