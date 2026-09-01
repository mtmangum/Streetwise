export const GAME_WIDTH = 800;
export const GAME_HEIGHT = 360;

export const GROUND_HEIGHT = 60;
export const GROUND_Y = GAME_HEIGHT - GROUND_HEIGHT;

export const PLAYER = {
  startX: 100,
  gravity: 1400,
  jumpVelocity: -560,
  runSpeed: 0 // player stays put on screen; world scrolls under it
};

export const WORLD = {
  baseScrollSpeed: 260,
  maxScrollSpeed: 520,
  rampSeconds: 60 // seconds to go from base to max speed
};

export const COLORS = {
  sky1: 0x3a4a63,
  sky2: 0x1b1f27,
  ground: 0x5a6b85,
  obstacle: 0xe0554f,
  obstacleCrate: 0x8a5a2b,
  obstacleCrateDark: 0x6e4520,
  obstacleCrateLight: 0xa9773f,
  obstacleBarrel: 0x6b7280,
  obstacleBarrelDark: 0x4b5563,
  obstacleBarrelLight: 0x9aa3af,
  hillFar: 0x2a3350,
  hillNear: 0x38466e,
  cloud: 0xc7cfe0,
  sun: 0xf2c14e,
  sunCore: 0xfbe08a
};

// Depth-of-field scenery behind the ground - each layer scrolls at a
// fraction of the world scroll speed to fake parallax distance.
export const PARALLAX = {
  sun: { x: GAME_WIDTH - 90, y: 55, radius: 26, coreRadius: 14 },
  hillsFar: { tileWidth: 90, height: 70, speedFactor: 0.15 },
  hillsNear: { tileWidth: 70, height: 46, speedFactor: 0.35 },
  clouds: { tileWidth: 220, height: 50, y: 24, speedFactor: 0.08 }
};

// The health bar replaces the old numeric score: it grows (and shifts
// red -> orange -> yellow -> green) each time an obstacle is avoided, and
// shrinks back toward red on every hit. Empty bar ends the run.
export const HEALTH = {
  max: 100,
  start: 20,
  gainPerAvoid: 8,
  lossPerHit: 30
};
