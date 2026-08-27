# Free Crypto News — Swift SDK

Swift 5.5+ SDK for the [Free Crypto News API](https://cryptocurrency.cv). No API key required.

> Inspired by [executium/trending-historical-cryptocurrency-news](https://github.com/executium/trending-historical-cryptocurrency-news) (MIT License)

## Requirements
- Swift 5.5+ / Xcode 13+
- iOS 15+ / macOS 12+ / watchOS 8+ / tvOS 15+

## Quick Start

```swift
import CryptoNews

let client = CryptoNewsClient()

// Latest news
let articles = try await client.getLatest(limit: 10)
articles.forEach { print("\($0.title) — \($0.source)") }

// Search
let results = try await client.search("bitcoin ETF", limit: 5)

// DeFi news
let defi = try await client.getDefi(limit: 10)

// Bitcoin news
let btc = try await client.getBitcoin(limit: 10)
```

## Installation (Swift Package Manager)

Add to `Package.swift`:
```swift
.package(url: "https://github.com/nirholas/free-crypto-news", from: "1.0.0")
```

Or in Xcode: File → Add Packages → paste the repo URL.

## API Reference

| Method | Description |
|--------|-------------|
| `getLatest(limit:source:)` | Latest news |
| `search(_:limit:)` | Full-text search |
| `getDefi(limit:)` | DeFi news |
| `getBitcoin(limit:)` | Bitcoin news |
| `getBreaking(limit:)` | Breaking news (last 2h) |
| `getSources()` | All sources |

## License
MIT — see [LICENSE](../../LICENSE)
