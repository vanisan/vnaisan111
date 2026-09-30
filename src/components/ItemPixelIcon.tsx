import React, { useRef, useEffect } from 'react';
import { EquipmentItem, SlotType } from '../types/game';
import { RARITY_CONFIGS } from '../data/items';
import { pRect, pCircle } from '../utils/pixelRenderer';

interface ItemPixelIconProps {
  item: EquipmentItem;
  size?: number; // default 36
  showGlow?: boolean;
}

export const ItemPixelIcon: React.FC<ItemPixelIconProps> = ({ item, size = 36, showGlow = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.imageSmoothingEnabled = false;

    const rConf = RARITY_CONFIGS[item.rarity];
    const color = item.visualColor || '#cbd5e1';
    const glow = item.glowColor || rConf.color;
    const rarity = item.rarity;

    // STRICT RARITY BOUNDARIES:
    // Mythic: Draconic Leather Set
    // Gold: Imperial Crusader Set
    // Below Gold (Epic, Rare, Uncommon, Common): Simple designs matching their tier!
    const isMythic = rarity === 'mythic';
    const isGold = rarity === 'gold';
    const isEpic = rarity === 'epic';
    const isRare = rarity === 'rare';
    const isUncommon = rarity === 'uncommon';

    // 1. Slot Background Gradient
    const bgGrad = ctx.createLinearGradient(0, 0, 32, 32);
    if (isMythic) {
      // Deep obsidian & molten magma crimson background
      bgGrad.addColorStop(0, '#450a0a');
      bgGrad.addColorStop(0.5, '#1c0505');
      bgGrad.addColorStop(1, '#090202');
    } else if (isGold) {
      // Regal royal gold & deep navy background
      bgGrad.addColorStop(0, '#451a03');
      bgGrad.addColorStop(0.5, '#1e1b4b');
      bgGrad.addColorStop(1, '#0f172a');
    } else if (isEpic) {
      bgGrad.addColorStop(0, '#2e1065');
      bgGrad.addColorStop(1, '#0f0524');
    } else if (isRare) {
      bgGrad.addColorStop(0, '#172554');
      bgGrad.addColorStop(1, '#081024');
    } else if (isUncommon) {
      bgGrad.addColorStop(0, '#064e3b');
      bgGrad.addColorStop(1, '#021812');
    } else {
      bgGrad.addColorStop(0, '#292524');
      bgGrad.addColorStop(1, '#0c0a09');
    }
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, 32, 32);

    // 2. Inner Radial Glow & Starfield for High Rarity
    if (showGlow) {
      const g = ctx.createRadialGradient(16, 16, 1, 16, 16, 16);
      g.addColorStop(0, isMythic ? 'rgba(239, 68, 68, 0.55)' : isGold ? 'rgba(250, 204, 21, 0.45)' : `${glow}33`);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 32, 32);

      if (isMythic) {
        // Mythic rising fiery embers
        ctx.fillStyle = '#fef08a';
        pRect(ctx, 3, 5, 1, 1);
        pRect(ctx, 28, 6, 1, 1);
        ctx.fillStyle = '#f97316';
        pRect(ctx, 2, 14, 1, 1);
        pRect(ctx, 29, 18, 1, 1);
        ctx.fillStyle = '#ef4444';
        pRect(ctx, 5, 10, 1, 1);
        pRect(ctx, 26, 12, 1, 1);
      } else if (isGold) {
        // Gold holy glints
        ctx.fillStyle = '#ffffff';
        pRect(ctx, 5, 5, 1, 1);
        pRect(ctx, 26, 5, 1, 1);
        ctx.fillStyle = '#fef08a';
        pRect(ctx, 3, 15, 1, 1);
        pRect(ctx, 28, 16, 1, 1);
        ctx.fillStyle = '#38bdf8';
        pRect(ctx, 16, 3, 1, 1);
      }
    }

    // 3. Draw 16-Bit Pixel Item Sprite Based on Slot & Scaled Quality
    switch (item.slot as SlotType) {
      case 'head': {
        if (isMythic) {
          // =================================================================
          // MASSIVE DRACONIC LEATHER HELMET (ONLY MYTHIC TIER)
          // =================================================================
          pRect(ctx, 7, 7, 18, 17, '#18181b');
          pRect(ctx, 8, 8, 16, 15, '#27272a');

          // Segmented crimson dragon scale plates on crown and cheeks
          pRect(ctx, 9, 8, 14, 4, '#7f1d1d');
          pRect(ctx, 10, 9, 12, 2, '#991b1b');
          pRect(ctx, 11, 9, 10, 1, '#ef4444');

          // Armored high cheekguards and jaw
          pRect(ctx, 6, 15, 4, 9, '#18181b');
          pRect(ctx, 22, 15, 4, 9, '#18181b');
          pRect(ctx, 7, 16, 2, 7, '#991b1b');
          pRect(ctx, 23, 16, 2, 7, '#991b1b');

          // Menacing Horizontal Slit Visor Grille
          pRect(ctx, 9, 13, 14, 6, '#09080e');

          // Burning Red Dragon Eyes
          pRect(ctx, 11, 14, 3, 2, '#dc2626');
          pRect(ctx, 18, 14, 3, 2, '#dc2626');
          pRect(ctx, 12, 14, 2, 2, '#ef4444');
          pRect(ctx, 19, 14, 2, 2, '#ef4444');
          pRect(ctx, 12, 15, 1, 1, '#ffffff');
          pRect(ctx, 19, 15, 1, 1, '#ffffff');

          // Visor vertical protective grille bars
          pRect(ctx, 10, 13, 1, 6, '#18181b');
          pRect(ctx, 15, 13, 2, 6, '#18181b');
          pRect(ctx, 21, 13, 1, 6, '#18181b');

          // Lower chin guard fangs
          pRect(ctx, 11, 20, 10, 4, '#18181b');
          pRect(ctx, 12, 21, 8, 2, '#7f1d1d');
          pRect(ctx, 13, 21, 2, 1, '#f59e0b');
          pRect(ctx, 17, 21, 2, 1, '#f59e0b');

          // COLOSSAL SWEPT-BACK DRAGON HORNS
          pRect(ctx, 5, 8, 3, 5, '#991b1b');
          pRect(ctx, 3, 5, 3, 4, '#b91c1c');
          pRect(ctx, 2, 2, 2, 4, '#dc2626');
          pRect(ctx, 1, 1, 2, 2, '#f59e0b');
          pRect(ctx, 1, 0, 1, 1, '#fef08a');

          pRect(ctx, 24, 8, 3, 5, '#991b1b');
          pRect(ctx, 26, 5, 3, 4, '#b91c1c');
          pRect(ctx, 28, 2, 2, 4, '#dc2626');
          pRect(ctx, 29, 1, 2, 2, '#f59e0b');
          pRect(ctx, 30, 0, 1, 1, '#fef08a');

          // Forehead Gold Crest Plate with Embedded Ruby
          pRect(ctx, 13, 9, 6, 4, '#f59e0b');
          pRect(ctx, 14, 10, 4, 3, '#ef4444');
          pRect(ctx, 15, 11, 2, 1, '#ffffff');
        } else if (isGold) {
          // =================================================================
          // IMPERIAL CRUSADER HELM (GOLD TIER ONLY - L2 S-Grade)
          // Majestic platinum-white steel close helm with golden winged crown & sapphire
          // =================================================================
          // Helmet base skull cap (gleaming platinum steel)
          pRect(ctx, 7, 7, 18, 17, '#0f172a');
          pRect(ctx, 8, 8, 16, 15, '#cbd5e1');
          pRect(ctx, 9, 9, 14, 13, '#f8fafc'); // Polished white steel

          // Royal Golden Crown Crest & Winged Laurel on top
          pRect(ctx, 12, 3, 8, 5, '#b45309');
          pRect(ctx, 13, 4, 6, 4, '#fbbf24');
          pRect(ctx, 14, 2, 4, 3, '#fef08a'); // Crown center spike
          pRect(ctx, 10, 4, 2, 3, '#fbbf24'); // Left winglet
          pRect(ctx, 20, 4, 2, 3, '#fbbf24'); // Right winglet
          pRect(ctx, 9, 2, 2, 2, '#fef08a');
          pRect(ctx, 21, 2, 2, 2, '#fef08a');

          // Forehead Royal Sapphire Gem in gold mount
          pRect(ctx, 14, 7, 4, 4, '#b45309');
          pRect(ctx, 15, 8, 2, 2, '#2563eb');
          pRect(ctx, 15, 8, 1, 1, '#60a5fa');

          // Golden T-Cross Knight Visor Grille
          pRect(ctx, 9, 12, 14, 5, '#1e293b');
          pRect(ctx, 11, 13, 10, 2, '#0f172a'); // Visor eye slit
          // Gilded visor frame
          pRect(ctx, 8, 11, 16, 1, '#f59e0b');
          pRect(ctx, 15, 11, 2, 9, '#f59e0b'); // Center gold nose-pillar
          pRect(ctx, 10, 13, 4, 2, '#38bdf8'); // Sapphire eye glow glint
          pRect(ctx, 18, 13, 4, 2, '#38bdf8');
          pRect(ctx, 11, 13, 1, 1, '#ffffff');
          pRect(ctx, 19, 13, 1, 1, '#ffffff');

          // Armored Gilded Cheekguards & Chin Plate
          pRect(ctx, 7, 16, 3, 8, '#f59e0b');
          pRect(ctx, 22, 16, 3, 8, '#f59e0b');
          pRect(ctx, 8, 17, 2, 6, '#fef08a');
          pRect(ctx, 22, 17, 2, 6, '#fef08a');
          pRect(ctx, 11, 21, 10, 3, '#cbd5e1');
          pRect(ctx, 13, 21, 6, 2, '#f59e0b'); // Golden chin clasp
        } else if (isEpic) {
          // SIMPLE SHADOW COWL (Epic tier - simple, no horns, no big plates)
          pRect(ctx, 9, 8, 14, 15, '#2e1065');
          pRect(ctx, 10, 9, 12, 13, '#4c1d95');
          pRect(ctx, 8, 13, 16, 8, '#3b0764');
          // Violet glint eyes
          pRect(ctx, 11, 14, 3, 2, '#c084fc');
          pRect(ctx, 18, 14, 3, 2, '#c084fc');
          pRect(ctx, 12, 14, 1, 1, '#ffffff');
          pRect(ctx, 19, 14, 1, 1, '#ffffff');
        } else if (isRare) {
          // SIMPLE STEEL KNIGHT HELMET (Rare tier - standard steel pot/cap)
          pRect(ctx, 9, 9, 14, 14, '#475569');
          pRect(ctx, 10, 10, 12, 12, '#64748b');
          pRect(ctx, 8, 14, 16, 7, '#334155');
          pRect(ctx, 11, 14, 10, 2, '#0f172a');
          pRect(ctx, 12, 14, 2, 1, '#38bdf8');
          pRect(ctx, 18, 14, 2, 1, '#38bdf8');
        } else if (isUncommon) {
          // SIMPLE LEATHER CAP (Uncommon tier - clean green/brown leather)
          pRect(ctx, 9, 10, 14, 12, '#14532d');
          pRect(ctx, 10, 11, 12, 10, '#15803d');
          pRect(ctx, 8, 14, 16, 5, '#166534');
          pRect(ctx, 14, 11, 4, 3, '#22c55e');
        } else {
          // SIMPLE CLOTH HEADBAND / WORN CAP (Common tier - rustic & basic)
          pRect(ctx, 10, 11, 12, 11, '#57534e');
          pRect(ctx, 8, 14, 16, 4, '#78716c');
          pRect(ctx, 12, 15, 8, 2, '#292524');
        }
        break;
      }
      case 'body': {
        if (isMythic) {
          // =================================================================
          // MASSIVE DRACONIC LEATHER ARMOR (ONLY MYTHIC TIER)
          // =================================================================
          pRect(ctx, 7, 6, 18, 19, '#18181b');
          pRect(ctx, 8, 7, 16, 17, '#27272a');

          // Segmented blood-red dragon scale plates
          pRect(ctx, 8, 9, 16, 4, '#7f1d1d');
          pRect(ctx, 9, 10, 14, 2, '#991b1b');
          pRect(ctx, 10, 10, 12, 1, '#ef4444');
          pRect(ctx, 9, 14, 14, 4, '#7f1d1d');
          pRect(ctx, 10, 15, 12, 2, '#991b1b');
          pRect(ctx, 11, 15, 10, 1, '#ef4444');

          // High Dragon Neck Collar / Gorget
          pRect(ctx, 8, 3, 4, 5, '#18181b');
          pRect(ctx, 20, 3, 4, 5, '#18181b');
          pRect(ctx, 9, 4, 2, 4, '#991b1b');
          pRect(ctx, 21, 4, 2, 4, '#991b1b');
          pRect(ctx, 8, 2, 2, 2, '#f59e0b');
          pRect(ctx, 22, 2, 2, 2, '#f59e0b');

          // CENTRAL BURNING DRACONIC EYE (Heart of Valakas)
          pRect(ctx, 11, 10, 10, 8, '#450a0a');
          pRect(ctx, 12, 11, 8, 6, '#b91c1c');
          pRect(ctx, 13, 12, 6, 4, '#f97316');
          pRect(ctx, 14, 12, 4, 4, '#facc15');
          pRect(ctx, 15, 13, 2, 2, '#ffffff');
          pRect(ctx, 15, 12, 2, 4, '#450a0a');

          // Gold filigree casing around eye
          pRect(ctx, 11, 9, 10, 1, '#f59e0b');
          pRect(ctx, 11, 18, 10, 1, '#f59e0b');
          pRect(ctx, 10, 11, 1, 6, '#f59e0b');
          pRect(ctx, 21, 11, 1, 6, '#f59e0b');

          // COLOSSAL DRACONIC HORN PAULDRONS
          pRect(ctx, 3, 5, 5, 8, '#18181b');
          pRect(ctx, 4, 6, 4, 6, '#991b1b');
          pRect(ctx, 2, 3, 4, 4, '#b91c1c');
          pRect(ctx, 1, 1, 3, 3, '#dc2626');
          pRect(ctx, 0, 0, 2, 2, '#f59e0b');
          pRect(ctx, 0, 0, 1, 1, '#fef08a');
          pRect(ctx, 1, 8, 3, 4, '#7f1d1d');
          pRect(ctx, 0, 10, 2, 2, '#f59e0b');

          pRect(ctx, 24, 5, 5, 8, '#18181b');
          pRect(ctx, 24, 6, 4, 6, '#991b1b');
          pRect(ctx, 26, 3, 4, 4, '#b91c1c');
          pRect(ctx, 28, 1, 3, 3, '#dc2626');
          pRect(ctx, 30, 0, 2, 2, '#f59e0b');
          pRect(ctx, 31, 0, 1, 1, '#fef08a');
          pRect(ctx, 28, 8, 3, 4, '#7f1d1d');
          pRect(ctx, 30, 10, 2, 2, '#f59e0b');

          // Belt with dragon bone buckle
          pRect(ctx, 7, 21, 18, 4, '#18181b');
          pRect(ctx, 13, 20, 6, 5, '#f59e0b');
          pRect(ctx, 14, 21, 4, 3, '#dc2626');

          // Segmented dragon tail loinplate
          pRect(ctx, 12, 25, 8, 7, '#18181b');
          pRect(ctx, 13, 25, 6, 2, '#991b1b');
          pRect(ctx, 14, 27, 4, 2, '#b91c1c');
          pRect(ctx, 14, 29, 4, 2, '#dc2626');
          pRect(ctx, 15, 31, 2, 1, '#fbbf24');
        } else if (isGold) {
          // =================================================================
          // IMPERIAL CRUSADER BREASTPLATE (GOLD TIER ONLY - L2 S-Grade)
          // Polished platinum-white heavy plate cuirass with massive rounded
          // golden-trimmed imperial pauldrons, golden cross & sapphire
          // =================================================================
          // Dark underlay & shadow
          pRect(ctx, 6, 5, 20, 20, '#0f172a');

          // Main cuirass body (gleaming polished platinum white)
          pRect(ctx, 7, 6, 18, 18, '#cbd5e1');
          pRect(ctx, 8, 7, 16, 16, '#f8fafc');
          pRect(ctx, 9, 8, 14, 8, '#ffffff'); // Specular sheen

          // Raised Gilded Gorget Collar around neck
          pRect(ctx, 10, 3, 12, 4, '#b45309');
          pRect(ctx, 11, 4, 10, 2, '#fbbf24');
          pRect(ctx, 13, 4, 6, 1, '#fef08a');

          // GOLDEN IMPERIAL SUNBURST CROSS ON CHEST
          pRect(ctx, 14, 9, 4, 8, '#f59e0b');
          pRect(ctx, 11, 11, 10, 4, '#f59e0b');
          pRect(ctx, 13, 10, 6, 6, '#fbbf24');
          // Central Royal Sapphire Jewel
          pRect(ctx, 14, 11, 4, 4, '#1e3a8a');
          pRect(ctx, 15, 12, 2, 2, '#38bdf8');
          pRect(ctx, 15, 12, 1, 1, '#ffffff');

          // MASSIVE ROUNDED IMPERIAL CRUSADER PAULDRONS (Heavy Paladin Plate)
          // Left Pauldron (tiered rounded white steel with gold lion relief)
          pRect(ctx, 2, 5, 6, 9, '#0f172a');
          pRect(ctx, 3, 6, 5, 7, '#f8fafc');
          pRect(ctx, 1, 7, 2, 5, '#fbbf24'); // Outer gold trim rim
          pRect(ctx, 2, 5, 6, 2, '#fbbf24'); // Top gold rim
          pRect(ctx, 3, 8, 3, 3, '#f59e0b'); // Golden lion face crest
          pRect(ctx, 4, 9, 1, 1, '#fef08a');

          // Right Pauldron
          pRect(ctx, 24, 5, 6, 9, '#0f172a');
          pRect(ctx, 24, 6, 5, 7, '#f8fafc');
          pRect(ctx, 29, 7, 2, 5, '#fbbf24'); // Outer gold trim rim
          pRect(ctx, 24, 5, 6, 2, '#fbbf24'); // Top gold rim
          pRect(ctx, 26, 8, 3, 3, '#f59e0b'); // Golden lion face crest
          pRect(ctx, 27, 9, 1, 1, '#fef08a');

          // Gilded Plate Belt with Lion Buckle
          pRect(ctx, 7, 20, 18, 4, '#0f172a');
          pRect(ctx, 8, 20, 16, 3, '#fbbf24');
          pRect(ctx, 13, 19, 6, 5, '#f59e0b'); // Lion buckle
          pRect(ctx, 14, 20, 4, 3, '#fef08a');
          pRect(ctx, 15, 21, 2, 1, '#2563eb'); // Small sapphire gem

          // Side-hanging White/Gold Armor Tassets (Skirt plates)
          pRect(ctx, 8, 23, 5, 5, '#f8fafc');
          pRect(ctx, 8, 27, 5, 1, '#fbbf24');
          pRect(ctx, 19, 23, 5, 5, '#f8fafc');
          pRect(ctx, 19, 27, 5, 1, '#fbbf24');
        } else if (isEpic) {
          // SIMPLE ASSASSIN TUNIC (Epic tier - sleek violet/black leather, no giant shoulders)
          pRect(ctx, 8, 8, 16, 17, '#1e1b4b');
          pRect(ctx, 9, 9, 14, 15, '#3b0764');
          pRect(ctx, 8, 8, 16, 2, '#7e22ce');
          pRect(ctx, 10, 13, 12, 2, '#9333ea');
          pRect(ctx, 14, 12, 4, 4, '#c084fc');
          pRect(ctx, 15, 13, 2, 2, '#ffffff');
          pRect(ctx, 7, 21, 18, 3, '#0f172a');
        } else if (isRare) {
          // SIMPLE STEEL BREASTPLATE (Rare tier - standard iron knight plate)
          pRect(ctx, 8, 8, 16, 16, '#334155');
          pRect(ctx, 9, 9, 14, 14, '#64748b');
          pRect(ctx, 10, 10, 12, 4, '#94a3b8');
          pRect(ctx, 14, 12, 4, 6, '#cbd5e1');
          pRect(ctx, 15, 14, 2, 2, '#38bdf8');
          pRect(ctx, 7, 21, 18, 3, '#1e293b');
        } else if (isUncommon) {
          // SIMPLE LEATHER JERKIN (Uncommon tier - green hunter leather)
          pRect(ctx, 9, 9, 14, 15, '#14532d');
          pRect(ctx, 10, 10, 12, 13, '#15803d');
          pRect(ctx, 12, 10, 8, 3, '#166534');
          pRect(ctx, 14, 14, 4, 4, '#22c55e');
          pRect(ctx, 8, 21, 16, 3, '#78350f');
        } else {
          // SIMPLE RUSTIC SHIRT (Common tier - plain cloth/canvas tunic)
          pRect(ctx, 9, 9, 14, 15, '#44403c');
          pRect(ctx, 10, 10, 12, 13, '#78716c');
          pRect(ctx, 12, 10, 8, 3, '#292524');
          pRect(ctx, 8, 21, 16, 3, '#292524');
        }
        break;
      }
      case 'weapon': {
        ctx.save();
        ctx.translate(16, 16);
        ctx.rotate(-Math.PI / 4);

        const wpnType: 'sword' | 'axe' | 'spear' = item.weaponType || (() => {
          const n = (item.name || '').toLowerCase();
          if (n.includes('топор') || n.includes('секир') || n.includes('коса') || n.includes('cleaver') || n.includes('battleaxe')) return 'axe';
          if (n.includes('копь') || n.includes('пик') || n.includes('трезуб') || n.includes('lance') || n.includes('halberd')) return 'spear';
          return 'sword';
        })();

        if (wpnType === 'sword') {
          // =================================================================
          // 1. SWORD DESIGNS
          // =================================================================
          if (isMythic) {
            // MASSIVE DRACONIC SLAYER (ONLY MYTHIC TIER)
            pRect(ctx, -2, 5, 4, 8, '#450a0a');
            pRect(ctx, -1, 6, 2, 6, '#7f1d1d');
            pRect(ctx, -2, 13, 4, 3, '#f59e0b');
            pRect(ctx, -1, 14, 2, 2, '#fef08a');

            // Swept-Back Golden Dragon Horn Crossguard
            pRect(ctx, -8, 2, 16, 3, '#f59e0b');
            pRect(ctx, -11, -1, 4, 4, '#fbbf24');
            pRect(ctx, 7, -1, 4, 4, '#fbbf24');
            pRect(ctx, -13, -3, 3, 3, '#fef08a');
            pRect(ctx, 10, -3, 3, 3, '#fef08a');

            // Central Glowing Dragon Eye on Guard
            pRect(ctx, -2, 1, 4, 4, '#dc2626');
            pRect(ctx, -1, 2, 2, 2, '#ffffff');

            // MASSIVE SERRATED DRAGON BONE BLADE
            pRect(ctx, -4, -18, 8, 20, '#18181b');
            pRect(ctx, -3, -17, 6, 19, '#991b1b');

            // Jagged teeth
            pRect(ctx, -6, -14, 3, 3, '#dc2626');
            pRect(ctx, -5, -9, 3, 3, '#dc2626');
            pRect(ctx, -6, -4, 3, 3, '#dc2626');
            pRect(ctx, 3, -14, 3, 3, '#dc2626');
            pRect(ctx, 2, -9, 3, 3, '#dc2626');
            pRect(ctx, 3, -4, 3, 3, '#dc2626');

            // Molten fuller groove
            pRect(ctx, -1, -16, 2, 17, '#f97316');
            pRect(ctx, 0, -15, 1, 15, '#fef08a');

            // Burning Tip
            pRect(ctx, -2, -20, 4, 3, '#ef4444');
            pRect(ctx, -1, -22, 2, 3, '#f59e0b');
            pRect(ctx, 0, -23, 1, 2, '#ffffff');
          } else if (isGold) {
            // IMPERIAL CRUSADER BLADE (GOLD TIER ONLY - L2 S-Grade)
            // Gilded Pommel with Sapphire Jewel
            pRect(ctx, -2, 12, 4, 4, '#b45309');
            pRect(ctx, -1, 13, 2, 2, '#2563eb');
            pRect(ctx, 0, 13, 1, 1, '#60a5fa');

            // Imperial White/Gold Grip
            pRect(ctx, -1, 4, 2, 8, '#f8fafc');
            pRect(ctx, -1, 5, 2, 2, '#fbbf24');
            pRect(ctx, -1, 9, 2, 2, '#fbbf24');

            // Winged Golden Crossguard
            pRect(ctx, -8, 1, 16, 3, '#b45309');
            pRect(ctx, -7, 2, 14, 2, '#fbbf24');
            pRect(ctx, -10, -1, 4, 3, '#fef08a');
            pRect(ctx, 6, -1, 4, 3, '#fef08a');
            pRect(ctx, -2, 0, 4, 4, '#f59e0b');
            pRect(ctx, -1, 1, 2, 2, '#38bdf8');
            pRect(ctx, 0, 1, 1, 1, '#ffffff');

            // BROAD PLATINUM HOLY BLADE
            pRect(ctx, -4, -18, 8, 19, '#94a3b8');
            pRect(ctx, -3, -18, 6, 18, '#cbd5e1');
            pRect(ctx, -2, -19, 4, 18, '#f8fafc');
            pRect(ctx, -4, -17, 1, 16, '#ffffff');
            pRect(ctx, 3, -17, 1, 16, '#ffffff');

            // Holy Golden/Blue Fuller Rune
            pRect(ctx, -1, -15, 2, 13, '#fbbf24');
            pRect(ctx, 0, -14, 1, 11, '#38bdf8');

            // Holy Diamond Tip
            pRect(ctx, -2, -21, 4, 3, '#cbd5e1');
            pRect(ctx, -1, -22, 2, 2, '#f8fafc');
            pRect(ctx, 0, -23, 1, 2, '#ffffff');
          } else if (isEpic) {
            // SIMPLE SHADOW BLADE (Epic tier)
            pRect(ctx, -1, 5, 3, 7, '#1e1b4b');
            pRect(ctx, -5, 3, 11, 2, '#7e22ce');
            pRect(ctx, -3, -14, 6, 17, '#3b0764');
            pRect(ctx, -2, -15, 4, 17, '#9333ea');
            pRect(ctx, -1, -14, 2, 14, '#c084fc');
            pRect(ctx, 0, -12, 1, 10, '#ffffff');
            pRect(ctx, -1, -17, 2, 3, '#c084fc');
          } else if (isRare) {
            // SIMPLE STEEL BROADSWORD (Rare tier)
            pRect(ctx, -1, 5, 3, 7, '#78350f');
            pRect(ctx, -6, 3, 13, 2, '#475569');
            pRect(ctx, -1, 12, 3, 3, '#38bdf8');
            pRect(ctx, -3, -14, 6, 17, '#64748b');
            pRect(ctx, -2, -15, 4, 17, '#94a3b8');
            pRect(ctx, -1, -14, 2, 15, '#cbd5e1');
            pRect(ctx, 0, -12, 1, 12, '#ffffff');
            pRect(ctx, -1, -17, 2, 3, '#f8fafc');
          } else if (isUncommon) {
            // SIMPLE HUNTING CLEAVER (Uncommon tier)
            pRect(ctx, -1, 5, 3, 6, '#78350f');
            pRect(ctx, -4, 3, 9, 2, '#15803d');
            pRect(ctx, -2, -12, 5, 15, '#475569');
            pRect(ctx, -1, -13, 3, 15, '#94a3b8');
            pRect(ctx, 0, -12, 1, 12, '#cbd5e1');
          } else {
            // SIMPLE WOODEN SWORD (Common tier)
            pRect(ctx, -1, 5, 3, 7, '#78350f');
            pRect(ctx, -4, 3, 9, 2, '#57534e');
            pRect(ctx, -2, -11, 4, 14, '#854d0e');
            pRect(ctx, -1, -10, 2, 12, '#a16207');
            pRect(ctx, 0, -9, 1, 9, '#ca8a04');
          }
        } else if (wpnType === 'axe') {
          // =================================================================
          // 2. AXE / BATTLEAXE DESIGNS
          // =================================================================
          if (isMythic) {
            // DRACONIC CLEAVER / CHAOS AXE (ONLY MYTHIC TIER)
            // Obsidian & Gold Shaft
            pRect(ctx, -1, -16, 3, 30, '#18181b');
            pRect(ctx, -1, -10, 3, 2, '#f59e0b');
            pRect(ctx, -1, 2, 3, 2, '#f59e0b');
            pRect(ctx, -2, 13, 5, 3, '#b91c1c');
            pRect(ctx, -1, 15, 3, 2, '#fef08a');

            // Left Dragon Wing Crescent Blade
            pRect(ctx, -12, -16, 11, 14, '#18181b');
            pRect(ctx, -11, -15, 10, 12, '#7f1d1d');
            pRect(ctx, -10, -14, 8, 10, '#991b1b');
            pRect(ctx, -12, -16, 2, 14, '#ef4444');
            pRect(ctx, -13, -15, 2, 4, '#f59e0b');
            pRect(ctx, -13, -7, 2, 4, '#f59e0b');
            pRect(ctx, -14, -14, 2, 2, '#fef08a');
            pRect(ctx, -14, -6, 2, 2, '#fef08a');

            // Right Dragon Wing Crescent Blade
            pRect(ctx, 2, -16, 11, 14, '#18181b');
            pRect(ctx, 2, -15, 10, 12, '#7f1d1d');
            pRect(ctx, 3, -14, 8, 10, '#991b1b');
            pRect(ctx, 11, -16, 2, 14, '#ef4444');
            pRect(ctx, 12, -15, 2, 4, '#f59e0b');
            pRect(ctx, 12, -7, 2, 4, '#f59e0b');
            pRect(ctx, 13, -14, 2, 2, '#fef08a');
            pRect(ctx, 13, -6, 2, 2, '#fef08a');

            // Center Dragon Eye Socket & Top Flame Spike
            pRect(ctx, -3, -13, 7, 7, '#f59e0b');
            pRect(ctx, -2, -12, 5, 5, '#dc2626');
            pRect(ctx, -1, -11, 3, 3, '#ffffff');
            pRect(ctx, -1, -20, 3, 5, '#ef4444');
            pRect(ctx, 0, -22, 1, 3, '#fef08a');
          } else if (isGold) {
            // IMPERIAL CRUSADER BATTLEAXE (GOLD TIER ONLY - L2 S-Grade)
            // White & Gold Shaft with Sapphire Pommel
            pRect(ctx, -1, -16, 3, 29, '#cbd5e1');
            pRect(ctx, 0, -15, 1, 27, '#f8fafc');
            pRect(ctx, -1, -8, 3, 2, '#fbbf24');
            pRect(ctx, -1, 3, 3, 2, '#fbbf24');
            pRect(ctx, -2, 12, 5, 3, '#b45309');
            pRect(ctx, -1, 13, 3, 2, '#2563eb');
            pRect(ctx, 0, 14, 1, 1, '#ffffff');

            // Left Holy Winged Crescent Blade
            pRect(ctx, -11, -15, 10, 12, '#94a3b8');
            pRect(ctx, -10, -14, 9, 10, '#cbd5e1');
            pRect(ctx, -9, -13, 7, 8, '#f8fafc');
            pRect(ctx, -12, -14, 2, 10, '#fbbf24');
            pRect(ctx, -13, -13, 2, 8, '#fef08a');

            // Right Holy Winged Crescent Blade
            pRect(ctx, 2, -15, 10, 12, '#94a3b8');
            pRect(ctx, 2, -14, 9, 10, '#cbd5e1');
            pRect(ctx, 3, -13, 7, 8, '#f8fafc');
            pRect(ctx, 11, -14, 2, 10, '#fbbf24');
            pRect(ctx, 12, -13, 2, 8, '#fef08a');

            // Central Sunburst Sapphire Crest & Top Diamond Spearhead
            pRect(ctx, -3, -12, 7, 6, '#b45309');
            pRect(ctx, -2, -11, 5, 4, '#fbbf24');
            pRect(ctx, -1, -10, 3, 2, '#2563eb');
            pRect(ctx, 0, -10, 1, 1, '#ffffff');
            pRect(ctx, -1, -20, 3, 5, '#cbd5e1');
            pRect(ctx, 0, -21, 1, 3, '#ffffff');
          } else if (isEpic) {
            // BLOOD MOON EXECUTIONER AXE (Epic tier)
            pRect(ctx, -1, -14, 3, 26, '#1e1b4b');
            pRect(ctx, -1, -7, 3, 2, '#7e22ce');
            pRect(ctx, -1, 4, 3, 2, '#7e22ce');

            // Crescent Violet Double Blade
            pRect(ctx, -10, -14, 9, 11, '#3b0764');
            pRect(ctx, -9, -13, 7, 9, '#7e22ce');
            pRect(ctx, -11, -13, 2, 9, '#c084fc');
            pRect(ctx, -12, -12, 1, 7, '#ffffff');

            pRect(ctx, 2, -14, 9, 11, '#3b0764');
            pRect(ctx, 3, -13, 7, 9, '#7e22ce');
            pRect(ctx, 10, -13, 2, 9, '#c084fc');
            pRect(ctx, 11, -12, 1, 7, '#ffffff');

            pRect(ctx, -2, -11, 5, 5, '#9333ea');
            pRect(ctx, -1, -10, 3, 3, '#c084fc');
            pRect(ctx, -1, -17, 3, 4, '#7e22ce');
          } else if (isRare) {
            // STEEL KNIGHT BATTLEAXE (Rare tier)
            pRect(ctx, -1, -13, 3, 25, '#475569');
            pRect(ctx, -1, -6, 3, 2, '#38bdf8');
            pRect(ctx, -1, 5, 3, 2, '#38bdf8');

            // Double crescent iron blades
            pRect(ctx, -9, -13, 8, 10, '#334155');
            pRect(ctx, -8, -12, 7, 8, '#64748b');
            pRect(ctx, -10, -12, 2, 8, '#cbd5e1');
            pRect(ctx, -11, -11, 1, 6, '#ffffff');

            pRect(ctx, 2, -13, 8, 10, '#334155');
            pRect(ctx, 2, -12, 7, 8, '#64748b');
            pRect(ctx, 9, -12, 2, 8, '#cbd5e1');
            pRect(ctx, 10, -11, 1, 6, '#ffffff');

            pRect(ctx, -2, -10, 5, 4, '#38bdf8');
            pRect(ctx, -1, -16, 3, 4, '#cbd5e1');
          } else if (isUncommon) {
            // WOODSMAN BATTLEAXE (Uncommon tier)
            pRect(ctx, -1, -12, 3, 24, '#78350f');
            pRect(ctx, -1, 3, 3, 6, '#15803d');

            // Single broad curved blade + rear spike
            pRect(ctx, -8, -12, 7, 9, '#475569');
            pRect(ctx, -7, -11, 6, 7, '#94a3b8');
            pRect(ctx, -9, -11, 2, 7, '#cbd5e1');
            pRect(ctx, 2, -10, 4, 5, '#475569');
            pRect(ctx, 5, -9, 2, 3, '#94a3b8');
          } else {
            // WORN WOODCHOPPER AXE (Common tier)
            pRect(ctx, -1, -10, 3, 22, '#78350f');
            pRect(ctx, 0, -9, 1, 20, '#a16207');
            pRect(ctx, -7, -10, 6, 8, '#57534e');
            pRect(ctx, -6, -9, 5, 6, '#78716c');
            pRect(ctx, -8, -9, 2, 6, '#a8a29e');
            pRect(ctx, 1, -8, 2, 4, '#57534e');
          }
        } else {
          // =================================================================
          // 3. SPEAR / LANCE / TRIDENT DESIGNS
          // =================================================================
          if (isMythic) {
            // DRACONIC HALBERD / MAGMA LANCE (ONLY MYTHIC TIER)
            // Long Obsidian Dragon-Bone Shaft
            pRect(ctx, -1, -12, 3, 28, '#18181b');
            pRect(ctx, -1, -6, 3, 2, '#f59e0b');
            pRect(ctx, -1, 4, 3, 2, '#f59e0b');
            pRect(ctx, -2, 14, 5, 3, '#b91c1c');
            pRect(ctx, -1, 16, 3, 2, '#fef08a');

            // Secondary Curved Dragon Talons / Side Hooks
            pRect(ctx, -7, -12, 6, 4, '#7f1d1d');
            pRect(ctx, -8, -13, 3, 3, '#ef4444');
            pRect(ctx, -9, -14, 2, 2, '#fef08a');
            pRect(ctx, 2, -12, 6, 4, '#7f1d1d');
            pRect(ctx, 6, -13, 3, 3, '#ef4444');
            pRect(ctx, 8, -14, 2, 2, '#fef08a');

            // Massive Serrated Dragon Horn Spearhead
            pRect(ctx, -3, -19, 7, 8, '#18181b');
            pRect(ctx, -2, -21, 5, 9, '#7f1d1d');
            pRect(ctx, -1, -23, 3, 10, '#dc2626');
            pRect(ctx, 0, -25, 1, 10, '#f97316');
            pRect(ctx, 0, -26, 1, 3, '#ffffff');

            // Dragon Eye Socket on Spear Base
            pRect(ctx, -2, -12, 5, 5, '#f59e0b');
            pRect(ctx, -1, -11, 3, 3, '#dc2626');
            pRect(ctx, 0, -11, 1, 1, '#ffffff');
          } else if (isGold) {
            // IMPERIAL CRUSADER LANCE (GOLD TIER ONLY - L2 S-Grade)
            // White & Gold Spiral Pole with Gilded Butt Cap
            pRect(ctx, -1, -10, 3, 26, '#cbd5e1');
            pRect(ctx, 0, -9, 1, 24, '#f8fafc');
            pRect(ctx, -1, -4, 3, 2, '#fbbf24');
            pRect(ctx, -1, 5, 3, 2, '#fbbf24');
            pRect(ctx, -2, 14, 5, 3, '#b45309');
            pRect(ctx, -1, 15, 3, 2, '#2563eb');

            // Royal Winged Golden Pennants / Crossguard
            pRect(ctx, -7, -10, 6, 3, '#fbbf24');
            pRect(ctx, -8, -12, 3, 3, '#fef08a');
            pRect(ctx, 2, -10, 6, 3, '#fbbf24');
            pRect(ctx, 6, -12, 3, 3, '#fef08a');

            // Long Diamond Platinum Spearhead with Sapphire Center
            pRect(ctx, -3, -17, 7, 7, '#94a3b8');
            pRect(ctx, -2, -20, 5, 9, '#cbd5e1');
            pRect(ctx, -1, -22, 3, 9, '#f8fafc');
            pRect(ctx, 0, -24, 1, 9, '#38bdf8');
            pRect(ctx, 0, -25, 1, 3, '#ffffff');

            // Sapphire Jewel at Lance Base
            pRect(ctx, -2, -10, 5, 4, '#b45309');
            pRect(ctx, -1, -9, 3, 2, '#2563eb');
            pRect(ctx, 0, -9, 1, 1, '#ffffff');
          } else if (isEpic) {
            // VOID TRIDENT (Epic tier)
            pRect(ctx, -1, -8, 3, 24, '#1e1b4b');
            pRect(ctx, -1, 2, 3, 2, '#7e22ce');

            // 3-Pronged Violet Trident Head
            pRect(ctx, -6, -9, 13, 3, '#7e22ce');
            // Left prong
            pRect(ctx, -6, -17, 2, 9, '#9333ea');
            pRect(ctx, -6, -18, 1, 3, '#c084fc');
            // Right prong
            pRect(ctx, 5, -17, 2, 9, '#9333ea');
            pRect(ctx, 6, -18, 1, 3, '#c084fc');
            // Center spear
            pRect(ctx, -1, -20, 3, 12, '#c084fc');
            pRect(ctx, 0, -22, 1, 5, '#ffffff');
          } else if (isRare) {
            // STEEL KNIGHT LANCE (Rare tier)
            pRect(ctx, -1, -8, 3, 24, '#475569');
            pRect(ctx, -1, 3, 3, 4, '#38bdf8');

            // Crossbar lugs
            pRect(ctx, -5, -8, 11, 2, '#64748b');

            // Diamond-leaf steel point
            pRect(ctx, -2, -16, 5, 8, '#64748b');
            pRect(ctx, -1, -19, 3, 10, '#cbd5e1');
            pRect(ctx, 0, -21, 1, 10, '#ffffff');
          } else if (isUncommon) {
            // MILITIA STEEL SPEAR (Uncommon tier)
            pRect(ctx, -1, -8, 3, 24, '#78350f');
            pRect(ctx, -1, 0, 3, 4, '#15803d');
            pRect(ctx, -2, -14, 5, 6, '#64748b');
            pRect(ctx, -1, -17, 3, 8, '#94a3b8');
            pRect(ctx, 0, -19, 1, 8, '#cbd5e1');
          } else {
            // POINTED PIKE (Common tier)
            pRect(ctx, -1, -6, 3, 22, '#78350f');
            pRect(ctx, 0, -5, 1, 20, '#a16207');
            pRect(ctx, -2, -11, 5, 5, '#57534e');
            pRect(ctx, -1, -14, 3, 7, '#78716c');
            pRect(ctx, 0, -16, 1, 6, '#a8a29e');
          }
        }

        ctx.restore();
        break;
      }
      case 'legs': {
        if (isMythic) {
          // =================================================================
          // MASSIVE DRACONIC GREAVES (ONLY MYTHIC TIER)
          // =================================================================
          pRect(ctx, 6, 6, 8, 18, '#18181b');
          pRect(ctx, 18, 6, 8, 18, '#18181b');

          // Segmented blood-red dragon scales
          pRect(ctx, 7, 8, 6, 3, '#991b1b');
          pRect(ctx, 19, 8, 6, 3, '#991b1b');
          pRect(ctx, 7, 12, 6, 3, '#991b1b');
          pRect(ctx, 19, 12, 6, 3, '#991b1b');

          pRect(ctx, 8, 9, 4, 1, '#ef4444');
          pRect(ctx, 20, 9, 4, 1, '#ef4444');
          pRect(ctx, 8, 13, 4, 1, '#ef4444');
          pRect(ctx, 20, 13, 4, 1, '#ef4444');

          // FORWARD-CURVED KNEE DRAGON HORNS
          pRect(ctx, 3, 6, 4, 4, '#b91c1c');
          pRect(ctx, 2, 4, 3, 3, '#f59e0b');
          pRect(ctx, 1, 3, 2, 2, '#fef08a');
          pRect(ctx, 25, 6, 4, 4, '#b91c1c');
          pRect(ctx, 27, 4, 3, 3, '#f59e0b');
          pRect(ctx, 29, 3, 2, 2, '#fef08a');

          // LATERAL CALF FIN SPIKES
          pRect(ctx, 3, 14, 4, 4, '#7f1d1d');
          pRect(ctx, 2, 15, 2, 2, '#ef4444');
          pRect(ctx, 25, 14, 4, 4, '#7f1d1d');
          pRect(ctx, 28, 15, 2, 2, '#ef4444');

          // CLAWED DRACONIC SABATONS
          pRect(ctx, 4, 22, 11, 5, '#18181b');
          pRect(ctx, 17, 22, 11, 5, '#18181b');
          pRect(ctx, 5, 23, 9, 2, '#7f1d1d');
          pRect(ctx, 18, 23, 9, 2, '#7f1d1d');

          // Sharp Talons
          pRect(ctx, 2, 24, 3, 3, '#fbbf24');
          pRect(ctx, 1, 25, 2, 2, '#fef08a');
          pRect(ctx, 15, 24, 3, 3, '#fbbf24');
          pRect(ctx, 14, 25, 2, 2, '#fef08a');
          pRect(ctx, 28, 24, 3, 3, '#fbbf24');
          pRect(ctx, 29, 25, 2, 2, '#fef08a');

          pRect(ctx, 3, 28, 26, 2, '#ef4444');
          pRect(ctx, 7, 29, 18, 1, '#facc15');
        } else if (isGold) {
          // =================================================================
          // IMPERIAL CRUSADER GAITERS & SABATONS (GOLD TIER ONLY - L2 S-Grade)
          // Heavy polished white-steel greaves with golden lion-head knee cops,
          // gold shin trim, flared sabatons with gold spur trims
          // =================================================================
          // Left Greave & Right Greave bases (white platinum plate)
          pRect(ctx, 6, 7, 8, 16, '#0f172a');
          pRect(ctx, 18, 7, 8, 16, '#0f172a');
          pRect(ctx, 7, 8, 6, 14, '#cbd5e1');
          pRect(ctx, 19, 8, 6, 14, '#cbd5e1');
          pRect(ctx, 8, 9, 4, 12, '#f8fafc');
          pRect(ctx, 20, 9, 4, 12, '#f8fafc');

          // GOLDEN LION-HEAD KNEE COPS
          pRect(ctx, 5, 6, 10, 6, '#b45309');
          pRect(ctx, 17, 6, 10, 6, '#b45309');
          pRect(ctx, 6, 7, 8, 4, '#fbbf24');
          pRect(ctx, 18, 7, 8, 4, '#fbbf24');
          pRect(ctx, 7, 8, 6, 2, '#fef08a');
          pRect(ctx, 19, 8, 6, 2, '#fef08a');
          pRect(ctx, 9, 7, 2, 2, '#2563eb'); // Small sapphire gem in knee
          pRect(ctx, 21, 7, 2, 2, '#2563eb');

          // Golden Shin Ridges
          pRect(ctx, 9, 13, 2, 8, '#f59e0b');
          pRect(ctx, 21, 13, 2, 8, '#f59e0b');
          pRect(ctx, 10, 14, 1, 6, '#fef08a');
          pRect(ctx, 22, 14, 1, 6, '#fef08a');

          // HEAVY WHITE-STEEL SABATONS WITH GOLD KNIGHT SPURS
          pRect(ctx, 4, 21, 11, 5, '#0f172a');
          pRect(ctx, 17, 21, 11, 5, '#0f172a');
          pRect(ctx, 5, 21, 9, 4, '#f8fafc');
          pRect(ctx, 18, 21, 9, 4, '#f8fafc');
          // Gilded toe caps & rims
          pRect(ctx, 3, 23, 4, 3, '#fbbf24');
          pRect(ctx, 26, 23, 4, 3, '#fbbf24');
          pRect(ctx, 2, 24, 2, 2, '#fef08a'); // Gold spur
          pRect(ctx, 28, 24, 2, 2, '#fef08a');
        } else if (isEpic) {
          // SIMPLE ASSASSIN BOOTS (Epic tier - sleek violet leather)
          pRect(ctx, 8, 9, 6, 13, '#1e1b4b');
          pRect(ctx, 18, 9, 6, 13, '#1e1b4b');
          pRect(ctx, 9, 10, 4, 11, '#3b0764');
          pRect(ctx, 19, 10, 4, 11, '#3b0764');
          pRect(ctx, 7, 19, 8, 4, '#581c87');
          pRect(ctx, 17, 19, 8, 4, '#581c87');
        } else if (isRare) {
          // SIMPLE STEEL GREAVES (Rare tier - standard iron greaves)
          pRect(ctx, 8, 9, 6, 13, '#334155');
          pRect(ctx, 18, 9, 6, 13, '#334155');
          pRect(ctx, 9, 10, 4, 11, '#64748b');
          pRect(ctx, 19, 10, 4, 11, '#64748b');
          pRect(ctx, 7, 20, 8, 4, '#1e293b');
          pRect(ctx, 17, 20, 8, 4, '#1e293b');
        } else if (isUncommon) {
          // SIMPLE LEATHER BOOTS (Uncommon tier - sturdy hunter boots)
          pRect(ctx, 8, 10, 6, 12, '#14532d');
          pRect(ctx, 18, 10, 6, 12, '#14532d');
          pRect(ctx, 9, 11, 4, 10, '#15803d');
          pRect(ctx, 19, 11, 4, 10, '#15803d');
          pRect(ctx, 7, 20, 8, 4, '#78350f');
          pRect(ctx, 17, 20, 8, 4, '#78350f');
        } else {
          // SIMPLE WORN SHOES / CLOTH WRAPS (Common tier - plain basic footwear)
          pRect(ctx, 9, 11, 5, 11, '#44403c');
          pRect(ctx, 18, 11, 5, 11, '#44403c');
          pRect(ctx, 8, 20, 7, 4, '#292524');
          pRect(ctx, 17, 20, 7, 4, '#292524');
        }
        break;
      }
      case 'artifact': {
        if (isMythic) {
          // =================================================================
          // OKO DRAKONA / HEART OF VALAKAS (ONLY MYTHIC TIER)
          // =================================================================
          pRect(ctx, 4, 13, 5, 6, '#18181b');
          pRect(ctx, 23, 13, 5, 6, '#18181b');
          pRect(ctx, 13, 4, 6, 5, '#18181b');
          pRect(ctx, 13, 23, 6, 5, '#18181b');

          pRect(ctx, 3, 14, 2, 4, '#f59e0b');
          pRect(ctx, 27, 14, 2, 4, '#f59e0b');
          pRect(ctx, 14, 3, 4, 2, '#f59e0b');
          pRect(ctx, 14, 27, 4, 2, '#f59e0b');

          pCircle(ctx, 16, 16, 9, '#450a0a');
          pCircle(ctx, 16, 16, 7, '#dc2626');
          pCircle(ctx, 16, 16, 5, '#f97316');
          pCircle(ctx, 16, 16, 3, '#fef08a');

          // Vertical slit pupil
          pRect(ctx, 15, 11, 2, 10, '#090202');
          pRect(ctx, 16, 13, 1, 6, '#450a0a');
          pRect(ctx, 14, 13, 2, 2, '#ffffff');

          pRect(ctx, 6, 6, 2, 2, '#facc15');
          pRect(ctx, 24, 7, 2, 2, '#facc15');
        } else if (isGold) {
          // =================================================================
          // SACRED IMPERIAL CHALICE (GOLD TIER ONLY - L2 S-Grade)
          // Holy Golden Chalice with royal sapphires & holy radiance
          // =================================================================
          // Holy sunburst rays
          pRect(ctx, 15, 3, 2, 4, '#fef08a');
          pRect(ctx, 15, 25, 2, 4, '#fef08a');
          pRect(ctx, 4, 15, 4, 2, '#fef08a');
          pRect(ctx, 24, 15, 4, 2, '#fef08a');

          // Golden Chalice Cup & Rim
          pRect(ctx, 8, 8, 16, 4, '#b45309');
          pRect(ctx, 9, 9, 14, 2, '#fbbf24');
          pRect(ctx, 10, 10, 12, 1, '#fef08a');

          // Chalice Body
          pRect(ctx, 9, 12, 14, 7, '#b45309');
          pRect(ctx, 10, 12, 12, 6, '#fbbf24');
          pRect(ctx, 11, 13, 10, 4, '#fef08a');

          // Central Large Royal Sapphire
          pRect(ctx, 14, 13, 4, 4, '#1e3a8a');
          pRect(ctx, 15, 14, 2, 2, '#38bdf8');
          pRect(ctx, 15, 14, 1, 1, '#ffffff');

          // Chalice Stem & Base
          pRect(ctx, 14, 18, 4, 5, '#b45309');
          pRect(ctx, 15, 18, 2, 5, '#fbbf24');
          pRect(ctx, 10, 23, 12, 3, '#b45309');
          pRect(ctx, 11, 23, 10, 2, '#fbbf24');
        } else if (isEpic) {
          // SIMPLE AMETHYST ORB (Epic tier)
          pCircle(ctx, 16, 16, 7, '#3b0764');
          pCircle(ctx, 16, 16, 5, '#7e22ce');
          pCircle(ctx, 16, 16, 3, '#c084fc');
          pRect(ctx, 14, 14, 2, 2, '#ffffff');
        } else if (isRare) {
          // SIMPLE SAPPHIRE STONE (Rare tier)
          pRect(ctx, 11, 11, 10, 10, '#0284c7');
          pRect(ctx, 12, 12, 8, 8, '#38bdf8');
          pRect(ctx, 14, 14, 4, 4, '#ffffff');
        } else if (isUncommon) {
          // SIMPLE JADE TOTEM (Uncommon tier)
          pRect(ctx, 12, 11, 8, 10, '#15803d');
          pRect(ctx, 13, 12, 6, 8, '#22c55e');
          pRect(ctx, 14, 8, 4, 4, '#78350f');
        } else {
          // SIMPLE RIVER PEBBLE (Common tier - basic stone on twine)
          pRect(ctx, 12, 12, 8, 8, '#57534e');
          pRect(ctx, 13, 13, 6, 6, '#78716c');
          pRect(ctx, 14, 8, 4, 5, '#78350f');
        }
        break;
      }
      case 'pet': {
        if (isMythic) {
          // =================================================================
          // ARMORED DRACONIC WYVERN (ONLY MYTHIC TIER)
          // =================================================================
          pRect(ctx, 8, 12, 16, 11, '#18181b');
          pRect(ctx, 10, 13, 12, 8, '#991b1b');
          pRect(ctx, 12, 15, 8, 5, '#dc2626');
          pRect(ctx, 4, 18, 5, 4, '#991b1b');
          pRect(ctx, 2, 16, 3, 3, '#dc2626');
          pRect(ctx, 1, 14, 2, 2, '#f59e0b');

          // Wings
          pRect(ctx, 3, 6, 7, 7, '#7f1d1d');
          pRect(ctx, 22, 6, 7, 7, '#7f1d1d');
          pRect(ctx, 1, 4, 4, 4, '#b91c1c');
          pRect(ctx, 27, 4, 4, 4, '#b91c1c');
          pRect(ctx, 0, 3, 2, 2, '#fbbf24');
          pRect(ctx, 30, 3, 2, 2, '#fbbf24');

          // Dragon Head & Horns
          pRect(ctx, 12, 6, 10, 7, '#18181b');
          pRect(ctx, 13, 7, 8, 5, '#991b1b');
          pRect(ctx, 9, 3, 3, 4, '#f59e0b');
          pRect(ctx, 22, 3, 3, 4, '#f59e0b');
          pRect(ctx, 8, 1, 2, 3, '#fef08a');
          pRect(ctx, 24, 1, 2, 3, '#fef08a');

          // Burning Dragon Eyes
          pRect(ctx, 14, 8, 2, 2, '#facc15');
          pRect(ctx, 18, 8, 2, 2, '#facc15');
          pRect(ctx, 15, 3, 2, 2, '#f97316');
        } else if (isGold) {
          // =================================================================
          // IMPERIAL GRYPHON (GOLD TIER ONLY - L2 S-Grade)
          // Majestic royal white gryphon with golden barding & sapphire eyes
          // =================================================================
          // Gryphon Body (pure white feathers)
          pRect(ctx, 9, 12, 14, 11, '#cbd5e1');
          pRect(ctx, 10, 13, 12, 9, '#f8fafc');

          // Gilded Barding & Armor Plates
          pRect(ctx, 12, 14, 8, 5, '#b45309');
          pRect(ctx, 13, 15, 6, 3, '#fbbf24');
          pRect(ctx, 15, 16, 2, 2, '#2563eb'); // Small sapphire gem

          // White Eagle Wings with Golden Primaries
          pRect(ctx, 4, 6, 6, 8, '#f8fafc');
          pRect(ctx, 22, 6, 6, 8, '#f8fafc');
          pRect(ctx, 2, 4, 4, 5, '#fbbf24');
          pRect(ctx, 26, 4, 4, 5, '#fbbf24');
          pRect(ctx, 1, 2, 2, 3, '#fef08a');
          pRect(ctx, 29, 2, 2, 3, '#fef08a');

          // Royal Gryphon Head & Golden Beak
          pRect(ctx, 12, 6, 9, 7, '#f8fafc');
          pRect(ctx, 18, 8, 4, 3, '#f59e0b'); // Golden hooked beak
          pRect(ctx, 19, 9, 2, 2, '#fef08a');

          // Golden Crest Feathers
          pRect(ctx, 11, 3, 4, 4, '#fbbf24');
          pRect(ctx, 12, 2, 2, 2, '#fef08a');

          // Sapphire Eyes
          pRect(ctx, 15, 7, 2, 2, '#2563eb');
          pRect(ctx, 15, 7, 1, 1, '#ffffff');

          // Lion Claws
          pRect(ctx, 8, 22, 4, 3, '#fbbf24');
          pRect(ctx, 20, 22, 4, 3, '#fbbf24');
        } else if (isEpic) {
          // SIMPLE SHADOW RAVEN (Epic tier)
          pRect(ctx, 10, 10, 12, 11, '#1e1b4b');
          pRect(ctx, 11, 11, 10, 9, '#3b0764');
          pRect(ctx, 5, 8, 6, 7, '#581c87');
          pRect(ctx, 21, 8, 6, 7, '#581c87');
          pRect(ctx, 13, 12, 2, 2, '#c084fc');
          pRect(ctx, 17, 12, 2, 2, '#c084fc');
        } else if (isRare) {
          // SIMPLE ARMORED GUARD DOG (Rare tier)
          pRect(ctx, 9, 12, 14, 11, '#475569');
          pRect(ctx, 10, 13, 12, 9, '#64748b');
          pRect(ctx, 11, 10, 10, 5, '#94a3b8');
          pRect(ctx, 13, 14, 2, 2, '#38bdf8');
        } else if (isUncommon) {
          // SIMPLE FOREST HOUND (Uncommon tier)
          pRect(ctx, 9, 12, 14, 10, '#15803d');
          pRect(ctx, 10, 13, 12, 8, '#22c55e');
          pRect(ctx, 18, 10, 5, 5, '#166534');
        } else {
          // SIMPLE RUSTIC STRAY DOG (Common tier)
          pRect(ctx, 9, 12, 14, 10, '#57534e');
          pRect(ctx, 10, 13, 12, 8, '#78716c');
          pRect(ctx, 18, 10, 5, 5, '#57534e');
          pRect(ctx, 20, 11, 2, 2, '#292524');
        }
        break;
      }
    }
  }, [item, size, showGlow]);

  return (
    <canvas
      ref={canvasRef}
      width={32}
      height={32}
      style={{ width: `${size}px`, height: `${size}px` }}
      className="pixelated rounded transition-transform group-hover:scale-105"
    />
  );
};
