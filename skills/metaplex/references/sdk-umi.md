# Metaplex Umi SDK Reference

Umi is Metaplex's modular JavaScript framework for Solana program clients.

## Packages

| Package | Purpose |
|---------|---------|
| `@metaplex-foundation/umi-bundle-defaults` | Base Umi setup |
| `@metaplex-foundation/mpl-token-metadata` | Token Metadata (NFTs, fungibles) |
| `@metaplex-foundation/mpl-core` | Core NFT standard |
| `@metaplex-foundation/mpl-bubblegum` | Compressed NFTs (Bubblegum) |
| `@metaplex-foundation/umi-uploader-irys` | Upload to Arweave via Irys |
| `@metaplex-foundation/umi-signer-wallet-adapters` | Wallet adapter integration |
| `@metaplex-foundation/mpl-toolbox` | SPL token helpers (transfers, compute budget) |
| `@metaplex-foundation/digital-asset-standard-api` | DAS API (asset queries) |

## Installation

```bash
npm install @metaplex-foundation/umi-bundle-defaults \
  @metaplex-foundation/mpl-core \
  @metaplex-foundation/mpl-token-metadata \
  @metaplex-foundation/mpl-toolbox \
  @metaplex-foundation/digital-asset-standard-api
# Optional — add if needed:
#   @metaplex-foundation/umi-uploader-irys (for uploading files)
#   @metaplex-foundation/umi-signer-wallet-adapters (for browser wallet integration)
```

---

## Basic Setup

### Browser / Wallet Adapter

```typescript
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import { walletAdapterIdentity } from '@metaplex-foundation/umi-signer-wallet-adapters';
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';

const umi = createUmi('https://api.devnet.solana.com')
  .use(mplCore())
  .use(mplTokenMetadata())
  .use(walletAdapterIdentity(wallet))
  .use(irysUploader());
```

### Node.js / Scripts (Keypair from File)

```typescript
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';
import fs from 'fs';

// Create Umi first, then load keypair using its eddsa helper
const umi = createUmi('https://api.devnet.solana.com')
  .use(mplCore())
  .use(mplTokenMetadata());

const secretKey = JSON.parse(fs.readFileSync('/path/to/keypair.json', 'utf-8'));
const keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(secretKey));
umi.use(keypairIdentity(keypair));
```

---

## Program-Specific SDK Guides

| Program | Detail File |
|---------|-------------|
| Core NFTs | `./sdk-core.md` |
| Token Metadata | `./sdk-token-metadata.md` |
| Bubblegum (compressed NFTs) | `./sdk-bubblegum.md` |
| Genesis (token launches) | `./sdk-genesis.md` |
| Token Metadata with Kit | `./sdk-token-metadata-kit.md` |

---

## Transaction Patterns

### Chaining Instructions

```typescript
await createV1(umi, { ...args })
  .add(anotherInstruction(umi, { ...args }))
  .sendAndConfirm(umi);
```

### Compute Budget

```typescript
import { setComputeUnitLimit, setComputeUnitPrice } from '@metaplex-foundation/mpl-toolbox';

await createV1(umi, { ...args })
  .prepend(setComputeUnitLimit(umi, { units: 200_000 }))
  .prepend(setComputeUnitPrice(umi, { microLamports: 5000 }))
  .sendAndConfirm(umi);
```

### Safe Fetch (returns null if not found)

```typescript
import { safeFetchMetadata } from '@metaplex-foundation/mpl-token-metadata';

const metadata = await safeFetchMetadata(umi, metadataPda);
if (metadata) {
  // exists
}
```

Use `safeFetch*` variants when the account may not exist (e.g., checking if a mint has metadata). Regular `fetch*` throws if the account is missing.

---

## Uploading

```typescript
import { irysUploader } from '@metaplex-foundation/umi-uploader-irys';

const umi = createUmi(rpcEndpoint).use(irysUploader());

// Upload file
const [imageUri] = await umi.uploader.upload([imageFile]);

// Upload JSON — follow the full NFT metadata schema (see metadata-json.md)
const metadataUri = await umi.uploader.uploadJson({
  name: 'My NFT',
  description: 'Description',           // optional
  image: imageUri,
  external_url: 'https://yourproject.com', // optional but recommended
  animation_url: animationUri,           // optional, omit if not applicable
  attributes: [{ trait_type: 'Background', value: 'Blue' }], // optional but recommended
  properties: {
    files: [{ uri: imageUri, type: 'image/png' }],
    category: 'image',
  },
});
```

---

## DAS API (Asset Queries)

> **Important**: DAS API requires a DAS-compatible RPC provider (e.g., Helius, Triton, QuickNode). The default public Solana RPC does **not** support DAS methods.

```typescript
import { dasApi } from '@metaplex-foundation/digital-asset-standard-api';

const umi = createUmi('https://mainnet.helius-rpc.com/?api-key=YOUR_KEY').use(dasApi());

// Single asset by ID
const asset = await umi.rpc.getAsset(assetId);

// By owner
const assets = await umi.rpc.getAssetsByOwner({ owner: walletAddress });

// By collection
const collectionAssets = await umi.rpc.getAssetsByCollection({
  collection: collectionAddress
});

// Search
const results = await umi.rpc.searchAssets({
  owner: walletAddress,
  burnt: false,
});
```

---

## Error Handling

```typescript
try {
  await instruction.sendAndConfirm(umi);
} catch (error) {
  if (error.name === 'TokenMetadataError') {
    console.error('Token Metadata Error:', error.message);
  }
  throw error;
}
```
