import { fireEvent, render, screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createNewRun } from '../../shared/game-core';
import { rollRunEventRoom } from '../../shared/run-events';
import { createDefaultSaveData } from '../../shared/save-data';
import { useAppStore } from '../store/useAppStore';
import SideRoomScreen from './SideRoomScreen';

const uiSfxMocks = vi.hoisted(() => ({
    playUiBackSfx: vi.fn(),
    playUiConfirmSfx: vi.fn(),
    resumeUiSfxContext: vi.fn(),
    uiSfxGainFromSettings: (masterVolume: number, sfxVolume: number) =>
        Math.max(0, Math.min(1, masterVolume)) * Math.max(0, Math.min(1, sfxVolume))
}));

vi.mock('../audio/uiSfx', () => uiSfxMocks);

const setupEventSideRoom = () => {
    const saveData = createDefaultSaveData();
    const run = createNewRun(0, { echoFeedbackEnabled: false, runSeed: 47 });
    const event = rollRunEventRoom({ runSeed: run.runSeed, rulesVersion: run.runRulesVersion, floor: 2 });
    useAppStore.setState({
        hydrated: true,
        hydrating: false,
        view: 'sideRoom',
        saveData,
        settings: saveData.settings,
        run: {
            ...run,
            status: 'levelComplete',
            sideRoom: {
                id: `${event.eventKey}:side`,
                kind: 'run_event',
                routeType: 'mystery',
                nodeKind: 'event',
                floor: 2,
                title: event.title,
                body: event.body,
                primaryLabel: event.options[0]!.label,
                primaryDetail: event.options[0]!.detail,
                skipLabel: 'Decline',
                choices: event.options.map((option, index) => ({
                    id: option.id,
                    label: option.label,
                    detail: option.detail,
                    primary: index === 0
                })),
                payload: { kind: 'event_choice', eventKey: event.eventKey, choiceId: event.options[0]!.id }
            }
        }
    });
    return event;
};

describe('SideRoomScreen', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAppStore.setState({ run: null, view: 'menu' });
    });

    it('renders every event choice as an action', () => {
        const event = setupEventSideRoom();

        render(<SideRoomScreen />);

        expect(screen.getByRole('dialog', { name: /route side room/i })).toBeInTheDocument();
        for (const choice of event.options) {
            expect(screen.getByRole('button', { name: choice.label })).toBeInTheDocument();
            expect(screen.getAllByText(choice.detail).length).toBeGreaterThan(0);
        }
    });

    it('claims the clicked event choice', () => {
        const event = setupEventSideRoom();
        const choice = event.options.find((option) => option.effect === 'gain_iron_key') ?? event.options[0]!;

        render(<SideRoomScreen />);
        fireEvent.click(screen.getByRole('button', { name: choice.label }));

        expect(uiSfxMocks.playUiConfirmSfx).toHaveBeenCalled();
        expect(useAppStore.getState().run?.sideRoom).toBeNull();
    });
});
