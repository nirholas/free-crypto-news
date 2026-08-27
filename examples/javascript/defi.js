/**
 * @copyright 2024-2026 nirholas. All rights reserved.
 * @license SPDX-License-Identifier: SEE LICENSE IN LICENSE
 * @see https://github.com/nirholas/cryptocurrency.cv
 *
 * This file is part of free-crypto-news.
 * Unauthorized copying, modification, or distribution is strictly prohibited.
 * For licensing inquiries: nirholas@users.noreply.github.com
 */

/**
 * DeFi API Examples - JavaScript/Node.js
 * Free Crypto News API - https://github.com/nirholas/cryptocurrency.cv
 *
 * Examples for DeFi endpoints: yields, stablecoins, protocol health,
 * bridges, and DEX volumes.
 */

const BASE_URL = 'https://cryptocurrency.cv';

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return response.json();
}

// =============================================================================
// DeFi Overview & Summary
// =============================================================================

async function getDefi(limit = 20) {
  return fetchJSON(`${BASE_URL}/api/defi?limit=${limit}`);
}

async function getDefiSummary() {
  return fetchJSON(`${BASE_URL}/api/defi/summary`);
}

// =============================================================================
// Protocol Health
// =============================================================================

async function getProtocolHealth(protocol) {
  const url = new URL(`${BASE_URL}/api/defi/protocol-health`);
  if (protocol) url.searchParams.set('protocol', protocol);
  return fetchJSON(url.toString());
}

// =============================================================================
// DeFi Yields
// =============================================================================

async function getDefiYields({ chain, project, stablecoin } = {}) {
  const url = new URL(`${BASE_URL}/api/defi/yields`);
  if (chain) url.searchParams.set('chain', chain);
  if (project) url.searchParams.set('project', project);
  if (stablecoin) url.searchParams.set('stablecoin', 'true');
  return fetchJSON(url.toString());
}

async function getYieldStats() {
  return fetchJSON(`${BASE_URL}/api/defi/yields/stats`);
}

async function getYieldsByChain() {
  return fetchJSON(`${BASE_URL}/api/defi/yields/chains`);
}

async function getYieldsByProject() {
  return fetchJSON(`${BASE_URL}/api/defi/yields/projects`);
}

async function getMedianYields() {
  return fetchJSON(`${BASE_URL}/api/defi/yields/median`);
}

async function getStablecoinYields() {
  return fetchJSON(`${BASE_URL}/api/defi/yields/stablecoins`);
}

async function searchYields(query) {
  return fetchJSON(`${BASE_URL}/api/defi/yields/search?q=${encodeURIComponent(query)}`);
}

async function getPoolChart(poolId) {
  return fetchJSON(`${BASE_URL}/api/defi/yields/${poolId}/chart`);
}

// =============================================================================
// Stablecoins
// =============================================================================

async function getStablecoins() {
  return fetchJSON(`${BASE_URL}/api/stablecoins`);
}

async function getStablecoin(symbol) {
  return fetchJSON(`${BASE_URL}/api/stablecoins/${symbol}`);
}

async function getStablecoinDepeg() {
  return fetchJSON(`${BASE_URL}/api/stablecoins/depeg`);
}

async function getStablecoinDominance() {
  return fetchJSON(`${BASE_URL}/api/stablecoins/dominance`);
}

async function getStablecoinFlows() {
  return fetchJSON(`${BASE_URL}/api/stablecoins/flows`);
}

async function getStablecoinChains() {
  return fetchJSON(`${BASE_URL}/api/stablecoins/chains`);
}

// =============================================================================
// DEX & Bridges
// =============================================================================

async function getDexVolumes() {
  return fetchJSON(`${BASE_URL}/api/defi/dex-volumes`);
}

async function getDefiBridges() {
  return fetchJSON(`${BASE_URL}/api/defi/bridges`);
}

async function getDefiStablecoins() {
  return fetchJSON(`${BASE_URL}/api/defi/stablecoins`);
}

// =============================================================================
// Run Examples
// =============================================================================

async function runExamples() {
  console.log('\n' + '='.repeat(60));
  console.log('FREE CRYPTO NEWS API - DEFI EXAMPLES (JavaScript)');
  console.log('='.repeat(60));

  console.log('\n🏦 1. DeFi Summary');
  const summary = await getDefiSummary();
  console.log('   Summary:', JSON.stringify(summary).slice(0, 200));

  console.log('\n❤️ 2. Protocol Health');
  const health = await getProtocolHealth();
  console.log('   Health:', JSON.stringify(health).slice(0, 200));

  console.log('\n💰 3. DeFi Yields (Ethereum)');
  const yields = await getDefiYields({ chain: 'ethereum' });
  console.log('   Yields:', JSON.stringify(yields).slice(0, 200));

  console.log('\n📊 4. Yield Stats');
  const stats = await getYieldStats();
  console.log('   Stats:', JSON.stringify(stats).slice(0, 200));

  console.log('\n🪙 5. Stablecoins');
  const stablecoins = await getStablecoins();
  console.log('   Stablecoins:', JSON.stringify(stablecoins).slice(0, 200));

  console.log('\n⚠️ 6. Depeg Monitor');
  const depeg = await getStablecoinDepeg();
  console.log('   Depeg:', JSON.stringify(depeg).slice(0, 200));

  console.log('\n📈 7. DEX Volumes');
  const dex = await getDexVolumes();
  console.log('   DEX:', JSON.stringify(dex).slice(0, 200));

  console.log('\n🌉 8. Bridges');
  const bridges = await getDefiBridges();
  console.log('   Bridges:', JSON.stringify(bridges).slice(0, 200));

  console.log('\n' + '='.repeat(60));
  console.log('All DeFi examples completed!');
}

// Export functions
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getDefi,
    getDefiSummary,
    getProtocolHealth,
    getDefiYields,
    getYieldStats,
    getYieldsByChain,
    getYieldsByProject,
    getMedianYields,
    getStablecoinYields,
    searchYields,
    getPoolChart,
    getStablecoins,
    getStablecoin,
    getStablecoinDepeg,
    getStablecoinDominance,
    getStablecoinFlows,
    getStablecoinChains,
    getDexVolumes,
    getDefiBridges,
    getDefiStablecoins,
    runExamples,
  };
}

if (require.main === module) {
  runExamples().catch(console.error);
}
