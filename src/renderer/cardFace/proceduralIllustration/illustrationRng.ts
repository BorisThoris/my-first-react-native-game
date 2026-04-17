export type IllustrationRng = {
    nextU32: () => number;
    /** In [0, 1) */
    nextFloat01: () => number;
    /** In [0, max) integer */
    nextInt: (max: number) => number;
    /** In [min, max] inclusive integer */
    nextIntInclusive: (min: number, max: number) => number;
    pickWeighted: <T>(entries: readonly { value: T; weight: number }[]) => T;
};

/** Mulberry32 — fast deterministic PRNG for illustration rolls. */
export const createIllustrationRng = (seed: number): IllustrationRng => {
    let state = seed >>> 0;

    const nextU32 = (): number => {
        state = (state + 0x6d2b79f5) >>> 0;
        let t = Math.imul(state ^ (state >>> 15), 1 | state);
        t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
        return (t ^ (t >>> 14)) >>> 0;
    };

    const nextFloat01 = (): number => nextU32() / 4294967296;

    const nextInt = (max: number): number => {
        if (max <= 0) {
            return 0;
        }
        return nextU32() % max;
    };

    const nextIntInclusive = (min: number, max: number): number => {
        if (max <= min) {
            return min;
        }
        return min + nextInt(max - min + 1);
    };

    const pickWeighted = <T>(entries: readonly { value: T; weight: number }[]): T => {
        let total = 0;
        for (const e of entries) {
            total += Math.max(0, e.weight);
        }
        if (total <= 0) {
            return entries[0]!.value;
        }
        let r = nextFloat01() * total;
        for (const e of entries) {
            r -= e.weight;
            if (r <= 0) {
                return e.value;
            }
        }
        return entries[entries.length - 1]!.value;
    };

    return { nextU32, nextFloat01, nextInt, nextIntInclusive, pickWeighted };
};
