import { useEffect, useRef } from 'react';

import chillLoopUrl from '../assets/audio/music/chill-loop.wav?url';

const clamp01 = (v: number): number => Math.max(0, Math.min(1, v));

/** Effective linear gain from settings (0–1 each), matching SFX stacking. */
export const musicGainFromSettings = (masterVolume: number, musicVolume: number): number =>
    clamp01(masterVolume) * clamp01(musicVolume);

export interface GameplayMusicParams {
    /** When false, playback is paused (e.g. settings, codex, game over). */
    active: boolean;
    masterVolume: number;
    musicVolume: number;
}

/**
 * Looped background music via `HTMLAudioElement`. Volume follows **`masterVolume` × `musicVolume`**.
 * HTMLMediaElement autoplay rules apply: first successful `play()` may require a user gesture; we retry on the first `pointerdown`.
 */
export function useGameplayMusic({ active, masterVolume, musicVolume }: GameplayMusicParams): void {
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (typeof Audio === 'undefined') return undefined;

        const el = new Audio(chillLoopUrl);
        el.loop = true;
        el.preload = 'auto';
        audioRef.current = el;

        const onFirstPointer = (): void => {
            void el.play().catch(() => {});
            document.removeEventListener('pointerdown', onFirstPointer);
        };
        document.addEventListener('pointerdown', onFirstPointer);

        return () => {
            document.removeEventListener('pointerdown', onFirstPointer);
            el.pause();
            el.removeAttribute('src');
            el.load();
            audioRef.current = null;
        };
    }, []);

    useEffect(() => {
        const el = audioRef.current;
        if (!el) return;

        el.volume = musicGainFromSettings(masterVolume, musicVolume);

        if (!active) {
            el.pause();
            return;
        }

        void el.play().catch(() => {});
    }, [active, masterVolume, musicVolume]);
}
