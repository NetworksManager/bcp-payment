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
  rarityScore: number;
}

export function generateTicketNFT(tier: 'GA' | 'VIP' = 'GA'): GeneratedTicket {
  const selectedTraits: Record<string, { name: string }> = {};
  let rarityScore = 0;

  (Object.keys(traits) as Array<keyof typeof traits>).forEach((category) => {
    const trait = selectWeightedTrait(traits[category]);
    selectedTraits[category] = { name: trait.name };
    rarityScore += trait.rarity;
  });

  const finalRarityScore = Math.round(rarityScore);
  const svg = generateTicketSVG(selectedTraits, tier, finalRarityScore);

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
    rarityScore: finalRarityScore,
  };
}

function generateTicketSVG(traits: any, tier: string, rarityScore: number): string {
  const isVIP = tier === 'VIP';
  const primaryColor = isVIP ? '#FF00AA' : '#00F0FF';
  const accentColor = isVIP ? '#FFD700' : '#39FF14';
  const bgColor = '#0a0a0f';

  return `
<svg width="800" height="1000" viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
    
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#1a0033"/>
      <stop offset="100%" stop-color="#000000"/>
    </linearGradient>
  </defs>

  <!-- Background -->
  <rect width="800" height="1000" fill="${bgColor}"/>

  <!-- Outer Neon Frame -->
  <rect x="35" y="35" width="730" height="930" rx="25" ry="25" 
        fill="none" stroke="${primaryColor}" stroke-width="10" filter="url(#neonGlow)"/>

  <!-- Inner Ticket Area -->
  <rect x="55" y="55" width="690" height="890" rx="18" ry="18" fill="#111122"/>

  <!-- Header Section -->
  <rect x="55" y="55" width="690" height="140" rx="18" ry="18" fill="url(#headerGrad)"/>
  
  <text x="400" y="115" text-anchor="middle" fill="${accentColor}" 
        font-size="52" font-weight="bold" filter="url(#neonGlow)">BITCOINPALOOZA</text>
  
  <text x="400" y="155" text-anchor="middle" fill="#ffffff" font-size="28" font-weight="600">
    UBW 2026
  </text>

  <!-- Sponsor Bar -->
  <rect x="80" y="175" width="640" height="38" rx="8" fill="#1f1f2e"/>
  <text x="400" y="202" text-anchor="middle" fill="#cccccc" font-size="16" font-weight="500">
    Washington Elite • Globalboost • UN Blockchain Week
  </text>

  <!-- Central Graphic -->
  <g transform="translate(400, 470)">
    <!-- Outer Glow Ring -->
    <circle cx="0" cy="0" r="145" fill="none" stroke="${primaryColor}" 
            stroke-width="8" filter="url(#neonGlow)" opacity="0.9"/>
    
    <!-- Inner Circle -->
    <circle cx="0" cy="0" r="115" fill="#0a0a0f" stroke="#333344" stroke-width="4"/>
    
    <!-- Bitcoin Symbol -->
    <text x="0" y="35" text-anchor="middle" fill="${accentColor}" 
          font-size="95" font-weight="bold">₿</text>
    
    <!-- Guitar Icon -->
    <text x="0" y="105" text-anchor="middle" fill="#ffffff" font-size="48">🎸</text>
  </g>

  <!-- Ticket Type Badge -->
  <rect x="200" y="620" width="400" height="65" rx="12" fill="${primaryColor}" opacity="0.15"/>
  <text x="400" y="665" text-anchor="middle" fill="${primaryColor}" 
        font-size="32" font-weight="800" filter="url(#neonGlow)">
    ${isVIP ? 'VIP EXPERIENCE' : 'GENERAL ADMISSION'}
  </text>

  <!-- Trait Info -->
  <text x="400" y="720" text-anchor="middle" fill="#aaaaaa" font-size="18">
    ${traits.background?.name || 'Neon Stage'} • ${traits.motif?.name || 'Bitcoin Guitar'}
  </text>

  <!-- Rarity Score -->
  <text x="400" y="780" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="600">
    Rarity Score: ${rarityScore}
  </text>

  <!-- Footer -->
  <line x1="100" y1="820" x2="700" y2="820" stroke="#333344" stroke-width="2"/>
  
  <text x="400" y="860" text-anchor="middle" fill="#666666" font-size="15">
    Official Generative NFT Ticket
  </text>
  <text x="400" y="885" text-anchor="middle" fill="#555555" font-size="13">
    BitcoinPalooza • New York City • 2026
  </text>
</svg>
  `.trim();
}