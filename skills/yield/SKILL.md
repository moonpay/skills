---
name: yield
description: Use this skill when the user wants to find and enter yield opportunities across DeFi protocols, or when they need to deposit tokens into lending pools, liquidity pools, or staking. Covers browsing 2,600+ yield sources across 75+ chains, signing unsigned transactions from YieldAgent with a MoonPay wallet, and funding wallets for deposits. Use when the user mentions yield farming, APY, staking, DeFi yield, Yield.xyz, or passive income on crypto.
---

# YieldAgent by Yield.xyz: Multi-Chain Yield Optimization

YieldAgent is the first yield-native agent skill — access to 2,600+ yield opportunities across 75+ blockchains with a fully non-custodial architecture. The agent finds the best rates and builds transactions; your MoonPay wallet signs and executes them.

## Core Features

- **2,600+ Yield Sources**: Lending, liquidity pools, staking across 75+ chains
- **Non-Custodial**: Agent builds unsigned transactions — your wallet signs, you stay in control
- **Multi-Chain**: Ethereum, Polygon, Arbitrum, Base, Solana, and more

---

## Installation

```bash
npx clawhub@latest install yield-agent
```

### Prerequisites

```bash
which curl jq   # both required
# ETH for gas + tokens for deposits
```

---

## How It Works

```
YieldAgent → scans 2,600+ yield sources
           → finds best rate
           → builds unsigned transaction
           → you sign with: mp transaction send
           → executes on-chain
```

---

## Usage Example

```python
from yield_agent import YieldAgent
import subprocess, json

agent = YieldAgent(api_key="...")

# Find best USDC yield on Polygon
opportunities = agent.search(token="USDC", chain="polygon", limit=5)
best = opportunities[0]
print(f"{best.protocol} — {best.apy}% APY")

# Build unsigned deposit transaction
tx = agent.build_deposit(
    opportunity_id=best.id,
    amount=500,
    wallet_address="<your-polygon-address>"
)

# Sign and execute with MoonPay
result = subprocess.run([
    "mp", "transaction", "send",
    "--wallet", "yield-agent",
    "--chain", "polygon",
    "--transaction", json.dumps(tx)
], capture_output=True, text=True)
```

---

## Wallet Management with MoonPay

YieldAgent generates unsigned transactions — the MoonPay CLI (`mp`) signs and broadcasts them. No Crossmint, Turnkey, or Privy account needed.

### Install MoonPay CLI

```bash
npm install -g @moonpay/cli
mp login
```

### Create Your Yield Wallet

```bash
mp wallet create --name "yield-agent"
mp wallet retrieve --wallet "yield-agent"
```

### Sign Yield Transactions

```bash
# Polygon
mp transaction send --wallet "yield-agent" --chain polygon --transaction <unsigned-tx>

# Ethereum
mp transaction send --wallet "yield-agent" --chain ethereum --transaction <unsigned-tx>

# Arbitrum
mp transaction send --wallet "yield-agent" --chain arbitrum --transaction <unsigned-tx>
```

### Hardware Wallet (Large Positions)

```bash
mp wallet add-ledger --name "yield-ledger"
```

---

## Funding Your Wallet with MoonPay

```bash
# Buy USDC for stablecoin yields
mp buy --token usdc_ethereum --amount 1000 --wallet <your-eth-address> --email <email>

# Buy USDC.e for Polygon pools
mp buy --token usdc_polygon --amount 1000 --wallet <your-polygon-address> --email <email>

# Buy ETH for gas
mp buy --token eth_ethereum --amount 0.05 --wallet <your-eth-address> --email <email>

# Bridge to where the yields are
mp token bridge \
  --from-wallet yield-agent --from-chain ethereum \
  --from-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 500 \
  --to-chain polygon \
  --to-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174

# Check balances
mp token balance list --wallet <your-eth-address> --chain ethereum

# Withdraw earned yield to bank
mp virtual-account offramp create --amount 2000 --chain ethereum --wallet <address>
```

---

## Key Addresses

| Token | Chain | Address |
|-------|-------|---------|
| USDC | Ethereum | `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` |
| USDC.e | Polygon | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |
| ETH | Ethereum | `0x0000000000000000000000000000000000000000` |
| POL | Polygon | `0x0000000000000000000000000000000000000000` |

---

## Getting Started Flow

1. Install YieldAgent: `npx clawhub@latest install yield-agent`
2. Create wallet: `mp wallet create --name "yield-agent"`
3. Fund: `mp buy --token usdc_ethereum --amount 1000 --wallet <address>`
4. Buy gas: `mp buy --token eth_ethereum --amount 0.05 --wallet <address>`
5. Browse yield opportunities via YieldAgent
6. Sign unsigned deposit tx: `mp transaction send --wallet "yield-agent" --chain ethereum --transaction <tx>`
7. Withdraw yield: `mp virtual-account offramp create`

---

## Resources

- **API docs:** https://docs.yield.xyz
- **Agent page:** https://agent.yield.xyz
- **Install:** `npx clawhub@latest install yield-agent`
