import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type CSSProperties,
    type KeyboardEvent
} from 'react';
import type { RelicId } from '../../shared/contracts';
import { getRelicDraftRow, relicDraftRarityLabel, type RelicDraftRarity } from '../../shared/relics';
import { relicDraftRoundAdvancedAnnouncement } from '../copy/relicDraftOffer';
import styles from './RelicDraftOffer.module.css';

/**
 * RDUI-006: Escape does not dismiss this overlay — GameScreen does not close the relic draft on Escape;
 * the player must choose a relic. (Pause via P is already blocked while `relicOffer` is active; see REF-010.)
 */
const rarityClass = (r: RelicDraftRarity): string => {
    switch (r) {
        case 'common':
            return styles.card_common;
        case 'uncommon':
            return styles.card_uncommon;
        case 'rare':
            return styles.card_rare;
        default:
            return styles.card_common;
    }
};

export interface RelicDraftOfferPanelProps {
    optionIds: RelicId[];
    descriptionById: Record<RelicId, string>;
    onPick: (id: RelicId) => void;
    /** Advances when options reroll mid-visit (multi-pick). */
    pickRound: number;
}

const RelicDraftOfferPanel = ({
    optionIds,
    descriptionById,
    onPick,
    pickRound
}: RelicDraftOfferPanelProps) => {
    const gridRef = useRef<HTMLDivElement>(null);
    const prevPickRoundRef = useRef<number | null>(null);
    const [politeMessage, setPoliteMessage] = useState('');

    useEffect(() => {
        const prev = prevPickRoundRef.current;
        if (prev === null) {
            prevPickRoundRef.current = pickRound;
            return undefined;
        }
        prevPickRoundRef.current = pickRound;
        if (pickRound <= prev) {
            return undefined;
        }
        const msg = relicDraftRoundAdvancedAnnouncement();
        queueMicrotask(() => {
            setPoliteMessage(msg);
        });
        const clearId = window.setTimeout(() => {
            setPoliteMessage('');
        }, 1500);
        return () => {
            window.clearTimeout(clearId);
        };
    }, [pickRound]);

    const optionIdsKey = optionIds.join(',');

    useEffect(() => {
        const id = window.requestAnimationFrame(() => {
            gridRef.current?.querySelector('button')?.focus();
        });
        return () => window.cancelAnimationFrame(id);
    }, [optionIdsKey, pickRound]);

    const moveFocus = useCallback((delta: number): void => {
        const root = gridRef.current;
        if (!root) {
            return;
        }
        const buttons = [...root.querySelectorAll('button')] as HTMLButtonElement[];
        if (buttons.length === 0) {
            return;
        }
        const active = document.activeElement;
        let idx = buttons.indexOf(active as HTMLButtonElement);
        if (idx < 0) {
            idx = 0;
        } else {
            idx = (idx + delta + buttons.length) % buttons.length;
        }
        buttons[idx]?.focus();
    }, []);

    const onGridKeyDown = useCallback(
        (event: KeyboardEvent<HTMLDivElement>): void => {
            if (event.altKey || event.ctrlKey || event.metaKey) {
                return;
            }
            const root = gridRef.current;
            const buttons = root ? ([...root.querySelectorAll('button')] as HTMLButtonElement[]) : [];

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                event.stopPropagation();
                moveFocus(1);
                return;
            }
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                event.stopPropagation();
                moveFocus(-1);
                return;
            }
            if (event.key === 'Home' && buttons.length > 0) {
                event.preventDefault();
                event.stopPropagation();
                buttons[0]?.focus();
                return;
            }
            if (event.key === 'End' && buttons.length > 0) {
                event.preventDefault();
                event.stopPropagation();
                buttons[buttons.length - 1]?.focus();
            }
        },
        [moveFocus]
    );

    return (
        <div className={styles.panelRoot}>
            <div aria-live="polite" className={styles.liveRegion} role="status">
                {politeMessage}
            </div>
            <div
                className={styles.grid}
                onKeyDown={onGridKeyDown}
                ref={gridRef}
                role="group"
                aria-label="Relic choices"
            >
                {optionIds.map((id, index) => {
                    const row = getRelicDraftRow(id);
                    const desc = descriptionById[id] ?? id;
                    const ariaTier = relicDraftRarityLabel(row.rarity);
                    const staggerStyle: CSSProperties = {
                        '--relic-card-stagger': index
                    } as CSSProperties;
                    return (
                        <button
                            aria-label={`${ariaTier} relic: ${desc}`}
                            className={`${styles.card} ${rarityClass(row.rarity)}`}
                            key={`${id}-${pickRound}`}
                            onClick={() => onPick(id)}
                            style={staggerStyle}
                            type="button"
                        >
                            <span aria-hidden className={styles.runeStrip} />
                            <p className={styles.body}>{desc}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default RelicDraftOfferPanel;
