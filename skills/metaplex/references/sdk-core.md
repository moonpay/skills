# Core SDK Reference (Umi)

Umi SDK operations for creating and managing Core NFTs and collections.

> **Prerequisites**: Set up Umi first — see `./sdk-umi.md` for installation and basic setup.
> **Docs**: https://metaplex.com/docs/smart-contracts/core

> **Important**: When passing plugins, use the helper functions (`create`, `createCollection`, `addPlugin`, `addCollectionPlugin`, `updatePlugin`, `removePlugin`). The raw generated functions (`createV1`, `addPluginV1`, etc.) expect a different internal plugin format and will error with the friendly `{ type: 'Royalties', ... }` syntax.

> **Fetch-first pattern**: The helpers `update`, `burn`, `freezeAsset`, `thawAsset` require a **fetched** asset object (from `fetchAsset`), not just an address. This is because they automatically derive external plugin adapter accounts.

> **Off-chain metadata**: Before creating an asset, upload a metadata JSON to Arweave/IPFS. See `./metadata-json.md` for the canonical schema. The resulting URI is passed as the `uri` parameter.

---

## Create Asset

```typescript
import { create, fetchAsset } from '@metaplex-foundation/mpl-core';
import { generateSigner } from '@metaplex-foundation/umi';

const asset = generateSigner(umi);

await create(umi, {
  asset,
  name: 'My Core NFT',
  uri: 'https://arweave.net/xxx',
}).sendAndConfirm(umi);

const fetchedAsset = await fetchAsset(umi, asset.publicKey);
```

## Create Collection

```typescript
import { createCollection } from '@metaplex-foundation/mpl-core';

const collection = generateSigner(umi);

await createCollection(umi, {
  collection,
  name: 'My Collection',
  uri: 'https://arweave.net/xxx',
}).sendAndConfirm(umi);
```

## Create Collection with Plugins (Single Step)

```typescript
import { createCollection, ruleSet } from '@metaplex-foundation/mpl-core';

const collection = generateSigner(umi);

await createCollection(umi, {
  collection,
  name: 'My Collection',
  uri: 'https://arweave.net/xxx',
  plugins: [
    {
      type: 'Royalties',
      basisPoints: 500,
      creators: [{ address: umi.identity.publicKey, percentage: 100 }],
      ruleSet: ruleSet('None'),
    },
  ],
}).sendAndConfirm(umi);
```

## Create Asset in Collection

```typescript
await create(umi, {
  asset: generateSigner(umi),
  collection,  // pass the fetched collection object, not just the publicKey
  name: 'Asset #1',
  uri: 'https://arweave.net/xxx',
}).sendAndConfirm(umi);
```

