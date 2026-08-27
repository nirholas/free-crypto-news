# Free Crypto News — C# SDK

.NET 6+ SDK for the [Free Crypto News API](https://cryptocurrency.cv). No API key required.

> Inspired by [executium/trending-historical-cryptocurrency-news](https://github.com/executium/trending-historical-cryptocurrency-news) (MIT License)

## Quick Start

```csharp
var client = new CryptoNews();

// Latest news
var articles = await client.GetLatestAsync(10);
foreach (var a in articles)
    Console.WriteLine($"{a.Title} — {a.Source}");

// Search
var results = await client.SearchAsync("bitcoin ETF", 5);

// DeFi news
var defi = await client.GetDefiAsync(10);

// Bitcoin news
var btc = await client.GetBitcoinAsync(10);
```

## Install

Add the `System.Text.Json` NuGet package (included in .NET 6+, no extra install needed).

```bash
dotnet run
```

## API Reference

| Method | Description |
|--------|-------------|
| `GetLatestAsync(limit)` | Latest news (all sources) |
| `GetLatestAsync(limit, source)` | Latest news from one source |
| `SearchAsync(keywords, limit)` | Full-text search |
| `GetDefiAsync(limit)` | DeFi-specific news |
| `GetBitcoinAsync(limit)` | Bitcoin-specific news |
| `GetBreakingAsync(limit)` | Breaking news (last 2h) |
| `GetSourcesAsync()` | All news sources |

## License
MIT — see [LICENSE](../../LICENSE)
