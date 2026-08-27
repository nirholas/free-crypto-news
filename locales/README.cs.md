🌐 **Jazyky:** [English](README.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [한국어](README.ko.md) | [العربية](README.ar.md) | [Русский](README.ru.md) | [Italiano](README.it.md) | [Nederlands](README.nl.md) | [Polski](README.pl.md) | [Türkçe](README.tr.md) | [Čeština](README.cs.md)

---

# 🆓 Bezplatné Crypto News API

<p align="center">
  <a href="https://github.com/nirholas/free-crypto-news/stargazers"><img src="https://img.shields.io/github/stars/nirholas/free-crypto-news?style=for-the-badge&logo=github&color=yellow" alt="GitHub Stars"></a>
  <a href="https://github.com/nirholas/free-crypto-news/blob/main/LICENSE"><img src="https://img.shields.io/github/license/nirholas/free-crypto-news?style=for-the-badge&color=blue" alt="Licence"></a>
</p>

> ⭐ **Pokud vám to přijde užitečné, dejte repozitáři hvězdičku!** Pomáhá to ostatním objevit tento projekt.

---

Získejte krypto novinky v reálném čase z **200+ zdrojů** jedním API voláním.

```bash
curl https://cryptocurrency.cv/api/news
```

---

## ✨ Funkce

- 🆓 **Navždy zdarma** - Žádný API klíč, žádná registrace
- 📰 **200+ zdrojů** - 130+ anglických + 75 mezinárodních zdrojů
- 🌍 **18 jazyků** - S automatickým anglickým překladem
- 🤖 **AI Analýza** - Sentiment, shrnutí a obchodní signály
- 📈 **Tržní data** - Fear & Greed Index, ceny mincí
- 🔔 **Reálný čas** - SSE streaming a podpora WebSocket
- 🔌 **Snadná integrace** - MCP, ChatGPT, Claude

---

## 🚀 Rychlý start

### Získání zpráv

```bash
# Nejnovější zprávy
curl "https://cryptocurrency.cv/api/news?limit=10"

# Bitcoin zprávy
curl "https://cryptocurrency.cv/api/news?ticker=BTC"

# Breaking news
curl "https://cryptocurrency.cv/api/breaking"
```

### Příklad Python

```python
import requests

BASE_URL = "https://cryptocurrency.cv"

# Získat nejnovější zprávy
news = requests.get(f"{BASE_URL}/api/news?limit=10").json()
for article in news["articles"]:
    print(f"• {article['title']} ({article['source']})")

# Analýza sentimentu Bitcoinu
sentiment = requests.get(f"{BASE_URL}/api/ai/sentiment?asset=BTC").json()
print(f"BTC Sentiment: {sentiment['label']} ({sentiment['score']:.2f})")

# Fear & Greed Index
fg = requests.get(f"{BASE_URL}/api/market/fear-greed").json()
print(f"Trh: {fg['classification']} ({fg['value']}/100)")
```

### Příklad JavaScript

```javascript
const BASE_URL = 'https://cryptocurrency.cv';

// Získat nejnovější zprávy
const news = await fetch(`${BASE_URL}/api/news?limit=10`).then(r => r.json());
news.articles.forEach(a => console.log(`• ${a.title} (${a.source})`));

// AI shrnutí
const summary = await fetch(`${BASE_URL}/api/summarize`).then(r => r.json());
console.log(summary.summary);
```

---

## 📚 API Endpointy

### Hlavní endpointy

| Endpoint | Popis |
|----------|-------|
| `/api/news` | Nejnovější krypto zprávy |
| `/api/breaking` | Breaking news |
| `/api/trending` | Populární články |
| `/api/search?q=` | Vyhledávání zpráv |

### AI Endpointy

| Endpoint | Popis |
|----------|-------|
| `/api/ai/sentiment` | Tržní sentiment |
| `/api/summarize` | Shrnutí zpráv |
| `/api/ask?q=` | Položit otázky |
| `/api/digest` | Denní přehled |

### Tržní data

| Endpoint | Popis |
|----------|-------|
| `/api/market/fear-greed` | Fear & Greed Index |
| `/api/market/coins` | Ceny mincí |
| `/api/market/trending` | Populární mince |

---

## 🌍 Mezinárodní zdroje

Získejte zprávy v 18 jazycích:

```bash
# České zprávy (pokud jsou k dispozici)
curl "https://cryptocurrency.cv/api/news/international?language=cs"

# S anglickým překladem
curl "https://cryptocurrency.cv/api/news/international?language=ko&translate=true"
```

---

## 📱 Mobilní aplikace

React Native mobilní aplikace je v složce [mobile/](mobile/):

```bash
cd mobile
npm install
npm start
```

---

## 🔗 Odkazy

- **API**: https://cryptocurrency.cv
- **Dokumentace**: https://cryptocurrency.cv/docs
- **GitHub**: https://github.com/AItoolsbyai/free-crypto-news

---

## 📄 Licence

MIT License - viz [LICENSE](LICENSE) pro detaily.

---

<p align="center">
  Vytvořeno s ❤️ pro krypto komunitu
</p>

