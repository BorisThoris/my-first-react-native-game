import { describe, expect, it } from 'vitest';
import { RENDERER_THEME } from './theme';

const channel = (c: number): number => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

const relLuminance = (r: number, g: number, b: number): number =>
    0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);

const parseHexRgb = (hex: string): [number, number, number] => {
    const h = hex.replace('#', '');
    const n = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
    const v = Number.parseInt(n, 16);
    return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
};

const parseRgbaOnVoid = (rgba: string, voidHex: string): [number, number, number] => {
    const m = rgba.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+)\s*)?\)/i);
    if (!m) {
        throw new Error(`Expected rgba(), got ${rgba}`);
    }
    const br = Number(m[1]);
    const bg = Number(m[2]);
    const bb = Number(m[3]);
    const a = m[4] != null ? Number(m[4]) : 1;
    const [vr, vg, vb] = parseHexRgb(voidHex);
    return [
        Math.round(a * br + (1 - a) * vr),
        Math.round(a * bg + (1 - a) * vg),
        Math.round(a * bb + (1 - a) * vb)
    ];
};

const contrastRatio = (fg: [number, number, number], bg: [number, number, number]): number => {
    const L1 = relLuminance(fg[0], fg[1], fg[2]);
    const L2 = relLuminance(bg[0], bg[1], bg[2]);
    const light = Math.max(L1, L2);
    const dark = Math.min(L1, L2);
    return (light + 0.05) / (dark + 0.05);
};

describe('theme WCAG AA contrast (REF-095)', () => {
    const voidRgb = parseHexRgb(RENDERER_THEME.colors.void);
    const textRgb = parseHexRgb(RENDERER_THEME.colors.text);

    it('primary body text on void ≥ 4.5:1', () => {
        expect(contrastRatio(textRgb, voidRgb)).toBeGreaterThanOrEqual(4.5);
    });

    it('muted text token on void ≥ 4.5:1', () => {
        const muted = parseRgbaOnVoid(RENDERER_THEME.colors.textMuted, RENDERER_THEME.colors.void);
        expect(contrastRatio(muted, voidRgb)).toBeGreaterThanOrEqual(4.5);
    });

    it('subtle text token on void ≥ 3:1 (large/auxiliary)', () => {
        const subtle = parseRgbaOnVoid(RENDERER_THEME.colors.textSubtle, RENDERER_THEME.colors.void);
        expect(contrastRatio(subtle, voidRgb)).toBeGreaterThanOrEqual(3);
    });
});
