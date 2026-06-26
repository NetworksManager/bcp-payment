import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, generateSigner, keypairIdentity } from '@metaplex-foundation/umi';
import { create, fetchCollection } from '@metaplex-foundation/mpl-core';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { Keypair, PublicKey } from '@solana/web3.js';
import { GeneratedTicket } from './generate';

const HELIUS_API_KEY = "74182e68-a184-40a0-83fb-ee93b634cf85";
const COLLECTION_ADDRESS = 'EhtJjyAnswxJV84DhNNwwtvqqaiC7FeYgNJQvnpbcgSx';

export async function mintGenerativeTicket(
  buyerPublicKey: string,
  ticket: GeneratedTicket
) {
  console.log("DEBUG - Starting NFT mint...");

  if (!process.env.MINTING_WALLET_SECRET_V2) {
    throw new Error("MINTING_WALLET_SECRET_V2 is not set in environment variables");
  }

  const MINTING_WALLET_SECRET = JSON.parse(process.env.MINTING_WALLET_SECRET_V2);

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
  console.log('Asset Address:', assetSigner.publicKey.toString());

  return {
    assetAddress: assetSigner.publicKey.toString(),
    metadata,
  };
}