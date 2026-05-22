---
id: references/sui-grpc-objects-and-ledger.md
name: 'Sui gRPC Objects and Ledger'
description: 'LedgerService methods for querying objects, transactions, checkpoints, and epochs on Sui via gRPC.'
tags:
  - alchemy
  - sui
  - grpc
related:
  - sui-grpc-overview.md
  - sui-grpc-transactions.md
updated: 2026-04-15
---
# Sui gRPC — Objects and Ledger (LedgerService)

## Summary
The `LedgerService` provides methods for querying objects, transactions, checkpoints, epochs, and chain metadata.

## Methods

| gRPC Method | JSON-RPC Equivalent | Description |
| --- | --- | --- |
| `GetObject` | `sui_getObject` | Fetch a single object by ID (optionally at a version) |
| `BatchGetObjects` | `sui_multiGetObjects` | Fetch multiple objects in one request |
| `GetTransaction` | `sui_getTransactionBlock` | Fetch a transaction by digest |
| `BatchGetTransactions` | `sui_multiGetTransactionBlocks` | Fetch multiple transactions |
| `GetCheckpoint` | `sui_getCheckpoint` | Fetch a checkpoint by sequence number or digest |
| `GetEpoch` | No equivalent | Fetch epoch metadata |
| `GetServiceInfo` | `sui_getChainIdentifier` | Chain metadata, current checkpoint height, epoch |

## Key Patterns
- Use `read_mask` on all methods to request only needed fields (reduces response size).
- Use `BatchGetObjects` / `BatchGetTransactions` for multi-item lookups instead of individual calls.
- `GetServiceInfo` requires no fields — use it as a health check or to get current chain state.

## Service Path
`sui.rpc.v2.LedgerService`

## Related Files
- `sui-grpc-overview.md`
- `sui-grpc-transactions.md`

## Official Docs
- [Objects and Ledger](https://www.alchemy.com/docs/reference/sui-grpc-objects-and-ledger)
