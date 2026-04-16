import {
    AdditiveBlending,
    DoubleSide,
    ShaderMaterial,
    Vector2,
    Vector3
} from 'three';
import { GAMEPLAY_BOARD_VISUALS } from './gameplayVisualConfig';
import { MATCHED_RIM_FIRE_FRAGMENT_SHADER } from './matchedCardRimFireShaderGlsl';
import { CARD_PLANE_HEIGHT, CARD_PLANE_WIDTH } from './tileShatter';

const vertexShader = /* glsl */ `
varying vec2 vLocal;

void main() {
  vLocal = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const matchedEdgeGeometry = GAMEPLAY_BOARD_VISUALS.matchedEdgeEffect.geometry;
const matchedEdgeBand = GAMEPLAY_BOARD_VISUALS.matchedEdgeEffect.band;

const outerHalfSize = new Vector2(
    CARD_PLANE_WIDTH * 0.5 + matchedEdgeGeometry.outerPad,
    CARD_PLANE_HEIGHT * 0.5 + matchedEdgeGeometry.outerPad
);
const innerHalfSize = new Vector2(
    CARD_PLANE_WIDTH * 0.5 - matchedEdgeGeometry.innerPad,
    CARD_PLANE_HEIGHT * 0.5 - matchedEdgeGeometry.innerPad
);

export interface MatchedCardRimFireUniforms {
    uTime: { value: number };
    uSeed: { value: number };
    uIntensity: { value: number };
    uBurst: { value: number };
    uMotion: { value: number };
    uSoftness: { value: number };
    uInnerWidth: { value: number };
    uOuterWidth: { value: number };
    uEmberStrength: { value: number };
    uOuterHalfSize: { value: Vector2 };
    uInnerHalfSize: { value: Vector2 };
    uOuterCorner: { value: number };
    uInnerCorner: { value: number };
    uCoreColor: { value: Vector3 };
    uGlowColor: { value: Vector3 };
    uEmberColor: { value: Vector3 };
}

/**
 * Purpose-built additive ember rim for matched cards. The mesh still provides the rounded-rect
 * silhouette, but the shader now derives its read from inner/outer edge distance instead of
 * sampling a generic fire volume.
 */
export const createMatchedCardRimFireMaterial = (seed: number): ShaderMaterial => {
    const colors = GAMEPLAY_BOARD_VISUALS.matchedEdgeEffect.colors;
    const uniforms: MatchedCardRimFireUniforms = {
        uTime: { value: 0 },
        uSeed: { value: (seed % 1000) * 0.001 },
        uIntensity: { value: 0 },
        uBurst: { value: 0 },
        uMotion: { value: 1 },
        uSoftness: { value: matchedEdgeBand.softness },
        uInnerWidth: { value: matchedEdgeBand.innerWidth },
        uOuterWidth: { value: matchedEdgeBand.outerWidth },
        uEmberStrength: { value: 1 },
        uOuterHalfSize: { value: outerHalfSize.clone() },
        uInnerHalfSize: { value: innerHalfSize.clone() },
        uOuterCorner: { value: matchedEdgeGeometry.outerCorner },
        uInnerCorner: { value: matchedEdgeGeometry.innerCorner },
        uCoreColor: { value: new Vector3(...colors.core) },
        uGlowColor: { value: new Vector3(...colors.glow) },
        uEmberColor: { value: new Vector3(...colors.ember) }
    };

    return new ShaderMaterial({
        uniforms: uniforms as unknown as { [uniform: string]: { value: unknown } },
        vertexShader,
        fragmentShader: MATCHED_RIM_FIRE_FRAGMENT_SHADER,
        transparent: true,
        depthWrite: false,
        depthTest: true,
        blending: AdditiveBlending,
        side: DoubleSide,
        toneMapped: false,
        polygonOffset: true,
        polygonOffsetFactor: -1,
        polygonOffsetUnits: -1
    });
};
