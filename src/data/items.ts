import { EquipmentItem, Rarity, SlotType, StatType, ItemStats, WeaponType } from '../types/game';
import { EQUIPMENT_SETS } from './sets';

export interface RarityConfig {
  name: string;
  color: string;
  bgClass: string;
  borderClass: string;
  glowClass: string;
  statMultiplier: number;
  maxUpgrade: number;
}

export const RARITY_CONFIGS: Record<Rarity, RarityConfig> = {
  common: {
    name: 'Обычная',
    color: '#9ca3af', // gray-400
    bgClass: 'bg-stone-800/80',
    borderClass: 'border-stone-600',
    glowClass: 'shadow-none',
    statMultiplier: 1.0,
    maxUpgrade: 5,
  },
  uncommon: {
    name: 'Необычная',
    color: '#22c55e', // green-500
    bgClass: 'bg-emerald-950/40',
    borderClass: 'border-emerald-600',
    glowClass: 'shadow-emerald-900/40 shadow-sm',
    statMultiplier: 2.5,
    maxUpgrade: 7,
  },
  rare: {
    name: 'Редкая',
    color: '#3b82f6', // blue-500
    bgClass: 'bg-blue-950/40',
    borderClass: 'border-blue-500',
    glowClass: 'shadow-blue-600/30 shadow-md',
    statMultiplier: 6.0,
    maxUpgrade: 10,
  },
  epic: {
    name: 'Эпическая',
    color: '#a855f7', // purple-500
    bgClass: 'bg-purple-950/50',
    borderClass: 'border-purple-500',
    glowClass: 'shadow-purple-500/40 shadow-lg',
    statMultiplier: 15.0,
    maxUpgrade: 12,
  },
  gold: {
    name: 'Золотая',
    color: '#eab308', // yellow-500
    bgClass: 'bg-amber-950/60',
    borderClass: 'border-amber-400',
    glowClass: 'shadow-amber-400/50 shadow-xl',
    statMultiplier: 40.0,
    maxUpgrade: 15,
  },
  mythic: {
    name: 'Мифическая',
    color: '#ef4444', // red-500
    bgClass: 'bg-rose-950/70',
    borderClass: 'border-rose-500',
    glowClass: 'shadow-rose-500/60 shadow-2xl',
    statMultiplier: 100.0,
    maxUpgrade: 15,
  },
};

// Strict stat ranges per rarity tier:
// Common CANNOT give 100-200 HP (strictly 15-45 HP), while Mythic gives 7k-10k+ HP!
export const RARITY_STAT_RANGES: Record<Rarity, Record<StatType, [number, number]>> = {
  common: {
    hp: [15, 45],       // Strictly 15-45 HP for common
    def: [2, 6],
    atk: [4, 12],
    critChance: [1, 3],
    critDmg: [5, 15],
    atkSpeed: [2, 5],
  },
  uncommon: {
    hp: [60, 180],
    def: [8, 22],
    atk: [18, 45],
    critChance: [3, 6],
    critDmg: [15, 30],
    atkSpeed: [5, 10],
  },
  rare: {
    hp: [250, 650],
    def: [30, 75],
    atk: [60, 140],
    critChance: [6, 12],
    critDmg: [35, 70],
    atkSpeed: [10, 18],
  },
  epic: {
    hp: [900, 2200],
    def: [90, 220],
    atk: [200, 450],
    critChance: [12, 20],
    critDmg: [75, 140],
    atkSpeed: [18, 30],
  },
  gold: {
    hp: [2800, 5500],
    def: [260, 520],
    atk: [550, 1100],
    critChance: [20, 32],
    critDmg: [140, 240],
    atkSpeed: [30, 45],
  },
  mythic: {
    hp: [7000, 10500],  // Exactly 7k-10.5k HP as requested!
    def: [650, 1300],
    atk: [1400, 2800],
    critChance: [32, 50],
    critDmg: [250, 450],
    atkSpeed: [45, 75],
  },
};

export const SLOT_INFO: Record<SlotType, { name: string; icon: string; defaultVisual: string }> = {
  head: { name: 'Голова', icon: '👑', defaultVisual: '#78716c' },
  body: { name: 'Тело', icon: '🥋', defaultVisual: '#d97706' },
  weapon: { name: 'Оружие', icon: '⚔️', defaultVisual: '#e2e8f0' },
  legs: { name: 'Ноги', icon: '👢', defaultVisual: '#713f12' },
  artifact: { name: 'Артефакт', icon: '🔮', defaultVisual: '#818cf8' },
  pet: { name: 'Питомец', icon: '🐲', defaultVisual: '#34d399' },
};

