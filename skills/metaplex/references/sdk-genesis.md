# Metaplex Genesis SDK Reference

Genesis is a token launch protocol for Token Generation Events (TGEs) on Solana with fair distribution and liquidity graduation.

> **Concepts**: For lifecycle, fees, condition object format, and end behaviors, see `./concepts.md` Genesis section.

## Package

```bash
npm install @metaplex-foundation/genesis @metaplex-foundation/umi-bundle-defaults
```

## Before Starting — Gather from User

**For Launch API** (recommended):
1. **Launch type**: `'project'` (default, 48h deposit, configurable) or `'memecoin'` (1h deposit, simplified)
2. **Token details**: name (1-32 chars), symbol (1-10 chars), image (Irys URL), description (optional, max 250 chars)
3. **For project launches**: token allocation (portion of 1B), deposit start time, raise goal, Raydium liquidity %, funds recipient
4. **For memecoin launches**: only deposit start time needed (hardcoded fund flows)
5. **Optional**: locked allocations (team vesting, project only), external links (website, twitter, telegram), quote mint (SOL/USDC)

**For low-level SDK**:
1. **Token details**: name, symbol, description, image/metadata URI
2. **Total supply**: how many tokens (remember: with 9 decimals, 1M tokens = `1_000_000_000_000_000n`)
3. **Allocation split**: percentage for launchpool vs team/treasury
4. **Timing**: deposit start, deposit duration, claim duration

---

## Launch Mechanisms

| Mechanism | Description |
|-----------|-------------|
| **Launch Pool** | Users deposit SOL during a window, receive tokens proportionally |
| **Presale** | Fixed price token sale, first-come-first-served |
| **Uniform Price Auction** | Bid-based allocation with uniform clearing price |

---

## Launch Lifecycle

**Launch API** (recommended):

```text
createAndRegisterLaunch()  →  deposit window (project: 48h, memecoin: 1h)  →  Raydium graduation  →  claim
```

**Low-level SDK**:

```text
1. Initialize Genesis Account → Creates token + coordination account
2. Add Buckets → Configure distribution (LaunchPool, Unlocked, etc.)
3. Finalize → Lock configuration, launch goes live
4. Active Period → Users deposit SOL
5. Transition → Execute end behaviors (send SOL to outflow buckets)
6. Graduation → LP tokens graduated to Raydium
7. Claim Period → Users claim tokens proportionally
```

---

## Launch API (Recommended)

The Launch API handles everything in a single call: token creation, genesis account setup, launch pool configuration, Raydium LP, transaction signing, and platform registration.

### `createAndRegisterLaunch` — All-in-One

```typescript
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import {
  createAndRegisterLaunch,
  CreateLaunchInput,
} from '@metaplex-foundation/genesis';

const umi = createUmi('https://api.mainnet-beta.solana.com')
  .use(keypairIdentity(myKeypair));

const input: CreateLaunchInput = {
  wallet: umi.identity.publicKey,
  token: {
    name: 'My Token',
    symbol: 'MTK',
    image: 'https://gateway.irys.xyz/...',
    // optional:
    description: 'A revolutionary token',
    externalLinks: {
      website: 'https://mytoken.com',
      twitter: 'https://twitter.com/mytoken',
      telegram: 'https://t.me/mytoken',
    },
  },
  launchType: 'project',
  launch: {
    launchpool: {
      tokenAllocation: 500_000_000,   // out of 1B total supply
      depositStartTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      raiseGoal: 200,                 // 200 SOL (whole units)
      raydiumLiquidityBps: 5000,      // 50% to Raydium LP
      fundsRecipient: umi.identity.publicKey,
    },
  },
  // optional:
  quoteMint: 'SOL',                   // 'SOL' | 'USDC' | mint address
  network: 'solana-mainnet',          // auto-detected if omitted
};

const result = await createAndRegisterLaunch(umi, { baseUrl: 'https://api.metaplex.com' }, input);

console.log('Genesis account:', result.genesisAccount);
console.log('Mint:', result.mintAddress);
console.log('Launch page:', result.launch.link);
console.log('Signatures:', result.signatures);
```

### Memecoin Launch

Simplified launch with 1-hour deposit window and hardcoded fund flows. Only requires token metadata and deposit start time.

