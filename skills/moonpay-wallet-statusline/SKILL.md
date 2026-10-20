---
name: moonpay-wallet-statusline
description: >
  Show MoonPay wallet balances in a compatible CLI status line using a local
  cache and refresh script. Use when the user asks to "show balances in the
  status bar", "add wallet to the CLI status line", or wants a persistent
  balance display while working.
tags: [wallet, statusline]
---

# Wallet status line

## Goal

Display cached MoonPay wallet balances in a compatible CLI status line. This skill creates:

- `~/.config/moonpay/statusline.json` — tracked wallets, chains, and format
- `~/.config/moonpay/refresh-statusline.sh` — refreshes balances from the MoonPay CLI
- `~/.config/moonpay/statusline-cache.json` — plain balance data
- `~/.config/moonpay/render-statusline.sh` — sanitizes data and applies local formatting

Compatible status displays call the renderer. Never print untrusted token metadata or the cache directly as terminal output.

## Prerequisites

- MoonPay CLI installed: `npm i -g @moonpay/cli`
- Authenticated: `mp login` then `mp verify`
- At least one wallet: `mp wallet list`
- `jq` installed: `which jq`
- For status line integration: the target CLI supports a command-based status line or any equivalent scriptable status bar

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
```

If the user wants integration with a specific CLI, verify that CLI's status line entry point too.

Examples:

```bash
# Claude Code
test -f ~/.claude/statusline.sh && echo "statusline script present"

# Cursor CLI
test -f ~/.cursor/statusline.sh && echo "cursor statusline script present"
```

If the target CLI does not yet have a status line configured, help the user set that up first, then come back to this skill.

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

This script fetches one address/chain at a time, preserves the previous JSON cache on an error, and atomically replaces it after every configured fetch succeeds. The cache contains data, never pre-rendered ANSI.

```bash
#!/usr/bin/env bash
set -euo pipefail

CONFIG="$HOME/.config/moonpay/statusline.json"
CACHE="$HOME/.config/moonpay/statusline-cache.json"
TMP_CACHE="$(mktemp "${CACHE}.tmp.XXXXXX")"
trap 'rm -f "$TMP_CACHE"' EXIT

command -v mp >/dev/null
command -v jq >/dev/null
[[ -f "$CONFIG" ]] || exit 1
FORMAT="$(jq -r '.format // "amount"' "$CONFIG")"
jq -e '.entries | type == "array" and all(.[];
  (.address | type == "string") and (.address | length > 0) and
  (.chain | type == "string") and (.chain | length > 0))' "$CONFIG" >/dev/null
ENTRIES='[]'

