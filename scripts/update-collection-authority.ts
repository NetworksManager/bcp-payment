import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { keypairIdentity, createSignerFromKeypair } from '@metaplex-foundation/umi';
import { updateCollection } from '@metaplex-foundation/mpl-core';
import { fromWeb3JsKeypair } from '@metaplex-foundation/umi-web3js-adapters';
import { Keypair, PublicKey } from '@solana/web3.js';

const HELIUS_API_KEY = "74182e68-a184-40a0-83fb-ee93b634cf85";
const COLLECTION_ADDRESS = "EhtJjyAnswxJV84DhNNwwtvqqaiC7FeYgNJQvnpbcgSx";

// === OLD WALLET (current owner of the collection) ===
const OLD_WALLET_SECRET = [ /* PASTE THE OLD WALLET SECRET KEY ARRAY HERE */ ];

// === NEW WALLET PUBLIC KEY (the one you want to use for minting) ===
const NEW_AUTHORITY = new PublicKey("6cLzGj2EZw6DYgo9s6TgBspGxtY4GuzJA69wkgzsEoZn");

async function main() {
  const umi = createUmi(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`);

  // Load old wallet (must be the current authority)
  const oldKeypair = Keypair.fromSecretKey(new Uint8Array(OLD_WALLET_SECRET));
  const oldSigner = createSignerFromKeypair(umi, fromWeb3JsKeypair(oldKeypair));
  umi.use(keypairIdentity(oldSigner));

  console.log("Transferring collection authority...");
  console.log("Collection:", COLLECTION_ADDRESS);
  console.log("New Authority:", NEW_AUTHORITY.toBase58());

  try {
    await updateCollection(umi, {
      collection: new PublicKey(COLLECTION_ADDRESS),
      authority: oldSigner,
      newUpdateAuthority: NEW_AUTHORITY,     // ← This is the missing piece
    }).sendAndConfirm(umi);

    console.log("\n✅ SUCCESS! Authority transferred!");
    console.log("The collection is now owned by:", NEW_AUTHORITY.toBase58());
  } catch (error: any) {
    console.error("❌ Error updating authority:", error);
  }
}

main().catch(console.error);