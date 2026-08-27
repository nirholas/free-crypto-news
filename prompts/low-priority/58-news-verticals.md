# Prompt 58: News Verticals (Business, Tech, Web3 Sections)

## Context

CoinDesk splits its news coverage into distinct verticals/sections, each with its own landing page and editorial focus:
- `/business` — Corporate news, M&A, funding rounds, institutional adoption
- `/tech` — Protocol development, infrastructure, developer tools, upgrades
- `/web3` — Decentralized apps, social, gaming, metaverse, identity
- `/policy` — Regulation, government actions, legal cases, compliance (we have `/regulation` already)
- `/markets` — Price action, trading, analysis (we have this already)
- `/focus` — Deep dives and special features

CoinTelegraph has similar depth via categories: `/category/adoption`, `/category/technology`, `/category/fintech`, `/category/features`, `/category/in-depth`.

Our project has `/markets` and `/regulation` but lacks dedicated sections for Business, Tech, and Web3 news — lumping everything else into a generic feed. Splitting into verticals improves navigation, SEO, and positions the site as comprehensive rather than surface-level.

## Current State

```
src/app/[locale]/category/[slug]/page.tsx  ← Generic category page exists
src/app/[locale]/markets/page.tsx          ← Markets section exists
src/app/[locale]/regulation/page.tsx       ← Regulation section exists
src/lib/sources.ts                          ← Source definitions with categories
src/app/api/article/route.ts              ← Article API with category filter
```

## Task

### Phase 1: Define News Verticals

1. **Create `src/lib/verticals.ts`** — News vertical definitions

```typescript
export interface NewsVertical {
  slug: string;
  name: string;
  description: string;
  icon: string;         // Lucide icon name
  color: string;        // Brand color
  subcategories: string[];
  keywords: string[];   // For auto-categorization
  feedTitle: string;    // RSS feed title
}

export const NEWS_VERTICALS: NewsVertical[] = [
  {
    slug: "business",
    name: "Business",
    description: "Corporate crypto news, funding rounds, M&A, institutional adoption, and industry partnerships.",
    icon: "Building2",
    color: "#3B82F6",
    subcategories: ["funding", "m-and-a", "institutional", "adoption", "partnerships"],
    keywords: [
      "funding", "raised", "series a", "series b", "acquisition", "acquired",
      "merger", "partnership", "institutional", "enterprise", "corporate",
      "IPO", "valuation", "revenue", "quarterly", "earnings", "BlackRock",
      "Fidelity", "Goldman", "JPMorgan", "bank", "hedge fund",
    ],
    feedTitle: "Crypto Business News",
  },
  {
    slug: "tech",
    name: "Technology",
    description: "Protocol upgrades, infrastructure development, developer tools, scaling solutions, and technical analysis.",
    icon: "Code",
    color: "#8B5CF6",
    subcategories: ["protocols", "infrastructure", "developer-tools", "upgrades", "security"],
    keywords: [
      "upgrade", "fork", "protocol", "consensus", "EIP", "BIP",
      "developer", "SDK", "API", "smart contract", "audit",
      "vulnerability", "patch", "testnet", "mainnet", "deploy",
      "Solidity", "Rust", "Move", "compiler", "node", "client",
      "validator", "sequencer", "rollup", "ZK", "proof",
    ],
    feedTitle: "Crypto Tech News",
  },
  {
    slug: "web3",
    name: "Web3",
    description: "Decentralized applications, social platforms, gaming, metaverse, digital identity, and the decentralized internet.",
    icon: "Globe",
    color: "#EC4899",
    subcategories: ["dapps", "social", "gaming", "metaverse", "identity", "creator-economy"],
    keywords: [
      "dapp", "decentralized app", "web3", "metaverse", "gaming",
      "play-to-earn", "GameFi", "SocialFi", "Farcaster", "Lens",
      "ENS", "identity", "DID", "credential", "NFT marketplace",
      "creator", "content", "social token", "community",
    ],
    feedTitle: "Web3 News",
  },
  {
    slug: "defi-news",
    name: "DeFi",
    description: "Decentralized finance news: protocol updates, yield opportunities, TVL changes, governance, and security incidents.",
    icon: "Layers",
    color: "#14B8A6",
    subcategories: ["lending", "dex", "yields", "governance", "hacks"],
    keywords: [
      "DeFi", "TVL", "yield", "lending", "borrowing", "liquidity",
      "AMM", "DEX", "Uniswap", "Aave", "Compound", "MakerDAO",
      "Curve", "Lido", "staking", "restaking", "EigenLayer",
      "flash loan", "exploit", "hack", "governance", "proposal",
    ],
    feedTitle: "DeFi News",
  },
];
```

