/**
 * Fragment shader body derived from mattatz / THREE.Fire `FireShader.js` (MIT-style, widely forked):
 * https://github.com/mattatz/THREE.Fire/blob/master/FireShader.js
 *
 * We do **not** ray march the box (`ITERATIONS` loop) — one `samplerFire()` sample per fragment.
 * **Silhouette** comes from the mesh: `createRoundedRectBezelRingGeometry` (same rim as resolving chrome),
 * not a full quad + SDF mask — so fire reads as the card edge, not a separate layer.
 * Uniforms match the example `dat.gui` defaults (`fire.js`).
 */

export const MATCHED_RIM_FIRE_FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform sampler2D uFireTex;
uniform float uTime;
uniform float uSeed;
uniform float uIntensity;
uniform float uReduceMotion;
uniform vec3 uColorMult;
uniform float uMagnitude;
uniform float uLacunarity;
uniform float uGain;
uniform vec4 uNoiseScale;

varying vec2 vLocal;

vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
  return mod289(((x * 34.0) + 1.0) * x);
}

vec4 taylorInvSqrt(vec4 r) {
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(i.z + vec4(0.0, i1.z, i2.z, 1.0)) + i.y + vec4(0.0, i1.y, i2.y, 1.0)) + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float turbulence(vec3 p) {
  float sum = 0.0;
  float freq = 1.0;
  float amp = 1.0;
  for (int i = 0; i < 3; i++) {
    sum += abs(snoise(p * freq)) * amp;
    freq *= uLacunarity;
    amp *= uGain;
  }
  return sum;
}

vec4 samplerFire(vec3 p, vec4 scale, float time, float seed) {
  vec2 st = vec2(sqrt(dot(p.xz, p.xz)), p.y);
  if (st.x <= 0.0 || st.x >= 1.0 || st.y <= 0.0 || st.y >= 1.0) {
    return vec4(0.0);
  }
  p.y -= (seed + time) * scale.w;
  p *= scale.xyz;
  st.y += sqrt(max(st.y, 0.0001)) * uMagnitude * turbulence(p);
  if (st.y <= 0.0 || st.y >= 1.0) {
    return vec4(0.0);
  }
  vec4 texel = texture2D(uFireTex, st);
  texel.a = texel.r;
  return texel;
}

void main() {
  vec2 p2 = vLocal;

  float t = uTime * (0.55 + (1.0 - uReduceMotion) * 1.15);
  float seed = uSeed * 19.19;

  vec3 pFire = vec3(p2.x * 1.85, 0.38, p2.y * 1.85);
  vec4 samp = samplerFire(pFire, uNoiseScale, t, seed);
  vec3 col = samp.rgb * uColorMult;
  float flicker = 0.5 + 0.5 * samp.a;
  float alpha = uIntensity * flicker * samp.a;
  if (alpha < 0.006) discard;
  gl_FragColor = vec4(col, alpha);
}
`;
