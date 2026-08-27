# Free Crypto News — Java SDK

Java 11+ SDK for the [Free Crypto News API](https://cryptocurrency.cv). No API key required.

> Inspired by [executium/trending-historical-cryptocurrency-news](https://github.com/executium/trending-historical-cryptocurrency-news) (MIT License)

## Requirements
- Java 11+
- [Gson](https://github.com/google/gson) (`com.google.code.gson:gson:2.10.1`)

## Quick Start

```java
CryptoNews client = new CryptoNews();

// Latest news
List<NewsArticle> articles = client.getLatest(10);
articles.forEach(a -> System.out.println(a.title + " — " + a.source));

// Search
List<NewsArticle> results = client.search("bitcoin ETF", 5);

// DeFi news
List<NewsArticle> defi = client.getDefi(10);

// Bitcoin news
List<NewsArticle> btc = client.getBitcoin(10);
```

## Build with Maven

```xml
<dependency>
  <groupId>com.google.code.gson</groupId>
  <artifactId>gson</artifactId>
  <version>2.10.1</version>
</dependency>
```

Then compile and run:
```bash
mvn compile exec:java -Dexec.mainClass="io.cryptocurrencycv.Main"
```

## API Reference

| Method | Description |
|--------|-------------|
| `getLatest(limit)` | Latest news (all sources) |
| `getLatest(limit, source)` | Latest news from one source |
| `search(keywords, limit)` | Full-text search |
| `getDefi(limit)` | DeFi-specific news |
| `getBitcoin(limit)` | Bitcoin-specific news |
| `getBreaking(limit)` | Breaking news (last 2h) |
| `getSources()` | All news sources |

## License
MIT — see [LICENSE](../../LICENSE)
