import { useEffect, useState } from 'react';

const readCoarsePointer = (): boolean => {
    if (typeof window === 'undefined') {
        return false;
    }

    if (typeof window.matchMedia !== 'function') {
        return false;
    }

    return window.matchMedia('(pointer: coarse)').matches;
};

export const useCoarsePointer = (): boolean => {
    const [coarsePointer, setCoarsePointer] = useState(readCoarsePointer);

    useEffect(() => {
        if (typeof window === 'undefined') {
            return;
        }

        if (typeof window.matchMedia !== 'function') {
            return;
        }

        const mediaQuery = window.matchMedia('(pointer: coarse)');
        const sync = (): void => {
            setCoarsePointer(mediaQuery.matches);
        };

        sync();
        mediaQuery.addEventListener('change', sync);

        return () => {
            mediaQuery.removeEventListener('change', sync);
        };
    }, []);

    return coarsePointer;
};
