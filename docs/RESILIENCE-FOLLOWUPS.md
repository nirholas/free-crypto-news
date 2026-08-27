# Data-provider resilience: done + follow-ups

The keyless CoinGecko tier (`api.coingecko.com`) is heavily rate-limited in
production. Any surface that depends solely on CoinGecko with no fallback
returns 5xx (or renders blank) whenever CoinGecko throttles. The data layer
already has fallback chains (CoinPaprika, CoinCap, Binance, DefiLlama); the fix
in each case is to route the surface through the resilient lib function instead
of a raw CoinGecko `fetch`.

## The single highest-impact lever

Set `COINGECKO_API_KEY` (free demo key at coingecko.com/en/api) on the Cloud Run
service. It is already wired (`x-cg-demo-api-key` header across the codebase) and
raises the rate-limit ceiling that forces all the fallbacks below. Everything
here is defense-in-depth on top of that key.

## Fixed (2026-07-19)

- `getGlobalDeFiData()` (src/lib/market-data.ts) — added a DefiLlama fallback
  (real TVL, DEX volume, top chain). Fixes `/api/market/defi` (was 500) and
  `/api/market/global-defi` (was 503).
- `/api/global` — now uses `getGlobalMarketData()` (CoinPaprika fallback) and
  degrades to a 200 empty payload. This powers the header MarketWidget on every
  page.
- `/bitcoin`, `/ethereum`, `/solana` landing pages — now use `getCoinDetails()`
  (CoinPaprika -> CoinCap fallback) so the price panel survives a throttle.
- `/api/market/dominance` — degrades to 200 empty instead of 503.
- `/api/v1/coin/[coinId]` — falls back to `getCoinDetails()` on non-404 upstream
  failure instead of 502.
- Fixed wrong CoinGecko header `x-cg-demo-key` -> `x-cg-demo-api-key` in the
  OHLCV adapter.

## Fixed (2026-08-27)

Every route handler that still reached an upstream through a bare `fetch()` now
goes through `resilientFetchResponse` (8s deadline, one retry on a transient
408/429/5xx, shared per-service circuit breaker): 74 call sites across 32 routes.
The follow-ups listed below were closed at the same time.

- `/api/charts` — `market_chart` and `ohlc` now carry a deadline and a retry.
- `/api/v1/trending` — falls back to `getTrending()` (CoinCap) and answers with
  `degraded: true` plus `X-Data-Degraded` rather than 502ing on a throttle.
- `/api/v1/market-data` — the two upstreams settle independently, so one being
  throttled no longer nulls the other, and the global half falls back to
  `getGlobalMarketData()` (CoinPaprika).
- `/api/compare` — routed through `fetchCoinGecko()`, which brings the shared
  cache and API-key header, so a throttle serves the last good comparison.
- `/api/exchange-rates` — serves the last good table (`X-Data-Stale`) and, with
  nothing cached, an empty table the currency selector already handles, instead
  of propagating a 429 as a 500.

New alongside them: `/api/sources/health` reports which RSS sources are actually
answering (success rate, latency, last error), which is how a rotting source
becomes visible at all now that `fetchFeed()` swallows failures by design.

## Verified already-safe (no change needed)

`/api/market/{heatmap,gainers,losers,movers,derivatives,coins,categories,exchanges,search,tickers,history,ohlc}`,
`/api/fear-greed`, `/api/gas`, `/api/prices`, `/api/trending`, `/api/stats`,
`/api/defi/{summary,dex-volumes}` — all already degrade to empty arrays/objects
via lib-level fallbacks.
