# Agent Registry SDK Reference (Umi)

Umi SDK operations for registering agent identities, reading agent data, and delegating execution.

> **Prerequisites**: Set up Umi first — see `./sdk-umi.md` for installation and basic setup.
> **Docs**: https://metaplex.com/docs/agents

> **Agents are MPL Core assets.** Before registering an agent, you need an MPL Core asset. See `./sdk-core.md` for creating assets and collections.

---

## Installation

```shell
npm install @metaplex-foundation/mpl-agent-registry
```

## Setup

```typescript
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { mplCore } from '@metaplex-foundation/mpl-core';
import { mplAgentIdentity, mplAgentTools } from '@metaplex-foundation/mpl-agent-registry';

const umi = createUmi('https://api.mainnet-beta.solana.com')
  .use(mplCore())
  .use(mplAgentIdentity())
  .use(mplAgentTools());
```

---

## Register Agent Identity

Creates a PDA derived from the asset's public key and attaches an `AgentIdentity` plugin with lifecycle hooks for Transfer, Update, and Execute.

```typescript
import { registerIdentityV1 } from '@metaplex-foundation/mpl-agent-registry';

await registerIdentityV1(umi, {
  asset: assetPublicKey,
  collection: collectionPublicKey,          // optional but recommended
  agentRegistrationUri: 'https://arweave.net/agent-registration.json',
}).sendAndConfirm(umi);
```

| Parameter | Description |
|-----------|-------------|
| `asset` | The MPL Core asset to register |
| `collection` | The asset's collection (optional) |
| `agentRegistrationUri` | URI pointing to off-chain agent registration metadata (ERC-8004 format) |
| `payer` | Pays for rent and fees (defaults to `umi.payer`) |
| `authority` | Collection authority (defaults to `payer`) |

> Registration is a one-time operation per asset. Calling `registerIdentityV1` on an already-registered asset will fail.

## Agent Registration Document (ERC-8004)

