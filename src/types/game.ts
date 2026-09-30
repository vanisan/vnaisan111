export type SlotType = 'head' | 'body' | 'weapon' | 'legs' | 'artifact' | 'pet';

export type WeaponType = 'sword' | 'axe' | 'spear';

export type Rarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'gold' | 'mythic';

export type StatType = 'hp' | 'def' | 'atk' | 'critChance' | 'critDmg' | 'atkSpeed';

export const WEAPON_TYPE_INFO: Record<WeaponType, { name: string; icon: string; bonusLabel: string; description: string }> = {
  sword: {
    name: 'Меч',
    icon: '⚔️',
    bonusLabel: '+10% урона',
    description: 'Повышает базовую силу атаки на +10%.',
  },
  axe: {
    name: 'Топор',
    icon: '🪓',
    bonusLabel: '+15% HP',
    description: 'Увеличивает максимальный запас здоровья на +15%.',
  },
  spear: {
    name: 'Копье',
    icon: '🔱',
    bonusLabel: '+5% урона и +5% крит. урона',
    description: 'Дарует +5% к урону и +5% к критическому урону.',
  },
};

export interface ItemStats {
  hp?: number;
  def?: number;
  atk?: number;
  critChance?: number; // In percentage, e.g. 5 for +5%
  critDmg?: number;    // In percentage, e.g. 25 for +25%
  atkSpeed?: number;   // In percentage, e.g. 10 for +10%
}

export interface EquipmentItem {
  id: string;
  name: string;
  slot: SlotType;
  weaponType?: WeaponType; // Available if slot === 'weapon'
  rarity: Rarity;
  level: number; // Upgrade level (+0 to +15)
  stats: ItemStats;
  setId?: string;
  icon: string;
  description: string;
  visualColor: string;
  glowColor?: string;
}

export interface SetBonus {
  id: string;
  name: string;
  color: string;
  description: string;
  requiredRarities: Rarity[];
  twoPieceStats: ItemStats;
  fourPieceStats: ItemStats;
  sixPieceStats?: ItemStats;
  lore: string;
}

export interface HeroStats {
  maxHp: number;
  currentHp: number;
  def: number;
  atk: number;
  critChance: number;
  critDmg: number;
  atkSpeed: number; // Attacks per second (e.g. 1.2)
  goldPerTap: number;
  passiveGoldPerSec: number;
}

export interface Monster {
  id: string;
  name: string;
  type: 'minion' | 'elite' | 'boss';
  maxHp: number;
  currentHp: number;
  atk: number;
  def: number;
  goldReward: number;
  shardReward: number;
  color: string;
  accentColor: string;
  icon: string;
  scale?: number;
}

export interface PlayerProgress {
  coins: number;
  shards: number;
  gems: number;
  stage: number; // e.g. 1, 2, 3...
  subStage: number; // 1 to 10. 10 is boss!
  highestStage: number;
  isAutoAdvancing: boolean;
  totalTaps: number;
  monstersSlain: number;
  bossesSlain: number;
  isChestTripleBuyUnlocked?: boolean; // Unlocked for 1000 gems
}

export interface TapUpgrade {
  id: string;
  name: string;
  description: string;
  level: number;
  baseCost: number;
  costMultiplier: number;
  valuePerLevel: number;
  icon: string;
}

export interface ChestType {
  id: string;
  name: string;
  costCoins: number;
  costGems: number;
  minRarity: Rarity;
  maxRarity: Rarity;
  description: string;
  icon: string;
  rates: { [key in Rarity]: number };
}
