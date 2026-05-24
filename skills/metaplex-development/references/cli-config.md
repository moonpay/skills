# Metaplex CLI — Config

## General

```bash
mplx config                              # Show all config
mplx config get <KEY>                    # KEY: rpcUrl|commitment|payer|keypair
mplx config set <KEY> <VALUE>
```

## RPC Management

```bash
mplx config rpcs add <name> <rpc_url>   # Add a named RPC
mplx config rpcs set <name>             # Set active RPC by name
mplx config set rpcUrl <RPC_URL>        # Set active RPC by URL
```

## Wallets

```bash
mplx config wallets                              # List configured wallets
mplx config wallets new <name> --hidden          # Create a new CLI-managed wallet
mplx config wallets add <name> <path>            # Add existing keypair (e.g., ~/.config/solana/id.json)
mplx config wallets add <name> --asset <ASSETID> # Add an asset-signer wallet
mplx config wallets set <name>                   # Switch active wallet
```

## Storage

```bash
mplx config storage                      # Set active storage provider from available providers
```

## Explorer

```bash
mplx config explorer                     # Set preferred blockchain explorer
```
