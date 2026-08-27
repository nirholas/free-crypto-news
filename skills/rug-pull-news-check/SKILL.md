---
name: rug-pull-news-check
description: Use news coverage, community signals, and on-chain reporting to assess whether a crypto project shows signs of being a scam, rug pull, or exit scam. Supplements contract-level analysis with news intelligence. Use when the user asks if a project is legitimate or wants a credibility check before investing.
license: MIT
metadata:
  category: security
  difficulty: beginner
  author: free-crypto-news
  tags: [security, rug-pull, scam, due-diligence, safety, verification]
---

# Rug Pull News Check

## When to use this skill

Use when the user asks about:
- Is [project/token] a scam?
- Can I trust this project?
- I found this new token — is it safe?
- Has this project been audited?
- Has this team done anything sketchy before?
- Are there any red flags I should know about?

## Data Sources

All endpoints free, no authentication required.

| Endpoint | Purpose |
|----------|---------|
| `GET https://cryptocurrency.cv/api/search?q={project name}` | All news mentioning the project |
| `GET https://cryptocurrency.cv/api/news?coin={SYMBOL}` | Coin-specific news coverage |
| `GET https://cryptocurrency.cv/api/archive?q={project}&limit=30` | Historical coverage and patterns |
| `GET https://cryptocurrency.cv/api/breaking` | Any active breaking news about exploits or scams |

## Detection Framework

### 1. News Coverage Age and Volume

Fetch `/api/search?q={project name}`:

**Healthy signals:**
- Multiple articles from independent sources spanning weeks or months
- Coverage in recognized outlets (CoinDesk, Decrypt, The Block, CoinTelegraph)
- News covers product updates, partnerships, and technology — not just price
- Critical pieces exist alongside positive ones (healthy ecosystem of coverage)

**Warning signals:**
- Less than 5 articles total — project is either very new or ignored by media
- All coverage from the same 1-2 sources (coordinated PR)
- News dates cluster right around launch with nothing before or after
- Every article is positive with no critical analysis anywhere

**Red flags:**
- No news coverage at all for a project claiming to have thousands of users
- Coverage only from low-credibility aggregator sites
- Project name returns results for a completely different project (impersonation)

### 2. Content Quality Analysis

Read the actual articles for these patterns:

**Credibility indicators:**
- Named team members with verifiable professional history
- Audit reports cited from recognized firms (Certik, Trail of Bits, OpenZeppelin, Consensys)
- Specific technical details about the protocol (not vague marketing language)
- Honest discussion of risks, limitations, or competition
- Roadmap items that have been delivered and covered in follow-up news

**Scam language patterns to flag:**
- "Risk-free returns" or "guaranteed yield" phrases
- "Backed by [famous name]" without verifiable confirmation
- Urgency language: "Limited time", "Only X spots left", "Act now"
- Whitepaper that is copy-pasted or vague with no technical substance
- "The [genuine project] of [chain]" positioning (riding another project's reputation)

### 3. Exploit and Hack History

Check breaking news and search for prior incidents:
- Search `{project name} hack`, `{project name} exploit`, `{project name} rug`
- Any prior security incidents significantly raise ongoing risk even if the team "fixed it"
- Check whether post-exploit coverage included a credible post-mortem and user compensation
- Multiple incidents = pattern, not bad luck

Look for these specific news event types:
- Sudden liquidity removal (rug pull confirmed)
- Team wallet draining to exchanges and then going silent
- Social channels (Twitter, Discord) deleted or going quiet
- Contract ownership transferred to 0x0 or a new unknown address
- "Everything is fine" posts right before a collapse

### 4. Team Credibility Scan

From news coverage, assess the team:

| Signal | Healthy | Suspicious |
|--------|---------|------------|
| Team identities | Named, verifiable LinkedIn/GitHub | Fully anonymous with no history |
| Prior projects | Successful exits or credible track record | Previous failed/abandoned tokens |
| Communication | Regular, transparent, acknowledges issues | Radio silence or only hype |
| Audit response | Fixes flagged issues, publishes reports | Disputes auditors, hides findings |
| Advisor names | Cross-verifiable real people | Fake names or permission-less name drops |

### 5. Community Sentiment Cross-Check

From news coverage and referenced social activity:
- Is community discussion substantive (technical questions, governance) or just price talk?
- Are community members asking hard questions and getting real answers?
- Has the project's Discord/Telegram had a ban wave of critics recently?
- Are most public comments generic shilling with no substance?

**High risk pattern**: Discord with 50,000 members but zero technical or product discussions — suggests coordinated bot farming.

### 6. Quick Verdict Checklist

Run through this checklist based on news evidence:

- [ ] Project has been covered by at least 2 independent credible outlets
- [ ] Team identities are verifiable from news coverage
- [ ] Audit report cited in news from a recognized firm
- [ ] No exploit, hack, or rug pull history found in any search
- [ ] Coverage spans at least 60+ days (not a new launch with manufactured hype)
- [ ] Price discussion is secondary to product and technology in coverage
- [ ] No regulatory action, SEC, or fraud-related news found
- [ ] Post-launch news shows product development, not just token price milestones
- [ ] Different sources have varying opinions (no single PR narrative dominates)
- [ ] Community discussion references real product use, not speculation only

Score: Count of passing items
- 8–10: Appears credible (still do contract-level DYOR)
- 5–7: Moderate concern — research further before any allocation
- 3–4: High risk — significant red flags present
- 0–2: Extreme risk — strong evidence of scam or poor legitimacy

### 7. Output Format

---

**Credibility Check: [Project Name] ([SYMBOL])**

**News Coverage Volume**: [number] articles found | Oldest: [date] | Sources: [list]

**Coverage Quality**: [Strong / Moderate / Weak / Suspicious]

**Red Flags Found**:
- [Flag 1] — [severity: critical/high/medium]
- [Flag 2] — [severity]
*(None found if clean)*

**Team Credibility**: [Verifiable / Partially verifiable / Anonymous / Suspicious]

**Security History**: [No incidents / [N] incidents — details]

**Checklist Score**: [X/10]

**Verdict**: [Appears credible / Proceed with caution / Multiple red flags — avoid / Strong scam indicators]

**Recommendation**: [Specific suggested action — include maximum allocation advice if borderline]

**Disclaimer**: News-based credibility checks reduce but do not eliminate risk. Always verify smart contract code independently, check liquidity locks, and never invest more than you can afford to lose in unproven projects.

---

## Notes for Agent Use

- This skill uses news-layer signals only — combine with contract-level analysis for full due diligence
- For maximum coverage, search both the project name AND the token symbol separately
- The archive endpoint is especially useful for finding old red flags that current news buries
- When in doubt, a simple rule: if you can't find the team, don't invest
