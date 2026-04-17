import type { OverlayDrawTier } from '../overlayDrawTier';

export type IllustrationSourceKind = 'authored' | 'neural-baked';

export type IllustrationManifestEntryBase = {
    allowedTiers: readonly OverlayDrawTier[];
    assetVersion: number | string;
    dropId: string;
    rarityWeight: number;
    sourceKind: IllustrationSourceKind;
};

export type AuthoredIllustrationManifestEntry = IllustrationManifestEntryBase & {
    sourceKind: 'authored';
};

export type NeuralBakedIllustrationManifestEntry = IllustrationManifestEntryBase & {
    modelId: string;
    modelVersion: string;
    negativePromptHash: string;
    postProcessVersion: string;
    promptHash: string;
    sampler: string;
    seed: number | string;
    size: string;
    sourceKind: 'neural-baked';
    steps: number;
};

export type FutureIllustrationManifestEntry =
    | AuthoredIllustrationManifestEntry
    | NeuralBakedIllustrationManifestEntry;

export type IllustrationManifestFallbackReason = 'invalid-entry' | 'missing-asset' | 'tier-disallowed' | null;

const VALID_TIERS: readonly OverlayDrawTier[] = ['minimal', 'standard', 'full'] as const;

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === 'object' && value != null;

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;

const isAssetVersion = (value: unknown): value is number | string =>
    (typeof value === 'number' && Number.isFinite(value)) || isNonEmptyString(value);

const isAllowedTierList = (value: unknown): value is readonly OverlayDrawTier[] =>
    Array.isArray(value) && value.length > 0 && value.every((tier) => typeof tier === 'string' && VALID_TIERS.includes(tier as OverlayDrawTier));

const isPositiveWeight = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value > 0;

const isValidSourceKind = (value: unknown): value is IllustrationSourceKind =>
    value === 'authored' || value === 'neural-baked';

const hasNeuralProvenance = (
    value: Record<string, unknown>
): value is Record<string, string | number | readonly OverlayDrawTier[]> & Omit<
    NeuralBakedIllustrationManifestEntry,
    keyof IllustrationManifestEntryBase
> =>
    isNonEmptyString(value.modelId) &&
    isNonEmptyString(value.modelVersion) &&
    isAssetVersion(value.seed) &&
    isNonEmptyString(value.promptHash) &&
    isNonEmptyString(value.negativePromptHash) &&
    isNonEmptyString(value.sampler) &&
    typeof value.steps === 'number' &&
    Number.isFinite(value.steps) &&
    value.steps > 0 &&
    isNonEmptyString(value.size) &&
    isNonEmptyString(value.postProcessVersion);

export const validateIllustrationManifestEntry = (value: unknown): FutureIllustrationManifestEntry | null => {
    if (!isRecord(value)) {
        return null;
    }
    if (
        !isNonEmptyString(value.dropId) ||
        !isAssetVersion(value.assetVersion) ||
        !isPositiveWeight(value.rarityWeight) ||
        !isAllowedTierList(value.allowedTiers) ||
        !isValidSourceKind(value.sourceKind)
    ) {
        return null;
    }

    if (value.sourceKind === 'authored') {
        return {
            allowedTiers: [...value.allowedTiers],
            assetVersion: value.assetVersion,
            dropId: value.dropId,
            rarityWeight: value.rarityWeight,
            sourceKind: 'authored'
        };
    }

    if (!hasNeuralProvenance(value)) {
        return null;
    }

    return {
        allowedTiers: [...value.allowedTiers],
        assetVersion: value.assetVersion,
        dropId: value.dropId,
        modelId: value.modelId,
        modelVersion: value.modelVersion,
        negativePromptHash: value.negativePromptHash,
        postProcessVersion: value.postProcessVersion,
        promptHash: value.promptHash,
        rarityWeight: value.rarityWeight,
        sampler: value.sampler,
        seed: value.seed,
        size: value.size,
        sourceKind: 'neural-baked',
        steps: value.steps
    };
};

export const filterValidIllustrationManifestEntries = (
    entries: readonly unknown[]
): FutureIllustrationManifestEntry[] =>
    entries.flatMap((entry) => {
        const validEntry = validateIllustrationManifestEntry(entry);
        return validEntry ? [validEntry] : [];
    });

export const resolveIllustrationManifestFallback = (
    entry: FutureIllustrationManifestEntry | null | undefined,
    tier: OverlayDrawTier,
    assetAvailable: boolean
): { reason: IllustrationManifestFallbackReason; useProceduralFallback: boolean } => {
    if (!entry) {
        return { reason: 'invalid-entry', useProceduralFallback: true };
    }
    if (!entry.allowedTiers.includes(tier)) {
        return { reason: 'tier-disallowed', useProceduralFallback: true };
    }
    if (!assetAvailable) {
        return { reason: 'missing-asset', useProceduralFallback: true };
    }
    return { reason: null, useProceduralFallback: false };
};