```typescript
import { createAndRegisterLaunch, CreateMemecoinLaunchInput } from '@metaplex-foundation/genesis';

const input: CreateMemecoinLaunchInput = {
  wallet: umi.identity.publicKey,
  token: {
    name: 'My Meme',
    symbol: 'MEME',
    image: 'https://gateway.irys.xyz/...',
    description: 'A fun memecoin',              // optional
    externalLinks: { twitter: '@mymeme' },       // optional
  },
  launchType: 'memecoin',
  launch: {
    depositStartTime: new Date(Date.now() + 60 * 60 * 1000), // 1 hour from now
  },
  // optional:
  quoteMint: 'SOL',
  network: 'solana-mainnet',
};

const result = await createAndRegisterLaunch(umi, { baseUrl: 'https://api.metaplex.com' }, input);
```

**Memecoin vs Project**: Memecoin launches cannot include `launchpool` or `lockedAllocations` config — the API configures these automatically.

### With Locked Allocations (Team Vesting via Streamflow)

```typescript
const input: CreateLaunchInput = {
  wallet: umi.identity.publicKey,
  token: {
    name: 'My Token',
    symbol: 'MTK',
    image: 'https://gateway.irys.xyz/...',
  },
  launchType: 'project',
  launch: {
    launchpool: {
      tokenAllocation: 500_000_000,
      depositStartTime: new Date(Date.now() + 48 * 60 * 60 * 1000),
      raiseGoal: 200,
      raydiumLiquidityBps: 5000,
      fundsRecipient: umi.identity.publicKey,
    },
    lockedAllocations: [
      {
        name: 'Team',
        recipient: 'TeamWallet111...',
        tokenAmount: 100_000_000,
        vestingStartTime: new Date('2026-04-05T00:00:00Z'),
        vestingDuration: { value: 1, unit: 'YEAR' },
        unlockSchedule: 'MONTH',
        cliff: {
          duration: { value: 3, unit: 'MONTH' },
          unlockAmount: 10_000_000,
        },
      },
    ],
  },
};
```

TimeUnit values: `'SECOND'`, `'MINUTE'`, `'HOUR'`, `'DAY'`, `'WEEK'`, `'TWO_WEEKS'`, `'MONTH'`, `'QUARTER'`, `'YEAR'`.

### `createLaunch` + `registerLaunch` — Full Control

Use when you need custom transaction handling (multisig, custom sending logic).

```typescript
import {
  createLaunch,
  registerLaunch,
  GenesisApiConfig,
} from '@metaplex-foundation/genesis';

const config: GenesisApiConfig = { baseUrl: 'https://api.metaplex.com' };

// Step 1: Get unsigned transactions
const createResult = await createLaunch(umi, config, input);
// createResult.transactions — unsigned Umi transactions
// createResult.blockhash — for confirmation strategy
// createResult.mintAddress, createResult.genesisAccount

// Step 2: Sign and send transactions yourself
for (const tx of createResult.transactions) {
  const signedTx = await umi.identity.signTransaction(tx);
  const signature = await umi.rpc.sendTransaction(signedTx, { commitment: 'confirmed' });
  await umi.rpc.confirmTransaction(signature, {
    commitment: 'confirmed',
    strategy: { type: 'blockhash', ...createResult.blockhash },
  });
}

// Step 3: Register on the platform (idempotent — safe to retry)
const registerResult = await registerLaunch(umi, config, {
  genesisAccount: createResult.genesisAccount,
  createLaunchInput: input,
});
console.log('Launch page:', registerResult.launch.link);
```

### Custom Transaction Sender

```typescript
import {
  createAndRegisterLaunch,
  SignAndSendOptions,
} from '@metaplex-foundation/genesis';

const options: SignAndSendOptions = {
  txSender: async (transactions) => {
    const signatures: Uint8Array[] = [];
    for (const tx of transactions) {
      const signed = await myMultisigSign(tx);
      const sig = await myCustomSend(signed);
      signatures.push(sig);
    }
    return signatures;
  },
};

const result = await createAndRegisterLaunch(umi, config, input, options);
```

### Error Handling

```typescript
import {
  createAndRegisterLaunch,
  isGenesisValidationError,
  isGenesisApiError,
  isGenesisApiNetworkError,
} from '@metaplex-foundation/genesis';

try {
  const result = await createAndRegisterLaunch(umi, config, input);
} catch (err) {
  if (isGenesisValidationError(err)) {
    console.error(`Invalid "${err.field}":`, err.message);
  } else if (isGenesisApiError(err)) {
    console.error('API error:', err.statusCode, err.responseBody);
  } else if (isGenesisApiNetworkError(err)) {
    console.error('Network error:', err.cause.message);
  }
}
```

