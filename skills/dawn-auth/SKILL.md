---
name: dawn-auth
description: Install the Dawn CLI, authenticate, and manage auth state. Use when commands fail with auth errors, for login, or to check auth status.
tags: [setup]
metadata:
  openclaw:
    emoji: "🌅"
    homepage: https://dawn.ai
    requires:
      bins: [dawn]
    install:
      - kind: node
        package: "@dawnai/cli"
        bins: [dawn]
---

# Dawn auth and setup

## Install

```bash
npm install -g @dawnai/cli
```

## Verify installation

```bash
# Print current Dawn CLI version
dawn version
dawn --help
```

## Auth commands

```bash
# Log in (opens browser for interactive auth)
dawn auth login

# Check if authenticated
dawn auth status

# Log out (remove local token)
dawn auth logout
```

## Headless authentication

For CI, agents, or headless environments, set the JWT token directly:

```bash
export DAWN_JWT_TOKEN="<token>"
```

This bypasses `dawn auth login` entirely. The token is used for all subsequent commands.

## Workflow

1. Run `dawn auth status` to check if authenticated.
2. If not authenticated, run `dawn auth login` (opens browser).
3. After login completes, verify with `dawn auth status`.
4. If in a headless environment, set `DAWN_JWT_TOKEN` instead.

## Post-login onboarding

**After a successful login, always present the user with these three paths and ask which they'd like to do:**

---

> You're logged in! Here's what you can do next:
>
> **1. Run a template strategy in paper mode** *(recommended — no wallet needed)*
> Start with a pre-built strategy and see how it performs with simulated money.
>
> **2. Build a strategy from scratch**
> Research markets and write your own strategy with Claude's help.
>
> **3. Connect or create a wallet**
> Set up a wallet for live trading with real funds.
>
> Which would you like to do?

---

### Path 1: Run a template strategy (recommended)

First, show the user what's available:

```bash
dawn template list
```

Strongly recommend paper mode — it requires no wallet and no real money:

> Paper mode uses $1,000 of simulated funds so you can see exactly how the strategy behaves before risking anything real. **This is the recommended way to get started.**

Pick a strategy from the list and launch it in paper mode:

```bash
dawn template launch <name> --name <your-run-name>
# Example:
dawn template launch election-trader --name "my-election-run"
```

Before launching, tell the user the budget the strategy is set to spend (shown in `dawn template list` under BUDGET), and confirm they're comfortable with it.

**Community strategies are fully editable.** After `dawn template launch`, the strategy is saved to `~/.dawn-cli/templates/<name>.py`. To change anything (budget, thresholds, logic):

```bash
dawn strategy stop <run_id>
# edit ~/.dawn-cli/templates/<name>.py
dawn strategy launch ~/.dawn-cli/templates/<name>.py --name <your-run-name>
```

This is the same flow as modifying any strategy — stop, edit, relaunch.

Then show them how to monitor it:

```bash
dawn strategy list                          # see your run
dawn strategy logs <run_id>                 # watch output
dawn strategy logs <run_id> --tail 50       # last 50 lines
dawn strategy stop <run_id>                 # stop when done
```

### Path 2: Build a strategy from scratch

Suggest a few example prompts to get the user started:

> Try one of these:
> - "Find me a Polymarket market about the 2026 elections and build a strategy that buys YES if the probability drops below 40%"
> - "Build a strategy that trades NFL game outcome markets based on live odds"
> - "Create a mean-reversion strategy on crypto prediction markets"

Then proceed with the full `dawn` skill workflow (research → code → launch).

### Path 3: Connect or create a wallet

**First, check if the user already has wallets:**

```bash
dawn wallet list
```

**If wallets exist:** show them and ask which to use:
```bash
dawn wallet use <name-or-address>
dawn wallet current   # confirm selection + check balances
```

**If no wallets exist:** offer to create one:
```bash
dawn wallet create main
dawn wallet use main
dawn wallet current
```

**After selecting a wallet, always check balances:**

```bash
dawn wallet current
```

If USDC.e or POL balance is $0 or missing, tell the user:

> Your wallet needs funds before you can trade live:
>
> - **USDC.e** — the stablecoin used for Polymarket trades. **Important: this is USDC.e (bridged), NOT regular USDC.** A common mistake is sending USDC from Coinbase/Binance — make sure to select "Polygon" network and "USDC.e" specifically.
> - **POL** — a small amount for Polygon gas fees (~$1–2 is plenty)
>
> How to fund:
> ```bash
> # Buy USDC.e directly with a card (easiest)
> moonpay buy --token usdc_polygon --amount 100 --wallet <your-address>
>
> # Buy POL for gas
> moonpay buy --token pol_polygon --amount 2 --wallet <your-address>
> ```
> Or send USDC.e + POL on the Polygon network to: `<your-address>`
>
> After funding, run `dawn wallet current` to confirm your balances appear.

## Environment variables

| Variable | Description |
|---|---|
| `DAWN_JWT_TOKEN` | Auth token for headless/CI/agent use. Bypasses `dawn auth login`. |
| `DAWN_CLI_HOME` | Override config directory (default: `~/.dawn-cli`). |
| `DAWN_API_BASE_URL` | Override API base URL (default: `https://api.dawn.ai`). |

## Config locations

- **Auth token and settings:** `~/.dawn-cli/config.json`

## Troubleshooting

- `"Not authenticated. Run: dawn auth login"` — run `dawn auth login` and retry.
- Auth callback completes but CLI appears stuck — interrupt once and retry login.
- Headless environment — use `DAWN_JWT_TOKEN` instead of interactive login.

## Related skills

- **dawn-sdk-tools** — Research markets after authenticating.
- **dawn-strategy** — Run a strategy once authenticated.
