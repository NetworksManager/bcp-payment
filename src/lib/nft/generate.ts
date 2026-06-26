import { traits, selectWeightedTrait } from './traits';

export interface GeneratedTicket {
  tier: 'GA' | 'VIP';
  traits: Record<string, { name: string }>;
  svg: string;
  metadata: {
    name: string;
    description: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

export function generateTicketNFT(tier: 'GA' | 'VIP' = 'GA'): GeneratedTicket {
  const selectedTraits: Record<string, { name: string }> = {};

  (Object.keys(traits) as Array<keyof typeof traits>).forEach((category) => {
    const trait = selectWeightedTrait(traits[category]);
    selectedTraits[category] = { name: trait.name };
  });

  const svg = generateTicketSVG(selectedTraits, tier);

  const metadata = {
    name: `BitcoinPalooza UBW 2026 - ${tier}`,
    description: `Official generative NFT ticket for BitcoinPalooza during UN Blockchain Week 2026.`,
    attributes: Object.entries(selectedTraits).map(([category, trait]) => ({
      trait_type: category,
      value: trait.name,
    })),
  };

  return {
    tier,
    traits: selectedTraits,
    svg,
    metadata,
  };
}

function generateTicketSVG(traits: any, tier: string): string {
  const isVIP = tier === 'VIP';
  const primaryColor = isVIP ? '#FF00AA' : '#00F0FF';
  const accentColor = isVIP ? '#FFD700' : '#39FF14';

  return `
<svg width="800" height="1000" viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>

  <rect width="800" height="1000" fill="#0a0a0f"/>
  
  <!-- Neon Border -->
  <rect x="40" y="40" width="720" height="920" rx="20" ry="20" 
        fill="none" stroke="${primaryColor}" stroke-width="8" filter="url(#neonGlow)"/>

  <!-- Header -->
  <text x="400" y="130" text-anchor="middle" fill="${accentColor}" font-size="48" font-weight="bold">BITCOINPALOOZA</text>
  <text x="400" y="175" text-anchor="middle" fill="#ffffff" font-size="32">UBW 2026</text>

  <!-- Sponsors -->
  <text x="400" y="220" text-anchor="middle" fill="#aaaaaa" font-size="18">
    Washington Elite • GlobalBoost • UN Blockchain Week
  </text>

  <!-- Central Motif -->
  <g transform="translate(400, 480)">
    <circle cx="0" cy="0" r="130" fill="none" stroke="${primaryColor}" stroke-width="6" filter="url(#neonGlow)"/>
    <text x="0" y="30" text-anchor="middle" fill="${accentColor}" font-size="90" font-weight="bold">₿</text>
    <text x="0" y="100" text-anchor="middle" fill="#ffffff" font-size="52">🎸</text>
  </g>

  <!-- Ticket Type -->
  <text x="400" y="680" text-anchor="middle" fill="${primaryColor}" font-size="36" font-weight="bold">
    ${isVIP ? 'VIP EXPERIENCE' : 'GENERAL ADMISSION'}
  </text>

  <text x="400" y="740" text-anchor="middle" fill="#ffffff" font-size="20">
    ${traits.background?.name || 'Neon Stage'}
  </text>

  <!-- Footer -->
  <text x="400" y="880" text-anchor="middle" fill="#666666" font-size="16">
    Official Generative NFT Ticket • BitcoinPalooza 2026
  </text>
</svg>
  `.trim();
}