### Launch API Key Points

- **Two launch types**: `'project'` (default, 48h deposit, configurable) and `'memecoin'` (1h deposit, simplified)
- **Total supply** is always 1 billion tokens; `tokenAllocation` is how many go to the launch pool (project only)
- **Deposit window**: project = 48 hours, memecoin = 1 hour from `depositStartTime`
- **Memecoin launches** only need `depositStartTime` in the `launch` config — fund flows are hardcoded by the API
- **Memecoin launches cannot** use `launchpool` or `lockedAllocations` config
- **raiseGoal** and amounts are in **whole units** (e.g., `200` = 200 SOL), NOT base units
- **Image** must be hosted on Irys (`https://gateway.irys.xyz/...`)
- Remaining tokens (1B minus launchpool minus locked) go to the creator automatically (project only)
- **registerLaunch** is idempotent — safe to call again if it fails
- Fund routing is automatic: `raydiumLiquidityBps` goes to Raydium LP, rest goes to `fundsRecipient` (project only)

---

## Low-Level SDK

The following sections cover direct on-chain instructions for full control over genesis accounts and buckets.

### Setup

```typescript
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { genesis } from '@metaplex-foundation/genesis';
import { mplTokenMetadata } from '@metaplex-foundation/mpl-token-metadata';

const umi = createUmi('https://api.devnet.solana.com')
  .use(genesis())
  .use(mplTokenMetadata());
```

---

## Initialize Genesis Account

```typescript
import {
  findGenesisAccountV2Pda,
  initializeV2,
} from '@metaplex-foundation/genesis';
import { generateSigner, publicKey } from '@metaplex-foundation/umi';

const baseMint = generateSigner(umi);
const WSOL_MINT = publicKey('So11111111111111111111111111111111111111112');

const [genesisAccount] = findGenesisAccountV2Pda(umi, {
  baseMint: baseMint.publicKey,
  genesisIndex: 0,
});

await initializeV2(umi, {
  baseMint,
  quoteMint: WSOL_MINT,
  fundingMode: 0,
  totalSupplyBaseToken: 1_000_000_000_000_000n,  // 1M tokens (9 decimals)
  name: 'My Token',
  symbol: 'MTK',
  uri: 'https://example.com/metadata.json',
}).sendAndConfirm(umi);
```

**Token Supply with Decimals:**
```typescript
const ONE_TOKEN = 1_000_000_000n;              // 1 token (9 decimals)
const ONE_MILLION = 1_000_000_000_000_000n;    // 1,000,000 tokens
const ONE_BILLION = 1_000_000_000_000_000_000n; // 1,000,000,000 tokens
```

---

## Add Launch Pool Bucket

Uses a 3-transaction flow to stay within tx size limits:
1. `addLaunchPoolBucketV2Base` — create bucket with core fields
2. `addLaunchPoolBucketV2Extensions` — add optional extensions (penalties, allowlist, claim schedule, etc.)
3. `setLaunchPoolBucketV2Behaviors` — configure end behaviors

