---
name: moonpay-trading-automation
description: Set up automated trading strategies — DCA, limit orders, and stop losses — by composing mp CLI commands with OS scheduling (cron/launchd).
tags: [trading, automation]
---

# Trading automation

## Goal

Compose `mp` CLI commands with OS scheduling (cron/launchd) to run unattended trading strategies: dollar-cost averaging, limit orders, and stop losses. The agent generates shell scripts and schedules them — no new tools needed.

## Prerequisites

- Authenticated: `mp user retrieve`
- Funded wallet: `mp token balance list --wallet <name> --chain <chain>`
- `mp` binary on PATH: `which mp` (note the full path for scheduled scripts)
- `jq` installed: `which jq`

## Shell script pattern

Every strategy uses the same base pattern. Scripts live in `~/.config/moonpay/scripts/` and log to `~/.config/moonpay/logs/trading.log`.

```bash
#!/bin/bash
set -euo pipefail

MP="$(which mp)"  # absolute path for cron/launchd
SCRIPT_NAME="dca-sol"
LOG="$HOME/.config/moonpay/logs/trading.log"
mkdir -p "$(dirname "$LOG")"

log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" >> "$LOG"; }

# --- Config (agent fills these in) ---
WALLET="main"
CHAIN="solana"
FROM_TOKEN="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"  # USDC
TO_TOKEN="So11111111111111111111111111111111111111111"         # SOL
AMOUNT=5

# --- Execute ---
LOCK_ROOT="$HOME/.config/moonpay/locks"
mkdir -p "$LOCK_ROOT"
LOCK_DIR="$LOCK_ROOT/${SCRIPT_NAME}.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  log "$SCRIPT_NAME: already running, skipping"
  exit 0
fi
trap 'rmdir "$LOCK_DIR"' EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

log "SWAP: $AMOUNT $FROM_TOKEN -> $TO_TOKEN on $CHAIN"
RESULT=$("$MP" --json token swap \
  --wallet "$WALLET" --chain "$CHAIN" \
  --from-token "$FROM_TOKEN" --from-amount "$AMOUNT" \
  --to-token "$TO_TOKEN" 2>&1) || {
  log "FAILED: $RESULT"
  exit 1
}
log "OK: $RESULT"
```

Key points:
- `mp --json` outputs single-line JSON, ideal for `jq` parsing
- Use `$(which mp)` and store as `MP` — cron/launchd have minimal PATH
- Wallet names only in scripts — `mp` handles keychain decryption at runtime
- If the user gives token names/symbols, resolve to addresses first with `mp token search`
- Give each installed strategy a unique, stable `SCRIPT_NAME` made of letters, digits and hyphens. Every scheduled or manual run of that strategy uses the same lock. Keep it held through price/balance checks, execution and self-disable. A leftover lock must be removed only after confirming no run is active and reconciling any submitted transaction; do not expire it automatically.

## DCA (Dollar-Cost Averaging)

"Buy $5 of SOL every day at 9am"

### Script: `~/.config/moonpay/scripts/dca-sol.sh`

Use the base pattern above with the user's token, amount, wallet, and chain.

### Schedule with cron (Linux)

```bash
# Buy $5 of SOL daily at 9am UTC — moonpay:dca-sol
0 9 * * * ~/.config/moonpay/scripts/dca-sol.sh
```

Add with: `(crontab -l 2>/dev/null; echo '0 9 * * * ~/.config/moonpay/scripts/dca-sol.sh # moonpay:dca-sol') | crontab -`

Common intervals:
- Every hour: `0 * * * *`
- Every 4 hours: `0 */4 * * *`
- Daily at 9am: `0 9 * * *`
- Weekly Monday 9am: `0 9 * * 1`

### Schedule with launchd (macOS)

Write a plist to `~/Library/LaunchAgents/com.moonpay.dca-sol.plist`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>com.moonpay.dca-sol</string>
  <key>ProgramArguments</key>
  <array>
    <string>/bin/bash</string>
    <string>/Users/USERNAME/.config/moonpay/scripts/dca-sol.sh</string>
  </array>
  <key>StartCalendarInterval</key>
  <dict>
    <key>Hour</key>
    <integer>9</integer>
    <key>Minute</key>
    <integer>0</integer>
  </dict>
  <key>StandardErrorPath</key>
  <string>/Users/USERNAME/.config/moonpay/logs/dca-sol.err</string>
