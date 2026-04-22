export interface ClassData {
  name: string;
  color: number;
  maxHp: number;
  speed: number;
  attackDamage: number;
  attackRange: number;
  attackRate: number;
  fireballRange: number; // in tiles
  fireballRate: number;  // ms between fireball throws
  stars: { speed: number; health: number; damage: number };
  weaponName: string;
  spriteKey: string;
  scale: number;
  flipForLeft: boolean;
  flipForRight?: boolean;
  defaultTexture: string;
  frameWidth: number;
  frameHeight: number;
}

export const CHARACTERS: ClassData[] = [
  {
    name: 'Adventurer',
    color: 0x4a9eff,
    maxHp: 100, speed: 160, attackDamage: 22, attackRange: 64, attackRate: 450,
    fireballRange: 25, fireballRate: 500,
    stars: { speed: 4, health: 4, damage: 4 },
    weaponName: 'Daggers',
    spriteKey: 'adventurer',
    scale: 1.521, flipForLeft: false,
    defaultTexture: 'adventurer_idle_down',
    frameWidth: 96, frameHeight: 80,
  },
  {
    name: 'Scout',
    color: 0xff6b6b,
    maxHp: 75, speed: 170, attackDamage: 15, attackRange: 90, attackRate: 500,
    fireballRange: 15, fireballRate: 350,
    stars: { speed: 5, health: 3, damage: 3 },
    weaponName: 'Spear',
    spriteKey: 'scout',
    scale: 2.0, flipForLeft: false,
    defaultTexture: 'scout_idle_down',
    frameWidth: 48, frameHeight: 64,
  },
  {
    name: 'Lancer',
    color: 0xe8a230,
    maxHp: 125, speed: 150, attackDamage: 30, attackRange: 90, attackRate: 600,
    fireballRange: 35, fireballRate: 750,
    stars: { speed: 3, health: 5, damage: 5 },
    weaponName: 'Spear',
    spriteKey: 'lancer',
    scale: 2.0, flipForLeft: false,
    defaultTexture: 'lancer_idle_down',
    frameWidth: 48, frameHeight: 64,
  },
];

export const DEFAULT_CLASS: ClassData = CHARACTERS[0];
