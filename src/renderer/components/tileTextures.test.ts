import type { Tile } from '../../shared/contracts';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { installCanvas2dMock } from '../../test/installCanvas2dMock';
import { CARD_PLANE_HEIGHT, CARD_PLANE_WIDTH } from './tileShatter';
import {
    clearTileTextureCachesForDebug,
    forceIllustrationOverlayCacheVersionForTest,
    getIllustrationPipelineDebugState,
    getTileFaceOverlayTextureCacheKey,
    getStaticCardTexturePixelSize,
    getTileFaceOverlayTexture,
    prewarmTileFaceOverlayTextures,
    resetDemandDrivenOverlayPrewarmForTest,
    runDemandDrivenTileFaceOverlayPrewarmSession
} from './tileTextures';

vi.mock('../cardFace/proceduralIllustration/drawProceduralTarotIllustration', () => ({
    drawProceduralTarotIllustration: vi.fn()
}));

const baseTile = (id: string, pairKey: string): Tile => ({
    id,
    label: id.toUpperCase(),
    pairKey,
    state: 'hidden',
    symbol: id.slice(0, 1).toUpperCase()
});

describe('tileTextures layout', () => {
    let restoreCanvas2dMock: (() => void) | null = null;

    beforeEach(() => {
        restoreCanvas2dMock = installCanvas2dMock();
    });

    afterEach(() => {
        restoreCanvas2dMock?.();
        restoreCanvas2dMock = null;
        resetDemandDrivenOverlayPrewarmForTest();
        clearTileTextureCachesForDebug();
    });

    it('keeps static card canvas aspect aligned with card plane geometry', () => {
        const { width, height } = getStaticCardTexturePixelSize();
        const aspect = width / height;
        expect(aspect).toBeCloseTo(CARD_PLANE_WIDTH / CARD_PLANE_HEIGHT, 2);
        expect(width).toBeGreaterThan(2);
        expect(height).toBeGreaterThan(2);
    });

    it('reuses the same overlay texture after warm-up requests', () => {
        clearTileTextureCachesForDebug();
        const tile = baseTile('alpha', 'pair-alpha');

        const cold = getTileFaceOverlayTexture(tile, 'active', 'high');
        const warm = getTileFaceOverlayTexture(tile, 'active', 'high');

        const state = getIllustrationPipelineDebugState();
        expect(cold).toBeTruthy();
        expect(warm).toBe(cold);
        expect(state.overlayTexture.createdCount).toBe(1);
        expect(state.overlayTexture.hitCount).toBe(1);
        expect(state.illustrationBitmap.createdCount).toBe(1);
    });

    it('keys route-card overlays separately from normal cards and each route kind', () => {
        const normal = baseTile('alpha', 'pair-alpha');
        const greed: Tile = { ...normal, routeCardKind: 'greed_cache' };
        const safe: Tile = { ...normal, routeCardKind: 'safe_ward' };
        const mystery: Tile = { ...normal, routeCardKind: 'mystery_veil' };

        expect(getTileFaceOverlayTextureCacheKey(greed, 'active', 'high')).not.toBe(
            getTileFaceOverlayTextureCacheKey(normal, 'active', 'high')
        );
        expect(new Set([
            getTileFaceOverlayTextureCacheKey(greed, 'active', 'high'),
            getTileFaceOverlayTextureCacheKey(safe, 'active', 'high'),
            getTileFaceOverlayTextureCacheKey(mystery, 'active', 'high')
        ])).toHaveLength(3);
    });

    it('prewarms only one center-art bitmap per unique pairKey and tier', async () => {
        clearTileTextureCachesForDebug();
        const previousRequestIdleCallback = window.requestIdleCallback;
        const previousCancelIdleCallback = window.cancelIdleCallback;
        window.requestIdleCallback = ((callback: IdleRequestCallback) => {
            callback({
                didTimeout: false,
                timeRemaining: () => 50
            } as IdleDeadline);
            return 1;
        }) as typeof window.requestIdleCallback;
        window.cancelIdleCallback = (() => undefined) as typeof window.cancelIdleCallback;

        try {
            const stop = prewarmTileFaceOverlayTextures(
                [baseTile('a1', 'pair-a'), baseTile('a2', 'pair-a'), baseTile('b1', 'pair-b')],
                'medium',
                'active'
            );
            await Promise.resolve();
            stop();

            const state = getIllustrationPipelineDebugState();
            expect(state.overlayPrewarm.targetKeys).toEqual(['pair-a|tier=standard', 'pair-b|tier=standard']);
            expect(state.overlayPrewarm.completedCount).toBe(2);
            expect(state.illustrationBitmap.entryCount).toBe(2);
            expect(state.overlayTexture.overlayKeyCount).toBe(0);
        } finally {
            window.requestIdleCallback = previousRequestIdleCallback;
            window.cancelIdleCallback = previousCancelIdleCallback;
        }
    });

    it('demand-driven overlay session warms illustration cache for queued pairKeys', async () => {
        clearTileTextureCachesForDebug();
        const previousRequestIdleCallback = window.requestIdleCallback;
        const previousCancelIdleCallback = window.cancelIdleCallback;
        window.requestIdleCallback = ((callback: IdleRequestCallback) => {
            callback({
                didTimeout: false,
                timeRemaining: () => 50
            } as IdleDeadline);
            return 1;
        }) as typeof window.requestIdleCallback;
        window.cancelIdleCallback = (() => undefined) as typeof window.cancelIdleCallback;

        try {
            const stop = runDemandDrivenTileFaceOverlayPrewarmSession(['pair-z'], 'medium');
            await Promise.resolve();
            stop();

            const tile = baseTile('z1', 'pair-z');
            const cold = getTileFaceOverlayTexture(tile, 'active', 'medium');
            const warm = getTileFaceOverlayTexture(tile, 'active', 'medium');
            expect(cold).toBe(warm);
            const state = getIllustrationPipelineDebugState();
            expect(state.illustrationBitmap.entryCount).toBeGreaterThanOrEqual(1);
        } finally {
            window.requestIdleCallback = previousRequestIdleCallback;
            window.cancelIdleCallback = previousCancelIdleCallback;
        }
    });

    it('purges overlay and illustration caches when the combined version token changes', () => {
        clearTileTextureCachesForDebug();
        const tile = baseTile('alpha', 'pair-alpha');
        getTileFaceOverlayTexture(tile, 'active', 'high');

        expect(getIllustrationPipelineDebugState().overlayTexture.overlayKeyCount).toBe(1);

        forceIllustrationOverlayCacheVersionForTest('illustrationSchemaVersion=99|textureVersion=777');

        const state = getIllustrationPipelineDebugState();
        expect(state.overlayTexture.overlayKeyCount).toBe(0);
        expect(state.illustrationBitmap.entryCount).toBe(0);
        expect(state.overlayTexture.versionToken).toBe('illustrationSchemaVersion=99|textureVersion=777');
    });
});
