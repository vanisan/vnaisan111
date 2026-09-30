import { TapUpgrade } from '../types/game';

export const INITIAL_UPGRADES: TapUpgrade[] = [
  {
    id: 'tap_power',
    name: 'Сила Клика',
    description: 'Увеличивает добычу золота за каждый тап по экрану (+1/+2/...).',
    level: 0,
    baseCost: 15,
    costMultiplier: 1.45,
    valuePerLevel: 1,
    icon: '👆',
  },
  {
    id: 'golden_touch',
    name: 'Золотая Удача',
    description: 'Шанс крит-тапа (x5 золота + взрыв искр). Каждым уровнем +2% шанс.',
    level: 0,
    baseCost: 80,
    costMultiplier: 1.6,
    valuePerLevel: 2, // +2% crit tap chance
    icon: '✨',
  },
  {
    id: 'auto_clicker',
    name: 'Верный Оруженосец',
    description: 'Автоматически тапает по экрану каждую секунду (пассивная добыча монет).',
    level: 0,
    baseCost: 150,
    costMultiplier: 1.65,
    valuePerLevel: 1, // +1 tap/sec
    icon: '🤖',
  },
  {
    id: 'gold_multiplier',
    name: 'Жадность Рудокопа',
    description: 'Увеличивает все источники золота (тапы, монстры, сундуки) на +5% за уровень.',
    level: 0,
    baseCost: 350,
    costMultiplier: 1.8,
    valuePerLevel: 5, // +5%
    icon: '💰',
  },
  {
    id: 'warrior_might',
    name: 'Боевая Закалка',
    description: 'Увеличивает базовую атаку героя во всех сражениях на +4 ед. за уровень.',
    level: 0,
    baseCost: 200,
    costMultiplier: 1.55,
    valuePerLevel: 4,
    icon: '⚔️',
  }
];

export function getUpgradeCost(upgrade: TapUpgrade): number {
  return Math.round(upgrade.baseCost * Math.pow(upgrade.costMultiplier, upgrade.level));
}
