import { describe, expect, it } from 'vitest';
import {
    resolveStartupIntroAppContract,
    resolveStartupIntroOverlayContract,
    STARTUP_INTRO_ASSET_FAILSAFE_MS
} from './startupIntroContract';

describe('startup intro contract', () => {
    it('blocks menu pointer and hides menu semantics while hydration/intro overlay is pending', () => {
        expect(
            resolveStartupIntroAppContract({
                hydrated: false,
                introPlayback: 'pending',
                view: 'boot'
            })
        ).toMatchObject({
            hydrationState: 'hydrating',
            menuAriaHidden: true,
            menuPointerState: 'blocked',
            overlayVisible: true,
            renderMenuShell: true,
            returnFocusTestId: 'main-menu-focus-root'
        });
    });

    it('returns control to the menu when the intro is done after hydration', () => {
        expect(
            resolveStartupIntroAppContract({
                hydrated: true,
                introPlayback: 'done',
                view: 'menu'
            })
        ).toMatchObject({
            hydrationState: 'menu-ready',
            menuAriaHidden: false,
            menuPointerState: 'interactive',
            overlayVisible: false,
            renderMenuShell: true
        });
    });

    it('describes loading, skip-pending, ready, and fallback asset states', () => {
        expect(
            resolveStartupIntroOverlayContract({
                assetsReady: false,
                renderMode: 'three',
                skipPending: false
            })
        ).toEqual({
            assetState: 'loading',
            loadingLabel: 'Preparing intro assets…',
            skipState: 'idle'
        });

        expect(
            resolveStartupIntroOverlayContract({
                assetsReady: false,
                renderMode: 'three',
                skipPending: true
            })
        ).toEqual({
            assetState: 'loading',
            loadingLabel: 'Skip requested — preparing a safe intro fallback…',
            skipState: 'requested'
        });

        expect(
            resolveStartupIntroOverlayContract({
                assetsReady: true,
                renderMode: 'fallback',
                skipPending: true
            })
        ).toEqual({
            assetState: 'fallback',
            loadingLabel: null,
            skipState: 'requested'
        });
    });

    it('keeps slow asset failsafe bounded for a first-impression boot path', () => {
        expect(STARTUP_INTRO_ASSET_FAILSAFE_MS).toBeLessThanOrEqual(3500);
    });
});
