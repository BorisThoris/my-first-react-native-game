/**
 * Production no-op substituted for `boardWebglPerfSample.ts` when `vite build` runs (`mode === 'production'`).
 * Exports must stay in lockstep with the real module — see `boardWebglPerfSample.test.ts`.
 */

export const boardWebglPerfSampleAccumulate = (deltaMs: number): void => {
    void deltaMs;
};

export const boardWebglPerfSampleEnabled = (): boolean => false;

export const boardWebglPerfSampleVerboseEnabled = (): boolean => false;

export const boardWebglPerfSampleAccumulatePhases = (_phases: {
    tileStepMs: number;
    viewportMs: number;
}): void => {
    void _phases;
};

export const boardWebglPerfSampleRecordReactCommit = (deltaMs: number): void => {
    void deltaMs;
};
