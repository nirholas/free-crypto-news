# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news

"""
Free Crypto News Python SDK — synchronous client.

Usage:
    from crypto_news import CryptoNewsClient

    client = CryptoNewsClient()
    news = client.get_news(limit=10)
    for article in news:
        print(f"{article['title']} — {article['source']}")
"""

import json
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Any, Dict, List, Optional, Tuple

from .errors import APIError, CryptoNewsError, NetworkError, RateLimitError

__all__ = ["CryptoNewsClient"]

# Trading-terminal key → search keyword mapping.
COIN_PAIRS: Dict[str, str] = {
    "BTCUSD": "Bitcoin",
    "ETHUSD": "Ethereum",
    "LTCUSD": "Litecoin",
    "XRPUSD": "Ripple",
    "SOLUSD": "Solana",
    "BNBUSD": "Binance",
    "ADAUSD": "Cardano",
    "AVAXUSD": "Avalanche",
    "DOTUSD": "Polkadot",
    "MATICUSD": "Polygon",
    "DOGEUSD": "Dogecoin",
    "TRXUSD": "Tron",
    "XLMUSD": "Stellar Lumens",
    "XMRUSD": "Monero",
    "ZECUSD": "Zcash",
    "BATUSD": "Basic Attention Token",
    "EOSUSD": "EOS",
    "NEOUSD": "NEO",
    "ETCUSD": "Ethereum Classic",
}

_SCORE_MAP: Dict[str, float] = {
    "very_bullish": +1.0,
    "bullish": +0.5,
    "neutral": 0.0,
    "bearish": -0.5,
    "very_bearish": -1.0,
}
_SCORE_SIGNAL_TIERS = [
    (0.5, "very_bullish"),
    (0.15, "bullish"),
    (-0.15, "neutral"),
    (-0.5, "bearish"),
    (-999, "very_bearish"),
]


