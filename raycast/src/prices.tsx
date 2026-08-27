/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import { List, ActionPanel, Action, Icon, Color, getPreferenceValues } from "@raycast/api";
import { useFetch } from "@raycast/utils";

const API_BASE =
  (getPreferenceValues<{ apiBaseUrl?: string }>().apiBaseUrl as string) ||
  "https://cryptocurrency.cv/api";

interface PriceEntry {
  symbol: string;
  name: string;
  usd: number;
  change24h: number;
  marketCap?: number;
  volume24h?: number;
  image?: string;
}

interface PricesResponse {
  prices: Record<string, PriceEntry> | PriceEntry[];
}

function normalise(data: PricesResponse): PriceEntry[] {
  if (!data.prices) return [];
  if (Array.isArray(data.prices)) return data.prices;
  return Object.entries(data.prices).map(([symbol, entry]) => ({
    ...entry,
    symbol: entry.symbol || symbol,
    name: entry.name || symbol,
  }));
}

export default function Prices() {
  const { data, isLoading, revalidate } = useFetch<PricesResponse>(
    `${API_BASE}/prices?limit=20`,
  );

  const coins = data ? normalise(data) : [];

  return (
    <List
      isLoading={isLoading}
      searchBarPlaceholder="Filter coins…"
    >
      <List.Section title="💰 Live Crypto Prices">
        {coins.map((coin, i) => {
          const positive = coin.change24h >= 0;
          const changeColor = positive ? Color.Green : Color.Red;
          const changeIcon = positive ? Icon.ArrowUp : Icon.ArrowDown;
          const changeText = `${positive ? "+" : ""}${coin.change24h?.toFixed(2) ?? 0}%`;
          const priceText = `$${coin.usd?.toLocaleString() ?? "N/A"}`;

          return (
            <List.Item
              key={i}
              icon={coin.image ? { source: coin.image } : Icon.Coins}
              title={coin.name || coin.symbol}
              subtitle={coin.symbol?.toUpperCase()}
              accessories={[
                { text: priceText },
                { tag: { value: changeText, color: changeColor }, icon: changeIcon },
              ]}
              actions={
                <ActionPanel>
                  <Action.OpenInBrowser
                    title="Open on cryptocurrency.cv"
                    url={`https://cryptocurrency.cv/coin/${encodeURIComponent(coin.symbol?.toLowerCase() ?? "")}`}
                  />
                  <Action.CopyToClipboard
                    title="Copy Price"
                    content={priceText}
                    shortcut={{ modifiers: ["cmd"], key: "c" }}
                  />
                  <Action
                    title="Refresh"
                    icon={Icon.ArrowClockwise}
                    shortcut={{ modifiers: ["cmd"], key: "r" }}
                    onAction={() => revalidate()}
                  />
                </ActionPanel>
              }
            />
          );
        })}
      </List.Section>
    </List>
  );
}
