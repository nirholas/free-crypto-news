# Prompt 57: Press Release Submission

## Context

CoinTelegraph has a dedicated `/press-release-submission` page where projects can submit press releases for publishing. CoinDesk separates press releases at `/press-release`. This is a revenue opportunity (paid PR distribution is a standard media business model) and ensures the platform has comprehensive coverage of project announcements.

Since we're an aggregator, our press release system would:
1. Accept submissions from crypto projects (self-serve)
2. Publish them in a clearly separated section (not mixed with editorial news)
3. Optionally charge for featured placement (monetization)
4. Auto-distribute via our API and feeds

## Current State

```
src/app/[locale]/contact/page.tsx      ← Contact page (reference for forms)
src/app/api/contact/route.ts           ← Contact API (reference for form handling)
```

No press release submission system exists.

## Task

### Phase 1: Press Release Submission Form

1. **Create `src/app/[locale]/submit-press-release/page.tsx`** — Submission page

```
Layout:
┌──────────────────────────────────────────────────────┐
│  📰 Submit a Press Release                           │
│  Get your announcement in front of thousands of      │
│  crypto enthusiasts, developers, and investors.      │
├──────────────────────────────────────────────────────┤
│                                                      │
│  How It Works                                        │
│  1. Submit your press release using the form below   │
│  2. Our team reviews for quality and relevance       │
│  3. Approved releases are published within 24h       │
│  4. Your release appears in our feed, API, and RSS   │
│                                                      │
│  Guidelines                                          │
│  ✓ Must be related to cryptocurrency or blockchain   │
│  ✓ Written in English (other languages accepted)     │
│  ✓ No misleading claims or guaranteed returns        │
│  ✓ Include project name, website, and contact info   │
│  ✗ No duplicate submissions                          │
│  ✗ No malicious or scam projects                     │
│                                                      │
│  ── Submission Form ──                               │
│                                                      │
│  Project Name:     [_______________]                 │
│  Project Website:  [_______________]                 │
│  Contact Email:    [_______________]                 │
│  Contact Name:     [_______________]                 │
│                                                      │
│  Press Release Title: [______________________]       │
│  Category: [Dropdown: Product Launch | Partnership | │
│            Funding | Exchange Listing | Protocol     │
│            Update | Report | Event | Other]          │
│                                                      │
│  Press Release Body:                                 │
│  [Textarea - rich text or markdown]                  │
│  Min 200 words, max 3000 words                       │
│                                                      │
│  Featured Image URL: [_______________] (optional)    │
│                                                      │
│  □ I agree to the terms and guidelines above         │
│  □ I confirm this is not spam or misleading content  │
│                                                      │
│  [Submit Press Release]                              │
│                                                      │
│  ── Pricing ──                                       │
│  Free: Standard listing (published within 48h)       │
│  $99: Priority review (published within 4h)          │
│  $299: Featured placement (pinned for 24h + social)  │
│                                                      │
│  [Contact us for enterprise packages]               │
└──────────────────────────────────────────────────────┘
```

### Phase 2: Press Release API

2. **Create `src/app/api/press-release/route.ts`** — Submission endpoint

```typescript
// POST /api/press-release
// Body: {
//   projectName: string,
//   projectUrl: string,
//   contactEmail: string,
//   contactName: string,
//   title: string,
//   category: string,
//   body: string,
//   imageUrl?: string,
//   tier: "free" | "priority" | "featured",
// }
//
// Validations:
// - Required fields present
// - Email format valid
// - Body length 200-3000 words
// - URL format valid
// - Rate limit: max 3 submissions per email per day
// - Sanitize all inputs (prevent XSS)
//
// On success:
// - Store submission in database/file
// - Send confirmation email to submitter
// - Send notification to admin for review
// - Return submission ID
```

3. **Create `src/app/api/press-release/[id]/route.ts`** — Admin approval endpoint

```typescript
// PATCH /api/press-release/[id]
// Auth: Admin only
// Body: { status: "approved" | "rejected", reviewNote?: string }
// On approve: publish to press release feed, notify submitter
// On reject: notify submitter with reason
```

### Phase 3: Press Release Feed

4. **Create `src/app/[locale]/press-releases/page.tsx`** — Press releases listing page

- Separate section clearly labeled "Press Releases"
- Disclaimer: "Press releases are submitted by third parties and do not represent editorial content"
- Filter by category
- Each card shows: Title, project name, category badge, date, "PRESS RELEASE" label
- Pagination

### Phase 4: Integration

5. **Add press releases to API output** with `contentType: "press-release"` filter
6. **Add "Submit PR" link** to header (secondary nav) and footer
7. **Add press releases to RSS feed** as separate feed or tagged entries
8. **Admin dashboard section** for reviewing pending submissions

## Files to Create

- `src/app/[locale]/submit-press-release/page.tsx`
- `src/app/[locale]/press-releases/page.tsx`
- `src/app/api/press-release/route.ts`
- `src/app/api/press-release/[id]/route.ts`
- `src/lib/press-release.ts` — Types and utilities
- `src/components/PressReleaseCard.tsx`

## Files to Modify

- `src/components/Footer.tsx` — Add Submit PR and Press Releases links
- `src/components/Header.tsx` — Add Submit PR link (secondary nav)
- `messages/en.json` — Add press release i18n strings

## Acceptance Criteria

- [ ] `/submit-press-release` page with complete submission form
- [ ] Form validation: required fields, word count, email format, URL format
- [ ] Rate limiting on submissions (3 per email per day)
- [ ] Input sanitization to prevent XSS
- [ ] Submission stored with pending status for admin review
- [ ] `/press-releases` listing page with clear labeling and filters
- [ ] Admin approval/rejection endpoint
- [ ] Confirmation email sent on submission
- [ ] Press releases clearly separated from editorial news
- [ ] "PRESS RELEASE" badge on all PR cards
- [ ] Responsive forms and listing
