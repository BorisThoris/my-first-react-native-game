import type { CardIllustrationRegistry } from './resolveCardIllustrationUrl';
import deck01 from '../assets/cards/illustrations/deck-01.svg?url';
import deck02 from '../assets/cards/illustrations/deck-02.svg?url';
import deck03 from '../assets/cards/illustrations/deck-03.svg?url';
import deck04 from '../assets/cards/illustrations/deck-04.svg?url';
import deck05 from '../assets/cards/illustrations/deck-05.svg?url';
import deck06 from '../assets/cards/illustrations/deck-06.svg?url';
import { buildWeightedFacePanelFallbackStrip } from './weightedFacePanelPool';

/** Legacy vector deck (kept on disk; included in preload for manifest + potential art swap). */
export const LEGACY_SVG_ILLUSTRATION_URLS = [deck01, deck02, deck03, deck04, deck05, deck06] as const;

const weightedFacePanelPool = buildWeightedFacePanelFallbackStrip();

/**
 * SDXL face-panel rasters (illustration mat). `resolveCardIllustrationUrl` maps digit ranks
 * and non-digit tiles into a weighted pool (common vs uncommon vs rare). See `batch_local_face_panels.py`
 * and `weightedFacePanelPool.ts`.
 */
export const CARD_ILLUSTRATION_REGISTRY: CardIllustrationRegistry = {
    bySymbol: {},
    numericFallbackPool: weightedFacePanelPool,
    nonDigitFallbackPool: weightedFacePanelPool
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
    for (const url of LEGACY_SVG_ILLUSTRATION_URLS) {
        set.add(url);
    }
    return [...set];
};
