---
name: moonpay-wallet-statusline-refresh
description: >
  Manually refresh wallet balances shown in a compatible CLI status line. Use
  when the user says "refresh balances", "update status bar", or after
  receiving funds from outside the CLI.
tags: [wallet, statusline]
---

# Refresh wallet status line

## Goal

Refresh the cached MoonPay wallet balances shown in a compatible CLI status line.

## Prerequisites

- MoonPay CLI installed: `npm i -g @moonpay/cli`
- Authenticated: `mp verify`
- Status line config exists: `~/.config/moonpay/statusline.json`
- Refresh script exists: `~/.config/moonpay/refresh-statusline.sh`

If the config or refresh script is missing, run the `moonpay-wallet-statusline` setup skill first.

## Commands

```bash
# Run the refresh script
bash ~/.config/moonpay/refresh-statusline.sh

# View cached output
cat ~/.config/moonpay/statusline-cache.txt

# Strip ANSI codes for plain text output
sed 's/\x1b\[[0-9;]*m//g' ~/.config/moonpay/statusline-cache.txt

# Check authentication if refresh fails
mp verify
```

## Workflow

1. Verify the setup files exist:
   - `~/.config/moonpay/statusline.json`
   - `~/.config/moonpay/refresh-statusline.sh`

2. Run the refresh command:

   ```bash
   bash ~/.config/moonpay/refresh-statusline.sh
   ```

3. If the cache file exists, show the user the refreshed value in plain text:

   ```bash
   sed 's/\x1b\[[0-9;]*m//g' ~/.config/moonpay/statusline-cache.txt
   ```

4. If the cache file does not exist after a successful refresh, tell the user no balances were found for the configured address-and-chain entries.

5. Only query the underlying `mp` balance commands directly if the user explicitly asks for a detailed balance breakdown. Otherwise, trust the configured refresh script as the source of truth for the status line.

6. Confirm that the cache was refreshed and remind the user that the target CLI may show the change on the next status line render or next session, depending on local setup.

## Error handling

| Error | Cause | Fix |
|-------|-------|-----|
| No config file | Setup not run | Run `moonpay-wallet-statusline` first |
| No refresh script | Setup not run | Run `moonpay-wallet-statusline` first |
| `mp verify` failed | Auth expired or missing | Run `mp login` then `mp verify` |
| Refresh exits successfully but cache is missing | No balances on configured entries | Check the configured addresses/chains and verify the wallet has funds |

## Related skills

- [moonpay-wallet-statusline](../moonpay-wallet-statusline/) — Initial setup for wallet status line
- [moonpay-check-wallet](../moonpay-check-wallet/) — Detailed portfolio breakdown with allocation percentages
