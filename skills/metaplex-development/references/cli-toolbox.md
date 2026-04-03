# Metaplex CLI — Toolbox (Storage, SOL, Tokens, Rent, Templates, Raw)

## Rent

```bash
mplx toolbox rent <BYTES>               # Get rent cost for a given number of bytes
```

## Raw Transaction Sender

Send arbitrary base64-encoded instructions as raw transactions. Useful for executing custom program instructions or interacting with programs not directly supported by the CLI.

```bash
mplx toolbox raw --instruction <base64>                    # Execute a base64-encoded instruction
mplx toolbox raw --instruction <ix1> --instruction <ix2>   # Multiple instructions
echo "<base64>" | mplx toolbox raw --stdin                 # From stdin
```

## Templates

Templates download to the current directory the CLI is run from.

```bash
mplx toolbox template program            # Download a MPLX program template
mplx toolbox template website            # Download a MPLX website template
```

## Storage (Irys)

```bash
mplx toolbox storage upload <PATH>
mplx toolbox storage upload <PATH> --directory    # Multiple files at once
mplx toolbox storage balance                      # Check Irys balance
mplx toolbox storage fund <AMOUNT>                # Fund Irys account
mplx toolbox storage withdraw <AMOUNT>            # Withdraw from Irys
```

> Check `mplx toolbox storage balance` before large uploads. Fund with `mplx toolbox storage fund <AMOUNT>` if insufficient.

## SOL

```bash
mplx toolbox sol balance
mplx toolbox sol airdrop --amount <NUM>
mplx toolbox sol transfer <DESTINATION> <AMOUNT>
mplx toolbox sol wrap <AMOUNT>                    # SOL -> wSOL
mplx toolbox sol unwrap                           # wSOL -> SOL
```

## Tokens (fungible)

```bash
mplx toolbox token create --wizard                                          # Interactive (recommended)
mplx toolbox token create --name <NAME> --symbol <SYM> --decimals <NUM> --image <PATH>
mplx toolbox token create --name <NAME> --symbol <SYM> --decimals <NUM> --image <PATH> --mint-amount <NUM>
mplx toolbox token create --name <NAME> --symbol <SYM> --decimals <NUM> --image <PATH> --description <DESC>
mplx toolbox token mint <MINT_ADDRESS> <AMOUNT>                             # Mint more tokens
mplx toolbox token mint <MINT_ADDRESS> <AMOUNT> --recipient <ADDR>          # Mint to another wallet
mplx toolbox token transfer <MINT> <AMOUNT> <DESTINATION>
mplx toolbox token update <MINT> --name <NAME>                              # Update metadata
mplx toolbox token add-metadata <MINT> --name <NAME> --symbol <SYM> --image <PATH>  # Add metadata to existing mint
```

**Notes:**
- `mplx toolbox token create` requires a local `--image` file — it does NOT accept `--uri`. The CLI handles upload to Irys automatically, so this command requires Irys storage access and will not work on localnet/localhost.
- `--mint-amount`, `mplx toolbox token mint`, and `mplx toolbox token transfer` amounts are all in **base units** (smallest denomination). E.g., with 9 decimals, `--mint-amount 1000000000` mints 1 token. Tokens are minted to the payer wallet by default (use `mplx toolbox token mint <MINT> <AMOUNT> --recipient <ADDR>` for another wallet).
- `--decimals 9` is the standard for Solana tokens. Use 9 unless the user specifies otherwise.
- `mplx toolbox token mint` and `mplx toolbox token transfer` may fail on localnet if the mpl-toolbox program is not deployed. On localnet, use `spl-token mint` and `spl-token transfer` as fallbacks.
