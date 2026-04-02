# Core CLI Reference

Commands for creating and managing Core NFTs and collections via the `mplx` CLI.

> **Prerequisites**: CLI must be configured (RPC, keypair, funded wallet). If not yet verified this session, see `./cli-initial-setup.md`.

---

## Commands

```bash
# Core Assets
mplx core asset create --name <NAME> --uri <URI>
mplx core asset create --name <NAME> --uri <URI> --owner <ADDR>             # Mint to a different wallet — --owner works on all asset create variants
mplx core asset create --name <NAME> --uri <URI> --collection <ADDR>
mplx core asset create --files --image <PATH> --offchain <PATH>                 # From local files (uploads automatically) — may error on JSON upload; use manual upload workflow as fallback
mplx core asset fetch <ADDR>
mplx core asset update <ASSETID> --name <NAME>
mplx core asset update <ASSETID> --uri <URI>
mplx core asset update <ASSETID> --image <PATH>                             # Re-uploads image via Irys
mplx core asset update <ASSETID> --collectionId <ADDR>                      # Move to different collection
mplx core asset transfer <ASSETID> <NEW_OWNER>                              # Collection is auto-detected from the asset
mplx core asset burn <ADDR>                                                    # Also: --collection <ADDR>, --list <file.json>
mplx core asset template                                                    # Generate template files

# Core Collections
mplx core collection create --name <NAME> --uri <URI>
mplx core collection create --name <NAME> --uri <URI> --pluginsFile <PATH>
mplx core collection fetch <ADDR>
mplx core collection template                                               # Generate template files

# Execute (Asset-Signer Wallets)
mplx core asset execute info <ASSETID>                                      # Show signer PDA address and SOL balance
```

---

## Core Plugins

**Plugin file format** (for `--pluginsFile`):

```json
[{
  "type": "Royalties",
  "basisPoints": 500,
  "creators": [{"address": "<CREATOR_ADDRESS>", "percentage": 100}],
  "ruleSet": {"type": "None"}
}]
```

**Available Types:** `Royalties`, `FreezeDelegate`, `BurnDelegate`, `TransferDelegate`, `Attributes`, `ImmutableMetadata`, `PermanentFreezeDelegate`, `PermanentTransferDelegate`, `PermanentBurnDelegate`

**RuleSet Options:**
- `{"type": "None"}`
- `{"type": "ProgramAllowList", "programs": [...]}`
- `{"type": "ProgramDenyList", "programs": [...]}`

**Example - Collection with Royalties:**

```bash
# Create plugins.json
echo '[{
  "type": "Royalties",
  "basisPoints": 500,
  "creators": [{"address": "<CREATOR_ADDRESS>", "percentage": 100}],
  "ruleSet": {"type": "None"}
}]' > plugins.json

# Create collection with plugins
mplx core collection create \
  --name "My Collection" \
  --uri "https://gateway.irys.xyz/xxx" \
  --pluginsFile ./plugins.json
```

Note: `basisPoints: 500` = 5%. Creator percentages must total 100.

---

## Metadata Workflow

### Before Creating - Gather from User:
- Name
- Description (optional)
- Attributes (optional)
- Image file
- For collections: Ask if they want royalties

### Single NFT/Collection

```bash
# Option A: Local files (one step) - recommended
mplx core asset create --files --image ./image.png --offchain ./metadata.json

# Option B: Manual upload workflow
# 1. Upload image
mplx toolbox storage upload ./image.png
# Returns: https://gateway.irys.xyz/<IMAGE_HASH>

# 2. Create metadata.json — follow the NFT schema in metadata-json.md, set image URI to above

# 3. Upload metadata
mplx toolbox storage upload ./metadata.json
# Returns: https://gateway.irys.xyz/<META_HASH>

# 4. Create asset
mplx core asset create --name "My NFT" --uri "https://gateway.irys.xyz/<META_HASH>"
```

### Multiple NFTs (Batch)

```bash
# 1. Upload all images at once
mplx toolbox storage upload ./images --directory

# 2. Create metadata files — one per NFT, each following the NFT schema in metadata-json.md
# Set each "image" + properties.files[0].uri to the corresponding uploaded image URI

# 3. Upload all metadata at once
mplx toolbox storage upload ./meta --directory

# 4. Create all assets (ONE command)
mplx core asset create --name "NFT #1" --uri "<META_URI_1>" --collection <ADDR> && \
mplx core asset create --name "NFT #2" --uri "<META_URI_2>" --collection <ADDR> && \
mplx core asset create --name "NFT #3" --uri "<META_URI_3>" --collection <ADDR>
```

---

## Execute (Asset-Signer Wallets)

Every MPL Core asset has a deterministic **signer PDA** that can hold SOL, tokens, and own other assets. Asset-signer wallets let you use this PDA as your active wallet — all CLI commands automatically operate through the PDA.

> **How it works**: When an asset-signer wallet is active, `umi.identity` and `umi.payer` are set to the PDA. At send time, the transaction is wrapped in MPL Core's `execute` instruction, which signs on behalf of the PDA on-chain. The real wallet (asset owner) signs the outer transaction.

### Setup

```bash
# 1. Check the PDA info for any asset
mplx core asset execute info <ASSETID>

# 2. Fund the PDA
mplx toolbox sol transfer 0.1 <signerPdaAddress>

# 3. Register as a wallet
mplx config wallets add vault --asset <ASSETID>

# 4. Switch to the asset-signer wallet
mplx config wallets set vault

# 5. Use any command as the PDA
mplx toolbox sol balance
mplx toolbox sol transfer 0.01 <destination>
mplx core asset create --name "PDA Created NFT" --uri "https://example.com/nft"

# Switch back to normal wallet
mplx config wallets set my-wallet
```

> Pass `-k /path/to/wallet.json` to bypass the asset-signer wallet for a single command.
> Use `-p /path/to/fee-payer.json` to have a different wallet pay transaction fees.

### Supported Commands

Most CLI commands work with asset-signer wallets. The transaction wrapping is transparent.

- **Core**: `asset create`, `asset transfer`, `asset burn`, `asset update`, `collection create`
- **Toolbox SOL**: `balance`, `transfer` (`wrap`/`unwrap` may fail; see CPI limitations)
- **Toolbox Token**: `transfer`, `create`, `mint`
- **Toolbox Raw**: `raw --instruction <base64>`
- **Token Metadata**: `transfer`, `create`, `update`
- **Bubblegum**: `nft create` (public trees), `nft transfer`, `nft burn`, `collection create`
- **Genesis**: `create`, `bucket add-*`, `deposit`, `withdraw`, `claim`, `finalize`, `revoke`

### Raw Instructions

```bash
# Execute arbitrary base64-encoded instructions as the PDA
mplx toolbox raw --instruction <base64>
mplx toolbox raw --instruction <ix1> --instruction <ix2>
echo "<base64>" | mplx toolbox raw --stdin
```

### CPI Limitations

Some operations cannot be wrapped in `execute()` due to Solana CPI constraints:
- **Large account creation** — Merkle trees, candy machines (exceed CPI account allocation limits)
- **Native SOL wrapping** — `transferSol` to a token account fails in CPI context

For these, use a normal wallet to create the infrastructure first, then switch to the asset-signer wallet for subsequent operations.
