'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useWalletModal } from '@solana/wallet-adapter-react-ui';
import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { generateTicketNFT } from '@/lib/nft/generate';
import { mintGenerativeTicket } from '@/lib/nft/mint';
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
      setBcpAmount(ticketType === 'vip' ? 25000000 * quantity : 15000000 * quantity);
    } catch {
      setBcpAmount(ticketType === 'vip' ? 25000000 * quantity : 15000000 * quantity);
    }
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
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          ticketType,
          quantity,
          bcpAmount: bcpAmount.toFixed(2),
          usdValue,
          nftAddress: nftAddr,
        }),
      });

      const result = await res.json();
      if (result.success) {
        console.log("✅ Emails sent successfully");
      } else {
        console.error("❌ Email sending failed:", result.error);
      }
    } catch (err) {
      console.error("❌ Failed to call email API:", err);
    }
  };

  const handlePayment = async () => {
    if (!publicKey || !signTransaction) {
      alert("Please connect your wallet first");
      return;
    }

    if (HELIUS_API_KEY.length < 30) {
      alert("Please add your Helius API key in the code");
      return;
    }

    setLoading(true);

    try {
      const connection = new Connection(
        `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
      );

      const mint = new PublicKey("Ame1dzZcompavH8xZW98C6igpxUCd6GfDrGrsnTpump");
      const merchant = new PublicKey(MERCHANT_WALLET);

      const userAta = await getAssociatedTokenAddress(mint, publicKey);
      const merchantAta = await getAssociatedTokenAddress(mint, merchant);

      const transaction = new Transaction();

      transaction.add(
        createAssociatedTokenAccountIdempotentInstruction(publicKey, userAta, publicKey, mint)
      );
      transaction.add(
        createAssociatedTokenAccountIdempotentInstruction(publicKey, merchantAta, merchant, mint)
      );

      const bcpAmountInSmallestUnit = Math.floor(bcpAmount * 1_000_000);

      transaction.add(
        createTransferInstruction(userAta, merchantAta, publicKey, bcpAmountInSmallestUnit)
      );

      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTx = await signTransaction(transaction);
      await connection.sendRawTransaction(signedTx.serialize());

      const ticketTier = ticketType === 'vip' ? 'VIP' : 'GA';
      const generatedTicket = generateTicketNFT(ticketTier);

      const nftResult = await mintGenerativeTicket(
        publicKey.toBase58(),
        generatedTicket
      );

      console.log("NFT minted:", nftResult.assetAddress);

      await sendEmails(nftResult.assetAddress.toString());

      setNftAddress(nftResult.assetAddress.toString());
      setSuccess(true);

    } catch (error: any) {
      console.error("Payment Error:", error);

      let errorMessage = "Payment failed. Please try again.";

      const errorString = error.message?.toLowerCase() || "";

      if (errorString.includes("insufficient lamports") || 
          errorString.includes("no record of a prior credit")) {
        errorMessage = 
          "Your wallet needs a small amount of SOL to create the token account.\n\n" +
          "Please send at least 0.02 SOL to your connected wallet and try again.";
      } 
      else if (errorString.includes("simulation failed")) {
        errorMessage = 
          "Transaction simulation failed. This usually means your wallet doesn't have enough SOL " +
          "to create the BCP token account.\n\nPlease send a small amount of SOL (~0.02) to your wallet.";
      } 
      else if (errorString.includes("insufficient funds")) {
        errorMessage = "You don't have enough BCP tokens to complete this purchase.";
      }

      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8">
      <h1 className="text-3xl font-bold text-center mb-2">Pay with BCP Token</h1>
      <p className="text-center text-gray-600 mb-8">50% OFF • BitcoinPalooza</p>

      <div className="bg-white border-2 border-orange-500 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
        
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Email</span>
            <span className="font-medium">{email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ticket Type</span>
            <span className="font-medium">{ticketType === 'vip' ? 'VIP Experience' : 'General Admission'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Quantity</span>
            <span className="font-medium">{quantity}</span>
          </div>
        </div>

        <div className="border-t my-4"></div>

        <div className="flex justify-between items-end">
          <span className="font-semibold text-lg">You Pay</span>
          <div className="text-right">
            <div className="text-4xl font-bold text-orange-600">
              {bcpAmount.toFixed(2)}
            </div>
            <div className="text-sm text-gray-500">
              BCP ≈ ${(usdValue * quantity).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {!publicKey ? (
        <button onClick={() => setVisible(true)} className="w-full bg-black text-white py-4 rounded-xl font-semibold mb-4">
          Connect Wallet
        </button>
      ) : (
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600">Connected</p>
          <p className="font-mono text-xs break-all bg-gray-100 p-2 rounded">{publicKey.toBase58()}</p>
        </div>
      )}

      {publicKey && !success && (
        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg disabled:bg-orange-300"
        >
          {loading ? "Processing Payment..." : "Pay with BCP Now"}
        </button>
      )}

      {success && (
        <div className="bg-green-100 border border-green-500 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-green-700 mb-2">✅ Payment Successful!</h3>
          
          {nftAddress && (
            <div className="mb-4 text-sm">
              <p className="text-green-700 font-medium">Your unique NFT ticket has been minted!</p>
              <a 
                href={`https://solscan.io/token/${nftAddress}`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                View NFT on Solscan →
              </a>
            </div>
          )}

          <p className="text-green-600 mb-4">Confirmation email sent with your NFT details.</p>
          
          <button 
            onClick={() => window.location.href = "https://bitcoinpalooza.nyc"} 
            className="mt-2 bg-green-700 text-white px-6 py-3 rounded-xl"
          >
            Return to BitcoinPalooza
          </button>
        </div>
      )}
    </div>
  );
}