```typescript
import {
  addLaunchPoolBucketV2Base,
  addLaunchPoolBucketV2Extensions,
  setLaunchPoolBucketV2Behaviors,
  findLaunchPoolBucketV2Pda,
  findUnlockedBucketV2Pda,
  createTimeAbsoluteCondition,
} from '@metaplex-foundation/genesis';

const [launchPoolBucket] = findLaunchPoolBucketV2Pda(umi, {
  genesisAccount,
  bucketIndex: 0,
});

const [unlockedBucket] = findUnlockedBucketV2Pda(umi, {
  genesisAccount,
  bucketIndex: 0,
});

const now = BigInt(Math.floor(Date.now() / 1000));
const depositEnd = now + 86400n * 3n;  // 3 days
const claimStart = depositEnd + 1n;
const claimEnd = claimStart + 86400n * 7n;  // 7 days

// Step 1: Create bucket with base fields
await addLaunchPoolBucketV2Base(umi, {
  genesisAccount,
  baseMint: baseMint.publicKey,
  quoteMint: WSOL_MINT,
  baseTokenAllocation: 600_000_000_000_000n,  // 60% of supply
  depositStartCondition: createTimeAbsoluteCondition(now),
  depositEndCondition: createTimeAbsoluteCondition(depositEnd),
  claimStartCondition: createTimeAbsoluteCondition(claimStart),
  claimEndCondition: createTimeAbsoluteCondition(claimEnd),
}).sendAndConfirm(umi);

// Step 2 (optional): Add extensions (penalties, allowlist, deposit limits, etc.)
await addLaunchPoolBucketV2Extensions(umi, {
  authority: umi.identity,
  bucket: launchPoolBucket,
  genesisAccount,
  payer: umi.payer,
  padding: Array(3).fill(0),
  extensions: [
    // Example: add a deposit limit
    { __kind: 'DepositLimit', depositLimit: { limit: 100_000_000_000n } },
    // Example: add a claim schedule with cliff
    // { __kind: 'ClaimSchedule', claimSchedule: createClaimSchedule({ ... }) },
  ],
}).sendAndConfirm(umi);

// Step 3: Set end behaviors
await setLaunchPoolBucketV2Behaviors(umi, {
  genesisAccount,
  bucket: launchPoolBucket,
  padding: Array(3).fill(0),
  endBehaviors: [
    {
      __kind: 'SendQuoteTokenPercentage',
      padding: Array(4).fill(0),
      destinationBucket: publicKey(unlockedBucket),
      percentageBps: 10000,  // 100%
      processed: false,
    },
  ],
}).sendAndConfirm(umi);
```

**Available extensions** for `addLaunchPoolBucketV2Extensions`:
- `DepositPenalty` / `WithdrawPenalty` / `BonusSchedule` — `LinearBpsScheduleV2Args` with `duration`, `interceptBps`, `maxBps`, `slopeBps`, `startCondition`
- `DepositLimit` — `{ limit: bigint }`
- `MinimumDepositAmount` — `{ amount: bigint }`
- `MinimumQuoteTokenThreshold` — `{ amount: bigint }`
- `Allowlist` — `{ merkleTreeHeight, merkleRoot, endTime, quoteCap }`
- `ClaimSchedule` — `createClaimSchedule({ startTime, endTime, period, cliffTime?, cliffAmountBps? })`

---

## Add Unlocked Bucket (Team/Treasury)

```typescript
import { addUnlockedBucketV2, createTimeAbsoluteCondition } from '@metaplex-foundation/genesis';

await addUnlockedBucketV2(umi, {
  genesisAccount,
  baseMint: baseMint.publicKey,
  baseTokenAllocation: 200_000_000_000_000n,  // 20% of supply
  recipient: umi.identity.publicKey,
  claimStartCondition: createTimeAbsoluteCondition(claimStart),
  claimEndCondition: createTimeAbsoluteCondition(claimEnd),
}).sendAndConfirm(umi);
```

---

## Finalize Launch

```typescript
import { finalizeV2 } from '@metaplex-foundation/genesis';

await finalizeV2(umi, {
  baseMint: baseMint.publicKey,
  genesisAccount,
}).sendAndConfirm(umi);
```

⚠️ **Finalization is irreversible.** No more buckets can be added after this.

---

## User Operations

### Deposit SOL

```typescript
import { depositLaunchPoolV2 } from '@metaplex-foundation/genesis';

await depositLaunchPoolV2(umi, {
  genesisAccount,
  bucket: launchPoolBucket,
  baseMint: baseMint.publicKey,
  amountQuoteToken: 10_000_000_000n,  // 10 SOL
}).sendAndConfirm(umi);
```

### Withdraw SOL

```typescript
import { withdrawLaunchPoolV2 } from '@metaplex-foundation/genesis';

await withdrawLaunchPoolV2(umi, {
  genesisAccount,
  bucket: launchPoolBucket,
  baseMint: baseMint.publicKey,
  amountQuoteToken: 3_000_000_000n,  // 3 SOL
}).sendAndConfirm(umi);
```

### Claim Tokens

```typescript
import { claimLaunchPoolV2 } from '@metaplex-foundation/genesis';

await claimLaunchPoolV2(umi, {
  genesisAccount,
  bucket: launchPoolBucket,
  baseMint: baseMint.publicKey,
  recipient: umi.identity.publicKey,
}).sendAndConfirm(umi);
```

---

## Execute Transition

After deposit period ends, execute transition to process end behaviors:

