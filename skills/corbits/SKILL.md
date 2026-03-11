---
name: corbits
description: Use this skill when the user wants to discover and call paid APIs through the Corbits marketplace, or when they need to set up automatic USDC micropayments for API access via the x402 protocol. Covers Corbits CLI setup, API discovery, and managing a MoonPay EVM wallet as the payment wallet. Use when the user mentions Corbits, paid APIs, x402 payments, or API proxies.
---

# Corbits: Paid API Marketplace for AI Agents

Corbits is a discovery and proxy platform for premium APIs — agents can search, select, and call paid APIs with automatic per-request USDC micropayments via the x402 protocol. MoonPay provides the wallet that powers every Corbits payment.

## Core Features

- **API Discovery**: Search hundreds of paid API proxies by name or category
- **x402 Micropayments**: Pay per API call in USDC automatically via `@faremeter/rides`
- **EVM + Solana**: Supports both wallet types for payment
- **Transparent Pricing**: See cost in USDC before every call

---

## Installation & Setup

### Install the Corbits Skill

```bash
npx clawhub@latest install corbits
```

### Initialize Corbits

```bash
/corbits init
```

This will:
1. Prompt for your **EVM private key** (stored in macOS Keychain or `~/.config/corbits/`)
2. Optionally prompt for a **Solana keypair**
3. Install Bun + scaffold a TypeScript project with `@faremeter/rides`

---

## Key Commands

| Command | Description |
|---------|-------------|
| `/corbits init` | First-time setup |
| `/corbits search <query>` | Find API proxies by name |
| `/corbits list` | View all proxies and endpoint pricing |
| `/corbits call` | Execute a paid API call |
| `/corbits status` | Show currently selected proxy |

### API Call Flow

```
/corbits search "weather"      → find matching proxies
/corbits list                  → browse endpoints + USDC pricing
/corbits call                  → select → review cost → confirm → execute
```

**Base URL:** `https://api.corbits.dev`

---

## Usage Example

```bash
/corbits search "crypto prices"
/corbits list
/corbits call
# → Select: GET /prices/latest
# → Cost: 0.001 USDC
# → Confirm: y
# → { "BTC": 67420.00, "ETH": 3540.00 }
```

---

## Wallet Management with MoonPay

Corbits requires an EVM wallet for x402 micropayments. Use the MoonPay CLI (`mp`) to create and fund the wallet — then export the key directly into Corbits. Your MoonPay wallet IS your Corbits payment wallet.

### Install MoonPay CLI

```bash
npm install -g @moonpay/cli
mp login
```

### Create Your Corbits Payment Wallet

```bash
mp wallet create --name "corbits-agent"
mp wallet retrieve --wallet "corbits-agent"
```

### Export Key for Corbits Init

```bash
mp wallet export --wallet "corbits-agent"
# Copy the EVM private key → paste into /corbits init
```

Same address, same key — no transfers needed.

### Sign & Send Transactions

```bash
mp transaction send --wallet "corbits-agent" --chain ethereum --transaction <unsigned-tx>
```

---

## Funding Your Wallet with MoonPay

Corbits payments settle in USDC. Fund before calling paid APIs.

```bash
# Buy USDC with fiat
mp buy --token usdc_ethereum --amount 50 --wallet <your-eth-address> --email <email>

# Swap ETH → USDC
mp token swap \
  --from-wallet corbits-agent --chain ethereum \
  --from-token 0x0000000000000000000000000000000000000000 \
  --to-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 0.02

# Check balance
mp token balance list --wallet <your-eth-address> --chain ethereum

# Auto top-up when balance runs low
BALANCE=$(mp token balance list --wallet <address> --chain ethereum --json | \
  jq '.[] | select(.symbol=="USDC") | .balance')
if (( $(echo "$BALANCE < 5" | bc -l) )); then
  mp token bridge \
    --from-wallet primary --from-chain polygon \
    --from-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 \
    --from-amount 20 \
    --to-chain ethereum \
    --to-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48
fi
```

---

## Getting Started Flow

1. Install Corbits: `npx clawhub@latest install corbits`
2. Create payment wallet: `mp wallet create --name "corbits-agent"`
3. Fund with USDC: `mp buy --token usdc_ethereum --amount 50 --wallet <address>`
4. Export key: `mp wallet export --wallet "corbits-agent"`
5. Initialize: `/corbits init` → paste EVM key
6. Discover APIs: `/corbits search <topic>`
7. Call APIs: `/corbits call` — payment auto-deducted

---

## Resources

- **Platform:** https://corbits.dev
- **API base:** https://api.corbits.dev
- **Payment SDK:** `@faremeter/rides` (npm)
