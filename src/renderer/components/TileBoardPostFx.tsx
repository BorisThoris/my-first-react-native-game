import { Bloom, EffectComposer, SMAA } from '@react-three/postprocessing';
import { Suspense, type ReactElement } from 'react';

interface TileBoardPostFxProps {
    smaaEnabled: boolean;
    /** FX-015: gated by settings + non-low graphics quality (PERF-001). */
    bloomEnabled: boolean;
}

const ComposerBloomOnly = () => (
    <EffectComposer multisampling={0}>
        <Bloom intensity={0.38} luminanceSmoothing={0.33} luminanceThreshold={0.78} mipmapBlur />
    </EffectComposer>
);

const ComposerSmaaOnly = () => (
    <EffectComposer multisampling={0}>
        <SMAA />
    </EffectComposer>
);

const ComposerBloomSmaa = () => (
    <EffectComposer multisampling={0}>
        <Bloom intensity={0.38} luminanceSmoothing={0.33} luminanceThreshold={0.78} mipmapBlur />
        <SMAA />
    </EffectComposer>
);

/** Screen-space AA and optional bloom for the tile board (PERF-001 / FX-015). */
const TileBoardPostFx = ({ bloomEnabled, smaaEnabled }: TileBoardPostFxProps) => {
    if (!smaaEnabled && !bloomEnabled) {
        return null;
    }

    let composer: ReactElement;
    if (bloomEnabled && smaaEnabled) {
        composer = <ComposerBloomSmaa />;
    } else if (bloomEnabled) {
        composer = <ComposerBloomOnly />;
    } else {
        composer = <ComposerSmaaOnly />;
    }

    return <Suspense fallback={null}>{composer}</Suspense>;
};

export default TileBoardPostFx;
