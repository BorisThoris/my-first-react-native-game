import type { CSSProperties } from 'react';
import { MATCH_DELAY_MS, RESOLVE_DELAY_MULTIPLIER_MIN } from '../../shared/contracts';

export const GAMEPLAY_VISUAL_CSS_VARS = {
    ['--gameplay-chrome-blur' as string]: '19px',
    ['--gameplay-chrome-border' as string]: 'color-mix(in srgb, var(--theme-hud-chrome-border) 94%, transparent)',
    ['--gameplay-chrome-border-soft' as string]:
        'color-mix(in srgb, var(--theme-hud-chrome-border-soft) 88%, transparent)',
    ['--gameplay-chrome-border-strong' as string]:
        'color-mix(in srgb, var(--theme-gold-bright) 40%, var(--theme-hud-chrome-border))',
    ['--gameplay-chrome-radius' as string]: 'calc(var(--ui-radius-lg) + 0.12rem)',
    ['--gameplay-chrome-shadow' as string]:
        'var(--theme-hud-chrome-shadow), 0 16px 36px color-mix(in srgb, var(--theme-shadow) 28%, transparent)',
    ['--gameplay-chrome-shadow-strong' as string]:
        '0 24px 54px color-mix(in srgb, var(--theme-shadow) 42%, transparent), 0 0 0 1px color-mix(in srgb, var(--theme-shadow) 18%, transparent)',
    ['--gameplay-chrome-surface' as string]:
        'linear-gradient(180deg, rgba(255, 243, 217, 0.06), transparent 24%), linear-gradient(180deg, rgba(31, 24, 19, 0.22), transparent 62%), color-mix(in srgb, var(--theme-panel-solid) 92%, var(--theme-stone) 8%)',
    ['--gameplay-chrome-surface-muted' as string]:
        'linear-gradient(180deg, rgba(255, 243, 217, 0.035), transparent 28%), linear-gradient(180deg, rgba(16, 14, 18, 0.22), transparent 64%), color-mix(in srgb, var(--theme-void) 72%, var(--theme-stone) 8%)',
    ['--gameplay-hud-context-strip-border' as string]:
        'color-mix(in srgb, var(--theme-gold-bright) 10%, transparent)',
    ['--gameplay-hud-context-strip-surface' as string]:
        'linear-gradient(180deg, rgba(255, 243, 217, 0.024), transparent 46%), color-mix(in srgb, var(--theme-void) 46%, transparent)',
    ['--gameplay-hud-context-gap' as string]: '0.24rem',
    ['--gameplay-hud-context-padding-top' as string]: '0.16rem',
    ['--gameplay-hud-context-pill-min-height' as string]: '2.16rem',
    ['--gameplay-hud-context-pill-padding' as string]: '0.22rem 0.46rem 0.28rem',
    ['--gameplay-hud-context-tone' as string]: '0.76',
    ['--gameplay-overlay-actions-surface' as string]:
        'linear-gradient(180deg, rgba(255, 243, 217, 0.04), transparent 54%), color-mix(in srgb, var(--theme-void) 62%, transparent)',
    ['--gameplay-overlay-border' as string]:
        '1px solid color-mix(in srgb, var(--theme-gold-bright) 18%, var(--theme-border-strong))',
    ['--gameplay-overlay-scrim-bg' as string]:
        'radial-gradient(ellipse 92% 78% at 50% 0%, rgba(242, 211, 157, 0.06), transparent 56%), radial-gradient(ellipse 120% 96% at 50% 108%, rgba(39, 28, 18, 0.36), transparent 42%), var(--theme-scrim-dialog)',
    ['--gameplay-overlay-scrim-filter' as string]: 'blur(18px) saturate(135%)',
    ['--gameplay-overlay-shadow' as string]:
        '0 34px 90px color-mix(in srgb, var(--theme-shadow) 55%, transparent), inset 0 1px 0 rgba(255, 236, 205, 0.08)',
    ['--gameplay-overlay-surface' as string]:
        'linear-gradient(180deg, rgba(255, 243, 217, 0.06), transparent 18%), linear-gradient(160deg, rgba(19, 16, 14, 0.97), rgba(8, 8, 12, 0.96))',
    ['--gameplay-rail-badge-size' as string]: '1.08rem',
    ['--gameplay-rail-button-size' as string]: '2.84rem',
    ['--gameplay-rail-medallion-shadow' as string]:
        'inset 0 1px 0 var(--theme-hud-chrome-inset), inset 0 -1px 0 color-mix(in srgb, var(--theme-shadow) 26%, transparent), 0 14px 24px color-mix(in srgb, var(--theme-shadow) 24%, transparent)',
    ['--gameplay-rail-medallion-shadow-active' as string]:
        'inset 0 0 0 1px var(--theme-border-strong), inset 0 -1px 0 color-mix(in srgb, var(--theme-shadow) 18%, transparent), 0 14px 28px color-mix(in srgb, var(--theme-shadow) 28%, transparent), 0 0 20px color-mix(in srgb, var(--theme-glow-gold-soft) 34%, transparent)',
    ['--gameplay-rail-width' as string]: '3.44rem',
    ['--gameplay-settings-shell-surface' as string]:
        'linear-gradient(180deg, rgba(255, 243, 217, 0.05), transparent 18%), linear-gradient(160deg, rgba(18, 14, 13, 0.97), rgba(8, 8, 12, 0.96))',
    ['--gameplay-settings-sidebar-surface' as string]:
        'linear-gradient(90deg, color-mix(in srgb, var(--theme-meta-frame-accent) 18%, transparent) 0, color-mix(in srgb, var(--theme-meta-frame-accent) 8%, transparent) 1px, transparent 2px), radial-gradient(ellipse 120% 85% at 20% 0%, rgba(242, 211, 157, 0.08), transparent 58%), linear-gradient(160deg, color-mix(in srgb, var(--theme-stone) 72%, transparent), color-mix(in srgb, var(--theme-void-soft) 82%, transparent))',
    ['--gameplay-shell-block-pad' as string]: '0.46rem',
    ['--gameplay-shell-column-gap' as string]: '0.56rem',
    ['--gameplay-shell-gap' as string]: '0.56rem',
    ['--gameplay-shell-inline-pad' as string]: 'clamp(0.36rem, 1vw, 0.72rem)',
    ['--gameplay-meta-desk-border' as string]:
        'color-mix(in srgb, var(--theme-gold-bright) 22%, transparent)',
    ['--gameplay-meta-desk-shadow' as string]:
        '0 28px 74px rgba(0, 0, 0, 0.56), inset 0 1px 0 rgba(255, 236, 205, 0.1)',
    ['--gameplay-meta-desk-surface' as string]:
        'radial-gradient(ellipse 120% 48% at 50% 0%, rgba(242, 211, 157, 0.1), transparent 58%), radial-gradient(ellipse 80% 55% at 18% 88%, rgba(140, 98, 223, 0.06), transparent 52%), linear-gradient(168deg, rgba(26, 20, 16, 0.98), rgba(7, 6, 10, 0.99))',
    ['--gameplay-stage-board-glow-inset' as string]: '5% 8% 10%',
    ['--gameplay-stage-dais-bottom' as string]: '-14%',
    ['--gameplay-stage-dais-height' as string]: '48%',
    ['--gameplay-stage-dais-width' as string]: 'min(110%, 58rem)',
    ['--gameplay-stage-ring-bottom' as string]: '-11%',
    ['--gameplay-stage-ring-opacity' as string]: '0.41',
    ['--gameplay-stage-ring-size' as string]: 'min(116%, 60rem)'
} as CSSProperties;

