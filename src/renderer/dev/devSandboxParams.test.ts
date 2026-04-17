import { afterEach, describe, expect, it } from 'vitest';
import { DEV_SANDBOX_DEFAULT_CONFIG, parseScreenParam, readDevSandboxConfig, resetDevSandboxConfig } from './devSandboxParams';

describe('devSandboxParams', () => {
    it('resetDevSandboxConfig returns a fresh default object', () => {
        const a = resetDevSandboxConfig();
        const b = resetDevSandboxConfig();
        expect(a).toEqual(DEV_SANDBOX_DEFAULT_CONFIG);
        expect(a).not.toBe(b);
        expect(a.unlockAchievements).not.toBe(b.unlockAchievements);
    });

    it('default config snapshot (add fields here when URL schema grows)', () => {
        expect(DEV_SANDBOX_DEFAULT_CONFIG).toMatchInlineSnapshot(`
          {
            "enabled": false,
            "fixture": null,
            "fxSandbox": null,
            "screen": null,
            "skipIntro": false,
            "unlockAchievements": [],
          }
        `);
    });

    it('parseScreenParam accepts common aliases for game over', () => {
        expect(parseScreenParam('gameOver')).toBe('gameOver');
        expect(parseScreenParam('game-over')).toBe('gameOver');
        expect(parseScreenParam('gameover')).toBe('gameOver');
    });

    describe('readDevSandboxConfig', () => {
        const original = window.location.href;

        afterEach(() => {
            window.history.replaceState({}, '', original);
        });

        it('returns disabled when devSandbox gate is not set', () => {
            window.history.replaceState({}, '', '/');
            expect(readDevSandboxConfig().enabled).toBe(false);
        });
    });
});
