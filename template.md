# {{PARTNER_NAME}}: {{PARTNER_TAGLINE}}

{{PARTNER_DESCRIPTION}}

## Core Features

{{PARTNER_FEATURES}}

---

## Authentication & Setup

{{PARTNER_AUTH}}

---

## Key Endpoints / Commands

{{PARTNER_ENDPOINTS}}

---

## Usage Example

{{PARTNER_EXAMPLE}}

---

## Wallet Management with MoonPay

{{MOONPAY_WALLET_INTRO}}

Use the [MoonPay CLI](https://www.npmjs.com/package/@moonpay/cli) (`mp`) to create and manage wallets, sign transactions, and fund your agent — all from the command line.

### Install MoonPay CLI

```bash
npm install -g @moonpay/cli
mp login
```

### Create a Wallet

```bash
mp wallet create --name "{{WALLET_NAME}}"
mp wallet list
mp wallet retrieve --wallet "{{WALLET_NAME}}"
```

Keys are AES-256-GCM encrypted locally — never leave the machine.

### {{WALLET_LINK_HEADING}}

{{WALLET_LINK_INSTRUCTIONS}}

### Sign Messages & Transactions

```bash
# Sign a message (EIP-191)
mp message sign --wallet "{{WALLET_NAME}}" --chain {{PRIMARY_CHAIN}} --message "I own this wallet"

# Sign and send a transaction
mp transaction send --wallet "{{WALLET_NAME}}" --chain {{PRIMARY_CHAIN}} --transaction <unsigned-tx>
```

### Hardware Wallet (High Security)

```bash
mp wallet add-ledger --name "{{WALLET_NAME}}-ledger"
```

All `mp` commands work transparently with Ledger — signing happens on-device.

---

## Funding Your Wallet with MoonPay

{{FUNDING_INTRO}}

### Option 1: Buy {{PRIMARY_TOKEN}} with Fiat

```bash
mp buy --token {{PRIMARY_TOKEN_FLAG}} --amount {{SUGGESTED_AMOUNT}} --wallet <your-{{PRIMARY_CHAIN}}-address> --email <email>
```

{{GAS_TOKEN_BUY}}

### Option 2: Bridge Existing Crypto

```bash
{{BRIDGE_EXAMPLE}}
```

Bridge times are typically 5–20 seconds.

### Option 3: Bank Transfer (Large Amounts)

```bash
mp virtual-account create
mp virtual-account kyc submit
mp virtual-account bank-account add
mp virtual-account onramp create \
  --amount 1000 --currency usd \
  --chain {{PRIMARY_CHAIN}} \
  --wallet <your-{{PRIMARY_CHAIN}}-address>
```

### Option 4: Deposit Link (Permissionless)

Accept crypto from anyone — auto-converts to {{PRIMARY_TOKEN}} on {{PRIMARY_CHAIN}}:

```bash
mp deposit create \
  --name "{{PARTNER_NAME}} Agent Fund" \
  --wallet <your-{{PRIMARY_CHAIN}}-address> \
  --chain {{PRIMARY_CHAIN}} \
  --token {{PRIMARY_TOKEN}}
```

### Check Balance

```bash
mp token balance list --wallet <your-{{PRIMARY_CHAIN}}-address> --chain {{PRIMARY_CHAIN}}
```

### Withdraw to Bank

```bash
mp virtual-account offramp create \
  --amount 500 \
  --chain {{PRIMARY_CHAIN}} \
  --wallet <your-{{PRIMARY_CHAIN}}-address>
```

---

## Key Addresses

{{KEY_ADDRESSES}}

---

## Getting Started Flow

{{GETTING_STARTED}}

---

## Resources

{{RESOURCES}}
