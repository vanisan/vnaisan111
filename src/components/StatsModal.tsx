import React from 'react';
import { HeroStats, EquipmentItem, SlotType, WEAPON_TYPE_INFO } from '../types/game';
import { EQUIPMENT_SETS } from '../data/sets';
import { Shield, X, Heart, Sword, Zap, Target, Flame, Coins, Sparkles } from 'lucide-react';

interface StatsModalProps {
  heroStats: HeroStats;
  equipped: Partial<Record<SlotType, EquipmentItem>>;
  onClose: () => void;
  stage: number;
  monstersSlain: number;
  bossesSlain: number;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  heroStats,
  equipped,
  onClose,
  stage,
  monstersSlain,
  bossesSlain,
}) => {
  // Count active sets
  const setCountMap: Record<string, number> = {};
  Object.values(equipped).forEach(item => {
    if (item?.setId) {
      setCountMap[item.setId] = (setCountMap[item.setId] || 0) + 1;
    }
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
      <div className="bg-stone-900 border border-stone-700 rounded-xl p-5 max-w-md w-full space-y-4 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-amber-400" />
          <h3 className="font-extrabold text-base text-stone-100">
            Характеристики Героя
          </h3>
        </div>

        {/* Active Weapon Innate Bonus */}
        {equipped.weapon && (() => {
          const wType = equipped.weapon.weaponType || 'sword';
          const wInfo = WEAPON_TYPE_INFO[wType];
          return (
            <div className="flex items-center justify-between p-2 rounded-lg bg-amber-950/40 border border-amber-500/30 text-xs">
              <span className="flex items-center gap-1.5 font-bold text-amber-200">
                <span>{wInfo.icon}</span>
                <span>Бонус оружия ({wInfo.name}):</span>
              </span>
              <span className="font-extrabold text-amber-300 font-mono">
                {wInfo.bonusLabel}
              </span>
            </div>
          );
        })()}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
          <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5 font-sans">
              <Heart className="w-3.5 h-3.5 text-rose-500" /> Здоровье
            </span>
            <span className="font-bold text-stone-100">{heroStats.maxHp} HP</span>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5 font-sans">
              <Shield className="w-3.5 h-3.5 text-sky-400" /> Защита
            </span>
            <span className="font-bold text-stone-100">{heroStats.def} DEF</span>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5 font-sans">
              <Sword className="w-3.5 h-3.5 text-amber-400" /> Атака
            </span>
            <span className="font-bold text-stone-100">{heroStats.atk} ATK</span>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5 font-sans">
              <Target className="w-3.5 h-3.5 text-red-400" /> Крит шанс
            </span>
            <span className="font-bold text-stone-100">{heroStats.critChance}%</span>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5 font-sans">
              <Flame className="w-3.5 h-3.5 text-orange-400" /> Крит урон
            </span>
            <span className="font-bold text-stone-100">{heroStats.critDmg}%</span>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5 font-sans">
              <Zap className="w-3.5 h-3.5 text-yellow-400" /> Скор. атаки
            </span>
            <span className="font-bold text-stone-100">{heroStats.atkSpeed} уд/с</span>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5 font-sans">
              <Coins className="w-3.5 h-3.5 text-amber-300" /> Золото за тап
            </span>
            <span className="font-bold text-amber-300">{heroStats.goldPerTap} 🪙</span>
          </div>

          <div className="p-2.5 bg-stone-950 rounded-lg border border-stone-800 flex items-center justify-between">
            <span className="text-stone-400 flex items-center gap-1.5 font-sans">
              <Zap className="w-3.5 h-3.5 text-emerald-400" /> Пассивный доход
            </span>
            <span className="font-bold text-emerald-400">{heroStats.passiveGoldPerSec} 🪙/с</span>
          </div>
        </div>

        {/* Journey Statistics */}
        <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-1 text-xs font-mono">
          <div className="text-[11px] font-bold text-stone-400 font-sans mb-1">
            Боевая летопись странствий:
          </div>
          <div className="flex justify-between text-stone-300">
            <span>Достигнутый этап:</span>
            <span className="font-bold text-amber-400">Этап {stage}</span>
          </div>
          <div className="flex justify-between text-stone-300">
            <span>Сражено чудовищ:</span>
            <span className="font-bold text-stone-100">{monstersSlain}</span>
          </div>
          <div className="flex justify-between text-stone-300">
            <span>Повержено боссов:</span>
            <span className="font-bold text-rose-400">{bossesSlain}</span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs rounded transition-colors"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};
