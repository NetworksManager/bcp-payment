import { NextResponse } from 'next/server';
import { mintGenerativeTicket } from '@/lib/nft/mint';
import { GeneratedTicket } from '@/lib/nft/generate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { buyerPublicKey, ticket } = body;

    if (!buyerPublicKey || !ticket) {
      return NextResponse.json(
        { success: false, error: "Missing buyerPublicKey or ticket data" },
        { status: 400 }
      );
    }

    console.log("🔄 Minting NFT via API route for:", buyerPublicKey);

    const result = await mintGenerativeTicket(
      buyerPublicKey,
      ticket as GeneratedTicket
    );

    console.log("✅ NFT minted successfully:", result.assetAddress);

    return NextResponse.json({
      success: true,
      assetAddress: result.assetAddress,
    });

  } catch (error: any) {
    console.error("❌ Mint API Error:", error);

    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to mint NFT ticket",
      },
      { status: 500 }
    );
  }
}