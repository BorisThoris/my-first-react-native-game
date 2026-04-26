import { describe, expect, it } from 'vitest';
import { regPhase6MatrixAnchor, REG_PHASE6_IDS } from './regPhase6Closure';

describe('REG phase-6 closure index', () => {
    it('lists exactly 40 tickets (120–128, 130–160)', () => {
        expect(REG_PHASE6_IDS).toHaveLength(40);
        expect(REG_PHASE6_IDS[0]).toBe('REG-120');
        expect(REG_PHASE6_IDS).toContain('REG-128');
        expect(REG_PHASE6_IDS).toContain('REG-130');
        expect(REG_PHASE6_IDS).toContain('REG-160');
        expect(REG_PHASE6_IDS).not.toContain('REG-129');
    });

    it('assigns matrix anchors for hazard and combinatoric bands', () => {
        expect(regPhase6MatrixAnchor('REG-120')).toBe('combinatoric');
        expect(regPhase6MatrixAnchor('REG-148')).toBe('hazard');
        expect(regPhase6MatrixAnchor('REG-130')).toBe('rc');
    });
});
