import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { createDefaultSaveData } from '../../shared/save-data';
import CodexScreen from './CodexScreen';

vi.mock('zustand/react/shallow', () => ({
    useShallow: <T,>(fn: T) => fn
}));

vi.mock('../store/useAppStore', () => ({
    useAppStore: (selector: (state: unknown) => unknown) =>
        selector({
            closeSubscreen: vi.fn(),
            saveData: createDefaultSaveData(),
            settings: { masterVolume: 0, sfxVolume: 0 }
        })
}));

vi.mock('../audio/uiSfx', () => ({
    playUiBackSfx: vi.fn(),
    playUiClickSfx: vi.fn(),
    resumeUiSfxContext: vi.fn(),
    uiSfxGainFromSettings: () => 0
}));

describe('CodexScreen REG-095 knowledge base', () => {
    it('surfaces knowledge-base summary and local-only deep-link recovery', () => {
        render(<CodexScreen />);

        const summary = screen.getByTestId('codex-knowledge-base-summary');
        expect(summary).toHaveTextContent(/Guide depth/);
        expect(summary).toHaveTextContent(/Table depth/);
        expect(summary).toHaveTextContent(/Deep links/);
        expect(summary).toHaveTextContent(/Filter recovery/);
    });
});
