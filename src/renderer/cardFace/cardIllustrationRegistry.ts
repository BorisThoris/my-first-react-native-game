import type { CardIllustrationRegistry } from './resolveCardIllustrationUrl';
import deck01 from '../assets/cards/illustrations/deck-01.svg?url';
import deck02 from '../assets/cards/illustrations/deck-02.svg?url';
import deck03 from '../assets/cards/illustrations/deck-03.svg?url';
import deck04 from '../assets/cards/illustrations/deck-04.svg?url';
import deck05 from '../assets/cards/illustrations/deck-05.svg?url';
import deck06 from '../assets/cards/illustrations/deck-06.svg?url';

const pool = [deck01, deck02, deck03, deck04, deck05, deck06] as const;

/**
 * Shipped “tarot deck” illustrations. Extend by adding assets and updating this registry
 * (or run `yarn build:card-illustration-manifest` to verify files vs keys).
 */
export const CARD_ILLUSTRATION_REGISTRY: CardIllustrationRegistry = {
    bySymbol: {
        '01': deck01,
        '02': deck02,
        '03': deck03,
        '04': deck04,
        '05': deck05,
        '06': deck06
    },
    numericFallbackPool: pool,
    nonDigitFallbackPool: pool
};

/** Unique URLs for preload (deduped). */
export const getAllCardIllustrationUrls = (): string[] => {
    const set = new Set<string>();
    for (const url of Object.values(CARD_ILLUSTRATION_REGISTRY.bySymbol)) {
        set.add(url);
    }
    if (CARD_ILLUSTRATION_REGISTRY.bySymbolVariant) {
        for (const url of Object.values(CARD_ILLUSTRATION_REGISTRY.bySymbolVariant)) {
            set.add(url);
        }
    }
    for (const url of CARD_ILLUSTRATION_REGISTRY.numericFallbackPool) {
        set.add(url);
    }
    for (const url of CARD_ILLUSTRATION_REGISTRY.nonDigitFallbackPool) {
        set.add(url);
    }
    return [...set];
};
