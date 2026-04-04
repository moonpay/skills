---
name: moonpay-wallet-statusline
description: >
  Add wallet balances to the terminal status line. Use when the user asks to
  "show balances in the status bar", "add wallet to status line", or wants a
  persistent balance display while working.
tags: [wallet, statusline]
---

# Wallet status line

## Goal

Display cached wallet balances in a terminal status line. Creates a config file, a refresh script, and a pre-rendered cache file that any status line can read.

## Prerequisites

- MoonPay CLI installed: `npm i -g @moonpay/cli`
- Authenticated: `mp login` then `mp verify`
- At least one wallet: `mp wallet list`
- `jq` installed: `which jq`
- `bc` installed (for USD totals): `which bc`

## Commands

```bash
# List wallets
mp wallet list

# Fetch balances (used by the refresh script)
mp --json wallet list
mp --json bitcoin balance retrieve --wallet <btc-address>
mp --json token balance list --wallet <address> --chain <chain>
```

## Supported chains

`solana`, `ethereum`, `base`, `polygon`, `arbitrum`, `optimism`, `bnb`, `avalanche`, `tron`, `bitcoin`, `ton`, `filecoin`

Bitcoin uses a separate command (`mp bitcoin balance retrieve`) and does not return USD values.

## Workflow

### 1. Select wallets

Run `mp wallet list` and ask the user which wallet(s) to track. For each wallet, ask which chains to display. Skip testnets/devnets by default (filter out chains containing "testnet", "devnet", "sepolia", "amoy", "tempo").

### 2. Select display format

- `amount` — symbol + balance (e.g., `BTC 0.00071`)
- `amount+usd` — symbol + balance + USD (e.g., `mpSOL 0.00092 ($0.08)`). Bitcoin always shows amount only (no USD from the API).
- `total+breakdown` — total USD + per-token (e.g., `$0.08 — mpSOL 0.00092`). Bitcoin balance is excluded from the USD total.

### 3. Write config

Save to `~/.config/moonpay/statusline.json`:

```json
{
  "wallets": [
    {
      "name": "btc-wallet",
      "chains": ["bitcoin", "solana"]
    }
  ],
  "format": "amount"
}
```

### 4. Create refresh script

Write `~/.config/moonpay/refresh-statusline.sh` and make it executable (`chmod +x`). The script:

1. Reads `~/.config/moonpay/statusline.json` for wallet names, chains, and format.
2. Resolves wallet names to addresses via `mp --json wallet list`.
3. Fetches balances per wallet+chain:
   - Bitcoin: `mp --json bitcoin balance retrieve --wallet <addr>` — extracts `.total.btc`.
   - Other chains: `mp --json token balance list --wallet <addr> --chain <chain>` — extracts `.items[].symbol`, `.items[].balance.amount`, `.items[].balance.value`.
4. Formats output with ANSI colors:
   - Token symbols in bold cyan (`\033[1;36m`), amounts in white (`\033[0;37m`), USD values in dim green (`\033[2;32m`).
   - Tokens separated by dim ` | `.
   - USD values rounded to 2 decimal places.
   - Bitcoin uses the `₿` symbol; other tokens use the API-returned symbol.
5. Writes the pre-rendered ANSI string to `~/.config/moonpay/statusline-cache.txt` using atomic write (temp file + `mv`).
6. On error: keeps existing cache intact — never overwrites with empty or error output.
7. If no balances found: removes the cache file.

```bash
#!/usr/bin/env bash
set -euo pipefail

CONFIG="$HOME/.config/moonpay/statusline.json"
CACHE="$HOME/.config/moonpay/statusline-cache.txt"

if [[ ! -f "$CONFIG" ]]; then exit 1; fi

FORMAT=$(jq -r '.format // "amount"' "$CONFIG")
# ... resolve wallets, fetch balances, format output, write cache
# See moonpay-wallet-statusline-refresh skill for the refresh command
```

### 5. Run initial refresh

```bash
bash ~/.config/moonpay/refresh-statusline.sh
```

Verify the cache file was created:

```bash
cat ~/.config/moonpay/statusline-cache.txt
```

### 6. Confirm

Tell the user:
- The cache file is at `~/.config/moonpay/statusline-cache.txt`
- Run `moonpay-wallet-statusline-refresh` to manually update balances
- The agent-specific integration section below explains how to wire it into a status display

## Agent-specific integration

### Claude Code

Add this block to `~/.claude/statusline-command.sh` (before the render section):

```bash
# ── Wallet balances ──────────────────────────────────────────────────────────
wallet_str=""
wallet_cache="$HOME/.config/moonpay/statusline-cache.txt"
if [ -f "$wallet_cache" ]; then
  wallet_str=$(cat "$wallet_cache")
fi

if [ -n "$wallet_str" ]; then
  [ -n "$line3" ] && line3="${line3}${SEP}"
  line3="${line3}${wallet_str}"
fi
```

Optionally add a PostToolUse hook to `~/.claude/settings.json` to auto-refresh after fund-moving commands:

```json
{
  "matcher": "Bash",
  "hooks": [{
    "type": "command",
    "if": "Bash(mp token swap:*)|Bash(mp token send:*)|Bash(mp token bridge:*)|Bash(mp bitcoin send:*)|Bash(mp buy:*)",
    "command": "bash ~/.config/moonpay/refresh-statusline.sh 2>/dev/null || true",
    "async": true
  }]
}
```

### Other agents

Any agent with a terminal status display can read the cache file:

```bash
cat ~/.config/moonpay/statusline-cache.txt
```

The cache contains a pre-rendered ANSI string. For plain text (no colors), strip ANSI codes:

```bash
sed 's/\x1b\[[0-9;]*m//g' ~/.config/moonpay/statusline-cache.txt
```

## Error handling

| Error | Cause | Fix |
|-------|-------|-----|
| `mp: command not found` | CLI not installed | `npm i -g @moonpay/cli` |
| `jq: command not found` | jq not installed | Install via package manager |
| `failed to list wallets` | Not authenticated | Run `mp login` then `mp verify` |
| Empty cache after refresh | No balances on configured chains | Check config chains, verify wallet has funds |

## Related skills

- [moonpay-wallet-statusline-refresh](../moonpay-wallet-statusline-refresh/) — Manually refresh cached balances
- [moonpay-auth](../moonpay-auth/) — Set up wallets if none exist
- [moonpay-check-wallet](../moonpay-check-wallet/) — Detailed portfolio breakdown with allocation percentages