</dict>
</plist>
```

Load with: `launchctl load ~/Library/LaunchAgents/com.moonpay.dca-sol.plist`

**Important:** Tilde (`~`) does NOT expand in plist files. Always use the full path (e.g., `/Users/USERNAME/...`). Get it with `echo $HOME`.

## Limit order

"Buy SOL when price drops below $80"

### Script: `~/.config/moonpay/scripts/limit-buy-sol.sh`

```bash
#!/bin/bash
set -euo pipefail

MP="$(which mp)"
LOG="$HOME/.config/moonpay/logs/trading.log"
mkdir -p "$(dirname "$LOG")"
log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" >> "$LOG"; }

# --- Config ---
WALLET="main"
CHAIN="solana"
TOKEN="So11111111111111111111111111111111111111111"
BUY_WITH="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"  # USDC
BUY_AMOUNT=50
TARGET_PRICE=80
SCRIPT_NAME="limit-buy-sol"

# --- One run at a time, including manual invocations ---
LOCK_ROOT="$HOME/.config/moonpay/locks"
mkdir -p "$LOCK_ROOT"
LOCK_DIR="$LOCK_ROOT/${SCRIPT_NAME}.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  log "$SCRIPT_NAME: already running, skipping"
  exit 0
fi
trap 'rmdir "$LOCK_DIR"' EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

# --- Check price ---
PRICE=$("$MP" --json token search --query "$TOKEN" --chain "$CHAIN" | jq -r '.items[0].marketData.price')

if [ -z "$PRICE" ] || [ "$PRICE" = "null" ]; then
  log "LIMIT $SCRIPT_NAME: price fetch failed, skipping"
  exit 0
fi

# --- Compare ---
if (( $(echo "$PRICE < $TARGET_PRICE" | bc -l) )); then
  log "LIMIT $SCRIPT_NAME: price $PRICE < $TARGET_PRICE — executing buy"
  RESULT=$("$MP" --json token swap \
    --wallet "$WALLET" --chain "$CHAIN" \
    --from-token "$BUY_WITH" --from-amount "$BUY_AMOUNT" \
    --to-token "$TOKEN" 2>&1) || {
    log "LIMIT $SCRIPT_NAME FAILED: $RESULT"
    exit 1
  }
  log "LIMIT $SCRIPT_NAME OK: bought at $PRICE — $RESULT"

  # Self-disable after fill
  if [[ "$OSTYPE" == "darwin"* ]]; then
    launchctl unload "$HOME/Library/LaunchAgents/com.moonpay.${SCRIPT_NAME}.plist" 2>/dev/null || true
  else
    { crontab -l 2>/dev/null || true; } \
      | awk -v tag="moonpay:${SCRIPT_NAME}" '$NF != tag' | crontab -
  fi
  log "LIMIT $SCRIPT_NAME: disabled after fill"
else
  log "LIMIT $SCRIPT_NAME: price $PRICE >= $TARGET_PRICE — waiting"
fi
```

Schedule every 5 minutes:
- Cron: `*/5 * * * * ~/.config/moonpay/scripts/limit-buy-sol.sh # moonpay:limit-buy-sol`
- Launchd: use `<key>StartInterval</key><integer>300</integer>` instead of `StartCalendarInterval`

## Stop loss

"Sell all my SOL if price drops below $70"

This complete variant holds the same strategy lock while checking price,
reading the sell balance, executing and removing its schedule:

