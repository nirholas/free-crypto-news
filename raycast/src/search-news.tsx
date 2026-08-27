/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import { useState, useRef, useCallback } from "react";
import {
  List,
  ActionPanel,
  Action,
  Icon,
  Color,
  showToast,
  Toast,
  getPreferenceValues,
} from "@raycast/api";

const API_BASE =
  (getPreferenceValues<{ apiBaseUrl?: string }>().apiBaseUrl as string) ||
  "https://cryptocurrency.cv/api";

interface Article {
  title: string;
  link: string;
  source: string;
  description?: string;
  timeAgo: string;
  category?: string;
}

interface SearchResponse {
  articles: Article[];
  total?: number;
}

const categoryIcons: Record<string, { icon: Icon; color: Color }> = {
  bitcoin: { icon: Icon.Coins, color: Color.Orange },
  ethereum: { icon: Icon.Coins, color: Color.Blue },
  defi: { icon: Icon.Link, color: Color.Purple },
  nft: { icon: Icon.Image, color: Color.Magenta },
  regulation: { icon: Icon.Shield, color: Color.Red },
  altcoin: { icon: Icon.Star, color: Color.Yellow },
};

export default function SearchNews() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [total, setTotal] = useState<number | undefined>();
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const search = useCallback(async (text: string) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    if (!text.trim()) {
      setArticles([]);
      setTotal(undefined);
      return;
    }

    timerRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(
          `${API_BASE}/news?search=${encodeURIComponent(text)}&limit=20`,
        );
        if (!res.ok) throw new Error(`API error ${res.status}`);
        const data: SearchResponse = await res.json();
        setArticles(data.articles || []);
        setTotal(data.total);
      } catch (err: any) {
        showToast(Toast.Style.Failure, "Search failed", err.message);
      } finally {
        setIsLoading(false);
      }
    }, 350);
  }, []);

  return (
    <List
      isLoading={isLoading}
      onSearchTextChange={search}
      searchBarPlaceholder="Search crypto news…"
      throttle
    >
      {total !== undefined && (
        <List.Section title={`${total} result${total === 1 ? "" : "s"}`}>
          {articles.map((article, i) => {
            const cat = article.category?.toLowerCase() ?? "";
            const iconInfo = categoryIcons[cat];
            return (
              <List.Item
                key={i}
                icon={iconInfo?.icon ?? Icon.Document}
                title={article.title}
                subtitle={article.source}
                accessories={[{ text: article.timeAgo, icon: Icon.Clock }]}
                actions={
                  <ActionPanel>
                    <Action.OpenInBrowser url={article.link} />
                    <Action.CopyToClipboard
                      title="Copy Link"
                      content={article.link}
                      shortcut={{ modifiers: ["cmd"], key: "c" }}
                    />
                    {article.description && (
                      <Action.CopyToClipboard
                        title="Copy Summary"
                        content={article.description}
                        shortcut={{ modifiers: ["cmd", "shift"], key: "c" }}
                      />
                    )}
                  </ActionPanel>
                }
              />
            );
          })}
        </List.Section>
      )}
    </List>
  );
}
