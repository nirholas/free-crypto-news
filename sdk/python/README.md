# Python SDK

Zero dependencies Python client for Free Crypto News API.

## Installation

Just copy `crypto_news.py` to your project - no pip install needed!

Or for convenience:
```bash
curl -O https://raw.githubusercontent.com/nirholas/free-crypto-news/main/sdk/python/crypto_news.py
```

## Usage

```python
from crypto_news import CryptoNews

# Initialize client
news = CryptoNews()

# Get latest news
articles = news.get_latest(limit=10)
for article in articles:
    print(f"{article['title']} - {article['source']}")

# Search for specific topics
eth_news = news.search("ethereum,eth")

# Get DeFi news
defi = news.get_defi(limit=5)

# Get Bitcoin news
btc = news.get_bitcoin(limit=5)

# Get breaking news (last 2 hours)
breaking = news.get_breaking()

# List all sources
sources = news.get_sources()
```

## Quick Functions

```python
from crypto_news import get_crypto_news, search_crypto_news

# One-liner to get news
articles = get_crypto_news(10)

# One-liner to search
results = search_crypto_news("bitcoin etf")
```

## Self-Hosted

```python
news = CryptoNews(base_url="https://your-deployment.vercel.app")
```

## No API Key Required!

This is a 100% free API. No authentication, no rate limits (fair use).
