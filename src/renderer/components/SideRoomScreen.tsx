import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { RouteNodeType } from '../../shared/contracts';
import { focusFirstTabbableOrContainer, handleTabFocusTrapEvent } from '../a11y/focusables';
import { popModalFocusSnapshot, pushModalFocusSnapshot } from '../a11y/modalFocusReturnStack';
import {
    playUiBackSfx,
    playUiConfirmSfx,
    resumeUiSfxContext,
    uiSfxGainFromSettings
} from '../audio/uiSfx';
import { useAppStore } from '../store/useAppStore';
import { UiButton } from '../ui';
import { GAMEPLAY_VISUAL_CSS_VARS } from './gameplayVisualConfig';
import styles from './SideRoomScreen.module.css';

const routeLabel = (routeType: RouteNodeType): string =>
    routeType === 'safe' ? 'Safe route' : routeType === 'greed' ? 'Greedy route' : 'Mystery route';

const SideRoomScreen = () => {
    const rootRef = useRef<HTMLElement | null>(null);
    const { claimSideRoomChoice, claimSideRoomPrimary, run, settings, skipSideRoom } = useAppStore(
        useShallow((state) => ({
            claimSideRoomChoice: state.claimSideRoomChoice,
            claimSideRoomPrimary: state.claimSideRoomPrimary,
            run: state.run,
            settings: state.settings,
            skipSideRoom: state.skipSideRoom
        }))
    );
    const uiGain = uiSfxGainFromSettings(settings.masterVolume, settings.sfxVolume);

    useEffect(() => {
        pushModalFocusSnapshot();
        const frame = window.requestAnimationFrame(() => {
            focusFirstTabbableOrContainer(rootRef.current);
        });
        return () => {
            window.cancelAnimationFrame(frame);
            popModalFocusSnapshot();
        };
    }, []);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent): void => {
            if (event.key === 'Escape') {
                event.preventDefault();
                resumeUiSfxContext();
                playUiBackSfx(uiGain);
                skipSideRoom();
                return;
            }
            handleTabFocusTrapEvent(event, rootRef.current);
        };
        document.addEventListener('keydown', onKeyDown, true);
        return () => document.removeEventListener('keydown', onKeyDown, true);
    }, [skipSideRoom, uiGain]);

    if (!run || run.status !== 'levelComplete' || !run.sideRoom) {
        return null;
    }

    const sideRoom = run.sideRoom;

    return (
        <section
            aria-label="Route side room"
            aria-modal="true"
            className={styles.overlay}
            data-testid="side-room-screen"
            ref={rootRef}
            role="dialog"
            style={GAMEPLAY_VISUAL_CSS_VARS}
            tabIndex={-1}
        >
            <div className={styles.shell}>
                <header className={styles.header}>
                    <span className={styles.eyebrow}>
                        {routeLabel(sideRoom.routeType)} · Floor {sideRoom.floor}
                    </span>
                    <h2>{sideRoom.title}</h2>
                    <p>{sideRoom.body}</p>
                </header>

                <div className={styles.rewardPanel}>
                    <strong>{sideRoom.primaryLabel}</strong>
                    <p className={styles.rewardText}>{sideRoom.primaryDetail}</p>
                    {sideRoom.choices && sideRoom.choices.length > 0 ? (
                        <div className={styles.choiceList}>
                            {sideRoom.choices.map((choice) => (
                                <div className={styles.choiceRow} key={choice.id}>
                                    <strong>{choice.label}</strong>
                                    <p>{choice.detail}</p>
                                </div>
                            ))}
                        </div>
                    ) : null}
                </div>

                <footer className={styles.actions}>
                    <UiButton
                        onClick={() => {
                            resumeUiSfxContext();
                            playUiBackSfx(uiGain);
                            skipSideRoom();
                        }}
                        size="md"
                        type="button"
                        variant="secondary"
                    >
                        {sideRoom.skipLabel}
                    </UiButton>
                    {sideRoom.choices && sideRoom.choices.length > 0 ? (
                        sideRoom.choices.map((choice) => (
                            <UiButton
                                key={choice.id}
                                onClick={() => {
                                    resumeUiSfxContext();
                                    playUiConfirmSfx(uiGain);
                                    claimSideRoomChoice(choice.id);
                                }}
                                size="md"
                                type="button"
                                variant={choice.primary ? 'primary' : 'secondary'}
                            >
                                {choice.label}
                            </UiButton>
                        ))
                    ) : (
                        <UiButton
                            onClick={() => {
                                resumeUiSfxContext();
                                playUiConfirmSfx(uiGain);
                                claimSideRoomPrimary();
                            }}
                            size="md"
                            type="button"
                            variant="primary"
                        >
                            {sideRoom.primaryLabel}
                        </UiButton>
                    )}
                </footer>
            </div>
        </section>
    );
};

export default SideRoomScreen;
