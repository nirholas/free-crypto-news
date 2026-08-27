package io.cryptocurrencycv;

import java.util.List;

/** Top-level API response envelope. */
public class NewsResponse {
    public List<NewsArticle> articles;
    public int totalCount;
    public List<String> sources;
    public String fetchedAt;
}
