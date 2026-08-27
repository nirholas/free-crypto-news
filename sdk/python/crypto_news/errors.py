# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE
# https://github.com/nirholas/free-crypto-news

"""
Free Crypto News Python SDK — errors module.

Custom exception hierarchy for structured error handling.
"""

__all__ = ["CryptoNewsError", "RateLimitError", "NetworkError", "APIError"]


class CryptoNewsError(Exception):
    """Base exception for all Crypto News SDK errors."""

    def __init__(self, message: str = "An error occurred with the Crypto News API"):
        self.message = message
        super().__init__(self.message)


class NetworkError(CryptoNewsError):
    """Raised when a network-level error prevents the request from completing."""

    def __init__(self, message: str = "Network error communicating with API", cause: Exception | None = None):
        self.cause = cause
        super().__init__(message)


class APIError(CryptoNewsError):
    """Raised when the API returns a non-2xx status code."""

    def __init__(self, status_code: int, message: str = "API request failed"):
        self.status_code = status_code
        super().__init__(f"{message} (HTTP {status_code})")


class RateLimitError(APIError):
    """Raised when the API returns 429 Too Many Requests."""

    def __init__(self, retry_after: float | None = None):
        self.retry_after = retry_after
        msg = "Rate limit exceeded"
        if retry_after is not None:
            msg += f" — retry after {retry_after}s"
        super().__init__(status_code=429, message=msg)
