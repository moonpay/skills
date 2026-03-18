---
name: moonpay-hardware-wallet
description: Connect a hardware wallet (Ledger) to the MoonPay CLI. Sign transactions on the physical device — no private keys stored locally.
tags: [wallet]
---

# Hardware wallet support

## Goal

Connect a hardware wallet to the MoonPay CLI. Private keys never leave the device — the CLI stores only cached addresses. All existing commands (swap, transfer, bridge, buy, balance) work transparently with hardware wallets.

First supported device: **Ledger** (Nano S, Nano X, Nano S Plus, Stax, Flex).

## Prerequisites

- Ledger device connected via USB
- Ledger Live installed (for firmware updates)
- Ethereum and/or Solana apps installed on the device

## Commands

### Add a hardware wallet

```bash
# Auto-detect connected device
mp wallet hardware add --name "my-ledger"

# Specify device type explicitly
mp wallet hardware add --name "my-ledger" --device ledger
```

This connects to the device, derives addresses for all supported chains (Ethereum, Solana), and saves the wallet. No secrets are stored — only addresses.

### Refresh addresses

```bash
mp wallet hardware refresh --wallet "my-ledger"
```

Re-derives addresses from the connected device. Use this if you changed the account index in Ledger Live or need to update cached addresses.

### List wallets

```bash
mp wallet list
```

Hardware wallets appear alongside software wallets with a `[hardware/ledger]` tag.

## Using hardware wallets

Once added, use `--wallet` like any other wallet. The CLI automatically connects to the device for signing.

### Check balances (no device needed)

```bash
mp token balance list --wallet my-ledger --chain ethereum
mp token balance list --wallet my-ledger --chain solana
```

### Swap tokens (signs on device)

```bash
mp token swap \
  --wallet my-ledger --chain ethereum \
  --from-token 0x0000000000000000000000000000000000000000 \
  --from-amount 0.01 \
  --to-token 0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48
```

The CLI prompts you to review and confirm the transaction on your Ledger.

### Transfer tokens (signs on device)

```bash
mp token transfer \
  --wallet my-ledger --chain ethereum \
  --token 0x0000000000000000000000000000000000000000 \
  --amount 0.01 \
  --to 0x1234...
```

### Bridge cross-chain (signs on device)

```bash
mp token bridge \
  --from-wallet my-ledger --from-chain ethereum \
  --from-token 0x0000000000000000000000000000000000000000 \
  --from-amount 0.01 \
  --to-chain polygon \
  --to-token 0x0000000000000000000000000000000000000000
```

## How it works

1. `wallet hardware add` connects via USB, switches Ledger apps automatically, and derives addresses
2. Addresses are cached in the encrypted vault — read-only commands work without the device
3. For signing commands, the CLI connects to the device, opens the correct app, and prompts for on-device approval
4. The device signs the transaction — the private key never leaves the hardware
5. The CLI broadcasts the signed transaction

## Supported chains

- **Ethereum** (+ all EVM: Base, Polygon, Arbitrum, Optimism, BNB, Avalanche)
- **Solana**
- Bitcoin and Tron are not supported via Ledger

## Tips

- The device must be unlocked and on the home screen when connecting
- App switching is automatic — no need to manually open Ethereum or Solana apps
- If signing times out, check the Ledger screen for a pending approval prompt
- `wallet export` is not available for hardware wallets (there are no secrets to export)

## Related skills

- **moonpay-auth** — Set up the CLI and manage software wallets
- **moonpay-swap-tokens** — Swap or bridge tokens
- **moonpay-check-wallet** — Check wallet balances
