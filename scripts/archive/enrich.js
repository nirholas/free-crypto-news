#!/usr/bin/env node

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
 * Article Enrichment Engine
 * 
 * Extracts entities, sentiment, tickers, and generates content hashes
 * for the Free Crypto News Archive.
 * 
 * This is the core intelligence layer that transforms raw news into
 * structured, queryable data.
 */

const crypto = require('crypto');

// ============================================================================
// UTILITIES
// ============================================================================

/**
 * Escape special regex characters in a string
 */
function escapeRegex(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// TICKER EXTRACTION
// ============================================================================

// Comprehensive ticker list - top 200+ by market cap plus notable tokens
const KNOWN_TICKERS = new Set([
  // Top coins
  'BTC', 'ETH', 'USDT', 'BNB', 'SOL', 'XRP', 'USDC', 'ADA', 'DOGE', 'TRX',
  'AVAX', 'SHIB', 'DOT', 'LINK', 'TON', 'MATIC', 'DAI', 'LTC', 'BCH', 'ATOM',
  'UNI', 'XLM', 'XMR', 'ETC', 'OKB', 'FIL', 'HBAR', 'APT', 'CRO', 'ARB',
  'VET', 'MKR', 'OP', 'INJ', 'AAVE', 'GRT', 'THETA', 'RUNE', 'FTM', 'ALGO',
  'LDO', 'SNX', 'EGLD', 'AXS', 'SAND', 'MANA', 'IMX', 'APE', 'XTZ', 'NEO',
  'FLOW', 'KAVA', 'CHZ', 'CAKE', 'COMP', 'ZEC', 'DASH', 'BAT', 'ENJ', 'SUSHI',
  'YFI', '1INCH', 'CRV', 'DYDX', 'GMX', 'PEPE', 'FLOKI', 'BONK', 'WIF', 'JUP',
  'PYTH', 'RNDR', 'FET', 'AGIX', 'OCEAN', 'TAO', 'WLD', 'ARKM', 'TIA', 'SEI',
  'SUI', 'BLUR', 'STRK', 'MEME', 'ORDI', 'SATS', 'STX', 'ICP', 'NEAR', 'KAS',
  // DeFi tokens
  'LIDO', 'ROCKET', 'CVX', 'BAL', 'PERP', 'ALPHA', 'BADGER', 'ALCX', 'SPELL',
  // L2 tokens
  'METIS', 'BOBA', 'ZK', 'SCROLL', 'BASE', 'LINEA', 'ZKSYNC', 'BLAST',
  // Exchange tokens
  'FTT', 'LEO', 'HT', 'KCS', 'GT', 'MX',
  // Stablecoins
  'TUSD', 'FRAX', 'LUSD', 'USDP', 'GUSD', 'BUSD', 'PYUSD', 'EURC', 'EURT',
  // Common variations
  'BITCOIN', 'ETHEREUM', 'SOLANA', 'RIPPLE', 'CARDANO', 'DOGECOIN', 'POLKADOT',
  'POLYGON', 'AVALANCHE', 'CHAINLINK', 'UNISWAP', 'TETHER', 'LITECOIN'
]);

// Map common names to tickers
const NAME_TO_TICKER = {
  'bitcoin': 'BTC',
  'ethereum': 'ETH',
  'ether': 'ETH',
  'solana': 'SOL',
  'ripple': 'XRP',
  'cardano': 'ADA',
  'dogecoin': 'DOGE',
  'polkadot': 'DOT',
  'polygon': 'MATIC',
  'avalanche': 'AVAX',
  'chainlink': 'LINK',
  'uniswap': 'UNI',
  'tether': 'USDT',
  'litecoin': 'LTC',
  'monero': 'XMR',
  'stellar': 'XLM',
  'cosmos': 'ATOM',
  'filecoin': 'FIL',
  'aave': 'AAVE',
  'maker': 'MKR',
  'compound': 'COMP',
  'synthetix': 'SNX',
  'curve': 'CRV',
  'arbitrum': 'ARB',
  'optimism': 'OP',
  'aptos': 'APT',
  'sui': 'SUI',
  'celestia': 'TIA',
  'worldcoin': 'WLD',
  'render': 'RNDR',
  'injective': 'INJ',
  'starknet': 'STRK',
  'sei': 'SEI',
  'near': 'NEAR',
  'internet computer': 'ICP',
  'kaspa': 'KAS',
  'bonk': 'BONK',
  'pepe': 'PEPE',
  'shiba': 'SHIB',
  'shiba inu': 'SHIB',
  'binance coin': 'BNB',
  'bnb chain': 'BNB',
  'tron': 'TRX',
  'hedera': 'HBAR',
  'the graph': 'GRT',
  'lido': 'LDO',
  'blur': 'BLUR',
  'jupiter': 'JUP',
  'pyth': 'PYTH',
  'zcash': 'ZEC'
};

/**
 * Extract cryptocurrency tickers from text
 */
function extractTickers(text) {
  if (!text) return [];
  
  const tickers = new Set();
  const upperText = text.toUpperCase();
  const lowerText = text.toLowerCase();
  
  // Look for $TICKER patterns
  const dollarPattern = /\$([A-Z]{2,10})\b/g;
  let match;
  while ((match = dollarPattern.exec(upperText)) !== null) {
    if (KNOWN_TICKERS.has(match[1])) {
      tickers.add(match[1]);
    }
  }
  
  // Look for known ticker symbols (with word boundaries)
  for (const ticker of KNOWN_TICKERS) {
    const regex = new RegExp(`\\b${ticker}\\b`, 'i');
    if (regex.test(text)) {
      // Avoid false positives for short tickers
      if (ticker.length <= 3) {
        // Only match if it looks like a ticker context
        const contextRegex = new RegExp(`(\\$${ticker}|${ticker}\\s*(price|token|coin|drops|rises|falls|pumps|dumps|surges|crashes|trading)|buy\\s+${ticker}|sell\\s+${ticker})`, 'i');
        if (contextRegex.test(text)) {
          tickers.add(ticker);
        }
      } else {
        tickers.add(ticker);
      }
    }
  }
  
  // Look for full names and map to tickers
  for (const [name, ticker] of Object.entries(NAME_TO_TICKER)) {
    if (lowerText.includes(name)) {
      tickers.add(ticker);
    }
  }
  
  return Array.from(tickers).sort();
}

// ============================================================================
// ENTITY EXTRACTION
// ============================================================================

// Known entities in crypto space
const KNOWN_PEOPLE = [
  'Satoshi Nakamoto', 'Vitalik Buterin', 'CZ', 'Changpeng Zhao', 'Brian Armstrong',
  'Sam Bankman-Fried', 'SBF', 'Do Kwon', 'Michael Saylor', 'Elon Musk',
  'Gary Gensler', 'Cathie Wood', 'Raoul Pal', 'Arthur Hayes', 'Su Zhu',
  'Kyle Davies', 'Barry Silbert', 'Cameron Winklevoss', 'Tyler Winklevoss',
  'Anatoly Yakovenko', 'Charles Hoskinson', 'Gavin Wood', 'Justin Sun',
  'Richard Heart', 'Andre Cronje', 'Hayden Adams', 'Stani Kulechov',
  'Robert Kiyosaki', 'Max Keiser', 'Peter Schiff', 'Nayib Bukele',
  'Jerome Powell', 'Janet Yellen', 'Elizabeth Warren', 'Brad Garlinghouse',
  'Chris Larsen', 'Jed McCaleb', 'Roger Ver', 'Adam Back', 'Nick Szabo',
  'Hal Finney', 'Balaji Srinivasan', 'Ryan Selkis', 'Mike Novogratz',
  'Larry Fink', 'Paolo Ardoino', 'Kris Marszalek', 'Jesse Powell'
];

const KNOWN_COMPANIES = [
  'Coinbase', 'Binance', 'Kraken', 'FTX', 'Gemini', 'Crypto.com', 'Bitfinex',
  'Bitstamp', 'OKX', 'Bybit', 'KuCoin', 'Huobi', 'Gate.io', 'MEXC', 'Bitget',
  'BlackRock', 'Fidelity', 'Grayscale', 'MicroStrategy', 'Tesla', 'Block',
  'PayPal', 'Robinhood', 'Revolut', 'Circle', 'Tether', 'Paxos', 'USDC',
  'Ripple', 'Consensys', 'Chainalysis', 'Elliptic', 'TRM Labs', 'Fireblocks',
  'Ledger', 'Trezor', 'Metamask', 'OpenSea', 'Blur', 'Magic Eden', 'Rarible',
  'Uniswap Labs', 'Aave', 'MakerDAO', 'Compound', 'Lido', 'Rocket Pool',
  'Paradigm', 'a]16z', 'Andreessen Horowitz', 'Polychain', 'Pantera', 'DCG',
  'Digital Currency Group', 'Galaxy Digital', 'Three Arrows Capital', '3AC',
  'Alameda Research', 'Jump Trading', 'Jump Crypto', 'Wintermute', 'Cumberland',
  'Genesis', 'BlockFi', 'Celsius', 'Voyager', 'Nexo', 'Anchorage', 'BitGo',
  'Copper', 'Cobo', 'Alchemy', 'Infura', 'QuickNode', 'The Graph',
  'SEC', 'CFTC', 'DOJ', 'Treasury', 'Federal Reserve', 'OCC', 'FDIC', 'FinCEN',
  'Silvergate', 'Signature Bank', 'Silicon Valley Bank', 'SVB',
  'Telegram', 'TON Foundation', 'Solana Foundation', 'Ethereum Foundation',
  'Bitcoin Foundation', 'Cardano Foundation', 'Web3 Foundation'
];

const KNOWN_PROTOCOLS = [
  'Ethereum', 'Bitcoin', 'Solana', 'Polygon', 'Arbitrum', 'Optimism', 'Base',
  'Avalanche', 'BNB Chain', 'Tron', 'Cardano', 'Polkadot', 'Cosmos', 'Near',
  'Fantom', 'zkSync', 'StarkNet', 'Linea', 'Scroll', 'Mantle', 'Blast',
  'Uniswap', 'Aave', 'Curve', 'Compound', 'MakerDAO', 'Lido', 'Rocket Pool',
  'Eigenlayer', 'Pendle', 'GMX', 'dYdX', 'Synthetix', 'Yearn', 'Convex',
  'Balancer', 'SushiSwap', 'PancakeSwap', 'TraderJoe', 'Raydium', 'Orca',
  'Marinade', 'Jito', 'Jupiter', 'Drift', 'Mango', 'Serum', 'OpenBook',
  'LayerZero', 'Wormhole', 'Axelar', 'Stargate', 'Across', 'Hop', 'Synapse',
  'Chainlink', 'Pyth', 'Band Protocol', 'API3', 'Redstone', 'Chronicle',
  'Safe', 'Gnosis', 'ENS', 'Unstoppable Domains', 'SpaceID', 'Lens', 'Farcaster',
  'Friend.tech', 'Polymarket', 'Manifold', 'Mirror', 'Sound', 'Zora',
  'Lightning Network', 'RGB', 'Ordinals', 'BRC-20', 'Runes', 'Stacks'
];

/**
 * Extract named entities from text
 */
function extractEntities(text) {
  if (!text) return { people: [], companies: [], protocols: [] };
  
  const entities = {
    people: [],
    companies: [],
    protocols: []
  };
  
  // Use word boundaries to avoid partial matches
  for (const person of KNOWN_PEOPLE) {
    const regex = new RegExp(`\\b${escapeRegex(person)}\\b`, 'i');
    if (regex.test(text)) {
      entities.people.push(person);
    }
  }
  
  for (const company of KNOWN_COMPANIES) {
    // Special handling for short names that might match partials
    if (company.length <= 5) {
      const regex = new RegExp(`\\b${escapeRegex(company)}\\b`, 'i');
      if (regex.test(text)) {
        // Extra check for "Block" - don't match "blockchain", "blockworks" etc.
        if (company.toLowerCase() === 'block') {
          const strictRegex = /\bBlock\b(?!\s*(chain|works|fi|one|stream))/i;
          if (strictRegex.test(text)) {
            entities.companies.push(company);
          }
        } else {
          entities.companies.push(company);
        }
      }
    } else {
      if (text.toLowerCase().includes(company.toLowerCase())) {
        entities.companies.push(company);
      }
    }
  }
  
  for (const protocol of KNOWN_PROTOCOLS) {
    // Special handling for short/common protocol names
    if (protocol.toLowerCase() === 'base') {
      // Base chain - require context
      const baseRegex = /\b(Base\s*(chain|network|l2|layer|mainnet|testnet)|on\s+Base|built\s+on\s+Base|deployed\s+(to|on)\s+Base|Base\s+ecosystem)\b/i;
      if (baseRegex.test(text)) {
        entities.protocols.push(protocol);
      }
    } else if (protocol.toLowerCase() === 'near') {
      // NEAR Protocol - require context
      const nearRegex = /\b(NEAR\s*(Protocol|blockchain|network|ecosystem|foundation)|on\s+NEAR|\$NEAR)\b/i;
      if (nearRegex.test(text)) {
        entities.protocols.push(protocol);
      }
    } else {
      if (text.toLowerCase().includes(protocol.toLowerCase())) {
        entities.protocols.push(protocol);
      }
    }
  }
  
  return entities;
}

// ============================================================================
// SENTIMENT ANALYSIS
// ============================================================================

// Sentiment lexicon for crypto news
const POSITIVE_WORDS = [
  'surge', 'surges', 'surging', 'soar', 'soars', 'soaring', 'rally', 'rallies', 'rallying',
  'jump', 'jumps', 'jumping', 'gain', 'gains', 'gaining', 'rise', 'rises', 'rising',
  'pump', 'pumps', 'pumping', 'moon', 'mooning', 'breakout', 'bullish', 'bull',
  'record', 'high', 'highs', 'ath', 'all-time high', 'boom', 'booming', 'spike', 'spikes',
  'recover', 'recovers', 'recovering', 'recovery', 'rebound', 'rebounds', 'rebounding',
  'adoption', 'adopts', 'approve', 'approves', 'approved', 'approval', 'launch', 'launches',
  'partnership', 'partner', 'partners', 'integrate', 'integrates', 'integration',
  'invest', 'invests', 'investment', 'backing', 'backs', 'backed', 'fund', 'funds', 'funding',
  'milestone', 'success', 'successful', 'win', 'wins', 'winning', 'victory',
  'upgrade', 'upgrades', 'improve', 'improves', 'improvement', 'breakthrough',
  'support', 'supports', 'bullish', 'optimistic', 'positive', 'growth', 'growing'
];

const NEGATIVE_WORDS = [
  'crash', 'crashes', 'crashing', 'plunge', 'plunges', 'plunging', 'drop', 'drops', 'dropping',
  'fall', 'falls', 'falling', 'decline', 'declines', 'declining', 'dump', 'dumps', 'dumping',
  'tank', 'tanks', 'tanking', 'sink', 'sinks', 'sinking', 'collapse', 'collapses', 'collapsing',
  'lose', 'loses', 'losing', 'loss', 'losses', 'bearish', 'bear', 'correction',
  'low', 'lows', 'bottom', 'bottoming', 'selloff', 'sell-off', 'selling',
  'hack', 'hacks', 'hacked', 'hacking', 'exploit', 'exploits', 'exploited', 'breach', 'breaches',
  'scam', 'scams', 'scammed', 'fraud', 'fraudulent', 'ponzi', 'rug', 'rugpull', 'rug-pull',
  'sue', 'sues', 'sued', 'suing', 'lawsuit', 'lawsuits', 'legal', 'charge', 'charges', 'charged',
  'investigate', 'investigates', 'investigation', 'probe', 'probes', 'probing',
  'ban', 'bans', 'banned', 'banning', 'restrict', 'restricts', 'restriction', 'crackdown',
  'fine', 'fines', 'fined', 'penalty', 'penalties', 'sanction', 'sanctions', 'sanctioned',
  'bankrupt', 'bankruptcy', 'insolvent', 'insolvency', 'liquidate', 'liquidation', 'default',
  'arrest', 'arrests', 'arrested', 'indictment', 'indicted', 'guilty', 'conviction', 'prison',
  'fail', 'fails', 'failed', 'failure', 'shut', 'shuts', 'shutdown', 'shutting',
  'risk', 'risks', 'risky', 'danger', 'dangerous', 'warning', 'warns', 'concern', 'concerns',
  'fear', 'fears', 'panic', 'uncertainty', 'volatile', 'volatility', 'unstable', 'threat'
];

const VERY_POSITIVE_WORDS = [
  'skyrocket', 'skyrockets', 'explode', 'explodes', 'parabolic', 'moonshot',
  'historic', 'revolutionary', 'game-changer', 'game changer', 'massive', 'huge'
];

const VERY_NEGATIVE_WORDS = [
  'catastrophe', 'catastrophic', 'disaster', 'devastating', 'wipeout', 'obliterate',
  'implosion', 'implodes', 'death spiral', 'extinction', 'apocalypse', 'bloodbath'
];

/**
 * Analyze sentiment of text
 */
function analyzeSentiment(text) {
  if (!text) {
    return { score: 0, label: 'neutral', confidence: 0.5 };
  }
  
  const lowerText = text.toLowerCase();
  const words = lowerText.split(/\s+/);
  
  let positiveCount = 0;
  let negativeCount = 0;
  let veryPositiveCount = 0;
  let veryNegativeCount = 0;
  
  for (const word of words) {
    const cleanWord = word.replace(/[^a-z-]/g, '');
    if (VERY_POSITIVE_WORDS.includes(cleanWord)) {
      veryPositiveCount++;
      positiveCount++;
    } else if (VERY_NEGATIVE_WORDS.includes(cleanWord)) {
      veryNegativeCount++;
      negativeCount++;
    } else if (POSITIVE_WORDS.includes(cleanWord)) {
      positiveCount++;
    } else if (NEGATIVE_WORDS.includes(cleanWord)) {
      negativeCount++;
    }
  }
  
  // Also check for multi-word phrases
  for (const phrase of POSITIVE_WORDS.filter(w => w.includes(' '))) {
    if (lowerText.includes(phrase)) positiveCount++;
  }
  for (const phrase of NEGATIVE_WORDS.filter(w => w.includes(' '))) {
    if (lowerText.includes(phrase)) negativeCount++;
  }
  for (const phrase of VERY_POSITIVE_WORDS.filter(w => w.includes(' '))) {
    if (lowerText.includes(phrase)) { veryPositiveCount++; positiveCount++; }
  }
  for (const phrase of VERY_NEGATIVE_WORDS.filter(w => w.includes(' '))) {
    if (lowerText.includes(phrase)) { veryNegativeCount++; negativeCount++; }
  }
  
  const total = positiveCount + negativeCount;
  
  if (total === 0) {
    return { score: 0, label: 'neutral', confidence: 0.5 };
  }
  
  // Calculate score from -1 to 1
  const score = (positiveCount - negativeCount) / Math.max(total, 1);
  const normalizedScore = Math.max(-1, Math.min(1, score));
  
  // Determine label
  let label;
  if (veryPositiveCount > 0 && normalizedScore > 0.3) {
    label = 'very_positive';
  } else if (veryNegativeCount > 0 && normalizedScore < -0.3) {
    label = 'very_negative';
  } else if (normalizedScore > 0.2) {
    label = 'positive';
  } else if (normalizedScore < -0.2) {
    label = 'negative';
  } else {
    label = 'neutral';
  }
  
  // Confidence based on total sentiment words found
  const confidence = Math.min(0.95, 0.5 + (total * 0.1));
  
  return {
    score: Math.round(normalizedScore * 100) / 100,
    label,
    confidence: Math.round(confidence * 100) / 100
  };
}

// ============================================================================
// CONTENT TAGGING
// ============================================================================

const TAG_PATTERNS = {
  'regulation': /\b(sec|cftc|regulation|regulatory|regulator|law|legal|legislation|bill|congress|senate|court|lawsuit|sue|fine|penalty|ban|restrict|compliance|license|approve|reject)\b/i,
  'hack': /\b(hack|hacked|exploit|exploited|breach|breached|attack|attacked|drain|drained|stolen|theft|vulnerability|bug|flaw)\b/i,
  'exchange': /\b(exchange|trading|trade|list|listing|delist|volume|liquidity|order|market maker|cex|dex)\b/i,
  'defi': /\b(defi|decentralized finance|yield|farm|farming|stake|staking|lend|lending|borrow|borrowing|liquidity pool|amm|swap|tvl|apy|apr)\b/i,
  'nft': /\b(nft|nfts|non-fungible|collectible|art|pfp|mint|minting|airdrop|opensea|blur|ordinals)\b/i,
  'institutional': /\b(institution|institutional|bank|banking|hedge fund|asset manager|blackrock|fidelity|goldman|jpmorgan|morgan stanley|grayscale|etf|custody|custodian)\b/i,
  'mining': /\b(mining|miner|miners|hashrate|hash rate|difficulty|halving|asic|pool|marathon|riot|hut 8|core scientific)\b/i,
  'layer2': /\b(layer 2|layer2|l2|rollup|zk-rollup|optimistic rollup|arbitrum|optimism|base|zksync|starknet|polygon|scaling)\b/i,
  'stablecoin': /\b(stablecoin|stable coin|usdt|usdc|dai|tether|circle|peg|depeg|backing|reserve|audit)\b/i,
  'partnership': /\b(partner|partnership|collaborate|collaboration|integrate|integration|deal|agreement|announce|launch)\b/i,
  'price': /\b(price|prices|trading at|\$[0-9]|bull|bear|ath|all-time|support|resistance|technical|chart|rally|crash|surge|dump|pump)\b/i,
  'funding': /\b(funding|fundraise|raise|raised|series [a-d]|seed|venture|vc|invest|investment|valuation|unicorn)\b/i,
  'opinion': /\b(opinion|editorial|analysis|predict|prediction|forecast|expect|believe|think|argue|claim|says|said)\b/i,
  'breaking': /\b(breaking|just in|urgent|alert|developing|exclusive|confirmed)\b/i,
  'whale': /\b(whale|whales|large holder|large transfer|big move|accumulate|accumulation|wallet)\b/i,
  'airdrop': /\b(airdrop|airdrops|token distribution|claim|claiming|eligible|eligibility|snapshot)\b/i
};

/**
 * Extract content tags from text
 */
function extractTags(text) {
  if (!text) return [];
  
  const tags = [];
  
  for (const [tag, pattern] of Object.entries(TAG_PATTERNS)) {
    if (pattern.test(text)) {
      tags.push(tag);
    }
  }
  
  return tags;
}

// ============================================================================
// HASHING & DEDUPLICATION
// ============================================================================

/**
 * Normalize URL for deduplication
 */
function normalizeUrl(url) {
  if (!url) return '';
  
  try {
    const parsed = new URL(url);
    
    // Remove tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
      'ref', 'source', 'fbclid', 'gclid', 'mc_cid', 'mc_eid'
    ];
    
    for (const param of trackingParams) {
      parsed.searchParams.delete(param);
    }
    
    // Remove trailing slashes
    let path = parsed.pathname.replace(/\/+$/, '');
    
    // Lowercase
    return `${parsed.protocol}//${parsed.host}${path}${parsed.search}`.toLowerCase();
  } catch {
    return url.toLowerCase();
  }
}

