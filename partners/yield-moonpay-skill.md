# YieldAgent by Yield.xyz: Multi-Chain Yield Optimization

YieldAgent is the first yield-native agent skill — access to 2,600+ yield opportunities across 75+ blockchains with a fully non-custodial architecture. The agent finds the best rates and builds transactions; your MoonPay wallet signs and executes them.

## Core Features

- **2,600+ Yield Sources**: Lending, liquidity pools, staking across 75+ chains
- **Non-Custodial**: Agent builds unsigned transactions — your wallet signs, you stay in control
- **Multi-Chain**: Ethereum, Polygon, Arbitrum, Base, Solana, and more
- **Full Custody**: Review every transaction before it hits the chain

---

## Installation

```bash
npx clawhub@latest install yield-agent
```

### Prerequisites

```bash
# System requirements
which curl jq   # both required

# ETH for gas + tokens for deposits (see Funding section)
```

---

## How It Works

YieldAgent operates on a build-then-sign model that keeps you in full control:

```
YieldAgent → scans 2,600+ yield sources → finds best rate
          → builds unsigned transaction
          → you sign with mp transaction send
          → executes on-chain
```

1. YieldAgent queries live yield sources
2. Returns the **best opportunity** with rate, protocol, and chain
3. Builds an **unsigned transaction** for deposit/withdrawal/rebalance
4. You sign with MoonPay CLI and it broadcasts on-chain

---

## Key Operations

| Action | Description |
|--------|-------------|
| Browse yields | Find top rates by token, chain, or protocol |
| Deposit | Build unsigned tx → sign → funds go to work |
| Withdraw | Pull funds back at any time |
| Rebalance | Move to higher-yield positions |
| Monitor | Track positions via `docs.yield.xyz` |

**Full API docs:** https://docs.yield.xyz

---

## Usage Example

```python
from yield_agent import YieldAgent
import subprocess, json

agent = YieldAgent(api_key="...")

# Find best yield for USDC on Polygon
opportunities = agent.search(token="USDC", chain="polygon", limit=5)
best = opportunities[0]
print(f"Best: {best.protocol} — {best.apy}% APY on {best.chain}")

# Get unsigned deposit transaction
tx = agent.build_deposit(
    opportunity_id=best.id,
    amount=500,
    wallet_address="<your-polygon-address>"
)

# Sign and execute with MoonPay CLI
result = subprocess.run([
    "mp", "transaction", "send",
    "--wallet", "yield-agent",
    "--chain", "polygon",
    "--transaction", json.dumps(tx)
], capture_output=True, text=True)

print(result.stdout)
```

---

## Wallet Management with MoonPay

