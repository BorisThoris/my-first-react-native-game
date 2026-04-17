import { renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useCoarsePointer } from './useCoarsePointer';

const makeMq = (matches: boolean) => ({
    matches,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
});

describe('useCoarsePointer', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('treats hybrid touch + fine pointer + hover as fine (laptop)', () => {
        vi.stubGlobal(
            'matchMedia',
            vi.fn((query: string) => {
                if (query === '(pointer: coarse)') {
                    return makeMq(true);
                }
                if (query === '(any-pointer: fine)') {
                    return makeMq(true);
                }
                if (query === '(hover: hover)') {
                    return makeMq(true);
                }
                return makeMq(false);
            })
        );

        const { result } = renderHook(() => useCoarsePointer());
        expect(result.current).toBe(false);
    });

    it('is coarse for touch-primary tablets (no fine pointer)', () => {
        vi.stubGlobal(
            'matchMedia',
            vi.fn((query: string) => {
                if (query === '(pointer: coarse)') {
                    return makeMq(true);
                }
                if (query === '(any-pointer: fine)') {
                    return makeMq(false);
                }
                if (query === '(hover: hover)') {
                    return makeMq(false);
                }
                return makeMq(false);
            })
        );

        const { result } = renderHook(() => useCoarsePointer());
        expect(result.current).toBe(true);
    });

});
