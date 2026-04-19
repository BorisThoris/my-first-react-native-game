import type { CardIllustrationRegistry } from './resolveCardIllustrationUrl';
import deck01 from '../assets/cards/illustrations/deck-01.svg?url';
import deck02 from '../assets/cards/illustrations/deck-02.svg?url';
import deck03 from '../assets/cards/illustrations/deck-03.svg?url';
import deck04 from '../assets/cards/illustrations/deck-04.svg?url';
import deck05 from '../assets/cards/illustrations/deck-05.svg?url';
import deck06 from '../assets/cards/illustrations/deck-06.svg?url';
import facePanel01 from '../assets/cards/illustrations/face-panel-01.png';
import facePanel02 from '../assets/cards/illustrations/face-panel-02.png';
import facePanel03 from '../assets/cards/illustrations/face-panel-03.png';
import facePanel04 from '../assets/cards/illustrations/face-panel-04.png';
import facePanel05 from '../assets/cards/illustrations/face-panel-05.png';
import facePanel06 from '../assets/cards/illustrations/face-panel-06.png';
import facePanel07 from '../assets/cards/illustrations/face-panel-07.png';
import facePanel08 from '../assets/cards/illustrations/face-panel-08.png';
import facePanel09 from '../assets/cards/illustrations/face-panel-09.png';
import facePanel10 from '../assets/cards/illustrations/face-panel-10.png';
import facePanel11 from '../assets/cards/illustrations/face-panel-11.png';
import facePanel12 from '../assets/cards/illustrations/face-panel-12.png';
import facePanel13 from '../assets/cards/illustrations/face-panel-13.png';
import facePanel14 from '../assets/cards/illustrations/face-panel-14.png';
import facePanel15 from '../assets/cards/illustrations/face-panel-15.png';
import facePanel16 from '../assets/cards/illustrations/face-panel-16.png';
import facePanel17 from '../assets/cards/illustrations/face-panel-17.png';
import facePanel18 from '../assets/cards/illustrations/face-panel-18.png';
import facePanel19 from '../assets/cards/illustrations/face-panel-19.png';
import facePanel20 from '../assets/cards/illustrations/face-panel-20.png';
import facePanel21 from '../assets/cards/illustrations/face-panel-21.png';
import facePanel22 from '../assets/cards/illustrations/face-panel-22.png';
import facePanel23 from '../assets/cards/illustrations/face-panel-23.png';
import facePanel24 from '../assets/cards/illustrations/face-panel-24.png';
import facePanel25 from '../assets/cards/illustrations/face-panel-25.png';
import facePanel26 from '../assets/cards/illustrations/face-panel-26.png';
import facePanel27 from '../assets/cards/illustrations/face-panel-27.png';
import facePanel28 from '../assets/cards/illustrations/face-panel-28.png';
import facePanel29 from '../assets/cards/illustrations/face-panel-29.png';
import facePanel30 from '../assets/cards/illustrations/face-panel-30.png';
import facePanel31 from '../assets/cards/illustrations/face-panel-31.png';
import facePanel32 from '../assets/cards/illustrations/face-panel-32.png';
import facePanel33 from '../assets/cards/illustrations/face-panel-33.png';
import facePanel34 from '../assets/cards/illustrations/face-panel-34.png';
import facePanel35 from '../assets/cards/illustrations/face-panel-35.png';
import facePanel36 from '../assets/cards/illustrations/face-panel-36.png';
import facePanel37 from '../assets/cards/illustrations/face-panel-37.png';
import facePanel38 from '../assets/cards/illustrations/face-panel-38.png';
import facePanel39 from '../assets/cards/illustrations/face-panel-39.png';
import facePanel40 from '../assets/cards/illustrations/face-panel-40.png';

/** Legacy vector deck (kept on disk; included in preload for manifest + potential art swap). */
export const LEGACY_SVG_ILLUSTRATION_URLS = [deck01, deck02, deck03, deck04, deck05, deck06] as const;

const facePanelPool = [facePanel01, facePanel02, facePanel03, facePanel04, facePanel05, facePanel06, facePanel07, facePanel08, facePanel09, facePanel10, facePanel11, facePanel12, facePanel13, facePanel14, facePanel15, facePanel16, facePanel17, facePanel18, facePanel19, facePanel20, facePanel21, facePanel22, facePanel23, facePanel24, facePanel25, facePanel26, facePanel27, facePanel28, facePanel29, facePanel30, facePanel31, facePanel32, facePanel33, facePanel34, facePanel35, facePanel36, facePanel37, facePanel38, facePanel39, facePanel40] as const;

/**
 * SDXL face-panel rasters (illustration mat). `resolveCardIllustrationUrl` maps digit ranks
 * and non-digit tiles into this pool. See `batch_local_face_panels.py`.
 */
export const CARD_ILLUSTRATION_REGISTRY: CardIllustrationRegistry = {
    bySymbol: {},
    numericFallbackPool: facePanelPool,
    nonDigitFallbackPool: facePanelPool
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
