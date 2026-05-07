---
id: references/solana-overview.md
name: solana
description: Solana-specific APIs including standard JSON-RPC, Digital Asset Standard (DAS) for NFTs and compressed assets, and wallet integration. Use when building Solana applications that need RPC access, NFT/asset queries, or Solana wallet tooling. For high-throughput streaming, see the yellowstone-grpc skill.
tags: []
related: []
updated: 2026-02-14
metadata:
  author: alchemyplatform
  version: "1.0"
---
# Solana APIs

## Summary
Solana-specific APIs and streaming endpoints, including DAS (Digital Asset Standard) and Yellowstone gRPC.

## References (Recommended Order)
1. [solana-rpc.md](solana-rpc.md) - Standard Solana JSON-RPC usage patterns.
2. [solana-das-api.md](solana-das-api.md) - DAS endpoints for assets and metadata.
3. [solana-wallets.md](solana-wallets.md) - Solana wallet integration notes.

## Cross-References
- `yellowstone-grpc` skill for high-throughput streaming (accounts/transactions/blocks).
- `data-apis` skill for EVM assets.
- `wallets` skill → `wallets-solana-notes.md` for high-level wallet guidance.
- `alchemy-cli` skill for live agent work via the local CLI (preferred local fallback). Includes Solana RPC and DAS commands.
- `alchemy-mcp` skill for live agent work via the hosted MCP server (when CLI is not installed). Exposes 50+ Solana RPC tools and DAS tools.
- `alchemy-agentic-gateway` skill for app code without an API key (x402 or MPP). Solana wallets pay USDC via SVM x402.

## Official Docs
- [Solana API Quickstart](https://www.alchemy.com/docs/reference/solana-api-quickstart)
- [DAS APIs for Solana](https://www.alchemy.com/docs/reference/alchemy-das-apis-for-solana)
