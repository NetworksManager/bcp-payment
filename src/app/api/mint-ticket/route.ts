import { NextResponse } from 'next/server';
import { mintGenerativeTicket } from '@/lib/nft/mint';
import { GeneratedTicket } from '@/lib/nft/generate';

export async function POST(request: Request) {
  console.log("=== [ROUTE] /api/mint-ticket called ===");
  console.log("MINTING_WALLET_SECRET_V2 exists:", !!process.env.MINTING_WALLET_SECRET_V2);
  console.log("MINTING_WALLET_SECRET_V2 length:", process.env.MINTING_WALLET_SECRET_V2?.length || 0);

  try {
    const { buyerPublicKey, ticket } = await request.json();

    if (!buyerPublicKey || !ticket) {
      return NextResponse.json(
        { success: false, error: "Missing buyerPublicKey or ticket data" },
        { status: 400 }
      );
    }

    const result = await mintGenerativeTicket(
      buyerPublicKey,
      ticket as GeneratedTicket
    );

    return NextResponse.json({
      success: true,
      assetAddress: result.assetAddress,
      metadataUrl: result.metadataUrl,
      imageUrl: result.imageUrl,
    });

  } catch (error: any) {
    console.error("❌ [ROUTE] Mint API Error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Failed to mint NFT ticket",
      },
      { status: 500 }
    );
  }
}