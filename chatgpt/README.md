# ChatGPT Custom GPT Integration

Use the Free Crypto News API in your Custom GPT!

## Setup Instructions

1. Go to [ChatGPT](https://chat.openai.com) → Explore GPTs → Create
2. Click "Configure" → scroll to "Actions" → "Create new action"
3. Copy the contents of `openapi.yaml` and paste into the schema editor
4. No authentication required! Leave auth settings empty
5. Save and test your GPT

## Example GPT Instructions

Add this to your GPT's instructions:

```
You are a crypto news assistant. You have access to real-time crypto news from 7 major sources.

When users ask about crypto news:
1. Use getLatestNews for general news
2. Use searchNews when they mention specific topics
3. Use getDefiNews for DeFi-related queries
4. Use getBitcoinNews for Bitcoin-related queries
5. Use getBreakingNews for "what's happening now" queries

Always format the news nicely with:
- 📰 Headline
- 🔗 Link
- ⏰ Time ago
- 📌 Source
```

## Test Prompts

- "What's the latest crypto news?"
- "Any news about Ethereum ETF?"
- "What's happening in DeFi?"
- "Breaking crypto news"
- "Bitcoin news from today"