while IFS= read -r entry; do
  wallet_address="$(jq -r '.address // empty' <<<"$entry")"
  chain="$(jq -r '.chain // empty' <<<"$entry")"
  [[ -n "$wallet_address" && -n "$chain" ]] || {
    echo "invalid config entry: each item needs address and chain" >&2
    exit 1
  }

  if [[ "$chain" == "bitcoin" ]]; then
    data="$(mp --json bitcoin balance retrieve --wallet "$wallet_address")"
    next="$(jq -c '[select(((.total.btc | tonumber?) // 0) > 0)
      | {symbol: "₿", chain: "bitcoin", amount: (.total.btc | tostring), usd: null}]' <<<"$data")"
  else
    data="$(mp --json token balance list --wallet "$wallet_address" --chain "$chain")"
    next="$(jq -c --arg chain "$chain" '[
      (.items // . // [])[]
      | select(((.balance.amount | tonumber?) // 0) > 0)
      | {symbol: .symbol, chain: $chain, amount: .balance.amount, usd: .balance.value}
    ]' <<<"$data")"
  fi
  ENTRIES="$(jq -cn --argjson current "$ENTRIES" --argjson next "$next" '$current + $next')"
done < <(jq -c '.entries[]' "$CONFIG")

if [[ "$(jq 'length' <<<"$ENTRIES")" -eq 0 ]]; then
  rm -f "$CACHE"
  exit 0
fi

jq -an --arg format "$FORMAT" --argjson entries "$ENTRIES" \
  '{format: $format, entries: $entries}' > "$TMP_CACHE"
mv "$TMP_CACHE" "$CACHE"
```

Write `~/.config/moonpay/render-statusline.sh` and make it executable too. This is the only terminal-rendering path. It strips C0/C1 controls and backslashes from labels before applying locally controlled ANSI colors. Backslashes are removed so an existing status-line wrapper cannot reinterpret an upstream `\033` escape. Symbols are capped at 16 characters; amounts are accepted only as decimal data. Use `--plain` for displays without ANSI support.

```bash
#!/usr/bin/env bash
set -euo pipefail

CACHE="$HOME/.config/moonpay/statusline-cache.json"
[[ -f "$CACHE" ]] || exit 0
FORMAT="$(jq -r '.format // "amount"' "$CACHE")"
BOLD_CYAN=$'\033[1;36m'
WHITE=$'\033[0;37m'
DIM_GREEN=$'\033[2;32m'
DIM=$'\033[2m'
RESET=$'\033[0m'
if [[ "${1:-}" == "--plain" ]]; then
  BOLD_CYAN='' WHITE='' DIM_GREEN='' DIM='' RESET=''
fi

trim_number() {
  printf '%s' "$1" | sed -E 's/(\.[0-9]*[1-9])0+$/\1/; s/\.0+$//'
}
format_usd() { printf '$%.2f' "$1"; }

declare -a RENDERED=()
HAS_USD_TOTAL=0
USD_TOTAL="$(jq '[.entries[].usd | tonumber?] | add // 0' "$CACHE")"
while IFS=$'\t' read -r symbol chain amount usd_value; do
  amount_display="$(trim_number "$amount")"
  item="${BOLD_CYAN}${symbol}@${chain}${RESET} ${WHITE}${amount_display}${RESET}"
  if [[ "$usd_value" != "null" ]]; then
    HAS_USD_TOTAL=1
    if [[ "$FORMAT" == "amount+usd" || "$FORMAT" == "total+breakdown" ]]; then
      item="${item} ${DIM_GREEN}($(format_usd "$usd_value"))${RESET}"
    fi
  fi
  RENDERED+=("$item")
done < <(jq -r '
  def safe: tostring | explode
    | map(select(. >= 32 and (. < 127 or . > 159) and . != 92)) | implode;
  .entries[]
  | select(.symbol | type == "string")
  | select(.amount | tostring | test("^[0-9]+(\\.[0-9]+)?([eE][+-]?[0-9]+)?$"))
  | select((.amount | tonumber) > 0)
  | [(.symbol | safe | .[0:16]), (.chain | safe | .[0:32]),
     (.amount | tostring), ((.usd | tonumber?) // "null" | tostring)]
  | select(.[0] != "" and .[1] != "")
  | @tsv
' "$CACHE")

[[ ${#RENDERED[@]} -gt 0 ]] || exit 0
SEPARATOR="${DIM} | ${RESET}"
if [[ "$FORMAT" == "total+breakdown" && "$HAS_USD_TOTAL" -eq 1 ]]; then
  printf '%s%s' "${DIM_GREEN}$(format_usd "$USD_TOTAL")${RESET}" "$SEPARATOR"
fi
first=1
for item in "${RENDERED[@]}"; do
  [[ "$first" -eq 1 ]] || printf '%s' "$SEPARATOR"
  printf '%s' "$item"
  first=0
done
```

Update existing integrations to use this renderer, and remove the superseded ANSI cache after migration:

```bash
chmod +x ~/.config/moonpay/render-statusline.sh
rm -f ~/.config/moonpay/statusline-cache.txt
```

### 6. Run initial refresh

```bash
bash ~/.config/moonpay/refresh-statusline.sh
```

Verify the structured cache and its safe rendering:

```bash
jq . ~/.config/moonpay/statusline-cache.json
bash ~/.config/moonpay/render-statusline.sh --plain
```

### 7. Wire into a compatible CLI

Find the target CLI's status-line script and append the renderer's output to its existing line. Run `bash ~/.config/moonpay/render-statusline.sh` for colors or add `--plain` for a plain display. Keep the final output's format string local, for example `printf '%s\n' "$LINE3"`.

#### Claude Code example

Add this block to `~/.claude/statusline.sh` before the final render/output section. Match the surrounding script style if variable names differ.

```bash
# Wallet balances
WALLET_STR="$(bash "$HOME/.config/moonpay/render-statusline.sh")"

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

#### Cursor CLI example

Cursor CLI uses `~/.cursor/cli-config.json` with a `statusLine.command` entry that typically points at `~/.cursor/statusline.sh`. Add the same cache-read pattern to that script, for example:

```bash
WALLET_STR="$(bash "$HOME/.config/moonpay/render-statusline.sh")"

if [ -n "$WALLET_STR" ]; then
  [ -n "$LINE3" ] && LINE3="${LINE3}${SEP}"
  LINE3="${LINE3}${WALLET_STR}"
fi
```

If the user's script uses different variable names or a single-line layout, adapt the snippet to match the existing format.

#### Other CLIs

For any other CLI tool with a scriptable status line:

- locate the script or command used for the status line
- append the output of `bash ~/.config/moonpay/render-statusline.sh` (or its `--plain` variant)
- if the tool supports command hooks or post-command automation, wire `bash ~/.config/moonpay/refresh-statusline.sh` into that mechanism

### 8. Confirm

Tell the user:

- The data cache is `~/.config/moonpay/statusline-cache.json`; terminal output comes from `render-statusline.sh`
- Run `moonpay-wallet-statusline-refresh` to refresh manually
- Changes appear in the target CLI on the next status line render or next session, depending on local setup

## Other agents

Any agent with a terminal status display can call the same renderer:

```bash
bash ~/.config/moonpay/render-statusline.sh
# For plain text:
bash ~/.config/moonpay/render-statusline.sh --plain
```

## Error handling

| Error | Cause | Fix |
|-------|-------|-----|
| `mp: command not found` | MoonPay CLI not installed | `npm i -g @moonpay/cli` |
| `jq: command not found` | jq not installed | Install via package manager |
| `mp verify` failed | Not authenticated or expired auth | Run `mp login` then `mp verify` |
| Empty cache after refresh | No balances found on configured entries | Check configured addresses/chains and verify the wallet has funds |
| Status line does not update in the target CLI | CLI status line not set up yet or cache not wired in | Configure that CLI's status line first, then add the wallet cache block |

## Related skills

- [moonpay-wallet-statusline-refresh](../moonpay-wallet-statusline-refresh/) — Manually refresh cached balances
- [moonpay-auth](../moonpay-auth/) — Set up wallets if none exist
- [moonpay-check-wallet](../moonpay-check-wallet/) — Detailed portfolio breakdown with allocation percentages
