import brandCrestUrl from './brand-crest.svg';
import choosePathSceneUrl from './backgrounds/bg-choose-path-stage-v1.png';
import gameplayWorkshopTableUrl from './backgrounds/bg-board-arcane-table-v1.png';
import gameplayWorkshopSceneUrl from './backgrounds/bg-gameplay-arcane-workshop-v1.png';
import gameplaySceneUrl from './backgrounds/bg-gameplay-dungeon-ring-v1.png';
import dividerOrnamentUrl from './divider-ornament.svg';
import menuEmblemUrl from './menu-emblem.svg';
import menuSceneUrl from './backgrounds/bg-main-menu-cathedral-v1.png';
import menuSealUrl from './menu-seal.svg';
import stageRingUrl from './stage-ring.svg';

export const UI_ART = {
    brandCrest: brandCrestUrl,
    /** Choose Your Path — soft-light texture layer over gameplay base (`sceneLayer` in `ChooseYourPathScreen`). */
    choosePathScene: choosePathSceneUrl,
    dividerOrnament: dividerOrnamentUrl,
    gameplayScene: gameplaySceneUrl,
    gameplayWorkshopScene: gameplayWorkshopSceneUrl,
    gameplayWorkshopTable: gameplayWorkshopTableUrl,
    menuEmblem: menuEmblemUrl,
    menuScene: menuSceneUrl,
    menuSeal: menuSealUrl,
    stageRing: stageRingUrl
} as const;

export type UiArtKey = keyof typeof UI_ART;

export { MODE_CARD_ART, resolveModePosterUrl } from './modeArt';
