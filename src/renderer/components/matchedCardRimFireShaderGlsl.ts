/**
 * Purpose-built matched-card ember rim shader.
 *
 * The effect is driven from rounded-rect edge distance, not a sampled fire volume,
 * so the read stays attached to the card silhouette and corners.
 */

export const MATCHED_RIM_FIRE_FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uSeed;
uniform float uIntensity;
uniform float uBurst;
uniform float uMotion;
uniform float uSoftness;
uniform float uInnerWidth;
uniform float uOuterWidth;
uniform float uEmberStrength;
uniform vec2 uOuterHalfSize;
uniform vec2 uInnerHalfSize;
uniform float uOuterCorner;
uniform float uInnerCorner;
uniform vec3 uCoreColor;
uniform vec3 uGlowColor;
uniform vec3 uEmberColor;

varying vec2 vLocal;

float sdRoundedRect(vec2 p, vec2 halfSize, float radius) {
  vec2 q = abs(p) - halfSize + vec2(radius);
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float hash21(vec2 p) {
  p = fract(p * vec2(123.34, 456.21));
  p += dot(p, p + 45.32);
  return fract(p.x * p.y);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  float a = hash21(i);
  float b = hash21(i + vec2(1.0, 0.0));
  float c = hash21(i + vec2(0.0, 1.0));
  float d = hash21(i + vec2(1.0, 1.0));
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float fbm(vec2 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 4; i++) {
    value += noise(p) * amplitude;
    p = p * 2.03 + vec2(17.0, 11.0);
    amplitude *= 0.5;
  }
  return value;
}

void main() {
  float outerSdf = sdRoundedRect(vLocal, uOuterHalfSize, uOuterCorner);
  float innerSdf = sdRoundedRect(vLocal, uInnerHalfSize, uInnerCorner);

  float softness = max(0.0015, uSoftness);
  float outerMask = 1.0 - smoothstep(-softness, softness, outerSdf);
  float innerMask = smoothstep(-softness, softness, innerSdf);
  float ringMask = outerMask * innerMask;
  if (ringMask < 0.002) {
    discard;
  }

  float innerGap = max(innerSdf, 0.0);
  float outerGap = max(-outerSdf, 0.0);
  float bandT = clamp(innerGap / max(innerGap + outerGap, 0.0001), 0.0, 1.0);
  float centerBand = 1.0 - abs(bandT * 2.0 - 1.0);

  vec2 outerNorm = vLocal / max(uOuterHalfSize, vec2(0.0001));
  float cornerness = smoothstep(0.42, 0.92, min(abs(outerNorm.x), abs(outerNorm.y)));
  float phase = atan(outerNorm.y, outerNorm.x);

  float motionTime = uTime * mix(0.12, 1.0, uMotion);
  vec2 emberUv = vec2(phase * 2.6 + uSeed * 17.0, bandT * 5.2 - motionTime * 2.25);
  float emberNoise = fbm(emberUv + vec2(0.0, fbm(vec2(phase * 1.4 - motionTime * 0.6, bandT * 2.6 + uSeed * 13.0)) * 0.65));
  float emberTravel = 0.5 + 0.5 * sin(phase * 8.0 - motionTime * (2.3 + uMotion * 2.0) + uSeed * 31.0);
  float cornerSpark = cornerness * pow(clamp(noise(vec2(phase * 5.2 + uSeed * 47.0 - motionTime * 3.0, bandT * 9.0)), 0.0, 1.0), 3.4);
  float innerSpark = pow(clamp(noise(vec2(phase * 7.0 + uSeed * 23.0, motionTime * 1.1 + bandT * 6.0)), 0.0, 1.0), 4.5);

  float coreWidth = max(0.04, uInnerWidth + uBurst * 0.075);
  float outerStart = clamp(1.0 - (uOuterWidth + uBurst * 0.12), 0.18, 0.9);

  float core = (1.0 - smoothstep(0.02, coreWidth, bandT)) * (0.9 + 0.1 * (1.0 - bandT));
  float glow = smoothstep(0.0, 0.34 + uBurst * 0.12, centerBand) * (0.45 + 0.18 * cornerness);
  float ember = smoothstep(outerStart, 1.0, bandT) *
    pow(clamp(emberNoise * 0.82 + emberTravel * 0.34 + cornerSpark * 0.72, 0.0, 1.0), mix(2.25, 1.35, uBurst)) *
    (0.3 + 0.44 * uEmberStrength) *
    (0.78 + 0.34 * cornerness);
  float innerAccent = smoothstep(0.0, coreWidth * 0.9, bandT) * innerSpark * 0.18;

  vec3 color = uCoreColor * (core + innerAccent) + uGlowColor * glow + uEmberColor * ember;
  float alpha = ringMask * uIntensity * (core * 0.94 + glow * 0.34 + ember);
  alpha *= 0.88 + uBurst * 0.34;
  alpha = clamp(alpha, 0.0, 1.0);
  if (alpha < 0.01) {
    discard;
  }

  gl_FragColor = vec4(color, alpha);
}
`;
