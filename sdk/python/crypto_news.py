"""
Free Crypto News Python SDK

100% FREE - no API keys required!

Usage:
    from crypto_news import CryptoNews
    
    news = CryptoNews()
    articles = news.get_latest(limit=10)
    
    for article in articles:
        print(f"{article['title']} - {article['source']}")
"""

import urllib.request
import json
from typing import Optional, List, Dict, Any

class CryptoNews:
    """Free Crypto News API client."""
    
    BASE_URL = "https://free-crypto-news.vercel.app"
    
    def __init__(self, base_url: Optional[str] = None):
        """
        Initialize the client.
        
        Args:
            base_url: Optional custom API URL (for self-hosted instances)
        """
        self.base_url = base_url or self.BASE_URL
    
    def _request(self, endpoint: str) -> Dict[str, Any]:
        """Make API request."""
        url = f"{self.base_url}{endpoint}"
        with urllib.request.urlopen(url) as response:
            return json.loads(response.read().decode())
    
    def get_latest(self, limit: int = 10, source: Optional[str] = None) -> List[Dict]:
        """
        Get latest crypto news.
        
        Args:
            limit: Max articles (1-50)
            source: Filter by source (coindesk, theblock, decrypt, etc.)
        
        Returns:
            List of news articles
        """
        endpoint = f"/api/news?limit={limit}"
        if source:
            endpoint += f"&source={source}"
        return self._request(endpoint)["articles"]
    
    def search(self, keywords: str, limit: int = 10) -> List[Dict]:
        """
        Search news by keywords.
        
        Args:
            keywords: Comma-separated search terms
            limit: Max results (1-30)
        
        Returns:
            List of matching articles
        """
        encoded = urllib.parse.quote(keywords)
        return self._request(f"/api/search?q={encoded}&limit={limit}")["articles"]
    
    def get_defi(self, limit: int = 10) -> List[Dict]:
        """Get DeFi-specific news."""
        return self._request(f"/api/defi?limit={limit}")["articles"]
    
    def get_bitcoin(self, limit: int = 10) -> List[Dict]:
        """Get Bitcoin-specific news."""
        return self._request(f"/api/bitcoin?limit={limit}")["articles"]
    
    def get_breaking(self, limit: int = 5) -> List[Dict]:
        """Get breaking news (last 2 hours)."""
        return self._request(f"/api/breaking?limit={limit}")["articles"]
    
    def get_sources(self) -> List[Dict]:
        """Get list of all news sources."""
        return self._request("/api/sources")["sources"]


# Convenience functions
def get_crypto_news(limit: int = 10) -> List[Dict]:
    """Quick function to get latest news."""
    return CryptoNews().get_latest(limit)

def search_crypto_news(keywords: str, limit: int = 10) -> List[Dict]:
    """Quick function to search news."""
    return CryptoNews().search(keywords, limit)


if __name__ == "__main__":
    # Demo
    print("📰 Latest Crypto News\n" + "=" * 50)
    news = CryptoNews()
    for article in news.get_latest(5):
        print(f"\n📌 {article['title']}")
        print(f"   🔗 {article['link']}")
        print(f"   📰 {article['source']} • {article['timeAgo']}")
