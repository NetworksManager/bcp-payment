// src/lib/nft/traits/index.ts

export type TraitCategory = 
  | 'background'
  | 'frame'
  | 'motif'
  | 'overlay'
  | 'effect'
  | 'accessory';

export interface Trait {
  name: string;
  rarity: number;        // 1 = common, 10 = very rare
  tier: 'GA' | 'VIP' | 'AllAccess'; // Which ticket types can have this trait
}

export const traits: Record<TraitCategory, Trait[]> = {
  background: [
    { name: "Neon Times Square", rarity: 8, tier: "AllAccess" },
    { name: "Stage with Smoke", rarity: 7, tier: "VIP" },
    { name: "Bitcoin Circuit Board", rarity: 6, tier: "AllAccess" },
    { name: "Dark Rock Club", rarity: 5, tier: "GA" },
    { name: "Abstract Crowd Energy", rarity: 4, tier: "GA" },
  ],
  frame: [
    { name: "Classic Perforated Stub", rarity: 6, tier: "GA" },
    { name: "Modern Card Pass", rarity: 7, tier: "VIP" },
    { name: "Holographic Border", rarity: 9, tier: "AllAccess" },
    { name: "Vintage Weathered", rarity: 5, tier: "GA" },
  ],
  motif: [
    { name: "Guitar + Bitcoin Symbol", rarity: 8, tier: "AllAccess" },
    { name: "Microphone + Neon Glow", rarity: 7, tier: "VIP" },
    { name: "Leather Jacket", rarity: 6, tier: "GA" },
    { name: "The Coinheads Logo", rarity: 5, tier: "AllAccess" },
  ],
  overlay: [
    { name: "GA Rock Pass", rarity: 4, tier: "GA" },
    { name: "VIP Backstage", rarity: 7, tier: "VIP" },
    { name: "All-Access UBW 2026", rarity: 8, tier: "AllAccess" },
    { name: "Official Stamp", rarity: 5, tier: "GA" },
  ],
  effect: [
    { name: "Neon Glow", rarity: 6, tier: "AllAccess" },
    { name: "Holographic Shine", rarity: 8, tier: "VIP" },
    { name: "Light Glitch", rarity: 7, tier: "AllAccess" },
    { name: "Foil Stamp", rarity: 5, tier: "GA" },
  ],
  accessory: [
    { name: "Wristband", rarity: 4, tier: "GA" },
    { name: "Backstage Laminate", rarity: 7, tier: "VIP" },
    { name: "Special Guest Guitar Pick", rarity: 9, tier: "AllAccess" },
  ],
};