export interface ClassData {
  name: string;
  color: number;
  maxHp: number;
  speed: number;
  attackDamage: number;
  attackRange: number;
  attackRate: number;
  weaponName: string;
}

export const DEFAULT_CLASS: ClassData = {
  name: 'Fighter',
  color: 0xe63946,
  maxHp: 100,
  speed: 110,
  attackDamage: 20,
  attackRange: 30,
  attackRate: 500,
  weaponName: 'Sword',
};
