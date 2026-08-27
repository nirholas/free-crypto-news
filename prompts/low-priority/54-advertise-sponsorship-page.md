# Prompt 54: Advertise / Sponsorship Page

## Context

CoinDesk has `/advertise` and CoinTelegraph has `/advertising-disclosure`. For any crypto media site aiming for sustainability, an advertising/sponsorship page is essential — it's how publishers monetize traffic and attract business partnerships. Even if we don't have an ad sales team today, having this page signals that the project is professional and open to partnerships.

## Current State

```
src/app/[locale]/pricing/page.tsx    ← Pricing page exists (API tiers)
src/app/[locale]/about/page.tsx      ← About page exists (reference for layout)
src/app/[locale]/contact/page.tsx    ← Contact page exists
```

No advertising/sponsorship page exists.

## Task

### Phase 1: Advertise Page

1. **Create `src/app/[locale]/advertise/page.tsx`** — Advertising & sponsorship info page

```
Layout:
┌──────────────────────────────────────────────────────┐
│  📢 Advertise with free-crypto-news                  │
│  Reach millions of crypto enthusiasts, developers,   │
│  and investors through our platform.                 │
│                                                      │
│  [Contact Us About Advertising]                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  📊 Audience & Reach                                │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ API Calls│ │ Monthly  │ │ Countries│            │
│  │ per Day  │ │ Visitors │ │ Reached  │            │
│  │ XXX,XXX  │ │ XXX,XXX  │ │ 100+     │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                      │
│  👥 Audience Profile                                │
│  - Crypto developers & engineers                     │
│  - DeFi traders & investors                          │
│  - Institutional & enterprise users                  │
│  - Crypto-native projects & startups                │
│                                                      │
│  📦 Advertising Options                             │
│                                                      │
│  1. Sponsored Content                                │
│     Your article featured in our news feed           │
│     with clear "Sponsored" labeling.                │
│                                                      │
│  2. Newsletter Sponsorship                           │
│     Reach our email subscribers with a               │
│     dedicated section in our newsletters.           │
│                                                      │
│  3. API Partnership                                  │
│     Your data integrated as a named source          │
│     in our API, reaching all downstream apps.       │
│                                                      │
│  4. Widget Sponsorship                               │
│     Branding on our embeddable widgets              │
│     used across third-party sites.                  │
│                                                      │
│  5. Custom Integration                               │
│     Bespoke partnerships tailored to your           │
│     project's needs.                                │
│                                                      │
│  ────────────                                        │
│  ⚖️ Advertising Disclosure                          │
│  All sponsored content is clearly labeled.           │
│  Editorial independence is maintained.               │
│  We reserve the right to reject any ad.             │
│  ────────────                                        │
│                                                      │
│  📧 Get in Touch                                    │
│  [Contact form or email link]                       │
│                                                      │
│  Current Sponsors / Partners (if any)               │
└──────────────────────────────────────────────────────┘
```

### Phase 2: Advertising Disclosure

2. **Create `src/app/[locale]/advertising-disclosure/page.tsx`** — Transparency page

Content should cover:
- How sponsored content is labeled
- Editorial independence statement
- How advertising does not influence editorial decisions
- Types of compensation (direct payment, affiliate, tokens)
- How to identify sponsored content on the site
- Contact for advertising complaints

### Phase 3: Integration

3. **Add "Advertise" link to footer** in `src/components/Footer.tsx`
4. **Add advertising disclosure link to footer** alongside Terms and Privacy
5. **Add structured data** — Organization schema with contact point for advertising

## Files to Create

- `src/app/[locale]/advertise/page.tsx`
- `src/app/[locale]/advertising-disclosure/page.tsx`

## Files to Modify

- `src/components/Footer.tsx` — Add Advertise and Advertising Disclosure links
- `messages/en.json` — Add advertise page i18n strings

## Acceptance Criteria

- [ ] `/advertise` page displays advertising options and audience info
- [ ] `/advertising-disclosure` page explains sponsored content policies
- [ ] Contact CTA links to contact page or email
- [ ] Audience stats section (can use placeholder values initially)
- [ ] Clear editorial independence statement
- [ ] Footer links added
- [ ] SEO metadata set
- [ ] Responsive layout
- [ ] Professional, clean design matching site theme
