import { afterEach, describe, expect, it } from 'vitest';
import { readTileStepLegacy } from './tileStepLegacy';

describe('tileStepLegacy', () => {
    afterEach(() => {
        window.localStorage.clear();
    });

    it('is false without localStorage flag', () => {
        expect(readTileStepLegacy()).toBe(false);
    });

    it('is true when localStorage tileStepLegacy is 1 in dev', () => {
        window.localStorage.setItem('tileStepLegacy', '1');
        if (import.meta.env.DEV) {
            expect(readTileStepLegacy()).toBe(true);
        } else {
            expect(readTileStepLegacy()).toBe(false);
        }
    });
});
