// High-fidelity 16-bit procedural pixel-art rendering engine for Pixel Hero RPG
import { EquipmentItem, HeroStats, Monster, SlotType, Rarity } from '../types/game';

export interface RenderContext {
  ctx: CanvasRenderingContext2D;
  time: number;
  dt: number;
  width: number;
  height: number;
  shakeX: number;
  shakeY: number;
}

// 7 Distinct Atmospheric Biomes for Continuous Level Progression
export type BiomeType = 
  | 'catacombs'   // Stages 1-5: Forgotten Crypt
  | 'glacier'      // Stages 6-10: Frostbite Peak & Glacier
  | 'lava'         // Stages 11-15: Molten Forge & Magma Depths
  | 'swamp'        // Stages 16-20: Venom Mire & Spider Spire
  | 'citadel'      // Stages 21-25: Dragon Citadel & Royal Gold Vault
  | 'necropolis'   // Stages 26-30: Cursed Necropolis & Ghost Storm
  | 'void';        // Stages 31+: Astral Void & Celestial Pantheon

export interface BiomeInfo {
  id: BiomeType;
  name: string;
  subtitle: string;
  accentColor: string;
  skyColors: [string, string, string];
  floorColor: string;
  floorHighlight: string;
}

export function getBiomeForStage(stage: number): BiomeInfo {
  const cycle = ((stage - 1) % 35) + 1;
  if (cycle <= 5) {
    return {
      id: 'catacombs',
      name: 'Забытый Склеп',
      subtitle: 'Древние каменные залы подземелья',
      accentColor: '#38bdf8',
      skyColors: ['#060509', '#120f1d', '#1b172a'],
      floorColor: '#262338',
      floorHighlight: '#494266',
    };
  } else if (cycle <= 10) {
    return {
      id: 'glacier',
      name: 'Ледяной Пик',
      subtitle: 'Северное сияние и вечный ледник',
      accentColor: '#06b6d4',
      skyColors: ['#041527', '#082f49', '#0c4a6e'],
      floorColor: '#164e63',
      floorHighlight: '#38bdf8',
    };
  } else if (cycle <= 15) {
    return {
      id: 'lava',
      name: 'Лавовые Недра',
      subtitle: 'Вулканические глубины и реки магмы',
      accentColor: '#f97316',
      skyColors: ['#1c0a06', '#2a0e08', '#451a03'],
      floorColor: '#271714',
      floorHighlight: '#7c2d12',
    };
  } else if (cycle <= 20) {
    return {
      id: 'swamp',
      name: 'Чумные Топи',
      subtitle: 'Токсичные склепы и логово пауков',
      accentColor: '#10b981',
      skyColors: ['#02130e', '#062017', '#064e3b'],
      floorColor: '#132e24',
      floorHighlight: '#047857',
    };
  } else if (cycle <= 25) {
    return {
      id: 'citadel',
      name: 'Цитадель Дракона',
      subtitle: 'Золотая королевская сокровищница',
      accentColor: '#fbbf24',
      skyColors: ['#140b04', '#261505', '#451a03'],
      floorColor: '#291b10',
      floorHighlight: '#92400e',
    };
  } else if (cycle <= 30) {
    return {
      id: 'necropolis',
      name: 'Проклятый Некрополь',
      subtitle: 'Призрачный шторм и древние гробницы',
      accentColor: '#a855f7',
      skyColors: ['#100720', '#1f0d3d', '#3b0764'],
      floorColor: '#231138',
      floorHighlight: '#7e22ce',
    };
  } else {
    return {
      id: 'void',
      name: 'Астральная Бездна',
      subtitle: 'Космический разлом богов-творцов',
      accentColor: '#e879f9',
      skyColors: ['#090214', '#19062d', '#2e0854'],
      floorColor: '#220b38',
      floorHighlight: '#c084fc',
    };
  }
}

// Draw a pixel rectangle with integer coordinates for crisp pixel edges
export function pRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color?: string) {
  if (color) ctx.fillStyle = color;
  ctx.fillRect(Math.floor(x), Math.floor(y), Math.floor(w), Math.floor(h));
}

// Draw a circle pixelated
export function pCircle(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, color?: string) {
  if (color) ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(Math.floor(cx), Math.floor(cy), Math.floor(r), 0, Math.PI * 2);
  ctx.fill();
}

/* =========================================================================
   1. DYNAMIC MULTI-BIOME LEVEL BACKGROUND RENDERING (7 Distinct Worlds)
   ========================================================================= */

const gradientCache = new Map<string, CanvasGradient>();
function getCachedLinearGradient(
  ctx: CanvasRenderingContext2D,
  key: string,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  stops: [number, string][]
): CanvasGradient {
  let grad = gradientCache.get(key);
  if (!grad) {
    grad = ctx.createLinearGradient(x0, y0, x1, y1);
    for (const [pos, col] of stops) {
      grad.addColorStop(pos, col);
    }
    gradientCache.set(key, grad);
  }
  return grad;
}

