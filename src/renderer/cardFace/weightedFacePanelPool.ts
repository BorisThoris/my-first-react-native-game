import { ALL_FACE_PANEL_URLS_ORDERED } from './facePanelRasterUrls';

/** Central illustration variants (bread-and-butter motifs). */
export const FACE_PANEL_COMMON_URLS = ALL_FACE_PANEL_URLS_ORDERED.slice(0, 48) as readonly string[];

/** Richer motifs — appear less often via weighted strip. */
export const FACE_PANEL_UNCOMMON_URLS = ALL_FACE_PANEL_URLS_ORDERED.slice(48, 72) as readonly string[];

/** Showcase / rare — few files, lowest selection rate. */
export const FACE_PANEL_RARE_URLS = ALL_FACE_PANEL_URLS_ORDERED.slice(72, 80) as readonly string[];

/**
 * Deterministic fallback list for `resolveCardIllustrationUrl` (~200 slots).
 * Blend: ~70% common, ~20% uncommon, ~10% rare — so rare panels read "special" in the wild.
 */
export const buildWeightedFacePanelFallbackStrip = (): readonly string[] => {
    const strip: string[] = [];
    for (let i = 0; i < 140; i += 1) {
        strip.push(FACE_PANEL_COMMON_URLS[i % FACE_PANEL_COMMON_URLS.length]);
    }
    for (let i = 0; i < 40; i += 1) {
        strip.push(FACE_PANEL_UNCOMMON_URLS[i % FACE_PANEL_UNCOMMON_URLS.length]);
    }
    for (let i = 0; i < 20; i += 1) {
        strip.push(FACE_PANEL_RARE_URLS[i % FACE_PANEL_RARE_URLS.length]);
    }
    return strip;
};
