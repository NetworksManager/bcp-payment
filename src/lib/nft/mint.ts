// src/lib/nft/mint.ts

import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, generateSigner, keypairIdentity } from '@metaplex-foundation/umi';
import { create, fetchCollection } from '@metaplex-foundation/mpl-core';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { GeneratedTicket } from './generate';

// === CONFIGURATION ===
const MINTING_WALLET_SECRET = [146,201,220,158,222,121,137,45,7,140,228,96,5,253,5,85,147,187,214,176,41,251,170,165,220,1,68,145,233,25,112,166,147,182,133,166,253,206,132,143,204,117,120,126,225,168,248,158,57,9,48,253,2,64,108,19,54,81,202,148,59,93,183,184];
const COLLECTION_ADDRESS = 'EhtJjyAnswxJV84DhNNwwtvqqaiC7FeYgNJQvnpbcgSx'; // ← Your collection

export async function mintGenerativeTicket(
  buyerPublicKey: string,
  ticket: GeneratedTicket
) {
  const umi = createUmi('https://api.mainnet-beta.solana.com');

  // Load minting wallet
  const keypair = Keypair.fromSecretKey(new Uint8Array(MINTING_WALLET_SECRET));
  const umiKeypair = fromWeb3JsKeypair(keypair);
  const signer = createSignerFromKeypair(umi, umiKeypair);
  umi.use(keypairIdentity(signer));

  const collection = await fetchCollection(umi, fromWeb3JsPublicKey(new PublicKey(COLLECTION_ADDRESS)));
  const assetSigner = generateSigner(umi);

  // Create metadata from generated traits
  const metadata = {
    name: `BitcoinPalooza UBW 2026 - ${ticket.tier}`,
    description: `Official generative NFT ticket for BitcoinPalooza UBW 2026`,
    attributes: Object.entries(ticket.traits).map(([category, trait]) => ({
      trait_type: category,
      value: trait.name,
    })),
    // We'll add image URI later when we have generative images
  };

  console.log(`Minting ${ticket.tier} ticket to: ${buyerPublicKey}`);

  await create(umi, {
    asset: assetSigner,
    collection,
    owner: fromWeb3JsPublicKey(new PublicKey(buyerPublicKey)),
    name: metadata.name,
    uri: 'https://arweave.net/placeholder-metadata', // We'll update this later
  }).sendAndConfirm(umi);

  console.log('✅ NFT minted successfully!');
  console.log('Asset Address:', assetSigner.publicKey);

  return {
    assetAddress: assetSigner.publicKey,
    metadata,
  };
}