import type { CSSProperties } from 'react';

import cardBackUrl from '../../../assets/textures/cards/back.svg?url';

import { CARD_BACK_VIEWBOX } from './constants';
import { CardArtDefs } from './CardArtDefs';
import { CardArtSvgFilterProvider } from './CardArtSvgContext';
import { CardCrystalMark } from './CardCrystalMark';
import { CardSigilOrbit } from './CardSigilOrbit';

import styles from './cardMotifMotion.module.css';

export type CardArtAnimatedBackProps = {
    className?: string;
    style?: CSSProperties;
    /** Spin angular velocity in degrees per second (CSS). */
    orbitDurationSec?: number;
    crystalDurationSec?: number;
    reduceMotion?: boolean;
};

/**
 * Example stack: static `back.svg` as `<image>` plus independently rotatable overlay marks.
 * Swap the `href` for your bundled asset URL when embedding in DOM.
 */
export function CardArtAnimatedBack({
    className,
    crystalDurationSec = 14,
    orbitDurationSec = 22,
    reduceMotion,
    style,
}: CardArtAnimatedBackProps) {
    const { h, w } = CARD_BACK_VIEWBOX;
    const motion = !reduceMotion;

    return (
        <svg
            className={className}
            style={style}
            viewBox={`0 0 ${w} ${h}`}
            xmlns="http://www.w3.org/2000/svg"
            width={w}
            height={h}
            role="img"
            aria-label="Card back art"
        >
            <CardArtSvgFilterProvider>
                <CardArtDefs />
                <image href={cardBackUrl} width={w} height={h} preserveAspectRatio="xMidYMid meet" />
                <g className={motion ? styles.orbitSpin : undefined} style={{ animationDuration: `${orbitDurationSec}s` }}>
                    <CardSigilOrbit />
                </g>
                <g className={motion ? styles.crystalSpin : undefined} style={{ animationDuration: `${crystalDurationSec}s` }}>
                    <CardCrystalMark />
                </g>
            </CardArtSvgFilterProvider>
        </svg>
    );
}
