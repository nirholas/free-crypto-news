---
name: coin-research
description: Conduct comprehensive research on any cryptocurrency by pulling coin-specific news, market data, on-chain metrics, trading signals, and sentiment into a structured investment brief. Use when the user wants to understand a specific coin before making a decision. Powered by the free-crypto-news API.
license: MIT
metadata:
  category: analysis
  difficulty: intermediate
  author: free-crypto-news
  tags: [research, analysis, due-diligence, fundamentals, coin, token, market-data]
---

# Coin Research

## When to use this skill

Use when the user asks about:
- Tell me about [COIN] — is it worth buying?
- What's the latest news on [COIN]?
- What are analysts saying about [COIN]?
- Research [COIN] for me
- What's driving [COIN]'s price action?
- Compare [COIN] to its competitors

## Data Sources

All endpoints free, no authentication required.

| Endpoint | Purpose |
|----------|---------|
| `GET https://cryptocurrency.cv/api/news?coin={SYMBOL}` | Coin-specific news |
| `GET https://cryptocurrency.cv/api/market/coins?ids={coinId}` | Price, market cap, volume, metrics |
| `GET https://cryptocurrency.cv/api/market/ohlc/{coinId}` | OHLC candlestick data |
| `GET https://cryptocurrency.cv/api/signals?coin={SYMBOL}` | Trading signals for the coin |
| `GET https://cryptocurrency.cv/api/compare?coins={A},{B}` | Side-by-side market comparison |
| `GET https://cryptocurrency.cv/api/search?q={SYMBOL}` | Search all articles mentioning the coin |
| `GET https://cryptocurrency.cv/api/archive?coin={SYMBOL}` | Historical news archive |

## Research Framework

### 1. News Intelligence (Most Recent)

Fetch `/api/news?coin={SYMBOL}&limit=15`:
- **Catalyst identification**: What events are driving recent coverage?
- **Source quality**: Tier-1 outlets (Reuters, Bloomberg, CoinDesk) vs blogs vs social aggregation
- **Sentiment direction**: Is coverage net positive, negative, or mixed?
- **Velocity**: Is news volume increasing or decreasing vs the prior 7 days?
- **Recency cliff**: Anything breaking in the last 24 hours?

Key question: *Is the news narrative ahead of or behind the price move?*

### 2. Market Data Overview

Fetch `/api/market/coins?ids={coinId}`:

Analyze:
- **Price performance**: 1h, 24h, 7d, 30d returns
- **Market cap rank**: Where does this coin sit in the pecking order?
- **Volume/Market Cap ratio**: Above 0.1 = healthy; below 0.01 = illiquid
- **ATH distance**: How far from all-time high? (Context for recovery potential)
- **ATL distance**: How far from all-time low? (Downside reference)
- **Fully Diluted Valuation**: FDV vs current market cap — high FDV/MC ratio means heavy future dilution

### 3. Price Structure

Fetch `/api/market/ohlc/{coinId}`:
- **Trend direction**: Is the coin in an uptrend, downtrend, or range?
- **Recent support/resistance**: Key price levels to watch
- **Volume confirmation**: Are price moves accompanied by volume?
- **Volatility**: High volatility = higher risk/reward, requires smaller position sizing

### 4. Trading Signals

Fetch `/api/signals?coin={SYMBOL}`:
- What signals are currently active for this coin?
- Are signals aligned (all buy / all sell) or diverging?
- What is the confidence level of the highest-conviction signal?
- How many signals have fired vs resolved in the last 30 days?

### 5. Sentiment and Narrative Context

Cross-reference with market-wide narrative data:
- Is this coin part of a currently-dominant narrative? (RWA, AI, L2, DeFi, etc.)
- Is narrative attention peaking, growing, or fading for this coin's sector?
- What is the community sentiment — are holders confident or nervous?

### 6. Competitive Position

Fetch `/api/compare?coins={SYMBOL},{COMPETITOR1},{COMPETITOR2}`:

Compare across:
- Market cap and ranking within the category
- 30-day price performance (relative strength)
- Volume trends
- News coverage volume (proxy for community attention)

Answer: *Is this coin gaining or losing market share within its category?*

### 7. Historical Context

Fetch `/api/archive?coin={SYMBOL}&limit=20` for older articles:
- What was the narrative 3 months ago vs now?
- Has the team consistently delivered on past announcements?
- What previous catalysts drove major price moves?
- Are there recurring patterns (e.g., pump before unlock, dump after listing)?

### 8. Risk Factors Checklist

Before forming a view, verify these red flags:
- [ ] Any upcoming token unlocks that could create sell pressure?
- [ ] Any unresolved security incidents, bugs, or exploits in recent news?
- [ ] Any regulatory scrutiny specific to this coin or its category?
- [ ] Is development active? (Look for GitHub activity references in news)
- [ ] Any team drama, departures, or governance disputes?
- [ ] Has the project missed major roadmap milestones?

### 9. Output Format

---

**Coin Brief: [NAME] ([SYMBOL])**

**Price**: $[price] | 24h: [%] | 7d: [%] | Market Cap: $[cap] (Rank #[rank])

**News Signal**: [Bullish / Bearish / Mixed] — [1-sentence summary of recent coverage]
- Key catalyst: [most important recent news item]
- Source quality: [Tier 1 / Mixed / Low quality]

**Market Structure**: [Uptrend / Downtrend / Range] — [brief note on price level context]

**Signals**: [Count] active — [direction consensus: Buy / Sell / Mixed]

**Narrative**: [Which market narrative this coin belongs to] — [Rising / Peak / Fading]

**Competitive Position**: [Gaining ground / Holding / Losing ground vs category peers]

**Key Risks**:
1. [Risk 1]
2. [Risk 2]

**Summary Thesis**: [2–3 sentences capturing the bull case, bear case, and current balance]

**Suggested next step**: [Research further / Monitor / Consider small position / High conviction / Avoid]

---

## Notes for Agent Use

- Always use the uppercase ticker symbol for `coin` parameter (BTC not btc)
- For unlisted or very new tokens, fall back to `/api/search?q={name}` for news
- Combine with `market-sentiment` skill for market-wide context before forming a coin view
- Use `historical-trend-analysis` skill to understand how similar past setups resolved
