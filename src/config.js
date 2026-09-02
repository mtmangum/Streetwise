export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 360;
export const RENDER_SCALE = 2;
export const BUILD_NUMBER = '00.03';

export const GROUND_HEIGHT = 60;
export const GROUND_Y = GAME_HEIGHT - GROUND_HEIGHT;

export const PLAYER = {
  startX: 170,
  gravity: 1400,
  jumpVelocity: -560,
  powerJumpVelocity: -720,
  doubleTapWindowMs: 320,
  powerJumpRecoveryMs: 3500,
  jumpBufferMs: 120,
  coyoteTimeMs: 80,
  runSpeed: 0 // player stays put on screen; world scrolls under it
};

// Companion greyhound. Neither she nor the dog ever move horizontally (the
// world scrolls under them both, like PLAYER above) - "trailing behind" is
// just a fixed x offset, not a chase; only the jump arc actually moves.
export const DOG = {
  trailDistance: 130,
  displayScale: 1.25,
  // The delay before the dog echoes a jump is NOT this fixed number - it's
  // computed as trailDistance / current scroll speed (how long the same
  // obstacle takes to travel from the player's x to the dog's, since both
  // are screen-fixed and the world scrolls under them). This is just a
  // small extra beat of "reaction lag" added on top of that, for
  // personality - see PlayScene.handleInput(). A fixed delay alone jumped
  // the dog too early at low speed and too late at high speed.
  jumpReactionMs: 50,
  jumpDurationMs: 540,
  jumpForwardDistance: 62,
  landingRecoveryMs: 420,
  // Tall obstacles reach ~65px; the player's real jump apex (from
  // PLAYER.gravity/jumpVelocity) is ~112px. This needs real clearance
  // margin, not just a stylized hop - it was 46 and visibly clipped tall
  // obstacles.
  jumpHeight: 100
};

export const WORLD = {
  baseScrollSpeed: 185,
  maxScrollSpeed: 340,
  jumpClearSlowdown: 0.07,
  minimumMomentum: 0.8,
  momentumRecoveryPerSecond: 0.045,
  // Reach maximum speed near the end of the day/night transition rather
  // than spiking at the one-minute mark.
  rampSeconds: 90
};

// Obstacle cadence alternates between normal beats, short playable clusters,
// and deliberate lulls so the run has phrasing instead of a metronomic spawn.
export const SPAWN_RHYTHM = {
  easyStartSeconds: 20,
  easyGapMinMs: 4000,
  easyGapMaxMs: 5500,
  clusterChance: 0.28,
  lullChance: 0.22,
  clusterExtraMin: 1,
  clusterExtraMax: 2,
  clusterGapMinMs: 780,
  clusterGapMaxMs: 1020,
  postClusterRestMinMs: 2200,
  postClusterRestMaxMs: 3200,
  lullMinMs: 2800,
  lullMaxMs: 4300,
  steadyMinMs: 1250,
  steadyMaxMs: 1900
};

// One full day -> night arc per run. dayPhase (0-1) drives everything in
// src/gfx/dayNightPalette.js - sky/hill/ground color, sun/moon position -
// plus which obstacle types are in rotation (see Obstacle.js). Phase
// clamps at 1 (stays night) rather than looping; a restart resets to day.
export const DAY_CYCLE = {
  durationSeconds: 90
};

export const STORM = {
  startSeconds: 105,
  endSeconds: 135,
  rainDropCount: 44,
  lightningMinMs: 4200,
  lightningMaxMs: 8500
};

export const DAWN = {
  startSeconds: 135,
  durationSeconds: 45
};

export const COLORS = {
  // Daytime obstacles
  coneOrange: 0xe0752f,
  coneBase: 0x3a3a3a,
  mailboxBody: 0x3a5fa0,
  mailboxFlag: 0xe0e0e0,
  mailboxPost: 0x5a5a5a,
  childBody: 0x5a8fc9,
  trashBin: 0x4a8f5a,
  trashBinDark: 0x35703f,
  obstacleCrate: 0x8a5a2b,
  obstacleCrateDark: 0x6e4520,
  obstacleCrateLight: 0xa9773f,
  // Nighttime obstacles
  catBody: 0x4a4852,
  catEye: 0xd9e04a,
  trashCan: 0x5c574d,
  trashCanDark: 0x413d36,
  flameOuter: 0xe0752f,
  flameInner: 0xf2c14e,
  sleepingBody: 0x2e2e38,
  boomboxBody: 0x3a3a42,
  boomboxDark: 0x1e1e24,
  boomboxLight: 0x8a93a8,
  // Sky
  sun: 0xf2c14e,
  sunCore: 0xfbe08a,
  moon: 0xe3e8f2,
  moonCrater: 0xc7cede
};

// Depth-of-field scenery behind the ground - each layer scrolls at a
// fraction of the world scroll speed to fake parallax distance.
export const PARALLAX = {
  sun: { x: GAME_WIDTH - 90, y: 55, radius: 26, coreRadius: 14 },
  // Near brownstones reach ~2/3 up the screen (240 of 360) - widened along
  // with the height bump so individual buildings don't end up needle-thin.
  // Long strips keep individual brownstone combinations from visibly
  // repeating every couple of houses.
  skyline: { tileWidth: 960, height: 145, speedFactor: 0.07 },
  hillsFar: { tileWidth: 720, height: 190, speedFactor: 0.15 },
  hillsNear: { tileWidth: 640, height: 240, speedFactor: 0.35 },
  pedestrians: { tileWidth: 1000, height: 58, speedFactor: 0.43 },
  parkedCars: { tileWidth: 1200, height: 48, speedFactor: 0.52 },
  clouds: { tileWidth: 220, height: 50, y: 24, speedFactor: 0.08 }
};

// The health bar replaces the old numeric score: it grows (and shifts
// red -> orange -> yellow -> green) each time an obstacle is avoided, and
// shrinks back toward red on every hit. Empty bar ends the run. Runs start
// at full health rather than building up from empty. Health can keep
// growing past `max` up to `overchargeMax` - that extra stretch of bar
// renders in a distinct sparking neon-green (see PlayScene.updateHealthBar)
// rather than continuing the normal color ramp, which tops out at green.
export const HEALTH = {
  max: 100,
  overchargeMax: 160,
  start: 100,
  gainPerAvoid: 8,
  pigeonBoost: 35,
  drainPerSecond: 1,
  lossPerHit: 30,
  crowLossPerHit: 70,
  invulnerabilityMs: 900
};
