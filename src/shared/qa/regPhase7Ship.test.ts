import { describe, expect, it } from 'vitest';
import {
    REG115_RELEASE_READINESS_FLAG,
    REG116_CREDITS_LEGAL_SURFACE,
    REG119_PRODUCT_ACCEPTANCE_REPORT,
    REG129_DEMO_BUILD_MATRIX
} from './regPhase7Ship';

describe('REG phase-7 ship tokens', () => {
    it('exports stable v1 contract ids for feature lock, credits, acceptance, and demo matrix', () => {
        expect(REG115_RELEASE_READINESS_FLAG).toContain('v1');
        expect(REG116_CREDITS_LEGAL_SURFACE).toContain('credits');
        expect(REG119_PRODUCT_ACCEPTANCE_REPORT).toContain('reg119');
        expect(REG129_DEMO_BUILD_MATRIX).toContain('demo');
    });
});
