🌐 **भाषाएं:** [English](README.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [한국어](README.ko.md) | [العربية](README.ar.md) | [Русский](README.ru.md) | [Italiano](README.it.md) | [Nederlands](README.nl.md) | [Polski](README.pl.md) | [Türkçe](README.tr.md) | [हिंदी](README.hi.md)

---

# 🆓 फ्री क्रिप्टो न्यूज़ API

<p align="center">
  <a href="https://github.com/nirholas/free-crypto-news/stargazers"><img src="https://img.shields.io/github/stars/nirholas/free-crypto-news?style=for-the-badge&logo=github&color=yellow" alt="GitHub Stars"></a>
  <a href="https://github.com/nirholas/free-crypto-news/blob/main/LICENSE"><img src="https://img.shields.io/github/license/nirholas/free-crypto-news?style=for-the-badge&color=blue" alt="License"></a>
</p>

> ⭐ **अगर आपको यह उपयोगी लगे, तो कृपया रेपो को स्टार करें!** इससे दूसरों को इस प्रोजेक्ट को खोजने में मदद मिलती है।

---

एक API कॉल से **200+ स्रोतों** से रियल-टाइम क्रिप्टो न्यूज़ प्राप्त करें।

```bash
curl https://cryptocurrency.cv/api/news
```

---

## ✨ विशेषताएं

- 🆓 **हमेशा मुफ्त** - कोई API कुंजी नहीं, कोई रजिस्ट्रेशन नहीं
- 📰 **200+ स्रोत** - 130+ अंग्रेजी + 75 अंतर्राष्ट्रीय स्रोत
- 🌍 **18 भाषाएं** - स्वचालित अंग्रेजी अनुवाद के साथ
- 🤖 **AI विश्लेषण** - सेंटिमेंट, सारांश, और ट्रेडिंग सिग्नल
- 📈 **मार्केट डेटा** - Fear & Greed Index, कॉइन प्राइस
- 🔔 **रियल-टाइम** - SSE स्ट्रीमिंग और वेबसॉकेट सपोर्ट
- 🔌 **आसान इंटीग्रेशन** - MCP, ChatGPT, Claude

---

## 🚀 त्वरित शुरुआत

### समाचार प्राप्त करें

```bash
# नवीनतम समाचार
curl "https://cryptocurrency.cv/api/news?limit=10"

# बिटकॉइन समाचार
curl "https://cryptocurrency.cv/api/news?ticker=BTC"

# ब्रेकिंग न्यूज़
curl "https://cryptocurrency.cv/api/breaking"
```

### Python उदाहरण

```python
import requests

BASE_URL = "https://cryptocurrency.cv"

# नवीनतम समाचार प्राप्त करें
news = requests.get(f"{BASE_URL}/api/news?limit=10").json()
for article in news["articles"]:
    print(f"• {article['title']} ({article['source']})")

# बिटकॉइन सेंटिमेंट विश्लेषण
sentiment = requests.get(f"{BASE_URL}/api/ai/sentiment?asset=BTC").json()
print(f"BTC सेंटिमेंट: {sentiment['label']} ({sentiment['score']:.2f})")

# Fear & Greed Index
fg = requests.get(f"{BASE_URL}/api/market/fear-greed").json()
print(f"मार्केट: {fg['classification']} ({fg['value']}/100)")
```

### JavaScript उदाहरण

```javascript
const BASE_URL = 'https://cryptocurrency.cv';

// नवीनतम समाचार प्राप्त करें
const news = await fetch(`${BASE_URL}/api/news?limit=10`).then(r => r.json());
news.articles.forEach(a => console.log(`• ${a.title} (${a.source})`));

// AI सारांश
const summary = await fetch(`${BASE_URL}/api/summarize`).then(r => r.json());
console.log(summary.summary);
```

---

## 📚 API एंडपॉइंट्स

### मुख्य एंडपॉइंट्स

| एंडपॉइंट | विवरण |
|----------|--------|
| `/api/news` | नवीनतम क्रिप्टो समाचार |
| `/api/breaking` | ब्रेकिंग न्यूज़ |
| `/api/trending` | ट्रेंडिंग आर्टिकल्स |
| `/api/search?q=` | समाचार खोजें |

### AI एंडपॉइंट्स

| एंडपॉइंट | विवरण |
|----------|--------|
| `/api/ai/sentiment` | मार्केट सेंटिमेंट |
| `/api/summarize` | समाचार सारांश |
| `/api/ask?q=` | प्रश्न पूछें |
| `/api/digest` | दैनिक डाइजेस्ट |

### मार्केट डेटा

| एंडपॉइंट | विवरण |
|----------|--------|
| `/api/market/fear-greed` | Fear & Greed Index |
| `/api/market/coins` | कॉइन प्राइस |
| `/api/market/trending` | ट्रेंडिंग कॉइन्स |

---

## 🇮🇳 हिंदी समाचार स्रोत

भारतीय क्रिप्टो समाचार स्रोतों से समाचार प्राप्त करें:

| स्रोत | विवरण |
|-------|--------|
| CoinSwitch | भारत का प्रमुख क्रिप्टो प्लेटफॉर्म |
| CoinDCX | भारतीय क्रिप्टो एक्सचेंज |
| WazirX | भारत का सबसे बड़ा एक्सचेंज |
| ZebPay | वेटेरन भारतीय एक्सचेंज |
| Crypto News India | भारतीय क्रिप्टो समाचार |

```bash
# हिंदी समाचार प्राप्त करें
curl "https://cryptocurrency.cv/api/news/international?language=hi"

# अंग्रेजी अनुवाद के साथ
curl "https://cryptocurrency.cv/api/news/international?language=hi&translate=true"
```

---

## 📱 मोबाइल ऐप

React Native मोबाइल ऐप [mobile/](mobile/) फोल्डर में उपलब्ध है:

```bash
cd mobile
npm install
npm start
```

---

## 🔗 लिंक

- **API**: https://cryptocurrency.cv
- **डॉक्युमेंटेशन**: https://cryptocurrency.cv/docs
- **GitHub**: https://github.com/AItoolsbyai/free-crypto-news

---

## 📄 लाइसेंस

MIT License - विवरण के लिए [LICENSE](LICENSE) देखें।

---

<p align="center">
  भारतीय क्रिप्टो समुदाय के लिए ❤️ के साथ बनाया गया
</p>

