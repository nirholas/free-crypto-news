# Prompt 29: Webhooks & Real-Time Alerts System

## Context

The About page roadmap (`src/app/[locale]/about/page.tsx`) lists "Webhooks & Real-Time Alerts" as "Coming Soon". The codebase has an in-app alert system (`src/lib/alerts.ts`, `src/lib/alert-rules.ts`, `src/app/[locale]/alerts/page.tsx`) and a webhook queue route (`src/app/api/webhooks/queue/route.ts`), but there's no complete user-facing webhook registration, delivery, or retry system.

## Current State

```
src/lib/alerts.ts                        ← Alert evaluation engine exists
src/lib/alert-rules.ts                   ← Rule matching engine exists
src/app/[locale]/alerts/page.tsx         ← Alert creation UI exists
src/app/api/webhooks/queue/route.ts      ← Basic webhook queue with retry
src/app/[locale]/about/page.tsx          ← "Webhooks & Real-Time Alerts" = Coming Soon
```

## Task

### Phase 1: Webhook Registration

1. **Add webhook schema to `src/lib/db/schema.ts`**

```typescript
export const webhooks = pgTable("webhooks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  url: text("url").notNull(),
  secret: text("secret").notNull(), // For HMAC signature
  events: text("events").array().notNull(), // ['news.breaking', 'price.alert', 'whale.alert', ...]
  active: boolean("active").default(true),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  lastTriggeredAt: timestamp("last_triggered_at"),
  failureCount: integer("failure_count").default(0),
  consecutiveFailures: integer("consecutive_failures").default(0),
});

export const webhookDeliveries = pgTable("webhook_deliveries", {
  id: text("id").primaryKey(),
  webhookId: text("webhook_id")
    .notNull()
    .references(() => webhooks.id),
  event: text("event").notNull(),
  payload: jsonb("payload").notNull(),
  status: text("status").notNull().default("pending"), // pending, delivered, failed, dead
  responseStatus: integer("response_status"),
  responseBody: text("response_body"),
  attempts: integer("attempts").default(0),
  maxAttempts: integer("max_attempts").default(5),
  nextRetryAt: timestamp("next_retry_at"),
  deliveredAt: timestamp("delivered_at"),
  createdAt: timestamp("created_at").defaultNow(),
});
```

2. **Create `src/app/api/webhooks/route.ts`** — CRUD for webhook registrations

```
GET    /api/webhooks          — List user's webhooks
POST   /api/webhooks          — Register new webhook (validates URL with test ping)
PATCH  /api/webhooks?id=xxx   — Update webhook (URL, events, active)
DELETE /api/webhooks?id=xxx   — Delete webhook
```

### Phase 2: Webhook Delivery Engine

3. **Create `src/lib/webhooks/delivery.ts`** — Delivery with HMAC signatures + retries

```typescript
export async function deliverWebhook(
  webhook: Webhook,
  event: string,
  payload: unknown,
): Promise<void>;
// - Sign payload with HMAC-SHA256 using webhook's secret
// - Set headers: X-Webhook-ID, X-Webhook-Event, X-Webhook-Signature, X-Webhook-Timestamp
// - 5-second timeout
// - Record delivery attempt
// - On failure: schedule exponential backoff retry (1m, 5m, 30m, 2h, 12h)
// - After 5 consecutive failures: auto-disable webhook, notify user

export async function processRetryQueue(): Promise<void>;
// - Find all pending deliveries where nextRetryAt <= now
// - Re-attempt delivery
```

4. **Create `src/lib/webhooks/events.ts`** — Event types + fanout

```typescript
export type WebhookEvent =
  | "news.breaking"
  | "news.published"
  | "price.alert"
  | "price.threshold"
  | "whale.transfer"
  | "market.fear_greed_change"
  | "defi.tvl_change"
  | "onchain.large_transfer"
  | "token.unlock";

export async function emitWebhookEvent(
  event: WebhookEvent,
  payload: unknown,
): Promise<void>;
// - Find all active webhooks subscribed to this event
// - Queue deliveries for each
```

### Phase 3: Wire Events to News Pipeline

5. **Update `src/lib/inngest/functions/enrich-article.ts`** — Emit `news.published` and `news.breaking` events when new articles are processed
6. **Create `src/lib/inngest/functions/process-webhook-retries.ts`** — Cron job to process retry queue every 1 minute

### Phase 4: Webhook Management UI

7. **Create `src/app/[locale]/webhooks/page.tsx`** — Webhook management dashboard

```
- List registered webhooks with status badges (active/paused/failed)
- "Add Webhook" form: URL, events (checkbox list), description
- Test webhook button (sends test payload)
- Delivery log: recent deliveries with status, response code, timestamp
- Enable/disable toggle
- Delete button
```

### Phase 5: Update Roadmap

8. **Update `src/app/[locale]/about/page.tsx`**:
   - Change `{ label: "Coming Soon", title: "Webhooks & Real-Time Alerts", done: false }` to `{ label: "Launched", title: "Webhooks & Real-Time Alerts", done: true }`

### Phase 6: Tests

9. **Create `src/lib/webhooks/__tests__/delivery.test.ts`** — Test HMAC signing, retry logic, failure handling
10. **Create `src/lib/webhooks/__tests__/events.test.ts`** — Test event fanout
11. **Create `src/app/api/webhooks/__tests__/route.test.ts`** — API route tests

## Acceptance Criteria

- [ ] Users can register webhooks via API and UI
- [ ] Webhook URL validated with test ping on creation
- [ ] HMAC-SHA256 signature on every delivery
- [ ] Exponential backoff retries (5 attempts)
- [ ] Auto-disable after 5 consecutive failures
- [ ] Breaking news triggers `news.breaking` webhook event
- [ ] Delivery log viewable in UI
- [ ] About page roadmap updated to "Launched"
- [ ] All tests pass
