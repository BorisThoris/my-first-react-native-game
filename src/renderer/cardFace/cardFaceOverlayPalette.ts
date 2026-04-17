/**
 * Shared colors for WebGL card-face overlays (programmatic digits + symbol path).
 * Aligns with panel semantics in `tileTextures` `getPalette` and `RENDERER_THEME`.
 */
import { RENDERER_THEME } from '../styles/theme';

export type ProgrammaticOverlayVariant = 'active' | 'matched' | 'mismatch';

export type CardFaceOverlayColors = {
    /** Frame vertical gradient (top → bottom) */
    frameFillTop: string;
    frameFillBottom: string;
    frameStroke: string;
    frameInnerRim: string;
    /** Sigil gem gradient */
    sigilFillDark: string;
    sigilFillLight: string;
    sigilStroke: string;
    sigilHighlight: string;
    rankFill: string;
    rankFillMid: string;
    rankStroke: string;
    rankShadow: string;
    vignette: string;
    grainRgb: string;
    grainAlpha: number;
    /** Non-digit symbol plate */
    plateFill: string;
    plateFillOuter: string;
    plateStroke: string;
    plateGlow: string;
    symbolFill: string;
    symbolStroke: string;
    labelFill: string;
    labelStroke: string;
};

const { colors } = RENDERER_THEME;

export const getCardFaceOverlayColors = (variant: ProgrammaticOverlayVariant): CardFaceOverlayColors => {
    if (variant === 'matched') {
        return {
            frameFillTop: '#243220',
            frameFillBottom: '#0f170e',
            frameStroke: 'rgba(180, 235, 141, 0.55)',
            frameInnerRim: 'rgba(236, 249, 224, 0.12)',
            sigilFillDark: '#2d4a28',
            sigilFillLight: colors.emeraldBright,
            sigilStroke: 'rgba(12, 22, 10, 0.88)',
            sigilHighlight: 'rgba(236, 249, 224, 0.35)',
            rankFill: '#fff8e6',
            rankFillMid: '#fff3c4',
            rankStroke: 'rgba(18, 28, 12, 0.92)',
            rankShadow: 'rgba(8, 14, 6, 0.55)',
            vignette: 'rgba(6, 10, 6, 0.38)',
            grainRgb: '255, 255, 255',
            grainAlpha: 0.055,
            plateFill: 'rgba(28, 42, 26, 0.82)',
            plateFillOuter: 'rgba(12, 20, 10, 0.55)',
            plateStroke: 'rgba(180, 235, 141, 0.42)',
            plateGlow: 'rgba(180, 235, 141, 0.18)',
            symbolFill: '#fff3c4',
            symbolStroke: 'rgba(22, 12, 0, 0.92)',
            labelFill: 'rgba(236, 249, 224, 0.96)',
            labelStroke: 'rgba(18, 10, 0, 0.9)'
        };
    }

    if (variant === 'mismatch') {
        return {
            frameFillTop: '#2a181c',
            frameFillBottom: '#140c0e',
            frameStroke: 'rgba(216, 106, 88, 0.5)',
            frameInnerRim: 'rgba(255, 232, 226, 0.1)',
            sigilFillDark: '#4a2828',
            sigilFillLight: colors.emberSoft,
            sigilStroke: 'rgba(28, 10, 10, 0.9)',
            sigilHighlight: 'rgba(255, 220, 210, 0.32)',
            rankFill: '#fff0ec',
            rankFillMid: '#ffd8cf',
            rankStroke: 'rgba(32, 10, 8, 0.92)',
            rankShadow: 'rgba(20, 6, 6, 0.52)',
            vignette: 'rgba(14, 6, 8, 0.4)',
            grainRgb: '255, 230, 228',
            grainAlpha: 0.05,
            plateFill: 'rgba(48, 22, 24, 0.82)',
            plateFillOuter: 'rgba(22, 10, 12, 0.58)',
            plateStroke: 'rgba(216, 106, 88, 0.45)',
            plateGlow: 'rgba(216, 106, 88, 0.16)',
            symbolFill: '#ffd8cf',
            symbolStroke: 'rgba(28, 8, 6, 0.92)',
            labelFill: 'rgba(255, 236, 230, 0.94)',
            labelStroke: 'rgba(32, 10, 8, 0.9)'
        };
    }

    return {
        frameFillTop: '#283244',
        frameFillBottom: colors.smokeDeep,
        frameStroke: 'rgba(184, 217, 228, 0.4)',
        frameInnerRim: 'rgba(255, 250, 242, 0.12)',
        sigilFillDark: '#1e3a4a',
        sigilFillLight: colors.cyanBright,
        sigilStroke: 'rgba(4, 10, 16, 0.9)',
        sigilHighlight: 'rgba(220, 240, 255, 0.3)',
        rankFill: '#fffffc',
        rankFillMid: '#fffef8',
        rankStroke: 'rgba(4, 6, 12, 0.94)',
        rankShadow: 'rgba(4, 8, 14, 0.52)',
        vignette: 'rgba(4, 8, 16, 0.36)',
        grainRgb: '255, 255, 255',
        grainAlpha: 0.05,
        plateFill: 'rgba(24, 32, 48, 0.78)',
        plateFillOuter: 'rgba(10, 14, 22, 0.52)',
        plateStroke: 'rgba(184, 217, 228, 0.38)',
        plateGlow: 'rgba(99, 165, 187, 0.16)',
        symbolFill: '#fffef8',
        symbolStroke: 'rgba(4, 6, 12, 0.94)',
        labelFill: 'rgba(248, 244, 234, 0.97)',
        labelStroke: 'rgba(4, 6, 12, 0.92)'
    };
};
