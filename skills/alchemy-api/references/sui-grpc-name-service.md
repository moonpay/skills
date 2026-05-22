---
id: references/sui-grpc-name-service.md
name: 'Sui gRPC Name Service'
description: 'NameService methods for resolving SuiNS names to addresses and reverse lookups via gRPC.'
tags:
  - alchemy
  - sui
  - grpc
related:
  - sui-grpc-overview.md
updated: 2026-04-15
---
# Sui gRPC — Name Service

## Summary
Resolve SuiNS names to addresses and perform reverse lookups.

## Methods

| gRPC Method | JSON-RPC Equivalent | Description |
| --- | --- | --- |
| `LookupName` | `suix_resolveNameServiceAddress` | Resolve a SuiNS name (e.g., `example.sui`) to its address |
| `ReverseLookupName` | `suix_resolveNameServiceNames` | Resolve an address to its SuiNS name |

## Service Path
`sui.rpc.v2.NameService`

## Related Files
- `sui-grpc-overview.md`

## Official Docs
- [Name Service](https://www.alchemy.com/docs/reference/sui-grpc-name-service)
