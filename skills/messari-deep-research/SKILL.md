---
name: messari-deep-research
description: Async deep-research report workflow using Messari AI. Starts a long-form research job, polls until complete, and returns a comprehensive report on any crypto topic, asset, or protocol. Cost varies; typically $0.50–$2.00 USDC.
tags: [messari, research, ai, deep-research, x402, workflow]
---

# Messari Deep Research Workflow

## Goal

Generate a comprehensive, long-form research report on any crypto topic, asset, sector, or question. Uses Messari's async AI deep-research engine which crawls their knowledge graph, on-chain data, and news to produce institutional-quality reports.

**Cost per run: ~$0.50–$2.00 USDC on Base (async, takes 5–15 minutes)**

## Trigger phrases

- "Write a deep research report on [topic]"
- "Give me a full analysis of [asset/protocol]"
- "Research the [DeFi/L2/RWA/etc.] sector"
- "Deep dive on [topic]"
- "Generate a research report"

---

## Step 0 — Preflight: check balance

```bash
mp token balance list --wallet main --chain base --json
```

Ensure at least **$3.00 USDC** on Base.

---

## Step 1 — Start deep research job

```bash
mp x402 request \
  --method POST \
  --url "https://api.messari.io/ai/v1/deep-research" \
  --body '{
    "query": "<your research question or topic>"
  }' \
  --wallet main \
  --chain base
```

**Example queries:**
- `"What is the investment thesis for Ethereum restaking protocols in 2025?"`
- `"Analyze the competitive landscape of L2 rollups"`
- `"What are the key risks in the RWA tokenization sector?"`
- `"Deep dive on Solana's DeFi ecosystem"`

**Response:** Returns a job `id` (e.g. `dr_abc123`) and status `pending`.

```json
{
  "id": "dr_abc123",
  "status": "pending",
  "created_at": "2025-..."
}
```

---

## Step 2 — Poll for completion (free, repeat until done)

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/ai/v1/deep-research/<JOB_ID>" \
  --wallet main \
  --chain base
```

**Status values:**
- `pending` — job queued, try again in 60s
- `processing` — actively generating, try again in 60s
- `completed` — report ready, extract `result`
- `failed` — job failed, check `error` field

Polling is free (no payment required). Poll every 30–60 seconds.

---

## Step 3 — Retrieve completed report

Once status is `completed`, the response contains the full report:

```json
{
  "id": "dr_abc123",
  "status": "completed",
  "result": {
    "title": "...",
    "summary": "...",
    "sections": [...],
    "sources": [...]
  }
}
```

---

## Full workflow script (with auto-polling)

```bash
#!/bin/bash
# messari-deep-research.sh "<research query>"
# Usage: ./messari-deep-research.sh "Analyze the Solana DeFi ecosystem"

QUERY="${1:-What are the top crypto narratives for 2025?}"
WALLET="main"
CHAIN="base"
BASE="https://api.messari.io"
OUT="$HOME/.config/moonpay/research/deep-$(date -u +%Y%m%d-%H%M%S)"
mkdir -p "$(dirname "$OUT")"

echo "Starting deep research: \"$QUERY\""
echo ""

# Step 1: Start job
RESPONSE=$(mp x402 request --method POST \
  --url "${BASE}/ai/v1/deep-research" \
  --body "{\"query\": \"${QUERY}\"}" \
  --wallet "$WALLET" --chain "$CHAIN")
echo "$RESPONSE" > "${OUT}-job.json"

JOB_ID=$(echo "$RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin)['id'])" 2>/dev/null)

if [ -z "$JOB_ID" ]; then
  echo "ERROR: Could not extract job ID. Response:"
  echo "$RESPONSE"
  exit 1
fi

echo "Job started: $JOB_ID"
echo "Polling for completion (this takes 5–15 minutes)..."

# Step 2: Poll loop
while true; do
  sleep 30
  STATUS_RESPONSE=$(mp x402 request --method GET \
    --url "${BASE}/ai/v1/deep-research/${JOB_ID}" \
    --wallet "$WALLET" --chain "$CHAIN")

  STATUS=$(echo "$STATUS_RESPONSE" | python3 -c "import sys,json; print(json.load(sys.stdin).get('status','unknown'))" 2>/dev/null)
  echo "  Status: $STATUS ($(date +%H:%M:%S))"

  if [ "$STATUS" = "completed" ]; then
    echo "$STATUS_RESPONSE" > "${OUT}-report.json"
    echo ""
    echo "Report complete! Saved to ${OUT}-report.json"
    break
  elif [ "$STATUS" = "failed" ]; then
    echo "ERROR: Research job failed."
    echo "$STATUS_RESPONSE"
    exit 1
  fi
done
```

---

## Cancel a running job

```bash
mp x402 request \
  --method POST \
  --url "https://api.messari.io/ai/v1/deep-research/<JOB_ID>/cancel" \
  --wallet main \
  --chain base
```

---

## List past research jobs

```bash
mp x402 request \
  --method GET \
  --url "https://api.messari.io/ai/v1/deep-research" \
  --wallet main \
  --chain base
```

---

## Output format

Present the completed report as:

```
## Deep Research: [Report Title]
**Job ID:** dr_abc123
**Generated:** [timestamp]
**Cost:** ~$X.XX USDC

### Executive Summary
[2-3 paragraph summary]

### [Section 1 Title]
[content]

### [Section 2 Title]
[content]

...

### Sources
- [source 1]
- [source 2]
```

---

## Good research queries

**Asset deep dives:**
- `"Investment thesis for [TOKEN]: fundamentals, competition, risks, and outlook"`
- `"On-chain health of [TOKEN]: activity, retention, revenue"`

**Sector analysis:**
- `"Competitive landscape of Ethereum L2 rollups in 2025"`
- `"State of RWA tokenization: market size, key players, regulatory risks"`
- `"DeFi lending protocols: risk comparison across Aave, Compound, and Morpho"`

**Narrative research:**
- `"What is the AI x crypto narrative and which projects are best positioned?"`
- `"Is the memecoin supercycle over? Evidence and counterarguments"`

**Macro:**
- `"How does the current macro environment affect crypto market structure?"`

---

## Notes

- Deep research is async — start the job, then come back; do not busy-wait
- Report quality is significantly higher than single-shot AI chat
- If polling for >20 minutes with `processing` status, the job may be stuck — cancel and retry
- Payments in USDC on Base (`--chain base`)
- Free polling: Step 2 GET requests do not trigger payment

## Related skills

- **messari-x402** — Core endpoint reference and quick AI chat (`/ai/v2/chat/completions`)
- **messari-token-research** — Faster, cheaper token research using multiple data endpoints
- **messari-alpha-scout** — Surface topics worth deep-researching
- **messari-funding-intel** — Complement with funding data
