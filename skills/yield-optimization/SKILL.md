---
name: yield-optimization
description: >
  Multi-chain yield optimization via yield.xyz (StakeKit). Discover 2,988+
  yield opportunities across 75+ blockchains, build deposit/withdrawal
  transactions with shell scripts, and sign them with a MoonPay wallet. Use
  when the user wants to earn yield, find the best lending or staking rate,
  enter/exit a position, or check portfolio balances.
tags: [yield, defi, lending, staking, multi-chain]
---

# yield.xyz — Multi-Chain Yield Optimization

## Overview

yield.xyz (powered by StakeKit) aggregates 2,988+ yield opportunities across 75+ blockchains — lending, staking, vaults, restaking, and liquidity pools. The agent skill uses shell scripts to discover yields, build unsigned transactions, and sign them with your MoonPay wallet.

```
find-yields.sh    → discover opportunities by chain + token
enter-position.sh → build unsigned deposit transaction
mp transaction send → sign and broadcast with MoonPay wallet
check-portfolio.sh → monitor balances and pending rewards
exit-position.sh  → build unsigned withdrawal transaction
```

## Prerequisites

```bash
# curl and jq (required)
which curl jq

# MoonPay CLI for wallet + signing
npm install -g @moonpay/cli
mp login

export YIELDS_API_KEY="..."   # optional: get one at https://dashboard.yield.xyz
```

## Installation

```bash
npx clawhub@latest install yield-agent
```

Or manually:

```bash
git clone https://github.com/stakekit/yield-agent.git ~/.openclaw/skills/yield-agent
chmod +x ~/.openclaw/skills/yield-agent/scripts/*.sh
```

## Commands

| Script | Description |
|--------|-------------|
| `find-yields.sh [chain] [token]` | Discover yields by network and token |
| `get-yield-info.sh [yield-id]` | Retrieve yield schema and validator info |
| `list-validators.sh [yield-id]` | List validators for staking positions |
| `enter-position.sh [yield-id] [address] [params]` | Build unsigned deposit transaction |
| `exit-position.sh [yield-id] [address]` | Build unsigned withdrawal transaction |
| `manage-position.sh [yield-id] [action]` | Claim rewards, restake, redelegate |
| `check-portfolio.sh [yield-id] [address]` | View balances and pending actions |

## Core Workflow

### 1. Discover Yields

```bash
# Find USDC yields on Base
./scripts/find-yields.sh base USDC

# Find ETH staking on Ethereum
./scripts/find-yields.sh ethereum ETH
```

### 2. Inspect a Yield

```bash
# Get schema and requirements before entering
./scripts/get-yield-info.sh base-usdc-aave-v3-lending
```

Always fetch the yield schema before executing — it specifies required params and multi-step order.

### 3. Enter a Position

```bash
# Build unsigned deposit transaction (amounts are human-readable — "100" = 100 USDC)
./scripts/enter-position.sh base-usdc-aave-v3-lending 0xYOUR_ADDRESS '{"amount":"100"}'
# → returns unsignedTransaction JSON
```

### 4. Sign with MoonPay

```bash
# Step 1: Sign the unsigned transaction
mp transaction sign \
  --wallet "yield-agent" \
  --chain base \
  --transaction '<unsignedTransaction from step 3>'
# → returns signedTransaction JSON

# Step 2: Broadcast the signed transaction
mp transaction send \
  --chain base \
  --transaction '<signedTransaction from step 1>'
```

For multi-step transactions, execute in `stepIndex` order. Sign each step exactly as returned — never modify `unsignedTransaction`.

### 5. Monitor Portfolio

```bash
./scripts/check-portfolio.sh base-usdc-aave-v3-lending 0xYOUR_ADDRESS
```

### 6. Exit a Position

```bash
./scripts/exit-position.sh base-usdc-aave-v3-lending 0xYOUR_ADDRESS
# → sign result with mp transaction send
```

### 7. Manage Rewards

```bash
./scripts/manage-position.sh base-usdc-aave-v3-lending claim
./scripts/manage-position.sh ethereum-eth-lido-staking redelegate
```

## Wallet Setup with MoonPay

```bash
# Create a dedicated yield wallet
mp wallet create --name "yield-agent"
mp wallet retrieve --wallet "yield-agent"  # note addresses per chain
```

## Funding Your Wallet

### Buy with Fiat

```bash
mp buy --token usdc_base --amount 500 --wallet <base-address> --email <email>
mp buy --token usdc_ethereum --amount 1000 --wallet <eth-address> --email <email>
mp buy --token eth_ethereum --amount 0.05 --wallet <eth-address> --email <email>
```

### Bridge Cross-Chain

```bash
# USDC on Ethereum → Base (chase higher yield)
mp token bridge \
  --from-wallet yield-agent --from-chain ethereum \
  --from-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 500 \
  --to-chain base \
  --to-token 0x833589fcd6edb6e08f4c7c32d4f71b54bda02913
```

### Bank Transfer (Large Capital)

```bash
mp virtual-account create && mp virtual-account kyc submit
mp virtual-account bank-account add
mp virtual-account onramp create \
  --name "yield-onramp" --fiat usd --stablecoin usdc --chain ethereum --wallet <eth-address>
```

### Check Balances / Withdraw

```bash
mp token balance list --wallet <eth-address> --chain ethereum
mp virtual-account offramp create --amount 2000 --chain ethereum --wallet <eth-address>
```

## Security

yield.xyz only builds unsigned transactions — your MoonPay wallet handles all signing. Keys are AES-256-GCM encrypted locally and never leave the machine. For large positions use a hardware wallet:

```bash
mp wallet hardware add --name "yield-ledger"
```

## End-to-End Workflow

1. `npx clawhub@latest install yield-agent`
2. `mp wallet create --name "yield-agent"`
3. `mp buy --token usdc_base --amount 500 --wallet <address> --email <email>`
4. `./scripts/find-yields.sh base USDC`
5. `./scripts/get-yield-info.sh <yield-id>`
6. `./scripts/enter-position.sh <yield-id> <address> '{"amount":"500"}'`
7. `mp transaction sign --wallet "yield-agent" --chain base --transaction <unsignedTx>` then `mp transaction send --chain base --transaction <signedTx>`
8. `./scripts/check-portfolio.sh <yield-id> <address>`
9. `mp virtual-account offramp create` to withdraw earned yield

## Resources

- **GitHub:** https://github.com/stakekit/yield-agent
- **API dashboard:** https://dashboard.yield.xyz
- **Docs:** https://docs.yield.xyz
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli

## Related Skills

- **moonpay-check-wallet** — Verify balances before depositing
- **moonpay-swap-tokens** — Swap tokens to what a yield pool requires
- **moonpay-virtual-account** — Bank transfer for large capital inflows
- **moonpay-trading-automation** — Automate rebalancing on a schedule
