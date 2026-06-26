import Irys from '@irys/sdk';

async function verifyArweaveUpload(url: string, maxAttempts = 5): Promise<boolean> {
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        console.log(`✅ Verified upload: ${url}`);
        return true;
      }
    } catch (e) {
      // ignore fetch errors during retry
    }
    console.log(`⏳ Waiting for Arweave propagation... (${i + 1}/${maxAttempts})`);
    await new Promise(resolve => setTimeout(resolve, 3000)); // wait 3 seconds
  }
  return false;
}

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

  const maxRetries = 3;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`Uploading to Arweave (attempt ${attempt}/${maxRetries})...`);

      // Fund if balance is low
      const balance = await irys.getLoadedBalance();
      if (balance.toNumber() < 200000) {
        await irys.fund(irys.utils.toAtomic(0.05));
      }

      const receipt = await irys.upload(data, {
        tags: [
          { name: "Content-Type", value: contentType },
          ...tags,
        ],
      });

      const url = `https://arweave.net/${receipt.id}`;
      console.log("Upload reported successful:", url);

      // Verify the upload actually exists
      const verified = await verifyArweaveUpload(url);
      if (verified) {
        return url;
      } else {
        console.log("Upload not yet available, will retry...");
      }

    } catch (error: unknown) {
      console.error(`Upload attempt ${attempt} failed:`, error);
      if (attempt === maxRetries) {
        const message = error instanceof Error ? error.message : String(error);
        throw new Error("Failed to upload to Arweave after retries: " + message);
      }
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  throw new Error("Failed to upload to Arweave after all retries");
}