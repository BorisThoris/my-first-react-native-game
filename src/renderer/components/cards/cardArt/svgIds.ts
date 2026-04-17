import { useId } from 'react';

/** Glow / bloom filter ids under `CardArtSvgFilterProvider` (embedded SVG `url(#id)` targets). */
export type CardArtFilterIds = {
    bloomId: string;
    glowId: string;
};

/** Suffixes paired with {@link useSvgInstancePrefix} — keep in sync with `CardArtSvgFilterProvider`. */
export const CARD_ART_FILTER_ID_ROLES = ['glow', 'bloom'] as const;

/** Pure helper: deterministic filter ids for tests and documentation (matches provider output). */
export function buildCardArtFilterDomIds(instancePrefix: string): CardArtFilterIds {
    return {
        glowId: `${instancePrefix}-glow`,
        bloomId: `${instancePrefix}-bloom`
    };
}

/** SVG/XML `id` must avoid `:` from React `useId()`. */
export function useSvgInstancePrefix(prefix: string): string {
    const id = useId().replace(/[^a-zA-Z0-9_-]/g, '');
    return `${prefix}${id}`;
}
