# Free Crypto News — Kotlin SDK

Kotlin SDK for the [Free Crypto News API](https://cryptocurrency.cv). No API key required.

> Inspired by [executium/trending-historical-cryptocurrency-news](https://github.com/executium/trending-historical-cryptocurrency-news) (MIT License)

## Requirements
- Kotlin 1.8+
- [Gson](https://github.com/google/gson) (`com.google.code.gson:gson:2.10.1`)

## Quick Start

```kotlin
val client = CryptoNews()

// Latest news
val articles = client.getLatest(10)
articles.forEach { println("${it.title} — ${it.source}") }

// Search
val results = client.search("bitcoin ETF", 5)

// DeFi news
val defi = client.getDefi(10)

// Bitcoin news
val btc = client.getBitcoin(10)
```

## Build with Gradle

```kotlin
// build.gradle.kts
dependencies {
    implementation("com.google.code.gson:gson:2.10.1")
}
```

```bash
./gradlew run
```

## API Reference

| Method | Description |
|--------|-------------|
| `getLatest(limit)` | Latest news |
| `getLatest(limit, source)` | Latest news from one source |
| `search(keywords, limit)` | Full-text search |
| `getDefi(limit)` | DeFi news |
| `getBitcoin(limit)` | Bitcoin news |
| `getBreaking(limit)` | Breaking news (last 2h) |
| `getSources()` | All sources |

## License
MIT — see [LICENSE](../../LICENSE)
