import type { CSSProperties } from 'react';

import { useCardArtFilters } from './CardArtSvgContext';

export type CardArtDefsProps = {
    className?: string;
    style?: CSSProperties;
};

/**
 * Reusable glow + soft bloom for card overlay paths. Must sit under {@link CardArtSvgFilterProvider}.
 */
export function CardArtDefs({ className, style }: CardArtDefsProps) {
    const { bloomId, glowId } = useCardArtFilters();

    return (
        <defs className={className} style={style}>
            <filter id={glowId} x="-60%" y="-60%" width="220%" height="220%" colorInterpolationFilters="sRGB">
                <feGaussianBlur in="SourceGraphic" stdDeviation="2.2" result="blur" />
                <feColorMatrix
                    in="blur"
                    type="matrix"
                    values="1 0 0 0 0.35  0 1 0 0 0.28  0 0 1 0 0.12  0 0 0 0.9 0"
                    result="glowColor"
                />
                <feMerge>
                    <feMergeNode in="glowColor" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
            <filter id={bloomId} x="-80%" y="-80%" width="260%" height="260%" colorInterpolationFilters="sRGB">
                <feGaussianBlur in="SourceAlpha" stdDeviation="5" result="blur" />
                <feColorMatrix
                    in="blur"
                    type="matrix"
                    values="1 0 0 0 0.45  0 1 0 0 0.38  0 0 1 0 0.2  0 0 0 0.55 0"
                    result="soft"
                />
                <feMerge>
                    <feMergeNode in="soft" />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            </filter>
        </defs>
    );
}
