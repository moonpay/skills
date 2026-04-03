# Metaplex CLI Reference

## Installation

```bash
npm install -g @metaplex-foundation/cli
```

## Command Discovery

```bash
mplx --help                    # List all topics
mplx <topic> --help            # e.g., mplx core --help
mplx <topic> <cmd> --help      # e.g., mplx core asset create --help
```

Topics: `config`, `toolbox`, `core`, `tm`, `cm`, `bg`, `agents`, `genesis`

---

## Quick Command Index

| Topic | Detail File |
|-------|-------------|
| Initial Setup | `./cli-initial-setup.md` |
| Core Assets/Collections | `./cli-core.md` |
| Token Metadata NFTs/pNFTs | `./cli-token-metadata.md` |
| Bubblegum (compressed NFTs) | `./cli-bubblegum.md` |
| Candy Machine (NFT drops) | `./cli-candy-machine.md` |
| Genesis (Token Launches) | `./cli-genesis.md` |
| Agent Registry (Identity, Delegation) | `./cli-agent.md` |
| Config & RPC Management | `./cli-config.md` |
| Toolbox (Storage, SOL, Tokens) | `./cli-toolbox.md` |
| Localnet & Troubleshooting | `./cli-troubleshooting.md` |

---

## JSON Output (Agent Use)

All commands support `--json` for structured machine-readable output:

```bash
mplx core asset create --name "My NFT" --uri "https://..." --json
mplx genesis launch create --name "My Token" ... --json
mplx toolbox sol balance --json
```

Returns a JSON object instead of formatted text. Use this when running the CLI programmatically or from an agent — the output shape is consistent and parseable.

> **Note**: `--offchain <file>` is the flag for passing a local offchain metadata JSON file to upload. This is separate from `--json` (which controls output format).

---

## Wizard Mode

Several commands support `--wizard` for interactive guided creation:

| Command | Wizard |
|---------|--------|
| `mplx toolbox token create --wizard` | Token name, symbol, decimals, image, mint amount |
| `mplx tm create --wizard` | NFT type, metadata, collection, royalties |
| `mplx bg tree create --wizard` | Tree depth, buffer size, canopy |
| `mplx bg nft create --wizard` | cNFT metadata, tree selection, collection |
| `mplx cm create --wizard` | Full candy machine setup, upload, and insert |

Wizards are recommended for first-time operations or when unsure about required parameters.

> **Agent note**: Wizards are interactive (require user input at prompts). When running programmatically or as an agent, prefer explicit flags instead of `--wizard`.

---

## Local Files Workflow (`--files`)

Some commands can upload files and create assets in one step, as an alternative to manual upload -> create:

```bash
# Core asset from local files (uploads image + JSON, then creates)
# Prepare metadata.json first — follow the NFT schema in metadata-json.md
mplx core asset create --files --image ./image.png --offchain ./metadata.json

# TM NFT from local files (no --files flag needed for tm)
mplx tm create --image ./image.png --offchain ./metadata.json

# Fungible token always uses local image (no --files flag needed)
mplx toolbox token create --name "My Token" --symbol "MTK" --decimals 9 --image ./image.png
```

If `--files` fails (e.g., upload timeout), fall back to the manual workflow:
1. `mplx toolbox storage upload <PATH>` to upload separately
2. Then create with `--uri` pointing to the uploaded URI

---

## Batching Principle

> **CRITICAL**: Always chain commands with `&&` to minimize user approvals. One approval per logical step.

```bash
# Setup checks - ONE command
mplx config get rpcUrl && mplx config get keypair && mplx toolbox sol balance

# File creation - ONE command (each file must follow the NFT JSON schema — see metadata-json.md)
# Create one .json file per NFT with the correct schema before running uploads

# Uploads - use --directory for folders
mplx toolbox storage upload ./assets --directory

# Multiple asset creates - ONE command
mplx core asset create --name "NFT #1" --uri "<URI_1>" --collection <ADDR> && \
mplx core asset create --name "NFT #2" --uri "<URI_2>" --collection <ADDR> && \
mplx core asset create --name "NFT #3" --uri "<URI_3>" --collection <ADDR>
```

**NEVER** run multiple uploads or creates as separate commands - that requires one approval per command.

---

## Explorer Links

```
# Core assets/collections
https://core.metaplex.com/explorer/<ADDRESS>?env=devnet    # Devnet
https://core.metaplex.com/explorer/<ADDRESS>               # Mainnet

# Token Metadata NFTs / Tokens
https://explorer.solana.com/address/<MINT_ADDRESS>?cluster=devnet  # Devnet
https://explorer.solana.com/address/<MINT_ADDRESS>                 # Mainnet

# Transactions
https://explorer.solana.com/tx/<SIGNATURE>?cluster=devnet  # Devnet
https://explorer.solana.com/tx/<SIGNATURE>                 # Mainnet
```

> **IMPORTANT**: Always add `?env=devnet` or `?cluster=devnet` when on devnet.

> **Localnet note**: The CLI generates devnet explorer links even when connected to localhost. For localnet, use Solana Explorer with a custom cluster URL: `https://explorer.solana.com/address/<ADDRESS>?cluster=custom&customUrl=http://localhost:8899`