### Phase 2: Article Classification

2. **Create `src/lib/article-classifier.ts`** — Auto-classify articles into verticals

```typescript
// Classify each incoming article into 0+ verticals based on:
// 1. Source feed URL path (e.g. coindesk.com/business/ → "business")
// 2. RSS category tags
// 3. Keyword matching against title and description
// 4. Source-level defaults (some sources are always "tech", etc.)

export function classifyArticle(article: Article): string[] {
  const verticals: string[] = [];
  
  // Check URL path against known patterns
  for (const vertical of NEWS_VERTICALS) {
    // Path-based classification
    if (matchesVerticalPath(article.url, vertical.slug)) {
      verticals.push(vertical.slug);
      continue;
    }
    
    // Keyword-based classification (title + description)
    const text = `${article.title} ${article.description}`.toLowerCase();
    const matchCount = vertical.keywords.filter(k => text.includes(k.toLowerCase())).length;
    if (matchCount >= 2) {
      verticals.push(vertical.slug);
    }
  }
  
  return verticals.length > 0 ? verticals : ["general"];
}
```

### Phase 3: Vertical Landing Pages

3. **Create `src/app/[locale]/business/page.tsx`** — Business news vertical

```
Layout:
┌──────────────────────────────────────────────────────┐
│  🏢 Business                                         │
│  Corporate crypto: funding, M&A, institutional       │
│  adoption, and industry partnerships.                │
│                                                      │
│  Sub: [All] [Funding] [M&A] [Institutional]         │
│       [Adoption] [Partnerships]                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Featured Story (latest, hero card)                  │
│                                                      │
│  Latest Business News                                │
│  ├── Article card with BUSINESS badge               │
│  ├── Article card                                   │
│  └── Load more...                                   │
│                                                      │
│  Sidebar:                                            │
│  - Trending in Business (top 5 stories)              │
│  - Related: Markets | Regulation                     │
└──────────────────────────────────────────────────────┘
```

4. **Create `src/app/[locale]/tech/page.tsx`** — Technology vertical (same layout pattern)

5. **Create `src/app/[locale]/web3/page.tsx`** — Web3 vertical (same layout pattern)

6. **Create `src/app/[locale]/defi-news/page.tsx`** — DeFi news vertical (same layout pattern, complements the existing `/defi` data dashboard)

### Phase 4: Shared Vertical Page Component

7. **Create `src/components/VerticalPage.tsx`** — Reusable vertical landing page component

```typescript
interface VerticalPageProps {
  vertical: NewsVertical;
  articles: Article[];
  subcategory?: string;
  total: number;
}

// DRY: All 4 vertical pages use this shared component
// Just pass in the vertical config and articles
```

### Phase 5: Navigation & Integration

8. **Update main navigation** in `src/components/Header.tsx`

```
Nav structure:
[News ▾]          [Markets]   [Learn]   [Tools ▾]
 ├── Latest
 ├── Business
 ├── Technology
 ├── Web3
 ├── DeFi
 ├── Regulation (existing)
 └── Opinion
```

9. **Add vertical badges to article cards** — Show "BUSINESS" / "TECH" / "WEB3" / "DEFI" badges
10. **Per-vertical RSS feeds** — `/api/rss?vertical=business`, etc.
11. **Add vertical pages to sitemap**

## Files to Create

- `src/lib/verticals.ts`
- `src/lib/article-classifier.ts`
- `src/components/VerticalPage.tsx`
- `src/app/[locale]/business/page.tsx`
- `src/app/[locale]/tech/page.tsx`
- `src/app/[locale]/web3/page.tsx`
- `src/app/[locale]/defi-news/page.tsx`

## Files to Modify

- `src/app/api/article/route.ts` — Add `vertical` filter parameter
- `src/components/Header.tsx` — Restructure nav with dropdown for news verticals
- `src/components/NewsCard.tsx` — Add vertical badge
- `src/app/sitemap.ts` — Add vertical pages
- `messages/en.json` — Add vertical i18n strings

## Acceptance Criteria

- [ ] `/business`, `/tech`, `/web3`, `/defi-news` vertical pages all functional
- [ ] Articles auto-classified into verticals by keywords and source URL
- [ ] Each vertical has subcategory filter tabs
- [ ] Vertical badges shown on article cards
- [ ] Navigation restructured with News dropdown containing all verticals
- [ ] API supports `?vertical=business` filter
- [ ] Per-vertical RSS feeds available
- [ ] Shared VerticalPage component used by all 4 verticals (DRY)
- [ ] All pages in sitemap
- [ ] Responsive layout
- [ ] SEO: unique titles and descriptions per vertical