class CryptoNewsClient:
    """
    Synchronous client for the Free Crypto News API.

    No API key required. All endpoints are free to use.

    Args:
        base_url: API base URL. Defaults to ``https://cryptocurrency.cv/api``.
        timeout:  HTTP request timeout in seconds (default 10).

    Example::

        client = CryptoNewsClient()
        news = client.get_news(limit=5, category="bitcoin")
    """

    DEFAULT_BASE_URL = "https://cryptocurrency.cv/api"

    def __init__(
        self,
        base_url: str = "https://cryptocurrency.cv/api",
        timeout: float = 10.0,
    ) -> None:
        # Strip trailing slash for consistent URL joining
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

    # ── internal helpers ─────────────────────────────────────────

    def _request(self, path: str) -> Any:
        """Make an API request and return parsed JSON.

        Raises:
            RateLimitError: on HTTP 429
            APIError: on other non-2xx codes
            NetworkError: on connection / timeout failures
        """
        url = f"{self.base_url}{path}"
        try:
            with urllib.request.urlopen(url, timeout=self.timeout) as resp:
                return json.loads(resp.read().decode())
        except urllib.error.HTTPError as exc:
            if exc.code == 429:
                retry_after = exc.headers.get("Retry-After")
                raise RateLimitError(
                    retry_after=float(retry_after) if retry_after else None
                ) from exc
            raise APIError(status_code=exc.code, message=str(exc.reason)) from exc
        except urllib.error.URLError as exc:
            raise NetworkError(str(exc.reason), cause=exc) from exc
        except Exception as exc:
            raise CryptoNewsError(f"Unexpected error: {exc}") from exc

    # ── public API methods ───────────────────────────────────────

    def get_news(
        self,
        limit: int = 10,
        category: Optional[str] = None,
        search: Optional[str] = None,
    ) -> List[Dict[str, Any]]:
        """Get latest crypto news articles.

        Args:
            limit:    Maximum articles to return (1–50).
            category: Filter by category (e.g. ``"bitcoin"``, ``"defi"``).
            search:   Free-text search query.

        Returns:
            List of article dicts with keys like ``title``, ``link``,
            ``source``, ``pubDate``, ``timeAgo``.
        """
        if search:
            encoded = urllib.parse.quote(search)
            return self._request(f"/search?q={encoded}&limit={limit}").get("articles", [])
        if category:
            return self._request(f"/{category}?limit={limit}").get("articles", [])
        return self._request(f"/news?limit={limit}").get("articles", [])

    def get_prices(self, coin: Optional[str] = None) -> Any:
        """Get cryptocurrency price data.

        Args:
            coin: Optional coin filter (e.g. ``"bitcoin"``).

        Returns:
            Price data dict / list from the API.
        """
        endpoint = "/prices"
        if coin:
            endpoint += f"?coin={urllib.parse.quote(coin)}"
        return self._request(endpoint)

    def get_market(self) -> Dict[str, Any]:
        """Get market overview (total cap, volume, dominance).

        Returns:
            Market overview dict.
        """
        return self._request("/market")

    def get_fear_greed(self) -> Dict[str, Any]:
        """Get Fear & Greed Index.

        Returns:
            Dict with ``value``, ``classification``, ``timestamp``.
        """
        return self._request("/fear-greed")

    def get_gas(self) -> Dict[str, Any]:
        """Get current Ethereum gas prices.

        Returns:
            Gas price data dict.
        """
        return self._request("/gas")

    def get_trending(self, limit: int = 10, hours: int = 24) -> Dict[str, Any]:
        """Get trending news topics with sentiment.

        Args:
            limit: Maximum topics.
            hours: Time window in hours.

        Returns:
            Dict with ``trending`` list and metadata.
        """
        return self._request(f"/trending?limit={limit}&hours={hours}")

    def search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search news by keywords.

        Args:
            query: Search query string.
            limit: Maximum results (1–30).

        Returns:
            List of matching article dicts.
        """
        encoded = urllib.parse.quote(query)
        return self._request(f"/search?q={encoded}&limit={limit}").get("articles", [])

    def get_sources(self) -> List[Dict[str, Any]]:
        """Get list of all available news sources.

        Returns:
            List of source info dicts.
        """
        return self._request("/sources").get("sources", [])

    def get_breaking(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get breaking news (last 2 hours).

        Args:
            limit: Maximum articles.

        Returns:
            List of breaking article dicts.
        """
        return self._request(f"/breaking?limit={limit}").get("articles", [])

    def get_defi(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get DeFi-specific news.

        Args:
            limit: Maximum articles.

        Returns:
            List of DeFi article dicts.
        """
        return self._request(f"/defi?limit={limit}").get("articles", [])

    def get_bitcoin(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get Bitcoin-specific news.

        Args:
            limit: Maximum articles.

        Returns:
            List of Bitcoin article dicts.
        """
        return self._request(f"/bitcoin?limit={limit}").get("articles", [])

    def get_stats(self) -> Dict[str, Any]:
        """Get API statistics and analytics.

        Returns:
            Stats dict with article counts by source/category.
        """
        return self._request("/stats")

    def get_health(self) -> Dict[str, Any]:
        """Check API health status.

        Returns:
            Health status dict.
        """
        return self._request("/health")

    def analyze(
        self,
        limit: int = 20,
        topic: Optional[str] = None,
        sentiment: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get news with topic classification and sentiment analysis.

        Args:
            limit:     Maximum articles.
            topic:     Filter by topic.
            sentiment: Filter by sentiment (``bullish``, ``bearish``, ``neutral``).

        Returns:
            Dict with ``articles`` and ``summary``.
        """
        endpoint = f"/analyze?limit={limit}"
        if topic:
            endpoint += f"&topic={urllib.parse.quote(topic)}"
        if sentiment:
            endpoint += f"&sentiment={sentiment}"
        return self._request(endpoint)

    def get_archive(
        self,
        date: Optional[str] = None,
        query: Optional[str] = None,
        limit: int = 50,
    ) -> Dict[str, Any]:
        """Get archived historical news.

        Args:
            date:  Date in ``YYYY-MM-DD`` format.
            query: Search query within archive.
            limit: Maximum articles.

        Returns:
            Archive response dict.
        """
        params = [f"limit={limit}"]
        if date:
            params.append(f"date={date}")
        if query:
            params.append(f"q={urllib.parse.quote(query)}")
        return self._request(f"/archive?{'&'.join(params)}")

    def get_origins(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        limit: int = 20,
    ) -> Dict[str, Any]:
        """Find original sources of news.

        Args:
            query:    Search query.
            category: Category filter.
            limit:    Maximum results.

        Returns:
            Origins response dict.
        """
        params = [f"limit={limit}"]
        if query:
            params.append(f"q={urllib.parse.quote(query)}")
        if category:
            params.append(f"category={category}")
        return self._request(f"/origins?{'&'.join(params)}")

    def get_portfolio(
        self,
        coins: List[str],
        limit: int = 10,
        include_prices: bool = True,
    ) -> Dict[str, Any]:
        """Get portfolio news with optional prices.

        Args:
            coins:          List of coin identifiers.
            limit:          Maximum articles per coin.
            include_prices: Include live price data.

        Returns:
            Portfolio response dict.
        """
        coins_param = ",".join(coins) if isinstance(coins, list) else coins
        return self._request(
            f"/portfolio?coins={urllib.parse.quote(coins_param)}"
            f"&limit={limit}&prices={str(include_prices).lower()}"
        )

    def get_coin_sentiment(
        self,
        coins: Optional[Dict[str, str]] = None,
        limit: int = 30,
        min_articles: int = 5,
        min_confidence: float = 20.0,
        workers: int = 8,
    ) -> Dict[str, Dict[str, Any]]:
        """Calculate per-coin sentiment with confidence weighting.

        Uses concurrent requests to analyse sentiment for multiple coins.

        Args:
            coins:          ``{pair: keyword}`` mapping. Defaults to ``COIN_PAIRS``.
            limit:          Max articles per coin.
            min_articles:   Minimum articles before tradeable.
            min_confidence: Minimum confidence (0–100) for tradeable.
            workers:        Max parallel HTTP requests.

        Returns:
            Dict keyed by pair with sentiment data including ``signal``,
            ``confidence``, ``tradeable``, ``score``, etc.
        """
        if coins is None:
            coins = COIN_PAIRS

        _BULLISH = {"very_bullish", "bullish"}
        _BEARISH = {"very_bearish", "bearish"}

        def _fetch_one(pair: str, keyword: str) -> Tuple[str, Dict[str, Any]]:
            try:
                data = self.analyze(limit=limit, topic=keyword)
                articles = data.get("articles", [])
                total = len(articles)

                if total == 0:
                    return pair, {
                        "keyword": keyword, "articles": 0,
                        "pos": 0.0, "mid": 0.0, "neg": 0.0,
                        "score": 0.0, "signal": "neutral",
                        "confidence": 0.0, "tradeable": False,
                        "reason": "no articles found",
                    }

                pos = sum(1 for a in articles if a.get("sentiment") in _BULLISH)
                neg = sum(1 for a in articles if a.get("sentiment") in _BEARISH)
                mid = total - pos - neg

                pos_pct = pos * 100 / total
                mid_pct = mid * 100 / total
                neg_pct = neg * 100 / total

                raw_score = sum(
                    _SCORE_MAP.get(a.get("sentiment", "neutral"), 0.0)
                    for a in articles
                )
                score = round(raw_score / total, 4)

                signal = next(
                    label for threshold, label in _SCORE_SIGNAL_TIERS
                    if score >= threshold
                )

                volume_weight = min(total / max(min_articles, 1), 1.0)
                pct_vals = sorted([pos_pct, mid_pct, neg_pct], reverse=True)
                margin_weight = max(pct_vals[0] - pct_vals[1], 0.0) / 100.0
                confidence = round(volume_weight * margin_weight * 100, 1)

                reasons: List[str] = []
                if total < min_articles:
                    reasons.append(
                        f"only {total} article{'s' if total != 1 else ''} found (min {min_articles})"
                    )
                if confidence < min_confidence:
                    reasons.append(
                        f"confidence {confidence:.1f} below threshold {min_confidence:.1f}"
                    )

                return pair, {
                    "keyword": keyword,
                    "articles": total,
                    "pos": round(pos_pct, 1),
                    "mid": round(mid_pct, 1),
                    "neg": round(neg_pct, 1),
                    "score": score,
                    "signal": signal,
                    "confidence": confidence,
                    "tradeable": len(reasons) == 0,
                    "reason": "; ".join(reasons),
                }

            except Exception as e:
                return pair, {
                    "keyword": keyword, "articles": 0,
                    "pos": 0.0, "mid": 0.0, "neg": 0.0,
                    "score": 0.0, "signal": "error",
                    "confidence": 0.0, "tradeable": False,
                    "reason": str(e),
                }

        results: Dict[str, Dict[str, Any]] = {}
        with ThreadPoolExecutor(max_workers=min(workers, len(coins))) as pool:
            futures = {
                pool.submit(_fetch_one, pair, kw): pair
                for pair, kw in coins.items()
            }
            for future in as_completed(futures):
                pair, result = future.result()
                results[pair] = result

        return {pair: results[pair] for pair in coins if pair in results}
