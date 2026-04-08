import type { CSSProperties } from 'react';

import { CARD_BACK_EMBLEM_CENTER } from './constants';
import { useCardArtFiltersOptional } from './CardArtSvgContext';

export type CardCrystalMarkProps = {
    /** Degrees; animate via CSS on parent or Framer Motion on this group. */
    rotationDeg?: number;
    className?: string;
    style?: CSSProperties;
    /** Override default emblem placement (back-card user space). */
    cx?: number;
    cy?: number;
    scale?: number;
};

const GOLD = '#E8DA95';
const GOLD_DEEP = '#B88943';
const GLINT = '#FFF6D9';

/**
 * Stylized crystal — **not** extracted from `back.svg` (that file has no semantic groups). Use as an
 * animatable overlay aligned to the printed art, or as a standalone HUD mark.
 */
export function CardCrystalMark({
    className,
    cx = CARD_BACK_EMBLEM_CENTER.x,
    cy = CARD_BACK_EMBLEM_CENTER.y,
    rotationDeg = 0,
    scale = 1,
    style,
}: CardCrystalMarkProps) {
    const filters = useCardArtFiltersOptional();
    const glow = filters ? `url(#${filters.glowId})` : undefined;

    return (
        <g
            className={className}
            style={style}
            transform={`translate(${cx} ${cy}) rotate(${rotationDeg}) scale(${scale})`}
        >
            <polygon
                points="0,-42 36,-8 22,38 -22,38 -36,-8"
                fill={GOLD_DEEP}
                opacity={0.92}
                filter={glow}
            />
            <polygon points="0,-36 28,-6 16,32 -16,32 -28,-6" fill={GOLD} filter={glow} />
            <path d="M0 -28 L14 -2 L0 22 L-14 -2 Z" fill={GLINT} opacity={0.55} />
            <path d="M-6 4 L0 12 L6 4" fill="none" stroke={GLINT} strokeWidth={1.5} opacity={0.7} />
        </g>
    );
}
