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
  obstacle: 0xe0554f
};
