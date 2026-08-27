# Prompt 47: Videos Hub

## Context

Both CoinDesk and CoinTelegraph have dedicated video sections. CoinDesk has `/videos` with sub-pages for shows (`/videos/coindesk-daily`, `/videos/coindesk-spotlight`, `/videos/editors-picks`, `/videos/shorts`). CoinTelegraph has `/category/multimedia`. Our project has no video content section at all, despite having a podcast page at `src/app/[locale]/podcast/page.tsx`.

Crypto news video content is a massive engagement driver. YouTube channels like CoinDesk TV, CoinBureau, and Lark Davis prove that video is the dominant format for crypto education and news. We should aggregate video content from top crypto YouTube channels and present it in a branded hub — similar to how we aggregate RSS news from multiple sources.

## Current State

```
src/app/[locale]/podcast/page.tsx     ← Exists (use as reference for media layout)
src/lib/sources.ts                     ← News source definitions (add video sources here)
src/components/NewsCard.tsx            ← Card component (extend for video cards)
```

No video page, no video API endpoint, no video components exist.

## Task

### Phase 1: Video API Endpoint

1. **Create `src/app/api/videos/route.ts`** — Aggregates video content from YouTube RSS feeds of top crypto channels

```typescript
// YouTube provides RSS feeds for channels at:
// https://www.youtube.com/feeds/videos.xml?channel_id=CHANNEL_ID

// Target channels to aggregate (add more as needed):
const VIDEO_SOURCES = [
  { name: "CoinDesk", channelId: "UCwF1NqjABYGOpOTC1JF-_rA" },
  { name: "Cointelegraph", channelId: "UCRqBu-grVSxK0B0iGhfeJBg" },
  { name: "Bankless", channelId: "UCAl9Ld79qaZxp9JzTOBiZQQ" },
  { name: "The Defiant", channelId: "UCL0J4MLEdLP0-UyLu0hCktg" },
  { name: "Real Vision", channelId: "UCXMHZ9oeimRJiPqagWo1Tpw" },
  { name: "Unchained", channelId: "UCWiiMnsnw5Isc2PP1wFHGnQ" },
];

// API should:
// - Fetch YouTube RSS feeds for each channel
// - Parse XML to extract: title, videoId, thumbnail, published date, description, channel name
// - Merge all videos, sort by date descending
// - Cache with 15-minute TTL
// - Support query params: ?source=bankless&limit=20&offset=0
// - Return JSON with pagination metadata
```

2. **Create `src/lib/video-sources.ts`** — Video source configuration

```typescript
export interface VideoSource {
  name: string;
  slug: string;
  channelId: string;
  channelUrl: string;
  category: "news" | "education" | "analysis" | "interviews" | "defi";
  icon?: string;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  embedUrl: string;
  publishedAt: string;
  source: VideoSource;
  duration?: string;
}
```

### Phase 2: Videos Hub Page

3. **Create `src/app/[locale]/videos/page.tsx`** — Main videos hub with:

- Hero section with the latest featured video (auto-embed)
- Filter tabs by source category: All | News | Education | Analysis | Interviews | DeFi
- Grid of video cards (3 columns desktop, 2 tablet, 1 mobile)
- Each card shows: thumbnail with play button overlay, title, source badge, time ago
- Clicking a card opens an inline YouTube embed (not a new tab)
- Infinite scroll or "Load more" pagination
- SEO metadata: title "Crypto Video News & Analysis", description, Open Graph tags

4. **Create `src/components/VideoCard.tsx`** — Reusable video card component

```typescript
interface VideoCardProps {
  video: Video;
  onPlay: (video: Video) => void;
  featured?: boolean;
}

// Card layout:
// - Thumbnail with 16:9 aspect ratio
// - Play button overlay (centered, semi-transparent)
// - Source badge (top-left corner)
// - Title (max 2 lines, truncated)
// - Source name + relative time (e.g. "CoinDesk • 2h ago")
// - Featured variant: larger, with description excerpt
```

5. **Create `src/components/VideoPlayer.tsx`** — Inline YouTube player modal/overlay

```typescript
// Uses YouTube iframe embed
// Closes on Escape key or clicking outside
// Responsive: full width on mobile, 16:9 max-width on desktop
// Shows video title, source, and published date below player
```

### Phase 3: Video Source Pages

6. **Create `src/app/[locale]/videos/[source]/page.tsx`** — Per-source video listing (e.g. `/videos/bankless`)

- Shows channel info header (name, description, subscriber count if available)
- Lists all videos from that source
- Link back to main videos hub

### Phase 4: Navigation & Integration

7. **Add "Videos" to the main navigation** in `src/components/Header.tsx`
   - Add between Podcasts and any existing media links
   - Use a Video/Play icon from Lucide

8. **Add video section to homepage** — Below the news feed, add a "Latest Videos" row
   - Show 4 latest video thumbnails in a horizontal scroll
   - "View all videos →" link

## Files to Create

- `src/app/api/videos/route.ts`
- `src/lib/video-sources.ts`
- `src/app/[locale]/videos/page.tsx`
- `src/app/[locale]/videos/[source]/page.tsx`
- `src/components/VideoCard.tsx`
- `src/components/VideoPlayer.tsx`

## Files to Modify

- `src/components/Header.tsx` — Add Videos nav link
- `src/app/[locale]/page.tsx` — Add Latest Videos section
- `messages/en.json` — Add video-related i18n strings

## Acceptance Criteria

- [ ] `/videos` page loads and displays aggregated video content from 6+ YouTube channels
- [ ] Videos are sorted by date, filterable by category
- [ ] Clicking a video opens an inline YouTube embed
- [ ] Per-source pages work (e.g. `/videos/bankless`)
- [ ] Page is responsive (1/2/3 column grid)
- [ ] 15-minute cache on API responses
- [ ] SEO metadata and Open Graph tags are set
- [ ] Navigation link added to header
