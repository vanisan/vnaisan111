import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  EquipmentItem,
  Monster,
  PlayerProgress,
  SlotType,
  TapUpgrade,
} from './types/game';
import {
  calculateHeroStats,
  getInitialGameState,
  loadSavedGameState,
  SavedGameState,
  saveGameState,
} from './utils/storage';
import { generateMonster } from './data/monsters';
import { getUpgradeCost } from './data/upgrades';
import { sound } from './utils/audio';

import { TopBar } from './components/TopBar';
import { PixelHeroCanvas } from './components/PixelHeroCanvas';
import { CombatHUD } from './components/CombatHUD';
import { InventoryView } from './components/InventoryView';
import { ForgeView } from './components/ForgeView';
import { LootboxView } from './components/LootboxView';
import { UpgradesView } from './components/UpgradesView';
import { StatsModal } from './components/StatsModal';
import { Shield, Hammer, PackageOpen, Zap } from 'lucide-react';

type NavTab = 'inventory' | 'forge' | 'lootbox' | 'upgrades';

export default function App() {
  const [gameState, setGameState] = useState<SavedGameState>(() => loadSavedGameState());
  const [activeTab, setActiveTab] = useState<NavTab>('inventory');
  const [preselectedForgeItem, setPreselectedForgeItem] = useState<EquipmentItem | null>(null);
  const [showStatsModal, setShowStatsModal] = useState<boolean>(false);

  // Combat runtime state
  const [currentMonster, setCurrentMonster] = useState<Monster | null>(null);
  const [heroHp, setHeroHp] = useState<number>(120);
  const [isHeroDead, setIsHeroDead] = useState<boolean>(false);

  // Compute calculated hero stats
  const { stats: heroStats } = useMemo(() => {
    return calculateHeroStats(gameState.equipped, gameState.upgrades);
  }, [gameState.equipped, gameState.upgrades]);

  // Keep hero HP in sync with max HP
  useEffect(() => {
    setHeroHp(prev => Math.min(heroStats.maxHp, prev));
  }, [heroStats.maxHp]);

  // Autosave periodically
  useEffect(() => {
    const timer = setInterval(() => {
      saveGameState(gameState);
    }, 4000);
    return () => clearInterval(timer);
  }, [gameState]);

  // Spawn monster if none exists
  useEffect(() => {
    if (!currentMonster && !isHeroDead) {
      const mob = generateMonster(gameState.progress.stage, gameState.progress.subStage);
      setCurrentMonster(mob);
    }
  }, [currentMonster, isHeroDead, gameState.progress.stage, gameState.progress.subStage]);

  // Passive gold generation loop (1 second tick)
  useEffect(() => {
    const interval = setInterval(() => {
      if (heroStats.passiveGoldPerSec > 0) {
        setGameState(prev => ({
          ...prev,
          progress: {
            ...prev.progress,
            coins: prev.progress.coins + heroStats.passiveGoldPerSec,
          },
        }));
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [heroStats.passiveGoldPerSec]);

  // Handle tap on canvas
  const handleTapCoin = useCallback(
    (isCrit: boolean) => {
      const goldEarned = isCrit ? heroStats.goldPerTap * 5 : heroStats.goldPerTap;
      setGameState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          coins: prev.progress.coins + goldEarned,
          totalTaps: prev.progress.totalTaps + 1,
        },
      }));
    },
    [heroStats.goldPerTap]
  );

  // Handle monster defeat
  const handleMonsterDefeated = useCallback(
    (mob: Monster) => {
      sound.playCoin();
      const isBoss = mob.type === 'boss';

      if (isBoss) {
        sound.playBossDefeat();
      }

      setGameState(prev => {
        const nextSub = prev.progress.subStage >= 10 ? 1 : prev.progress.subStage + 1;
        const nextStage = prev.progress.subStage >= 10 ? prev.progress.stage + 1 : prev.progress.stage;

        // Reward for bosses: stage 1 -> 1 crystal; further stages -> Math.max(1, Math.round(prev.progress.stage / 5))
        const bossGemsReward = isBoss
          ? (prev.progress.stage === 1 ? 1 : Math.max(1, Math.round(prev.progress.stage / 5)))
          : 0;

        return {
          ...prev,
          progress: {
            ...prev.progress,
            coins: prev.progress.coins + mob.goldReward,
            shards: prev.progress.shards + mob.shardReward,
            gems: prev.progress.gems + bossGemsReward,
            stage: prev.progress.isAutoAdvancing ? nextStage : prev.progress.stage,
            subStage: prev.progress.isAutoAdvancing ? nextSub : prev.progress.subStage,
            highestStage: Math.max(prev.progress.highestStage, nextStage),
            monstersSlain: prev.progress.monstersSlain + 1,
            bossesSlain: prev.progress.bossesSlain + (isBoss ? 1 : 0),
          },
        };
      });

      // Clear defeated monster; spawn new one after brief delay
      setCurrentMonster(null);
    },
    []
  );

  // Handle damage dealt to monster
  const handleMonsterDamage = useCallback(
    (damage: number) => {
      setCurrentMonster(prev => {
        if (!prev) return null;
        const newHp = prev.currentHp - damage;
        if (newHp <= 0) {
          handleMonsterDefeated(prev);
          return null;
        }
        return { ...prev, currentHp: newHp };
      });
    },
    [handleMonsterDefeated]
  );

  // Handle damage taken by hero
  const handleHeroDamage = useCallback(
    (damage: number) => {
      setHeroHp(prev => {
        const nextHp = prev - damage;
        if (nextHp <= 0) {
          setIsHeroDead(true);
          sound.playUpgradeFail();
          return 0;
        }
        return nextHp;
      });
    },
    []
  );

  // Hero Respawn / Retreat
  const handleRespawn = useCallback(() => {
    setIsHeroDead(false);
    setHeroHp(heroStats.maxHp);
    // Pause auto-advance so player can farm or retreat to stage 1 if boss is too hard
    setGameState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        isAutoAdvancing: false,
        subStage: Math.max(1, prev.progress.subStage - 1),
      },
    }));
    setCurrentMonster(null);
  }, [heroStats.maxHp]);

  // Toggle Auto-Advance vs Farming
  const handleToggleAutoAdvance = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      progress: {
        ...prev.progress,
        isAutoAdvancing: !prev.progress.isAutoAdvancing,
      },
    }));
  }, []);

  // Currency deduction helper
  const handleSpendCurrencies = useCallback(
    (coins: number, shards: number, gems: number = 0): boolean => {
      if (
        gameState.progress.coins < coins ||
        gameState.progress.shards < shards ||
        gameState.progress.gems < gems
      ) {
        return false;
      }
      setGameState(prev => ({
        ...prev,
        progress: {
          ...prev.progress,
          coins: prev.progress.coins - coins,
          shards: prev.progress.shards - shards,
          gems: prev.progress.gems - gems,
        },
      }));
      return true;
    },
    [gameState.progress]
  );

  // Inventory actions
  const handleEquip = useCallback((item: EquipmentItem) => {
    setGameState(prev => {
      const currentEquipped = prev.equipped[item.slot];
      const newInventory = prev.inventory.filter(i => i.id !== item.id);
      if (currentEquipped) {
        newInventory.push(currentEquipped);
      }
      return {
        ...prev,
        equipped: {
          ...prev.equipped,
          [item.slot]: item,
        },
        inventory: newInventory,
      };
    });
  }, []);

  const handleUnequip = useCallback((slot: SlotType) => {
    setGameState(prev => {
      const item = prev.equipped[slot];
      if (!item) return prev;
      const newEquipped = { ...prev.equipped };
      delete newEquipped[slot];
      return {
        ...prev,
        equipped: newEquipped,
        inventory: [...prev.inventory, item],
      };
    });
  }, []);

  const handleDismantle = useCallback((item: EquipmentItem) => {
    // Reward gold and shards
    const rarityMultiplier =
      item.rarity === 'mythic' ? 50 : item.rarity === 'gold' ? 20 : item.rarity === 'epic' ? 8 : 2;
    const coinsReward = Math.round(50 * rarityMultiplier + item.level * 100);
    const shardsReward = Math.max(1, Math.round(rarityMultiplier * 0.5 + item.level));

    setGameState(prev => {
      const newInventory = prev.inventory.filter(i => i.id !== item.id);
      const newEquipped = { ...prev.equipped };
      if (newEquipped[item.slot]?.id === item.id) {
        delete newEquipped[item.slot];
      }
      return {
        ...prev,
        inventory: newInventory,
        equipped: newEquipped,
        progress: {
          ...prev.progress,
          coins: prev.progress.coins + coinsReward,
          shards: prev.progress.shards + shardsReward,
        },
      };
    });
  }, []);

  const handleUpdateItem = useCallback((updatedItem: EquipmentItem) => {
    setGameState(prev => {
      const isEquipped = prev.equipped[updatedItem.slot]?.id === updatedItem.id;
      if (isEquipped) {
        return {
          ...prev,
          equipped: {
            ...prev.equipped,
            [updatedItem.slot]: updatedItem,
          },
        };
      } else {
        return {
          ...prev,
          inventory: prev.inventory.map(i => (i.id === updatedItem.id ? updatedItem : i)),
        };
      }
    });
  }, []);

  const handleRemoveItem = useCallback((itemId: string) => {
    setGameState(prev => ({
      ...prev,
      inventory: prev.inventory.filter(i => i.id !== itemId),
    }));
  }, []);

  const handleAddItem = useCallback((newItem: EquipmentItem) => {
    setGameState(prev => ({
      ...prev,
      inventory: [newItem, ...prev.inventory],
    }));
  }, []);

  // Buy tap upgrade
  const handleBuyUpgrade = useCallback((upgradeId: string) => {
    setGameState(prev => {
      const upgrade = prev.upgrades.find(u => u.id === upgradeId);
      if (!upgrade) return prev;
      const cost = getUpgradeCost(upgrade);
      if (prev.progress.coins < cost) return prev;

      return {
        ...prev,
        progress: {
          ...prev.progress,
          coins: prev.progress.coins - cost,
        },
        upgrades: prev.upgrades.map(u => (u.id === upgradeId ? { ...u, level: u.level + 1 } : u)),
      };
    });
  }, []);

  // Reset entire game
  const handleResetGame = useCallback(() => {
    const initial = getInitialGameState();
    setGameState(initial);
    saveGameState(initial);
    setHeroHp(120);
    setIsHeroDead(false);
    setCurrentMonster(null);
  }, []);

  return (
    <div className="min-h-screen bg-stone-950 text-stone-100 flex flex-col font-sans selection:bg-amber-500/30">
      {/* 1. Header Top Bar */}
      <TopBar
        coins={gameState.progress.coins}
        shards={gameState.progress.shards}
        gems={gameState.progress.gems}
        onResetGame={handleResetGame}
        onOpenStats={() => setShowStatsModal(true)}
      />

      {/* Main Container: Mobile-first responsive wrapper */}
      <main className="flex-1 w-full max-w-xl mx-auto px-3 sm:px-4 py-3 sm:py-4 space-y-3.5">
        {/* 2. Pixel Engine Canvas (Indie Animated 2D Hero & Dungeon) */}
        <PixelHeroCanvas
          heroStats={heroStats}
          equipped={gameState.equipped}
          currentMonster={currentMonster}
          onTapCoin={handleTapCoin}
          onMonsterDamage={handleMonsterDamage}
          onHeroDamage={handleHeroDamage}
          heroCurrentHp={heroHp}
          stage={gameState.progress.stage}
          subStage={gameState.progress.subStage}
        />

        {/* 3. Stage & Health Combat HUD */}
        <CombatHUD
          stage={gameState.progress.stage}
          subStage={gameState.progress.subStage}
          heroStats={heroStats}
          heroHp={heroHp}
          currentMonster={currentMonster}
          isAutoAdvancing={gameState.progress.isAutoAdvancing}
          onToggleAutoAdvance={handleToggleAutoAdvance}
          isHeroDead={isHeroDead}
          onRespawn={handleRespawn}
        />

        {/* 4. Tab Navigation (Thumb-friendly mobile tabs) */}
        <nav className="flex items-center gap-1.5 p-1 bg-stone-900 border border-stone-800 rounded-xl">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'inventory'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Снаряжение</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('forge');
              setPreselectedForgeItem(null);
            }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'forge'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Hammer className="w-3.5 h-3.5" />
            <span>Кузница</span>
          </button>

          <button
            onClick={() => setActiveTab('lootbox')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 relative ${
              activeTab === 'lootbox'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <PackageOpen className="w-3.5 h-3.5" />
            <span>Лудка</span>
            <span className="hidden sm:inline absolute -top-1 -right-1 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
            </span>
          </button>

          <button
            onClick={() => setActiveTab('upgrades')}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex flex-col sm:flex-row items-center justify-center gap-1 ${
              activeTab === 'upgrades'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs'
                : 'text-stone-400 hover:text-stone-200'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Прокачка</span>
          </button>
        </nav>

        {/* 5. Active Tab Content Panels */}
        {activeTab === 'inventory' && (
          <InventoryView
            equipped={gameState.equipped}
            inventory={gameState.inventory}
            onEquip={handleEquip}
            onUnequip={handleUnequip}
            onDismantle={handleDismantle}
            onOpenForgeWithItem={item => {
              setPreselectedForgeItem(item);
              setActiveTab('forge');
            }}
          />
        )}

        {activeTab === 'forge' && (
          <ForgeView
            inventory={gameState.inventory}
            equipped={gameState.equipped}
            coins={gameState.progress.coins}
            shards={gameState.progress.shards}
            gems={gameState.progress.gems}
            onUpdateItem={handleUpdateItem}
            onRemoveItem={handleRemoveItem}
            onAddItem={handleAddItem}
            onSpendCurrencies={handleSpendCurrencies}
            preselectedItem={preselectedForgeItem}
          />
        )}

        {activeTab === 'lootbox' && (
          <LootboxView
            coins={gameState.progress.coins}
            gems={gameState.progress.gems}
            isTripleBuyUnlocked={gameState.progress.isChestTripleBuyUnlocked ?? false}
            onUnlockTripleBuy={() =>
              setGameState(prev => ({
                ...prev,
                progress: { ...prev.progress, isChestTripleBuyUnlocked: true },
              }))
            }
            onSpendCurrencies={handleSpendCurrencies}
            onAddItem={handleAddItem}
            onEquipItem={handleEquip}
            onAddCoins={amt =>
              setGameState(prev => ({
                ...prev,
                progress: { ...prev.progress, coins: prev.progress.coins + amt },
              }))
            }
            onAddShards={amt =>
              setGameState(prev => ({
                ...prev,
                progress: { ...prev.progress, shards: prev.progress.shards + amt },
              }))
            }
          />
        )}

        {activeTab === 'upgrades' && (
          <UpgradesView
            upgrades={gameState.upgrades}
            coins={gameState.progress.coins}
            onBuyUpgrade={handleBuyUpgrade}
          />
        )}
      </main>

      {/* 6. Stats Breakdown Modal */}
      {showStatsModal && (
        <StatsModal
          heroStats={heroStats}
          equipped={gameState.equipped}
          onClose={() => setShowStatsModal(false)}
          stage={gameState.progress.stage}
          monstersSlain={gameState.progress.monstersSlain}
          bossesSlain={gameState.progress.bossesSlain}
        />
      )}
    </div>
  );
}
