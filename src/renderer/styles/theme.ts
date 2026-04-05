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
        '--ui-shell-pad-y': 'clamp(0.55rem, 1.2vw, 0.85rem)'
    } as const
} as const;

export type RendererThemeVars = typeof RENDERER_THEME.cssVars;

export const buildRendererThemeStyle = (uiScale: number): CSSProperties => ({
    ...RENDERER_THEME.cssVars,
    ['--ui-scale' as string]: uiScale
} as CSSProperties);
