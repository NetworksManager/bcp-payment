import Irys from '@irys/sdk';

export async function uploadToArweave(
  data: string | Buffer,
  contentType: string,
  tags: any[] = []
): Promise<string> {
  const privateKey = process.env.MINTING_WALLET_SECRET_V2;
  const heliusKey = process.env.HELIUS_API_KEY;

  if (!privateKey) {
    throw new Error("MINTING_WALLET_SECRET_V2 is not set");
  }

  const irys = new Irys({
    network: "mainnet",
    token: "solana",
    key: JSON.parse(privateKey),
    config: {
      providerUrl: heliusKey 
        ? `https://mainnet.helius-rpc.com/?api-key=${heliusKey}`
        : "https://api.mainnet-beta.solana.com",
    },
  });

  const receipt = await irys.upload(data, {
    tags: [
      { name: "Content-Type", value: contentType },
      ...tags,
    ],
  });

  return `https://arweave.net/${receipt.id}`;
}