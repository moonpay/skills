---
name: maiat-trust-check
description: Check if an agent or token is trustworthy before transacting. Returns trust score and verdict from 29,000+ indexed agents on Base. Use before any swap, transfer, or agent interaction.
tags: [security, trust, agents, defi]
---

# Maiat Trust Check

## Goal

Before interacting with any agent or token, check its trust score via Maiat. Returns a verdict (proceed/caution/avoid) based on behavioral analysis, completion rates, and on-chain history.

## Prerequisites

- MoonPay CLI installed: `npm install -g @moonpay/cli`
- A funded wallet on Base (for x402 paid endpoints): `mp wallet create`

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
  "address": "0x...",
  "type": "agent",
  "trustScore": 85,
  "verdict": "proceed",
  "summary": "Reliable ACP agent — 42 jobs, 95% completion",
  "learnMore": "GET /api/v1/agent/0x..."
}
```

`type` is `"agent"`, `"token"`, or `"unknown"`.

For full behavioral breakdown (completion rate, job history, etc.), use the paid `/api/x402/reputation` endpoint.

## Decision logic

| Score | Verdict | Action |
|-------|---------|--------|
| 80-100 | `trusted` / `proceed` | Safe to interact |
| 60-79 | `caution` | Proceed with lower amounts |
| 0-59 | `avoid` | Do not interact |
| — | `unknown` | No data — treat as unverified |

## Example workflow

1. User says: "Swap 100 USDC for TOKEN_X"
2. Check trust: `curl https://app.maiat.io/api/v1/trust?address=<TOKEN_X_ADDRESS>`
3. If `avoid` or `unknown` → warn user, do not proceed
4. If `proceed` or `trusted` → execute the swap

## Related skills

- **maiat-token-safety** — Honeypot and rug pull detection
- **moonpay-swap-tokens** — Execute the swap after trust check passes
- **moonpay-x402** — Pay for premium Maiat endpoints
