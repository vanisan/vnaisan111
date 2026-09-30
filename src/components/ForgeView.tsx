import React, { useState } from 'react';
import { EquipmentItem, Rarity, SlotType } from '../types/game';
import { getUpgradeInfo, getUpgradedItemStats, RARITY_CONFIGS, generateRandomItem } from '../data/items';
import { sound } from '../utils/audio';
import { Flame, Sparkles, Hammer, Shuffle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ItemPixelIcon } from './ItemPixelIcon';

interface ForgeViewProps {
  inventory: EquipmentItem[];
  equipped: Partial<Record<SlotType, EquipmentItem>>;
  coins: number;
  shards: number;
  gems?: number;
  onUpdateItem: (updatedItem: EquipmentItem) => void;
  onRemoveItem: (itemId: string) => void;
  onAddItem: (newItem: EquipmentItem) => void;
  onSpendCurrencies: (coins: number, shards: number, gems?: number) => boolean;
  preselectedItem?: EquipmentItem | null;
}

export const REFORGE_COSTS: Record<Rarity, { shards: number; gems: number; label: string }> = {
  common: { shards: 1, gems: 0, label: '1 💠 осколок' },
  uncommon: { shards: 3, gems: 0, label: '3 💠 осколка' },
  rare: { shards: 10, gems: 0, label: '10 💠 осколков' },
  epic: { shards: 50, gems: 0, label: '50 💠 осколков' },
  gold: { shards: 0, gems: 20, label: '20 💎 кристаллов' },
  mythic: { shards: 0, gems: 50, label: '50 💎 кристаллов' },
};

