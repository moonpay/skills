---
name: maiat-token-safety
description: Check if an ERC-20 token is safe before swapping. Detects honeypots, high-tax tokens, and rug pulls. Use before any token swap.
tags: [security, defi, tokens]
---

# Maiat Token Safety Check

## Goal

Before swapping or buying any ERC-20 token, verify it's not a honeypot, high-tax scam, or rug pull.

## Free API

```bash
curl "https://app.maiat.io/api/v1/token-check?token=<contract_address>"
```

## x402 Paid API ($0.01 USDC on Base)

Using MoonPay CLI:
```bash
mp x402 request \
  --method GET \
  --url "https://app.maiat.io/api/x402/token-check?token=<contract_address>" \
  --wallet <wallet-name> \
  --chain base
```

## Response

```json
{
  "safe": true,
  "verdict": "proceed",
  "honeypot": false,
  "highTax": false,
  "verified": true
}
```

## Risk flags

| Flag | Meaning |
|------|---------|
| `honeypot: true` | Cannot sell after buying — **do not buy** |
| `highTax: true` | Buy/sell tax > 10% — likely scam |
| `verified: false` | Contract not verified on explorer |

## Deep forensics ($0.05)

For suspicious tokens, run Wadjet ML analysis:

```bash
mp x402 request \
  --method POST \
  --url "https://app.maiat.io/api/x402/token-forensics" \
  --body '{"token": "<contract_address>"}' \
  --wallet <wallet-name> \
  --chain base
```

## When to use

- Before swapping into any unknown token
- Before adding liquidity to a new pool
- When a user asks to buy a meme coin
- $0.01 is cheaper than losing funds to a rug pull

## Related skills

- **maiat-trust-check** — Agent trust score verification
- **moonpay-swap-tokens** — Execute swaps after safety check
- **moonpay-discover-tokens** — Find tokens, then verify with Maiat
