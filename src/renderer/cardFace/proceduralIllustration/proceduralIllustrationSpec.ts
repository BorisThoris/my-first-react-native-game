import type { OverlayDrawTier } from '../overlayDrawTier';
import { createIllustrationRng } from './illustrationRng';
import { deriveIllustrationSeed } from './illustrationSeed';

/** Background treatment (loot-pool roll). */
export type ArchetypeId =
    | 'solarDisk'
    | 'voidVault'
    | 'parchmentBloom'
    | 'auroraSlash'
    | 'twinOrbs'
    | 'emberVeil'
    | 'mistFold'
    | 'cinderDrift';

/** Central motif geometry family. */
export type MotifFamily =
    | 'polygonCore'
    | 'ringStack'
    | 'starBurst'
    | 'orbitShards'
    | 'mandalaWeave'
    | 'pillarGate'
    | 'thornCrown';

/** Procedural grain overlay (tier may clamp). */
export type IllustrationNoiseStrength = 0 | 1 | 2;

/** Vertical mirror duplicate for symmetric tarot read. */
export type IllustrationSymmetry = 'none' | 'mirrorV';

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
    /** Grid noise blended over backgrounds (0 = off). */
    noiseStrength: IllustrationNoiseStrength;
    /** Duplicate motif across vertical axis through center. */
    symmetry: IllustrationSymmetry;
};

const ARCHETYPE_POOL: { value: ArchetypeId; weight: number }[] = [
    { value: 'solarDisk', weight: 17 },
    { value: 'voidVault', weight: 17 },
    { value: 'parchmentBloom', weight: 14 },
    { value: 'auroraSlash', weight: 16 },
    { value: 'twinOrbs', weight: 12 },
    { value: 'emberVeil', weight: 11 },
    { value: 'mistFold', weight: 11 },
    { value: 'cinderDrift', weight: 10 }
];

const MOTIF_POOL: { value: MotifFamily; weight: number }[] = [
    { value: 'polygonCore', weight: 21 },
    { value: 'ringStack', weight: 19 },
    { value: 'starBurst', weight: 17 },
    { value: 'orbitShards', weight: 17 },
    { value: 'mandalaWeave', weight: 11 },
    { value: 'pillarGate', weight: 9 },
    { value: 'thornCrown', weight: 9 }
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

    const sidesMin =
        motif === 'starBurst'
            ? 5
            : motif === 'mandalaWeave'
              ? 6
              : motif === 'pillarGate'
                ? 4
                : motif === 'thornCrown'
                  ? 5
                  : 3;
    const sidesMax =
        motif === 'polygonCore'
            ? 8
            : motif === 'starBurst'
              ? 12
              : motif === 'mandalaWeave'
                ? 14
                : motif === 'pillarGate'
                  ? 12
                  : motif === 'thornCrown'
                    ? 12
                    : 8;
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

    const noiseRoll = rng.pickWeighted([
        { value: 0 as const, weight: tier === 'minimal' ? 40 : 22 },
        { value: 1 as const, weight: tier === 'minimal' ? 48 : 52 },
        { value: 2 as const, weight: tier === 'minimal' ? 12 : 26 }
    ]);
    const noiseStrength: IllustrationNoiseStrength =
        tier === 'minimal' && noiseRoll === 2 ? 1 : noiseRoll;

    const symmetry = rng.pickWeighted([
        { value: 'none' as const, weight: 74 },
        { value: 'mirrorV' as const, weight: 26 }
    ]);

    return {
        archetype,
        motif,
        motifSides,
        ringLayers,
        hueAccent,
        motifScaleMul,
        rarityTier,
        noiseStrength,
        symmetry
    };
};
