---
name: messari-token-research
description: Full token research workflow using Messari x402 API. Fetches asset fundamentals, price history, sentiment signals, and news, then synthesizes a research brief via Messari AI. Total cost ~$1.00–$1.50 USDC per run.
tags: [messari, research, tokens, signals, x402, workflow]
---

# Messari Token Research Workflow

## Goal

Given a token slug (e.g. `bitcoin`, `ethereum`, `solana`), run a 5-step research workflow that pulls fundamentals, price action, signals, news, and finishes with an AI-synthesized brief.

**Total cost per run: ~$1.00–$1.50 USDC on Base**

## Trigger phrases

- "Research [token]"
- "Give me a brief on [token]"
- "What's the outlook on [token]?"
- "Deep dive on [token]"

---

## Step 0 — Preflight: check balance

```bash
mp token balance list --wallet main --chain base --json
```

Ensure at least **$2.00 USDC** on Base before starting. If low:

```bash
# Bridge USDC from Ethereum to Base
mp token bridge \
  --wallet main \
  --from-chain ethereum \
  --to-chain base \
  --token usdc \
  --amount 10
```

---

## Step 1 — Asset fundamentals (~$0.05)

Replace `{slug}` with the token identifier (e.g. `bitcoin`, `solana`):

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/v2/assets/details?assets={slug}" \
  --wallet main \
  --chain base
```

Extract: name, symbol, market cap, circulating supply, max supply, category, description, ATH, current price.

---

## Step 2 — Price timeseries (~$0.18)

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/v1/assets/timeseries/{slug}?granularity=daily&start_date=$(date -d "30 days ago" +%Y-%m-%d 2>/dev/null || date -v-30d +%Y-%m-%d)&end_date=$(date +%Y-%m-%d)" \
  --wallet main \
  --chain base
```

Extract: 30-day price trend, volatility pattern, notable pumps/dumps.

---

## Step 3 — Sentiment signals (~$0.35)

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/signal/v1/assets?assetSlug={slug}" \
  --wallet main \
  --chain base
```

Extract: mindshare score, sentiment direction, social volume trend.

---

## Step 4 — Recent news (~$0.55)

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/news/v1/news/feed?assets={slug}&limit=10" \
  --wallet main \
  --chain base
```

Extract: top 5 headlines, publication dates, sentiment of coverage.

---

## Step 5 — AI research synthesis (~$0.25)

Feed all data from Steps 1–4 into Messari AI for a structured brief:

```bash
mp x402 request \
  --method POST \
  --url "https://api.messari.io/ai/v2/chat/completions" \
  --body '{
    "model": "messari",
    "messages": [
      {
        "role": "system",
        "content": "You are a crypto research analyst. Given asset data, price action, signals, and news, produce a structured research brief with: 1) Summary, 2) Key metrics, 3) Bullish/bearish factors, 4) Risk factors, 5) Outlook."
      },
      {
        "role": "user",
        "content": "Research brief for {slug}. Fundamentals: {step1_output}. Price trend (30d): {step2_summary}. Signals: {step3_output}. News: {step4_headlines}"
      }
    ]
  }' \
  --wallet main \
  --chain base
```

---

## Full workflow script

```bash
#!/bin/bash
# messari-research.sh <slug>
# Usage: ./messari-research.sh bitcoin

SLUG="${1:-bitcoin}"
WALLET="main"
CHAIN="base"
BASE="https://api.messari.io"
OUT="$HOME/.config/moonpay/research/messari-${SLUG}-$(date -u +%Y%m%d-%H%M%S)"
mkdir -p "$(dirname "$OUT")"

echo "=== [1/4] Asset Fundamentals ==="
FUNDAMENTALS=$(mp x402 request --method GET \
  --url "${BASE}/v2/assets/details?assets=${SLUG}" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$FUNDAMENTALS" > "${OUT}-fundamentals.json"

echo "=== [2/4] Price Timeseries (30d) ==="
TIMESERIES=$(mp x402 request --method GET \
  --url "${BASE}/v1/assets/timeseries/${SLUG}?granularity=daily" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$TIMESERIES" > "${OUT}-timeseries.json"

echo "=== [3/4] Signals ==="
SIGNALS=$(mp x402 request --method GET \
  --url "${BASE}/signal/v1/assets?assetSlug=${SLUG}" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$SIGNALS" > "${OUT}-signals.json"

echo "=== [4/4] News ==="
NEWS=$(mp x402 request --method GET \
  --url "${BASE}/news/v1/news/feed?assets=${SLUG}&limit=10" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$NEWS" > "${OUT}-news.json"

echo ""
echo "Research data saved to ${OUT}-*.json"
echo "Total cost: ~\$1.13 USDC"
echo ""
echo "Next: pass this data to Messari AI for synthesis (Step 5)"
```

---

## Output format

Present the final brief to the user as:

```
## [TOKEN] Research Brief
**Date:** [today]
**Cost:** ~$1.13 USDC

### Summary
[2-3 sentence overview]

### Key Metrics
- Price: $X (ATH: $Y, -Z% from ATH)
- Market Cap: $X (rank #N)
- 30d Performance: +/-X%
- Mindshare Score: X (trend: ↑/↓)

### Bullish Factors
- [factor 1]
- [factor 2]

### Bearish / Risk Factors
- [factor 1]
- [factor 2]

### Outlook
[1-2 sentence assessment]
```

---

## Notes

- Slug format: lowercase, hyphenated — `bitcoin`, `ethereum`, `solana`, `chainlink`
- For very new tokens, Steps 2–3 may return empty — skip gracefully
- AI synthesis (Step 5) can use all saved JSON files if running interactively
- Payments are in USDC on Base — ensure ETH on Base for gas

## Related skills

- **messari-x402** — Core endpoint reference
- **messari-alpha-scout** — Find trending tokens before researching them
- **messari-deep-research** — Deeper async report (10–15 min, more comprehensive)
- **moonpay-swap-tokens** — Act on research by swapping tokens
- **moonpay-check-wallet** — Verify USDC balance before running
