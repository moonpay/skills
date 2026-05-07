---
name: alchemy-cli
description: Use the Alchemy CLI (`@alchemy/cli`) for live blockchain data, transaction lookups, NFT/token/portfolio queries, simulation, tracing/debugging, account abstraction (bundler + gas manager), webhook management, Solana RPC/DAS, and Alchemy app administration. Preferred runtime path for live agent work (querying, admin, local automation) when the CLI is installed locally — or when both CLI and MCP are available. If neither is installed, install the CLI with `npm i -g @alchemy/cli`. Use for live agent work in this session, not for building application code that ships to production. For application code, use the `alchemy-api` skill (with API key) or `alchemy-agentic-gateway` skill (without).
license: MIT
compatibility: Requires `@alchemy/cli` (`npm i -g @alchemy/cli`) and shell access. Verified against `@alchemy/cli` 0.6.x. Works across Claude Code, Cursor, Codex, and any agent with shell access.
metadata:
  author: alchemyplatform
  version: "2.0"
---
# Alchemy CLI

Use the [Alchemy CLI](https://www.npmjs.com/package/@alchemy/cli) (`@alchemy/cli`) for live blockchain queries, admin work, and local automation from the terminal. The CLI maps every Alchemy product (Node JSON-RPC, Token, NFT, Transfers, Prices, Portfolio, Simulation, Solana, Webhooks, Apps) to `alchemy <command>` invocations with structured JSON output.

## When to use this skill

Use `alchemy-cli` when **all** of the following are true:

- The user wants **live agent work** — live querying, analysis, admin work, or local automation that the agent runs now in this session
- `@alchemy/cli` is installed locally, **or** both the CLI and an MCP server are available, **or** neither is available (in which case install the CLI — see [Install](#install))

The CLI is the **preferred local fallback runtime path** for live agent work. When in doubt about CLI vs MCP, prefer the CLI.

## When to use a different skill

| Situation | Use this skill instead |
| --- | --- |
| MCP is already wired into your client and the CLI is **not** installed locally | `alchemy-mcp` |
| Building application code that runs outside this agent session, with an Alchemy API key | `alchemy-api` |
| Building application code without an API key, or as an autonomous agent that needs to pay for itself, or you explicitly want x402/MPP | `alchemy-agentic-gateway` |

Do **not** use this skill to write production application code — CLI commands are for live agent work, not for embedding into shipped software.

## Install

```bash
npm i -g @alchemy/cli
```

If the CLI is not installed and the user wants live agent work, install it. Do not fall back to raw curl/HTTP calls — those are the API-key path covered by `alchemy-api`.

## Bootstrap

Run this at the start of any session to get the full command contract (every command, flag, auth method, error code, and example):

```bash
alchemy --json --no-interactive agent-prompt
```

## Execution rules

- ALWAYS pass `--json --no-interactive` on every command
- Parse stdout as JSON on exit code 0
- Parse stderr as JSON on nonzero exit code
- NEVER run bare `alchemy` without `--json --no-interactive`
- NEVER use curl or raw HTTP when an `alchemy` CLI command exists for the task — that's the `alchemy-api` (API-key) path, not this skill
- NEVER use the CLI to generate production application code; hand off to `alchemy-api` or `alchemy-agentic-gateway` for shipped code

## Preflight

Before the first command, run **both** of these checks:

```bash
alchemy --json --no-interactive setup status
alchemy --json --no-interactive gas
```

`setup status` returns `{"complete": true, "satisfiedBy": "<source>"}` if any auth is configured. **Do not rely on `complete: true` alone** — there is a known false positive where `setup status` reports `complete: true` with `satisfiedBy: "auth_token"`, but RPC commands still fail with `AUTH_REQUIRED` because no API key has been derived from the auth token.

`gas` is a lightweight RPC smoke test that catches this. If it returns `{"gasPrice": "0x...", ...}`, RPC is wired up correctly. If it returns `{"error": {"code": "AUTH_REQUIRED", ...}}`, run `alchemy auth login` (which fetches and saves the API key) or `alchemy config set api-key <key>`, then re-run `gas` to confirm.

If `setup status` reports `complete: false`, follow the `nextCommands` in the response first, then run `gas` to verify.

## Auth setup

The fastest way to authenticate is via browser login:

```bash
alchemy auth login
```

This opens a browser to authenticate with your Alchemy account and automatically configures the CLI with your credentials.

To check auth status: `alchemy auth status`
To log out: `alchemy auth logout`

### Alternative auth methods

| Method | Config command | Env var | Used by |
|--------|---------------|---------|---------|
| Browser login | `alchemy auth login` | -- | All commands (derives API key + access key from your account) |
| API key | `alchemy config set api-key <key>` | `ALCHEMY_API_KEY` | `balance`, `tx`, `receipt`, `block`, `gas`, `logs`, `rpc`, `trace`, `debug`, `tokens`, `nfts`, `transfers`, `prices`, `portfolio`, `simulate`, `bundler`, `gas-manager`, `solana` |
| Access key | `alchemy config set access-key <key>` | `ALCHEMY_ACCESS_KEY` | `apps` (all subcommands incl. `configured-networks`) |
| Webhook key | `alchemy config set webhook-api-key <key>` | `ALCHEMY_WEBHOOK_API_KEY` | `webhooks` |
| x402 wallet | `alchemy wallet generate` then `alchemy config set x402 true` | `ALCHEMY_WALLET_KEY` | `balance`, `tx`, `block`, `rpc`, `trace`, `debug`, `tokens`, `nfts`, `transfers` |

`alchemy network list` and `alchemy version` / `update-check` need no auth.

### Selecting a default app

Many `apps` subcommands (and the access-key gated flows) operate on a "default app." If you see `APP_REQUIRED` in an error response, set one:

```bash
alchemy --json --no-interactive apps select <id>
# or equivalently
alchemy --json --no-interactive config set app <id>
```

Get API/access keys at [dashboard.alchemy.com](https://dashboard.alchemy.com/).

## Task-to-command map

### Node (EVM)

| Task | Command |
|------|---------|
| ETH balance | `alchemy balance <address>` |
| Transaction details | `alchemy tx <hash>` |
| Transaction receipt | `alchemy receipt <hash>` |
| Block details | `alchemy block <number\|latest>` |
| Gas prices | `alchemy gas` |
| Event logs | `alchemy logs --address <addr> --from-block <n> --to-block <n>` |
| Raw JSON-RPC | `alchemy rpc <method> [params...]` |
| Trace methods | `alchemy trace <method> [params...]` |
| Debug methods | `alchemy debug <method> [params...]` |

### Data

| Task | Command |
|------|---------|
| ERC-20 balances | `alchemy tokens balances <address>` |
| ERC-20 balances (formatted) | `alchemy tokens balances <address> --metadata` |
| Token metadata | `alchemy tokens metadata <contract>` |
| Token allowance | `alchemy tokens allowance --owner <addr> --spender <addr> --contract <addr>` |
| List owned NFTs | `alchemy nfts <address> [--limit <n>] [--page-key <key>]` |
| NFT metadata | `alchemy nfts metadata --contract <addr> --token-id <id>` |
| NFT contract metadata | `alchemy nfts contract <address>` |
| Transfer history | `alchemy transfers <address> --category erc20,erc721,erc1155,external,internal,specialnft [--from-block <n>] [--to-block <n>] [--max-count <n>] [--page-key <key>]` |
| Spot prices by symbol | `alchemy prices symbol ETH,USDC` |
| Spot prices by address | `alchemy prices address --addresses '<json>'` |
| Historical prices | `alchemy prices historical --body '<json>'` |
| Cross-network token portfolio | `alchemy portfolio tokens --body '<json>'` |
| Token balances by address/network pairs | `alchemy portfolio token-balances --body '<json>'` |
| Cross-network NFT portfolio | `alchemy portfolio nfts --body '<json>'` |
| NFT contracts by address/network pairs | `alchemy portfolio nft-contracts --body '<json>'` |
| Simulate single tx (asset deltas) | `alchemy simulate asset-changes --tx '<json>' [--block-tag <tag>]` |
| Simulate single tx (execution trace) | `alchemy simulate execution --tx '<json>' [--block-tag <tag>]` |
| Simulate bundle (asset deltas) | `alchemy simulate asset-changes-bundle --txs '<json-array>' [--block-tag <tag>]` |
| Simulate bundle (execution trace) | `alchemy simulate execution-bundle --txs '<json-array>' [--block-tag <tag>]` |

### Solana

| Task | Command |
|------|---------|
| Solana JSON-RPC | `alchemy solana rpc <method> [params...]` |
| Solana DAS (NFTs/assets) | `alchemy solana das <method> '<json>'` |

### Webhooks

| Task | Command |
|------|---------|
| List webhooks | `alchemy webhooks list` |
| Create webhook | `alchemy webhooks create --body '<json>' [--dry-run]` |
| Update webhook | `alchemy webhooks update --body '<json>' [--dry-run]` |
| Delete webhook | `alchemy webhooks delete <id> [--yes] [--dry-run]` |
| Get address-activity webhook addresses | `alchemy webhooks addresses <id>` |
| Get NFT-activity webhook filters | `alchemy webhooks nft-filters <id>` |

### Account abstraction (ERC-4337)

| Task | Command |
|------|---------|
| Send a UserOperation | `alchemy bundler send-user-operation --user-op '<json>' --entry-point <addr>` |
| Estimate UserOperation gas | `alchemy bundler estimate-user-operation-gas --user-op '<json>' --entry-point <addr> [--state-override '<json>']` |
| Get UserOperation receipt | `alchemy bundler get-user-operation-receipt --user-op-hash <hash>` |
| Request gas + paymaster data | `alchemy gas-manager request-gas-and-paymaster --body '<json>'` |
| Request paymaster token quote | `alchemy gas-manager request-paymaster-token-quote --body '<json>'` |

### Wallet (x402)

| Task | Command |
|------|---------|
| Generate a new wallet | `alchemy wallet generate` |
| Import a wallet from a key file | `alchemy wallet import <path>` |
| Show the locally configured wallet address | `alchemy wallet address` |

### App management

| Task | Command |
|------|---------|
| List apps | `alchemy apps list [--cursor <c>] [--limit <n>] [--all] [--search <q>] [--id <appId>]` |
| Get app details | `alchemy apps get <id>` |
| Create app | `alchemy apps create --name "My App" --networks eth-mainnet [--description <desc>] [--products <ids>] [--dry-run]` |
| Update app metadata | `alchemy apps update <id> --name "New Name" [--description <desc>] [--dry-run]` |
| Update app network allowlist | `alchemy apps networks <id> --networks eth-mainnet,base-mainnet [--dry-run]` |
| Update app address allowlist | `alchemy apps address-allowlist <id> --addresses 0xAA,0xBB [--dry-run]` |
| Update app origin allowlist | `alchemy apps origin-allowlist <id> --origins https://a.com,https://b.com [--dry-run]` |
| Update app IP allowlist | `alchemy apps ip-allowlist <id> --ips 1.2.3.4,5.6.7.8 [--dry-run]` |
| Delete app | `alchemy apps delete <id> [--yes] [--dry-run]` |
| Select default app | `alchemy apps select <id>` (equivalent to `alchemy config set app <id>`) |
| List networks configured for an app | `alchemy apps configured-networks [--app-id <id>]` |
| List Admin API chain identifiers (for `apps create`/`update`) | `alchemy apps chains` |
| List all RPC network slugs (for `--network`) | `alchemy network list [--mainnet-only] [--testnet-only] [--search <term>]` |

### CLI admin

| Task | Command |
|------|---------|
| Check for CLI updates | `alchemy update-check` |
| View config | `alchemy config list` |
| Reset config | `alchemy config reset --yes` |
| CLI version | `alchemy version` |

## Global flags

| Flag | Description |
|------|-------------|
| `--json` | Force JSON output (auto-enabled when piped) |
| `--no-interactive` | Disable prompts and REPL |
| `-n, --network <network>` | Target network (default: `eth-mainnet`, env: `ALCHEMY_NETWORK`) |
| `--api-key <key>` | Override API key per command (env: `ALCHEMY_API_KEY`) |
| `--access-key <key>` | Override access key per command (env: `ALCHEMY_ACCESS_KEY`) |
| `--x402` | Use x402 wallet-based gateway auth for this command |
| `--wallet-key-file <path>` | Path to wallet private key file (for x402) |
| `--timeout <ms>` | Request timeout in milliseconds |
| `-q, --quiet` | Suppress non-essential output |
| `--verbose` | Log request/response details to stderr |
| `--debug` | Enable debug diagnostics |
| `--no-color` | Disable color output |
| `--reveal` | Show secrets in plain text (use with care; intended for explicit reveal flows) |

## Error handling

Errors return structured JSON on stderr. Each error has a `code`, an `exitCode` (1–9), a `retryable` boolean, and a `recovery` hint. Key codes (from `agent-prompt`):

| Code | Exit | Retryable | Recovery |
|------|------|-----------|----------|
| `AUTH_REQUIRED` | 3 | No | Run `alchemy auth login`, or set `ALCHEMY_API_KEY` / `alchemy config set api-key <key>` |
| `INVALID_API_KEY` | 3 | No | Check the API key; set a valid one with `alchemy config set api-key <key>` |
| `ACCESS_KEY_REQUIRED` | 3 | No | Set `ALCHEMY_ACCESS_KEY` or run `alchemy config set access-key <key>` |
| `INVALID_ACCESS_KEY` | 3 | No | Check the access key at [dashboard.alchemy.com](https://dashboard.alchemy.com/) |
| `APP_REQUIRED` | 3 | No | Select a default app: `alchemy apps select <id>` (or `alchemy config set app <id>`) |
| `NETWORK_NOT_ENABLED` | 3 | No | Enable the target network for your app at dashboard.alchemy.com |
| `SETUP_REQUIRED` | 3 | No | Run `alchemy --json setup status` and follow `nextCommands` |
| `PAYMENT_REQUIRED` | 9 | No | Fund x402 wallet or switch to API key auth |
| `RATE_LIMITED` | 5 | Yes | Wait and retry with backoff; consider upgrading your plan |
| `NETWORK_ERROR` | 6 | Yes | Check connection and retry |
| `RPC_ERROR` | 7 | No | Check method, params, and network; verify API key has access |
| `ADMIN_API_ERROR` | 8 | No | Check error message; verify access key permissions |
| `NOT_FOUND` | 4 | No | Verify the resource identifier (address, hash, id) is correct |
| `INVALID_ARGS` | 2 | No | Check command usage via `alchemy --json help <command>` |
| `INTERNAL_ERROR` | 1 | No | Unexpected error; retry or report a bug |

Get the full canonical list any time with `alchemy --json --no-interactive agent-prompt`.

## Handing off to other skills

| The user wants to... | Hand off to |
| --- | --- |
| Wire Alchemy into application code that ships to production, with an API key | `alchemy-api` |
| Wire Alchemy into application code without an API key, or pay-per-request as an autonomous agent | `alchemy-agentic-gateway` |
| Run live work but the CLI isn't installed and they prefer not to install it (MCP is wired in) | `alchemy-mcp` |

### Bridging into the `alchemy-api` flow (extract an API key)

If the user is starting an app-code project and `$ALCHEMY_API_KEY` isn't set in their shell, use the CLI to fetch a key from their Alchemy account, **persist it to the project's `.env`** so it survives across terminal sessions, and export it for the current shell so the agent can use it immediately.

> **Security:** NEVER echo, print, or otherwise surface the extracted API key value in conversation output. Refer to it only as `$ALCHEMY_API_KEY` after exporting. Treat it the same as a password.

```bash
# 1. Try to read a cached key from CLI config (read-only, safe non-interactive).
KEY="$(alchemy --no-interactive --json --reveal config get api-key 2>/dev/null | jq -r .value)"

# 2. If empty/null, run the interactive flow.
#    Note: auth login opens a browser and apps select shows a picker, so do NOT
#    pass --no-interactive here. If you already know the app id, pass it
#    explicitly to skip the picker: `alchemy --no-interactive --json apps select <id>`.
if [ -z "$KEY" ] || [ "$KEY" = "null" ]; then
  alchemy auth login              # opens browser; sets up account credentials
  alchemy --json apps select      # interactive picker (omit --no-interactive so it can render)
  KEY="$(alchemy --no-interactive --json --reveal config get api-key | jq -r .value)"
fi

# 3. Persist to the project's .env (standard practice — survives terminal restarts
#    and gets loaded by dotenv / framework env loaders at runtime).
#    Use .env.local if the project's framework expects that (e.g. Next.js).
ENV_FILE=".env"
touch "$ENV_FILE"
if grep -q '^ALCHEMY_API_KEY=' "$ENV_FILE"; then
  sed -i.bak "s|^ALCHEMY_API_KEY=.*|ALCHEMY_API_KEY=$KEY|" "$ENV_FILE" && rm "$ENV_FILE.bak"
else
  echo "ALCHEMY_API_KEY=$KEY" >> "$ENV_FILE"
fi
grep -qxF "$ENV_FILE" .gitignore 2>/dev/null || echo "$ENV_FILE" >> .gitignore

# 4. Export to the current shell so the agent can call the API immediately.
export ALCHEMY_API_KEY="$KEY"
```

Hand off to the `alchemy-api` skill once `.env` has the key and `ALCHEMY_API_KEY` is exported.

## Official links

- [CLI on npm](https://www.npmjs.com/package/@alchemy/cli)
- [Alchemy docs](https://www.alchemy.com/docs)
- [Get API key](https://dashboard.alchemy.com/)
