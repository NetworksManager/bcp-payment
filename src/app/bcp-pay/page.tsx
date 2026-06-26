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
  const [mintingNft, setMintingNft] = useState(false);

  const HELIUS_API_KEY = "74182e68-a184-40a0-83fb-ee93b634cf85";
  const MERCHANT_WALLET = "C3CEgDqxAVqsyFjfcMz8PnELRE2u4AUQdqeypk7Ao2ZU";

  const usdValue = ticketType === 'vip' ? 49.5 : 19.5;

  // Fetch real-time BCP price
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
    } catch (error) {
      console.error("Failed to fetch BCP price");
    }
    // Fallback prices
    setBcpAmount(ticketType === 'vip' ? 25000000 * quantity : 15000000 * quantity);
  };

  useEffect(() => {
    fetchBcpPrice();
  }, [ticketType, quantity]);

  // Load data from URL params
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
        body: JSON.stringify({
          email,
          ticketType,
          quantity,
          bcpAmount: bcpAmount.toFixed(2),
          usdValue,
          nftAddress: nftAddr || "",
        }),
      });
    } catch (err) {
      console.error("Failed to send confirmation email", err);
    }
  };

  const handlePayment = async () => {
    if (!publicKey || !signTransaction) {
      alert("Please connect your wallet first");
      return;
    }

    setLoading(true);
    setMintingNft(true);

    try {
      const connection = new Connection(
        `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`
      );

      const mint = new PublicKey("Ame1dzZcompavH8xZW98C6igpxUCd6GfDrGrsnTpump");
      const merchant = new PublicKey(MERCHANT_WALLET);

      const userAta = await getAssociatedTokenAddress(mint, publicKey);
      const merchantAta = await getAssociatedTokenAddress(mint, merchant);

      const transaction = new Transaction()
        .add(createAssociatedTokenAccountIdempotentInstruction(publicKey, userAta, publicKey, mint))
        .add(createAssociatedTokenAccountIdempotentInstruction(publicKey, merchantAta, merchant, mint))
        .add(createTransferInstruction(
          userAta,
          merchantAta,
          publicKey,
          Math.floor(bcpAmount * 1_000_000)
        ));

      transaction.feePayer = publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction.recentBlockhash = blockhash;

      const signedTx = await signTransaction(transaction);
      await connection.sendRawTransaction(signedTx.serialize());

      // === Mint Generative NFT (non-blocking) ===
      let mintedNftAddress = '';
      try {
        const tier = ticketType === 'vip' ? 'VIP' : 'GA';
        const generatedTicket = generateTicketNFT(tier);

        const nftRes = await fetch('/api/mint-ticket', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            buyerPublicKey: publicKey.toBase58(),
            ticket: generatedTicket,
          }),
        });

        const nftData = await nftRes.json();
        if (nftRes.ok && nftData.assetAddress) {
          mintedNftAddress = nftData.assetAddress;
          setNftAddress(mintedNftAddress);
        }
      } catch (nftErr) {
        console.log("NFT minting encountered an issue (continuing...):", nftErr);
      }

      await sendEmails(mintedNftAddress);
      setSuccess(true);

    } catch (error: any) {
      console.error("Payment Error:", error);
      alert("Payment failed. Please try again or add a small amount of SOL to your wallet.");
    } finally {
      setLoading(false);
      setMintingNft(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-2">Pay with BCP Token</h1>
      <p className="text-center text-gray-600 mb-8">50% OFF • BitcoinPalooza UBW 2026</p>

      {/* Order Summary */}
      <div className="bg-white border-2 border-orange-500 rounded-2xl p-6 mb-6">
        <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Email</span>
            <span>{email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Ticket</span>
            <span>{ticketType === 'vip' ? 'VIP Experience' : 'General Admission'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Quantity</span>
            <span>{quantity}</span>
          </div>
        </div>

        <div className="border-t my-4"></div>

        <div className="flex justify-between items-end">
          <span className="font-semibold text-lg">You Pay</span>
          <div className="text-right">
            <div className="text-4xl font-bold text-orange-600">{bcpAmount.toFixed(2)}</div>
            <div className="text-sm text-gray-500">BCP ≈ ${(usdValue * quantity).toFixed(2)}</div>
          </div>
        </div>
      </div>

      {/* Wallet Connection */}
      {!publicKey ? (
        <button
          onClick={() => setVisible(true)}
          className="w-full bg-black text-white py-4 rounded-xl font-semibold mb-4"
        >
          Connect Wallet
        </button>
      ) : (
        <div className="mb-6 text-center">
          <p className="text-sm text-gray-600">Connected Wallet</p>
          <p className="font-mono text-xs break-all bg-gray-100 p-2 rounded">
            {publicKey.toBase58()}
          </p>
        </div>
      )}

      {/* Pay Button */}
      {publicKey && !success && (
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full bg-orange-600 text-white py-4 rounded-xl font-bold text-lg disabled:bg-orange-300"
        >
          {loading ? "Processing Payment..." : "Pay with BCP Now"}
        </button>
      )}

      {/* Success Screen */}
      {success && (
        <div className="bg-green-100 border border-green-500 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold text-green-700 mb-2">✅ Payment Successful!</h3>

          {nftAddress ? (
            <div className="mb-4 space-y-3">
              <p className="text-green-700 font-medium">Your generative NFT ticket has been minted!</p>
              
              <div className="flex flex-col gap-2">
                {/* Primary - Tensor (as requested) */}
                <a
                  href={`https://www.tensor.trade/item/${nftAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-black text-white px-6 py-3 rounded-xl font-semibold hover:bg-gray-800 transition"
                >
                  View on Tensor →
                </a>
                
                {/* Secondary - Irys Gateway (fast image view) */}
                <a
                  href={`https://gateway.irys.xyz/${nftAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  View raw image on Arweave
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 mb-4">Your NFT ticket is being processed...</p>
          )}

          <p className="text-green-600 mb-4">Confirmation email has been sent.</p>

          <button
            onClick={() => window.location.href = "https://bitcoinpalooza.nyc"}
            className="mt-2 bg-green-700 text-white px-8 py-3 rounded-xl"
          >
            Return to BitcoinPalooza
          </button>
        </div>
      )}
    </div>
  );
}