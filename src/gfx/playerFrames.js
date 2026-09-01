// Procedural pixel-art frames for the player character, built the same way
// BootScene generates its other placeholder textures (Graphics -> fillRect
// -> generateTexture), just with more parts and multiple poses so they can
// be strung into idle/walk/jump animations. No external art files needed.
//
// Chibi proportions on purpose: the head block is nearly half the sprite's
// height, which is what reads as "cute early-90s mascot" at this pixel
// density rather than a realistically-proportioned figure.
//
// Everything is defined in a 14x20 "grid unit" coordinate space, then
// scaled up by PLAYER_GRID.pixelSize when drawn.
export const PLAYER_GRID = { cols: 14, rows: 20, pixelSize: 3 };

const PALETTE = {
  hair: 0x6b4226,
  skin: 0xe8b48a,
  dress: 0xe8607e,
  dressShade: 0xc94860,
  shoes: 0x2b2b3d,
  eye: 0x3fa25c
};

// Big bob-cut head (full head block in hair color, with the face inset on
// the front/lower side so a fringe of hair still frames it), neck, bodice,
// and a two-tier flared skirt. These stay put across every standing pose -
// only the arm and feet move, which is enough to sell a walk cycle at this
// size.
const BASE = [
  { x: 2, y: 0, w: 10, h: 9, color: PALETTE.hair },
  { x: 6, y: 2, w: 5, h: 6, color: PALETTE.skin },
  { x: 9, y: 5, w: 1, h: 1, color: PALETTE.eye },
  { x: 6, y: 9, w: 2, h: 1, color: PALETTE.skin },
  { x: 4, y: 10, w: 6, h: 3, color: PALETTE.dress },
  { x: 3, y: 13, w: 8, h: 2, color: PALETTE.dress },
  { x: 1, y: 15, w: 12, h: 2, color: PALETTE.dressShade }
];

function arm(x, y) {
  return { x, y, w: 2, h: 3, color: PALETTE.skin };
}

function shoe(x, y) {
  return { x, y, w: 2, h: 2, color: PALETTE.shoes };
}

// Two-pose "scissor" stride (apart / passing) alternated with a mirror of
// itself - the same trick classic small-sprite run cycles use to fake a
// 4-frame gait out of two leg silhouettes.
const POSES = {
  idle0: [arm(10, 11), shoe(4, 17), shoe(8, 17)],
  idle1: [arm(10, 10), shoe(4, 17), shoe(8, 17)],
  walk0: [arm(10, 10), shoe(2, 17), shoe(9, 18)],
  walk1: [arm(10, 11), shoe(5, 17), shoe(7, 17)],
  walk2: [arm(10, 12), shoe(9, 18), shoe(2, 17)],
  walk3: [arm(10, 11), shoe(5, 17), shoe(7, 17)],
  jump0: [arm(10, 8), shoe(4, 16), shoe(8, 16)],
  // Off-balance: both arms flailing, feet splayed wide and uneven. Used
  // both upright (the instant-of-impact reaction) and rotated via tween
  // for the "knocked down" pose - see Player.stumble()/fallDown().
  stumble: [
    { x: 1, y: 9, w: 2, h: 3, color: PALETTE.skin },
    { x: 11, y: 12, w: 2, h: 3, color: PALETTE.skin },
    shoe(0, 17),
    shoe(11, 18)
  ]
};

export const PLAYER_POSES = Object.keys(POSES);

export function playerFrameParts(pose) {
  return [...BASE, ...POSES[pose]];
}
