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
    this.drawTrashBinObstacle('obstacle-trashbin0', false);
    this.drawTrashBinObstacle('obstacle-trashbin1', true);
    this.drawCrateObstacle('obstacle-crate');
    this.drawHydrantObstacle('obstacle-hydrant0', false);
    this.drawHydrantObstacle('obstacle-hydrant1', true);
    this.drawHydrantObstacle('obstacle-hydrant-long0', false, true);
    this.drawHydrantObstacle('obstacle-hydrant-long1', true, true);
    this.drawShoppingCartObstacle('obstacle-shoppingcart0', false);
    this.drawShoppingCartObstacle('obstacle-shoppingcart1', true);
    this.drawHotDogCartObstacle('obstacle-hotdogcart');
    this.drawParkingMeterObstacle('obstacle-parkingmeter');
    this.drawCatObstacle('obstacle-cat0', false);
    this.drawCatObstacle('obstacle-cat1', true);
    this.drawTrashFireObstacle('obstacle-trashfire0', false);
    this.drawTrashFireObstacle('obstacle-trashfire1', true);
    this.drawSleepingObstacle('obstacle-sleeping0', false);
    this.drawSleepingObstacle('obstacle-sleeping1', true);
    this.drawBoomboxObstacle('obstacle-boombox0', false);
    this.drawBoomboxObstacle('obstacle-boombox1', true);
    this.drawSteamStackObstacle('obstacle-steamstack0', false);
    this.drawSteamStackObstacle('obstacle-steamstack1', true);
    this.drawGarbageBagsObstacle('obstacle-garbagebags0', false);
    this.drawGarbageBagsObstacle('obstacle-garbagebags1', true);
    this.drawCopObstacle('obstacle-cop0', 0);
    this.drawCopObstacle('obstacle-cop1', 1);
    this.drawCopObstacle('obstacle-cop2', 2);
    this.drawCopObstacle('obstacle-cop3', 3);
    this.drawStreetwalkerObstacle('obstacle-streetwalker0', false);
    this.drawStreetwalkerObstacle('obstacle-streetwalker1', true);
    this.drawPigeonFrame('pigeon-fly0', 0);
    this.drawPigeonFrame('pigeon-fly1', 1);
    this.drawPigeonFrame('pigeon-fly2', 2);
    this.drawCrowFrame('crow-fly0', 0);
    this.drawCrowFrame('crow-fly1', 1);
    this.drawCrowFrame('crow-fly2', 2);
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
  drawTrashBinObstacle(key, flip) {
    // Municipal sidewalk basket: wide rolled rim, circular deposit opening,
    // black inner liner and repeating powder-coated steel slats.
    const O=0x101216,DEEP=0x06070a,D=0x22252a,M=0x3c4045,L=0x656a70,HI=0xa4a9ae,EDGE=0xd0d3d5;
    const FLY=0x111014,WING=0xc2c0c5;
    const flies=flip
      ? [[1,2,2,1,FLY],[0,1,1,1,WING],[27,4,2,1,FLY],[29,3,1,1,WING],[2,10,2,1,FLY],[4,9,1,1,WING]]
      : [[2,5,2,1,FLY],[1,4,1,1,WING],[27,1,2,1,FLY],[26,2,1,1,WING],[26,10,2,1,FLY],[28,11,1,1,WING]];
    this.drawObstacleTexture(key,30,36,[
      ...flies,
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

  // Open-topped burn barrel: the battered 55-gallon steel drum and tall,
  // two-frame flame are the familiar street-corner silhouette from an '80s
  // city movie. The black mouth stays visible beneath the fire so this reads
  // as a barrel rather than the daytime municipal trash basket.
  drawTrashFireObstacle(key, flip) {
    const O=0x17161a,DEEP=0x09090b,D=COLORS.trashCanDark,M=COLORS.trashCan,L=0x89847b,HI=0xb0aaa0,R=0x75442f,F=COLORS.flameOuter,Y=COLORS.flameInner,H=0xfff0a1;
    const flame=flip
      ? [[7,3,5,10,F],[11,6,7,10,F],[17,1,4,12,F],[8,10,12,8,F],[11,8,7,10,Y],[14,10,3,7,H]]
      : [[6,6,6,10,F],[10,1,5,15,F],[15,5,6,12,F],[8,11,13,7,F],[10,8,8,10,Y],[13,10,3,7,H]];
    this.drawObstacleTexture(key,28,36,[...flame,
      // Rolled rim and the dark open mouth of the drum.
      [3,15,22,4,O],[5,14,18,2,L],[4,16,20,3,DEEP],[7,17,14,2,0x302820],[3,18,22,2,HI],
      // Broad cylindrical steel body with bowed sides and vertical wear.
      [4,19,20,14,O],[5,19,18,14,M],[5,20,3,12,L],[8,20,2,12,HI],[20,20,3,12,D],
      // Rolled strengthening ribs make it unmistakably a 55-gallon drum.
      [4,21,20,3,O],[5,21,18,1,HI],[5,23,18,1,D],
      [4,28,20,3,O],[5,28,18,1,L],[5,30,18,1,D],
      // Battered rust patches, soot, and a heavy bottom rim.
      [16,24,5,2,R],[18,26,3,1,0x9a5b36],[7,25,2,2,D],[11,19,7,2,0x3b3734],
      [3,32,22,3,O],[5,32,18,1,HI],[6,34,16,2,D],[8,35,12,1,O]
    ]);
  }

  // Prone figure on the ground - the "urban derelict" night hazard. Drawn
  // as a flat, low solid-color mound (no facial detail, no explicit death
  // iconography - no blood, no X-eyes) rather than anything graphic; reads
  // as "a collapsed/sleeping shape," same register as a pedestrian
  // road-sign icon, not a caricature.
  drawSleepingObstacle(key, flip) {
    const O=0x171822,D=COLORS.sleepingBody,M=0x464858,L=0x686b7d,SK=0xa86f61,S=0xd99a82,SH=0x3c3445;
    const GLASS=0x4d765a,GLINT=0x94b58c,LABEL=0xd7c59a,FLY=0x111014,WING=0xaaa6ad;
    const flies=flip
      ? [[5,2,2,1,FLY],[4,1,1,1,WING],[7,5,2,1,FLY],[9,4,1,1,WING],[13,2,2,1,FLY],[15,3,1,1,WING]]
      : [[3,4,2,1,FLY],[3,3,1,1,WING],[8,1,2,1,FLY],[10,2,1,1,WING],[12,5,2,1,FLY],[11,4,1,1,WING]];
    this.drawObstacleTexture(key,48,20,[
      ...flies,
      // Resting figure.
      [1,12,10,7,O],[3,10,7,3,O],[4,11,6,5,S],[3,13,3,4,SK],[7,12,2,1,SH],
      [9,13,23,6,O],[10,12,18,6,M],[11,12,8,2,L],[25,14,10,5,D],[30,15,10,4,O],
      [33,14,8,3,SH],[31,17,11,3,O],[32,17,9,1,0x6c5d62],[8,17,24,3,O],[12,17,13,1,D],
      // Green glass bottle on its side, with a neck, label and tiny glint.
      [39,15,7,4,O],[40,15,5,3,GLASS],[37,16,4,2,O],[37,16,3,1,GLINT],
      [42,15,2,3,LABEL],[45,16,2,2,O],[40,15,1,1,GLINT],
      [0,19,48,1,0x12131a]
    ]);
  }

  // Big silver '80s ghettoblaster, modeled after the visual reference: long
  // tuner strip, central cassette deck, top handle, and two dominant woofers.
  // The alternate frame expands the cones and nudges the cabinet down a pixel
  // so the bass looks physical rather than merely blinking.
  drawBoomboxObstacle(key, boom) {
    const O=0x111216,DEEP=0x07080a,D=COLORS.boomboxDark,M=0x777b7d,L=0xb9bdbe,HI=0xe4e6e4,R=0xdf5548,BLUE=0x7194a4,TAPE=0x292b2c;
    const y=boom?2:1;
    const cone=boom
      ? [[3,y+14,14,11,O],[4,y+15,12,9,HI],[5,y+15,10,9,DEEP],[7,y+17,6,5,D],[9,y+18,2,3,0x414448],
         [27,y+14,14,11,O],[28,y+15,12,9,HI],[29,y+15,10,9,DEEP],[31,y+17,6,5,D],[33,y+18,2,3,0x414448]]
      : [[4,y+15,12,10,O],[5,y+15,10,9,L],[6,y+16,8,7,DEEP],[8,y+18,4,3,D],[9,y+19,2,2,0x414448],
         [28,y+15,12,10,O],[29,y+15,10,9,L],[30,y+16,8,7,DEEP],[32,y+18,4,3,D],[33,y+19,2,2,0x414448]];
    const waves=boom?[[0,10,1,4,BLUE],[43,10,1,4,BLUE],[1,8,1,2,BLUE],[42,8,1,2,BLUE]]:[];
    this.drawObstacleTexture(key,44,28,[
      ...waves,
      // Tall folding handle and rows of chunky top controls.
      [7,y,30,2,O],[6,y+1,2,6,O],[36,y+1,2,6,O],[8,y+1,28,1,HI],
      [10,y+4,3,2,O],[15,y+3,3,3,O],[20,y+3,8,3,O],[31,y+3,2,3,O],
      // Silver cabinet, small tweeters and the long radio tuner window.
      [1,y+6,42,20,O],[2,y+7,40,18,M],[3,y+7,38,5,L],
      [3,y+8,5,4,O],[4,y+9,3,2,DEEP],[36,y+8,5,4,O],[37,y+9,3,2,DEEP],
      [9,y+8,26,4,O],[10,y+8,24,3,TAPE],[11,y+9,14,1,BLUE],[27,y+9,6,1,R],[12,y+11,20,1,D],
      // Oversized bass speakers dominate the lower half.
      ...cone,
      // Central cassette door with two visible tape reels and deck controls.
      [17,y+13,10,9,O],[18,y+14,8,6,TAPE],[19,y+15,6,1,L],[19,y+17,2,2,D],[23,y+17,2,2,D],
      [20,y+17,1,1,R],[24,y+17,1,1,R],[18,y+21,8,2,L],[19,y+21,6,1,D],
      [17,y+23,10,2,M],[19,y+23,2,1,DEEP],[22,y+23,3,1,DEEP],
      // Feet and bottom trim.
      [2,y+25,40,2,O],[4,y+25,8,1,HI],[32,y+25,8,1,HI]
    ]);
  }

  // NYC-style street steam chimney: a tall orange-and-white striped tube on
  // a traffic-cone base. Two offset cloud silhouettes send the steam sideways
  // as if caught between buildings, matching the supplied photo reference.
  drawSteamStackObstacle(key, flip) {
    const O=0x4a2822,D=0xa43f27,M=COLORS.coneOrange,L=0xf08a45,W=0xe7ddd1,WS=0xbebbc0,WH=0xf7f5ef,SOOT=0x3b3736;
    const steam=flip
      ? [[2,2,12,3,WS],[0,5,18,5,WS],[5,1,8,8,WH],[9,7,12,4,WH],[2,10,15,3,WS],[14,5,8,5,WH]]
      : [[0,4,11,4,WS],[3,1,12,7,WH],[7,7,14,5,WS],[1,9,11,4,WH],[12,3,9,6,WH],[16,9,6,3,WS]];
    this.drawObstacleTexture(key,34,42,[
      ...steam,
      // Soot-darkened open pipe mouth and tall striped chimney.
      [20,8,9,3,O],[21,8,7,2,SOOT],[19,10,11,23,O],[20,10,9,22,M],
      [21,10,7,5,D],[20,15,9,4,W],[21,15,7,1,WH],
      [20,19,9,5,M],[21,19,2,5,L],[20,24,9,4,W],[21,24,7,1,WH],
      [20,28,9,5,M],[21,28,2,5,L],[26,29,2,3,D],
      // Wide safety-cone collar and weighted street base.
      [17,32,15,7,O],[18,32,13,7,M],[20,32,9,2,L],[19,35,11,4,M],
      [15,38,19,3,O],[16,38,17,2,L],[13,40,21,2,O],[16,40,16,1,M],
      // Scuffs and reflective wear.
      [22,17,3,1,0xc7beb2],[25,25,2,1,0xb5ada4],[19,36,2,1,D]
    ]);
  }

  drawHydrantObstacle(key, flip, extended = false) {
    const O=0x51251f,D=0xa63b2c,M=0xd95237,L=0xf27a54,STEEL=0xb8c2c7,W=0xc9edf2,HI=0xf2ffff;
    const shortSpray=flip
      ? [[17,13,6,3,HI],[21,11,6,4,W],[25,9,6,4,HI],[29,10,5,4,W],[32,12,5,5,HI],[35,15,3,6,W],[36,21,2,3,HI]]
      : [[17,14,6,3,W],[21,12,6,4,HI],[25,10,6,4,W],[29,10,5,4,HI],[32,12,5,5,W],[35,16,3,6,HI],[36,22,2,3,W]];
    const longSpray=flip
      ? [[17,13,8,3,HI],[23,10,10,4,W],[31,7,11,4,HI],[40,5,12,4,W],[50,5,12,4,HI],
         [60,7,10,4,W],[68,9,9,5,HI],[75,12,8,5,W],[81,15,7,6,HI],[86,20,4,6,W],
         [77,19,3,2,W],[69,22,3,2,HI],[84,25,3,2,HI]]
      : [[17,14,8,3,W],[23,11,10,4,HI],[31,8,11,4,W],[40,6,12,4,HI],[50,5,12,4,W],
         [60,6,10,4,HI],[68,8,9,5,W],[75,11,8,5,HI],[81,15,7,6,W],[86,21,4,6,HI],
         [78,20,3,2,HI],[70,23,3,2,W],[83,25,3,2,W]];
    const spray=extended?longSpray:shortSpray;
    this.drawObstacleTexture(key,extended?90:38,28,[...spray,
      [7,5,10,3,O],[9,3,6,3,O],[10,3,4,2,STEEL],[5,7,14,3,O],[6,7,12,2,L],
      [7,9,10,15,O],[8,9,8,14,M],[9,10,2,12,L],[5,12,4,7,O],[3,13,4,5,O],[4,14,3,3,M],
      [16,11,4,8,O],[17,12,2,6,STEEL],[6,19,12,5,O],[7,19,10,3,D],[3,23,19,4,O],[5,23,15,2,L]
    ]);
  }

  drawShoppingCartObstacle(key, roll) {
    const O=0x22252a,D=0x50575d,M=0x818a8f,L=0xcbd0d1,R=0xa84b42,B=0x435d78,T=0x786044,Y=0xb99a4d,G=0x607054;
    const wheels=roll
      ? [[10,34,10,8,O],[13,36,4,2,L],[39,34,10,8,O],[42,36,4,2,L],
         [14,35,2,6,M],[11,38,8,2,M],[43,35,2,6,M],[40,38,8,2,M]]
      : [[10,34,10,8,O],[14,35,2,6,M],[11,37,8,2,M],[39,34,10,8,O],
         [43,35,2,6,M],[40,37,8,2,M],[13,36,4,2,L],[42,36,4,2,L]];
    this.drawObstacleTexture(key,56,42,[
      // Tall rear push frame and broad colored handle grip.
      [2,4,15,4,O],[2,2,12,3,R],[14,5,4,28,O],[15,6,2,26,L],
      // Junk remains visible behind the open cage instead of becoming a
      // single dark basket mass.
      [19,13,10,15,B],[21,11,6,4,L],[29,16,10,12,T],[32,13,6,5,Y],
      [39,14,8,14,R],[45,17,6,10,G],[25,19,7,9,0x9a7650],
      // Sloped cage perimeter: wide mouth, narrower floor, stepped front.
      [15,9,38,3,O],[16,10,36,1,L],[16,11,3,19,O],[18,28,31,3,O],
      [50,11,4,5,O],[49,15,4,6,O],[48,20,4,6,O],[47,25,4,5,O],
      // Bright wire grid with transparent cells between each bar.
      [19,11,2,18,M],[26,11,2,18,L],[33,11,2,18,M],[40,11,2,18,L],[47,11,2,16,M],
      [17,14,35,2,M],[17,20,34,2,L],[18,26,31,2,M],
      // Fold-down child seat is attached to the rear cage wall.
      [18,11,11,10,O],[19,12,9,8,B],[21,13,5,2,L],[22,16,3,3,O],
      // Chassis, open lower rack, and clearly separated caster forks.
      [15,29,35,4,O],[17,30,31,1,L],[17,33,31,2,O],[20,35,25,2,M],
      [15,31,4,6,O],[47,31,4,6,O],[18,32,2,5,L],[48,32,2,5,L],
      ...wheels
    ]);
  }

  drawHotDogCartObstacle(key) {
    const O=0x202126,D=0x8e2f28,R=0xd34a3c,Y=0xe2b942,L=0xf1e3c8,STEEL=0xa9b2b4,GLASS=0x86a9b2,NAVY=0x27375c;
    this.drawObstacleTexture(key,44,64,[
      // Broad alternating-panel umbrella with a scalloped valance.
      [18,1,8,1,O],[11,2,22,2,O],[6,4,32,2,O],[3,6,38,4,O],[1,9,42,3,O],
      [18,2,8,2,R],[12,3,8,3,NAVY],[24,3,8,3,NAVY],[7,5,10,4,R],[17,4,10,6,R],[27,5,10,4,R],
      [3,7,7,3,NAVY],[10,8,7,2,NAVY],[27,8,7,2,NAVY],[34,7,7,3,NAVY],
      [2,10,7,2,NAVY],[10,10,7,2,R],[18,10,8,2,R],[27,10,7,2,R],[35,10,7,2,NAVY],
      // Center pole visibly connects canopy to cart.
      [21,11,3,32,O],[22,11,1,32,STEEL],
      // Stainless serving canopy and ingredient display.
      [8,31,28,2,O],[5,33,34,3,O],[7,33,30,2,R],[4,36,36,3,O],[5,36,34,2,Y],
      [7,39,30,10,O],[8,39,28,9,GLASS],[9,40,26,2,0xcce0df],[10,43,8,4,L],[20,42,7,5,R],[29,41,5,6,Y],
      // Cart cabinet, service panel and counter lip.
      [5,48,34,10,O],[6,49,32,8,R],[7,50,30,3,Y],[9,54,12,3,L],[25,54,9,3,D],
      [3,57,38,3,O],[5,57,34,1,STEEL],[8,59,4,3,O],[33,59,4,3,O],
      // Two large street-cart wheels.
      [6,60,8,4,O],[8,61,4,2,STEEL],[31,60,8,4,O],[33,61,4,2,STEEL]
    ]);
  }

  drawParkingMeterObstacle(key) {
    const O=0x1b2023,DEEP=0x111517,D=0x3e494d,M=0x68767a,L=0xaab5b6,HI=0xd8dedc,GLASS=0x92afb0,BLUE=0x35577b,R=0xc85045,G=0x75a36a;
    this.drawObstacleTexture(key,18,60,[
      // Compact rounded single-space meter head.
      [6,1,6,1,O],[3,2,12,2,O],[1,4,16,6,O],[0,8,18,10,O],
      [6,2,6,1,HI],[4,3,10,2,L],[2,5,14,5,M],[1,9,16,8,D],
      // Arched glass timer window and small mechanical dial.
      [4,5,10,8,O],[5,5,8,7,GLASS],[6,6,6,2,HI],[7,9,4,2,D],[9,6,1,5,M],
      // Simple coin slot and traditional lower round mechanism.
      [1,14,16,4,O],[2,14,14,2,L],[3,17,12,8,O],[4,17,10,7,BLUE],
      [5,18,6,2,HI],[11,18,2,3,R],[5,21,2,2,G],[9,21,3,2,DEEP],
      [4,24,10,3,O],[6,24,6,2,M],[8,24,2,2,L],
      // Long, slender cast-metal pole—the defining classic silhouette.
      [7,26,4,29,O],[8,26,2,29,M],[9,27,1,27,L],
      [6,54,6,3,O],[7,54,4,2,HI],[5,56,8,3,O],[3,59,12,1,O]
    ]);
  }

  drawGarbageBagsObstacle(key, flip) {
    const O=0x111316,D=0x24282b,M=0x3b4042,L=0x606566,RAT=0x6f5148,TAIL=0xb08375;
    const tail=flip
      ? [[37,34,7,2,TAIL],[43,31,3,4,TAIL],[45,28,3,4,RAT],[46,28,1,1,0xe0c451]]
      : [[36,35,6,2,TAIL],[41,35,5,1,TAIL],[44,32,4,3,RAT],[46,32,1,1,0xe0c451]];
    this.drawObstacleTexture(key,48,44,[...tail,
      // Tall tied bags form an unmistakable curbside heap.
      [1,19,16,23,O],[4,14,10,8,O],[7,10,5,6,O],[4,19,11,21,M],[6,21,3,16,L],[11,20,3,18,D],
      [12,11,20,32,O],[16,6,12,8,O],[20,2,5,6,O],[15,12,15,29,D],[18,14,5,22,M],[24,12,5,25,L],
      [29,19,17,23,O],[32,14,11,8,O],[36,10,5,6,O],[31,20,13,21,M],[34,22,4,15,L],[40,20,3,18,D],
      // Smaller front bags overlap the seams and give the pile depth.
      [7,27,19,16,O],[10,24,12,6,O],[14,21,5,5,O],[9,28,15,13,D],[12,29,4,9,M],
      [23,29,17,13,O],[26,25,11,7,O],[30,22,5,5,O],[25,30,13,11,M],[28,31,4,8,L],
      // Glossy creases, stretched plastic, and pavement contact shadow.
      [6,18,5,2,L],[18,10,8,2,M],[34,18,6,2,L],[13,35,7,2,M],[29,36,5,2,D],
      [0,41,47,3,O],[3,41,40,1,D]
    ]);
  }

  drawCopObstacle(key, phase) {
    const O=0x151923,N=0x263a5a,B=0x355783,L=0x6686aa,SK=0xc98b75,S=0xe6ad92,G=0xd2b750,SHOE=0x11141b,CLUB=0x4d3528,CLUBL=0x805c43;
    const bob=phase%2;
    const arms=[
      [[2,14,5,5,O],[1,17,4,8,B],[1,23,4,3,S]],
      [[3,14,4,11,O],[4,15,3,9,B],[4,23,3,3,S]],
      [[3,14,4,11,O],[4,15,3,9,B],[4,23,3,3,S]],
      [[3,14,4,10,O],[4,15,3,8,B],[4,22,3,3,S]]
    ][phase];
    const legs=[
      [[5,25,6,10,O],[6,26,4,8,N],[2,34,10,4,SHOE],[14,26,5,10,O],[15,27,3,8,N],[14,35,8,3,SHOE]],
      [[7,26,5,10,O],[8,27,3,8,N],[5,35,8,3,SHOE],[13,26,5,10,O],[14,27,3,8,N],[13,35,8,3,SHOE]],
      [[6,26,5,10,O],[7,27,3,8,N],[4,35,8,3,SHOE],[13,25,6,10,O],[14,26,4,8,N],[13,34,10,4,SHOE]],
      [[7,26,5,10,O],[8,27,3,8,N],[5,35,8,3,SHOE],[13,26,5,10,O],[14,27,3,8,N],[13,35,8,3,SHOE]]
    ][phase];
    const raisedArm=[
      [[20,21,5,7,O],[21,16,4,7,B],[21,13,4,4,S]],
      [[20,21,5,7,O],[19,16,5,7,B],[18,12,4,5,S]],
      [[20,21,5,7,O],[17,17,6,6,B],[15,13,5,5,S]],
      [[20,21,5,7,O],[19,16,5,7,B],[18,12,4,5,S]]
    ][phase];
    const club=[
      [[22,1,4,13,CLUB],[23,2,2,11,CLUBL]],
      [[19,10,4,5,CLUB],[21,6,4,5,CLUB],[23,2,4,5,CLUB],[24,2,2,4,CLUBL]],
      [[16,11,4,5,CLUB],[13,8,4,5,CLUB],[10,5,4,5,CLUB],[7,2,4,5,CLUB],[8,2,2,4,CLUBL]],
      [[19,10,4,5,CLUB],[18,6,4,5,CLUB],[17,2,4,5,CLUB],[18,2,2,4,CLUBL]]
    ][phase];
    const body=[
      // Hat, face, and torso bob on the passing frames.
      [7,1+bob,10,3,O],[5,4+bob,14,3,O],[7,3+bob,10,2,N],
      [8,6+bob,8,7,O],[9,6+bob,6,6,S],[10,7+bob,2,1,SK],[14,8+bob,1,1,O],
      [6,12+bob,12,15,O],[7,12+bob,10,14,N],[8,13+bob,4,3,B],[13,13+bob,3,3,L],
      [11,14+bob,2,3,G],[7,18+bob,10,2,O],
      ...arms,...legs
    ].map(([x,y,w,h,color])=>[x+3,y+10,w,h,color]);
    this.drawObstacleTexture(key,30,48,[...club,...raisedArm,...body]);
  }

  drawStreetwalkerObstacle(key, flip) {
    const O=0x231824,H=0x5a2e31,SK=0xb97868,S=0xdc9b85,P=0xb33f72,PL=0xe06b9b,D=0x442744,BOOT=0x17141b;
    const armY=flip?17:15;
    this.drawObstacleTexture(key,24,38,[
      [7,1,10,3,O],[5,3,14,10,O],[6,2,12,5,H],[7,5,10,7,S],[8,5,3,2,SK],[14,7,1,1,O],[6,10,3,4,H],
      [7,12,10,14,O],[8,12,8,13,P],[9,13,3,5,PL],[7,22,10,4,D],
      [4,14,4,12,O],[5,15,3,armY-12,P],[3,armY,4,3,S],[17,14,4,11,O],[17,15,3,9,P],[19,22,3,3,S],
      [8,25,4,11,O],[9,25,3,10,SK],[14,25,4,11,O],[14,25,3,10,SK],
      [7,34,6,4,BOOT],[13,34,7,4,BOOT],[8,34,4,1,PL],[15,34,3,1,PL]
    ]);
  }

  drawPigeonFrame(key, wingPose) {
    const O=0x252832,D=0x555b66,M=0x858b94,L=0xbcc0c5,NECK=0x5f7473,EYE=0xe4bb4f;
    const wings = wingPose === 0
      ? [[8,1,5,7,O],[9,2,4,6,L],[12,4,6,5,O],[13,5,5,3,M]]
      : wingPose === 1
        ? [[8,6,10,5,O],[9,7,8,3,L],[13,9,7,3,O],[14,9,6,2,M]]
        : [[9,5,8,5,O],[10,6,7,3,L],[12,9,5,4,O],[13,9,4,3,M]];
    this.drawObstacleTexture(key,24,14,[
      ...wings,
      [6,6,12,6,O],[7,6,10,5,M],[8,7,6,2,L],[3,5,6,6,O],[4,6,5,4,NECK],
      [1,7,4,2,O],[0,8,4,1,0xd2a34b],[5,6,1,1,EYE],
      [17,7,6,3,O],[18,7,5,2,D],[20,6,4,2,O],
      [9,11,2,3,O],[10,11,1,2,0xb06d55],[14,11,2,3,O],[15,11,1,2,0xb06d55]
    ]);
  }

  drawCrowFrame(key, wingPose) {
    const O=0x090b10,D=0x181c25,M=0x303743,L=0x596270,EYE=0xe64c45;
    const wings = wingPose === 0
      ? [[8,0,5,8,O],[9,1,4,6,L],[12,4,7,5,O],[13,5,5,3,M]]
      : wingPose === 1
        ? [[8,6,11,6,O],[9,7,9,3,L],[13,10,8,3,O],[14,10,6,2,M]]
        : [[9,4,9,6,O],[10,5,7,3,L],[13,8,6,5,O],[14,9,4,3,M]];
    this.drawObstacleTexture(key,25,14,[
      ...wings,
      [6,6,13,6,O],[7,6,11,5,D],[8,7,7,2,M],[2,5,6,6,O],[3,6,5,4,D],
      [0,7,4,2,O],[0,8,3,1,L],[4,6,1,1,EYE],
      [18,7,7,3,O],[19,7,5,2,D],[21,6,4,2,O]
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
    this.drawSkylineTexture('skyline', PARALLAX.skyline.tileWidth, PARALLAX.skyline.height);
    this.drawBrownstoneTexture('hillsFar', PARALLAX.hillsFar.tileWidth, PARALLAX.hillsFar.height, 8);
    const nearBuildings = this.drawBrownstoneTexture(
      'hillsNear',
      PARALLAX.hillsNear.tileWidth,
      PARALLAX.hillsNear.height,
      5
    );
    this.drawWindowsTexture('hillsWindows', PARALLAX.hillsNear.tileWidth, PARALLAX.hillsNear.height, nearBuildings);
    this.drawPedestriansTexture('pedestrians0', PARALLAX.pedestrians.tileWidth, PARALLAX.pedestrians.height, false);
    this.drawPedestriansTexture('pedestrians1', PARALLAX.pedestrians.tileWidth, PARALLAX.pedestrians.height, true);
    this.drawParkedCarsTexture('parkedCars', PARALLAX.parkedCars.tileWidth, PARALLAX.parkedCars.height);
    this.drawCloudTexture('clouds', 0xffffff, PARALLAX.clouds.tileWidth, PARALLAX.clouds.height);
  }

  drawParkedCarsTexture(key, tileWidth, tileHeight) {
    const g = this.add.graphics();
    // Restrained, low-saturation curbside palette keeps these solid cars
    // visually behind the brighter interactive obstacle roster.
    const colors = [0x615d5d, 0x565b5e, 0x595e59, 0x69645a, 0x5f5d5c, 0x716f6a, 0x5c585f];
    let x = 18;
    let index = 0;
    while (x < tileWidth - 90) {
      const bodyW = Phaser.Math.Between(62, 86);
      const bodyH = Phaser.Math.Between(14, 19);
      const roofH = Phaser.Math.Between(11, 17);
      const bottom = tileHeight - 5;
      const bodyY = bottom - bodyH;
      const color = colors[index % colors.length];
      const dark = Phaser.Display.Color.IntegerToColor(color).darken(28).color;
      const light = Phaser.Display.Color.IntegerToColor(color).lighten(24).color;
      const wagon = index % 4 === 1;
      const taxi = index % 6 === 3;
      // Tires sit behind the body.
      g.fillStyle(0x17191c, 1);
      g.fillCircle(x + bodyW * 0.22, bottom - 2, 7);
      g.fillCircle(x + bodyW * 0.78, bottom - 2, 7);
      g.fillStyle(0x858b8d, 1);
      g.fillCircle(x + bodyW * 0.22, bottom - 2, 3);
      g.fillCircle(x + bodyW * 0.78, bottom - 2, 3);
      // Distinct hood/trunk proportions and stepped pixel-art body shell.
      g.fillStyle(0x202328, 1);
      g.fillRect(x + 2, bodyY - 1, bodyW - 4, bodyH + 2);
      g.fillStyle(color, 1);
      g.fillRect(x, bodyY + 4, bodyW, bodyH - 5);
      g.fillRect(x + 4, bodyY, bodyW - 8, bodyH - 2);
      g.fillStyle(light, 1);
      g.fillRect(x + 6, bodyY + 1, bodyW - 12, 2);
      g.fillStyle(dark, 1);
      g.fillRect(x + 3, bottom - 8, bodyW - 6, 4);
      // Cabin: long square wagon roof or sloped sedan roof.
      const cabinX = x + bodyW * (wagon ? 0.22 : 0.28);
      const cabinW = bodyW * (wagon ? 0.58 : 0.48);
      g.fillStyle(0x202328, 1);
      g.fillRect(cabinX + 3, bodyY - roofH - 2, cabinW - 6, roofH + 3);
      g.fillStyle(color, 1);
      g.fillRect(cabinX, bodyY - 3, cabinW, 5);
      g.fillRect(cabinX + 5, bodyY - roofH, cabinW - 10, roofH);
      g.fillStyle(0x555d60, 1);
      g.fillRect(cabinX + 7, bodyY - roofH + 2, cabinW * 0.38, roofH - 4);
      g.fillRect(cabinX + cabinW * 0.52, bodyY - roofH + 2, cabinW * 0.31, roofH - 4);
      g.fillStyle(0x737a7b, 1);
      g.fillRect(cabinX + 8, bodyY - roofH + 2, cabinW * 0.32, 2);
      // Bumpers, lights, handles, and occasional taxi roof sign.
      g.fillStyle(0xc7c7c2, 1);
      g.fillRect(x, bottom - 7, 5, 3);
      g.fillRect(x + bodyW - 5, bottom - 7, 5, 3);
      g.fillStyle(0x77725f, 1);
      g.fillRect(x + bodyW - 3, bodyY + 4, 3, 4);
      g.fillStyle(0x5d4847, 1);
      g.fillRect(x, bodyY + 4, 3, 4);
      g.fillStyle(0xd7d7d2, 1);
      g.fillRect(x + bodyW * 0.54, bodyY + 4, 6, 1);
      if (taxi) {
        g.fillStyle(0x22252a, 1);
        g.fillRect(cabinX + cabinW * 0.38, bodyY - roofH - 5, 12, 2);
        g.fillStyle(0x756b53, 1);
        g.fillRect(cabinX + cabinW * 0.4, bodyY - roofH - 8, 9, 3);
      }
      // Cars bunch into curbside clusters, followed by believable stretches
      // of open curb rather than repeating at one mechanical interval.
      const gap = index % 4 === 2
        ? Phaser.Math.Between(92, 155)
        : Phaser.Math.Between(10, 34);
      x += bodyW + gap;
      index++;
    }
    g.generateTexture(key, tileWidth, tileHeight);
    g.destroy();
  }

  drawPedestriansTexture(key, tileWidth, tileHeight, flip) {
    const g = this.add.graphics();
    const tones = [0x35363b, 0x46474c, 0x57585c, 0x3e4148];
    let x = 28;
    let index = 0;
    while (x < tileWidth - 30) {
      const tall = index % 3 === 0;
      const h = tall ? 48 : [40, 43, 45][index % 3];
      const feetY = tileHeight - 2;
      const headY = feetY - h;
      const tone = tones[index % tones.length];
      const stride = flip ? 4 : -4;
      // Head, neck and a varied coat/jacket silhouette.
      g.fillStyle(tone, 1);
      g.fillCircle(x + 8, headY + 5, tall ? 5 : 4);
      if (index % 4 === 1) g.fillRect(x + 3, headY + 1, 10, 2); // brimmed hat
      g.fillRect(x + 6, headY + 9, 4, 4);
      g.fillRect(x + 3, headY + 12, 11, tall ? 20 : 17);
      if (index % 3 === 1) g.fillRect(x + 1, headY + 16, 15, 10); // bulky coat
      // Counter-swinging arms and alternating walking legs.
      g.fillRect(x + (flip ? 1 : 12), headY + 14, 3, 17);
      g.fillRect(x + (flip ? 13 : 1), headY + 15, 3, 15);
      g.fillRect(x + 5, headY + 29, 4, feetY - headY - 29);
      g.fillRect(x + 10, headY + 29, 4, feetY - headY - 29);
      g.fillRect(x + 5 + stride, feetY - 4, 8, 4);
      g.fillRect(x + 10 - stride, feetY - 4, 8, 4);
      // Occasional briefcase or shopping bag adds another readable profile.
      if (index % 4 === 2) {
        g.fillRect(x + 15, headY + 24, 8, 9);
        g.fillRect(x + 17, headY + 21, 4, 3);
      }
      const groupGap = index % 5 === 3
        ? [124, 148, 166][index % 3]
        : [42, 58, 69, 51][index % 4];
      x += groupGap;
      index++;
    }
    g.generateTexture(key, tileWidth, tileHeight);
    g.destroy();
  }

  // Slowest city layer: a long, low-contrast horizon of mid-rises, rooftop
  // tanks, chimneys and antennas. It sits behind both brownstone rows and
  // moves at half the far layer's speed to create a much deeper streetscape.
  drawSkylineTexture(key, tileWidth, tileHeight) {
    const g = this.add.graphics();
    let x = 0;
    let index = 0;
    while (x < tileWidth) {
      const w = Phaser.Math.Between(46, 92);
      const h = Phaser.Math.Between(52, 128);
      const y = tileHeight - h;
      const shade = Phaser.Math.RND.pick([0xffffff, 0xe0e0e0, 0xc7c7c7]);
      g.fillStyle(shade, 1);
      g.fillRect(x, y, w, h);
      // Varied parapets and rooftop machinery.
      g.fillStyle(0xa8a8a8, 1);
      if (index % 3 === 0) {
        g.fillRect(x + 4, y - 4, w - 8, 4);
        g.fillRect(x + w * 0.62, y - 11, w * 0.2, 7);
      } else if (index % 3 === 1) {
        g.fillRect(x + w * 0.18, y - 5, w * 0.64, 5);
        g.fillRect(x + w * 0.48, y - 18, 2, 13);
        g.fillRect(x + w * 0.37, y - 16, w * 0.22, 2);
      } else {
        // Distant water tank and its support legs.
        const tx = x + w * 0.58;
        g.fillRect(tx + 3, y - 6, 2, 7);
        g.fillRect(tx + 16, y - 6, 2, 7);
        g.fillStyle(0xb8b8b8, 1);
        g.fillRect(tx + 2, y - 18, 17, 3);
        g.fillRect(tx, y - 15, 21, 8);
        g.fillRect(tx + 3, y - 7, 15, 2);
      }
      // Tiny window columns remain subdued enough to read as distance.
      g.fillStyle(0x898989, 1);
      for (let wy = y + 14; wy < tileHeight - 8; wy += 17) {
        for (let wx = x + 9; wx < x + w - 7; wx += 16) g.fillRect(wx, wy, 5, 7);
      }
      x += w + Phaser.Math.Between(5, 14);
      index++;
    }
    g.generateTexture(key, tileWidth, tileHeight);
    g.destroy();
  }

  // Grid of window cell rects for one building's facade - shared by
  // drawBrownstoneTexture (always-visible dark "glass" openings) and
  // drawWindowsTexture (the subset that gets a warm lit-glow overlay at
  // night), so the two line up pixel-for-pixel.
  windowCells(b, cols = b.windowCols, rows = b.windowRows) {
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

  // A varied row of brownstones - distinct widths, heights, cornices, window
  // grids and stoops - reading as attached rowhouses whether tinted warm by
  // day or dark and derelict by night (see Parallax.applyPalette). Cornice
  // /stoop/glass are drawn as genuinely different base shades (not the same
  // color at different alpha, which composites to a no-op over an opaque
  // fill) so the detail survives a uniform tint. Buildings never touch the
  // tile edges, so this always tiles seamlessly. Returns the building rects
  // so the night lit-window overlay can align to the same facades.
  drawBrownstoneTexture(key, tileWidth, tileHeight, count) {
    // Wide enough to read as a gap of sky between separate houses even at
    // the buildings' 2/3-screen scale, not just a seam.
    const gap = (tileWidth / count) * 0.08;
    const usableWidth = tileWidth - gap * (count - 1);
    const widthWeights = Array.from({ length: count }, () => Phaser.Math.FloatBetween(0.82, 1.18));
    const weightTotal = widthWeights.reduce((sum, weight) => sum + weight, 0);
    const baseHeight = tileHeight * 0.88;
    const buildings = [];
    let nextX = 0;
    for (let i = 0; i < count; i++) {
      const w = usableWidth * widthWeights[i] / weightTotal;
      const roofTank = Phaser.Math.Between(0, 3) === 0;
      const maxHeight = roofTank ? tileHeight - 18 : tileHeight;
      const h = Phaser.Math.Clamp(baseHeight + Phaser.Math.Between(-18, 12), tileHeight * 0.62, maxHeight);
      const windowCols = w > tileWidth / count * 1.06 ? 3 : 2;
      buildings.push({
        x: nextX,
        y: tileHeight - h,
        w,
        h,
        windowCols,
        windowRows: Phaser.Math.Between(3, 4),
        stoopW: w * Phaser.Math.FloatBetween(0.34, 0.48),
        stoopSide: Phaser.Math.Between(0, 2),
        facadeTone: Phaser.Math.RND.pick([0xffffff, 0xe9e9e9, 0xd8d8d8]),
        cornice: Phaser.Math.Between(0, 2),
        facadeType: Phaser.Math.Between(0, 3),
        fireEscape: Phaser.Math.Between(0, 1) === 0,
        roofBox: !roofTank && Phaser.Math.Between(0, 3) === 0,
        roofTank
      });
      nextX += w + gap;
    }

    const g = this.add.graphics();
    for (const b of buildings) {
      g.fillStyle(b.facadeTone, 1);
      g.fillRect(b.x, b.y, b.w, b.h);
      // Each facade family gets different large-scale massing before the
      // shared windows and stoop details are applied.
      if (b.facadeType === 0) {
        // Projecting central bay.
        g.fillStyle(0xefefef, 1);
        g.fillRect(b.x + b.w * 0.24, b.y + 8, b.w * 0.52, b.h - 18);
        g.fillStyle(0xc3c3c3, 1);
        g.fillRect(b.x + b.w * 0.21, b.y + 8, 3, b.h - 18);
        g.fillRect(b.x + b.w * 0.76, b.y + 8, 3, b.h - 18);
      } else if (b.facadeType === 1) {
        // Recessed side panels and a darker rusticated ground floor.
        g.fillStyle(0xc8c8c8, 1);
        g.fillRect(b.x + 3, b.y + 10, b.w * 0.15, b.h - 20);
        g.fillRect(b.x + b.w * 0.82, b.y + 10, b.w * 0.15, b.h - 20);
        g.fillStyle(0xb4b4b4, 1);
        g.fillRect(b.x, tileHeight - 28, b.w, 28);
      } else if (b.facadeType === 2) {
        // Narrow horizontal stone courses across the full elevation.
        g.fillStyle(0xd0d0d0, 1);
        for (let bandY = b.y + 14; bandY < tileHeight - 16; bandY += 18) {
          g.fillRect(b.x + 2, bandY, b.w - 4, 2);
        }
      } else {
        // Dark storefront-like base with a shallow projecting canopy.
        g.fillStyle(0x9e9e9e, 1);
        g.fillRect(b.x + 3, tileHeight - 30, b.w - 6, 24);
        g.fillStyle(0xcfcfcf, 1);
        g.fillRect(b.x, tileHeight - 32, b.w, 4);
      }
      // Cornice ridge along the roofline - visibly dimmer, not just less
      // opaque, so it still reads once the whole texture is tinted.
      g.fillStyle(0xc2c2c2, 1);
      if (b.cornice === 0) {
        g.fillRect(b.x, b.y, b.w, 4);
        g.fillRect(b.x + 3, b.y - 2, b.w - 6, 2);
      } else if (b.cornice === 1) {
        g.fillRect(b.x, b.y, b.w, 3);
        g.fillRect(b.x + b.w * 0.12, b.y + 4, b.w * 0.76, 2);
      } else {
        g.fillRect(b.x, b.y, b.w, 6);
        g.fillStyle(0xaaaaaa, 1);
        g.fillRect(b.x, b.y + 3, b.w, 2);
      }
      if (b.roofBox) {
        g.fillStyle(0xb6b6b6, 1);
        g.fillRect(b.x + b.w * 0.58, b.y - 7, b.w * 0.25, 7);
        g.fillStyle(0x8f8f8f, 1);
        g.fillRect(b.x + b.w * 0.61, b.y - 5, b.w * 0.18, 3);
      }
      if (b.roofTank) {
        const tx = b.x + b.w * 0.55;
        const tw = Math.max(16, b.w * 0.28);
        // Spindly timber support frame beneath a banded wooden tank.
        g.fillStyle(0x777777, 1);
        g.fillRect(tx + 3, b.y - 2, 3, 5);
        g.fillRect(tx + tw - 6, b.y - 2, 3, 5);
        g.fillRect(tx + 4, b.y, tw - 8, 2);
        g.fillStyle(0xaaaaaa, 1);
        g.fillRect(tx + 3, b.y - 14, tw - 6, 2);
        g.fillRect(tx + 1, b.y - 12, tw - 2, 8);
        g.fillRect(tx + 3, b.y - 4, tw - 6, 2);
        g.fillStyle(0x858585, 1);
        g.fillRect(tx, b.y - 10, tw, 2);
        g.fillRect(tx + 1, b.y - 5, tw - 2, 2);
        g.fillRect(tx + tw * 0.48, b.y - 14, 2, 10);
        g.fillStyle(0xc7c7c7, 1);
        g.fillRect(tx + 4, b.y - 13, tw - 8, 1);
      }
      // Window openings - dark by day, get a warm lit overlay at night.
      g.fillStyle(0x8f8f8f, 1);
      const windows = this.windowCells(b);
      for (const win of windows) {
        g.fillRect(win.x, win.y, win.w, win.h);
        g.fillStyle(0xbcbcbc, 1);
        g.fillRect(win.x + win.w / 2 - 1, win.y, 2, win.h);
        g.fillStyle(0x8f8f8f, 1);
      }
      // Belt courses and the occasional dark iron fire escape break up the
      // otherwise flat facades without competing with gameplay silhouettes.
      g.fillStyle(0xd0d0d0, 1);
      g.fillRect(b.x + 2, b.y + b.h * 0.43, b.w - 4, 2);
      if (b.fireEscape) {
        const IRON=0x5b5b5b,EDGE=0x777777;
        const fx = b.x + b.w * 0.5;
        const fw = b.w * 0.42;
        const floors = b.windowRows - 1;
        const floorGap = b.h * 0.18;
        for (let r = 0; r < floors; r++) {
          const fy = b.y + b.h * 0.27 + r * floorGap;
          // Deep platform, upright railing posts, and double horizontal rail.
          g.fillStyle(IRON, 1);
          g.fillRect(fx, fy, fw, 3);
          g.fillRect(fx, fy - 10, 2, 12);
          g.fillRect(fx + fw * 0.33, fy - 10, 2, 12);
          g.fillRect(fx + fw * 0.66, fy - 10, 2, 12);
          g.fillRect(fx + fw - 2, fy - 10, 2, 12);
          g.fillRect(fx, fy - 10, fw, 2);
          g.fillStyle(EDGE, 1);
          g.fillRect(fx, fy - 5, fw, 1);
          // Alternating stepped diagonals read as the familiar zigzag stairs.
          if (r < floors - 1) {
            const stairLeft = r % 2 === 0;
            for (let step = 0; step < 6; step++) {
              const sx = stairLeft ? fx + fw - 5 - step * 3 : fx + 3 + step * 3;
              g.fillStyle(IRON, 1);
              g.fillRect(sx, fy + 2 + step * 3, 5, 2);
            }
          }
        }
        // Drop ladder from the lowest platform toward the sidewalk.
        const ladderX = fx + fw - 7;
        const ladderTop = b.y + b.h * 0.27 + (floors - 1) * floorGap + 3;
        g.fillStyle(IRON, 1);
        g.fillRect(ladderX, ladderTop, 2, tileHeight - ladderTop - 8);
        g.fillRect(ladderX + 6, ladderTop, 2, tileHeight - ladderTop - 8);
        for (let ly = ladderTop + 4; ly < tileHeight - 9; ly += 6) g.fillRect(ladderX, ly, 8, 1);
      }
      // Stoop: a couple of stacked steps up to the (implied) front door.
      g.fillStyle(0xb5b5b5, 1);
      const stoopX = b.stoopSide === 0
        ? b.x + b.w * 0.08
        : b.stoopSide === 1 ? b.x + (b.w - b.stoopW) / 2 : b.x + b.w - b.stoopW - b.w * 0.08;
      g.fillStyle(0x777777, 1);
      g.fillRect(stoopX + b.stoopW * 0.28, tileHeight - 20, b.stoopW * 0.44, 12);
      g.fillStyle(0xb5b5b5, 1);
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
      for (const win of this.windowCells(b)) {
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
      key: 'obstacle-trashbin-flies',
      frames: [{ key: 'obstacle-trashbin0' }, { key: 'obstacle-trashbin1' }],
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
      key: 'obstacle-sleeping-flies',
      frames: [{ key: 'obstacle-sleeping0' }, { key: 'obstacle-sleeping1' }],
      frameRate: 4,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-boombox-boom',
      frames: [
        { key: 'obstacle-boombox0' },
        { key: 'obstacle-boombox1' },
        { key: 'obstacle-boombox0' }
      ],
      frameRate: 7,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-steamstack-puff',
      frames: [
        { key: 'obstacle-steamstack0' },
        { key: 'obstacle-steamstack1' }
      ],
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-hydrant-spray',
      frames: [{ key: 'obstacle-hydrant0' }, { key: 'obstacle-hydrant1' }],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-hydrant-long-spray',
      frames: [{ key: 'obstacle-hydrant-long0' }, { key: 'obstacle-hydrant-long1' }],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-shoppingcart-roll',
      frames: [{ key: 'obstacle-shoppingcart0' }, { key: 'obstacle-shoppingcart1' }],
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-rat-tail',
      frames: [{ key: 'obstacle-garbagebags0' }, { key: 'obstacle-garbagebags1' }],
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-cop-patrol',
      frames: [
        { key: 'obstacle-cop0' },
        { key: 'obstacle-cop1' },
        { key: 'obstacle-cop2' },
        { key: 'obstacle-cop3' }
      ],
      frameRate: 8,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-streetwalker-idle',
      frames: [
        { key: 'obstacle-streetwalker0' },
        { key: 'obstacle-streetwalker0' },
        { key: 'obstacle-streetwalker1' }
      ],
      frameRate: 3,
      repeat: -1
    });
    this.anims.create({
      key: 'pigeon-fly',
      frames: [
        { key: 'pigeon-fly0' },
        { key: 'pigeon-fly1' },
        { key: 'pigeon-fly2' },
        { key: 'pigeon-fly1' }
      ],
      frameRate: 9,
      repeat: -1
    });
    this.anims.create({
      key: 'crow-fly',
      frames: [
        { key: 'crow-fly0' },
        { key: 'crow-fly1' },
        { key: 'crow-fly2' },
        { key: 'crow-fly1' }
      ],
      frameRate: 11,
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
