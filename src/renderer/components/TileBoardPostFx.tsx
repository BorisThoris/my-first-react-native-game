import { Bloom, EffectComposer, SMAA } from '@react-three/postprocessing';
import { Suspense, type ReactElement } from 'react';
import type { GraphicsQualityPreset } from '../../shared/contracts';
import { gameplayRenderQualityProfile } from './gameplayRenderProfile';

interface TileBoardPostFxProps {
    smaaEnabled: boolean;
    /** FX-015: gated by settings + non-low graphics quality (PERF-001). */
    bloomEnabled: boolean;
    graphicsQuality?: GraphicsQualityPreset;
}

const ComposerBloomOnly = ({ graphicsQuality }: { graphicsQuality?: GraphicsQualityPreset }) => {
    const fx = gameplayRenderQualityProfile(graphicsQuality);
    return (
    <EffectComposer multisampling={0}>
        <Bloom intensity={fx.bloomIntensity} luminanceSmoothing={0.31} luminanceThreshold={fx.bloomThreshold} mipmapBlur />
    </EffectComposer>
    );
};

const ComposerSmaaOnly = () => (
    <EffectComposer multisampling={0}>
        <SMAA />
    </EffectComposer>
);

const ComposerBloomSmaa = ({ graphicsQuality }: { graphicsQuality?: GraphicsQualityPreset }) => {
    const fx = gameplayRenderQualityProfile(graphicsQuality);
    return (
    <EffectComposer multisampling={0}>
        <Bloom intensity={fx.bloomIntensity} luminanceSmoothing={0.31} luminanceThreshold={fx.bloomThreshold} mipmapBlur />
        <SMAA />
    </EffectComposer>
    );
};

/** Screen-space AA and optional bloom for the tile board (PERF-001 / FX-015). */
const TileBoardPostFx = ({ bloomEnabled, graphicsQuality, smaaEnabled }: TileBoardPostFxProps) => {
    if (!smaaEnabled && !bloomEnabled) {
        return null;
    }

    let composer: ReactElement;
    if (bloomEnabled && smaaEnabled) {
        composer = <ComposerBloomSmaa graphicsQuality={graphicsQuality} />;
    } else if (bloomEnabled) {
        composer = <ComposerBloomOnly graphicsQuality={graphicsQuality} />;
    } else {
        composer = <ComposerSmaaOnly />;
    }

    return <Suspense fallback={null}>{composer}</Suspense>;
};

export default TileBoardPostFx;
