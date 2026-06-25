// src/lib/nft/generate.ts

import { traits, TraitCategory, Trait } from './traits';

export interface GeneratedTicket {
  tier: 'GA' | 'VIP' | 'AllAccess';
  traits: Record<TraitCategory, Trait>;
  rarityScore: number;
}

// Weighted random selection
function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;

  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  return items[items.length - 1];
}

export function generateTicketNFT(tier: 'GA' | 'VIP' | 'AllAccess'): GeneratedTicket {
  const selectedTraits: Partial<Record<TraitCategory, Trait>> = {};
  let rarityScore = 0;

  const categories: TraitCategory[] = [
    'background', 'frame', 'motif', 'overlay', 'effect', 'accessory'
  ];

  categories.forEach((category) => {
    const availableTraits = traits[category].filter(
      (trait) => trait.tier === tier || trait.tier === 'AllAccess'
    );

    if (availableTraits.length === 0) {
      // Fallback to any trait if none match
      const fallback = traits[category][0];
      selectedTraits[category] = fallback;
      rarityScore += fallback.rarity;
      return;
    }

    const weights = availableTraits.map((t) => t.rarity);
    const chosen = weightedRandom(availableTraits, weights);

    selectedTraits[category] = chosen;
    rarityScore += chosen.rarity;
  });

  return {
    tier,
    traits: selectedTraits as Record<TraitCategory, Trait>,
    rarityScore,
  };
}

// Helper to get a readable summary
export function getTicketSummary(ticket: GeneratedTicket): string {
  return Object.entries(ticket.traits)
    .map(([category, trait]) => `${category}: ${trait.name}`)
    .join(' | ');
}