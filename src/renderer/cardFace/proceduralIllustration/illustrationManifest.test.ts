import { describe, expect, it } from 'vitest';
import {
    filterValidIllustrationManifestEntries,
    resolveIllustrationManifestFallback,
    validateIllustrationManifestEntry
} from './illustrationManifest';

describe('illustrationManifest', () => {
    it('accepts authored manifest entries with deterministic runtime fields only', () => {
        expect(
            validateIllustrationManifestEntry({
                allowedTiers: ['minimal', 'standard'],
                assetVersion: 4,
                dropId: 'sigil-drop-03',
                rarityWeight: 2,
                sourceKind: 'authored'
            })
        ).toEqual({
            allowedTiers: ['minimal', 'standard'],
            assetVersion: 4,
            dropId: 'sigil-drop-03',
            rarityWeight: 2,
            sourceKind: 'authored'
        });
    });

    it('accepts neural-baked manifest entries only when provenance is complete', () => {
        expect(
            validateIllustrationManifestEntry({
                allowedTiers: ['full'],
                assetVersion: '7',
                dropId: 'oracle-11',
                modelId: 'sdxl-lightning',
                modelVersion: '1.0.3',
                negativePromptHash: 'neg-456',
                postProcessVersion: 'pp-2',
                promptHash: 'prompt-123',
                rarityWeight: 0.5,
                sampler: 'dpmpp_2m',
                seed: 442211,
                size: '512x512',
                sourceKind: 'neural-baked',
                steps: 14
            })
        ).toEqual({
            allowedTiers: ['full'],
            assetVersion: '7',
            dropId: 'oracle-11',
            modelId: 'sdxl-lightning',
            modelVersion: '1.0.3',
            negativePromptHash: 'neg-456',
            postProcessVersion: 'pp-2',
            promptHash: 'prompt-123',
            rarityWeight: 0.5,
            sampler: 'dpmpp_2m',
            seed: 442211,
            size: '512x512',
            sourceKind: 'neural-baked',
            steps: 14
        });
    });

    it('ignores invalid entries so runtime can fall back to procedural safely', () => {
        expect(
            filterValidIllustrationManifestEntries([
                {
                    allowedTiers: ['minimal'],
                    assetVersion: 2,
                    dropId: 'valid-authored',
                    rarityWeight: 1,
                    sourceKind: 'authored'
                },
                {
                    allowedTiers: [],
                    assetVersion: 2,
                    dropId: 'invalid-empty-tier-list',
                    rarityWeight: 1,
                    sourceKind: 'authored'
                },
                {
                    allowedTiers: ['full'],
                    assetVersion: 3,
                    dropId: 'invalid-neural',
                    rarityWeight: 1,
                    sourceKind: 'neural-baked'
                }
            ])
        ).toEqual([
            {
                allowedTiers: ['minimal'],
                assetVersion: 2,
                dropId: 'valid-authored',
                rarityWeight: 1,
                sourceKind: 'authored'
            }
        ]);
    });

    it('reports the declared fallback path without wiring runtime asset selection yet', () => {
        const entry = validateIllustrationManifestEntry({
            allowedTiers: ['standard', 'full'],
            assetVersion: 1,
            dropId: 'rare-plate',
            rarityWeight: 1,
            sourceKind: 'authored'
        });

        expect(resolveIllustrationManifestFallback(null, 'full', true)).toEqual({
            reason: 'invalid-entry',
            useProceduralFallback: true
        });
        expect(resolveIllustrationManifestFallback(entry, 'minimal', true)).toEqual({
            reason: 'tier-disallowed',
            useProceduralFallback: true
        });
        expect(resolveIllustrationManifestFallback(entry, 'full', false)).toEqual({
            reason: 'missing-asset',
            useProceduralFallback: true
        });
        expect(resolveIllustrationManifestFallback(entry, 'full', true)).toEqual({
            reason: null,
            useProceduralFallback: false
        });
    });
});
