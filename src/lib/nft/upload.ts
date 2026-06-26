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

  try {
    // Fund if needed
    const balance = await irys.getLoadedBalance();
    if (balance.toNumber() < 100000) {
      console.log("Funding Irys...");
      await irys.fund(irys.utils.toAtomic(0.05));
    }

    console.log("Uploading to Arweave...");
    const receipt = await irys.upload(data, {
      tags: [
        { name: "Content-Type", value: contentType },
        ...tags,
      ],
    });

    const url = `https://arweave.net/${receipt.id}`;
    console.log("Upload successful:", url);
    return url;

  } catch (error: unknown) {
    console.error("Arweave upload failed:", error);
    
    const message = error instanceof Error 
      ? error.message 
      : String(error);
      
    throw new Error("Failed to upload to Arweave: " + message);
  }
}