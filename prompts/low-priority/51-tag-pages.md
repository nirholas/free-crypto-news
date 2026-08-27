# Prompt 51: Tag Pages

## Context

Both CoinDesk (`/tag/[slug]`) and CoinTelegraph (`/tags/[topic]`) have dedicated tag pages that aggregate articles by topic. CoinTelegraph has prominent tag pages for Bitcoin, Ethereum, Blockchain, Altcoin, Regulation, Features, How-to, and Investigation. Tags create deep interlinking, improve SEO, and help users discover related content beyond simple category classification.

Tags differ from categories: categories are broad sections (Markets, Tech, Policy), while tags are specific topics (Bitcoin ETF, Solana DeFi, SEC, Staking, Layer 2). An article can have many tags but typically belongs to one category.

## Current State

```
src/app/[locale]/category/[slug]/page.tsx  ← Category pages exist
src/app/[locale]/search/page.tsx           ← Search (similar filtering)
src/app/api/article/route.ts              ← Article API (needs tag filter)
```

No tag pages, no tag index, no tag extraction exist.

## Task

### Phase 1: Tag Extraction & Normalization

1. **Create `src/lib/tags.ts`** — Tag extraction and management

```typescript
export interface Tag {
  slug: string;          // "bitcoin-etf"
  name: string;          // "Bitcoin ETF"
  articleCount: number;
  trending: boolean;     // Unusual spike in articles with this tag
  category?: string;     // Optional parent category grouping
  relatedTags: string[]; // Co-occurring tags
}

// Extract tags from:
// 1. RSS feed <category> elements
// 2. Article titles (entity extraction: coin names, companies, protocols)
// 3. Article content keywords
// Auto-generated popular tags:
const CURATED_TAGS = [
  // Assets
  "bitcoin", "ethereum", "solana", "xrp", "cardano", "polkadot", "avalanche",
  // Topics
  "defi", "nft", "layer-2", "staking", "stablecoins", "memecoins",
  // Industry
  "regulation", "sec", "etf", "institutional", "mining", "cbdc",
  // Events
  "halving", "merge", "airdrop", "hack", "exploit",
  // People & Companies
  "blackrock", "coinbase", "binance", "michael-saylor", "sec-lawsuit",
];

export function extractTags(article: Article): string[] { ... }
export function normalizeTag(raw: string): string { ... }
export function tagSlug(name: string): string { ... }
```

2. **Create `src/app/api/tags/route.ts`** — Tags listing API

```
GET /api/tags?limit=100&sort=popular|trending|alphabetical
Response: { tags: Tag[], total: number }
```

3. **Create `src/app/api/tags/[slug]/route.ts`** — Articles by tag

```
GET /api/tags/bitcoin-etf?limit=20&offset=0
Response: { tag: Tag, articles: Article[], total: number }
```

### Phase 2: Tag Pages

4. **Create `src/app/[locale]/tag/[slug]/page.tsx`** — Individual tag page

```
Layout:
┌──────────────────────────────────────────────────────┐
│  🏷️ #Bitcoin ETF                                     │
│  342 articles • Trending 🔥                          │
│                                                      │
│  Related tags: [SEC] [Institutional] [BlackRock]     │
│               [Bitcoin] [Regulation]                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Sort: [Latest] [Most Read]                          │
│                                                      │
│  Articles tagged "Bitcoin ETF"                       │
│  ├── Article card                                   │
│  ├── Article card                                   │
│  ├── Article card                                   │
│  └── Load more...                                   │
│                                                      │
│  Sidebar: Tag activity chart (articles/day)          │
└──────────────────────────────────────────────────────┘
```

5. **Create `src/app/[locale]/tags/page.tsx`** — Tags directory / tag cloud

```
Layout:
┌──────────────────────────────────────────────────────┐
│  🏷️ Topics                                           │
│  Browse all topics and trending tags                 │
│                                                      │
│  🔥 Trending Now                                     │
│  [Bitcoin ETF ↑320%] [SEC Ruling ↑180%] [L2 ↑90%]  │
│                                                      │
│  Search: [_______________]                           │
│                                                      │
│  Popular Tags (tag cloud with sized text)            │
│  Bitcoin  Ethereum  DeFi  Regulation  NFT            │
│  Solana  Layer-2  Staking  Mining  ETF               │
│  ...                                                 │
│                                                      │
│  All Tags A-Z                                        │
│  A: Aave, Airdrop, Altcoins, Avalanche              │
│  B: Binance, Bitcoin, BlackRock, Bridge              │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

### Phase 3: Integration

6. **Add tag chips to `NewsCard.tsx`** — Show 2-3 tag pills on each article card, linking to tag pages
7. **Add tag section to article detail page** — Below article, show all tags as clickable links
8. **Add "Topics" to main navigation** in `src/components/Header.tsx`
9. **Generate tag sitemaps** — Dynamic sitemap entries for all tags with 10+ articles

## Files to Create

- `src/lib/tags.ts`
- `src/app/api/tags/route.ts`
- `src/app/api/tags/[slug]/route.ts`
- `src/app/[locale]/tag/[slug]/page.tsx`
- `src/app/[locale]/tags/page.tsx`
- `src/components/TagChip.tsx`

## Files to Modify

- `src/components/NewsCard.tsx` — Add tag chips
- `src/components/Header.tsx` — Add Topics nav link
- `messages/en.json` — Add tag page i18n strings
- `src/app/sitemap.ts` — Add tag pages to sitemap

## Acceptance Criteria

- [ ] `/tags` directory displays tag cloud and trending tags
- [ ] `/tag/[slug]` shows all articles for that tag
- [ ] Tags are extracted from RSS feed categories and article metadata
- [ ] Trending tags detected by article volume spikes
- [ ] Related tags shown on individual tag pages
- [ ] Tag chips displayed on article cards and detail pages
- [ ] Tags are clickable links everywhere they appear
- [ ] Tag pages included in sitemap
- [ ] SEO: unique meta descriptions per tag, structured data
- [ ] Responsive layout with tag cloud adapting to screen size
