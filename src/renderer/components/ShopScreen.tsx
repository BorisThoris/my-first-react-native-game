import { useEffect, useRef } from 'react';
import { useShallow } from 'zustand/react/shallow';
import type { RunShopOfferState } from '../../shared/contracts';
import { canRerollShopOffers, getShopRerollCostForFloor } from '../../shared/game';
import { focusFirstTabbableOrContainer, handleTabFocusTrapEvent } from '../a11y/focusables';
import { popModalFocusSnapshot, pushModalFocusSnapshot } from '../a11y/modalFocusReturnStack';
import {
    playUiBackSfx,
    playUiClickSfx,
    playUiConfirmSfx,
    resumeUiSfxContext,
    uiSfxGainFromSettings
} from '../audio/uiSfx';
import { UiButton } from '../ui';
import { useAppStore } from '../store/useAppStore';
import { GAMEPLAY_VISUAL_CSS_VARS } from './gameplayVisualConfig';
import styles from './ShopScreen.module.css';

type OfferStatus = 'available' | 'claimed' | 'insufficient' | 'incompatible';

const offerStatus = (offer: RunShopOfferState, shopGold: number): OfferStatus => {
    if (offer.purchased) {
        return 'claimed';
    }
    if (!offer.compatible) {
        return 'incompatible';
    }
    if (shopGold < offer.cost) {
        return 'insufficient';
    }
    return 'available';
};

const statusText = (offer: RunShopOfferState, shopGold: number): string => {
    const status = offerStatus(offer, shopGold);
    if (status === 'claimed') {
        return 'Claimed';
    }
    if (status === 'incompatible') {
        return offer.unavailableReason ?? 'Unavailable';
    }
    if (status === 'insufficient') {
        return 'Not enough shop gold';
    }
    return `${offer.cost}g`;
};

const ShopScreen = () => {
    const rootRef = useRef<HTMLElement | null>(null);
    const {
        closeShopToFloorSummary,
        continueFromShop,
        purchaseShopOffer,
        rerollShopOffers,
        run,
        settings
    } = useAppStore(
        useShallow((state) => ({
            closeShopToFloorSummary: state.closeShopToFloorSummary,
            continueFromShop: state.continueFromShop,
            purchaseShopOffer: state.purchaseShopOffer,
            rerollShopOffers: state.rerollShopOffers,
            run: state.run,
            settings: state.settings
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
                closeShopToFloorSummary();
                return;
            }
            handleTabFocusTrapEvent(event, rootRef.current);
        };
        document.addEventListener('keydown', onKeyDown, true);
        return () => document.removeEventListener('keydown', onKeyDown, true);
    }, [closeShopToFloorSummary, uiGain]);

    if (!run || run.status !== 'levelComplete') {
        return null;
    }

    const floor = run.lastLevelResult?.level ?? run.board?.level ?? run.stats.highestLevel;
    const rerollCost = getShopRerollCostForFloor(run.board?.level ?? run.stats.highestLevel);
    const rerollAvailable = canRerollShopOffers(run);

    const onBack = (): void => {
        resumeUiSfxContext();
        playUiBackSfx(uiGain);
        closeShopToFloorSummary();
    };

    const onContinue = (): void => {
        resumeUiSfxContext();
        playUiConfirmSfx(uiGain);
        continueFromShop();
    };

    return (
        <section
            aria-label="Vendor alcove"
            aria-modal="true"
            className={styles.overlay}
            data-testid="shop-screen"
            ref={rootRef}
            role="dialog"
            style={GAMEPLAY_VISUAL_CSS_VARS}
            tabIndex={-1}
        >
            <div className={styles.shell}>
                <header className={styles.header}>
                    <div className={styles.headerText}>
                        <span className={styles.eyebrow}>Floor {floor} clear</span>
                        <h2>Vendor alcove</h2>
                        <p>Spend temporary shop gold before the next floor. Unspent gold expires when the run ends.</p>
                    </div>
                    <div className={styles.purse} aria-label={`${run.shopGold} shop gold`}>
                        <span>Gold</span>
                        <strong>{run.shopGold}g</strong>
                    </div>
                </header>

                <div className={styles.stockGrid} aria-label="Vendor stock" role="list">
                    {run.shopOffers.map((offer) => {
                        const status = offerStatus(offer, run.shopGold);
                        const disabled = status !== 'available';
                        return (
                            <article className={styles.stockCard} data-status={status} key={offer.id} role="listitem">
                                <div className={styles.stockTopline}>
                                    <span className={styles.stockCategory}>{offer.category}</span>
                                    <span className={styles.stockCost}>{statusText(offer, run.shopGold)}</span>
                                </div>
                                <h3>{offer.label}</h3>
                                <p>{offer.description}</p>
                                <button
                                    className={styles.stockAction}
                                    disabled={disabled}
                                    onClick={() => {
                                        resumeUiSfxContext();
                                        playUiClickSfx(uiGain);
                                        purchaseShopOffer(offer.id);
                                    }}
                                    type="button"
                                >
                                    {offer.purchased ? 'Claimed' : `Spend ${offer.cost}g`}
                                </button>
                            </article>
                        );
                    })}
                </div>

                <footer className={styles.footer}>
                    <button
                        className={styles.rerollButton}
                        disabled={!rerollAvailable}
                        onClick={() => {
                            resumeUiSfxContext();
                            playUiClickSfx(uiGain);
                            rerollShopOffers();
                        }}
                        type="button"
                    >
                        <span>{run.shopRerolls >= 1 ? 'Stock rerolled' : 'Reroll stock'}</span>
                        <small>{run.shopRerolls >= 1 ? 'One reroll per visit' : `${rerollCost}g`}</small>
                    </button>
                    <div className={styles.footerActions}>
                        <UiButton onClick={onBack} size="md" variant="secondary" type="button">
                            Back to floor summary
                        </UiButton>
                        <UiButton onClick={onContinue} size="md" variant="primary" type="button">
                            Continue
                        </UiButton>
                    </div>
                </footer>
            </div>
        </section>
    );
};

export default ShopScreen;
