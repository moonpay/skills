---
name: moonpay-wallet-statusline
description: >
  Show MoonPay wallet balances in the Claude Code status line using a local
  cache and refresh script. Use when the user asks to "show balances in the
  status bar", "add wallet to Claude status line", or wants a persistent
  balance display while working.
tags: [wallet, statusline]
---

# Wallet status line

## Goal

Display cached MoonPay wallet balances in the Claude Code status line. This skill creates:

- `~/.config/moonpay/statusline.json` — tracked wallets, chains, and format
- `~/.config/moonpay/refresh-statusline.sh` — refreshes balances from the MoonPay CLI
- `~/.config/moonpay/statusline-cache.txt` — pre-rendered ANSI output for the status line

Any other status display can also read the cache file directly.

## Prerequisites

- MoonPay CLI installed: `npm i -g @moonpay/cli`
- Authenticated: `mp login` then `mp verify`
- At least one wallet: `mp wallet list`
- `jq` installed: `which jq`
- `bc` installed: `which bc`
- For Claude Code: the built-in status line setup has already been run, so `~/.claude/settings.json` has a `statusLine` config and `~/.claude/statusline.sh` exists

## Commands

```bash
# List wallets
mp wallet list
mp --json wallet list

# Fetch balances (used by the refresh script)
mp --json bitcoin balance retrieve --wallet <btc-address>
mp --json token balance list --wallet <address> --chain <chain>

# Refresh the status line cache
bash ~/.config/moonpay/refresh-statusline.sh
```

## Supported chains

`solana`, `ethereum`, `base`, `polygon`, `arbitrum`, `optimism`, `bnb`, `avalanche`, `tron`, `bitcoin`, `ton`, `filecoin`

Bitcoin uses a separate command (`mp bitcoin balance retrieve`) and does not return USD values, so it is excluded from USD totals.

## Workflow

### 1. Verify prerequisites

Run:

```bash
mp verify
mp wallet list
which jq
which bc
```

If the user wants Claude Code integration, also verify:

```bash
test -f ~/.claude/statusline.sh && echo "statusline script present"
```

If `~/.claude/statusline.sh` is missing or Claude Code is not configured with a `statusLine`, tell the user to run the built-in `/statusline` command first, or configure `statusLine` manually in `~/.claude/settings.json`, then come back to this skill.

### 2. Select wallet addresses and chains

Run `mp wallet list` and ask the user which wallet address(es) to track. Create one config entry per address and per chain.

Skip testnets/devnets by default. Exclude chains containing:

- `testnet`
- `devnet`
- `sepolia`
- `amoy`
- `tempo`

### 3. Select display format

- `amount` — symbol + balance (example: `BTC 0.00071`)
- `amount+usd` — symbol + balance + USD when available (example: `mpSOL 0.00092 ($0.08)`)
- `total+breakdown` — total USD first, then token breakdown (example: `$12.48 | SOL 0.03 ($4.55) | USDC 7.93 ($7.93)`)

If the same symbol appears on multiple chains, keep separate entries rather than merging them.

### 4. Write config

Create the config directory if needed:

```bash
mkdir -p ~/.config/moonpay
```

Write `~/.config/moonpay/statusline.json`. Each entry must represent exactly one wallet address on exactly one chain. Prefer storing the resolved address directly instead of a wallet name.

```json
{
  "entries": [
    {
      "label": "btc-wallet",
      "address": "bc1qexample...",
      "chain": "bitcoin"
    },
    {
      "label": "base-wallet",
      "address": "0x1234...abcd",
      "chain": "base"
    },
    {
      "label": "sol-wallet",
      "address": "So1anaExamplePubkey...",
      "chain": "solana"
    }
  ],
  "format": "amount+usd"
}
```

### 5. Create refresh script

Write `~/.config/moonpay/refresh-statusline.sh`, then make it executable with `chmod +x ~/.config/moonpay/refresh-statusline.sh`.

This script:

1. Reads `~/.config/moonpay/statusline.json`
2. Validates that each config entry has one `address` and one `chain`
3. Fetches balances per configured address and chain
4. Aborts on any configured fetch error, preserving the previous cache
5. Formats ANSI-colored output for the status line
6. Writes the cache atomically
7. Deletes the cache if no balances are found