// Base item templates by slot & rarity
interface ItemTemplate {
  name: string;
  slot: SlotType;
  weaponType?: WeaponType;
  baseStats: Partial<Record<StatType, [number, number]>>; // range [min, max]
  setId?: string;
  icon: string;
  description: string;
  visualColor: string;
}

export const ITEM_TEMPLATES: Record<SlotType, ItemTemplate[]> = {
  head: [
    {
      name: 'Тряпичная повязка',
      slot: 'head',
      baseStats: { hp: [15, 30], def: [2, 5] },
      setId: 'novice',
      icon: '🧣',
      description: 'Простая повязка от пота и пыли подземелий.',
      visualColor: '#a8a29e',
    },
    {
      name: 'Кожаный капюшон лазутчика',
      slot: 'head',
      baseStats: { def: [5, 10], critChance: [2, 5] },
      icon: '🧢',
      description: 'Маскирует лицо во тьме подземелья.',
      visualColor: '#78350f',
    },
    {
      name: 'Стальной шлем стража',
      slot: 'head',
      baseStats: { def: [12, 22], hp: [40, 80] },
      setId: 'iron_warden',
      icon: '🪖',
      description: 'Тяжелый шлем с забралом, защищающий от сокрушительных ударов.',
      visualColor: '#64748b',
    },
    {
      name: 'Маска Темного Жнеца',
      slot: 'head',
      baseStats: { critChance: [5, 10], atk: [15, 30] },
      setId: 'shadow_stalker',
      icon: '🎭',
      description: 'Взгляд сквозь прорези этой маски видит уязвимости врага.',
      visualColor: '#9333ea',
    },
    {
      name: 'Шлем Имперского Крестоносца (Imperial Crusader Helm)',
      slot: 'head',
      baseStats: { def: [35, 70], hp: [200, 450], atk: [20, 45] },
      setId: 'imperial_crusader',
      icon: '🪖',
      description: 'Тяжелый белый стальной шлем паладина с золотым венцом и сапфировым забралом.',
      visualColor: '#f8fafc',
    },
    {
      name: 'Драконический Шлем (Draconic Helmet)',
      slot: 'head',
      baseStats: { atk: [25, 50], critDmg: [15, 35] },
      setId: 'dragon_fury',
      icon: '🪖',
      description: 'Глухой шлем с решетчатым забралом, изогнутыми рогами и пылающими красными глазами.',
      visualColor: '#b91c1c',
    },
    {
      name: 'Корона Владыки Бездны',
      slot: 'head',
      baseStats: { atk: [60, 110], critChance: [10, 20], hp: [200, 400] },
      setId: 'chaos_lord',
      icon: '💀',
      description: 'Пульсирует темной материей бездны.',
      visualColor: '#e11d48',
    },
    {
      name: 'Ореол Небесного Судии',
      slot: 'head',
      baseStats: { def: [50, 90], critDmg: [40, 80], atkSpeed: [10, 20] },
      setId: 'celestial_god',
      icon: '✨',
      description: 'Парящий над головой золотой диск священной справедливости.',
      visualColor: '#facc15',
    }
  ],
  body: [
    {
      name: 'Льняная рубаха странника',
      slot: 'body',
      baseStats: { hp: [25, 45], def: [3, 6] },
      setId: 'novice',
      icon: '🎽',
      description: 'Спасет разве что от ветра, но лучше чем голым.',
      visualColor: '#a8a29e',
    },
    {
      name: 'Кираса Стального Стража',
      slot: 'body',
      baseStats: { def: [20, 38], hp: [60, 120] },
      setId: 'iron_warden',
      icon: '🛡️',
      description: 'Закаленный нагрудник рыцарского ордена.',
      visualColor: '#475569',
    },
    {
      name: 'Одеяние Тени',
      slot: 'body',
      baseStats: { critChance: [6, 12], atk: [18, 35] },
      setId: 'shadow_stalker',
      icon: '🥋',
      description: 'Позволяет двигаться бесшумно словно шелест ветра.',
      visualColor: '#7e22ce',
    },
    {
      name: 'Доспех Имперского Крестоносца (Imperial Crusader Breastplate)',
      slot: 'body',
      baseStats: { def: [40, 80], hp: [250, 550], atk: [25, 50] },
      setId: 'imperial_crusader',
      icon: '🛡️',
      description: 'Тяжелый белый стальной панцирь паладина с массивными золотыми львиными наплечниками и сапфировым крестом.',
      visualColor: '#f8fafc',
    },
    {
      name: 'Драконический Доспех (Draconic Leather Armor)',
      slot: 'body',
      baseStats: { def: [35, 65], atk: [30, 60] },
      setId: 'dragon_fury',
      icon: '🦺',
      description: 'Тяжелый доспех из черной кожи и багровой чешуи с массивными рогами на плечах и оком.',
      visualColor: '#dc2626',
    },
    {
      name: 'Панцирь Первородного Хаоса',
      slot: 'body',
      baseStats: { hp: [300, 600], def: [60, 110], atk: [50, 100] },
      setId: 'chaos_lord',
      icon: '🩱',
      description: 'Поглощает удары прямо в другое измерение.',
      visualColor: '#be123c',
    },
    {
      name: 'Астральная мантия Вечности',
      slot: 'body',
      baseStats: { hp: [600, 1200], critChance: [15, 25], def: [90, 160] },
      setId: 'celestial_god',
      icon: '👘',
      description: 'Ткань из созвездий, исцеляющая тело владельца.',
      visualColor: '#d946ef',
    }
  ],
  weapon: [
    // COMMON / UNCOMMON (Novice / Basic)
    {
      name: 'Деревянный меч странника',
      slot: 'weapon',
      weaponType: 'sword',
      baseStats: { atk: [6, 12], atkSpeed: [3, 8] },
      setId: 'novice',
      icon: '🗡️',
      description: 'Простой тренировочный деревянный меч начинающего искателя приключений. (+10% урона)',
      visualColor: '#854d0e',
    },
    {
      name: 'Потертый топор дровосека',
      slot: 'weapon',
      weaponType: 'axe',
      baseStats: { atk: [5, 10], hp: [20, 40] },
      setId: 'novice',
      icon: '🪓',
      description: 'Увесистый топор для колки дров, закаляющий выносливость. (+15% HP)',
      visualColor: '#78350f',
    },
    {
      name: 'Заостренная пика охотника',
      slot: 'weapon',
      weaponType: 'spear',
      baseStats: { atk: [6, 11], critDmg: [10, 20] },
      setId: 'novice',
      icon: '🔱',
      description: 'Длинная деревянная пика с острым наконечником. (+5% урона, +5% крит. урона)',
      visualColor: '#a16207',
    },
    {
      name: 'Охотничий тесак следопыта',
      slot: 'weapon',
      weaponType: 'sword',
      baseStats: { atk: [12, 22], critChance: [3, 7] },
      icon: '🗡️',
      description: 'Закаленный короткий меч для прорубания сквозь чащу. (+10% урона)',
      visualColor: '#94a3b8',
    },
    {
      name: 'Боевой топор лесовика',
      slot: 'weapon',
      weaponType: 'axe',
      baseStats: { atk: [10, 20], hp: [45, 90] },
      icon: '🪓',
      description: 'Острый топор с широким лезвием и удобной рукоятью. (+15% HP)',
      visualColor: '#15803d',
    },
    {
      name: 'Стальное копье ополченца',
      slot: 'weapon',
      weaponType: 'spear',
      baseStats: { atk: [11, 20], critDmg: [15, 30] },
      icon: '🔱',
      description: 'Пехотное копье с прочным стальным наконечником. (+5% урона, +5% крит. урона)',
      visualColor: '#64748b',
    },

    // RARE (Iron Warden)
    {
      name: 'Стальной меч Стража',
      slot: 'weapon',
      weaponType: 'sword',
      baseStats: { atk: [24, 45], def: [10, 18] },
      setId: 'iron_warden',
      icon: '⚔️',
      description: 'Острый рыцарский полуторник королевского караула. (+10% урона)',
      visualColor: '#cbd5e1',
    },
    {
      name: 'Боевая секира Стража',
      slot: 'weapon',
      weaponType: 'axe',
      baseStats: { atk: [20, 40], hp: [100, 220], def: [12, 22] },
      setId: 'iron_warden',
      icon: '🪓',
      description: 'Тяжелая двусторонняя рыцарская секира из закаленной стали. (+15% HP)',
      visualColor: '#475569',
    },
    {
      name: 'Латная пика Стража',
      slot: 'weapon',
      weaponType: 'spear',
      baseStats: { atk: [22, 42], critDmg: [25, 50], critChance: [5, 10] },
      setId: 'iron_warden',
      icon: '🔱',
      description: 'Длинная рыцарская пика с широким листовидным острием. (+5% урона, +5% крит. урона)',
      visualColor: '#38bdf8',
    },

    // EPIC (Shadow Stalker)
    {
      name: 'Клинки Полуночного Убийцы',
      slot: 'weapon',
      weaponType: 'sword',
      baseStats: { atk: [35, 65], critDmg: [30, 60], atkSpeed: [10, 20] },
      setId: 'shadow_stalker',
      icon: '🗡️',
      description: 'Смазанные ядом фиолетовые клинки скрытного убийцы. (+10% урона)',
      visualColor: '#a855f7',
    },
    {
      name: 'Секира Кровавой Луны',
      slot: 'weapon',
      weaponType: 'axe',
      baseStats: { atk: [30, 60], hp: [300, 650], critChance: [6, 12] },
      setId: 'shadow_stalker',
      icon: '🪓',
      description: 'Теневой топор палача с лунным лезвием. (+15% HP)',
      visualColor: '#7e22ce',
    },
    {
      name: 'Теневой трезубец Бездны',
      slot: 'weapon',
      weaponType: 'spear',
      baseStats: { atk: [32, 62], critDmg: [45, 90], atkSpeed: [12, 22] },
      setId: 'shadow_stalker',
      icon: '🔱',
      description: 'Копье-трезубец, пронзающее саму тень противника. (+5% урона, +5% крит. урона)',
      visualColor: '#c084fc',
    },

    // GOLD (Imperial Crusader)
    {
      name: 'Клинок Имперского Крестоносца (Imperial Crusader Blade)',
      slot: 'weapon',
      weaponType: 'sword',
      baseStats: { atk: [65, 120], def: [20, 40], critDmg: [30, 60] },
      setId: 'imperial_crusader',
      icon: '⚔️',
      description: 'Сияющий платиновый полуторник с золотым крылатым эфесом и сапфиром. (+10% урона)',
      visualColor: '#f8fafc',
    },
    {
      name: 'Секира Имперского Крестоносца (Imperial Crusader Battleaxe)',
      slot: 'weapon',
      weaponType: 'axe',
      baseStats: { atk: [55, 110], hp: [800, 1600], def: [25, 50] },
      setId: 'imperial_crusader',
      icon: '🪓',
      description: 'Массивная золотая секира паладинов с двойным полумесяцем. (+15% HP)',
      visualColor: '#fbbf24',
    },
    {
      name: 'Пика Имперского Крестоносца (Imperial Crusader Lance)',
      slot: 'weapon',
      weaponType: 'spear',
      baseStats: { atk: [60, 115], critDmg: [60, 120], critChance: [10, 18] },
      setId: 'imperial_crusader',
      icon: '🔱',
      description: 'Священное копье паладинов с золотым оперением и сапфировым острием. (+5% урона, +5% крит. урона)',
      visualColor: '#38bdf8',
    },

    // MYTHIC (Draconic Leather & Mythic sets)
    {
      name: 'Меч Драконика (Draconic Slayer)',
      slot: 'weapon',
      weaponType: 'sword',
      baseStats: { atk: [70, 130], critChance: [12, 22], critDmg: [40, 80] },
      setId: 'dragon_fury',
      icon: '🗡️',
      description: 'Колоссальный двуручный меч из драконьей кости с зазубренным лезвием. (+10% урона)',
      visualColor: '#ef4444',
    },
    {
      name: 'Секира Драконика (Draconic Cleaver)',
      slot: 'weapon',
      weaponType: 'axe',
      baseStats: { atk: [65, 125], hp: [1500, 3000], def: [40, 80] },
      setId: 'dragon_fury',
      icon: '🪓',
      description: 'Огромная драконья секира с пылающими крыловидными лезвиями. (+15% HP)',
      visualColor: '#dc2626',
    },
    {
      name: 'Пика Драконика (Draconic Halberd)',
      slot: 'weapon',
      weaponType: 'spear',
      baseStats: { atk: [68, 128], critDmg: [90, 180], critChance: [14, 25] },
      setId: 'dragon_fury',
      icon: '🔱',
      description: 'Драконическая пика Валакаса с зазубренным магматическим жалом. (+5% урона, +5% крит. урона)',
      visualColor: '#f97316',
    },
    {
      name: 'Коса Пожирателя Душ',
      slot: 'weapon',
      weaponType: 'axe',
      baseStats: { atk: [140, 250], hp: [2000, 4000], critDmg: [80, 150] },
      setId: 'chaos_lord',
      icon: '⚡',
      description: 'Коса бездны, рассекающая материю пространства. (+15% HP)',
      visualColor: '#f43f5e',
    },
    {
      name: 'Меч Звездного Разлома',
      slot: 'weapon',
      weaponType: 'sword',
      baseStats: { atk: [260, 480], critChance: [20, 35], critDmg: [120, 220] },
      setId: 'celestial_god',
      icon: '🌟',
      description: 'Оружие, которым боги кроили первые миры. (+10% урона)',
      visualColor: '#fbbf24',
    }
  ],
  legs: [
    {
      name: 'Холщовые штаны странника',
      slot: 'legs',
      baseStats: { hp: [15, 30], def: [2, 5] },
      setId: 'novice',
      icon: '👖',
      description: 'Потертые дорожные штаны с заплатками.',
      visualColor: '#78716c',
    },
    {
      name: 'Кожаные сапоги скорохода',
      slot: 'legs',
      baseStats: { atkSpeed: [5, 12], critChance: [3, 6] },
      icon: '👢',
      description: 'Легкие и гибкие, удобные для быстрых перебежек.',
      visualColor: '#92400e',
    },
    {
      name: 'Латные поножи Стража',
      slot: 'legs',
      baseStats: { def: [15, 30], hp: [50, 100] },
      setId: 'iron_warden',
      icon: '🥾',
      description: 'Тяжелые стальные щитки защищают голени от укусов тварей.',
      visualColor: '#475569',
    },
    {
      name: 'Бесшумные сапоги Тени',
      slot: 'legs',
      baseStats: { atkSpeed: [10, 20], critDmg: [20, 45] },
      setId: 'shadow_stalker',
      icon: '👞',
      description: 'Не оставляют следов даже на свежем снегу.',
      visualColor: '#6b21a8',
    },
    {
      name: 'Поножи Имперского Крестоносца (Imperial Crusader Gaiters)',
      slot: 'legs',
      baseStats: { def: [32, 65], hp: [180, 400], atkSpeed: [10, 20] },
      setId: 'imperial_crusader',
      icon: '🥾',
      description: 'Белые стальные латные поножи с золотыми львиными наколенниками и сабатонами со шпорами.',
      visualColor: '#f8fafc',
    },
    {
      name: 'Драконические Поножи (Draconic Boots & Greaves)',
      slot: 'legs',
      baseStats: { def: [28, 55], atk: [25, 50] },
      setId: 'dragon_fury',
      icon: '👢',
      description: 'Массивные шипованные поножи с боковыми крыловидными ребрами и драконьими когтями.',
      visualColor: '#991b1b',
    },
    {
      name: 'Поножи Пустоты',
      slot: 'legs',
      baseStats: { hp: [200, 400], atkSpeed: [18, 32], def: [45, 80] },
      setId: 'chaos_lord',
      icon: '🥿',
      description: 'Искажают гравитацию вокруг ног владельца.',
      visualColor: '#9f1239',
    },
    {
      name: 'Астральные сапоги Сверхновой',
      slot: 'legs',
      baseStats: { atkSpeed: [25, 45], critChance: [15, 25], hp: [450, 850] },
      setId: 'celestial_god',
      icon: '🩴',
      description: 'Позволяют скользить по лучам звездного света.',
      visualColor: '#f59e0b',
    }
  ],
  artifact: [
    {
      name: 'Талисман дорожной пыли',
      slot: 'artifact',
      baseStats: { hp: [15, 30], def: [2, 5] },
      setId: 'novice',
      icon: '📿',
      description: 'Простой амулет из речного камня на кожаном шнурке.',
      visualColor: '#a8a29e',
    },
    {
      name: 'Железный орден бастиона',
      slot: 'artifact',
      baseStats: { def: [25, 50], hp: [80, 160] },
      setId: 'iron_warden',
      icon: '🎖️',
      description: 'Медаль за стойкость в осаде королевской цитадели.',
      visualColor: '#38bdf8',
    },
    {
      name: 'Печать Кровавой Луны',
      slot: 'artifact',
      baseStats: { critChance: [8, 16], critDmg: [30, 60] },
      setId: 'shadow_stalker',
      icon: '🌘',
      description: 'Теневой амулет ассасинов, обостряющий чутье смерти.',
      visualColor: '#c084fc',
    },
    {
      name: 'Сердце Горного Голема',
      slot: 'artifact',
      baseStats: { def: [30, 60], hp: [100, 220] },
      icon: '💎',
      description: 'Пульсирующий кристалл, дарующий телу гранитную прочность.',
      visualColor: '#0284c7',
    },
    {
      name: 'Священный Грааль Империи (Imperial Crusader Relic)',
      slot: 'artifact',
      baseStats: { hp: [300, 650], def: [40, 85], atk: [30, 60] },
      setId: 'imperial_crusader',
      icon: '🏆',
      description: 'Золотая чаша паладинов с сапфировыми инкрустациями, излучающая благословенный свет.',
      visualColor: '#fbbf24',
    },
    {
      name: 'Око Дракона Валакаса (Draconic Eye)',
      slot: 'artifact',
      baseStats: { atk: [75, 150], atkSpeed: [15, 30] },
      setId: 'dragon_fury',
      icon: '👁️',
      description: 'Пылающее драконье око древнего ящера, пульсирующее жаром первородной магмы.',
      visualColor: '#ef4444',
    },
    {
      name: 'Сфера Небытия',
      slot: 'artifact',
      baseStats: { atk: [120, 240], critDmg: [70, 140], critChance: [15, 28] },
      setId: 'chaos_lord',
      icon: '🔮',
      description: 'Черная дыра миниатюрного размера, заключенная в стекло.',
      visualColor: '#be123c',
    },
    {
      name: 'Реликвия Первородного Света',
      slot: 'artifact',
      baseStats: { hp: [500, 1000], def: [80, 150], atkSpeed: [25, 45] },
      setId: 'celestial_god',
      icon: '☀️',
      description: 'Источник бесконечной божественной энергии.',
      visualColor: '#eab308',
    }
  ],
  pet: [
    {
      name: 'Верный пес странника',
      slot: 'pet',
      baseStats: { hp: [20, 45], atk: [6, 14] },
      setId: 'novice',
      icon: '🐕',
      description: 'Преданный лохматый спутник, готовый броситься на любого врага.',
      visualColor: '#a8a29e',
    },
    {
      name: 'Бронированный броненосец Стража',
      slot: 'pet',
      baseStats: { def: [25, 55], hp: [90, 200] },
      setId: 'iron_warden',
      icon: '🦔',
      description: 'Сворачивается в стальной шар и блокирует вражеские выпады.',
      visualColor: '#38bdf8',
    },
    {
      name: 'Теневой Ворон Бездны',
      slot: 'pet',
      baseStats: { atk: [30, 60], critChance: [6, 12], atkSpeed: [10, 20] },
      setId: 'shadow_stalker',
      icon: '🦅',
      description: 'Безмолвно парит во мраке и выклевывает глаза чудовищам.',
      visualColor: '#c084fc',
    },
    {
      name: 'Имперский Грифон (Imperial Gryphon)',
      slot: 'pet',
      baseStats: { hp: [250, 500], atk: [50, 100], def: [30, 60] },
      setId: 'imperial_crusader',
      icon: '🦅',
      description: 'Белоснежный царственный грифон в золотых латах с сапфировым оперением.',
      visualColor: '#f8fafc',
    },
    {
      name: 'Багровый Драконик (Draconic Wyvern)',
      slot: 'pet',
      baseStats: { atk: [45, 90], critDmg: [30, 65] },
      setId: 'dragon_fury',
      icon: '🐲',
      description: 'Верный спутник в драконьих латах, изрыгающий струи яростного пламени.',
      visualColor: '#ef4444',
    },
    {
      name: 'Призрачный Волк Пустоты',
      slot: 'pet',
      baseStats: { atk: [85, 170], atkSpeed: [15, 28], critChance: [10, 20] },
      setId: 'chaos_lord',
      icon: '🐺',
      description: 'Материализуется из теней и рвет броню чудовищ.',
      visualColor: '#e11d48',
    },
    {
      name: 'Небесный Феникс',
      slot: 'pet',
      baseStats: { hp: [400, 800], atk: [150, 300], atkSpeed: [20, 40] },
      setId: 'celestial_god',
      icon: '🦅',
      description: 'Мифическая птица возрождения с сияющими перьями.',
      visualColor: '#facc15',
    }
  ]
};

