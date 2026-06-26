import { generateTicketNFT } from '../src/lib/nft/generate';
import { mintGenerativeTicket } from '../src/lib/nft/mint';

// === TEST CONFIG ===
const TEST_BUYER_WALLET = 'EFbds9WdUJw71sKp8Fg5WESZEXmXgD2HYhAzLbE2ZLdp'; // ← Put a wallet you control

async function test() {
  console.log('=== Testing Generative NFT Minting ===\n');

  // Generate a VIP ticket as an example
  const ticket = generateTicketNFT('VIP');
  console.log('Generated Ticket:');
  console.log(getTicketSummary(ticket));
  console.log('Rarity Score:', ticket.rarityScore);
  console.log('');

  // Mint it
  try {
    const result = await mintGenerativeTicket(TEST_BUYER_WALLET, ticket);
    console.log('✅ Mint successful!');
    console.log('Asset Address:', result.assetAddress);
  } catch (error) {
    console.error('❌ Minting failed:', error);
  }
}

test();