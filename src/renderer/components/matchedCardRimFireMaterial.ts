import {
    AdditiveBlending,
    ClampToEdgeWrapping,
    DataTexture,
    DoubleSide,
    LinearFilter,
    RGBAFormat,
    ShaderMaterial,
    SRGBColorSpace,
    Vector3,
    Vector4
} from 'three';
import { MATCHED_RIM_FIRE_FRAGMENT_SHADER } from './matchedCardRimFireShaderGlsl';

/**
 * Mattatz-style fire on the **actual bezel ring mesh** (`createRoundedRectBezelRingGeometry` via
 * `getResolvingRoundedRectRingGeometry` in-game) — same outline as resolving rim chrome, not a separate quad.
 * See `matchedCardRimFireShaderGlsl.ts`.
 */

/** Vertical luminance ramp — stand-in for `assets/textures/firetex-darkblue.png` in the original demo. */
let sharedFireRampTexture: DataTexture | null = null;

const createFireRampDataTexture = (): DataTexture => {
    const w = 64;
    const h = 128;
    const data = new Uint8Array(w * h * 4);
    for (let y = 0; y < h; y += 1) {
        const t = y / (h - 1);
        for (let x = 0; x < w; x += 1) {
            const i = (y * w + x) * 4;
            const pulse = 0.08 * Math.sin((x / (w - 1)) * Math.PI * 6.0);
            const r = Math.min(1, 0.05 + t * 1.15 + pulse);
            const g = Math.min(1, t * t * 0.85 + pulse * 0.5);
            const b = Math.min(1, (1.0 - t) * 0.45 + t * 0.12 + pulse * 0.2);
            data[i] = Math.floor(r * 255);
            data[i + 1] = Math.floor(g * 255);
            data[i + 2] = Math.floor(b * 255);
            data[i + 3] = 255;
        }
    }
    const tex = new DataTexture(data, w, h, RGBAFormat);
    tex.colorSpace = SRGBColorSpace;
    tex.minFilter = LinearFilter;
    tex.magFilter = LinearFilter;
    tex.wrapS = ClampToEdgeWrapping;
    tex.wrapT = ClampToEdgeWrapping;
    tex.needsUpdate = true;
    return tex;
};

export const getSharedFireRampTexture = (): DataTexture => {
    if (!sharedFireRampTexture) {
        sharedFireRampTexture = createFireRampDataTexture();
    }
    return sharedFireRampTexture;
};

const vertexShader = /* glsl */ `
varying vec2 vLocal;

void main() {
  vLocal = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export interface MatchedCardRimFireUniforms {
    uFireTex: { value: DataTexture };
    uTime: { value: number };
    uIntensity: { value: number };
    uSeed: { value: number };
    uReduceMotion: { value: number };
    uColorMult: { value: Vector3 };
    uMagnitude: { value: number };
    uLacunarity: { value: number };
    uGain: { value: number };
    uNoiseScale: { value: Vector4 };
}

/**
 * Defaults mirror `fire.js` controller: magnitude 1.3, lacunarity 2, gain 0.5,
 * noiseScale (1, 2, 1, 0.3). Base tint leans emerald to match matched-card art direction.
 */
export const createMatchedCardRimFireMaterial = (seed: number): ShaderMaterial => {
    const uniforms: MatchedCardRimFireUniforms = {
        uFireTex: { value: getSharedFireRampTexture() },
        uTime: { value: 0 },
        uIntensity: { value: 0 },
        uSeed: { value: (seed % 1000) * 0.001 },
        uReduceMotion: { value: 0 },
        uColorMult: { value: new Vector3(0.45, 1.0, 0.72) },
        uMagnitude: { value: 1.3 },
        uLacunarity: { value: 2.0 },
        uGain: { value: 0.5 },
        uNoiseScale: { value: new Vector4(1.0, 2.0, 1.0, 0.3) }
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
