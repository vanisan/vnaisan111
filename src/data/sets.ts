import { SetBonus } from '../types/game';

export const EQUIPMENT_SETS: Record<string, SetBonus> = {
  novice: {
    id: 'novice',
    name: 'Комплект Странника',
    color: '#a8a29e', // stone-400
    description: 'Простая холщовая экипировка начинающего искателя приключений.',
    requiredRarities: ['common', 'uncommon'],
    twoPieceStats: { hp: 35, def: 5 },
    fourPieceStats: { atk: 14, hp: 70 },
    sixPieceStats: { atk: 30, hp: 140, critChance: 5 },
    lore: 'Каждый великий герой начинал свой путь в простых обносках.',
  },
  iron_warden: {
    id: 'iron_warden',
    name: 'Стальной Страж',
    color: '#38bdf8', // sky-400
    description: 'Тяжелая закаленная броня рыцарей королевского караула.',
    requiredRarities: ['rare'],
    twoPieceStats: { def: 35, hp: 200 },
    fourPieceStats: { def: 95, hp: 550, atk: 30 },
    sixPieceStats: { def: 220, hp: 1500, atk: 75, critChance: 8 },
    lore: 'Несокрушимый бастион из закаленной королевской стали.',
  },
  shadow_stalker: {
    id: 'shadow_stalker',
    name: 'Тень Ассасина',
    color: '#c084fc', // purple-400
    description: 'Одеяния скрытного убийцы из безмолвного братства полуночи.',
    requiredRarities: ['epic'],
    twoPieceStats: { critChance: 14, atk: 90 },
    fourPieceStats: { critDmg: 80, atkSpeed: 20, atk: 200 },
    sixPieceStats: { critChance: 25, critDmg: 180, atkSpeed: 38, atk: 420 },
    lore: 'Один стремительный удар из вечной тьмы решает исход любой битвы.',
  },
  imperial_crusader: {
    id: 'imperial_crusader',
    name: 'Имперский Крестоносец (Imperial Crusader)',
    color: '#fbbf24', // amber-400 (Gold tier)
    description: 'Легендарные тяжелые латы паладинов из белой стали и золота с львиными наплечниками.',
    requiredRarities: ['gold'],
    twoPieceStats: { def: 450, hp: 1800, atk: 350 },
    fourPieceStats: { def: 1200, hp: 4500, atk: 950, critChance: 15 },
    sixPieceStats: { def: 2800, hp: 10500, atk: 2200, atkSpeed: 25, critDmg: 180 },
    lore: 'Сияющие золотые латы высшего ордена паладинов, озаренные священным светом.',
  },
  dragon_fury: {
    id: 'dragon_fury',
    name: 'Драконик Сет (Draconic Leather)',
    color: '#ef4444', // crimson red (Mythic tier ONLY)
    description: 'Мифический доспех из черной драконьей кожи и чешуи с рогатыми наплечниками, оком и плащом.',
    requiredRarities: ['mythic'],
    twoPieceStats: { atk: 1800, critChance: 22, hp: 5500 },
    fourPieceStats: { atk: 4500, critDmg: 250, hp: 12000, def: 950 },
    sixPieceStats: { atk: 9500, critDmg: 450, hp: 22000, atkSpeed: 45, def: 1800 },
    lore: 'Легендарный Draconic Leather с изогнутыми рогами, пылающим оком дракона и чешуйчатым плащом.',
  },
  chaos_lord: {
    id: 'chaos_lord',
    name: 'Владыка Хаоса',
    color: '#f43f5e', // rose-500
    description: 'Мифическое облачение властителя космической бездны.',
    requiredRarities: ['mythic'],
    twoPieceStats: { atk: 1600, hp: 4500, def: 460 },
    fourPieceStats: { atk: 3800, critChance: 28, critDmg: 230, hp: 9800 },
    sixPieceStats: { atk: 8200, hp: 16500, def: 1250, critDmg: 340, atkSpeed: 45 },
    lore: 'Вся первозданная тьма подчиняется взмаху руки владыки бездны.',
  },
  celestial_god: {
    id: 'celestial_god',
    name: 'Астральный Пантеон',
    color: '#e879f9', // fuchsia-400
    description: 'Светящееся священное снаряжение из звездной материи богов-творцов.',
    requiredRarities: ['mythic'],
    twoPieceStats: { hp: 8800, def: 1250, critChance: 26 },
    fourPieceStats: { atk: 7800, critDmg: 360, atkSpeed: 52, hp: 16000 },
    sixPieceStats: { hp: 26000, atk: 16000, def: 2600, critDmg: 620, atkSpeed: 85 },
    lore: 'Искры новорожденных галактик и сверхновых окружают вознесенного владыку.',
  }
};
