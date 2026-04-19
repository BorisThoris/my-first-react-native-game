import type { GraphicsQualityPreset } from '../../shared/contracts';

/** Canvas/SVG richness for face overlays (maps from `GraphicsQualityPreset`). */
export type OverlayDrawTier = 'minimal' | 'standard' | 'full';

export const OVERLAY_DRAW_TIERS: readonly OverlayDrawTier[] = ['minimal', 'standard', 'full'];

export const overlayDrawTierFromGraphicsQuality = (quality: GraphicsQualityPreset): OverlayDrawTier => {
    if (quality === 'low') {
        return 'minimal';
    }
    if (quality === 'medium') {
        return 'standard';
    }
    return 'full';
};

/**
 * Tokens accepted by `scripts/bake-procedural-illustration-set.ts` `--tiers=` (comma-separated).
 * Single source of truth with the bake script — keep Vitest here in sync with CLI behavior.
 */
export const BAKE_CLI_TIER_ALIASES: Record<string, OverlayDrawTier> = {
    min: 'minimal',
    minimal: 'minimal',
    standard: 'standard',
    medium: 'standard',
    full: 'full',
    high: 'full'
};

/** Parse comma-split tier tokens the same way the bake script does (defaults to `full` if empty). */
export const parseBakeTierTokenList = (parts: string[]): OverlayDrawTier[] => {
    const mapped = parts
        .map((p) => p.trim().toLowerCase())
        .map((p) => BAKE_CLI_TIER_ALIASES[p] ?? (p as OverlayDrawTier))
        .filter((t): t is OverlayDrawTier => OVERLAY_DRAW_TIERS.includes(t));
    return mapped.length > 0 ? mapped : ['full'];
};
