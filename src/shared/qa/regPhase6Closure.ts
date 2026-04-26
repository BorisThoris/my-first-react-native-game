/**
 * REG-120–REG-128, REG-130–REG-160 — Phase-6 “deep matrix / enterprise QA” closure index.
 * Cross-links: `softlock-fairness`, `game`, mechanics catalog, and tasks under `tasks/refined-experience-gaps/`.
 */

const range = (a: number, b: number): number[] => {
    const o: number[] = [];
    for (let n = a; n <= b; n += 1) {
        o.push(n);
    }
    return o;
};

/** 120–128 and 130–160 (REG-129 is Phase 7 in the phase map). */
const PHASE6_REG_NUMS = [...range(120, 128), ...range(130, 160)];

export const REG_PHASE6_IDS = PHASE6_REG_NUMS.map(
    (n) => `REG-${String(n).padStart(3, '0')}` as const
);

export const regPhase6MatrixAnchor = (id: (typeof REG_PHASE6_IDS)[number]): 'combinatoric' | 'hazard' | 'client' | 'access' | 'trust' | 'rc' => {
    const n = Number(id.slice(4));
    if (n >= 148 && n <= 160) {
        return 'hazard';
    }
    if (n === 120 || n === 121 || n === 149 || n === 150 || n === 151) {
        return 'combinatoric';
    }
    if (n === 130) {
        return 'rc';
    }
    if (n >= 133 && n <= 140) {
        return 'access';
    }
    if (n === 137 || n === 147) {
        return 'client';
    }
    if (n === 123 || n === 124 || n === 141 || n === 156) {
        return 'trust';
    }
    return 'combinatoric';
};
