'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { generateTicketNFT } from '@/lib/nft/generate';
import { 
  getAssociatedTokenAddress, 
  createTransferInstruction, 
  createAssociatedTokenAccountIdempotentInstruction 
} from '@solana/spl-token';

export default function BcpPaymentPage() {
  const { publicKey, signTransaction } = useWallet();
  const { setVisible } = useWalletModal();

  const [email, setEmail] = useState('');
  const [ticketType, setTicketType] = useState('general');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [bcpAmount, setBcpAmount] = useState(0);
  const [nftAddress, setNftAddress] = useState('');

  const HELIUS_API_KEY = "74182e68-a184-40a0-83fb-ee93b634cf85"; 
  const MERCHANT_WALLET = "C3CEgDqxAVqsyFjfcMz8PnELRE2u4AUQdqeypk7Ao2ZU";

  const usdValue = ticketType === 'vip' ? 49.5 : 19.5;

  const fetchBcpPrice = async () => {
    try {
      const poolAddress = "Hd7XZ57jveHneHwFcfgk6Ch71tGQZW6wr3s1LwvgNgKX";
      const res = await fetch(`https://api.geckoterminal.com/api/v2/networks/solana/pools/${poolAddress}`);
      const data = await res.json();

      if (data.data?.attributes?.base_token_price_usd) {
        const price = parseFloat(data.data.attributes.base_token_price_usd);
        if (price > 0) {
          setBcpAmount((usdValue * quantity) / price);
          return;
        }
      }
    } catch {}
    setBcpAmount(ticketType === 'vip' ? 25000000 * quantity : 15000000 * quantity);
  };

  useEffect(() => { fetchBcpPrice(); }, [ticketType, quantity]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('email')) setEmail(params.get('email')!);
    if (params.get('type')) setTicketType(params.get('type')!);
    if (params.get('qty')) setQuantity(parseInt(params.get('qty')!) || 1);
  }, []);

  const sendEmails = async (nftAddr?: string) => {
    try {
      await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, ticketType, quantity, bcpAmount: bcpAmount.toFixed(2), usdValue, nftAddress: nftAddr }),
      });
    } catch (err) {
      console.error("Email failed", err);
    }
  };

  const handlePayment = async () => {
    if (!publicKey || !signTransaction) return alert("Please connect wallet");

    setLoading(true);
    try {
      // ... (BCP transfer code stays the same - I'll keep it short here)
      const connection = new Connection(`https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`);
      // ... token transfer logic ...

      // Mint via API Route
      const ticketTier = ticketType === 'vip' ? 'VIP' : 'GA';
      const generatedTicket = generateTicketNFT(ticketTier);

      const nftRes = await fetch('/api/mint-ticket', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ buyerPublicKey: publicKey.toBase58(), ticket: generatedTicket }),
      });

      const nftData = await nftRes.json();
      if (!nftRes.ok) throw new Error(nftData.error);

      await sendEmails(nftData.assetAddress);
      setNftAddress(nftData.assetAddress);
      setSuccess(true);
    } catch (error: any) {
      console.error(error);
      alert("Payment failed: " + (error.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-2">Pay with BCP Token</h1>
      <p className="text-center text-gray-600 mb-8">50% OFF • BitcoinPalooza</p>

      {/* Order Summary + Pay Button + Success UI - same as before */}
      {/* (Paste your full return JSX here if you want, but this minimal version should show something) */}

      {success ? (
        <div className="text-center">
          <h3>✅ Payment Successful!</h3>
          <button onClick={() => window.location.href = "https://bitcoinpalooza.nyc"}>Return Home</button>
        </div>
      ) : (
        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold"
        >
          {loading ? "Processing..." : "Pay with BCP Now"}
        </button>
      )}
    </div>
  );
}