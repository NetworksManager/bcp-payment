import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, generateSigner, keypairIdentity } from '@metaplex-foundation/umi';
import { create, fetchCollection } from '@metaplex-foundation/mpl-core';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { GeneratedTicket } from './generate';

// ⚠️ TEMPORARY - Hardcoded for now. Remove this later!
const HELIUS_API_KEY = "74182e68-a184-40a0-83fb-ee93b634cf85";
const COLLECTION_ADDRESS = 'EhtJjyAnswxJV84DhNNwwtvqqaiC7FeYgNJQvnpbcgSx';

// ⚠️ TEMPORARY - Replace this with your real secret key array
const MINTING_WALLET_SECRET = [12, 238, 148, 68, 108, 255, 154, 42, 79, 163, 151, 100, 201, 56, 122, 167, 9, 19, 135, 227, 38, 13, 141, 67, 220, 23, 254, 41, 41, 30, 225, 5, 208, 51, 47, 111, 43, 27, 31, 241, 202, 21, 41, 78, 175, 212, 87, 22, 130, 216, 169, 22, 167, 255, 111, 212, 66, 156, 114, 233, 223, 126, 171, 186];

export async function mintGenerativeTicket(
  buyerPublicKey: string,
  ticket: GeneratedTicket
) {
  const umi = createUmi(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`);

  const keypair = Keypair.fromSecretKey(new Uint8Array(MINTING_WALLET_SECRET));
  const umiKeypair = fromWeb3JsKeypair(keypair);
  const signer = createSignerFromKeypair(umi, umiKeypair);
  umi.use(keypairIdentity(signer));

  const collection = await fetchCollection(umi, fromWeb3JsPublicKey(new PublicKey(COLLECTION_ADDRESS)));
  const assetSigner = generateSigner(umi);

  const metadata = {
    name: `BitcoinPalooza UBW 2026 - ${ticket.tier}`,
    description: `Official generative NFT ticket for BitcoinPalooza UBW 2026`,
    attributes: Object.entries(ticket.traits).map(([category, trait]) => ({
      trait_type: category,
      value: trait.name,
    })),
  };

  console.log(`Minting ${ticket.tier} ticket to: ${buyerPublicKey}`);

  await create(umi, {
    asset: assetSigner,
    collection,
    owner: fromWeb3JsPublicKey(new PublicKey(buyerPublicKey)),
    name: metadata.name,
    uri: 'https://arweave.net/placeholder-metadata',
  }).sendAndConfirm(umi);

  console.log('✅ NFT minted successfully!');
  console.log('Asset Address:', assetSigner.publicKey);

  return {
    assetAddress: assetSigner.publicKey,
    metadata,
  };
}