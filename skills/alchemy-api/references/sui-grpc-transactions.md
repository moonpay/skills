---
id: references/sui-grpc-transactions.md
name: 'Sui gRPC Transactions'
description: 'TransactionExecutionService for executing and simulating Sui transactions via gRPC.'
tags:
  - alchemy
  - sui
  - grpc
related:
  - sui-grpc-overview.md
  - sui-grpc-objects-and-ledger.md
updated: 2026-04-15
---
# Sui gRPC — Transactions (TransactionExecutionService)

## Summary
Execute and simulate transactions on Sui.

## Methods

| gRPC Method | JSON-RPC Equivalent | Description |
| --- | --- | --- |
| `ExecuteTransaction` | `sui_executeTransactionBlock` | Submit a signed transaction for execution |
| `SimulateTransaction` | `sui_dryRunTransactionBlock` | Simulate execution without submitting (gas estimation, effect preview) |

## ExecuteTransaction
- Requires `transaction` (BCS-encoded) and `signatures` array.
- Optional `read_mask` to control response fields.

## SimulateTransaction
- Requires `transaction` (BCS-encoded).
- Optional `do_gas_selection` for automatic gas coin selection.
- Optional `checks` to enable/disable transaction validation checks.
- Returns simulated effects, command outputs, and suggested gas price.

## Service Path
`sui.rpc.v2.TransactionExecutionService`

## Related Files
- `sui-grpc-overview.md`
- `sui-grpc-objects-and-ledger.md`

## Official Docs
- [Transactions](https://www.alchemy.com/docs/reference/sui-grpc-transactions)
