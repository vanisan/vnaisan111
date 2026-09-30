import { ChestType } from '../types/game';

export const CHESTS: ChestType[] = [
  {
    id: 'chest_bronze',
    name: 'Потертый Сундук',
    costCoins: 1000,
    costGems: 0,
    minRarity: 'common',
    maxRarity: 'rare',
    description: 'Старый деревянный ящик, найденный на верхних ярусах подземелья.',
    icon: '📦',
    rates: {
      common: 68,
      uncommon: 27,
      rare: 5,
      epic: 0,
      gold: 0,
      mythic: 0,
    }
  },
  {
    id: 'chest_silver',
    name: 'Железный Ларь Стража',
    costCoins: 5000,
    costGems: 0,
    minRarity: 'common',
    maxRarity: 'epic',
    description: 'Окованный железом сундук рыцарского караула с качественным снаряжением.',
    icon: '🧰',
    rates: {
      common: 30,
      uncommon: 45,
      rare: 20,
      epic: 5,
      gold: 0,
      mythic: 0,
    }
  },
  {
    id: 'chest_gold',
    name: 'Золотой Сундук Дракона',
    costCoins: 25000,
    costGems: 20,
    minRarity: 'uncommon',
    maxRarity: 'gold',
    description: 'Сундук из сокровищницы огнедышащего дракона. Золотые отблески слепят глаза!',
    icon: '👑',
    rates: {
      common: 0,
      uncommon: 25,
      rare: 50,
      epic: 20,
      gold: 5,
      mythic: 0,
    }
  },
  {
    id: 'chest_mythic',
    name: 'Мифический Ящик Бездны',
    costCoins: 50000,
    costGems: 50,
    minRarity: 'rare',
    maxRarity: 'mythic',
    description: 'Реликвия хаоса! Шанс заполучить легендарные и мифические реликвии богов.',
    icon: '🔮',
    rates: {
      common: 0,
      uncommon: 0,
      rare: 30,
      epic: 45,
      gold: 20,
      mythic: 5,
    }
  }
];
