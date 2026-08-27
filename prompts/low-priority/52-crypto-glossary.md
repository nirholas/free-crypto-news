# Prompt 52: Crypto Glossary

## Context

CoinTelegraph has a full crypto glossary at `/glossary` — an alphabetical reference of crypto terminology. This is one of the highest-SEO-value pages a crypto site can have because glossary terms rank for thousands of "what is [term]" search queries. The existing `/learn` section in our project has educational guides but no glossary/dictionary feature.

A glossary serves dual purposes:
1. **SEO magnet** — "What is DeFi", "What is staking", etc. are high-volume search queries
2. **User education** — Inline tooltips throughout the site can link to glossary definitions

## Current State

```
src/app/[locale]/learn/page.tsx           ← Learn hub exists
src/app/[locale]/learn/[slug]/page.tsx    ← Individual learn articles exist
src/components/Glossary.tsx               ← A Glossary component may already exist (referenced in learn page)
```

## Task

### Phase 1: Glossary Data

1. **Create `src/data/glossary.ts`** — Comprehensive crypto glossary with 150+ terms

```typescript
export interface GlossaryTerm {
  term: string;           // "Decentralized Finance"
  slug: string;           // "defi"
  shortDef: string;       // One-sentence definition (for tooltips)
  fullDef: string;        // Full 2-4 paragraph definition (for glossary page)
  aliases: string[];      // ["DeFi", "Decentralised Finance"]
  category: GlossaryCategory;
  relatedTerms: string[]; // slugs of related terms
  seeAlso?: string[];     // External reference links
  difficulty: "beginner" | "intermediate" | "advanced";
}

type GlossaryCategory =
  | "blockchain-basics"
  | "trading"
  | "defi"
  | "nft"
  | "mining-staking"
  | "security"
  | "regulation"
  | "layer-2"
  | "tokens"
  | "governance"
  | "technical";

// Include at minimum these high-value terms:
// Blockchain, Bitcoin, Ethereum, DeFi, NFT, Staking, Mining, Wallet,
// Smart Contract, Gas, Layer 2, DAO, DEX, CEX, Liquidity Pool, Yield Farming,
// Impermanent Loss, Airdrop, Tokenomics, Market Cap, TVL, APY, APR,
// Halving, Proof of Work, Proof of Stake, Bridge, Oracle, Governance Token,
// Rug Pull, Flash Loan, MEV, HODL, FOMO, FUD, Whale, Bear Market, Bull Market,
// Altcoin, Stablecoin, Wrapped Token, Cold Wallet, Hot Wallet, Seed Phrase,
// Private Key, Public Key, Hash Rate, Block Reward, Consensus, Fork,
// Hard Fork, Soft Fork, Mainnet, Testnet, Sidechain, Rollup, ZK-Proof,
// Restaking, Liquid Staking, Account Abstraction, EIP, ERC-20, ERC-721,
// ERC-1155, Mempool, Slippage, Front-running, Sandwich Attack, Governance,
// Multisig, Timelock, Vesting, Token Burn, Minting, Bonding Curve,
// AMM, Order Book, Perpetual, Funding Rate, Open Interest, Liquidation...
// (150+ total terms)
```

### Phase 2: Glossary Pages

2. **Create `src/app/[locale]/glossary/page.tsx`** — Main glossary page

```
Layout:
┌──────────────────────────────────────────────────────┐
│  📖 Crypto Glossary                                  │
│  Definitions for 150+ cryptocurrency terms           │
│                                                      │
│  Search: [_______________]                           │
│                                                      │
│  A B C D E F G H I J K L M N O P Q R S T U V W X Y Z│
│  ─────────────────────────────────────────            │
│                                                      │
│  Category: [All] [Basics] [Trading] [DeFi] [NFT]    │
│           [Mining] [Security] [L2] [Governance]      │
│                                                      │
│  Level: [All] [Beginner] [Intermediate] [Advanced]   │
│                                                      │
│  ── A ──────────────────────────────────             │
│  Account Abstraction                                 │
│    A proposal to make Ethereum accounts more...      │
│    [Read more →]                                     │
│                                                      │
│  Airdrop                                             │
│    Free distribution of tokens to wallet...          │
│    [Read more →]                                     │
│                                                      │
│  ── B ──────────────────────────────────             │
│  ...                                                 │
└──────────────────────────────────────────────────────┘
```

Key features:
- Alphabet jump links (anchor navigation)
- Search with autocomplete
- Category and difficulty filters
- Collapsible definitions (show shortDef, expand to fullDef)
- Related terms links within definitions

3. **Create `src/app/[locale]/glossary/[slug]/page.tsx`** — Individual term page

```
Layout:
┌──────────────────────────────────────────────────────┐
│  Breadcrumb: Glossary > DeFi                        │
│                                                      │
│  📖 Decentralized Finance (DeFi)                    │
│  Category: DeFi • Difficulty: Beginner              │
│                                                      │
│  Also known as: DeFi, Decentralised Finance         │
│                                                      │
│  Full multi-paragraph definition...                  │
│  ...with proper formatting and examples.             │
│                                                      │
│  Related Terms:                                      │
│  [DEX] [Liquidity Pool] [Yield Farming] [TVL]      │
│                                                      │
│  Related Articles:                                   │
│  ├── Latest article tagged "DeFi"                   │
│  ├── Article 2                                      │
│  └── Article 3                                      │
│                                                      │
│  ← Previous: DCA    Next: DEX →                     │
└──────────────────────────────────────────────────────┘
```

Each term page must have:
- Full structured data (DefinedTerm schema)
- Unique meta description using shortDef
- Prev/next navigation
- Related articles from the news feed matching this term

### Phase 3: Inline Tooltips

4. **Create `src/components/GlossaryTooltip.tsx`** — Hoverable tooltip for glossary terms

```typescript
// When a glossary term appears in article text or other pages,
// wrap it in a GlossaryTooltip that shows the shortDef on hover
// and links to the full glossary entry on click.
//
// Usage: <GlossaryTooltip term="defi">DeFi</GlossaryTooltip>
// Renders: underlined dotted text, tooltip on hover, link on click
```

### Phase 4: Integration

5. **Add "Glossary" to the Learn section navigation** and footer
6. **Add glossary terms to sitemap** — Each term page should be in the sitemap
7. **Cross-link from `/learn` pages** — Learn articles should link to relevant glossary terms

## Files to Create

- `src/data/glossary.ts` — 150+ term definitions
- `src/app/[locale]/glossary/page.tsx`
- `src/app/[locale]/glossary/[slug]/page.tsx`
- `src/components/GlossaryTooltip.tsx`

## Files to Modify

- `src/app/[locale]/learn/page.tsx` — Add glossary link/section
- `src/components/Footer.tsx` — Add Glossary link
- `src/app/sitemap.ts` — Add glossary term pages
- `messages/en.json` — Add glossary i18n strings

## Acceptance Criteria

- [ ] `/glossary` page lists 150+ crypto terms alphabetically with search
- [ ] Each term has a dedicated page at `/glossary/[slug]`
- [ ] Terms have: shortDef, fullDef, category, difficulty, aliases, related terms
- [ ] Alphabet jump navigation works
- [ ] Category and difficulty filters work
- [ ] Search autocomplete finds terms by name and alias
- [ ] Individual pages have DefinedTerm structured data
- [ ] Related articles pulled from news feed for each term
- [ ] GlossaryTooltip component available for inline use
- [ ] All glossary pages in sitemap
- [ ] Responsive layout