The `agentRegistrationUri` points to a JSON document hosted on permanent storage (e.g. Arweave). Format follows [ERC-8004](https://eips.ethereum.org/EIPS/eip-8004):

```json
{
  "type": "https://eips.ethereum.org/EIPS/eip-8004#registration-v1",
  "name": "Plexpert",
  "description": "An informational agent providing help related to Metaplex protocols and tools.",
  "image": "https://arweave.net/agent-avatar-tx-hash",
  "services": [
    {
      "name": "web",
      "endpoint": "https://example.com/agent/<ASSET_PUBKEY>"
    },
    {
      "name": "A2A",
      "endpoint": "https://example.com/agent/<ASSET_PUBKEY>/agent-card.json",
      "version": "0.3.0"
    },
    {
      "name": "MCP",
      "endpoint": "https://example.com/agent/<ASSET_PUBKEY>/mcp",
      "version": "2025-06-18"
    }
  ],
  "active": true,
  "registrations": [
    {
      "agentId": "<MINT_ADDRESS>",
      "agentRegistry": "solana:101:metaplex"
    }
  ],
  "supportedTrust": ["reputation", "crypto-economic"]
}
```

### Fields

| Field | Required | Description |
|-------|----------|-------------|
| `type` | Yes | Schema identifier — use `https://eips.ethereum.org/EIPS/eip-8004#registration-v1` |
| `name` | Yes | Human-readable agent name |
| `description` | Yes | What the agent does, how it works, and how to interact with it |
| `image` | Yes | Avatar or logo URI |
| `services` | No | Array of service endpoints (each has `name`, `endpoint`, optional `version`/`skills`/`domains`) |
| `active` | No | Whether the agent is currently active (`true`/`false`) |
| `registrations` | No | Array of on-chain registrations (`agentId` = mint address, `agentRegistry` = `solana:101:metaplex`) |
| `supportedTrust` | No | Trust models: `reputation`, `crypto-economic`, `tee-attestation` |

---

## Check Registration

```typescript
import { safeFetchAgentIdentityV1, findAgentIdentityV1Pda } from '@metaplex-foundation/mpl-agent-registry';

const pda = findAgentIdentityV1Pda(umi, { asset: assetPublicKey });
const identity = await safeFetchAgentIdentityV1(umi, pda);

console.log('Registered:', identity !== null);
```

> `safeFetchAgentIdentityV1` returns `null` for unregistered assets instead of throwing.

## Fetch Identity from Seeds

```typescript
import { fetchAgentIdentityV1FromSeeds } from '@metaplex-foundation/mpl-agent-registry';

const identity = await fetchAgentIdentityV1FromSeeds(umi, {
  asset: assetPublicKey,
});
```

## Verify AgentIdentity Plugin on Asset

```typescript
import { fetchAsset } from '@metaplex-foundation/mpl-core';

const assetData = await fetchAsset(umi, assetPublicKey);

const agentIdentity = assetData.agentIdentities?.[0];
console.log(agentIdentity?.uri);                          // registration URI
console.log(agentIdentity?.lifecycleChecks?.transfer);     // truthy
console.log(agentIdentity?.lifecycleChecks?.update);       // truthy
console.log(agentIdentity?.lifecycleChecks?.execute);      // truthy
```

## Read Registration Document

```typescript
const assetData = await fetchAsset(umi, assetPublicKey);
const agentIdentity = assetData.agentIdentities?.[0];

if (agentIdentity?.uri) {
  const response = await fetch(agentIdentity.uri);
  const registration = await response.json();

  console.log(registration.name);
  console.log(registration.description);
  console.log(registration.active);

  for (const service of registration.services) {
    console.log(service.name, service.endpoint);
  }
}
```

## Fetch Agent Wallet (Asset Signer)

Every Core asset has a built-in PDA wallet — no private key exists, so it can't be stolen. Only the asset itself can sign for it through Core's Execute lifecycle hook.

```typescript
import { findAssetSignerPda } from '@metaplex-foundation/mpl-core';

const assetSignerPda = findAssetSignerPda(umi, { asset: assetPublicKey });

const balance = await umi.rpc.getBalance(assetSignerPda);
console.log('Agent wallet:', assetSignerPda);
console.log('Balance:', balance.basisPoints.toString(), 'lamports');
```

---

## Register Executive Profile

Before an executive can run any agent, it needs a profile. This is a one-time setup per wallet.

```typescript
import { registerExecutiveV1 } from '@metaplex-foundation/mpl-agent-registry';

await registerExecutiveV1(umi, {
  payer: umi.payer,
}).sendAndConfirm(umi);
```

| Parameter | Description |
|-----------|-------------|
| `payer` | Pays for rent and fees (also used as the authority) |
| `authority` | The wallet that owns this executive profile (defaults to `payer`) |

> Each wallet can only have one executive profile. PDA: `["executive_profile", <authority>]`.

## Delegate Execution

The agent asset owner delegates execution to an executive profile. Creates a delegation record on-chain.

```typescript
import { delegateExecutionV1, findAgentIdentityV1Pda, findExecutiveProfileV1Pda } from '@metaplex-foundation/mpl-agent-registry';

const agentIdentity = findAgentIdentityV1Pda(umi, { asset: agentAssetPublicKey });
const executiveProfile = findExecutiveProfileV1Pda(umi, { authority: executiveAuthorityPublicKey });

await delegateExecutionV1(umi, {
  agentAsset: agentAssetPublicKey,
  agentIdentity,
  executiveProfile,
}).sendAndConfirm(umi);
```

| Parameter | Description |
|-----------|-------------|
| `agentAsset` | The registered agent's MPL Core asset |
| `agentIdentity` | The agent identity PDA for the asset |
| `executiveProfile` | The executive profile PDA to delegate to |
| `payer` | Pays for rent and fees (defaults to `umi.payer`) |
| `authority` | Must be the asset owner (defaults to `payer`) |

> Only the asset owner can delegate execution. Delegation is per-asset.

## Verify Delegation

```typescript
import { findExecutiveProfileV1Pda, findExecutionDelegateRecordV1Pda } from '@metaplex-foundation/mpl-agent-registry';

const executiveProfile = findExecutiveProfileV1Pda(umi, {
  authority: executiveAuthorityPublicKey,
});

const delegateRecord = findExecutionDelegateRecordV1Pda(umi, {
  executiveProfile,
  agentAsset: agentAssetPublicKey,
});

const account = await umi.rpc.getAccount(delegateRecord);
console.log('Delegated:', account.exists);
```

---

## Full Example: Register + Delegate

```typescript
import { generateSigner } from '@metaplex-foundation/umi';
import { create, createCollection } from '@metaplex-foundation/mpl-core';
import { mplAgentIdentity, mplAgentTools } from '@metaplex-foundation/mpl-agent-registry';
import {
  registerIdentityV1,
  registerExecutiveV1,
  delegateExecutionV1,
  findAgentIdentityV1Pda,
  findExecutiveProfileV1Pda,
} from '@metaplex-foundation/mpl-agent-registry';

// 1. Create a collection
const collection = generateSigner(umi);
await createCollection(umi, {
  collection,
  name: 'Agent Collection',
  uri: 'https://example.com/collection.json',
}).sendAndConfirm(umi);

// 2. Create an asset
const asset = generateSigner(umi);
await create(umi, {
  asset,
  name: 'My Agent',
  uri: 'https://example.com/agent.json',
  collection,
}).sendAndConfirm(umi);

// 3. Register identity
await registerIdentityV1(umi, {
  asset: asset.publicKey,
  collection: collection.publicKey,
  agentRegistrationUri: 'https://example.com/agent-registration.json',
}).sendAndConfirm(umi);

// 4. Register executive profile (one-time per wallet)
await registerExecutiveV1(umi, {
  payer: umi.payer,
}).sendAndConfirm(umi);

// 5. Delegate execution
const agentIdentity = findAgentIdentityV1Pda(umi, { asset: asset.publicKey });
const executiveProfile = findExecutiveProfileV1Pda(umi, { authority: umi.payer.publicKey });

await delegateExecutionV1(umi, {
  agentAsset: asset.publicKey,
  agentIdentity,
  executiveProfile,
}).sendAndConfirm(umi);
```

---

## PDA Reference

| Account | Seeds | Size |
|---------|-------|------|
| `AgentIdentityV1` | `["agent_identity", <asset_pubkey>]` | 40 bytes |
| `ExecutiveProfileV1` | `["executive_profile", <authority>]` | 40 bytes |
| `ExecutionDelegateRecordV1` | `["execution_delegate_record", <executive_profile>, <agent_asset>]` | 104 bytes |

## Program IDs

| Program | Address |
|---------|---------|
| Agent Identity | `1DREGFgysWYxLnRnKQnwrxnJQeSMk2HmGaC6whw2B2p` |
| Agent Tools | `TLREGni9ZEyGC3vnPZtqUh95xQ8oPqJSvNjvB7FGK8S` |

Same addresses on Mainnet and Devnet.

## Errors

### Agent Identity

| Code | Name | Description |
|------|------|-------------|
| 0 | `InvalidSystemProgram` | System program account is incorrect |
| 1 | `InvalidInstructionData` | Instruction data is malformed |
| 2 | `InvalidAccountData` | PDA derivation does not match the asset |
| 3 | `InvalidMplCoreProgram` | MPL Core program account is incorrect |
| 4 | `InvalidCoreAsset` | Asset is not a valid MPL Core asset |

### Agent Tools

| Code | Name | Description |
|------|------|-------------|
| 0 | `InvalidSystemProgram` | System program account is incorrect |
| 1 | `InvalidInstructionData` | Instruction data is malformed |
| 2 | `InvalidAccountData` | Invalid account data |
| 3 | `InvalidMplCoreProgram` | MPL Core program account is incorrect |
| 4 | `InvalidCoreAsset` | Asset is not a valid MPL Core asset |
| 5 | `ExecutiveProfileMustBeUninitialized` | Executive profile already exists |
| 6 | `InvalidExecutionDelegateRecordDerivation` | Delegation record PDA derivation mismatch |
| 7 | `ExecutionDelegateRecordMustBeUninitialized` | Delegation record already exists |
| 8 | `InvalidAgentIdentity` | Agent identity account is invalid |
| 9 | `AgentIdentityNotRegistered` | Asset does not have a registered identity |
| 10 | `AssetOwnerMustBeTheOneToDelegateExecution` | Only the asset owner can delegate execution |
| 11 | `InvalidExecutiveProfileDerivation` | Executive profile PDA derivation mismatch |
