#!/usr/bin/env node

/**
 * Validate that every route in the manifest has endpoint metadata.
 *
 * Exit code 0 = all routes documented.
 * Exit code 1 = missing or invalid metadata.
 *
 * Run: node scripts/validate-endpoint-docs.js
 */

const fs = require("fs");
const path = require("path");

const MANIFEST_PATH = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "openapi",
  "routes.generated.ts"
);
const METADATA_PATH = path.join(
  __dirname,
  "..",
  "src",
  "lib",
  "openapi",
  "endpoint-metadata.generated.ts"
);

// ─── Discover route files on disk ────────────────────────────────────────────
//
// The manifest is a generated snapshot and can lag behind src/app/api. Coverage is
// therefore measured against the route.ts files that actually exist, so "100%"
// means every real, documentable endpoint is described, not every remembered one.

const API_DIR = path.join(__dirname, "..", "src", "app", "api");

// The same exclusion list the manifest generator uses (scripts/route-exclusions.js),
// so "documentable" here means exactly what the generator emits. These two used
// to keep separate copies, which is why this report once counted deliberately
// internal routes as missing documentation.
const { isExcludedRoute } = require('./route-exclusions.js');
const { toOpenApiPath } = require('./generate-route-manifest.js');

function walkRouteFiles(dir, out) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkRouteFiles(full, out);
    else if (entry.isFile() && entry.name === "route.ts") out.push(full);
  }
  return out;
}

// The manifest stores OpenAPI-form paths (`{id}`); the filesystem uses Next's
// `[id]`. Comparing the two raw made every one of the 36 dynamic routes show up
// twice: once as "on disk but missing from the manifest" and once as "in the
// manifest with no route.ts", which buried the real gaps in noise.
function routeFileToApiPath(file) {
  const rel = path.relative(path.join(API_DIR, ".."), path.dirname(file));
  return toOpenApiPath("/" + rel.split(path.sep).join("/"));
}

const allRouteFiles = walkRouteFiles(API_DIR, []).map(routeFileToApiPath).sort();
const filesystemRoutes = new Set(
  allRouteFiles.filter((route) => !isExcludedRoute(route))
);

// ─── Parse manifest routes ───────────────────────────────────────────────────

const manifestContent = fs.readFileSync(MANIFEST_PATH, "utf-8");
const routeRegex = /"path":\s*"([^"]+)"/g;
const manifestRoutes = new Set();
let m;
while ((m = routeRegex.exec(manifestContent)) !== null) {
  manifestRoutes.add(m[1]);
}

// ─── Parse metadata entries ──────────────────────────────────────────────────

const metadataContent = fs.readFileSync(METADATA_PATH, "utf-8");
const metaRegex = /^\s*"(\/api\/[^"]+)":\s*\{/gm;
const metadataRoutes = new Set();
while ((m = metaRegex.exec(metadataContent)) !== null) {
  metadataRoutes.add(m[1]);
}

// ─── Validate descriptions are non-empty ─────────────────────────────────────

const descRegex = /^\s*"(\/api\/[^"]+)":\s*\{[^}]*description:\s*"([^"]*)"/gm;
const emptyDescriptions = [];
while ((m = descRegex.exec(metadataContent)) !== null) {
  if (!m[2] || m[2].trim().length < 5) {
    emptyDescriptions.push(m[1]);
  }
}

// ─── Check coverage ──────────────────────────────────────────────────────────

const missingInMetadata = [...manifestRoutes].filter(
  (r) => !metadataRoutes.has(r)
);
const extraInMetadata = [...metadataRoutes].filter(
  (r) => !manifestRoutes.has(r)
);
const missingFromManifest = [...filesystemRoutes].filter(
  (r) => !manifestRoutes.has(r)
);
const staleInManifest = [...manifestRoutes].filter(
  (r) => !filesystemRoutes.has(r)
);
const undocumentedOnDisk = [...filesystemRoutes].filter(
  (r) => !metadataRoutes.has(r)
);
const documentedOnDisk = filesystemRoutes.size - undocumentedOnDisk.length;
const trueCoverage = filesystemRoutes.size
  ? (documentedOnDisk / filesystemRoutes.size) * 100
  : 0;

// ─── Report ──────────────────────────────────────────────────────────────────

console.log("╔══════════════════════════════════════════════════════════════╗");
console.log("║           Endpoint Documentation Validation Report          ║");
console.log("╚══════════════════════════════════════════════════════════════╝");
console.log();
console.log(`  route.ts on disk:   ${allRouteFiles.length} (${filesystemRoutes.size} documentable after exclusions)`);
console.log(`  Manifest routes:    ${manifestRoutes.size}`);
console.log(`  Documented routes:  ${metadataRoutes.size}`);
console.log(
  `  Manifest coverage:  ${((metadataRoutes.size / manifestRoutes.size) * 100).toFixed(1)}% of the manifest`
);
console.log(
  `  True coverage:      ${trueCoverage.toFixed(1)}% of documentable route.ts files (${documentedOnDisk}/${filesystemRoutes.size})`
);
console.log();

let hasErrors = false;

if (missingInMetadata.length > 0) {
  hasErrors = true;
  console.log(
    `  ✗ ${missingInMetadata.length} route(s) missing from endpoint metadata:`
  );
  for (const route of missingInMetadata.sort()) {
    console.log(`    - ${route}`);
  }
  console.log();
}

if (emptyDescriptions.length > 0) {
  hasErrors = true;
  console.log(
    `  ✗ ${emptyDescriptions.length} route(s) with empty/short descriptions:`
  );
  for (const route of emptyDescriptions.sort()) {
    console.log(`    - ${route}`);
  }
  console.log();
}

if (missingFromManifest.length > 0) {
  hasErrors = true;
  console.log(
    `  ✗ ${missingFromManifest.length} route.ts file(s) on disk missing from the manifest (run: node scripts/generate-route-manifest.js):`
  );
  for (const route of missingFromManifest.sort()) {
    console.log(`    - ${route}`);
  }
  console.log();
}

if (staleInManifest.length > 0) {
  hasErrors = true;
  console.log(
    `  ✗ ${staleInManifest.length} manifest route(s) with no route.ts on disk:`
  );
  for (const route of staleInManifest.sort()) {
    console.log(`    - ${route}`);
  }
  console.log();
}

if (extraInMetadata.length > 0) {
  console.log(
    `  ⚠ ${extraInMetadata.length} extra route(s) in metadata not in manifest:`
  );
  for (const route of extraInMetadata.sort()) {
    console.log(`    - ${route}`);
  }
  console.log();
}

if (!hasErrors) {
  console.log("  ✓ All routes documented with valid descriptions");
  console.log("  ✓ 100% documentation coverage of the route.ts files on disk");
  console.log();
  process.exit(0);
} else {
  console.log("  Run: node scripts/generate-route-manifest.js && node scripts/generate-endpoint-metadata.js");
  console.log("  to regenerate the manifest and metadata from route files.");
  console.log();
  process.exit(1);
}
