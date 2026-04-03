# Token Metadata Kit SDK Reference

Native @solana/kit integration for Token Metadata - direct SDK control with minimal dependencies.

## Package

```bash
npm install @metaplex-foundation/mpl-token-metadata-kit @solana/kit
```

## When to Use Kit vs Umi

| Use Kit When | Use Umi When |
|--------------|--------------|
| Integrating into existing @solana/kit codebase | Rapid development, multiple Metaplex programs |
| Minimal dependencies needed | Want transaction builder patterns |
| Direct SDK control preferred | Using Umi plugins (uploaders, etc.) |

---

## Basic Setup

```typescript
import { createSolanaRpc, createSolanaRpcSubscriptions } from '@solana/kit';
import { generateKeyPairSigner, createKeyPairSignerFromBytes } from '@solana/signers';
import fs from 'fs';

const rpc = createSolanaRpc('https://api.devnet.solana.com');
const rpcSubscriptions = createSolanaRpcSubscriptions('wss://api.devnet.solana.com');

// Generate a new random keypair
const newKeypair = await generateKeyPairSigner();

// Or load from file (Node.js scripts)
const secretKey = new Uint8Array(JSON.parse(fs.readFileSync('/path/to/keypair.json', 'utf-8')));
const authority = await createKeyPairSignerFromBytes(secretKey);
```

---

## Creating NFTs

### Convenience Helpers (Recommended)

```typescript
import { createNft, createProgrammableNft, createFungible } from '@metaplex-foundation/mpl-token-metadata-kit';
import { generateKeyPairSigner } from '@solana/signers';

const mint = await generateKeyPairSigner();
const authority = await generateKeyPairSigner();

// Regular NFT — returns [createIx, mintIx]
const [createIx, mintIx] = await createNft({
  mint,
  authority,
  payer: authority,
  name: 'My NFT',
  uri: 'https://example.com/nft.json',
  sellerFeeBasisPoints: 550,  // 5.5%
});

// pNFT — returns [createIx, mintIx]
const [createIx, mintIx] = await createProgrammableNft({
  mint,
  authority,
  payer: authority,
  name: 'My pNFT',
  uri: 'https://example.com/pnft.json',
  sellerFeeBasisPoints: 500,
});

// Fungible — returns createIx only
const createIx = await createFungible({
  mint,
  payer: authority,
  name: 'My Token',
  symbol: 'MTK',
  uri: 'https://arweave.net/xxx',
  sellerFeeBasisPoints: 0,
  decimals: 9,
});
```

Also available: `createFungibleAsset()` for semi-fungible tokens.

### Low-Level: Async Version (Auto-resolves PDAs)

```typescript
import { getCreateV1InstructionAsync, TokenStandard } from '@metaplex-foundation/mpl-token-metadata-kit';

const createIx = await getCreateV1InstructionAsync({
  mint,
  authority,
  payer: authority,
  name: 'My NFT',
  uri: 'https://example.com/nft.json',
  sellerFeeBasisPoints: 550,  // 5.5%
  tokenStandard: TokenStandard.NonFungible,
});
```

### Low-Level: Sync Version (Provide all addresses)

```typescript
import { getCreateV1Instruction, findMetadataPda, findMasterEditionPda } from '@metaplex-foundation/mpl-token-metadata-kit';

const metadataPda = await findMetadataPda({ mint: mint.address });
const editionPda = await findMasterEditionPda({ mint: mint.address });

const createIx = getCreateV1Instruction({
  metadata: metadataPda,
  masterEdition: editionPda,
  mint,
  authority,
  payer: authority,
  name: 'My NFT',
  uri: 'https://example.com/nft.json',
  sellerFeeBasisPoints: 550,
  tokenStandard: TokenStandard.NonFungible,
});
```

---

## Transfers

```typescript
import { getTransferV1InstructionAsync, TokenStandard } from '@metaplex-foundation/mpl-token-metadata-kit';

// Regular NFT
const transferIx = await getTransferV1InstructionAsync({
  mint: mintAddress,
  authority: owner,
  payer: owner,
  tokenOwner: owner.address,
  destinationOwner: recipientAddress,
  tokenStandard: TokenStandard.NonFungible,
});

// pNFT (handles TokenRecord automatically)
const transferIx = await getTransferV1InstructionAsync({
  mint: mintAddress,
  authority: owner,
  payer: owner,
  tokenOwner: owner.address,
  destinationOwner: recipientAddress,
  tokenStandard: TokenStandard.ProgrammableNonFungible,
});
```