```typescript
import { triggerBehaviorsV2, WRAPPED_SOL_MINT } from '@metaplex-foundation/genesis';
import { findAssociatedTokenPda } from '@metaplex-foundation/mpl-toolbox';

const unlockedBucketQuoteTokenAccount = findAssociatedTokenPda(umi, {
  owner: unlockedBucket,
  mint: WRAPPED_SOL_MINT,
});

await triggerBehaviorsV2(umi, {
  genesisAccount,
  primaryBucket: launchPoolBucket,
  baseMint: baseMint.publicKey,
})
  .addRemainingAccounts([
    { pubkey: unlockedBucket, isSigner: false, isWritable: true },
    { pubkey: publicKey(unlockedBucketQuoteTokenAccount), isSigner: false, isWritable: true },
  ])
  .sendAndConfirm(umi);
```

---

## Revoke Authorities (Post-Launch)

```typescript
import { revokeV2 } from '@metaplex-foundation/genesis';
import { publicKey } from '@metaplex-foundation/umi';

const TOKEN_PROGRAM_ID = publicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');

// Revoke both mint and freeze authority in one call
await revokeV2(umi, {
  genesisAccount,
  baseMint: baseMint.publicKey,
  baseTokenProgram: TOKEN_PROGRAM_ID,
  revokeMintAuthority: true,
  revokeFreezeAuthority: true,
  padding: Array(5).fill(0),
}).sendAndConfirm(umi);
```

⚠️ **Authority revocation is irreversible.**

---

## Fetching State

```typescript
import {
  fetchLaunchPoolBucketV2,
  fetchLaunchPoolDepositV2,
  findLaunchPoolDepositV2Pda,
} from '@metaplex-foundation/genesis';

// Bucket state
const bucket = await fetchLaunchPoolBucketV2(umi, launchPoolBucket);
console.log('Total deposits:', bucket.quoteTokenDepositTotal);
console.log('Token allocation:', bucket.bucket.baseTokenAllocation);

// User deposit state
const [depositPda] = findLaunchPoolDepositV2Pda(umi, {
  bucket: launchPoolBucket,
  recipient: umi.identity.publicKey,
});
const deposit = await fetchLaunchPoolDepositV2(umi, depositPda);
console.log('User deposit:', deposit.amountQuoteToken);
```

---

## Add Presale Bucket

Fixed-price allocation: price = quoteCap / allocation. First-come-first-served.

**Setup for the following examples** (Presale, Bonding Curve, Streamflow):
```typescript
const now = BigInt(Math.floor(Date.now() / 1000));
const depositStart = now;
const depositEnd = now + 86400n;           // 1 day
const claimStart = now + 86400n * 3n;      // 3 days
const claimEnd = now + 86400n * 7n;        // 7 days
const startTime = now;
const endTime = now + 86400n;
const graduationTime = now + 86400n * 2n;  // 2 days
const teamWallet = umi.identity.publicKey;
const lockStart = now;
const lockEnd = now + 86400n * 30n;        // 30 days
const cliffDuration = 86400n * 7n;         // 7 days
```

```typescript
import {
  addPresaleBucketV2,
  findPresaleBucketV2Pda,
  createTimeAbsoluteCondition,
} from '@metaplex-foundation/genesis';

const [presaleBucket] = findPresaleBucketV2Pda(umi, {
  genesisAccount,
  bucketIndex: 0,
});

await addPresaleBucketV2(umi, {
  genesisAccount,
  baseMint: baseMint.publicKey,
  baseTokenAllocation: 100_000_000_000_000n,  // 10% of supply
  allocationQuoteTokenCap: 50_000_000_000n,   // 50 SOL cap → price = 0.5 SOL per 1M tokens
  minimumDepositAmount: null,                 // no minimum
  depositStartCondition: createTimeAbsoluteCondition(depositStart),
  depositEndCondition: createTimeAbsoluteCondition(depositEnd),
  claimStartCondition: createTimeAbsoluteCondition(claimStart),
  claimEndCondition: createTimeAbsoluteCondition(claimEnd),
  endBehaviors: [],
}).sendAndConfirm(umi);
```

### Presale User Operations

```typescript
import { depositPresaleV2, claimPresaleV2 } from '@metaplex-foundation/genesis';

// Deposit
await depositPresaleV2(umi, {
  genesisAccount,
  bucket: presaleBucket,
  baseMint: baseMint.publicKey,
  amountQuoteToken: 5_000_000_000n,  // 5 SOL
}).sendAndConfirm(umi);

// Claim tokens (after claim period starts)
await claimPresaleV2(umi, {
  genesisAccount,
  bucket: presaleBucket,
  baseMint: baseMint.publicKey,
}).sendAndConfirm(umi);
```

