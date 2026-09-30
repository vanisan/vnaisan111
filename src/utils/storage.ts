import { EquipmentItem, HeroStats, PlayerProgress, SlotType, TapUpgrade } from '../types/game';
import { INITIAL_UPGRADES } from '../data/upgrades';
import { EQUIPMENT_SETS } from '../data/sets';
import { getUpgradedItemStats } from '../data/items';

export interface SavedGameState {
  progress: PlayerProgress;
  equipped: Partial<Record<SlotType, EquipmentItem>>;
  inventory: EquipmentItem[];
  upgrades: TapUpgrade[];
  lastSavedAt: number;
}

const STORAGE_KEY = 'pixel_hero_rpg_save_v1';

export function getInitialGameState(): SavedGameState {
  return {
    progress: {
      coins: 0,
      shards: 2,
      gems: 0,
      stage: 1,
      subStage: 1,
      highestStage: 1,
      isAutoAdvancing: true,
      totalTaps: 0,
      monstersSlain: 0,
      bossesSlain: 0,
      isChestTripleBuyUnlocked: false,
    },
    equipped: {}, // Completely undressed at the beginning!
    inventory: [],
    upgrades: INITIAL_UPGRADES,
    lastSavedAt: Date.now(),
  };
}

export function sanitizeItem(item: EquipmentItem): EquipmentItem {
  if (!item) return item;
  let fixedSetId = item.setId;
  if (fixedSetId && EQUIPMENT_SETS[fixedSetId]) {
    const setDef = EQUIPMENT_SETS[fixedSetId];
    if (!setDef.requiredRarities.includes(item.rarity)) {
      if (item.rarity === 'rare') fixedSetId = 'iron_warden';
      else if (item.rarity === 'epic') fixedSetId = 'shadow_stalker';
      else if (item.rarity === 'gold') fixedSetId = 'imperial_crusader';
      else if (item.rarity === 'common' || item.rarity === 'uncommon') fixedSetId = 'novice';
      else fixedSetId = undefined;
    }
  }

  let fixedName = item.name;
  if (item.rarity !== 'mythic' && (fixedName.includes('Драконик') || fixedName.includes('Draconic'))) {
    if (item.rarity === 'rare') fixedName = 'Стальной Доспех Стража';
    else if (item.rarity === 'epic') fixedName = 'Одеяние Тени';
    else if (item.rarity === 'gold') fixedName = 'Доспех Имперского Крестоносца';
    else fixedName = 'Простая куртка';
  }

  let weaponType = item.weaponType;
  if (item.slot === 'weapon' && !weaponType) {
    const lower = fixedName.toLowerCase();
    if (lower.includes('топор') || lower.includes('секир') || lower.includes('коса') || lower.includes('cleaver') || lower.includes('battleaxe')) {
      weaponType = 'axe';
    } else if (lower.includes('копь') || lower.includes('пик') || lower.includes('трезуб') || lower.includes('lance') || lower.includes('halberd')) {
      weaponType = 'spear';
    } else {
      weaponType = 'sword';
    }
  }

  return {
    ...item,
    name: fixedName,
    setId: fixedSetId,
    weaponType,
  };
}

export function loadSavedGameState(): SavedGameState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return getInitialGameState();
    const parsed = JSON.parse(raw);

    const equippedRaw = parsed.equipped || {};
    const equippedClean: Partial<Record<SlotType, EquipmentItem>> = {};
    Object.entries(equippedRaw).forEach(([slot, item]) => {
      if (item) {
        equippedClean[slot as SlotType] = sanitizeItem(item as EquipmentItem);
      }
    });

    const inventoryRaw: EquipmentItem[] = parsed.inventory || [];
    const inventoryClean = inventoryRaw.map(item => sanitizeItem(item));

    return {
      progress: { ...getInitialGameState().progress, ...parsed.progress },
      equipped: equippedClean,
      inventory: inventoryClean,
      upgrades: parsed.upgrades || INITIAL_UPGRADES,
      lastSavedAt: parsed.lastSavedAt || Date.now(),
    };
  } catch (err) {
    console.warn('Failed to load save, returning defaults:', err);
    return getInitialGameState();
  }
}