> **Fungible token transfers** are not handled by Token Metadata — use SPL Token's `transfer` instruction from `@solana-program/token` or the Umi SDK's `transferTokens` from `mpl-toolbox`.

---

## Transaction Flow

```typescript
import { pipe } from '@solana/functional';
import {
  createTransactionMessage,
  setTransactionMessageFeePayer,
  setTransactionMessageLifetimeUsingBlockhash,
  appendTransactionMessageInstructions,
} from '@solana/transaction-messages';
import { compileTransaction, signTransaction, assertIsTransactionWithBlockhashLifetime } from '@solana/transactions';
import { sendAndConfirmTransactionFactory } from '@solana/kit';

// Create send function
const sendAndConfirm = sendAndConfirmTransactionFactory({ rpc, rpcSubscriptions });

// Get blockhash
const { value: latestBlockhash } = await rpc.getLatestBlockhash().send();

// Build transaction
const transactionMessage = pipe(
  createTransactionMessage({ version: 0 }),
  (tx) => setTransactionMessageFeePayer(authority.address, tx),
  (tx) => setTransactionMessageLifetimeUsingBlockhash(latestBlockhash, tx),
  (tx) => appendTransactionMessageInstructions([createIx, mintIx], tx),
);

// Compile, sign, and send (both mint and authority must sign for NFT creation)
const transaction = compileTransaction(transactionMessage);
assertIsTransactionWithBlockhashLifetime(transaction);
const signedTx = await signTransaction([mint.keyPair, authority.keyPair], transaction);
await sendAndConfirm(signedTx, { commitment: 'confirmed' });
```

---

## PDAs

```typescript
import { findMetadataPda, findMasterEditionPda, findTokenRecordPda } from '@metaplex-foundation/mpl-token-metadata-kit';

// PDA derivation (async — returns Promise<ProgramDerivedAddress>)
const metadataPda = await findMetadataPda({ mint: mintAddress });
const editionPda = await findMasterEditionPda({ mint: mintAddress });
const tokenRecordPda = await findTokenRecordPda({ mint: mintAddress, token: tokenAddress });
```

Note: Kit PDAs are async (unlike Umi's sync PDAs). The async instruction variants (`getCreateV1InstructionAsync`, etc.) resolve PDAs automatically.

---

## Fetching Metadata

```typescript
import { fetchMetadata, fetchMasterEdition } from '@metaplex-foundation/mpl-token-metadata-kit';

const metadata = await fetchMetadata(rpc, metadataPda);
console.log(metadata.data.name, metadata.data.uri);

const edition = await fetchMasterEdition(rpc, editionPda);
console.log(edition.data.supply, edition.data.maxSupply);
```

---

## Fetching Digital Assets

```typescript
import { fetchDigitalAsset } from '@metaplex-foundation/mpl-token-metadata-kit';

// Fetches mint, metadata, and edition in one call
const asset = await fetchDigitalAsset(rpc, mintAddress);
console.log(asset.metadata.name);    // Metadata account
console.log(asset.mint);             // Mint account
console.log(asset.edition);          // MasterEdition or Edition (if NFT)
```

Also available: `fetchDigitalAssetByMetadata()`, `fetchAllDigitalAsset()`.

---

## Key Differences from Umi

| Aspect | Kit Client | Umi Client |
|--------|------------|------------|
| Setup | RPC + RpcSubscriptions | Umi context |
| Instructions | `getCreateV1InstructionAsync()` | `createV1(umi, {})` |
| Signers | `generateKeyPairSigner()` | `generateSigner(umi)` |
| Transactions | Manual with Kit utilities | `.sendAndConfirm(umi)` |
| PDA Resolution | Async functions | Built into instruction |
| Dependencies | Only @solana/* packages | Umi + plugins |

---

## Interop with Umi

If you need to mix Kit and Umi:

```typescript
import { fromKitAddress, toKitAddress, toKitInstruction, fromKitInstruction } from '@metaplex-foundation/umi-kit-adapters';

// Convert addresses
const umiPublicKey = fromKitAddress(kitAddress);
const kitAddress = toKitAddress(umiPublicKey);

// Convert instructions
const kitIx = toKitInstruction(umiInstruction);
const umiIx = fromKitInstruction(kitInstruction);
```