---

## Add Bonding Curve Bucket

Constant-product AMM with virtual reserves. Users can swap SOL for tokens and vice versa.

```typescript
import {
  addConstantProductBondingCurveBucketV2,
  findBondingCurveBucketV2Pda,
  createTimeAbsoluteCondition,
} from '@metaplex-foundation/genesis';

const [bondingCurveBucket] = findBondingCurveBucketV2Pda(umi, {
  genesisAccount,
  bucketIndex: 0,
});

await addConstantProductBondingCurveBucketV2(umi, {
  genesisAccount,
  baseMint: baseMint.publicKey,
  baseTokenAllocation: 300_000_000_000_000n,
  paused: false,
  swapStartCondition: createTimeAbsoluteCondition(startTime),
  swapEndCondition: createTimeAbsoluteCondition(endTime),
  virtualSol: 30_000_000_000n,       // 30 SOL virtual reserve
  virtualTokens: 300_000_000_000n,    // Virtual token reserve
  endBehaviors: [],
}).sendAndConfirm(umi);
```

### Bonding Curve Swaps

```typescript
import { swapBondingCurveV2 } from '@metaplex-foundation/genesis';
import { SwapDirection } from '@metaplex-foundation/genesis';

// Buy tokens with SOL
await swapBondingCurveV2(umi, {
  genesisAccount,
  bucket: bondingCurveBucket,
  baseMint: baseMint.publicKey,
  amount: 1_000_000_000n,            // 1 SOL
  minAmountOut: 0n,                   // Set slippage tolerance
  swapDirection: SwapDirection.Buy,
}).sendAndConfirm(umi);

// Sell tokens for SOL
await swapBondingCurveV2(umi, {
  genesisAccount,
  bucket: bondingCurveBucket,
  baseMint: baseMint.publicKey,
  amount: 100_000_000_000n,          // 100 tokens
  minAmountOut: 0n,
  swapDirection: SwapDirection.Sell,
}).sendAndConfirm(umi);
```

---

## Raydium CPMM Graduation

Graduate a launch pool to a Raydium CPMM liquidity pool.

```typescript
import {
  addRaydiumCpmmBucketV2,
  graduateToRaydiumCpmmV2,
  findRaydiumCpmmBucketV2Pda,
  deriveRaydiumPDAsV2,
  createNeverClaimSchedule,
  createTimeAbsoluteCondition,
} from '@metaplex-foundation/genesis';

// Step 1: Add Raydium CPMM bucket
const [raydiumBucket] = findRaydiumCpmmBucketV2Pda(umi, {
  genesisAccount,
  bucketIndex: 0,
});

await addRaydiumCpmmBucketV2(umi, {
  genesisAccount,
  baseMint: baseMint.publicKey,
  baseTokenAllocation: 200_000_000_000_000n,
  startCondition: createTimeAbsoluteCondition(graduationTime),
  lpLockSchedule: createNeverClaimSchedule(),  // Lock LP tokens forever
  endBehaviors: [],
}).sendAndConfirm(umi);

// Step 2: Graduate (after deposit period + transition)
const raydiumAccounts = deriveRaydiumPDAsV2(umi, baseMint.publicKey, {
  env: 'devnet',  // or 'mainnet'
});

await graduateToRaydiumCpmmV2(umi, {
  genesisAccount,
  bucket: raydiumBucket,
  baseMint: baseMint.publicKey,
  ...raydiumAccounts,
}).sendAndConfirm(umi);
```

---

## Streamflow Vesting (Low-Level)

Lock tokens in a Streamflow vesting stream. The low-level Streamflow instruction requires a `StreamflowConfigArgs` with many fields — for most use cases, prefer the **Launch API's `lockedAllocations`** which handles this automatically.

