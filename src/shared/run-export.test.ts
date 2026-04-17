import { describe, expect, it } from 'vitest';
import type { RunState, RunSummary } from './contracts';
import { parseRunImport, serializeRunPayload, serializeRunPayloadFromSummary } from './run-export';

describe('run-export', () => {
    const minimalRun = {
        runSeed: 42,
        runRulesVersion: 9,
        gameMode: 'endless',
        activeMutators: ['wide_recall'],
        relicIds: ['parasite_ward_once']
    } as unknown as RunState;

    it('round-trips serialize → parse → serialize → parse for a typical run', () => {
        const raw = serializeRunPayload(minimalRun);
        const parsed = parseRunImport(raw);
        expect(parsed).not.toBeNull();
        const again = serializeRunPayload({
            ...minimalRun,
            runSeed: parsed!.seed,
            runRulesVersion: parsed!.rules,
            gameMode: parsed!.mode,
            activeMutators: parsed!.mutators,
            relicIds: parsed!.relics ?? []
        } as unknown as RunState);
        expect(parseRunImport(again)).toEqual(parsed);
        expect(parsed!.seed).toBe(42);
        expect(parsed!.rules).toBe(9);
        expect(parsed!.mode).toBe('endless');
        expect(parsed!.mutators).toEqual(['wide_recall']);
        expect(parsed!.relics).toEqual(['parasite_ward_once']);
    });

    it('round-trips summary export when all required summary fields are present', () => {
        const summary = {
            runSeed: 7,
            runRulesVersion: 11,
            gameMode: 'puzzle',
            activeMutators: ['glass_floor', 'wide_recall'],
            relicIds: ['extra_shuffle_charge', 'parasite_ward_once']
        } as unknown as RunSummary;
        const raw = serializeRunPayloadFromSummary(summary);
        expect(raw).not.toBeNull();
        const parsed = parseRunImport(raw!);
        expect(parsed).toEqual({
            v: 1,
            seed: 7,
            rules: 11,
            mode: 'puzzle',
            mutators: ['glass_floor', 'wide_recall'],
            relics: ['extra_shuffle_charge', 'parasite_ward_once']
        });
    });

    it('summary export uses empty relics array when summary has no relicIds (stable wire shape)', () => {
        const summary = {
            runSeed: 1,
            runRulesVersion: 2,
            gameMode: 'daily',
            activeMutators: []
        } as unknown as RunSummary;
        const raw = serializeRunPayloadFromSummary(summary);
        expect(raw).not.toBeNull();
        expect(raw!).toContain('"relics":[]');
        const parsed = parseRunImport(raw!);
        expect(parsed!.relics).toEqual([]);
    });

    it('parse rejects invalid JSON', () => {
        expect(parseRunImport('not json')).toBeNull();
    });

    it('parse rejects wrong version', () => {
        expect(parseRunImport(JSON.stringify({ v: 999, seed: 1, rules: 1, mode: 'puzzle', mutators: [] }))).toBeNull();
    });

    it('parse rejects missing required fields', () => {
        expect(parseRunImport(JSON.stringify({ v: 1, seed: 1 }))).toBeNull();
    });
});
