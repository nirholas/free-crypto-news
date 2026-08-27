# Prompt 35: Telegram Bot Missing Feature Handlers

## Context

The Telegram bot (`telegram/src/callbacks.ts`) has a default fallback at line 631 that returns `'⚠️ Feature coming soon!'` for unrecognized menu callback items. This means any new menu buttons that are added without corresponding handler cases fall through to this message.

## Current State

```
telegram/
├── package.json
├── tsconfig.json
├── src/
│   ├── index.ts         ← Bot entry point
│   ├── api.ts           ← API client wrapping cryptocurrency.cv endpoints
│   ├── callbacks.ts     ← Callback query handlers (637 lines)
│   ├── menus.ts         ← Inline keyboard menu definitions
│   └── commands.ts      ← /command handlers

telegram/src/callbacks.ts line 631:
  await ctx.editMessageText('⚠️ Feature coming soon!', { ... })
```

The bot already has extensive handlers for: news (by category), prices (individual + top10), sentiment (by asset), fear/greed, trending, whales, digest, defi, stablecoins, L2, token unlocks, gas, funding rates, macro, predictions, briefing, NFT market, gaming news, airdrops, exchanges, ask, search, help.

## Task

### Phase 1: Audit Menu Items vs Handlers

1. **Compare `telegram/src/menus.ts` with `telegram/src/callbacks.ts`** — Find all menu button callback data values that don't have corresponding handler cases. List each unhandled callback.

### Phase 2: Implement Missing Handlers

2. For each unhandled menu callback, implement the handler in `telegram/src/callbacks.ts`:

   Example pattern (following existing code style):

```typescript
case 'portfolio': {
  // If there's no API endpoint for this yet, show a helpful message
  // with instructions rather than generic "coming soon"
  await ctx.editMessageText(
    '📊 <b>Portfolio Tracker</b>\n\n' +
    'Track your crypto portfolio directly in Telegram!\n\n' +
    'Use these commands:\n' +
    '<code>/portfolio add BTC 0.5</code>\n' +
    '<code>/portfolio remove ETH</code>\n' +
    '<code>/portfolio show</code>',
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text('« Main Menu', 'menu:main'),
    }
  );
  break;
}
```

3. For features that genuinely can't be implemented yet (no backend), replace the generic "Feature coming soon!" with a **specific** message explaining what the feature will do and when:

```typescript
// Instead of:
await ctx.editMessageText('⚠️ Feature coming soon!', { ... });

// Use:
await ctx.editMessageText(
  '🚧 <b>Portfolio Tracker</b>\n\n' +
  'We\'re building a portfolio tracker for Telegram.\n' +
  'In the meantime, track your portfolio on the web:\n' +
  '🔗 <a href="https://cryptocurrency.cv/portfolio">cryptocurrency.cv/portfolio</a>',
  {
    parse_mode: 'HTML',
    link_preview_options: { is_disabled: true },
    reply_markup: new InlineKeyboard().text('« Main Menu', 'menu:main'),
  }
);
```

### Phase 3: Remove Generic Fallback

4. **Update the default case** — Instead of a generic "Feature coming soon!" message, log the unhandled callback for monitoring:

```typescript
default:
  console.warn(`[BOT] Unhandled command callback: ${command}`);
  await ctx.editMessageText(
    `❓ This feature isn't available yet.\n\nUse /menu to see all available options.`,
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text('« Main Menu', 'menu:main'),
    }
  );
  break;
```

### Phase 4: Add /help Command Enhancement

5. **Update help output** to reflect all actually-working features (remove any that are still stubs)

### Phase 5: Tests

6. **Create `telegram/src/__tests__/callbacks.test.ts`** — Test each callback handler with mocked context

## Acceptance Criteria

- [ ] No menu button triggers "Feature coming soon!" generic message
- [ ] Each menu callback has a specific handler or specific "not yet available" message with useful context
- [ ] Default fallback logs unhandled callbacks for monitoring
- [ ] Help command accurately lists only working features
- [ ] All tests pass
