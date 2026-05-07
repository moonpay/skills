---
id: references/sui-grpc-overview.md
name: sui-grpc
description: 'High-performance gRPC API for querying and executing on Sui via Alchemy. Supports objects, transactions, balances, Move packages, name service, subscriptions, and signature verification. Use when building Sui integrations that need typed, efficient access with streaming and field masking.'
tags:
  - alchemy
  - sui
  - grpc
related:
  - operational-supported-networks.md
  - operational-auth-and-keys.md
updated: 2026-04-15
metadata:
  author: alchemyplatform
  version: "1.0"
---
# Sui gRPC

## Summary
Sui gRPC is a high-performance API for Sui blockchain access using Protocol Buffers and gRPC. It provides strongly typed, binary-encoded access to objects, transactions, balances, Move packages, name resolution, real-time checkpoint streaming, and signature verification.

## Why Use Sui gRPC Over JSON-RPC
- **Strongly typed** — Protocol Buffers provide strict typing and schema validation.
- **Efficient serialization** — Binary encoding reduces payload size vs JSON.
- **Streaming** — `SubscribeCheckpoints` delivers real-time checkpoint data via server-streaming RPC.
- **Field masking** — Use `read_mask` to request only the fields you need.
- **Batch operations** — Fetch multiple objects or transactions in a single request.

## References (Recommended Order)
1. [sui-grpc-quickstart.md](sui-grpc-quickstart.md) — First gRPC call, endpoints, auth.
2. [sui-grpc-objects-and-ledger.md](sui-grpc-objects-and-ledger.md) — LedgerService: objects, transactions, checkpoints, epochs.
3. [sui-grpc-transactions.md](sui-grpc-transactions.md) — Execute and simulate transactions.
4. [sui-grpc-state-and-balances.md](sui-grpc-state-and-balances.md) — Coin balances, dynamic fields, owned objects.
5. [sui-grpc-move-packages.md](sui-grpc-move-packages.md) — Inspect Move packages and functions.
6. [sui-grpc-name-service.md](sui-grpc-name-service.md) — Resolve SuiNS names.
7. [sui-grpc-subscriptions.md](sui-grpc-subscriptions.md) — Real-time checkpoint streaming.
8. [sui-grpc-signature-verification.md](sui-grpc-signature-verification.md) — Verify user signatures.

## Cross-References
- `operational-supported-networks.md` — Sui mainnet/testnet availability.
- `operational-auth-and-keys.md` — API key management.
- `alchemy-cli` skill for live agent work via the local CLI (preferred local fallback).
- `alchemy-mcp` skill for live agent work via the hosted MCP server (when CLI is not installed).

## Official Docs
- [Sui gRPC Overview](https://www.alchemy.com/docs/reference/sui-grpc-overview)
- [Sui gRPC Quickstart](https://www.alchemy.com/docs/reference/sui-grpc-quickstart)
