# Prompt 49: Opinion & Editorial Section

## Context

Both CoinDesk (`/opinion`) and CoinTelegraph (`/category/opinion`) have dedicated opinion sections that separate editorial commentary from straight news reporting. This is a fundamental distinction in journalism — readers need to know what is news vs. what is opinion/analysis. Our project aggregates news from multiple sources but doesn't surface opinion content as a distinct category.

Since we're an aggregator (not original content), our opinion section should:
1. Tag and surface opinion/editorial articles from source feeds that are already categorized as opinion
2. Provide a dedicated browsing experience for commentary and analysis pieces
3. Clearly label opinion content to maintain editorial credibility

## Current State

```
src/app/[locale]/category/[slug]/page.tsx  ← Category page (can reference for layout)
src/app/[locale]/search/page.tsx           ← Search page (filtering reference)
src/app/api/article/route.ts               ← Article API (needs opinion filter)
src/lib/sources.ts                          ← Source definitions
```

## Task

### Phase 1: Opinion Category Detection

1. **Modify the article ingestion pipeline** — When fetching RSS/Atom feeds, detect opinion content by:

```typescript
// Heuristics for detecting opinion content:
// 1. Feed category/tag contains: "opinion", "editorial", "commentary", "analysis", "op-ed", "column"
// 2. Source URL path contains: /opinion/, /editorial/, /commentary/
// 3. Title patterns: "Why...", "The case for/against...", "Opinion:"
// 4. Author-specific columns (known columnists)

export function isOpinionContent(article: Article): boolean {
  const opinionKeywords = ["opinion", "editorial", "commentary", "op-ed", "column", "perspective", "take"];
  const categories = (article.categories || []).map(c => c.toLowerCase());
  const hasOpinionCategory = categories.some(c =>
    opinionKeywords.some(k => c.includes(k))
  );
  const hasOpinionPath = /\/(opinion|editorial|commentary)\//i.test(article.url);
  return hasOpinionCategory || hasOpinionPath;
}
```

2. **Add `contentType` field to article schema** — `"news" | "opinion" | "analysis" | "press-release"`

### Phase 2: Opinion Section Page

3. **Create `src/app/[locale]/opinion/page.tsx`** — Opinion & editorial hub

```
Layout:
┌──────────────────────────────────────────────────────┐
│  💬 Opinion & Commentary                             │
│  Analysis, editorials, and expert perspectives       │
│  from across the crypto ecosystem.                  │
│                                                      │
│  ⚠️ Articles in this section represent the views    │
│  of their authors, not free-crypto-news.            │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Featured Opinion (latest, large card)               │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ "Why Bitcoin's next halving changes          │    │
│  │  everything for institutional adoption"      │    │
│  │  By [Author] • CoinDesk • 2h ago            │    │
│  │  [OPINION badge]                             │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  Filter: [All] [Markets] [Policy] [Tech] [DeFi]    │
│                                                      │
│  Recent Opinion Articles (list/grid)                 │
│  ├── Article card with OPINION badge                │
│  ├── Article card                                   │
│  ├── Article card                                   │
│  └── Load more...                                   │
└──────────────────────────────────────────────────────┘
```

Key UI elements:
- Prominent disclaimer banner: opinion ≠ editorial position
- "OPINION" badge on every card (visually distinct from news cards)
- Author attribution more prominent than source
- Topic filter tabs
- Infinite scroll / load more

4. **Create `src/components/OpinionCard.tsx`** — Distinct card variant for opinion content

```typescript
// Similar to NewsCard but with:
// - "OPINION" badge (orange/amber color)
// - Author name and photo prominently displayed
// - Italic title styling
// - Quotation marks around the title or excerpt
// - Source shown smaller/secondary
```

### Phase 3: API Support

5. **Modify `src/app/api/article/route.ts`** — Add `contentType` filter parameter

```
GET /api/article?contentType=opinion&limit=20&offset=0
GET /api/article?contentType=news (default, excludes opinion)
```

### Phase 4: Integration

6. **Add "Opinion" to main navigation** in `src/components/Header.tsx`
7. **Show OPINION badge on opinion articles everywhere they appear** (homepage feed, search results, category pages)
8. **Add opinion articles to the article detail page** — Show "More opinion" sidebar section

## Files to Create

- `src/app/[locale]/opinion/page.tsx`
- `src/components/OpinionCard.tsx`

## Files to Modify

- `src/app/api/article/route.ts` — Add contentType filter
- `src/lib/sources.ts` or article ingestion — Add opinion detection
- `src/components/Header.tsx` — Add Opinion nav link
- `src/components/NewsCard.tsx` — Add OPINION badge variant
- `messages/en.json` — Add opinion section i18n strings

## Acceptance Criteria

- [ ] `/opinion` page displays opinion/editorial articles from aggregated sources
- [ ] Opinion content is auto-detected from feed categories and URL paths
- [ ] OPINION badge displayed on all opinion article cards site-wide
- [ ] Disclaimer banner clearly separates opinion from news
- [ ] Topic filter tabs work
- [ ] API supports `?contentType=opinion` filter
- [ ] Navigation link added to header
- [ ] Responsive layout
