---
name: add-data-source
description: Step-by-step guide for adding a new data source provider to the free-crypto-news platform. Covers the full lifecycle from API evaluation to adapter implementation, testing, and registration. Use when integrating a new market data, on-chain, social, or news source.
license: MIT
metadata:
  category: development
  difficulty: intermediate
  author: free-crypto-news
  tags: [data-source, provider, adapter, api, integration, rss, on-chain, defi]
---

# Add Data Source

## When to use this skill

Use when:
- Adding a new API as a data provider (market prices, DeFi, on-chain, etc.)
- Adding a new RSS/Atom feed for news aggregation
- Evaluating whether a data source is worth integrating
- Migrating from ad-hoc API calls to the provider framework
- Troubleshooting a broken data source

## Data Source Categories

| Category | Directory | Existing Count | Interface |
|----------|-----------|---------------|-----------|
| Market Price | `src/lib/providers/adapters/market-price/` | 6 | `MarketPrice[]` |
| DeFi TVL | `src/lib/providers/adapters/tvl/` | 1 | `TvlData[]` |
| DeFi Yields | `src/lib/providers/adapters/defi-yields/` | 1 | `YieldPool[]` |
| Funding Rates | `src/lib/providers/adapters/funding-rate/` | 3 | `FundingRate[]` |
| Gas Fees | `src/lib/providers/adapters/gas/` | 2 | `GasPrice` |
| DEX Pairs | `src/lib/providers/adapters/dex/` | 2 | `DexPair[]` |
| Fear & Greed | `src/lib/providers/adapters/fear-greed/` | 2 | `FearGreedIndex` |
| On-Chain | `src/lib/providers/adapters/on-chain/` | 4 | `OnChainMetric[]` |
| Whale Alerts | `src/lib/providers/adapters/on-chain/` | 1 | `WhaleAlert[]` |
| News (RSS) | `src/lib/crypto-news.ts` | 130+ | Direct RSS |

## Step 1: Evaluate the Source

Before integrating, verify:

1. **Is it free?** Check rate limits on free tier. Minimum: 30 req/min or 10K req/month
2. **Is the API stable?** Check changelog, version history, deprecation warnings
3. **Is there documentation?** OpenAPI spec strongly preferred
4. **Does it overlap?** Check if we already cover this data via another provider
5. **What's the data quality?** Compare outputs against 2-3 known values
6. **Auth requirements?** No-auth > API key > OAuth. API key is acceptable

### Evaluation Scorecard

| Criteria | Weight | Score (1-5) |
|----------|--------|-------------|
| Free tier availability | 25% | |
| Data quality/accuracy | 25% | |
| Rate limit generosity | 15% | |
| Documentation quality | 15% | |
| Unique data (not duplication) | 10% | |
| Community/stability | 10% | |

**Minimum score to integrate: 3.0 weighted average**

## Step 2: Create the Adapter

### For API data sources

Create a new file: `src/lib/providers/adapters/{category}/{name}.adapter.ts`

```typescript
/**
 * {Name} Adapter — {Brief description}
 *
 * {One paragraph about the source, coverage, free tier details}
 * - Rate limit: {X} req/min
 * - API key: {required|optional|not needed}
 * - Docs: {URL}
 *
 * @module providers/adapters/{category}/{name}
 */

import type { DataProvider, FetchParams, RateLimitConfig } from '../../types';
// import the shared type for this category
import type { MarketPrice } from './coingecko.adapter'; // example

const API_BASE = 'https://api.example.com/v1';
const API_KEY = process.env.EXAMPLE_API_KEY ?? '';

const RATE_LIMIT: RateLimitConfig = {
  maxRequests: 60,
  windowMs: 60_000,
};

export const exampleAdapter: DataProvider<MarketPrice[]> = {
  name: 'example',
  description: 'Example API — {coverage description}',
  priority: 3, // lower = tried first
  weight: 0.2, // 0-1, higher = more trusted
  rateLimit: RATE_LIMIT,
  capabilities: ['market-price'], // match DataCategory

  async fetch(params: FetchParams): Promise<MarketPrice[]> {
    // 1. Build URL from params
    // 2. Call API with proper headers
    // 3. Validate response status
    // 4. Parse and normalize into shared type
    throw new Error('Not implemented');
  },

  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE}/ping`, {
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  },

  validate(data: MarketPrice[]): boolean {
    if (!Array.isArray(data) || data.length === 0) return false;
    return data.every(item => typeof item.currentPrice === 'number' && item.currentPrice > 0);
  },
};
```

### For RSS news sources

Add entry to `RSS_SOURCES` in `src/lib/crypto-news.ts`:

```typescript
example_source: {
  name: 'Example News',
  url: 'https://example.com/feed/',
  category: 'general', // general|bitcoin|defi|ethereum|nft|trading|research|security|layer2|mining|institutional|mainstream|altl1|stablecoin
},
```

And add tier in `src/lib/source-tiers.ts`:

```typescript
'example-news': {
  tier: 2, // 1=most credible, 3=least
  displayName: 'Example News',
  credibility: 0.7, // 0-1
  reputation: 0.6, // 0-1
},
```

## Step 3: Register in the Chain

Update `src/lib/providers/adapters/{category}/index.ts`:

```typescript
import { exampleAdapter } from './example.adapter';

