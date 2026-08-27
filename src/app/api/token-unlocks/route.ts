/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/free-crypto-news
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * Token Unlocks API
 * GET /api/token-unlocks — returns token vesting/unlock schedule data
 *
 * Backed by the Token Unlocks adapter (src/lib/apis/tokenunlocks.ts) when
 * TOKEN_UNLOCKS_API_KEY is configured and the upstream responds. Otherwise the
 * curated list below is served, tagged `source: 'static'`. Past unlocks are
 * dropped and the remainder is sorted soonest first in both modes.
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getUpcomingUnlocks, type TokenUnlock } from '@/lib/apis/tokenunlocks';

interface UnlockEntry {
  id: string;
  token: string;
  symbol: string;
  unlockDate: string;
  unlockAmount: string;
  unlockValue: string;
  percentOfSupply: string;
  recipient: string;
  vestingType: string;
  impact: string;
}

const STATIC_UNLOCKS: UnlockEntry[] = [
  { id: '1', token: 'Arbitrum', symbol: 'ARB', unlockDate: '2026-03-16', unlockAmount: '92.65M ARB', unlockValue: '~$120M', percentOfSupply: '0.93%', recipient: 'Team & Advisors', vestingType: 'cliff', impact: 'high' },
  { id: '2', token: 'Optimism', symbol: 'OP', unlockDate: '2026-03-31', unlockAmount: '31.34M OP', unlockValue: '~$85M', percentOfSupply: '0.73%', recipient: 'Core Contributors', vestingType: 'periodic', impact: 'medium' },
  { id: '3', token: 'Aptos', symbol: 'APT', unlockDate: '2026-03-12', unlockAmount: '11.31M APT', unlockValue: '~$130M', percentOfSupply: '1.03%', recipient: 'Foundation & Investors', vestingType: 'periodic', impact: 'high' },
  { id: '4', token: 'Sui', symbol: 'SUI', unlockDate: '2026-04-01', unlockAmount: '64.19M SUI', unlockValue: '~$95M', percentOfSupply: '0.64%', recipient: 'Series A & B Investors', vestingType: 'cliff', impact: 'medium' },
  { id: '5', token: 'Worldcoin', symbol: 'WLD', unlockDate: '2026-07-24', unlockAmount: '600M WLD', unlockValue: '~$1.5B', percentOfSupply: '6.0%', recipient: 'Community & TFH', vestingType: 'cliff', impact: 'high' },
  { id: '6', token: 'Celestia', symbol: 'TIA', unlockDate: '2026-10-31', unlockAmount: '175.6M TIA', unlockValue: '~$700M', percentOfSupply: '17.56%', recipient: 'Early Backers', vestingType: 'cliff', impact: 'high' },
  { id: '7', token: 'Starknet', symbol: 'STRK', unlockDate: '2026-04-15', unlockAmount: '127M STRK', unlockValue: '~$180M', percentOfSupply: '1.27%', recipient: 'Early Contributors', vestingType: 'linear', impact: 'medium' },
  { id: '8', token: 'Jito', symbol: 'JTO', unlockDate: '2026-12-07', unlockAmount: '135M JTO', unlockValue: '~$400M', percentOfSupply: '13.5%', recipient: 'Core & Investors', vestingType: 'cliff', impact: 'high' },
];

const compactUsd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  notation: 'compact',
  maximumFractionDigits: 1,
});
const compactNumber = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 2 });

function fromAdapter(u: TokenUnlock): UnlockEntry {
  return {
    id: u.id,
    token: u.name,
    symbol: u.symbol,
    unlockDate: u.nextUnlockDate,
    unlockAmount: `${compactNumber.format(u.nextUnlockAmount)} ${u.symbol}`,
    unlockValue: `~${compactUsd.format(u.nextUnlockValueUsd)}`,
    percentOfSupply: `${u.nextUnlockPercentCirculating.toFixed(2)}%`,
    recipient: 'Scheduled vesting',
    vestingType: 'scheduled',
    impact: u.impact,
  };
}

async function loadUnlocks(): Promise<{ unlocks: UnlockEntry[]; source: 'tokenunlocks' | 'static' }> {
  try {
    const live = await getUpcomingUnlocks();
    if (live.length > 0) {
      return { unlocks: live.map(fromAdapter), source: 'tokenunlocks' };
    }
  } catch (error) {
    console.warn('[token-unlocks] upstream unavailable, serving static list:', error);
  }
  return { unlocks: STATIC_UNLOCKS, source: 'static' };
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const impact = searchParams.get('impact');
  const symbol = searchParams.get('symbol');
  const includePast = searchParams.get('includePast') === 'true';
  const limit = Math.max(1, Math.min(parseInt(searchParams.get('limit') || '50', 10) || 50, 200));

  const { unlocks, source } = await loadUnlocks();

  const startOfToday = new Date();
  startOfToday.setUTCHours(0, 0, 0, 0);
  const cutoff = startOfToday.getTime();

  let filtered = unlocks;
  if (!includePast) filtered = filtered.filter((u) => new Date(u.unlockDate).getTime() >= cutoff);
  if (impact) filtered = filtered.filter((u) => u.impact === impact);
  if (symbol) filtered = filtered.filter((u) => u.symbol.toLowerCase() === symbol.toLowerCase());

  filtered = [...filtered]
    .sort((a, b) => new Date(a.unlockDate).getTime() - new Date(b.unlockDate).getTime())
    .slice(0, limit);

  return NextResponse.json({
    unlocks: filtered,
    total: filtered.length,
    highImpact: filtered.filter((u) => u.impact === 'high').length,
    source,
    generatedAt: new Date().toISOString(),
  }, {
    headers: {
      'Cache-Control': source === 'tokenunlocks'
        ? 'public, s-maxage=3600, stale-while-revalidate=7200'
        : 'public, s-maxage=600, stale-while-revalidate=3600',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
