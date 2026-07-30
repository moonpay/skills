---
name: pulsenetwork-paid-data
description: >-
  Use when an agent needs live external data a base model cannot know and no free tool covers it:
  crypto market structure (perp funding rates, whale positions, stablecoin peg status, token rug
  checks, ETF flows, DeFi vault APYs, cross-exchange spreads) plus finance, macro, travel, sports,
  climate, and health verticals. 800+ x402 data endpoints across 74 API verticals, paid
  per call with USDC on Base or Solana via the MoonPay CLI. No API key, no signup — discovery is
  free, typical calls cost $0.005-$0.15.
tags: [x402, micropayments, market-data, crypto, funding-rates, stablecoins, token-safety, multi-chain]
---

# PulseNetwork Paid Data

## Overview

PulseNetwork is a fleet of 74 API verticals (one origin each) selling pay-per-call structured data over the x402
protocol — payment is the authentication. Every endpoint returns structured JSON with
attribution and terms links; the crypto market-structure endpoints sampled below are
deterministic (computed from chain and exchange state, no LLM in the path). Catalog discovery
is always free. Calls start at $0.005 and most cost $0.005–$0.15; a handful of
document-generation endpoints run up to $12 — the 402 quote is always authoritative.

## Prerequisites

- MoonPay CLI installed (`npm i -g @moonpay/cli`)
- Authenticated (`mp login` → `mp verify`)
- A local wallet holding USDC on **Base** or **Solana** (see [moonpay-auth](../moonpay-auth/)
  and [moonpay-check-wallet](../moonpay-check-wallet/))
- No PulseNetwork account, key, or signup of any kind

## Discovery (free — always search before paying)

```bash
# Human/agent-readable index of every vertical and endpoint
curl -s https://pulse.theaslangroupllc.com/llms.txt

# Machine catalog (agent.json)
curl -s https://pulse.theaslangroupllc.com/.well-known/agent.json

# Per-origin metadata: full x402 resource list and OpenAPI schema
curl -s https://onchainpulse.theaslangroupllc.com/.well-known/x402
curl -s https://onchainpulse.theaslangroupllc.com/openapi.json
```

A bare GET on any paid endpoint returns HTTP 402 with the exact price and accepted networks in
the `accepts` array — that response is a free quote, not an error.

## Paying for a call

All endpoints are plain GET with query parameters (x402 v2, `exact` scheme, plain-EOA payer —
no EIP-7702 required). The MoonPay CLI handles the 402 flow automatically:

```bash
mp x402 request \
  --method GET \
  --url "https://cryptopulse.theaslangroupllc.com/api/funding-check?coin=BTC" \
  --wallet main \
  --chain base
```

`--chain solana` works too — Base and Solana USDC are accepted on nearly every endpoint
(many also accept Polygon, Arbitrum, HyperEVM, and more). The `accepts` array in each
endpoint's 402 quote is authoritative.

## Sample endpoints (verified live)

| Endpoint | Cost | What it answers |
|----------|------|-----------------|
| `cryptopulse…com/api/funding-check?coin=BTC` | $0.02 | Perp funding for one coin, cross-venue normalized to 24h |
| `cryptopulse…com/api/whale-positions?address=0x…` | $0.03 | Any Hyperliquid wallet's full perp book: side, size, entry, leverage, liquidation |
| `stablecoinpulse…com/api/depeg-tick` | $0.01 | Every major stablecoin peg in one call, STABLE/WATCH/ALERT verdicts |
| `onchainpulse…com/api/evmtoken?address=0x…&chain=base` | $0.015 | Token rug/honeypot/concentration scan (8 EVM chains) |
| `onchainpulse…com/api/memecoin?address=…` | $0.015 | Same scan for Solana tokens |
| `onchainpulse…com/api/vault-apy` | $0.02 | DeFi vault APYs computed from Base chain state (Aave, Compound, Moonwell, Euler) |
| `onchainpulse…com/api/etf-flows` | $0.15 | Crypto ETF flow data |
| `arbipulse…com/api/spread-tick?pair=BTC/USDT` | $0.02 | Live cross-exchange spread for one pair |

(`…com` = `.theaslangroupllc.com`.) These are 8 of 800+ — non-crypto verticals (flight-delay
rights, sports, climate, clinical trials, sanctions, energy prices) are in the catalog above.

## Workflow

1. Search the free catalog (`llms.txt` or a per-origin `/openapi.json`) for the cheapest
   endpoint that answers the question.
2. For user-initiated requests, quote the price before paying.
3. Pay with `mp x402 request` as above.
4. Pass the `attribution` array from the response through when republishing the data.

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `402` on bare GET | Not an error — it is the price quote | Pay via `mp x402 request` |
| `400 invalid_*` | Malformed query parameter | Fix the parameter and re-run; the error body includes an example of a valid request |
| Paid response contains an explicit error field | Upstream data failure after settlement | Surface it to the user; do not silently retry payments |
| `429` | Rate limited | Wait and retry |

## Related Skills

- [moonpay-auth](../moonpay-auth/) — create or import the local wallet
- [moonpay-check-wallet](../moonpay-check-wallet/) — check USDC balance before paid calls
- [moonpay-x402](../moonpay-x402/) — the underlying x402 payment command
