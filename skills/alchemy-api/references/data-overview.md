---
id: references/data-overview.md
name: data-apis
description: Higher-level Alchemy APIs for asset discovery, wallet analytics, transfer history, NFT data, and token pricing. Use when you need indexed blockchain data without raw RPC log scanning, including token balances, NFT ownership, portfolio views, price feeds, and transaction simulation.
tags: []
related: []
updated: 2026-02-14
metadata:
  author: alchemyplatform
  version: "1.0"
---
# Data APIs

## Summary
Higher-level APIs for asset discovery, wallet analytics, transfer history, and pricing. These are optimized for analytics use cases and reduce the need for raw RPC log scanning.

## References (Recommended Order)
1. [data-token-api.md](data-token-api.md) - Token balances and token metadata for wallets and contracts.
2. [data-portfolio-apis.md](data-portfolio-apis.md) - Consolidated wallet views (tokens/NFTs/summary).
3. [data-transfers-api.md](data-transfers-api.md) - Transfer history and indexed movement data.
4. [data-nft-api.md](data-nft-api.md) - NFT ownership, metadata, and collection queries.
5. [data-prices-api.md](data-prices-api.md) - Token price data for current and historical pricing.
6. [data-simulation-api.md](data-simulation-api.md) - Pre-execution simulation for risk checks.

## How to Use This Skill
- Prefer these APIs when you want asset analytics or historical data without maintaining a custom indexer.
- If you need real-time updates, pair with the `webhooks` skill.

## Other ways to access this API

This file is part of the `alchemy-api` skill — for app code that ships with an Alchemy API key. Other paths to the same data:

- **Live agent work via CLI** (preferred when `@alchemy/cli` is installed locally — see the `alchemy-cli` skill). The CLI exposes one command group per Data API surface:
  ```bash
  alchemy tokens --help --json --no-interactive
  alchemy nfts --help
  alchemy prices --help
  alchemy portfolio --help
  alchemy simulate --help
  alchemy transfers --help
  ```
  See each surface's reference file (`data-token-api.md`, `data-nft-api.md`, `data-prices-api.md`, `data-portfolio-apis.md`, `data-simulation-api.md`, `data-transfers-api.md`) for concrete commands.

- **Live agent work via MCP** (when MCP is wired into your client and the CLI is not installed — see the `alchemy-mcp` skill). Call `select_app` first; tool names follow the API surface (e.g., `getTokenBalances`, `getNFTsForOwner`, `getTokenPricesBySymbol`, `getTokensByAddress`, `simulateAssetChanges`, `getAssetTransfers`). See per-surface reference files for the full tool list.

- **App code without an API key** (autonomous agent paying per-request, or explicit x402/MPP — see the `alchemy-agentic-gateway` skill): same APIs exposed at `https://x402.alchemy.com/...` (x402) or `https://mpp.alchemy.com/...` (MPP); URL paths match the per-surface base URLs documented in each reference file.

## Cross-References
- `node-apis` skill → `node-enhanced-apis.md` for related RPC-style endpoints.
- `recipes` skill for end-to-end workflows.
- `alchemy-cli` skill for live agent work via the local CLI (preferred local fallback).
- `alchemy-mcp` skill for live agent work via the hosted MCP server (when CLI is not installed).
- `alchemy-agentic-gateway` skill for app code without an API key (x402 or MPP).

## Official Docs
- [Data APIs Overview](https://www.alchemy.com/docs/reference/data-overview)
