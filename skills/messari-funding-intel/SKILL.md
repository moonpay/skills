---
name: messari-funding-intel
description: Funding intelligence workflow using Messari x402. Scans recent rounds, M&A activity, venture funds, and organizations, then synthesizes a VC landscape brief via Messari AI. Total cost ~$0.75–$1.25 USDC per run.
tags: [messari, funding, vc, fundraising, x402, workflow]
---

# Messari Funding Intelligence Workflow

## Goal

Map the current VC landscape in crypto — who's raising, who's investing, and what M&A deals are happening. Useful for identifying early-stage narratives, understanding capital flows, and spotting tokens with institutional backing.

**Total cost per run: ~$0.75–$1.25 USDC on Base**

## Trigger phrases

- "What's getting funded in crypto?"
- "Who raised money recently?"
- "Any M&A news in crypto?"
- "Show me the VC landscape"
- "What are VCs investing in?"
- "Funding intel"

---

## Step 0 — Preflight: check balance

```bash
mp token balance list --wallet main --chain base --json
```

Ensure at least **$1.50 USDC** on Base.

---

## Step 1 — Recent funding rounds (~$0.35)

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/funding/v1/rounds?limit=20" \
  --wallet main \
  --chain base
```

Extract: company/project name, amount raised, lead investors, date, sector/category, stage (Seed, Series A, etc.).

---

## Step 2 — M&A deals (~$0.35)

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/funding/v1/mergers-and-acquisitions?limit=20" \
  --wallet main \
  --chain base
```

Extract: acquirer, target, deal value, date, strategic rationale.

---

## Step 3 — Active VC funds (~$0.15)

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/funding/v1/funds?limit=30" \
  --wallet main \
  --chain base
```

Extract: fund names, AUM, focus areas, recent activity.

---

## Step 4 — Investor lookup (optional, ~$0.35)

For specific investors identified in Steps 1–2:

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/funding/v1/rounds/investors?limit=20" \
  --wallet main \
  --chain base
```

Extract: most active investors, portfolio composition, deal frequency.

---

## Step 5 — AI funding landscape synthesis (~$0.25)

```bash
mp x402 request \
  --method POST \
  --url "https://api.messari.io/ai/v2/chat/completions" \
  --body '{
    "model": "messari",
    "messages": [
      {
        "role": "system",
        "content": "You are a crypto VC analyst. Given recent funding rounds, M&A activity, and fund data, produce a funding intelligence brief with: 1) Most funded sectors/narratives, 2) Most active investors, 3) M&A themes and what they signal, 4) Early-stage projects worth watching, 5) What this capital flow means for token markets."
      },
      {
        "role": "user",
        "content": "Recent rounds: {step1_output}. M&A deals: {step2_output}. Active funds: {step3_output}. Investors: {step4_output}"
      }
    ]
  }' \
  --wallet main \
  --chain base
```

---

## Targeted project research

If you want to look up a specific organization or project:

```bash
# Search organizations
mp x402 request \
  --method GET \
  --url "https://api.messari.io/funding/v1/organizations?name=<org-name>" \
  --wallet main \
  --chain base

# Search projects
mp x402 request \
  --method GET \
  --url "https://api.messari.io/funding/v1/projects?name=<project-name>" \
  --wallet main \
  --chain base
```

---

## Full workflow script

```bash
#!/bin/bash
# messari-funding-intel.sh

WALLET="main"
CHAIN="base"
BASE="https://api.messari.io"
OUT="$HOME/.config/moonpay/research/funding-$(date -u +%Y%m%d-%H%M%S)"
mkdir -p "$(dirname "$OUT")"

echo "=== [1/3] Recent Funding Rounds ==="
ROUNDS=$(mp x402 request --method GET \
  --url "${BASE}/funding/v1/rounds?limit=20" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$ROUNDS" > "${OUT}-rounds.json"

echo "=== [2/3] M&A Activity ==="
MA=$(mp x402 request --method GET \
  --url "${BASE}/funding/v1/mergers-and-acquisitions?limit=20" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$MA" > "${OUT}-ma.json"

echo "=== [3/3] Active VC Funds ==="
FUNDS=$(mp x402 request --method GET \
  --url "${BASE}/funding/v1/funds?limit=30" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$FUNDS" > "${OUT}-funds.json"

echo ""
echo "Funding intel saved to ${OUT}-*.json"
echo "Total cost: ~\$0.85 USDC"
```

---

## Output format

```
## Funding Intelligence Brief — [Date]
**Cost:** ~$0.85 USDC | **Chain:** Base

### Recently Funded Sectors
1. **[Sector]** — $X raised across N deals
2. **[Sector]** — ...

### Notable Rounds
| Project | Amount | Stage | Lead Investor | Date |
|---------|--------|-------|---------------|------|
| [name]  | $XM    | Series A | [VC] | [date] |

### M&A Activity
| Acquirer | Target | Value | Signal |
|----------|--------|-------|--------|
| [co]     | [co]   | $XM   | [what this means] |

### Most Active Investors
- [VC 1]: N deals in [sectors]
- [VC 2]: ...

### What This Means for Token Markets
[AI-synthesized insight: which narratives are getting capital, what sectors to watch]
```

---

## Notes

- Funded projects often precede narrative moves in public token markets by 3–12 months
- M&A can signal consolidation (bearish for targets) or validation (bullish for sector)
- Cross-reference with **messari-alpha-scout** — if funded sectors match mindshare gainers, that's a high-conviction signal
- Payments in USDC on Base (`--chain base`)

## Related skills

- **messari-x402** — Core endpoint reference
- **messari-alpha-scout** — Surface narratives that align with funding activity
- **messari-token-research** — Deep dive on specific tokens from funded projects
- **messari-deep-research** — Full async report on a funded sector or project
