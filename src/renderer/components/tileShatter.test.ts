import { describe, expect, it } from 'vitest';
import { Euler, Vector3 } from 'three';
import type { Tile } from '../../shared/contracts';
import {
    CORE_SCALE,
    SHELL_SCALE,
    createTileShatterEffect,
    getNewlyMatchedTiles,
    getTileShatterFrameState,
    type TileShatterEffectData,
    type TileShatterTransform
} from './tileShatter';

const tile: Tile = {
    id: 'tile-1',
    pairKey: 'A',
    label: 'A',
    symbol: 'A',
    state: 'matched'
};

const transform: TileShatterTransform = {
    coreScale: CORE_SCALE,
    position: new Vector3(0.16, -0.12, 0.04),
    rotation: new Euler(0.02, Math.PI, -0.01),
    seed: 42,
    shellScale: SHELL_SCALE
};

const impactAnchor = { x: 0.68, y: -0.24 };
const alternateImpactAnchor = { x: -0.42, y: 0.57 };

const normalizeNumber = (value: number): number => Number(value.toFixed(6));

const normalizeTuple = (values: readonly number[]): number[] => values.map(normalizeNumber);

const serializeEffect = (effect: TileShatterEffectData) => ({
    coreOpacity: normalizeNumber(effect.coreOpacity),
    coreScale: normalizeNumber(effect.coreScale),
    coreTint: effect.coreTint,
    durationMs: effect.durationMs,
    flashTint: effect.flashTint,
    impactAnchor: {
        x: normalizeNumber(effect.impactAnchor.x),
        y: normalizeNumber(effect.impactAnchor.y)
    },
    impactNormal: normalizeTuple(effect.impactNormal),
    impactPoint: normalizeTuple(effect.impactPoint),
    mode: effect.mode,
    position: normalizeTuple(effect.position),
    pulseCount: effect.pulses.length,
    pulses: effect.pulses.slice(0, 4).map((pulse) => ({
        delayMs: pulse.delayMs,
        durationMs: pulse.durationMs,
        offset: normalizeTuple(pulse.offset),
        opacity: normalizeNumber(pulse.opacity),
        scaleFrom: normalizeNumber(pulse.scaleFrom),
        scaleTo: normalizeNumber(pulse.scaleTo),
        tint: pulse.tint
    })),
    rotation: normalizeTuple(effect.rotation),
    shellScale: normalizeNumber(effect.shellScale),
    shellTint: effect.shellTint,
    startedAtMs: effect.startedAtMs,
    tileId: effect.tileId
});

const serializeFrameState = (frameState: ReturnType<typeof getTileShatterFrameState>) => ({
    completed: frameState.completed,
    coreOpacity: normalizeNumber(frameState.coreOpacity),
    flashOpacity: normalizeNumber(frameState.flashOpacity),
    flashScale: normalizeNumber(frameState.flashScale),
    groupScale: normalizeTuple(frameState.groupScale),
    progress: normalizeNumber(frameState.progress),
    pulseStates: frameState.pulseStates.slice(0, 4).map((pulse) => ({
        opacity: normalizeNumber(pulse.opacity),
        position: normalizeTuple(pulse.position),
        scale: normalizeNumber(pulse.scale),
        tint: pulse.tint
    })),
    shellOpacity: normalizeNumber(frameState.shellOpacity)
});

