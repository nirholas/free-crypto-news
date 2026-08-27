# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news

"""
Free Crypto News Python SDK — async client.

Requires ``aiohttp``: ``pip install crypto-news-client[async]``

Usage:
    import asyncio
    from crypto_news import AsyncCryptoNewsClient

    async def main():
        async with AsyncCryptoNewsClient() as client:
            news = await client.get_news(limit=10)
            for article in news:
                print(article["title"])

    asyncio.run(main())
"""

from __future__ import annotations

import urllib.parse
from typing import Any, Dict, List, Optional

from .errors import APIError, CryptoNewsError, NetworkError, RateLimitError

__all__ = ["AsyncCryptoNewsClient"]


class AsyncCryptoNewsClient:
    """
    Async client for the Free Crypto News API using ``aiohttp``.

    Supports ``async with`` context manager for proper session cleanup.

    Args:
        base_url: API base URL. Defaults to ``https://cryptocurrency.cv/api``.
        timeout:  Request timeout in seconds (default 10).

    Example::

        async with AsyncCryptoNewsClient() as client:
            news = await client.get_news(limit=5)
    """

    DEFAULT_BASE_URL = "https://cryptocurrency.cv/api"

    def __init__(
        self,
        base_url: str = "https://cryptocurrency.cv/api",
        timeout: float = 10.0,
    ) -> None:
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout
        self._session: Any = None  # aiohttp.ClientSession, lazily created

    async def _get_session(self) -> Any:
        """Lazily create an aiohttp session."""
        if self._session is None or self._session.closed:
            try:
                import aiohttp
            except ImportError:
                raise ImportError(
                    "aiohttp is required for AsyncCryptoNewsClient. "
                    "Install it with: pip install crypto-news-client[async]"
                )
            self._session = aiohttp.ClientSession(
                timeout=aiohttp.ClientTimeout(total=self.timeout)
            )
        return self._session

    async def close(self) -> None:
        """Close the underlying HTTP session."""
        if self._session and not self._session.closed:
            await self._session.close()

    async def __aenter__(self) -> "AsyncCryptoNewsClient":
        return self

    async def __aexit__(self, *args: Any) -> None:
        await self.close()

    # ── internal helpers ─────────────────────────────────────────

    async def _request(self, path: str) -> Any:
        """Make an async API request and return parsed JSON.

        Raises:
            RateLimitError: on HTTP 429
            APIError: on other non-2xx codes
            NetworkError: on connection / timeout failures
        """
        session = await self._get_session()
        url = f"{self.base_url}{path}"
        try:
            async with session.get(url) as resp:
                if resp.status == 429:
                    retry_after = resp.headers.get("Retry-After")
                    raise RateLimitError(
                        retry_after=float(retry_after) if retry_after else None
                    )
                if resp.status >= 400:
                    text = await resp.text()
                    raise APIError(status_code=resp.status, message=text)
                return await resp.json()
        except (RateLimitError, APIError):
            raise
        except Exception as exc:
            if "aiohttp" in type(exc).__module__:
                raise NetworkError(str(exc), cause=exc) from exc
            raise CryptoNewsError(f"Unexpected error: {exc}") from exc

    # ── public API methods ───────────────────────────────────────

    async def get_news(
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
            List of article dicts.
        """
        if search:
            encoded = urllib.parse.quote(search)
            data = await self._request(f"/search?q={encoded}&limit={limit}")
            return data.get("articles", [])
        if category:
            data = await self._request(f"/{category}?limit={limit}")
            return data.get("articles", [])
        data = await self._request(f"/news?limit={limit}")
        return data.get("articles", [])

    async def get_prices(self, coin: Optional[str] = None) -> Any:
        """Get cryptocurrency price data.

        Args:
            coin: Optional coin filter (e.g. ``"bitcoin"``).
        """
        endpoint = "/prices"
        if coin:
            endpoint += f"?coin={urllib.parse.quote(coin)}"
        return await self._request(endpoint)

    async def get_market(self) -> Dict[str, Any]:
        """Get market overview."""
        return await self._request("/market")

    async def get_fear_greed(self) -> Dict[str, Any]:
        """Get Fear & Greed Index."""
        return await self._request("/fear-greed")

    async def get_gas(self) -> Dict[str, Any]:
        """Get current Ethereum gas prices."""
        return await self._request("/gas")

    async def get_trending(self, limit: int = 10, hours: int = 24) -> Dict[str, Any]:
        """Get trending news topics with sentiment.

        Args:
            limit: Maximum topics.
            hours: Time window in hours.
        """
        return await self._request(f"/trending?limit={limit}&hours={hours}")

    async def search(self, query: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Search news by keywords.

        Args:
            query: Search query string.
            limit: Maximum results (1–30).
        """
        encoded = urllib.parse.quote(query)
        data = await self._request(f"/search?q={encoded}&limit={limit}")
        return data.get("articles", [])

    async def get_sources(self) -> List[Dict[str, Any]]:
        """Get list of all available news sources."""
        data = await self._request("/sources")
        return data.get("sources", [])

    async def get_breaking(self, limit: int = 5) -> List[Dict[str, Any]]:
        """Get breaking news (last 2 hours)."""
        data = await self._request(f"/breaking?limit={limit}")
        return data.get("articles", [])

    async def get_defi(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get DeFi-specific news."""
        data = await self._request(f"/defi?limit={limit}")
        return data.get("articles", [])

    async def get_bitcoin(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get Bitcoin-specific news."""
        data = await self._request(f"/bitcoin?limit={limit}")
        return data.get("articles", [])

    async def get_stats(self) -> Dict[str, Any]:
        """Get API statistics and analytics."""
        return await self._request("/stats")

    async def get_health(self) -> Dict[str, Any]:
        """Check API health status."""
        return await self._request("/health")

    async def analyze(
        self,
        limit: int = 20,
        topic: Optional[str] = None,
        sentiment: Optional[str] = None,
    ) -> Dict[str, Any]:
        """Get news with topic classification and sentiment analysis.

        Args:
            limit:     Maximum articles.
            topic:     Filter by topic.
            sentiment: Filter by sentiment.
        """
        endpoint = f"/analyze?limit={limit}"
        if topic:
            endpoint += f"&topic={urllib.parse.quote(topic)}"
        if sentiment:
            endpoint += f"&sentiment={sentiment}"
        return await self._request(endpoint)

    async def get_archive(
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
        """
        params = [f"limit={limit}"]
        if date:
            params.append(f"date={date}")
        if query:
            params.append(f"q={urllib.parse.quote(query)}")
        return await self._request(f"/archive?{'&'.join(params)}")

    async def get_origins(
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
        """
        params = [f"limit={limit}"]
        if query:
            params.append(f"q={urllib.parse.quote(query)}")
        if category:
            params.append(f"category={category}")
        return await self._request(f"/origins?{'&'.join(params)}")
