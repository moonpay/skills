---
name: alchemy-mcp
description: Use the Alchemy MCP server (`https://mcp.alchemy.com/mcp`) for live blockchain data and admin work when MCP is wired into your AI client and the Alchemy CLI is NOT installed locally. Exposes 159 tools across 100+ chains for token prices, NFT metadata, transactions, simulation, tracing, account abstraction, Solana DAS, and app management. Use for live querying, analysis, admin work, or on-machine agent work — not for application code that ships to production. For application code, use the `alchemy-api` skill (with API key) or `alchemy-agentic-gateway` skill (without). When the CLI is also installed locally, prefer `alchemy-cli` instead.
license: MIT
compatibility: Requires an MCP-compatible AI client (Claude Code, Codex, Cursor, Claude Desktop, VS Code Copilot, etc.) configured against `https://mcp.alchemy.com/mcp`. OAuth flow handled by the client — no API key or local install required.
metadata:
  author: alchemyplatform
  version: "1.0"
---
# Alchemy MCP

Use the hosted Alchemy MCP server for live blockchain data, transaction simulation, tracing, NFT/portfolio queries, and Alchemy app administration from inside your AI client.

## When to use this skill

Use `alchemy-mcp` when **all** of the following are true:

- The user wants **live agent work** — live querying, analysis, admin work, or on-machine automation that the agent runs now in this session
- An MCP-compatible client (Claude Code, Codex, Cursor, Claude Desktop, VS Code Copilot, etc.) is already wired against `https://mcp.alchemy.com/mcp`, OR the user is willing to add it
- The Alchemy CLI (`@alchemy/cli`) is **not** installed locally

If the CLI is installed locally — or if both CLI and MCP are available — prefer the `alchemy-cli` skill instead. The CLI is the preferred local fallback runtime path.

## When to use a different skill

| Situation | Use this skill instead |
| --- | --- |
| `@alchemy/cli` is installed locally, or both CLI and MCP are available | `alchemy-cli` |
| Neither CLI nor MCP is available | install `alchemy-cli` (`npm i -g @alchemy/cli`), then use `alchemy-cli` |
| Building application code that runs outside this agent session, with an Alchemy API key | `alchemy-api` |
| Building application code without an API key, or as an autonomous agent that needs to pay for itself, or you explicitly want x402/MPP | `alchemy-agentic-gateway` |

Do **not** use this skill to write production application code — MCP tools are for live agent work, not for embedding into shipped software.

## Connect your client

The server runs at `https://mcp.alchemy.com/mcp` and authenticates via OAuth — your client opens a browser to sign in with your Alchemy account on first use. No API key or local install required.

### Claude Code

```bash
claude mcp add alchemy --transport http https://mcp.alchemy.com/mcp
```

Restart Claude Code, then run `/mcp` and select `alchemy` to authenticate.

### Codex

```bash
codex mcp add alchemy --url https://mcp.alchemy.com/mcp
```

Verify with `codex mcp list`.

### Cursor

Add to `~/.cursor/mcp.json` (global) or `.cursor/mcp.json` (project):

```json
{
  "mcpServers": {
    "alchemy": {
      "type": "streamable-http",
      "url": "https://mcp.alchemy.com/mcp"
    }
  }
}
```

Restart Cursor and verify via **Cursor Settings > MCP**.

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "alchemy": {
      "type": "streamable-http",
      "url": "https://mcp.alchemy.com/mcp"
    }
  }
}
```

### VS Code Copilot

Add to `.vscode/mcp.json` in your project:

```json
{
  "servers": {
    "alchemy": {
      "type": "http",
      "url": "https://mcp.alchemy.com/mcp"
    }
  }
}
```

### Any other MCP client

Point it at `https://mcp.alchemy.com/mcp` using Streamable HTTP transport. The server supports OAuth 2.1 with PKCE; the client handles the authorization flow automatically.

## Bootstrap workflow

Once the server is connected and you've signed in via OAuth:

1. **List apps** — `list_apps` to see your Alchemy apps.
2. **Select an app** — `select_app` with the app ID. This caches the API key the server uses for RPC and Data tools. **Required before any RPC or Data tool call.**
3. **Run tools** — call any of the 159 tools (e.g. `getTokenPricesBySymbol`, `getNFTsForOwner`, `simulateAssetChanges`, `solana_getBalance`).

If you need to create an app first:

```text
create_app(name="My App", networks=["eth-mainnet", "base-mainnet"])
```

Then `select_app` against the new app.

## Tool catalog

The server exposes **159 tools** across three categories.

### Admin (8 tools) — Account & app management

| Tool | Purpose |
|------|---------|
| `ping` | Health check |
| `list_apps` | List your Alchemy apps |
| `get_app` | Get app details |
| `select_app` | Select an app and cache its API key for RPC/Data tools |
| `create_app` | Create a new app |
| `update_app` | Update app name or description |
| `list_chains` | List all 100+ supported networks |
| `update_allowlist` | Update app allowlists (network, address, origin, IP) |

### RPC (123 tools) — On-chain JSON-RPC

Standard EVM RPC, Token API, Transfers & Receipts, Transaction Simulation, Trace API, Debug API, ERC-4337 Account Abstraction, Solana standard RPC, and Solana Enhanced & DAS.

