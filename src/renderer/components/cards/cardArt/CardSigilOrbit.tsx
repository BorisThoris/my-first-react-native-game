import type { CSSProperties } from 'react';

import { CARD_BACK_EMBLEM_CENTER } from './constants';
import { useCardArtFiltersOptional } from './CardArtSvgContext';

export type CardSigilOrbitProps = {
    rotationDeg?: number;
    className?: string;
    style?: CSSProperties;
    cx?: number;
    cy?: number;
    radius?: number;
    tickCount?: number;
};

const INK = '#090E10';
const RIM = '#D0A354';

/**
 * Outer ring + radial ticks — reads as a “sigil frame”. Pair with {@link CardCrystalMark} for spin / pulse.
 */
export function CardSigilOrbit({
    className,
    cx = CARD_BACK_EMBLEM_CENTER.x,
    cy = CARD_BACK_EMBLEM_CENTER.y,
    radius = 118,
    rotationDeg = 0,
    style,
    tickCount = 12,
}: CardSigilOrbitProps) {
    const filters = useCardArtFiltersOptional();
    const bloom = filters ? `url(#${filters.bloomId})` : undefined;

    const ticks = Array.from({ length: tickCount }, (_, i) => {
        const a = (i / tickCount) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * (radius - 4);
        const y1 = cy + Math.sin(a) * (radius - 4);
        const x2 = cx + Math.cos(a) * (radius + 10);
        const y2 = cy + Math.sin(a) * (radius + 10);
        return (
            <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={RIM}
                strokeWidth={1.8}
                strokeLinecap="round"
                opacity={0.85}
            />
        );
    });

    return (
        <g
            className={className}
            style={style}
            transform={`translate(${cx} ${cy}) rotate(${rotationDeg}) translate(${-cx} ${-cy})`}
        >
            <circle
                cx={cx}
                cy={cy}
                r={radius}
                fill="none"
                stroke={INK}
                strokeOpacity={0.35}
                strokeWidth={4}
            />
            <circle cx={cx} cy={cy} r={radius} fill="none" stroke={RIM} strokeWidth={2.2} filter={bloom} />
            {ticks}
        </g>
    );
}
