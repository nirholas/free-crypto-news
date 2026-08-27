# Prompt 55: Ethics & Editorial Policy Page

## Context

CoinDesk has `/ethics` and CoinTelegraph has `/editorial-policy`. For a news aggregator to be taken seriously — especially one competing with institutional crypto media — a published editorial policy is essential. It establishes trust, explains sourcing methodology, and addresses potential conflicts of interest.

This is particularly important for an aggregator because:
1. Users need to understand how sources are selected and ranked
2. Transparency about AI usage in content curation builds trust
3. Clear policies on sponsored content prevent erosion of credibility
4. Media industry standards require published editorial guidelines

## Current State

```
src/app/[locale]/about/page.tsx    ← About page exists
src/app/[locale]/terms/page.tsx    ← Terms page exists
src/app/[locale]/privacy/page.tsx  ← Privacy page exists
```

No ethics or editorial policy page exists.

## Task

### Phase 1: Editorial Policy Page

1. **Create `src/app/[locale]/editorial-policy/page.tsx`** — Comprehensive editorial policy

The page should cover these sections with clear headings:

```
## Our Mission
What free-crypto-news aims to do: provide free, unbiased, comprehensive
crypto news aggregation for everyone.

## Source Selection Criteria
How we choose which news sources to aggregate:
- Editorial reputation and track record
- Factual accuracy history
- Regular publishing cadence
- Coverage breadth (not just one topic)
- No pay-to-play: sources are not paid to be included
- Sources can be removed for persistent inaccuracy

## Content Curation
How articles are ranked and presented:
- Chronological by default (newest first)
- No manual editorial boosting of specific articles
- Algorithm transparency: articles are ranked by recency, source quality tier,
  and topic relevance — not by commercial relationships
- AI is used for: categorization, summarization, translation — not for
  generating original reporting

## Corrections & Accuracy
- We aggregate content as-is from source publications
- If a source publishes a correction, it is reflected in our feed
- Factual errors in our own content (learn articles, guides, glossary)
  can be reported via contact page
- We label content types clearly: News, Opinion, Sponsored, Press Release

## Conflicts of Interest
- free-crypto-news does not hold positions in cryptocurrencies as an organization
- Individual contributors may hold crypto assets; this does not influence
  source selection or article ranking
- Sponsored content is always clearly labeled
- API partnerships do not influence editorial content or source ranking

## AI & Automation Disclosure
- AI is used for article categorization, tagging, and language translation
- AI-generated summaries are labeled as such
- No AI-generated articles are presented as human-written journalism
- Our AI content detection endpoint is publicly available

## Sponsored Content Policy
- All sponsored/paid content is clearly marked with a "Sponsored" label
- Sponsored content does not appear in the main news feed by default
- Press releases are separated into their own section
- Advertising does not influence which articles appear in feeds

## User-Generated Content
- User comments, if enabled, do not represent editorial views
- Community contributions to guides/glossary are reviewed before publishing

## Contact
How to reach us with editorial concerns, corrections, or complaints.
```

### Phase 2: Ethics Page

2. **Create `src/app/[locale]/ethics/page.tsx`** — Ethics statement (shorter, principles-focused)

This can be a companion page or a redirect to editorial-policy. Content:

```
## Core Principles
1. **Accuracy** — We only aggregate from verified news sources
2. **Transparency** — Our algorithms and data sources are documented
3. **Independence** — No commercial relationship influences content ranking
4. **Accessibility** — Free tier always available, no paywalls on aggregated news
5. **Privacy** — Minimal data collection, no tracking beyond analytics
6. **Open Source** — Our code is publicly auditable

## Compliance
- GDPR compliant
- No misleading financial claims
- Age-appropriate content only
- Respect for intellectual property (proper attribution, linking to source)
```

### Phase 3: Integration

3. **Add "Editorial Policy" link to footer** — In the legal/info section alongside Terms, Privacy
4. **Add to about page** — Reference editorial policy from the about page
5. **Reference from advertising disclosure** — Link editorial policy from the ad disclosure page

## Files to Create

- `src/app/[locale]/editorial-policy/page.tsx`
- `src/app/[locale]/ethics/page.tsx`

## Files to Modify

- `src/components/Footer.tsx` — Add Editorial Policy link
- `src/app/[locale]/about/page.tsx` — Add reference to editorial policy
- `messages/en.json` — Add editorial policy i18n strings

## Acceptance Criteria

- [ ] `/editorial-policy` displays comprehensive editorial guidelines
- [ ] `/ethics` displays core ethical principles
- [ ] Source selection criteria clearly explained
- [ ] AI usage fully disclosed
- [ ] Sponsored content policy clearly stated
- [ ] Conflicts of interest addressed
- [ ] Corrections process documented
- [ ] Footer link added
- [ ] SEO metadata set
- [ ] Clean, readable layout with clear section headings
- [ ] Professional tone matching institutional media standards
