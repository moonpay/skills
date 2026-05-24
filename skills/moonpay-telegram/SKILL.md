---
name: moonpay-telegram
description: Deploy the MoonPay CLI as a persistent Telegram bot using Hermes Agent gateway. Use when the user wants to control wallets, swap tokens, check prices, or run prediction markets from Telegram.
tags: [gateway, messaging, automation]
---

# MoonPay on Telegram

Deploy a Telegram bot powered by the MoonPay CLI. Once running, any message to the bot executes MoonPay operations on the user's behalf.

## Prerequisites

- MoonPay CLI authenticated: `mp user retrieve`
- Python 3.11+: `python3 --version`
- Hermes Agent installed (see below)
- A Telegram bot token from [@BotFather](https://t.me/BotFather)

## Install Hermes Agent

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc   # or source ~/.zshrc
hermes --version
```

## Create a Telegram bot

1. Open Telegram → search **@BotFather** → `/newbot`
2. Follow prompts: choose a name (e.g. `MoonPay Agent`) and username (e.g. `moonpay_agent_bot`)
3. Copy the token: `7123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxx`

To restrict access to yourself only, get your Telegram user ID:
- Message [@userinfobot](https://t.me/userinfobot) → it replies with your numeric ID

## Configure Hermes

```bash
# Write the bot token to Hermes config
hermes config set gateway.telegram.bot_token 7123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: restrict to your Telegram user ID only (recommended)
hermes config set gateway.telegram.allowed_users 123456789

# Or use environment variables
echo 'TELEGRAM_BOT_TOKEN=7123456789:AAFxxxxxxxxxxxxxxxxxxxxxxxxxxxx' >> ~/.hermes/.env
echo 'TELEGRAM_ALLOWED_USERS=123456789' >> ~/.hermes/.env
```

## Add MoonPay context

Create a context file so the agent knows to use the MoonPay CLI:

```bash
mkdir -p ~/.hermes
cat > ~/.hermes/CONTEXT.md << 'EOF'
# MoonPay Agent

You are a crypto-native AI assistant powered by the MoonPay CLI (`mp`).

## Rules
- Prices, balances, trending tokens → always call `mp` — never guess
- Swaps require confirmation: quote first, then execute only if user says yes
- Wallet keys never leave the machine; all signing is local

## Key commands
- `mp wallet list` — list wallets
- `mp token balance list --wallet <name> --chain <chain>` — portfolio
- `mp token search --query <symbol> --chain solana` — find a token
- `mp token swap --wallet <name> --chain <chain> --from-token <addr> --from-amount <n> --to-token <addr>` — swap
- `mp token trending list --chain solana --limit 5` — trending tokens
- `mp prediction-market market trending list --provider polymarket --limit 5` — prediction markets
- `mp buy --token sol --amount 1 --wallet <name> --email <email>` — fiat buy link

## Format
- Keep replies short — Telegram messages, not essays
- Numbers: commas for thousands, up to 6 decimals for small tokens
- Prediction market prices as cents (65¢ = 65% implied probability)
EOF
```

## Start the gateway

```bash
# Foreground (test first)
hermes gateway

# Background as a persistent service
hermes gateway install   # registers as systemd/launchd service
hermes gateway start     # starts the service
hermes gateway status    # confirm it's running
```

## Verify

Send your bot a message on Telegram:
```
what are my wallets?
```

Expected: the agent calls `mp wallet list` and replies with your wallet names and addresses.

## Logs

```bash
# Live logs
tail -f ~/.hermes/logs/agent.log

# Gateway-specific errors
tail -f ~/.hermes/logs/errors.log
```

## Webhook mode (cloud deployments)

For Fly.io, Railway, or any server with a public URL — webhook is more reliable than polling:

```bash
echo 'TELEGRAM_WEBHOOK_URL=https://your-app.fly.dev/telegram' >> ~/.hermes/.env
echo 'TELEGRAM_WEBHOOK_PORT=8443' >> ~/.hermes/.env
echo 'TELEGRAM_WEBHOOK_SECRET=your-random-secret' >> ~/.hermes/.env
hermes gateway start
```

## Error handling

| Error | Cause | Fix |
|-------|-------|-----|
| `Conflict: terminated by other getUpdates request` | Two gateway instances running | `hermes gateway stop` then restart |
| `Unauthorized` | Bad bot token | Re-run BotFather, copy token again |
| `mp: command not found` | PATH not set in service | Add `MP_PATH` to `~/.hermes/.env`: `MP_PATH=$(which mp)` |
| Agent doesn't respond | Allowed-users mismatch | Check `TELEGRAM_ALLOWED_USERS` matches your user ID |

## Related skills

- [moonpay-auth](../moonpay-auth/) — authenticate the MoonPay CLI
- [moonpay-discord](../moonpay-discord/) — same setup for Discord
- [moonpay-swap-tokens](../moonpay-swap-tokens/) — swap command reference
- [moonpay-trading-automation](../moonpay-trading-automation/) — scheduled DCA and alerts
