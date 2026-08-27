# Prompt 32: On-Chain Data Integration

## Context

The About page roadmap (`src/app/[locale]/about/page.tsx`) lists "On-Chain Data Integration" as "Planned" (`done: false`). The codebase has API route stubs and types for on-chain events (`src/app/api/onchain/events/route.ts`) with static/generated data, but no real on-chain data fetching from blockchain RPCs or indexers. The AI Sentiment Engine is also listed as "In Progress".

## Current State

```
src/app/api/onchain/events/route.ts      ← Generates synthetic on-chain events, no real data
src/app/[locale]/about/page.tsx          ← "On-Chain Data Integration" = Planned, "AI Sentiment" = In Progress
src/lib/protocol-health.ts               ← Protocol health scoring with hardcoded audit data
src/lib/providers/                       ← Provider framework with circuit breakers (only market-price implemented)
```

## Task

### Phase 1: On-Chain Data Providers

1. **Create `src/lib/providers/adapters/onchain-eth/`** — Ethereum on-chain data

```
adapters/onchain-eth/
├── etherscan.adapter.ts      ← Gas tracker, token transfers, contract events
├── alchemy.adapter.ts        ← Enhanced API (NFT, token balances, traces)
├── mempool.adapter.ts        ← Pending transactions (Bitcoin mempool.space)
└── index.ts
```

```typescript
// etherscan.adapter.ts
// Free tier: 5 calls/sec, no key needed for basic endpoints
// Endpoints:
//   GET https://api.etherscan.io/api?module=gastracker&action=gasoracle
//   GET https://api.etherscan.io/api?module=account&action=txlist&address=...
//   GET https://api.etherscan.io/api?module=stats&action=ethsupply
```

2. **Create `src/lib/providers/adapters/onchain-whale/`** — Whale alert data

```typescript
// Use Whale Alert API (free tier: 10 calls/min)
// GET https://api.whale-alert.io/v1/transactions?min_value=500000
// Also aggregate from Etherscan large transfers
```

3. **Create `src/lib/providers/adapters/onchain-defi/`** — DeFi TVL + protocol data

```typescript
// DefiLlama (no key required):
//   GET https://api.llama.fi/v2/protocols         — All protocols + TVL
//   GET https://api.llama.fi/v2/chains             — TVL by chain
//   GET https://api.llama.fi/v2/historicalChainTvl — Historical TVL
//   GET https://yields.llama.fi/pools              — Yield data
```

### Phase 2: Real On-Chain Events Route

4. **Rewrite `src/app/api/onchain/events/route.ts`** — Replace synthetic data with real on-chain events

```typescript
// Pull from multiple sources:
// 1. Large token transfers from Etherscan (>$100k)
// 2. Smart contract deployments
// 3. Bridge transactions
// 4. Governance votes (Snapshot API)
// 5. Token burns/mints

// Merge, deduplicate, score by significance
// Cache aggressively (30s for recent, 5min for historical)
```

5. **Create `src/app/api/onchain/whale-alerts/route.ts`** — Dedicated whale tracking

```
GET /api/onchain/whale-alerts?chain=ethereum&min_value=1000000&limit=20
Response: { alerts: WhaleAlert[], summary: { totalValue, avgSize, topSenders, topReceivers } }
```

6. **Create `src/app/api/onchain/gas/route.ts`** — Multi-chain gas tracker

```
GET /api/onchain/gas?chains=ethereum,polygon,arbitrum
Response: { ethereum: { slow, standard, fast, baseFee }, polygon: { ... }, ... }
```

7. **Create `src/app/api/onchain/tvl/route.ts`** — Protocol TVL rankings

```
GET /api/onchain/tvl?chain=ethereum&limit=20&sort=tvl
Response: { protocols: [...], totalTvl, change24h }
```

### Phase 3: On-Chain Dashboard Page

8. **Create `src/app/[locale]/onchain/page.tsx`** — On-Chain Analytics dashboard

```
Layout:
- Gas prices (multi-chain cards)
- Whale alerts feed (real-time)
- Top DeFi protocols by TVL (sortable table)
- Bridge volume chart
- Token supply changes (burn/mint events)
- Network stats (active addresses, tx count)
```

### Phase 4: AI Sentiment Engine Completion

9. **Update `src/lib/ai-services.ts`** — Complete the AI sentiment analysis:
   - Ensure `/api/sentiment` returns real AI-analyzed sentiment (not just keyword matching)
   - Wire to Groq/OpenAI for actual NLP analysis of news headlines
   - Add confidence scores and key driver extraction

10. **Update about page roadmap**:
    - `{ label: "In Progress", title: "AI Sentiment & Summary Engine", done: false }` → `{ label: "Launched", title: "AI Sentiment & Summary Engine", done: true }`
    - `{ label: "Planned", title: "On-Chain Data Integration", done: false }` → `{ label: "Launched", title: "On-Chain Data Integration", done: true }`

### Phase 5: Tests

11. **Create `src/lib/providers/adapters/onchain-eth/__tests__/etherscan.test.ts`**
12. **Create `src/lib/providers/adapters/onchain-defi/__tests__/defillama.test.ts`**
13. **Create `src/app/api/onchain/__tests__/events.test.ts`**

## Environment Variables

```bash
# Optional - works without keys using free tiers
ETHERSCAN_API_KEY=...            # Optional, higher rate limits
WHALE_ALERT_API_KEY=...          # Optional, higher rate limits
ALCHEMY_API_KEY=...              # Optional, enhanced data
```

## Acceptance Criteria

- [ ] On-chain events route returns real blockchain data (not synthetic)
- [ ] Whale alerts show actual large transfers with source attribution
- [ ] Gas tracker shows real-time gas prices for ETH + L2s
- [ ] DeFi TVL data pulled from DefiLlama
- [ ] On-chain dashboard page renders all sections
- [ ] About page roadmap entries updated to "Launched"
- [ ] All providers use the circuit breaker framework
- [ ] All tests pass
