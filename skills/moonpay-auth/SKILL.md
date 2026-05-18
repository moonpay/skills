---
name: moonpay-auth
description: Set up the MoonPay CLI, authenticate, and manage local wallets. Use when commands fail, for login, or to create/import wallets.
tags: [setup]
---

# MoonPay auth and setup

## Install

```bash
npm i -g @moonpay/cli
```

This installs the `mp` (and `moonpay`) binary globally.

## Verify installation

```bash
mp --version
mp --help
```

## Auth commands

```bash
# Log in — returns a URL. Open it yourself if you can, otherwise share it with the user verbatim; opening it triggers the OTP code email.
mp login --email user@example.com

# Verify OTP code (user pastes it back from their email)
mp verify --email user@example.com --code 123456

# Check current user
mp user retrieve

# Log out
mp logout
```

`mp login` returns a URL. If you can open it yourself (e.g., browser access or a programmatic fetch), do that — it triggers the OTP email send. Otherwise, post the URL back to the user verbatim (don't paraphrase or strip query parameters) and let them open it. Either way the OTP lands in the user's email; they paste the code back, and you run `mp verify`.

## Before logging in (REQUIRED)

Never call `mp login` blindly. Every login attempt must be preceded by a session check:

1. Run `mp user retrieve` first.
2. **If it succeeds**, a session already exists. Tell the user which account is signed in and ask whether to switch:
   > "You're currently signed in as `<email>`. Log out and sign in as a different user? Reply YES to switch."

   Only on an explicit affirmative, run `mp logout` and then proceed with `mp login`. If the user declines or says anything ambiguous, treat the existing session as the one to use and skip the login.
3. **If it fails** (no session), proceed with `mp login` as normal.

This matters because on a chat channel the user cannot see which account a command runs against. Without the confirmation step, an agent on a shared host can silently switch identities — and a "what's my balance" query returns someone else's portfolio. The check is one extra command; the alternative is a privacy incident.

## Local wallet management

The CLI manages local wallets stored encrypted in `~/.config/moonpay/wallets.json`. Private keys are encrypted with AES-256-GCM using a random key stored in your OS keychain. No password required — keys never leave the machine.

```bash
# Create a new HD wallet (Solana, Ethereum, Bitcoin, Tron)
mp wallet create --name "my-wallet"

# Import from a mnemonic (all chains)
mp wallet import --name "restored" --mnemonic "word1 word2 ..."

# Import from a private key (single chain)
mp wallet import --name "imported" --key <hex-key> --chain ethereum

# List all local wallets
mp wallet list

# Get wallet details (by name or address)
mp wallet retrieve --wallet "my-wallet"

# Export mnemonic/key (interactive only — agents cannot run this)
mp wallet export --wallet "my-wallet"

# Delete a wallet (irreversible)
mp wallet delete --wallet "my-wallet" --confirm
```

## Workflow

1. Run `mp user retrieve` to check if authenticated. If a session already exists, follow the prompt rules in **Before logging in** above before starting a new login.
2. If no session, run `mp login --email <email>`, share the returned URL with the user, then run `mp verify --email <email> --code <code>` once they paste back the code from their email.
3. Run `mp wallet list` to see local wallets.
4. If no wallets, create one: `mp wallet create --name "default"`.

## Autonomous login

Agents can log in without human intervention if they have access to the user's email. For example, with the `gog` CLI (Google Workspace):

```bash
# 1. Send OTP
mp login --email user@example.com

# 2. Read the OTP code from email
gog gmail search "Your MoonPay verification code" --max-results 1

# 3. Verify with the code
mp verify --email user@example.com --code <code>
```

This enables fully autonomous agent setup — no human in the loop.

## Config locations

- **Wallets:** `~/.config/moonpay/wallets.json` (encrypted, AES-256-GCM)
- **Encryption key:** OS keychain (`moonpay-cli` / `encryption-key`)
- **Credentials:** `~/.config/moonpay/credentials.json` (encrypted, AES-256-GCM)
- **Config:** `~/.config/moonpay/config.json` (base URL, client ID)

## Security

- Wallet secrets are always encrypted on disk
- Encryption key is stored in macOS Keychain / Linux libsecret
- No password to remember — the OS handles authentication
- `wallet export` requires an interactive terminal (TTY) — agents and scripts cannot extract secrets
- 24-word BIP39 mnemonics (256-bit entropy)

## Related skills

- **moonpay-swap-tokens** — Swap or bridge tokens using local wallets.
- **moonpay-check-wallet** — Check wallet balances.
