---
name: moonpay-discord
description: Deploy the MoonPay CLI as a Discord bot using Hermes Agent gateway. Use when the user wants to check prices, swap tokens, or manage wallets from a Discord server or DM.
tags: [gateway, messaging, automation]
---

# MoonPay on Discord

Deploy a Discord bot powered by the MoonPay CLI. The bot responds in DMs and in any channel it's mentioned in.

## Prerequisites

- MoonPay CLI authenticated: `mp user retrieve`
- Python 3.11+: `python3 --version`
- Hermes Agent installed (see below)
- A Discord bot token (from Discord Developer Portal)

## Install Hermes Agent

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc   # or source ~/.zshrc
hermes --version
```

## Create a Discord bot

1. Go to [discord.com/developers/applications](https://discord.com/developers/applications) → **New Application**
2. Name it (e.g. `MoonPay Agent`) → Create
3. Left sidebar → **Bot** → **Reset Token** → copy the token
4. Under **Privileged Gateway Intents**, enable:
   - **Message Content Intent** (required to read messages)
   - **Server Members Intent** (optional)
5. Left sidebar → **OAuth2 → URL Generator**:
   - Scopes: `bot`
   - Bot permissions: `Send Messages`, `Read Message History`, `View Channels`
6. Copy the generated URL → open in browser → add bot to your server

## Configure Hermes

```bash
# Write the bot token
hermes config set gateway.discord.bot_token YOUR_DISCORD_BOT_TOKEN

# Optional: restrict to specific Discord user IDs
hermes config set gateway.discord.allowed_users 123456789012345678

# Or via environment variables
echo 'DISCORD_BOT_TOKEN=YOUR_DISCORD_BOT_TOKEN' >> ~/.hermes/.env
echo 'DISCORD_ALLOWED_USERS=123456789012345678' >> ~/.hermes/.env
```

To get your Discord user ID: Discord → Settings → Advanced → enable **Developer Mode** → right-click your name → **Copy User ID**.

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
- Keep replies under 2000 characters (Discord message limit)
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

In Discord, DM the bot or @mention it in a channel:
```
@MoonPayAgent what are my wallets?
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
| `discord.errors.LoginFailure` | Bad bot token | Regenerate token in Developer Portal |
| Bot doesn't read messages | Missing Message Content Intent | Enable it in Developer Portal → Bot → Intents |
| `mp: command not found` | PATH not set in service | Add `MP_PATH=$(which mp)` to `~/.hermes/.env` |
| Bot only responds in DMs | Missing channel permissions | Re-invite with correct OAuth2 permissions |

## Related skills

- [moonpay-auth](../moonpay-auth/) — authenticate the MoonPay CLI
- [moonpay-telegram](../moonpay-telegram/) — same setup for Telegram
- [moonpay-slack](../moonpay-slack/) — same setup for Slack
- [moonpay-swap-tokens](../moonpay-swap-tokens/) — swap command reference