/**
 * Generate article ID from URL
 */
function generateArticleId(url) {
  const normalized = normalizeUrl(url);
  const hash = crypto.createHash('sha256').update(normalized).digest('hex');
  return hash.substring(0, 16); // 16 chars is enough for uniqueness
}

/**
 * Generate content hash for integrity verification
 */
function generateContentHash(title, description) {
  const content = `${title || ''}|${description || ''}`.toLowerCase().trim();
  return crypto.createHash('sha256').update(content).digest('hex').substring(0, 16);
}

// ============================================================================
// METADATA EXTRACTION
// ============================================================================

/**
 * Extract metadata from article
 */
function extractMeta(title, description) {
  const text = `${title || ''} ${description || ''}`;
  
  return {
    word_count: text.split(/\s+/).filter(w => w.length > 0).length,
    has_numbers: /\d/.test(text),
    is_breaking: /\b(breaking|just in|urgent|developing)\b/i.test(text),
    is_opinion: /\b(opinion|editorial|analysis|i think|i believe)\b/i.test(text)
  };
}

// ============================================================================
// MAIN ENRICHMENT FUNCTION
// ============================================================================

/**
 * Enrich a raw article with extracted data
 */
function enrichArticle(article, marketContext = null) {
  const text = `${article.title || ''} ${article.description || ''}`;
  const timestamp = new Date().toISOString();
  
  return {
    id: generateArticleId(article.link),
    schema_version: '2.0.0',
    
    // Original fields
    title: article.title || '',
    link: article.link || '',
    canonical_link: normalizeUrl(article.link),
    description: article.description || '',
    source: article.source || '',
    source_key: article.sourceKey || article.source?.toLowerCase().replace(/\s+/g, '') || '',
    category: article.category || 'general',
    pub_date: article.pubDate || null,
    
    // Tracking
    first_seen: timestamp,
    last_seen: timestamp,
    fetch_count: 1,
    
    // Enrichments
    tickers: extractTickers(text),
    entities: extractEntities(text),
    tags: extractTags(text),
    sentiment: analyzeSentiment(text),
    market_context: marketContext || null,
    content_hash: generateContentHash(article.title, article.description),
    meta: extractMeta(article.title, article.description)
  };
}

