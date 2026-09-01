// Piecewise-linear color ramp for the health bar: red (empty) -> orange ->
// yellow -> green (full). Kept dependency-free rather than reaching for
// Phaser's color interpolation utilities for three lines of math.
const STOPS = [
  { at: 0, color: 0xd94f3d },
  { at: 1 / 3, color: 0xe08a3f },
  { at: 2 / 3, color: 0xe0c93f },
  { at: 1, color: 0x4fae62 }
];

function toRGB(hex) {
  return { r: (hex >> 16) & 0xff, g: (hex >> 8) & 0xff, b: hex & 0xff };
}

function lerp(a, b, t) {
  return Math.round(a + (b - a) * t);
}

// Health past `max` (see HEALTH.overchargeMax in config.js) renders in this
// fixed neon green rather than continuing the ramp above, which already
// tops out at green at fraction 1 - overcharge needs to read as visibly
// distinct, not just "still green".
export const OVERCHARGE_COLOR = 0x39ff6a;

export function healthBarColor(fraction) {
  const f = Math.min(1, Math.max(0, fraction));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (f >= a.at && f <= b.at) {
      const t = (f - a.at) / (b.at - a.at);
      const rgbA = toRGB(a.color);
      const rgbB = toRGB(b.color);
      return (lerp(rgbA.r, rgbB.r, t) << 16) | (lerp(rgbA.g, rgbB.g, t) << 8) | lerp(rgbA.b, rgbB.b, t);
    }
  }
  return STOPS[STOPS.length - 1].color;
}