```typescript
import {
  addStreamflowBucketV2,
  findStreamflowBucketV2Pda,
  createTimeAbsoluteCondition,
} from '@metaplex-foundation/genesis';

const [streamflowBucket] = findStreamflowBucketV2Pda(umi, {
  genesisAccount,
  bucketIndex: 0,
});

await addStreamflowBucketV2(umi, {
  genesisAccount,
  baseMint: baseMint.publicKey,
  baseTokenAllocation: 100_000_000_000_000n,
  recipient: teamWallet,
  lockStartCondition: createTimeAbsoluteCondition(lockStart),
  lockEndCondition: createTimeAbsoluteCondition(lockEnd),
  config: {
    startTime: lockStart,
    period: 2_592_000n,                     // Monthly (30 days in seconds)
    amountPerPeriod: 8_333_333_000_000n,    // Tokens released per period
    cliff: cliffDuration,                   // Cliff duration in seconds
    cliffAmount: 10_000_000_000_000n,       // Tokens unlocked at cliff
    streamName: new Uint8Array(64),         // UTF-8 encoded stream name (padded to 64 bytes)
    withdrawFrequency: 2_592_000n,          // How often recipient can withdraw
    cancelableBySender: false,
    cancelableByRecipient: false,
    automaticWithdrawal: false,
    transferableBySender: false,
    transferableByRecipient: false,
    canTopup: false,
    pausable: false,
    canUpdateRate: false,
  },
}).sendAndConfirm(umi);
```

> **Tip**: For team vesting, the Launch API's `lockedAllocations` is much simpler — it converts high-level parameters (duration, unlock schedule, cliff) into the `StreamflowConfigArgs` automatically.

---

## Allowlist (Whitelist)

Restrict deposits to a merkle-tree allowlist.

```typescript
import { prepareAllowlist } from '@metaplex-foundation/genesis';
import { publicKey } from '@metaplex-foundation/umi';

const allowlistMembers = [
  { address: publicKey('Addr111...') },
  { address: publicKey('Addr222...') },
  { address: publicKey('Addr333...') },
];

const { root, proofs, treeHeight } = prepareAllowlist(allowlistMembers);

// Pass allowlist config when adding a presale or launch pool bucket:
await addPresaleBucketV2(umi, {
  // ...other params
  allowlist: {
    merkleTreeHeight: treeHeight,
    merkleRoot: Array.from(root),
    endTime: allowlistEndTimestamp,   // When allowlist restriction expires (open to all after)
    quoteCap: 0n,                     // Per-address SOL cap (0 = no per-address cap)
  },
}).sendAndConfirm(umi);

// When depositing, provide the user's merkle proof:
await depositPresaleV2(umi, {
  // ...other params
}).addRemainingAccounts(
  proofs[userIndex].map((proof) => ({
    pubkey: publicKey(proof),
    isSigner: false,
    isWritable: false,
  }))
).sendAndConfirm(umi);
```

---

## Helper Utilities

### Bonding Curve Helpers

```typescript
import {
  getSwapResult,
  getSwapAmountOutForIn,
  getSwapAmountInForOut,
  getCurrentPrice,
  fetchBondingCurveBucketV1,
} from '@metaplex-foundation/genesis';
import { SwapDirection } from '@metaplex-foundation/genesis';

const bucket = await fetchBondingCurveBucketV1(umi, bondingCurveBucket);

// Get swap result including fees
const result = getSwapResult(bucket, 1_000_000_000n, SwapDirection.Buy);
console.log('Amount in (incl. fee):', result.amountIn);
console.log('Fee:', result.fee);
console.log('Amount out:', result.amountOut);

// Get output amount (without fees)
const tokensOut = getSwapAmountOutForIn(bucket, 1_000_000_000n, SwapDirection.Buy);

// Get required input for desired output (without fees)
const solNeeded = getSwapAmountInForOut(bucket, 100_000_000_000n, SwapDirection.Buy);

// Get current token price
const price = getCurrentPrice(bucket);
```

### Schedule Helpers

```typescript
import {
  createClaimSchedule,
  createNeverClaimSchedule,
  createLinearBpsScheduleV2WithAbsoluteStart,
  createLinearBpsScheduleV2WithRelativeStart,
} from '@metaplex-foundation/genesis';

// Vesting schedule with cliff
const schedule = createClaimSchedule({
  startTime: BigInt(startTimestamp),
  endTime: BigInt(endTimestamp),
  cliffTime: BigInt(cliffTimestamp),
  cliffAmountBps: 1000,          // 10% at cliff
  period: 2_592_000n,            // Monthly release (30 days)
});

// Permanently locked (e.g., LP tokens)
const lockedForever = createNeverClaimSchedule();

// Linear schedule with absolute start (e.g., for deposit penalties)
const penalty = createLinearBpsScheduleV2WithAbsoluteStart({
  startTime: BigInt(penaltyStart),
  duration: 86400n * 7n,          // 7 days
  point1: { timeBps: 0n, bps: 500n },      // 5% at start
  point2: { timeBps: 10000n, bps: 0n },    // 0% at end
  maxBps: 500,
});
```

