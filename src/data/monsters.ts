import { Monster } from '../types/game';

interface MonsterArchetype {
  name: string;
  icon: string;
  color: string;
  accentColor: string;
  hpMult: number;
  atkMult: number;
  defMult: number;
}

const MINION_ARCHETYPES: MonsterArchetype[] = [
  { name: 'Склизкий Слизняк', icon: '🟢', color: '#22c55e', accentColor: '#15803d', hpMult: 0.9, atkMult: 0.7, defMult: 0.5 },
  { name: 'Пещерный Гоблин', icon: '👺', color: '#84cc16', accentColor: '#4d7c0f', hpMult: 1.0, atkMult: 0.9, defMult: 0.7 },
  { name: 'Скелет-меченосец', icon: '💀', color: '#e2e8f0', accentColor: '#94a3b8', hpMult: 1.1, atkMult: 1.1, defMult: 0.9 },
  { name: 'Зомби-рудокоп', icon: '🧟', color: '#38bdf8', accentColor: '#0284c7', hpMult: 1.4, atkMult: 0.8, defMult: 1.0 },
  { name: 'Клыкастый Варг', icon: '🐺', color: '#a8a29e', accentColor: '#57534e', hpMult: 1.0, atkMult: 1.3, defMult: 0.8 },
  { name: 'Темный Культист', icon: '🧙', color: '#a855f7', accentColor: '#6b21a8', hpMult: 1.2, atkMult: 1.4, defMult: 0.9 },
  { name: 'Лавовый Элементаль', icon: '🔥', color: '#f97316', accentColor: '#c2410c', hpMult: 1.5, atkMult: 1.3, defMult: 1.3 },
  { name: 'Горгулья Склепа', icon: '🦇', color: '#64748b', accentColor: '#334155', hpMult: 1.6, atkMult: 1.2, defMult: 1.5 },
];

const BOSS_ARCHETYPES: MonsterArchetype[] = [
  { name: 'Вождь Гоблинов Грок', icon: '👹', color: '#65a30d', accentColor: '#365314', hpMult: 4.5, atkMult: 2.2, defMult: 1.8 },
  { name: 'Лорд Скелетов Мортис', icon: '☠️', color: '#cbd5e1', accentColor: '#64748b', hpMult: 5.2, atkMult: 2.5, defMult: 2.2 },
  { name: 'Древний Каменный Голем', icon: '🗿', color: '#78716c', accentColor: '#44403c', hpMult: 7.0, atkMult: 2.0, defMult: 3.5 },
  { name: 'Матриарх Черных Пауков', icon: '🕷️', color: '#9333ea', accentColor: '#581c87', hpMult: 5.8, atkMult: 3.0, defMult: 2.0 },
  { name: 'Красный Дракон Игнис', icon: '🐲', color: '#dc2626', accentColor: '#991b1b', hpMult: 8.5, atkMult: 3.8, defMult: 3.0 },
  { name: 'Повелитель Бездны Малгарот', icon: '👿', color: '#be123c', accentColor: '#881337', hpMult: 12.0, atkMult: 4.5, defMult: 4.0 },
];

export function generateMonster(stage: number, subStage: number): Monster {
  const isBoss = subStage === 10;
  const isElite = !isBoss && subStage % 3 === 0;

  // Base scaling
  // Linear + slight exponential to make progression challenging
  const stagePower = Math.pow(stage, 1.35) * (1 + (subStage - 1) * 0.12);

  let archetype: MonsterArchetype;
  let type: 'minion' | 'elite' | 'boss' = 'minion';
  let scale = 1.0;

  if (isBoss) {
    type = 'boss';
    const bossIdx = (stage - 1) % BOSS_ARCHETYPES.length;
    archetype = BOSS_ARCHETYPES[bossIdx];
    scale = 1.5;
  } else if (isElite) {
    type = 'elite';
    const minionIdx = (stage * 3 + subStage) % MINION_ARCHETYPES.length;
    const base = MINION_ARCHETYPES[minionIdx];
    archetype = {
      ...base,
      name: `Яростный ${base.name}`,
      hpMult: base.hpMult * 2.0,
      atkMult: base.atkMult * 1.5,
      defMult: base.defMult * 1.4,
    };
    scale = 1.25;
  } else {
    type = 'minion';
    const minionIdx = (stage * 5 + subStage) % MINION_ARCHETYPES.length;
    archetype = MINION_ARCHETYPES[minionIdx];
    scale = 1.0;
  }

  // Calculate HP, ATK, DEF
  const baseHp = 45;
  const baseAtk = 5;
  const baseDef = 2;

  const maxHp = Math.max(15, Math.round(baseHp * stagePower * archetype.hpMult));
  const atk = Math.max(2, Math.round(baseAtk * stagePower * 0.45 * archetype.atkMult));
  const def = Math.max(1, Math.round(baseDef * stagePower * 0.3 * archetype.defMult));

  // Rewards scaled for new chest economy (200, 1999, 5000, 20000)
  const goldReward = Math.max(
    5,
    Math.round((12 + Math.pow(stage, 1.6) * 14 + subStage * 4) * (isBoss ? 10 : isElite ? 3.5 : 1))
  );
  const shardReward = isBoss ? Math.max(4, Math.round(stage * 2)) : isElite ? 1 : (Math.random() < 0.35 ? 1 : 0);

  return {
    id: `mob_${stage}_${subStage}_${Date.now()}`,
    name: archetype.name,
    type,
    maxHp,
    currentHp: maxHp,
    atk,
    def,
    goldReward,
    shardReward,
    color: archetype.color,
    accentColor: archetype.accentColor,
    icon: archetype.icon,
    scale,
  };
}
