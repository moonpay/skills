---
name: yield-optimization
description: >
  Multi-chain yield optimization via yield.xyz. Find the best APY across 2,600+
  yield sources on 75+ blockchains, build deposit/withdrawal transactions, and
  sign them with a MoonPay wallet. Use when the user wants to earn yield, find
  the best lending or staking rate, or move capital to a higher-yield position.
tags: [yield, defi, lending, staking, multi-chain]
---

# yield.xyz — Multi-Chain Yield Optimization

## Overview

yield.xyz scans 2,600+ yield sources (lending pools, liquidity positions, staking) across 75+ blockchains and finds the best rates. It operates on a **build-then-sign model**: yield.xyz returns unsigned transactions, your MoonPay wallet signs and broadcasts them.

```
yield.xyz REST API → scans 2,600+ yield sources → finds best rate
                   → returns unsigned transaction
                   → mp transaction send (you sign)
                   → executes on-chain
```

**Supported chains:** Ethereum, Polygon, Arbitrum, Base, Solana, and 70+ more.

## Prerequisites

```bash
# MoonPay CLI for wallet + signing
npm install -g @moonpay/cli
mp login

# curl and jq for API calls
which curl jq

# Your yield.xyz API key (https://agent.yield.xyz)
export YIELD_API_KEY="..."
```

## Setup

```bash
# Create a dedicated yield wallet
mp wallet create --name "yield-agent"
mp wallet retrieve --wallet "yield-agent"   # note your addresses per chain
```

## Core Workflow

### 1. Find the Best Yield

```bash
# Search opportunities by token and chain
curl -s "https://api.yield.xyz/v1/opportunities?token=USDC&chain=polygon&limit=5" \
  -H "Authorization: Bearer $YIELD_API_KEY" | jq '.[] | {protocol, apy, chain}'
```

### 2. Build a Deposit Transaction

```bash
curl -s -X POST "https://api.yield.xyz/v1/deposit" \
  -H "Authorization: Bearer $YIELD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"opportunityId": "<id>", "amount": "500", "walletAddress": "<your-polygon-address>"}' \
  | jq '.transaction' > /tmp/yield-tx.json
```

### 3. Sign and Execute with MoonPay

```bash
mp transaction send \
  --wallet "yield-agent" \
  --chain polygon \
  --transaction "$(cat /tmp/yield-tx.json)"
```

### Withdraw

```bash
# Build withdrawal transaction
curl -s -X POST "https://api.yield.xyz/v1/withdraw" \
  -H "Authorization: Bearer $YIELD_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"positionId": "<id>", "walletAddress": "<your-address>"}' \
  | jq '.transaction' > /tmp/yield-withdraw.json

mp transaction send \
  --wallet "yield-agent" --chain polygon \
  --transaction "$(cat /tmp/yield-withdraw.json)"
```

## Funding Your Wallet

Yield strategies require **deposit tokens** + **native gas** per chain.

### Buy with Fiat

```bash
# Stablecoins for deposits
mp buy --token usdc_ethereum --amount 1000 --wallet <eth-address> --email <email>
mp buy --token usdc_polygon --amount 1000 --wallet <polygon-address> --email <email>

# Gas tokens
mp buy --token eth_ethereum --amount 0.05 --wallet <eth-address> --email <email>
mp buy --token pol_polygon --amount 5 --wallet <polygon-address> --email <email>
```

### Bridge Cross-Chain

```bash
# USDC on Ethereum → Polygon (follow the higher yield)
mp token bridge \
  --from-wallet yield-agent --from-chain ethereum \
  --from-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 500 \
  --to-chain polygon \
  --to-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

### Bank Transfer (Large Capital)

```bash
mp virtual-account create
mp virtual-account kyc submit
mp virtual-account bank-account add
mp virtual-account onramp create \
  --amount 10000 --currency usd --chain ethereum --wallet <eth-address>
```

### Check Balances / Withdraw Yield

```bash
mp token balance list --wallet <eth-address> --chain ethereum
mp virtual-account offramp create --amount 2000 --chain ethereum --wallet <eth-address>
```

## Security

Keys are **AES-256-GCM encrypted locally** — never leave the machine. yield.xyz only builds unsigned transactions — signing always happens in your MoonPay wallet.

For large positions, use a hardware wallet:

```bash
mp wallet add-ledger --name "yield-ledger"
```

## Key Token Addresses

| Token | Chain | Address |
|-------|-------|---------|
| USDC | Ethereum | `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` |
| USDC.e | Polygon | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |

## End-to-End Workflow

1. `mp wallet create --name "yield-agent"`
2. `mp buy --token usdc_ethereum --amount 1000 --wallet <address> --email <email>`
3. Find best rate: `curl https://api.yield.xyz/v1/opportunities?token=USDC&chain=polygon`
4. Build deposit tx: `curl -X POST https://api.yield.xyz/v1/deposit ...`
5. `mp transaction send --wallet "yield-agent" --chain polygon --transaction <tx>`
6. Monitor at https://docs.yield.xyz
7. `mp virtual-account offramp create` to withdraw earned yield

## Resources

- **API docs:** https://docs.yield.xyz
- **Agent page:** https://agent.yield.xyz
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli

## Related Skills

- **moonpay-check-wallet** — Verify balances before depositing
- **moonpay-swap-tokens** — Swap tokens to what a yield pool requires
- **moonpay-virtual-account** — Bank transfer for large capital inflows
- **moonpay-trading-automation** — Automate rebalancing on a schedule
