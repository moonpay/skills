# Token Metadata CLI Reference

Commands for creating and managing Token Metadata NFTs and pNFTs via the `mplx` CLI.

> **Prerequisites**: CLI must be configured (RPC, keypair, funded wallet). If not yet verified this session, see `./cli-initial-setup.md`.

---

## pNFT vs NFT

| Type | Flag | Royalties | Use Case |
|------|------|-----------|----------|
| **pNFT** (default) | _(none)_ | Enforced at protocol level | Recommended for most NFTs |
| **NFT** | `--type nft` | Advisory only | Legacy compatibility, simpler transfers |

## Commands

```bash
# Create
mplx tm create --wizard                                                  # Interactive (recommended)
mplx tm create --name <NAME> --uri <URI>                                 # pNFT (default)
mplx tm create --name <NAME> --uri <URI> --type nft                      # Regular NFT
mplx tm create --name <NAME> --uri <URI> --collection <ADDR>             # In collection
mplx tm create --name <NAME> --royalties <PERCENT>                      # With royalties (see note below)
mplx tm create --image <PATH> --offchain <PATH>                              # From local files (uploads automatically)

# Transfer
mplx tm transfer <MINT> <DESTINATION>

# Update
mplx tm update <MINT> --name <NAME>
mplx tm update <MINT> --uri <URI>
mplx tm update <MINT> --symbol <SYMBOL>
mplx tm update <MINT> --description <DESCRIPTION>
mplx tm update <MINT> --image <PATH>                                     # Re-uploads image
```

**Notes:**
- `--uri` and `--royalties` are **mutually exclusive**. `--royalties` triggers a metadata building + upload flow (prompts for image, description, etc.) which conflicts with providing a pre-made URI. Use one or the other.
- `--royalties` takes a **whole number percentage** (0-100). Example: `--royalties 5` = 5% royalties (500 basis points).
- Default type is pNFT. Use `--type nft` for a regular (non-programmable) NFT.

---

## TM Collection Workflow

TM has no separate collection command. Create a collection NFT, then reference it:

```bash
# 1. Create collection NFT
mplx tm create --name "My Collection" --uri "<COLLECTION_URI>"
# Note the MINT address returned

# 2. Create NFTs in collection
mplx tm create --name "NFT #1" --uri "<URI_1>" --collection <COLLECTION_MINT> && \
mplx tm create --name "NFT #2" --uri "<URI_2>" --collection <COLLECTION_MINT>
```

> **Collection verification**: Unlike Core (which auto-verifies), TM collection items start **unverified**. The CLI handles verification automatically during `mplx tm create --collection`, but if you're building with the SDK you must call `verifyCollectionV1` separately (see `./sdk-token-metadata.md`).
