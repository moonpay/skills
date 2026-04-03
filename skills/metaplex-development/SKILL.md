---
name: metaplex
description: Metaplex development on Solana — NFTs, tokens, compressed NFTs, candy machines, token launches, autonomous agents. Use when working with Token Metadata, Core, Bubblegum, Candy Machine, Genesis, Agent Registry, or the mplx CLI.
tags: [solana, nft, token-metadata, compressed-nfts, candy-machine, token-launch, agent-identity, bubblegum]
license: Apache-2.0
metadata:
  author: metaplex-foundation
  version: "0.2.0"
  openclaw: {"emoji":"💎","os":["darwin","linux","win32"],"requires":{"bins":["node"]},"homepage":"https://metaplex.com/docs"}
---

# Metaplex Development Skill

## Overview

Metaplex provides the standard infrastructure for NFTs and tokens on Solana:
- **Agent Registry**: On-chain agent identity, wallets, and execution delegation for MPL Core assets
- **Genesis**: Token launch protocol with fair distribution + liquidity graduation
- **Core**: Next-gen NFT standard (recommended for new NFT projects)
- **Token Metadata**: Fungible tokens + legacy NFTs/pNFTs
- **Bubblegum**: Compressed NFTs (cNFTs) using Merkle trees — massive scale at minimal cost
- **Candy Machine**: NFT drops with configurable minting rules

## Prerequisites

- Node.js installed
- Metaplex CLI installed: `npm install -g @metaplex-foundation/cli`
- CLI configured (RPC endpoint, keypair, funded wallet) — see `./references/cli-initial-setup.md`
- For Bubblegum/compressed NFTs: a DAS-compatible RPC (Helius, Triton, or QuickNode)

## Tool Selection

> **Prefer CLI over SDK** for direct execution. Use SDK only when user specifically needs code.

| Approach | When to Use |
|----------|-------------|
| **CLI (`mplx`)** | Default choice - direct execution, no code needed |
| **Umi SDK** | User needs code — default SDK choice. Covers all programs (TM, Core, Bubblegum, Genesis) |
| **Kit SDK** | User specifically uses @solana/kit, or asks for minimal dependencies. Token Metadata only — no Core/Bubblegum/Genesis support |

## Task Router

> **IMPORTANT**: You MUST read the detail file for your task BEFORE executing any command or writing any code. The command syntax, required flags, setup steps, and batching rules are ONLY in the detail files. Do NOT guess commands from memory.

| Task Type | Read This File |
|-----------|----------------|
| Any CLI operation (agent guidelines, batching, explorer links) | `./references/cli.md` |
| CLI: Agent Registry (identity, delegation) | `./references/cli.md` + `./references/cli-agent.md` |
| CLI: Core NFTs/Collections | `./references/cli.md` + `./references/cli-core.md` + `./references/metadata-json.md` |
| CLI: Token Metadata NFTs | `./references/cli.md` + `./references/cli-token-metadata.md` + `./references/metadata-json.md` |
| CLI: Compressed NFTs (Bubblegum) | `./references/cli.md` + `./references/cli-bubblegum.md` + `./references/metadata-json.md` |
| CLI: Candy Machine (NFT drops) | `./references/cli.md` + `./references/cli-candy-machine.md` + `./references/metadata-json.md` |
| CLI: Token launch (Genesis) | `./references/cli.md` + `./references/cli-genesis.md` |
| CLI: Execute / asset-signer wallets / agent vault | `./references/cli.md` + `./references/cli-core.md` (execute section) |
| SDK: Execute / asset-signer PDA / agent vault | `./references/sdk-umi.md` + `./references/sdk-core.md` (execute section) |
| CLI: Fungible tokens | `./references/cli.md` + `./references/cli-toolbox.md` |
| SDK setup (Umi) | `./references/sdk-umi.md` |
| SDK: Core NFTs | `./references/sdk-umi.md` + `./references/sdk-core.md` + `./references/metadata-json.md` |
| SDK: Token Metadata | `./references/sdk-umi.md` + `./references/sdk-token-metadata.md` + `./references/metadata-json.md` |
| SDK: Compressed NFTs (Bubblegum) | `./references/sdk-umi.md` + `./references/sdk-bubblegum.md` + `./references/metadata-json.md` |
| SDK: Token Metadata with Kit | `./references/sdk-token-metadata-kit.md` + `./references/metadata-json.md` |
| SDK: Agent Registry (identity, wallets, delegation) | `./references/sdk-umi.md` + `./references/sdk-agent.md` |
| SDK: Token launch (Genesis) | `./references/sdk-umi.md` + `./references/sdk-genesis.md` |
| Off-chain metadata JSON format/schema (NFT or token) | `./references/metadata-json.md` |
| Account structures, PDAs, concepts | `./references/concepts.md` |
| CLI errors, localnet issues | `./references/cli-troubleshooting.md` |

