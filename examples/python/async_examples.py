#!/usr/bin/env python3

# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/cryptocurrency.cv
#
# This file is part of free-crypto-news.
# Unauthorized copying, modification, or distribution is strictly prohibited.
# For licensing inquiries: nirholas@users.noreply.github.com

"""
Async API Examples - Python (aiohttp)
Free Crypto News API - https://github.com/nirholas/cryptocurrency.cv

Async/await examples using aiohttp for high-performance concurrent requests.
Install: pip install aiohttp
"""

import asyncio
import aiohttp
import json
from typing import Optional, List

BASE_URL = "https://cryptocurrency.cv"


# =============================================================================
# ASYNC CLIENT
# =============================================================================

class AsyncCryptoNewsClient:
    """Async client for the Free Crypto News API using aiohttp."""
    
    def __init__(self, base_url: str = BASE_URL, api_key: Optional[str] = None):
        self.base_url = base_url.rstrip("/")
        self.api_key = api_key
        self._session: Optional[aiohttp.ClientSession] = None
    
    async def _get_session(self) -> aiohttp.ClientSession:
        if self._session is None or self._session.closed:
            headers = {"Accept": "application/json"}
            if self.api_key:
                headers["X-API-Key"] = self.api_key
            self._session = aiohttp.ClientSession(headers=headers)
        return self._session
    
    async def close(self):
        if self._session and not self._session.closed:
            await self._session.close()
    
    async def __aenter__(self):
        return self
    
    async def __aexit__(self, exc_type, exc_val, exc_tb):
        await self.close()
    
    async def _get(self, path: str, params: Optional[dict] = None) -> dict:
        session = await self._get_session()
        async with session.get(f"{self.base_url}{path}", params=params) as resp:
            return await resp.json()
    
    async def _post(self, path: str, data: dict) -> dict:
        session = await self._get_session()
        async with session.post(f"{self.base_url}{path}", json=data) as resp:
            return await resp.json()
    
    async def _get_text(self, path: str, params: Optional[dict] = None) -> str:
        session = await self._get_session()
        async with session.get(f"{self.base_url}{path}", params=params) as resp:
            return await resp.text()
    
    # -------------------------------------------------------------------------
    # News Endpoints
    # -------------------------------------------------------------------------
    
    async def get_news(self, limit: int = 20, category: Optional[str] = None,
                       source: Optional[str] = None) -> dict:
        params = {"limit": limit}
        if category:
            params["category"] = category
        if source:
            params["source"] = source
        return await self._get("/api/news", params)
    
    async def get_breaking(self) -> dict:
        return await self._get("/api/breaking")
    
    async def get_bitcoin_news(self, limit: int = 20) -> dict:
        return await self._get("/api/bitcoin", {"limit": limit})
    
    async def get_defi_news(self, limit: int = 20) -> dict:
        return await self._get("/api/defi", {"limit": limit})
    
    async def search_news(self, query: str, limit: int = 20) -> dict:
        return await self._get("/api/search", {"q": query, "limit": limit})
    
    async def get_trending(self, limit: int = 10) -> dict:
        return await self._get("/api/trending", {"limit": limit})
    
    async def get_international(self, lang: Optional[str] = None) -> dict:
        params = {}
        if lang:
            params["lang"] = lang
        return await self._get("/api/news/international", params)
    
    async def get_digest(self) -> dict:
        return await self._get("/api/digest")
    
    # -------------------------------------------------------------------------
    # Market Endpoints
    # -------------------------------------------------------------------------
    
    async def get_coins(self, limit: int = 100, page: int = 1) -> dict:
        return await self._get("/api/market/coins", {"limit": limit, "page": page})
    
    async def get_ohlc(self, coin_id: str, days: int = 30) -> dict:
        return await self._get(f"/api/market/ohlc/{coin_id}", {"days": days})
    
    async def get_fear_greed(self) -> dict:
        return await self._get("/api/fear-greed")
    
    async def get_gainers(self, limit: int = 20) -> dict:
        return await self._get("/api/market/gainers", {"limit": limit})
    
    async def get_losers(self, limit: int = 20) -> dict:
        return await self._get("/api/market/losers", {"limit": limit})
    
    async def get_global(self) -> dict:
        return await self._get("/api/global")
    
    async def get_dominance(self) -> dict:
        return await self._get("/api/market/dominance")
    
    async def get_heatmap(self) -> dict:
        return await self._get("/api/market/heatmap")
    
    # -------------------------------------------------------------------------
    # DeFi Endpoints
    # -------------------------------------------------------------------------
    
    async def get_defi_summary(self) -> dict:
        return await self._get("/api/defi/summary")
    
    async def get_protocol_health(self, protocol: Optional[str] = None) -> dict:
        params = {}
        if protocol:
            params["protocol"] = protocol
        return await self._get("/api/defi/protocol-health", params)
    
    async def get_yields(self, chain: Optional[str] = None) -> dict:
        params = {}
        if chain:
            params["chain"] = chain
        return await self._get("/api/defi/yields", params)
    
    async def get_yield_stats(self) -> dict:
        return await self._get("/api/defi/yields/stats")
    
    async def get_stablecoins(self) -> dict:
        return await self._get("/api/stablecoins")
    
    async def get_stablecoin_depeg(self) -> dict:
        return await self._get("/api/stablecoins/depeg")
    
    async def get_dex_volumes(self) -> dict:
        return await self._get("/api/defi/dex-volumes")
    
    # -------------------------------------------------------------------------
    # Trading Endpoints
    # -------------------------------------------------------------------------
    
    async def get_arbitrage(self, min_spread: float = 0.5) -> dict:
        return await self._get("/api/arbitrage", {"min_spread": min_spread})
    
    async def get_signals(self, asset: str = "BTC", timeframe: str = "4h") -> dict:
        return await self._get("/api/signals", {"asset": asset, "timeframe": timeframe})
    
    async def get_funding(self) -> dict:
        return await self._get("/api/funding")
    
    async def get_liquidations(self, timeframe: str = "24h") -> dict:
        return await self._get("/api/liquidations", {"timeframe": timeframe})
    
    async def get_whale_alerts(self, min_value: int = 1000000) -> dict:
        return await self._get("/api/whale-alerts", {"min_value": min_value})
    
    async def get_orderbook(self, symbol: str = "BTCUSDT") -> dict:
        return await self._get("/api/orderbook", {"symbol": symbol})
    
    async def get_derivatives(self) -> dict:
        return await self._get("/api/derivatives")
    
    async def get_options(self, asset: str = "BTC") -> dict:
        return await self._get("/api/options", {"asset": asset})
    
    # -------------------------------------------------------------------------
    # Blockchain Endpoints
    # -------------------------------------------------------------------------
    
    async def get_bitcoin_stats(self) -> dict:
        return await self._get("/api/bitcoin/stats")
    
    async def get_bitcoin_difficulty(self) -> dict:
        return await self._get("/api/bitcoin/difficulty")
    
    async def get_bitcoin_mempool(self) -> dict:
        return await self._get("/api/bitcoin/mempool/info")
    
    async def get_gas(self, chain: str = "ethereum") -> dict:
        return await self._get("/api/gas", {"chain": chain})
    
    async def get_l2_projects(self) -> dict:
        return await self._get("/api/l2/projects")
    
    async def get_solana_tokens(self, limit: int = 50) -> dict:
        return await self._get("/api/solana/tokens", {"limit": limit})
    
    async def get_nft_market(self) -> dict:
        return await self._get("/api/nft/market")
    
    async def get_token_unlocks(self) -> dict:
        return await self._get("/api/token-unlocks")
    
    # -------------------------------------------------------------------------
    # Social Endpoints
    # -------------------------------------------------------------------------
    
    async def get_social_x(self, asset: Optional[str] = None) -> dict:
        params = {}
        if asset:
            params["asset"] = asset
        return await self._get("/api/social/x/sentiment", params)
    
    async def get_sentiment(self, asset: str = "BTC") -> dict:
        return await self._get("/api/sentiment", {"asset": asset})
    
    async def get_trending_topics(self) -> dict:
        return await self._get("/api/social/topics/trending")
    
    async def get_influencers(self) -> dict:
        return await self._get("/api/social/influencers")
    
    # -------------------------------------------------------------------------
    # AI Endpoints
    # -------------------------------------------------------------------------
    
    async def ask(self, question: str) -> dict:
        return await self._get("/api/ask", {"q": question})
    
    async def summarize(self, text: str) -> dict:
        return await self._post("/api/summarize", {"text": text})
    
    async def get_flash_briefing(self) -> dict:
        return await self._get("/api/ai/flash-briefing")
    
    async def get_oracle(self, asset: str = "BTC") -> dict:
        return await self._get("/api/ai/oracle", {"asset": asset})
    
    async def factcheck(self, claim: str) -> dict:
        return await self._get("/api/factcheck", {"claim": claim})
    
    async def detect_clickbait(self, title: str) -> dict:
        return await self._get("/api/clickbait", {"title": title})
    
    # -------------------------------------------------------------------------
    # Macro Endpoints
    # -------------------------------------------------------------------------
    
    async def get_macro(self) -> dict:
        return await self._get("/api/macro")
    
    async def get_fed(self) -> dict:
        return await self._get("/api/macro/fed")
    
    async def get_dxy(self) -> dict:
        return await self._get("/api/macro/dxy")
    
    async def get_exchange_rates(self) -> dict:
        return await self._get("/api/exchange-rates")
    
    # -------------------------------------------------------------------------
    # Feed Endpoints
    # -------------------------------------------------------------------------
    
    async def get_rss(self, category: Optional[str] = None) -> str:
        params = {}
        if category:
            params["category"] = category
        return await self._get_text("/api/rss", params)
    
    async def get_atom(self) -> str:
        return await self._get_text("/api/atom")
    
    async def get_opml(self) -> str:
        return await self._get_text("/api/opml")
    
    async def get_health(self) -> dict:
        return await self._get("/api/health")


