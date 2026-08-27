🌐 **اللغة:** [English](README.md) | [Español](README.es.md) | [Français](README.fr.md) | [Deutsch](README.de.md) | [Português](README.pt.md) | [日本語](README.ja.md) | [简体中文](README.zh-CN.md) | [繁體中文](README.zh-TW.md) | [한국어](README.ko.md) | [العربية](README.ar.md) | [Русский](README.ru.md) | [Italiano](README.it.md) | [Nederlands](README.nl.md) | [Polski](README.pl.md) | [Türkçe](README.tr.md) | [Tiếng Việt](README.vi.md) | [ไทย](README.th.md) | [Bahasa Indonesia](README.id.md)

---

<div dir="rtl">

# 🆓 واجهة برمجة تطبيقات أخبار العملات المشفرة المجانية

<p align="center">
  <a href="https://github.com/nirholas/free-crypto-news/stargazers"><img src="https://img.shields.io/github/stars/nirholas/free-crypto-news?style=for-the-badge&logo=github&color=yellow" alt="نجوم GitHub"></a>
  <a href="https://github.com/nirholas/free-crypto-news/blob/main/LICENSE"><img src="https://img.shields.io/github/license/nirholas/free-crypto-news?style=for-the-badge&color=blue" alt="الترخيص"></a>
  <a href="https://github.com/nirholas/free-crypto-news/issues"><img src="https://img.shields.io/github/issues/nirholas/free-crypto-news?style=for-the-badge&color=orange" alt="المشاكل"></a>
  <a href="https://github.com/nirholas/free-crypto-news/pulls"><img src="https://img.shields.io/github/issues-pr/nirholas/free-crypto-news?style=for-the-badge&color=purple" alt="طلبات السحب"></a>
</p>

<p align="center">
  <img src=".github/demo.svg" alt="عرض Free Crypto News API" width="700">
</p>

> ⭐ **إذا وجدت هذا مفيدًا، يرجى إعطاء نجمة للمستودع!** هذا يساعد الآخرين على اكتشاف هذا المشروع ويحفز على التطوير المستمر.

---

احصل على أخبار العملات المشفرة في الوقت الفعلي من 7 مصادر رئيسية باستدعاء API واحد.

```bash
curl https://cryptocurrency.cv/api/news
```

---

## المقارنة

| | Free Crypto News | CryptoPanic | أخرى |
|---|---|---|---|
| **السعر** | 🆓 مجاني للأبد | $29-299/شهر | مدفوع |
| **مفتاح API** | ❌ غير مطلوب | مطلوب | مطلوب |
| **حد الطلبات** | غير محدود* | 100-1000/يوم | محدود |
| **المصادر** | 12 إنجليزي + 12 دولي | 1 | متنوع |
| **التدويل** | 🌏 كوري، صيني، ياباني، إسباني + ترجمة | لا | لا |
| **استضافة ذاتية** | ✅ نشر بنقرة واحدة | لا | لا |
| **PWA** | ✅ قابل للتثبيت | لا | لا |
| **MCP** | ✅ Claude + ChatGPT | لا | لا |

---

## 🌿 الفروع

| الفرع | الوصف |
|--------|-------------|
| `main` | فرع الإنتاج المستقر — التصميم الأصلي المركز على API |
| `redesign/pro-news-ui` | إعادة تصميم واجهة المستخدم المتقدمة — أسلوب CoinDesk/CoinTelegraph مع الوضع الداكن والمكونات المحسنة وبيانات SEO المهيكلة ودعم PWA الكامل |

لاختبار إعادة التصميم محليًا:
```bash
git checkout redesign/pro-news-ui
npm install && npm run dev
```

---

## 🌍 مصادر الأخبار الدولية

احصل على أخبار العملات المشفرة من **12 مصدرًا دوليًا** بالكورية والصينية واليابانية والإسبانية — مترجمة تلقائيًا للإنجليزية!

### المصادر المدعومة

| المنطقة | المصادر |
|--------|---------|
| 🇰🇷 **كوريا** | Block Media, TokenPost, CoinDesk Korea |
| 🇨🇳 **الصين** | 8BTC (باييت), Jinse Finance (جينسي), Odaily (أوديلي) |
| 🇯🇵 **اليابان** | CoinPost, CoinDesk Japan, Cointelegraph Japan |
| 🇪🇸 **أمريكا اللاتينية** | Cointelegraph Español, Diario Bitcoin, CriptoNoticias |

### أمثلة سريعة

```bash
# الحصول على جميع الأخبار الدولية
curl "https://cryptocurrency.cv/api/news/international"

# الحصول على أخبار كورية مترجمة للإنجليزية
curl "https://cryptocurrency.cv/api/news/international?language=ko&translate=true"

# الحصول على أخبار منطقة آسيا
curl "https://cryptocurrency.cv/api/news/international?region=asia&limit=20"
```

### الميزات

