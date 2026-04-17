import { describe, expect, it } from 'vitest';
import {
    buildDropIllustrationCacheKey,
    buildNeuralBakedIllustrationCacheKey,
    buildProceduralIllustrationCacheKey,
    formatIllustrationRegressionStamp,
    getIllustrationVersionStamp,
    getProceduralIllustrationRegressionStamp
} from './illustrationCacheKey';
import { ILLUSTRATION_GEN_SCHEMA_VERSION } from './illustrationSchemaVersion';

describe('illustrationCacheKey', () => {
    it('builds the procedural cache key from pairKey, tier, schema, and texture version', () => {
        expect(buildProceduralIllustrationCacheKey('pair-7', 'standard', 40)).toBe(
            `pair-7|mode=procedural|tier=standard|illustrationSchemaVersion=${ILLUSTRATION_GEN_SCHEMA_VERSION}|textureVersion=40`
        );
    });

    it('builds a future-safe drop cache key shape', () => {
        expect(
            buildDropIllustrationCacheKey({
                assetVersion: 4,
                dropId: 'sigil-drop-03',
                pairKey: 'pair-2',
                rarityWeight: 2,
                textureVersion: 38,
                tier: 'full'
            })
        ).toBe('pair-2|mode=drop|dropId=sigil-drop-03|assetVersion=4|tier=full|textureVersion=38');
    });

    it('builds a future-safe neural baked cache key shape', () => {
        expect(
            buildNeuralBakedIllustrationCacheKey({
                modelId: 'sdxl-lightning',
                modelVersion: '1.0.3',
                negativePromptHash: 'neg-456',
                pairKey: 'pair-9',
                postProcessVersion: 'pp-2',
                promptHash: 'prompt-123',
                sampler: 'dpmpp_2m',
                seed: 442211,
                size: '512x512',
                steps: 14,
                textureVersion: 38
            })
        ).toBe(
            'pair-9|mode=neural-baked|modelId=sdxl-lightning|modelVersion=1.0.3|seed=442211|promptHash=prompt-123|negativePromptHash=neg-456|sampler=dpmpp_2m|steps=14|size=512x512|postProcessVersion=pp-2'
        );
    });

    it('formats regression stamps as structured JSON lines', () => {
        const stamp = getProceduralIllustrationRegressionStamp('pair-alpha', 'minimal', 41);
        expect(JSON.parse(formatIllustrationRegressionStamp(stamp))).toEqual({
            cacheKey: `pair-alpha|mode=procedural|tier=minimal|illustrationSchemaVersion=${ILLUSTRATION_GEN_SCHEMA_VERSION}|textureVersion=41`,
            illustrationSchemaVersion: ILLUSTRATION_GEN_SCHEMA_VERSION,
            mode: 'procedural',
            pairKey: 'pair-alpha',
            textureVersion: 41,
            tier: 'minimal'
        });
    });

    it('builds one stable version token for cache invalidation hooks', () => {
        expect(getIllustrationVersionStamp(40)).toEqual({
            illustrationSchemaVersion: ILLUSTRATION_GEN_SCHEMA_VERSION,
            textureVersion: 40,
            versionToken: `illustrationSchemaVersion=${ILLUSTRATION_GEN_SCHEMA_VERSION}|textureVersion=40`
        });
    });
});