# =============================================================================
# CONCURRENT REQUEST PATTERNS
# =============================================================================

async def fetch_market_dashboard():
    """
    Fetch a complete market dashboard with concurrent requests.
    Demonstrates parallel API calls for faster data loading.
    """
    async with AsyncCryptoNewsClient() as client:
        # Fire all requests concurrently
        results = await asyncio.gather(
            client.get_news(limit=10),
            client.get_fear_greed(),
            client.get_coins(limit=20),
            client.get_trending(limit=10),
            client.get_global(),
            client.get_breaking(),
            return_exceptions=True
        )
        
        news, fear_greed, coins, trending, global_data, breaking = results
        
        return {
            "news": news,
            "fear_greed": fear_greed,
            "coins": coins,
            "trending": trending,
            "global": global_data,
            "breaking": breaking,
        }


async def fetch_defi_overview():
    """
    Fetch DeFi overview with concurrent requests.
    """
    async with AsyncCryptoNewsClient() as client:
        results = await asyncio.gather(
            client.get_defi_summary(),
            client.get_yields(chain="ethereum"),
            client.get_stablecoins(),
            client.get_dex_volumes(),
            client.get_protocol_health(),
            return_exceptions=True
        )
        
        summary, yields, stablecoins, dex_volumes, health = results
        
        return {
            "summary": summary,
            "yields": yields,
            "stablecoins": stablecoins,
            "dex_volumes": dex_volumes,
            "protocol_health": health,
        }


