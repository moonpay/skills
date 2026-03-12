---
name: moonpay-missions
description: A series of missions that walk through every MoonPay CLI capability. Use when the user is new or says "get started", "show me what you can do", or "run the missions".
tags: [setup]
---

# MoonPay Missions

Walk the user through a series of missions. Complete each one before moving to the next. After each mission, give a brief summary of what they just did and what's next.

## Mission 1: Identity

**Goal:** Verify who you are and what wallets you have.

```bash
mp user retrieve
mp wallet list
```

If no wallets exist, create one:

```bash
mp wallet create --name "main"
```

Tell the user their email, all wallet addresses (Solana, Ethereum, Bitcoin, Tron), and that keys are encrypted locally with a random key in the OS keychain.

## Mission 2: Recon

**Goal:** See what's trending and research a token.

```bash
mp token trending list --chain solana --limit 5 --page 1
```

Present the top trending tokens. Then ask the user to pick one to research:

```bash
mp token search --query "<token>" --chain solana
mp token retrieve --token <address-from-search> --chain solana
```

Present: name, symbol, price, market cap, liquidity, volume.

## Mission 3: Portfolio Check

**Goal:** See what's in the wallet across chains.

```bash
mp token balance list --wallet <solana-address> --chain solana
mp token balance list --wallet <eth-address> --chain ethereum
mp bitcoin balance retrieve --wallet <btc-address>
```

Present holdings as a multi-chain portfolio report with USD values and total.

## Mission 4: Swap

**Goal:** Execute a swap end-to-end.

Pick a small swap based on what the wallet holds:

```bash
mp token swap \
  --wallet main --chain solana \
  --from-token So11111111111111111111111111111111111111111 \
  --from-amount 0.01 \
  --to-token EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v
```

This builds, signs locally, and broadcasts in one step. Show the result and explain: the transaction was built on the server, signed locally (key never left the machine), and submitted on-chain.

Three commands for moving tokens:
- **`mp token swap`** — same chain, different tokens (e.g. SOL → USDC)
- **`mp token bridge`** — cross chain (e.g. ETH on Ethereum → USDC on Polygon)
- **`mp token transfer`** — same chain, same token, different wallet (e.g. send USDC to a friend)

## Mission 5: Buy with Fiat

**Goal:** Generate a fiat checkout link.

```bash
mp buy --token sol --amount 1 --wallet <solana-address> --email <email>
```

Open the checkout URL. Explain: MoonPay's fiat gateway for buying crypto with card or bank transfer.

## Mission 6: Message Signing

**Goal:** Sign a message to prove wallet ownership.

```bash
mp message sign --wallet main --chain solana --message "I own this wallet"
```

Present the signature. Explain: used for wallet verification (e.g. registering with virtual accounts, proving ownership to dApps).

## Mission 7: Virtual Account (optional)

**Goal:** Check if the user has a virtual account for fiat on/off-ramp.

```bash
mp virtual-account retrieve
```

If they have one, show the status and next step. If not, explain what it is and that they can set one up with `mp virtual-account create`.

## Mission 8: Prediction Markets

**Goal:** Browse prediction markets and understand how they work.

```bash
mp prediction-market market trending list --provider polymarket --limit 5
```

Pick an interesting market and get details:

```bash
mp prediction-market market event retrieve --provider polymarket --slug <slug-from-trending>
```

Explain: prediction markets let you buy shares on outcomes. Price = implied probability. Shares pay $1 if the outcome resolves YES. Supports Polymarket (Polygon/USDC.e) and Kalshi (Solana/USDC).

## Mission 9: Skills

**Goal:** Show what skills are available and how to manage them.

```bash
# List all bundled skills
mp skill list

# View a specific skill's instructions
mp skill retrieve --name moonpay-prediction-market

# Install all skills to Claude Code's skills directory
mp skill install
```

Explain: skills are guides that teach agents how to use the CLI for specific tasks. `mp skill list` shows all available skills. `mp skill retrieve --name <skill>` shows the full instructions for a specific skill. `mp skill install` copies all skills to `~/.claude/skills/` so Claude Code loads them automatically.

## Debrief

Summarize everything:
- Set up a multi-chain HD wallet (encrypted, OS keychain secured)
- Searched and analyzed tokens
- Checked portfolio across Solana, Ethereum, Bitcoin
- Executed a swap (built, signed locally, broadcast)
- Generated a fiat buy link
- Signed a message for verification
- Explored virtual accounts
- Browsed prediction markets
- Discovered and installed skills

End with: "You're all set. Run `mp --help` to see all commands, or ask me anything."
