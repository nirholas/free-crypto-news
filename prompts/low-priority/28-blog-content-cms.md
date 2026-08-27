# Prompt 28: Blog Content & CMS

## Context

The blog page (`src/app/[locale]/blog/page.tsx`) loads markdown files from `content/blog/` using a frontmatter parser. There are 12 markdown articles already written (`content/blog/*.md`) with proper frontmatter (title, description, date, author, category, tags, featured). However, the blog page shows "Blog coming soon" when `posts.length === 0` — this means the loading logic isn't finding the posts, or the page needs to render them correctly.

The blog infrastructure (`src/lib/blog.ts`) is a 1143-line file that supports loading from both filesystem and inline content, with reading time calculation, related posts, and TOC generation.

## Current State

```
content/blog/
├── what-is-bitcoin.md         ← Featured, 127 lines, proper frontmatter
├── ethereum-explained.md
├── defi-explained.md
├── nfts-explained.md
├── stablecoins-explained.md
├── crypto-wallet-guide.md
├── crypto-security-guide.md
├── layer2-scaling-guide.md
├── how-to-buy-crypto.md
├── crypto-trading-strategies.md
├── crypto-airdrops-guide.md
└── README.md

src/app/[locale]/blog/page.tsx     ← Shows "Blog coming soon" placeholder
src/lib/blog.ts                     ← Full CMS with fs loading, gray-matter parsing
```

## Task

### Phase 1: Fix Blog Post Loading

1. **Debug `src/app/[locale]/blog/page.tsx`** — The page reads from `content/blog/` using `fs.readdirSync`. Check why `posts.length === 0`. Likely issues:
   - Path resolution during build vs. runtime
   - Frontmatter parsing failing silently
   - Missing `gray-matter` parsing in page.tsx (it has its own `parseFrontmatter`)

2. **Wire page to `src/lib/blog.ts`** — The blog page has its own inline parser but `src/lib/blog.ts` has a full CMS. Replace the page's inline parsing with calls to the blog library:

```typescript
import { getAllPosts, getFeaturedPosts } from "@/lib/blog";

// In the page component:
const posts = getAllPosts();
const featured = getFeaturedPosts();
```

### Phase 2: Individual Blog Post Pages

3. **Create `src/app/[locale]/blog/[slug]/page.tsx`** — Individual blog post page

```typescript
import { getPost, getRelatedPosts, generateTableOfContents } from '@/lib/blog';
import { MDXContent } from '@/components/MDXContent';

export default async function BlogPostPage({ params }) {
  const post = getPost(params.slug);
  const toc = generateTableOfContents(post.content);
  const related = getRelatedPosts(post.slug, 3);

  return (
    // Full article layout with:
    // - Breadcrumbs
    // - Title, author, date, reading time, category badge
    // - Table of contents sidebar
    // - Rendered markdown content
    // - Tags
    // - Related posts cards
    // - Share buttons
    // - Back to blog link
  );
}

// Generate static params for all posts
export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map(p => ({ slug: p.slug }));
}
```

4. **Create `src/components/MDXContent.tsx`** — Markdown renderer

```typescript
// Use remark/rehype or next-mdx-remote to render markdown to React
// Support: headings, code blocks with syntax highlighting, images, links, tables, blockquotes
```

### Phase 3: Blog Enhancements

5. **Add blog category filtering** — Allow filtering by category on the blog index page
6. **Add blog search** — Simple client-side search across titles, descriptions, tags
7. **Add blog RSS feed** — Create `src/app/blog/feed.xml/route.ts` for RSS
8. **Add structured data** — Add Article JSON-LD for SEO to individual post pages

### Phase 4: Write Additional Blog Posts

9. **Create 3 new blog posts** in `content/blog/`:
   - `free-crypto-api-guide.md` — "How to Use the Free Crypto News API: A Complete Guide" (showcasing the product)
   - `crypto-market-analysis-2026.md` — "Crypto Market Outlook 2026: Key Trends to Watch"
   - `building-crypto-bot.md` — "Build a Crypto News Bot in 10 Minutes with Our Free API"

Each with proper frontmatter matching the existing pattern.

### Phase 5: Remove "Coming Soon" Placeholder

10. **Update `src/app/[locale]/blog/page.tsx`** — The "Blog coming soon" fallback should now never trigger since posts exist. Keep it as a graceful empty state but ensure the loading path works.

### Phase 6: Tests

11. **Create `src/lib/__tests__/blog.test.ts`** — Test post loading, frontmatter parsing, slug generation, related posts

## Packages to Install (if not already present)

```bash
pnpm add next-mdx-remote rehype-highlight rehype-slug remark-gfm
```

## Acceptance Criteria

- [ ] Blog index page renders all 12+ posts (no "coming soon" fallback)
- [ ] Featured posts display in a separate section
- [ ] Individual blog post pages render full markdown content
- [ ] Table of contents generates from headings
- [ ] Related posts show at bottom of each article
- [ ] Blog RSS feed available at `/blog/feed.xml`
- [ ] Category filtering works
- [ ] All tests pass
