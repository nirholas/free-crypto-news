# Prompt 53: Educational Guides (Beginner Series)

## Context

CoinTelegraph has 15+ beginner guide sections: Bitcoin for Beginners, Ethereum for Beginners, Altcoins for Beginners, Blockchain for Beginners, DeFi 101, NFTs for Beginners, DAOs for Beginners, Trading for Beginners, Web3 for Beginners, Metaverse for Beginners, Funding for Beginners, plus topic hubs for AI, CBDC, GameFi, Crypto Taxation, Crypto Scams & Hacks, Privacy & Security, and Crypto Personalities. They also have an `/explained` section for concise explainer articles.

Our project has a `/learn` hub with `[slug]` sub-pages, but it needs a comprehensive library of beginner guides organized by topic — this is a massive SEO opportunity (beginners search "how to buy crypto", "what is defi", etc.).

## Current State

```
src/app/[locale]/learn/page.tsx           ← Learn hub exists
src/app/[locale]/learn/[slug]/page.tsx    ← Individual learn article pages
src/lib/learn.ts or similar               ← May contain learn article data
content/blog/                              ← Blog content (some educational)
```

## Task

### Phase 1: Guide Content Architecture

1. **Create `src/data/guides.ts`** — Guide series definitions

```typescript
export interface GuideSeries {
  slug: string;           // "bitcoin-for-beginners"
  title: string;          // "Bitcoin for Beginners"
  description: string;    // Series description
  icon: string;           // Lucide icon name
  color: string;          // Theme color (hex)
  difficulty: "beginner" | "intermediate" | "advanced";
  articles: GuideArticle[];
  estimatedTime: string;  // "45 min" total reading time
}

export interface GuideArticle {
  slug: string;           // "what-is-bitcoin"
  title: string;          // "What is Bitcoin?"
  description: string;    // Brief summary
  order: number;          // Position in series
  readingTime: string;    // "5 min"
  content: string;        // Markdown content
}

export const GUIDE_SERIES: GuideSeries[] = [
  {
    slug: "bitcoin-for-beginners",
    title: "Bitcoin for Beginners",
    icon: "Bitcoin",
    color: "#F7931A",
    difficulty: "beginner",
    description: "Everything you need to know about Bitcoin — from how it works to how to buy your first satoshi.",
    estimatedTime: "45 min",
    articles: [
      { slug: "what-is-bitcoin", title: "What is Bitcoin?", order: 1, readingTime: "5 min", ... },
      { slug: "how-bitcoin-works", title: "How Bitcoin Works", order: 2, ... },
      { slug: "bitcoin-mining-explained", title: "Bitcoin Mining Explained", order: 3, ... },
      { slug: "how-to-buy-bitcoin", title: "How to Buy Bitcoin", order: 4, ... },
      { slug: "bitcoin-wallets-guide", title: "Bitcoin Wallets: A Complete Guide", order: 5, ... },
      { slug: "bitcoin-halving-explained", title: "What is the Bitcoin Halving?", order: 6, ... },
      { slug: "bitcoin-vs-traditional-finance", title: "Bitcoin vs Traditional Finance", order: 7, ... },
    ],
  },
  {
    slug: "ethereum-for-beginners",
    title: "Ethereum for Beginners",
    icon: "Hexagon",
    color: "#627EEA",
    difficulty: "beginner",
    description: "Understand Ethereum, smart contracts, and why it's the backbone of DeFi and NFTs.",
    estimatedTime: "40 min",
    articles: [
      { slug: "what-is-ethereum", title: "What is Ethereum?", order: 1, ... },
      { slug: "smart-contracts-explained", title: "Smart Contracts Explained", order: 2, ... },
      { slug: "ethereum-gas-fees", title: "Understanding Gas Fees", order: 3, ... },
      { slug: "erc20-tokens-explained", title: "ERC-20 Tokens Explained", order: 4, ... },
      { slug: "ethereum-staking-guide", title: "How to Stake Ethereum", order: 5, ... },
    ],
  },
  {
    slug: "defi-101",
    title: "DeFi 101",
    icon: "Layers",
    color: "#00D395",
    difficulty: "intermediate",
    description: "Master decentralized finance: lending, borrowing, yield farming, DEXs, and liquidity pools.",
    estimatedTime: "60 min",
    articles: [
      { slug: "what-is-defi", title: "What is DeFi?", order: 1, ... },
      { slug: "decentralized-exchanges", title: "DEXs: How Decentralized Exchanges Work", order: 2, ... },
      { slug: "yield-farming-guide", title: "Yield Farming: A Complete Guide", order: 3, ... },
      { slug: "liquidity-pools-explained", title: "Liquidity Pools Explained", order: 4, ... },
      { slug: "impermanent-loss", title: "Understanding Impermanent Loss", order: 5, ... },
      { slug: "defi-risks", title: "DeFi Risks: What to Watch Out For", order: 6, ... },
    ],
  },
  {
    slug: "trading-for-beginners",
    title: "Trading for Beginners",
    icon: "CandlestickChart",
    color: "#2962FF",
    difficulty: "beginner",
    description: "Learn crypto trading basics: order types, chart reading, risk management, and common strategies.",
    estimatedTime: "50 min",
    articles: [ ... ],
  },
  {
    slug: "nfts-explained",
    title: "NFTs Explained",
    icon: "Image",
    color: "#FF6B6B",
    difficulty: "beginner",
    description: "Non-fungible tokens demystified: what they are, how to buy and sell, and what gives them value.",
    estimatedTime: "35 min",
    articles: [ ... ],
  },
  {
    slug: "web3-for-beginners",
    title: "Web3 for Beginners",
    icon: "Globe",
    color: "#7C3AED",
    difficulty: "beginner",
    description: "The next generation of the internet: decentralized apps, identity, storage, and governance.",
    estimatedTime: "40 min",
    articles: [ ... ],
  },
  {
    slug: "crypto-security",
    title: "Crypto Security & Scams",
    icon: "Shield",
    color: "#EF4444",
    difficulty: "beginner",
    description: "Protect your crypto: common scams, security best practices, and how to avoid losing funds.",
    estimatedTime: "30 min",
    articles: [ ... ],
  },
  {
    slug: "crypto-regulation",
    title: "Crypto Regulation Guide",
    icon: "Scale",
    color: "#6366F1",
    difficulty: "intermediate",
    description: "Navigate the regulatory landscape: SEC, MiCA, tax requirements, and compliance basics.",
    estimatedTime: "35 min",
    articles: [ ... ],
  },
  {
    slug: "layer-2-scaling",
    title: "Layer 2 & Scaling",
    icon: "Layers",
    color: "#06B6D4",
    difficulty: "intermediate",
    description: "Rollups, sidechains, and scaling: how Layer 2 solutions make blockchains faster and cheaper.",
    estimatedTime: "40 min",
    articles: [ ... ],
  },
  {
    slug: "stablecoins-guide",
    title: "Stablecoins Guide",
    icon: "DollarSign",
    color: "#22C55E",
    difficulty: "beginner",
    description: "USDT, USDC, DAI and beyond: how stablecoins work and their role in the crypto economy.",
    estimatedTime: "25 min",
    articles: [ ... ],
  },
  {
    slug: "daos-governance",
    title: "DAOs & Governance",
    icon: "Users",
    color: "#F59E0B",
    difficulty: "intermediate",
    description: "Decentralized autonomous organizations: voting, proposals, treasury management, and participation.",
    estimatedTime: "30 min",
    articles: [ ... ],
  },
  {
    slug: "ai-and-crypto",
    title: "AI & Crypto",
    icon: "Brain",
    color: "#EC4899",
    difficulty: "intermediate",
    description: "The intersection of artificial intelligence and blockchain: AI tokens, decentralized compute, and AI agents.",
    estimatedTime: "35 min",
    articles: [ ... ],
  },
];
```

