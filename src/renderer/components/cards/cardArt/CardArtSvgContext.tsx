import { createContext, useContext, useMemo, type ReactNode } from 'react';

import { buildCardArtFilterDomIds, useSvgInstancePrefix, type CardArtFilterIds } from './svgIds';

export type { CardArtFilterIds };

const CardArtSvgContext = createContext<CardArtFilterIds | null>(null);

export function CardArtSvgFilterProvider({ children }: { children: ReactNode }) {
    const p = useSvgInstancePrefix('cardArt');
    const value = useMemo(() => buildCardArtFilterDomIds(p), [p]);
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
