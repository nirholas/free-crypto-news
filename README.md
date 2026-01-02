# 🆓 Free Crypto News API

Self-host your own crypto news aggregator. 7 sources. Zero API keys. MIT licensed.

```bash
git clone https://github.com/nirholas/free-crypto-news.git
cd free-crypto-news && npm install && npm run dev
curl http://localhost:3000/api/news
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnirholas%2Ffree-crypto-news)

## Why?

| Service | Price | API Key | Rate Limit |
|---------|-------|---------|------------|
| CryptoCompare | $30-300/mo | ✅ Required | ✅ Yes |
| CoinGecko | $129-499/mo | ✅ Required | ✅ Yes |
| **This** | **$0** | **None** | **You control** |

## 7 News Sources

- **CoinDesk** — General crypto
- **The Block** — Research & analysis
- **Decrypt** — Web3 & culture
- **CoinTelegraph** — Global coverage
- **Bitcoin Magazine** — BTC-focused
- **Blockworks** — DeFi & institutions
- **The Defiant** — DeFi deep dives

## Endpoints

| Endpoint | Description |
|----------|-------------|
| `/api/news` | Latest from all sources |
| `/api/search?q=bitcoin` | Search headlines |
| `/api/defi` | DeFi news only |
| `/api/bitcoin` | Bitcoin news only |
| `/api/breaking` | Last 2 hours |
| `/api/sources` | List sources |

## Integrations

<details>
<summary><b>Python</b></summary>

```python
# sdk/python/crypto_news.py - zero dependencies
from sdk.python.crypto_news import CryptoNews

news = CryptoNews("http://localhost:3000")
for item in news.get_news(limit=5):
    print(f"• {item['title']}")
```
</details>

<details>
<summary><b>JavaScript</b></summary>

```javascript
// sdk/javascript/crypto-news.js
import CryptoNews from './sdk/javascript/crypto-news.js';

const news = new CryptoNews('http://localhost:3000');
const articles = await news.getNews({ limit: 5 });
```
</details>

<details>
<summary><b>ChatGPT Custom GPT</b></summary>

1. Deploy your own instance
2. Go to ChatGPT → Create GPT → Actions
3. Import `chatgpt/openapi.yaml`
4. Update the `servers.url` to your deployment URL
</details>

<details>
<summary><b>Claude MCP</b></summary>

```bash
# In claude_desktop_config.json:
{
  "mcpServers": {
    "crypto-news": {
      "command": "node",
      "args": ["/path/to/free-crypto-news/mcp/index.js"],
      "env": {
        "CRYPTO_NEWS_API_URL": "http://localhost:3000"
      }
    }
  }
}
```

Then tell Claude: "Search crypto news for Ethereum"
</details>

<details>
<summary><b>cURL</b></summary>

```bash
# After running: npm run dev
curl http://localhost:3000/api/news | jq '.articles[:3]'
curl "http://localhost:3000/api/search?q=ethereum" | jq
```
</details>

## Deploy Your Own

### Vercel (Recommended)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fnirholas%2Ffree-crypto-news)

### Local
```bash
git clone https://github.com/nirholas/free-crypto-news.git
cd free-crypto-news
npm install
npm run dev
```

### Docker
```bash
docker build -t crypto-news .
docker run -p 3000:3000 crypto-news
```

## License

MIT — do whatever you want.

---

*Made by [nich](https://github.com/nirholas)*
