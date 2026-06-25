import { NextResponse } from 'next/server';
import { mintGenerativeTicket } from '@/lib/nft/mint';

export async function POST(request: Request) {
  try {
    const { buyerPublicKey, ticket } = await request.json();

    if (!buyerPublicKey || !ticket) {
      return NextResponse.json(
        { error: "Missing buyerPublicKey or ticket data" },
        { status: 400 }
      );
    }

    const result = await mintGenerativeTicket(buyerPublicKey, ticket);

    return NextResponse.json({
      success: true,
      assetAddress: result.assetAddress.toString(),
      metadata: result.metadata,
    });

  } catch (error: any) {
    console.error("Mint API Error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mint NFT" },
      { status: 500 }
    );
  }
}