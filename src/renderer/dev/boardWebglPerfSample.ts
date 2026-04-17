/**
 * Dev-only: set `localStorage.perfBoard = '1'` and reload to log average ms per R3F frame
 * for consolidated tile stepping (see TileBoardScene useFrame).
 * Production `vite build` resolves this module to `boardWebglPerfSample.stub.ts` (see vite.config.mts).
 */
let accumMs = 0;
let frameCount = 0;

export const boardWebglPerfSampleAccumulate = (deltaMs: number): void => {
    if (!import.meta.env.DEV) {
        return;
    }

    accumMs += deltaMs;
    frameCount += 1;

    if (frameCount < 120) {
        return;
    }

    const avg = accumMs / frameCount;
    console.info(`[perfBoard] avg frame slice ${avg.toFixed(3)}ms over ${frameCount} frames`);
    accumMs = 0;
    frameCount = 0;
};

export const boardWebglPerfSampleEnabled = (): boolean =>
    import.meta.env.DEV &&
    typeof window !== 'undefined' &&
    window.localStorage.getItem('perfBoard') === '1';
