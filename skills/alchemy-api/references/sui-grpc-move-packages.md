---
id: references/sui-grpc-move-packages.md
name: 'Sui gRPC Move Packages'
description: 'MovePackageService methods for inspecting Move packages, functions, and data types on Sui via gRPC.'
tags:
  - alchemy
  - sui
  - grpc
related:
  - sui-grpc-overview.md
updated: 2026-04-15
---
# Sui gRPC — Move Packages (MovePackageService)

## Summary
Inspect Move packages, functions, and data types on Sui.

## Methods

| gRPC Method | JSON-RPC Equivalent | Description |
| --- | --- | --- |
| `GetPackage` | `sui_getNormalizedMoveModulesByPackage` | Fetch a Move package by ID |
| `GetFunction` | `sui_getNormalizedMoveFunction` | Fetch a function definition by package, module, and name |
| `GetDatatype` | `sui_getNormalizedMoveStruct` | Fetch a Move struct/datatype definition |
| `ListPackageVersions` | No equivalent | List all versions of a package |

## Key Patterns
- `GetFunction` requires `package_id`, `module_name`, and `name`.
- `GetDatatype` requires `package_id`, `module_name`, and `name`.
- Use `ListPackageVersions` to discover upgrade history for a package.

## Service Path
`sui.rpc.v2.MovePackageService`

## Related Files
- `sui-grpc-overview.md`

## Official Docs
- [Move Packages](https://www.alchemy.com/docs/reference/sui-grpc-move-packages)
