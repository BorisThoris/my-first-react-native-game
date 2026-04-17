import type { GraphicsQualityPreset } from './contracts';

/**
 * Consolidated tier mapping for tests and docs — keep in sync with `TileBoard`, `TileBoardScene`, `MainMenuBackground`.
 * Changing a preset should update consumers together (see `graphicsQuality.test.ts` + gameplay visual config).
 */
export type GraphicsQualityTierSnapshot = {
    quality: GraphicsQualityPreset;
    boardDprCapStandard: number;
    boardDprCapCompact: number;
    menuPixiResolutionCap: number;
    boardAnisotropyCap: number;
    /** Same rule as `TileBoard`: bloom post path only when not low. */
    tileBoardBloomPostPath: boolean;
};

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

/** WebGL tile textures: max anisotropy vs device cap (PERF-007). */
export const getBoardAnisotropyCap = (quality: GraphicsQualityPreset): number =>
    quality === 'low' ? 2 : quality === 'medium' ? 4 : 8;

export const getGraphicsQualityTierSnapshot = (quality: GraphicsQualityPreset): GraphicsQualityTierSnapshot => ({
    quality,
    boardDprCapStandard: getBoardDprCap(quality, false),
    boardDprCapCompact: getBoardDprCap(quality, true),
    menuPixiResolutionCap: getMenuPixiResolutionCap(quality),
    boardAnisotropyCap: getBoardAnisotropyCap(quality),
    tileBoardBloomPostPath: quality !== 'low'
});
