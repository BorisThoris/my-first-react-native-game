import { EffectComposer, SMAA } from '@react-three/postprocessing';
import { Suspense } from 'react';

interface TileBoardPostFxProps {
    reduceMotion: boolean;
}

const ComposerSmaa = () => (
    <EffectComposer multisampling={0}>
        <SMAA />
    </EffectComposer>
);

/** Screen-space AA for alpha-tested card art; skipped when reduceMotion for lower GPU cost. */
const TileBoardPostFx = ({ reduceMotion }: TileBoardPostFxProps) => {
    if (reduceMotion) {
        return null;
    }

    return (
        <Suspense fallback={null}>
            <ComposerSmaa />
        </Suspense>
    );
};

export default TileBoardPostFx;
