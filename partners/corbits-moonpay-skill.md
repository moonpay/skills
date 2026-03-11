# Corbits: Paid API Marketplace for AI Agents

Corbits is a discovery and proxy platform for premium APIs — agents can search, select, and call paid APIs with automatic per-request USDC micropayments via the x402 protocol. MoonPay provides the wallet that powers every Corbits payment.

## Core Features

- **API Discovery**: Search hundreds of paid API proxies by name or category
- **x402 Micropayments**: Pay per API call in USDC, automatically via the Faremeter `rides` library
- **EVM + Solana**: Supports both wallet types for payment
- **TypeScript Native**: `@faremeter/rides` handles all payment authentication
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

> **Use MoonPay to generate your EVM key** — see Wallet Management section below.

---

## Key Commands

| Command | Description |
|---------|-------------|
| `/corbits init` | First-time setup (wallet + project scaffold) |
| `/corbits search <query>` | Find API proxies by name |
| `/corbits list` | View all available proxies and endpoint pricing |
| `/corbits call` | Execute a paid API call |
| `/corbits status` | Show currently selected proxy |

### API Call Flow

```
/corbits search "weather"      → Find matching proxies
/corbits list                  → Browse endpoints + USDC pricing
/corbits call                  → Select endpoint → review cost → confirm → execute
```

All pricing is shown in USDC before execution. The `rides.ts` script handles x402 payment automatically.

**Base URL:** `https://api.corbits.dev`
**Context storage:** `~/.config/corbits/context.json`

---

## Usage Example

```bash
# Find a financial data API
/corbits search "crypto prices"

# Review endpoints and cost
/corbits list

# Execute — payment happens automatically
/corbits call
# → Select endpoint: GET /prices/latest
# → Cost: 0.001 USDC
# → Confirm: y
# → Response: { "BTC": 67420.00, "ETH": 3540.00, ... }
```

Your MoonPay wallet balance is debited automatically for each call — no manual transaction signing required.

---

## Wallet Management with MoonPay

Corbits requires an EVM wallet for x402 micropayments. Use the [MoonPay CLI](https://www.npmjs.com/package/@moonpay/cli) (`mp`) to create and fund the wallet — then use the same key for Corbits. Your MoonPay wallet IS your Corbits payment wallet.

### Install MoonPay CLI

```bash
npm install -g @moonpay/cli
mp login
```

### Create Your Corbits Payment Wallet

```bash
mp wallet create --name "corbits-agent"
```

Generates a 24-word BIP39 mnemonic. The EVM address works on all EVM chains (Ethereum, Polygon, Base, Arbitrum).

```bash
mp wallet list
mp wallet retrieve --wallet "corbits-agent"
```

### Export Key for Corbits Init

```bash
# Export private key (interactive terminal required)
mp wallet export --wallet "corbits-agent"
```

Copy the EVM private key, then run `/corbits init` and paste it when prompted. Same address, same key — no transfers needed.

### Sign Messages & Transactions

```bash
# Sign a message
mp message sign --wallet "corbits-agent" --chain ethereum --message "I own this wallet"

# Send a raw transaction
mp transaction send --wallet "corbits-agent" --chain ethereum --transaction <unsigned-tx>
```

### Hardware Wallet (High Volume)

```bash
mp wallet add-ledger --name "corbits-ledger"
```

Signing happens on-device. Suitable for high-frequency API workloads.

---

## Funding Your Wallet with MoonPay

Corbits payments settle in USDC. Fund your wallet before calling paid APIs.

### Option 1: Buy USDC with Fiat

No existing crypto needed:

```bash
# USDC on Ethereum
mp buy --token usdc_ethereum --amount 50 --wallet <your-eth-address> --email <email>

# Or lower-gas: USDC on Polygon
mp buy --token usdc_polygon --amount 50 --wallet <your-eth-address> --email <email>
```

### Option 2: Bridge Existing Crypto

```bash
# ETH → USDC on Ethereum
mp token swap \
  --from-wallet corbits-agent --chain ethereum \
  --from-token 0x0000000000000000000000000000000000000000 \
  --to-token 0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48 \
  --from-amount 0.02
```

Bridge times: 5–20 seconds.

### Option 3: Bank Transfer (Large Budgets)

```bash
mp virtual-account create
mp virtual-account kyc submit
mp virtual-account bank-account add
mp virtual-account onramp create \
  --amount 500 --currency usd \
  --chain ethereum \
  --wallet <your-eth-address>
```

### Option 4: Deposit Link (Permissionless)

Create a link — anyone can fund your Corbits wallet from any chain, auto-converts to USDC:

```bash
mp deposit create \
  --name "Corbits Agent Fund" \
  --wallet <your-eth-address> \
  --chain ethereum \
  --token USDC
```

Returns a shareable URL + addresses for Solana, Bitcoin, Tron.

### Check Balance

```bash
mp token balance list --wallet <your-eth-address> --chain ethereum
```

### Auto Top-Up (Agent Automation)

```bash
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

## Key Addresses

| Token | Chain | Address |
|-------|-------|---------|
| USDC | Ethereum | `0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48` |
| USDC.e | Polygon | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` |
| ETH (native gas) | Ethereum | `0x0000000000000000000000000000000000000000` |

---

## Getting Started Flow

1. Install Corbits: `npx clawhub@latest install corbits`
2. Create payment wallet: `mp wallet create --name "corbits-agent"`
3. Fund with USDC: `mp buy --token usdc_ethereum --amount 50 --wallet <address>`
4. Export key: `mp wallet export --wallet "corbits-agent"`
5. Initialize Corbits: `/corbits init` → paste exported EVM key
6. Discover APIs: `/corbits search <topic>`
7. Call APIs: `/corbits call` — payment auto-deducted from your MoonPay wallet
8. Top up when needed: `mp buy` or `mp token bridge`

---

## Resources

- **Platform:** https://corbits.dev
- **API base:** https://api.corbits.dev
- **Payment SDK:** `@faremeter/rides` (npm)
- **MoonPay CLI:** https://www.npmjs.com/package/@moonpay/cli
