# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news

"""
Free Crypto News Python SDK

100% FREE — no API keys required!

Quick start:
    from crypto_news import CryptoNewsClient

    client = CryptoNewsClient()
    news = client.get_news(limit=10)

Async quick start:
    from crypto_news import AsyncCryptoNewsClient

    async with AsyncCryptoNewsClient() as client:
        news = await client.get_news(limit=10)
"""

from .client import COIN_PAIRS, CryptoNewsClient
from .errors import APIError, CryptoNewsError, NetworkError, RateLimitError

# Lazy import for async client (aiohttp may not be installed)
def __getattr__(name: str):  # noqa: N807
    if name == "AsyncCryptoNewsClient":
        from .async_client import AsyncCryptoNewsClient
        return AsyncCryptoNewsClient
    raise AttributeError(f"module {__name__!r} has no attribute {name!r}")


# Convenience aliases — keep backward compat with the old single-file SDK
CryptoNews = CryptoNewsClient

__all__ = [
    "CryptoNewsClient",
    "CryptoNews",
    "AsyncCryptoNewsClient",
    "CryptoNewsError",
    "APIError",
    "RateLimitError",
    "NetworkError",
    "COIN_PAIRS",
]

__version__ = "1.0.0"
