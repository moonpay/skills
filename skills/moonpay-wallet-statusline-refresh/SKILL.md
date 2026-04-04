---
name: moonpay-wallet-statusline-refresh
description: >
  Manually refresh wallet balances shown in the terminal status line. Use when
  the user says "refresh balances", "update status bar", or after receiving
  funds from outside the CLI.
tags: [wallet, statusline]
---

# Refresh wallet status line

## Goal

Refresh the cached wallet balances displayed in the terminal status line.

## Prerequisites

- MoonPay CLI installed: `npm i -g @moonpay/cli`
- Authenticated: `mp user retrieve`
- Status line configured: `~/.config/moonpay/statusline.json` exists (run `moonpay-wallet-statusline` to set up)

## Commands

```bash
# Run the refresh script
bash ~/.config/moonpay/refresh-statusline.sh

# View the cached output
cat ~/.config/moonpay/statusline-cache.txt

# View balances directly (for reporting to user)
mp bitcoin balance retrieve --wallet <btc-address>
mp token balance list --wallet <address> --chain <chain>
```

## Workflow

1. **Check config exists** — verify `~/.config/moonpay/statusline.json` exists. If not, tell the user to run the `moonpay-wallet-statusline` setup skill first.

2. **Check refresh script exists** — verify `~/.config/moonpay/refresh-statusline.sh` exists. If not, tell the user to run the `moonpay-wallet-statusline` setup skill first.

3. **Run refresh**:
   ```bash
   bash ~/.config/moonpay/refresh-statusline.sh
   ```

4. **Report balances** — read the config to find which wallets/chains are tracked, then run the underlying `mp` commands to show the user their current balances in a readable format:
   - For bitcoin: `mp bitcoin balance retrieve --wallet <addr>`
   - For other chains: `mp token balance list --wallet <addr> --chain <chain>`

5. **Confirm** — tell the user the status line cache has been updated.

## Error handling

| Error | Cause | Fix |
|-------|-------|-----|
| No config file | Setup not run | Run `moonpay-wallet-statusline` skill |
| No refresh script | Setup not run | Run `moonpay-wallet-statusline` skill |
| `mp` fetch failed | Auth expired or network issue | Run `mp user retrieve` to check, then `mp login` if needed |

## Related skills

- [moonpay-wallet-statusline](../moonpay-wallet-statusline/) — Initial setup for wallet status line
- [moonpay-check-wallet](../moonpay-check-wallet/) — Detailed portfolio breakdown with allocation percentages
