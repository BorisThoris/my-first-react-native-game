import type { CSSProperties } from 'react';

export const RENDERER_THEME = {
    colors: {
        void: '#050608',
        voidSoft: '#090d15',
        voidAlt: '#0e1220',
        smoke: '#161922',
        smokeDeep: '#10141c',
        stone: '#1b1e27',
        stoneEdge: '#2c3140',
        stoneHighlight: '#394054',
        gold: '#d7a24d',
        goldBright: '#ffd77f',
        goldDeep: '#8a5b1f',
        amber: '#ff8b39',
        ember: '#ff5f2a',
        emberSoft: '#ffb16b',
        cyan: '#57dcff',
        cyanBright: '#c2f5ff',
        cyanDeep: '#1da6cf',
        rune: '#f7e2a8',
        ash: '#c7bfb0',
        text: '#f8f4ea',
        textMuted: 'rgba(232, 226, 214, 0.78)',
        textSubtle: 'rgba(232, 226, 214, 0.64)',
        panel: 'rgba(11, 13, 20, 0.8)',
        panelSolid: 'rgba(7, 9, 14, 0.94)',
        panelAlt: 'rgba(17, 20, 29, 0.84)',
        border: 'rgba(255, 214, 133, 0.14)',
        borderStrong: 'rgba(255, 214, 133, 0.28)',
        borderCyan: 'rgba(87, 220, 255, 0.22)',
        shadow: 'rgba(0, 0, 0, 0.46)',
        glowGold: 'rgba(215, 162, 77, 0.22)',
        glowGoldSoft: 'rgba(255, 220, 140, 0.14)',
        glowAmber: 'rgba(255, 139, 57, 0.18)',
        glowEmber: 'rgba(255, 95, 42, 0.2)',
        glowCyan: 'rgba(87, 220, 255, 0.2)',
        glowCyanSoft: 'rgba(194, 245, 255, 0.14)',
        glowStone: 'rgba(255, 255, 255, 0.04)',
        focus: '#ffd57d',
        danger: '#ff7757',
        success: '#8ce6b8'
    },
    cssVars: {
        '--theme-void': '#050608',
        '--theme-void-soft': '#090d15',
        '--theme-void-alt': '#0e1220',
        '--theme-smoke': '#161922',
        '--theme-smoke-deep': '#10141c',
        '--theme-stone': '#1b1e27',
        '--theme-stone-edge': '#2c3140',
        '--theme-stone-highlight': '#394054',
        '--theme-gold': '#d7a24d',
        '--theme-gold-bright': '#ffd77f',
        '--theme-gold-deep': '#8a5b1f',
        '--theme-amber': '#ff8b39',
        '--theme-ember': '#ff5f2a',
        '--theme-ember-soft': '#ffb16b',
        '--theme-cyan': '#57dcff',
        '--theme-cyan-bright': '#c2f5ff',
        '--theme-cyan-deep': '#1da6cf',
        '--theme-rune': '#f7e2a8',
        '--theme-ash': '#c7bfb0',
        '--theme-text': '#f8f4ea',
        '--theme-text-muted': 'rgba(232, 226, 214, 0.78)',
        '--theme-text-subtle': 'rgba(232, 226, 214, 0.64)',
        '--theme-panel': 'rgba(11, 13, 20, 0.8)',
        '--theme-panel-solid': 'rgba(7, 9, 14, 0.94)',
        '--theme-panel-alt': 'rgba(17, 20, 29, 0.84)',
        '--theme-panel-surface':
            'radial-gradient(circle at top left, rgba(215, 162, 77, 0.08), transparent 32%), radial-gradient(circle at bottom right, rgba(87, 220, 255, 0.06), transparent 30%), linear-gradient(160deg, rgba(16, 19, 28, 0.96), rgba(7, 9, 14, 0.94))',
        '--theme-panel-surface-strong':
            'radial-gradient(circle at top left, rgba(215, 162, 77, 0.12), transparent 34%), radial-gradient(circle at bottom right, rgba(87, 220, 255, 0.08), transparent 30%), linear-gradient(160deg, rgba(18, 22, 32, 0.98), rgba(7, 9, 14, 0.95))',
        '--theme-panel-surface-muted':
            'linear-gradient(160deg, rgba(18, 21, 30, 0.92), rgba(8, 10, 15, 0.92))',
        '--theme-panel-surface-accent':
            'radial-gradient(circle at top right, rgba(87, 220, 255, 0.06), transparent 34%), linear-gradient(160deg, rgba(18, 21, 30, 0.92), rgba(8, 10, 15, 0.92))',
        '--theme-border': 'rgba(255, 214, 133, 0.14)',
        '--theme-border-strong': 'rgba(255, 214, 133, 0.28)',
        '--theme-border-cyan': 'rgba(87, 220, 255, 0.22)',
        '--theme-shadow': 'rgba(0, 0, 0, 0.46)',
        '--theme-panel-shadow':
            '0 26px 72px rgba(0, 0, 0, 0.32), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
        '--theme-panel-shadow-strong':
            '0 30px 84px rgba(0, 0, 0, 0.36), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
        '--theme-control-surface':
            'linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.012)), rgba(11, 13, 20, 0.8)',
        '--theme-primary-surface':
            'linear-gradient(135deg, rgba(215, 162, 77, 1) 0%, rgba(247, 226, 168, 1) 46%, rgba(255, 139, 57, 1) 100%)',
        '--theme-primary-shadow':
            '0 16px 44px rgba(215, 162, 77, 0.22), inset 0 1px 0 rgba(255, 255, 255, 0.18)',
        '--theme-glow-gold': 'rgba(215, 162, 77, 0.22)',
        '--theme-glow-gold-soft': 'rgba(255, 220, 140, 0.14)',
        '--theme-glow-amber': 'rgba(255, 139, 57, 0.18)',
        '--theme-glow-ember': 'rgba(255, 95, 42, 0.2)',
        '--theme-glow-cyan': 'rgba(87, 220, 255, 0.2)',
        '--theme-glow-cyan-soft': 'rgba(194, 245, 255, 0.14)',
        '--theme-glow-stone': 'rgba(255, 255, 255, 0.04)',
        '--theme-focus': '#ffd57d',
        '--theme-danger': '#ff7757',
        '--theme-success': '#8ce6b8'
    } as const
} as const;

export type RendererThemeVars = typeof RENDERER_THEME.cssVars;

export const buildRendererThemeStyle = (uiScale: number): CSSProperties => ({
    ...RENDERER_THEME.cssVars,
    ['--ui-scale' as string]: uiScale
} as CSSProperties);
