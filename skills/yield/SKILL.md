---
name: yield
description: >
  Multi-chain yield optimization via YieldAgent (yield.xyz). Scans 2,600+
  yield sources across 75+ blockchains, finds the best rates, builds unsigned
  transactions, and signs them with a MoonPay wallet. Use when the user wants
  to earn yield, find the best APY, deposit into a lending/staking pool, or
  rebalance between yield positions.
tags: [yield, defi, lending, staking, multi-chain]
---

# YieldAgent — Multi-Chain Yield Optimization

## Overview

YieldAgent scans 2,600+ yield sources (lending, liquidity pools, staking) across 75+ blockchains and finds the best rates. It operates on a **build-then-sign model**: YieldAgent builds unsigned transactions, your MoonPay wallet signs and broadcasts them. You review every transaction before it hits the chain.

```
YieldAgent → scans 2,600+ yield sources → finds best rate
           → builds unsigned transaction
           → mp transaction send (you sign)
           → executes on-chain
```

**Supported chains:** Ethereum, Polygon, Arbitrum, Base, Solana, and 70+ more.

## Prerequisites

```bash
# 1. Install YieldAgent
npx clawhub@latest install yield-agent

# 2. Install MoonPay CLI
npm install -g @moonpay/cli
mp login

# 3. Confirm curl and jq are available
which curl jq
```

## Setup

```bash
# Create a dedicated yield wallet
mp wallet create --name "yield-agent"
mp wallet list  # note your addresses per chain

# Fund with deposit token + gas (see Funding section)
```

## Core Workflow

### 1. Find the Best Yield

```python
from yield_agent import YieldAgent

agent = YieldAgent(api_key="...")

# Search by token and chain
opportunities = agent.search(token="USDC", chain="polygon", limit=5)
best = opportunities[0]
print(f"Best: {best.protocol} — {best.apy}% APY on {best.chain}")
```

### 2. Build the Deposit Transaction

```python
tx = agent.build_deposit(
    opportunity_id=best.id,
    amount=500,
    wallet_address="<your-polygon-address>"
)
# → returns unsigned transaction dict
```

### 3. Sign and Execute with MoonPay

```bash
# Polygon
mp transaction send \
  --wallet "yield-agent" \
  --chain polygon \
  --transaction '<unsigned-tx-from-yield-agent>'

# Ethereum
mp transaction send \
  --wallet "yield-agent" \
  --chain ethereum \
  --transaction '<unsigned-tx-from-yield-agent>'

# Arbitrum
mp transaction send \
  --wallet "yield-agent" \
  --chain arbitrum \
  --transaction '<unsigned-tx-from-yield-agent>'
```

### Full Python Example

```python
from yield_agent import YieldAgent
import subprocess, json

agent = YieldAgent(api_key="...")

# Find best USDC yield on Polygon
best = agent.search(token="USDC", chain="polygon", limit=1)[0]
print(f"Best: {best.protocol} — {best.apy}% APY")

# Build deposit tx
tx = agent.build_deposit(
    opportunity_id=best.id,
    amount=500,
    wallet_address="<your-polygon-address>"
)

# Sign and broadcast
result = subprocess.run([
    "mp", "transaction", "send",
    "--wallet", "yield-agent",
    "--chain", "polygon",
    "--transaction", json.dumps(tx)
], capture_output=True, text=True)

print(result.stdout)
```

## Operations

| Action | Description |
|--------|-------------|
| Browse | `agent.search(token, chain, limit)` — find top rates |
| Deposit | `agent.build_deposit(...)` → sign with `mp transaction send` |
| Withdraw | `agent.build_withdrawal(...)` → sign with `mp transaction send` |
| Rebalance | Withdraw from one position, deposit into higher-yield one |
| Monitor | Track positions at https://docs.yield.xyz |

## Funding Your Wallet

Yield strategies require **deposit tokens** + **native gas token** per chain.

### Buy with Fiat

```bash
# Stablecoin deposits
mp buy --token usdc_ethereum --amount 1000 --wallet <eth-address> --email <email>
mp buy --token usdc_polygon --amount 1000 --wallet <polygon-address> --email <email>

# Gas tokens
mp buy --token eth_ethereum --amount 0.05 --wallet <eth-address> --email <email>
mp buy --token pol_polygon --amount 5 --wallet <polygon-address> --email <email>
```

### Bridge to Chase Rates

```bash
# USDC on Ethereum → USDC.e on Polygon
mp token bridge \
  --from-wallet yield-agent --from-chain ethereum \
  --from-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 500 \
  --to-chain polygon \
  --to-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174

# ETH → Arbitrum
mp token bridge \
  --from-wallet yield-agent --from-chain ethereum \
  --from-token 0x0000000000000000000000000000000000000000 \
  --from-amount 0.1 \
  --to-chain arbitrum \
  --to-token 0x0000000000000000000000000000000000000000
```

Bridge times: 5–20 seconds.

### Bank Transfer (Large Capital)

```bash
mp virtual-account create
mp virtual-account kyc submit
mp virtual-account bank-account add
mp virtual-account onramp create \
  --amount 10000 --currency usd \
  --chain ethereum --wallet <eth-address>
```

### Deposit Link (Permissionless)

Anyone can fund your wallet from any chain — auto-converts to your target token:

```bash
mp deposit create \
  --name "Yield Agent Fund" \
  --wallet <polygon-address> \
  --chain polygon --token USDC.e
```

### Check Balances

```bash
mp token balance list --wallet <eth-address> --chain ethereum
mp token balance list --wallet <polygon-address> --chain polygon
```

### Withdraw Yield to Bank

```bash
mp virtual-account offramp create \
  --amount 2000 --chain ethereum --wallet <eth-address>
```

## Security

- Keys are **AES-256-GCM encrypted locally** — never leave the machine
- YieldAgent only builds unsigned transactions — signing always happens in your wallet
- For large positions, use a hardware wallet:

```bash
mp wallet add-ledger --name "yield-ledger"
# All mp commands work transparently with Ledger — signing on the physical device
```

## Key Token Addresses

| Token | Chain | Address |
|-------|-------|---------|
| USDC | Ethereum | `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` |
| USDC.e | Polygon | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |
| ETH (gas) | Ethereum | native |
| POL (gas) | Polygon | native |

## End-to-End Workflow

1. `npx clawhub@latest install yield-agent`
2. `mp wallet create --name "yield-agent"`
3. `mp buy --token usdc_ethereum --amount 1000 --wallet <address> --email <email>`
4. `mp buy --token eth_ethereum --amount 0.05 --wallet <address> --email <email>`
5. Browse opportunities — filter by token, chain, APY
6. YieldAgent returns unsigned deposit transaction
7. `mp transaction send --wallet "yield-agent" --chain ethereum --transaction <tx>`
8. Monitor positions at https://docs.yield.xyz
9. `mp virtual-account offramp create` to withdraw earned yield

## Resources

- **API docs:** https://docs.yield.xyz
- **Agent page:** https://agent.yield.xyz
- **Install:** `npx clawhub@latest install yield-agent`
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli

## Related Skills

- **moonpay-check-wallet** — Verify balances before depositing
- **moonpay-swap-tokens** — Swap tokens to what a yield pool requires
- **moonpay-virtual-account** — Bank transfer for large capital inflows
- **moonpay-trading-automation** — Automate rebalancing on a schedule
