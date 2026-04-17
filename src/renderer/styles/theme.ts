import type { CSSProperties } from 'react';

export const RENDERER_THEME = {
    colors: {
        void: '#05050a',
        voidSoft: '#090914',
        voidAlt: '#100f1d',
        smoke: '#161623',
        smokeDeep: '#0d1018',
        stone: '#1b1b27',
        stoneEdge: '#302a34',
        stoneHighlight: '#54433b',
        gold: '#c3954f',
        goldBright: '#f2d39d',
        goldDeep: '#6b441b',
        amber: '#df8447',
        ember: '#bc5434',
        emberSoft: '#f2ae76',
        cyan: '#63a5bb',
        cyanBright: '#b8d9e4',
        cyanDeep: '#365f6d',
        rune: '#ead8b0',
        ash: '#bcb3a0',
        emerald: '#7dc26a',
        emeraldBright: '#b4eb8d',
        violet: '#8c62df',
        violetBright: '#d9c7ff',
        ink: '#05060a',
        text: '#f4ecdc',
        textMuted: 'rgba(231, 221, 202, 0.76)',
        textSubtle: 'rgba(231, 221, 202, 0.58)',
        panel: 'rgba(11, 10, 15, 0.84)',
        panelSolid: 'rgba(8, 8, 12, 0.96)',
        panelAlt: 'rgba(16, 15, 21, 0.92)',
        border: 'rgba(255, 214, 133, 0.14)',
        borderStrong: 'rgba(242, 211, 157, 0.34)',
        borderCyan: 'rgba(99, 165, 187, 0.28)',
        shadow: 'rgba(0, 0, 0, 0.54)',
        glowGold: 'rgba(195, 149, 79, 0.24)',
        glowGoldSoft: 'rgba(242, 211, 157, 0.14)',
        glowAmber: 'rgba(223, 132, 71, 0.18)',
        glowEmber: 'rgba(188, 84, 52, 0.22)',
        glowCyan: 'rgba(99, 165, 187, 0.18)',
        glowCyanSoft: 'rgba(184, 217, 228, 0.12)',
        glowStone: 'rgba(255, 255, 255, 0.04)',
        focus: '#f1d4a0',
        danger: '#d86a58',
        success: '#9fda81'
    },
    cssVars: {
        '--theme-display-font': "'Cinzel', 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
        '--theme-body-font': "'Source Sans 3', 'Trebuchet MS', 'Segoe UI', sans-serif",
        '--theme-ui-font': "'Source Sans 3', 'Trebuchet MS', 'Segoe UI', sans-serif",
        '--theme-void': '#05050a',
        '--theme-void-soft': '#090914',
        '--theme-void-alt': '#100f1d',
        '--theme-smoke': '#161623',
        '--theme-smoke-deep': '#0d1018',
        '--theme-stone': '#1b1b27',
        '--theme-stone-edge': '#302a34',
        '--theme-stone-highlight': '#54433b',
        '--theme-gold': '#c3954f',
        '--theme-gold-bright': '#f2d39d',
        '--theme-gold-deep': '#6b441b',
        '--theme-amber': '#df8447',
        '--theme-ember': '#bc5434',
        '--theme-ember-soft': '#f2ae76',
        '--theme-cyan': '#63a5bb',
        '--theme-cyan-bright': '#b8d9e4',
        '--theme-cyan-deep': '#365f6d',
        '--theme-rune': '#ead8b0',
        '--theme-ash': '#bcb3a0',
        '--theme-emerald': '#7dc26a',
        '--theme-emerald-bright': '#b4eb8d',
        '--theme-violet': '#8c62df',
        '--theme-violet-bright': '#d9c7ff',
        '--theme-ink': '#05060a',
        '--theme-text': '#f4ecdc',
        '--theme-text-muted': 'rgba(231, 221, 202, 0.76)',
        '--theme-text-subtle': 'rgba(231, 221, 202, 0.58)',
        '--theme-panel': 'rgba(11, 10, 15, 0.84)',
        '--theme-panel-solid': 'rgba(8, 8, 12, 0.96)',
        '--theme-panel-alt': 'rgba(16, 15, 21, 0.92)',
        '--theme-panel-surface':
            'radial-gradient(circle at top left, rgba(195, 149, 79, 0.1), transparent 34%), radial-gradient(circle at bottom right, rgba(140, 98, 223, 0.1), transparent 28%), linear-gradient(160deg, rgba(18, 16, 24, 0.98), rgba(8, 8, 12, 0.96))',
        '--theme-panel-surface-strong':
            'radial-gradient(circle at top left, rgba(242, 211, 157, 0.14), transparent 34%), radial-gradient(circle at bottom right, rgba(140, 98, 223, 0.12), transparent 30%), linear-gradient(160deg, rgba(21, 18, 27, 0.99), rgba(8, 8, 12, 0.97))',
        '--theme-panel-surface-muted':
            'linear-gradient(160deg, rgba(19, 17, 25, 0.94), rgba(9, 9, 14, 0.94))',
        '--theme-panel-surface-accent':
            'radial-gradient(circle at top right, rgba(140, 98, 223, 0.12), transparent 34%), radial-gradient(circle at bottom left, rgba(195, 149, 79, 0.12), transparent 34%), linear-gradient(160deg, rgba(22, 18, 25, 0.94), rgba(8, 8, 12, 0.96))',
        '--theme-border': 'rgba(255, 214, 133, 0.14)',
        '--theme-border-strong': 'rgba(242, 211, 157, 0.34)',
        '--theme-border-cyan': 'rgba(99, 165, 187, 0.28)',
        '--theme-shadow': 'rgba(0, 0, 0, 0.54)',
        '--theme-panel-frame':
            'linear-gradient(180deg, rgba(255, 244, 218, 0.18), rgba(255, 244, 218, 0.02) 22%, rgba(255, 244, 218, 0) 50%, rgba(195, 149, 79, 0.18) 100%)',
        '--theme-panel-highlight': 'linear-gradient(90deg, rgba(242, 211, 157, 0), rgba(242, 211, 157, 0.25), rgba(242, 211, 157, 0))',
        '--theme-panel-shadow':
            '0 28px 72px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        '--theme-panel-shadow-strong':
            '0 34px 96px rgba(0, 0, 0, 0.48), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        '--theme-control-surface':
            'linear-gradient(180deg, rgba(255, 255, 255, 0.06), rgba(255, 255, 255, 0.012)), rgba(13, 12, 19, 0.84)',
        '--theme-secondary-surface':
            'linear-gradient(180deg, rgba(60, 46, 22, 0.34), rgba(8, 8, 12, 0.84))',
        '--theme-secondary-surface-active':
            'linear-gradient(180deg, rgba(76, 55, 20, 0.52), rgba(12, 10, 14, 0.92))',
        '--theme-primary-surface':
            'linear-gradient(180deg, rgba(124, 41, 25, 0.98) 0%, rgba(106, 23, 17, 0.98) 22%, rgba(67, 13, 12, 0.98) 100%)',
        '--theme-primary-border':
            'linear-gradient(180deg, rgba(255, 224, 174, 0.95), rgba(168, 109, 56, 0.92) 54%, rgba(97, 48, 20, 0.94) 100%)',
        '--theme-primary-shadow':
            '0 20px 42px rgba(0, 0, 0, 0.38), 0 0 28px rgba(188, 84, 52, 0.28), inset 0 1px 0 rgba(255, 236, 205, 0.18)',
        '--theme-glow-gold': 'rgba(195, 149, 79, 0.24)',
        '--theme-glow-gold-soft': 'rgba(242, 211, 157, 0.14)',
        '--theme-glow-amber': 'rgba(223, 132, 71, 0.18)',
        '--theme-glow-ember': 'rgba(188, 84, 52, 0.22)',
        '--theme-glow-cyan': 'rgba(99, 165, 187, 0.18)',
        '--theme-glow-cyan-soft': 'rgba(184, 217, 228, 0.12)',
        '--theme-glow-stone': 'rgba(255, 255, 255, 0.04)',
        '--theme-focus': '#f1d4a0',
        '--theme-danger': '#d86a58',
        '--theme-success': '#9fda81',

        /*
         * DS-001: Keep Source Sans 3 as the primary UI/body face (OFL via @fontsource). Inter was evaluated but not
         * adopted to avoid a second full Latin bundle and to preserve current metrics across screens.
         */
        /* DS-009: document / shell backdrop stops (global.css body + App.module.css .app). */
        '--theme-backdrop-doc-bloom-a': 'rgba(242, 211, 157, 0.12)',
        '--theme-backdrop-doc-bloom-b': 'rgba(140, 98, 223, 0.13)',
        '--theme-backdrop-doc-bloom-c': 'rgba(223, 132, 71, 0.12)',
        '--theme-backdrop-doc-veil': 'rgba(255, 255, 255, 0.02)',
        '--theme-backdrop-grid-line': 'rgba(255, 255, 255, 0.018)',
        '--theme-backdrop-body-shade-mid': 'rgba(5, 5, 10, 0.24)',
        '--theme-backdrop-body-shade-deep': 'rgba(5, 5, 10, 0.66)',
        '--theme-backdrop-body-rim': 'rgba(255, 244, 218, 0.03)',
        '--theme-app-ember-bloom': 'rgba(243, 155, 78, 0.12)',
        '--theme-app-mist-top': 'rgba(255, 255, 255, 0.02)',
        /** App.module.css ambient grid — third gradient line (DS-009); keep off-token rgba minimal. */
        '--theme-ambient-grid-fade': 'rgba(255, 255, 255, 0.015)',
        /** META-005 sticky TOC bar — replaces raw rgba stacks in MetaScreen.module.css */
        '--theme-meta-toc-sticky-bg':
            'linear-gradient(180deg, color-mix(in srgb, var(--theme-void) 96%, transparent), color-mix(in srgb, var(--theme-void) 84%, transparent))',

        /* OVR-001/002/003 — shared modal plate + scrim (OverlayModal, Settings modal Panel; motion in CSS modules + global.css) */
        '--theme-overlay-plate-radius': 'calc(var(--ui-radius-modal) + 0.18rem)',
        '--theme-overlay-plate-border': '1px solid var(--theme-border-strong)',
        '--theme-overlay-plate-shadow':
            '0 26px 64px rgba(0, 0, 0, 0.46), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        '--theme-overlay-plate-inner-glow': 'rgba(255, 244, 218, 0.05)',
        '--theme-modal-plate-padding': 'clamp(1rem, 2vw, 1.2rem)',
        '--theme-modal-scrim-bg': 'var(--theme-scrim-dialog)',
        '--theme-modal-scrim-backdrop-filter': 'blur(14px) saturate(130%)',
        '--theme-modal-plate-enter-duration': '220ms',
        '--theme-modal-plate-enter-ease': 'cubic-bezier(0.22, 1, 0.36, 1)',

        /*
         * HUD-001 — in-game rail / stat deck / flyout: shared warm-gold chrome (GameScreen.module.css).
         * Keeps literal rgba stacks in one place while matching Panel/overlay vocabulary.
         */
        '--theme-hud-chrome-border': 'rgba(244, 213, 142, 0.18)',
        '--theme-hud-chrome-border-soft': 'rgba(244, 213, 142, 0.12)',
        '--theme-hud-chrome-border-muted': 'rgba(244, 213, 142, 0.14)',
        '--theme-hud-chrome-inset': 'rgba(255, 243, 217, 0.06)',
        '--theme-hud-chrome-gloss': 'linear-gradient(180deg, rgba(255, 243, 217, 0.07) 0%, transparent 20%)',
        '--theme-hud-chrome-fill':
            'linear-gradient(180deg, rgba(24, 19, 16, 0.96) 0%, rgba(8, 8, 12, 0.96) 100%)',
        '--theme-hud-chrome-shadow':
            '0 0 0 1px rgba(0, 0, 0, 0.35), 0 18px 42px rgba(0, 0, 0, 0.4), inset 0 1px 0 var(--theme-hud-chrome-inset)',
        '--theme-hud-flyout-surface':
            'radial-gradient(circle at top left, rgba(244, 213, 142, 0.1), transparent 38%), radial-gradient(circle at bottom right, rgba(127, 90, 198, 0.12), transparent 34%), linear-gradient(180deg, rgba(23, 18, 17, 0.98), rgba(8, 8, 11, 0.98))',
        '--theme-hud-flyout-shadow': '0 24px 60px rgba(0, 0, 0, 0.42), inset 0 1px 0 var(--theme-hud-chrome-inset)',
        '--theme-hud-scrim': 'rgba(6, 8, 12, 0.42)',
        '--theme-hud-accent-line': 'rgba(87, 220, 255, 0.18)',
        '--theme-hud-accent-fill': 'rgba(87, 220, 255, 0.1)',
        '--theme-hud-accent-fill-strong': 'rgba(87, 220, 255, 0.14)',
        '--theme-hud-accent-border': 'rgba(87, 220, 255, 0.35)',
        '--theme-hud-accent-border-strong': 'rgba(87, 220, 255, 0.5)',
        '--theme-hud-glyph-glow': 'rgba(255, 214, 133, 0.18)',

        /*
         * HUD-007 — score parasite HUD: arcane violet crystal + meter (VISUAL_SYSTEM_SPEC: magical / challenge accent).
         */
        '--theme-hud-parasite-segment-border': '1px solid rgba(217, 199, 255, 0.32)',
        '--theme-hud-parasite-segment-surface':
            'radial-gradient(ellipse 125% 90% at 50% 0%, rgba(140, 98, 223, 0.34), transparent 55%), linear-gradient(165deg, rgba(26, 16, 40, 0.94) 0%, rgba(8, 8, 12, 0.78) 100%)',
        '--theme-hud-parasite-segment-shadow':
            'inset 0 1px 0 rgba(217, 199, 255, 0.12), 0 10px 28px rgba(0, 0, 0, 0.32), 0 0 36px rgba(140, 98, 223, 0.18)',
        '--theme-hud-parasite-track-bg':
            'linear-gradient(180deg, rgba(5, 6, 10, 0.72) 0%, rgba(14, 11, 22, 0.88) 100%)',
        '--theme-hud-parasite-track-border': '1px solid rgba(140, 98, 223, 0.38)',
        '--theme-hud-parasite-track-inset':
            'inset 0 1px 0 rgba(0, 0, 0, 0.55), inset 0 -1px 0 rgba(140, 98, 223, 0.08), inset 0 0 12px rgba(140, 98, 223, 0.14)',
        '--theme-hud-parasite-fill':
            'linear-gradient(90deg, #5c3d9e 0%, #8c62df 18%, #c9a8ff 42%, #f4ecdc 52%, #c4a6ff 64%, #7a52c4 100%)',
        '--theme-hud-parasite-fill-sheen': 'linear-gradient(180deg, rgba(255, 255, 255, 0.42), rgba(255, 255, 255, 0) 58%)',
        '--theme-hud-parasite-fill-glow': '0 0 16px rgba(217, 199, 255, 0.42), inset 0 0 0 1px rgba(255, 255, 255, 0.12)',
        '--theme-hud-parasite-crystal-well':
            'radial-gradient(circle at 30% 26%, rgba(217, 199, 255, 0.28), transparent 45%), radial-gradient(circle at 72% 78%, rgba(140, 98, 223, 0.4), rgba(6, 6, 10, 0.96) 70%)',
        '--theme-hud-parasite-crystal-border': '1px solid rgba(242, 211, 157, 0.26)',
        '--theme-hud-parasite-crystal-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.14)',
        '--theme-hud-parasite-crystal-aura': '0 0 20px rgba(140, 98, 223, 0.48), 0 0 0 1px rgba(140, 98, 223, 0.22)',
        '--theme-hud-parasite-label-color': 'rgba(244, 236, 220, 0.94)',

        /*
         * HUD-009 — right-wing gameplay “context” (mode, mutators, stat rail): softer chrome + type than score column.
         */
        '--theme-hud-context-border': '1px solid rgba(244, 213, 142, 0.1)',
        '--theme-hud-context-surface':
            'linear-gradient(180deg, rgba(255, 243, 217, 0.025), transparent 46%), color-mix(in srgb, var(--theme-void) 48%, transparent)',
        '--theme-hud-context-segment-shadow': 'inset 0 1px 0 rgba(255, 243, 217, 0.04)',
        '--theme-hud-context-stat-key-color': 'var(--theme-text-muted)',
        '--theme-hud-context-stat-key-font': 'var(--ui-font-body-family)',
        '--theme-hud-context-meta-val-size': 'clamp(0.78rem, 2.3vw, 0.88rem)',
        '--theme-hud-context-rail-val-size': 'clamp(0.72rem, 2vw, 0.82rem)',

        /*
         * META-002 — meta shells, settings modal, inventory/codex overlay, pause-style scrims.
         */
        '--theme-scrim-heavy':
            'radial-gradient(circle at center, rgba(5, 5, 10, 0.2), rgba(5, 5, 10, 0.78)), rgba(2, 4, 8, 0.82)',
        '--theme-scrim-medium':
            'radial-gradient(circle at center, rgba(5, 5, 10, 0.18), rgba(5, 5, 10, 0.76)), rgba(2, 4, 8, 0.76)',
        '--theme-scrim-dialog':
            'radial-gradient(circle at center, rgba(4, 6, 10, 0.18), rgba(4, 6, 10, 0.8)), rgba(2, 5, 10, 0.56)',
        '--theme-meta-stage-wash':
            'radial-gradient(ellipse 85% 58% at 50% 36%, rgba(99, 165, 187, 0.07), transparent 56%), radial-gradient(circle at 14% 16%, rgba(195, 149, 79, 0.1), transparent 44%), linear-gradient(168deg, rgba(5, 7, 12, 0.96), rgba(3, 4, 9, 0.99))',
        '--theme-surface-well': 'rgba(7, 7, 11, 0.28)',
        '--theme-surface-archive': 'rgba(9, 9, 13, 0.36)',
        '--theme-surface-raised':
            'linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent), rgba(12, 12, 18, 0.62)',
        '--theme-surface-raised-soft':
            'linear-gradient(180deg, rgba(255, 255, 255, 0.03), transparent), rgba(12, 12, 18, 0.44)',
        '--theme-divider-hairline': 'rgba(242, 211, 157, 0.1)',
        '--theme-card-border-muted': 'rgba(242, 211, 157, 0.08)',
        '--theme-glow-violet-drop': 'rgba(140, 98, 223, 0.36)',
        '--theme-elevation-card': '0 14px 34px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.04)',
        '--theme-elevation-lift': '0 12px 40px rgba(0, 0, 0, 0.35)',

        /*
         * META-003 — forged gold meta frame (`MetaFrame`): vector cornice around meta plates without forking Panel.
         */
        '--theme-meta-frame-outset': '-0.3rem',
        '--theme-meta-frame-accent': 'var(--theme-gold)',
        '--theme-meta-frame-drop':
            '0 0 12px color-mix(in srgb, var(--theme-glow-gold) 65%, transparent)',

        /*
         * INTRO-001 / SHELL-001 — StartupIntro overlay blooms + MainMenuBackground atmosphere fallback.
         */
        '--theme-intro-bloom-gold': 'rgba(255, 215, 127, 0.14)',
        '--theme-intro-bloom-cyan': 'rgba(87, 220, 255, 0.12)',
        '--theme-intro-overlay-veil':
            'linear-gradient(180deg, rgba(3, 4, 8, 0.72), rgba(4, 6, 10, 0.86) 38%, rgba(4, 6, 10, 0.92))',
        '--theme-shell-bloom-gold': 'rgba(255, 215, 127, 0.16)',
        '--theme-shell-bloom-cyan': 'rgba(194, 245, 255, 0.15)',
        '--theme-shell-bloom-ember': 'rgba(255, 177, 107, 0.1)',
        '--theme-shell-fallback-vignette':
            'radial-gradient(circle at center, rgba(14, 19, 29, 0.02), rgba(5, 6, 8, 0.42) 88%)',

        /* UI system: radius */
        '--ui-radius-sm': '0.45rem',
        '--ui-radius-md': '0.7rem',
        '--ui-radius-lg': '0.95rem',
        '--ui-radius-xl': '1.15rem',
        '--ui-radius-panel': '1.35rem',
        '--ui-radius-modal': '1.15rem',
        '--ui-radius-button': '1rem',
        '--ui-radius-pill': '999px',

        /* UI system: spacing (rem) */
        '--ui-space-2xs': '0.25rem',
        '--ui-space-xs': '0.35rem',
        '--ui-space-sm': '0.5rem',
        '--ui-space-md': '0.65rem',
        '--ui-space-lg': '0.85rem',
        '--ui-space-xl': '1rem',
        '--ui-space-2xl': '1.35rem',
        '--ui-space-3xl': '1.75rem',

        /*
         * Spacing ladder aliases — use in shells (main menu, meta, settings) so density and fit-viewport
         * overrides only need to touch --ui-space-* on .app (buildRendererThemeStyle) or local shell props.
         */
        '--theme-space-2xs': 'var(--ui-space-2xs)',
        '--theme-space-xs': 'var(--ui-space-xs)',
        '--theme-space-sm': 'var(--ui-space-sm)',
        '--theme-space-md': 'var(--ui-space-md)',
        '--theme-space-lg': 'var(--ui-space-lg)',
        '--theme-space-xl': 'var(--ui-space-xl)',
        '--theme-space-2xl': 'var(--ui-space-2xl)',
        '--theme-space-3xl': 'var(--ui-space-3xl)',

        /* UI system: typography scale */
        '--ui-font-eyebrow': '0.72rem',
        '--ui-font-display-family': "'Cinzel', 'Palatino Linotype', 'Book Antiqua', Georgia, serif",
        '--ui-font-body-family': "'Source Sans 3', 'Trebuchet MS', 'Segoe UI', sans-serif",
        '--ui-font-label': '0.62rem',
        '--ui-font-body': '0.95rem',
        '--ui-font-body-sm': '0.82rem',
        '--ui-font-stat': '1.2rem',
        '--ui-font-stat-lg': '1.45rem',
        '--ui-font-section': '1rem',
        '--ui-font-modal-title': '1.75rem',
        '--ui-type-display': 'clamp(2.8rem, 7.4vw, 6rem)',
        '--ui-type-screen': 'clamp(1.25rem, 3.2vw, 2rem)',
        '--ui-type-screen-md': 'clamp(1.65rem, 3.6vw, 2.45rem)',
        '--ui-type-screen-lg': 'clamp(2rem, 5vw, 3.25rem)',
        '--ui-type-menu-mobile': 'clamp(2rem, 13vw, 3.3rem)',

        /* Shared layout */
        '--ui-panel-max': 'min(1180px, 100%)',
        '--ui-shell-pad-x': 'clamp(0.65rem, 1.5vw, 1.15rem)',
        '--ui-shell-pad-y': 'clamp(0.55rem, 1.2vw, 0.85rem)',
        '--ui-touch-target-min': '2.75rem',
        '--ui-shell-screen-pad-inline': 'clamp(0.85rem, 1.8vw, 1.35rem)',
        '--ui-shell-screen-pad-block': 'clamp(0.78rem, 1.6vw, 1.1rem)',
        /* Safe-area-inclusive shorthand; references pad-* so compact density overrides still apply. */
        '--ui-shell-screen-pad-safe':
            'max(var(--ui-shell-screen-pad-block), env(safe-area-inset-top, 0px)) max(var(--ui-shell-screen-pad-inline), env(safe-area-inset-right, 0px)) max(var(--ui-shell-screen-pad-block), env(safe-area-inset-bottom, 0px)) max(var(--ui-shell-screen-pad-inline), env(safe-area-inset-left, 0px))',
        '--ui-shell-screen-gap': 'var(--theme-space-xl)',
        '--ui-card-pad-md': 'clamp(0.95rem, 2vw, 1.2rem)',
        '--ui-card-pad-lg': 'clamp(1.05rem, 2.2vw, 1.45rem)',
        '--ui-footer-action-gap': 'var(--theme-space-md)'
    } as const
} as const;