| Cluster | Count | Examples |
|---------|-------|----------|
| Standard EVM RPC | 31 | `ethBlockNumber`, `ethGetBalance`, `ethCall`, `ethGetLogs`, `ethCallBundle` |
| Token API | 3 | `getTokenBalances`, `getTokenMetadata`, `getTokenAllowance` |
| Transfers & Receipts | 2 | `getAssetTransfers`, `getTransactionReceipts` |
| Transaction Simulation | 5 | `simulateAssetChanges`, `simulateExecution`, `simulateUserOperationAssetChanges` |
| Trace API | 6 | `traceCall`, `traceTransaction`, `traceBlock`, `traceFilter` |
| Debug API | 6 | `debugTraceTransaction`, `debugTraceCall`, `debugTraceBlockByNumber` |
| ERC-4337 Account Abstraction | 7 | `estimateUserOperationGas`, `getUserOperationReceipt`, `requestGasAndPaymasterAndData` |
| Solana Standard RPC | 50 | `solana_getBalance`, `solana_getTokenAccountsByOwner`, `solana_getBlock`, `solana_simulateTransaction` |
| Solana Enhanced & DAS | 13 | `solana_getAsset`, `solana_getAssetsByOwner`, `solana_searchAssets`, `solana_getPriorityFeeEstimate` |

### Data (28 tools) — REST APIs

| Cluster | Count | Examples |
|---------|-------|----------|
| NFT API | 21 | `getNFTsForOwner`, `getNFTMetadata`, `getOwnersForNFT`, `getFloorPrice`, `getNFTSales` |
| Prices API | 3 | `getTokenPricesBySymbol`, `getTokenPricesByAddress`, `getHistoricalTokenPrices` |
| Portfolio (multi-chain) | 4 | `getTokensByAddress`, `getTokenBalancesByAddress`, `getNFTsByAddress`, `getNFTContractsByAddress` |

## Common task → tool map

| Task | Tool | Notes |
|------|------|-------|
| Latest ETH block number | `ethBlockNumber` | Pass `network: "eth-mainnet"` |
| ETH balance for an address | `ethGetBalance` | Returns hex wei |
| ERC-20 balances | `getTokenBalances` | Use `getTokenMetadata` to resolve symbol/decimals |
| ERC-20 metadata | `getTokenMetadata` | name, symbol, decimals, logo |
| Asset transfers (history) | `getAssetTransfers` | Filter by `category` (`erc20`, `erc721`, `erc1155`, `external`, `internal`) |
| Simulate a tx | `simulateAssetChanges` | Pre-flight asset deltas |
| Trace a tx | `traceTransaction` | Internal call tree |
| Debug-trace a tx | `debugTraceTransaction` | Geth-style structured trace |
| List owned NFTs | `getNFTsForOwner` | Across one chain |
| Multi-chain NFTs | `getNFTsByAddress` | Across many chains |
| NFT metadata | `getNFTMetadata` | Per token id |
| NFT floor price | `getFloorPrice` | From major marketplaces |
| Token prices (spot) | `getTokenPricesBySymbol` | e.g. `["ETH","USDC"]` |
| Token prices (historical) | `getHistoricalTokenPrices` | Time range queries |
| Multi-chain portfolio | `getTokenBalancesByAddress` | With USD values |
| Solana balance | `solana_getBalance` | Lamports |
| Solana token accounts | `solana_getTokenAccountsByOwner` | SPL tokens |
| Compressed NFT lookup | `solana_getAsset` | DAS standard |
| Owner's compressed NFTs | `solana_getAssetsByOwner` | DAS standard |
| Solana priority fees | `solana_getPriorityFeeEstimate` | Recent samples |
| User operation receipt | `getUserOperationReceipt` | ERC-4337 |

## Operating rules

- **Always call `select_app` first** before any RPC or Data tool. Tools error out with a clear message if no app is selected.
- **Use the canonical chain slugs** returned by `list_chains` (e.g. `eth-mainnet`, `base-mainnet`, `solana-mainnet`). Tool error messages will guide you if you guess wrong.
- **Don't bypass the MCP server** with raw curl/HTTP from inside the agent — that's the API-key path covered by `alchemy-api`. MCP tools are the canonical interface for this skill.
- **Don't use MCP tools to generate production application code.** When the user wants to ship code, hand off to `alchemy-api` (with API key) or `alchemy-agentic-gateway` (without).

## Supported chains

100+ chains including Ethereum, Base, Polygon, Arbitrum, Optimism, BNB, Solana, Starknet, zkSync, Scroll, Linea, Mantle, Blast, World Chain, and many more. Use `list_chains` to fetch the full list.

## Troubleshooting

### "No app selected"

Call `select_app` with the desired app ID. If you don't have an app yet, run `create_app` first.

### OAuth flow doesn't open

Restart your MCP client after adding the server. For Claude Code, run `/mcp` and select `alchemy` to trigger the sign-in flow manually.

### Tool not found

Some tools are namespaced (e.g. `solana_*` for Solana). Use `list_chains` to confirm the chain slug and check the tool catalog above for the exact name.

### Rate limits / compute units

The MCP server inherits the rate limits of the selected app. Check usage in the [Alchemy dashboard](https://dashboard.alchemy.com/).

## Official links

- [Alchemy MCP server (hosted)](https://mcp.alchemy.com/mcp)
- [Alchemy MCP source on GitHub](https://github.com/alchemyplatform/alchemy-mcp-server)
- [Alchemy developer docs](https://www.alchemy.com/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Alchemy dashboard](https://dashboard.alchemy.com/)
