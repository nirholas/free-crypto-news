using System.Net.Http.Json;
using System.Text.Json;

namespace FreeCryptoNews;

/// <summary>
/// C# SDK for the Free Crypto News API (https://cryptocurrency.cv).
/// No API key required.
/// <para>
/// Structural inspiration from
/// executium/trending-historical-cryptocurrency-news (MIT License).
/// </para>
/// </summary>
/// <example>
/// <code>
/// var client = new CryptoNews();
/// var articles = await client.GetLatestAsync(10);
/// foreach (var a in articles)
///     Console.WriteLine(a);
/// </code>
/// </example>
public sealed class CryptoNews : IDisposable
{
    private const string DefaultBaseUrl = "https://cryptocurrency.cv";
    private readonly HttpClient _http;

    private static readonly JsonSerializerOptions JsonOpts = new()
    {
        PropertyNameCaseInsensitive = true,
    };

    public CryptoNews(string? baseUrl = null, HttpClient? httpClient = null)
    {
        _http = httpClient ?? new HttpClient
        {
            BaseAddress = new Uri(baseUrl ?? DefaultBaseUrl),
            Timeout = TimeSpan.FromSeconds(30),
            DefaultRequestHeaders = { { "User-Agent", "free-crypto-news-csharp-sdk/1.0" } },
        };
    }

    // ── Private helpers ─────────────────────────────────────────

    private async Task<T> GetAsync<T>(string path, CancellationToken ct = default)
    {
        var response = await _http.GetAsync(path, ct);
        response.EnsureSuccessStatusCode();
        return await response.Content.ReadFromJsonAsync<T>(JsonOpts, ct)
               ?? throw new InvalidOperationException("Empty response from API");
    }

    private async Task<List<NewsArticle>> ArticlesFromPath(string path, CancellationToken ct)
    {
        var resp = await GetAsync<NewsResponse>(path, ct);
        return resp.Articles;
    }

    // ── Public API ──────────────────────────────────────────────

    /// <summary>Get the latest crypto news from all sources.</summary>
    /// <param name="limit">1–50 articles (default 10)</param>
    public Task<List<NewsArticle>> GetLatestAsync(int limit = 10, CancellationToken ct = default)
        => ArticlesFromPath($"/api/news?limit={limit}", ct);

    /// <summary>Get the latest news filtered by source key.</summary>
    public Task<List<NewsArticle>> GetLatestAsync(int limit, string source, CancellationToken ct = default)
        => ArticlesFromPath($"/api/news?limit={limit}&source={Uri.EscapeDataString(source)}", ct);

    /// <summary>Full-text news search.</summary>
    /// <param name="keywords">Search terms</param>
    /// <param name="limit">1–30 articles</param>
    public Task<List<NewsArticle>> SearchAsync(string keywords, int limit = 10, CancellationToken ct = default)
        => ArticlesFromPath($"/api/search?q={Uri.EscapeDataString(keywords)}&limit={limit}", ct);

    /// <summary>Get DeFi-specific news.</summary>
    public Task<List<NewsArticle>> GetDefiAsync(int limit = 10, CancellationToken ct = default)
        => ArticlesFromPath($"/api/defi?limit={limit}", ct);

    /// <summary>Get Bitcoin-specific news.</summary>
    public Task<List<NewsArticle>> GetBitcoinAsync(int limit = 10, CancellationToken ct = default)
        => ArticlesFromPath($"/api/bitcoin?limit={limit}", ct);

    /// <summary>Get breaking news from the last 2 hours.</summary>
    public Task<List<NewsArticle>> GetBreakingAsync(int limit = 5, CancellationToken ct = default)
        => ArticlesFromPath($"/api/breaking?limit={limit}", ct);

    /// <summary>Get the list of all news sources.</summary>
    public async Task<List<SourceInfo>> GetSourcesAsync(CancellationToken ct = default)
    {
        var resp = await GetAsync<SourcesResponse>("/api/sources", ct);
        return resp.Sources;
    }

    public void Dispose() => _http.Dispose();
}
