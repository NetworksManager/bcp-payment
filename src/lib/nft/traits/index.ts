export interface Trait {
  name: string;
  rarity: number;
}

export const traits = {
  background: [
    { name: "Neon Times Square", rarity: 25 },
    { name: "Dark Rock Club", rarity: 20 },
    { name: "Bitcoin Circuit Board", rarity: 18 },
    { name: "Stage with Smoke & Lights", rarity: 15 },
    { name: "Abstract Crowd Energy", rarity: 12 },
    { name: "Holographic NYC Skyline", rarity: 10 },
  ],
  frame: [
    { name: "Classic Perforated Ticket", rarity: 30 },
    { name: "Modern Card Pass", rarity: 25 },
    { name: "Holographic Border", rarity: 20 },
    { name: "Neon Glow Frame", rarity: 15 },
    { name: "Vintage Rock Stub", rarity: 10 },
  ],
  motif: [
    { name: "Guitar + Bitcoin Symbol", rarity: 25 },
    { name: "Neon Microphone", rarity: 20 },
    { name: "Circuit Board Guitar", rarity: 18 },
    { name: "The Coinheads Logo", rarity: 15 },
    { name: "Stage Spotlight", rarity: 12 },
    { name: "Crypto Rock Fist", rarity: 10 },
  ],
  overlay: [
    { name: "UN Blockchain Week", rarity: 30 },
    { name: "UBW 2026", rarity: 25 },
    { name: "Washington Elite", rarity: 20 },
    { name: "All-Access Pass", rarity: 15 },
    { name: "VIP Backstage", rarity: 10 },
  ],
  effect: [
    { name: "Neon Glow", rarity: 30 },
    { name: "Holographic Shine", rarity: 25 },
    { name: "Light Glitch", rarity: 20 },
    { name: "Electric Sparks", rarity: 15 },
    { name: "Heavy Neon Bloom", rarity: 10 },
  ],
  accessory: [
    { name: "Special Guest Guitar Pick", rarity: 25 },
    { name: "Backstage Laminate", rarity: 20 },
    { name: "Neon Wristband", rarity: 18 },
    { name: "Bitcoin Dog Tag", rarity: 15 },
    { name: "Rock 'n' Roll Chain", rarity: 12 },
    { name: "None", rarity: 10 },
  ],
};

export function selectWeightedTrait(options: Trait[]) {
  const totalWeight = options.reduce((sum, t) => sum + t.rarity, 0);
  let random = Math.random() * totalWeight;

  for (const trait of options) {
    random -= trait.rarity;
    if (random <= 0) return trait;
  }
  return options[0];
}