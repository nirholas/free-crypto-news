#!/usr/bin/env node

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
 * @fileoverview Free Crypto News CLI (fcn)
 *
 * Feature-rich command-line interface for accessing crypto news, prices,
 * market data, and more from your terminal.
 *
 * @example
 *   fcn news --limit 5
 *   fcn search "ethereum ETF"
 *   fcn prices --format json
 *   fcn watch bitcoin
 */

// ---------------------------------------------------------------------------
// Constants & Configuration
// ---------------------------------------------------------------------------

const VERSION = '2.0.0';
const API_BASE = 'https://cryptocurrency.cv/api';

const useColor = !process.argv.includes('--no-color') && process.env.NO_COLOR === undefined;

const C = {
  reset: useColor ? '\x1b[0m' : '',
  bold: useColor ? '\x1b[1m' : '',
  dim: useColor ? '\x1b[2m' : '',
  italic: useColor ? '\x1b[3m' : '',
  underline: useColor ? '\x1b[4m' : '',
  red: useColor ? '\x1b[31m' : '',
  green: useColor ? '\x1b[32m' : '',
  yellow: useColor ? '\x1b[33m' : '',
  blue: useColor ? '\x1b[34m' : '',
  magenta: useColor ? '\x1b[35m' : '',
  cyan: useColor ? '\x1b[36m' : '',
  white: useColor ? '\x1b[37m' : '',
  bgRed: useColor ? '\x1b[41m' : '',
  bgGreen: useColor ? '\x1b[42m' : '',
  bgYellow: useColor ? '\x1b[43m' : '',
  bgBlue: useColor ? '\x1b[44m' : '',
};

const SOURCE_COLORS = {
  CoinDesk: C.blue,
  'The Block': C.magenta,
  Decrypt: C.green,
  CoinTelegraph: C.yellow,
  'Bitcoin Magazine': C.yellow,
  Blockworks: C.blue,
  'The Defiant': C.magenta,
  DLNews: C.cyan,
  'Unchained': C.green,
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function termWidth() {
  return process.stdout.columns || 80;
}

function truncate(str, max) {
  if (!str) return '';
  if (str.length <= max) return str;
  return str.slice(0, max - 1) + '…';
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, '');
}

function pad(str, len, align = 'left') {
  const visible = stripAnsi(str);
  const diff = len - visible.length;
  if (diff <= 0) return str;
  if (align === 'right') return ' '.repeat(diff) + str;
  return str + ' '.repeat(diff);
}

function formatNumber(n) {
  if (n === null || n === undefined) return '—';
  if (typeof n !== 'number') n = Number(n);
  if (isNaN(n)) return '—';
  if (Math.abs(n) >= 1e12) return (n / 1e12).toFixed(2) + 'T';
  if (Math.abs(n) >= 1e9) return (n / 1e9).toFixed(2) + 'B';
  if (Math.abs(n) >= 1e6) return (n / 1e6).toFixed(2) + 'M';
  if (Math.abs(n) >= 1e3) return (n / 1e3).toFixed(2) + 'K';
  if (Math.abs(n) < 0.01) return n.toFixed(6);
  if (Math.abs(n) < 1) return n.toFixed(4);
  return n.toLocaleString('en-US', { maximumFractionDigits: 2 });
}

function colorPercent(val) {
  if (val === null || val === undefined) return `${C.dim}—${C.reset}`;
  const n = typeof val === 'number' ? val : parseFloat(val);
  if (isNaN(n)) return `${C.dim}—${C.reset}`;
  const sign = n >= 0 ? '+' : '';
  const color = n >= 0 ? C.green : C.red;
  return `${color}${sign}${n.toFixed(2)}%${C.reset}`;
}

function clearScreen() {
  process.stdout.write('\x1b[2J\x1b[H');
}

function spinner(text) {
  const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
  let i = 0;
  const id = setInterval(() => {
    process.stdout.write(`\r${C.cyan}${frames[i++ % frames.length]}${C.reset} ${text}`);
  }, 80);
  return { stop: () => { clearInterval(id); process.stdout.write('\r' + ' '.repeat(text.length + 4) + '\r'); } };
}

// ---------------------------------------------------------------------------
// API Client
// ---------------------------------------------------------------------------

