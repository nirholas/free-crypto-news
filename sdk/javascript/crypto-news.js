/**
 * Free Crypto News JavaScript SDK
 * 
 * 100% FREE - no API keys required!
 * Works in Node.js and browsers.
 * 
 * Usage:
 *   import { CryptoNews } from './crypto-news.js';
 *   const news = new CryptoNews();
 *   const articles = await news.getLatest(10);
 */

const DEFAULT_BASE_URL = 'https://free-crypto-news.vercel.app';

export class CryptoNews {
  constructor(baseUrl = DEFAULT_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  async _fetch(endpoint) {
    const response = await fetch(`${this.baseUrl}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return response.json();
  }

  /**
   * Get latest crypto news
   * @param {number} limit - Max articles (1-50)
   * @param {string} source - Filter by source
   * @returns {Promise<Array>} Articles
   */
  async getLatest(limit = 10, source = null) {
    let endpoint = `/api/news?limit=${limit}`;
    if (source) endpoint += `&source=${source}`;
    const data = await this._fetch(endpoint);
    return data.articles;
  }

  /**
   * Search news by keywords
   * @param {string} keywords - Comma-separated terms
   * @param {number} limit - Max results (1-30)
   */
  async search(keywords, limit = 10) {
    const encoded = encodeURIComponent(keywords);
    const data = await this._fetch(`/api/search?q=${encoded}&limit=${limit}`);
    return data.articles;
  }

  /** Get DeFi-specific news */
  async getDefi(limit = 10) {
    const data = await this._fetch(`/api/defi?limit=${limit}`);
    return data.articles;
  }

  /** Get Bitcoin-specific news */
  async getBitcoin(limit = 10) {
    const data = await this._fetch(`/api/bitcoin?limit=${limit}`);
    return data.articles;
  }

  /** Get breaking news (last 2 hours) */
  async getBreaking(limit = 5) {
    const data = await this._fetch(`/api/breaking?limit=${limit}`);
    return data.articles;
  }

  /** Get list of all sources */
  async getSources() {
    const data = await this._fetch('/api/sources');
    return data.sources;
  }
}

// Convenience functions
export async function getCryptoNews(limit = 10) {
  return new CryptoNews().getLatest(limit);
}

export async function searchCryptoNews(keywords, limit = 10) {
  return new CryptoNews().search(keywords, limit);
}

// CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CryptoNews, getCryptoNews, searchCryptoNews };
}
