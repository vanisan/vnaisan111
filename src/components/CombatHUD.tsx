import React from 'react';
import { HeroStats, Monster } from '../types/game';
import { Swords, Skull, Flame, Play, Pause, Compass } from 'lucide-react';
import { getBiomeForStage } from '../utils/pixelRenderer';

interface CombatHUDProps {
  stage: number;
  subStage: number;
  heroStats: HeroStats;
  heroHp: number;
  currentMonster: Monster | null;
  isAutoAdvancing: boolean;
  onToggleAutoAdvance: () => void;
  isHeroDead: boolean;
  onRespawn: () => void;
}

export const CombatHUD: React.FC<CombatHUDProps> = ({
  stage,
  subStage,
  heroStats,
  heroHp,
  currentMonster,
  isAutoAdvancing,
  onToggleAutoAdvance,
  isHeroDead,
  onRespawn,
}) => {
  const isBoss = subStage === 10;
  const heroHpPercent = Math.max(0, Math.min(100, (heroHp / heroStats.maxHp) * 100));
  const biome = getBiomeForStage(stage);

  return (
    <div className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 shadow-md space-y-2.5">
      {/* Top row: Stage Title, Biome & Auto-Advance Toggle */}
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          {isBoss ? (
            <span className="flex items-center gap-1 text-xs font-black tracking-wider text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-600/50 animate-pulse">
              <Skull className="w-3.5 h-3.5" /> БОСС ЭТАПА {stage}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-xs font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 font-mono">
              <Swords className="w-3.5 h-3.5" /> ЭТАП {stage} — {subStage}/10
            </span>
          )}
          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-stone-950/80 border border-stone-800 text-stone-300 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: biome.accentColor }} />
            {biome.name}
          </span>
          <span className="text-[10px] text-stone-500 font-mono hidden sm:inline">
            {isBoss ? 'Особая битва' : `${10 - subStage} до босса`}
          </span>
        </div>

        {/* Auto advance toggle */}
        <button
          onClick={onToggleAutoAdvance}
          className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
            isAutoAdvancing
              ? 'bg-emerald-950/60 text-emerald-300 border-emerald-600/60 hover:bg-emerald-900/60'
              : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
          }`}
          title={isAutoAdvancing ? 'Авто-продвижение включено' : 'Фарм текущего уровня'}
        >
          {isAutoAdvancing ? (
            <>
              <Play className="w-3 h-3 text-emerald-400" />
              <span>Авто-бой</span>
            </>
          ) : (
            <>
              <Pause className="w-3 h-3 text-amber-400" />
              <span>Фарм</span>
            </>
          )}
        </button>
      </div>

      {/* Hero HP & Monster HP Dual Bars */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Hero Health Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-semibold text-emerald-400 flex items-center gap-1">
              ❤️ Герой
            </span>
            <span className="tabular-nums text-stone-300">
              {Math.max(0, Math.round(heroHp))} / {heroStats.maxHp}
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-150"
              style={{ width: `${heroHpPercent}%` }}
            />
          </div>
        </div>

        {/* Monster Health Bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-[11px] font-mono">
            <span className="font-semibold text-rose-400 truncate max-w-[100px]" title={currentMonster?.name || 'Враг'}>
              {currentMonster ? `${currentMonster.icon} ${currentMonster.name}` : 'Поиск...'}
            </span>
            <span className="tabular-nums text-stone-300">
              {currentMonster ? `${Math.max(0, currentMonster.currentHp)}/${currentMonster.maxHp}` : '0/0'}
            </span>
          </div>
          <div className="w-full h-2.5 bg-stone-950 rounded-full overflow-hidden border border-stone-800">
            <div
              className={`h-full bg-gradient-to-r transition-all duration-150 ${
                isBoss ? 'from-rose-600 to-amber-500' : 'from-rose-600 to-rose-400'
              }`}
              style={{
                width: `${
                  currentMonster
                    ? Math.max(0, Math.min(100, (currentMonster.currentHp / currentMonster.maxHp) * 100))
                    : 0
                }%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Death Warning / Respawn Button */}
      {isHeroDead && (
        <div className="flex items-center justify-between p-2 bg-rose-950/60 border border-rose-700/60 rounded-lg animate-pulse">
          <div className="flex items-center gap-2 text-rose-300 text-xs">
            <Flame className="w-4 h-4 text-rose-500" />
            <span>Герой пал в битве!</span>
          </div>
          <button
            onClick={onRespawn}
            className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded transition-colors"
          >
            Возродиться и отступить
          </button>
        </div>
      )}
    </div>
  );
};
