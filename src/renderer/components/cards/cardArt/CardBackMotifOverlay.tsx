import type { CSSProperties } from 'react';

import { CARD_BACK_VIEWBOX } from './constants';
import { CardArtDefs } from './CardArtDefs';
import { CardArtSvgFilterProvider } from './CardArtSvgContext';
import { CardCrystalMark } from './CardCrystalMark';
import { CardSigilOrbit } from './CardSigilOrbit';

import styles from './cardMotifMotion.module.css';

export type CardBackMotifOverlayProps = {
    className?: string;
    style?: CSSProperties;
    crystalDurationSec?: number;
    orbitDurationSec?: number;
    reduceMotion?: boolean;
};

/**
 * Animated crystal + sigil layer only (no `back.svg` `<image>`). For stacking on top of the CSS
 * `back.svg` background on DOM tiles; WebGL path still uses atomic `back.svg` mesh/texture.
 */
export function CardBackMotifOverlay({
    className,
    crystalDurationSec = 14,
    orbitDurationSec = 22,
    reduceMotion,
    style,
}: CardBackMotifOverlayProps) {
    const { h, w } = CARD_BACK_VIEWBOX;
    const motion = !reduceMotion;

    return (
        <svg
            aria-hidden
            className={className}
            focusable={false}
            height="100%"
            preserveAspectRatio="xMidYMid meet"
            style={style}
            viewBox={`0 0 ${w} ${h}`}
            width="100%"
            xmlns="http://www.w3.org/2000/svg"
        >
            <CardArtSvgFilterProvider>
                <CardArtDefs />
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
