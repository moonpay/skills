---
name: maiat-trust-check
description: Check if an agent or token is trustworthy before transacting. Returns trust score and verdict from 18,600+ indexed agents on Base. Use before any swap, transfer, or agent interaction.
tags: [security, trust, agents, defi]
---

# Maiat Trust Check

## Goal

Before interacting with any agent or token, check its trust score via Maiat. Returns a verdict (proceed/caution/avoid) based on behavioral analysis, completion rates, and on-chain history.

## Free API (no payment required)

```bash
curl https://app.maiat.io/api/v1/trust?address=<address>
```

## x402 Paid API ($0.02 USDC on Base — no rate limit)

Using MoonPay CLI:
```bash
mp x402 request \
  --method GET \
  --url "https://app.maiat.io/api/x402/trust?address=<address>" \
  --wallet <wallet-name> \
  --chain base
```

## Response

```json
{
  "trustScore": 85,
  "verdict": "proceed",
  "summary": "Reliable ACP agent — 42 jobs, 95% completion",
  "completionRate": 0.95,
  "totalJobs": 42
}
```

## Decision logic

| Score | Verdict | Action |
|-------|---------|--------|
| 80-100 | `proceed` | Safe to interact |
| 60-79 | `caution` | Proceed with lower amounts |
| 0-59 | `avoid` | Do not interact |

## Example workflow

1. User says: "Swap 100 USDC for TOKEN_X"
2. Check trust: `curl https://app.maiat.io/api/v1/trust?address=<TOKEN_X_ADDRESS>`
3. If `avoid` → warn user, do not proceed
4. If `proceed` → execute the swap

## Related skills

- **maiat-token-safety** — Honeypot and rug pull detection
- **moonpay-swap-tokens** — Execute the swap after trust check passes
- **moonpay-x402** — Pay for premium Maiat endpoints
