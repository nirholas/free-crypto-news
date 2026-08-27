🌐 **ภาษา:** [English](README.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [한국어](README.ko.md) | [العربية](README.ar.md) | [Русский](README.ru.md) | [Italiano](README.it.md) | [Nederlands](README.nl.md) | [Polski](README.pl.md) | [Türkçe](README.tr.md) | [Tiếng Việt](README.vi.md) | [ไทย](README.th.md) | [Bahasa Indonesia](README.id.md)

---

# 🆓 API ข่าว Crypto ฟรี

<p align="center">
  <a href="https://github.com/nirholas/free-crypto-news/stargazers"><img src="https://img.shields.io/github/stars/nirholas/free-crypto-news?style=for-the-badge&logo=github&color=yellow" alt="GitHub Stars"></a>
  <a href="https://github.com/nirholas/free-crypto-news/blob/main/LICENSE"><img src="https://img.shields.io/github/license/nirholas/free-crypto-news?style=for-the-badge&color=blue" alt="สัญญาอนุญาต"></a>
  <a href="https://github.com/nirholas/free-crypto-news/issues"><img src="https://img.shields.io/github/issues/nirholas/free-crypto-news?style=for-the-badge&color=orange" alt="Issues"></a>
  <a href="https://github.com/nirholas/free-crypto-news/pulls"><img src="https://img.shields.io/github/issues-pr/nirholas/free-crypto-news?style=for-the-badge&color=purple" alt="Pull Requests"></a>
</p>

<p align="center">
  <img src=".github/demo.svg" alt="สาธิต Free Crypto News API" width="700">
</p>

> ⭐ **หากคุณพบว่าสิ่งนี้มีประโยชน์ โปรดกด Star ที่ repo!** ช่วยให้ผู้อื่นค้นพบโปรเจกต์นี้และสนับสนุนการพัฒนาอย่างต่อเนื่อง

---

รับข่าว crypto แบบเรียลไทม์จาก 7 แหล่งหลักด้วยการเรียก API เพียงครั้งเดียว

```bash
curl https://cryptocurrency.cv/api/news
```

---

## การเปรียบเทียบ

| | Free Crypto News | CryptoPanic | อื่นๆ |
|---|---|---|---|
| **ราคา** | 🆓 ฟรีตลอดกาล | $29-299/เดือน | ต้องจ่าย |
| **API Key** | ❌ ไม่ต้องใช้ | ต้องใช้ | ต้องใช้ |
| **ลิมิต** | ไม่จำกัด* | 100-1000/วัน | จำกัด |
| **แหล่งข่าว** | 12 ภาษาอังกฤษ + 12 นานาชาติ | 1 | แตกต่างกัน |
| **นานาชาติ** | 🌏 KO, ZH, JA, ES + แปล | ไม่มี | ไม่มี |
| **Self-host** | ✅ คลิกเดียว | ไม่ได้ | ไม่ได้ |
| **PWA** | ✅ ติดตั้งได้ | ไม่ | ไม่ |
| **MCP** | ✅ Claude + ChatGPT | ไม่ | ไม่ |

---

## 🌿 สาขา

| สาขา | คำอธิบาย |
|--------|-------------|
| `main` | สาขา production ที่เสถียร — ดีไซน์ดั้งเดิมเน้น API |
| `redesign/pro-news-ui` | ออกแบบ UI ระดับ Pro ใหม่ — สไตล์ CoinDesk/CoinTelegraph พร้อมโหมดมืด, components ที่ปรับปรุง, structured data SEO และรองรับ PWA เต็มรูปแบบ |

ทดลอง redesign ในเครื่อง:
```bash
git checkout redesign/pro-news-ui
npm install && npm run dev
```

---

## 🌍 แหล่งข่าวนานาชาติ

รับข่าว crypto จาก **12 แหล่งนานาชาติ** เป็นภาษาเกาหลี จีน ญี่ปุ่น และสเปน — พร้อมแปลอัตโนมัติเป็นภาษาอังกฤษ!

### แหล่งที่รองรับ

| ภูมิภาค | แหล่ง |
|--------|---------|
| 🇰🇷 **เกาหลี** | Block Media, TokenPost, CoinDesk Korea |
| 🇨🇳 **จีน** | 8BTC (巴比特), Jinse Finance (金色财经), Odaily (星球日报) |
| 🇯🇵 **ญี่ปุ่น** | CoinPost, CoinDesk Japan, Cointelegraph Japan |
| 🇪🇸 **ลาตินอเมริกา** | Cointelegraph Español, Diario Bitcoin, CriptoNoticias |

### ตัวอย่างด่วน

```bash
# รับข่าวนานาชาติทั้งหมด
curl "https://cryptocurrency.cv/api/news/international"

# รับข่าวเกาหลีพร้อมแปลภาษาอังกฤษ
curl "https://cryptocurrency.cv/api/news/international?language=ko&translate=true"

# รับข่าวจากภูมิภาคเอเชีย
curl "https://cryptocurrency.cv/api/news/international?region=asia&limit=20"
```

### คุณสมบัติ

- ✅ **แปลอัตโนมัติ** เป็นภาษาอังกฤษผ่าน Groq AI
- ✅ **แคชการแปล 7 วัน** เพื่อประสิทธิภาพ
- ✅ **คงต้นฉบับ + ภาษาอังกฤษไว้**
- ✅ **Rate limiting** (1 req/วินาที) เพื่อเคารพ API
- ✅ **จัดการ fallback** สำหรับแหล่งที่ไม่พร้อมใช้งาน
- ✅ **ลบซ้ำ** ระหว่างแหล่งต่างๆ

ดู [เอกสาร API](docs/API.md#get-apinewsinternational) สำหรับรายละเอียดทั้งหมด

---

## 📱 Progressive Web App (PWA)

Free Crypto News เป็น **PWA ที่ติดตั้งได้เต็มรูปแบบ** ทำงานแบบออฟไลน์

### คุณสมบัติ

| คุณสมบัติ | คำอธิบาย |
|---------|-------------|
| 📲 **ติดตั้งได้** | เพิ่มลงหน้าจอหลักบนทุกอุปกรณ์ |
| 📴 **โหมดออฟไลน์** | อ่านข่าวที่แคชไว้โดยไม่ต้องมีอินเทอร์เน็ต |
| 🔔 **Push Notifications** | รับการแจ้งเตือนข่าวด่วน |
| ⚡ **เร็วมาก** | กลยุทธ์แคชเชิงรุก |
| 🔄 **ซิงค์เบื้องหลัง** | อัปเดตอัตโนมัติเมื่อออนไลน์ |
| 🎯 **ทางลัด** | เข้าถึงด่วนไปยัง ล่าสุด, ร้อนแรง, Bitcoin |
| 📤 **แชร์** | แชร์ลิงก์โดยตรงเข้าแอป |
| 🚨 **การแจ้งเตือนเรียลไทม์** | แจ้งเตือนราคาและเงื่อนไขข่าวที่กำหนดเองได้ |

### การติดตั้งแอป

**เดสก์ท็อป (Chrome/Edge):**
1. เข้าไปที่ [cryptocurrency.cv](https://cryptocurrency.cv)
2. คลิกไอคอนติดตั้ง (⊕) ในแถบที่อยู่
3. คลิก "ติดตั้ง"

**iOS Safari:**
1. เข้าไปที่เพจใน Safari
2. แตะแชร์ (📤) → "เพิ่มลงหน้าจอหลัก"

**Android Chrome:**
1. เข้าไปที่เพจ
2. แตะแบนเนอร์ติดตั้งหรือเมนู → "ติดตั้งแอป"

### การแคช Service Worker

PWA ใช้กลยุทธ์แคชอัจฉริยะ:

| เนื้อหา | กลยุทธ์ | ระยะเวลาแคช |
|---------|----------|----------------|
| API Response | Network-first | 5 นาที |
| Static Assets | Cache-first | 7 วัน |
| รูปภาพ | Cache-first | 30 วัน |
| Navigation | Network-first + offline fallback | 24 ชั่วโมง |

### แป้นพิมพ์ลัด

นำทางผ่านข่าวอย่างรวดเร็วด้วยแป้นพิมพ์:

| ทางลัด | การดำเนินการ |
|----------|--------|
| `j` / `k` | บทความถัดไป / ก่อนหน้า |
| `/` | โฟกัสค้นหา |
| `Enter` | เปิดบทความที่เลือก |
| `d` | สลับโหมดมืด |
| `g h` | ไปหน้าหลัก |
| `g t` | ไปยอดนิยม |
| `g s` | ไปแหล่ง |
| `g b` | ไปบุ๊กมาร์ก |
| `?` | แสดงทางลัดทั้งหมด |
| `Escape` | ปิด modal |

📖 **คู่มือผู้ใช้ฉบับเต็ม:** [docs/USER-GUIDE.md](docs/USER-GUIDE.md)

---

## แหล่งข่าว

เรารวบรวมจาก **7 เว็บไซต์ข่าวที่เชื่อถือได้**:

- 🟠 **CoinDesk** — ข่าว crypto ครอบคลุม
- 🔵 **The Block** — สถาบัน & วิจัย
- 🟢 **Decrypt** — Web3 & วัฒนธรรม
- 🟡 **CoinTelegraph** — ข่าว crypto ทั่วโลก
- 🟤 **Bitcoin Magazine** — Bitcoin maximalist
- 🟣 **Blockworks** — DeFi & สถาบัน
- 🔴 **The Defiant** — DeFi พื้นเมือง

---

## Endpoints

| Endpoint | คำอธิบาย |
|----------|-------------|
| `/api/news` | ล่าสุดจากทุกแหล่ง |
| `/api/search?q=bitcoin` | ค้นหาด้วยคีย์เวิร์ด |
| `/api/defi` | ข่าว DeFi โดยเฉพาะ |
| `/api/bitcoin` | ข่าว Bitcoin โดยเฉพาะ |
| `/api/breaking` | เฉพาะ 2 ชั่วโมงล่าสุด |
| `/api/trending` | หัวข้อยอดนิยมพร้อม sentiment |
| `/api/analyze` | ข่าวพร้อมจัดหมวดหมู่ |
| `/api/stats` | สถิติ & analytics |
| `/api/sources` | รายชื่อแหล่งทั้งหมด |
| `/api/health` | สถานะ API & feeds |
| `/api/rss` | RSS feed รวม |
| `/api/atom` | Atom feed รวม |
| `/api/opml` | OPML export สำหรับ RSS readers |
| `/api/docs` | เอกสาร API แบบโต้ตอบ |
| `/api/webhooks` | สมัคร webhooks |
| `/api/archive` | คลังข่าวประวัติศาสตร์ |
| `/api/push` | Web Push notifications |
| `/api/origins` | หาต้นทางของข่าว |
| `/api/portfolio` | ข่าวตาม portfolio + ราคา |
| `/api/news/international` | แหล่งนานาชาติพร้อมแปล |

### 🤖 AI-Powered Endpoints (ฟรีผ่าน Groq)

| Endpoint | คำอธิบาย |
|----------|-------------|
| `/api/digest` | สรุปข่าวประจำวันโดย AI |
| `/api/sentiment` | วิเคราะห์ sentiment ตลาด |
| `/api/summarize?url=` | สรุป URL ใดก็ได้ |
| `/api/ask` | ถาม AI เกี่ยวกับข่าว crypto |
| `/api/entities` | แยก entities ที่กล่าวถึง |
| `/api/claims` | ยืนยันข้อเรียกร้อง |
| `/api/clickbait` | ตรวจจับ clickbait |

### 💹 Market Data Endpoints

| Endpoint | คำอธิบาย |
|----------|-------------|
| `/api/fear-greed` | ดัชนี Fear & Greed พร้อมข้อมูลประวัติ |
| `/api/arbitrage` | โอกาส arbitrage ข้ามตลาด |
| `/api/signals` | สัญญาณ trading ทางเทคนิค |
| `/api/funding` | Funding rates ข้ามตลาดอนุพันธ์ |
| `/api/options` | กระแส options & max pain |
| `/api/liquidations` | ข้อมูล liquidation เรียลไทม์ |
| `/api/whale-alerts` | ติดตามการเทรดของวาฬ |
| `/api/orderbook` | ข้อมูล orderbook รวม |

---

## เริ่มต้นอย่างรวดเร็ว

### ใช้ cURL

```bash
# รับข่าวล่าสุด
curl "https://cryptocurrency.cv/api/news"

# ค้นหาข่าว
curl "https://cryptocurrency.cv/api/search?q=ethereum"

# รับ AI digest
curl "https://cryptocurrency.cv/api/digest"

# รับ Fear & Greed Index
curl "https://cryptocurrency.cv/api/fear-greed"
```

### ใช้ JavaScript

```javascript
// รับข่าวล่าสุด
const response = await fetch('https://cryptocurrency.cv/api/news');
const data = await response.json();

console.log(data.articles);
// [{ title, link, source, pubDate, timeAgo, ... }, ...]
```

### ใช้ Python

```python
import requests

# รับข่าวล่าสุด
response = requests.get('https://cryptocurrency.cv/api/news')
data = response.json()

for article in data['articles'][:5]:
    print(f"• {article['title']} ({article['source']})")
```

---

## การ Deploy ส่วนตัว

### Deploy คลิกเดียว

[![Deploy กับ Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nirholas/free-crypto-news)
[![Deploy กับ Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/nirholas/free-crypto-news)

### ตั้งค่าในเครื่อง

```bash
# Clone repository
git clone https://github.com/nirholas/free-crypto-news.git
cd free-crypto-news

# ติดตั้ง dependencies
npm install

# รัน development server
npm run dev

# เปิด http://localhost:3000
```

### ตัวแปรสภาพแวดล้อม

```env
# ทางเลือก: สำหรับคุณสมบัติ AI (ฟรีจาก groq.com)
GROQ_API_KEY=gsk_your_key_here

# ทางเลือก: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_id
```

---

## เอกสาร

| เอกสาร | คำอธิบาย |
|---|---|
| [📚 อ้างอิง API](docs/API.md) | เอกสาร endpoint ครบถ้วน |
| [🏗️ สถาปัตยกรรม](docs/ARCHITECTURE.md) | ออกแบบระบบ |
| [🚀 การ Deploy](docs/DEPLOYMENT.md) | คู่มือ production |
| [🧪 การทดสอบ](docs/TESTING.md) | คู่มือทดสอบ |
| [🔐 ความปลอดภัย](docs/SECURITY.md) | นโยบายความปลอดภัย |
| [📖 คู่มือผู้ใช้](docs/USER-GUIDE.md) | คู่มือ PWA & คุณสมบัติ |
| [💻 คู่มือนักพัฒนา](docs/DEVELOPER-GUIDE.md) | เอกสารสำหรับผู้ร่วมพัฒนา |

---

## การมีส่วนร่วม

ยินดีต้อนรับการมีส่วนร่วม! ดู [CONTRIBUTING.md](CONTRIBUTING.md) สำหรับแนวทาง

```bash
# Fork repo
# สร้าง feature branch
git checkout -b feature/amazing-feature

# Commit การเปลี่ยนแปลง
git commit -m 'Add amazing feature'

# Push และสร้าง Pull Request
git push origin feature/amazing-feature
```

---

## สัญญาอนุญาต

MIT License - ดูไฟล์ [LICENSE](LICENSE)

---

## ติดต่อ

- 🐛 **Bugs**: [GitHub Issues](https://github.com/nirholas/free-crypto-news/issues)
- 💬 **สนทนา**: [GitHub Discussions](https://github.com/nirholas/free-crypto-news/discussions)
- 🐦 **Twitter**: [@nirholas](https://twitter.com/nirholas)

---

<p align="center">
  สร้างด้วย ❤️ สำหรับชุมชน crypto
  <br>
  <a href="https://cryptocurrency.cv">cryptocurrency.cv</a>
</p>