// In the factory function:
chain.addProvider(exampleAdapter);
```

## Step 4: Test

Create test: `src/lib/providers/__tests__/{name}.test.ts`

```typescript
import { describe, it, expect, vi } from 'vitest';
import { exampleAdapter } from '../adapters/{category}/{name}.adapter';

describe('exampleAdapter', () => {
  it('should have correct metadata', () => {
    expect(exampleAdapter.name).toBe('example');
    expect(exampleAdapter.priority).toBeGreaterThan(0);
    expect(exampleAdapter.weight).toBeGreaterThan(0);
    expect(exampleAdapter.weight).toBeLessThanOrEqual(1);
  });

  it('should fetch data successfully', async () => {
    const data = await exampleAdapter.fetch({ limit: 5 });
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThan(0);
  });

  it('should pass validation', async () => {
    const data = await exampleAdapter.fetch({ limit: 5 });
    expect(exampleAdapter.validate?.(data)).toBe(true);
  });

  it('should pass health check', async () => {
    const healthy = await exampleAdapter.healthCheck?.();
    expect(healthy).toBe(true);
  });
});
```

## Step 5: Document

Add the new source to:
1. `docs/SOURCES.md` — human-readable source list
2. `README.md` — if it's a major addition
3. `CHANGELOG.md` — under the next version

## Priority Data Sources to Add

### Tier 1 — High Impact, Free APIs

| Source | Category | Free Tier | URL |
|--------|----------|-----------|-----|
| **Kraken** | Market Price | 1 req/s | https://docs.kraken.com/api/ |
| **KuCoin** | Market Price | 1800/min | https://docs.kucoin.com/ |
| **Hyperliquid** | Funding Rate | No limit | https://hyperliquid.gitbook.io/ |
| **1inch** | DEX | 1 req/s | https://portal.1inch.dev/ |
| **Owlracle** | Gas Fees | 300/mo | https://owlracle.info/docs |
| **Bitquery** | On-Chain | 10K pts/mo | https://graphql.bitquery.io/ |
| **Mirror.xyz** | News (RSS) | Free | `https://mirror.xyz/feed/atom` |

### Tier 2 — Requires API Key, But Worth It

| Source | Category | Free Tier | Sign Up URL |
|--------|----------|-----------|-------------|
| **LunarCrush** | Social | 300/day | https://lunarcrush.com/developers |
| **Santiment** | Social + On-Chain | Limited | https://app.santiment.net/ |
| **Glassnode** | On-Chain | Limited | https://glassnode.com/ |
| **Nansen** | Whale Alerts | Paid | https://www.nansen.ai/ |
| **Arkham Intelligence** | Whale Alerts | Research | https://platform.arkhamintelligence.com/ |
| **Token Terminal** | DeFi Metrics | Limited | https://tokenterminal.com/ |

## Notes for Agent Use

- Always normalize data into the shared type for that category
- Set priority number relative to existing adapters (don't reuse numbers)
- Weight should reflect data quality and coverage breadth
- Include graceful handling for missing API keys
- All adapters should have a 5s timeout on health checks
- Use AbortSignal.timeout() for all external fetches
