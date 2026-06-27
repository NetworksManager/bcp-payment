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

  const maxRetries = 4;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`[UPLOAD] Attempt ${attempt}/${maxRetries}`);

      const balance = await irys.getLoadedBalance();
      console.log(`[UPLOAD] Current Irys balance: ${balance.toString()}`);

      if (balance.toNumber() < 50000) {
        console.log("[UPLOAD] Funding Irys with 0.05 SOL...");
        await irys.fund(irys.utils.toAtomic(0.05));
      }

      const receipt = await irys.upload(data, {
        tags: [
          { name: "Content-Type", value: contentType },
          ...tags,
        ],
      });

      const url = `https://gateway.irys.xyz/${receipt.id}`;
      console.log("✅ [UPLOAD] Success:", url);
      return url;

    } catch (error: unknown) {
      console.error(`❌ [UPLOAD] Attempt ${attempt} failed:`, error);

      if (attempt === maxRetries) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error("Failed to upload to Arweave: " + message);
      }

      await new Promise(resolve => setTimeout(resolve, 4000));
    }
  }

  throw new Error("Failed to upload to Arweave");
}