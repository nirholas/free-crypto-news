package io.cryptocurrencycv;

import com.google.gson.Gson;
import com.google.gson.reflect.TypeToken;

import java.io.IOException;
import java.lang.reflect.Type;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Java SDK for the Free Crypto News API (https://cryptocurrency.cv).
 *
 * <p>No API key required. All methods are synchronous.
 *
 * <p>Structural inspiration from
 * executium/trending-historical-cryptocurrency-news (MIT License).
 *
 * <pre>{@code
 * CryptoNews client = new CryptoNews();
 * List<NewsArticle> articles = client.getLatest(10);
 * articles.forEach(System.out::println);
 * }</pre>
 */
public class CryptoNews {

    private static final String DEFAULT_BASE_URL = "https://cryptocurrency.cv";
    private static final Duration DEFAULT_TIMEOUT = Duration.ofSeconds(30);
    private static final String USER_AGENT = "free-crypto-news-java-sdk/1.0";

    private final String baseUrl;
    private final HttpClient http;
    private final Gson gson = new Gson();

    public CryptoNews() {
        this(DEFAULT_BASE_URL);
    }

    public CryptoNews(String baseUrl) {
        this.baseUrl = baseUrl.replaceAll("/$", "");
        this.http = HttpClient.newBuilder()
                .connectTimeout(DEFAULT_TIMEOUT)
                .followRedirects(HttpClient.Redirect.NORMAL)
                .build();
    }

    // ── Private helpers ─────────────────────────────────────────

    private String get(String path) throws IOException, InterruptedException {
        HttpRequest req = HttpRequest.newBuilder()
                .uri(URI.create(baseUrl + path))
                .timeout(DEFAULT_TIMEOUT)
                .header("Accept", "application/json")
                .header("User-Agent", USER_AGENT)
                .GET()
                .build();

        HttpResponse<String> resp = http.send(req, HttpResponse.BodyHandlers.ofString());
        if (resp.statusCode() < 200 || resp.statusCode() >= 300) {
            throw new IOException("HTTP " + resp.statusCode() + " from " + path);
        }
        return resp.body();
    }

    private List<NewsArticle> articlesFromResponse(String json) {
        NewsResponse resp = gson.fromJson(json, NewsResponse.class);
        return resp.articles;
    }

    // ── Public API ──────────────────────────────────────────────

    /**
     * Get the latest crypto news from all sources.
     *
     * @param limit 1–50 articles (default 10)
     */
    public List<NewsArticle> getLatest(int limit) throws IOException, InterruptedException {
        return articlesFromResponse(get("/api/news?limit=" + limit));
    }

    /**
     * Get the latest news filtered by source key.
     *
     * @param limit  1–50 articles
     * @param source Source key, e.g. "coindesk", "cointelegraph"
     */
    public List<NewsArticle> getLatest(int limit, String source) throws IOException, InterruptedException {
        return articlesFromResponse(get("/api/news?limit=" + limit + "&source=" + encode(source)));
    }

    /**
     * Full-text news search.
     *
     * @param keywords Comma-separated search terms
     * @param limit    1–30 articles
     */
    public List<NewsArticle> search(String keywords, int limit) throws IOException, InterruptedException {
        return articlesFromResponse(get("/api/search?q=" + encode(keywords) + "&limit=" + limit));
    }

    /**
     * Get DeFi-specific news.
     *
     * @param limit 1–30 articles
     */
    public List<NewsArticle> getDefi(int limit) throws IOException, InterruptedException {
        return articlesFromResponse(get("/api/defi?limit=" + limit));
    }

    /**
     * Get Bitcoin-specific news.
     *
     * @param limit 1–30 articles
     */
    public List<NewsArticle> getBitcoin(int limit) throws IOException, InterruptedException {
        return articlesFromResponse(get("/api/bitcoin?limit=" + limit));
    }

    /**
     * Get breaking news from the last 2 hours.
     *
     * @param limit 1–20 articles
     */
    public List<NewsArticle> getBreaking(int limit) throws IOException, InterruptedException {
        return articlesFromResponse(get("/api/breaking?limit=" + limit));
    }

    /**
     * Get list of all news sources.
     */
    public List<Map<String, String>> getSources() throws IOException, InterruptedException {
        String json = get("/api/sources");
        Type type = new TypeToken<Map<String, List<Map<String, String>>>>() {}.getType();
        Map<String, List<Map<String, String>>> resp = gson.fromJson(json, type);
        return resp.get("sources");
    }

    // ── Utility ─────────────────────────────────────────────────

    private static String encode(String s) {
        return URLEncoder.encode(s, StandardCharsets.UTF_8);
    }
}
