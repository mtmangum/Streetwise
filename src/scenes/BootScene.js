import Phaser from 'phaser';
import { COLORS, PARALLAX } from '../config.js';
import { PLAYER_GRID, PLAYER_POSES, playerFrameParts } from '../gfx/playerFrames.js';
import { DOG_GRID, DOG_POSES, dogFrameParts } from '../gfx/dogFrames.js';

// Placeholder/procedural art generated at runtime - no external art files
// to load. Swap this for real spritesheet loading (this.load.spritesheet)
// once art is ready; Player.js only cares about the anim/texture keys it
// plays, not how they were produced.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.generatePlayerFrames();
    this.generateDogFrames();
    this.generateObstacleTextures();
    this.generateGroundTexture();
    this.generateParallaxTextures();
  }

  generatePlayerFrames() {
    for (const pose of PLAYER_POSES) {
      this.drawGridFrame(pose, `player-${pose}`, PLAYER_GRID, playerFrameParts);
    }
  }

  generateDogFrames() {
    for (const pose of DOG_POSES) {
      this.drawGridFrame(pose, `dog-${pose}`, DOG_GRID, dogFrameParts);
    }
  }

  drawGridFrame(pose, key, grid, frameParts) {
    const { pixelSize, cols, rows } = grid;
    const g = this.add.graphics();
    for (const part of frameParts(pose)) {
      g.fillStyle(part.color, 1);
      g.fillRect(part.x * pixelSize, part.y * pixelSize, part.w * pixelSize, part.h * pixelSize);
    }
    g.generateTexture(key, cols * pixelSize, rows * pixelSize);
    g.destroy();
  }

  generateObstacleTextures() {
    this.drawMailboxObstacle('obstacle-mailbox');
    this.drawConeObstacle('obstacle-cone');
    this.drawChildObstacle('obstacle-child0', false);
    this.drawChildObstacle('obstacle-child1', true);
    this.drawTrashBinObstacle('obstacle-trashbin');
    this.drawCrateObstacle('obstacle-crate');
    this.drawCatObstacle('obstacle-cat0', false);
    this.drawCatObstacle('obstacle-cat1', true);
    this.drawTrashFireObstacle('obstacle-trashfire0', false);
    this.drawTrashFireObstacle('obstacle-trashfire1', true);
    this.drawSleepingObstacle('obstacle-sleeping');
    this.drawBoomboxObstacle('obstacle-boombox');
  }

  // Obstacles use a 2x logical-pixel grid, matching the denser character
  // sprites. Parts are deliberately rectilinear so curves and diagonals keep
  // the stepped silhouette of late 16-bit console art.
  drawObstacleTexture(key, width, height, parts) {
    const g = this.add.graphics();
    for (const [x, y, w, h, color] of parts) {
      g.fillStyle(color, 1);
      g.fillRect(x * 2, y * 2, w * 2, h * 2);
    }
    g.generateTexture(key, width * 2, height * 2);
    g.destroy();
  }

  drawMailboxObstacle(key) {
    // NYC-style sidewalk collection box: domed cap, deep pull-down mail
    // opening, slab-sided body and four raised legs. Fine scuffs/stickers
    // break up the blue at gameplay scale without becoming visual noise.
    const O=0x111a2a,D=0x17365f,M=0x24558a,L=0x4f7ead,HI=0x79a2c7,S=0xd8dde0,P=0x728294;
    this.drawObstacleTexture(key,22,34,[
      // Stepped arch and heavy outer shell.
      [4,1,14,2,O],[2,3,18,4,O],[1,6,20,20,O],
      [4,2,14,2,M],[3,4,16,3,M],[2,7,18,18,M],
      [3,6,2,18,L],[17,5,2,20,D],[5,3,10,1,L],[6,2,8,1,HI],
      // Recessed collection opening and projecting pull-down lip.
      [4,7,14,7,O],[5,8,12,4,0x0a111d],[6,8,10,1,0x26384e],
      [4,12,14,4,D],[5,12,12,2,L],[6,14,10,1,O],[8,13,6,1,HI],
      // Lower cabinet seam, notices, scratched-in marks and handle dots.
      [2,17,18,2,D],[3,17,16,1,L],[5,20,5,6,S],[6,21,3,1,0x334c67],
      [6,23,2,1,0x334c67],[8,24,1,1,0x334c67],[13,20,1,1,HI],
      [12,22,4,1,HI],[13,24,3,1,HI],[11,25,1,1,HI],[16,18,1,1,O],
      // Four narrow legs and blocky sidewalk feet.
      [2,25,4,8,O],[3,25,2,7,D],[16,25,4,8,O],[17,25,2,7,D],
      [4,26,2,6,M],[16,26,2,6,M],[1,32,6,2,O],[15,32,6,2,O],
      [2,32,4,1,P],[16,32,4,1,P]
    ]);
  }

  // Traffic cone: same silhouette as the old obstacle-spike, re-themed with
  // an orange body, white reflective band, and a dark base.
  drawConeObstacle(key) {
    const O=0x392626,D=0xb94d24,M=COLORS.coneOrange,L=0xf19a4b,W=0xf1e8d7;
    this.drawObstacleTexture(key,18,30,[
      [8,2,3,2,O],[7,4,5,5,O],[6,9,7,6,O],[5,15,9,7,O],[4,22,11,4,O],
      [8,4,2,5,L],[8,5,3,4,M],[7,9,5,6,M],[6,15,7,7,M],[5,22,9,3,D],
      [7,12,5,3,W],[7,15,6,1,0xd1c6b6],[2,25,15,4,O],[3,25,13,2,COLORS.coneBase],[1,28,17,2,O],[4,27,11,1,0x62616a]
    ]);
  }

  // Child sitting and playing on the sidewalk. Deliberately abstract - a
  // flat two-block silhouette with no facial/clothing detail, same register
  // as a pedestrian road-sign icon rather than a caricature.
  drawChildObstacle(key, airborne) {
    const O=0x29243a,SK=0xc77d68,S=0xf0ad8e,HD=0x523029,H=0x7b4932,SH=0xe0c9a9,B=COLORS.childBody,BD=0x365f99,ROPE=0xf0c84b;
    const bodyY=airborne?7:6;
    const feetY=airborne?22:24;
    const rope=airborne
      ? [[2,10,1,10,ROPE],[27,10,1,10,ROPE],[3,19,3,1,ROPE],[24,19,3,1,ROPE],[6,20,18,1,ROPE]]
      : [[2,8,1,12,ROPE],[27,8,1,12,ROPE],[3,6,1,3,ROPE],[26,6,1,3,ROPE],[4,4,22,1,ROPE],[5,3,20,1,ROPE]];
    this.drawObstacleTexture(key,30,28,[
      ...rope,
      // Hair, face and animated ponytail.
      [10,bodyY-5,10,2,O],[8,bodyY-3,13,8,O],[9,bodyY-4,10,4,H],[8,bodyY-2,3,6,HD],[18,bodyY-3,3,7,HD],
      [11,bodyY,8,5,S],[12,bodyY,5,2,0xf7c5a8],[17,bodyY+2,1,1,O],[18,bodyY+4,2,1,SK],
      ...(airborne?[[6,bodyY-3,4,2,O],[4,bodyY-4,3,2,H]]:[[6,bodyY-2,4,2,O],[4,bodyY-1,3,2,H]]),
      // Shirt, shorts and hands holding the rope wide.
      [9,bodyY+5,11,9,O],[10,bodyY+5,9,8,B],[11,bodyY+6,3,6,0x79aee0],
      [5,bodyY+6,5,3,O],[4,bodyY+7,3,3,S],[20,bodyY+6,5,3,O],[23,bodyY+7,3,3,S],
      [9,bodyY+12,11,3,O],[10,bodyY+12,9,2,BD],
      // Feet separate on landing and tuck together in the airborne frame.
      ...(airborne
        ? [[11,bodyY+14,3,4,O],[16,bodyY+14,3,4,O],[10,feetY,5,2,O],[16,feetY,5,2,O],[11,feetY,4,1,SH],[17,feetY,3,1,SH]]
        : [[10,bodyY+14,3,5,O],[17,bodyY+14,3,5,O],[8,feetY,6,2,O],[16,feetY,6,2,O],[9,feetY,4,1,SH],[17,feetY,4,1,SH]])
    ]);
  }

  // Ordinary (unlit) trash bin - the daytime counterpart to
  // obstacle-trashfire, same rounded-can shape in a cleaner color.
  drawTrashBinObstacle(key) {
    // Municipal sidewalk basket: wide rolled rim, circular deposit opening,
    // black inner liner and repeating powder-coated steel slats.
    const O=0x101216,DEEP=0x06070a,D=0x22252a,M=0x3c4045,L=0x656a70,HI=0xa4a9ae,EDGE=0xd0d3d5;
    this.drawObstacleTexture(key,30,36,[
      // Back half of the rolled elliptical rim and rear slats visible through it.
      [6,1,18,1,O],[3,2,24,1,O],[1,3,28,4,O],[3,2,24,1,HI],
      [3,3,24,2,L],[5,4,20,2,M],[6,5,3,5,D],[12,4,3,6,D],[18,4,3,6,D],[24,5,2,5,D],
      // Thick top plate and stepped oval deposit opening.
      [1,6,28,5,O],[2,6,26,2,HI],[3,8,24,3,M],
      [7,6,16,1,O],[5,7,20,2,O],[7,9,16,2,DEEP],[9,8,12,2,DEEP],
      [6,9,18,1,L],[8,10,14,1,D],
      // Cylindrical dark liner tapers subtly toward the base.
      [3,11,24,21,O],[4,11,22,20,DEEP],[5,12,20,19,D],
      // Six dimensional steel slats. Outer strips shorten to imply curvature.
      [3,11,3,19,O],[4,12,2,17,M],[5,12,1,16,L],
      [7,10,4,22,O],[8,11,3,20,M],[10,11,1,19,HI],
      [12,10,4,23,O],[13,11,3,21,M],[15,11,1,20,L],
      [17,10,4,23,O],[18,11,3,21,M],[20,11,1,20,L],
      [22,10,4,22,O],[23,11,3,20,M],[25,12,1,18,HI],
      [27,12,2,18,O],[27,13,1,16,M],
      // Retaining belt wraps across the slats with bright left-edge wear.
      [2,11,26,4,O],[3,11,24,1,EDGE],[3,12,24,2,M],[4,12,1,2,HI],
      // Heavy rolled base, stepped to keep the can visibly cylindrical.
      [2,30,26,4,O],[3,30,24,1,HI],[4,31,22,2,M],[5,33,20,2,D],
      [7,35,16,1,O],[4,34,22,1,L],
      // Small municipal inventory plate.
      [13,16,4,4,O],[14,16,3,3,HI],[14,17,2,2,D]
    ]);
  }

  drawCrateObstacle(key) {
    const O=0x3b261b,D=COLORS.obstacleCrateDark,M=COLORS.obstacleCrate,L=COLORS.obstacleCrateLight,HI=0xc78a4d;
    this.drawObstacleTexture(key,26,26,[
      [1,1,24,24,O],[3,3,20,20,M],[4,4,18,3,L],[4,19,18,3,D],
      [3,3,4,20,D],[19,3,4,20,L],[6,7,4,3,HI],[15,16,4,3,D],
      [6,7,3,3,O],[17,7,3,3,O],[10,10,6,6,O],[11,11,4,4,0xc99852],
      [7,8,13,3,D],[9,10,3,8,D],[16,8,3,12,L],[7,17,12,3,D],
      [0,23,26,3,O],[2,23,22,1,L],[5,24,4,1,0x211713],[18,24,3,1,0x211713]
    ]);
  }

  // Angry cat: arched back, tail straight up, slanted brows over narrow
  // glowing eyes, bared fangs. Sized up from the original startled-cat
  // design - see minHeight/maxHeight for 'obstacle-cat' in Obstacle.js.
  drawCatObstacle(key, hiss) {
    const O=0x1d1b25,D=0x34323e,M=COLORS.catBody,L=0x716d7b,E=COLORS.catEye,W=0xf1e7d8;
    const tail=hiss?[[25,2,3,12,O],[24,3,2,10,M],[22,1,4,3,O]]:[[25,5,3,13,O],[24,6,2,11,M],[22,3,4,4,O]];
    this.drawObstacleTexture(key,30,27,[...tail,
      [4,15,20,9,O],[7,11,13,6,O],[8,10,11,5,M],[5,16,18,7,M],[6,16,6,2,L],[18,18,5,5,D],
      [8,4,13,9,O],[9,2,4,4,O],[17,2,4,4,O],[9,5,11,7,M],[10,5,3,2,L],
      [11,7,3,2,O],[17,7,3,2,O],[12,8,2,1,E],[17,8,2,1,E],[14,10,3,1,O],[13,11,2,2,W],[17,11,2,2,W],
      [4,22,6,4,O],[18,22,7,4,O],[5,22,5,2,D],[19,22,5,2,D],
      ...(hiss?[[1,9,5,1,L],[2,12,5,1,L],[21,9,5,1,L],[21,12,6,1,L]]:[])
    ]);
  }

  // Burning trash can: a battered, banded barrel beneath a two-frame,
  // three-color flame. Alternating silhouettes provide a lively flicker.
  drawTrashFireObstacle(key, flip) {
    const O=0x26242a,D=COLORS.trashCanDark,M=COLORS.trashCan,L=0x858074,F=COLORS.flameOuter,Y=COLORS.flameInner,H=0xfff0a1;
    const flame=flip?[[6,2,5,8,F],[11,5,7,8,F],[15,1,4,9,F],[8,8,10,8,F],[10,7,6,8,Y],[12,9,3,6,H]]:[[5,5,6,8,F],[9,1,5,12,F],[14,4,5,10,F],[7,9,11,7,F],[9,7,7,9,Y],[11,9,3,6,H]];
    this.drawObstacleTexture(key,24,32,[...flame,
      [2,14,20,4,O],[4,17,16,14,O],[3,15,18,2,L],[5,17,14,12,M],[6,18,3,10,L],[16,18,3,10,D],
      [5,20,14,2,D],[5,25,14,2,D],[7,21,1,4,0x999184],[11,18,2,11,0x4c4843],[4,29,16,3,O],[6,29,12,1,L]
    ]);
  }

  // Prone figure on the ground - the "urban derelict" night hazard. Drawn
  // as a flat, low solid-color mound (no facial detail, no explicit death
  // iconography - no blood, no X-eyes) rather than anything graphic; reads
  // as "a collapsed/sleeping shape," same register as a pedestrian
  // road-sign icon, not a caricature.
  drawSleepingObstacle(key) {
    const O=0x171822,D=COLORS.sleepingBody,M=0x464858,L=0x686b7d,SK=0xa86f61,S=0xd99a82,SH=0x3c3445;
    this.drawObstacleTexture(key,42,15,[
      [1,7,10,7,O],[3,5,7,3,O],[4,6,6,5,S],[3,8,3,4,SK],[7,7,2,1,SH],
      [9,8,23,6,O],[10,7,18,6,M],[11,7,8,2,L],[25,9,10,5,D],[30,10,10,4,O],
      [33,9,8,3,SH],[31,12,11,3,O],[32,12,9,1,0x6c5d62],[8,12,24,3,O],[12,12,13,1,D],
      [0,14,42,1,0x12131a]
    ]);
  }

  // Boombox: classic 90s two-speaker stereo with a carry handle.
  drawBoomboxObstacle(key) {
    const O=0x15151c,D=COLORS.boomboxDark,M=COLORS.boomboxBody,L=COLORS.boomboxLight,HI=0xb8c1d4,R=0xe75656;
    this.drawObstacleTexture(key,38,23,[
      [7,1,24,2,O],[5,3,4,6,O],[29,3,4,6,O],[8,3,22,2,L],[8,5,3,3,D],[27,5,3,3,D],
      [1,7,36,15,O],[3,8,32,13,M],[4,9,30,3,L],[14,9,10,2,D],[15,9,8,1,HI],
      [5,12,10,9,O],[7,13,6,6,D],[8,14,4,4,L],[9,15,2,2,O],
      [23,12,10,9,O],[25,13,6,6,D],[26,14,4,4,L],[27,15,2,2,O],
      [16,13,6,2,D],[17,14,4,1,0x77a6bc],[16,17,2,2,R],[20,17,2,2,0xe0c34d],
      [2,21,5,2,O],[31,21,5,2,O],[3,21,3,1,HI],[32,21,3,1,HI]
    ]);
  }

  // Neutral base (grey body, white highlight band) so it can be recolored
  // across the day/night cycle with a plain tint - see Ground.setTint().
  generateGroundTexture() {
    const g = this.add.graphics();
    g.fillStyle(0xd8d8d8, 1);
    g.fillRect(0, 0, 64, 16);
    g.fillStyle(0xffffff, 1);
    g.fillRect(0, 0, 64, 2);
    g.fillStyle(0xb0b0b0, 1);
    g.fillRect(0, 3, 64, 2);
    g.fillStyle(0x8e8e8e, 1);
    g.fillRect(14, 8, 10, 1);
    g.fillRect(22, 9, 7, 1);
    g.fillRect(46, 12, 8, 1);
    g.fillRect(53, 11, 4, 1);
    g.fillStyle(0xeeeeee, 1);
    g.fillRect(2, 6, 18, 1);
    g.fillRect(34, 6, 22, 1);
    g.generateTexture('groundTile', 64, 16);
    g.destroy();
  }

  generateParallaxTextures() {
    this.drawBrownstoneTexture('hillsFar', PARALLAX.hillsFar.tileWidth, PARALLAX.hillsFar.height, 3);
    const nearBuildings = this.drawBrownstoneTexture(
      'hillsNear',
      PARALLAX.hillsNear.tileWidth,
      PARALLAX.hillsNear.height,
      2
    );
    this.drawWindowsTexture('hillsWindows', PARALLAX.hillsNear.tileWidth, PARALLAX.hillsNear.height, nearBuildings);
    this.drawCloudTexture('clouds', 0xffffff, PARALLAX.clouds.tileWidth, PARALLAX.clouds.height);
  }

  // Grid of window cell rects for one building's facade - shared by
  // drawBrownstoneTexture (always-visible dark "glass" openings) and
  // drawWindowsTexture (the subset that gets a warm lit-glow overlay at
  // night), so the two line up pixel-for-pixel.
  windowCells(b, cols, rows) {
    const marginX = b.w * 0.15;
    const marginY = b.h * 0.12;
    const cellW = (b.w - marginX * 2) / cols;
    const cellH = (b.h - marginY * 2 - 8) / rows; // leave room for the stoop/door
    const cells = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        cells.push({
          x: b.x + marginX + c * cellW + cellW * 0.25,
          y: b.y + marginY + r * cellH,
          w: cellW * 0.5,
          h: cellH * 0.5
        });
      }
    }
    return cells;
  }

  // A row of uniform-height brownstones - cornice, window openings, and a
  // stoop - reading as attached rowhouses whether tinted warm brownstone by
  // day or dark and derelict by night (see Parallax.applyPalette). Cornice
  // /stoop/glass are drawn as genuinely different base shades (not the same
  // color at different alpha, which composites to a no-op over an opaque
  // fill) so the detail survives a uniform tint. Buildings never touch the
  // tile edges, so this always tiles seamlessly. Returns the building rects
  // so the night lit-window overlay can align to the same facades.
  drawBrownstoneTexture(key, tileWidth, tileHeight, count) {
    // Wide enough to read as a gap of sky between separate houses even at
    // the buildings' 2/3-screen scale, not just a seam.
    const gap = tileWidth * 0.12;
    const bw = (tileWidth - gap * (count - 1)) / count;
    const baseHeight = tileHeight * 0.88;
    const buildings = [];
    for (let i = 0; i < count; i++) {
      const h = Phaser.Math.Clamp(baseHeight + Phaser.Math.Between(-4, 4), tileHeight * 0.6, tileHeight);
      const x = i * (bw + gap);
      buildings.push({ x, y: tileHeight - h, w: bw, h, stoopW: bw * 0.4 });
    }

    const g = this.add.graphics();
    for (const b of buildings) {
      g.fillStyle(0xffffff, 1);
      g.fillRect(b.x, b.y, b.w, b.h);
      // Cornice ridge along the roofline - visibly dimmer, not just less
      // opaque, so it still reads once the whole texture is tinted.
      g.fillStyle(0xcfcfcf, 1);
      g.fillRect(b.x, b.y, b.w, 4);
      // Window openings - dark by day, get a warm lit overlay at night.
      g.fillStyle(0x8f8f8f, 1);
      for (const win of this.windowCells(b, 2, 3)) g.fillRect(win.x, win.y, win.w, win.h);
      // Stoop: a couple of stacked steps up to the (implied) front door.
      g.fillStyle(0xb5b5b5, 1);
      const stoopX = b.x + (b.w - b.stoopW) / 2;
      g.fillRect(stoopX, tileHeight - 6, b.stoopW, 6);
      g.fillRect(stoopX + b.stoopW * 0.2, tileHeight - 10, b.stoopW * 0.6, 4);
    }
    g.generateTexture(key, tileWidth, tileHeight);
    g.destroy();

    return buildings;
  }

  // The subset (~45%) of each facade's windows that get a warm lit-glow
  // overlay - reads as an inhabited building with some rooms lit and some
  // dark, rather than every window uniformly glowing. Faded in over
  // hillsNear at night via Parallax - see windowGlow in dayNightPalette.js.
  drawWindowsTexture(key, tileWidth, tileHeight, buildings) {
    const g = this.add.graphics();
    g.fillStyle(0xf2d38a, 1);
    for (const b of buildings) {
      for (const win of this.windowCells(b, 2, 3)) {
        if (Math.random() < 0.45) g.fillRect(win.x, win.y, win.w, win.h);
      }
    }
    g.generateTexture(key, tileWidth, tileHeight);
    g.destroy();
  }

  drawCloudTexture(key, color, tileWidth, tileHeight) {
    const g = this.add.graphics();
    g.fillStyle(color, 0.55);
    const pattern = [
      [0, 1, 1, 1, 0, 0],
      [1, 1, 1, 1, 1, 1],
      [0, 1, 1, 1, 1, 0]
    ];
    const cell = 6;
    const drawPuff = (offsetX, offsetY) => {
      pattern.forEach((row, ry) => {
        row.forEach((filled, rx) => {
          if (filled) g.fillRect(offsetX + rx * cell, offsetY + ry * cell, cell, cell);
        });
      });
    };
    drawPuff(10, 10);
    drawPuff(tileWidth * 0.55, tileHeight * 0.4);
    g.generateTexture(key, tileWidth, tileHeight);
    g.destroy();
  }

  create() {
    this.anims.create({
      key: 'obstacle-child-jumprope',
      frames: [{ key: 'obstacle-child0' }, { key: 'obstacle-child1' }],
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-cat-hiss',
      frames: [{ key: 'obstacle-cat0' }, { key: 'obstacle-cat1' }],
      frameRate: 4,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-fire-flicker',
      frames: [
        { key: 'obstacle-trashfire0' },
        { key: 'obstacle-trashfire1' },
        { key: 'obstacle-trashfire0' },
        { key: 'obstacle-trashfire1' }
      ],
      frameRate: 9,
      repeat: -1
    });

    this.anims.create({
      key: 'player-idle',
      frames: [{ key: 'player-idle0' }, { key: 'player-idle1' }],
      frameRate: 2,
      repeat: -1
    });
    this.anims.create({
      key: 'player-walk',
      frames: [
        { key: 'player-walk0' },
        { key: 'player-walk1' },
        { key: 'player-walk2' },
        { key: 'player-walk3' },
        { key: 'player-walk4' },
        { key: 'player-walk5' }
      ],
      frameRate: 10,
      repeat: -1
    });

    this.anims.create({
      key: 'dog-idle',
      frames: [{ key: 'dog-idle' }],
      frameRate: 1
    });
    this.anims.create({
      key: 'dog-run',
      // Gathered <-> extended - the two silhouettes of a real double-
      // suspension gallop - cycled quickly for a sprinting feel.
      frames: [
        { key: 'dog-gathered0' }, { key: 'dog-gathered1' },
        { key: 'dog-extended0' }, { key: 'dog-extended1' }
      ],
      frameRate: 12,
      repeat: -1
    });
    this.anims.create({
      key: 'dog-jump',
      frames: [{ key: 'dog-leap' }],
      frameRate: 1
    });

    this.scene.start('Play');
  }
}
