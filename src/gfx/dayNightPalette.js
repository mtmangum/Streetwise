// Piecewise-linear interpolation across four named times of day, driven by
// dayPhase (0 = sunny morning, 1 = derelict night). Same technique as
// healthColor.js, just interpolating a whole palette object instead of one
// color. sunY/moonY are plain screen-space Y coordinates - the sun sinks
// toward the horizon and fades as the moon rises and brightens opposite it.
const COLOR_KEYS = ['sky1', 'sky2', 'hillFar', 'hillNear', 'ground', 'cloud'];
const NUMBER_KEYS = ['sunY', 'sunAlpha', 'moonY', 'moonAlpha', 'windowGlow'];

const STOPS = [
  {
    at: 0, // sunny daytime neighborhood - warm brownstone/sandstone
    sky1: 0x4aa3e0,
    sky2: 0xbfe6ff,
    hillFar: 0xc48a68,
    hillNear: 0xa8654d,
    ground: 0xa8a08a,
    cloud: 0xffffff,
    sunY: 55,
    sunAlpha: 1,
    moonY: 250,
    moonAlpha: 0,
    windowGlow: 0
  },
  {
    at: 1 / 3, // afternoon - brownstone deepens as the light warms
    sky1: 0x5f8fc9,
    sky2: 0xf3b46a,
    hillFar: 0xb87a5a,
    hillNear: 0x96583f,
    ground: 0x9a8f74,
    cloud: 0xffe0b0,
    sunY: 100,
    sunAlpha: 1,
    moonY: 200,
    moonAlpha: 0,
    windowGlow: 0
  },
  {
    at: 2 / 3, // dusk - brownstone cooling toward derelict grey
    sky1: 0x3a3f6b,
    sky2: 0xe0703f,
    hillFar: 0x5a4a48,
    hillNear: 0x453836,
    ground: 0x5a5568,
    cloud: 0xc98a7a,
    sunY: 150,
    sunAlpha: 0.5,
    moonY: 90,
    moonAlpha: 0.6,
    windowGlow: 0.5
  },
  {
    at: 1, // derelict night - dark, but still warm-black, not blue-black,
    // so the brownstone material still reads under the moonlight
    sky1: 0x0d1220,
    sky2: 0x1b2540,
    hillFar: 0x23191a,
    hillNear: 0x18100f,
    ground: 0x33313d,
    cloud: 0x5a6478,
    sunY: 190,
    sunAlpha: 0,
    moonY: 50,
    moonAlpha: 1,
    windowGlow: 0.9
  }
];

function toRGB(hex) {
  return { r: (hex >> 16) & 0xff, g: (hex >> 8) & 0xff, b: hex & 0xff };
}

function lerpNum(a, b, t) {
  return a + (b - a) * t;
}

function lerpColor(a, b, t) {
  const ca = toRGB(a);
  const cb = toRGB(b);
  const r = Math.round(lerpNum(ca.r, cb.r, t));
  const g = Math.round(lerpNum(ca.g, cb.g, t));
  const bl = Math.round(lerpNum(ca.b, cb.b, t));
  return (r << 16) | (g << 8) | bl;
}

export function dayNightPalette(phase) {
  const f = Math.min(1, Math.max(0, phase));
  for (let i = 0; i < STOPS.length - 1; i++) {
    const a = STOPS[i];
    const b = STOPS[i + 1];
    if (f >= a.at && f <= b.at) {
      const t = (f - a.at) / (b.at - a.at);
      const result = {};
      for (const k of COLOR_KEYS) result[k] = lerpColor(a[k], b[k], t);
      for (const k of NUMBER_KEYS) result[k] = lerpNum(a[k], b[k], t);
      return result;
    }
  }
  const last = STOPS[STOPS.length - 1];
  const result = {};
  for (const k of COLOR_KEYS) result[k] = last[k];
  for (const k of NUMBER_KEYS) result[k] = last[k];
  return result;
}
