import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, generateSigner, keypairIdentity } from '@metaplex-foundation/umi';
import { createCollection } from '@metaplex-foundation/mpl-core';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { Connection, Keypair, LAMPORTS_PER_SOL } from '@solana/web3.js';

const MINTING_WALLET_SECRET = [secret key removed after minting];

async function main() {
  const umi = createUmi('https://api.mainnet-beta.solana.com');

  const keypair = Keypair.fromSecretKey(new Uint8Array(MINTING_WALLET_SECRET));
  const umiKeypair = fromWeb3JsKeypair(keypair);
  const signer = createSignerFromKeypair(umi, umiKeypair);
  umi.use(keypairIdentity(signer));

  // Check balance first
  const connection = new Connection('https://api.mainnet-beta.solana.com');
  const balance = await connection.getBalance(keypair.publicKey);
  console.log("Minting Wallet:", keypair.publicKey.toBase58());
  console.log("Balance:", balance / LAMPORTS_PER_SOL, "SOL");

  if (balance < 0.05 * LAMPORTS_PER_SOL) {
    console.log("❌ Not enough SOL. Please send more SOL to the wallet above.");
    return;
  }

  const collectionSigner = generateSigner(umi);
  console.log("\nCreating collection...");
  console.log("New Collection Address:", collectionSigner.publicKey);

  try {
    await createCollection(umi, {
      collection: collectionSigner,
      name: "BitcoinPalooza UBW 2026",
      uri: "https://arweave.net/placeholder", // We'll update this later
    }).sendAndConfirm(umi);

    console.log("✅ Collection created successfully!");
    console.log("Collection Address:", collectionSigner.publicKey);
  } catch (error) {
    console.error("❌ Failed to create collection:", error);
  }
}

main().catch(console.error);