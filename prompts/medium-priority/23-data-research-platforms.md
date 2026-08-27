# Prompt 23 — Upload to Data & Research Platforms

> Paste this entire file into a new Claude Opus 4.6 chat session with terminal access to the codebase.

## Context

You are preparing and uploading the **free-crypto-news** historical archive dataset to data science and research platforms. This is a major unique asset — 662,000+ crypto news articles spanning 2017–2025.

### Dataset Details
- **Total Articles:** 662,047
- **Date Range:** September 2017 — February 2025
- **Languages:** English + Chinese
- **Sources:** 200+ unique outlets
- **Format:** JSONL (JSON Lines), organized by year/month
- **Location in repo:** `/archive/`
- **Top Tickers by Coverage:** BTC (81k), ETH (50k), USDT (19k), SOL (16k), XRP (13k)
- **Search Terms Indexed:** 79,512
- **Data Sources in Archive:**
  - CryptoPanic — 346,031 articles from 200+ English sources
  - Odaily 星球日报 — 316,016 Chinese crypto news articles

### Article Schema (typical JSONL record)
```json
{
  "title": "Bitcoin Surges Past $50K After ETF Approval",
  "url": "https://example.com/article",
  "source": "CoinDesk",
  "published_at": "2024-01-11T14:30:00Z",
  "currencies": ["BTC"],
  "tags": ["bitcoin", "etf", "sec"],
  "kind": "news",
  "domain": "coindesk.com",
  "votes": {"positive": 42, "negative": 3}
}
```

### Project Details
- **Name:** Free Crypto News
- **GitHub:** https://github.com/nirholas/free-crypto-news
- **Website:** https://cryptocurrency.cv
- **License:** MIT
- **CITATION.cff:** Already exists in repo root
- **Author:** nirholas

### IMPORTANT RULES
- Use `bun` to run scripts, `pnpm` for packages
- Always use background terminals, kill after completion
- Git as `nirholas` / `22895867+nirholas@users.noreply.github.com`

---

## Task

Prepare the dataset for upload to each platform with proper metadata, documentation, and README files. Where CLI tools are available, use them. Where manual upload is required, prepare all content.

---

## 1. Kaggle 🔴 P0

**URL:** https://www.kaggle.com/datasets

Steps:
1. Read the `/archive/` directory structure to understand the data layout
2. Create a `dataset-metadata.json` for Kaggle:
```json
{
  "title": "Crypto News Archive — 662K+ Articles (2017–2025)",
  "subtitle": "The largest free cryptocurrency news dataset with 200+ sources",
  "description": "662,047 crypto news articles spanning September 2017 to February 2025, aggregated from 200+ sources including CoinDesk, The Block, Bloomberg, and Odaily. Perfect for NLP, sentiment analysis, market prediction, and crypto research.\n\nSources:\n- CryptoPanic: 346,031 articles from 200+ English sources\n- Odaily 星球日报: 316,016 Chinese crypto news articles\n\nTop tickers: BTC (81k), ETH (50k), USDT (19k), SOL (16k), XRP (13k)\n\nFormat: JSONL (JSON Lines), organized by year/month\n\nPart of the Free Crypto News API project: https://github.com/nirholas/free-crypto-news",
  "id": "nirholas/crypto-news-archive",
  "licenses": [{"name": "MIT"}],
  "keywords": [
    "cryptocurrency", "bitcoin", "ethereum", "news", "nlp",
    "sentiment-analysis", "market-data", "defi", "blockchain",
    "text-classification", "time-series", "financial-news"
  ],
  "resources": []
}
```

3. Create a Kaggle dataset README (displayed on the dataset page):