async def fetch_trading_signals():
    """
    Fetch multiple trading data sources concurrently.
    """
    async with AsyncCryptoNewsClient() as client:
        results = await asyncio.gather(
            client.get_signals(asset="BTC", timeframe="4h"),
            client.get_arbitrage(min_spread=0.5),
            client.get_funding(),
            client.get_whale_alerts(min_value=5000000),
            client.get_liquidations(timeframe="24h"),
            return_exceptions=True
        )
        
        signals, arbitrage, funding, whales, liquidations = results
        
        return {
            "signals": signals,
            "arbitrage": arbitrage,
            "funding": funding,
            "whale_alerts": whales,
            "liquidations": liquidations,
        }


async def fetch_blockchain_overview():
    """
    Fetch blockchain data from multiple chains concurrently.
    """
    async with AsyncCryptoNewsClient() as client:
        results = await asyncio.gather(
            client.get_bitcoin_stats(),
            client.get_bitcoin_difficulty(),
            client.get_bitcoin_mempool(),
            client.get_gas(chain="ethereum"),
            client.get_l2_projects(),
            client.get_solana_tokens(limit=20),
            client.get_nft_market(),
            client.get_token_unlocks(),
            return_exceptions=True
        )
        
        btc_stats, difficulty, mempool, gas, l2, solana, nft, unlocks = results
        
        return {
            "bitcoin": {"stats": btc_stats, "difficulty": difficulty, "mempool": mempool},
            "ethereum": {"gas": gas},
            "l2": l2,
            "solana": solana,
            "nft": nft,
            "token_unlocks": unlocks,
        }


async def multi_asset_sentiment(assets: List[str]):
    """
    Fetch sentiment for multiple assets concurrently.
    
    Args:
        assets: List of asset symbols (e.g., ['BTC', 'ETH', 'SOL'])
    """
    async with AsyncCryptoNewsClient() as client:
        tasks = [client.get_sentiment(asset=a) for a in assets]
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        return {
            asset: result 
            for asset, result in zip(assets, results)
            if not isinstance(result, Exception)
        }


