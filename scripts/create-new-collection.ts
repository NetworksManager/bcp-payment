import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity } from '@metaplex-foundation/umi';
import { createCollection } from '@metaplex-foundation/mpl-core';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { Keypair } from '@solana/web3.js';

const HELIUS_API_KEY = "74182e68-a184-40a0-83fb-ee93b634cf85";

// === PASTE YOUR NEW MINTING WALLET SECRET KEY ARRAY HERE ===
const MINTING_WALLET_SECRET = [in between these brackets];

async function main() {
  const umi = createUmi(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`);

  const keypair = Keypair.fromSecretKey(new Uint8Array(MINTING_WALLET_SECRET));
  
  // Apply signer
  umi.use(keypairIdentity(fromWeb3JsKeypair(keypair)));

  console.log("Creating new collection with wallet:", keypair.publicKey.toBase58());

  try {
    const { signature } = await createCollection(umi, {
      name: "BitcoinPalooza UBW 2026",
      uri: "https://arweave.net/placeholder-collection-metadata",
    }).sendAndConfirm(umi);

    console.log("\n✅ SUCCESS! New Collection Created!");
    console.log("Collection Address:", signature);
    console.log("\nSend this address to me.");
  } catch (error: any) {
    console.error("❌ Error:", error);
    if (error.logs) console.log("Logs:", error.logs);
  }
}

main().catch(console.error);