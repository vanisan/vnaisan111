import React from 'react';
import { TapUpgrade } from '../types/game';
import { getUpgradeCost } from '../data/upgrades';
import { sound } from '../utils/audio';
import { Zap, TrendingUp, Sparkles } from 'lucide-react';

interface UpgradesViewProps {
  upgrades: TapUpgrade[];
  coins: number;
  onBuyUpgrade: (upgradeId: string) => void;
}

export const UpgradesView: React.FC<UpgradesViewProps> = ({
  upgrades,
  coins,
  onBuyUpgrade,
}) => {
  const handleBuy = (upgrade: TapUpgrade) => {
    const cost = getUpgradeCost(upgrade);
    if (coins < cost) return;
    sound.playCoin();
    onBuyUpgrade(upgrade.id);
  };

  return (
    <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans flex items-center gap-1.5">
          <Zap className="w-4 h-4 text-amber-500" />
          Прокачка Навыков и Клика
        </h2>
        <span className="text-[11px] text-stone-400 font-mono">
          Базовый доход: 1 тап = 1+ монета
        </span>
      </div>

      <div className="space-y-2.5">
        {upgrades.map(upgrade => {
          const cost = getUpgradeCost(upgrade);
          const canAfford = coins >= cost;

          return (
            <div
              key={upgrade.id}
              className="bg-stone-950 p-3 rounded-xl border border-stone-800/80 hover:border-stone-700 transition-all flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl p-2 bg-stone-900 rounded-lg border border-stone-800">
                  {upgrade.icon}
                </div>
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs sm:text-sm text-stone-100">
                      {upgrade.name}
                    </h3>
                    <span className="text-[10px] font-mono text-amber-400 font-bold bg-stone-900 px-1.5 py-0.5 rounded border border-amber-500/30">
                      Ур. {upgrade.level}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400 max-w-xs sm:max-w-md">
                    {upgrade.description}
                  </p>
                </div>
              </div>

              {/* Buy button */}
              <button
                onClick={() => handleBuy(upgrade)}
                disabled={!canAfford}
                className={`shrink-0 px-3.5 py-2 rounded-lg font-mono font-bold text-xs transition-all flex items-center gap-1.5 ${
                  canAfford
                    ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-sm cursor-pointer active:scale-95'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                <span>{cost.toLocaleString()}🪙</span>
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