## CLI Capabilities

The `mplx` CLI can handle most Metaplex operations directly. **Read `./references/cli.md` for agent guidelines (batching, JSON output, explorer links), then the program-specific file.**

> **CLI v0.1.0 breaking changes** (for agents/scripts migrating from older versions):
> - `--json <file>` (used to pass an offchain metadata file path) is now `--offchain <file>`. `--json` is now the standard OCLIF flag for machine-readable output.
> - All commands now return structured JSON when `--json` is passed — use this for programmatic/agent use.

| Task | CLI Support |
|------|-------------|
| Register agent identity | ✅ |
| Fetch agent data | ✅ |
| Create fungible token | ✅ |
| Create Core NFT/Collection | ✅ |
| Create TM NFT/pNFT | ✅ |
| Transfer TM NFTs | ✅ |
| Transfer fungible tokens | ✅ |
| Transfer Core NFTs | ✅ |
| Upload to Irys | ✅ |
| Candy Machine drop | ✅ (setup/config/insert — minting requires SDK) |
| Compressed NFTs (cNFTs) | ✅ (batch limit ~100, use SDK for larger) |
| Execute (asset-signer wallets) | ✅ |
| Check SOL balance / Airdrop | ✅ |
| Query assets by owner/collection | ❌ SDK only (DAS API) |
| Token launch (Genesis) | ✅ |

## Program IDs

```
Agent Identity:  1DREGFgysWYxLnRnKQnwrxnJQeSMk2HmGaC6whw2B2p
Agent Tools:     TLREGni9ZEyGC3vnPZtqUh95xQ8oPqJSvNjvB7FGK8S
Genesis:         GNS1S5J5AspKXgpjz6SvKL66kPaKWAhaGRhCqPRxii2B
Core:            CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d
Token Metadata:  metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s
Bubblegum V1:    BGUMAp9SX3uS4efGcFjPjkAQZ4cUNZhtHaMq64nrGf9D
Bubblegum V2:    BGUMAp9Gq7iTEuizy4pqaxsTyUCBK68MDfK752saRPUY
Core Candy:      CMACYFENjoBMHzapRXyo1JZkVS6EtaDDzkjMrmQLvr4J
```

## Quick Decision Guide

### Autonomous Agents

Use **Agent Registry** to register on-chain identity and execution delegation for MPL Core assets. Any Core asset already has a built-in wallet (Asset Signer PDA) via Core's Execute hook — the registry adds discoverable identity records and lets owners delegate an off-chain executive to operate the agent. Read `./references/cli-agent.md` (CLI) or `./references/sdk-umi.md` + `./references/sdk-agent.md` (SDK).

### Token Launches (Token Generation Event / Fair Launch / Memecoin)

Use **Genesis**. The **Launch API** (`genesis launch create` / `createAndRegisterLaunch`) is recommended — it handles everything in one step. Two launch types:
- **`project`** (default): Configurable allocations, 48h deposit, team vesting support
- **`memecoin`**: Simplified, 1h deposit, hardcoded fund flows — only needs name, symbol, image, and deposit start time

Read `./references/cli.md` + `./references/cli-genesis.md` (CLI) or `./references/sdk-genesis.md` (SDK).

### NFTs: Core vs Token Metadata

| Choose | When |
|--------|------|
| **Core** | New NFT projects, lower cost (87% cheaper), plugins, royalty enforcement |
| **Token Metadata** | Existing TM collections, need editions, pNFTs for legacy compatibility |

### Compressed NFTs (Massive Scale)

Use **Bubblegum** when minting thousands+ of NFTs at minimal cost. See `./references/cli-bubblegum.md` (CLI) or `./references/sdk-bubblegum.md` (SDK).

### Fungible Tokens

Always use **Token Metadata**. Read `./references/cli-toolbox.md` for CLI commands.

### NFT Drops

Use **Core Candy Machine**. Read `./references/cli.md` + `./references/cli-candy-machine.md`.

### Asset as Agent / Vault / Wallet (Execute)

Use **Core Execute** when an asset (NFT, agent, vault) needs to hold SOL/tokens, transfer funds, sign transactions, or own other assets. Every Core asset has a signer PDA that can act as an autonomous wallet. Read `./references/cli-core.md` (CLI) or `./references/sdk-core.md` (SDK), execute section.

## External Resources

- Documentation: https://metaplex.com/docs
- Agent Registry: https://metaplex.com/docs/agents
- Genesis: https://metaplex.com/docs/smart-contracts/genesis
- Core: https://metaplex.com/docs/smart-contracts/core
- Token Metadata: https://metaplex.com/docs/smart-contracts/token-metadata
- Bubblegum: https://metaplex.com/docs/smart-contracts/bubblegum-v2
- Candy Machine: https://metaplex.com/docs/smart-contracts/core-candy-machine
