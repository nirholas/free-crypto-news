# 🌍 Automated i18n Translation System (Groq - FREE)

This project uses **Groq's free API** for automated translations instead of paid services. Groq provides fast, high-quality translations using Llama 3.3 70B at no cost.

---

## 🚀 Quick Start

### 1. Get Your FREE API Key

Visit [console.groq.com/keys](https://console.groq.com/keys) and create a free account.

### 2. Set Environment Variable

```bash
export GROQ_API_KEY=gsk_your_key_here
```

### 3. Run Translation

```bash
# Translate to all 17 languages
npm run i18n:translate

# Translate specific locale
GROQ_API_KEY=your-key npx tsx scripts/i18n/translate.ts --locale es

# Force re-translate everything
GROQ_API_KEY=your-key npx tsx scripts/i18n/translate.ts --force
```

## Scripts

### translate.ts

Translates `messages/en.json` to all supported languages using Groq (FREE).

```bash
# Translate all
npm run i18n:translate

# Translate specific language
npx tsx scripts/i18n/translate.ts --locale ja

# Force re-translate all
npx tsx scripts/i18n/translate.ts --force
```

**Environment Variables:**
```bash
GROQ_API_KEY=gsk_your_key_here  # Get FREE at console.groq.com/keys
```

### validate.ts

Validates translated files for completeness and placeholder integrity.

```bash
# Validate all translations
npm run i18n:validate

# Validate specific language
npx tsx scripts/i18n/validate.ts --locale zh-CN
```

**Checks:**
- Missing keys
- Invalid placeholders
- Empty values
- Extra (orphaned) keys

### watch.ts

Auto-translate when en.json changes (development mode).

```bash
npm run i18n:watch
```

---

## Supported Languages (17 + English)

| Code | Language | Speakers |
|------|----------|----------|
| `en` | English | Source |
| `es` | Spanish | 560M |
| `fr` | French | 280M |
| `de` | German | 135M |
| `pt` | Portuguese | 260M |
| `ja` | Japanese | 125M |
| `zh-CN` | Chinese (Simplified) | 920M |
| `zh-TW` | Chinese (Traditional) | 85M |
| `ko` | Korean | 80M |
| `ar` | Arabic | 420M |
| `ru` | Russian | 255M |
| `it` | Italian | 68M |
| `nl` | Dutch | 25M |
| `pl` | Polish | 45M |
| `tr` | Turkish | 80M |
| `vi` | Vietnamese | 85M |
| `th` | Thai | 60M |
| `id` | Indonesian | 200M |

---

## File Structure

```
messages/
├── en.json          # Source (English) - EDIT THIS
├── es.json          # Spanish (auto-generated)
├── fr.json          # French (auto-generated)
└── ...              # All other locales (auto-generated)
```

---

## API Endpoint

For dynamic/on-demand translation:

```bash
# Single text
curl -X POST /api/i18n/translate \
  -H "Content-Type: application/json" \
  -d '{"text": "Hello", "targetLocale": "es"}'

# Batch
curl -X POST /api/i18n/translate \
  -d '{"texts": {"hi": "Hello", "bye": "Goodbye"}, "targetLocale": "ja"}'
```

---

## Why Groq (FREE) vs OpenAI?

| Feature | Groq | OpenAI |
|---------|------|--------|
| Cost | **$0** | ~$0.02/1K tokens |
| Model | Llama 3.3 70B | GPT-4 |
| Speed | ~500 tok/sec | ~50 tok/sec |
| Quality | Excellent | Excellent |

**350 strings × 17 languages = 5,950 translations**
- OpenAI: ~$5-15 per run
- Groq: **FREE**

---

## Adding New Languages

1. Add to `scripts/i18n/translate.ts`:
   ```typescript
   const CONFIG = {
     outputLocales: [
       // ...existing
       'new-code',
     ],
   };
   ```

2. Add name mapping:
   ```typescript
   const LOCALE_NAMES = {
     // ...existing
     'new-code': 'Language Name',
   };
   ```

3. Run translation:
   ```bash
   npm run i18n:translate
   ```
   ```bash
   node scripts/i18n/translate.js --lang new-code
   ```

3. Validate output:
   ```bash
   node scripts/i18n/validate.js --lang new-code
   ```

4. Add to README language selector

---

## Translation Quality

- Machine translation via Google Cloud
- Code blocks and technical terms preserved
- Manual review recommended for accuracy
- Contributions welcome via PR
