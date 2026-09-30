import React, { useState } from 'react';
import { EquipmentItem, SlotType, Rarity, ItemStats, WEAPON_TYPE_INFO, WeaponType } from '../types/game';
import { SLOT_INFO, RARITY_CONFIGS, getUpgradedItemStats, getDismantleReward } from '../data/items';
import { EQUIPMENT_SETS } from '../data/sets';
import { Shield, Sparkles, Trash2, ArrowUpRight, Check, X } from 'lucide-react';
import { sound } from '../utils/audio';
import { ItemPixelIcon } from './ItemPixelIcon';

interface InventoryViewProps {
  equipped: Partial<Record<SlotType, EquipmentItem>>;
  inventory: EquipmentItem[];
  onEquip: (item: EquipmentItem) => void;
  onUnequip: (slot: SlotType) => void;
  onDismantle: (item: EquipmentItem) => void;
  onOpenForgeWithItem: (item: EquipmentItem) => void;
}

const STAT_NAMES: Record<string, { label: string; icon: string; suffix: string }> = {
  hp: { label: 'Здоровье', icon: '❤️', suffix: ' HP' },
  def: { label: 'Защита', icon: '🛡️', suffix: ' DEF' },
  atk: { label: 'Атака', icon: '⚔️', suffix: ' ATK' },
  critChance: { label: 'Крит шанс', icon: '🎯', suffix: '%' },
  critDmg: { label: 'Крит урон', icon: '💥', suffix: '%' },
  atkSpeed: { label: 'Скор. атаки', icon: '⚡', suffix: '%' },
};

