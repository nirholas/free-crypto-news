/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/cryptocurrency.cv
 */

import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';
import { BUILD_INFO } from '@/lib/build-info';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

let APP_VERSION = 'unknown';
try {
  APP_VERSION = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf-8')).version;
} catch {
  // package.json is not shipped in every runtime layout
}

/**
 * GET /api/version
 *
 * Deploy verification: returns the git commit, build time and Cloud Run
 * revision serving this response. Exempt from rate limiting and x402.
 */
export function GET() {
  return NextResponse.json(
    {
      name: 'free-crypto-news',
      version: APP_VERSION,
      ...BUILD_INFO,
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
    { headers: { 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' } },
  );
}
