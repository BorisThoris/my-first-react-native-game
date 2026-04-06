import brandCrestUrl from './brand-crest.svg';
import gameplaySceneUrl from './backgrounds/bg-gameplay-dungeon-ring-v1.png';
import dividerOrnamentUrl from './divider-ornament.svg';
import menuEmblemUrl from './menu-emblem.svg';
import menuSceneUrl from './backgrounds/bg-main-menu-cathedral-v1.png';
import menuSealUrl from './menu-seal.svg';
import stageRingUrl from './stage-ring.svg';

export const UI_ART = {
    brandCrest: brandCrestUrl,
    dividerOrnament: dividerOrnamentUrl,
    gameplayScene: gameplaySceneUrl,
    menuEmblem: menuEmblemUrl,
    menuScene: menuSceneUrl,
    menuSeal: menuSealUrl,
    stageRing: stageRingUrl
} as const;

export type UiArtKey = keyof typeof UI_ART;

export { MODE_CARD_ART } from './modeArt';