/**
 * Merge existing article with new fetch
 */
function mergeArticle(existing, newData) {
  return {
    ...existing,
    last_seen: new Date().toISOString(),
    fetch_count: (existing.fetch_count || 1) + 1,
    // Update market context to latest
    market_context: newData.market_context || existing.market_context
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  enrichArticle,
  mergeArticle,
  generateArticleId,
  generateContentHash,
  normalizeUrl,
  extractTickers,
  extractEntities,
  extractTags,
  analyzeSentiment,
  extractMeta,
  KNOWN_TICKERS,
  KNOWN_PEOPLE,
  KNOWN_COMPANIES,
  KNOWN_PROTOCOLS
};

// CLI usage
if (require.main === module) {
  const testArticle = {
    title: "BlackRock adds $900M BTC as Bitcoin long-term selling falls to 2017 lows",
    link: "https://cointelegraph.com/news/blackrock-btc-bitcoin?utm_source=rss",
    description: "BlackRock adds $900 million in Bitcoin as long-term holder selling drops to 2017 lows.",
    source: "CoinTelegraph",
    sourceKey: "cointelegraph",
    category: "bitcoin",
    pubDate: "2026-01-08T18:05:00.000Z"
  };
  
  const enriched = enrichArticle(testArticle, {
    btc_price: 94500,
    eth_price: 3200,
    fear_greed_index: 65
  });
  
  console.log(JSON.stringify(enriched, null, 2));
}
