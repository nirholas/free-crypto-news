---
name: market-sentiment
description: Synthesize crypto market sentiment by combining the Fear & Greed index, trending coins, narrative momentum, whale activity, and on-chain signals into a single actionable market read. Use when the user wants to know if the market is bullish, bearish, or transitioning. Powered by the free-crypto-news API.
license: MIT
metadata:
  category: analysis
  difficulty: intermediate
  author: free-crypto-news
  tags: [sentiment, fear-greed, trending, narratives, market, signals, onchain]
---

# Market Sentiment Analysis

## When to use this skill

Use when the user asks about:
- Is now a good time to buy or sell?
- What is current market sentiment?
- Is the market fearful or greedy?
- What are whales doing right now?
- Is there a narrative shift happening?
- What signals are flashing in the market today?

## Data Sources

All endpoints free, no authentication required.

| Endpoint | Purpose |
|----------|---------|
| `GET https://cryptocurrency.cv/api/fear-greed` | Fear & Greed index + trend |
| `GET https://cryptocurrency.cv/api/trending` | Coins trending in news volume |
| `GET https://cryptocurrency.cv/api/narratives` | Market narratives and sentiment |
| `GET https://cryptocurrency.cv/api/signals` | Trading signals and market indicators |
| `GET https://cryptocurrency.cv/api/whales` | Recent large wallet movements |
| `GET https://cryptocurrency.cv/api/ai/agent` | Full market intelligence summary |

## Sentiment Framework

### 1. Fear & Greed Index Interpretation

Fetch from `/api/fear-greed`. Interpret the score:

| Score | Label | Interpretation |
|-------|-------|----------------|
| 0–24 | Extreme Fear | Historically a long-term accumulation zone — crowd is capitulating |
| 25–49 | Fear | Caution warranted; opportunities may exist for patient buyers |
| 50 | Neutral | Market balanced; no strong edge in either direction |
| 51–74 | Greed | Optimism building; consider trimming winners |
| 75–100 | Extreme Greed | Euphoria; historically precedes corrections |

**Trend matters more than the current number**: A rising score from 20→40 is more bullish than a flat score at 55. Note the 7d and 30d direction.

### 2. Narrative Sentiment Layer

Fetch from `/api/narratives`:
- **Dominant narrative**: What single theme is receiving the most coverage?
- **Narrative sentiment**: Are the top narratives bullish, bearish, or mixed?
- **Emerging narratives**: Topics gaining momentum — early signals of the next rotation
- **Fading narratives**: Topics losing steam — potential exit signals for related assets

Narrative lifecycle: New → Growing → Peak → Declining → Dead

When a narrative is at Peak coverage, the easy money is often already gone.

### 3. Trending Coins Signal

Fetch from `/api/trending`:
- **Positive attention**: Coins trending due to upgrades, adoption, or positive fundamentals
- **Negative attention**: Coins trending due to hacks, controversy, or regulatory issues
- **Sector clustering**: Are trending coins from the same sector? (signals rotation)
- **Volume vs narrative**: Is price action confirming the news attention?

Divergence signal: A coin trending heavily in news but not moving in price often precedes a large move.

### 4. Whale Activity Analysis

Fetch from `/api/whales`:
- **Exchange inflows**: Large wallets sending to exchanges = potential sell pressure
- **Exchange outflows**: Large wallets withdrawing from exchanges = accumulation
- **Smart money wallets**: Are wallets with a track record of early entry accumulating?
- **Concentration changes**: Is supply becoming more or less concentrated?

Interpretation guide:
- Sustained exchange outflows + flat price = coiled spring (bullish)
- Sustained exchange inflows + rising price = distribution phase (caution)

### 5. Trading Signals

Fetch from `/api/signals`:
- Review active buy/sell signals with confidence scores
- Note consensus vs divergence across signals — agreement = higher confidence
- Check signal age: signals older than 24h have diminishing relevance
- Check which coins have the most signals firing simultaneously

### 6. Full Intelligence Synthesis

Fetch from `/api/ai/agent?format=summary` for a pre-synthesized summary:
- `regime`: accumulation / markup / distribution / markdown / ranging
- `fearGreedIndex`: current number
- `volatilityRegime`: low / medium / high
- `dominantNarrative`: leading market theme

Use this as a quick calibration, then apply your own judgment from the individual signal layers.

### 7. Contrarian Framework

Extreme readings are often the most actionable:
- When Fear & Greed > 85 AND social volume is spiking: trim exposure, not a buy signal
- When Fear & Greed < 20 AND whale outflows are positive: high conviction accumulation zone
- When narratives are uniformly bullish across all categories: healthy skepticism warranted
- When nobody is talking about a sector: potential early entry opportunity

**The crowd is right in the middle of a trend, and wrong at the extremes.**

### 8. Output Format

---

**Market Sentiment Snapshot — [Date]**

**Fear & Greed**: [score] — [label] — [trend: ↑/↓/→]

**Market Regime**: [accumulation / markup / distribution / markdown / ranging]

**Narrative Signal**:
- Dominant: [narrative name] — [bullish/bearish/neutral]
- Rising: [narrative] — gaining momentum
- Fading: [narrative] — losing steam

**Whale Activity**: [Accumulating / Neutral / Distributing] — [supporting data point]

**Key Signals**: [top 2-3 signals firing, with direction]

**Contrarian Take**: [what the crowd might be getting wrong]

**Actionable Read**: [one clear, specific takeaway suited to the user's stated goals]

**Confidence**: High / Medium / Low — [based on signal agreement across layers]

---

## Notes for Agent Use

- Combine with `crypto-news-briefing` skill for a complete market picture
- For real-time monitoring, poll `/api/fear-greed` every hour
- The `/api/ai/agent` endpoint synthesizes multiple signals — use for quick reads
- Historical sentiment data available via the archive for backtesting context