export function saveGameState(state: SavedGameState) {
  try {
    const data = { ...state, lastSavedAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (err) {
    console.error('Failed to save game state:', err);
  }
}

// Compute total hero stats combining base + equipped gear + set bonuses + upgrades
export function calculateHeroStats(
  equipped: Partial<Record<SlotType, EquipmentItem>>,
  upgrades: TapUpgrade[]
): { stats: HeroStats; activeSetBonuses: { set: typeof EQUIPMENT_SETS[string]; count: number; activeTiers: number[] }[] } {
  // Base stats
  let maxHp = 120;
  let def = 2;
  let atk = 6;
  let critChance = 5;
  let critDmg = 150;
  let atkSpeedBonusPct = 0; // % bonus

  // Apply tap/passive upgrades
  const warriorMightLvl = upgrades.find(u => u.id === 'warrior_might')?.level || 0;
  atk += warriorMightLvl * 4;

  const tapPowerLvl = upgrades.find(u => u.id === 'tap_power')?.level || 0;
  const baseTapGold = 1 + tapPowerLvl * 1;

  const autoClickerLvl = upgrades.find(u => u.id === 'auto_clicker')?.level || 0;
  const passiveGoldPerSec = autoClickerLvl * baseTapGold;

  // Add stats from all 6 equipped items
  const setCountMap: Record<string, number> = {};

  Object.values(equipped).forEach(item => {
    if (!item) return;
    const upStats = getUpgradedItemStats(item);
    if (upStats.hp) maxHp += upStats.hp;
    if (upStats.def) def += upStats.def;
    if (upStats.atk) atk += upStats.atk;
    if (upStats.critChance) critChance += upStats.critChance;
    if (upStats.critDmg) critDmg += upStats.critDmg;
    if (upStats.atkSpeed) atkSpeedBonusPct += upStats.atkSpeed;

    if (item.setId && EQUIPMENT_SETS[item.setId]) {
      const setDef = EQUIPMENT_SETS[item.setId];
      // STRICT CHECK: An item ONLY counts towards a set bonus if its rarity is permitted by that set!
      if (setDef.requiredRarities.includes(item.rarity)) {
        setCountMap[item.setId] = (setCountMap[item.setId] || 0) + 1;
      }
    }
  });

  // Evaluate Set Bonuses (2-piece and 4-piece)
  const activeSetBonuses: { set: typeof EQUIPMENT_SETS[string]; count: number; activeTiers: number[] }[] = [];

  Object.entries(setCountMap).forEach(([setId, count]) => {
    const setDef = EQUIPMENT_SETS[setId];
    if (!setDef) return;
    const activeTiers: number[] = [];

    if (count >= 2) {
      activeTiers.push(2);
      if (setDef.twoPieceStats.hp) maxHp += setDef.twoPieceStats.hp;
      if (setDef.twoPieceStats.def) def += setDef.twoPieceStats.def;
      if (setDef.twoPieceStats.atk) atk += setDef.twoPieceStats.atk;
      if (setDef.twoPieceStats.critChance) critChance += setDef.twoPieceStats.critChance;
      if (setDef.twoPieceStats.critDmg) critDmg += setDef.twoPieceStats.critDmg;
      if (setDef.twoPieceStats.atkSpeed) atkSpeedBonusPct += setDef.twoPieceStats.atkSpeed;
    }

    if (count >= 4) {
      activeTiers.push(4);
      if (setDef.fourPieceStats.hp) maxHp += setDef.fourPieceStats.hp;
      if (setDef.fourPieceStats.def) def += setDef.fourPieceStats.def;
      if (setDef.fourPieceStats.atk) atk += setDef.fourPieceStats.atk;
      if (setDef.fourPieceStats.critChance) critChance += setDef.fourPieceStats.critChance;
      if (setDef.fourPieceStats.critDmg) critDmg += setDef.fourPieceStats.critDmg;
      if (setDef.fourPieceStats.atkSpeed) atkSpeedBonusPct += setDef.fourPieceStats.atkSpeed;
    }

    if (count >= 6 && setDef.sixPieceStats) {
      activeTiers.push(6);
      if (setDef.sixPieceStats.hp) maxHp += setDef.sixPieceStats.hp;
      if (setDef.sixPieceStats.def) def += setDef.sixPieceStats.def;
      if (setDef.sixPieceStats.atk) atk += setDef.sixPieceStats.atk;
      if (setDef.sixPieceStats.critChance) critChance += setDef.sixPieceStats.critChance;
      if (setDef.sixPieceStats.critDmg) critDmg += setDef.sixPieceStats.critDmg;
      if (setDef.sixPieceStats.atkSpeed) atkSpeedBonusPct += setDef.sixPieceStats.atkSpeed;
    }

    activeSetBonuses.push({
      set: setDef,
      count,
      activeTiers,
    });
  });

  // Add weapon type innate bonuses:
  // sword: +10% урона (atk)
  // axe: +15% HP
  // spear: +5% урона (atk) и +5% крит урона (critDmg)
  const weaponItem = equipped.weapon;
  if (weaponItem) {
    let wType = weaponItem.weaponType;
    if (!wType) {
      const lower = weaponItem.name.toLowerCase();
      if (lower.includes('топор') || lower.includes('секир') || lower.includes('коса') || lower.includes('cleaver') || lower.includes('battleaxe')) {
        wType = 'axe';
      } else if (lower.includes('копь') || lower.includes('пик') || lower.includes('трезуб') || lower.includes('lance') || lower.includes('halberd')) {
        wType = 'spear';
      } else {
        wType = 'sword';
      }
    }

    if (wType === 'sword') {
      atk = Math.round(atk * 1.10);
    } else if (wType === 'axe') {
      maxHp = Math.round(maxHp * 1.15);
    } else if (wType === 'spear') {
      atk = Math.round(atk * 1.05);
      critDmg += 5;
    }
  }

  // Final atkSpeed calculation (base 1.0 attacks/second, +% increases it smoothly)
  const finalAtkSpeed = Number((1.0 * (1 + atkSpeedBonusPct / 100)).toFixed(2));

  return {
    stats: {
      maxHp,
      currentHp: maxHp,
      def,
      atk,
      critChance: Math.min(95, critChance),
      critDmg,
      atkSpeed: Math.min(4.0, Math.max(0.6, finalAtkSpeed)),
      goldPerTap: baseTapGold,
      passiveGoldPerSec,
    },
    activeSetBonuses,
  };
}
