import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email, ticketType, quantity, bcpAmount, usdValue, nftAddress } = await request.json();

  const ticketName = ticketType === 'vip' ? 'VIP Experience' : 'General Admission';
  const amountUSD = (usdValue * quantity).toFixed(2);

  const tensorLink = nftAddress ? `https://www.tensor.trade/item/${nftAddress}` : null;
  const arweaveLink = nftAddress ? `https://gateway.irys.xyz/${nftAddress}` : null;

  const emailData = {
    from: "BitcoinPalooza <tickets@bitcoinpalooza.nyc>",
    to: [email, "hello@bitcoinpalooza.nyc"],
    subject: `Your BitcoinPalooza UBW 2026 Ticket Confirmation - ${ticketName}`,
    html: `
      <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; color: #222;">
        
        <h2 style="color: #FF6B00; margin-bottom: 8px;">Thank you for your purchase!</h2>
        <p style="font-size: 16px; margin-bottom: 24px;">Your ticket for <strong>BitcoinPalooza UBW 2026</strong> has been confirmed.</p>

        <!-- Order Details -->
        <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin-bottom: 24px;">
          <h3 style="margin: 0 0 16px 0; font-size: 18px;">Order Details</h3>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #555;">Ticket Type</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600;">${ticketName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #555;">Quantity</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600;">${quantity}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #555;">Amount Paid</td>
              <td style="padding: 6px 0; text-align: right; font-weight: 600;">${bcpAmount} BCP (≈ $${amountUSD})</td>
            </tr>
          </table>
        </div>

        <!-- NFT Ticket Section -->
        ${tensorLink ? `
          <div style="background: #fff7ed; border: 2px solid #FF6B00; padding: 24px; border-radius: 14px; margin-bottom: 24px;">
            <h3 style="margin: 0 0 12px 0; color: #c2410f; font-size: 18px;">🎟️ Your Generative NFT Ticket</h3>
            <p style="margin-bottom: 20px; color: #854d0e;">Your unique generative NFT ticket has been successfully minted!</p>
            
            <a href="${tensorLink}" 
               style="display: inline-block; background: #000000; color: white; padding: 14px 32px; border-radius: 10px; text-decoration: none; font-weight: 600; font-size: 15px;">
              View on Tensor →
            </a>
            
            <div style="margin-top: 16px;">
              <a href="${arweaveLink}" 
                 style="color: #FF6B00; font-size: 14px; text-decoration: underline;">
                View raw image on Arweave
              </a>
            </div>
          </div>
        ` : ''}

        <p style="color: #555; line-height: 1.6;">
          You will receive your official ticket(s) via email closer to the event date.
        </p>

        <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; color: #888; font-size: 14px;">
          — The BitcoinPalooza Team<br>
          <a href="https://bitcoinpalooza.nyc" style="color: #FF6B00; text-decoration: none;">bitcoinpalooza.nyc</a>
        </div>

      </div>
    `,
  };

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const result = await res.json();

    if (res.ok) {
      return NextResponse.json({ success: true });
    } else {
      console.error("Resend error:", result);
      return NextResponse.json({ success: false, error: result }, { status: 500 });
    }
  } catch (error: any) {
    console.error("Email sending failed:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}