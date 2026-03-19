---
name: zyfai-yield
description: Earn DeFi yield on MoonPay wallets via Zyfai. Use when the user wants passive yield, automated DeFi returns, or to put idle funds to work on Base, Arbitrum, or Plasma.
tags: [yield, defi]
---

# Zyfai — Earn Yield on MoonPay Wallets

## Overview

Zyfai creates a non-custodial subaccount (Safe smart wallet) linked to the user's MoonPay wallet. Funds deposited into the subaccount are automatically optimized across DeFi protocols. The user stays in full control and can withdraw anytime.

## Prerequisites

- MoonPay CLI installed (`npm i -g @moonpay/cli`)
- Authenticated (`mp login` → `mp verify`)
- Funded wallet on Base, Arbitrum, or Plasma
- Zyfai API key (create programmatically or at [sdk.zyf.ai](https://sdk.zyf.ai))
- Node.js 18+ with `@zyfai/sdk` and `ethers` installed

## Commands

```bash
# Export MoonPay wallet mnemonic
mp wallet export --wallet <wallet-name>

# Check wallet balance before depositing
mp token balance list --wallet <address> --chain base
```

## Workflow

1. Export the MoonPay wallet mnemonic with `mp wallet export --wallet <name>`
2. Derive the address and private key from the mnemonic using ethers
3. Create a Zyfai API key using the derived wallet address
4. Connect to Zyfai SDK and deploy a subaccount
5. Enable session key for automated yield optimization
6. Deposit funds (USDC or WETH)
7. Withdraw anytime back to the MoonPay wallet

## Example

### Step 1: Export MoonPay wallet and derive keys

```bash
mp wallet export --wallet zyfai-base
```

```typescript
import { HDNodeWallet } from "ethers";

const mnemonic = "<mnemonic-from-moonpay>";
const wallet = HDNodeWallet.fromPhrase(mnemonic);
console.log("Address:", wallet.address);       // Use this to create API key
console.log("Private Key:", wallet.privateKey); // Use this to connect SDK
```

### Step 2: Create Zyfai API key

Use the wallet address from Step 1 to create your API key:

```bash
curl -X POST https://sdk.zyf.ai/api/sdk-api-keys/create \
  -H "Content-Type: application/json" \
  -d '{
    "clientName": "moonpay-agent",
    "walletAddress": "<address-from-step-1>",
    "email": "agent@example.com"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "apiKey": "zyfai_361ad41d083c2fe.....",
    "clientName": "moonpay-agent",
    "ownerWalletAddress": "0x..."
  }
}
```

> Store the `apiKey` securely — it cannot be retrieved later.

### Step 3: Deploy and deposit

```typescript
import { ZyfaiSDK } from "@zyfai/sdk";

const sdk = new ZyfaiSDK({ apiKey: "<your-api-key>" });
await sdk.connectAccount("<private-key>", 8453); // Base

const userAddress = "<wallet-address>";

// Deploy subaccount if needed
const wallet = await sdk.getSmartWalletAddress(userAddress, 8453);
if (!wallet.isDeployed) {
  await sdk.deploySafe(userAddress, 8453, "conservative");
}

// Enable automated optimization
await sdk.createSessionKey(userAddress, 8453);

// Deposit 10 USDC (6 decimals)
await sdk.depositFunds(userAddress, 8453, "10000000");

// Or deposit 0.5 WETH (18 decimals) — user must have WETH, not ETH
await sdk.depositFunds(userAddress, 8453, "500000000000000000", "WETH");

await sdk.disconnectAccount();
```

### Step 4: Withdraw

```typescript
await sdk.connectAccount("<private-key>", 8453);

// Withdraw all USDC (default)
await sdk.withdrawFunds("<user-address>", 8453);

// Partial USDC withdrawal (5 USDC)
await sdk.withdrawFunds("<user-address>", 8453, "5000000");

// Withdraw all WETH
await sdk.withdrawFunds("<user-address>", 8453, undefined, "WETH");

await sdk.disconnectAccount();
```

## Supported Chains

| Chain    | ID    |
|----------|-------|
| Base     | 8453  |
| Arbitrum | 42161 |
| Plasma   | 9745  |

## Strategies

- `"conservative"` — Stable yield, lower risk
- `"aggressive"` — Higher yield, higher risk

## Resources

- **API Key:** [sdk.zyf.ai](https://sdk.zyf.ai)
- **Docs:** [docs.zyf.ai](https://docs.zyf.ai)
- **SDK Demo:** [github.com/ondefy/zyfai-sdk-demo](https://github.com/ondefy/zyfai-sdk-demo)
- **Zyfai Skill:** [zyf.ai/skill.md](https://zyf.ai/skill.md)

## Related Skills

- [moonpay-auth](../moonpay-auth/) — Set up and authenticate MoonPay wallets
- [moonpay-check-wallet](../moonpay-check-wallet/) — Check wallet balances before depositing
- [moonpay-buy-crypto](../moonpay-buy-crypto/) — Fund wallet with fiat before earning yield
