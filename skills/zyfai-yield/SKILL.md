---
name: zyfai-yield
description: Earn DeFi yield on MoonPay wallets via Zyfai. Use when the user wants passive yield, automated DeFi returns, or to put idle funds to work on Base, Arbitrum, or Plasma.
tags: [yield, defi, base, arbitrum, staking, usdc]
---

# Zyfai — Earn Yield on MoonPay Wallets

## Overview

Zyfai creates a non-custodial subaccount (Safe smart wallet) linked to a MoonPay wallet. Deposited funds are automatically optimized across DeFi protocols. The user stays in full control and can withdraw anytime.

Supported chains: **Base** (8453), **Arbitrum** (42161), **Plasma** (9745)

## Prerequisites

- MoonPay CLI: `npm i -g @moonpay/cli` — authenticated (`mp login`)
- Node.js 18+
- Zyfai SDK: `npm i -g @zyfai/sdk ethers`
- Zyfai API key (see Step 1 below)
- Helper scripts installed (see Installation)

## Installation

```bash
# Install helper scripts from the Zyfai skill directory
git clone https://github.com/ondefy/zyfai-sdk-demo.git ~/.zyfai-scripts
npm install --prefix ~/.zyfai-scripts
```

Or install from this skill's `scripts/` directory:

```bash
npm install --prefix ./skills/zyfai-yield/scripts @zyfai/sdk ethers
```

## Workflow

### Step 1 — Create a Zyfai API key

Export your MoonPay wallet address, then create an API key tied to it:

```bash
mp wallet retrieve --wallet <wallet-name>
# Note the wallet address from the output
```

```bash
curl -X POST https://sdk.zyf.ai/api/sdk-api-keys/create \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "moonpay-agent",
    "walletAddress": "<address-from-above>",
    "email": "agent@example.com"
  }'
# Response: { "data": { "apiKey": "zyfai_..." } }
```

Store the API key:

```bash
export ZYFAI_API_KEY="zyfai_..."
```

### Step 2 — Export MoonPay wallet private key

```bash
mp wallet export --wallet <wallet-name>
# Outputs mnemonic — derive private key with: node -e "const {HDNodeWallet}=require('ethers'); console.log(HDNodeWallet.fromPhrase('<mnemonic>').privateKey)"
```

Store for script use:

```bash
export WALLET_PRIVATE_KEY="0x..."
```

### Step 3 — Deploy subaccount and enable yield

```bash
# Deploy Safe subaccount + enable session key for automated optimization
# Strategies: conservative (stable, lower risk) | aggressive (higher yield, higher risk)
node ~/.zyfai-scripts/scripts/zyfai-deploy.js $WALLET_PRIVATE_KEY 8453 conservative
```

### Step 4 — Check wallet balance before depositing

```bash
mp token balance list --wallet <address> --chain base
```

### Step 5 — Deposit funds

```bash
# Deposit 100 USDC on Base
node ~/.zyfai-scripts/scripts/zyfai-deposit.js $WALLET_PRIVATE_KEY 8453 100 USDC

# Deposit 0.5 WETH on Base (must have WETH, not ETH)
node ~/.zyfai-scripts/scripts/zyfai-deposit.js $WALLET_PRIVATE_KEY 8453 0.5 WETH
```

### Step 6 — Withdraw (anytime)

```bash
# Withdraw all USDC
node ~/.zyfai-scripts/scripts/zyfai-withdraw.js $WALLET_PRIVATE_KEY 8453

# Partial withdrawal: 50 USDC
node ~/.zyfai-scripts/scripts/zyfai-withdraw.js $WALLET_PRIVATE_KEY 8453 50 USDC
```

## Supported Chains

| Chain    | Chain ID |
|----------|----------|
| Base     | 8453     |
| Arbitrum | 42161    |
| Plasma   | 9745     |

## Error Handling

| Error | Cause | Fix |
|-------|-------|-----|
| `Missing ZYFAI_API_KEY` | Env var not set | `export ZYFAI_API_KEY=...` |
| `Subaccount already deployed` | Deploy ran twice | Normal — skip to deposit |
| `Insufficient balance` | Not enough USDC/WETH | Fund via `moonpay-buy-crypto` |
| `mp wallet export` fails | Not authenticated | Run `mp login` first |

## Related Skills

- [moonpay-auth](../moonpay-auth/) — Set up and authenticate MoonPay wallets
- [moonpay-check-wallet](../moonpay-check-wallet/) — Check balances before depositing
- [moonpay-buy-crypto](../moonpay-buy-crypto/) — Fund wallet with fiat before earning yield