/** Tighter step values when `data-density="compact"` (narrow or short viewport). */
const RENDERER_THEME_UI_SPACE_COMPACT = {
    '--ui-space-2xs': '0.2rem',
    '--ui-space-xs': '0.28rem',
    '--ui-space-sm': '0.42rem',
    '--ui-space-md': '0.55rem',
    '--ui-space-lg': '0.72rem',
    '--ui-space-xl': '0.88rem',
    '--ui-space-2xl': '1.12rem',
    '--ui-space-3xl': '1.48rem',
    '--ui-shell-screen-pad-inline': '0.78rem',
    '--ui-shell-screen-pad-block': '0.7rem',
    '--ui-shell-screen-gap': '0.78rem',
    '--ui-card-pad-md': '0.92rem',
    '--ui-card-pad-lg': '1.02rem',
    '--ui-footer-action-gap': '0.65rem'
} as const;

export type RendererThemeVars = typeof RENDERER_THEME.cssVars;

export type RendererThemeDensity = 'compact' | 'roomy';

export const buildRendererThemeStyle = (
    uiScale: number,
    density: RendererThemeDensity = 'roomy',
    reduceMotion = false
): CSSProperties =>
    ({
        ...RENDERER_THEME.cssVars,
        ...(density === 'compact' ? RENDERER_THEME_UI_SPACE_COMPACT : {}),
        /*
         * OVR-015: frosted scrims lean on `backdrop-filter`; without blur the same rgba stack reads lighter.
         * Deepen the token so OverlayModal + Settings modal shells keep separation from gameplay.
         */
        ...(reduceMotion
            ? {
                  ['--theme-modal-scrim-bg' as string]: 'var(--theme-scrim-heavy)',
                  ['--theme-modal-scrim-backdrop-filter' as string]: 'none'
              }
            : {}),
        ['--ui-scale' as string]: uiScale
    }) as CSSProperties;
