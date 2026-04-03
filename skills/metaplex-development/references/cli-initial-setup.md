# Metaplex CLI Initial Setup

> **Check first**: Run `mplx config get rpcUrl && mplx config get keypair && mplx toolbox sol balance` before starting setup. If all three return valid values, setup is already complete — skip this file.

### 1. Configure RPC URLs

Ask the user whether they have their own RPC provider (e.g., Helius, Triton, QuickNode) or want to use the default public RPCs. Public RPCs are rate-limited and may fail under load. Recommend adding RPCs for both devnet and mainnet so they can easily switch later.

**Add RPC URLs to the CLI:**

```bash
# Add custom RPCs (recommended)
mplx config rpcs add mainnet <USER_MAINNET_RPC_URL>
mplx config rpcs add devnet <USER_DEVNET_RPC_URL>

# Or add default public RPCs (rate-limited)
mplx config rpcs add mainnet https://api.mainnet-beta.solana.com
mplx config rpcs add devnet https://api.devnet.solana.com
mplx config rpcs add localnet http://localhost:8899
```

**Then set the active RPC by name or URL:**

```bash
mplx config rpcs set <name>          # e.g., mplx config rpcs set devnet
mplx config set rpcUrl <RPC_URL>     # or set directly by URL
```

### 2. Configure Keypair

Ask the user whether they want to create a new CLI-managed wallet or use an existing Solana CLI keypair.

**Option A — New CLI wallet:**

```bash
mplx config wallets new <wallet-name> --hidden
```

**Option B — Existing Solana CLI keypair:**

```bash
mplx config wallets add <wallet-name> ~/.config/solana/id.json
```

### 3. Fund Your Wallet (devnet)

```bash
mplx toolbox sol airdrop --amount 2
```

### 4. Verify Setup

Run all checks in one command:

```bash
mplx config get rpcUrl && mplx config get keypair && mplx toolbox sol balance
```

### Setup Error Resolution

- **`mplx: command not found`** — Install the CLI: `npm i -g @metaplex-foundation/cli`
- **`No RPC URL configured`** — Ask the user for an RPC address, or default to devnet: `mplx config set rpcUrl https://api.devnet.solana.com`
- **`No keypair configured`** — Ask the user if they want to create a new CLI wallet (`mplx config wallets new <name> --hidden`) or add an existing Solana keypair (`mplx config wallets add <name> ~/.config/solana/id.json`)
- **`0 SOL`** — Airdrop on devnet: `mplx toolbox sol airdrop --amount 2` (devnet only)

> **Mainnet Safety:** If RPC URL contains `mainnet`, confirm with user before executing commands that spend SOL.
