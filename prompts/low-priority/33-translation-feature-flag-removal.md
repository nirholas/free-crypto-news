# Prompt 33: Translation Feature Flag Removal

## Context

Real-time news translation is gated behind `FEATURE_TRANSLATION=true` in `src/lib/translate.ts` (line 39). The feature is fully implemented (304 lines) with Groq-based translation, in-memory caching, support for 40+ languages, and batch translation. It just needs the flag removed and proper defaults set so it works out of the box when a `GROQ_API_KEY` is provided.

## Current State

```
src/lib/translate.ts     ← Full implementation (304 lines), disabled by FEATURE_TRANSLATION flag
                            - Uses Groq free tier (fast inference)
                            - In-memory cache to avoid re-translating
                            - Supports 40+ languages
                            - Batch translation support
                            - Falls back gracefully when no API key
```

## Task

### Phase 1: Remove Feature Flag

1. **Update `src/lib/translate.ts`**:
   - **Remove** the `FEATURE_TRANSLATION` flag check
   - **Change behavior**: Translation should be enabled automatically when `GROQ_API_KEY` is set
   - If `GROQ_API_KEY` is not set, return original untranslated content (graceful no-op)
   - Remove the `const TRANSLATION_ENABLED = process.env.FEATURE_TRANSLATION === 'true';` line
   - Update all guards from `if (!TRANSLATION_ENABLED)` to `if (!process.env.GROQ_API_KEY)`
   - Update the JSDoc comment to remove `FEATURE FLAG:` notice

2. **Update translation cache** — Replace in-memory `Map` with a TTL-based cache:

```typescript
// Use a simple LRU with TTL to prevent unbounded memory growth
// Max 10,000 entries, 24h TTL
class TranslationCache {
  private cache = new Map<string, { value: TranslatedArticle; expiresAt: number }>();
  private maxSize = 10_000;
  private ttlMs = 24 * 60 * 60 * 1000;

  get(key: string): TranslatedArticle | null { ... }
  set(key: string, value: TranslatedArticle): void { ... }
  private evict(): void { ... }
}
```

### Phase 2: Improve Translation Quality

3. **Add translation fallback** — If Groq fails, try a secondary provider:

```typescript
async function translateWithFallback(
  text: string,
  targetLang: string,
): Promise<string> {
  try {
    return await translateWithGroq(text, targetLang);
  } catch {
    // Fallback to Google Translate free API or return original
    console.warn(`[TRANSLATE] Groq failed, returning original text`);
    return text;
  }
}
```

4. **Add rate limiting** — Groq free tier has limits. Add per-minute rate limiting:

```typescript
// Max 30 translation requests per minute (Groq free tier)
const rateLimiter = new SlidingWindowRateLimiter(30, 60_000);
```

### Phase 3: Update Documentation

5. **Update `.env.example`** — Add `GROQ_API_KEY` with comment explaining it enables translation
6. **Remove references to `FEATURE_TRANSLATION`** from any documentation or env files

### Phase 4: Tests

7. **Create `src/lib/__tests__/translate.test.ts`**:
   - Test translation with mocked Groq API
   - Test caching (second call returns cached result)
   - Test LRU eviction
   - Test graceful fallback when no API key
   - Test rate limiting

## Acceptance Criteria

- [ ] `FEATURE_TRANSLATION` flag completely removed
- [ ] Translation works automatically when `GROQ_API_KEY` is set
- [ ] Graceful no-op when `GROQ_API_KEY` is not set (returns original text)
- [ ] Translation cache has TTL and max size (no unbounded growth)
- [ ] Rate limiting prevents Groq API abuse
- [ ] All tests pass
