import React, { useState } from 'react';
import { ChestType, EquipmentItem, Rarity } from '../types/game';
import { CHESTS } from '../data/chests';
import { generateRandomItem, RARITY_CONFIGS, getUpgradedItemStats } from '../data/items';
import { sound } from '../utils/audio';
import { Sparkles, Dices, PackageOpen, HelpCircle, ArrowRight, Check, Zap, Lock, Unlock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ItemPixelIcon } from './ItemPixelIcon';

interface LootboxViewProps {
  coins: number;
  gems: number;
  isTripleBuyUnlocked?: boolean;
  onUnlockTripleBuy?: () => void;
  onSpendCurrencies: (coins: number, shards: number, gems?: number) => boolean;
  onAddItem: (item: EquipmentItem) => void;
  onEquipItem: (item: EquipmentItem) => void;
  onAddCoins: (amount: number) => void;
  onAddShards: (amount: number) => void;
}

export const LootboxView: React.FC<LootboxViewProps> = ({
  coins,
  gems,
  isTripleBuyUnlocked = false,
  onUnlockTripleBuy,
  onSpendCurrencies,
  onAddItem,
  onEquipItem,
  onAddCoins,
  onAddShards,
}) => {
  const [openingChest, setOpeningChest] = useState<ChestType | null>(null);
  const [isOpeningAnim, setIsOpeningAnim] = useState<boolean>(false);
  const [openedItem, setOpenedItem] = useState<EquipmentItem | null>(null);
  const [openedTripleItems, setOpenedTripleItems] = useState<EquipmentItem[] | null>(null);

  // Gamble dice state
  const [betAmount, setBetAmount] = useState<number>(50);
  const [diceRolling, setDiceRolling] = useState<boolean>(false);
  const [diceOutcome, setDiceOutcome] = useState<{ multiplier: number; reward: number; message: string } | null>(null);

  // Unlock Triple Buy Feature for 1000 Gems
  const handleBuyTripleUnlock = () => {
    if (gems < 1000 || isTripleBuyUnlocked) return;
    const spent = onSpendCurrencies(0, 0, 1000);
    if (!spent) return;

    if (onUnlockTripleBuy) onUnlockTripleBuy();
    sound.playLootFanfare('gold');
    confetti({
      particleCount: 100,
      spread: 80,
      origin: { y: 0.5 },
    });
  };

  // Helper roll function
  const rollItemFromChest = (chest: ChestType): EquipmentItem => {
    const roll = Math.random() * 100;
    let accumulated = 0;
    let rolledRarity: Rarity = chest.minRarity;

    const rarityOrder: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'gold', 'mythic'];
    for (const r of rarityOrder) {
      accumulated += chest.rates[r] || 0;
      if (roll <= accumulated) {
        rolledRarity = r;
        break;
      }
    }
    return generateRandomItem(undefined, rolledRarity);
  };

  // Unboxing sequence (1x Chest)
  const handleOpenChest = (chest: ChestType) => {
    if (coins < chest.costCoins || gems < chest.costGems) return;

    const success = onSpendCurrencies(chest.costCoins, 0, chest.costGems);
    if (!success) return;

    setOpeningChest(chest);
    setIsOpeningAnim(true);
    setOpenedItem(null);
    setOpenedTripleItems(null);

    sound.playChestRumble();

    const item = rollItemFromChest(chest);

    setTimeout(() => {
      setIsOpeningAnim(false);
      setOpenedItem(item);
      onAddItem(item);
      sound.playLootFanfare(item.rarity);

      if (item.rarity === 'gold' || item.rarity === 'mythic') {
        confetti({
          particleCount: item.rarity === 'mythic' ? 120 : 60,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    }, 1100);
  };

  // Unboxing sequence (3x Chests)
  const handleOpenTripleChest = (chest: ChestType) => {
    const totalCoins = chest.costCoins * 3;
    const totalGems = chest.costGems * 3;

    if (coins < totalCoins || gems < totalGems) return;

    const success = onSpendCurrencies(totalCoins, 0, totalGems);
    if (!success) return;

    setOpeningChest(chest);
    setIsOpeningAnim(true);
    setOpenedItem(null);
    setOpenedTripleItems(null);

    sound.playChestRumble();

    const item1 = rollItemFromChest(chest);
    const item2 = rollItemFromChest(chest);
    const item3 = rollItemFromChest(chest);
    const items = [item1, item2, item3];

    setTimeout(() => {
      setIsOpeningAnim(false);
      setOpenedTripleItems(items);
      items.forEach(i => onAddItem(i));

      const hasMythic = items.some(i => i.rarity === 'mythic');
      const hasGold = items.some(i => i.rarity === 'gold');
      sound.playLootFanfare(hasMythic ? 'mythic' : hasGold ? 'gold' : 'epic');

      confetti({
        particleCount: hasMythic ? 140 : 80,
        spread: 90,
        origin: { y: 0.6 },
      });
    }, 1200);
  };

  // Gamble Altar: Dice Roll
  const handleGambleRoll = () => {
    if (coins < betAmount || diceRolling) return;

    const spent = onSpendCurrencies(betAmount, 0);
    if (!spent) return;

    setDiceRolling(true);
    setDiceOutcome(null);
    sound.playTap();

    setTimeout(() => {
      setDiceRolling(false);
      const roll = Math.random() * 100;

      if (roll < 45) {
        // Bust (0x)
        sound.playUpgradeFail();
        setDiceOutcome({
          multiplier: 0,
          reward: 0,
          message: '💀 Череп Бездны! Ставка сгорела в огне.',
        });
      } else if (roll < 75) {
        // 1.5x Win
        const win = Math.round(betAmount * 1.5);
        onAddCoins(win);
        sound.playCoin();
        setDiceOutcome({
          multiplier: 1.5,
          reward: win,
          message: `✨ Удача странника! Выигрыш ${win} монет!`,
        });
      } else if (roll < 92) {
        // 3.0x Win
        const win = Math.round(betAmount * 3.0);
        onAddCoins(win);
        sound.playCrit();
        setDiceOutcome({
          multiplier: 3.0,
          reward: win,
          message: `🔥 Крупный куш! x3 множитель: +${win} монет!`,
        });
        confetti({ particleCount: 25, spread: 50 });
      } else {
        // 8.0x MEGA JACKPOT!
        const win = Math.round(betAmount * 8.0);
        onAddCoins(win);
        onAddShards(2);
        sound.playLootFanfare('gold');
        setDiceOutcome({
          multiplier: 8.0,
          reward: win,
          message: `👑 ДЖЕКПОТ! x8 множитель (+${win}🪙 и +2💠)!`,
        });
        confetti({ particleCount: 80, spread: 90 });
      }
    }, 850);
  };

  return (
    <div className="space-y-5">
      {/* 1. Gacha Chests Showcase */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans flex items-center gap-1.5">
            <PackageOpen className="w-4 h-4 text-amber-500" />
            Сундуки Сокровищницы (Лудка)
          </h2>
          <span className="text-[11px] text-stone-400 font-mono">
            Шанс на Золото и Мифик
          </span>
        </div>

        {/* Chest Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CHESTS.map(chest => {
            const canAffordSingle = coins >= chest.costCoins && gems >= chest.costGems;
            const totalCoins3x = chest.costCoins * 3;
            const totalGems3x = chest.costGems * 3;
            const canAffordTriple = coins >= totalCoins3x && gems >= totalGems3x;

            return (
              <div
                key={chest.id}
                className="bg-stone-950 p-3.5 rounded-xl border border-stone-800 hover:border-stone-700 transition-all flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-3">
                  <div className="text-3xl p-2 bg-stone-900 rounded-lg border border-stone-800">
                    {chest.icon}
                  </div>
                  <div className="space-y-0.5 flex-1">
                    <h3 className="font-bold text-sm text-stone-100">{chest.name}</h3>
                    <p className="text-[11px] text-stone-400 leading-tight">
                      {chest.description}
                    </p>
                  </div>
                </div>

                {/* Drop rate tags */}
                <div className="flex flex-wrap gap-1 text-[10px] font-mono">
                  {Object.entries(chest.rates).map(([r, pct]) => {
                    if (pct === 0) return null;
                    const rConf = RARITY_CONFIGS[r as Rarity];
                    return (
                      <span
                        key={r}
                        className="px-1.5 py-0.5 rounded bg-stone-900 border border-stone-800"
                        style={{ color: rConf.color }}
                      >
                        {rConf.name}: {pct}%
                      </span>
                    );
                  })}
                </div>

                {/* Open Buttons (Single & Small x3) */}
                <div className="flex items-center gap-2">
                  {/* Single Buy Button (No '1x' label) */}
                  <button
                    onClick={() => handleOpenChest(chest)}
                    disabled={!canAffordSingle}
                    className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
                      canAffordSingle
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-md cursor-pointer active:scale-98'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <PackageOpen className="w-3.5 h-3.5" />
                    <span>
                      Открыть ({chest.costCoins.toLocaleString()}🪙
                      {chest.costGems > 0 ? ` + ${chest.costGems}💎` : ''})
                    </span>
                  </button>

                  {/* Small x3 Button */}
                  {isTripleBuyUnlocked ? (
                    <button
                      onClick={() => handleOpenTripleChest(chest)}
                      disabled={!canAffordTriple}
                      title={`Открыть 3 сундука сразу за ${totalCoins3x.toLocaleString()}🪙${totalGems3x > 0 ? ` + ${totalGems3x}💎` : ''}`}
                      className={`px-3 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all shrink-0 ${
                        canAffordTriple
                          ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md cursor-pointer active:scale-95'
                          : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                      }`}
                    >
                      <Zap className="w-3 h-3 text-amber-300" />
                      <span>х3</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleBuyTripleUnlock}
                      title="Разблокировать режим х3 за 1 000 💎"
                      className="px-2.5 py-2 rounded-lg font-bold text-xs bg-stone-900 border border-stone-800 text-stone-500 hover:text-amber-400 hover:border-amber-600/40 transition-colors flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Lock className="w-3 h-3 text-amber-500/70" />
                      <span>х3</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Gamble Altar / Runic Dice */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-rose-400 font-sans flex items-center gap-1.5">
            <Dices className="w-4 h-4 text-rose-500" />
            Алтарь Азарта (Кости Хаоса)
          </h2>
          <span className="text-[11px] text-stone-400">Рискни монетами</span>
        </div>

        <p className="text-xs text-stone-400">
          Бросьте кости судьбы: возможность сорвать джекпот x8 золота или потерять ставку!
        </p>

        {/* Bet presets */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-stone-400">Ставка:</span>
          {[20, 50, 200, 1000].map(amt => (
            <button
              key={amt}
              onClick={() => setBetAmount(amt)}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition-colors ${
                betAmount === amt
                  ? 'bg-rose-600 text-white shadow'
                  : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
              }`}
            >
              {amt}🪙
            </button>
          ))}
        </div>

        {/* Dice Outcome Box */}
        {diceOutcome && (
          <div
            className={`p-3 rounded-lg border text-xs font-bold text-center ${
              diceOutcome.multiplier > 0
                ? 'bg-emerald-950/70 border-emerald-600 text-emerald-300'
                : 'bg-rose-950/70 border-rose-600 text-rose-300'
            }`}
          >
            {diceOutcome.message}
          </div>
        )}

        {/* Roll Button */}
        <button
          onClick={handleGambleRoll}
          disabled={coins < betAmount || diceRolling}
          className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
            coins >= betAmount && !diceRolling
              ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg cursor-pointer active:scale-98'
              : 'bg-stone-800 text-stone-500 cursor-not-allowed'
          }`}
        >
          <Dices className={`w-4 h-4 ${diceRolling ? 'animate-spin' : ''}`} />
          <span>{diceRolling ? 'Бросок костей...' : `Испытать удачу на ${betAmount}🪙`}</span>
        </button>
      </div>

      {/* 3. Triple Buy Unlock Banner at the VERY BOTTOM */}
      {!isTripleBuyUnlocked ? (
        <div className="bg-gradient-to-r from-amber-950/60 via-purple-950/40 to-stone-900 border border-amber-600/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-500/20 border border-amber-500/40 rounded-xl text-amber-400 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-xs text-amber-200 uppercase tracking-wide">
                  Опция «Купить сундуки х3»
                </h4>
                <span className="px-1.5 py-0.2 text-[9px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded">
                  1 000 💎
                </span>
              </div>
              <p className="text-[11px] text-stone-300 leading-tight">
                Разблокирует кнопку моментального открытия 3 сундуков сразу для всех видов ларцов!
              </p>
            </div>
          </div>

          <button
            onClick={handleBuyTripleUnlock}
            disabled={gems < 1000}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1.5 transition-all shrink-0 ${
              gems >= 1000
                ? 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-stone-950 shadow-md cursor-pointer active:scale-98 animate-pulse'
                : 'bg-stone-800 text-stone-500 border border-stone-700 cursor-not-allowed'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            <span>
              {gems >= 1000
                ? 'Открыть за 1 000 💎'
                : `Не хватает 💎 (${gems}/1 000)`}
            </span>
          </button>
        </div>
      ) : (
        <div className="bg-emerald-950/40 border border-emerald-600/40 rounded-xl px-3.5 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Режим «Купить сундуки х3» активен</span>
          </div>
          <span className="text-[11px] text-emerald-400/80 font-mono">
            Кнопка х3 разблокирована ⚡
          </span>
        </div>
      )}

      {/* 4. UNBOXING MODAL (Drop Icons Only & 'В рюкзак') */}
      {(isOpeningAnim || openedItem || (openedTripleItems && openedTripleItems.length > 0)) && openingChest && (
        <div className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-stone-900 border border-stone-700 rounded-2xl p-6 text-center space-y-4 shadow-2xl relative max-w-sm w-full animate-in fade-in zoom-in-95 duration-200">
            {isOpeningAnim ? (
              <div className="py-6 space-y-3">
                <div className="text-6xl animate-bounce drop-shadow-[0_0_20px_rgba(245,158,11,0.6)]">
                  {openingChest.icon}
                </div>
                <div className="space-y-1">
                  <h3 className="font-extrabold text-amber-400 text-base font-sans animate-pulse">
                    ОТКРЫТИЕ...
                  </h3>
                  <p className="text-xs text-stone-400">Магия сокровищ вырывается наружу!</p>
                </div>
              </div>
            ) : openedTripleItems ? (
              /* TRIPLE LOOT: ICONS ONLY + 'В рюкзак' */
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-amber-400 flex items-center justify-center gap-1.5">
                  <Zap className="w-4 h-4" />
                  <span>Получено 3 предмета:</span>
                </div>

                <div className="flex items-center justify-center gap-2.5 py-2">
                  {openedTripleItems.map((item, idx) => (
                    <div
                      key={item.id + idx}
                      className="flex flex-col items-center space-y-1.5"
                    >
                      <div
                        className={`p-2.5 rounded-xl border aspect-square w-16 h-16 flex items-center justify-center shadow-lg transition-transform hover:scale-105 ${
                          RARITY_CONFIGS[item.rarity].bgClass
                        } ${RARITY_CONFIGS[item.rarity].borderClass}`}
                      >
                        <ItemPixelIcon item={item} size={42} />
                      </div>
                      <span
                        className="text-[10px] font-bold uppercase tracking-tight text-center max-w-[70px] truncate"
                        style={{ color: RARITY_CONFIGS[item.rarity].color }}
                        title={item.name}
                      >
                        {item.name}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Close / Send to bag */}
                <button
                  onClick={() => {
                    setOpenedTripleItems(null);
                    setOpeningChest(null);
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow cursor-pointer active:scale-98 transition-all"
                >
                  В рюкзак
                </button>
              </div>
            ) : openedItem ? (
              /* SINGLE LOOT: ICON ONLY + 'В рюкзак' */
              <div className="space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-stone-400">
                  Вы получили предмет:
                </div>

                <div className="flex flex-col items-center space-y-2 py-1">
                  <div
                    className={`p-3 rounded-2xl border aspect-square w-24 h-24 flex items-center justify-center shadow-2xl ${
                      RARITY_CONFIGS[openedItem.rarity].bgClass
                    } ${RARITY_CONFIGS[openedItem.rarity].borderClass}`}
                  >
                    <ItemPixelIcon item={openedItem} size={64} />
                  </div>

                  <div className="text-center">
                    <h3 className="font-extrabold text-sm text-stone-100">{openedItem.name}</h3>
                    <span
                      className="font-bold text-xs uppercase tracking-wider"
                      style={{ color: RARITY_CONFIGS[openedItem.rarity].color }}
                    >
                      {RARITY_CONFIGS[openedItem.rarity].name} • {openedItem.slot}
                    </span>
                  </div>
                </div>

                {/* Close / Send to bag */}
                <button
                  onClick={() => {
                    setOpenedItem(null);
                    setOpeningChest(null);
                  }}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow cursor-pointer active:scale-98 transition-all"
                >
                  В рюкзак
                </button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
};
