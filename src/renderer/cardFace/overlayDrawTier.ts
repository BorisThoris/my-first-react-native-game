import type { GraphicsQualityPreset } from '../../shared/contracts';

/** Canvas/SVG richness for face overlays (maps from `GraphicsQualityPreset`). */
export type OverlayDrawTier = 'minimal' | 'standard' | 'full';

export const overlayDrawTierFromGraphicsQuality = (quality: GraphicsQualityPreset): OverlayDrawTier => {
    if (quality === 'low') {
        return 'minimal';
    }
    if (quality === 'medium') {
        return 'standard';
    }
    return 'full';
};
