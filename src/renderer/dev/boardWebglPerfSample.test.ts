import { afterEach, describe, expect, it, vi } from 'vitest';
import * as perfReal from './boardWebglPerfSample';
import * as perfStub from './boardWebglPerfSample.stub';

describe('boardWebglPerfSample', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
        window.localStorage.clear();
    });

    it('stub exports mirror the real module (prod alias must not drift)', () => {
        expect(Object.keys(perfStub).sort()).toEqual(Object.keys(perfReal).sort());
        expect(typeof perfStub.boardWebglPerfSampleAccumulate).toBe('function');
        expect(typeof perfStub.boardWebglPerfSampleEnabled).toBe('function');
    });

    it('is disabled without localStorage flag', () => {
        expect(perfReal.boardWebglPerfSampleEnabled()).toBe(false);
    });

    it('is enabled when localStorage perfBoard is 1 (dev builds only)', () => {
        window.localStorage.setItem('perfBoard', '1');
        if (import.meta.env.DEV) {
            expect(perfReal.boardWebglPerfSampleEnabled()).toBe(true);
        } else {
            expect(perfReal.boardWebglPerfSampleEnabled()).toBe(false);
        }
    });

    it('accumulate does not throw', () => {
        expect(() => perfReal.boardWebglPerfSampleAccumulate(0.5)).not.toThrow();
    });
});