export const ForgeView: React.FC<ForgeViewProps> = ({
  inventory,
  equipped,
  coins,
  shards,
  gems = 0,
  onUpdateItem,
  onRemoveItem,
  onAddItem,
  onSpendCurrencies,
  preselectedItem,
}) => {
  const [activeTab, setActiveTab] = useState<'upgrade' | 'craft' | 'reforge'>('upgrade');
  const [selectedUpgradeItem, setSelectedUpgradeItem] = useState<EquipmentItem | null>(preselectedItem || null);
  const [upgradeOutcome, setUpgradeOutcome] = useState<{ status: 'success' | 'fail' | null; message: string }>({
    status: null,
    message: '',
  });

  // Fusion state: 3 items of same rarity
  const [selectedFusionItems, setSelectedFusionItems] = useState<EquipmentItem[]>([]);
  const [fusionResult, setFusionResult] = useState<EquipmentItem | null>(null);

  // Pool of all available items (equipped + backpack)
  const allItems: EquipmentItem[] = [
    ...Object.values(equipped).filter((i): i is EquipmentItem => Boolean(i)),
    ...inventory,
  ];

  // --- UPGRADE LOGIC ---
  const handleUpgrade = () => {
    if (!selectedUpgradeItem) return;
    const info = getUpgradeInfo(selectedUpgradeItem);
    if (info.isMax) return;

    if (coins < info.coinCost || shards < info.shardCost) {
      setUpgradeOutcome({ status: 'fail', message: 'Недостаточно золота или осколков!' });
      return;
    }

    const spent = onSpendCurrencies(info.coinCost, info.shardCost);
    if (!spent) return;

    // Roll success
    const roll = Math.random() * 100;
    const isSuccess = roll < info.successChance;

    if (isSuccess) {
      sound.playUpgradeSuccess();
      const updated: EquipmentItem = {
        ...selectedUpgradeItem,
        level: selectedUpgradeItem.level + 1,
      };
      onUpdateItem(updated);
      setSelectedUpgradeItem(updated);
      setUpgradeOutcome({
        status: 'success',
        message: `УСПЕХ! ${updated.name} теперь +${updated.level}!`,
      });

      if (updated.level >= 5) {
        confetti({ particleCount: 30, spread: 60 });
      }
    } else {
      sound.playUpgradeFail();
      // Risk factor: if level > 6, chance to drop by 1 level on failure!
      let newLevel = selectedUpgradeItem.level;
      let penaltyMsg = 'Уровень остался прежним.';
      if (selectedUpgradeItem.level >= 7 && Math.random() < 0.4) {
        newLevel = Math.max(0, selectedUpgradeItem.level - 1);
        penaltyMsg = 'Неудача! Предмет треснул и потерял 1 уровень заточки!';
      }
      const updated: EquipmentItem = {
        ...selectedUpgradeItem,
        level: newLevel,
      };
      onUpdateItem(updated);
      setSelectedUpgradeItem(updated);
      setUpgradeOutcome({
        status: 'fail',
        message: `ПРОВАЛ (${info.successChance}% шанс). ${penaltyMsg}`,
      });
    }
  };

  // --- FUSION / CRAFT LOGIC ---
  const toggleFusionSelect = (item: EquipmentItem) => {
    const isAlready = selectedFusionItems.some(i => i.id === item.id);
    if (isAlready) {
      setSelectedFusionItems(selectedFusionItems.filter(i => i.id !== item.id));
      return;
    }

    // Must be same rarity
    if (selectedFusionItems.length > 0) {
      const targetRarity = selectedFusionItems[0].rarity;
      if (item.rarity !== targetRarity) return;
    }

    if (selectedFusionItems.length < 3) {
      setSelectedFusionItems([...selectedFusionItems, item]);
    }
  };

  const handleSynthesize = () => {
    if (selectedFusionItems.length !== 3) return;
    const baseRarity = selectedFusionItems[0].rarity;
    
    // Determine next rarity
    const rarityTiers: Rarity[] = ['common', 'uncommon', 'rare', 'epic', 'gold', 'mythic'];
    const currentIdx = rarityTiers.indexOf(baseRarity);
    if (currentIdx === -1) return;

    let targetRarity: Rarity;
    if (baseRarity === 'mythic') {
      // 3 Mythics reforge into 1 new random Mythic item
      targetRarity = 'mythic';
    } else {
      targetRarity = rarityTiers[currentIdx + 1];
    }

    // Remove the 3 items
    selectedFusionItems.forEach(item => {
      onRemoveItem(item.id);
    });

    // Generate new item of next rarity or new mythic
    const craftedItem = generateRandomItem(undefined, targetRarity);
    onAddItem(craftedItem);
    setSelectedFusionItems([]);
    setFusionResult(craftedItem);
    sound.playLootFanfare(targetRarity);
    confetti({
      particleCount: targetRarity === 'mythic' ? 120 : 60,
      spread: 70,
      origin: { y: 0.6 },
    });
  };

  // --- REFORGE STATS LOGIC ---
  const handleReforge = () => {
    if (!selectedUpgradeItem) return;
    const cost = REFORGE_COSTS[selectedUpgradeItem.rarity] || { shards: 1, gems: 0, label: '1 💠' };

    if (cost.shards > 0 && shards < cost.shards) {
      setUpgradeOutcome({
        status: 'fail',
        message: `Недостаточно осколков! Требуется ${cost.label}`,
      });
      return;
    }

    if (cost.gems > 0 && gems < cost.gems) {
      setUpgradeOutcome({
        status: 'fail',
        message: `Недостаточно кристаллов! Требуется ${cost.label}`,
      });
      return;
    }

    const spent = onSpendCurrencies(0, cost.shards, cost.gems);
    if (!spent) return;

    sound.playSlash();
    // Generate new random stats of the same rarity tier (strictly 2 or 3 stats!)
    const freshSample = generateRandomItem(selectedUpgradeItem.slot, selectedUpgradeItem.rarity);
    const updated: EquipmentItem = {
      ...selectedUpgradeItem,
      stats: freshSample.stats,
    };
    onUpdateItem(updated);
    setSelectedUpgradeItem(updated);
    setUpgradeOutcome({
      status: 'success',
      message: `Статы предмета ${updated.name} успешно перекованы (${cost.label})!`,
    });
  };

  return (
    <div className="space-y-4">
      {/* Sub tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-xl">
        <button
          onClick={() => setActiveTab('upgrade')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'upgrade'
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Hammer className="w-3.5 h-3.5" />
          <span>Заточка (+Уровень)</span>
        </button>

        <button
          onClick={() => setActiveTab('craft')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'craft'
              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Синтез (3 в 1)</span>
        </button>

        <button
          onClick={() => setActiveTab('reforge')}
          className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-1.5 ${
            activeTab === 'reforge'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-stone-400 hover:text-stone-200'
          }`}
        >
          <Shuffle className="w-3.5 h-3.5" />
          <span>Перековка статов</span>
        </button>
      </div>

      {/* 1. UPGRADE TAB */}
      {activeTab === 'upgrade' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-amber-500" />
              Наковальня Заточки
            </h3>
            <span className="text-[11px] text-stone-400 font-mono">
              Макс: +{selectedUpgradeItem ? RARITY_CONFIGS[selectedUpgradeItem.rarity].maxUpgrade : 15}
            </span>
          </div>

          {/* Item Selector Carousel */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-stone-400">Выберите предмет для заточки:</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {allItems.map(item => {
                const isSelected = selectedUpgradeItem?.id === item.id;
                const rConf = RARITY_CONFIGS[item.rarity];
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedUpgradeItem(item);
                      setUpgradeOutcome({ status: null, message: '' });
                    }}
                    className={`relative shrink-0 flex flex-col items-center justify-center p-2 rounded-lg border text-center w-16 h-16 transition-all ${
                      rConf.bgClass
                    } ${rConf.borderClass} ${isSelected ? 'ring-2 ring-amber-400 scale-105' : 'opacity-80 hover:opacity-100'}`}
                  >
                    <ItemPixelIcon item={item} size={28} />
                    <span className="text-[9px] font-bold text-stone-200 truncate w-full px-0.5">
                      {item.name}
                    </span>
                    {item.level > 0 && (
                      <span className="absolute top-1 right-1 text-[8px] font-mono text-amber-300 bg-black/80 px-1 rounded">
                        +{item.level}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Item Enhancement Panel */}
          {selectedUpgradeItem ? (
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <ItemPixelIcon item={selectedUpgradeItem} size={48} />
                  <div>
                    <h4 className="font-bold text-sm text-stone-100">
                      {selectedUpgradeItem.name}{' '}
                      <span className="text-amber-400 font-mono">+{selectedUpgradeItem.level}</span>
                    </h4>
                    <span
                      className="text-[11px] font-bold uppercase"
                      style={{ color: RARITY_CONFIGS[selectedUpgradeItem.rarity].color }}
                    >
                      {RARITY_CONFIGS[selectedUpgradeItem.rarity].name}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs text-stone-400">Шанс успеха:</span>
                  <div
                    className={`font-mono font-bold text-sm ${
                      getUpgradeInfo(selectedUpgradeItem).successChance >= 70
                        ? 'text-emerald-400'
                        : getUpgradeInfo(selectedUpgradeItem).successChance >= 40
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {getUpgradeInfo(selectedUpgradeItem).isMax
                      ? 'МАКС'
                      : `${getUpgradeInfo(selectedUpgradeItem).successChance}%`}
                  </div>
                </div>
              </div>

              {/* Stat Comparison (Current -> Next Level) */}
              <div className="bg-stone-900/60 p-3 rounded-lg border border-stone-800 space-y-1.5 text-xs font-mono">
                <div className="text-[11px] text-stone-400 font-sans font-semibold">
                  Прирост характеристик (+12% за уровень):
                </div>
                {(() => {
                  const currentStats = getUpgradedItemStats(selectedUpgradeItem);
                  const nextItem: EquipmentItem = {
                    ...selectedUpgradeItem,
                    level: selectedUpgradeItem.level + 1,
                  };
                  const nextStats = getUpgradedItemStats(nextItem);

                  return Object.entries(currentStats).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-stone-400 capitalize">{key}:</span>
                      <div className="flex items-center gap-2">
                        <span className="text-stone-300">+{val}</span>
                        <span className="text-stone-500">→</span>
                        <span className="text-emerald-400 font-bold">
                          +{nextStats[key as keyof typeof nextStats]}
                        </span>
                      </div>
                    </div>
                  ));
                })()}
              </div>

              {/* Upgrade outcome alert */}
              {upgradeOutcome.status && (
                <div
                  className={`p-2.5 rounded-lg border text-xs font-medium flex items-center gap-2 ${
                    upgradeOutcome.status === 'success'
                      ? 'bg-emerald-950/60 border-emerald-700 text-emerald-200'
                      : 'bg-rose-950/60 border-rose-700 text-rose-200'
                  }`}
                >
                  {upgradeOutcome.status === 'success' ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span>{upgradeOutcome.message}</span>
                </div>
              )}

              {/* Upgrade Button & Costs */}
              {(() => {
                const info = getUpgradeInfo(selectedUpgradeItem);
                if (info.isMax) {
                  return (
                    <div className="p-3 bg-stone-900 rounded-lg text-center text-xs font-bold text-amber-400">
                      Предмет достиг максимального уровня заточки!
                    </div>
                  );
                }

                const canAfford = coins >= info.coinCost && shards >= info.shardCost;

                return (
                  <button
                    onClick={handleUpgrade}
                    disabled={!canAfford}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-stone-950 shadow-lg cursor-pointer active:scale-98'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <Hammer className="w-4 h-4" />
                    <span>
                      Заточить за {info.coinCost.toLocaleString()}🪙 и {info.shardCost}💠
                    </span>
                  </button>
                );
              })()}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-500">
              Выберите предмет сверху для улучшения в наковальне
            </div>
          )}
        </div>
      )}

      {/* 2. SYNTHESIS / CRAFT TAB */}
      {activeTab === 'craft' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Алхимический Синтез (3 в 1)
            </h3>
            <span className="text-[11px] text-stone-400">
              {selectedFusionItems.length}/3 выбрано
            </span>
          </div>

          <p className="text-xs text-stone-400 leading-relaxed">
            Пожертвуйте 3 предмета одной редкости, чтобы гарантированно сковать{' '}
            <strong className="text-amber-300">новый случайный предмет следующей редкости</strong> (3 Мифика перековываются в{' '}
            <strong className="text-rose-400">1 новый случайный Мифик</strong>)!
          </p>

          {/* 3 Selected slots */}
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map(idx => {
              const item = selectedFusionItems[idx];
              return (
                <div
                  key={idx}
                  onClick={() => item && toggleFusionSelect(item)}
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center p-2 text-center transition-all ${
                    item
                      ? `${RARITY_CONFIGS[item.rarity].bgClass} ${RARITY_CONFIGS[item.rarity].borderClass} cursor-pointer hover:border-rose-400`
                      : 'bg-stone-950/60 border-stone-800 border-dashed text-stone-600'
                  }`}
                >
                  {item ? (
                    <>
                      <ItemPixelIcon item={item} size={36} />
                      <span className="text-[10px] font-bold text-stone-200 truncate w-full mt-1">
                        {item.name}
                      </span>
                      <span className="text-[9px] text-rose-400 mt-0.5">Убрать</span>
                    </>
                  ) : (
                    <>
                      <span className="text-xl opacity-30">+</span>
                      <span className="text-[10px]">Слот {idx + 1}</span>
                    </>
                  )}
                </div>
              );
            })}
          </div>

          {/* Craft Button */}
          {(() => {
            const isMythicFusion = selectedFusionItems.length > 0 && selectedFusionItems[0].rarity === 'mythic';
            const isReady = selectedFusionItems.length === 3;

            return (
              <button
                onClick={handleSynthesize}
                disabled={!isReady}
                className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                  isReady
                    ? isMythicFusion
                      ? 'bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-lg cursor-pointer active:scale-98'
                      : 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg cursor-pointer active:scale-98'
                    : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span>
                  {isMythicFusion
                    ? 'Перековать 3 Мифика в 1 случайный Мифик'
                    : 'Сковать предмет высшей редкости'}
                </span>
              </button>
            );
          })()}

          {/* Available inventory items for fusion */}
          <div className="space-y-1.5 pt-2">
            <div className="text-[11px] font-semibold text-stone-400">
              Доступные предметы для синтеза:
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {inventory.map(item => {
                const isSelected = selectedFusionItems.some(i => i.id === item.id);
                const rConf = RARITY_CONFIGS[item.rarity];
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleFusionSelect(item)}
                    className={`relative p-2 rounded-lg border aspect-square flex flex-col items-center justify-center text-center transition-all ${
                      rConf.bgClass
                    } ${rConf.borderClass} ${isSelected ? 'ring-2 ring-purple-400 opacity-40' : 'hover:scale-102'}`}
                  >
                    <ItemPixelIcon item={item} size={28} />
                    <span className="text-[9px] font-bold text-stone-200 truncate w-full">
                      {item.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 3. REFORGE STATS TAB */}
      {activeTab === 'reforge' && (
        <div className="bg-stone-900 border border-stone-800 rounded-xl p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
              <Shuffle className="w-4 h-4 text-cyan-500" />
              Перековка Статов
            </h3>
            {selectedUpgradeItem && (
              <span className="text-[11px] text-stone-300 font-mono bg-stone-950 px-2 py-0.5 rounded border border-stone-800">
                Цена: <strong className="text-cyan-400">{REFORGE_COSTS[selectedUpgradeItem.rarity].label}</strong>
              </span>
            )}
          </div>

          <p className="text-xs text-stone-400">
            Перероллить 2-3 характеристики предмета случайным образом, сохраняя его редкость и уровень заточки.
          </p>

          {/* Pricing table legend */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-2 bg-stone-950/80 rounded-lg border border-stone-800 text-[10px] font-mono text-center">
            <div>
              <span className="text-stone-400 block font-sans">Обычный</span>
              <span className="text-stone-200 font-bold">1 💠</span>
            </div>
            <div>
              <span className="text-emerald-400 block font-sans">Необычный</span>
              <span className="text-stone-200 font-bold">3 💠</span>
            </div>
            <div>
              <span className="text-sky-400 block font-sans">Редкий</span>
              <span className="text-stone-200 font-bold">10 💠</span>
            </div>
            <div>
              <span className="text-purple-400 block font-sans">Эпик</span>
              <span className="text-stone-200 font-bold">50 💠</span>
            </div>
            <div>
              <span className="text-amber-400 block font-sans">Голда</span>
              <span className="text-amber-300 font-bold">20 💎</span>
            </div>
            <div>
              <span className="text-rose-400 block font-sans">Мифик</span>
              <span className="text-rose-300 font-bold">50 💎</span>
            </div>
          </div>

          {/* Item Selector Carousel */}
          <div className="space-y-1.5">
            <label className="text-[11px] text-stone-400">Выберите предмет для перековки:</label>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {allItems.map(item => {
                const isSelected = selectedUpgradeItem?.id === item.id;
                const rConf = RARITY_CONFIGS[item.rarity];
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedUpgradeItem(item);
                      setUpgradeOutcome({ status: null, message: '' });
                    }}
                    className={`relative shrink-0 flex flex-col items-center justify-center p-2 rounded-lg border text-center w-16 h-16 transition-all ${
                      rConf.bgClass
                    } ${rConf.borderClass} ${isSelected ? 'ring-2 ring-cyan-400 scale-105' : 'opacity-80 hover:opacity-100'}`}
                  >
                    <ItemPixelIcon item={item} size={28} />
                    <span className="text-[9px] font-bold text-stone-200 truncate w-full px-0.5">
                      {item.name}
                    </span>
                    {item.level > 0 && (
                      <span className="absolute top-1 right-1 text-[8px] bg-black/80 px-1 rounded text-amber-300 font-mono">
                        +{item.level}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {selectedUpgradeItem ? (
            <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-3">
              <div className="flex items-center gap-3">
                <div
                  className={`p-2.5 rounded-xl border flex items-center justify-center ${
                    RARITY_CONFIGS[selectedUpgradeItem.rarity].bgClass
                  } ${RARITY_CONFIGS[selectedUpgradeItem.rarity].borderClass}`}
                >
                  <ItemPixelIcon item={selectedUpgradeItem} size={36} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-100 flex items-center gap-1.5">
                    <span>{selectedUpgradeItem.name}</span>
                    {selectedUpgradeItem.level > 0 && (
                      <span className="text-amber-400 text-xs font-mono font-bold">
                        +{selectedUpgradeItem.level}
                      </span>
                    )}
                  </h4>
                  <span
                    className="text-[11px] font-bold uppercase"
                    style={{ color: RARITY_CONFIGS[selectedUpgradeItem.rarity].color }}
                  >
                    {RARITY_CONFIGS[selectedUpgradeItem.rarity].name}
                  </span>
                </div>
              </div>

              {/* Current stats */}
              <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800 space-y-1 text-xs font-mono">
                <div className="text-[10px] text-stone-400 font-sans">Текущие статы:</div>
                {Object.entries(selectedUpgradeItem.stats).map(([k, v]) => (
                  <div key={k} className="flex justify-between text-stone-300">
                    <span className="capitalize">{k}:</span>
                    <span className="text-cyan-400 font-bold">+{v}</span>
                  </div>
                ))}
              </div>

              {(() => {
                const cost = REFORGE_COSTS[selectedUpgradeItem.rarity] || { shards: 1, gems: 0, label: '1 💠' };
                const hasEnough =
                  (cost.shards === 0 || shards >= cost.shards) &&
                  (cost.gems === 0 || gems >= cost.gems);

                return (
                  <button
                    onClick={handleReforge}
                    disabled={!hasEnough}
                    className={`w-full py-2.5 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition-all ${
                      hasEnough
                        ? 'bg-cyan-600 hover:bg-cyan-500 text-white cursor-pointer shadow-lg active:scale-98'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <Shuffle className="w-4 h-4" />
                    <span>Перековать статы ({cost.label})</span>
                  </button>
                );
              })()}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-500">
              Выберите предмет выше, чтобы перековать его характеристики
            </div>
          )}
        </div>
      )}

      {/* Fusion Result Modal */}
      {fusionResult && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-5 max-w-sm w-full space-y-4 shadow-2xl text-center relative">
            <div className="text-center space-y-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                {fusionResult.rarity === 'mythic' ? '✨ Мифическая перековка завершена!' : '🎉 Синтез успешно завершен!'}
              </span>
              <h3 className="font-extrabold text-base text-stone-100 flex items-center justify-center gap-2">
                <span>{fusionResult.name}</span>
              </h3>
            </div>

            <div
              className={`p-4 rounded-xl border flex flex-col items-center justify-center mx-auto w-24 h-24 ${
                RARITY_CONFIGS[fusionResult.rarity].bgClass
              } ${RARITY_CONFIGS[fusionResult.rarity].borderClass} shadow-xl`}
            >
              <ItemPixelIcon item={fusionResult} size={56} />
            </div>

            <div className="space-y-1">
              <span
                className="font-bold uppercase tracking-wider text-xs"
                style={{ color: RARITY_CONFIGS[fusionResult.rarity].color }}
              >
                {RARITY_CONFIGS[fusionResult.rarity].name}
              </span>
              <p className="text-xs text-stone-400 italic">
                "{fusionResult.description}"
              </p>
            </div>

            {/* Stats */}
            <div className="bg-stone-950 p-3 rounded-lg border border-stone-800 space-y-1 text-xs font-mono text-left">
              {Object.entries(fusionResult.stats).map(([k, val]) => (
                <div key={k} className="flex justify-between items-center text-stone-300">
                  <span className="capitalize">{k}:</span>
                  <span className="font-bold text-emerald-400">+{val}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setFusionResult(null)}
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 font-extrabold text-xs rounded-lg shadow-lg cursor-pointer transition-all active:scale-98"
            >
              Забрать в инвентарь
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
