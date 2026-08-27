# Prompt 48: Newsletters Hub

## Context

CoinDesk has a full newsletters hub at `/newsletters` with 7 named newsletters (CoinDesk Headlines, Crypto for Advisors, Crypto Long & Short, Daybook US, State of Crypto, The Node, The Protocol), each with its own landing page. CoinTelegraph has `/newsletter-subscriptions`. Our project has newsletter API endpoints (`/api/newsletter`, `/api/newsletter/subscribe`) and components (`DigestSubscribeForm`, `FooterNewsletter`, `NewsletterCTA`) but no dedicated newsletters landing page.

A newsletters hub is critical for user retention — email subscribers have 5-10x the return rate of casual visitors.

## Current State

```
src/app/api/newsletter/route.ts            ← Newsletter API
src/app/api/newsletter/subscribe/route.ts  ← Subscribe endpoint
src/components/DigestSubscribeForm.tsx      ← Existing subscribe form
src/components/FooterNewsletter.tsx         ← Footer newsletter CTA
src/components/NewsletterCTA.tsx            ← General newsletter CTA
src/app/[locale]/digest/page.tsx            ← Daily digest page (reference)
```

## Task

### Phase 1: Define Newsletter Types

1. **Create `src/lib/newsletters.ts`** — Newsletter definitions and types

```typescript
export interface Newsletter {
  id: string;
  name: string;
  slug: string;
  description: string;
  frequency: "daily" | "weekly" | "biweekly";
  icon: string; // Lucide icon name
  category: "news" | "markets" | "defi" | "education" | "developer";
  sampleSubject: string;
  subscriberCount?: number;
  previewUrl?: string;
}

export const NEWSLETTERS: Newsletter[] = [
  {
    id: "daily-digest",
    name: "Daily Digest",
    slug: "daily-digest",
    description: "The top crypto stories delivered every morning. Headlines, prices, and market moves — everything you need in 5 minutes.",
    frequency: "daily",
    icon: "Newspaper",
    category: "news",
    sampleSubject: "BTC breaks $100K, Ethereum L2 TVL hits record, SEC ruling on staking",
  },
  {
    id: "market-pulse",
    name: "Market Pulse",
    slug: "market-pulse",
    description: "Weekly market analysis with price charts, on-chain metrics, sentiment indicators, and trading signals from our data pipeline.",
    frequency: "weekly",
    icon: "TrendingUp",
    category: "markets",
    sampleSubject: "Weekly: BTC funding rates diverge, stablecoin inflows surge 40%",
  },
  {
    id: "defi-dispatch",
    name: "DeFi Dispatch",
    slug: "defi-dispatch",
    description: "Weekly deep-dive into DeFi: yield opportunities, protocol updates, TVL shifts, governance votes, and security incidents.",
    frequency: "weekly",
    icon: "Layers",
    category: "defi",
    sampleSubject: "This week in DeFi: Aave v4 launch, restaking wars heat up",
  },
  {
    id: "dev-weekly",
    name: "Developer Weekly",
    slug: "dev-weekly",
    description: "API updates, new endpoints, SDK releases, and developer tips for building on the free-crypto-news platform.",
    frequency: "weekly",
    icon: "Code",
    category: "developer",
    sampleSubject: "New: Solana DeFi endpoints, Python SDK v2.0, WebSocket improvements",
  },
  {
    id: "learn-crypto",
    name: "Learn Crypto",
    slug: "learn-crypto",
    description: "Biweekly educational content: explainers, glossary terms, beginner guides, and how-to articles for crypto newcomers.",
    frequency: "biweekly",
    icon: "GraduationCap",
    category: "education",
    sampleSubject: "What are Layer 2s? A beginner's guide to Ethereum scaling",
  },
];
```

### Phase 2: Newsletters Hub Page

2. **Create `src/app/[locale]/newsletters/page.tsx`** — Main newsletters landing page

```
Layout:
┌──────────────────────────────────────────────────────┐
│  📧 Newsletters                                      │
│  Stay informed with curated crypto intelligence      │
│  delivered to your inbox.                           │
│                                                      │
│  [Subscribe to All]                                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ 📰 Daily     │  │ 📈 Market    │                 │
│  │   Digest     │  │   Pulse      │                 │
│  │              │  │              │                 │
│  │ Daily • News │  │ Weekly •     │                 │
│  │              │  │ Markets      │                 │
│  │ [Subscribe]  │  │ [Subscribe]  │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐                 │
│  │ 🔗 DeFi     │  │ 💻 Developer │                 │
│  │   Dispatch   │  │   Weekly     │                 │
│  │ ...          │  │ ...          │                 │
│  └──────────────┘  └──────────────┘                 │
│                                                      │
│  ┌──────────────┐                                   │
│  │ 🎓 Learn    │                                   │
│  │   Crypto     │                                   │
│  │ ...          │                                   │
│  └──────────────┘                                   │
│                                                      │
│  ────────────────────────────────────                │
│  FAQ: How often? Can I unsubscribe? Privacy?        │
└──────────────────────────────────────────────────────┘
```

Each newsletter card shows:
- Icon + name
- Description (2-3 sentences)
- Frequency badge ("Daily", "Weekly", "Biweekly")
- Category tag
- Sample subject line (in a faux email preview)
- Subscribe button with email input (inline form)
- "Preview latest issue" link (if available)

3. **Create `src/app/[locale]/newsletters/[slug]/page.tsx`** — Individual newsletter page

- Full description of the newsletter
- Archive of past issues (pull from digest/archive system if available)
- Subscribe form (pre-selected to this newsletter)
- Sample issue preview
- FAQ specific to this newsletter

### Phase 3: Subscribe API Enhancement

4. **Modify `src/app/api/newsletter/subscribe/route.ts`** — Support newsletter selection

```typescript
// Enhance the subscribe endpoint to accept:
// POST /api/newsletter/subscribe
// { email: string, newsletters: string[] }
// e.g. { email: "user@example.com", newsletters: ["daily-digest", "market-pulse"] }

// Validate newsletter IDs against NEWSLETTERS config
// Store preferences alongside email
```

### Phase 4: Navigation & Integration

5. **Add "Newsletters" to footer and header** in `src/components/Header.tsx` and `src/components/Footer.tsx`
6. **Add newsletter CTA to article pages** — After article content, show relevant newsletter signup

## Files to Create

- `src/lib/newsletters.ts`
- `src/app/[locale]/newsletters/page.tsx`
- `src/app/[locale]/newsletters/[slug]/page.tsx`

## Files to Modify

- `src/app/api/newsletter/subscribe/route.ts` — Support multi-newsletter selection
- `src/components/Header.tsx` — Add Newsletters nav link
- `src/components/Footer.tsx` — Add Newsletters link
- `messages/en.json` — Add newsletter i18n strings

## Acceptance Criteria

- [ ] `/newsletters` page displays all 5 newsletters with descriptions and subscribe forms
- [ ] Each newsletter has its own landing page at `/newsletters/[slug]`
- [ ] Subscribe API accepts newsletter selection array
- [ ] Inline email forms work with validation and success/error states
- [ ] "Subscribe to All" button subscribes to every newsletter
- [ ] Navigation links added to header and footer
- [ ] Responsive layout (2-col desktop, 1-col mobile)
- [ ] SEO metadata set for all pages