```bash
#!/usr/bin/env bash
set -euo pipefail

CONFIG="$HOME/.config/moonpay/statusline.json"
CACHE="$HOME/.config/moonpay/statusline-cache.txt"
TMP_CACHE="$(mktemp "${CACHE}.tmp.XXXXXX")"

BOLD_CYAN=$'\033[1;36m'
WHITE=$'\033[0;37m'
DIM_GREEN=$'\033[2;32m'
DIM=$'\033[2m'
RESET=$'\033[0m'

cleanup() {
  rm -f "$TMP_CACHE"
}
trap cleanup EXIT

require_bin() {
  command -v "$1" >/dev/null 2>&1 || {
    echo "missing dependency: $1" >&2
    exit 1
  }
}

trim_number() {
  printf "%s" "$1" | sed -E 's/(\.[0-9]*[1-9])0+$/\1/; s/\.0+$//'
}

format_usd() {
  printf '$%.2f' "${1:-0}"
}

join_by() {
  local separator="$1"
  shift
  local first=1
  for item in "$@"; do
    if [[ $first -eq 1 ]]; then
      printf "%s" "$item"
      first=0
    else
      printf "%s%s" "$separator" "$item"
    fi
  done
}

require_bin mp
require_bin jq
require_bin bc

[[ -f "$CONFIG" ]] || exit 1

FORMAT="$(jq -r '.format // "amount"' "$CONFIG")"
ENTRY_COUNT="$(jq '.entries | length' "$CONFIG")"
[[ "$ENTRY_COUNT" -gt 0 ]] || {
  rm -f "$CACHE"
  exit 0
}

declare -a RENDERED=()
USD_TOTAL="0"
HAS_USD_TOTAL=0

while IFS= read -r entry; do
  entry_label="$(jq -r '.label // empty' <<<"$entry")"
  wallet_address="$(jq -r '.address // empty' <<<"$entry")"
  chain="$(jq -r '.chain // empty' <<<"$entry")"

  [[ -n "$wallet_address" && -n "$chain" ]] || {
    echo "invalid config entry: each item needs address and chain" >&2
    exit 1
  }

  if [[ "$chain" == "bitcoin" ]]; then
    if ! btc_json="$(mp --json bitcoin balance retrieve --wallet "$wallet_address" 2>/dev/null)"; then
      echo "failed to fetch bitcoin balance for ${entry_label:-$wallet_address}" >&2
      exit 1
    fi

    btc_amount="$(jq -r '.total.btc // empty' <<<"$btc_json")"
    [[ -n "$btc_amount" && "$btc_amount" != "0" ]] || continue

    amount_display="$(trim_number "$btc_amount")"
    RENDERED+=("${BOLD_CYAN}₿@bitcoin${RESET} ${WHITE}${amount_display}${RESET}")
    continue
  fi

  if ! token_json="$(mp --json token balance list --wallet "$wallet_address" --chain "$chain" 2>/dev/null)"; then
    echo "failed to fetch token balances for ${entry_label:-$wallet_address} on ${chain}" >&2
    exit 1
  fi

  while IFS= read -r token_entry; do
    symbol="$(jq -r '.symbol // empty' <<<"$token_entry")"
    amount="$(jq -r '.balance.amount // empty' <<<"$token_entry")"
    usd_value="$(jq -r '.balance.value // empty' <<<"$token_entry")"

    [[ -n "$symbol" && -n "$amount" ]] || continue
    amount_display="$(trim_number "$amount")"
    token_label="${symbol}@${chain}"

    if [[ -n "$usd_value" && "$usd_value" != "null" ]]; then
      USD_TOTAL="$(echo "$USD_TOTAL + $usd_value" | bc -l)"
      HAS_USD_TOTAL=1
    fi

    case "$FORMAT" in
      amount)
        RENDERED+=("${BOLD_CYAN}${token_label}${RESET} ${WHITE}${amount_display}${RESET}")
        ;;
      amount+usd)
        if [[ -n "$usd_value" && "$usd_value" != "null" ]]; then
          RENDERED+=("${BOLD_CYAN}${token_label}${RESET} ${WHITE}${amount_display}${RESET} ${DIM_GREEN}($(format_usd "$usd_value"))${RESET}")
        else
          RENDERED+=("${BOLD_CYAN}${token_label}${RESET} ${WHITE}${amount_display}${RESET}")
        fi
        ;;
      total+breakdown)
        if [[ -n "$usd_value" && "$usd_value" != "null" ]]; then
          RENDERED+=("${BOLD_CYAN}${token_label}${RESET} ${WHITE}${amount_display}${RESET} ${DIM_GREEN}($(format_usd "$usd_value"))${RESET}")
        else
          RENDERED+=("${BOLD_CYAN}${token_label}${RESET} ${WHITE}${amount_display}${RESET}")
        fi
        ;;
      *)
        RENDERED+=("${BOLD_CYAN}${token_label}${RESET} ${WHITE}${amount_display}${RESET}")
        ;;
    esac
  done < <(
    jq -c '
      (.items // . // [])[]
      | select(((.balance.amount // "0") | tonumber? // 0) > 0)
    ' <<<"$token_json"
  )
done < <(jq -c '.entries[]' "$CONFIG")

if [[ ${#RENDERED[@]} -eq 0 ]]; then
  rm -f "$CACHE"
  exit 0
fi

SEPARATOR="${DIM} | ${RESET}"
TOKENS_LINE="$(join_by "$SEPARATOR" "${RENDERED[@]}")"

if [[ "$FORMAT" == "total+breakdown" && "$HAS_USD_TOTAL" -eq 1 ]]; then
  printf "%s%s%s" "${DIM_GREEN}$(format_usd "$USD_TOTAL")${RESET}" "$SEPARATOR" "$TOKENS_LINE" >"$TMP_CACHE"
else
  printf "%s" "$TOKENS_LINE" >"$TMP_CACHE"
fi

mv "$TMP_CACHE" "$CACHE"
```

