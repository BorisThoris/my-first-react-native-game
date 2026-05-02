export const BOARD_RUNE_FIELD_FRAGMENT_SHADER = /* glsl */ `
precision highp float;

uniform float uTime;
uniform float uIntensity;
uniform float uMotion;
uniform vec3 uGoldColor;
uniform vec3 uCyanColor;
uniform vec2 uGrid;

varying vec2 vUv;

float hash21(vec2 p) {
  p = fract(p * vec2(234.34, 435.21));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}

float lineGrid(vec2 p, float width) {
  vec2 g = abs(fract(p) - 0.5);
  float l = min(g.x, g.y);
  return 1.0 - smoothstep(width, width + 0.012, l);
}

float ring(vec2 p, float radius, float width) {
  return 1.0 - smoothstep(width, width + 0.018, abs(length(p) - radius));
}

void main() {
  float intensity = clamp(uIntensity, 0.0, 1.4);
  if (intensity <= 0.001) {
    discard;
  }

  vec2 centered = vUv * 2.0 - 1.0;
  float aspect = max(uGrid.x / max(uGrid.y, 0.001), 0.001);
  centered.x *= aspect;
  float motion = clamp(uMotion, 0.0, 1.3);
  float t = uTime * mix(0.035, 0.42, motion);

  vec2 gridUv = centered * vec2(3.2, 2.4) + vec2(t * 0.08, -t * 0.05);
  float grid = lineGrid(gridUv, 0.022);
  float coarse = lineGrid(centered * vec2(1.45, 1.1) + vec2(-t * 0.04, t * 0.06), 0.018);
  float r1 = ring(centered, 0.72 + sin(t + 1.7) * 0.018, 0.018);
  float r2 = ring(centered * vec2(1.0, 1.22), 0.42 + cos(t * 1.2) * 0.012, 0.014);
  float diagonals = 1.0 - smoothstep(0.018, 0.045, min(abs(centered.x + centered.y * 0.66), abs(centered.x - centered.y * 0.66)));
  float runes = 0.0;
  vec2 cell = floor((vUv + vec2(t * 0.014, -t * 0.01)) * vec2(9.0, 5.0));
  float h = hash21(cell);
  runes = step(0.77, h) * lineGrid(fract(vUv * vec2(9.0, 5.0)) * 2.0 - 0.5, 0.032);

  float vignette = smoothstep(1.15, 0.18, length(centered * vec2(0.88, 1.12)));
  float pulse = 0.76 + 0.24 * sin(t * 3.1);
  float mask = (grid * 0.22 + coarse * 0.18 + r1 * 0.5 + r2 * 0.38 + diagonals * 0.12 + runes * 0.34) * vignette;
  vec3 color = mix(uCyanColor, uGoldColor, 0.44 + 0.32 * sin(centered.x * 2.4 + t));
  float alpha = clamp(mask * intensity * pulse, 0.0, 0.42);
  if (alpha < 0.006) {
    discard;
  }

  gl_FragColor = vec4(color, alpha);
}
`;