async def poll_breaking_news(interval: int = 30, max_iterations: int = 10):
    """
    Poll for breaking news at regular intervals.
    Demonstrates async polling pattern.
    
    Args:
        interval: Seconds between polls
        max_iterations: Maximum number of polls
    """
    seen_ids = set()
    
    async with AsyncCryptoNewsClient() as client:
        for i in range(max_iterations):
            try:
                data = await client.get_breaking()
                articles = data.get("articles", [])
                
                for article in articles:
                    article_id = article.get("id") or article.get("url")
                    if article_id and article_id not in seen_ids:
                        seen_ids.add(article_id)
                        print(f"[NEW] {article.get('title', 'Unknown')}")
                
                await asyncio.sleep(interval)
            except Exception as e:
                print(f"Error polling: {e}")
                await asyncio.sleep(interval)


async def rate_limited_batch(endpoints: List[str], rate: int = 5):
    """
    Fetch multiple endpoints with rate limiting.
    Processes 'rate' requests concurrently, then waits.
    
    Args:
        endpoints: List of API paths
        rate: Max concurrent requests per batch
    """
    async with AsyncCryptoNewsClient() as client:
        results = {}
        
        for i in range(0, len(endpoints), rate):
            batch = endpoints[i:i + rate]
            batch_results = await asyncio.gather(
                *[client._get(ep) for ep in batch],
                return_exceptions=True
            )
            
            for ep, result in zip(batch, batch_results):
                results[ep] = result
            
            # Brief pause between batches
            if i + rate < len(endpoints):
                await asyncio.sleep(0.5)
        
        return results


# =============================================================================
# STREAMING EXAMPLES (SSE)
# =============================================================================

async def stream_news_sse():
    """
    Connect to the Server-Sent Events (SSE) news stream.
    Demonstrates async streaming pattern.
    """
    async with aiohttp.ClientSession() as session:
        async with session.get(f"{BASE_URL}/api/news/stream") as resp:
            buffer = ""
            async for chunk in resp.content.iter_any():
                buffer += chunk.decode("utf-8")
                while "\n\n" in buffer:
                    event, buffer = buffer.split("\n\n", 1)
                    for line in event.split("\n"):
                        if line.startswith("data: "):
                            data = json.loads(line[6:])
                            print(f"[SSE] {data.get('title', 'Unknown')}")


# =============================================================================
# MAIN - RUN EXAMPLES
# =============================================================================

async def main():
    print("\n" + "="*60)
    print("FREE CRYPTO NEWS API - ASYNC EXAMPLES (aiohttp)")
    print("="*60)
    
    # 1. Market Dashboard (concurrent)
    print("\n📊 1. Market Dashboard (6 concurrent requests)")
    dashboard = await fetch_market_dashboard()
    print(f"   Fetched: {list(dashboard.keys())}")
    
    # 2. DeFi Overview (concurrent)
    print("\n🏦 2. DeFi Overview (5 concurrent requests)")
    defi = await fetch_defi_overview()
    print(f"   Fetched: {list(defi.keys())}")
    
    # 3. Trading Signals (concurrent)
    print("\n📈 3. Trading Signals (5 concurrent requests)")
    trading = await fetch_trading_signals()
    print(f"   Fetched: {list(trading.keys())}")
    
    # 4. Blockchain Overview (concurrent)
    print("\n⛓️ 4. Blockchain Overview (8 concurrent requests)")
    blockchain = await fetch_blockchain_overview()
    print(f"   Fetched: {list(blockchain.keys())}")
    
    # 5. Multi-asset Sentiment
    print("\n🎯 5. Multi-Asset Sentiment")
    sentiment = await multi_asset_sentiment(["BTC", "ETH", "SOL", "DOGE"])
    print(f"   Assets: {list(sentiment.keys())}")
    
    # 6. Rate-Limited Batch
    print("\n⏱️ 6. Rate-Limited Batch (10 endpoints, 5/batch)")
    endpoints = [
        "/api/news", "/api/breaking", "/api/bitcoin", "/api/defi",
        "/api/trending", "/api/fear-greed", "/api/global",
        "/api/health", "/api/sentiment", "/api/macro"
    ]
    batch = await rate_limited_batch(endpoints, rate=5)
    print(f"   Fetched: {len(batch)} endpoints")
    
    # 7. Single client usage
    print("\n🔌 7. Async Client (context manager)")
    async with AsyncCryptoNewsClient() as client:
        health = await client.get_health()
        print(f"   Health: {health}")
    
    print("\n" + "="*60)
    print("All async examples completed!")
    print("="*60)


if __name__ == "__main__":
    asyncio.run(main())
