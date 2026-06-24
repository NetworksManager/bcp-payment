import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, ticketType, quantity, bcpAmount, usdValue } = body;

    console.log("📩 Email request received:", { email, ticketType, quantity });

    const ticketName = ticketType === 'vip' ? 'VIP Experience' : 'General Admission';
    const amountUSD = (usdValue * quantity).toFixed(2);

    const emailData = {
      from: "BitcoinPalooza <onboarding@resend.dev>",
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
        <p>Your ticket(s) will be sent to this email shortly.</p>
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
      console.error("❌ Resend API returned error:", result);
      return NextResponse.json({ 
        success: false, 
        error: result,
        message: "Resend API error" 
      }, { status: 500 });
    }

    console.log("✅ Email sent successfully via Resend");
    return NextResponse.json({ success: true, result });

  } catch (error: any) {
    console.error("❌ API Route crashed:", error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || String(error) 
    }, { status: 500 });
  }
}