```markdown
# 📰 Crypto News Archive — 662K+ Articles (2017–2025)

The largest freely available cryptocurrency news dataset, containing 662,047 articles from 200+ sources.

## Dataset Description

| Metric | Value |
|--------|-------|
| Total Articles | 662,047 |
| Date Range | September 2017 — February 2025 |
| Languages | English + Chinese |
| Unique Sources | 200+ |
| Format | JSONL (JSON Lines) |

### Data Sources
- **CryptoPanic** — 346,031 articles from 200+ English sources
- **Odaily 星球日报** — 316,016 Chinese crypto news articles

### Top Tickers by Coverage
| Ticker | Articles |
|--------|----------|
| BTC | 81,000+ |
| ETH | 50,000+ |
| USDT | 19,000+ |
| SOL | 16,000+ |
| XRP | 13,000+ |

## Schema

Each JSONL record contains:
- `title` — Article headline
- `url` — Original article URL
- `source` — News source name
- `published_at` — ISO 8601 timestamp
- `currencies` — Referenced cryptocurrency tickers
- `tags` — Topic tags
- `kind` — Content type (news, analysis, etc.)
- `domain` — Source domain
- `votes` — Community votes (positive/negative)

## Use Cases

- **NLP & Text Classification** — Train crypto news classifiers
- **Sentiment Analysis** — Build crypto sentiment models
- **Market Prediction** — Correlate news events with price movements
- **Topic Modeling** — Track crypto narrative evolution
- **Named Entity Recognition** — Extract crypto entities
- **Time Series Analysis** — News volume and market correlation
- **Language Models** — Fine-tune LLMs on crypto domain

## Live API

This dataset is part of the [Free Crypto News API](https://cryptocurrency.cv) — a free, no-auth API that continues to aggregate news in real-time.

```bash
curl https://cryptocurrency.cv/api/news
```

## Citation

If you use this dataset in research, please cite:
```bibtex
@misc{freecryptonews2025,
  title={Free Crypto News Archive},
  author={nirholas},
  year={2025},
  url={https://github.com/nirholas/free-crypto-news}
}
```

## License

MIT License — free for any use.
```

4. Use Kaggle CLI if available: `kaggle datasets create -p /path/to/dataset`
5. If CLI not available, prepare the ZIP and note manual upload steps

---

## 2. Hugging Face Datasets 🔴 P0

**URL:** https://huggingface.co/datasets

Steps:
1. Create a Hugging Face dataset card (README.md for HF):

```markdown
---
license: mit
task_categories:
  - text-classification
  - text-generation
  - summarization
  - text2text-generation
language:
  - en
  - zh
tags:
  - cryptocurrency
  - bitcoin
  - ethereum
  - news
  - financial-news
  - sentiment-analysis
  - nlp
  - market-data
pretty_name: Crypto News Archive (662K+ Articles, 2017-2025)
size_categories:
  - 100K<n<1M
source_datasets:
  - original
---

# Crypto News Archive — 662K+ Articles (2017–2025)

The largest freely available cryptocurrency news dataset.

## Dataset Description

- **Homepage:** https://cryptocurrency.cv
- **Repository:** https://github.com/nirholas/free-crypto-news
- **Point of Contact:** nirholas

### Dataset Summary

662,047 cryptocurrency news articles from 200+ sources, spanning September 2017 to February 2025. Includes English and Chinese articles with ticker annotations, tags, and community votes.

### Languages

English, Chinese (Simplified)

### Data Fields

| Field | Type | Description |
|-------|------|-------------|
| title | string | Article headline |
| url | string | Original article URL |
| source | string | News source name |
| published_at | string | ISO 8601 timestamp |
| currencies | list[string] | Referenced tickers |
| tags | list[string] | Topic tags |
| kind | string | Content type |
| domain | string | Source domain |
| votes | object | Community votes |

### Data Splits

| Split | Articles |
|-------|----------|
| Full | 662,047 |

### Source Data

- CryptoPanic: 346,031 English articles
- Odaily: 316,016 Chinese articles

### Usage

```python
from datasets import load_dataset

dataset = load_dataset("nirholas/crypto-news-archive")
```

### Citation

```bibtex
@misc{freecryptonews2025,
  title={Free Crypto News Archive},
  author={nirholas},
  year={2025},
  url={https://github.com/nirholas/free-crypto-news}
}
```

### License

MIT
```

2. Use HF CLI if available:
```bash
pip install huggingface_hub
huggingface-cli login
huggingface-cli upload nirholas/crypto-news-archive ./archive --repo-type dataset
```

3. Or prepare files for manual upload via web UI

---

## 3. Google Dataset Search 🟠 P1

Add structured data (JSON-LD) to the website for Google Dataset Search discovery.

Create or update the archive page to include:
```html
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Dataset",
  "name": "Crypto News Archive — 662K+ Articles (2017–2025)",
  "description": "662,047 cryptocurrency news articles from 200+ sources spanning September 2017 to February 2025. The largest free crypto news dataset available.",
  "url": "https://cryptocurrency.cv/archive",
  "license": "https://opensource.org/licenses/MIT",
  "creator": {
    "@type": "Person",
    "name": "nirholas",
    "url": "https://github.com/nirholas"
  },
  "datePublished": "2025-02-01",
  "dateModified": "2025-03-01",
  "keywords": ["cryptocurrency", "bitcoin", "ethereum", "news", "NLP", "sentiment analysis"],
  "measurementTechnique": "RSS/API aggregation from 200+ sources",
  "variableMeasured": "News article coverage",
  "temporalCoverage": "2017-09/2025-02",
  "spatialCoverage": "Global",
  "distribution": [
    {
      "@type": "DataDownload",
      "encodingFormat": "application/jsonl",
      "contentUrl": "https://github.com/nirholas/free-crypto-news/tree/main/archive"
    }
  ],
  "isAccessibleForFree": true
}
</script>
```

Add this to the archive page layout or head component.

---

## 4. Zenodo 🟡 P2

**URL:** https://zenodo.org

Steps:
1. The project already has `CITATION.cff` — Zenodo can auto-import from GitHub
2. Connect the GitHub repo to Zenodo:
   - Go to https://zenodo.org/account/settings/github/
   - Enable the `nirholas/free-crypto-news` repository
   - Create a GitHub release to trigger automatic archiving
3. Zenodo metadata:
   - **Title:** Free Crypto News Archive — 662K+ Articles (2017–2025)
   - **Creators:** nirholas
   - **Description:** The largest free cryptocurrency news dataset
   - **License:** MIT
   - **Keywords:** cryptocurrency, news, NLP, sentiment analysis, bitcoin
   - **Resource type:** Dataset
   - **Access right:** Open Access

---

## 5. data.world 🟡 P2

**URL:** https://data.world

Submission content:
- **Dataset name:** crypto-news-archive
- **Title:** Crypto News Archive — 662K+ Articles (2017–2025)
- **Description:** 662,047 cryptocurrency news articles from 200+ sources
- **Tags:** cryptocurrency, bitcoin, ethereum, news, nlp, sentiment-analysis
- **License:** MIT
- **Visibility:** Public

---

## 6. Papers with Code 🟡 P2

**URL:** https://paperswithcode.com

If no paper exists yet, create a "dataset" entry:
- **Dataset name:** Crypto News Archive
- **Description:** 662K+ crypto news articles spanning 2017–2025
- **Tasks:** Text Classification, Sentiment Analysis, Named Entity Recognition
- **Languages:** English, Chinese
- **Link:** GitHub archive URL

---

## 7. AWS Open Data Registry 🟢 P3

**URL:** https://registry.opendata.aws

Would require hosting the dataset on S3. Prepare the metadata but flag as future task unless an S3 bucket is available.

---

## 8. Academic Torrents 🟢 P3

**URL:** https://academictorrents.com

Prepare a torrent of the dataset. This is mainly useful if the dataset download from GitHub is slow.

---

## Workflow

1. Explore `/archive/` directory to understand the data layout
2. Prepare dataset packages with READMEs for each platform
3. Add JSON-LD structured data to the archive page
4. Use CLI tools (kaggle, huggingface-cli) where available
5. Commit all new files
6. Report manual upload steps

```bash
git config user.name "nirholas"
git config user.email "22895867+nirholas@users.noreply.github.com"
git add -A
HUSKY=0 git commit -m "Add dataset metadata for Kaggle, Hugging Face, Google Dataset Search, Zenodo"
git push
```

---

## Completion Checklist

- [ ] Kaggle — dataset-metadata.json + README created, upload command ready
- [ ] Hugging Face — dataset card created, upload command ready
- [ ] Google Dataset Search — JSON-LD structured data added to archive page
- [ ] Zenodo — GitHub integration steps documented
- [ ] data.world — submission content prepared
- [ ] Papers with Code — dataset entry prepared
- [ ] AWS Open Data — metadata prepared (future)
- [ ] Academic Torrents — assessed feasibility
- [ ] All files committed and pushed