// Helper to roll random item with strictly 2 or 3 stats
export function generateRandomItem(
  slot?: SlotType,
  targetRarity?: Rarity,
  preferSetId?: string
): EquipmentItem {
  const slots: SlotType[] = ['head', 'body', 'weapon', 'legs', 'artifact', 'pet'];
  const chosenSlot = slot || slots[Math.floor(Math.random() * slots.length)];

  // Rarity roll if not provided
  let rarity = targetRarity;
  if (!rarity) {
    const roll = Math.random() * 100;
    if (roll < 45) rarity = 'common';
    else if (roll < 75) rarity = 'uncommon';
    else if (roll < 90) rarity = 'rare';
    else if (roll < 97) rarity = 'epic';
    else if (roll < 99.5) rarity = 'gold';
    else rarity = 'mythic';
  }

  const templates = ITEM_TEMPLATES[chosenSlot];
  // Filter by setId if preferred or strictly match templates to rarity tier
  let matchedTemplates = preferSetId 
    ? templates.filter(t => t.setId === preferSetId) 
    : [];

  if (matchedTemplates.length === 0) {
    if (rarity === 'common') {
      matchedTemplates = templates.filter(t => !t.setId || t.setId === 'novice');
    } else if (rarity === 'uncommon') {
      matchedTemplates = templates.filter(t => !t.setId || t.setId === 'novice');
    } else if (rarity === 'rare') {
      matchedTemplates = templates.filter(t => t.setId === 'iron_warden' || !t.setId);
    } else if (rarity === 'epic') {
      matchedTemplates = templates.filter(t => t.setId === 'shadow_stalker');
    } else if (rarity === 'gold') {
      matchedTemplates = templates.filter(t => t.setId === 'imperial_crusader');
    } else if (rarity === 'mythic') {
      matchedTemplates = templates.filter(t => t.setId === 'dragon_fury' || t.setId === 'chaos_lord' || t.setId === 'celestial_god');
    }
  }
  if (matchedTemplates.length === 0) matchedTemplates = templates;

  const template = matchedTemplates[Math.floor(Math.random() * matchedTemplates.length)];
  const rarityConfig = RARITY_CONFIGS[rarity];
  const rarityRange = RARITY_STAT_RANGES[rarity];

  // Decide whether to roll 2 or 3 stats (user constraint: "каждая вещь может давать только 2-3 стата")
  // Lower rarities usually get 2 stats; epic/gold/mythic often get 3 stats.
  const statCount = (rarity === 'common' || rarity === 'uncommon') 
    ? (Math.random() > 0.85 ? 3 : 2) 
    : (Math.random() > 0.30 ? 3 : 2);

  // Preferred stats by slot
  const slotStatPreferences: Record<SlotType, StatType[]> = {
    head: ['hp', 'def', 'critChance', 'atk'],
    body: ['hp', 'def', 'atk', 'critDmg'],
    weapon: ['atk', 'critDmg', 'atkSpeed', 'critChance'],
    legs: ['hp', 'def', 'atkSpeed', 'critChance'],
    artifact: ['critChance', 'critDmg', 'atk', 'hp'],
    pet: ['atk', 'hp', 'atkSpeed', 'critChance'],
  };

  const pool = slotStatPreferences[chosenSlot] || ['hp', 'def', 'atk', 'critChance', 'critDmg', 'atkSpeed'];
  const shuffledPool = [...pool].sort(() => Math.random() - 0.5);

  const selectedStats: StatType[] = [];
  for (const s of shuffledPool) {
    if (selectedStats.length < statCount && !selectedStats.includes(s)) {
      selectedStats.push(s);
    }
  }

  // Fallback to fill up to statCount
  const allStatTypes: StatType[] = ['hp', 'def', 'atk', 'critChance', 'critDmg', 'atkSpeed'];
  while (selectedStats.length < statCount) {
    const candidate = allStatTypes[Math.floor(Math.random() * allStatTypes.length)];
    if (!selectedStats.includes(candidate)) {
      selectedStats.push(candidate);
    }
  }

  // Strictly bound to rarity tier (Common: 15-45 HP; Mythic: 7k-10.5k HP!)
  const finalStats: ItemStats = {};
  for (const stat of selectedStats) {
    const [min, max] = rarityRange[stat];
    const rollVal = Math.round(min + Math.random() * (max - min));
    finalStats[stat] = Math.max(1, rollVal);
  }

  // Construct item
  const id = `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  let name = template.name;
  if (rarity === 'gold') {
    if (!name.includes('Имперск') && !name.includes('Благослов')) {
      name = `Освященный ${name}`;
    }
  } else if (rarity === 'mythic') {
    if (!name.includes('Драконик') && !name.includes('Древн')) {
      name = `Древний ${name} Тьмы`;
    }
  }

  // Strictly enforce that setId is only assigned if the item rarity matches the set tier
  let finalSetId: string | undefined = undefined;
  if (template.setId && EQUIPMENT_SETS[template.setId]) {
    if (EQUIPMENT_SETS[template.setId].requiredRarities.includes(rarity)) {
      finalSetId = template.setId;
    }
  }

  return {
    id,
    name,
    slot: chosenSlot,
    weaponType: chosenSlot === 'weapon' ? (template.weaponType || 'sword') : undefined,
    rarity,
    level: 0,
    stats: finalStats,
    setId: finalSetId,
    icon: template.icon,
    description: template.description,
    visualColor: template.visualColor,
    glowColor: rarityConfig.color,
  };
}

// Compute scaled stats when an item is upgraded (+1 to +15)
export function getUpgradedItemStats(item: EquipmentItem): ItemStats {
  if (item.level === 0) return item.stats;
  // Each level adds +12%
  const bonus = 1 + item.level * 0.12;
  const result: ItemStats = {};
  if (item.stats.hp) result.hp = Math.round(item.stats.hp * bonus);
  if (item.stats.def) result.def = Math.round(item.stats.def * bonus);
  if (item.stats.atk) result.atk = Math.round(item.stats.atk * bonus);
  if (item.stats.critChance) result.critChance = Math.round(item.stats.critChance * (1 + item.level * 0.04));
  if (item.stats.critDmg) result.critDmg = Math.round(item.stats.critDmg * (1 + item.level * 0.08));
  if (item.stats.atkSpeed) result.atkSpeed = Math.round(item.stats.atkSpeed * (1 + item.level * 0.05));
  return result;
}

// Upgrade cost and success chance
export function getUpgradeInfo(item: EquipmentItem) {
  const currentLvl = item.level;
  const nextLvl = currentLvl + 1;
  const rarityConfig = RARITY_CONFIGS[item.rarity];
  const isMax = currentLvl >= rarityConfig.maxUpgrade;

  if (isMax) {
    return {
      isMax: true,
      coinCost: 0,
      shardCost: 0,
      successChance: 0,
    };
  }

  // Cost formula
  const baseCoin = 50 * Math.pow(1.8, currentLvl) * rarityConfig.statMultiplier;
  const coinCost = Math.round(baseCoin);
  const shardCost = Math.max(1, Math.floor(nextLvl * 1.5));

  // Success chances for "лудка" / suspense feel:
  // +1..+3: 100%
  // +4: 90%
  // +5: 80%
  // +6: 70%
  // +7: 60%
  // +8: 50%
  // +9: 40%
  // +10: 35%
  // +11: 30%
  // +12..+15: 25% down to 15%
  let successChance = 100;
  if (currentLvl === 3) successChance = 90;
  else if (currentLvl === 4) successChance = 80;
  else if (currentLvl === 5) successChance = 70;
  else if (currentLvl === 6) successChance = 60;
  else if (currentLvl === 7) successChance = 50;
  else if (currentLvl === 8) successChance = 40;
  else if (currentLvl === 9) successChance = 35;
  else if (currentLvl === 10) successChance = 30;
  else if (currentLvl === 11) successChance = 25;
  else if (currentLvl >= 12) successChance = 20;

  return {
    isMax: false,
    coinCost,
    shardCost,
    successChance,
  };
}

// Dismantle returns gold and shards based on rarity and level
export function getDismantleReward(item: EquipmentItem) {
  const rarityConfig = RARITY_CONFIGS[item.rarity];
  const mult = rarityConfig.statMultiplier;
  const coins = Math.round(40 * mult + item.level * 80);
  let shards = 1;
  if (item.rarity === 'uncommon') shards = 2;
  else if (item.rarity === 'rare') shards = 4;
  else if (item.rarity === 'epic') shards = 8;
  else if (item.rarity === 'gold') shards = 20;
  else if (item.rarity === 'mythic') shards = 50;
  shards += Math.floor(item.level * 1.5);
  return { coins, shards };
}