### Phase 2: Guide Content (Markdown Files)

2. **Create `content/guides/` directory** with markdown files for each guide article

```
content/guides/
├── bitcoin-for-beginners/
│   ├── what-is-bitcoin.md
│   ├── how-bitcoin-works.md
│   ├── bitcoin-mining-explained.md
│   ├── how-to-buy-bitcoin.md
│   ├── bitcoin-wallets-guide.md
│   ├── bitcoin-halving-explained.md
│   └── bitcoin-vs-traditional-finance.md
├── ethereum-for-beginners/
│   ├── what-is-ethereum.md
│   └── ...
├── defi-101/
│   └── ...
└── ... (12 series × ~5-7 articles each = ~70 articles)
```

Each markdown file with frontmatter:

```markdown
---
title: "What is Bitcoin?"
series: "bitcoin-for-beginners"
order: 1
readingTime: "5 min"
difficulty: "beginner"
description: "An introduction to Bitcoin: the world's first cryptocurrency."
lastUpdated: "2026-03-01"
---

# What is Bitcoin?

Bitcoin is the world's first decentralized digital currency...
```

Write high-quality, factual, evergreen educational content. Each article should be 800-1500 words. No investment advice. Cite sources where appropriate.

### Phase 3: Guide Hub & Pages

3. **Enhance `src/app/[locale]/learn/page.tsx`** — Redesign as a guide hub

