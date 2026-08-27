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
 * Macro & Economic API Examples - JavaScript/Node.js
 * Free Crypto News API - https://github.com/nirholas/cryptocurrency.cv
 *
 * Examples for macroeconomic endpoints: Fed data, DXY, correlations,
 * exchange rates, predictions, and global market data.
 */

const BASE_URL = 'https://cryptocurrency.cv';

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  return response.json();
}

// =============================================================================
// Macro Endpoints
// =============================================================================

async function getMacro() {
  return fetchJSON(`${BASE_URL}/api/macro`);
}

async function getMacroIndicators(indicator) {
  const url = new URL(`${BASE_URL}/api/macro/indicators`);
  if (indicator) url.searchParams.set('indicator', indicator);
  return fetchJSON(url.toString());
}

async function getFedData() {
  return fetchJSON(`${BASE_URL}/api/macro/fed`);
}

async function getDXY() {
  return fetchJSON(`${BASE_URL}/api/macro/dxy`);
}

async function getMacroCorrelations(asset = 'BTC') {
  return fetchJSON(`${BASE_URL}/api/macro/correlations?asset=${asset}`);
}

async function getRiskAppetite() {
  return fetchJSON(`${BASE_URL}/api/macro/risk-appetite`);
}

// =============================================================================
// Exchange Rates
// =============================================================================

async function getExchangeRates() {
  return fetchJSON(`${BASE_URL}/api/exchange-rates`);
}

async function convertCurrency(from, to, amount) {
  return fetchJSON(
    `${BASE_URL}/api/exchange-rates/convert?from=${from}&to=${to}&amount=${amount}`
  );
}

// =============================================================================
// Global & Market Data
// =============================================================================

async function getGlobalData() {
  return fetchJSON(`${BASE_URL}/api/global`);
}

async function getFearGreed() {
  return fetchJSON(`${BASE_URL}/api/fear-greed`);
}

async function getGainers(limit = 20) {
  return fetchJSON(`${BASE_URL}/api/market/gainers?limit=${limit}`);
}

async function getLosers(limit = 20) {
  return fetchJSON(`${BASE_URL}/api/market/losers?limit=${limit}`);
}

async function getMovers() {
  return fetchJSON(`${BASE_URL}/api/market/movers`);
}

async function getDominance() {
  return fetchJSON(`${BASE_URL}/api/market/dominance`);
}

async function getHeatmap() {
  return fetchJSON(`${BASE_URL}/api/market/heatmap`);
}

// =============================================================================
// Predictions & Forecasts
// =============================================================================

async function getPredictions(asset) {
  const url = new URL(`${BASE_URL}/api/predictions`);
  if (asset) url.searchParams.set('asset', asset);
  return fetchJSON(url.toString());
}

async function getPredictionHistory(asset) {
  const url = new URL(`${BASE_URL}/api/predictions/history`);
  if (asset) url.searchParams.set('asset', asset);
  return fetchJSON(url.toString());
}

async function getPredictionMarkets() {
  return fetchJSON(`${BASE_URL}/api/predictions/markets`);
}

async function getForecast(asset = 'BTC', horizon = '7d') {
  return fetchJSON(`${BASE_URL}/api/forecast?asset=${asset}&horizon=${horizon}`);
}

// =============================================================================
// Run Examples
// =============================================================================

async function runExamples() {
  console.log('\n' + '='.repeat(60));
  console.log('FREE CRYPTO NEWS API - MACRO & ECONOMIC EXAMPLES (JavaScript)');
  console.log('='.repeat(60));

  console.log('\n🌍 1. Macro Overview');
  const macro = await getMacro();
  console.log('   Macro:', JSON.stringify(macro).slice(0, 200));

  console.log('\n🏛️ 2. Fed Data');
  const fed = await getFedData();
  console.log('   Fed:', JSON.stringify(fed).slice(0, 200));

  console.log('\n💲 3. Dollar Index');
  const dxy = await getDXY();
  console.log('   DXY:', JSON.stringify(dxy).slice(0, 200));

  console.log('\n📊 4. Correlations');
  const corr = await getMacroCorrelations('BTC');
  console.log('   Correlations:', JSON.stringify(corr).slice(0, 200));

  console.log('\n💱 5. Exchange Rates');
  const rates = await getExchangeRates();
  console.log('   Rates:', JSON.stringify(rates).slice(0, 200));

  console.log('\n🔄 6. Convert 1 BTC to USD');
  const conversion = await convertCurrency('BTC', 'USD', 1);
  console.log('   Result:', JSON.stringify(conversion).slice(0, 200));

  console.log('\n🌐 7. Global Data');
  const global = await getGlobalData();
  console.log('   Global:', JSON.stringify(global).slice(0, 200));

  console.log('\n🔮 8. Predictions');
  const predictions = await getPredictions('BTC');
  console.log('   Predictions:', JSON.stringify(predictions).slice(0, 200));

  console.log('\n📈 9. Gainers');
  const gainers = await getGainers(5);
  console.log('   Gainers:', JSON.stringify(gainers).slice(0, 200));

  console.log('\n' + '='.repeat(60));
  console.log('All macro examples completed!');
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    getMacro,
    getMacroIndicators,
    getFedData,
    getDXY,
    getMacroCorrelations,
    getRiskAppetite,
    getExchangeRates,
    convertCurrency,
    getGlobalData,
    getFearGreed,
    getGainers,
    getLosers,
    getMovers,
    getDominance,
    getHeatmap,
    getPredictions,
    getPredictionHistory,
    getPredictionMarkets,
    getForecast,
    runExamples,
  };
}

if (require.main === module) {
  runExamples().catch(console.error);
}
