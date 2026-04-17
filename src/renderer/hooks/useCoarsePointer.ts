import { useEffect, useState } from 'react';

/**
 * Touch-first vs fine-pointer layout density.
 * Hybrid laptops: `(pointer: coarse)` is true for touchscreen, but `(any-pointer: fine)` + `(hover: hover)`
 * means a mouse/trackpad is usually present — prefer **fine** hit metrics to avoid oversized chrome.
 */
const readCoarsePointer = (): boolean => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
        return false;
    }

    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const anyFine = window.matchMedia('(any-pointer: fine)').matches;
    const canHover = window.matchMedia('(hover: hover)').matches;
    const hybridTouchLaptop = coarse && anyFine && canHover;

    return coarse && !hybridTouchLaptop;
};

export const useCoarsePointer = (): boolean => {
    const [coarsePointer, setCoarsePointer] = useState(readCoarsePointer);

    useEffect(() => {
        if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
            return;
        }

        const coarseMq = window.matchMedia('(pointer: coarse)');
        const fineMq = window.matchMedia('(any-pointer: fine)');
        const hoverMq = window.matchMedia('(hover: hover)');

        const sync = (): void => {
            setCoarsePointer(readCoarsePointer());
        };

        sync();
        coarseMq.addEventListener('change', sync);
        fineMq.addEventListener('change', sync);
        hoverMq.addEventListener('change', sync);

        return () => {
            coarseMq.removeEventListener('change', sync);
            fineMq.removeEventListener('change', sync);
            hoverMq.removeEventListener('change', sync);
        };
    }, []);

    return coarsePointer;
};
