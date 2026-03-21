---
name: maiat-token-safety
description: Check if an ERC-20 token is safe before swapping. Detects honeypots, high-tax tokens, and rug pulls. Use before any token swap.
tags: [security, defi, tokens]
---

# Maiat Token Safety Check

## Goal

Before swapping or buying any ERC-20 token, verify it's not a honeypot, high-tax scam, or rug pull.

## Prerequisites

- MoonPay CLI installed: `npm install -g @moonpay/cli`
- A funded wallet on Base (for x402 paid endpoints): `mp wallet create`

## Free API

```bash
curl "https://app.maiat.io/api/v1/token/<contract_address>"
```

## x402 Paid API ($0.01 USDC on Base)

Using MoonPay CLI:
```bash
mp x402 request \
  --method GET \
  --url "https://app.maiat.io/api/x402/token-check?address=<contract_address>" \
  --wallet <wallet-name> \
  --chain base
```

## Response

```json
{
  "address": "0x...",
  "verdict": "proceed",
  "trustScore": 85,
  "riskFlags": [],
  "riskSummary": "Token appears safe based on analysis."
}
```

## Verdict meanings

| Verdict | Meaning | Action |
|---------|---------|--------|
| `trusted` | Verified safe token (e.g. USDC, WETH) | Safe to swap |
| `proceed` | No major red flags detected | Safe to swap |
| `caution` | Some risk signals present | Proceed with small amounts |
| `avoid` | High risk — honeypot or scam likely | Do not swap |

## Risk flags

Common `riskFlags` values:

| Flag | Meaning |
|------|---------|
| `HONEYPOT_DETECTED` | Cannot sell after buying — **do not buy** |
| `HIGH_BUY_TAX` | Buy tax > 25% |
| `HIGH_SELL_TAX` | Sell tax > 25% |
| `NEAR_ZERO_LIQUIDITY` | Liquidity too low to trade safely |
| `UNVERIFIED` | Contract simulation failed |

## Deep forensics ($0.05)

For suspicious tokens, run Wadjet ML analysis:

```bash
mp x402 request \
  --method POST \
  --url "https://app.maiat.io/api/x402/token-forensics" \
  --body '{"projectName": "<token_name>"}' \
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
