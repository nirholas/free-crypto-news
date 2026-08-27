# Free Crypto News — R SDK

R package for the [Free Crypto News API](https://cryptocurrency.cv). No API key required.

> Inspired by [executium/trending-historical-cryptocurrency-news](https://github.com/executium/trending-historical-cryptocurrency-news) (MIT License)

## Requirements
- R 4.0+
- `httr2` (`install.packages("httr2")`)
- `jsonlite` (`install.packages("jsonlite")`)

## Quick Start

```r
source("R/crypto_news.R")

client <- CryptoNews$new()

# Latest news
articles <- client$get_latest(limit = 10)
print(articles[, c("title", "source", "pubDate")])

# Search
results <- client$search("bitcoin ETF", limit = 5)

# DeFi news
defi <- client$get_defi(limit = 10)

# Bitcoin news
btc <- client$get_bitcoin(limit = 10)
```

## Install dependencies

```r
install.packages(c("httr2", "jsonlite"))
```

## API Reference

| Method | Description |
|--------|-------------|
| `get_latest(limit, source)` | Latest news |
| `search(keywords, limit)` | Full-text search |
| `get_defi(limit)` | DeFi news |
| `get_bitcoin(limit)` | Bitcoin news |
| `get_breaking(limit)` | Breaking news (last 2h) |
| `get_sources()` | All sources |

## License
MIT — see [LICENSE](../../LICENSE)
