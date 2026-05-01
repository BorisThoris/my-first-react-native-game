import type { GraphicsQualityPreset } from '../../shared/contracts';
import { CARD_PLANE_HEIGHT, CARD_PLANE_WIDTH } from './tileShatter';

export const DUNGEON_BOARD_STAGE_LAYER_POLICY = {
    version: 'dng-061-v1',
    cardSurface: { renderOrder: 0, z: 0 },
    cardWear: { renderOrder: 6 },
    passiveHover: { renderOrder: 7 },
    objectiveHalo: { renderOrder: 9 },
    objectiveRing: { renderOrder: 10 },
    objectiveGlyph: { renderOrder: 11 },
    nextThreatTelegraph: { renderOrder: 12, z: 0.165 },
    resolvingMatch: { renderOrder: 13 },
    currentThreat: { renderOrder: 14, z: 0.22 },
    keyboardFocus: { renderOrder: 15 },
    matchCelebration: { renderOrder: 18 }
} as const;

export type DungeonEnemyMarkerAnchorTransform = {
    baseX: number;
    baseY: number;
    imperfectionX: number;
    imperfectionY: number;
    layoutJitterX: number;
    layoutJitterY: number;
};

export const getDungeonBoardStageLod = (
    graphicsQuality: GraphicsQualityPreset,
    reduceMotion: boolean
): {
    currentMarkerOpacity: number;
    markerMotionEnabled: boolean;
    nextTelegraphOpacity: number;
    strongEffectBudget: 'critical-only' | 'standard' | 'full';
} => {
    if (reduceMotion) {
        return {
            currentMarkerOpacity: 0.9,
            markerMotionEnabled: false,
            nextTelegraphOpacity: 0.34,
            strongEffectBudget: 'critical-only'
        };
    }

    if (graphicsQuality === 'low') {
        return {
            currentMarkerOpacity: 0.9,
            markerMotionEnabled: true,
            nextTelegraphOpacity: 0.36,
            strongEffectBudget: 'critical-only'
        };
    }

    if (graphicsQuality === 'high') {
        return {
            currentMarkerOpacity: 0.88,
            markerMotionEnabled: true,
            nextTelegraphOpacity: 0.32,
            strongEffectBudget: 'full'
        };
    }

    return {
        currentMarkerOpacity: 0.88,
        markerMotionEnabled: true,
        nextTelegraphOpacity: 0.32,
        strongEffectBudget: 'standard'
    };
};

export const getDungeonEnemyMarkerAnchor = (
    transform: DungeonEnemyMarkerAnchorTransform,
    layer: 'currentThreat' | 'nextThreatTelegraph',
    bob = 0
): [number, number, number] => {
    const xOffset = layer === 'currentThreat' ? CARD_PLANE_WIDTH * 0.34 : -CARD_PLANE_WIDTH * 0.34;
    const yOffset = layer === 'currentThreat' ? CARD_PLANE_HEIGHT * 0.34 : -CARD_PLANE_HEIGHT * 0.34;
    const z =
        layer === 'currentThreat'
            ? DUNGEON_BOARD_STAGE_LAYER_POLICY.currentThreat.z
            : DUNGEON_BOARD_STAGE_LAYER_POLICY.nextThreatTelegraph.z;

    return [
        transform.baseX + transform.imperfectionX + transform.layoutJitterX + xOffset,
        transform.baseY + transform.imperfectionY + transform.layoutJitterY + yOffset + bob,
        z
    ];
};