export const InventoryView: React.FC<InventoryViewProps> = ({
  equipped,
  inventory,
  onEquip,
  onUnequip,
  onDismantle,
  onOpenForgeWithItem,
}) => {
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | null>(null);
  const [filterSlot, setFilterSlot] = useState<SlotType | 'all'>('all');
  const [filterRarity, setFilterRarity] = useState<Rarity | 'all'>('all');

  const slots: SlotType[] = ['head', 'body', 'weapon', 'legs', 'artifact', 'pet'];

  // Count active sets strictly respecting required set rarities
  const setCountMap: Record<string, number> = {};
  Object.values(equipped).forEach(item => {
    if (item && item.setId && EQUIPMENT_SETS[item.setId]) {
      if (EQUIPMENT_SETS[item.setId].requiredRarities.includes(item.rarity)) {
        setCountMap[item.setId] = (setCountMap[item.setId] || 0) + 1;
      }
    }
  });

  const filteredInventory = inventory.filter(item => {
    if (filterSlot !== 'all' && item.slot !== filterSlot) return false;
    if (filterRarity !== 'all' && item.rarity !== filterRarity) return false;
    return true;
  });

  const handleEquipClick = (item: EquipmentItem) => {
    sound.playTap();
    onEquip(item);
    setSelectedItem(null);
  };

  const handleUnequipClick = (slot: SlotType) => {
    sound.playTap();
    onUnequip(slot);
    setSelectedItem(null);
  };

  const handleDismantleClick = (item: EquipmentItem) => {
    sound.playCoin();
    onDismantle(item);
    setSelectedItem(null);
  };

  return (
    <div className="space-y-4">
      {/* 1. Six Equipped Slots Grid */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-amber-500" />
            Экипировка Героя (6 слотов)
          </h2>
          <span className="text-[11px] text-stone-400 font-mono">
            {Object.values(equipped).filter(Boolean).length}/6 надето
          </span>
        </div>

        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {slots.map(slot => {
            const item = equipped[slot];
            const info = SLOT_INFO[slot];
            const isEquipped = !!item;
            const rarityConf = item ? RARITY_CONFIGS[item.rarity] : null;

            return (
              <button
                key={slot}
                onClick={() => isEquipped && setSelectedItem(item)}
                className={`relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-center aspect-square ${
                  isEquipped && rarityConf
                    ? `${rarityConf.bgClass} ${rarityConf.borderClass} ${rarityConf.glowClass} hover:brightness-110 cursor-pointer`
                    : 'bg-stone-950/70 border-stone-800 hover:border-stone-700 cursor-default opacity-75'
                }`}
              >
                {isEquipped && item ? (
                  <>
                    <ItemPixelIcon item={item} size={38} />
                    <span className="text-[11px] font-bold text-stone-100 truncate w-full px-1 mt-1">
                      {item.name}
                    </span>
                    {item.level > 0 && (
                      <span className="absolute top-1 right-1 text-[10px] font-mono font-extrabold text-amber-300 bg-stone-900/90 px-1 rounded border border-amber-500/40">
                        +{item.level}
                      </span>
                    )}
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider mt-0.5"
                      style={{ color: rarityConf?.color }}
                    >
                      {rarityConf?.name}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-xl opacity-40">{info.icon}</span>
                    <span className="text-[10px] font-medium text-stone-500 mt-1">
                      {info.name}
                    </span>
                    <span className="text-[9px] text-stone-600 font-mono">Пусто</span>
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Active Set Bonuses Section */}
      {Object.keys(setCountMap).length > 0 && (
        <div className="bg-stone-900/80 border border-stone-800 rounded-xl p-3 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-stone-200">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>Комплекты брони (Сет-бонусы)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(setCountMap).map(([setId, count]) => {
              const setDef = EQUIPMENT_SETS[setId];
              if (!setDef) return null;
              const hasTwoBonus = count >= 2;
              const hasFourBonus = count >= 4;
              const hasSixBonus = count >= 6;

              return (
                <div
                  key={setId}
                  className={`p-2.5 rounded-lg border text-xs space-y-1.5 transition-all ${
                    hasSixBonus 
                      ? 'bg-amber-950/40 border-amber-500/60 shadow-lg shadow-amber-500/20 ring-1 ring-amber-400/40' 
                      : 'bg-stone-950/60 border-stone-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5" style={{ color: setDef.color }}>
                      {setDef.name}
                      {hasSixBonus && (
                        <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 font-mono">
                          ★ Полный Сет
                        </span>
                      )}
                    </span>
                    <span className={`font-mono text-[11px] font-bold ${count >= 6 ? 'text-amber-400' : 'text-stone-400'}`}>
                      {count}/6 шт.
                    </span>
                  </div>

                  <div className="text-[11px] space-y-0.5">
                    <div className={hasTwoBonus ? 'text-emerald-300 font-medium' : 'text-stone-500'}>
                      • (2 шт): {Object.entries(setDef.twoPieceStats).map(([k, v]) => `+${v} ${STAT_NAMES[k]?.label || k}`).join(', ')}
                    </div>
                    <div className={hasFourBonus ? 'text-emerald-300 font-medium' : 'text-stone-500'}>
                      • (4 шт): {Object.entries(setDef.fourPieceStats).map(([k, v]) => `+${v} ${STAT_NAMES[k]?.label || k}`).join(', ')}
                    </div>
                    {setDef.sixPieceStats && (
                      <div className={hasSixBonus ? 'text-amber-300 font-bold drop-shadow-sm' : 'text-stone-500'}>
                        ★ (6 шт): {Object.entries(setDef.sixPieceStats).map(([k, v]) => `+${v} ${STAT_NAMES[k]?.label || k}`).join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Backpack Inventory & Filter */}
      <div className="bg-stone-900 border border-stone-800 rounded-xl p-3.5 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-amber-400 font-sans">
            Рюкзак предметов ({inventory.length})
          </h2>

          {/* Slot filter tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setFilterSlot('all')}
              className={`px-2 py-0.5 rounded font-medium transition-colors whitespace-nowrap ${
                filterSlot === 'all'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                  : 'text-stone-400 hover:text-stone-200'
              }`}
            >
              Все
            </button>
            {slots.map(s => (
              <button
                key={s}
                onClick={() => setFilterSlot(s)}
                className={`px-2 py-0.5 rounded font-medium transition-colors whitespace-nowrap ${
                  filterSlot === s
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                {SLOT_INFO[s].name}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Item Grid */}
        {filteredInventory.length === 0 ? (
          <div className="py-8 text-center text-stone-500 text-xs space-y-1">
            <p>Рюкзак пуст</p>
            <p className="text-[11px] text-stone-600">
              Тапайте по экрану, побеждайте боссов или открывайте сундуки в разделе «ЛУДКА»!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
            {filteredInventory.map(item => {
              const rarityConf = RARITY_CONFIGS[item.rarity];
              const isSelected = selectedItem?.id === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`relative flex flex-col items-center justify-center p-2 rounded-lg border transition-all text-center aspect-square ${rarityConf.bgClass} ${rarityConf.borderClass} ${isSelected ? 'ring-2 ring-amber-400 scale-105' : 'hover:scale-102'}`}
                >
                  <ItemPixelIcon item={item} size={32} />
                  <span className="text-[10px] font-bold text-stone-200 truncate w-full px-0.5 mt-1">
                    {item.name}
                  </span>
                  {item.level > 0 && (
                    <span className="absolute top-1 right-1 text-[9px] font-mono font-bold text-amber-300 bg-stone-950/80 px-1 rounded">
                      +{item.level}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. Selected Item Modal / Details Drawer */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-stone-900 border border-stone-700 rounded-xl p-4 max-w-sm w-full space-y-3.5 shadow-2xl relative">
            <button
              onClick={() => setSelectedItem(null)}
              className="absolute top-3 right-3 text-stone-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Header */}
            <div className="flex items-start gap-3">
              <div
                className={`p-1.5 rounded-lg border aspect-square flex items-center justify-center ${
                  RARITY_CONFIGS[selectedItem.rarity].bgClass
                } ${RARITY_CONFIGS[selectedItem.rarity].borderClass}`}
              >
                <ItemPixelIcon item={selectedItem} size={52} />
              </div>
              <div className="space-y-0.5">
                <h3 className="font-bold text-sm text-stone-100 flex items-center gap-1.5">
                  <span>{selectedItem.name}</span>
                  {selectedItem.level > 0 && (
                    <span className="text-amber-400 font-mono">+{selectedItem.level}</span>
                  )}
                </h3>
                <div className="flex items-center gap-2 text-xs">
                  <span
                    className="font-bold uppercase tracking-wider text-[11px]"
                    style={{ color: RARITY_CONFIGS[selectedItem.rarity].color }}
                  >
                    {RARITY_CONFIGS[selectedItem.rarity].name}
                  </span>
                  <span className="text-stone-500">•</span>
                  <span className="text-stone-400">{SLOT_INFO[selectedItem.slot].name}</span>
                </div>
                {selectedItem.slot === 'weapon' && (() => {
                  const wType = selectedItem.weaponType || 'sword';
                  const wInfo = WEAPON_TYPE_INFO[wType];
                  return (
                    <div className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-500/30 w-fit mt-0.5">
                      <span>{wInfo.icon}</span>
                      <span>Тип: {wInfo.name} ({wInfo.bonusLabel})</span>
                    </div>
                  );
                })()}
                {selectedItem.setId && EQUIPMENT_SETS[selectedItem.setId] && EQUIPMENT_SETS[selectedItem.setId].requiredRarities.includes(selectedItem.rarity) && (
                  <div
                    className="text-[11px] font-semibold"
                    style={{ color: EQUIPMENT_SETS[selectedItem.setId].color }}
                  >
                    Сет: {EQUIPMENT_SETS[selectedItem.setId].name}
                  </div>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-xs text-stone-400 italic bg-stone-950/60 p-2 rounded border border-stone-800/80">
              "{selectedItem.description}"
            </p>

            {/* Item Stats (Strictly 2-3 stats!) */}
            <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-800 space-y-1.5">
              <div className="text-[11px] font-bold text-stone-400 uppercase tracking-wider">
                Характеристики предмета:
              </div>
              {(() => {
                const stats = getUpgradedItemStats(selectedItem);
                return Object.entries(stats).map(([k, val]) => {
                  const statDef = STAT_NAMES[k];
                  if (!statDef) return null;
                  return (
                    <div key={k} className="flex items-center justify-between text-xs font-mono">
                      <span className="text-stone-300 flex items-center gap-1.5">
                        <span>{statDef.icon}</span>
                        <span>{statDef.label}</span>
                      </span>
                      <span className="font-bold text-emerald-400">
                        +{val}
                        {statDef.suffix}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              {equipped[selectedItem.slot]?.id === selectedItem.id ? (
                <button
                  onClick={() => handleUnequipClick(selectedItem.slot)}
                  className="px-3 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <X className="w-4 h-4 text-stone-400" />
                  <span>Снять вещь</span>
                </button>
              ) : (
                <button
                  onClick={() => handleEquipClick(selectedItem)}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Check className="w-4 h-4" />
                  <span>Надеть</span>
                </button>
              )}

              <button
                onClick={() => {
                  onOpenForgeWithItem(selectedItem);
                  setSelectedItem(null);
                }}
                className="px-3 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Закалить в кузнице</span>
              </button>

              <button
                onClick={() => handleDismantleClick(selectedItem)}
                className="col-span-2 px-3 py-1.5 bg-stone-950 hover:bg-rose-950/60 text-stone-400 hover:text-rose-300 border border-stone-800 hover:border-rose-700 text-xs font-medium rounded flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>
                  Разобрать (+{getDismantleReward(selectedItem).coins}🪙 +
                  {getDismantleReward(selectedItem).shards}💠)
                </span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