describe('createTileShatterEffect', () => {
    it('builds a deterministic pulse layout anchored to the tap point', () => {
        const effect = createTileShatterEffect(tile, transform, false, false, 1234, impactAnchor);
        const repeat = createTileShatterEffect(tile, transform, false, false, 1234, impactAnchor);

        expect(serializeEffect(effect)).toEqual(serializeEffect(repeat));
        expect(effect.mode).toBe('pulse');
        expect(effect.startedAtMs).toBe(1234);
        expect(effect.impactAnchor).toEqual(impactAnchor);
        expect(effect.pulses.length).toBeGreaterThan(0);
        expect(effect.pulses[0].scaleTo).toBeGreaterThan(effect.pulses[0].scaleFrom);
    });

    it('changes layout when the impact anchor changes', () => {
        const baseline = createTileShatterEffect(tile, transform, false, false, 1234, impactAnchor);
        const variant = createTileShatterEffect(tile, transform, false, false, 1234, alternateImpactAnchor);

        expect(serializeEffect(variant)).not.toEqual(serializeEffect(baseline));
        expect(variant.impactPoint).not.toEqual(baseline.impactPoint);
    });

    it('returns a fade-only layout when reduce motion is enabled', () => {
        const effect = createTileShatterEffect(tile, transform, false, true, 1234, impactAnchor);

        expect(effect.mode).toBe('fade');
        expect(effect.pulses).toHaveLength(0);
        expect(serializeEffect(effect)).toMatchObject({
            mode: 'fade',
            pulseCount: 0
        });
    });

    it('expands and fades pulse states while shell/core opacity decays', () => {
        const effect = createTileShatterEffect(tile, transform, false, false, 1000, impactAnchor);
        const firstPulse = effect.pulses[0];
        const startFrame = getTileShatterFrameState(effect, 1000);
        const pulseFrame = getTileShatterFrameState(effect, 1000 + firstPulse.delayMs + Math.round(firstPulse.durationMs * 0.4));
        const fadeFrame = getTileShatterFrameState(effect, 1000 + Math.round(effect.durationMs * 0.6));
        const finalFrame = getTileShatterFrameState(effect, 1000 + effect.durationMs);

        expect(serializeFrameState(startFrame)).toMatchObject({
            completed: false,
            pulseStates: expect.any(Array)
        });
        expect(pulseFrame.pulseStates.some((pulse) => pulse.opacity > 0)).toBe(true);
        expect(pulseFrame.pulseStates[0].scale).toBeGreaterThanOrEqual(effect.pulses[0].scaleFrom);
        expect(startFrame.groupScale[0]).toBeGreaterThan(pulseFrame.groupScale[0]);
        expect(pulseFrame.groupScale[0]).toBeGreaterThanOrEqual(finalFrame.groupScale[0]);
        expect(startFrame.coreOpacity).toBeGreaterThan(fadeFrame.coreOpacity);
        expect(fadeFrame.coreOpacity).toBeGreaterThanOrEqual(finalFrame.coreOpacity);
        expect(finalFrame.pulseStates.every((pulse) => pulse.opacity === 0)).toBe(true);
        expect(finalFrame.completed).toBe(true);
    });

    it('emits newly matched tiles once and suppresses repeats after spawn or completion', () => {
        const boardTiles: Tile[] = [
            { id: 'a1', pairKey: 'A', label: 'A', symbol: 'A', state: 'hidden' },
            { id: 'a2', pairKey: 'A', label: 'A', symbol: 'A', state: 'matched' },
            { id: 'b1', pairKey: 'B', label: 'B', symbol: 'B', state: 'matched' }
        ];
        const previousMatchedIds = new Set<string>();
        const activeShatterIds = new Set<string>();
        const settledMatchedIds = new Set<string>();

        expect(getNewlyMatchedTiles(boardTiles, previousMatchedIds, activeShatterIds, settledMatchedIds)).toEqual([
            { index: 1, tile: boardTiles[1] },
            { index: 2, tile: boardTiles[2] }
        ]);

        const currentMatchedIds = new Set(['a2', 'b1']);
        previousMatchedIds.clear();
        currentMatchedIds.forEach((id) => previousMatchedIds.add(id));
        activeShatterIds.add('a2');

        expect(getNewlyMatchedTiles(boardTiles, previousMatchedIds, activeShatterIds, settledMatchedIds)).toEqual([]);

        activeShatterIds.delete('a2');
        settledMatchedIds.add('a2');
        expect(getNewlyMatchedTiles(boardTiles, previousMatchedIds, activeShatterIds, settledMatchedIds)).toEqual([]);
    });
});
