/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

import { List, ActionPanel, Action, Icon, Color } from "@raycast/api";
import { useFetch } from "@raycast/utils";

const API_BASE = "https://cryptocurrency.cv/api";

interface Article {
  title: string;
  link: string;
  source: string;
  timeAgo: string;
}

interface NewsResponse {
  articles: Article[];
}

export default function BreakingNews() {
  const { data, isLoading } = useFetch<NewsResponse>(`${API_BASE}/breaking?limit=10`);

  return (
    <List isLoading={isLoading} searchBarPlaceholder="Filter breaking news...">
      <List.Section title="🔴 Breaking News">
        {data?.articles.map((article, index) => (
          <List.Item
            key={index}
            icon={{ source: Icon.ExclamationMark, tintColor: Color.Red }}
            title={article.title}
            subtitle={article.source}
            accessories={[{ text: article.timeAgo, icon: Icon.Clock }]}
            actions={
              <ActionPanel>
                <Action.OpenInBrowser url={article.link} />
                <Action.CopyToClipboard title="Copy Link" content={article.link} />
              </ActionPanel>
            }
          />
        ))}
      </List.Section>
    </List>
  );
}
