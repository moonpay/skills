---
name: moonpay-whatsapp
description: Deploy the MoonPay CLI as a WhatsApp bot using Hermes Agent gateway. Use when the user wants to check crypto prices, swap tokens, or manage wallets directly from WhatsApp.
tags: [gateway, messaging, automation]
---

# MoonPay on WhatsApp

Deploy a WhatsApp bot powered by the MoonPay CLI. Hermes uses a built-in Baileys bridge — no Meta Business API or paid tier required. You pair via QR code, just like WhatsApp Web.

## Prerequisites

- MoonPay CLI authenticated: `mp user retrieve`
- Python 3.11+: `python3 --version`
- Hermes Agent installed (see below)
- A WhatsApp account (personal number)
- Node.js 20+: `node --version` (required by the Baileys bridge)

## Install Hermes Agent

```bash
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
source ~/.bashrc   # or source ~/.zshrc
hermes --version
```

## Pair via QR code

Hermes includes an interactive setup wizard that installs the Baileys bridge and pairs your WhatsApp account:

```bash
hermes whatsapp
```

The wizard will:
1. Install the Baileys bridge (`npm install` in a local directory)
2. Display a QR code in the terminal
3. On your phone: **WhatsApp → Linked Devices → Link a Device** → scan the QR code
4. Confirm pairing — the session is saved to `~/.hermes/whatsapp/`

Once paired, the bridge runs as a background process that Hermes connects to.

## Configure access control

```bash
# Restrict to your own WhatsApp number (recommended)
# Format: country code + number, no + or spaces
echo 'WHATSAPP_ENABLED=true' >> ~/.hermes/.env
echo 'WHATSAPP_ALLOWED_USERS=15551234567' >> ~/.hermes/.env
```

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
- Short replies — WhatsApp messages, not essays
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

Message yourself on WhatsApp (the paired number):
```
what are my wallets?
```

Expected: the agent calls `mp wallet list` and replies with your wallet names and addresses. Responses are prefixed with `⚕ Hermes Agent` to distinguish them from your own messages.

## Logs

```bash
tail -f ~/.hermes/logs/agent.log
tail -f ~/.hermes/logs/errors.log
```

## Re-pairing

If the session expires or you get `Connection Closed` errors:

```bash
hermes gateway stop
rm -rf ~/.hermes/whatsapp/
hermes whatsapp   # scan QR again
hermes gateway start
```

## Error handling

| Error | Cause | Fix |
|-------|-------|-----|
| `Connection Closed` | WhatsApp session expired | Re-pair with `hermes whatsapp` |
| QR code not displaying | Terminal too narrow | Expand terminal window to at least 80 columns |
| `mp: command not found` | PATH not set in service | Add `MP_PATH=$(which mp)` to `~/.hermes/.env` |
| Agent replies to wrong chats | `WHATSAPP_ALLOWED_USERS` not set | Add your number (digits only, no `+`) |
| Node.js not found | Bridge dependency missing | Install Node.js 20+: `nvm install 20` |

## Note on Terms of Service

Baileys uses WhatsApp Web's unofficial API. This works reliably for personal use but is technically against WhatsApp's ToS. For production or business use, consider the official [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp/).

## Related skills

- [moonpay-auth](../moonpay-auth/) — authenticate the MoonPay CLI
- [moonpay-telegram](../moonpay-telegram/) — same setup for Telegram (official API)
- [moonpay-discord](../moonpay-discord/) — same setup for Discord
- [moonpay-swap-tokens](../moonpay-swap-tokens/) — swap command reference
