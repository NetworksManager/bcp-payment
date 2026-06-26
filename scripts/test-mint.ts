import { generateTicketNFT } from '../src/lib/nft/generate';

console.log('=== Testing Generative NFT ===\n');

const ticket = generateTicketNFT('VIP');

console.log('Generated Ticket:');
console.log('Tier:', ticket.tier);
console.log('Traits:', ticket.traits);
console.log('SVG length:', ticket.svg.length, 'characters');
console.log('');
console.log('Metadata:', ticket.metadata);