export function drawLevelBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  worldOffset: number,
  stage: number
) {
  const floorY = 210;
  const biome = getBiomeForStage(stage);

  // Layer 0: Sky Gradient according to active Biome (Cached)
  const bgGrad = getCachedLinearGradient(
    ctx,
    `sky_${biome.id}_${height}`,
    0, 0, 0, height,
    [
      [0, biome.skyColors[0]],
      [0.45, biome.skyColors[1]],
      [0.72, biome.skyColors[2]],
      [1, '#050308']
    ]
  );
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, width, height);

  // BIOME-SPECIFIC DEEP PARALLAX BACKGROUND (Layers 1, 2, 3)

  if (biome.id === 'glacier') {
    // --- BIOME 2: FROSTBITE PEAK & GLACIER ---
    // Aurora Borealis (Waving shimmering light curtains)
    for (let a = 0; a < 3; a++) {
      const aWave = Math.sin(time * 0.002 + a * 1.5);
      const aGrad = ctx.createLinearGradient(0, 10, width, 90);
      aGrad.addColorStop(0, 'rgba(6, 182, 212, 0)');
      aGrad.addColorStop(0.5, a === 1 ? 'rgba(52, 211, 153, 0.22)' : 'rgba(56, 189, 248, 0.25)');
      aGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = aGrad;
      ctx.beginPath();
      ctx.moveTo(0, 30 + a * 15 + aWave * 12);
      ctx.bezierCurveTo(width * 0.3, 10 + aWave * 20, width * 0.7, 50 - aWave * 18, width, 25 + a * 10);
      ctx.lineTo(width, 95);
      ctx.lineTo(0, 95);
      ctx.fill();
    }

    // Distant jagged ice spires (Far layer)
    ctx.fillStyle = '#082f49';
    const iceOff = (worldOffset * 0.15) % 160;
    for (let x = -iceOff - 60; x < width + 80; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x + 22, 45 + Math.sin(x) * 25);
      ctx.lineTo(x + 44, floorY);
      ctx.fill();
    }

    // Midground translucent frozen ice monoliths & stalactites
    const monOff = (worldOffset * 0.35) % 140;
    for (let x = -monOff - 40; x < width + 60; x += 140) {
      // Ice Pillar
      ctx.fillStyle = '#0e7490';
      ctx.fillRect(x, 30, 30, floorY - 30);
      // Highlights & crystalline facets
      ctx.fillStyle = '#67e8f9';
      pRect(ctx, x + 4, 35, 4, floorY - 50);
      pRect(ctx, x + 18, 50, 6, floorY - 80);
      ctx.fillStyle = '#e0f2fe';
      pRect(ctx, x + 6, 38, 1, floorY - 60);

      // Hanging sharp ice stalactites from ceiling
      ctx.beginPath();
      ctx.moveTo(x + 5, 0);
      ctx.lineTo(x + 15, 38);
      ctx.lineTo(x + 25, 0);
      ctx.fillStyle = '#a5f3fc';
      ctx.fill();
    }

    // Swirling drifting snow particles
    for (let i = 0; i < 22; i++) {
      const sx = (i * 24 + time * 0.04 * ((i % 3) + 1)) % width;
      const sy = ((time * 0.05 + i * 22) % floorY);
      const flakeSize = i % 3 === 0 ? 2 : 1;
      ctx.fillStyle = i % 4 === 0 ? '#cffafe' : '#ffffff';
      pRect(ctx, sx + Math.sin(sy * 0.05 + i) * 6, sy, flakeSize, flakeSize);
    }
  } else if (biome.id === 'lava') {
    // --- BIOME 3: LAVA & VOLCANIC CHASM ---
    // Distant volcanic spires with red smog
    ctx.fillStyle = '#260b05';
    const spireOff = (worldOffset * 0.15) % 180;
    for (let x = -spireOff - 60; x < width + 80; x += 90) {
      ctx.beginPath();
      ctx.moveTo(x, floorY);
      ctx.lineTo(x + 25, 30 + Math.sin(x) * 20);
      ctx.lineTo(x + 50, floorY);
      ctx.fill();
    }

    // Midground basalt columns with glowing magma veins
    const magOff = (worldOffset * 0.4) % 140;
    for (let x = -magOff - 40; x < width + 60; x += 140) {
      ctx.fillStyle = '#1c0904';
      ctx.fillRect(x, 40, 36, floorY - 40);

      // Pulsating magma cracks
      const pulse = (Math.sin(time * 0.005 + x) + 1) * 0.5;
      ctx.fillStyle = `rgba(249, 115, 22, ${0.6 + pulse * 0.4})`;
      pRect(ctx, x + 8, 70, 4, 35);
      pRect(ctx, x + 12, 90, 16, 4);
      pRect(ctx, x + 20, 105, 5, 25);
    }

    // Boiling magma river in foreground chasm (Cached)
    const lavaGrad = getCachedLinearGradient(
      ctx,
      `lava_${floorY}`,
      0, floorY - 18, 0, floorY,
      [
        [0, 'rgba(234, 88, 12, 0)'],
        [1, 'rgba(249, 115, 22, 0.45)']
      ]
    );
    ctx.fillStyle = lavaGrad;
    ctx.fillRect(0, floorY - 18, width, 18);

    // Erupting fire sparks & embers floating upwards
    for (let i = 0; i < 20; i++) {
      const ex = (i * 28 + time * 0.03 * ((i % 3) + 1)) % width;
      const ey = floorY - 10 - ((time * 0.07 + i * 26) % 170);
      const emberSize = (i % 2 === 0) ? 2.5 : 1.5;
      ctx.fillStyle = i % 3 === 0 ? '#fde047' : '#ea580c';
      pRect(ctx, ex + Math.sin(ey * 0.1) * 7, ey, emberSize, emberSize);
    }
  } else if (biome.id === 'swamp') {
    // --- BIOME 4: TOXIC SPIDER SWAMP & CAVERNS ---
    // Twisted roots & spiderweb canopies
    ctx.strokeStyle = '#064e3b';
    ctx.lineWidth = 12;
    const rootOff = (worldOffset * 0.2) % 150;
    for (let x = -rootOff - 40; x < width + 60; x += 150) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.quadraticCurveTo(x + 40, 70, x + 20, floorY);
      ctx.stroke();
    }

    // Glowing spider egg sacs and web canopies
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 40, 45);
      ctx.lineTo(x + 80, 0);
      ctx.stroke();
      // Glowing green egg sac
      const eggPulse = (Math.sin(time * 0.004 + x) + 1) * 0.5;
      ctx.fillStyle = `rgba(16, 185, 129, ${0.4 + eggPulse * 0.4})`;
      pCircle(ctx, x + 40, 47, 5);
      ctx.fillStyle = '#a7f3d0';
      pRect(ctx, x + 39, 46, 2, 2);
    }

    // Bioluminescent floating spores
    for (let i = 0; i < 16; i++) {
      const sx = (i * 34 + time * 0.02) % width;
      const sy = 40 + ((i * 22 + Math.sin(time * 0.003 + i) * 25) % (floorY - 60));
      ctx.fillStyle = 'rgba(52, 211, 153, 0.7)';
      pRect(ctx, sx, sy, 2, 2);
      ctx.fillStyle = 'rgba(16, 185, 129, 0.3)';
      pCircle(ctx, sx + 1, sy + 1, 4);
    }
  } else if (biome.id === 'citadel') {
    // --- BIOME 5: DRAGON CITADEL / ROYAL CATHEDRAL ---
    // Cathedral stained glass lancet arches
    const cathOff = (worldOffset * 0.3) % 160;
    for (let x = -cathOff - 40; x < width + 80; x += 160) {
      ctx.fillStyle = '#261505';
      ctx.fillRect(x, 20, 36, floorY - 20);
      ctx.beginPath();
      ctx.moveTo(x, 20);
      ctx.lineTo(x + 18, -10);
      ctx.lineTo(x + 36, 20);
      ctx.fill();

      // Blood moon illumination in window
      ctx.fillStyle = 'rgba(234, 88, 12, 0.35)';
      pRect(ctx, x + 6, 25, 24, 70);

      // Hanging gold royal banners
      ctx.fillStyle = '#b45309';
      pRect(ctx, x + 8, 40, 20, 50);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, x + 10, 44, 16, 4);
      pRect(ctx, x + 16, 52, 4, 16);
    }

    // Background hoard of gold coins piled against walls
    ctx.fillStyle = '#78350f';
    for (let i = 0; i < 10; i++) {
      const pileX = (i * 60 - worldOffset * 0.5) % (width + 60);
      ctx.beginPath();
      ctx.ellipse(pileX + 30, floorY, 35, 18, 0, 0, Math.PI * 2);
      ctx.fill();
      if (Math.sin(time * 0.01 + i) > 0.4) {
        ctx.fillStyle = '#fef08a';
        pRect(ctx, pileX + 25, floorY - 12, 3, 3);
        ctx.fillStyle = '#78350f';
      }
    }
  } else if (biome.id === 'necropolis') {
    // --- BIOME 6: CURSED NECROPOLIS ---
    // Occasional lightning flash across dark sky!
    const lightning = Math.sin(time * 0.001) > 0.985;
    if (lightning) {
      ctx.fillStyle = 'rgba(243, 232, 255, 0.18)';
      ctx.fillRect(0, 0, width, height);
    }

    // Weathered Gothic Mausoleums and ruined cathedrals
    const necOff = (worldOffset * 0.25) % 170;
    for (let x = -necOff - 50; x < width + 80; x += 170) {
      // Tomb architecture
      ctx.fillStyle = '#1c1033';
      ctx.fillRect(x, 30, 48, floorY - 30);
      ctx.beginPath();
      ctx.moveTo(x - 6, 30);
      ctx.lineTo(x + 24, -2);
      ctx.lineTo(x + 54, 30);
      ctx.fill();

      // Celtic stone cross
      ctx.fillStyle = '#4c1d95';
      pRect(ctx, x + 21, 8, 6, 26);
      pRect(ctx, x + 13, 14, 22, 6);
      ctx.strokeStyle = '#581c87';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(x + 24, 17, 8, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Eerie Floating Ghost Wisps (Spectral orbs)
    for (let w = 0; w < 6; w++) {
      const wx = (w * 85 + time * 0.03) % width;
      const wy = 60 + Math.sin(time * 0.005 + w) * 20;
      const wPulse = (Math.sin(time * 0.008 + w) + 1) * 0.5;
      const wGrad = ctx.createRadialGradient(wx, wy, 1, wx, wy, 16);
      wGrad.addColorStop(0, `rgba(192, 132, 252, ${0.6 + wPulse * 0.3})`);
      wGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = wGrad;
      ctx.beginPath();
      ctx.arc(wx, wy, 16, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      pRect(ctx, wx - 1, wy - 1, 2, 2);
    }

    // Purple death mist sliding along floor
    const mistGrad = ctx.createLinearGradient(0, floorY - 24, 0, floorY);
    mistGrad.addColorStop(0, 'rgba(88, 28, 135, 0)');
    mistGrad.addColorStop(1, 'rgba(147, 51, 234, 0.28)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, floorY - 24, width, 24);
  } else if (biome.id === 'void') {
    // --- BIOME 7: ASTRAL VOID RIFT (Cosmic Galaxy) ---
    // Swirling Nebula vortex
    const nebPulse = (Math.sin(time * 0.003) + 1) * 0.5;
    const nebGrad = ctx.createRadialGradient(width / 2, 70, 10, width / 2, 70, 140);
    nebGrad.addColorStop(0, `rgba(232, 121, 249, ${0.35 + nebPulse * 0.15})`);
    nebGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.2)');
    nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = nebGrad;
    ctx.beginPath();
    ctx.arc(width / 2, 70, 140, 0, Math.PI * 2);
    ctx.fill();

    // Floating astral monoliths / shattered gravity islands
    const voidOff = (worldOffset * 0.2) % 180;
    for (let x = -voidOff - 40; x < width + 60; x += 120) {
      const floatY = 50 + Math.sin(time * 0.004 + x) * 12;
      ctx.fillStyle = '#3b0764';
      ctx.beginPath();
      ctx.moveTo(x, floatY);
      ctx.lineTo(x + 18, floatY - 14);
      ctx.lineTo(x + 36, floatY);
      ctx.lineTo(x + 18, floatY + 22);
      ctx.fill();

      // Glowing cosmic core
      ctx.fillStyle = '#e879f9';
      pRect(ctx, x + 15, floatY - 2, 6, 6);
      ctx.fillStyle = '#ffffff';
      pRect(ctx, x + 17, floatY, 2, 2);
    }

    // Stellar star dust & warp particles
    for (let i = 0; i < 24; i++) {
      const stx = (i * 22 + time * 0.04) % width;
      const sty = (i * 12 + Math.cos(time * 0.002 + i) * 15) % (floorY - 20);
      const twinkle = (Math.sin(time * 0.01 + i) + 1) * 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + twinkle * 0.6})`;
      pRect(ctx, stx, sty, 2, 2);
    }
  } else {
    // --- BIOME 1: DEFAULT CATACOMBS (Forgotten Crypt) ---
    // Distant stalactites & pillars
    ctx.fillStyle = '#110e1e';
    const farOffset = (worldOffset * 0.15) % 160;
    for (let x = -farOffset - 60; x < width + 60; x += 80) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x + 20, 0);
      ctx.lineTo(x + 10, 45 + Math.abs(Math.sin(x * 0.05)) * 30);
      ctx.fill();
      ctx.fillRect(x + 25, 30, 24, floorY - 30);
    }

    // Glowing Azure Crystal clusters
    for (let i = 0; i < 5; i++) {
      const cx = (i * 110 + 30 - worldOffset * 0.25) % (width + 60);
      const pulse = Math.sin(time * 0.003 + i) * 0.3 + 0.7;
      const crystalX = cx < -40 ? cx + width + 80 : cx;
      const crystalY = floorY - 45 - (i % 3) * 15;

      const crystalGrad = ctx.createRadialGradient(crystalX, crystalY, 2, crystalX, crystalY, 28);
      crystalGrad.addColorStop(0, `rgba(56, 189, 248, ${0.25 * pulse})`);
      crystalGrad.addColorStop(1, 'rgba(56, 189, 248, 0)');
      ctx.fillStyle = crystalGrad;
      ctx.beginPath();
      ctx.arc(crystalX, crystalY, 28, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#0284c7';
      pRect(ctx, crystalX - 3, crystalY - 14, 6, 16);
      pRect(ctx, crystalX - 8, crystalY - 8, 5, 10);
      pRect(ctx, crystalX + 3, crystalY - 10, 5, 12);
      ctx.fillStyle = '#38bdf8';
      pRect(ctx, crystalX - 2, crystalY - 12, 3, 12);
      pRect(ctx, crystalX + 4, crystalY - 8, 2, 8);
      ctx.fillStyle = '#e0f2fe';
      pRect(ctx, crystalX - 1, crystalY - 10, 1, 6);
    }

    // Midground Gothic Arches
    const archOffset = (worldOffset * 0.5) % 130;
    for (let x = -archOffset - 60; x < width + 80; x += 130) {
      ctx.fillStyle = '#1e1b2e';
      ctx.fillRect(x, 15, 32, floorY - 15);
      ctx.fillStyle = '#2d2745';
      ctx.fillRect(x - 4, 15, 40, 7);
      ctx.fillRect(x - 2, floorY - 20, 36, 6);
      ctx.fillStyle = '#131120';
      ctx.fillRect(x + 24, 22, 8, floorY - 42);

      ctx.beginPath();
      ctx.arc(x + 16, 20, 50, Math.PI, 0);
      ctx.strokeStyle = '#25203b';
      ctx.lineWidth = 10;
      ctx.stroke();

      const runeGlow = (Math.sin(time * 0.004 + x) + 1) * 0.5;
      ctx.fillStyle = `rgba(168, 85, 247, ${0.4 + runeGlow * 0.4})`;
      pRect(ctx, x + 14, 65, 4, 14);
      pRect(ctx, x + 9, 70, 14, 4);
    }

    // Wall Torches with warm light halo
    const torchOffset = (worldOffset * 0.75) % 170;
    for (let x = -torchOffset + 20; x < width + 80; x += 170) {
      const torchX = x;
      const torchY = 105;
      ctx.fillStyle = '#3f3f46';
      pRect(ctx, torchX, torchY, 8, 22);
      pRect(ctx, torchX - 4, torchY + 14, 16, 4);

      const flick = Math.sin(time * 0.02 + x) * 2;
      ctx.fillStyle = 'rgba(251, 146, 60, 0.2)';
      ctx.beginPath();
      ctx.arc(torchX + 4, torchY - 6, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#c2410c';
      pRect(ctx, torchX - 1, torchY - 14 + flick, 10, 14);
      ctx.fillStyle = '#f97316';
      pRect(ctx, torchX + 1, torchY - 16 + flick, 6, 12);
      ctx.fillStyle = '#fde047';
      pRect(ctx, torchX + 2, torchY - 13 + flick * 0.6, 4, 8);
    }
  }

  // --- PLATFORM FLOOR WITH BIOME-MATCHED MATERIALS (Cached) ---
  const platGrad = getCachedLinearGradient(
    ctx,
    `plat_${biome.id}_${floorY}_${height}`,
    0, floorY, 0, height,
    [
      [0, biome.floorColor],
      [0.3, '#100c1c'],
      [1, '#05030a']
    ]
  );
  ctx.fillStyle = platGrad;
  ctx.fillRect(0, floorY, width, height - floorY);

  // Platform top edge highlights & flagstones
  ctx.fillStyle = biome.floorHighlight;
  ctx.fillRect(0, floorY, width, 4);
  ctx.fillStyle = biome.accentColor;
  ctx.fillRect(0, floorY, width, 1.2);

  // Modular floor tiles with scrolling offset
  const floorOffset = worldOffset % 48;
  for (let fx = -floorOffset; fx < width + 48; fx += 48) {
    ctx.fillStyle = '#0a0812';
    ctx.fillRect(fx, floorY + 1, 2, height - floorY);

    // Tile cracks
    ctx.fillStyle = biome.floorHighlight;
    pRect(ctx, fx + 8, floorY + 6, 14, 2);
    pRect(ctx, fx + 28, floorY + 12, 10, 2);

    // Ancient rune or moss on edge
    ctx.fillStyle = biome.accentColor;
    pRect(ctx, fx + 16, floorY + 1, 8, 3);
  }

  // Horizontal stone layer mortar lines
  ctx.fillStyle = '#0a0812';
  ctx.fillRect(0, floorY + 28, width, 2);
  ctx.fillRect(0, floorY + 60, width, 2);
}

// Backward compatibility alias for any existing caller
export function drawDungeonBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  time: number,
  worldOffset: number,
  stage: number = 1
) {
  drawLevelBackground(ctx, width, height, time, worldOffset, stage);
}

/* =========================================================================
   2. HIGH-TIER SCALED HERO GEAR RENDERING (Higher Quality = Insane Detail!)
   ========================================================================= */

interface HeroRenderParams {
  ctx: CanvasRenderingContext2D;
  x: number;
  y: number;
  state: 'idle' | 'walk' | 'attack' | 'hit';
  attackPhase: number;
  walkCycle: number;
  time: number;
  equipped: Partial<Record<SlotType, EquipmentItem>>;
  isAlive: boolean;
}

export function drawDetailedHero(params: HeroRenderParams) {
  const { ctx, x, y, state, attackPhase, walkCycle, time, equipped, isAlive } = params;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const isWalking = state === 'walk';
  const isAttacking = state === 'attack';
  const isHit = state === 'hit';

  const walkBob = isWalking ? Math.sin(walkCycle * 4) * 3 : Math.sin(time * 0.005) * 1.5;
  const walkLeg = isWalking ? Math.sin(walkCycle * 4) * 6 : 0;
  const attackLunge = isAttacking ? Math.sin(attackPhase * Math.PI) * 16 : 0;

  const hx = Math.floor(x + attackLunge);
  const hy = Math.floor(y + walkBob);

  // Highest rarity check on hero
  const rarities = Object.values(equipped).map(i => i?.rarity).filter(Boolean);
  const hasMythic = rarities.includes('mythic');
  const hasGold = rarities.includes('gold');

  const bodyItem = equipped.body;
  const headItem = equipped.head;
  const legItem = equipped.legs;
  const weaponItem = equipped.weapon;

  // STRICT TIER VISUAL SEPARATION:
  // Mythic: Draconic Leather (L2 S-Grade)
  // Gold: Imperial Crusader (L2 S-Grade Heavy Plate)
  // Below Gold (Epic, Rare, Uncommon, Common): Simple designs!
  const isMythicBody = bodyItem?.rarity === 'mythic';
  const isMythicHead = headItem?.rarity === 'mythic';
  const isMythicLegs = legItem?.rarity === 'mythic';
  const isMythicWeapon = weaponItem?.rarity === 'mythic';

  const isGoldBody = bodyItem?.rarity === 'gold';
  const isGoldHead = headItem?.rarity === 'gold';
  const isGoldLegs = legItem?.rarity === 'gold';
  const isGoldWeapon = weaponItem?.rarity === 'gold';

  const isAnyMythic = isMythicBody || isMythicHead || isMythicLegs || isMythicWeapon || hasMythic;
  const isAnyGold = isGoldBody || isGoldHead || isGoldLegs || isGoldWeapon || hasGold;

  // Count active sets for full set transcendence
  const setCountMap: Record<string, number> = {};
  Object.values(equipped).forEach(i => {
    if (i?.setId) setCountMap[i.setId] = (setCountMap[i.setId] || 0) + 1;
  });
  const fullSetId = Object.keys(setCountMap).find(id => setCountMap[id] >= 6);

  // 1. FULL SET TRANSCENDENCE AURAS (Behind Hero)
  if (fullSetId === 'celestial_god') {
    // Divine Radiance God Rays & Celestial Wings
    const wingFlap = Math.sin(time * 0.008) * 8;
    ctx.save();
    ctx.translate(hx + 12, hy + 10);
    const rayAngle = time * 0.003;
    ctx.rotate(rayAngle);
    ctx.fillStyle = 'rgba(232, 121, 249, 0.15)';
    for (let r = 0; r < 8; r++) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos((r * Math.PI) / 4) * 55, Math.sin((r * Math.PI) / 4) * 55);
      ctx.lineTo(Math.cos(((r + 0.3) * Math.PI) / 4) * 55, Math.sin(((r + 0.3) * Math.PI) / 4) * 55);
      ctx.fill();
    }
    ctx.restore();

    // Cosmic Angel Wings
    ctx.fillStyle = 'rgba(250, 204, 21, 0.65)';
    ctx.beginPath();
    ctx.moveTo(hx + 6, hy + 12);
    ctx.lineTo(hx - 22, hy - 14 + wingFlap);
    ctx.lineTo(hx - 6, hy + 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx + 18, hy + 12);
    ctx.lineTo(hx + 46, hy - 14 + wingFlap);
    ctx.lineTo(hx + 30, hy + 2);
    ctx.fill();
  } else if (fullSetId === 'chaos_lord') {
    // Demonic Beating Wings of the Abyss
    const wingFlap = Math.sin(time * 0.01) * 7;
    ctx.fillStyle = '#881337';
    ctx.beginPath();
    ctx.moveTo(hx + 6, hy + 12);
    ctx.lineTo(hx - 24, hy - 10 + wingFlap);
    ctx.lineTo(hx - 12, hy + 6);
    ctx.lineTo(hx - 4, hy + 18);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(hx + 18, hy + 12);
    ctx.lineTo(hx + 48, hy - 10 + wingFlap);
    ctx.lineTo(hx + 36, hy + 6);
    ctx.lineTo(hx + 28, hy + 18);
    ctx.fill();
  } else if (fullSetId === 'dragon_fury') {
    // Orbiting Fireballs & Dragon Spirit Roar
    for (let f = 0; f < 3; f++) {
      const fAngle = time * 0.007 + (f * Math.PI * 2) / 3;
      const fx = hx + 12 + Math.cos(fAngle) * 28;
      const fy = hy + 12 + Math.sin(fAngle) * 14;
      ctx.fillStyle = '#ea580c';
      pCircle(ctx, fx, fy, 4);
      ctx.fillStyle = '#fef08a';
      pCircle(ctx, fx, fy, 2);
    }
  } else if (fullSetId === 'iron_warden') {
    // Orbiting Steel Aegis Shield
    const sAngle = time * 0.005;
    const sx = hx + 12 + Math.cos(sAngle) * 26;
    const sy = hy + 14 + Math.sin(sAngle) * 10;
    ctx.fillStyle = '#38bdf8';
    pRect(ctx, sx - 4, sy - 6, 8, 12);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, sx - 2, sy - 4, 4, 8);
  } else if (fullSetId === 'shadow_stalker') {
    // Shadow Phantom Afterimage
    if (isWalking || isAttacking) {
      ctx.fillStyle = 'rgba(88, 28, 135, 0.4)';
      pRect(ctx, hx - 14, hy + 4, 16, 26);
    }
  }

  // Scorched Ground / Lava Cracks if wearing Mythic Draconic gear
  if (isMythicLegs || hasMythic) {
    const auraPulse = (Math.sin(time * 0.008) + 1) * 0.5;
    ctx.save();
    ctx.translate(hx + 12, 212);
    ctx.scale(1, 0.35);
    const ringGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 36);
    ringGrad.addColorStop(0, 'rgba(239, 68, 68, 0.5)');
    ringGrad.addColorStop(0.6, 'rgba(245, 158, 11, 0.3)');
    ringGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 36 + auraPulse * 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Scorched lava cracks on the platform
    ctx.fillStyle = `rgba(239, 68, 68, ${0.4 + auraPulse * 0.3})`;
    pRect(ctx, hx + 2, 211, 20, 2);
    pRect(ctx, hx + 5, 210, 14, 2);
    pRect(ctx, hx + 8, 210, 6, 2, '#fef08a');

    // Rising fiery sparks from boots
    for (let e = 0; e < 4; e++) {
      const ex = hx + 3 + ((e * 6 + time * 0.02) % 18);
      const ey = 210 - ((time * 0.05 + e * 14) % 36);
      ctx.fillStyle = e % 2 === 0 ? '#f59e0b' : '#ef4444';
      pRect(ctx, ex, ey, 1.5, 1.5);
    }
  } else if (isGoldLegs || hasGold) {
    // Holy Paladin Golden Radiance for Imperial Crusader Gold tier
    const auraPulse = (Math.sin(time * 0.008) + 1) * 0.5;
    ctx.save();
    ctx.translate(hx + 12, 212);
    ctx.scale(1, 0.35);
    const ringGrad = ctx.createRadialGradient(0, 0, 10, 0, 0, 32);
    ringGrad.addColorStop(0, 'rgba(250, 204, 21, 0.45)');
    ringGrad.addColorStop(0.6, 'rgba(59, 130, 246, 0.2)');
    ringGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.arc(0, 0, 32 + auraPulse * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Soft ground shadow
  ctx.fillStyle = 'rgba(6, 4, 14, 0.6)';
  ctx.beginPath();
  ctx.ellipse(hx + 12, 212, 18 + (isAttacking ? 5 : 0), 6, 0, 0, Math.PI * 2);
  ctx.fill();

  // Color Palettes
  const skinTones = {
    base: '#ffcca3',
    shadow: '#f09a67',
    highlight: '#ffe6d1',
    deepShadow: '#c4693a',
  };
  const hairTones = {
    base: '#c2410c',
    highlight: '#fb923c',
    shadow: '#7c2d12',
  };
  const boxerTones = {
    base: '#52525b',
    shadow: '#3f3f46',
    band: '#71717a',
    stitch: '#a1a1aa',
  };

  // Hit flash tint
  if (isHit) {
    ctx.filter = 'drop-shadow(0 0 10px rgba(239,68,68,0.9)) brightness(1.4)';
  }

  /* -------------------------------------------------------------
     A. BACK ACCESSORIES (Flowing Cloak by Tier)
     ------------------------------------------------------------- */
  if (isMythicBody) {
    // DRACONIC SCALE CLOAK (ONLY MYTHIC TIER)
    const cloakWave = Math.sin(time * 0.012) * 6 + (isWalking ? 8 : 2);
    ctx.fillStyle = '#450a0a';
    ctx.beginPath();
    ctx.moveTo(hx + 4, hy + 4);
    ctx.lineTo(hx - 18 - cloakWave, hy + 34);
    ctx.lineTo(hx - 9 - cloakWave, hy + 42);
    ctx.lineTo(hx - 1 - cloakWave, hy + 38);
    ctx.lineTo(hx + 14, hy + 18);
    ctx.fill();

    // Draconic scale pattern on cloak
    ctx.fillStyle = '#7f1d1d';
    pRect(ctx, hx - 9 - cloakWave, hy + 18, 5, 5);
    pRect(ctx, hx - 5 - cloakWave, hy + 26, 5, 5);
    pRect(ctx, hx - 12 - cloakWave, hy + 28, 4, 4);

    ctx.fillStyle = '#dc2626';
    pRect(ctx, hx - 18 - cloakWave, hy + 33, 7, 3);
    pRect(ctx, hx - 9 - cloakWave, hy + 41, 8, 3);
    pRect(ctx, hx - 1 - cloakWave, hy + 37, 6, 2);
  } else if (isGoldBody) {
    // IMPERIAL CRUSADER ROYAL MANTLE (GOLD TIER ONLY - L2 S-Grade)
    // Flowing pure white cloak with royal gold embroidery borders
    const cloakWave = Math.sin(time * 0.012) * 6 + (isWalking ? 8 : 2);
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(hx + 4, hy + 4);
    ctx.lineTo(hx - 18 - cloakWave, hy + 34);
    ctx.lineTo(hx - 9 - cloakWave, hy + 42);
    ctx.lineTo(hx - 1 - cloakWave, hy + 38);
    ctx.lineTo(hx + 14, hy + 18);
    ctx.fill();

    // Royal Gilded embroidery border
    ctx.fillStyle = '#fbbf24';
    pRect(ctx, hx - 18 - cloakWave, hy + 33, 7, 3);
    pRect(ctx, hx - 9 - cloakWave, hy + 41, 8, 3);
    pRect(ctx, hx - 1 - cloakWave, hy + 37, 6, 2);
    // Golden Cross embroidery on back
    ctx.fillStyle = '#f59e0b';
    pRect(ctx, hx - 9 - cloakWave, hy + 22, 4, 8);
    pRect(ctx, hx - 12 - cloakWave, hy + 24, 10, 3);
  } else if (bodyItem?.rarity === 'epic') {
    // SIMPLE SHADOW CLOAK (Epic tier - sleek violet fabric)
    const cloakWave = Math.sin(time * 0.012) * 5 + (isWalking ? 6 : 2);
    ctx.fillStyle = '#3b0764';
    ctx.beginPath();
    ctx.moveTo(hx + 5, hy + 6);
    ctx.lineTo(hx - 12 - cloakWave, hy + 32);
    ctx.lineTo(hx - 6 - cloakWave, hy + 38);
    ctx.lineTo(hx + 12, hy + 18);
    ctx.fill();
    ctx.fillStyle = '#7e22ce';
    pRect(ctx, hx - 12 - cloakWave, hy + 31, 6, 3);
  }

  /* -------------------------------------------------------------
     B. LEGS / FEET (Taller, muscular heroic legs)
     ------------------------------------------------------------- */
  const leftLegX = hx + 4 + walkLeg;
  const rightLegX = hx + 13 - walkLeg;
  const legY = hy + 26;

  if (legItem) {
    if (isMythicLegs) {
      // MASSIVE DRACONIC GREAVES & CLAWED BOOTS (ONLY MYTHIC TIER)
      ctx.fillStyle = '#18181b';
      pRect(ctx, leftLegX - 1, legY, 9, 22);
      pRect(ctx, rightLegX - 1, legY, 9, 22);

      // Overlapping segmented blood-red dragon scales
      ctx.fillStyle = '#991b1b';
      pRect(ctx, leftLegX - 1, legY + 2, 8, 4);
      pRect(ctx, rightLegX - 1, legY + 2, 8, 4);
      pRect(ctx, leftLegX - 1, legY + 7, 8, 4);
      pRect(ctx, rightLegX - 1, legY + 7, 8, 4);
      pRect(ctx, leftLegX - 1, legY + 12, 8, 4);
      pRect(ctx, rightLegX - 1, legY + 12, 8, 4);

      // Crimson highlight ridges
      ctx.fillStyle = '#ef4444';
      pRect(ctx, leftLegX, legY + 3, 6, 1);
      pRect(ctx, rightLegX, legY + 3, 6, 1);
      pRect(ctx, leftLegX, legY + 8, 6, 1);
      pRect(ctx, rightLegX, legY + 8, 6, 1);
      pRect(ctx, leftLegX, legY + 13, 6, 1);
      pRect(ctx, rightLegX, legY + 13, 6, 1);

      // PROTRUDING KNEE HORN SPIKES
      ctx.fillStyle = '#b91c1c';
      pRect(ctx, leftLegX - 4, legY + 2, 5, 5);
      pRect(ctx, rightLegX + 7, legY + 2, 5, 5);
      ctx.fillStyle = '#dc2626';
      pRect(ctx, leftLegX - 6, legY, 4, 4);
      pRect(ctx, rightLegX + 9, legY, 4, 4);
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, leftLegX - 8, legY - 2, 3, 3);
      pRect(ctx, rightLegX + 11, legY - 2, 3, 3);
      ctx.fillStyle = '#fef08a';
      pRect(ctx, leftLegX - 9, legY - 3, 2, 2);
      pRect(ctx, rightLegX + 13, legY - 3, 2, 2);

      // LATERAL SPIKED CALF FINS
      ctx.fillStyle = '#7f1d1d';
      pRect(ctx, leftLegX - 3, legY + 11, 4, 5);
      pRect(ctx, rightLegX + 7, legY + 11, 4, 5);
      ctx.fillStyle = '#ef4444';
      pRect(ctx, leftLegX - 4, legY + 12, 2, 3);
      pRect(ctx, rightLegX + 9, legY + 12, 2, 3);

      // HEAVY ARMORED DRACONIC SABATONS WITH CLAWS
      ctx.fillStyle = '#18181b';
      pRect(ctx, leftLegX - 2, legY + 18, 11, 5);
      pRect(ctx, rightLegX - 2, legY + 18, 11, 5);
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, leftLegX - 4, legY + 19, 3, 4);
      pRect(ctx, leftLegX + 5, legY + 19, 3, 4);
      pRect(ctx, rightLegX - 4, legY + 19, 3, 4);
      pRect(ctx, rightLegX + 5, legY + 19, 3, 4);
      ctx.fillStyle = '#fef08a';
      pRect(ctx, leftLegX - 5, legY + 20, 2, 3);
      pRect(ctx, rightLegX - 5, legY + 20, 2, 3);
    } else if (isGoldLegs) {
      // IMPERIAL CRUSADER GAITERS & SABATONS (GOLD TIER ONLY - L2 S-Grade)
      ctx.fillStyle = '#0f172a';
      pRect(ctx, leftLegX - 1, legY, 9, 22);
      pRect(ctx, rightLegX - 1, legY, 9, 22);
      ctx.fillStyle = '#cbd5e1';
      pRect(ctx, leftLegX, legY + 1, 7, 19);
      pRect(ctx, rightLegX, legY + 1, 7, 19);
      ctx.fillStyle = '#f8fafc';
      pRect(ctx, leftLegX + 1, legY + 2, 5, 17);
      pRect(ctx, rightLegX + 1, legY + 2, 5, 17);

      // GOLDEN LION-HEAD KNEE COPS
      ctx.fillStyle = '#b45309';
      pRect(ctx, leftLegX - 2, legY + 1, 9, 6);
      pRect(ctx, rightLegX - 2, legY + 1, 9, 6);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, leftLegX - 1, legY + 2, 7, 4);
      pRect(ctx, rightLegX - 1, legY + 2, 7, 4);
      pRect(ctx, leftLegX + 1, legY + 3, 3, 2, '#2563eb');
      pRect(ctx, rightLegX + 1, legY + 3, 3, 2, '#2563eb');

      // Gilded Shin Ridges
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, leftLegX + 2, legY + 8, 2, 10);
      pRect(ctx, rightLegX + 2, legY + 8, 2, 10);
      ctx.fillStyle = '#fef08a';
      pRect(ctx, leftLegX + 2, legY + 9, 1, 8);
      pRect(ctx, rightLegX + 2, legY + 9, 1, 8);

      // HEAVY WHITE-STEEL SABATONS WITH GOLD KNIGHT SPURS
      ctx.fillStyle = '#0f172a';
      pRect(ctx, leftLegX - 2, legY + 17, 11, 6);
      pRect(ctx, rightLegX - 2, legY + 17, 11, 6);
      ctx.fillStyle = '#f8fafc';
      pRect(ctx, leftLegX - 1, legY + 18, 9, 5);
      pRect(ctx, rightLegX - 1, legY + 18, 9, 5);
      // Gold toe rims & spurs
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, leftLegX - 3, legY + 19, 3, 4);
      pRect(ctx, rightLegX + 6, legY + 19, 3, 4);
      pRect(ctx, leftLegX - 4, legY + 20, 2, 3, '#fef08a');
      pRect(ctx, rightLegX + 8, legY + 20, 2, 3, '#fef08a');
    } else {
      // SIMPLE DESIGNS FOR TIERS BELOW GOLD (Epic, Rare, Uncommon, Common)
      const legRarity = legItem.rarity;
      if (legRarity === 'epic') {
        // Simple sleek violet assassin boots
        ctx.fillStyle = '#1e1b4b';
        pRect(ctx, leftLegX, legY, 7, 20);
        pRect(ctx, rightLegX, legY, 7, 20);
        ctx.fillStyle = '#3b0764';
        pRect(ctx, leftLegX + 1, legY + 1, 5, 17);
        pRect(ctx, rightLegX + 1, legY + 1, 5, 17);
        ctx.fillStyle = '#7e22ce';
        pRect(ctx, leftLegX + 2, legY + 4, 3, 6);
        pRect(ctx, rightLegX + 2, legY + 4, 3, 6);
        ctx.fillStyle = '#581c87';
        pRect(ctx, leftLegX - 1, legY + 17, 9, 5);
        pRect(ctx, rightLegX - 1, legY + 17, 9, 5);
      } else if (legRarity === 'rare') {
        // Clean steel knight greaves
        ctx.fillStyle = '#334155';
        pRect(ctx, leftLegX, legY, 7, 20);
        pRect(ctx, rightLegX, legY, 7, 20);
        ctx.fillStyle = '#64748b';
        pRect(ctx, leftLegX + 1, legY + 1, 5, 17);
        pRect(ctx, rightLegX + 1, legY + 1, 5, 17);
        ctx.fillStyle = '#94a3b8';
        pRect(ctx, leftLegX + 2, legY + 3, 3, 4);
        pRect(ctx, rightLegX + 2, legY + 3, 3, 4);
        ctx.fillStyle = '#1e293b';
        pRect(ctx, leftLegX - 1, legY + 17, 9, 5);
        pRect(ctx, rightLegX - 1, legY + 17, 9, 5);
      } else if (legRarity === 'uncommon') {
        // Hunter leather boots
        ctx.fillStyle = '#14532d';
        pRect(ctx, leftLegX, legY, 7, 20);
        pRect(ctx, rightLegX, legY, 7, 20);
        ctx.fillStyle = '#15803d';
        pRect(ctx, leftLegX + 1, legY + 1, 5, 17);
        pRect(ctx, rightLegX + 1, legY + 1, 5, 17);
        ctx.fillStyle = '#78350f';
        pRect(ctx, leftLegX - 1, legY + 17, 9, 5);
        pRect(ctx, rightLegX - 1, legY + 17, 9, 5);
      } else {
        // Common: Rustic cloth wraps / leather shoes
        ctx.fillStyle = '#44403c';
        pRect(ctx, leftLegX, legY, 7, 20);
        pRect(ctx, rightLegX, legY, 7, 20);
        ctx.fillStyle = '#78716c';
        pRect(ctx, leftLegX + 1, legY + 2, 5, 15);
        pRect(ctx, rightLegX + 1, legY + 2, 5, 15);
        ctx.fillStyle = '#292524';
        pRect(ctx, leftLegX - 1, legY + 17, 9, 5);
        pRect(ctx, rightLegX - 1, legY + 17, 9, 5);
      }
    }
  } else {
    // TALLER NAKED ATHLETIC LEGS WITH MUSCLE DEFINITION
    ctx.fillStyle = skinTones.base;
    pRect(ctx, leftLegX, legY, 7, 20);
    ctx.fillStyle = skinTones.shadow;
    pRect(ctx, leftLegX + 5, legY, 2, 20);
    pRect(ctx, leftLegX + 1, legY + 6, 5, 3); // Knee definition
    ctx.fillStyle = skinTones.base;
    pRect(ctx, leftLegX - 1, legY + 17, 8, 5); // Foot
    ctx.fillStyle = skinTones.deepShadow;
    pRect(ctx, leftLegX + 5, legY + 19, 2, 3);

    ctx.fillStyle = skinTones.base;
    pRect(ctx, rightLegX, legY, 7, 20);
    ctx.fillStyle = skinTones.shadow;
    pRect(ctx, rightLegX + 5, legY, 2, 20);
    pRect(ctx, rightLegX + 1, legY + 6, 5, 3);
    ctx.fillStyle = skinTones.base;
    pRect(ctx, rightLegX - 1, legY + 17, 8, 5);
    ctx.fillStyle = skinTones.deepShadow;
    pRect(ctx, rightLegX + 5, legY + 19, 2, 3);
  }

  /* -------------------------------------------------------------
     C. TORSO & WAIST (Taller, sculpted chest & high-tier armor)
     ------------------------------------------------------------- */
  const torsoX = hx + 3;
  const torsoY = hy + 2; // Taller torso starting higher

  if (bodyItem) {
    if (isMythicBody) {
      // MASSIVE DRACONIC LEATHER CHESTPLATE (ONLY MYTHIC TIER)
      ctx.fillStyle = '#18181b';
      pRect(ctx, torsoX - 1, torsoY, 20, 24);

      // Segmented blood-red dragon scale plates
      ctx.fillStyle = '#991b1b';
      pRect(ctx, torsoX, torsoY + 2, 18, 5);
      pRect(ctx, torsoX + 1, torsoY + 8, 16, 5);
      pRect(ctx, torsoX + 1, torsoY + 14, 16, 5);
      pRect(ctx, torsoX + 2, torsoY + 19, 14, 4);

      // Scale ridges
      ctx.fillStyle = '#ef4444';
      pRect(ctx, torsoX + 2, torsoY + 3, 14, 1);
      pRect(ctx, torsoX + 3, torsoY + 9, 12, 1);
      pRect(ctx, torsoX + 3, torsoY + 15, 12, 1);

      // Armored high dragon neck collar
      ctx.fillStyle = '#18181b';
      pRect(ctx, torsoX + 1, torsoY - 4, 6, 6);
      pRect(ctx, torsoX + 11, torsoY - 4, 6, 6);
      ctx.fillStyle = '#991b1b';
      pRect(ctx, torsoX + 2, torsoY - 3, 4, 5);
      pRect(ctx, torsoX + 12, torsoY - 3, 4, 5);
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, torsoX + 1, torsoY - 5, 2, 2);
      pRect(ctx, torsoX + 15, torsoY - 5, 2, 2);

      // CENTRAL BURNING DRAGON EYE (Heart of Valakas)
      const eyePulse = (Math.sin(time * 0.008) + 1) * 0.5;
      const eyeGlow = ctx.createRadialGradient(torsoX + 9, torsoY + 10, 1, torsoX + 9, torsoY + 10, 14);
      eyeGlow.addColorStop(0, `rgba(239, 68, 68, ${0.4 + eyePulse * 0.3})`);
      eyeGlow.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = eyeGlow;
      ctx.fillRect(torsoX - 3, torsoY, 24, 24);

      // Dragon eye casing
      ctx.fillStyle = '#18181b';
      pRect(ctx, torsoX + 4, torsoY + 6, 10, 9);
      ctx.fillStyle = '#450a0a';
      pRect(ctx, torsoX + 5, torsoY + 7, 8, 7);
      ctx.fillStyle = '#dc2626';
      pRect(ctx, torsoX + 6, torsoY + 8, 6, 5);
      ctx.fillStyle = '#f97316';
      pRect(ctx, torsoX + 7, torsoY + 8, 4, 4);
      ctx.fillStyle = '#facc15';
      pRect(ctx, torsoX + 7, torsoY + 9, 4, 2);
      // Slit pupil
      ctx.fillStyle = '#1c0505';
      pRect(ctx, torsoX + 8, torsoY + 7, 2, 6);
      ctx.fillStyle = '#ffffff';
      pRect(ctx, torsoX + 8, torsoY + 8, 1, 1);

      // Gold filigree claws locking the eye
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, torsoX + 4, torsoY + 9, 2, 2);
      pRect(ctx, torsoX + 12, torsoY + 9, 2, 2);
      pRect(ctx, torsoX + 8, torsoY + 6, 2, 1);
      pRect(ctx, torsoX + 8, torsoY + 14, 2, 1);

      // SEGMENTED DRAGON TAIL LOINPLATE
      const tailSway = Math.sin(time * 0.006) * 2 + (isWalking ? Math.sin(walkCycle * 4) * 2.5 : 0);
      ctx.fillStyle = '#18181b';
      pRect(ctx, torsoX + 5 + tailSway, torsoY + 22, 8, 16);
      ctx.fillStyle = '#991b1b';
      pRect(ctx, torsoX + 6 + tailSway, torsoY + 23, 6, 4);
      pRect(ctx, torsoX + 6 + tailSway, torsoY + 28, 6, 4);
      ctx.fillStyle = '#dc2626';
      pRect(ctx, torsoX + 7 + tailSway, torsoY + 33, 4, 4);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, torsoX + 7 + tailSway, torsoY + 37, 2, 2);

      // COLOSSAL DRACONIC HORN PAULDRONS
      // Left Pauldron
      ctx.fillStyle = '#18181b';
      pRect(ctx, torsoX - 8, torsoY + 1, 10, 11);
      ctx.fillStyle = '#7f1d1d';
      pRect(ctx, torsoX - 9, torsoY - 2, 9, 9);
      ctx.fillStyle = '#991b1b';
      pRect(ctx, torsoX - 10, torsoY - 6, 7, 7);
      ctx.fillStyle = '#dc2626';
      pRect(ctx, torsoX - 12, torsoY - 11, 6, 8);
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, torsoX - 13, torsoY - 16, 4, 6);
      ctx.fillStyle = '#fef08a';
      pRect(ctx, torsoX - 13, torsoY - 18, 2, 3);

      // Right Pauldron
      ctx.fillStyle = '#18181b';
      pRect(ctx, torsoX + 16, torsoY + 1, 10, 11);
      ctx.fillStyle = '#7f1d1d';
      pRect(ctx, torsoX + 18, torsoY - 2, 9, 9);
      ctx.fillStyle = '#991b1b';
      pRect(ctx, torsoX + 21, torsoY - 6, 7, 7);
      ctx.fillStyle = '#dc2626';
      pRect(ctx, torsoX + 24, torsoY - 11, 6, 8);
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, torsoX + 26, torsoY - 16, 4, 6);
      ctx.fillStyle = '#fef08a';
      pRect(ctx, torsoX + 27, torsoY - 18, 2, 3);
    } else if (isGoldBody) {
      // IMPERIAL CRUSADER HEAVY PLATE CUIRASS (GOLD TIER ONLY - L2 S-Grade)
      ctx.fillStyle = '#0f172a';
      pRect(ctx, torsoX - 1, torsoY, 20, 24);
      ctx.fillStyle = '#cbd5e1';
      pRect(ctx, torsoX, torsoY + 1, 18, 22);
      ctx.fillStyle = '#f8fafc';
      pRect(ctx, torsoX + 1, torsoY + 2, 16, 20);
      ctx.fillStyle = '#ffffff';
      pRect(ctx, torsoX + 2, torsoY + 2, 14, 6);

      // Raised Gilded Gorget Collar around neck
      ctx.fillStyle = '#b45309';
      pRect(ctx, torsoX + 2, torsoY - 3, 14, 5);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, torsoX + 3, torsoY - 2, 12, 3);
      ctx.fillStyle = '#fef08a';
      pRect(ctx, torsoX + 4, torsoY - 3, 10, 1);

      // GOLDEN IMPERIAL SUNBURST CROSS ON CHEST
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, torsoX + 7, torsoY + 5, 4, 10);
      pRect(ctx, torsoX + 5, torsoY + 7, 8, 4);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, torsoX + 6, torsoY + 6, 6, 6);
      // Central Royal Sapphire Jewel
      ctx.fillStyle = '#1e3a8a';
      pRect(ctx, torsoX + 7, torsoY + 7, 4, 4);
      ctx.fillStyle = '#38bdf8';
      pRect(ctx, torsoX + 8, torsoY + 8, 2, 2);
      ctx.fillStyle = '#ffffff';
      pRect(ctx, torsoX + 8, torsoY + 8, 1, 1);

      // MASSIVE ROUNDED IMPERIAL CRUSADER PAULDRONS
      // Left Pauldron
      ctx.fillStyle = '#0f172a';
      pRect(ctx, torsoX - 7, torsoY, 9, 11);
      ctx.fillStyle = '#cbd5e1';
      pRect(ctx, torsoX - 6, torsoY + 1, 8, 9);
      ctx.fillStyle = '#f8fafc';
      pRect(ctx, torsoX - 5, torsoY + 2, 6, 7);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, torsoX - 8, torsoY + 1, 2, 9);
      pRect(ctx, torsoX - 7, torsoY - 2, 8, 3);
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, torsoX - 5, torsoY + 4, 4, 4);

      // Right Pauldron
      ctx.fillStyle = '#0f172a';
      pRect(ctx, torsoX + 16, torsoY, 9, 11);
      ctx.fillStyle = '#cbd5e1';
      pRect(ctx, torsoX + 16, torsoY + 1, 8, 9);
      ctx.fillStyle = '#f8fafc';
      pRect(ctx, torsoX + 17, torsoY + 2, 6, 7);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, torsoX + 24, torsoY + 1, 2, 9);
      pRect(ctx, torsoX + 17, torsoY - 2, 8, 3);
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, torsoX + 19, torsoY + 4, 4, 4);

      // Gilded Plate Belt with Lion Buckle
      ctx.fillStyle = '#0f172a';
      pRect(ctx, torsoX, torsoY + 20, 18, 5);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, torsoX + 1, torsoY + 20, 16, 4);
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, torsoX + 7, torsoY + 19, 4, 6);
      ctx.fillStyle = '#38bdf8';
      pRect(ctx, torsoX + 8, torsoY + 21, 2, 2);

      // Side White/Gold Tassets
      pRect(ctx, torsoX + 1, torsoY + 24, 5, 5, '#f8fafc');
      pRect(ctx, torsoX + 1, torsoY + 28, 5, 1, '#fbbf24');
      pRect(ctx, torsoX + 12, torsoY + 24, 5, 5, '#f8fafc');
      pRect(ctx, torsoX + 12, torsoY + 28, 5, 1, '#fbbf24');
    } else {
      // SIMPLE DESIGNS FOR TIERS BELOW GOLD (Epic, Rare, Uncommon, Common)
      const bodyRarity = bodyItem.rarity;
      if (bodyRarity === 'epic') {
        // Sleek purple assassin vest
        ctx.fillStyle = '#1e1b4b';
        pRect(ctx, torsoX, torsoY, 18, 23);
        ctx.fillStyle = '#3b0764';
        pRect(ctx, torsoX + 2, torsoY + 2, 14, 18);
        ctx.fillStyle = '#7e22ce';
        pRect(ctx, torsoX + 6, torsoY + 5, 6, 11);
        pRect(ctx, torsoX + 8, torsoY + 8, 2, 3, '#c084fc');
        ctx.fillStyle = '#581c87';
        pRect(ctx, torsoX - 3, torsoY + 2, 4, 7);
        pRect(ctx, torsoX + 17, torsoY + 2, 4, 7);
        ctx.fillStyle = '#0f172a';
        pRect(ctx, torsoX, torsoY + 20, 18, 4);
      } else if (bodyRarity === 'rare') {
        // Steel knight breastplate
        ctx.fillStyle = '#334155';
        pRect(ctx, torsoX, torsoY, 18, 23);
        ctx.fillStyle = '#64748b';
        pRect(ctx, torsoX + 2, torsoY + 2, 14, 18);
        ctx.fillStyle = '#94a3b8';
        pRect(ctx, torsoX + 4, torsoY + 4, 10, 7);
        pRect(ctx, torsoX + 8, torsoY + 12, 2, 6, '#cbd5e1');
        ctx.fillStyle = '#475569';
        pRect(ctx, torsoX - 3, torsoY + 2, 4, 7);
        pRect(ctx, torsoX + 17, torsoY + 2, 4, 7);
        ctx.fillStyle = '#1e293b';
        pRect(ctx, torsoX, torsoY + 20, 18, 4);
        pRect(ctx, torsoX + 7, torsoY + 20, 4, 4, '#94a3b8');
      } else if (bodyRarity === 'uncommon') {
        // Green hunter leather jerkin
        ctx.fillStyle = '#14532d';
        pRect(ctx, torsoX, torsoY, 18, 23);
        ctx.fillStyle = '#15803d';
        pRect(ctx, torsoX + 2, torsoY + 2, 14, 18);
        ctx.fillStyle = '#166534';
        pRect(ctx, torsoX + 5, torsoY + 4, 8, 9);
        ctx.fillStyle = '#78350f';
        pRect(ctx, torsoX, torsoY + 20, 18, 4);
      } else {
        // Common: Simple cloth tunic
        ctx.fillStyle = '#57534e';
        pRect(ctx, torsoX, torsoY, 18, 23);
        ctx.fillStyle = '#78716c';
        pRect(ctx, torsoX + 2, torsoY + 2, 14, 18);
        ctx.fillStyle = '#292524';
        pRect(ctx, torsoX, torsoY + 20, 18, 4);
      }
    }
  } else {
    // TALLER NAKED TORSO WITH PRECISE MUSCLE ANATOMY (6-Pack, Pectorals, Deltoids)
    ctx.fillStyle = skinTones.base;
    pRect(ctx, torsoX, torsoY, 18, 17);
    // Pectorals
    ctx.fillStyle = skinTones.shadow;
    pRect(ctx, torsoX + 2, torsoY + 2, 6, 2);
    pRect(ctx, torsoX + 10, torsoY + 2, 6, 2);
    pRect(ctx, torsoX + 2, torsoY + 5, 6, 4);
    pRect(ctx, torsoX + 10, torsoY + 5, 6, 4);
    // 6-Pack Abs definition
    pRect(ctx, torsoX + 4, torsoY + 10, 4, 3);
    pRect(ctx, torsoX + 10, torsoY + 10, 4, 3);
    pRect(ctx, torsoX + 4, torsoY + 14, 4, 3);
    pRect(ctx, torsoX + 10, torsoY + 14, 4, 3);
    ctx.fillStyle = skinTones.deepShadow;
    pRect(ctx, torsoX + 8, torsoY + 17, 2, 2);

    // Boxer shorts
    ctx.fillStyle = boxerTones.band;
    pRect(ctx, torsoX, torsoY + 19, 18, 4);
    ctx.fillStyle = boxerTones.stitch;
    pRect(ctx, torsoX + 7, torsoY + 19, 4, 3);
    ctx.fillStyle = boxerTones.base;
    pRect(ctx, torsoX, torsoY + 23, 18, 6);
    ctx.fillStyle = boxerTones.shadow;
    pRect(ctx, torsoX + 8, torsoY + 23, 2, 6);
  }

  /* -------------------------------------------------------------
     D. HEAD & FACE (Crisper facial features, eyes, hair)
     ------------------------------------------------------------- */
  const headX = hx + 5;
  const headY = hy - 14; // Higher head for taller stature

  ctx.fillStyle = skinTones.base;
  pRect(ctx, headX, headY, 15, 16);
  ctx.fillStyle = skinTones.shadow;
  pRect(ctx, headX + 1, headY + 14, 13, 2);
  pRect(ctx, headX + 13, headY + 3, 2, 11);

  // Eyes & Eyebrows
  if (isHit) {
    ctx.fillStyle = '#0f172a';
    pRect(ctx, headX + 4, headY + 6, 3, 2);
    pRect(ctx, headX + 10, headY + 6, 3, 2);
  } else {
    ctx.fillStyle = '#ffffff';
    pRect(ctx, headX + 4, headY + 6, 3, 3);
    pRect(ctx, headX + 10, headY + 6, 3, 3);
    ctx.fillStyle = '#0284c7';
    pRect(ctx, headX + 5, headY + 6, 2, 3);
    pRect(ctx, headX + 11, headY + 6, 2, 3);
    ctx.fillStyle = '#0f172a';
    pRect(ctx, headX + 6, headY + 7, 1, 2);
    pRect(ctx, headX + 12, headY + 7, 1, 2);
    // Eyebrows
    ctx.fillStyle = hairTones.shadow;
    pRect(ctx, headX + 3, headY + 4, 4, 1);
    pRect(ctx, headX + 10, headY + 4, 4, 1);
  }

  // Mouth
  ctx.fillStyle = isAttacking ? '#7f1d1d' : skinTones.deepShadow;
  pRect(ctx, headX + 6, headY + 12, isAttacking ? 4 : 3, isAttacking ? 2 : 1);

  // Hair (if no full helmet)
  if (!equipped.head || equipped.head.name.includes('повязка')) {
    ctx.fillStyle = hairTones.base;
    pRect(ctx, headX - 1, headY - 4, 17, 6);
    pRect(ctx, headX - 2, headY - 2, 4, 9);
    pRect(ctx, headX + 13, headY - 2, 4, 9);
    pRect(ctx, headX + 2, headY - 7, 6, 4);
    pRect(ctx, headX + 9, headY - 6, 6, 4);
    pRect(ctx, headX + 13, headY - 5, 4, 4);

    const windHair = Math.sin(time * 0.008) * 2;
    ctx.fillStyle = hairTones.highlight;
    pRect(ctx, headX + 3, headY - 6, 4, 2);
    pRect(ctx, headX + 10, headY - 5, 4, 2);
    pRect(ctx, headX - 3 - windHair, headY + 2, 3, 4);
  }

  /* -------------------------------------------------------------
     E. HEADGEAR (Draconic vs Imperial Crusader vs Simple)
     ------------------------------------------------------------- */
  if (headItem) {
    if (isMythicHead) {
      // FULL-ENCLOSED DRACONIC VISOR HELM (ONLY MYTHIC TIER)
      ctx.fillStyle = '#18181b';
      pRect(ctx, headX - 2, headY - 7, 19, 21);
      ctx.fillStyle = '#7f1d1d';
      pRect(ctx, headX - 1, headY - 6, 17, 19);
      ctx.fillStyle = '#991b1b';
      pRect(ctx, headX, headY - 5, 15, 7);

      // Armored Jaw Guard & Fangs
      ctx.fillStyle = '#18181b';
      pRect(ctx, headX + 1, headY + 11, 13, 5);
      pRect(ctx, headX + 3, headY + 13, 9, 3);
      ctx.fillStyle = '#7f1d1d';
      pRect(ctx, headX + 4, headY + 12, 7, 2);
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, headX + 2, headY + 11, 2, 2);
      pRect(ctx, headX + 11, headY + 11, 2, 2);

      // Menacing horizontal slit visor grille
      ctx.fillStyle = '#09080e';
      pRect(ctx, headX + 2, headY + 4, 12, 6);

      // Piercing molten red eyes
      ctx.fillStyle = '#dc2626';
      pRect(ctx, headX + 3, headY + 5, 3, 2);
      pRect(ctx, headX + 9, headY + 5, 3, 2);
      ctx.fillStyle = '#ef4444';
      pRect(ctx, headX + 4, headY + 5, 2, 2);
      pRect(ctx, headX + 10, headY + 5, 2, 2);
      ctx.fillStyle = '#ffffff';
      pRect(ctx, headX + 4, headY + 5, 1, 1);
      pRect(ctx, headX + 10, headY + 5, 1, 1);

      // Grille vertical bars
      ctx.fillStyle = '#18181b';
      pRect(ctx, headX + 2, headY + 7, 12, 1);
      pRect(ctx, headX + 8, headY + 4, 1, 6);

      // COLOSSAL SWEPT-BACK DRAGON HORNS
      // Left Dragon Horn
      ctx.fillStyle = '#7f1d1d';
      pRect(ctx, headX - 4, headY - 9, 4, 8);
      ctx.fillStyle = '#991b1b';
      pRect(ctx, headX - 6, headY - 14, 4, 7);
      ctx.fillStyle = '#dc2626';
      pRect(ctx, headX - 8, headY - 18, 3, 5);
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, headX - 9, headY - 21, 3, 4);
      ctx.fillStyle = '#fef08a';
      pRect(ctx, headX - 10, headY - 23, 2, 3);

      // Right Dragon Horn
      ctx.fillStyle = '#7f1d1d';
      pRect(ctx, headX + 15, headY - 9, 4, 8);
      ctx.fillStyle = '#991b1b';
      pRect(ctx, headX + 17, headY - 14, 4, 7);
      ctx.fillStyle = '#dc2626';
      pRect(ctx, headX + 20, headY - 18, 3, 5);
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, headX + 21, headY - 21, 3, 4);
      ctx.fillStyle = '#fef08a';
      pRect(ctx, headX + 23, headY - 23, 2, 3);

      // Forehead dragon crest plate with ruby
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, headX + 5, headY - 5, 5, 5);
      ctx.fillStyle = '#ef4444';
      pRect(ctx, headX + 6, headY - 4, 3, 3);
      ctx.fillStyle = '#ffffff';
      pRect(ctx, headX + 7, headY - 4, 1, 1);
    } else if (isGoldHead) {
      // IMPERIAL CRUSADER HELMET (GOLD TIER ONLY - L2 S-Grade)
      ctx.fillStyle = '#0f172a';
      pRect(ctx, headX - 2, headY - 6, 19, 20);
      ctx.fillStyle = '#cbd5e1';
      pRect(ctx, headX - 1, headY - 5, 17, 18);
      ctx.fillStyle = '#f8fafc';
      pRect(ctx, headX, headY - 4, 15, 16);

      // Royal Golden Winged Crown Crest on Top
      ctx.fillStyle = '#b45309';
      pRect(ctx, headX + 3, headY - 9, 9, 4);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, headX + 4, headY - 10, 7, 4);
      pRect(ctx, headX + 5, headY - 12, 5, 3, '#fef08a');
      pRect(ctx, headX + 1, headY - 9, 3, 3, '#fbbf24');
      pRect(ctx, headX + 11, headY - 9, 3, 3, '#fbbf24');

      // Forehead Royal Sapphire Gem
      ctx.fillStyle = '#b45309';
      pRect(ctx, headX + 5, headY - 5, 5, 5);
      ctx.fillStyle = '#2563eb';
      pRect(ctx, headX + 6, headY - 4, 3, 3);
      ctx.fillStyle = '#ffffff';
      pRect(ctx, headX + 7, headY - 4, 1, 1);

      // Golden T-Cross Visor with Sapphire Eye Glint
      ctx.fillStyle = '#0f172a';
      pRect(ctx, headX + 2, headY + 3, 11, 5);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, headX + 1, headY + 2, 13, 1);
      pRect(ctx, headX + 6, headY + 2, 2, 9);
      // Visor eye glints
      ctx.fillStyle = '#38bdf8';
      pRect(ctx, headX + 3, headY + 4, 3, 2);
      pRect(ctx, headX + 9, headY + 4, 3, 2);
      ctx.fillStyle = '#ffffff';
      pRect(ctx, headX + 4, headY + 4, 1, 1);
      pRect(ctx, headX + 10, headY + 4, 1, 1);

      // Gilded Cheekguards & Chin Plate
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, headX + 1, headY + 7, 2, 7);
      pRect(ctx, headX + 12, headY + 7, 2, 7);
      pRect(ctx, headX + 4, headY + 12, 7, 2, '#fbbf24');
    } else {
      // SIMPLE DESIGNS FOR TIERS BELOW GOLD (Epic, Rare, Uncommon, Common)
      const headRarity = headItem.rarity;
      if (headRarity === 'epic') {
        // Sleek violet assassin cowl
        ctx.fillStyle = '#2e1065';
        pRect(ctx, headX - 1, headY - 5, 17, 19);
        ctx.fillStyle = '#3b0764';
        pRect(ctx, headX, headY - 4, 15, 17);
        ctx.fillStyle = '#0f172a';
        pRect(ctx, headX + 2, headY + 3, 11, 5);
        ctx.fillStyle = '#c084fc';
        pRect(ctx, headX + 3, headY + 4, 3, 2);
        pRect(ctx, headX + 9, headY + 4, 3, 2);
      } else if (headRarity === 'rare') {
        // Iron knight pot helm
        ctx.fillStyle = '#334155';
        pRect(ctx, headX - 1, headY - 5, 17, 18);
        ctx.fillStyle = '#64748b';
        pRect(ctx, headX, headY - 4, 15, 16);
        ctx.fillStyle = '#0f172a';
        pRect(ctx, headX + 2, headY + 3, 11, 4);
        ctx.fillStyle = '#38bdf8';
        pRect(ctx, headX + 3, headY + 4, 2, 2);
        pRect(ctx, headX + 9, headY + 4, 2, 2);
      } else if (headRarity === 'uncommon') {
        // Green hunter leather cap
        ctx.fillStyle = '#14532d';
        pRect(ctx, headX - 1, headY - 5, 17, 9);
        ctx.fillStyle = '#15803d';
        pRect(ctx, headX, headY - 4, 15, 7);
        pRect(ctx, headX + 4, headY - 4, 7, 2, '#22c55e');
      } else {
        // Common: Simple cloth headband
        ctx.fillStyle = '#57534e';
        pRect(ctx, headX - 1, headY + 1, 17, 5);
        ctx.fillStyle = '#78716c';
        pRect(ctx, headX, headY + 2, 15, 3);
      }
    }
  }

  /* -------------------------------------------------------------
     F. WEAPONS, ARMS & DYNAMIC COMBAT SLASH
     ------------------------------------------------------------- */
  const armX = hx + 16;
  const armY = hy + 8;

  ctx.save();
  ctx.translate(armX, armY);

  if (isAttacking) {
    const swingAngle = -Math.PI / 4 + attackPhase * Math.PI * 1.15;
    ctx.rotate(swingAngle);
  } else {
    ctx.rotate(Math.PI / 7 + Math.sin(time * 0.005) * 0.08);
  }

  // Upper arm & forearm
  ctx.fillStyle = skinTones.base;
  pRect(ctx, -2, -2, 5, 9);
  ctx.fillStyle = skinTones.shadow;
  pRect(ctx, 1, -2, 2, 9);
  ctx.fillStyle = skinTones.base;
  pRect(ctx, -2, 6, 6, 6);

  if (equipped.weapon) {
    const wpn = equipped.weapon;
    const wpnType: 'sword' | 'axe' | 'spear' = wpn.weaponType || (() => {
      const n = (wpn.name || '').toLowerCase();
      if (n.includes('топор') || n.includes('секир') || n.includes('коса') || n.includes('cleaver') || n.includes('battleaxe')) return 'axe';
      if (n.includes('копь') || n.includes('пик') || n.includes('трезуб') || n.includes('lance') || n.includes('halberd')) return 'spear';
      return 'sword';
    })();

    if (wpnType === 'sword') {
      // =====================================================================
      // 1. SWORD RENDERING
      // =====================================================================
      if (isMythicWeapon) {
        // Hilt & Grip
        ctx.fillStyle = '#78350f';
        pRect(ctx, -1, 3, 3, 10);
        ctx.fillStyle = '#d97706';
        pRect(ctx, -6, 2, 13, 3);
        ctx.fillStyle = '#ef4444';
        pRect(ctx, -1, 13, 3, 3);

        // MASSIVE DRACONIC SLAYER GREATSWORD (ONLY MYTHIC TIER)
        ctx.fillStyle = '#450a0a';
        pRect(ctx, -10, 0, 21, 5);
        ctx.fillStyle = '#f59e0b';
        pRect(ctx, -12, -2, 3, 4);
        pRect(ctx, 10, -2, 3, 4);

        // Colossal serrated blade
        ctx.fillStyle = '#18181b'; // Obsidian spine
        pRect(ctx, -4, -38, 9, 40);
        ctx.fillStyle = '#991b1b'; // Crimson dragon edge
        pRect(ctx, -3, -37, 7, 38);

        // Jagged dragon teeth along edge
        const flamePulse = Math.sin(time * 0.02) * 2;
        pRect(ctx, -6 + flamePulse, -28, 3, 6, '#ef4444');
        pRect(ctx, 4 + flamePulse, -20, 3, 6, '#ef4444');
        pRect(ctx, -5 + flamePulse, -12, 3, 5, '#ef4444');

        // Molten fuller with glowing dragon runes
        ctx.fillStyle = '#f97316';
        pRect(ctx, -1, -34, 3, 32);
        ctx.fillStyle = '#fef08a';
        pRect(ctx, 0, -32, 1, 28);

        // Glowing Dragon Eye at the crossguard
        ctx.fillStyle = '#ef4444';
        pCircle(ctx, 0, 2, 3);
        ctx.fillStyle = '#ffffff';
        pRect(ctx, 0, 1, 1, 1);
      } else if (isGoldWeapon) {
        // IMPERIAL CRUSADER HOLY GREATSWORD (GOLD TIER ONLY - L2 S-Grade)
        // Gilded Pommel with Sapphire
        ctx.fillStyle = '#b45309';
        pRect(ctx, -2, 12, 4, 4);
        ctx.fillStyle = '#2563eb';
        pRect(ctx, -1, 13, 2, 2);
        ctx.fillStyle = '#60a5fa';
        pRect(ctx, 0, 13, 1, 1);

        // White/Gold Grip
        ctx.fillStyle = '#f8fafc';
        pRect(ctx, -1, 3, 2, 9);
        pRect(ctx, -1, 4, 2, 2, '#fbbf24');
        pRect(ctx, -1, 8, 2, 2, '#fbbf24');

        // Winged Golden Crossguard
        ctx.fillStyle = '#b45309';
        pRect(ctx, -9, 0, 18, 4);
        ctx.fillStyle = '#fbbf24';
        pRect(ctx, -8, 1, 16, 2);
        pRect(ctx, -11, -2, 4, 4, '#fef08a');
        pRect(ctx, 7, -2, 4, 4, '#fef08a');
        // Central Guard Sapphire
        ctx.fillStyle = '#2563eb';
        pRect(ctx, -1, 1, 2, 2);
        ctx.fillStyle = '#ffffff';
        pRect(ctx, 0, 1, 1, 1);

        // BROAD GLEAMING PLATINUM HOLY BLADE
        ctx.fillStyle = '#94a3b8';
        pRect(ctx, -4, -36, 8, 37);
        ctx.fillStyle = '#cbd5e1';
        pRect(ctx, -3, -36, 6, 36);
        ctx.fillStyle = '#f8fafc';
        pRect(ctx, -2, -37, 4, 37);
        ctx.fillStyle = '#ffffff';
        pRect(ctx, -4, -34, 1, 32);
        pRect(ctx, 3, -34, 1, 32);

        // Central Holy Golden-Blue Fuller Rune
        ctx.fillStyle = '#fbbf24';
        pRect(ctx, -1, -30, 2, 26);
        ctx.fillStyle = '#38bdf8';
        pRect(ctx, 0, -28, 1, 22);

        // Diamond Blade Tip
        pRect(ctx, -2, -39, 4, 3, '#cbd5e1');
        pRect(ctx, -1, -40, 2, 2, '#f8fafc');
        pRect(ctx, 0, -41, 1, 2, '#ffffff');
      } else {
        const wpnRarity = wpn.rarity;
        if (wpnRarity === 'epic') {
          // Simple sleek violet assassin blade
          ctx.fillStyle = '#1e1b4b';
          pRect(ctx, -1, 3, 2, 8);
          ctx.fillStyle = '#7e22ce';
          pRect(ctx, -5, 2, 10, 2);
          ctx.fillStyle = '#9333ea';
          pRect(ctx, -2, -26, 4, 28);
          ctx.fillStyle = '#c084fc';
          pRect(ctx, -1, -25, 2, 26);
          ctx.fillStyle = '#ffffff';
          pRect(ctx, 0, -22, 1, 16);
        } else if (wpnRarity === 'rare') {
          // Simple clean steel knight broadsword
          ctx.fillStyle = '#78350f';
          pRect(ctx, -1, 3, 2, 8);
          ctx.fillStyle = '#475569';
          pRect(ctx, -6, 2, 12, 2);
          ctx.fillStyle = '#64748b';
          pRect(ctx, -2, -26, 4, 28);
          ctx.fillStyle = '#cbd5e1';
          pRect(ctx, -1, -25, 2, 26);
          ctx.fillStyle = '#ffffff';
          pRect(ctx, 0, -22, 1, 18);
        } else if (wpnRarity === 'uncommon') {
          // Simple hunting blade
          ctx.fillStyle = '#78350f';
          pRect(ctx, -1, 3, 2, 7);
          ctx.fillStyle = '#15803d';
          pRect(ctx, -4, 2, 8, 2);
          ctx.fillStyle = '#94a3b8';
          pRect(ctx, -2, -20, 3, 22);
          ctx.fillStyle = '#cbd5e1';
          pRect(ctx, -1, -19, 1, 20);
        } else {
          // Common: Simple wooden sword
          ctx.fillStyle = '#78350f';
          pRect(ctx, -1, 2, 3, 8);
          ctx.fillStyle = '#57534e';
          pRect(ctx, -4, 1, 8, 2);
          ctx.fillStyle = '#854d0e';
          pRect(ctx, -2, -18, 4, 19);
          ctx.fillStyle = '#a16207';
          pRect(ctx, -1, -17, 2, 16);
        }
      }
    } else if (wpnType === 'axe') {
      // =====================================================================
      // 2. AXE RENDERING
      // =====================================================================
      if (isMythicWeapon) {
        // DRACONIC CLEAVER / CHAOS AXE (ONLY MYTHIC TIER)
        // Long Obsidian Spiked Shaft
        ctx.fillStyle = '#18181b';
        pRect(ctx, -1, -34, 3, 46);
        ctx.fillStyle = '#f59e0b';
        pRect(ctx, -1, -18, 3, 2);
        pRect(ctx, -1, 0, 3, 2);
        ctx.fillStyle = '#b91c1c';
        pRect(ctx, -2, 12, 5, 3);
        pRect(ctx, -1, 15, 3, 2, '#fef08a');

        // Left Dragon Wing Crescent Blade
        ctx.fillStyle = '#18181b';
        pRect(ctx, -14, -34, 13, 22);
        ctx.fillStyle = '#7f1d1d';
        pRect(ctx, -13, -33, 11, 20);
        ctx.fillStyle = '#991b1b';
        pRect(ctx, -12, -31, 9, 16);
        ctx.fillStyle = '#ef4444';
        pRect(ctx, -15, -34, 2, 22);
        pRect(ctx, -16, -32, 2, 6, '#f59e0b');
        pRect(ctx, -16, -20, 2, 6, '#f59e0b');

        // Right Dragon Wing Crescent Blade
        ctx.fillStyle = '#18181b';
        pRect(ctx, 2, -34, 13, 22);
        ctx.fillStyle = '#7f1d1d';
        pRect(ctx, 2, -33, 11, 20);
        ctx.fillStyle = '#991b1b';
        pRect(ctx, 3, -31, 9, 16);
        ctx.fillStyle = '#ef4444';
        pRect(ctx, 14, -34, 2, 22);
        pRect(ctx, 15, -32, 2, 6, '#f59e0b');
        pRect(ctx, 15, -20, 2, 6, '#f59e0b');

        // Center Glowing Dragon Eye Socket & Top Flame Spike
        ctx.fillStyle = '#f59e0b';
        pRect(ctx, -3, -28, 7, 7);
        ctx.fillStyle = '#dc2626';
        pRect(ctx, -2, -27, 5, 5);
        ctx.fillStyle = '#ffffff';
        pRect(ctx, -1, -26, 3, 3);
        ctx.fillStyle = '#ef4444';
        pRect(ctx, -1, -40, 3, 7);
        pRect(ctx, 0, -42, 1, 3, '#fef08a');
      } else if (isGoldWeapon) {
        // IMPERIAL CRUSADER HOLY BATTLEAXE (GOLD TIER ONLY - L2 S-Grade)
        // White & Gold Shaft with Sapphire Pommel
        ctx.fillStyle = '#cbd5e1';
        pRect(ctx, -1, -32, 3, 44);
        ctx.fillStyle = '#f8fafc';
        pRect(ctx, 0, -31, 1, 42);
        ctx.fillStyle = '#fbbf24';
        pRect(ctx, -1, -16, 3, 2);
        pRect(ctx, -1, 2, 3, 2);
        ctx.fillStyle = '#b45309';
        pRect(ctx, -2, 12, 5, 3);
        ctx.fillStyle = '#2563eb';
        pRect(ctx, -1, 13, 3, 2);
        ctx.fillStyle = '#ffffff';
        pRect(ctx, 0, 14, 1, 1);

        // Left Holy Winged Crescent Blade
        ctx.fillStyle = '#94a3b8';
        pRect(ctx, -13, -32, 12, 19);
        ctx.fillStyle = '#cbd5e1';
        pRect(ctx, -12, -31, 10, 17);
        ctx.fillStyle = '#f8fafc';
        pRect(ctx, -11, -30, 8, 15);
        ctx.fillStyle = '#fbbf24';
        pRect(ctx, -14, -30, 2, 15);
        pRect(ctx, -15, -29, 2, 12, '#fef08a');

        // Right Holy Winged Crescent Blade
        ctx.fillStyle = '#94a3b8';
        pRect(ctx, 2, -32, 12, 19);
        ctx.fillStyle = '#cbd5e1';
        pRect(ctx, 2, -31, 10, 17);
        ctx.fillStyle = '#f8fafc';
        pRect(ctx, 3, -30, 8, 15);
        ctx.fillStyle = '#fbbf24';
        pRect(ctx, 13, -30, 2, 15);
        pRect(ctx, 14, -29, 2, 12, '#fef08a');

        // Central Sunburst Sapphire Crest & Top Diamond Spearhead
        ctx.fillStyle = '#b45309';
        pRect(ctx, -3, -26, 7, 7);
        ctx.fillStyle = '#fbbf24';
        pRect(ctx, -2, -25, 5, 5);
        ctx.fillStyle = '#2563eb';
        pRect(ctx, -1, -24, 3, 3);
        ctx.fillStyle = '#ffffff';
        pRect(ctx, 0, -24, 1, 1);
        ctx.fillStyle = '#cbd5e1';
        pRect(ctx, -1, -38, 3, 7);
        pRect(ctx, 0, -40, 1, 3, '#ffffff');
      } else {
        const wpnRarity = wpn.rarity;
        if (wpnRarity === 'epic') {
          // Blood Moon Greataxe
          ctx.fillStyle = '#1e1b4b';
          pRect(ctx, -1, -28, 3, 38);
          ctx.fillStyle = '#7e22ce';
          pRect(ctx, -1, -12, 3, 2);
          pRect(ctx, -1, 3, 3, 2);

          // Crescent Violet Double Blade
          ctx.fillStyle = '#3b0764';
          pRect(ctx, -11, -28, 10, 16);
          ctx.fillStyle = '#7e22ce';
          pRect(ctx, -10, -27, 8, 14);
          ctx.fillStyle = '#c084fc';
          pRect(ctx, -12, -26, 2, 12);

          ctx.fillStyle = '#3b0764';
          pRect(ctx, 2, -28, 10, 16);
          ctx.fillStyle = '#7e22ce';
          pRect(ctx, 2, -27, 8, 14);
          ctx.fillStyle = '#c084fc';
          pRect(ctx, 11, -26, 2, 12);

          ctx.fillStyle = '#9333ea';
          pRect(ctx, -2, -23, 5, 5);
          pRect(ctx, -1, -33, 3, 6, '#7e22ce');
        } else if (wpnRarity === 'rare') {
          // Double crescent knight battleaxe
          ctx.fillStyle = '#475569';
          pRect(ctx, -1, -26, 3, 36);
          ctx.fillStyle = '#38bdf8';
          pRect(ctx, -1, -10, 3, 2);
          pRect(ctx, -1, 4, 3, 2);

          ctx.fillStyle = '#334155';
          pRect(ctx, -10, -26, 9, 14);
          ctx.fillStyle = '#64748b';
          pRect(ctx, -9, -25, 7, 12);
          ctx.fillStyle = '#cbd5e1';
          pRect(ctx, -11, -24, 2, 10);

          ctx.fillStyle = '#334155';
          pRect(ctx, 2, -26, 9, 14);
          ctx.fillStyle = '#64748b';
          pRect(ctx, 2, -25, 7, 12);
          ctx.fillStyle = '#cbd5e1';
          pRect(ctx, 10, -24, 2, 10);

          ctx.fillStyle = '#38bdf8';
          pRect(ctx, -2, -21, 5, 4);
          pRect(ctx, -1, -31, 3, 6, '#cbd5e1');
        } else if (wpnRarity === 'uncommon') {
          // Woodsman battleaxe
          ctx.fillStyle = '#78350f';
          pRect(ctx, -1, -24, 3, 34);
          ctx.fillStyle = '#15803d';
          pRect(ctx, -1, 2, 3, 6);

          ctx.fillStyle = '#475569';
          pRect(ctx, -9, -24, 8, 13);
          ctx.fillStyle = '#94a3b8';
          pRect(ctx, -8, -23, 7, 10);
          ctx.fillStyle = '#cbd5e1';
          pRect(ctx, -10, -22, 2, 9);
          ctx.fillStyle = '#475569';
          pRect(ctx, 2, -21, 4, 6);
        } else {
          // Common Woodchopper axe
          ctx.fillStyle = '#78350f';
          pRect(ctx, -1, -20, 3, 30);
          ctx.fillStyle = '#57534e';
          pRect(ctx, -8, -20, 7, 11);
          ctx.fillStyle = '#78716c';
          pRect(ctx, -7, -19, 6, 8);
          ctx.fillStyle = '#a8a29e';
          pRect(ctx, -9, -18, 2, 7);
        }
      }
    } else {
      // =====================================================================
      // 3. SPEAR / LANCE / TRIDENT RENDERING
      // =====================================================================
      if (isMythicWeapon) {
        // DRACONIC HALBERD / MAGMA LANCE (ONLY MYTHIC TIER)
        // Long Obsidian Dragon-Bone Shaft
        ctx.fillStyle = '#18181b';
        pRect(ctx, -1, -26, 3, 48);
        ctx.fillStyle = '#f59e0b';
        pRect(ctx, -1, -12, 3, 2);
        pRect(ctx, -1, 6, 3, 2);
        ctx.fillStyle = '#b91c1c';
        pRect(ctx, -2, 20, 5, 3);
        pRect(ctx, -1, 22, 3, 2, '#fef08a');

        // Secondary Curved Dragon Talons / Side Hooks
        ctx.fillStyle = '#7f1d1d';
        pRect(ctx, -8, -24, 7, 5);
        pRect(ctx, -9, -25, 3, 4, '#ef4444');
        pRect(ctx, 2, -24, 7, 5, '#7f1d1d');
        pRect(ctx, 7, -25, 3, 4, '#ef4444');

        // Massive Serrated Dragon Horn Spearhead
        ctx.fillStyle = '#18181b';
        pRect(ctx, -4, -36, 9, 12);
        ctx.fillStyle = '#7f1d1d';
        pRect(ctx, -3, -39, 7, 14);
        ctx.fillStyle = '#dc2626';
        pRect(ctx, -2, -43, 5, 16);
        ctx.fillStyle = '#f97316';
        pRect(ctx, -1, -46, 3, 16);
        ctx.fillStyle = '#ffffff';
        pRect(ctx, 0, -48, 1, 6);

        // Dragon Eye Socket on Spear Base
        ctx.fillStyle = '#f59e0b';
        pRect(ctx, -2, -24, 5, 5);
        ctx.fillStyle = '#dc2626';
        pRect(ctx, -1, -23, 3, 3);
        ctx.fillStyle = '#ffffff';
        pRect(ctx, 0, -23, 1, 1);
      } else if (isGoldWeapon) {
        // IMPERIAL CRUSADER LANCE (GOLD TIER ONLY - L2 S-Grade)
        // White & Gold Spiral Pole with Gilded Butt Cap
        ctx.fillStyle = '#cbd5e1';
        pRect(ctx, -1, -24, 3, 44);
        ctx.fillStyle = '#f8fafc';
        pRect(ctx, 0, -23, 1, 42);
        ctx.fillStyle = '#fbbf24';
        pRect(ctx, -1, -10, 3, 2);
        pRect(ctx, -1, 6, 3, 2);
        ctx.fillStyle = '#b45309';
        pRect(ctx, -2, 18, 5, 3);
        ctx.fillStyle = '#2563eb';
        pRect(ctx, -1, 19, 3, 2);

        // Royal Winged Golden Pennants / Crossguard
        ctx.fillStyle = '#fbbf24';
        pRect(ctx, -8, -22, 7, 4);
        pRect(ctx, -10, -24, 3, 3, '#fef08a');
        ctx.fillStyle = '#fbbf24';
        pRect(ctx, 2, -22, 7, 4);
        pRect(ctx, 8, -24, 3, 3, '#fef08a');

        // Long Diamond Platinum Spearhead with Sapphire Center
        ctx.fillStyle = '#94a3b8';
        pRect(ctx, -4, -33, 9, 11);
        ctx.fillStyle = '#cbd5e1';
        pRect(ctx, -3, -37, 7, 13);
        ctx.fillStyle = '#f8fafc';
        pRect(ctx, -2, -41, 5, 14);
        ctx.fillStyle = '#38bdf8';
        pRect(ctx, -1, -44, 3, 13);
        ctx.fillStyle = '#ffffff';
        pRect(ctx, 0, -46, 1, 5);

        // Sapphire Jewel at Lance Base
        ctx.fillStyle = '#b45309';
        pRect(ctx, -2, -22, 5, 5);
        ctx.fillStyle = '#2563eb';
        pRect(ctx, -1, -21, 3, 3);
        ctx.fillStyle = '#ffffff';
        pRect(ctx, 0, -21, 1, 1);
      } else {
        const wpnRarity = wpn.rarity;
        if (wpnRarity === 'epic') {
          // VOID TRIDENT (Epic tier)
          ctx.fillStyle = '#1e1b4b';
          pRect(ctx, -1, -20, 3, 38);
          ctx.fillStyle = '#7e22ce';
          pRect(ctx, -1, 2, 3, 2);

          // 3-Pronged Violet Trident Head
          ctx.fillStyle = '#7e22ce';
          pRect(ctx, -7, -22, 15, 4);
          // Left prong
          ctx.fillStyle = '#9333ea';
          pRect(ctx, -7, -33, 3, 12);
          ctx.fillStyle = '#c084fc';
          pRect(ctx, -7, -35, 2, 3);
          // Right prong
          ctx.fillStyle = '#9333ea';
          pRect(ctx, 5, -33, 3, 12);
          ctx.fillStyle = '#c084fc';
          pRect(ctx, 6, -35, 2, 3);
          // Center spear
          ctx.fillStyle = '#c084fc';
          pRect(ctx, -2, -38, 5, 18);
          ctx.fillStyle = '#ffffff';
          pRect(ctx, -1, -41, 3, 5);
        } else if (wpnRarity === 'rare') {
          // STEEL KNIGHT LANCE (Rare tier)
          ctx.fillStyle = '#475569';
          pRect(ctx, -1, -20, 3, 38);
          ctx.fillStyle = '#38bdf8';
          pRect(ctx, -1, 3, 3, 4);

          // Crossbar lugs
          ctx.fillStyle = '#64748b';
          pRect(ctx, -6, -20, 13, 3);

          // Diamond-leaf steel point
          ctx.fillStyle = '#64748b';
          pRect(ctx, -3, -30, 7, 11);
          ctx.fillStyle = '#cbd5e1';
          pRect(ctx, -2, -35, 5, 14);
          ctx.fillStyle = '#ffffff';
          pRect(ctx, -1, -38, 3, 14);
        } else if (wpnRarity === 'uncommon') {
          // MILITIA STEEL SPEAR (Uncommon tier)
          ctx.fillStyle = '#78350f';
          pRect(ctx, -1, -18, 3, 36);
          ctx.fillStyle = '#15803d';
          pRect(ctx, -1, 0, 3, 4);
          ctx.fillStyle = '#64748b';
          pRect(ctx, -3, -26, 7, 9);
          ctx.fillStyle = '#94a3b8';
          pRect(ctx, -2, -31, 5, 12);
          ctx.fillStyle = '#cbd5e1';
          pRect(ctx, -1, -34, 3, 12);
        } else {
          // POINTED PIKE (Common tier)
          ctx.fillStyle = '#78350f';
          pRect(ctx, -1, -16, 3, 34);
          ctx.fillStyle = '#a16207';
          pRect(ctx, 0, -15, 1, 32);
          ctx.fillStyle = '#57534e';
          pRect(ctx, -3, -22, 7, 7);
          ctx.fillStyle = '#78716c';
          pRect(ctx, -2, -27, 5, 10);
          ctx.fillStyle = '#a8a29e';
          pRect(ctx, -1, -30, 3, 8);
        }
      }
    }
  } else {
    // BARE FISTS
    ctx.fillStyle = skinTones.base;
    pRect(ctx, -1, 10, 6, 6);
  }

  ctx.restore();

  // =========================================================================
  // DYNAMIC ANIMATED TIER-SCALED ATTACK EFFECTS (Common -> Mythic)
  // =========================================================================
  if (isAttacking) {
    const wpn = equipped.weapon;
    const wpnType: 'sword' | 'axe' | 'spear' = wpn?.weaponType || 'sword';
    const rarity: Rarity = wpn?.rarity || 'common';
    const progress = Math.min(1.0, Math.max(0, attackPhase)); // 0.0 -> 1.0
    const alpha = Math.sin(progress * Math.PI); // Smooth in & out

    ctx.save();
    ctx.translate(armX, armY);

    if (rarity === 'mythic') {
      // -----------------------------------------------------------------------
      // 6. MYTHIC: INFERNAL DRACONIC MAGMA ERUPTION (ULTRA SPECTACULAR)
      // -----------------------------------------------------------------------
      const expandRadius = 24 + progress * 32;
      const arcStart = -Math.PI * 0.65 + progress * 0.3;
      const arcEnd = Math.PI * 0.45 + progress * 0.4;

      if (wpnType === 'spear') {
        // Colossal Magma Drill Thrust
        const thrustLen = 20 + progress * 48;
        const thrustWidth = 8 + progress * 14;

        // Outer Flame Halo
        ctx.fillStyle = `rgba(239, 68, 68, ${alpha * 0.4})`;
        ctx.beginPath();
        ctx.moveTo(8, -thrustWidth * 1.6);
        ctx.lineTo(8 + thrustLen * 1.15, 0);
        ctx.lineTo(8, thrustWidth * 1.6);
        ctx.closePath();
        ctx.fill();

        // Triple Magma Jet Cones
        ctx.fillStyle = `rgba(249, 115, 22, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.moveTo(12, -thrustWidth);
        ctx.lineTo(12 + thrustLen, 0);
        ctx.lineTo(12, thrustWidth);
        ctx.closePath();
        ctx.fill();

        // Pure Solar Core
        ctx.fillStyle = `rgba(254, 240, 138, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(16, -thrustWidth * 0.45);
        ctx.lineTo(16 + thrustLen * 0.85, 0);
        ctx.lineTo(16, thrustWidth * 0.45);
        ctx.closePath();
        ctx.fill();

        // Expanding Magma Shock Rings
        for (let r = 0; r < 3; r++) {
          const ringDist = 14 + r * 16 + progress * 10;
          const ringSize = (4 + r * 3) * (1 - progress * 0.3);
          ctx.strokeStyle = r === 0 ? '#fef08a' : r === 1 ? '#f97316' : '#ef4444';
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          ctx.ellipse(ringDist, 0, ringSize * 0.5, ringSize, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else if (wpnType === 'axe') {
        // Tectonic Magma Ground Cleave
        const cleaveRad = 32 + progress * 24;

        // Multi-Layered Cleave Shockwave
        ctx.strokeStyle = `rgba(220, 38, 38, ${alpha * 0.85})`;
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.arc(8, 0, cleaveRad, arcStart - 0.1, arcEnd + 0.1);
        ctx.stroke();

        ctx.strokeStyle = `rgba(249, 115, 22, ${alpha * 0.95})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(8, 0, cleaveRad, arcStart, arcEnd);
        ctx.stroke();

        ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(8, 0, cleaveRad, arcStart + 0.1, arcEnd - 0.1);
        ctx.stroke();

        // Triple Dragon Claw Gouges
        for (let c = -1; c <= 1; c++) {
          const clawAngle = progress * Math.PI * 0.8 - Math.PI * 0.4 + c * 0.25;
          const cx = Math.cos(clawAngle) * cleaveRad;
          const cy = Math.sin(clawAngle) * cleaveRad;
          ctx.fillStyle = '#fef08a';
          pRect(ctx, cx - 3, cy - 3, 6, 6);
          ctx.fillStyle = '#dc2626';
          pRect(ctx, cx + 4, cy - 2, 4, 4);
        }
      } else {
        // Colossal Dragon Slayer Sweeping Magma Wave
        // Fiery outer crest
        ctx.strokeStyle = `rgba(185, 28, 28, ${alpha * 0.7})`;
        ctx.lineWidth = 12;
        ctx.beginPath();
        ctx.arc(6, 0, expandRadius + 4, arcStart, arcEnd);
        ctx.stroke();

        // Core Magma Stream
        ctx.strokeStyle = `rgba(234, 88, 12, ${alpha * 0.9})`;
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.arc(6, 0, expandRadius, arcStart + 0.05, arcEnd - 0.05);
        ctx.stroke();

        // Molten Gold Lightning Blade
        ctx.strokeStyle = `rgba(254, 240, 138, ${alpha})`;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(6, 0, expandRadius - 1, arcStart + 0.15, arcEnd - 0.15);
        ctx.stroke();

        // Erupting Volcanic Fireball Clustered Sparks
        for (let s = 0; s < 5; s++) {
          const sparkAngle = arcStart + ((arcEnd - arcStart) * s) / 4;
          const sparkDist = expandRadius + 6 + (s % 2) * 8 * progress;
          const sx = Math.cos(sparkAngle) * sparkDist;
          const sy = Math.sin(sparkAngle) * sparkDist;
          ctx.fillStyle = s % 2 === 0 ? '#fef08a' : '#ef4444';
          pRect(ctx, sx - 2, sy - 2, 4, 4);
        }
      }
    } else if (rarity === 'gold') {
      // -----------------------------------------------------------------------
      // 5. GOLD: CELESTIAL SUNBURST HOLY CLEAVE
      // -----------------------------------------------------------------------
      const holyRadius = 26 + progress * 24;
      const arcStart = -Math.PI * 0.55 + progress * 0.25;
      const arcEnd = Math.PI * 0.4 + progress * 0.35;

      // Divine Holy Radiance
      ctx.strokeStyle = `rgba(251, 191, 36, ${alpha * 0.85})`;
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.arc(6, 0, holyRadius, arcStart, arcEnd);
      ctx.stroke();

      // Pure White Consecrated Core
      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.95})`;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(6, 0, holyRadius, arcStart + 0.1, arcEnd - 0.1);
      ctx.stroke();

      // 4-Pointed Holy Cross Starburst at Blade Peak
      const starAngle = arcStart + (arcEnd - arcStart) * 0.6;
      const starX = Math.cos(starAngle) * holyRadius;
      const starY = Math.sin(starAngle) * holyRadius;
      const starSize = 7 * alpha;

      ctx.fillStyle = '#ffffff';
      pRect(ctx, starX - starSize, starY - 1, starSize * 2, 2);
      pRect(ctx, starX - 1, starY - starSize, 2, starSize * 2);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, starX - starSize * 0.6, starY - 1, starSize * 1.2, 2);
      pRect(ctx, starX - 1, starY - starSize * 0.6, 2, starSize * 1.2);

      // Holy Gilded Embers
      for (let f = 0; f < 4; f++) {
        const fAngle = arcStart + (f * (arcEnd - arcStart)) / 3;
        const fx = Math.cos(fAngle) * (holyRadius + 5);
        const fy = Math.sin(fAngle) * (holyRadius + 5);
        ctx.fillStyle = '#fef08a';
        pRect(ctx, fx - 1.5, fy - 1.5, 3, 3);
      }
    } else if (rarity === 'epic') {
      // -----------------------------------------------------------------------
      // 4. EPIC: ABYSSAL VOID RIFT (VIOLET PLASMA / SPATIAL TEAR)
      // -----------------------------------------------------------------------
      const voidRadius = 24 + progress * 20;
      const arcStart = -Math.PI * 0.5 + progress * 0.2;
      const arcEnd = Math.PI * 0.38 + progress * 0.3;

      // Dark Violet Void Halo
      ctx.strokeStyle = `rgba(88, 28, 135, ${alpha * 0.8})`;
      ctx.lineWidth = 7.0;
      ctx.beginPath();
      ctx.arc(6, 0, voidRadius, arcStart, arcEnd);
      ctx.stroke();

      // Magenta Plasma Core
      ctx.strokeStyle = `rgba(192, 132, 252, ${alpha * 0.95})`;
      ctx.lineWidth = 3.0;
      ctx.beginPath();
      ctx.arc(6, 0, voidRadius, arcStart + 0.08, arcEnd - 0.08);
      ctx.stroke();

      // Spatial Tear Cracks
      const crackAngle = arcStart + (arcEnd - arcStart) * 0.5;
      const cx = Math.cos(crackAngle) * voidRadius;
      const cy = Math.sin(crackAngle) * voidRadius;
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy - 4);
      ctx.lineTo(cx + 8, cy);
      ctx.lineTo(cx + 12, cy + 6);
      ctx.stroke();
    } else if (rarity === 'rare') {
      // -----------------------------------------------------------------------
      // 3. RARE: THUNDERSTORM / COBALT LIGHTNING SURGE
      // -----------------------------------------------------------------------
      const lightRadius = 24 + progress * 16;
      const arcStart = -Math.PI * 0.48;
      const arcEnd = Math.PI * 0.35;

      ctx.strokeStyle = `rgba(2, 132, 199, ${alpha * 0.8})`;
      ctx.lineWidth = 5.5;
      ctx.beginPath();
      ctx.arc(6, 0, lightRadius, arcStart, arcEnd);
      ctx.stroke();

      ctx.strokeStyle = `rgba(186, 230, 253, ${alpha * 0.95})`;
      ctx.lineWidth = 2.0;
      ctx.beginPath();
      ctx.arc(6, 0, lightRadius, arcStart + 0.06, arcEnd - 0.06);
      ctx.stroke();

      // Lightning discharge spark
      if (progress > 0.3) {
        const lx = Math.cos(arcEnd) * lightRadius;
        const ly = Math.sin(arcEnd) * lightRadius;
        ctx.fillStyle = '#ffffff';
        pRect(ctx, lx, ly - 2, 4, 4);
        ctx.fillStyle = '#38bdf8';
        pRect(ctx, lx + 3, ly - 4, 3, 3);
      }
    } else if (rarity === 'uncommon') {
      // -----------------------------------------------------------------------
      // 2. UNCOMMON: GALE WIND BLADE (EMERALD CYCLONE STREAK)
      // -----------------------------------------------------------------------
      const windRadius = 22 + progress * 14;
      ctx.strokeStyle = `rgba(22, 163, 74, ${alpha * 0.75})`;
      ctx.lineWidth = 4.5;
      ctx.beginPath();
      ctx.arc(6, 0, windRadius, -Math.PI * 0.45, Math.PI * 0.32);
      ctx.stroke();

      ctx.strokeStyle = `rgba(187, 247, 208, ${alpha * 0.9})`;
      ctx.lineWidth = 1.8;
      ctx.beginPath();
      ctx.arc(6, 0, windRadius, -Math.PI * 0.35, Math.PI * 0.22);
      ctx.stroke();
    } else {
      // -----------------------------------------------------------------------
      // 1. COMMON: SHARP STEEL SWEEP WITH SILVER SPARKS
      // -----------------------------------------------------------------------
      const slashRadius = 20 + progress * 12;
      ctx.strokeStyle = `rgba(148, 163, 184, ${alpha * 0.75})`;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(6, 0, slashRadius, -Math.PI * 0.42, Math.PI * 0.3);
      ctx.stroke();

      ctx.strokeStyle = `rgba(255, 255, 255, ${alpha * 0.85})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(6, 0, slashRadius, -Math.PI * 0.32, Math.PI * 0.2);
      ctx.stroke();
    }

    ctx.restore();
  }

  /* -------------------------------------------------------------
     G. ARTIFACT (Tier-Scaled Relic with Planetary Orbits)
     ------------------------------------------------------------- */
  if (equipped.artifact) {
    const artBob = Math.sin(time * 0.007) * 4;
    const artX = hx - 14;
    const artY = hy - 4 + artBob;
    const artColor = equipped.artifact.visualColor || '#818cf8';
    const artGlow = equipped.artifact.glowColor || '#c084fc';

    const artGrad = ctx.createRadialGradient(artX, artY, 2, artX, artY, 20);
    artGrad.addColorStop(0, `${artGlow}88`);
    artGrad.addColorStop(1, `${artGlow}00`);
    ctx.fillStyle = artGrad;
    ctx.beginPath();
    ctx.arc(artX, artY, 20, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = artColor;
    pRect(ctx, artX - 3, artY - 3, 7, 7);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, artX - 1, artY - 1, 3, 3);

    const orbitAngle = time * 0.009;
    ctx.save();
    ctx.translate(artX, artY);
    ctx.rotate(orbitAngle);
    ctx.fillStyle = '#facc15';
    pRect(ctx, 9, -1.5, 3, 3);
    pRect(ctx, -10, -1, 2, 2);
    ctx.restore();
  }

  /* -------------------------------------------------------------
     H. PET COMPANIONS (Slime, Dragon Ignis, Phoenix, Hound)
     ------------------------------------------------------------- */
  if (equipped.pet) {
    const petX = hx - 32;
    const petFloorY = 208;
    const petName = equipped.pet.name.toLowerCase();

    if (petName.includes('дракон')) {
      const flyBob = Math.sin(time * 0.008) * 6;
      const petY = petFloorY - 26 + flyBob;
      const wingFlap = Math.sin(time * 0.02) * 6;

      ctx.fillStyle = 'rgba(0,0,0,0.3)';
      ctx.beginPath();
      ctx.ellipse(petX + 8, petFloorY + 1, 10, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(petX + 4, petY + 3);
      ctx.lineTo(petX - 6, petY - 8 + wingFlap);
      ctx.lineTo(petX + 8, petY - 4 + wingFlap);
      ctx.fill();

      ctx.fillStyle = '#dc2626';
      pRect(ctx, petX, petY, 15, 11);
      pRect(ctx, petX + 8, petY - 5, 9, 9);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, petX + 13, petY - 3, 2, 2);
    } else if (petName.includes('пес') || petName.includes('волк')) {
      // Loyal Dog / Shadow Wolf
      const petY = petFloorY - 14;
      ctx.fillStyle = equipped.pet.visualColor || '#78716c';
      pRect(ctx, petX, petY, 16, 12);
      pRect(ctx, petX + 12, petY - 4, 8, 8);
      // Ears
      pRect(ctx, petX + 13, petY - 7, 3, 3, '#1c1917');
      // Tail wag
      const tailWag = Math.sin(time * 0.015) * 4;
      pRect(ctx, petX - 3, petY + 2 + tailWag, 4, 3, '#1c1917');
      // Eyes
      ctx.fillStyle = '#ffffff';
      pRect(ctx, petX + 16, petY - 2, 2, 2);
    } else if (petName.includes('феникс')) {
      // Golden Phoenix
      const flyBob = Math.sin(time * 0.009) * 5;
      const petY = petFloorY - 24 + flyBob;
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, petX, petY, 14, 12);
      // Wings
      const pWing = Math.sin(time * 0.02) * 5;
      ctx.fillStyle = '#f59e0b';
      pRect(ctx, petX - 4, petY - 3 + pWing, 6, 6);
      pRect(ctx, petX + 12, petY - 3 + pWing, 6, 6);
    } else {
      // Slime or Beast
      const slimeSquish = Math.sin(time * 0.01) * 3;
      const petY = petFloorY - 12 + slimeSquish * 0.5;

      ctx.fillStyle = 'rgba(0,0,0,0.4)';
      ctx.beginPath();
      ctx.ellipse(petX + 7, petFloorY + 1, 9 - slimeSquish * 0.5, 4, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = equipped.pet.visualColor || '#22c55e';
      pRect(ctx, petX, petY, 15, 12 - slimeSquish);
      ctx.fillStyle = '#ffffff';
      pRect(ctx, petX + 3, petY + 2, 3, 3);
      pRect(ctx, petX + 9, petY + 2, 3, 3);
      ctx.fillStyle = '#0f172a';
      pRect(ctx, petX + 4, petY + 3, 2, 2);
      pRect(ctx, petX + 10, petY + 3, 2, 2);
    }
  }

  ctx.restore();
}

