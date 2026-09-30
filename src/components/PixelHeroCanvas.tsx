import React, { useRef, useEffect, useCallback, useState } from 'react';
import { EquipmentItem, HeroStats, Monster, SlotType } from '../types/game';
import { sound } from '../utils/audio';
import {
  drawLevelBackground,
  drawDetailedHero,
  drawDetailedMonster,
  getBiomeForStage,
} from '../utils/pixelRenderer';
import { Sparkles, Flame, Eye, Compass } from 'lucide-react';

interface FloatingText {
  id: number;
  text: string;
  x: number;
  y: number;
  color: string;
  scale: number;
  opacity: number;
  vy: number;
  vx: number;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  gravity?: number;
}

interface PixelHeroCanvasProps {
  heroStats: HeroStats;
  equipped: Partial<Record<SlotType, EquipmentItem>>;
  currentMonster: Monster | null;
  onTapCoin: (isCrit: boolean, x?: number, y?: number) => void;
  onMonsterDamage: (damage: number, isCrit: boolean) => void;
  onHeroDamage: (damage: number) => void;
  heroCurrentHp: number;
  stage: number;
  subStage: number;
}

export const PixelHeroCanvas: React.FC<PixelHeroCanvasProps> = ({
  heroStats,
  equipped,
  currentMonster,
  onTapCoin,
  onMonsterDamage,
  onHeroDamage,
  heroCurrentHp,
  stage,
  subStage,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [comboCount, setComboCount] = useState<number>(0);
  const [showHeroInspect, setShowHeroInspect] = useState<boolean>(false);

  const biome = getBiomeForStage(stage);

  // Engine Animation & Physics State
  const stateRef = useRef({
    heroX: 75,
    heroY: 160,
    heroState: 'idle' as 'idle' | 'walk' | 'attack' | 'hit',
    attackTimer: 0,
    maxAttackTimer: 10,
    lastAutoAttackTime: 0,
    lastMonsterAttackTime: 0,
    stepCycle: 0,
    worldOffset: 0,
    floatingTexts: [] as FloatingText[],
    particles: [] as Particle[],
    isHeroAlive: true,
    lastTick: performance.now(),
    canvasWidth: 480,
    canvasHeight: 300,
    currentMonsterState: currentMonster,
    heroHpRatio: 1,
    shakeIntensity: 0,
    combo: 0,
    lastTapTime: 0,
    currentStage: stage,
    currentSubStage: subStage,
  });

  // Spawn floating combat texts (capped to avoid memory bloat)
  const addFloatingText = useCallback((text: string, x: number, y: number, color: string, scale = 1.0) => {
    if (stateRef.current.floatingTexts.length > 12) {
      stateRef.current.floatingTexts.shift();
    }
    stateRef.current.floatingTexts.push({
      id: Math.random(),
      text,
      x,
      y,
      color,
      scale,
      opacity: 1.0,
      vy: -1.7 - Math.random() * 0.9,
      vx: (Math.random() - 0.5) * 1.8,
    });
  }, []);

  // Spawn particles (capped to avoid memory bloat)
  const addParticles = useCallback((x: number, y: number, color: string, count = 8, speedMult = 1.0) => {
    const availableSlots = 35 - stateRef.current.particles.length;
    if (availableSlots <= 0) return;
    const spawnCount = Math.min(count, availableSlots);

    for (let i = 0; i < spawnCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (1 + Math.random() * 3.5) * speedMult;
      stateRef.current.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2,
        color,
        size: Math.random() * 3 + 2,
        life: 0,
        maxLife: 20 + Math.random() * 18,
        gravity: 0.14,
      });
    }
  }, []);

  // Keep monster, health, stage synced and trigger native smooth boss victory toast
  useEffect(() => {
    const prevMob = stateRef.current.currentMonsterState;
    stateRef.current.currentMonsterState = currentMonster;

    // Detect boss victory cleanly without external heavy DOM overlays
    if (prevMob && prevMob.type === 'boss' && (!currentMonster || currentMonster.id !== prevMob.id)) {
      const reward = stage === 1 ? 1 : Math.max(1, Math.round(stage / 5));
      addFloatingText(`👑 БОСС ПОВЕРЖЕН! +${reward} 💎`, stateRef.current.canvasWidth / 2, 115, '#fbbf24', 1.4);
      addParticles(stateRef.current.canvasWidth - 85, 175, '#fbbf24', 8, 1.2);
    }
  }, [currentMonster, stage, addFloatingText, addParticles]);

  useEffect(() => {
    stateRef.current.currentStage = stage;
    stateRef.current.currentSubStage = subStage;
  }, [stage, subStage]);

  useEffect(() => {
    stateRef.current.heroHpRatio = Math.max(0, Math.min(1, heroCurrentHp / heroStats.maxHp));
    stateRef.current.isHeroAlive = heroCurrentHp > 0;
  }, [heroCurrentHp, heroStats.maxHp]);

  // Trigger screen shake
  const triggerShake = (intensity = 6) => {
    stateRef.current.shakeIntensity = Math.min(15, stateRef.current.shakeIntensity + intensity);
  };

  // Interactive Tap on Canvas (Mobile Touch or Mouse Click)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    let clientX: number;
    let clientY: number;

    if ('touches' in e) {
      if (e.touches.length === 0) return;
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const clickX = ((clientX - rect.left) / rect.width) * stateRef.current.canvasWidth;
    const clickY = ((clientY - rect.top) / rect.height) * stateRef.current.canvasHeight;

    // Trigger hero tap attack animation
    stateRef.current.heroState = 'attack';
    stateRef.current.attackTimer = 10;
    stateRef.current.maxAttackTimer = 10;

    // Sound
    sound.playTap();

    // Combo Counter Logic
    const now = performance.now();
    if (now - stateRef.current.lastTapTime < 1600) {
      stateRef.current.combo++;
    } else {
      stateRef.current.combo = 1;
    }
    stateRef.current.lastTapTime = now;
    setComboCount(stateRef.current.combo);

    // Crit tap check
    const isCrit = Math.random() * 100 < heroStats.critChance;
    onTapCoin(isCrit, clickX, clickY);

    if (isCrit) {
      sound.playCrit();
      triggerShake(4);
      addFloatingText(`+${heroStats.goldPerTap * 5} ЗОЛОТО!`, clickX, clickY - 12, '#fbbf24', 1.35);
      addParticles(clickX, clickY, '#f59e0b', 16, 1.3);
      addParticles(clickX, clickY, '#ffffff', 8, 1.5);
    } else {
      addFloatingText(`+${heroStats.goldPerTap}`, clickX, clickY - 10, '#fef08a', 1.05);
      addParticles(clickX, clickY, '#fde047', 6);
    }

    // Strike monster with hero weapon damage + combo bonus!
    const mob = stateRef.current.currentMonsterState;
    if (mob && mob.currentHp > 0) {
      sound.playSlash();
      const comboMult = 1 + Math.min(1.0, stateRef.current.combo * 0.03); // up to +100% damage from high combo
      const rawTapDmg = Math.round(heroStats.atk * (isCrit ? (heroStats.critDmg / 100) : 0.7) * comboMult);
      const tapDmg = Math.max(1, rawTapDmg - Math.floor(mob.def * 0.3));

      onMonsterDamage(tapDmg, isCrit);

      const hitX = stateRef.current.canvasWidth - 85 + (Math.random() - 0.5) * 15;
      const hitY = 165 + (Math.random() - 0.5) * 20;

      addFloatingText(
        `${tapDmg}${isCrit ? ' КРИТ!' : ''}`,
        hitX,
        hitY,
        isCrit ? '#f43f5e' : '#ffedd5',
        isCrit ? 1.45 : 1.1
      );
      addParticles(hitX, hitY, isCrit ? '#ef4444' : '#cbd5e1', isCrit ? 18 : 8);
    }
  };

  // Main Canvas Render & Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (time: number) => {
      const dt = Math.min(100, time - stateRef.current.lastTick);
      stateRef.current.lastTick = time;
      stateRef.current.stepCycle += dt * 0.005;

      const width = stateRef.current.canvasWidth;
      const height = stateRef.current.canvasHeight;
      const mob = stateRef.current.currentMonsterState;
      const curStage = stateRef.current.currentStage;
      const curSub = stateRef.current.currentSubStage;

      // Decay Combo if inactive
      if (time - stateRef.current.lastTapTime > 1800 && stateRef.current.combo > 0) {
        stateRef.current.combo = 0;
        setComboCount(0);
      }

      // Screen Shake Decay
      let currentShakeX = 0;
      let currentShakeY = 0;
      if (stateRef.current.shakeIntensity > 0) {
        currentShakeX = (Math.random() - 0.5) * stateRef.current.shakeIntensity;
        currentShakeY = (Math.random() - 0.5) * stateRef.current.shakeIntensity;
        stateRef.current.shakeIntensity = Math.max(0, stateRef.current.shakeIntensity - dt * 0.035);
      }

      // Combat logic tick
      if (mob && mob.currentHp > 0 && stateRef.current.isHeroAlive) {
        const atkInterval = 1000 / heroStats.atkSpeed;
        if (time - stateRef.current.lastAutoAttackTime >= atkInterval) {
          stateRef.current.lastAutoAttackTime = time;
          stateRef.current.heroState = 'attack';
          stateRef.current.attackTimer = 10;
          stateRef.current.maxAttackTimer = 10;
          sound.playSlash();

          const isCrit = Math.random() * 100 < heroStats.critChance;
          const rawDamage = isCrit
            ? Math.round(heroStats.atk * (heroStats.critDmg / 100))
            : heroStats.atk;
          const damage = Math.max(1, rawDamage - Math.floor(mob.def * 0.5));

          onMonsterDamage(damage, isCrit);

          const hitX = width - 85 + (Math.random() - 0.5) * 20;
          const hitY = 160 + (Math.random() - 0.5) * 25;

          addFloatingText(
            `${damage}${isCrit ? ' КРИТ!' : ''}`,
            hitX,
            hitY,
            isCrit ? '#ef4444' : '#f8fafc',
            isCrit ? 1.4 : 1.0
          );
          addParticles(hitX, hitY, isCrit ? '#f87171' : '#cbd5e1', isCrit ? 15 : 6);

          if (isCrit) {
            sound.playCrit();
            triggerShake(5);
          }
        }

        // Monster retaliation attacks
        const mobAtkInterval = 1500;
        if (time - stateRef.current.lastMonsterAttackTime >= mobAtkInterval) {
          stateRef.current.lastMonsterAttackTime = time;
          stateRef.current.heroState = 'hit';
          stateRef.current.attackTimer = 8;
          stateRef.current.maxAttackTimer = 8;
          sound.playHit();
          triggerShake(4);

          const rawMobDmg = mob.atk;
          const incomingDmg = Math.max(1, rawMobDmg - Math.floor(heroStats.def * 0.6));

          onHeroDamage(incomingDmg);

          addFloatingText(
            `-${incomingDmg}`,
            stateRef.current.heroX + 16,
            stateRef.current.heroY - 10,
            '#ef4444',
            1.15
          );
          addParticles(stateRef.current.heroX + 16, stateRef.current.heroY + 8, '#dc2626', 8);
        }
      } else {
        // Monster defeated: hero walks forward on platform
        stateRef.current.worldOffset = (stateRef.current.worldOffset + dt * 0.14) % 180;
        if (stateRef.current.attackTimer <= 0) {
          stateRef.current.heroState = 'walk';
        }
      }

      // Attack timer progression
      let attackPhase = 0;
      if (stateRef.current.attackTimer > 0) {
        stateRef.current.attackTimer--;
        attackPhase = 1 - stateRef.current.attackTimer / stateRef.current.maxAttackTimer;
      }

      // --- RENDERING CANVAS PASS ---
      ctx.save();
      // Apply Screen Shake
      ctx.translate(currentShakeX, currentShakeY);

      // 1. Draw Multi-Layer Parallax Level Background with current Biome
      drawLevelBackground(ctx, width, height, time, stateRef.current.worldOffset, curStage);

      // 2. Boss Encounter Banner when subStage is 10
      if (curSub === 10 && mob && mob.currentHp > 0) {
        const pulse = (Math.sin(time * 0.01) + 1) * 0.5;
        ctx.fillStyle = `rgba(239, 68, 68, ${0.15 + pulse * 0.2})`;
        ctx.fillRect(0, 0, width, 28);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(0, 27, width, 1.5);
        ctx.font = '900 11px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('⚠️ БОСС ЭТАПА: СМЕРТЕЛЬНАЯ БИТВА ⚠️', width / 2, 18);
      }

      // 3. Draw Highly-Detailed Animated Hero Character with Gear & Full Set Transcendence
      drawDetailedHero({
        ctx,
        x: stateRef.current.heroX,
        y: stateRef.current.heroY,
        state: stateRef.current.heroState,
        attackPhase,
        walkCycle: stateRef.current.stepCycle,
        time,
        equipped,
        isAlive: stateRef.current.isHeroAlive,
      });

      // 4. Draw Detailed Monster or Boss (if alive)
      if (mob && mob.currentHp > 0) {
        drawDetailedMonster({
          ctx,
          mob,
          time,
          width,
          floorY: 210,
        });
      } else {
        ctx.font = '600 11px "Plus Jakarta Sans", sans-serif';
        ctx.fillStyle = '#a8a29e';
        ctx.textAlign = 'center';
        ctx.fillText('Переход на следующий уровень...', width - 85, 175);
      }

      // 5. Update & Draw Dynamic Particle Bursts (High-performance single pass)
      const maxP = Math.min(stateRef.current.particles.length, 30);
      const nextParticles: Particle[] = [];
      for (let i = 0; i < maxP; i++) {
        const p = stateRef.current.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity || 0.12;
        p.life++;

        if (p.life < p.maxLife) {
          const alpha = 1 - p.life / p.maxLife;
          ctx.fillStyle = p.color;
          ctx.globalAlpha = Math.max(0, alpha);
          ctx.fillRect(Math.floor(p.x), Math.floor(p.y), Math.floor(p.size), Math.floor(p.size));
          nextParticles.push(p);
        }
      }
      ctx.globalAlpha = 1.0;
      stateRef.current.particles = nextParticles;

      // 6. Update & Draw Floating Combat Texts (Optimized zero-churn single pass)
      const maxFt = Math.min(stateRef.current.floatingTexts.length, 12);
      const nextTexts: FloatingText[] = [];
      ctx.textAlign = 'center';
      for (let i = 0; i < maxFt; i++) {
        const ft = stateRef.current.floatingTexts[i];
        ft.x += ft.vx;
        ft.y += ft.vy;
        ft.opacity -= 0.026;

        if (ft.opacity > 0) {
          ctx.globalAlpha = Math.max(0, ft.opacity);
          ctx.font = `800 ${Math.round(11 * ft.scale)}px "JetBrains Mono", monospace`;
          ctx.fillStyle = '#09080e';
          ctx.fillText(ft.text, ft.x + 1, ft.y + 1);
          ctx.fillStyle = ft.color;
          ctx.fillText(ft.text, ft.x, ft.y);
          nextTexts.push(ft);
        }
      }
      ctx.globalAlpha = 1.0;
      stateRef.current.floatingTexts = nextTexts;

      // 7. Active Combo Banner on Canvas
      if (stateRef.current.combo >= 4) {
        const combo = stateRef.current.combo;
        const comboX = width / 2;
        const comboY = curSub === 10 ? 46 : 32;
        const comboPulse = (Math.sin(time * 0.015) + 1) * 0.15 + 0.85;

        ctx.save();
        ctx.translate(comboX, comboY);
        ctx.scale(comboPulse, comboPulse);

        ctx.font = '800 12px "JetBrains Mono", monospace';
        ctx.fillStyle = '#09080e';
        ctx.fillText(`x${combo} КОМБО! ${combo >= 15 ? '🔥 БЕРСЕРК' : '⚡'}`, 1, 1);
        ctx.fillStyle = combo >= 15 ? '#f43f5e' : '#f59e0b';
        ctx.fillText(`x${combo} КОМБО! ${combo >= 15 ? '🔥 БЕРСЕРК' : '⚡'}`, 0, 0);

        ctx.restore();
      }

      ctx.restore(); // Restore shake matrix

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [equipped, heroStats, onHeroDamage, onMonsterDamage, addFloatingText, addParticles]);

  return (
    <div className="relative w-full h-[40vh] min-h-[230px] max-h-[460px] bg-stone-950 rounded-xl overflow-hidden border border-stone-800 shadow-2xl select-none group flex items-center justify-center">
      <canvas
        ref={canvasRef}
        width={480}
        height={300}
        onClick={handleCanvasClick}
        onTouchStart={handleCanvasClick}
        className="w-full h-full object-cover cursor-pointer active:scale-[0.99] transition-transform"
        style={{ imageRendering: 'pixelated' }}
      />

      {/* Top Left: Active Biome Badge */}
      <div className="absolute top-2 left-2 pointer-events-none flex items-center gap-1.5 text-[10px] font-mono text-stone-200 bg-stone-900/90 px-2 py-0.5 rounded border border-stone-700/70 backdrop-blur-xs shadow-md">
        <Compass className="w-3 h-3 text-amber-400" />
        <span className="font-bold" style={{ color: biome.accentColor }}>{biome.name}</span>
        <span className="text-stone-400">• Эт. {stage}-{subStage}</span>
      </div>

      {/* Top Right: Inspect Character Button */}
      <button
        onClick={e => {
          e.stopPropagation();
          setShowHeroInspect(true);
        }}
        className="absolute top-2 right-2 flex items-center gap-1 text-[11px] font-sans font-bold text-stone-200 bg-stone-900/90 hover:bg-stone-800 px-2.5 py-1 rounded border border-stone-700/80 shadow-md backdrop-blur-xs transition-colors cursor-pointer"
        title="Осмотреть героя и детализацию вещей"
      >
        <Eye className="w-3.5 h-3.5 text-sky-400" />
        <span className="hidden sm:inline">Осмотреть</span>
      </button>

      {/* Bottom Left: Active Combo Indicator */}
      {comboCount >= 3 && (
        <div className="absolute bottom-2 left-3 pointer-events-none flex items-center gap-1 text-[11px] font-mono font-extrabold text-amber-300 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/50 animate-bounce">
          <Flame className="w-3.5 h-3.5 text-amber-500" />
          <span>x{comboCount} КОМБО</span>
        </div>
      )}

      {/* Bottom Right: Tap prompt badge */}
      <div className="absolute bottom-2 right-3 pointer-events-none flex items-center gap-1.5 text-[11px] font-mono font-medium text-amber-300 bg-stone-900/85 px-2 py-0.5 rounded border border-amber-500/30 backdrop-blur-xs">
        <span>👆 ТАПАЙ ЭКРАН</span>
      </div>

      {/* Modal: Full Hero Sprite & Gear Inspector */}
      {showHeroInspect && (
        <div
          onClick={() => setShowHeroInspect(false)}
          className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4 backdrop-blur-sm cursor-default"
        >
          <div
            onClick={e => e.stopPropagation()}
            className="bg-stone-900 border border-stone-700 rounded-2xl p-5 max-w-sm w-full space-y-4 shadow-2xl relative"
          >
            <div className="flex items-center justify-between border-b border-stone-800 pb-2.5">
              <h3 className="font-extrabold text-sm text-stone-100 flex items-center gap-1.5 font-sans">
                <Sparkles className="w-4 h-4 text-amber-400" />
                Витрина Героя (HD Pixel Art)
              </h3>
              <button
                onClick={() => setShowHeroInspect(false)}
                className="text-stone-400 hover:text-white font-bold text-sm"
              >
                ✕
              </button>
            </div>

            {/* Magnified Hero Sprite Preview Canvas */}
            <div className="w-full aspect-[4/3] bg-stone-950 rounded-xl border border-stone-800 flex items-center justify-center relative overflow-hidden">
              <HeroPreviewCanvas equipped={equipped} />
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="font-bold text-stone-300">Состояние героя:</div>
              <p className="text-stone-400 leading-relaxed text-[11px]">
                {Object.values(equipped).filter(Boolean).length === 0 ? (
                  <span className="text-amber-300 font-medium">
                    Герой раздет: видна естественная мускулатура пресса, торса и базовые походные шорты.
                  </span>
                ) : (
                  <span>
                    Надето {Object.values(equipped).filter(Boolean).length}/6 предметов снаряжения.
                    Каждая надетая часть брони, шлема, оружия и питомца динамически отображается в анимациях.
                  </span>
                )}
              </p>
            </div>

            <button
              onClick={() => setShowHeroInspect(false)}
              className="w-full py-2 bg-stone-800 hover:bg-stone-700 text-stone-100 font-bold text-xs rounded transition-colors"
            >
              Закрыть витрину
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component for zoomed-in hero inspection preview
const HeroPreviewCanvas: React.FC<{ equipped: Partial<Record<SlotType, EquipmentItem>> }> = ({ equipped }) => {
  const previewCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = previewCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (time: number) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.imageSmoothingEnabled = false;

      // Dark background radial
      const bg = ctx.createRadialGradient(120, 110, 10, 120, 110, 90);
      bg.addColorStop(0, '#1c192c');
      bg.addColorStop(1, '#09080f');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Light pedestal
      ctx.fillStyle = '#2d2745';
      ctx.beginPath();
      ctx.ellipse(120, 175, 48, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      // Scale up 2.0x for super crisp inspection of the taller hero
      ctx.translate(35, 8);
      ctx.scale(2.0, 2.0);

      drawDetailedHero({
        ctx,
        x: 28,
        y: 28,
        state: 'idle',
        attackPhase: 0,
        walkCycle: 0,
        time,
        equipped,
        isAlive: true,
      });

      ctx.restore();

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [equipped]);

  return <canvas ref={previewCanvasRef} width={240} height={200} className="w-full h-full object-contain" />;
};
