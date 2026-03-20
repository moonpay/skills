---
name: jupiter-lend
description: >
  Jupiter Lend protocol on Solana — deposit assets to earn yield, borrow against collateral, repay loans, and manage leveraged positions. Uses the @jup-ag/lend and @jup-ag/lend-read SDKs. Use when user asks to lend on Jupiter, earn yield on Solana assets, borrow SOL or USDC, or manage Jupiter Lend positions.
tags: [jupiter, solana, lending, defi, yield, borrow, collateral]
---

# Jupiter Lend

Jupiter Lend is a lending protocol on Solana. Deposit assets to earn yield or borrow against collateral.

> **Note:** Jupiter Lend does not expose a public REST API — operations require the `@jup-ag/lend` SDK and a Solana signing wallet. This skill covers the SDK integration pattern.

## Prerequisites

- Node.js 18+ and npm
- A funded Solana wallet (private key or keypair file)
- A Solana RPC endpoint (e.g. `https://api.mainnet-beta.solana.com` or Helius/Alchemy)

```bash
npm install @jup-ag/lend @jup-ag/lend-read @solana/web3.js
```

> ⚠️ **Security:** Never expose your private key in code or logs. Load it from an environment variable or a secure keyfile with restricted permissions (`chmod 600`).

---

## Read-Only Operations (@jup-ag/lend-read)

Use `@jup-ag/lend-read` to query markets, pools, and positions without signing.

**Key methods:**

| Method | Description |
|--------|-------------|
| `getLendingMarkets()` | All lending markets and their APYs |
| `getLendingPool(mint)` | Pool details for a specific token |
| `getUserPosition(wallet)` | Current deposits and borrows for a wallet |
| `getjlTokenInfo(mint)` | jlToken (receipt token) metadata |

**Full SDK docs:** https://github.com/jup-ag/jup-lock

---

## Write Operations (@jup-ag/lend)

| Operation | Method | Description |
|-----------|--------|-------------|
| Deposit | `deposit(mint, amount)` | Deposit tokens, receive jlTokens |
| Withdraw | `withdraw(jlMint, amount)` | Redeem jlTokens for underlying |
| Deposit collateral | `depositCollateral(mint, amount)` | Add collateral for borrowing |
| Borrow | `borrow(mint, amount)` | Borrow against deposited collateral |
| Repay | `repay(mint, amount)` | Repay borrowed position |
| Withdraw collateral | `withdrawCollateral(mint, amount)` | Remove collateral after repay |

Each method returns an unsigned Solana transaction. Sign and send with your wallet.

**Full SDK reference:** https://github.com/jup-ag/jup-lock
**npm:** https://www.npmjs.com/package/@jup-ag/lend

---

## Funding with MoonPay

```bash
# Buy USDC on Solana to deposit into Jupiter Lend
mp buy --token usdc_solana --amount 100 --wallet <your-solana-address> --email <email>

# Buy SOL for gas
mp buy --token sol_solana --amount 0.1 --wallet <your-solana-address> --email <email>
```

---

## Related Skills

- **jupiter-api** — Swap tokens and get prices via Jupiter REST APIs
- **moonpay-buy-crypto** — Fund your Solana wallet to deposit into Lend
- **moonpay-check-wallet** — Verify SOL/USDC balances before depositing
