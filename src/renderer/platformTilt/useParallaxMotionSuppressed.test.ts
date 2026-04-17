import { act, renderHook } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { useParallaxMotionSuppressed } from './useParallaxMotionSuppressed';

describe('useParallaxMotionSuppressed', () => {
    let prefersReduced = false;
    const changeListeners: Array<() => void> = [];
    const originalMatchMedia = window.matchMedia;

    beforeEach(() => {
        prefersReduced = false;
        changeListeners.length = 0;
        window.matchMedia = vi.fn((query: string) => {
            const list = {
                get matches(): boolean {
                    return query.includes('prefers-reduced-motion') ? prefersReduced : false;
                },
                media: query,
                addEventListener: (_type: string, cb: EventListener): void => {
                    changeListeners.push(() => {
                        if (typeof cb === 'function') {
                            cb.call(list as unknown as EventTarget, new Event('change'));
                        } else {
                            (cb as { handleEvent: (ev: Event) => void }).handleEvent(new Event('change'));
                        }
                    });
                },
                removeEventListener: vi.fn(),
                addListener: vi.fn(),
                removeListener: vi.fn(),
                dispatchEvent: vi.fn(),
                onchange: null
            };

            return list as unknown as MediaQueryList;
        }) as typeof window.matchMedia;
    });

    afterEach(() => {
        window.matchMedia = originalMatchMedia;
    });

    it('is true when app reduce motion is on', () => {
        const { result } = renderHook(() => useParallaxMotionSuppressed(true));

        expect(result.current).toBe(true);
    });

    it('follows prefers-reduced-motion after the media query changes', () => {
        const { result } = renderHook(() => useParallaxMotionSuppressed(false));

        expect(result.current).toBe(false);

        prefersReduced = true;
        act(() => {
            changeListeners.forEach((notify) => {
                notify();
            });
        });

        expect(result.current).toBe(true);
    });
});
