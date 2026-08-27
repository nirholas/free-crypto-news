/**
 * The one list of API routes that are deliberately absent from the public
 * surface: internal tooling, system probes, auth callbacks, cron entry points
 * and anything exempt from x402 metering.
 *
 * This list used to be copy-pasted into scripts/generate-route-manifest.js and
 * scripts/validate-endpoint-docs.js. The copies drifted by about twenty
 * patterns, so the validator counted routes the generator excludes on purpose
 * as undocumented gaps and reported a coverage number that was wrong in a way
 * nobody could act on. One export, imported by both, cannot drift.
 *
 * Adding a pattern here hides a route from the route manifest, the OpenAPI
 * spec, docs/API.md and llms-full.txt. Do that only for something genuinely
 * internal; a public product endpoint belongs in the docs even when its name
 * looks operational (/api/sources/health reports which RSS sources are
 * answering and is very much for readers).
 */

const EXCLUDE_PATTERNS = [
  /\/admin/,
  /\/cron\//,
  /\/internal\//,
  /\/auth\//,
  /\/inngest/,
  /\/well-known/,
  /\/register$/,
  /\/keys\/(rotate|upgrade|usage)/,
  /\/dashboard/,
  // Only the system liveness probe. A per-subject health view is a product
  // endpoint, so the two internal ones are named explicitly instead.
  /^\/api\/health$/,
  /\/onchain\/health$/,
  /\/llms/,
  /\/openapi/,
  /\/webhooks\/(queue|test)/,
  /\/sample$/,
  /\/push$/,
  /\/monitor$/,
  /\/cache$/,
  /\/providers/,
  /\/origins$/,
  /\/pipelines$/,
  /\/gateway$/,
  /\/billing/,
  /\/upgrade$/,
  /\/contact$/,
  /\/newsletter/,
  /\/notifications/,
  /\/storage/,
  /\/metrics$/,
  /\/stats$/,
  /\/docs$/,
  /\/views$/,
  /\/i18n\//,
  /\/frames$/,
  /\/premium\/api-keys/,
  /\/premium\/streams/, // use premium/stream instead
  /\/data-sources\/defi/,
  /\/defi\/protocol-health/,
  /\/defi\/yields\/stats/,
  /\/onchain\/(funding-metrics|lth-metrics|miner-metrics|whale-metrics)/,
  /\/bitcoin\/(network-stats|stats)/,
  // Written to match both the filesystem form ([slug]) and the OpenAPI form
  // ({slug}); callers normalise at different points.
  /\/nft\/collections\/[[{]slug[\]}]\/(stats|activity)/,
  /\/funding\/dashboard/,
];

/** True when a route path is deliberately kept off the public surface. */
function isExcludedRoute(route) {
  return EXCLUDE_PATTERNS.some((re) => re.test(route));
}

module.exports = { EXCLUDE_PATTERNS, isExcludedRoute };
