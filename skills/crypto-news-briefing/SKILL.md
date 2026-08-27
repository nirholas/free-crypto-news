---
name: crypto-news-briefing
description: Fetch and synthesize the latest cryptocurrency news from 130+ sources into a structured intelligence briefing. Use when the user wants a market overview, breaking news digest, or daily crypto update. Powered by the free-crypto-news API (no key required).
license: MIT
metadata:
  category: news
  difficulty: beginner
  author: free-crypto-news
  tags: [news, briefing, market, crypto, summary, breaking, rss]
---

# Crypto News Briefing

## When to use this skill

Use when the user asks about:
- What's happening in crypto today / this week
- Latest news on Bitcoin, Ethereum, Solana, or any altcoin
- Breaking news or market-moving events
- A structured summary of the crypto news cycle
- What narratives are currently driving the market

## Data Sources

All data comes from the Free Crypto News API — no authentication required.

| Endpoint | Purpose |
|----------|---------|
| `GET https://cryptocurrency.cv/api/news` | Latest articles across all coins |
| `GET https://cryptocurrency.cv/api/news?coin={SYMBOL}` | News filtered to a specific coin |
| `GET https://cryptocurrency.cv/api/breaking` | Breaking/urgent news only |
| `GET https://cryptocurrency.cv/api/narratives` | Trending narratives driving the market |
| `GET https://cryptocurrency.cv/api/trending` | Top trending coins by news volume |

Key parameters for `/api/news`:
- `limit` — number of articles (1–100, default 20)
- `coin` — filter by coin symbol (BTC, ETH, SOL, etc.)
- `category` — filter by category
- `lang` — language code for localized results

## Briefing Framework

### 1. Data Retrieval

Fetch in this order:
1. Call `/api/breaking` first — if anything is breaking, lead with it
2. Call `/api/news?limit=20` for the broader news cycle
3. Call `/api/narratives` to understand the dominant themes
4. Call `/api/trending` to see which coins are getting attention

### 2. Impact Triage

Categorize each story by market significance:

**Tier 1 — Market-Moving** (report immediately):
- Regulatory decisions or enforcement actions
- Protocol exploits, hacks, or security failures (> $5M)
- Major exchange events (insolvency, halted withdrawals, new listings)
- Central bank or macro data releases affecting risk assets
- ETF approvals, denials, or fund flow data

**Tier 2 — Notable** (include in briefing):
- Protocol upgrades, mainnet launches, or hard forks
- Significant funding rounds or acquisitions
- Token unlock events or large OTC block trades
- Governance proposals with material outcomes
- Major partnership announcements from credible sources

**Tier 3 — Background** (optional color):
- Conference announcements and speaking appearances
- Minor integrations or ecosystem updates
- Community milestones
- Research papers or developer tooling releases

### 3. Narrative Layer

Use `/api/narratives` to contextualize the news cycle:
- **Dominant narrative**: What single theme is driving the most coverage?
- **Rising narratives**: Topics gaining momentum this week vs last week
- **Fading narratives**: Topics that peaked and are declining in coverage
- **Narrative sentiment**: Are driving narratives bullish, bearish, or mixed?

Narrative examples to watch for: "BTC ETF flows", "ETH L2 season", "AI x crypto", "real-world assets (RWA)", "stablecoin regulation", "halving cycle".

### 4. Signal vs Noise Filtering

Apply these filters before including a story:
- **Verify the source**: Is this an official announcement, on-chain data, or unverified reporting?
- **Check recency**: News older than 48 hours is context, not breaking
- **Watch for recycled narratives**: Influencer speculation dressed as news
- **Price prediction filter**: Remove content that is purely speculative price targeting without data
- **Contrarian check**: Is the market overreacting or underreacting? Note when coverage sentiment diverges from price action

### 5. Coin-Specific Drill-Down

When the user mentions a specific coin, call `/api/news?coin={SYMBOL}&limit=10`:
- Lead with the most recent article
- Note the source quality (tier-1 outlet vs anonymous blog)
- Identify any direct catalysts for recent price moves
- Flag upcoming events (unlocks, upgrades, governance votes)

### 6. Trending Coins Context

From `/api/trending`:
- Which coins are spiking in news coverage right now?
- Is the attention positive (bullish catalysts) or negative (controversy, exploit)?
- Are trending coins correlated (sector rotation) or unrelated (random pumps)?

### 7. Output Format

Structure the briefing as follows:

---

**Crypto Briefing — [Date]**

**Breaking** *(if applicable)*:
- [Story] — [source] — [impact: high/medium]

**Top Stories**:
1. [Headline] — [affected assets] — [impact tier]
2. [Headline] — [affected assets] — [impact tier]
3. [Headline] — [affected assets] — [impact tier]

**Dominant Narrative**: [one sentence]

**Trending Coins**: [coin1], [coin2], [coin3] — [brief reason]

**Sector Summary**:
- BTC/Macro: [one line]
- ETH/L2: [one line]
- DeFi: [one line]
- Regulatory: [one line]

**Action Items**: [any time-sensitive items the user should know about]

---

## Notes for Agent Use

- This API is free with no rate limits for reasonable use
- RSS feeds available at `https://cryptocurrency.cv/rss` for real-time streaming
- For LLM context windows, use `limit=5` for summaries and `limit=20` for deep analysis
- Historical archive available at `https://cryptocurrency.cv/api/archive` for trend research
