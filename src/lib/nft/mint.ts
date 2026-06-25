import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, generateSigner, keypairIdentity } from '@metaplex-foundation/umi';
import { create, fetchCollection } from '@metaplex-foundation/mpl-core';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { Connection, Keypair, PublicKey } from '@solana/web3.js';
import { GeneratedTicket } from './generate';

// === CONFIGURATION (Now using Environment Variables) ===
const HELIUS_API_KEY = process.env.HELIUS_API_KEY!;
const MINTING_WALLET_SECRET = JSON.parse(process.env.MINTING_WALLET_SECRET!);
const COLLECTION_ADDRESS = 'EhtJjyAnswxJV84DhNNwwtvqqaiC7FeYgNJQvnpbcgSx';

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