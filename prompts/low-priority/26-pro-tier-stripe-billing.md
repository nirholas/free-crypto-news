# Prompt 26: Implement Pro Tier with Stripe Billing

## Context

The pricing page (`src/app/[locale]/pricing/page.tsx`) advertises a Pro tier at $29/mo but the CTA is disabled with a "Coming Soon" badge. There is no payment integration, no subscription management, and no feature gating. The About page roadmap (`src/app/[locale]/about/page.tsx`) also lists "Pro Tier with Advanced Analytics" as coming soon.

## Current State

```
src/app/[locale]/pricing/page.tsx     ← Pro tier CTA disabled, badge: "Coming Soon"
src/app/[locale]/about/page.tsx       ← Roadmap lists Pro as "Coming Soon"
src/app/[locale]/contact/page.tsx     ← FAQ references unreleased Pro tier
src/app/api/auth/login/route.ts       ← Magic link auth exists
src/lib/auth/                         ← Auth system exists (users, tokens, sessions)
src/lib/db/schema.ts                  ← Drizzle schema exists
src/app/api/keys/route.ts             ← API key management exists
```

## Task

### Phase 1: Stripe Integration

1. **Create `src/lib/billing/stripe.ts`** — Stripe client singleton

```typescript
import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
});

export const PLANS = {
  free: { name: 'Free', priceId: null, rateLimit: 100, features: [...] },
  pro: { name: 'Pro', priceId: process.env.STRIPE_PRO_PRICE_ID!, rateLimit: 10000, features: [...] },
  enterprise: { name: 'Enterprise', priceId: null, rateLimit: null, features: [...] },
} as const;
```

2. **Create `src/lib/billing/subscriptions.ts`** — Subscription CRUD

```typescript
export async function createCheckoutSession(
  userId: string,
  priceId: string,
): Promise<string>;
export async function createCustomerPortalSession(
  userId: string,
): Promise<string>;
export async function getSubscription(
  userId: string,
): Promise<Subscription | null>;
export async function cancelSubscription(userId: string): Promise<void>;
export async function handleWebhookEvent(event: Stripe.Event): Promise<void>;
```

3. **Add DB schema** — Extend `src/lib/db/schema.ts`

```typescript
export const subscriptions = pgTable("subscriptions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  stripeCustomerId: text("stripe_customer_id").notNull(),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan").notNull().default("free"),
  status: text("status").notNull().default("active"),
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});
```

### Phase 2: API Routes

4. **Create `src/app/api/billing/checkout/route.ts`** — POST creates Stripe checkout session
5. **Create `src/app/api/billing/portal/route.ts`** — POST creates Stripe customer portal session
6. **Create `src/app/api/billing/webhook/route.ts`** — POST handles Stripe webhooks (`checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`)
7. **Create `src/app/api/billing/status/route.ts`** — GET returns current user's subscription status

### Phase 3: Feature Gating Middleware

8. **Create `src/lib/billing/gate.ts`** — Middleware to check subscription tier

```typescript
export function requirePlan(plan: "pro" | "enterprise") {
  return async (req: NextRequest) => {
    const session = await getSession(req);
    if (!session) return unauthorized();
    const sub = await getSubscription(session.userId);
    if (!sub || sub.plan === "free") return paymentRequired();
    // Continue...
  };
}
```

9. **Gate Pro-only routes** — Apply to: `/api/ai/analyze`, `/api/webhooks/*`, `/api/premium/*`

### Phase 4: Update UI

10. **Update `src/app/[locale]/pricing/page.tsx`**:
    - Change Pro CTA from `disabled: true` to an active checkout link
    - Remove `badge: "Coming Soon"` from Pro tier
    - Add "Current Plan" badge for authenticated users

11. **Update `src/app/[locale]/about/page.tsx`**:
    - Change `{ label: "Coming Soon", title: "Pro Tier with Advanced Analytics", done: false }` to `{ label: "Launched", title: "Pro Tier with Advanced Analytics", done: true }`

12. **Update `src/app/[locale]/contact/page.tsx`**:
    - Update FAQ to describe Pro as live instead of "coming soon"

### Phase 5: Tests

13. **Create `src/lib/billing/__tests__/stripe.test.ts`** — Unit tests with mocked Stripe
14. **Create `src/lib/billing/__tests__/subscriptions.test.ts`** — Subscription lifecycle tests
15. **Create `src/lib/billing/__tests__/gate.test.ts`** — Feature gating tests

## Environment Variables

```bash
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Package to Install

```bash
pnpm add stripe
```

## Acceptance Criteria

- [ ] Pro CTA links to Stripe Checkout (no more "Coming Soon")
- [ ] Stripe webhook correctly activates/deactivates subscriptions
- [ ] Pro-only routes return 402 for free-tier users
- [ ] Customer portal available for managing subscription
- [ ] All tests pass
- [ ] About page roadmap updated to "Launched"
