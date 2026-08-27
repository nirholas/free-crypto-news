---
name: historical-trend-analysis
description: Analyze historical cryptocurrency news patterns, market narratives, and past cycle behavior using the free-crypto-news archive to identify recurring patterns, validate current theses, and provide context for current market conditions. Use when the user wants to understand how crypto history might rhyme with today.
license: MIT
metadata:
  category: analysis
  difficulty: advanced
  author: free-crypto-news
  tags: [history, archive, trends, patterns, cycles, macro, backtesting]
---

# Historical Trend Analysis

## When to use this skill

Use when the user asks about:
- Has this happened before in crypto? What happened next?
- How did the market react to [type of event] historically?
- What did BTC do after the last halving?
- Show me the narrative timeline for [coin/sector]
- Is this cycle different from previous ones?
- What were people saying about [coin] in [year]?
- When was the last time sentiment was this low/high?

## Data Sources

All endpoints free, no authentication required.

| Endpoint | Purpose |
|----------|---------|
| `GET https://cryptocurrency.cv/api/archive` | Full historical news archive |
| `GET https://cryptocurrency.cv/api/archive?year={YYYY}` | Archive filtered to a specific year |
| `GET https://cryptocurrency.cv/api/archive?coin={SYMBOL}` | All historical coverage of a coin |
| `GET https://cryptocurrency.cv/api/archive?q={topic}` | Full-text search across all historical articles |
| `GET https://cryptocurrency.cv/api/market/history/{coinId}` | Historical price/market data |

Archive structure covers 2021–present with articles, market snapshots, on-chain data, social metrics, and narrative indexes.

Additional parameters:
- `from` / `to` — ISO date range filtering
- `limit` — number of results (up to 100 per call)
- `category` — filter by event category

## Analysis Framework

### 1. Define the Historical Question

Before querying, clarify what the user is actually asking:
- **Pattern match**: "Did X type of event ever happen before, and what followed?"
- **Narrative evolution**: "How did coverage of [coin/sector] change over time?"
- **Cycle positioning**: "Where are we in the current cycle vs historical cycles?"
- **Sentiment comparison**: "Was market sentiment ever this [fearful/greedy] before, and what happened?"
- **Event impact**: "How did the market react to [regulation type / hack / ETF / halving]?"

### 2. Historical Data Retrieval Strategy

Match the query type to the right archive call:

| Question Type | Best Endpoint |
|---------------|---------------|
| Past events on a specific coin | `/api/archive?coin={SYMBOL}&from={start}&to={end}` |
| Regulatory history | `/api/archive?q=regulation+SEC+ban&from=2021-01-01` |
| Hack/exploit history | `/api/archive?q=exploit+hack+rug+loss` |
| Halving narrative | `/api/archive?q=halving&coin=BTC` |
| DeFi summer patterns | `/api/archive?q=yield+farming&from=2020-05-01&to=2021-01-01` |
| Narrative emergence timing | `/api/archive?q={narrative}` sorted by date ascending |

For broad cycle analysis, batch calls by year:
1. Call `/api/archive?year=2021` — bull peak and crash
2. Call `/api/archive?year=2022` — bear market
3. Call `/api/archive?year=2023` — recovery and consolidation
4. Call `/api/archive?year=2024` — new cycle emergence
5. Call `/api/archive?year=2025` — current cycle data

### 3. Pattern Recognition

When analyzing historical data, look for:

**Narrative Cycles**:
- When did a narrative first appear in news coverage?
- How long did it take from first mention to mainstream peak coverage?
- What triggered the narrative to fade?
- What replaced it?

**Event Templates** (common patterns that repeat):
- *Pre-halving accumulation* → narrative builds 12 months before → price runs → post-halving sell-the-news
- *Regulatory FUD* → immediate sharp drop → gradual recovery if enforcement is limited
- *Protocol exploit* → immediate -20% to -80% → recovery depends on team response time and compensation
- *ETF speculation* → multi-month accumulation on rumor → volatility on approval/denial
- *Airdrop season* → usage spikes → mercenary capital departs → consolidation

**Sentiment Extremes**:
- Pull historical Fear & Greed data for comparable readings
- What was happening in the news when the index last hit this level?
- Did the market bottom/top within weeks of the extreme reading?

### 4. Cycle Positioning Analysis

Use price history + narrative timeline to identify cycle phase:

| Phase | Narrative Pattern | News Tone | Price Action |
|-------|------------------|-----------|--------------|
| Accumulation | Mostly negative, "crypto is dead" | Bearish, disinterested | Flat to slowly rising |
| Early markup | First positive narratives re-emerge | Cautiously optimistic | Steady uptrend, low attention |
| Acceleration | Dominant narrative forms | Bullish, mainstream coverage grows | Parabolic starts |
| Distribution | Euphoric narratives, everyone is bullish | Extreme greed, price targets escalating | Choppy at highs |
| Markdown | Narratives collapse, blame game | Panic, capitulation language | Sharp decline |
| Deep bear | No narrative, disillusionment | Silent, abandoned, "it's over" | Flat at lows, low volume |

Compare today's narrative tone to these historical phases to estimate positioning.

### 5. Coin-Specific History

For a specific coin, build a timeline:
1. First significant news coverage — what was the original narrative?
2. First major price milestone — what drove it?
3. Major inflection points (exploit, upgrade, regulatory event) — what happened to price?
4. Narrative evolution — has the thesis changed, and is the new thesis stronger or weaker?
5. Community evolution — is the developer/holder community growing or shrinking over time?

### 6. Contrarian Historical Insight

The most valuable historical patterns are the ones the crowd ignores:
- Most people remember the peaks and crashes — focus on what happened *between* them
- "This time is different" is almost always wrong — identify which historical pattern the current setup most resembles
- Projects that survived a full bear cycle typically emerged stronger — look for those that kept building
- Narratives that failed once often succeed on the second or third attempt (DeFi, NFTs, L2s all had false starts)

### 7. Output Format

---

**Historical Analysis: [Topic/Coin/Question]**

**Time Range Analyzed**: [start] to [end]

**Historical Parallels Found**:
1. [Date range] — [Similar situation] — [What followed]: [price/narrative outcome]
2. [Date range] — [Similar situation] — [What followed]

**Narrative Timeline** *(for coin or sector research)*:
- [Year-Month]: [Narrative emerged / peaked / faded]
- [Year-Month]: [Key event and its impact on coverage]

**Pattern Match**: [Current situation most resembles [historical period] based on [evidence]]

**Key Differences**: [What is different this time — this determines if the pattern holds]

**Historical Precedent**: [What happened after the most similar historical setup]

**Confidence in Analogy**: High / Medium / Low — [why]

**Actionable Insight**: [What the historical context suggests about current positioning or risk management]

---

## Notes for Agent Use

- The archive is the deepest data source — use it for due diligence, not just news consumption
- Combine with `coin-research` skill for a complete fundamental + historical picture
- For macro questions, combine archive news with `/api/market/history/{coinId}` price data
- When comparing cycle phases, use BTC as the baseline reference — altcoins typically lag BTC by weeks
- Historical patterns are probabilistic, not deterministic — present ranges of outcomes, not single predictions
