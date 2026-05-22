---
id: references/sui-grpc-state-and-balances.md
name: 'Sui gRPC State and Balances'
description: 'StateService methods for querying coin balances, dynamic fields, and owned objects on Sui via gRPC.'
tags:
  - alchemy
  - sui
  - grpc
related:
  - sui-grpc-overview.md
  - sui-grpc-objects-and-ledger.md
updated: 2026-04-15
---
# Sui gRPC — State and Balances (StateService)

## Summary
Query coin balances, dynamic fields, and owned objects on Sui.

## Methods

| gRPC Method | JSON-RPC Equivalent | Description |
| --- | --- | --- |
| `GetBalance` | `suix_getBalance` | Get balance of a specific coin type for an owner |
| `ListBalances` | `suix_getAllBalances`, `suix_getCoins`, `suix_getAllCoins` | List all coin balances for an owner (paginated) |
| `GetCoinInfo` | `suix_getCoinMetadata`, `suix_getTotalSupply` | Get coin metadata and total supply |
| `ListDynamicFields` | `suix_getDynamicFields` | List dynamic fields of an object (paginated) |
| `ListOwnedObjects` | `suix_getOwnedObjects` | List objects owned by an address (paginated) |

## Key Patterns
- `GetBalance` requires both `owner` and `coin_type` (e.g., `0x2::sui::SUI`).
- Paginated methods (`ListBalances`, `ListDynamicFields`, `ListOwnedObjects`) accept `page_size` and `page_token`.
- Use `read_mask` on `ListOwnedObjects` to control which object fields are returned.

## Service Path
`sui.rpc.v2.StateService`

## Related Files
- `sui-grpc-overview.md`
- `sui-grpc-objects-and-ledger.md`

## Official Docs
- [State and Balances](https://www.alchemy.com/docs/reference/sui-grpc-state-and-balances)
