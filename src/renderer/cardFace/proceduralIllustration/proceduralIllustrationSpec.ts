import type { OverlayDrawTier } from '../overlayDrawTier';
import { createIllustrationRng } from './illustrationRng';
import { deriveIllustrationSeed } from './illustrationSeed';

/** Background treatment (loot-pool roll). */
export type ArchetypeId = 'solarDisk' | 'voidVault' | 'parchmentBloom' | 'auroraSlash' | 'twinOrbs';

/** Central motif geometry family. */
export type MotifFamily = 'polygonCore' | 'ringStack' | 'starBurst' | 'orbitShards';

export type ProceduralIllustrationSpec = {
    archetype: ArchetypeId;
    motif: MotifFamily;
    /** Polygon vertex count / star points when applicable */
    motifSides: number;
    /** Nested rings or orbit layers */
    ringLayers: number;
    /** Hue anchor 0–360 for accent mixes */
    hueAccent: number;
    /** Scale jitter for motif (0.85–1.15) */
    motifScaleMul: number;
    /** Cosmetic rarity affects ornament density */
    rarityTier: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
};

const ARCHETYPE_POOL: { value: ArchetypeId; weight: number }[] = [
    { value: 'solarDisk', weight: 22 },
    { value: 'voidVault', weight: 22 },
    { value: 'parchmentBloom', weight: 18 },
    { value: 'auroraSlash', weight: 22 },
    { value: 'twinOrbs', weight: 16 }
];

const MOTIF_POOL: { value: MotifFamily; weight: number }[] = [
    { value: 'polygonCore', weight: 28 },
    { value: 'ringStack', weight: 26 },
    { value: 'starBurst', weight: 24 },
    { value: 'orbitShards', weight: 22 }
];

const RARITY_POOL: { value: ProceduralIllustrationSpec['rarityTier']; weight: number }[] = [
    { value: 'common', weight: 52 },
    { value: 'uncommon', weight: 26 },
    { value: 'rare', weight: 14 },
    { value: 'epic', weight: 6 },
    { value: 'legendary', weight: 2 }
];

const tierCapRingLayers = (tier: OverlayDrawTier): number => {
    if (tier === 'minimal') {
        return 2;
    }
    if (tier === 'standard') {
        return 3;
    }
    return 5;
};

export const rollProceduralIllustrationSpec = (
    pairKey: string,
    tier: OverlayDrawTier
): ProceduralIllustrationSpec => {
    const rng = createIllustrationRng(deriveIllustrationSeed(pairKey));
    const archetype = rng.pickWeighted(ARCHETYPE_POOL);
    const motif = rng.pickWeighted(MOTIF_POOL);
    const rarityTier = rng.pickWeighted(RARITY_POOL);

    const sidesMin = motif === 'starBurst' ? 5 : 3;
    const sidesMax = motif === 'polygonCore' ? 8 : motif === 'starBurst' ? 12 : 8;
    const motifSides = rng.nextIntInclusive(sidesMin, sidesMax);

    const maxRings = tierCapRingLayers(tier);
    const rarityBoost =
        rarityTier === 'legendary'
            ? 3
            : rarityTier === 'epic'
              ? 2
              : rarityTier === 'rare'
                ? 1
                : 0;
    const ringLayers = Math.min(maxRings, rng.nextIntInclusive(1, maxRings) + (rarityBoost >= 2 ? 1 : 0));

    const hueAccent = rng.nextInt(360);
    const motifScaleMul = 0.85 + rng.nextFloat01() * 0.3;

    return {
        archetype,
        motif,
        motifSides,
        ringLayers,
        hueAccent,
        motifScaleMul,
        rarityTier
    };
};
