using System.Text.Json.Serialization;

namespace FreeCryptoNews;

/// <summary>
/// A single crypto news article returned by the Free Crypto News API.
/// <para>
/// price_impact and tone fields inspired by
/// executium/trending-historical-cryptocurrency-news (MIT License).
/// </para>
/// </summary>
public class NewsArticle
{
    [JsonPropertyName("title")]
    public string Title { get; init; } = string.Empty;

    [JsonPropertyName("link")]
    public string Link { get; init; } = string.Empty;

    [JsonPropertyName("description")]
    public string? Description { get; init; }

    [JsonPropertyName("pubDate")]
    public string PubDate { get; init; } = string.Empty;

    [JsonPropertyName("source")]
    public string Source { get; init; } = string.Empty;

    [JsonPropertyName("sourceKey")]
    public string SourceKey { get; init; } = string.Empty;

    [JsonPropertyName("category")]
    public string Category { get; init; } = string.Empty;

    [JsonPropertyName("timeAgo")]
    public string TimeAgo { get; init; } = string.Empty;

    /// <summary>Article author (when available).</summary>
    [JsonPropertyName("author")]
    public string? Author { get; init; }

    /// <summary>Source domain, e.g. "cointelegraph.com".</summary>
    [JsonPropertyName("domain")]
    public string? Domain { get; init; }

    /// <summary>Thumbnail image URL.</summary>
    [JsonPropertyName("image")]
    public string? Image { get; init; }

    /// <summary>
    /// Price impact within 1 hour of publication.
    /// Inspired by executium/trending-historical-cryptocurrency-news (MIT).
    /// </summary>
    [JsonPropertyName("price_impact")]
    public PriceImpact? PriceImpact { get; init; }

    /// <summary>
    /// 7-dimension tone analysis.
    /// Inspired by executium/trending-historical-cryptocurrency-news (MIT).
    /// </summary>
    [JsonPropertyName("tone")]
    public ArticleTone? Tone { get; init; }

    public override string ToString() => $"[{Source}] {Title} ({PubDate})";
}

/// <summary>Price movement observed within 1 hour of article publication.</summary>
public class PriceImpact
{
    /// <summary>Percentage change (positive = up, negative = down).</summary>
    [JsonPropertyName("percentage")]
    public double? Percentage { get; init; }

    /// <summary>"positive", "negative", or "neutral".</summary>
    [JsonPropertyName("direction")]
    public string? Direction { get; init; }

    /// <summary>Raw impact score.</summary>
    [JsonPropertyName("score")]
    public double? Score { get; init; }
}

/// <summary>7-dimension tone/emotion analysis of an article.</summary>
public class ArticleTone
{
    [JsonPropertyName("anger")]
    public double Anger { get; init; }

    [JsonPropertyName("fear")]
    public double Fear { get; init; }

    [JsonPropertyName("joy")]
    public double Joy { get; init; }

    [JsonPropertyName("sadness")]
    public double Sadness { get; init; }

    [JsonPropertyName("analytical")]
    public double Analytical { get; init; }

    [JsonPropertyName("confident")]
    public double Confident { get; init; }

    [JsonPropertyName("tentative")]
    public double Tentative { get; init; }
}

internal class NewsResponse
{
    [JsonPropertyName("articles")]
    public List<NewsArticle> Articles { get; init; } = new();

    [JsonPropertyName("totalCount")]
    public int TotalCount { get; init; }

    [JsonPropertyName("sources")]
    public List<string> Sources { get; init; } = new();
}

internal class SourcesResponse
{
    [JsonPropertyName("sources")]
    public List<SourceInfo> Sources { get; init; } = new();
}

public class SourceInfo
{
    [JsonPropertyName("key")]
    public string Key { get; init; } = string.Empty;

    [JsonPropertyName("name")]
    public string Name { get; init; } = string.Empty;

    [JsonPropertyName("url")]
    public string Url { get; init; } = string.Empty;

    [JsonPropertyName("category")]
    public string Category { get; init; } = string.Empty;

    [JsonPropertyName("status")]
    public string Status { get; init; } = string.Empty;
}
