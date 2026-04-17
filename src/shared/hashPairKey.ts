/** Stable 31-bit-style string hash used for deterministic gameplay visuals (tiles, illustration pools). */
export const hashPairKey = (pairKey: string): number => {
    let h = 0;
    for (let i = 0; i < pairKey.length; i++) {
        h = (h * 31 + pairKey.charCodeAt(i)) | 0;
    }
    return Math.abs(h);
};