export const GAMEPLAY_BOARD_VISUALS = {
    faceUpHoverRimOpacityMul: {
        high: 0.56,
        low: 0.38,
        medium: 0.46
    },
    hoverFaceUpTintLerp: 0.1,
    hoverGoldQualityScales: {
        high: { emissiveIntensity: 0.26, rimOpacity: 0.82 },
        low: { emissiveIntensity: 0.12, rimOpacity: 0.46 },
        medium: { emissiveIntensity: 0.19, rimOpacity: 0.66 }
    },
    hoverHiddenDepth: 0.0048,
    hoverHiddenLift: 0.00315,
    hoverHiddenTiltX: 0.114,
    hoverHiddenTiltZ: 0.104,
    lowQualityMatchedBackEmissive: {
        base: 0.12,
        pulse: 0.1
    },
    lowQualityMatchedFrontEmissive: {
        base: 0.24,
        pulse: 0.2
    },
    interactionFeedback: {
        match: {
            material: 'ember-green victory rim + scale pulse',
            motionMs: 220,
            reducedMotion: 'static victory rim + emissive lift'
        },
        mismatch: {
            material: 'danger tint + short recoil',
            motionMs: 180,
            reducedMotion: 'danger tint + rim only'
        },
        invalid: {
            material: 'blocked slot dim + focus ring',
            motionMs: 0,
            reducedMotion: 'blocked slot dim + focus ring'
        },
        combo: {
            material: 'gold shard/favor emphasis',
            motionMs: 240,
            reducedMotion: 'gold text/rim emphasis'
        }
    },
    matchedEdgeEffect: {
        band: {
            innerWidth: 0.18,
            outerWidth: 0.46,
            softness: 0.0062
        },
        /** Seconds — must stay within minimum match-resolve window (`MATCH_DELAY_MS` × `RESOLVE_DELAY_MULTIPLIER_MIN`). */
        burstDuration: {
            default: 0.4,
            reduceMotion: 0.35
        },
        colors: {
            core: [0.98, 1.0, 0.86],
            ember: [1.0, 0.72, 0.34],
            glow: [0.42, 1.0, 0.7]
        },
        geometry: {
            innerCorner: 0.084,
            innerPad: 0.01,
            outerCorner: 0.104,
            outerPad: 0.052
        },
        low: {
            burstBoost: 0.14,
            rimOpacity: 0.52
        },
        tiers: {
            high: {
                baseIntensity: 0.86,
                burstIntensity: 0.34,
                emberStrength: 1,
                innerWidthMul: 1,
                motion: 1,
                outerWidthMul: 1.06
            },
            medium: {
                baseIntensity: 0.66,
                burstIntensity: 0.24,
                emberStrength: 0.74,
                innerWidthMul: 0.96,
                motion: 0.74,
                outerWidthMul: 0.92
            },
            reduceMotion: {
                baseIntensity: 0.58,
                burstIntensity: 0.18,
                emberStrength: 0.36,
                innerWidthMul: 1,
                motion: 0.06,
                outerWidthMul: 0.84
            }
        }
    },
    mismatchEmissive: {
        base: 0.16,
        pulse: 0.1
    },
    mismatchShakeX: 0.022,
    mismatchShakeY: 0.018
} as const;

