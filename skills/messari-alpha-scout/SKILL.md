---
name: messari-alpha-scout
description: Alpha scouting workflow using Messari x402. Scans mindshare gainers, trending topics, and news to surface emerging narratives and high-momentum assets. Total cost ~$1.25 USDC per run.
tags: [messari, alpha, signals, trending, x402, workflow]
---

# Messari Alpha Scout Workflow

## Goal

Surface emerging narratives and high-momentum assets by combining mindshare gainers, trending topics, news flow, and AI synthesis. Designed as a daily morning brief or on-demand alpha scan.

**Total cost per run: ~$1.25 USDC on Base**

## Trigger phrases

- "Find me alpha"
- "What's trending in crypto?"
- "What narratives are heating up?"
- "Morning brief"
- "What should I be watching today?"

---

## Step 0 — Preflight: check balance

```bash
mp token balance list --wallet main --chain base --json
```

Ensure at least **$2.00 USDC** on Base.

---

## Step 1 — Mindshare gainers 24h (~$0.35)

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/signal/v1/assets/mindshare-gainers-24h" \
  --wallet main \
  --chain base
```

Extract: top 5–10 assets with largest mindshare increases in the past 24h. Note the slugs for Step 4.

---

## Step 2 — Mindshare gainers 7d (~$0.35)

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/signal/v1/assets/mindshare-gainers-7d" \
  --wallet main \
  --chain base
```

Extract: assets with sustained mindshare growth over a week — these indicate forming narratives, not just noise.

---

## Step 3 — Trending topics today (~$0.25)

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/v1/current" \
  --wallet main \
  --chain base
```

Extract: today's top narratives and topic clusters. Cross-reference with Steps 1–2 to confirm narrative alignment.

---

## Step 4 — News flow (~$0.55)

Pull recent news filtered to the top assets identified in Step 1:

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/news/v1/news/feed?limit=20" \
  --wallet main \
  --chain base
```

Extract: headlines from the past 24h, note which assets appear repeatedly, identify catalysts (partnerships, upgrades, regulatory news).

---

## Step 5 — AI narrative synthesis (~$0.25)

```bash
mp x402 request \
  --method POST \
  --url "https://api.messari.io/ai/v2/chat/completions" \
  --body '{
    "model": "messari",
    "messages": [
      {
        "role": "system",
        "content": "You are a crypto alpha analyst. Given mindshare gainers, trending topics, and news, identify: 1) The top 3 emerging narratives, 2) Assets best positioned to benefit from each narrative, 3) Conviction level (high/medium/low) and why, 4) Key risks to watch."
      },
      {
        "role": "user",
        "content": "24h mindshare gainers: {step1_output}. 7d gainers: {step2_output}. Trending topics: {step3_output}. News: {step4_headlines}"
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
# messari-alpha-scout.sh
# Runs a full alpha scan and saves results

WALLET="main"
CHAIN="base"
BASE="https://api.messari.io"
OUT="$HOME/.config/moonpay/research/alpha-$(date -u +%Y%m%d-%H%M%S)"
mkdir -p "$(dirname "$OUT")"

echo "=== [1/4] Mindshare Gainers 24h ==="
G24=$(mp x402 request --method GET \
  --url "${BASE}/signal/v1/assets/mindshare-gainers-24h" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$G24" > "${OUT}-gainers-24h.json"

echo "=== [2/4] Mindshare Gainers 7d ==="
G7D=$(mp x402 request --method GET \
  --url "${BASE}/signal/v1/assets/mindshare-gainers-7d" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$G7D" > "${OUT}-gainers-7d.json"

echo "=== [3/4] Trending Topics ==="
TOPICS=$(mp x402 request --method GET \
  --url "${BASE}/v1/current" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$TOPICS" > "${OUT}-topics.json"

echo "=== [4/4] News Feed ==="
NEWS=$(mp x402 request --method GET \
  --url "${BASE}/news/v1/news/feed?limit=20" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$NEWS" > "${OUT}-news.json"

echo ""
echo "Alpha scan saved to ${OUT}-*.json"
echo "Total cost: ~\$1.20 USDC"
echo ""
echo "Pass results to Messari AI for narrative synthesis (Step 5)"
```

---

## Schedule as a daily morning brief

Schedule with cron (runs every day at 7:00 AM):

```bash
# Add to crontab
(crontab -l 2>/dev/null; echo '0 7 * * * ~/.config/moonpay/scripts/messari-alpha-scout.sh # messari:alpha') | crontab -
```

---

## Output format

Present to the user as:

```
## Alpha Brief — [Date]
**Cost:** ~$1.20 USDC | **Chain:** Base

### Emerging Narratives

**1. [Narrative Name]** — Conviction: HIGH/MEDIUM/LOW
Assets: [token1], [token2]
Signal: [why this narrative is heating up]
Risk: [key risk]

**2. [Narrative Name]** — Conviction: HIGH/MEDIUM/LOW
...

### Assets to Watch
| Asset | 24h Mindshare Δ | 7d Mindshare Δ | Catalyst |
|-------|----------------|----------------|---------|
| BTC   | +12%           | +8%            | ETF inflows |
| ...   |                |                |         |

### Key News
- [headline 1]
- [headline 2]
- [headline 3]
```

---

## Next steps after alpha scan

Once you identify high-conviction assets:

```bash
# Deep dive on a specific token
# → use messari-token-research skill

# Act on the research
mp token swap \
  --wallet main \
  --chain base \
  --from-token usdc \
  --from-amount <AMOUNT> \
  --to-token <TOKEN>
```

---

## Notes

- Overlap between 24h and 7d gainers = stronger signal (not just noise)
- Topics in Step 3 that match assets in Steps 1–2 = high-conviction narrative plays
- Run daily before market open for best effect
- Payments in USDC on Base (`--chain base`)

## Related skills

- **messari-x402** — Core endpoint reference
- **messari-token-research** — Deep dive on any asset surfaced by the scan
- **messari-deep-research** — Full async report on a narrative or asset
- **moonpay-swap-tokens** — Execute trades after research
- **moonpay-budget-agent** — Cap daily research spend
- **moonpay-trading-automation** — Automate the daily brief via cron/launchd
