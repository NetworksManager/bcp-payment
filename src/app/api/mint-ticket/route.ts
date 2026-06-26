import { NextResponse } from 'next/server';
import { mintGenerativeTicket } from '@/lib/nft/mint';
import { GeneratedTicket } from '@/lib/nft/generate';

export async function POST(request: Request) {
  try {
    const { buyerPublicKey, ticket } = await request.json();

    if (!buyerPublicKey || !ticket) {
      return NextResponse.json({ error: "Missing buyerPublicKey or ticket data" }, { status: 400 });
    }

    console.log("🔄 Starting NFT mint via API route...");

    const result = await mintGenerativeTicket(buyerPublicKey, ticket as GeneratedTicket);

    console.log("✅ NFT minted successfully:", result.assetAddress);

    return NextResponse.json({
      success: true,
      assetAddress: result.assetAddress,
    });

  } catch (error: any) {
    console.error("❌ Mint API Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to mint NFT"
    }, { status: 500 });
  }
}