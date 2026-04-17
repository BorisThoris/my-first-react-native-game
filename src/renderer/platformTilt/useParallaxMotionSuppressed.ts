import { useEffect, useState } from 'react';

/**
 * True when parallax-style device motion should be suppressed: the in-app setting **or**
 * the OS / browser `prefers-reduced-motion: reduce` preference.
 */
export function useParallaxMotionSuppressed(reduceMotionFromSettings: boolean): boolean {
    const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
        const sync = (): void => {
            setPrefersReducedMotion(mq.matches);
        };

        sync();
        mq.addEventListener('change', sync);

        return () => {
            mq.removeEventListener('change', sync);
        };
    }, []);

    return reduceMotionFromSettings || prefersReducedMotion;
}
