# Platform Features

> Blog, the CryptoNewsOracle smart contract, RSS output, health checks, interactive docs, webhooks, trending analytics, the failsafe mirror, original source finder, web push, and embeddable widgets.
>
> Moved here from the project README. Back to the [reference index](../../README.md).

## 📝 Blog

11 educational articles at [`/blog`](https://cryptocurrency.cv/blog):

| Article | Topic |
|---------|-------|
| What is Bitcoin? | Bitcoin fundamentals |
| What is Ethereum? | Ethereum & smart contracts |
| Introduction to DeFi | Decentralized finance primer |
| Crypto Trading Strategies | Technical & fundamental analysis |
| Crypto Wallet Guide | Hot, cold, hardware wallets |
| Security Best Practices | Protecting your crypto |
| Layer 2 Scaling Solutions | Rollups, sidechains, channels |
| Understanding Stablecoins | USDC, USDT, DAI, algorithmic |
| NFT Guide | Non-fungible tokens explained |
| Airdrop Guide | Finding and claiming airdrops |
| How to Buy Crypto | Step-by-step purchasing guide |

Blog content lives in [`/content/blog/`](../../content/blog) as Markdown files.

---

## ⛓️ Smart Contract (CryptoNewsOracle)

Solidity contract for on-chain crypto sentiment data via Chainlink:

```solidity
// SPDX-License-Identifier: MIT
// contracts/CryptoNewsOracle.sol

// Request on-chain sentiment
oracle.requestSentiment();

// Request full market data
oracle.requestFullData();

// Read latest data
(int256 sentiment, uint256 fearGreed, uint256 breakingCount) = oracle.getLatest();
```

**On-chain data available:**
- Sentiment score (-100 to +100)
- Fear & Greed Index (0-100)
- Breaking news count
- Last update timestamp

See [`/contracts/CryptoNewsOracle.sol`](../../contracts/CryptoNewsOracle.sol) for the full implementation.

---

## Contributing

PRs welcome! Ideas:

- [ ] More news sources (Korean, Chinese, Japanese, Spanish)
- [x] ~~Sentiment analysis~~ ✅ Done
- [x] ~~Topic classification~~ ✅ Done
- [x] ~~WebSocket real-time feed~~ ✅ Done
- [x] ~~Configurable alert system~~ ✅ Done
- [x] Rust / Ruby SDKs ✅
- [x] ~~Mobile app (React Native)~~ ✅ Done - See [mobile/](../../mobile)

---

## New Features

## 📡 RSS Feed Output

Subscribe to the aggregated feed in any RSS reader:

```
https://cryptocurrency.cv/api/rss
https://cryptocurrency.cv/api/rss?feed=defi
https://cryptocurrency.cv/api/rss?feed=bitcoin
```

## 🏥 Health Check

Monitor API and source health:

```bash
curl https://cryptocurrency.cv/api/health | jq
```

Returns status of all 7 RSS sources with response times.

## 📖 Interactive Docs

Swagger UI documentation:

```
https://cryptocurrency.cv/api/docs
```

## 🔔 Webhooks

Register for push notifications:

```bash
curl -X POST https://cryptocurrency.cv/api/webhooks \
  -H "Content-Type: application/json" \
  -d '{"url": "https://your-server.com/webhook", "secret": "your-secret"}'
```

---

## 📊 Trending & Analytics

### Trending Topics

```bash
curl https://cryptocurrency.cv/api/trending?hours=24
```

Returns topics with sentiment (bullish/bearish/neutral) and mention counts.

### News with Classification

```bash
# Get all analyzed news
curl https://cryptocurrency.cv/api/analyze

# Filter by topic
curl "https://cryptocurrency.cv/api/analyze?topic=DeFi"

# Filter by sentiment
curl "https://cryptocurrency.cv/api/analyze?sentiment=bullish"
```

### Statistics

```bash
curl https://cryptocurrency.cv/api/stats
```

Returns articles per source, hourly distribution, and category breakdown.


---

## 🛡️ Failsafe Mirror

If the main Vercel deployment is down, use the **GitHub Pages backup**:

### Failsafe URL

```
https://nirholas.github.io/cryptocurrency.cv/
https://fcn.dev
```

### Static JSON Endpoints

| Endpoint               | Description                 |
| ---------------------- | --------------------------- |
| `/cache/latest.json`   | Latest cached news (hourly) |
| `/cache/bitcoin.json`  | Bitcoin news cache          |
| `/cache/defi.json`     | DeFi news cache             |
| `/cache/trending.json` | Trending topics cache       |
| `/cache/sources.json`  | Source list                 |
| `/archive/index.json`  | Historical archive index    |

### Status Page

View real-time system health at:

```
https://cryptocurrency.cv/status
```

The status page shows:
- ✅ Service health (API, Cache, External APIs, x402 Facilitator)
- 📊 System metrics (version, uptime, active sources)
- 📰 News source activity (articles per source in last 24h)
- 🔗 API endpoint status

**Legacy static status page:**
```
https://nirholas.github.io/cryptocurrency.cv/status.html
```

Real-time monitoring of all API endpoints with auto-refresh.

### How It Works

1. **GitHub Actions** runs every hour to cache data from main API
2. **GitHub Pages** serves the static JSON files
3. **Failsafe page** auto-detects if main API is down and switches to cache
4. **Archive workflow** runs every 6 hours to store historical data

### Client-Side Failsafe Pattern

```javascript
const MAIN_API = "https://cryptocurrency.cv";
const FAILSAFE = "https://nirholas.github.io/cryptocurrency.cv";

async function getNews() {
  try {
    // Try main API first (5s timeout)
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 5000);

    const res = await fetch(`${MAIN_API}/api/news`, {
      signal: controller.signal,
    });
    if (res.ok) return res.json();
    throw new Error("API error");
  } catch {
    // Fallback to GitHub Pages cache
    const res = await fetch(`${FAILSAFE}/cache/latest.json`);
    return res.json();
  }
}
```

---

## 🔍 Original Source Finder

Track where news originated before being picked up by aggregators:

```bash
# Find original sources for recent news
curl "https://cryptocurrency.cv/api/origins?limit=20"

# Filter by source type
curl "https://cryptocurrency.cv/api/origins?source_type=government"

# Search specific topic
curl "https://cryptocurrency.cv/api/origins?q=SEC"
```

Source types: `official`, `press-release`, `social`, `blog`, `government`

Identifies sources like SEC, Federal Reserve, Binance, Coinbase, Vitalik Buterin, X/Twitter, etc.

---

## 🔔 Web Push Notifications

Subscribe to real-time push notifications:

```javascript
// Get VAPID public key
const { publicKey } = await fetch(
  "https://cryptocurrency.cv/api/push",
).then((r) => r.json());

// Register subscription
await fetch("https://cryptocurrency.cv/api/push", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    subscription: pushSubscription,
    topics: ["bitcoin", "breaking", "defi"],
  }),
});
```

---

## 🎨 Embeddable Widgets

### News Ticker

```html
<div id="crypto-ticker" class="crypto-ticker" data-auto-init>
  <div class="crypto-ticker-label">📰 CRYPTO</div>
  <div class="crypto-ticker-track"></div>
</div>
<script src="https://nirholas.github.io/cryptocurrency.cv/widget/ticker.js"></script>
```

### News Carousel

```html
<div id="crypto-carousel" class="crypto-carousel" data-auto-init>
  <div class="crypto-carousel-viewport">
    <div class="crypto-carousel-track"></div>
  </div>
</div>
<script src="https://nirholas.github.io/cryptocurrency.cv/widget/carousel.js"></script>
```

See full widget examples in [`/widget`](../../widget)