export const GAMEPLAY_CARD_VISUALS = {
    centerDiamondOpacity: {
        fallback: 0.94,
        textured: 0.68
    },
    innerRingOpacity: {
        fallback: 0.88,
        textured: 0.42
    },
    surfaceMapVersion: 3,
    textureVersion: 47,
    texturedBackEmblemOpacity: 0.14,
    texturedBackPatternOpacity: 0.18,
    texturedBackTint: {
        end: 'rgba(8, 6, 6, 0.18)',
        start: 'rgba(62, 39, 20, 0.09)'
    }
} as const;

export const CARD_INTERACTION_FEEDBACK = {
    hidden: {
        material: 'cool lacquered card back',
        visualCue: 'readable back pattern with tutorial/hover rings when eligible',
        audioCue: 'none',
        motionMs: 0,
        reducedMotionCue: 'static pattern and focus outline'
    },
    hover: {
        material: 'warm lifted gilt edge',
        visualCue: 'gold rim, slight lift, and warm tint on pickable cards',
        audioCue: 'none',
        motionMs: 140,
        reducedMotionCue: 'static gold rim without lift'
    },
    flip: {
        material: 'raised face plate',
        visualCue: 'short face-up pop with structural lift',
        audioCue: 'flip',
        motionMs: 220,
        reducedMotionCue: 'instant face swap with brighter face plate'
    },
    match: {
        material: 'ember victory rim',
        visualCue: 'matched edge flame, green-gold glow, and score floater',
        audioCue: 'resolve_match',
        motionMs: 400,
        reducedMotionCue: 'static success rim and score floater'
    },
    mismatch: {
        material: 'danger recoil face',
        visualCue: 'red tint, danger rim, short shake, and miss floater',
        audioCue: 'resolve_miss',
        motionMs: 260,
        reducedMotionCue: 'static danger tint and miss floater'
    },
    combo: {
        material: 'streak reward spark',
        visualCue: 'HUD objective/combo shard reward copy plus score emphasis',
        audioCue: 'floor_clear_or_pickup',
        motionMs: 320,
        reducedMotionCue: 'text reward copy and stable score emphasis'
    },
    invalid: {
        material: 'locked dull edge',
        visualCue: 'dimmed card, blocked live-region copy, no flip',
        audioCue: 'none',
        motionMs: 120,
        reducedMotionCue: 'static dim and blocked copy'
    },
    disabled: {
        material: 'unavailable matte card',
        visualCue: 'dimmed hidden card and no hover lift',
        audioCue: 'none',
        motionMs: 0,
        reducedMotionCue: 'static dim state'
    }
} as const;

{
    const minResolveMs = MATCH_DELAY_MS * RESOLVE_DELAY_MULTIPLIER_MIN;
    const maxBurstMs =
        Math.max(
            GAMEPLAY_BOARD_VISUALS.matchedEdgeEffect.burstDuration.default,
            GAMEPLAY_BOARD_VISUALS.matchedEdgeEffect.burstDuration.reduceMotion
        ) * 1000;
    if (maxBurstMs > minResolveMs) {
        throw new Error(
            `Matched edge burst (${maxBurstMs}ms) exceeds minimum resolve window (${minResolveMs}ms); sync with contracts.`
        );
    }
}
