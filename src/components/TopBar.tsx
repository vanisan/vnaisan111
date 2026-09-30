import React, { useState } from 'react';
import { Volume2, VolumeX, RotateCcw, Shield, Sparkles } from 'lucide-react';
import { sound } from '../utils/audio';

interface TopBarProps {
  coins: number;
  shards: number;
  gems: number;
  onResetGame: () => void;
  onOpenStats: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  coins,
  shards,
  gems,
  onResetGame,
  onOpenStats,
}) => {
  const [isMuted, setIsMuted] = useState(sound.getMuted());
  const [showConfirmReset, setShowConfirmReset] = useState(false);

  const toggleSound = () => {
    const muted = sound.toggleMute();
    setIsMuted(muted);
  };

  return (
    <header className="flex items-center justify-between px-3 sm:px-6 py-2.5 bg-stone-900/90 border-b border-stone-800 backdrop-blur-md sticky top-0 z-30">
      {/* Zone 1: Clean Left Anchor (Brand wordmark removed as requested) */}
      <div className="flex items-center gap-2" />

      {/* Zone 2: Currencies (Tabular numbers) */}
      <div className="flex items-center gap-2 sm:gap-4 font-mono text-xs sm:text-sm">
        {/* Coins */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-800/80 rounded border border-stone-700/60" title="Золотые монеты">
          <span className="text-amber-400">🪙</span>
          <span className="font-bold tabular-nums text-amber-200">
            {coins >= 1000000 
              ? `${(coins / 1000000).toFixed(2)}M` 
              : coins >= 10000 
              ? `${(coins / 1000).toFixed(1)}K` 
              : coins.toLocaleString()}
          </span>
        </div>

        {/* Shards */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-800/80 rounded border border-stone-700/60" title="Осколки для закалки и ковки">
          <span className="text-cyan-400">💠</span>
          <span className="font-bold tabular-nums text-cyan-200">
            {shards}
          </span>
        </div>

        {/* Gems */}
        <div className="flex items-center gap-1.5 px-2 py-1 bg-stone-800/80 rounded border border-stone-700/60" title="Рубины боссов">
          <span className="text-rose-400">💎</span>
          <span className="font-bold tabular-nums text-rose-200">
            {gems}
          </span>
        </div>
      </div>

      {/* Zone 3: Actions (Stats, Sound, Reset) */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button
          onClick={onOpenStats}
          className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-stone-200 bg-stone-800 hover:bg-stone-700 rounded border border-stone-700 transition-colors whitespace-nowrap"
          title="Характеристики героя"
        >
          <Shield className="w-3.5 h-3.5 text-sky-400" />
          <span className="hidden sm:inline">Статы</span>
        </button>

        <button
          onClick={toggleSound}
          className="p-1.5 text-stone-300 hover:text-white bg-stone-800 hover:bg-stone-700 rounded border border-stone-700 transition-colors"
          title={isMuted ? 'Включить звук' : 'Выключить звук'}
          aria-label="Переключить звук"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-stone-400" /> : <Volume2 className="w-4 h-4 text-amber-400" />}
        </button>

        <button
          onClick={() => setShowConfirmReset(true)}
          className="p-1.5 text-stone-400 hover:text-rose-400 bg-stone-800/60 hover:bg-stone-800 rounded border border-stone-700/50 transition-colors"
          title="Сброс прогресса"
          aria-label="Сброс игры"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Confirm reset dialog */}
      {showConfirmReset && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-700 p-5 rounded-xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-stone-100">Сбросить весь прогресс?</h3>
            <p className="text-xs text-stone-400 leading-relaxed">
              Вы вернетесь в исходное состояние: голый герой, нулевой уровень и начальные монеты. Это действие необратимо.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmReset(false)}
                className="px-3 py-1.5 text-xs font-medium text-stone-300 bg-stone-800 hover:bg-stone-700 rounded"
              >
                Отмена
              </button>
              <button
                onClick={() => {
                  setShowConfirmReset(false);
                  onResetGame();
                }}
                className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded"
              >
                Сбросить
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
