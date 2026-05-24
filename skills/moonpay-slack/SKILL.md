---
name: moonpay-slack
description: Deploy the MoonPay CLI as a Slack bot using Hermes Agent gateway. Use when the user wants to check crypto prices, swap tokens, or manage wallets from Slack.
tags: [gateway, messaging, automation]
---

# MoonPay on Slack

Deploy a Slack bot powered by the MoonPay CLI. Uses Socket Mode — no public URL required.

## Prerequisites

- MoonPay CLI authenticated: `mp user retrieve`
- Python 3.11+: `python3 --version`
- Hermes Agent installed (see below)
- A Slack workspace where you can install apps

## Install Hermes Agent

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc   # or source ~/.zshrc
hermes --version
```

## Create a Slack app

1. Go to [api.slack.com/apps](https://api.slack.com/apps) → **Create New App** → **From scratch**
2. Name it (e.g. `MoonPay Agent`), pick your workspace → Create

### Enable Socket Mode (no public URL needed)

3. Left sidebar → **Socket Mode** → toggle **Enable Socket Mode** → ON
4. Generate an **App-Level Token**: name it `hermes`, scope `connections:write` → copy the `xapp-...` token

### Set OAuth scopes

5. Left sidebar → **OAuth & Permissions** → **Bot Token Scopes** → Add:
   - `chat:write` — send messages
   - `im:history` — read DMs
   - `im:read` — receive DM events
   - `app_mentions:read` — receive @mentions (optional, for channel use)

### Enable events

6. Left sidebar → **Event Subscriptions** → toggle ON
7. Under **Subscribe to bot events**, add:
   - `message.im` — DMs
   - `app_mention` — @mentions (optional)

### Install the app

8. Left sidebar → **Install App** → **Install to Workspace** → Allow
9. Copy the **Bot User OAuth Token** (`xoxb-...`)

## Configure Hermes

```bash
echo 'SLACK_BOT_TOKEN=xoxb-your-bot-token' >> ~/.hermes/.env
echo 'SLACK_APP_TOKEN=xapp-your-app-token' >> ~/.hermes/.env

# Optional: restrict to specific Slack user IDs
echo 'SLACK_ALLOWED_USERS=U01234567' >> ~/.hermes/.env
```

To get your Slack user ID: Slack → click your profile → **More** → **Copy member ID**.

## Add MoonPay context

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
- Keep replies concise — Slack messages, not essays
- Numbers: commas for thousands, up to 6 decimals for small tokens
- Prediction market prices as cents (65¢ = 65% implied probability)
EOF
```

## Start the gateway

```bash
# Foreground (test first)
hermes gateway

# Background as a persistent service
hermes gateway install
hermes gateway start
hermes gateway status
```

## Verify

DM the bot in Slack:
```
what are my wallets?
```

Expected: the agent calls `mp wallet list` and replies with your wallet names and addresses.

## Logs

```bash
tail -f ~/.hermes/logs/agent.log
tail -f ~/.hermes/logs/errors.log
```

## Error handling

| Error | Cause | Fix |
|-------|-------|-----|
| `invalid_auth` | Bad bot token | Reinstall the app, copy fresh `xoxb-` token |
| `AppNotConnected` | Missing `xapp-` token or Socket Mode off | Check `SLACK_APP_TOKEN` and Socket Mode toggle |
| Bot doesn't receive DMs | Missing `im:history` scope | Add scope → reinstall app |
| `mp: command not found` | PATH not set in service | Add `MP_PATH=$(which mp)` to `~/.hermes/.env` |

## Related skills

- [moonpay-auth](../moonpay-auth/) — authenticate the MoonPay CLI
- [moonpay-telegram](../moonpay-telegram/) — same setup for Telegram
- [moonpay-discord](../moonpay-discord/) — same setup for Discord
- [moonpay-swap-tokens](../moonpay-swap-tokens/) — swap command reference
