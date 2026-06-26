import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { createSignerFromKeypair, generateSigner, keypairIdentity } from '@metaplex-foundation/umi';
import { create, fetchCollection } from '@metaplex-foundation/mpl-core';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey } from '@metaplex-foundation/umi-web3js-adapters';
import { Keypair, PublicKey } from '@solana/web3.js';
import { GeneratedTicket } from './generate';
import { uploadToArweave } from './upload';

const HELIUS_API_KEY = process.env.HELIUS_API_KEY || "";
const COLLECTION_ADDRESS = 'EhtJjyAnswxJV84DhNNwwtvqqaiC7FeYgNJQvnpbcgSx';

export async function mintGenerativeTicket(
  buyerPublicKey: string,
  ticket: GeneratedTicket
) {
  if (!process.env.MINTING_WALLET_SECRET_V2) {
    throw new Error("MINTING_WALLET_SECRET_V2 is not set in environment variables");
  }

  console.log("Uploading SVG and metadata to Arweave...");

  // 1. Upload SVG image
  const imageUrl = await uploadToArweave(
    ticket.svg,
    "image/svg+xml",
    [{ name: "App-Name", value: "BitcoinPalooza" }]
  );

  console.log("Image uploaded:", imageUrl);

  // 2. Upload metadata JSON
  const metadata = {
    ...ticket.metadata,
    image: imageUrl,
    properties: {
      files: [{ uri: imageUrl, type: "image/svg+xml" }],
    },
  };

  const metadataUrl = await uploadToArweave(
    JSON.stringify(metadata),
    "application/json",
    [{ name: "App-Name", value: "BitcoinPalooza" }]
  );

  console.log("Metadata uploaded:", metadataUrl);

  // 3. Mint the NFT with real metadata
  const umi = createUmi(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`);

  const keypair = Keypair.fromSecretKey(
    new Uint8Array(JSON.parse(process.env.MINTING_WALLET_SECRET_V2))
  );
  const umiKeypair = fromWeb3JsKeypair(keypair);
  const signer = createSignerFromKeypair(umi, umiKeypair);
  umi.use(keypairIdentity(signer));

  const collection = await fetchCollection(umi, fromWeb3JsPublicKey(new PublicKey(COLLECTION_ADDRESS)));
  const assetSigner = generateSigner(umi);

  await create(umi, {
    asset: assetSigner,
    collection,
    owner: fromWeb3JsPublicKey(new PublicKey(buyerPublicKey)),
    name: metadata.name,
    uri: metadataUrl,
  }).sendAndConfirm(umi);

  console.log("✅ NFT minted successfully!");
  console.log("Asset Address:", assetSigner.publicKey.toString());

  return {
    assetAddress: assetSigner.publicKey.toString(),
    metadataUrl,
    imageUrl,
  };
}