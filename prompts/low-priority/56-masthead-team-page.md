# Prompt 56: Masthead / Team Page

## Context

CoinDesk has `/masthead` listing their editorial team — editors, reporters, columnists, and leadership. This is a journalism industry standard that builds credibility and accountability. For a crypto news aggregator, a masthead page serves a different but equally important purpose: it shows the people and contributors behind the platform, establishes trust, and humanizes the project.

## Current State

```
src/app/[locale]/about/page.tsx    ← About page exists (may already mention team)
```

No masthead or team page exists.

## Task

### Phase 1: Team Page

1. **Create `src/app/[locale]/team/page.tsx`** — Team / masthead page

```
Layout:
┌──────────────────────────────────────────────────────┐
│  👥 Our Team                                         │
│  The people behind free-crypto-news                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│  Leadership                                          │
│  ┌──────────────┐                                   │
│  │ 👤 [Photo]  │  Name                              │
│  │             │  Role — Founder / Lead Developer    │
│  │             │  Short bio (2-3 sentences)          │
│  │             │  [GitHub] [Twitter/X] [LinkedIn]    │
│  └──────────────┘                                   │
│                                                      │
│  Contributors                                        │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐            │
│  │ 👤 Name │ │ 👤 Name │ │ 👤 Name │            │
│  │ Role     │ │ Role     │ │ Role     │            │
│  └──────────┘ └──────────┘ └──────────┘            │
│                                                      │
│  Open Source Contributors                            │
│  Thanks to our X GitHub contributors who have        │
│  helped build this project.                          │
│  [View all contributors on GitHub →]                │
│                                                      │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │avatar│ │avatar│ │avatar│ │avatar│ │avatar│    │
│  │ name │ │ name │ │ name │ │ name │ │ name │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
│                                                      │
│  ────────────                                        │
│  Join Us                                             │
│  We're always looking for contributors.              │
│  [View open issues on GitHub →]                     │
│  [Read our contributing guide →]                     │
└──────────────────────────────────────────────────────┘
```

### Phase 2: Team Data

2. **Create `src/data/team.ts`** — Team member definitions

```typescript
export interface TeamMember {
  name: string;
  slug: string;
  role: string;
  bio: string;
  avatarUrl?: string;      // Local or GitHub avatar
  githubUsername?: string;
  twitterHandle?: string;
  linkedinUrl?: string;
  type: "leadership" | "core" | "contributor";
}

// For the initial version, this can be populated with:
// - The project creator (nirholas)
// - Any known core contributors from git history
// - Placeholder for future team members

export const TEAM: TeamMember[] = [
  {
    name: "nirholas",
    slug: "nirholas",
    role: "Founder & Lead Developer",
    bio: "Building the free and open crypto news infrastructure the industry needs.",
    githubUsername: "nirholas",
    type: "leadership",
  },
  // ... additional team members
];
```

### Phase 3: GitHub Contributors Integration

3. **Create `src/app/api/contributors/route.ts`** — Fetch GitHub contributors

```typescript
// Use GitHub API to fetch repository contributors:
// GET https://api.github.com/repos/nirholas/free-crypto-news/contributors
// Cache for 24 hours
// Return: avatar, username, contributions count, profile URL
// This dynamically populates the "Open Source Contributors" section
```

### Phase 4: Integration

4. **Add "Team" link to the footer** in the "Company" or "About" section
5. **Cross-link from about page** — Add "Meet the team →" link from about page
6. **Add structured data** — Organization schema with team members

## Files to Create

- `src/app/[locale]/team/page.tsx`
- `src/data/team.ts`
- `src/app/api/contributors/route.ts`
- `src/components/TeamMemberCard.tsx`

## Files to Modify

- `src/components/Footer.tsx` — Add Team link
- `src/app/[locale]/about/page.tsx` — Add "Meet the team" link
- `messages/en.json` — Add team page i18n strings

## Acceptance Criteria

- [ ] `/team` page displays team members in categorized sections
- [ ] Leadership section with full bios and social links
- [ ] GitHub contributors auto-populated from API (cached 24h)
- [ ] Contributor avatars link to their GitHub profiles
- [ ] "Join Us" section with links to contributing guide and open issues
- [ ] Footer link added
- [ ] Cross-linked from about page
- [ ] Responsive grid layout (3-col desktop, 2-col tablet, 1-col mobile)
- [ ] SEO metadata with Organization structured data
