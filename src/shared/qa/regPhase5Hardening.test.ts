import { describe, expect, it } from 'vitest';
import {
    REG027_VISUAL_BASELINE_EPOCH,
    reg109QualityEnforcesDprAndAniso,
    REG109_TARGET_FRAME_BUDGET_MS,
    REG110_CONTEXT_LOSS_USER_COPY,
    REG111_POINTER_TO_COMMIT_SLA_MS,
    REG112_REDUCED_MOTION_SUPPRESSES,
    REG030_LOCAL_PLAYTEST_SCHEMA,
    REG041_EXPORT_SCOPE,
    REG062_E2E_STABILITY_MODE
} from './regPhase5Hardening';

describe('REG phase-5 hardening contract', () => {
    it('REG-109: every graphics tier exposes finite caps and a frame budget target', () => {
        expect(reg109QualityEnforcesDprAndAniso('low')).toBe(true);
        expect(reg109QualityEnforcesDprAndAniso('high')).toBe(true);
        expect(REG109_TARGET_FRAME_BUDGET_MS).toBeLessThanOrEqual(20);
    });

    it('REG-110: ships user-facing copy for context loss', () => {
        expect(REG110_CONTEXT_LOSS_USER_COPY.toLowerCase()).toContain('webgl');
    });

    it('REG-111: names a touch/ pointer SLA in milliseconds', () => {
        expect(REG111_POINTER_TO_COMMIT_SLA_MS).toBeGreaterThan(16);
    });

    it('REG-112: lists reduced-motion suppressions for FX LOD', () => {
        expect(REG112_REDUCED_MOTION_SUPPRESSES).toContain('parallaxTilt');
    });

    it('REG-027/030/041/062: version tokens for baselines, telemetry schema, and e2e policy', () => {
        expect(REG027_VISUAL_BASELINE_EPOCH.length).toBeGreaterThan(4);
        expect(REG030_LOCAL_PLAYTEST_SCHEMA).toContain('v1');
        expect(REG041_EXPORT_SCOPE).toContain('local');
        expect(REG062_E2E_STABILITY_MODE).toContain('shard');
    });
});
