import type { OverlayDrawTier } from '../overlayDrawTier';
import { ILLUSTRATION_GEN_SCHEMA_VERSION } from './illustrationSchemaVersion';

export type IllustrationGenerationMode = 'procedural' | 'drop' | 'neural-baked';

type IllustrationRegressionStampBase = {
    cacheKey: string;
    mode: IllustrationGenerationMode;
    pairKey: string;
    textureVersion: number;
};

export type ProceduralIllustrationRegressionStamp = IllustrationRegressionStampBase & {
    illustrationSchemaVersion: number;
    mode: 'procedural';
    tier: OverlayDrawTier;
};

export type DropIllustrationRegressionStamp = IllustrationRegressionStampBase & {
    assetVersion: number | string;
    dropId: string;
    mode: 'drop';
    rarityWeight: number;
    sourceKind: 'authored';
    tier: OverlayDrawTier;
};

export type NeuralBakedIllustrationRegressionStamp = IllustrationRegressionStampBase & {
    mode: 'neural-baked';
    modelId: string;
    modelVersion: string;
    negativePromptHash: string;
    postProcessVersion: string;
    promptHash: string;
    sampler: string;
    seed: number | string;
    size: string;
    steps: number;
};

export type IllustrationRegressionStamp =
    | ProceduralIllustrationRegressionStamp
    | DropIllustrationRegressionStamp
    | NeuralBakedIllustrationRegressionStamp;

export type IllustrationVersionStamp = {
    illustrationSchemaVersion: number;
    textureVersion: number;
    versionToken: string;
};

export const getIllustrationVersionStamp = (textureVersion: number): IllustrationVersionStamp => ({
    illustrationSchemaVersion: ILLUSTRATION_GEN_SCHEMA_VERSION,
    textureVersion,
    versionToken: `illustrationSchemaVersion=${ILLUSTRATION_GEN_SCHEMA_VERSION}|textureVersion=${textureVersion}`
});

export const buildProceduralIllustrationCacheKey = (
    pairKey: string,
    tier: OverlayDrawTier,
    textureVersion: number
): string =>
    `${pairKey}|mode=procedural|tier=${tier}|illustrationSchemaVersion=${ILLUSTRATION_GEN_SCHEMA_VERSION}|textureVersion=${textureVersion}`;

export const getProceduralIllustrationRegressionStamp = (
    pairKey: string,
    tier: OverlayDrawTier,
    textureVersion: number
): ProceduralIllustrationRegressionStamp => ({
    cacheKey: buildProceduralIllustrationCacheKey(pairKey, tier, textureVersion),
    illustrationSchemaVersion: ILLUSTRATION_GEN_SCHEMA_VERSION,
    mode: 'procedural',
    pairKey,
    textureVersion,
    tier
});

export type DropIllustrationCacheKeyArgs = {
    assetVersion: number | string;
    dropId: string;
    pairKey: string;
    rarityWeight: number;
    sourceKind?: 'authored';
    textureVersion: number;
    tier: OverlayDrawTier;
};

export const buildDropIllustrationCacheKey = ({
    assetVersion,
    dropId,
    pairKey,
    textureVersion,
    tier
}: DropIllustrationCacheKeyArgs): string =>
    `${pairKey}|mode=drop|dropId=${dropId}|assetVersion=${assetVersion}|tier=${tier}|textureVersion=${textureVersion}`;

export const getDropIllustrationRegressionStamp = ({
    assetVersion,
    dropId,
    pairKey,
    rarityWeight,
    sourceKind = 'authored',
    textureVersion,
    tier
}: DropIllustrationCacheKeyArgs): DropIllustrationRegressionStamp => ({
    assetVersion,
    cacheKey: buildDropIllustrationCacheKey({ assetVersion, dropId, pairKey, rarityWeight, sourceKind, textureVersion, tier }),
    dropId,
    mode: 'drop',
    pairKey,
    rarityWeight,
    sourceKind,
    textureVersion,
    tier
});

export type NeuralBakedIllustrationCacheKeyArgs = {
    modelId: string;
    modelVersion: string;
    negativePromptHash: string;
    pairKey: string;
    postProcessVersion: string;
    promptHash: string;
    sampler: string;
    seed: number | string;
    size: string;
    steps: number;
    textureVersion: number;
};

export const buildNeuralBakedIllustrationCacheKey = ({
    modelId,
    modelVersion,
    negativePromptHash,
    pairKey,
    postProcessVersion,
    promptHash,
    sampler,
    seed,
    size,
    steps
}: NeuralBakedIllustrationCacheKeyArgs): string =>
    `${pairKey}|mode=neural-baked|modelId=${modelId}|modelVersion=${modelVersion}|seed=${seed}|promptHash=${promptHash}|negativePromptHash=${negativePromptHash}|sampler=${sampler}|steps=${steps}|size=${size}|postProcessVersion=${postProcessVersion}`;

export const getNeuralBakedIllustrationRegressionStamp = ({
    modelId,
    modelVersion,
    negativePromptHash,
    pairKey,
    postProcessVersion,
    promptHash,
    sampler,
    seed,
    size,
    steps,
    textureVersion
}: NeuralBakedIllustrationCacheKeyArgs): NeuralBakedIllustrationRegressionStamp => ({
    cacheKey: buildNeuralBakedIllustrationCacheKey({
        modelId,
        modelVersion,
        negativePromptHash,
        pairKey,
        postProcessVersion,
        promptHash,
        sampler,
        seed,
        size,
        steps,
        textureVersion
    }),
    mode: 'neural-baked',
    modelId,
    modelVersion,
    negativePromptHash,
    pairKey,
    postProcessVersion,
    promptHash,
    sampler,
    seed,
    size,
    steps,
    textureVersion
});

export const formatIllustrationRegressionStamp = (stamp: IllustrationRegressionStamp): string => JSON.stringify(stamp);