/* =========================================================================
   3. DETAILED MONSTER & BOSS RENDERING
   ========================================================================= */

interface MonsterRenderParams {
  ctx: CanvasRenderingContext2D;
  mob: Monster;
  time: number;
  width: number;
  floorY: number;
}

export function drawDetailedMonster(params: MonsterRenderParams) {
  const { ctx, mob, time, width, floorY } = params;
  if (!mob || mob.currentHp <= 0) return;

  const isBoss = mob.type === 'boss';
  const isElite = mob.type === 'elite';
  const scale = mob.scale || (isBoss ? 1.65 : isElite ? 1.3 : 1.1);

  const mobX = width - 88 - (scale > 1.2 ? 32 : 0);
  const mobY = floorY - 44 * scale; // Higher starting position for taller monsters
  const mobBob = Math.sin(time * 0.006) * 3;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  // Ground shadow
  ctx.fillStyle = 'rgba(6, 4, 14, 0.6)';
  ctx.beginPath();
  ctx.ellipse(mobX + 20 * scale, floorY + 1, 24 * scale, 8 * scale, 0, 0, Math.PI * 2);
  ctx.fill();

  // Boss Threat Aura
  if (isBoss) {
    const auraPulse = (Math.sin(time * 0.007) + 1) * 0.5;
    const auraGrad = ctx.createRadialGradient(
      mobX + 22 * scale,
      mobY + 24 * scale,
      10,
      mobX + 22 * scale,
      mobY + 24 * scale,
      70 * scale
    );
    auraGrad.addColorStop(0, 'rgba(239, 68, 68, 0.45)');
    auraGrad.addColorStop(0.7, 'rgba(185, 28, 28, 0.15)');
    auraGrad.addColorStop(1, 'rgba(185, 28, 28, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(mobX + 22 * scale, mobY + 24 * scale, 70 * scale + auraPulse * 8, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.translate(mobX, mobY + mobBob);
  ctx.scale(scale, scale);

  const name = mob.name.toLowerCase();

  if (name.includes('гоблин') || name.includes('грок')) {
    // =====================================================================
    // TALLER, BULKIER GOBLIN / GROK CHIEFTAIN WARRIOR
    // =====================================================================
    // Muscular Greenskin Legs & Feet
    ctx.fillStyle = '#3f6212';
    pRect(ctx, 10, 32, 6, 12);
    pRect(ctx, 22, 32, 6, 12);
    ctx.fillStyle = '#4d7c0f';
    pRect(ctx, 11, 33, 4, 10);
    pRect(ctx, 23, 33, 4, 10);
    // Studded War Boots
    ctx.fillStyle = '#451a03';
    pRect(ctx, 8, 40, 9, 5);
    pRect(ctx, 21, 40, 9, 5);
    ctx.fillStyle = '#94a3b8';
    pRect(ctx, 9, 41, 2, 2);
    pRect(ctx, 22, 41, 2, 2);

    // Greenskin Torso & Pectorals
    ctx.fillStyle = '#4d7c0f';
    pRect(ctx, 8, 14, 22, 20);
    ctx.fillStyle = '#3f6212';
    pRect(ctx, 10, 18, 7, 3);
    pRect(ctx, 21, 18, 7, 3);
    pRect(ctx, 12, 24, 5, 2);
    pRect(ctx, 21, 24, 5, 2);

    // Spiked Bone Armor / Harness
    ctx.fillStyle = '#78350f';
    pRect(ctx, 8, 28, 22, 6); // Belt
    ctx.fillStyle = '#a16207';
    pRect(ctx, 17, 27, 4, 8); // Buckle
    ctx.fillStyle = '#fef08a';
    pRect(ctx, 18, 29, 2, 4);

    // Spiked Bone Shoulder Guards
    ctx.fillStyle = '#e2e8f0';
    pRect(ctx, 4, 12, 6, 6);
    pRect(ctx, 28, 12, 6, 6);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 3, 9, 4, 4);
    pRect(ctx, 31, 9, 4, 4);

    // Goblin Head, Brow & Long Pointed Ears
    ctx.fillStyle = '#65a30d';
    pRect(ctx, 7, 2, 24, 14);
    // Pointed ears with earrings
    ctx.fillStyle = '#4d7c0f';
    pRect(ctx, 0, 4, 7, 6);
    pRect(ctx, 31, 4, 7, 6);
    ctx.fillStyle = '#fbbf24';
    pRect(ctx, 1, 9, 2, 2);

    // Braided Red Warhawk Hair
    ctx.fillStyle = '#991b1b';
    pRect(ctx, 15, -4, 8, 7);
    pRect(ctx, 16, -7, 6, 4);
    pRect(ctx, 18, -10, 3, 4, '#ef4444');

    // Glowing Amber Eyes & Eyebrows
    ctx.fillStyle = '#1c1917';
    pRect(ctx, 10, 6, 6, 4);
    pRect(ctx, 22, 6, 6, 4);
    ctx.fillStyle = '#fde047';
    pRect(ctx, 11, 7, 4, 3);
    pRect(ctx, 23, 7, 4, 3);
    ctx.fillStyle = '#7f1d1d';
    pRect(ctx, 13, 8, 2, 2);
    pRect(ctx, 25, 8, 2, 2);

    // Protruding Fangs & Snarl
    ctx.fillStyle = '#1c1917';
    pRect(ctx, 11, 13, 16, 3);
    ctx.fillStyle = '#fef08a';
    pRect(ctx, 12, 11, 3, 4); // Left lower tusk
    pRect(ctx, 23, 11, 3, 4); // Right lower tusk

    // Massive Spiked Skull-Crusher Club
    ctx.fillStyle = '#78350f';
    pRect(ctx, 1, 14, 5, 26);
    ctx.fillStyle = '#334155';
    pRect(ctx, -2, 10, 11, 10);
    ctx.fillStyle = '#cbd5e1';
    pRect(ctx, -4, 12, 3, 3); // Spikes
    pRect(ctx, 8, 12, 3, 3);
    pRect(ctx, 2, 8, 3, 3);
    pRect(ctx, 8, 16, 2, 2, '#ef4444'); // Bloodstain

    if (isBoss) {
      // Chieftain Horned Bone Crown
      ctx.fillStyle = '#f8fafc';
      pRect(ctx, 9, -5, 20, 5);
      ctx.fillStyle = '#ef4444';
      pRect(ctx, 17, -7, 4, 4);
      pRect(ctx, 8, -9, 3, 6, '#e2e8f0');
      pRect(ctx, 27, -9, 3, 6, '#e2e8f0');
    }
  } else if (name.includes('скелет') || name.includes('мортис')) {
    // =====================================================================
    // TALLER, OMINOUS SKELETON / LORD MORTIS (DEATH KNIGHT / LICH)
    // =====================================================================
    // Skeletal Legs
    ctx.fillStyle = '#0f172a';
    pRect(ctx, 11, 30, 5, 14);
    pRect(ctx, 22, 30, 5, 14);
    ctx.fillStyle = '#cbd5e1';
    pRect(ctx, 12, 30, 3, 12);
    pRect(ctx, 23, 30, 3, 12);
    // Dark Iron Greaves / Boots
    ctx.fillStyle = '#1e293b';
    pRect(ctx, 10, 38, 7, 6);
    pRect(ctx, 21, 38, 7, 6);

    // Ribcage with pulsating necrotic soul flame
    ctx.fillStyle = '#0f172a';
    pRect(ctx, 9, 14, 20, 18);
    // Vertebrae spine
    ctx.fillStyle = '#e2e8f0';
    pRect(ctx, 18, 14, 3, 16);
    // Ribs
    pRect(ctx, 11, 16, 16, 2);
    pRect(ctx, 11, 20, 16, 2);
    pRect(ctx, 13, 24, 12, 2);
    pRect(ctx, 14, 27, 10, 2);

    // Inner Glowing Soul Flame
    const soulPulse = (Math.sin(time * 0.01) + 1) * 0.5;
    ctx.fillStyle = isBoss ? `rgba(192, 132, 252, ${0.6 + soulPulse * 0.4})` : `rgba(239, 68, 68, ${0.6 + soulPulse * 0.4})`;
    pRect(ctx, 16, 18, 6, 6);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 18, 19, 2, 3);

    // Dark Spiked Iron Pauldrons & Cloak
    ctx.fillStyle = '#1e293b';
    pRect(ctx, 4, 12, 7, 8);
    pRect(ctx, 27, 12, 7, 8);
    ctx.fillStyle = isBoss ? '#581c87' : '#881337';
    pRect(ctx, 2, 18, 4, 18);
    pRect(ctx, 32, 18, 4, 18);

    // Ominous Skull
    ctx.fillStyle = '#f8fafc';
    pRect(ctx, 9, 0, 20, 14);
    pRect(ctx, 13, 13, 12, 4); // Jaw
    // Teeth
    ctx.fillStyle = '#94a3b8';
    pRect(ctx, 14, 13, 2, 3);
    pRect(ctx, 18, 13, 2, 3);
    pRect(ctx, 22, 13, 2, 3);

    // Burning Eye Sockets
    ctx.fillStyle = '#0f172a';
    pRect(ctx, 11, 4, 6, 5);
    pRect(ctx, 21, 4, 6, 5);
    ctx.fillStyle = isBoss ? '#c084fc' : '#ef4444';
    pRect(ctx, 13, 5, 3, 3);
    pRect(ctx, 23, 5, 3, 3);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 14, 6, 1, 1);
    pRect(ctx, 24, 6, 1, 1);

    // Cursed Runic Broadsword
    ctx.fillStyle = '#334155';
    pRect(ctx, 0, 8, 6, 34);
    ctx.fillStyle = isBoss ? '#a855f7' : '#ef4444';
    pRect(ctx, 2, 12, 2, 24);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 2, 14, 2, 4);

    if (isBoss) {
      // Horned Crown of the Lich King
      ctx.fillStyle = '#7e22ce';
      pRect(ctx, 9, -6, 20, 6);
      ctx.fillStyle = '#fbbf24';
      pRect(ctx, 17, -9, 4, 5);
      pRect(ctx, 8, -10, 3, 6);
      pRect(ctx, 27, -10, 3, 6);
      ctx.fillStyle = '#c084fc';
      pRect(ctx, 18, -7, 2, 2);
    }
  } else if (name.includes('дракон') || name.includes('игнис')) {
    // =====================================================================
    // TALLER, MAJESTIC RED DRAGON IGNIS / WYRM
    // =====================================================================
    // Muscular Dragon Legs & Claws
    ctx.fillStyle = '#7f1d1d';
    pRect(ctx, 8, 30, 8, 14);
    pRect(ctx, 24, 30, 8, 14);
    ctx.fillStyle = '#18181b';
    pRect(ctx, 6, 40, 11, 5);
    pRect(ctx, 23, 40, 11, 5);
    ctx.fillStyle = '#fbbf24';
    pRect(ctx, 6, 42, 2, 3);
    pRect(ctx, 10, 42, 2, 3);
    pRect(ctx, 23, 42, 2, 3);
    pRect(ctx, 27, 42, 2, 3);

    // Dragon Torso with Molten Magma Plates
    ctx.fillStyle = '#991b1b';
    pRect(ctx, 6, 10, 28, 24);
    ctx.fillStyle = '#ea580c';
    pRect(ctx, 10, 14, 20, 16);
    ctx.fillStyle = '#fde047';
    pRect(ctx, 13, 17, 14, 10);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 16, 20, 8, 4);

    // Massive Crimson Wings with Claw Joints
    const wingFlap = Math.sin(time * 0.01) * 7;
    ctx.fillStyle = '#7f1d1d';
    ctx.beginPath();
    ctx.moveTo(6, 12);
    ctx.lineTo(-18, -8 + wingFlap);
    ctx.lineTo(6, -4 + wingFlap);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(34, 12);
    ctx.lineTo(56, -8 + wingFlap);
    ctx.lineTo(34, -4 + wingFlap);
    ctx.fill();

    // Dragon Horned Crest & Head
    ctx.fillStyle = '#b91c1c';
    pRect(ctx, 8, -6, 26, 18);
    // Horns
    ctx.fillStyle = '#1c1917';
    pRect(ctx, 6, -15, 6, 11);
    pRect(ctx, 4, -22, 4, 8);
    pRect(ctx, 28, -15, 6, 11);
    pRect(ctx, 30, -22, 4, 8);

    // Burning Dragon Eyes
    ctx.fillStyle = '#fbbf24';
    pRect(ctx, 12, -2, 6, 4);
    pRect(ctx, 24, -2, 6, 4);
    ctx.fillStyle = '#dc2626';
    pRect(ctx, 14, -1, 3, 3);
    pRect(ctx, 26, -1, 3, 3);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 15, -1, 1, 1);
    pRect(ctx, 27, -1, 1, 1);

    // Roaring Maw with Fangs & Molten Fire
    ctx.fillStyle = '#ea580c';
    pRect(ctx, 10, 7, 20, 6);
    ctx.fillStyle = '#fef08a';
    pRect(ctx, 12, 8, 16, 4);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 12, 7, 3, 3);
    pRect(ctx, 18, 7, 3, 3);
    pRect(ctx, 24, 7, 3, 3);
  } else if (name.includes('голем')) {
    // =====================================================================
    // TALLER, MONOLITHIC ANCIENT STONE GOLEM TITAN
    // =====================================================================
    // Massive Stone Pillar Legs
    ctx.fillStyle = '#44403c';
    pRect(ctx, 8, 28, 10, 16);
    pRect(ctx, 24, 28, 10, 16);
    ctx.fillStyle = '#78716c';
    pRect(ctx, 10, 30, 6, 12);
    pRect(ctx, 26, 30, 6, 12);

    // Megalithic Torso
    ctx.fillStyle = '#57534e';
    pRect(ctx, 4, 6, 34, 26);
    // Weathered Stone Texture & Moss
    ctx.fillStyle = '#22c55e';
    pRect(ctx, 5, 8, 4, 3);
    pRect(ctx, 31, 16, 4, 3);

    // Arcane Core Reactor in Chest
    const corePulse = (Math.sin(time * 0.008) + 1) * 0.5;
    ctx.fillStyle = '#0284c7';
    pRect(ctx, 14, 14, 14, 12);
    ctx.fillStyle = `rgba(56, 189, 248, ${0.7 + corePulse * 0.3})`;
    pRect(ctx, 16, 16, 10, 8);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 19, 18, 4, 4);

    // Colossal Stone Fists with Crystal Spikes
    ctx.fillStyle = '#44403c';
    pRect(ctx, -4, 12, 8, 16);
    pRect(ctx, 38, 12, 8, 16);
    ctx.fillStyle = '#38bdf8';
    pRect(ctx, -6, 20, 3, 4);
    pRect(ctx, 45, 20, 3, 4);

    // Golem Head & Optical Visor
    ctx.fillStyle = '#78716c';
    pRect(ctx, 9, -8, 24, 16);
    ctx.fillStyle = '#38bdf8';
    pRect(ctx, 15, -3, 12, 4);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 18, -2, 6, 2);
  } else if (name.includes('паук') || name.includes('матриарх')) {
    // =====================================================================
    // TALLER, MENACING SPIDER QUEEN / ARACHNID BROODMOTHER
    // =====================================================================
    // Abdomen & Thorax
    ctx.fillStyle = '#3b0764';
    pRect(ctx, 4, 10, 30, 24);
    ctx.fillStyle = '#581c87';
    pRect(ctx, 8, 4, 22, 14);

    // Glowing Multi-Cluster Ruby Eyes
    ctx.fillStyle = '#ef4444';
    pRect(ctx, 11, 6, 4, 3);
    pRect(ctx, 16, 5, 4, 3);
    pRect(ctx, 21, 5, 4, 3);
    pRect(ctx, 26, 6, 4, 3);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 12, 6, 1, 1);
    pRect(ctx, 17, 5, 1, 1);
    pRect(ctx, 22, 5, 1, 1);
    pRect(ctx, 27, 6, 1, 1);

    // Glowing Thorax Runes
    ctx.fillStyle = '#a855f7';
    pRect(ctx, 15, 15, 6, 10);
    pRect(ctx, 21, 15, 6, 10);
    // Venom Fangs
    ctx.fillStyle = '#22c55e';
    pRect(ctx, 14, 24, 3, 6);
    pRect(ctx, 23, 24, 3, 6);

    // 8 Articulated Spiked Razor Legs
    ctx.strokeStyle = '#1e1b4b';
    ctx.lineWidth = 3.5;
    for (let l = 0; l < 4; l++) {
      const legY = 10 + l * 5;
      ctx.beginPath();
      ctx.moveTo(6, legY);
      ctx.lineTo(-12, legY - 8);
      ctx.lineTo(-18, legY + 12);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(32, legY);
      ctx.lineTo(50, legY - 8);
      ctx.lineTo(56, legY + 12);
      ctx.stroke();
    }
  } else {
    // =====================================================================
    // DEFAULT DETAILED MINION / FIEND
    // =====================================================================
    ctx.fillStyle = mob.color;
    pRect(ctx, 6, 8, 28, 28);
    ctx.fillStyle = mob.accentColor;
    pRect(ctx, 10, 12, 20, 20);

    // Horns
    ctx.fillStyle = '#1e293b';
    pRect(ctx, 4, 2, 7, 8);
    pRect(ctx, 28, 2, 7, 8);

    // Eyes
    ctx.fillStyle = isBoss ? '#fbbf24' : '#ef4444';
    pRect(ctx, 10, 14, 6, 5);
    pRect(ctx, 24, 14, 6, 5);
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 12, 15, 2, 2);
    pRect(ctx, 26, 15, 2, 2);

    // Fangs
    ctx.fillStyle = '#ffffff';
    pRect(ctx, 12, 28, 4, 5);
    pRect(ctx, 19, 28, 4, 5);
    pRect(ctx, 26, 28, 4, 5);
  }

  ctx.restore();

  // Floating Health Bar Above Monster
  const hpRatio = Math.max(0, mob.currentHp / mob.maxHp);
  const barWidth = 64 * (isBoss ? 1.65 : isElite ? 1.3 : 1.1);
  const barX = mobX + 20 * scale - barWidth / 2;
  const barY = mobY - 20;

  ctx.fillStyle = '#09080e';
  pRect(ctx, barX - 1, barY - 1, barWidth + 2, 9);
  ctx.fillStyle = '#262338';
  pRect(ctx, barX, barY, barWidth, 7);

  const hpGrad = ctx.createLinearGradient(barX, 0, barX + barWidth, 0);
  hpGrad.addColorStop(0, isBoss ? '#ef4444' : '#f97316');
  hpGrad.addColorStop(1, isBoss ? '#b91c1c' : '#ea580c');
  ctx.fillStyle = hpGrad;
  pRect(ctx, barX, barY, barWidth * hpRatio, 7);

  ctx.font = '700 10px "Plus Jakarta Sans", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#000000';
  ctx.fillText(mob.name, barX + barWidth / 2 + 1, barY - 4 + 1);
  ctx.fillStyle = isBoss ? '#fca5a5' : isElite ? '#fef08a' : '#f1f5f9';
  ctx.fillText(mob.name, barX + barWidth / 2, barY - 4);
}
