# Copyright 2024-2026 nirholas. All rights reserved.
# SPDX-License-Identifier: SEE LICENSE IN LICENSE

"""Unit tests for CryptoNewsClient (synchronous client)."""

import json
import unittest
from unittest.mock import MagicMock, patch
from http.client import HTTPResponse
from io import BytesIO

from crypto_news import CryptoNewsClient, CryptoNewsError, APIError, RateLimitError, NetworkError


def _mock_response(data: dict, status: int = 200) -> MagicMock:
    """Build a mock urllib response."""
    body = json.dumps(data).encode()
    mock = MagicMock()
    mock.read.return_value = body
    mock.__enter__ = MagicMock(return_value=mock)
    mock.__exit__ = MagicMock(return_value=False)
    return mock


class TestCryptoNewsClient(unittest.TestCase):
    """Test suite for the synchronous CryptoNewsClient."""

    def setUp(self):
        self.client = CryptoNewsClient()

    def test_default_base_url(self):
        self.assertEqual(self.client.base_url, "https://cryptocurrency.cv/api")

    def test_custom_base_url(self):
        client = CryptoNewsClient(base_url="https://example.com/api/")
        self.assertEqual(client.base_url, "https://example.com/api")

    @patch("urllib.request.urlopen")
    def test_get_news(self, mock_urlopen):
        mock_articles = [
            {"title": "Bitcoin hits 100k", "source": "CoinDesk", "link": "https://example.com"},
        ]
        mock_urlopen.return_value = _mock_response({"articles": mock_articles})

        articles = self.client.get_news(limit=5)
        self.assertEqual(len(articles), 1)
        self.assertEqual(articles[0]["title"], "Bitcoin hits 100k")

    @patch("urllib.request.urlopen")
    def test_get_news_with_category(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"articles": []})
        self.client.get_news(limit=5, category="bitcoin")
        call_url = mock_urlopen.call_args[0][0]
        self.assertIn("/bitcoin?limit=5", call_url)

    @patch("urllib.request.urlopen")
    def test_get_news_with_search(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"articles": []})
        self.client.get_news(limit=5, search="ethereum")
        call_url = mock_urlopen.call_args[0][0]
        self.assertIn("/search?q=ethereum&limit=5", call_url)

    @patch("urllib.request.urlopen")
    def test_get_prices(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"bitcoin": {"usd": 100000}})
        result = self.client.get_prices(coin="bitcoin")
        self.assertIn("bitcoin", result)

    @patch("urllib.request.urlopen")
    def test_get_market(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"total_cap": 3000000000000})
        result = self.client.get_market()
        self.assertIn("total_cap", result)

    @patch("urllib.request.urlopen")
    def test_get_fear_greed(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"value": 72, "classification": "Greed"})
        result = self.client.get_fear_greed()
        self.assertEqual(result["value"], 72)

    @patch("urllib.request.urlopen")
    def test_get_gas(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"fast": 50, "standard": 30})
        result = self.client.get_gas()
        self.assertIn("fast", result)

    @patch("urllib.request.urlopen")
    def test_get_trending(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({
            "trending": [{"topic": "Bitcoin", "count": 42, "sentiment": "bullish"}]
        })
        result = self.client.get_trending(limit=5)
        self.assertEqual(len(result["trending"]), 1)

    @patch("urllib.request.urlopen")
    def test_search(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"articles": [{"title": "ETH news"}]})
        articles = self.client.search("ethereum", limit=3)
        self.assertEqual(len(articles), 1)

    @patch("urllib.request.urlopen")
    def test_get_sources(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({
            "sources": [{"key": "coindesk", "name": "CoinDesk"}]
        })
        sources = self.client.get_sources()
        self.assertEqual(sources[0]["key"], "coindesk")

    @patch("urllib.request.urlopen")
    def test_get_breaking(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"articles": []})
        articles = self.client.get_breaking(limit=3)
        self.assertEqual(articles, [])

    @patch("urllib.request.urlopen")
    def test_get_stats(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"total_articles": 5000})
        result = self.client.get_stats()
        self.assertEqual(result["total_articles"], 5000)

    @patch("urllib.request.urlopen")
    def test_get_health(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"status": "healthy"})
        result = self.client.get_health()
        self.assertEqual(result["status"], "healthy")

    @patch("urllib.request.urlopen")
    def test_analyze(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({
            "articles": [], "summary": {"overall_sentiment": "bullish"}
        })
        result = self.client.analyze(limit=10, topic="bitcoin")
        self.assertEqual(result["summary"]["overall_sentiment"], "bullish")

    @patch("urllib.request.urlopen")
    def test_get_archive(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"articles": [], "date": "2024-01-15"})
        result = self.client.get_archive(date="2024-01-15", query="SEC")
        self.assertIn("date", result)

    @patch("urllib.request.urlopen")
    def test_get_origins(self, mock_urlopen):
        mock_urlopen.return_value = _mock_response({"items": [], "totalCount": 0})
        result = self.client.get_origins(query="binance", category="exchange")
        self.assertEqual(result["totalCount"], 0)

    def test_http_error_raises_api_error(self):
        import urllib.error
        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_urlopen.side_effect = urllib.error.HTTPError(
                url="https://cryptocurrency.cv/api/news",
                code=500,
                msg="Server Error",
                hdrs=MagicMock(),
                fp=BytesIO(b"error"),
            )
            with self.assertRaises(APIError) as ctx:
                self.client.get_news()
            self.assertEqual(ctx.exception.status_code, 500)

    def test_http_429_raises_rate_limit_error(self):
        import urllib.error
        headers = MagicMock()
        headers.get.return_value = "30"
        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_urlopen.side_effect = urllib.error.HTTPError(
                url="https://cryptocurrency.cv/api/news",
                code=429,
                msg="Too Many Requests",
                hdrs=headers,
                fp=BytesIO(b"rate limited"),
            )
            with self.assertRaises(RateLimitError) as ctx:
                self.client.get_news()
            self.assertEqual(ctx.exception.retry_after, 30.0)

    def test_url_error_raises_network_error(self):
        import urllib.error
        with patch("urllib.request.urlopen") as mock_urlopen:
            mock_urlopen.side_effect = urllib.error.URLError("Connection refused")
            with self.assertRaises(NetworkError):
                self.client.get_news()


class TestErrorHierarchy(unittest.TestCase):
    """Test that custom exceptions form the expected hierarchy."""

    def test_network_error_is_crypto_news_error(self):
        self.assertTrue(issubclass(NetworkError, CryptoNewsError))

    def test_api_error_is_crypto_news_error(self):
        self.assertTrue(issubclass(APIError, CryptoNewsError))

    def test_rate_limit_error_is_api_error(self):
        self.assertTrue(issubclass(RateLimitError, APIError))


if __name__ == "__main__":
    unittest.main()