### Condition Helpers

```typescript
import {
  createTimeAbsoluteCondition,
  createTimeRelativeCondition,
  createNeverCondition,
  isConditionArgs,
} from '@metaplex-foundation/genesis';
import { BucketTimes } from '@metaplex-foundation/genesis';

// Trigger at specific Unix timestamp
const condition = createTimeAbsoluteCondition(BigInt(unixTimestamp));

// Trigger relative to another bucket's deposit end time (+ optional offset)
const relativeCondition = createTimeRelativeCondition(
  launchPoolBucket,              // reference bucket
  BucketTimes.DepositEnd,       // relative to its deposit end time
  60n,                           // 60 seconds after (optional, default 0)
);

// BucketTimes values: DepositStart, DepositEnd, ClaimStart, ClaimEnd,
//   SwapStart, SwapEnd, LockStart, LockEnd, GraduateStart, Graduate

// Never triggers (permanently locked)
const never = createNeverCondition();

// Type guard
if (isConditionArgs('TimeAbsolute', condition)) {
  console.log('Triggers at:', condition.time);
}
```

### Fee Calculation

```typescript
import {
  calculateFee,
  DEFAULT_LAUNCHPOOL_DEPOSIT_FEE,       // 200n (2% in bps)
  DEFAULT_LAUNCHPOOL_WITHDRAW_FEE,      // 200n
  DEFAULT_PRESALE_DEPOSIT_FEE,          // 200n
  DEFAULT_PRESALE_WITHDRAW_FEE,         // 200n
  DEFAULT_BONDING_CURVE_DEPOSIT_FEE,    // 200n
  DEFAULT_BONDING_CURVE_WITHDRAW_FEE,   // 200n
  DEFAULT_UNLOCKED_CLAIM_FEE,           // 500n (5% in bps)
} from '@metaplex-foundation/genesis';
import { FeeDiscriminants } from '@metaplex-foundation/genesis';

const fee = calculateFee(
  10_000_000_000n,                      // 10 SOL deposit
  FeeDiscriminants.BasisPoints,
  200n,                                 // 2%
);
// fee = 200_000_000n (0.2 SOL)
```

### Raydium PDA Derivation

```typescript
import { deriveRaydiumPDAsV2 } from '@metaplex-foundation/genesis';

// Returns all accounts needed for Raydium graduation
const raydiumAccounts = deriveRaydiumPDAsV2(umi, baseMint.publicKey, {
  env: 'mainnet',  // or 'devnet'
});

// raydiumAccounts contains:
// poolState, poolAuthority, lpMint, baseVault, quoteVault,
// observationState, ammConfig, raydiumProgram, createPoolFee,
// token0Mint, token1Mint, isProjectMintToken0, raydiumSigner, permission
```

---

## Key Constants

```typescript
import {
  WRAPPED_SOL_MINT,           // So11111111111111111111111111111111111111112
  SPL_TOKEN_2022_PROGRAM_ID,  // TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb
  FEE_WALLET,                 // 9kFjQsxtpBsaw8s7aUyiY3wazYDNgFP4Lj5rsBVVF8tb
  BACKEND_SIGNER,             // BESN8h2HKyvjzksY2Ka86eLPdjraNBW1jheqHGSw7NZn
} from '@metaplex-foundation/genesis';
```

---

## Fees

Genesis charges protocol-level fees on deposits and withdrawals. Default fees:

| Operation | Fee Type | Default |
|-----------|----------|---------|
| Launch Pool deposit/withdraw | BasisPoints | 200 (2%) |
| Presale deposit/withdraw | BasisPoints | 200 (2%) |
| Bonding Curve deposit/withdraw | BasisPoints | 200 (2%) |
| Vault deposit/withdraw | BasisPoints | 200 (2%) |
| Unlocked claim | BasisPoints | 500 (5%) |
| Auction bid | Flat | 1,000,000 (0.001 SOL) |

For current rates, see: https://metaplex.com/docs/protocol-fees

---

## Program ID

```
Genesis: GNS1S5J5AspKXgpjz6SvKL66kPaKWAhaGRhCqPRxii2B
```

## Documentation

Full documentation: https://metaplex.com/docs/smart-contracts/genesis
