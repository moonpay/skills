# Token Metadata SDK Reference (Umi)

Umi SDK operations for creating and managing Token Metadata NFTs, pNFTs, and fungible tokens.

> **Prerequisites**: Set up Umi first — see `./sdk-umi.md` for installation and basic setup.
> **Docs**: https://metaplex.com/docs/smart-contracts/token-metadata

---

## Create Fungible Token

```typescript
import { createFungible } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount } from '@metaplex-foundation/umi';

const mint = generateSigner(umi);

await createFungible(umi, {
  mint,
  name: 'My Token',
  symbol: 'MTK',
  uri: 'https://arweave.net/xxx',
  sellerFeeBasisPoints: percentAmount(0),
  decimals: 9,
}).sendAndConfirm(umi);
```

## Create NFT

```typescript
import { createNft } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount } from '@metaplex-foundation/umi';

const mint = generateSigner(umi);

await createNft(umi, {
  mint,
  name: 'My NFT',
  uri: 'https://arweave.net/xxx',
  sellerFeeBasisPoints: percentAmount(5.5),
  creators: [{ address: umi.identity.publicKey, share: 100, verified: false }],
}).sendAndConfirm(umi);
```

## Create pNFT (Programmable)

```typescript
import { createProgrammableNft } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount } from '@metaplex-foundation/umi';

const mint = generateSigner(umi);

await createProgrammableNft(umi, {
  mint,
  name: 'My pNFT',
  uri: 'https://arweave.net/xxx',
  sellerFeeBasisPoints: percentAmount(5),
  creators: [{ address: umi.identity.publicKey, share: 100, verified: false }],
}).sendAndConfirm(umi);
```

