---
id: references/sui-grpc-signature-verification.md
name: 'Sui gRPC Signature Verification'
description: 'SignatureVerificationService for verifying user signatures on Sui, including ZkLogin support.'
tags:
  - alchemy
  - sui
  - grpc
related:
  - sui-grpc-overview.md
updated: 2026-04-15
---
# Sui gRPC — Signature Verification

## Summary
Verify user signatures against messages and addresses on Sui. Supports standard signatures and ZkLogin signatures.

## Methods

| gRPC Method | JSON-RPC Equivalent | Description |
| --- | --- | --- |
| `VerifySignature` | No equivalent | Verify a user signature against a message and address |

## VerifySignature
- Requires `address`, `signature` (BCS-encoded), and `message` (BCS-encoded).
- Optional `jwks` parameter for ZkLogin signature verification (Active JSON Web Keys).
- Returns `is_valid` boolean and `reason` string on failure.

## Service Path
`sui.rpc.v2.SignatureVerificationService`

## Related Files
- `sui-grpc-overview.md`

## Official Docs
- [Signature Verification](https://www.alchemy.com/docs/reference/sui-grpc-signature-verification)