YieldAgent is wallet-agnostic — it works with Crossmint, Portal, Turnkey, or Privy. The [MoonPay CLI](https://www.npmjs.com/package/@moonpay/cli) (`mp`) is the simplest option: create a wallet, fund it, and start earning — no third-party account needed.

### Install MoonPay CLI

```bash
npm install -g @moonpay/cli
mp login
```

### Create Your Yield Wallet

```bash
mp wallet create --name "yield-agent"
```

HD wallet with addresses across all supported chains (Ethereum, Polygon, Arbitrum, Solana, etc.).

```bash
mp wallet list
mp wallet retrieve --wallet "yield-agent"
```

Keys are AES-256-GCM encrypted locally — never leave the machine.

### Sign Yield Transactions

When YieldAgent returns an unsigned transaction, sign and broadcast it:

```bash
# Polygon yield deposit/withdrawal
mp transaction send \
  --wallet "yield-agent" \
  --chain polygon \
  --transaction <unsigned-tx-from-yield-agent>

# Ethereum yield
mp transaction send \
  --wallet "yield-agent" \
  --chain ethereum \
  --transaction <unsigned-tx-from-yield-agent>

# Arbitrum yield
mp transaction send \
  --wallet "yield-agent" \
  --chain arbitrum \
  --transaction <unsigned-tx-from-yield-agent>
```

### Sign Messages

```bash
mp message sign --wallet "yield-agent" --chain ethereum --message "I own this wallet"
```

### Hardware Wallet (Large Positions)

For maximum security on significant yield positions:

```bash
mp wallet add-ledger --name "yield-ledger"
```

All `mp` commands work transparently with Ledger — signing happens on the physical device.

---

## Funding Your Wallet with MoonPay

Yield strategies require **tokens for deposits** + **native gas token** for transactions.

### Option 1: Buy Tokens with Fiat

No existing crypto needed:

```bash
# USDC for stablecoin yields on Ethereum
mp buy --token usdc_ethereum --amount 1000 --wallet <your-eth-address> --email <email>

# USDC.e for Polygon stablecoin pools (high APY)
mp buy --token usdc_polygon --amount 1000 --wallet <your-polygon-address> --email <email>

# ETH for gas (Ethereum)
mp buy --token eth_ethereum --amount 0.05 --wallet <your-eth-address> --email <email>

# POL for gas (Polygon — ~$2-5 covers hundreds of txs)
mp buy --token pol_polygon --amount 5 --wallet <your-polygon-address> --email <email>
```

### Option 2: Bridge to Where the Yields Are

Move capital cross-chain to chase the best rates:

```bash
# USDC on Ethereum → USDC.e on Polygon
mp token bridge \
  --from-wallet yield-agent --from-chain ethereum \
  --from-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 500 \
  --to-chain polygon \
  --to-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174

# ETH → Arbitrum (for Arbitrum yield farms)
mp token bridge \
  --from-wallet yield-agent --from-chain ethereum \
  --from-token 0x0000000000000000000000000000000000000000 \
  --from-amount 0.1 \
  --to-chain arbitrum \
  --to-token 0x0000000000000000000000000000000000000000
```

Bridge times: 5–20 seconds.

### Option 3: Bank Transfer (Large Capital)

```bash
mp virtual-account create
mp virtual-account kyc submit
mp virtual-account bank-account add
mp virtual-account onramp create \
  --amount 10000 --currency usd \
  --chain ethereum \
  --wallet <your-eth-address>
```

Funds settle as USDC directly to your wallet.

### Option 4: Deposit Link (Permissionless)

Share a link for anyone to fund your yield wallet from any chain:

```bash
mp deposit create \
  --name "Yield Agent Fund" \
  --wallet <your-polygon-address> \
  --chain polygon \
  --token USDC.e
```

Returns deposit addresses for Solana, Ethereum, Bitcoin, Tron — all auto-convert to USDC.e.

### Check Balances

```bash
mp token balance list --wallet <your-eth-address> --chain ethereum
mp token balance list --wallet <your-polygon-address> --chain polygon
```

### Withdraw Earned Yield to Bank

```bash
mp virtual-account offramp create \
  --amount 2000 \
  --chain ethereum \
  --wallet <your-eth-address>
```

---

## Key Addresses

| Token | Chain | Address |
|-------|-------|---------|
| USDC | Ethereum | `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` |
| USDC.e | Polygon | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |
| ETH (native gas) | Ethereum | `0x0000000000000000000000000000000000000000` |
| POL (native gas) | Polygon | `0x0000000000000000000000000000000000000000` |

---

## Getting Started Flow

1. Install YieldAgent: `npx clawhub@latest install yield-agent`
2. Create wallet: `mp wallet create --name "yield-agent"`
3. Buy tokens for deposits: `mp buy --token usdc_ethereum --amount 1000 --wallet <address>`
4. Buy gas: `mp buy --token eth_ethereum --amount 0.05 --wallet <address>`
5. Browse yield opportunities via YieldAgent — filter by token, chain, APY
6. YieldAgent returns unsigned deposit transaction
7. Sign + execute: `mp transaction send --wallet "yield-agent" --chain ethereum --transaction <tx>`
8. Monitor positions at `docs.yield.xyz`
9. Withdraw earned yield: `mp virtual-account offramp create`

---

## Resources

- **API docs:** https://docs.yield.xyz
- **Agent page:** https://agent.yield.xyz
- **Install:** `npx clawhub@latest install yield-agent`
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli
