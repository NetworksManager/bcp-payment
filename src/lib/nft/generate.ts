import { traits, selectWeightedTrait } from './traits';

export interface GeneratedTicket {
  tier: 'GA' | 'VIP';
  traits: Record<string, { name: string; rarity: string }>;
  svg: string;
  metadata: {
    name: string;
    description: string;
    attributes: Array<{ trait_type: string; value: string }>;
  };
}

export function generateTicketNFT(tier: 'GA' | 'VIP' = 'GA'): GeneratedTicket {
  // Select traits
  const selectedTraits: Record<string, { name: string; rarity: string }> = {};
  
  Object.keys(traits).forEach(category => {
    selectedTraits[category] = selectWeightedTrait(traits[category]);
  });

  // Generate the SVG
  const svg = generateTicketSVG(selectedTraits, tier);

  // Build metadata
  const metadata = {
    name: `BitcoinPalooza UBW 2026 - ${tier}`,
    description: `Official generative NFT ticket for BitcoinPalooza UBW 2026. ${tier} access to the ultimate Bitcoin + Rock after-party during UN Blockchain Week.`,
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

// ==================== SVG GENERATOR ====================
function generateTicketSVG(traits: any, tier: string): string {
  const isVIP = tier === 'VIP';
  
  // Dynamic colors based on traits
  const primaryColor = isVIP ? '#FF00AA' : '#00F0FF';
  const accentColor = isVIP ? '#FFD700' : '#39FF14';
  const bgColor = traits.background?.name.includes('Dark') ? '#0a0a0f' : '#1a0033';

  const neonGlow = `
    <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  `;

  return `
    <svg width="800" height="1000" viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
      <defs>
        ${neonGlow}
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="${bgColor}"/>
          <stop offset="100%" stop-color="#000000"/>
        </linearGradient>
      </defs>

      <!-- Background -->
      <rect width="800" height="1000" fill="url(#bgGradient)"/>

      <!-- Neon Border / Ticket Frame -->
      <rect x="40" y="40" width="720" height="920" rx="20" ry="20" 
            fill="none" stroke="${primaryColor}" stroke-width="8" filter="url(#neonGlow)"/>
      <rect x="55" y="55" width="690" height="890" rx="15" ry="15" 
            fill="none" stroke="#ffffff" stroke-width="2" opacity="0.3"/>

      <!-- Top Header -->
      <text x="400" y="120" text-anchor="middle" fill="${accentColor}" font-size="42" font-weight="bold" filter="url(#neonGlow)">
        BITCOINPALOOZA
      </text>
      <text x="400" y="165" text-anchor="middle" fill="#ffffff" font-size="28" font-weight="600">
        UBW 2026
      </text>

      <!-- Sponsor Bar -->
      <rect x="80" y="190" width="640" height="45" rx="8" fill="#111111" opacity="0.85"/>
      <text x="400" y="222" text-anchor="middle" fill="#aaaaaa" font-size="18" font-weight="500">
        Washington Elite × GlobalBoost × UN Blockchain Week
      </text>

      <!-- Central Graphic Area -->
      <g transform="translate(400, 480)">
        <!-- Dynamic Central Motif -->
        <circle cx="0" cy="0" r="140" fill="none" stroke="${primaryColor}" stroke-width="6" filter="url(#neonGlow)"/>
        <circle cx="0" cy="0" r="100" fill="#000000" opacity="0.6"/>
        
        <!-- Bitcoin + Guitar Symbol -->
        <text x="0" y="25" text-anchor="middle" fill="${accentColor}" font-size="90" font-weight="bold">₿</text>
        <text x="0" y="95" text-anchor="middle" fill="#ffffff" font-size="48">🎸</text>
      </g>

      <!-- Ticket Type -->
      <rect x="200" y="620" width="400" height="70" rx="12" fill="${primaryColor}" opacity="0.15"/>
      <text x="400" y="670" text-anchor="middle" fill="${primaryColor}" font-size="42" font-weight="800" filter="url(#neonGlow)">
        ${isVIP ? 'VIP BACKSTAGE PASS' : 'GA ROCK PASS'}
      </text>

      <!-- Traits / Details -->
      <text x="400" y="740" text-anchor="middle" fill="#ffffff" font-size="22">
        ${traits.background?.name || 'Neon Stage'} • ${traits.frame?.name || 'Holographic'}
      </text>

      <!-- Bottom Footer -->
      <text x="400" y="820" text-anchor="middle" fill="#888888" font-size="16">
        OFFICIAL • UN BLOCKCHAIN WEEK 2026 • NEW YORK
      </text>
      <text x="400" y="850" text-anchor="middle" fill="#555555" font-size="14">
        Limited Edition Generative Ticket • ${new Date().getFullYear()}
      </text>

      <!-- Perforation line -->
      <line x1="80" y1="880" x2="720" y2="880" stroke="#ffffff" stroke-width="2" stroke-dasharray="20,15" opacity="0.4"/>
    </svg>
  `.trim();
}