import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { useSvgInstancePrefix } from './svgIds';

export type CardArtFilterIds = {
    bloomId: string;
    glowId: string;
};

const CardArtSvgContext = createContext<CardArtFilterIds | null>(null);

export function CardArtSvgFilterProvider({ children }: { children: ReactNode }) {
    const p = useSvgInstancePrefix('cardArt');
    const value = useMemo(
        () => ({
            bloomId: `${p}-bloom`,
            glowId: `${p}-glow`,
        }),
        [p],
    );
    return <CardArtSvgContext.Provider value={value}>{children}</CardArtSvgContext.Provider>;
}

export function useCardArtFilters(): CardArtFilterIds {
    const v = useContext(CardArtSvgContext);
    if (!v) {
        throw new Error('useCardArtFilters must be used inside CardArtSvgFilterProvider');
    }
    return v;
}

/** Safe optional glow when you intentionally render marks outside the provider (no filter). */
export function useCardArtFiltersOptional(): CardArtFilterIds | null {
    return useContext(CardArtSvgContext);
}