async function apiFetch(path, params = {}) {
  const url = new URL(path, API_BASE.replace(/\/api$/, ''));
  if (!url.pathname.startsWith('/api')) {
    url.pathname = '/api' + url.pathname;
  }
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }

  const loading = spinner(`Fetching ${path.replace(/^\/api\//, '')}...`);

  try {
    const res = await fetch(url.toString(), {
      headers: { 'User-Agent': `fcn-cli/${VERSION}`, Accept: 'application/json' },
      signal: AbortSignal.timeout(15000),
    });
    loading.stop();
    if (!res.ok) {
      throw new Error(`API responded with ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    loading.stop();
    if (err.name === 'TimeoutError' || err.name === 'AbortError') {
      throw new Error('Request timed out — check your internet connection');
    }
    if (err.cause?.code === 'ENOTFOUND' || err.cause?.code === 'EAI_AGAIN') {
      throw new Error('Could not reach cryptocurrency.cv — are you online?');
    }
    throw err;
  }
}

async function apiFetchQuiet(path, params = {}) {
  const url = new URL(path, API_BASE.replace(/\/api$/, ''));
  if (!url.pathname.startsWith('/api')) {
    url.pathname = '/api' + url.pathname;
  }
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
  }
  const res = await fetch(url.toString(), {
    headers: { 'User-Agent': `fcn-cli/${VERSION}`, Accept: 'application/json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  return await res.json();
}

// ---------------------------------------------------------------------------
// Table Renderer
// ---------------------------------------------------------------------------

function renderTable(headers, rows) {
  if (rows.length === 0) {
    console.log(`${C.dim}No data available.${C.reset}`);
    return;
  }

  const colWidths = headers.map((h, i) => {
    const maxData = rows.reduce((max, row) => Math.max(max, stripAnsi(String(row[i] ?? '')).length), 0);
    return Math.max(stripAnsi(h.label).length, maxData);
  });

  // Constrain total width to terminal
  const maxW = termWidth() - headers.length - 1;
  const totalW = colWidths.reduce((a, b) => a + b, 0);
  if (totalW > maxW) {
    const ratio = maxW / totalW;
    for (let i = 0; i < colWidths.length; i++) {
      colWidths[i] = Math.max(4, Math.floor(colWidths[i] * ratio));
    }
  }

  // Header
  const headerLine = headers.map((h, i) =>
    `${C.bold}${pad(truncate(h.label, colWidths[i]), colWidths[i], h.align)}${C.reset}`
  ).join(' ');
  console.log(headerLine);

  // Separator
  console.log(`${C.dim}${colWidths.map(w => '─'.repeat(w)).join(' ')}${C.reset}`);

  // Rows
  for (const row of rows) {
    const line = headers.map((h, i) => {
      const val = String(row[i] ?? '');
      const truncated = truncate(val, colWidths[i] + (val.length - stripAnsi(val).length));
      return pad(truncated, colWidths[i] + (truncated.length - stripAnsi(truncated).length), h.align);
    }).join(' ');
    console.log(line);
  }
}

function toCSV(headers, rows) {
  const escape = (v) => {
    const s = stripAnsi(String(v ?? ''));
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [headers.map(h => escape(h.label)).join(',')];
  for (const row of rows) {
    lines.push(row.map(v => escape(v)).join(','));
  }
  return lines.join('\n');
}

// ---------------------------------------------------------------------------
// Argument Parser
// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = argv.slice(2);
  const opts = {
    command: null,
    positional: [],
    limit: 10,
    category: null,
    format: 'table',
    noColor: false,
    help: false,
    version: false,
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') { opts.help = true; i++; continue; }
    if (arg === '--version') { opts.version = true; i++; continue; }
    if (arg === '--no-color') { opts.noColor = true; i++; continue; }

    if (arg === '--limit' || arg === '-l') {
      opts.limit = parseInt(args[++i]) || 10;
      i++; continue;
    }
    if (arg === '--category') {
      opts.category = args[++i]; i++; continue;
    }
    if (arg === '--format') {
      opts.format = args[++i] || 'table'; i++; continue;
    }

    // Subcommand or positional
    if (!arg.startsWith('-')) {
      if (!opts.command) {
        opts.command = arg;
      } else {
        opts.positional.push(arg);
      }
    }
    i++;
  }

  return opts;
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

async function cmdNews(opts) {
  const params = { limit: opts.limit };
  if (opts.category) params.category = opts.category;
  const data = await apiFetch('/api/news', params);
  const articles = data.articles || data.data || [];

  if (opts.format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (opts.format === 'csv') {
    const headers = [{ label: 'Title' }, { label: 'Source' }, { label: 'Time' }, { label: 'URL' }];
    const rows = articles.map(a => [a.title, a.source, a.timeAgo || a.publishedAt, a.url || '']);
    console.log(toCSV(headers, rows));
    return;
  }

  console.log(`\n${C.bold}📰 Latest Crypto News${C.reset}\n`);
  const maxTitle = termWidth() - 6;
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const sourceColor = SOURCE_COLORS[a.source] || C.cyan;
    console.log(`${C.dim}${(i + 1).toString().padStart(2)}.${C.reset} ${C.bold}${truncate(a.title, maxTitle)}${C.reset}`);
    console.log(`    ${sourceColor}${a.source}${C.reset} ${C.dim}• ${a.timeAgo || a.publishedAt || ''}${C.reset}`);
    if (a.description) {
      console.log(`    ${C.dim}${truncate(a.description, maxTitle - 2)}${C.reset}`);
    }
    console.log();
  }
  printFooter();
}

async function cmdSearch(opts) {
  const query = opts.positional.join(' ');
  if (!query) {
    console.error(`${C.red}Error: search requires a query, e.g. fcn search "bitcoin ETF"${C.reset}`);
    process.exit(1);
  }

  const data = await apiFetch('/api/search', { q: query, limit: opts.limit });
  const articles = data.articles || data.results || data.data || [];

  if (opts.format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (opts.format === 'csv') {
    const headers = [{ label: 'Title' }, { label: 'Source' }, { label: 'Time' }, { label: 'URL' }];
    const rows = articles.map(a => [a.title, a.source, a.timeAgo || a.publishedAt, a.url || '']);
    console.log(toCSV(headers, rows));
    return;
  }

  console.log(`\n${C.bold}🔍 Search: "${query}"${C.reset}\n`);
  if (articles.length === 0) {
    console.log(`${C.dim}No results found for "${query}".${C.reset}`);
    return;
  }
  const maxTitle = termWidth() - 6;
  for (let i = 0; i < articles.length; i++) {
    const a = articles[i];
    const sourceColor = SOURCE_COLORS[a.source] || C.cyan;
    console.log(`${C.dim}${(i + 1).toString().padStart(2)}.${C.reset} ${C.bold}${truncate(a.title, maxTitle)}${C.reset}`);
    console.log(`    ${sourceColor}${a.source}${C.reset} ${C.dim}• ${a.timeAgo || a.publishedAt || ''}${C.reset}`);
    console.log();
  }
  printFooter();
}

async function cmdPrices(opts) {
  const data = await apiFetch('/api/prices', { limit: opts.limit });
  const prices = data.prices || data.data || data.coins || [];

  if (opts.format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const headers = [
    { label: '#', align: 'right' },
    { label: 'Coin', align: 'left' },
    { label: 'Price', align: 'right' },
    { label: '24h %', align: 'right' },
    { label: 'Market Cap', align: 'right' },
  ];

  const rows = prices.map((p, i) => [
    String(p.rank || i + 1),
    `${p.symbol || p.ticker || ''} ${C.dim}${truncate(p.name || '', 14)}${C.reset}`,
    `$${formatNumber(p.price || p.current_price)}`,
    colorPercent(p.change24h ?? p.price_change_percentage_24h),
    `$${formatNumber(p.marketCap || p.market_cap)}`,
  ]);

  if (opts.format === 'csv') {
    console.log(toCSV(headers, rows));
    return;
  }

  console.log(`\n${C.bold}💰 Crypto Prices${C.reset}\n`);
  renderTable(headers, rows);
  console.log();
  printFooter();
}

async function cmdMarket(opts) {
  const data = await apiFetch('/api/market');

  if (opts.format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const market = data.market || data.data || data;

  console.log(`\n${C.bold}📊 Market Overview${C.reset}\n`);

  const stats = [
    ['Total Market Cap', `$${formatNumber(market.totalMarketCap || market.total_market_cap)}`],
    ['24h Volume', `$${formatNumber(market.totalVolume || market.total_volume)}`],
    ['BTC Dominance', `${formatNumber(market.btcDominance || market.btc_dominance)}%`],
    ['ETH Dominance', `${formatNumber(market.ethDominance || market.eth_dominance)}%`],
    ['Active Cryptos', formatNumber(market.activeCryptos || market.active_cryptocurrencies)],
    ['Markets', formatNumber(market.markets)],
  ];

  const maxLabel = Math.max(...stats.map(s => s[0].length));
  for (const [label, value] of stats) {
    if (value && value !== '—' && value !== '$—' && value !== '—%' && value !== 'undefined%') {
      console.log(`  ${C.dim}${label.padEnd(maxLabel)}${C.reset}  ${C.bold}${value}${C.reset}`);
    }
  }

  console.log();
  printFooter();
}

async function cmdFearGreed(opts) {
  const data = await apiFetch('/api/fear-greed');

  if (opts.format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const fg = data.data || data.fearGreed || data;
  const value = fg.value ?? fg.score ?? fg.now?.value;
  const label = fg.label ?? fg.classification ?? fg.now?.label ?? classifyFearGreed(value);

  console.log(`\n${C.bold}😱 Fear & Greed Index${C.reset}\n`);

  if (value !== undefined && value !== null) {
    const barWidth = 40;
    const filled = Math.round((Number(value) / 100) * barWidth);
    const barColor = Number(value) <= 25 ? C.red : Number(value) <= 45 ? C.yellow : Number(value) <= 55 ? C.white : Number(value) <= 75 ? C.green : C.green;
    const bar = `${barColor}${'█'.repeat(filled)}${C.dim}${'░'.repeat(barWidth - filled)}${C.reset}`;

    console.log(`  ${C.bold}${value}${C.reset} / 100  ${barColor}${label}${C.reset}`);
    console.log(`  ${bar}`);
    console.log(`  ${C.dim}0 ← Extreme Fear       Extreme Greed → 100${C.reset}`);
  } else {
    console.log(`  ${C.dim}Data unavailable${C.reset}`);
  }

  console.log();
  printFooter();
}

function classifyFearGreed(value) {
  const v = Number(value);
  if (v <= 25) return 'Extreme Fear';
  if (v <= 45) return 'Fear';
  if (v <= 55) return 'Neutral';
  if (v <= 75) return 'Greed';
  return 'Extreme Greed';
}

async function cmdGas(opts) {
  const data = await apiFetch('/api/gas');

  if (opts.format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const gas = data.gas || data.data || data;

  const headers = [
    { label: 'Speed', align: 'left' },
    { label: 'Gas (Gwei)', align: 'right' },
    { label: 'Est. Cost (ETH)', align: 'right' },
    { label: 'Est. Cost (USD)', align: 'right' },
  ];

  const speeds = [
    { name: '🐌 Slow', key: 'slow', keyAlt: 'safeLow' },
    { name: '🚗 Standard', key: 'standard', keyAlt: 'average' },
    { name: '🚀 Fast', key: 'fast' },
    { name: '⚡ Instant', key: 'instant', keyAlt: 'rapid' },
  ];

  const rows = speeds
    .map(s => {
      const val = gas[s.key] || gas[s.keyAlt];
      if (!val && val !== 0) return null;
      const gwei = typeof val === 'object' ? val.gwei || val.maxFee : val;
      const ethCost = typeof val === 'object' ? val.ethCost : null;
      const usdCost = typeof val === 'object' ? val.usdCost : null;
      return [
        s.name,
        formatNumber(gwei),
        ethCost ? formatNumber(ethCost) : '—',
        usdCost ? `$${formatNumber(usdCost)}` : '—',
      ];
    })
    .filter(Boolean);

  if (opts.format === 'csv') {
    console.log(toCSV(headers, rows));
    return;
  }

  console.log(`\n${C.bold}⛽ Ethereum Gas Prices${C.reset}\n`);
  renderTable(headers, rows);
  console.log();
  printFooter();
}

async function cmdTrending(opts) {
  const data = await apiFetch('/api/trending', { limit: opts.limit });
  const trending = data.trending || data.coins || data.data || [];

  if (opts.format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (opts.format === 'csv') {
    const headers = [{ label: 'Name' }, { label: 'Symbol' }, { label: 'Mentions' }, { label: 'Sentiment' }];
    const rows = trending.map(t => [
      t.name || t.topic || t.coin,
      t.symbol || '',
      t.mentions || t.count || '',
      t.sentiment || '',
    ]);
    console.log(toCSV(headers, rows));
    return;
  }

  console.log(`\n${C.bold}🔥 Trending${C.reset}\n`);
  if (trending.length === 0) {
    console.log(`${C.dim}No trending data available.${C.reset}`);
    return;
  }
  for (let i = 0; i < trending.length; i++) {
    const t = trending[i];
    const name = t.name || t.topic || t.coin || 'Unknown';
    const symbol = t.symbol ? ` ${C.dim}(${t.symbol})${C.reset}` : '';
    const sentiment = t.sentiment
      ? ` ${t.sentiment === 'positive' ? C.green : t.sentiment === 'negative' ? C.red : C.dim}(${t.sentiment})${C.reset}`
      : '';
    const mentions = t.mentions || t.count ? ` ${C.dim}— ${t.mentions || t.count} mentions${C.reset}` : '';
    console.log(`${C.dim}${(i + 1).toString().padStart(2)}.${C.reset} ${C.bold}${name}${C.reset}${symbol}${sentiment}${mentions}`);
  }
  console.log();
  printFooter();
}

async function cmdSources(opts) {
  const data = await apiFetch('/api/sources');
  const sources = data.sources || data.data || [];

  if (opts.format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  if (opts.format === 'csv') {
    const headers = [{ label: 'Name' }, { label: 'URL' }, { label: 'Category' }];
    const rows = sources.map(s => [s.name, s.url || '', s.category || '']);
    console.log(toCSV(headers, rows));
    return;
  }

  console.log(`\n${C.bold}📰 News Sources${C.reset}\n`);
  for (const source of sources) {
    const color = SOURCE_COLORS[source.name] || C.cyan;
    const cat = source.category ? ` ${C.dim}[${source.category}]${C.reset}` : '';
    console.log(`  ${color}●${C.reset} ${C.bold}${source.name}${C.reset}${cat}`);
    if (source.url) console.log(`    ${C.dim}${source.url}${C.reset}`);
  }
  console.log();
  printFooter();
}

async function cmdAsk(opts) {
  const question = opts.positional.join(' ');
  if (!question) {
    console.error(`${C.red}Error: ask requires a question, e.g. fcn ask "What is DeFi?"${C.reset}`);
    process.exit(1);
  }

  const data = await apiFetch('/api/ask', { q: question });

  if (opts.format === 'json') {
    console.log(JSON.stringify(data, null, 2));
    return;
  }

  const answer = data.answer || data.response || data.text || JSON.stringify(data);
  console.log(`\n${C.bold}🤖 AI Answer${C.reset}\n`);
  console.log(`  ${C.dim}Q:${C.reset} ${question}\n`);
  console.log(`  ${answer}`);
  console.log();
  printFooter();
}

async function cmdWatch(opts) {
  const coin = opts.positional[0] || 'bitcoin';
  const interval = 10000; // 10 seconds

  console.log(`${C.dim}Watching ${coin} — press Ctrl+C to stop${C.reset}\n`);

  const update = async () => {
    try {
      const data = await apiFetchQuiet('/api/prices', { q: coin, limit: 1 });
      const prices = data.prices || data.data || data.coins || [];

      clearScreen();
      console.log(`${C.bold}👁  Watching: ${coin.toUpperCase()}${C.reset}`);
      console.log(`${C.dim}Updated: ${new Date().toLocaleTimeString()} — Ctrl+C to stop${C.reset}\n`);

      if (prices.length === 0) {
        console.log(`${C.dim}No price data found for "${coin}".${C.reset}`);
        return;
      }

      for (const p of prices) {
        const change = colorPercent(p.change24h ?? p.price_change_percentage_24h);
        console.log(`  ${C.bold}${p.name || coin}${C.reset} ${C.dim}(${p.symbol || ''})${C.reset}`);
        console.log(`  ${C.bold}$${formatNumber(p.price || p.current_price)}${C.reset}  ${change}`);
        console.log(`  ${C.dim}Market Cap:${C.reset} $${formatNumber(p.marketCap || p.market_cap)}`);
        console.log(`  ${C.dim}24h Volume:${C.reset} $${formatNumber(p.volume || p.total_volume)}`);
        if (p.high24h ?? p.high_24h) console.log(`  ${C.dim}24h High:${C.reset} $${formatNumber(p.high24h || p.high_24h)}`);
        if (p.low24h ?? p.low_24h) console.log(`  ${C.dim}24h Low:${C.reset}  $${formatNumber(p.low24h || p.low_24h)}`);
      }

      console.log(`\n${C.dim}Powered by cryptocurrency.cv${C.reset}`);
    } catch {
      // Silently retry on network errors in watch mode
    }
  };

  await update();
  const timer = setInterval(update, interval);

  process.on('SIGINT', () => {
    clearInterval(timer);
    console.log(`\n${C.dim}Stopped watching ${coin}.${C.reset}`);
    process.exit(0);
  });

  // Keep the process alive
  await new Promise(() => {});
}

// ---------------------------------------------------------------------------
// Help & Footer
// ---------------------------------------------------------------------------

function printFooter() {
  console.log(`${C.dim}───${C.reset}`);
  console.log(`${C.dim}Powered by Free Crypto News API • https://cryptocurrency.cv${C.reset}\n`);
}

function printHelp() {
  console.log(`
${C.bold}fcn${C.reset} — Free Crypto News CLI
${C.dim}Real-time crypto news, prices, and market data from your terminal${C.reset}

${C.bold}USAGE${C.reset}
  fcn <command> [options]

${C.bold}COMMANDS${C.reset}
  ${C.cyan}news${C.reset}              Get latest crypto news
  ${C.cyan}search${C.reset} <query>    Search news by keyword
  ${C.cyan}prices${C.reset}            Show live crypto prices
  ${C.cyan}market${C.reset}            Show market overview
  ${C.cyan}fear-greed${C.reset}        Show Fear & Greed Index
  ${C.cyan}gas${C.reset}               Show Ethereum gas prices
  ${C.cyan}trending${C.reset}          Show trending coins
  ${C.cyan}sources${C.reset}           List all news sources
  ${C.cyan}ask${C.reset} <question>    Ask AI a crypto question
  ${C.cyan}watch${C.reset} <coin>      Watch live price updates (10s refresh)

${C.bold}OPTIONS${C.reset}
  ${C.yellow}--limit, -l${C.reset}       Number of results (default: 10)
  ${C.yellow}--category${C.reset}        Filter by category (bitcoin, ethereum, defi, nft, etc.)
  ${C.yellow}--format${C.reset}          Output format: table, json, csv (default: table)
  ${C.yellow}--no-color${C.reset}        Disable colored output
  ${C.yellow}--help, -h${C.reset}        Show help
  ${C.yellow}--version${C.reset}         Show version

${C.bold}EXAMPLES${C.reset}
  fcn news --limit 5                  Latest 5 news articles
  fcn search "ethereum ETF"           Search for a topic
  fcn prices --format json            Prices as JSON (pipe-friendly)
  fcn prices --format csv > prices.csv  Export prices to CSV
  fcn market                          Market overview
  fcn fear-greed                      Fear & Greed Index
  fcn gas                             Ethereum gas prices
  fcn trending                        What's hot right now
  fcn sources                         All 130+ news sources
  fcn ask "What is DeFi?"             Ask AI about crypto
  fcn watch bitcoin                   Live Bitcoin price ticker
  fcn news --category defi            DeFi-only news
  fcn news --no-color | less          Pipe to a pager

${C.bold}MORE INFO${C.reset}
  ${C.underline}https://github.com/nirholas/cryptocurrency.cv${C.reset}
`);
}

function printVersion() {
  console.log(`fcn v${VERSION}`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const COMMANDS = {
  news: cmdNews,
  search: cmdSearch,
  prices: cmdPrices,
  market: cmdMarket,
  'fear-greed': cmdFearGreed,
  feargreed: cmdFearGreed,
  gas: cmdGas,
  trending: cmdTrending,
  sources: cmdSources,
  ask: cmdAsk,
  watch: cmdWatch,
};

async function main() {
  const opts = parseArgs(process.argv);

  if (opts.version) {
    printVersion();
    return;
  }

  if (opts.help || !opts.command) {
    printHelp();
    return;
  }

  const handler = COMMANDS[opts.command];
  if (!handler) {
    console.error(`${C.red}Unknown command: "${opts.command}"${C.reset}`);
    console.error(`${C.dim}Run "fcn --help" to see available commands${C.reset}`);
    process.exit(1);
  }

  try {
    await handler(opts);
  } catch (err) {
    console.error(`\n${C.red}${C.bold}Error:${C.reset} ${C.red}${err.message}${C.reset}`);
    console.error(`${C.dim}If this persists, check https://cryptocurrency.cv/status${C.reset}\n`);
    process.exit(1);
  }
}

main();
