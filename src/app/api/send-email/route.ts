import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, ticketType, quantity, bcpAmount, usdValue, nftAddress } = await request.json();

    const ticketName = ticketType === 'vip' ? 'VIP Experience' : 'General Admission';
    const amountUSD = (usdValue * quantity).toFixed(2);

    let nftSection = '';
    if (nftAddress) {
      nftSection = `
        <p style="margin-top: 20px;"><strong>Your Unique NFT Ticket:</strong></p>
        <p>Your generative NFT ticket has been minted to your wallet.</p>
        <p>
          <a href="https://solscan.io/token/${nftAddress}" target="_blank" style="color: #FF6B00; text-decoration: underline;">
            View your NFT on Solscan →
          </a>
        </p>
      `;
    }

    const emailData = {
      from: "BitcoinPalooza <noreply@bitcoinpalooza.nyc>",
      to: [email, "hello@bitcoinpalooza.nyc"],
      subject: `BitcoinPalooza Ticket Confirmation - ${ticketName}`,
      html: `
        <h2>Thank you for your purchase!</h2>
        <p><strong>Order Details:</strong></p>
        <ul>
          <li><strong>Email:</strong> ${email}</li>
          <li><strong>Ticket Type:</strong> ${ticketName}</li>
          <li><strong>Quantity:</strong> ${quantity}</li>
          <li><strong>Amount Paid:</strong> ${bcpAmount} BCP (≈ $${amountUSD})</li>
        </ul>

        ${nftSection}

        <p style="margin-top: 30px;">Your ticket(s) will be sent to this email shortly.</p>
        <p>— BitcoinPalooza Team</p>
      `,
    };

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailData),
    });

    const result = await res.json();

    if (!res.ok) {
      return NextResponse.json({ success: false, error: result }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });

  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}