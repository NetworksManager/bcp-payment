import { NextResponse } from 'next/server';
import { mintGenerativeTicket } from '@/lib/nft/mint';
import { GeneratedTicket } from '@/lib/nft/generate';

export async function POST(request: Request) {
  // === DEBUG LOGS ===
  console.log("=== MINT API DEBUG ===");
  console.log("MINTING_WALLET_SECRET_V2 exists:", !!process.env.MINTING_WALLET_SECRET_V2);
  console.log("MINTING_WALLET_SECRET_V2 length:", process.env.MINTING_WALLET_SECRET_V2?.length || 0);
  console.log("HELIUS_API_KEY exists:", !!process.env.HELIUS_API_KEY);
  // === END DEBUG ===

  try {
    const { buyerPublicKey, ticket } = await request.json();

    if (!buyerPublicKey || !ticket) {
      return NextResponse.json(
        { success: false, error: "Missing buyerPublicKey or ticket data" },
        { status: 400 }
      );
    }

    console.log("🔄 Minting NFT for:", buyerPublicKey);

    const result = await mintGenerativeTicket(
      buyerPublicKey,
      ticket as GeneratedTicket
    );

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