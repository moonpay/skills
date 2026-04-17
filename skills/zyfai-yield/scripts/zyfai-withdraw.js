#!/usr/bin/env node
// Withdraw funds from Zyfai subaccount back to your wallet
// Usage: node zyfai-withdraw.js <privateKey> <chainId> [amount] [token]
// Omit amount to withdraw all. token: USDC (default) | WETH
const { ZyfaiSDK } = require("@zyfai/sdk");
const { ethers } = require("ethers");

const [,, privateKey, chainId = "8453", amount, token = "USDC"] = process.argv;
if (!privateKey) { console.error("Usage: node zyfai-withdraw.js <privateKey> <chainId> [amount] [USDC|WETH]"); process.exit(1); }

const chainIdNum = parseInt(chainId);
const wallet = new ethers.Wallet(privateKey);
const decimals = token === "WETH" ? 18 : 6;
const rawAmount = amount ? ethers.parseUnits(amount, decimals).toString() : undefined;

(async () => {
  const sdk = new ZyfaiSDK({ apiKey: process.env.ZYFAI_API_KEY });
  await sdk.connectAccount(privateKey, chainIdNum);
  const label = amount ? `${amount} ${token}` : `all ${token}`;
  console.log(`Withdrawing ${label} on chain ${chainIdNum}...`);
  await sdk.withdrawFunds(wallet.address, chainIdNum, rawAmount, token === "USDC" ? undefined : token);
  console.log("Withdrawal complete.");
  await sdk.disconnectAccount();
})().catch(e => { console.error(e.message); process.exit(1); });
