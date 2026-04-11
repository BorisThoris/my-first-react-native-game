import { afterEach, describe, expect, it, vi } from 'vitest';
import { boardWebglPerfSampleAccumulate, boardWebglPerfSampleEnabled } from './boardWebglPerfSample';

describe('boardWebglPerfSample', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        window.localStorage.clear();
    });

    it('is disabled without localStorage flag', () => {
        expect(boardWebglPerfSampleEnabled()).toBe(false);
    });

    it('is enabled when localStorage perfBoard is 1 (dev builds only)', () => {
        window.localStorage.setItem('perfBoard', '1');
        if (import.meta.env.DEV) {
            expect(boardWebglPerfSampleEnabled()).toBe(true);
        } else {
            expect(boardWebglPerfSampleEnabled()).toBe(false);
        }
    });

    it('accumulate does not throw', () => {
        expect(() => boardWebglPerfSampleAccumulate(0.5)).not.toThrow();
    });
});
