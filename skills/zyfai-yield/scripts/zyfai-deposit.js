#!/usr/bin/env node
// Deposit funds into Zyfai subaccount
// Usage: node zyfai-deposit.js <privateKey> <chainId> <amount> [token]
// amount: human-readable (e.g. "100" = 100 USDC, "0.5" = 0.5 WETH)
// token: USDC (default) | WETH
const { ZyfaiSDK } = require("@zyfai/sdk");
const { ethers } = require("ethers");

const [,, privateKey, chainId = "8453", amount, token = "USDC"] = process.argv;
if (!privateKey || !amount) { console.error("Usage: node zyfai-deposit.js <privateKey> <chainId> <amount> [USDC|WETH]"); process.exit(1); }

const decimals = token === "WETH" ? 18 : 6;
const rawAmount = ethers.parseUnits(amount, decimals).toString();
const chainIdNum = parseInt(chainId);
const wallet = new ethers.Wallet(privateKey);

(async () => {
  const sdk = new ZyfaiSDK({ apiKey: process.env.ZYFAI_API_KEY });
  await sdk.connectAccount(privateKey, chainIdNum);
  console.log(`Depositing ${amount} ${token} (${rawAmount} raw) on chain ${chainIdNum}...`);
  await sdk.depositFunds(wallet.address, chainIdNum, rawAmount, token === "USDC" ? undefined : token);
  console.log("Deposit complete.");
  await sdk.disconnectAccount();
})().catch(e => { console.error(e.message); process.exit(1); });
