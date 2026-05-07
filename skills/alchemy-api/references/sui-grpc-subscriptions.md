---
id: references/sui-grpc-subscriptions.md
name: 'Sui gRPC Subscriptions'
description: 'SubscriptionService for streaming real-time Sui checkpoint data via server-streaming gRPC.'
tags:
  - alchemy
  - sui
  - grpc
related:
  - sui-grpc-overview.md
updated: 2026-04-15
---
# Sui gRPC — Subscriptions (SubscriptionService)

## Summary
Stream real-time checkpoint data from Sui via server-streaming gRPC.

## Methods

| gRPC Method | JSON-RPC Equivalent | Description |
| --- | --- | --- |
| `SubscribeCheckpoints` | No equivalent | Stream new checkpoints as they are finalized |

## Key Patterns
- This is a long-lived server-streaming RPC — the connection stays open and delivers checkpoints in real time.
- Use `read_mask` to control which checkpoint fields are included.
- Response includes a `cursor` for resuming the stream after disconnection.
- Handle reconnection and backpressure in your client.

## Service Path
`sui.rpc.v2.SubscriptionService`

## Related Files
- `sui-grpc-overview.md`

## Official Docs
- [Subscriptions](https://www.alchemy.com/docs/reference/sui-grpc-subscriptions)
