# Prompt 50: Author Pages

## Context

Both CoinDesk (`/author/[name]`) and CoinTelegraph (`/authors/[name]`) have dedicated author profile pages that aggregate all articles by a specific journalist. This builds trust, allows readers to follow specific writers, and is excellent for SEO (author pages rank well for journalist name searches).

Since we're an aggregator, our author pages would show articles from a specific writer across _all_ sources — e.g. see everything by a CoinDesk writer alongside their CoinTelegraph pieces if they write for both.

## Current State

```
src/app/[locale]/source/[key]/page.tsx    ← Per-source page (similar pattern)
src/app/[locale]/category/[slug]/page.tsx ← Category page (similar pattern)
src/app/api/article/route.ts              ← Article API (needs author filter)
src/components/NewsCard.tsx               ← Article card (shows author already)
```

No author pages, no author API, no author index exist.

## Task

### Phase 1: Author Extraction & Indexing

1. **Create `src/lib/authors.ts`** — Author extraction and normalization

```typescript
export interface Author {
  slug: string;          // URL-safe: "vitalik-buterin"
  name: string;          // Display: "Vitalik Buterin"
  sources: string[];     // Which feeds they appear in
  articleCount: number;
  firstSeen: string;     // ISO date
  lastSeen: string;      // ISO date
  avatarUrl?: string;    // Gravatar or source avatar if available
  bio?: string;          // Extracted from feed if available
}

// Normalize author names:
// - Trim whitespace
// - Title case
// - Merge duplicates ("John Smith" === "john smith" === "JOHN SMITH")
// - Handle "By John Smith" prefix stripping
// - Handle "CoinDesk Staff" / "Staff Writer" as special cases
export function normalizeAuthorName(raw: string): string { ... }
export function authorSlug(name: string): string { ... }
```

2. **Create `src/app/api/authors/route.ts`** — Authors listing API

```
GET /api/authors?limit=50&offset=0&sort=articles|recent|name
Response: { authors: Author[], total: number, hasMore: boolean }
```

3. **Create `src/app/api/authors/[slug]/route.ts`** — Single author with articles

```
GET /api/authors/vitalik-buterin?limit=20&offset=0
Response: { author: Author, articles: Article[], total: number }
```

### Phase 2: Author Pages

4. **Create `src/app/[locale]/author/[slug]/page.tsx`** — Individual author page

```
Layout:
┌──────────────────────────────────────────────────────┐
│  👤 [Avatar]  Author Name                           │
│               123 articles • Writes for CoinDesk,   │
│               Cointelegraph                          │
│               First article: Jan 2023               │
│               Latest: 2 hours ago                    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Filter: [All Sources] [CoinDesk] [Cointelegraph]   │
│                                                      │
│  Articles by Author Name                             │
│  ├── Article card (with source badge)               │
│  ├── Article card                                   │
│  ├── Article card                                   │
│  └── Load more...                                   │
│                                                      │
│  Publishing Activity (mini chart: articles/month)    │
└──────────────────────────────────────────────────────┘
```

5. **Create `src/app/[locale]/authors/page.tsx`** — Authors directory

```
Layout:
┌──────────────────────────────────────────────────────┐
│  ✍️ Authors                                          │
│  Browse articles by journalist and analyst           │
│                                                      │
│  Search: [_______________]                           │
│                                                      │
│  Sort: [Most Articles] [Most Recent] [A-Z]          │
│                                                      │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐      │
│  │ 👤 Name   │ │ 👤 Name   │ │ 👤 Name   │      │
│  │ 234 posts │ │ 189 posts │ │ 156 posts │      │
│  │ CoinDesk  │ │ CT         │ │ Multiple  │      │
│  └────────────┘ └────────────┘ └────────────┘      │
│                                                      │
│  [Load more authors...]                             │
└──────────────────────────────────────────────────────┘
```

### Phase 3: Integration

6. **Make author names clickable** — In `NewsCard.tsx` and article detail pages, link author names to `/author/[slug]`
7. **Add "Authors" to footer navigation** in `src/components/Footer.tsx`
8. **Generate author-specific SEO** — Each author page gets structured data (`Person` schema) and unique meta descriptions

## Files to Create

- `src/lib/authors.ts`
- `src/app/api/authors/route.ts`
- `src/app/api/authors/[slug]/route.ts`
- `src/app/[locale]/author/[slug]/page.tsx`
- `src/app/[locale]/authors/page.tsx`
- `src/components/AuthorCard.tsx`

## Files to Modify

- `src/components/NewsCard.tsx` — Link author names to author pages
- `src/components/Footer.tsx` — Add Authors directory link
- `messages/en.json` — Add author page i18n strings

## Acceptance Criteria

- [ ] `/authors` directory page lists all detected authors with article counts
- [ ] `/author/[slug]` page shows all articles by that author across all sources
- [ ] Author names are extracted and normalized from RSS feed data
- [ ] Author names are clickable links in news cards and article pages
- [ ] Authors directory supports search and sort (articles / recent / alphabetical)
- [ ] Per-source filter on individual author pages
- [ ] SEO: structured data, unique meta descriptions, og:image
- [ ] Responsive grid layout for directory, list for individual pages
