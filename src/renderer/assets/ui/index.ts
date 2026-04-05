import brandCrestUrl from './brand-crest.svg';
import gameplaySceneUrl from './gameplay-scene.svg';
import dividerOrnamentUrl from './divider-ornament.svg';
import menuEmblemUrl from './menu-emblem.svg';
import menuSceneUrl from './menu-scene.svg';
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