```
Layout:
┌──────────────────────────────────────────────────────┐
│  🎓 Learn Crypto                                     │
│  Free educational guides for every level             │
│                                                      │
│  Level: [All] [Beginner 🟢] [Intermediate 🟡]      │
│         [Advanced 🔴]                                │
│                                                      │
│  ┌─────────────────────┐ ┌─────────────────────┐    │
│  │ ₿ Bitcoin for       │ │ ⬡ Ethereum for      │    │
│  │   Beginners         │ │   Beginners          │    │
│  │   7 lessons • 45min │ │   5 lessons • 40min  │    │
│  │   🟢 Beginner      │ │   🟢 Beginner       │    │
│  │   [Start Learning]  │ │   [Start Learning]   │    │
│  └─────────────────────┘ └─────────────────────┘    │
│                                                      │
│  ┌─────────────────────┐ ┌─────────────────────┐    │
│  │ 🔗 DeFi 101        │ │ 📈 Trading for      │    │
│  │   ...               │ │   Beginners          │    │
│  │   🟡 Intermediate  │ │   🟢 Beginner       │    │
│  └─────────────────────┘ └─────────────────────┘    │
│  ... (12 series cards)                               │
│                                                      │
│  Also see: [Glossary] [Blog]                        │
└──────────────────────────────────────────────────────┘
```

4. **Create `src/app/[locale]/learn/series/[slug]/page.tsx`** — Series landing page

- Series overview with progress tracking (if user is logged in)
- Ordered list of articles with status (read/unread)
- Estimated total reading time
- "Start" / "Continue" CTA button
- Next/previous article navigation

5. **Create `src/app/[locale]/learn/series/[slug]/[article]/page.tsx`** — Individual guide article page

- Breadcrumb: Learn > Bitcoin for Beginners > What is Bitcoin?
- Progress bar (article 3 of 7)
- Rendered markdown content
- Previous/Next navigation
- Related glossary terms (auto-linked)
- Related news articles
- "Mark as complete" button (if logged in)

### Phase 4: Integration

6. **Add guide progress tracking** — Store read articles in localStorage (or user profile if logged in)
7. **Add "Learn" to main navigation prominently** — This is high-value for new users
8. **Cross-link from glossary** — Each glossary term links to relevant guide series
9. **Add structured data** — Course and Article schema for SEO

## Files to Create

- `src/data/guides.ts` — Series definitions
- `content/guides/` — ~70 markdown articles across 12 series
- `src/app/[locale]/learn/series/[slug]/page.tsx`
- `src/app/[locale]/learn/series/[slug]/[article]/page.tsx`
- `src/components/GuideSeriesCard.tsx`
- `src/components/GuideProgress.tsx`
- `src/lib/guide-progress.ts` — Progress tracking utilities

## Files to Modify

- `src/app/[locale]/learn/page.tsx` — Redesign as guide hub
- `src/components/Header.tsx` — Ensure Learn is prominent in nav
- `src/app/sitemap.ts` — Add guide pages
- `messages/en.json` — Add guide i18n strings

## Acceptance Criteria

- [ ] `/learn` hub displays 12 guide series cards with difficulty and duration
- [ ] Each series has a landing page listing its articles in order
- [ ] Individual guide articles render markdown with proper formatting
- [ ] Previous/next navigation between articles in a series
- [ ] Progress tracking (localStorage at minimum)
- [ ] Difficulty filter on learn hub
- [ ] 60+ real educational articles written (800-1500 words each)
- [ ] Structured data (Course schema) on series pages
- [ ] All pages in sitemap
- [ ] Responsive layout