- ✅ **ترجمة تلقائية** للإنجليزية عبر Groq AI
- ✅ **تخزين مؤقت للترجمة 7 أيام** للكفاءة
- ✅ الحفاظ على **النص الأصلي + الإنجليزي**
- ✅ **تحديد المعدل** (1 طلب/ثانية) احترامًا للـ APIs
- ✅ **تراجع سلس** للمصادر غير المتاحة
- ✅ **إزالة التكرار** عبر المصادر

راجع [وثائق API](docs/API.md#get-apinewsinternational) للتفاصيل الكاملة.

---

## 📱 تطبيق ويب تقدمي (PWA)

Free Crypto News هو **PWA قابل للتثبيت بالكامل** يعمل دون اتصال.

### الميزات

| الميزة | الوصف |
|---------|-------------|
| 📲 **قابل للتثبيت** | أضف إلى الشاشة الرئيسية على أي جهاز |
| 📴 **وضع دون اتصال** | اقرأ الأخبار المخزنة مؤقتًا بدون شبكة |
| 🔔 **إشعارات الدفع** | تلقي تنبيهات الأخبار العاجلة |
| ⚡ **سريع جدًا** | استراتيجيات تخزين مؤقت عدوانية |
| 🔄 **مزامنة في الخلفية** | تحديث تلقائي عند العودة للاتصال |
| 🎯 **اختصارات** | وصول سريع للأحدث والشائع وبيتكوين |
| 📤 **مشاركة** | مشاركة الروابط مباشرة في التطبيق |
| 🚨 **تنبيهات فورية** | تنبيهات قابلة للتكوين للسعر وشروط الأخبار |

### تثبيت التطبيق

**سطح المكتب (Chrome/Edge):**
1. قم بزيارة [cryptocurrency.cv](https://cryptocurrency.cv)
2. انقر على أيقونة التثبيت (⊕) في شريط URL
3. انقر "تثبيت"

**iOS Safari:**
1. قم بزيارة الموقع في Safari
2. اضغط على مشاركة (📤) → "إضافة إلى الشاشة الرئيسية"

**Android Chrome:**
1. قم بزيارة الموقع
2. اضغط على لافتة التثبيت أو القائمة → "تثبيت التطبيق"

### تخزين Service Worker المؤقت

يستخدم PWA استراتيجيات تخزين ذكية:

| المحتوى | الاستراتيجية | مدة التخزين |
|---------|----------|----------------|
| استجابات API | Network-first | 5 دقائق |
| الأصول الثابتة | Cache-first | 7 أيام |
| الصور | Cache-first | 30 يومًا |
| التنقل | Network-first + احتياطي دون اتصال | 24 ساعة |

### اختصارات لوحة المفاتيح

تنقل سريع عبر الأخبار باستخدام لوحة المفاتيح:

| الاختصار | الإجراء |
|----------|--------|
| `j` / `k` | المقال التالي / السابق |
| `/` | تركيز البحث |
| `Enter` | فتح المقال المحدد |
| `d` | تبديل الوضع الداكن |
| `g h` | الذهاب للرئيسية |
| `g t` | الذهاب للشائع |
| `g s` | الذهاب للمصادر |
| `g b` | الذهاب للمفضلة |
| `?` | عرض جميع الاختصارات |
| `Escape` | إغلاق النافذة المنبثقة |

📖 **دليل المستخدم الكامل:** [docs/USER-GUIDE.md](docs/USER-GUIDE.md)

---

## المصادر

نجمع من **7 وسائل إعلام موثوقة**:

- 🟠 **CoinDesk** — أخبار العملات المشفرة العامة
- 🔵 **The Block** — المؤسسات والأبحاث
- 🟢 **Decrypt** — Web3 والثقافة
- 🟡 **CoinTelegraph** — أخبار العملات المشفرة العالمية
- 🟤 **Bitcoin Magazine** — متطرفو البيتكوين
- 🟣 **Blockworks** — DeFi والمؤسسات
- 🔴 **The Defiant** — DeFi الأصلي

---

## نقاط النهاية

| نقطة النهاية | الوصف |
|----------|-------------|
| `/api/news` | آخر الأخبار من جميع المصادر |
| `/api/search?q=bitcoin` | البحث بكلمة مفتاحية |
| `/api/defi` | أخبار متعلقة بـ DeFi |
| `/api/bitcoin` | أخبار متعلقة بـ Bitcoin |
| `/api/breaking` | آخر ساعتين فقط |
| `/api/trending` | المواضيع الرائجة مع تحليل المشاعر |
| `/api/analyze` | الأخبار مع تصنيف المواضيع |
| `/api/stats` | التحليلات والإحصائيات |
| `/api/sources` | قائمة جميع المصادر |
| `/api/health` | حالة صحة API والخلاصات |
| `/api/rss` | خلاصة RSS مجمعة |
| `/api/atom` | خلاصة Atom مجمعة |
| `/api/opml` | تصدير OPML لقارئات RSS |
| `/api/docs` | وثائق API تفاعلية |
| `/api/webhooks` | تسجيل webhooks |
| `/api/archive` | أرشيف الأخبار التاريخية |
| `/api/push` | إشعارات Web Push |
| `/api/origins` | العثور على المصدر الأصلي للأخبار |
| `/api/portfolio` | أخبار مبنية على المحفظة + الأسعار |
| `/api/news/international` | مصادر دولية مع ترجمة |

### 🤖 نقاط نهاية مدعومة بالذكاء الاصطناعي (مجاني عبر Groq)

| نقطة النهاية | الوصف |
|----------|-------------|
| `/api/digest` | ملخص يومي مُنشأ بالذكاء الاصطناعي |
| `/api/sentiment` | تحليل مشاعر السوق |
| `/api/summarize?url=` | تلخيص أي URL |
| `/api/ask` | اسأل الذكاء الاصطناعي عن أخبار العملات المشفرة |
| `/api/entities` | استخراج الكيانات المذكورة |
| `/api/claims` | التحقق من الادعاءات |
| `/api/clickbait` | اكتشاف العناوين المضللة |

### 💹 نقاط نهاية السوق

| نقطة النهاية | الوصف |
|----------|-------------|
| `/api/fear-greed` | مؤشر الخوف والطمع مع بيانات تاريخية |
| `/api/arbitrage` | فرص المراجحة عبر البورصات |
| `/api/signals` | إشارات تداول تقنية |
| `/api/funding` | معدلات التمويل عبر بورصات المشتقات |
| `/api/options` | تدفق الخيارات وأقصى ألم |
| `/api/liquidations` | بيانات التصفية في الوقت الفعلي |
| `/api/whale-alerts` | تتبع صفقات الحيتان |
| `/api/orderbook` | بيانات دفتر الطلبات المجمعة |

---

## البداية السريعة

### استخدام cURL

```bash
# الحصول على آخر الأخبار
curl "https://cryptocurrency.cv/api/news"

# البحث في الأخبار
curl "https://cryptocurrency.cv/api/search?q=ethereum"

# الحصول على ملخص AI
curl "https://cryptocurrency.cv/api/digest"

# الحصول على مؤشر الخوف والطمع
curl "https://cryptocurrency.cv/api/fear-greed"
```

### استخدام JavaScript

```javascript
// الحصول على آخر الأخبار
const response = await fetch('https://cryptocurrency.cv/api/news');
const data = await response.json();

console.log(data.articles);
// [{ title, link, source, pubDate, timeAgo, ... }, ...]
```

### استخدام Python

```python
import requests

# الحصول على آخر الأخبار
response = requests.get('https://cryptocurrency.cv/api/news')
data = response.json()

for article in data['articles'][:5]:
    print(f"• {article['title']} ({article['source']})")
```

---

## الاستضافة الذاتية

### نشر بنقرة واحدة

[![انشر مع Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/nirholas/free-crypto-news)
[![انشر مع Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/nirholas/free-crypto-news)

### التثبيت المحلي

```bash
# استنساخ المستودع
git clone https://github.com/nirholas/free-crypto-news.git
cd free-crypto-news

# تثبيت التبعيات
npm install

# تشغيل خادم التطوير
npm run dev

# افتح http://localhost:3000
```

### متغيرات البيئة

```env
# اختياري: لميزات AI (مجاني من groq.com)
GROQ_API_KEY=gsk_your_key_here

# اختياري: التحليلات
NEXT_PUBLIC_ANALYTICS_ID=your_id
```

---

## الوثائق

| الوثيقة | الوصف |
|---|---|
| [📚 مرجع API](docs/API.md) | وثائق نقاط النهاية الكاملة |
| [🏗️ الهندسة](docs/ARCHITECTURE.md) | تصميم النظام |
| [🚀 النشر](docs/DEPLOYMENT.md) | دليل الإنتاج |
| [🧪 الاختبار](docs/TESTING.md) | دليل الاختبار |
| [🔐 الأمان](docs/SECURITY.md) | سياسة الأمان |
| [📖 دليل المستخدم](docs/USER-GUIDE.md) | دليل PWA والميزات |
| [💻 دليل المطور](docs/DEVELOPER-GUIDE.md) | وثائق المساهمين |

---

## المساهمة

المساهمات مرحب بها! راجع [CONTRIBUTING.md](CONTRIBUTING.md) للإرشادات.

```bash
# Fork المستودع
# إنشاء فرع الميزة
git checkout -b feature/amazing-feature

# تنفيذ التغييرات
git commit -m 'Add amazing feature'

# الدفع وإنشاء Pull Request
git push origin feature/amazing-feature
```

---

## الترخيص

MIT License - راجع ملف [LICENSE](LICENSE).

---

## التواصل

- 🐛 **الأخطاء**: [GitHub Issues](https://github.com/nirholas/free-crypto-news/issues)
- 💬 **النقاشات**: [GitHub Discussions](https://github.com/nirholas/free-crypto-news/discussions)
- 🐦 **Twitter**: [@nirholas](https://twitter.com/nirholas)

---

<p align="center">
  صُنع بـ ❤️ لمجتمع العملات المشفرة
  <br>
  <a href="https://cryptocurrency.cv">cryptocurrency.cv</a>
</p>

</div>

