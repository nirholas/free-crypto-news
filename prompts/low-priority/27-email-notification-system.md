# Prompt 27: Email Notification System

## Context

The notifications page (`src/app/[locale]/notifications/page.tsx`) has an Email channel toggle that is permanently `disabled` with `onToggle={() => {}}` (a no-op). It shows a "Coming soon" description and a "Soon" badge. The magic link auth route (`src/app/api/auth/login/route.ts`) has a `TODO` to integrate with an email service. A `RESEND_API_KEY` check exists but email delivery is only partially wired up.

## Current State

```
src/app/[locale]/notifications/page.tsx  ← Email toggle: disabled, onToggle={() => {}}, badge="Soon"
src/app/api/auth/login/route.ts          ← TODO: Integrate with email service (Resend)
src/app/api/newsletter/route.ts          ← Newsletter subscribe/verify/unsubscribe stubs exist
src/lib/db/schema.ts                     ← DB schema exists (users, api_keys, etc.)
```

## Task

### Phase 1: Email Service Abstraction

1. **Create `src/lib/email/provider.ts`** — Provider interface + Resend implementation

```typescript
export interface EmailProvider {
  send(params: {
    to: string;
    subject: string;
    html: string;
    text?: string;
    replyTo?: string;
    tags?: { name: string; value: string }[];
  }): Promise<{ id: string }>;
}

export class ResendProvider implements EmailProvider { ... }
export class ConsoleProvider implements EmailProvider { ... } // Dev fallback
```

2. **Create `src/lib/email/templates.ts`** — Email templates

```typescript
export function magicLinkEmail(link: string): {
  subject: string;
  html: string;
  text: string;
};
export function notificationDigestEmail(notifications: Notification[]): {
  subject: string;
  html: string;
  text: string;
};
export function alertTriggeredEmail(alert: Alert): {
  subject: string;
  html: string;
  text: string;
};
export function welcomeEmail(name: string): {
  subject: string;
  html: string;
  text: string;
};
```

3. **Create `src/lib/email/index.ts`** — Singleton + send helpers

```typescript
export function getEmailProvider(): EmailProvider;
export async function sendEmail(
  params: SendEmailParams,
): Promise<{ id: string }>;
```

### Phase 2: Notification Preferences DB Schema

4. **Extend `src/lib/db/schema.ts`** — Add notification preferences table

```typescript
export const notificationPreferences = pgTable("notification_preferences", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  emailEnabled: boolean("email_enabled").default(false),
  emailDigestFrequency: text("email_digest_frequency").default("daily"), // 'realtime' | 'daily' | 'weekly'
  pushEnabled: boolean("push_enabled").default(true),
  inAppEnabled: boolean("in_app_enabled").default(true),
  quietHoursEnabled: boolean("quiet_hours_enabled").default(false),
  quietHoursStart: text("quiet_hours_start").default("22:00"),
  quietHoursEnd: text("quiet_hours_end").default("08:00"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Phase 3: Notification API Routes

5. **Create `src/app/api/notifications/preferences/route.ts`** — GET/PUT for user notification preferences
6. **Create `src/app/api/notifications/email/verify/route.ts`** — Email verification for notifications
7. **Update `src/app/api/newsletter/route.ts`** — Wire up actual email sending via the provider

### Phase 4: Wire Up Auth Magic Link

8. **Update `src/app/api/auth/login/route.ts`**:
   - Remove the `TODO` comment
   - Replace the inline Resend `fetch()` call with `sendEmail()` from the new provider
   - Use the `magicLinkEmail()` template
   - Always send (not only when `RESEND_API_KEY` is set) — fall back to `ConsoleProvider` in dev

### Phase 5: Update Notifications UI

9. **Update `src/app/[locale]/notifications/page.tsx`**:
   - Remove `disabled` from the Email `<ToggleRow>`
   - Replace `onToggle={() => {}}` with actual handler that calls `PUT /api/notifications/preferences`
   - Change `description="Coming soon"` to `description="Receive email digests"`
   - Remove `badge="Soon"`
   - Add email verification flow if email not yet verified

### Phase 6: Email Digest Cron Job

10. **Create `src/lib/inngest/functions/send-email-digest.ts`** — Daily digest job

```typescript
export const sendDailyDigest = inngest.createFunction(
  { id: "send-daily-email-digest", name: "Send Daily Email Digest" },
  { cron: "0 9 * * *" }, // 9 AM UTC daily
  async ({ step }) => {
    // 1. Get all users with emailEnabled && emailDigestFrequency === 'daily'
    // 2. For each user, fetch their alerts/notifications since last digest
    // 3. Send digest email via provider
    // 4. Record last digest sent timestamp
  },
);
```

### Phase 7: Tests

11. **Create `src/lib/email/__tests__/provider.test.ts`** — Provider unit tests
12. **Create `src/lib/email/__tests__/templates.test.ts`** — Template render tests
13. **Create `src/app/api/notifications/__tests__/preferences.test.ts`** — API route tests

## Environment Variables

```bash
RESEND_API_KEY=re_...          # Resend API key (free tier: 100 emails/day)
EMAIL_FROM=noreply@cryptocurrency.cv
```

## Package to Install

```bash
pnpm add resend
```

## Acceptance Criteria

- [ ] Email toggle on notifications page is functional (not disabled)
- [ ] Magic link auth sends real emails when `RESEND_API_KEY` is set, console fallback otherwise
- [ ] TODO comment removed from auth/login route
- [ ] User can enable/disable email notifications
- [ ] Daily email digest cron job sends personalized summaries
- [ ] Email verification flow works
- [ ] All tests pass
