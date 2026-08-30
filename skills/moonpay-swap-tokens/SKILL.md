---
name: moonpay-swap-tokens
description: Swap tokens on the same chain or bridge tokens across chains. Use when the user wants to swap, bridge, or move tokens.
tags: [trading]
---

# Swap or bridge tokens

## Goal

Swap tokens on the same chain, or bridge tokens across chains. Two commands:

- **`mp token swap`** — same chain, different tokens
- **`mp token bridge`** — cross chain

Both build via swaps.xyz, sign locally, broadcast, and register for tracking.

## Commands

### Swap (same chain)

```bash
mp token swap \
  --wallet <wallet-name> \
  --chain <chain> \
  --from-token <token-address> \
  --from-amount <amount> \
  --to-token <token-address>
```

Supports exact-out: use `--to-amount` instead of `--from-amount`.

### Bridge (cross chain)

```bash
mp token bridge \
  --from-wallet <wallet-name> \
  --from-chain <chain> \
  --from-token <token-address> \
  --from-amount <amount> \
  --to-chain <chain> \
  --to-token <token-address> \
  --to-wallet <wallet-name>  # optional, defaults to from-wallet
```

Supports exact-out: use `--to-amount` instead of `--from-amount`.

## Examples

### Same-chain swap (SOL → USDC on Solana)

```bash
mp token swap \
  --wallet main --chain solana \
  --from-token So11111111111111111111111111111111111111111 \
  --from-amount 0.1 \
  --to-token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

### Cross-chain bridge (ETH → USDC.e on Polygon)

```bash
mp token bridge \
  --from-wallet funded --from-chain ethereum \
  --from-token 0x0000000000000000000000000000000000000000 \
  --from-amount 0.003 \
  --to-chain polygon \
  --to-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174
```

### ERC20 swap (auto-approves if needed)

```bash
mp token swap \
  --wallet funded --chain polygon \
  --from-token 0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174 \
  --from-amount 5 \
  --to-token 0x0000000000000000000000000000000000000000
```

## Confirm before you broadcast

`mp token swap` and `mp token bridge` sign and broadcast in one shot. There is no
pending state to cancel and no way to reverse a confirmed transaction, so the
confirmation has to happen **before** the command runs, not after.

Before either command, state back to the user and get their agreement on:

- the exact amount and the token being spent
- the token being received, and on which chain
- for a bridge, the destination wallet — read the address back in full rather than
  truncating it, because a wrong destination is unrecoverable

Then:

- Resolve symbols to addresses with `mp token search` and show the user which address
  you resolved to. "USDC" matches many contracts, including worthless impostors with
  the same symbol; the address is the only unambiguous identifier.
- Never widen the amount on your own initiative. If a balance check shows the swap
  cannot cover fees, report that and ask — do not substitute a different amount.
- Run one swap per confirmation. If a task implies several, confirm the set up front
  and say how many transactions it will take.
- On failure, do not retry automatically. A swap can fail after the approve
  transaction has already landed, so a blind retry can spend twice.

## Supported chains

solana, ethereum, base, polygon, arbitrum, optimism, bnb, avalanche, bitcoin (bridges only)

## How it works

1. Resolves wallet name → address
2. Builds unsigned transaction via swaps.xyz (handles decimal conversion)
3. If ERC20 token needs approval, sends an approve transaction first, then re-builds
4. Signs locally — private key never leaves the machine
5. Broadcasts to the network
6. Registers for tracking

`token swap` calls `token bridge` under the hood with `from-chain` = `to-chain`.

## Tips

- If the user provides token names/symbols, resolve to addresses with `mp token search --query "USDC" --chain solana`
- Check balances first with `mp token balance list --wallet <address> --chain <chain>`
- Native tokens use `0x0000000000000000000000000000000000000000` (EVM) or `So11111111111111111111111111111111111111111` (Solana)

## Related skills

- **moonpay-discover-tokens** — Search for token addresses
- **moonpay-check-wallet** — Check balances before swapping
- **moonpay-auth** — Set up wallets for signing