### 6. Run initial refresh

```bash
bash ~/.config/moonpay/refresh-statusline.sh
```

Verify the cache file:

```bash
cat ~/.config/moonpay/statusline-cache.txt
```

For plain text:

```bash
sed 's/\x1b\[[0-9;]*m//g' ~/.config/moonpay/statusline-cache.txt
```

### 7. Wire into Claude Code

Add this block to `~/.claude/statusline.sh` before the final render/output section. Match the surrounding script style if variable names differ.

```bash
# Wallet balances
WALLET_CACHE="$HOME/.config/moonpay/statusline-cache.txt"
WALLET_STR=""
if [ -f "$WALLET_CACHE" ]; then
  WALLET_STR="$(cat "$WALLET_CACHE")"
fi

if [ -n "$WALLET_STR" ]; then
  [ -n "$LINE3" ] && LINE3="${LINE3}${SEP}"
  LINE3="${LINE3}${WALLET_STR}"
fi
```

Optional on Claude Code v2.1.85+: add a `PostToolUse` hook to `~/.claude/settings.json` so balance-moving MoonPay commands refresh the cache automatically.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Bash",
        "hooks": [
          {
            "type": "command",
            "if": "Bash(mp token swap:*)",
            "command": "bash ~/.config/moonpay/refresh-statusline.sh 2>/dev/null || true",
            "async": true
          },
          {
            "type": "command",
            "if": "Bash(mp token send:*)",
            "command": "bash ~/.config/moonpay/refresh-statusline.sh 2>/dev/null || true",
            "async": true
          },
          {
            "type": "command",
            "if": "Bash(mp token bridge:*)",
            "command": "bash ~/.config/moonpay/refresh-statusline.sh 2>/dev/null || true",
            "async": true
          },
          {
            "type": "command",
            "if": "Bash(mp bitcoin send:*)",
            "command": "bash ~/.config/moonpay/refresh-statusline.sh 2>/dev/null || true",
            "async": true
          },
          {
            "type": "command",
            "if": "Bash(mp buy:*)",
            "command": "bash ~/.config/moonpay/refresh-statusline.sh 2>/dev/null || true",
            "async": true
          }
        ]
      }
    ]
  }
}
```

### 8. Confirm

Tell the user:

- The cache file is `~/.config/moonpay/statusline-cache.txt`
- Run `moonpay-wallet-statusline-refresh` to refresh manually
- Changes appear in Claude Code on the next status line render or next session, depending on local setup

## Other agents

Any agent with a terminal status display can read the cache file directly:

```bash
cat ~/.config/moonpay/statusline-cache.txt
```

If the target status display does not support ANSI colors, strip ANSI codes first:

```bash
sed 's/\x1b\[[0-9;]*m//g' ~/.config/moonpay/statusline-cache.txt
```

## Error handling

| Error | Cause | Fix |
|-------|-------|-----|
| `mp: command not found` | MoonPay CLI not installed | `npm i -g @moonpay/cli` |
| `jq: command not found` | jq not installed | Install via package manager |
| `bc: command not found` | bc not installed | Install via package manager |
| `mp verify` failed | Not authenticated or expired auth | Run `mp login` then `mp verify` |
| Empty cache after refresh | No balances found on configured entries | Check configured addresses/chains and verify the wallet has funds |
| Claude status line does not update | Claude status line not set up yet | Run built-in `/statusline`, then add the wallet cache block |

## Related skills

- [moonpay-wallet-statusline-refresh](../moonpay-wallet-statusline-refresh/) — Manually refresh cached balances
- [moonpay-auth](../moonpay-auth/) — Set up wallets if none exist
- [moonpay-check-wallet](../moonpay-check-wallet/) — Detailed portfolio breakdown with allocation percentages
