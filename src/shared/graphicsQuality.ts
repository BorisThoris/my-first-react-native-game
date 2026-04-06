import type { GraphicsQualityPreset } from './contracts';

/** WebGL tile board: effective device pixel ratio cap (PERF-001). */
export const getBoardDprCap = (quality: GraphicsQualityPreset, compact: boolean): number => {
    if (compact) {
        return quality === 'low' ? 1.35 : quality === 'medium' ? 1.9 : 2.35;
    }
    return quality === 'low' ? 1.2 : quality === 'medium' ? 1.7 : 2.1;
};

/** Main menu Pixi atmosphere: cap internal renderer resolution vs OS DPR (PERF-006). */
export const getMenuPixiResolutionCap = (quality: GraphicsQualityPreset): number =>
    quality === 'low' ? 1.25 : quality === 'medium' ? 2 : 2.5;
