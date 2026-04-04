import type { GameMode, MutatorId, RelicId, RunState, RunSummary } from './contracts';

export const RUN_EXPORT_VERSION = 1 as const;

export type RunExportPayload = {
    v: typeof RUN_EXPORT_VERSION;
    seed: number;
    rules: number;
    mode: GameMode;
    mutators: MutatorId[];
    relics?: RelicId[];
};

export const serializeRunPayload = (run: RunState): string =>
    JSON.stringify({
        v: RUN_EXPORT_VERSION,
        seed: run.runSeed,
        rules: run.runRulesVersion,
        mode: run.gameMode,
        mutators: run.activeMutators,
        relics: run.relicIds
    } satisfies RunExportPayload);

export const serializeRunPayloadFromSummary = (summary: RunSummary): string | null => {
    if (summary.runSeed === undefined || summary.runRulesVersion === undefined || !summary.gameMode) {
        return null;
    }
    return JSON.stringify({
        v: RUN_EXPORT_VERSION,
        seed: summary.runSeed,
        rules: summary.runRulesVersion,
        mode: summary.gameMode,
        mutators: summary.activeMutators ?? [],
        relics: summary.relicIds ?? []
    } satisfies RunExportPayload);
};

export const parseRunImport = (raw: string): RunExportPayload | null => {
    try {
        const j = JSON.parse(raw) as Partial<RunExportPayload>;
        if (j.v !== RUN_EXPORT_VERSION || typeof j.seed !== 'number' || typeof j.rules !== 'number') {
            return null;
        }
        if (!j.mode || !Array.isArray(j.mutators)) {
            return null;
        }
        return {
            v: RUN_EXPORT_VERSION,
            seed: j.seed,
            rules: j.rules,
            mode: j.mode,
            mutators: j.mutators as MutatorId[],
            relics: j.relics
        };
    } catch {
        return null;
    }
};