pNFTs enforce royalties at the protocol level — the Token Metadata program controls all transfers and enforces `sellerFeeBasisPoints`. No additional plugin is needed (unlike Core's `Royalties` plugin).

## Create Collection NFT (Token Metadata)

In Token Metadata, a collection is itself an NFT. Use `isCollection: true`:

```typescript
import { createNft } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount } from '@metaplex-foundation/umi';

const collectionMint = generateSigner(umi);

await createNft(umi, {
  mint: collectionMint,
  name: 'My Collection',
  uri: 'https://arweave.net/xxx',
  sellerFeeBasisPoints: percentAmount(5),
  isCollection: true,
}).sendAndConfirm(umi);
```

## Create NFT/pNFT in a Collection

Pass the `collection` field when creating. Items start **unverified** — call `verifyCollectionV1` afterward:

```typescript
import { createProgrammableNft, verifyCollectionV1, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner, percentAmount } from '@metaplex-foundation/umi';

const mint = generateSigner(umi);

await createProgrammableNft(umi, {
  mint,
  name: 'My pNFT #1',
  uri: 'https://arweave.net/xxx',
  sellerFeeBasisPoints: percentAmount(5),
  creators: [{ address: umi.identity.publicKey, share: 100, verified: false }],
  collection: { key: collectionMint.publicKey, verified: false },
}).sendAndConfirm(umi);

// Then verify (requires collection update authority)
await verifyCollectionV1(umi, {
  metadata: findMetadataPda(umi, { mint: mint.publicKey }),
  collectionMint: collectionMint.publicKey,
  authority: umi.identity,
}).sendAndConfirm(umi);
```

## Update Metadata

```typescript
import { updateV1, fetchDigitalAsset, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

const da = await fetchDigitalAsset(umi, mintAddress);

await updateV1(umi, {
  mint: mintAddress,
  authority: updateAuthority,
  data: {
    ...da.metadata,              // spread existing fields
    name: 'Updated Name',       // override what you want
  },
  primarySaleHappened: true,
}).sendAndConfirm(umi);
```

To update URI only:

```typescript
await updateV1(umi, {
  mint: mintAddress,
  data: { ...da.metadata, uri: 'https://arweave.net/new-uri' },
}).sendAndConfirm(umi);
```

## Burn

```typescript
import { burnV1, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

// NFT
await burnV1(umi, {
  mint: mintAddress,
  authority: owner,
  tokenOwner: owner.publicKey,
  tokenStandard: TokenStandard.NonFungible,
}).sendAndConfirm(umi);

// pNFT
await burnV1(umi, {
  mint: mintAddress,
  authority: owner,
  tokenOwner: owner.publicKey,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
}).sendAndConfirm(umi);

// Fungible (partial burn)
await burnV1(umi, {
  mint: mintAddress,
  authority: owner,
  tokenOwner: owner.publicKey,
  tokenStandard: TokenStandard.Fungible,
  amount: 1000n,
}).sendAndConfirm(umi);
```

## Lock / Unlock (pNFTs)

pNFTs can be locked by a delegate to prevent transfers. Used for staking, escrowless listings, etc.

```typescript
import { lockV1, unlockV1, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

// Lock (requires Utility, Staking, or Standard delegate)
await lockV1(umi, {
  mint: mintAddress,
  authority: delegateSigner,
  tokenOwner: ownerAddress,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
}).sendAndConfirm(umi);

// Unlock
await unlockV1(umi, {
  mint: mintAddress,
  authority: delegateSigner,
  tokenOwner: ownerAddress,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
}).sendAndConfirm(umi);
```

## Transfer NFT

```typescript
import { transferV1, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';

// Regular NFT
await transferV1(umi, {
  mint: mintAddress,
  authority: owner,
  tokenOwner: owner.publicKey,
  destinationOwner: recipientAddress,
  tokenStandard: TokenStandard.NonFungible,
}).sendAndConfirm(umi);

// pNFT (handles TokenRecord automatically)
await transferV1(umi, {
  mint: mintAddress,
  authority: owner,
  tokenOwner: owner.publicKey,
  destinationOwner: recipientAddress,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
}).sendAndConfirm(umi);
```

## Fetch

```typescript
import {
  fetchDigitalAsset,
  fetchDigitalAssetWithAssociatedToken,
  fetchAllDigitalAssetByOwner,
  fetchAllDigitalAssetByCreator,
  fetchAllDigitalAssetByVerifiedCollection,
} from '@metaplex-foundation/mpl-token-metadata';

// Single asset (metadata + mint + edition)
const da = await fetchDigitalAsset(umi, mintAddress);
// da.metadata, da.mint, da.edition

// Asset with token account
const daWithToken = await fetchDigitalAssetWithAssociatedToken(umi, mintAddress, ownerAddress);
// daWithToken.token, daWithToken.tokenRecord (for pNFTs)

// By owner
const owned = await fetchAllDigitalAssetByOwner(umi, ownerAddress);

// By creator (first verified creator)
const created = await fetchAllDigitalAssetByCreator(umi, creatorAddress);

// By verified collection
const inCollection = await fetchAllDigitalAssetByVerifiedCollection(umi, collectionMintAddress);
```

## Delegates

Token Metadata supports multiple delegate types for pNFTs. Each delegate type grants specific permissions:

- **Standard** — Basic approval. Grants no transfer/burn/lock rights, but the delegate address is recorded on-chain. Used for custom program integrations that check delegate status.
- **Transfer** — Can transfer the NFT on behalf of the owner.
- **Sale** — Can transfer + lock. Designed for marketplace listings (lock prevents owner from moving the NFT while listed).
- **Utility** — Can burn + lock. Used for staking-like flows where the asset may be consumed.
- **Staking** — Can lock only. Prevents transfers while staked, but cannot burn or transfer.
- **LockedTransfer** — Can transfer + lock, but only to a **specific pre-set address** (passed as `lockedAddress` when delegating). Used for escrow flows.

### Approve Delegate

```typescript
import {
  delegateStandardV1,
  delegateTransferV1,
  delegateSaleV1,
  delegateUtilityV1,
  delegateStakingV1,
  delegateLockedTransferV1,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata';

// Standard delegate (basic approval, no special permissions)
await delegateStandardV1(umi, {
  mint: mintAddress,
  tokenOwner: ownerAddress,
  authority: owner,
  delegate: delegateAddress,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
}).sendAndConfirm(umi);

// Transfer delegate (can transfer)
await delegateTransferV1(umi, {
  mint: mintAddress,
  tokenOwner: ownerAddress,
  authority: owner,
  delegate: delegateAddress,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
}).sendAndConfirm(umi);

// Sale delegate (can transfer + lock — for marketplace listings)
await delegateSaleV1(umi, {
  mint: mintAddress,
  tokenOwner: ownerAddress,
  authority: owner,
  delegate: delegateAddress,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
}).sendAndConfirm(umi);

// Utility delegate (can burn + lock)
await delegateUtilityV1(umi, {
  mint: mintAddress,
  tokenOwner: ownerAddress,
  authority: owner,
  delegate: delegateAddress,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
}).sendAndConfirm(umi);

// Staking delegate (can lock)
await delegateStakingV1(umi, {
  mint: mintAddress,
  tokenOwner: ownerAddress,
  authority: owner,
  delegate: delegateAddress,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
}).sendAndConfirm(umi);

// Locked transfer delegate (transfer to specific address only)
await delegateLockedTransferV1(umi, {
  mint: mintAddress,
  tokenOwner: ownerAddress,
  authority: owner,
  delegate: delegateAddress,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
  lockedAddress: destinationAddress,
}).sendAndConfirm(umi);
```

### Revoke Delegate

Each delegate type has a matching revoke function:

```typescript
import {
  revokeStandardV1,
  revokeTransferV1,
  revokeSaleV1,
  revokeUtilityV1,
  revokeStakingV1,
  revokeLockedTransferV1,
  TokenStandard,
} from '@metaplex-foundation/mpl-token-metadata';

await revokeTransferV1(umi, {
  mint: mintAddress,
  tokenOwner: ownerAddress,
  authority: owner,
  delegate: delegateAddress,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
}).sendAndConfirm(umi);
```

## Print Editions

Create numbered prints from a Master Edition NFT:

```typescript
import { printV1, TokenStandard } from '@metaplex-foundation/mpl-token-metadata';
import { generateSigner } from '@metaplex-foundation/umi';

const editionMint = generateSigner(umi);

await printV1(umi, {
  masterTokenAccountOwner: masterOwner,
  masterEditionMint: masterMintAddress,
  editionMint,
  editionTokenAccountOwner: recipientAddress,
  editionNumber: 1,
  tokenStandard: TokenStandard.NonFungible,
}).sendAndConfirm(umi);
```

## Verify / Unverify

### Creator Verification

```typescript
import { verifyCreatorV1, unverifyCreatorV1, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';

// Verify (signer must be the creator being verified)
await verifyCreatorV1(umi, {
  metadata: findMetadataPda(umi, { mint: mintAddress }),
  authority: creatorSigner,
}).sendAndConfirm(umi);

// Unverify
await unverifyCreatorV1(umi, {
  metadata: findMetadataPda(umi, { mint: mintAddress }),
  authority: creatorSigner,
}).sendAndConfirm(umi);
```

### Collection Verification

```typescript
import { verifyCollectionV1, unverifyCollectionV1, findMetadataPda } from '@metaplex-foundation/mpl-token-metadata';

// Verify (signer must be collection update authority)
await verifyCollectionV1(umi, {
  metadata: findMetadataPda(umi, { mint: assetMintAddress }),
  collectionMint: collectionMintAddress,
  authority: collectionAuthority,
}).sendAndConfirm(umi);

// Unverify
await unverifyCollectionV1(umi, {
  metadata: findMetadataPda(umi, { mint: assetMintAddress }),
  collectionMint: collectionMintAddress,
  authority: collectionAuthority,
}).sendAndConfirm(umi);
```

---

## Mint Fungible Tokens

After creating a fungible token with `createFungible`, mint supply using `mintTokensTo` from `mpl-toolbox`:

```typescript
import { mintTokensTo, findAssociatedTokenPda } from '@metaplex-foundation/mpl-toolbox';

const tokenAccount = findAssociatedTokenPda(umi, { mint: mint.publicKey, owner: umi.identity.publicKey });

await mintTokensTo(umi, {
  mint: mint.publicKey,
  token: tokenAccount,
  amount: 1_000_000_000n, // In base units (this = 1 token with 9 decimals)
}).sendAndConfirm(umi);
```

## Transfer Fungible Token

```typescript
import { transferTokens } from '@metaplex-foundation/mpl-toolbox';

// Use mpl-toolbox for fungible transfers, NOT Token Metadata
await transferTokens(umi, {
  source: sourceTokenAccount,
  destination: destinationTokenAccount,
  amount: 1000000000n,
}).sendAndConfirm(umi);
```

---

## PDAs

```typescript
import {
  findMetadataPda,
  findMasterEditionPda,
  findTokenRecordPda
} from '@metaplex-foundation/mpl-token-metadata';

// Metadata PDA
const [metadataPda] = findMetadataPda(umi, { mint });

// Master Edition PDA
const [editionPda] = findMasterEditionPda(umi, { mint });

// Token Record PDA (pNFTs)
const [tokenRecordPda] = findTokenRecordPda(umi, { mint, token });
```