> The `create` helper requires a collection **object** (from `fetchCollection` or `createCollection`'s signer), not a bare public key. Passing `collection.publicKey` silently creates the asset without a collection association.

## Create Asset with Plugins (Single Step)

```typescript
import { create, ruleSet } from '@metaplex-foundation/mpl-core';

await create(umi, {
  asset: generateSigner(umi),
  name: 'My NFT with Royalties',
  uri: 'https://arweave.net/xxx',
  plugins: [
    {
      type: 'Royalties',
      basisPoints: 500,
      creators: [{ address: creatorAddress, percentage: 100 }],
      ruleSet: ruleSet('None'),
    },
  ],
}).sendAndConfirm(umi);
```

## Update Asset

Requires fetching the asset first (see "Fetch-first pattern" note above).

```typescript
import { update, fetchAsset } from '@metaplex-foundation/mpl-core';

const asset = await fetchAsset(umi, assetAddress);

await update(umi, {
  asset,
  name: 'Updated Name',
  uri: 'https://arweave.net/new-uri',
}).sendAndConfirm(umi);
```

> If the asset's `updateAuthority.type` is `'Collection'` (update authority delegated to the collection), also pass the fetched collection: `await update(umi, { asset, collection: await fetchCollection(umi, collectionAddr), name: '...' })`. By default, assets have `Address` update authority and don't need this.

## Update Collection

```typescript
import { updateCollection } from '@metaplex-foundation/mpl-core';

await updateCollection(umi, {
  collection: collectionAddress,
  name: 'Updated Collection Name',
  uri: 'https://arweave.net/new-uri',
}).sendAndConfirm(umi);
```

## Burn Asset

Requires fetching the asset first.

```typescript
import { burn, fetchAsset } from '@metaplex-foundation/mpl-core';

const asset = await fetchAsset(umi, assetAddress);
await burn(umi, { asset }).sendAndConfirm(umi);
```

> Same as `update`: only pass `collection` if the asset's `updateAuthority.type` is `'Collection'`.

## Fetch

```typescript
import {
  fetchAsset,
  fetchCollection,
  fetchAssetsByOwner,
  fetchAssetsByCollection,
} from '@metaplex-foundation/mpl-core';

// Single asset
const asset = await fetchAsset(umi, assetAddress);

// Single collection
const collection = await fetchCollection(umi, collectionAddress);

// All assets owned by a wallet
const ownerAssets = await fetchAssetsByOwner(umi, ownerAddress);

// All assets in a collection
const collectionAssets = await fetchAssetsByCollection(umi, collectionAddress);
```

> `fetchAssetsByOwner` and `fetchAssetsByCollection` use GPA (getProgramAccounts) queries. They may throw deserialization errors if the wallet/collection has burned asset account remnants. For production, prefer DAS API queries (see `./sdk-umi.md` DAS section).

## Transfer Asset

```typescript
import { transferV1 } from '@metaplex-foundation/mpl-core';

await transferV1(umi, {
  asset: assetAddress,
  newOwner: recipientAddress,
}).sendAndConfirm(umi);
```

If the asset is in a collection, pass `collection`:

```typescript
await transferV1(umi, {
  asset: assetAddress,
  newOwner: recipientAddress,
  collection: collectionAddress,
}).sendAndConfirm(umi);
```

---

## Plugins

Available plugin types: `Royalties`, `FreezeDelegate`, `BurnDelegate`, `TransferDelegate`, `UpdateDelegate`, `PermanentFreezeDelegate`, `PermanentTransferDelegate`, `PermanentBurnDelegate`, `Attributes`, `Edition`, `MasterEdition`, `AddBlocker`, `ImmutableMetadata`, `VerifiedCreators`, `Autograph`.

### Add Plugin — After Creation

```typescript
import { addPlugin, ruleSet } from '@metaplex-foundation/mpl-core';

// Add to asset
await addPlugin(umi, {
  asset: assetAddress,
  plugin: {
    type: 'Royalties',
    basisPoints: 500,
    creators: [{ address: creatorAddress, percentage: 100 }],
    ruleSet: ruleSet('None'),
  },
}).sendAndConfirm(umi);
```

### Add Plugin to Collection

```typescript
import { addCollectionPlugin, ruleSet } from '@metaplex-foundation/mpl-core';

await addCollectionPlugin(umi, {
  collection: collectionAddress,
  plugin: {
    type: 'Royalties',
    basisPoints: 500,
    creators: [{ address: creatorAddress, percentage: 100 }],
    ruleSet: ruleSet('None'),
  },
}).sendAndConfirm(umi);
```

### Update Plugin

```typescript
import { updatePlugin } from '@metaplex-foundation/mpl-core';

// Update asset plugin (e.g., change royalty percentage)
await updatePlugin(umi, {
  asset: assetAddress,
  plugin: {
    type: 'Royalties',
    basisPoints: 750,
    creators: [{ address: creatorAddress, percentage: 100 }],
    ruleSet: ruleSet('None'),
  },
}).sendAndConfirm(umi);

// Update collection plugin
import { updateCollectionPlugin } from '@metaplex-foundation/mpl-core';

await updateCollectionPlugin(umi, {
  collection: collectionAddress,
  plugin: {
    type: 'Royalties',
    basisPoints: 750,
    creators: [{ address: creatorAddress, percentage: 100 }],
    ruleSet: ruleSet('None'),
  },
}).sendAndConfirm(umi);
```

### Remove Plugin

```typescript
import { removePlugin, removeCollectionPlugin } from '@metaplex-foundation/mpl-core';

// From asset
await removePlugin(umi, {
  asset: assetAddress,
  plugin: { type: 'FreezeDelegate' },
}).sendAndConfirm(umi);

// From collection
await removeCollectionPlugin(umi, {
  collection: collectionAddress,
  plugin: { type: 'Attributes' },
}).sendAndConfirm(umi);
```

### Delegate Plugin Authority

```typescript
import { approvePluginAuthority } from '@metaplex-foundation/mpl-core';

await approvePluginAuthority(umi, {
  asset: assetAddress,
  plugin: { type: 'FreezeDelegate' },
  newAuthority: { type: 'Address', address: delegateAddress },
}).sendAndConfirm(umi);
```

### Revoke Plugin Authority

Owner-managed plugins (Freeze, Transfer, Burn delegates) revert to `Owner` authority. Authority-managed plugins revert to `UpdateAuthority`. Owner-managed delegates are **auto-revoked on transfer**.

```typescript
import { revokePluginAuthority } from '@metaplex-foundation/mpl-core';

await revokePluginAuthority(umi, {
  asset: assetAddress,
  plugin: { type: 'FreezeDelegate' },
}).sendAndConfirm(umi);
```

---

## Freeze / Thaw

Requires `FreezeDelegate` plugin on the asset. The delegate authority (or owner, if no delegate) can freeze/thaw. Requires fetching the asset first.

```typescript
import { freezeAsset, thawAsset, fetchAsset } from '@metaplex-foundation/mpl-core';

const asset = await fetchAsset(umi, assetAddress);

// Freeze (prevents transfer and burn)
await freezeAsset(umi, {
  asset,
  delegate: delegateSigner.publicKey,
  authority: delegateSigner,
}).sendAndConfirm(umi);

// Thaw (re-enables transfer and burn)
const frozenAsset = await fetchAsset(umi, assetAddress);
await thawAsset(umi, {
  asset: frozenAsset,
  delegate: delegateSigner.publicKey,
  authority: delegateSigner,
}).sendAndConfirm(umi);
```

Alternative: use `updatePlugin` to toggle freeze state directly:

```typescript
import { updatePlugin } from '@metaplex-foundation/mpl-core';

await updatePlugin(umi, {
  asset: assetAddress,
  plugin: { type: 'FreezeDelegate', frozen: true },  // or false to thaw
}).sendAndConfirm(umi);
```

---

## Soulbound NFTs

Non-transferable tokens using `PermanentFreezeDelegate` plugin set to `frozen: true`. The `Permanent` prefix means the plugin can only be added at creation time.

### Truly Soulbound (No One Can Unfreeze)

```typescript
await create(umi, {
  asset: generateSigner(umi),
  name: 'Soulbound Token',
  uri: 'https://arweave.net/xxx',
  plugins: [
    {
      type: 'PermanentFreezeDelegate',
      frozen: true,
      authority: { type: 'None' },  // Permanently frozen — no one can thaw
    },
  ],
}).sendAndConfirm(umi);
```

### Controllable Soulbound (Authority Can Unfreeze)

```typescript
await create(umi, {
  asset: generateSigner(umi),
  name: 'Revocable Soulbound',
  uri: 'https://arweave.net/xxx',
  plugins: [
    {
      type: 'PermanentFreezeDelegate',
      frozen: true,
      authority: { type: 'Address', address: adminAddress },  // Admin can unfreeze
    },
  ],
}).sendAndConfirm(umi);
```

### Soulbound Collection

All assets in this collection are frozen at collection level:

```typescript
await createCollection(umi, {
  collection: generateSigner(umi),
  name: 'Soulbound Collection',
  uri: 'https://arweave.net/xxx',
  plugins: [
    {
      type: 'PermanentFreezeDelegate',
      frozen: true,
      authority: { type: 'UpdateAuthority' },  // Update authority can unfreeze
    },
  ],
}).sendAndConfirm(umi);
```

To toggle collection freeze:

```typescript
import { updateCollectionPlugin } from '@metaplex-foundation/mpl-core';

await updateCollectionPlugin(umi, {
  collection: collectionAddress,
  plugin: { type: 'PermanentFreezeDelegate', frozen: false },
}).sendAndConfirm(umi);
```

---

## Execute (Asset-Signer PDA)

Every MPL Core asset has a deterministic **signer PDA** that can hold SOL, tokens, and own other assets. The `execute` function wraps arbitrary instructions so the PDA signs them on-chain via CPI.

> **Permission model**: Only the asset **owner** can call `execute`. Update authority cannot execute.
> **Collection assets**: Pass the `collection` parameter only when `asset.updateAuthority.type === 'Collection'`. Omitting it causes `MissingCollection`; passing it when the asset has `Address`-type update authority causes `InvalidCollection`.

### Single Instruction

```typescript
import { execute, findAssetSignerPda, fetchAsset } from '@metaplex-foundation/mpl-core';
import { transferSol } from '@metaplex-foundation/mpl-toolbox';
import { createNoopSigner, publicKey, sol } from '@metaplex-foundation/umi';

const asset = await fetchAsset(umi, assetAddress);
const assetSigner = findAssetSignerPda(umi, { asset: asset.publicKey });

await execute(umi, {
  asset,
  instructions: transferSol(umi, {
    source: createNoopSigner(publicKey(assetSigner)),
    destination: recipientAddress,
    amount: sol(0.5),
  }),
}).sendAndConfirm(umi);
```

### Multiple Instructions

Chain instructions using `.add()` on a `TransactionBuilder`:

```typescript
await execute(umi, {
  asset,
  instructions: transferSol(umi, {
    source: createNoopSigner(publicKey(assetSigner)),
    destination: recipientAddress,
    amount: sol(0.25),
  }).add(
    transferSol(umi, {
      source: createNoopSigner(publicKey(assetSigner)),
      destination: recipientAddress,
      amount: sol(0.25),
    })
  ),
}).sendAndConfirm(umi);
```

### With Raw Instruction Array

Extract instructions from a builder and pass as `Instruction[]`. When using raw instructions, provide explicit `signers`:

```typescript
const instructions = transferSol(umi, {
  source: createNoopSigner(publicKey(assetSigner)),
  destination: recipientAddress,
  amount: sol(0.5),
}).getInstructions();

await execute(umi, {
  asset,
  instructions,
  signers: [createNoopSigner(publicKey(assetSigner))],
}).sendAndConfirm(umi);
```

### With Collection

```typescript
const { asset, collection } = /* fetched asset and collection */;

await execute(umi, {
  asset,
  collection,
  instructions: transferSol(umi, {
    source: createNoopSigner(publicKey(assetSigner)),
    destination: recipientAddress,
    amount: sol(0.5),
  }),
}).sendAndConfirm(umi);
```

> **CPI limitations**: Large account creation (Merkle trees, candy machines) and native SOL wrapping may fail inside `execute()` due to Solana CPI constraints.

---

## Addressing (Core vs Token Metadata)

Core uses a **single-account model** — asset and collection addresses are the public keys of the `generateSigner()` used at creation, not PDAs derived from other accounts. This means:

- **No PDA derivation needed** to find an asset. The address returned from `create()` IS the asset address.
- To look up assets, use `fetchAssetsByOwner`, `fetchAssetsByCollection`, or DAS API queries.
- Core collections are also direct accounts (not PDAs like TM's Metadata/MasterEdition).

This differs from Token Metadata, where you derive Metadata, MasterEdition, and TokenRecord PDAs from a mint address.
