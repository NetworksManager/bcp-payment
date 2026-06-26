import { generateTicketNFT } from '../src/lib/nft/generate';
import { mintGenerativeTicket } from '../src/lib/nft/mint';

async function main() {
  console.log('=== Testing Full Generative NFT Flow ===\n');

  // 1. Generate ticket
  const ticket = generateTicketNFT('VIP');
  console.log('Generated Ticket:');
  console.log('Tier:', ticket.tier);
  console.log('Rarity Score:', ticket.rarityScore);
  console.log('');

  // 2. Mint (this will upload SVG + metadata to Arweave then mint)
  console.log('Uploading to Arweave and minting NFT...');
  const result = await mintGenerativeTicket(
    '7zR1ZY1d8gD6NUj4uSZAD7xnCn3Q4RjNSXXSJfiAWEeW', // ← Replace with your test wallet address
    ticket
  );

  console.log('\n✅ Success!');
  console.log('Asset Address:', result.assetAddress);
  console.log('Metadata URL:', result.metadataUrl);
  console.log('Image URL:', result.imageUrl);
}

main().catch(console.error);