```bash
#!/bin/bash
set -euo pipefail

MP="$(which mp)"
LOG="$HOME/.config/moonpay/logs/trading.log"
mkdir -p "$(dirname "$LOG")"
log() { echo "[$(date -u +%Y-%m-%dT%H:%M:%SZ)] $*" >> "$LOG"; }

# --- Config ---
WALLET="main"
CHAIN="solana"
SELL_TOKEN="So11111111111111111111111111111111111111111"   # SOL
TO_TOKEN="EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" # USDC
TRIGGER_PRICE=70
SCRIPT_NAME="stop-loss-sol"

LOCK_ROOT="$HOME/.config/moonpay/locks"
mkdir -p "$LOCK_ROOT"
LOCK_DIR="$LOCK_ROOT/${SCRIPT_NAME}.lock"
if ! mkdir "$LOCK_DIR" 2>/dev/null; then
  log "$SCRIPT_NAME: already running, skipping"
  exit 0
fi
trap 'rmdir "$LOCK_DIR"' EXIT
trap 'exit 129' HUP
trap 'exit 130' INT
trap 'exit 143' TERM

# --- Check price ---
PRICE=$("$MP" --json token search --query "$SELL_TOKEN" --chain "$CHAIN" | jq -r '.items[0].marketData.price')

if [ -z "$PRICE" ] || [ "$PRICE" = "null" ]; then
  log "STOP-LOSS $SCRIPT_NAME: price fetch failed, skipping"
  exit 0
fi

if (( $(echo "$PRICE < $TRIGGER_PRICE" | bc -l) )); then
  # Get current balance to sell all
  BALANCE=$("$MP" --json token balance list --wallet "$WALLET" --chain "$CHAIN" \
    | jq -r --arg addr "$SELL_TOKEN" '.items[] | select(.address == $addr) | .balance.amount')

  if [ -n "$BALANCE" ] && (( $(echo "$BALANCE > 0" | bc -l) )); then
    log "STOP-LOSS $SCRIPT_NAME: price $PRICE < $TRIGGER_PRICE — selling $BALANCE"
    RESULT=$("$MP" --json token swap \
      --wallet "$WALLET" --chain "$CHAIN" \
      --from-token "$SELL_TOKEN" --from-amount "$BALANCE" \
      --to-token "$TO_TOKEN" 2>&1) || {
      log "STOP-LOSS $SCRIPT_NAME FAILED: $RESULT"
      exit 1
    }
    log "STOP-LOSS $SCRIPT_NAME OK: sold at $PRICE — $RESULT"
    if [[ "$OSTYPE" == "darwin"* ]]; then
      launchctl unload "$HOME/Library/LaunchAgents/com.moonpay.${SCRIPT_NAME}.plist" 2>/dev/null || true
    else
      { crontab -l 2>/dev/null || true; } \
        | awk -v tag="moonpay:${SCRIPT_NAME}" '$NF != tag' | crontab -
    fi
    log "STOP-LOSS $SCRIPT_NAME: disabled after fill"
  fi
fi
```

## Managing automations

### List active automations

```bash
# macOS
launchctl list | grep moonpay

# Linux
crontab -l | grep moonpay
```

### Remove an automation

```bash
# macOS
launchctl unload ~/Library/LaunchAgents/com.moonpay.dca-sol.plist
rm ~/Library/LaunchAgents/com.moonpay.dca-sol.plist

# Linux
crontab -l | grep -v "moonpay:dca-sol" | crontab -
```

### View logs

```bash
tail -50 ~/.config/moonpay/logs/trading.log
```

### Pause / resume (macOS only)

```bash
launchctl unload ~/Library/LaunchAgents/com.moonpay.dca-sol.plist   # pause
launchctl load ~/Library/LaunchAgents/com.moonpay.dca-sol.plist     # resume
```

## Platform detection

Detect the OS and use the appropriate scheduler:

```bash
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS: use launchd (fires even if machine was asleep)
else
  # Linux: use crontab
fi
```

## Tips

- Start with a small DCA amount to verify the setup works before going bigger
- Check logs after the first run: `tail -20 ~/.config/moonpay/logs/trading.log`
- Scripts don't contain secrets — `mp` decrypts wallets via OS keychain at runtime
- The machine must be logged in (user session active) for keychain access to work
- Price checks via `mp token search` are free; swaps cost gas
- Limit order checks every 5 minutes is reasonable — don't go below 1 minute
- Use `bc -l` for decimal price comparison (bash can't compare floats natively)
- If `bc` isn't available, use: `awk "BEGIN {exit !($PRICE < $TARGET)}"`
- Always tag cron entries with `# moonpay:{name}` so they can be found and removed

## Related skills

- **moonpay-swap-tokens** — Swap and bridge command syntax
- **moonpay-check-wallet** — Check balances before setting up automation
- **moonpay-discover-tokens** — Research tokens and resolve addresses
- **moonpay-price-alerts** — Observe-only price notifications (no trading)
