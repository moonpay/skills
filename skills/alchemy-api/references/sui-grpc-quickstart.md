---
id: references/sui-grpc-quickstart.md
name: 'Sui gRPC Quickstart'
description: 'Get started with Sui gRPC — endpoints, authentication, and first calls.'
tags:
  - alchemy
  - sui
  - grpc
related:
  - sui-grpc-overview.md
  - sui-grpc-objects-and-ledger.md
  - operational-auth-and-keys.md
updated: 2026-04-22
---
# Sui gRPC Quickstart

## Summary
Connect to Alchemy's Sui gRPC API and make your first calls.

## Prerequisites
- An Alchemy API key.
- A gRPC client library (or `grpcurl` for CLI testing).
- [Sui gRPC proto definitions](https://github.com/MystenLabs/sui-apis) cloned locally (grpcurl requires `.proto` files).

## Endpoints

| Network | Endpoint |
| --- | --- |
| Mainnet | `sui-mainnet.g.alchemy.com:443` |
| Testnet | `sui-testnet.g.alchemy.com:443` |

## Authentication
Bearer token in the request metadata header:
```
-H "Authorization: Bearer <YOUR_API_KEY>"
```

## Quick Verification
Call `GetServiceInfo` to verify your connection:
```bash
grpcurl \
  -H "Authorization: Bearer <YOUR_API_KEY>" \
  -import-path proto \
  -proto sui/rpc/v2/ledger_service.proto \
  -d '{}' \
  sui-mainnet.g.alchemy.com:443 \
  sui.rpc.v2.LedgerService/GetServiceInfo
```

Returns chain name, chain ID, current checkpoint height, and epoch.

## Common First Calls
- **Get an object**: `LedgerService/GetObject` with `object_id` and optional `read_mask`.
- **Get a transaction**: `LedgerService/GetTransaction` with `digest`.
- **Check balance**: `StateService/GetBalance` with `owner` and `coin_type`.

## `read_mask` format
`read_mask` is a protobuf [FieldMask](https://protobuf.dev/reference/protobuf/google.protobuf/#field-mask). In JSON (grpcurl, gRPC-web, etc.) encode it as an **object with a `paths` array**, not a comma-separated string:

```bash
# Correct — FieldMask JSON form
grpcurl -H "Authorization: Bearer <YOUR_API_KEY>" \
  -import-path proto -proto sui/rpc/v2/ledger_service.proto \
  -d '{"object_id": "0x5", "read_mask": {"paths": ["object_id", "version", "digest", "owner"]}}' \
  sui-mainnet.g.alchemy.com:443 sui.rpc.v2.LedgerService/GetObject
```

Passing `read_mask` as a bare string (`"object_id,version,..."`) will be rejected.

## Related Files
- `sui-grpc-overview.md`
- `sui-grpc-objects-and-ledger.md`
- `operational-auth-and-keys.md`

## Official Docs
- [Sui gRPC Quickstart](https://www.alchemy.com/docs/reference/sui-grpc-quickstart)
