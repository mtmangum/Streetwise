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
    this.drawTrashBinObstacle('obstacle-trashbin0');
    this.drawTrashBinObstacle('obstacle-trashbin1', false);
    this.drawTrashBinObstacle('obstacle-trashbin2', true);
    // this.drawSignboardObstacle('obstacle-signboard'); // pulled for now
    this.drawHydrantObstacle('obstacle-hydrant0', false);
    this.drawHydrantObstacle('obstacle-hydrant1', true);
    this.drawHydrantObstacle('obstacle-hydrant-long0', false, true);
    this.drawHydrantObstacle('obstacle-hydrant-long1', true, true);
    this.drawShoppingCartObstacle('obstacle-shoppingcart0', false);
    this.drawShoppingCartObstacle('obstacle-shoppingcart1', true);
    this.drawHotDogCartObstacle('obstacle-hotdogcart');
    this.drawParkingMeterObstacle('obstacle-parkingmeter');
    this.drawCatRunObstacle('obstacle-cat0', 0);
    this.drawCatRunObstacle('obstacle-cat1', 1);
    this.drawCatRunObstacle('obstacle-cat2', 2);
    this.drawCatRunObstacle('obstacle-cat3', 3);
    this.drawCatObstacle('obstacle-cat-hiss0', false);
    this.drawCatObstacle('obstacle-cat-hiss1', true);
    this.drawTrashFireObstacle('obstacle-trashfire0', false);
    this.drawTrashFireObstacle('obstacle-trashfire1', true);
    this.drawSleepingObstacle('obstacle-sleeping0', false);
    this.drawSleepingObstacle('obstacle-sleeping1', true);
    this.drawBoomboxObstacle('obstacle-boombox0', false);
    this.drawBoomboxObstacle('obstacle-boombox1', true);
    this.drawSteamStackObstacle('obstacle-steamstack0', false);
    this.drawSteamStackObstacle('obstacle-steamstack1', true);
    this.drawScurryingRatsObstacle('obstacle-rats0', false);
    this.drawScurryingRatsObstacle('obstacle-rats1', true);
    this.drawCopObstacle('obstacle-cop0', 0);
    this.drawCopObstacle('obstacle-cop1', 1);
    this.drawCopObstacle('obstacle-cop2', 2);
    this.drawCopObstacle('obstacle-cop3', 3);
    this.drawStreetwalkerObstacle('obstacle-streetwalker0', false);
    this.drawStreetwalkerObstacle('obstacle-streetwalker1', true);
    this.drawMattTexture('matt-standing', 'standing');
    this.drawMattTexture('matt-pat', 'pat');
    this.drawMattTexture('matt-hug', 'hug');
    this.drawPinkSneakerPickup();
    this.drawZoomiesTreat();
    this.drawPigeonFrame('pigeon-fly0', 0);
    this.drawPigeonFrame('pigeon-fly1', 1);
    this.drawPigeonFrame('pigeon-fly2', 2);
    this.drawSeagullFrame('seagull-fly0', 0);
    this.drawSeagullFrame('seagull-fly1', 1);
    this.drawSeagullFrame('seagull-fly2', 2);
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
      // Lower cabinet seam and a taped-up service notice with corner tabs.
      [2,17,18,2,D],[3,17,16,1,L],
      [4,19,8,8,O],[5,20,6,6,S],[5,20,6,1,0xf2f4f5],[6,23,4,1,0x334c67],[6,25,3,1,0x334c67],[7,21,3,1,0x99a7b8],
      [4,19,2,1,0x9fb0c4],[10,19,2,1,0x9fb0c4],[4,26,2,1,0x9fb0c4],[10,26,2,1,0x9fb0c4],
      [13,20,1,1,HI],[12,22,4,1,HI],[13,24,3,1,HI],[11,25,1,1,HI],[16,18,1,1,O],
      // Two sturdy legs, blocky sidewalk feet and a thin ground shadow.
      [2,25,5,8,O],[3,25,3,7,D],[15,25,5,8,O],[16,25,3,7,D],
      [4,26,2,6,M],[16,26,2,6,M],[1,32,7,2,O],[14,32,7,2,O],
      [2,32,5,1,P],[15,32,5,1,P],[1,33,20,1,0x0c1220]
    ]);
  }

  // Traffic cone: same silhouette as the old obstacle-spike, re-themed with
  // an orange body, white reflective band, and a dark base.
  drawConeObstacle(key) {
    const O=0x392626,D=0xb94d24,M=COLORS.coneOrange,L=0xf19a4b,W=0xf1e8d7;
    const cone = (offset) => [
      [offset+8,4,3,2,O],[offset+7,6,5,5,O],[offset+6,11,7,6,O],[offset+5,17,9,7,O],[offset+4,24,11,4,O],
      [offset+8,6,2,5,L],[offset+8,7,3,4,M],[offset+7,11,5,6,M],[offset+6,17,7,7,M],[offset+5,24,9,3,D],
      [offset+7,14,5,3,W],[offset+7,17,6,1,0xd1c6b6],[offset+2,27,15,3,O],[offset+3,27,13,2,COLORS.coneBase],[offset+1,30,17,2,O]
    ];
    this.drawObstacleTexture(key,58,32,[
      // Broad striped road plank sits behind and hooks onto both cones.
      [7,6,44,11,O],[5,8,48,7,O],[8,8,42,7,W],
      [8,8,7,7,M],[22,8,7,7,M],[36,8,7,7,M],[50,9,2,5,M],
      [14,8,4,7,L],[28,8,4,7,L],[42,8,4,7,L],
      [9,6,5,2,0x69625b],[44,6,5,2,0x69625b],
      ...cone(0),
      ...cone(40)
    ]);
  }

  // Kid skipping rope on the sidewalk. Two-frame cycle: frame 0 grounded
  // with the rope whipped high over the head, frame 1 hopped up with knees
  // tucked and the rope sweeping under the feet. The cord is a 2px amber
  // stroke that stays connected hand-to-hand, with red handle nubs and a
  // pale motion trail so a single frame still reads as a spinning rope.
  drawChildObstacle(key, air) {
    const O=0x2a2333,SK=0xe0a074,SKH=0xf0c3a0,SKS=0xc07f57,HR=0x6b3f2a,HRD=0x4a2a1c,
      SHIRT=COLORS.childBody,SHIRTH=0x82b0e0,SHIRTS=0x3f6aa0,SHORTS=0x334a86,SHORTSH=0x4f66ad,
      SHOE=0xe86a4b,SOLE=0xf3efe4,MOUTH=0x8a3f3a,
      ROPE=0xf2b33a,ROPES=0xcf8f22,GRIP=0xd94f3d,GRIPD=0x9c3427,TRAIL=0xf7d98a;

    const ropeBack=air
      ? [ // low arc sweeping under the tucked feet, risers up to the hands
          [3,16,2,4,ROPE],[2,20,2,3,ROPE],[3,23,3,2,ROPE],
          [25,16,2,4,ROPE],[26,20,2,3,ROPE],[24,23,3,2,ROPE],
          [7,25,5,2,ROPE],[12,26,6,2,ROPE],[18,25,5,2,ROPE],
          [7,26,4,1,ROPES],[12,27,6,1,ROPES],[19,26,4,1,ROPES],
          [10,24,4,1,TRAIL],[8,25,2,1,TRAIL],[20,25,2,1,TRAIL] ]
      : [ // tall arc whipped up and over the head, sides down to the hands
          [10,0,10,2,ROPE],[8,1,3,2,ROPE],[19,1,3,2,ROPE],
          [5,3,2,4,ROPE],[23,3,2,4,ROPE],[4,7,2,5,ROPE],[24,7,2,5,ROPE],
          [3,12,3,3,ROPE],[24,12,3,3,ROPE],[3,14,3,2,ROPE],[24,14,3,2,ROPE],
          [10,0,10,1,ROPES],[5,4,1,3,ROPES],[24,4,1,3,ROPES],
          [12,2,4,1,TRAIL],[9,3,2,1,TRAIL],[19,3,2,1,TRAIL] ];

    const kid=air
      ? [ // hair flying up, chin tucked, knees drawn up mid-hop
          [10,1,10,2,HRD],[9,3,12,3,HR],[7,1,2,3,HR],[22,1,2,3,HR],[8,4,2,2,HR],[21,4,2,2,HR],
          [9,3,12,8,O],[10,4,10,6,SK],[11,4,6,3,SKH],
          [12,7,2,2,O],[17,7,2,2,O],[13,9,4,2,O],[14,9,3,1,MOUTH],
          [13,11,4,1,O],
          [9,12,12,7,O],[10,13,10,5,SHIRT],[11,13,4,3,SHIRTH],[10,17,10,1,SHIRTS],
          [8,12,3,4,O],[9,13,2,3,SHIRT],[5,13,4,3,O],[6,13,3,2,SHIRT],[3,14,3,3,O],[4,15,2,2,SK],
          [19,12,3,4,O],[19,13,2,3,SHIRT],[21,13,4,3,O],[21,13,3,2,SHIRT],[24,14,3,3,O],[24,15,2,2,SK],
          [9,18,12,4,O],[10,19,10,3,SHORTS],[10,19,4,1,SHORTSH],[15,19,1,3,O],
          [8,21,4,3,O],[9,21,3,2,SHORTS],[18,21,4,3,O],[19,21,3,2,SHORTS],
          [7,22,2,2,O],[23,22,2,2,O],
          [9,23,3,2,O],[10,23,2,1,SK],[18,23,3,2,O],[19,23,2,1,SK],
          [11,23,4,2,O],[15,23,4,2,O],[12,23,3,1,SHOE],[16,23,3,1,SHOE],[12,24,3,1,SOLE],[16,24,3,1,SOLE] ]
      : [ // standing on the sidewalk, arms down, feet together
          [10,1,10,2,HRD],[9,3,12,3,HR],[9,4,2,4,HR],[21,4,2,4,HR],[8,6,2,3,HR],[22,6,2,3,HR],
          [9,4,12,8,O],[10,5,10,6,SK],[11,5,6,3,SKH],
          [12,8,2,2,O],[17,8,2,2,O],[13,10,4,2,O],[14,11,2,1,MOUTH],[11,9,1,1,SKS],[19,9,1,1,SKS],
          [13,12,4,2,O],[14,12,2,1,SKS],
          [9,13,12,7,O],[10,14,10,5,SHIRT],[11,14,4,3,SHIRTH],[10,18,10,1,SHIRTS],
          [8,13,3,4,O],[9,14,2,3,SHIRT],[5,15,4,3,O],[6,15,3,2,SHIRT],[4,16,3,3,O],[4,17,2,2,SK],
          [19,13,3,4,O],[19,14,2,3,SHIRT],[21,15,4,3,O],[21,15,3,2,SHIRT],[23,16,3,3,O],[24,17,2,2,SK],
          [9,19,12,4,O],[10,20,10,3,SHORTS],[10,20,4,1,SHORTSH],[15,20,1,3,O],
          [10,22,4,3,O],[16,22,4,3,O],[11,22,2,3,SK],[17,22,2,3,SK],
          [9,24,6,3,O],[15,24,6,3,O],[10,24,5,2,SHOE],[16,24,5,2,SHOE],[10,26,5,1,SOLE],[16,26,5,1,SOLE] ];

    const grips=air
      ? [[3,13,3,3,GRIP],[3,13,3,1,GRIPD],[24,13,3,3,GRIP],[24,13,3,1,GRIPD]]
      : [[3,15,3,3,GRIP],[3,15,3,1,GRIPD],[24,15,3,3,GRIP],[24,15,3,1,GRIPD]];

    this.drawObstacleTexture(key,30,28,[...ropeBack, ...kid, ...grips]);
  }

  // Open municipal wire basket. Transparent gaps between its narrow ribs
  // keep it from reading as a solid barrel at gameplay scale.
  drawTrashBinObstacle(key, flyFrame = null) {
    const O=0x101216,D=0x292c31,M=0x44484e,L=0x747980,HI=0xb7bbc0;
    const FLY=0x111014,WING=0x77777c;
    const CAN=0x9298a0,CANHI=0xb7bbc0,CANDK=0x5c5f64,PAPER=0xd0cdc4,PAPERHI=0xeceae2,BOTL=0x3a4a3f;
    // Flies buzz as a loose asymmetric cluster over the open mouth and jump
    // position between the two frames - not a fixed dot on each side, which
    // read as indicator lights.
    const flies=flyFrame === null
      ? [[9,4,1,1,FLY],[13,6,1,1,FLY],[17,3,1,1,FLY]]
      : flyFrame
        ? [[8,3,1,1,FLY],[7,2,1,1,WING],[13,6,1,1,FLY],[14,7,1,1,WING],[18,2,1,1,FLY],[17,3,1,1,WING],[11,8,1,1,FLY],[22,5,1,1,FLY]]
        : [[11,5,1,1,FLY],[12,4,1,1,WING],[16,2,1,1,FLY],[15,1,1,1,WING],[20,6,1,1,FLY],[21,7,1,1,WING],[9,7,1,1,FLY],[19,9,1,1,FLY]];
    this.drawObstacleTexture(key,30,36,[
      ...flies,
      // Rubbish packed into the basket so the wire body reads as full, not
      // as a see-through hoop.
      [7,12,16,17,0x191b21],[9,14,13,12,0x232530],
      [10,13,6,3,0x2e3038],[16,15,6,3,0x2b2d35],[12,20,9,3,0x1f2128],[8,17,4,4,0x26282f],
      [13,16,3,2,CANDK],[18,18,2,6,BOTL],
      // Thin rolled oval rim surrounding the center.
      [7,1,16,1,D],[4,2,22,1,M],[2,3,4,1,O],[24,3,4,1,O],
      [1,4,3,3,O],[27,4,2,3,O],[2,7,26,2,O],[3,7,24,1,HI],
      [5,4,20,1,L],[7,5,16,1,D],[9,6,12,1,M],
      // Outer frame tapers inward toward the base.
      [3,9,2,20,O],[4,10,1,18,L],[25,9,2,20,O],[25,10,1,18,M],
      [5,28,2,3,O],[23,28,2,3,O],
      // Narrow, separated vertical ribs; the trash mass now shows between them.
      [6,9,2,21,O],[7,10,1,19,M],
      [10,9,2,23,O],[11,10,1,21,L],
      [14,8,2,24,O],[15,9,1,22,M],
      [18,9,2,23,O],[19,10,1,21,L],
      [22,9,2,21,O],[23,10,1,19,M],
      // Slim hoops stabilize the basket without filling its open body.
      [3,11,24,2,O],[4,11,22,1,HI],
      [4,21,22,2,O],[5,21,20,1,M],
      // A crushed can and a paper wad crest the rim.
      [4,2,8,4,O],[5,3,6,2,CAN],[5,2,6,1,CANHI],[6,4,1,1,CANDK],
      [15,1,7,5,O],[16,2,5,3,PAPER],[17,2,2,1,PAPERHI],[19,4,2,1,PAPER],
      // Rolled base ring, extended to the bottom edge so the bin sits flush.
      [5,30,20,3,O],[6,33,18,3,O],[6,30,18,1,HI],[7,31,16,1,M],[7,34,16,1,M],
      // A faded takeout cup lying on its side on the pavement beside the bin:
      // sealed base at the left, a cream wrap band, a domed grey lid with a
      // drink hole and a straw at the right. Right next to the bin so it
      // can't be mistaken for a pickup.
      [16,31,11,5,0x1e1a1a],
      [17,32,9,3,0xb35b52],[17,32,9,1,0xcf837a],[17,34,9,1,0x8a4038],
      [16,32,2,3,0x1e1a1a],[16,33,1,1,0xdedad0],
      [21,32,2,3,0xe8e2d4],[21,32,2,1,0xf4efe3],[21,34,2,1,0xc9c3b3],
      [27,30,3,6,0x1e1a1a],[28,31,2,4,0xc9cdd0],[28,31,2,1,0xeef0f2],[28,33,1,2,0x9297a0],
      [29,32,1,2,0x1e1a1a],[29,32,1,1,0x36393f],
      [28,29,1,2,0xb35b52],[29,27,1,3,0xe4dfd6],[28,26,2,1,0xb35b52]
    ]);
  }


  // Café A-frame chalkboard, seen at a 3/4 angle: the near panel leans back
  // toward a hinged peak, the far panel's top edge and leg recede up-right,
  // and the legs splay onto the pavement. Charcoal-painted frame (not wood),
  // green board, one chalk coffee-cup doodle. Replaces the old wooden crate.
  drawSignboardObstacle(key) {
    const O=0x121212,PAINT=0x34383e,PAINTL=0x4c515a,PAINTD=0x22242a,
      BG=0x1f3a2e,BGL=0x2c4d3d,CH=0xeeeadd,CHD=0xbdb8a6,STEAM=0xa7b8ae;
    this.drawObstacleTexture(key,44,40,[
      // Long angled sidewalk shadow.
      [5,38,28,1,0x120f0a],
      // Far panel: top edge and leg recede up and to the right.
      [24,4,9,3,O],[25,4,7,2,PAINTD],
      [31,6,4,18,O],[31,6,3,15,PAINTD],
      [30,24,5,10,O],[31,25,3,7,PAINTD],
      // Hinged peak where the two panels meet.
      [13,4,10,4,O],[14,5,8,2,PAINT],[14,5,8,1,PAINTL],
      // Near panel: stacked bands stepped rightward so the board leans back.
      [8,28,23,4,O],[9,24,23,4,O],[10,20,23,4,O],[11,16,23,4,O],[12,12,23,4,O],[13,8,23,4,O],
      [9,28,21,3,PAINT],[10,24,21,3,PAINT],[11,20,21,3,PAINT],[12,16,21,3,PAINT],[13,12,21,3,PAINT],[14,8,20,3,PAINT],
      // Green chalkboard face, inset, following the lean.
      [10,28,19,2,BG],[11,24,19,3,BG],[12,20,19,3,BG],[13,16,19,3,BG],[14,12,18,3,BG],
      [10,28,1,2,BGL],[11,24,1,3,BGL],[12,20,1,3,BGL],[13,16,1,3,BGL],[14,12,1,3,BGL],
      // One chalk coffee-cup doodle: hollow mug, handle, rising steam.
      [15,15,10,2,CH],[15,24,10,2,CH],[15,17,2,7,CH],[23,17,2,7,CH],
      [25,17,3,2,CH],[27,18,1,3,CH],[25,20,3,2,CH],
      [15,27,12,1,CHD],
      [16,10,1,3,STEAM],[19,9,1,3,STEAM],[22,10,1,3,STEAM],
      // Near panel's two splayed feet.
      [7,30,5,8,O],[8,31,3,6,PAINTD],[5,36,6,2,O],
      [26,30,5,8,O],[27,31,3,6,PAINTD],[25,36,6,2,O]
    ]);
  }

  // Four-frame low gallop - gather, airborne reach with the legs splayed
  // fore/aft, front contact, back push-off - so the cat visibly runs rather
  // than sliding on a single pose. Frames feed obstacle-cat-run; the enraged
  // charge swaps to the obstacle-cat-hiss pair drawn below.
  drawCatRunObstacle(key, f) {
    const O=0x1d1b25,D=0x34323e,M=COLORS.catBody,L=0x716d7b,E=COLORS.catEye,W=0xf1e7d8;
    const by=[0,-1,1,-1][f];
    const ext=[[7,21],[5,24],[6,22],[6,23]][f], x0=ext[0], x1=ext[1];
    const core=[
      [8,4+by,13,9,O],[9,2+by,4,3,O],[16,2+by,4,3,O],
      [9,6+by,11,6,M],[10,6+by,3,2,L],
      [11,8+by,2,2,O],[16,8+by,2,2,O],[12,8+by,2,1,E],[16,8+by,2,1,E],
      [9,10+by,3,1,W],[10,12+by,4,1,W],
      [x0,10+by,x1-x0,9,O],[x0+1,11+by,x1-x0-2,7,M],[x0+1,11+by,8,2,L],[x0+2,16+by,x1-x0-6,2,D]
    ];
    const tail=[
      [[22,2,5,3,O],[24,3,3,9,O],[25,4,2,7,M]],
      [[23,12,6,2,O],[27,11,3,2,O],[28,10,2,2,O],[24,13,4,1,M]],
      [[23,7,4,7,O],[24,8,3,6,M],[25,4,3,4,O]],
      [[22,3,5,3,O],[23,4,3,10,O],[24,5,2,8,M]]
    ][f];
    const legs=[
      [[8,17,3,7,O],[9,18,2,5,M],[8,23,3,2,O],[15,17,4,7,O],[16,18,3,5,M],[16,23,3,2,O]],
      [[7,14,3,4,O],[2,15,6,3,O],[0,16,4,2,M],[0,17,2,2,L],[16,14,3,4,O],[19,15,6,3,O],[24,16,4,2,M],[26,17,2,2,L]],
      [[5,16,3,9,O],[6,17,2,7,M],[4,24,4,2,O],[17,17,3,3,O],[13,18,4,5,O],[14,19,3,4,M],[15,22,3,2,O]],
      [[16,16,4,9,O],[17,17,3,7,M],[18,24,4,2,O],[8,15,3,4,O],[9,16,2,3,M],[10,17,2,2,O]]
    ][f];
    this.drawObstacleTexture(key,30,27,[...tail, ...core, ...legs]);
  }

  // Arched back, tail straight up, slanted brows over narrow glowing eyes,
  // bared fangs, motion lines. Two frames (obstacle-cat-hiss) played fast
  // when a cat notices Nicole and charges - see Obstacle.js behavior 'cat'.
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

  // Passed-out drunk on the sidewalk - a night hazard, kept deliberately
  // spare: a slumped khaki-coat mass with a capped head, one bent knee drawn
  // up as the bump to hurdle, and a single bottle on its side by his hip. He
  // lies on a flattened cardboard sheet so the silhouette reads against dark
  // pavement. Non-graphic - posture and one bottle only. The alt frame just
  // breathes (belly +1px) and moves the flies.
  drawSleepingObstacle(key, flip) {
    const O=0x24232a,COAT=0x756b50,COAT_D=0x504936,COAT_L=0xa29773,
      PANTS=0x44506d,PANTS_L=0x657291,SKIN=0xbc886d,CAP=0x292633,BOOT=0x30271f,
      GLASS=0x72633d,GLASS_L=0xb6a36b,GROUND=0x25252b,SLEEP=0xa7bad0;
    const breathe=flip?1:0;
    const sleepMarks=flip
      ? [[8,4,4,1,SLEEP],[11,3,1,2,SLEEP],[14,1,5,1,SLEEP],[18,0,1,2,SLEEP]]
      : [[7,5,4,1,SLEEP],[10,4,1,2,SLEEP],[13,2,5,1,SLEEP],[17,1,1,2,SLEEP]];
    this.drawObstacleTexture(key,48,28,[
      ...sleepMarks,
      // One quiet ground shadow rather than a second cardboard silhouette.
      [2,25,43,2,GROUND],
      // Head at the left: cap, face, closed eye and nose remain separated.
      [3,13,9,9,O],[4,14,7,7,SKIN],[3,11,9,4,CAP],[5,17,3,1,O],[10,17,2,2,SKIN],
      // A single slumped coat mass with a breathing shoulder highlight.
      [11,12,18,12,O],[12,13,16,10,COAT],[13,14+breathe,8,2,COAT_L],
      [13,20,14,2,COAT_D],[12,13,4,4,COAT_L],
      // Arm resting cleanly across the torso.
      [16,16,10,3,O],[17,17,8,2,COAT_D],[24,18,4,3,O],[25,19,3,2,SKIN],
      // One raised knee, with the shin descending unmistakably to its boot.
      [25,8,9,9,O],[26,9,7,7,PANTS],[27,10,4,3,PANTS_L],
      [31,14,6,10,O],[32,15,4,8,PANTS],[34,22,7,3,O],[35,22,6,2,BOOT],
      // The far leg extends horizontally beneath the torso.
      [19,22,18,4,O],[20,23,15,2,PANTS],[36,22,8,4,O],[38,23,6,2,BOOT],
      // A separate upright bottle at the far right, away from the anatomy.
      [43,16,3,9,O],[44,17,1,7,GLASS],[43,15,3,2,GLASS_L],[44,14,1,2,O]
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

  // NYC Con Ed street steam stack: a tall, slender orange-and-white striped
  // tube - much taller than wide - with a ribbed collar joint near the mouth,
  // a yellow hazard placard, a compact traffic-cone base, and a two-frame
  // vertical steam plume off the top.
  drawSteamStackObstacle(key, flip) {
    const O=0x4a2822,D=0xa43f27,M=COLORS.coneOrange,L=0xf08a45,W=0xe7ddd1,WS=0xbebbc0,WH=0xf7f5ef,SOOT=0x3b3736;
    const COL=0x8f8a82,COLH=0xb7b2a8,COLD=0x5f5a52,SIGN=0xe8c53a;
    const steam=flip
      ? [ [15,1,12,5,WH],[12,4,17,6,WS],[14,9,13,4,WH],[6,3,7,4,WS],[3,7,6,3,WH],[19,0,5,3,WS] ]
      : [ [17,0,10,5,WH],[15,4,13,6,WS],[17,9,11,4,WH],[11,5,6,4,WS],[9,9,5,3,WH] ];
    this.drawObstacleTexture(key,34,52,[
      ...steam,
      // Soot-rimmed mouth, ribbed collar joint, then a tall slender tube.
      [20,11,10,3,O],[21,11,8,2,SOOT],
      [19,14,12,3,O],[19,14,12,1,COLH],[20,15,10,1,COL],[20,16,10,1,COLD],
      [21,17,8,27,O],
      [22,17,6,3,D],
      [22,20,6,4,M],[22,20,2,4,L],
      [22,24,6,3,W],[22,24,6,1,WH],
      [22,27,6,4,M],[22,27,2,4,L],
      [22,31,6,3,W],[22,31,6,1,WH],
      [22,34,6,4,M],[22,34,2,4,L],
      [22,38,6,3,W],[22,38,6,1,WH],
      [22,41,6,3,M],[22,41,2,3,L],
      // Yellow hazard diamond bolted to the tube.
      [24,25,4,4,O],[25,25,2,3,SIGN],[24,26,4,2,SIGN],[25,24,1,1,SIGN],
      // Compact safety-cone base.
      [18,43,14,5,O],[19,43,12,5,M],[21,44,7,2,L],[20,47,10,3,M],
      [15,48,19,3,O],[16,48,17,2,L],[14,50,20,2,O],[16,50,16,1,M],
      // Reflective scuffs.
      [23,35,2,1,0xc7beb2],[20,49,2,1,D]
    ]);
  }

  drawHydrantObstacle(key, flip, extended = false) {
    const O=0x51251f,D=0xa63b2c,M=0xd95237,L=0xf27a54,STEEL=0xb8c2c7,W=0xc9edf2,HI=0xf2ffff;
    // Short jet arcs up and comes back down steeply near mid-texture, leaving
    // room for a real splash on the pavement rather than clipping off the edge.
    const shortSpray=flip
      ? [[16,14,6,3,HI],[19,11,6,4,W],[23,9,6,4,HI],[27,10,5,4,W],[30,13,4,5,HI],[31,17,3,5,W],[31,21,3,3,HI]]
      : [[16,14,6,3,W],[19,11,6,4,HI],[23,9,6,4,W],[27,10,5,4,HI],[30,13,4,5,W],[31,17,3,5,HI],[31,21,3,3,W]];
    // Long jet tapers: a solid sheet at the nozzle, thick dashes through the
    // middle, then scattered droplets fading and arcing down - so it reads as
    // water thrown from the hydrant, not a bar across the whole lane.
    const longSpray=flip
      ? [[17,13,7,5,HI],[19,12,7,3,W],[22,11,7,3,HI],[26,11,6,3,W],[30,12,5,3,HI],
         [35,12,4,2,W],[41,11,4,2,HI],[47,11,4,2,W],[52,12,3,2,HI],
         [58,12,2,2,W],[63,13,2,2,HI],[68,14,2,2,W],[72,16,2,2,HI],[76,18,1,2,W],[80,21,1,2,HI],[83,24,1,2,W],
         [46,9,1,1,W],[56,10,1,1,HI],[67,12,1,1,W]]
      : [[17,13,7,5,W],[19,12,7,3,HI],[22,11,7,3,W],[26,11,6,3,HI],[30,12,5,3,W],
         [35,12,4,2,HI],[41,11,4,2,W],[47,11,4,2,HI],[52,12,3,2,W],
         [58,12,2,2,HI],[63,13,2,2,W],[68,14,2,2,HI],[72,16,2,2,W],[76,18,1,2,HI],[80,21,1,2,W],[83,24,1,2,HI],
         [45,9,1,1,HI],[55,10,1,1,W],[66,11,1,1,HI]];
    const spray=extended?longSpray:shortSpray;
    // Where the arc comes down: a kicked-up splash crown and a wet puddle
    // spreading on the pavement. W/HI swap with the spray shimmer.
    const splash=extended
      ? (flip
        ? [[77,23,12,2,HI],[78,22,7,1,W],[75,21,2,2,HI],[86,21,2,2,W],[82,20,1,2,HI],
           [74,25,15,1,0x9adfe6],[78,24,10,1,0xc6eef2]]
        : [[77,23,12,2,W],[78,22,7,1,HI],[75,21,2,2,W],[86,21,2,2,HI],[82,20,1,2,W],
           [74,25,15,1,0x9adfe6],[78,24,10,1,0xc6eef2]])
      : (flip
        ? [[28,22,10,2,HI],[29,21,6,1,W],[26,20,2,2,HI],[34,19,2,3,W],[31,18,1,2,HI],[37,21,1,3,W],
           [23,25,15,1,0x8fd6de],[27,24,10,1,0xc6eef2],[23,26,15,1,0x63aeb7],[24,23,1,1,W],[36,23,1,1,HI]]
        : [[28,22,10,2,W],[29,21,6,1,HI],[26,20,2,2,W],[34,19,2,3,HI],[31,18,1,2,W],[37,21,1,3,HI],
           [23,25,15,1,0x8fd6de],[27,24,10,1,0xc6eef2],[23,26,15,1,0x63aeb7],[24,23,1,1,HI],[36,23,1,1,W]]);
    this.drawObstacleTexture(key,extended?90:38,28,[...spray, ...splash,
      [7,5,10,3,O],[9,3,6,3,O],[10,3,4,2,STEEL],[5,7,14,3,O],[6,7,12,2,L],
      [7,9,10,15,O],[8,9,8,14,M],[9,10,2,12,L],[13,10,3,13,0xb8432c],[5,12,4,7,O],[3,13,4,5,O],[4,14,3,3,M],
      [16,11,4,8,O],[17,12,2,6,STEEL],[6,19,12,5,O],[7,19,10,3,D],[3,23,19,4,O],[5,23,15,2,L]
    ]);
  }

  drawShoppingCartObstacle(key, roll) {
    const O=0x22252a,D=0x50575d,M=0x818a8f,L=0xcbd0d1,R=0xa84b42,B=0x435d78;
    const BAG=0x9a7c50,BAGHI=0xb89463,BAGDK=0x836542,BOTL=0x6f8a5f,BOTLHI=0x8fb07d;
    const wheels=roll
      ? [[10,34,10,8,O],[13,36,4,2,L],[39,34,10,8,O],[42,36,4,2,L],
         [14,35,2,6,M],[11,38,8,2,M],[43,35,2,6,M],[40,38,8,2,M]]
      : [[10,34,10,8,O],[14,35,2,6,M],[11,37,8,2,M],[39,34,10,8,O],
         [43,35,2,6,M],[40,37,8,2,M],[13,36,4,2,L],[42,36,4,2,L]];
    this.drawObstacleTexture(key,56,42,[
      // Tall rear push frame and broad colored handle grip.
      [2,4,15,4,O],[2,2,12,3,R],[14,5,4,28,O],[15,6,2,26,L],
      // One paper grocery bag rides above the cage rim; a bottle leans out.
      [22,3,13,5,O],[23,1,10,3,O],[24,4,11,16,O],[25,4,9,15,BAG],[25,4,9,2,BAGHI],[25,10,9,1,BAGDK],[26,2,6,2,BAG],
      [38,2,4,11,O],[39,2,2,10,BOTL],[39,1,2,2,O],[39,3,1,4,BOTLHI],
      // Sloped cage perimeter: wide mouth, narrower floor, stepped front.
      [15,9,38,3,O],[16,10,36,1,L],[16,11,3,19,O],[18,28,31,3,O],
      [50,11,4,5,O],[49,15,4,6,O],[48,20,4,6,O],[47,25,4,5,O],
      // Bright wire grid with transparent cells between each bar.
      [19,11,2,18,M],[26,11,2,18,L],[33,11,2,18,M],[40,11,2,18,L],[47,11,2,16,M],
      [17,14,35,2,M],[17,20,34,2,L],[18,26,31,2,M],
      // Diagonal cross-members read the frame as a cart cage, not a box.
      [19,27,2,2,L],[24,24,2,2,L],[29,21,2,2,L],[34,18,2,2,L],[39,15,2,2,L],[44,13,2,2,L],
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
    const SKIN=0xb97852,SKINL=0xd79a6e,HAIR=0x3a2923,APRON=0xe2ddd0,SHIRT=0x35617a;
    this.drawObstacleTexture(key,44,64,[
      // Broad alternating-panel umbrella with a scalloped valance.
      [18,1,8,1,O],[11,2,22,2,O],[6,4,32,2,O],[3,6,38,4,O],[1,9,42,3,O],
      [18,2,8,2,R],[12,3,8,3,NAVY],[24,3,8,3,NAVY],[7,5,10,4,R],[17,4,10,6,R],[27,5,10,4,R],
      [3,7,7,3,NAVY],[10,8,7,2,NAVY],[27,8,7,2,NAVY],[34,7,7,3,NAVY],
      [2,10,7,2,NAVY],[10,10,7,2,R],[18,10,8,2,R],[27,10,7,2,R],[35,10,7,2,NAVY],
      // Center pole visibly connects canopy to cart.
      [21,11,3,32,O],[22,11,1,32,STEEL],
      // Vendor working behind the cart: cap, face, apron, and serving arm.
      [29,14,8,2,O],[27,16,11,3,NAVY],[26,18,3,2,NAVY],
      [29,19,8,8,HAIR],[28,19,8,7,SKIN],[29,20,6,5,SKINL],[34,21,1,1,O],
      [28,26,10,11,O],[29,27,8,10,SHIRT],[31,28,5,9,APRON],[32,29,3,7,L],
      [27,27,4,4,SHIRT],[24,29,6,3,SKIN],[23,30,3,2,SKINL],
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
      // Beefier rounded single-space meter head so it still dominates the pole.
      [5,1,8,1,O],[2,2,14,2,O],[0,4,18,6,O],[0,8,18,10,O],
      [6,2,6,1,HI],[3,3,12,2,L],[1,5,16,5,M],[1,9,16,8,D],
      // Arched glass timer window and small mechanical dial.
      [3,5,12,8,O],[4,5,10,7,GLASS],[5,6,7,2,HI],[7,9,4,2,D],[9,6,1,5,M],
      // Simple coin slot and traditional lower round mechanism.
      [1,14,16,4,O],[2,14,14,2,L],[3,17,12,8,O],[4,17,10,7,BLUE],
      [5,18,6,2,HI],[11,18,2,3,R],[5,21,2,2,G],[9,21,3,2,DEEP],
      [4,24,10,3,O],[6,24,6,2,M],[8,24,2,2,L],
      // Long, slender cast-metal pole—the defining classic silhouette.
      [7,26,4,29,O],[8,26,2,29,M],[9,27,1,27,L],
      [6,54,6,3,O],[7,54,4,2,HI],[5,56,8,3,O],[3,59,12,1,O]
    ]);
  }

  drawScurryingRatsObstacle(key, stride) {
    const O=0x171414,D=0x4b3731,M=0x765548,L=0xa77b68,SM=0x60463d,SL=0x916b5d,TAIL=0xc49a89,EYE=0xe7cf58;
    const b = stride ? 1 : 0;
    const legs = stride
      ? [[8,18,3,3,O],[16,18,3,3,O],[31,18,2,3,O],[38,18,2,3,O]]
      : [[10,18,3,3,O],[18,18,3,3,O],[32,18,2,3,O],[39,18,2,3,O]];
    this.drawObstacleTexture(key,44,22,[
      // Large lead rat faces left: pointed snout, separate ear, arched back.
      [1,13-b,7,6,O],[0,16-b,3,2,O],[3,14-b,4,3,M],[5,13-b,1,1,EYE],
      [5,9-b,5,5,O],[6,10-b,3,3,L],
      [7,10-b,15,9,O],[9,8-b,10,4,O],[8,11-b,13,6,D],[10,9-b,8,3,M],[11,10-b,5,1,L],
      // Its thin tail curls upward entirely inside its own half of the frame.
      [20,12-b,3,2,TAIL],[22,10-b,2,3,TAIL],[23,7-b,2,3,TAIL],[24,5-b,2,3,TAIL],[23,4-b,3,1,TAIL],
      // Smaller trailing rat also faces left, separated by clear air.
      [27,15,5,4,O],[26,17,3,1,O],[28,15,3,2,SM],[30,14,1,1,EYE],
      [30,12,4,4,O],[31,13,2,2,SL],
      [32,13,10,6,O],[33,12,7,3,O],[33,14,8,4,SM],[35,13,4,1,SL],
      [40,13,2,2,TAIL],[42,11,2,3,TAIL],[43,9,1,3,TAIL],
      ...legs
    ]);
  }

  drawCopObstacle(key, phase) {
    const O=0x151923,N=0x263a5a,B=0x355783,L=0x6686aa,SK=0xc98b75,S=0xe6ad92,G=0xd2b750,SHOE=0x11141b,CLUB=0x4d3528,CLUBL=0x805c43;
    const BAND=0xc8cdd6,YOKE=0x4f7bb0,BADGE=0xe8c86a,BADGEH=0xfff2c0;
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
      [[19,20,5,7,O],[20,15,4,7,B],[20,12,4,4,S]],
      [[20,21,5,7,O],[19,16,5,7,B],[18,12,4,5,S]],
      [[20,21,5,7,O],[17,17,6,6,B],[15,13,5,5,S]],
      [[20,21,5,7,O],[19,16,5,7,B],[18,12,4,5,S]]
    ][phase];
    const club=[
      [[24,1,4,5,CLUB],[22,5,4,5,CLUB],[20,9,4,5,CLUB],[24,1,2,4,CLUBL]],
      [[19,10,4,5,CLUB],[21,6,4,5,CLUB],[23,2,4,5,CLUB],[24,2,2,4,CLUBL]],
      [[16,11,4,5,CLUB],[13,8,4,5,CLUB],[10,5,4,5,CLUB],[7,2,4,5,CLUB],[8,2,2,4,CLUBL]],
      [[19,10,4,5,CLUB],[18,6,4,5,CLUB],[17,2,4,5,CLUB],[18,2,2,4,CLUBL]]
    ][phase];
    const body=[
      // Hat with a silver band, face, torso with a light shoulder yoke and a
      // gold badge glint - all readable against dark asphalt at night.
      [7,1+bob,10,3,O],[5,4+bob,14,3,O],[7,3+bob,10,2,N],[7,3+bob,10,1,BAND],
      [8,6+bob,8,7,O],[9,6+bob,6,6,S],[10,7+bob,2,1,SK],[14,8+bob,1,1,O],
      [6,12+bob,12,15,O],[7,12+bob,10,14,N],[7,12+bob,10,2,YOKE],[8,13+bob,4,3,B],[13,13+bob,3,3,L],
      [11,14+bob,2,3,G],[9,16+bob,2,2,BADGE],[9,16+bob,1,1,BADGEH],[7,18+bob,10,2,O],
      ...arms,...legs
    ].map(([x,y,w,h,color])=>[x+3,y+10,w,h,color]);
    this.drawObstacleTexture(key,30,48,[...club,...raisedArm,...body]);
  }

  drawMattTexture(key, pose) {
    const O=0x171923,HAIR=0x2b211f,SK=0xc88f75,SKL=0xe1aa8e,SHIRT=0x42648a,LITE=0x6689ad,PANTS=0x303743,SHOE=0x17191e;
    const leftArm = pose === 'hug'
        ? [[2,16,10,4,O],[3,17,9,2,SHIRT],[1,18,4,3,SK]]
        : [[4,15,4,14,O],[5,16,2,12,SHIRT],[4,28,4,3,SK]];
    const rightArm = pose === 'pat'
      ? [[17,15,4,8,O],[18,16,2,7,SHIRT],[20,21,4,3,SK]]
      : [[17,15,4,14,O],[18,16,2,12,SHIRT],[18,28,4,3,SK]];
    this.drawObstacleTexture(key,24,40,[
      // Matt is deliberately a head taller than Nicole, with a dark-hair
      // silhouette that remains distinct against the bright dawn sky.
      [8,1,10,4,O],[7,3,12,6,O],[8,2,10,5,HAIR],
      [9,6,9,8,O],[10,6,7,7,SK],[11,7,3,2,SKL],[16,8,1,1,O],
      [8,13,11,16,O],[9,14,9,14,SHIRT],[10,15,3,9,LITE],
      ...leftArm,...rightArm,
      [8,28,6,10,O],[9,29,4,8,PANTS],[15,28,6,10,O],[16,29,4,8,PANTS],
      [7,37,8,3,SHOE],[15,37,8,3,SHOE]
    ]);
  }

  // Two complete high-top sneakers arranged diagonally. Keeping both full
  // silhouettes readable works better at gameplay scale than tucking a tiny
  // second shoe behind one oversized shoe.
  drawPinkSneakerPickup() {
    const O=0x481033,P=0xff3f9b,PD=0xc72472,PL=0xff91c8,HI=0xffd9eb,
      SOLE=0xfff7fb,SOLD=0xcabcc5,CY=0x62efff,LACE=0xffffff,GLOW=0xffef6b;
    const shoe=(x,y,pink,detail)=>[
      // High cuff, heel, long vamp and a clearly upturned toe.
      [x+2,y,8,3,O],[x+1,y+2,10,8,O],[x+2,y+2,8,7,pink],
      [x+8,y+4,11,7,O],[x+9,y+5,10,5,pink],
      [x+18,y+6,7,5,O],[x+18,y+7,6,3,detail],[x+24,y+7,2,3,O],
      // Bright sole and cyan energy stripe separate from the pink upper.
      [x,y+9,26,4,O],[x+1,y+9,24,2,SOLE],[x+2,y+11,22,1,SOLD],
      [x+3,y+8,19,1,CY],
      // Tongue, eye stays, and two unmistakable crossing laces.
      [x+8,y+1,5,6,O],[x+9,y+2,3,5,detail],
      [x+9,y+4,7,1,LACE],[x+10,y+6,7,1,LACE],
      [x+3,y+2,4,1,HI]
    ];
    this.drawObstacleTexture('pickup-pink-sneakers',40,28,[
      // Back shoe is darker and higher; front shoe is brighter and lower.
      ...shoe(12,1,PD,P),
      ...shoe(2,14,P,PL),
      // Sparse four-point stars stay outside the footwear silhouettes.
      [3,3,1,5,GLOW],[1,5,5,1,GLOW],[36,20,1,5,CY],[34,22,5,1,CY],
      [33,1,1,3,HI],[32,2,3,1,HI]
    ]);
  }

  drawZoomiesTreat() {
    const O=0x5b3218,D=0xa85d24,B=0xd98a3a,L=0xf2bc64,HI=0xffe3a1,CY=0x55eaff,PINK=0xff4b9b;
    this.drawObstacleTexture('pickup-zoomies-treat',30,22,[
      // Cyan and pink glints retain the established collectible language.
      [2,2,1,4,CY],[0,4,5,1,CY],[27,1,1,4,PINK],[25,3,5,1,PINK],
      [3,18,1,3,PINK],[2,19,3,1,PINK],[27,17,1,3,CY],[26,18,3,1,CY],
      // Large golden bone biscuit with four rounded knuckles.
      [3,6,6,4,O],[2,8,5,6,O],[4,12,6,4,O],
      [21,6,6,4,O],[23,8,5,6,O],[20,12,6,4,O],
      [7,8,16,7,O],[8,9,14,5,B],
      [4,7,4,3,L],[3,9,4,4,B],[5,12,4,3,L],
      [22,7,4,3,L],[23,9,4,4,B],[21,12,4,3,L],
      [9,9,12,1,HI],[9,13,12,1,D],
      // Baked dimples make it unmistakably edible rather than a bone icon.
      [11,10,2,2,D],[16,11,2,2,D],[20,9,1,1,O]
    ]);
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

  // Hostile crow: a mean, angular silhouette so it can't be mistaken for the
  // bonus pigeon at speed - a lean body, a hunched head with a heavy brow, a
  // bigger red eye, an open pointed beak, and a notched wedge tail. Only the
  // long swept wing changes across the three flap frames.
  drawCrowFrame(key, wingPose) {
    const O=0x090b10,D=0x181c25,M=0x303743,L=0x596270,EYE=0xe64c45,EYEK=0xff7a68;
    const wings = wingPose === 0
      ? [[7,1,6,3,O],[10,3,7,2,O],[14,4,7,2,O],[16,4,3,1,O],[8,2,4,2,L],[11,3,5,1,M]]
      : wingPose === 1
        ? [[7,5,8,3,O],[13,6,8,2,O],[19,6,6,2,O],[24,6,2,1,O],[8,5,6,2,L],[14,6,6,1,M]]
        : [[7,7,7,3,O],[12,9,7,2,O],[17,10,6,2,O],[22,11,2,1,O],[8,7,5,2,L],[13,9,5,1,M]];
    this.drawObstacleTexture(key,26,15,[
      ...wings,
      // Lean body.
      [5,5,13,6,O],[6,6,11,4,D],[7,7,7,2,M],
      // Notched wedge tail trailing back.
      [19,7,6,3,O],[22,6,3,2,O],[23,8,3,2,O],[21,7,4,1,M],
      // Hunched head with a heavy brow ridge.
      [2,6,6,5,O],[3,7,4,3,D],[3,6,3,1,O],
      // Open pointed beak, angled down.
      [0,8,3,1,O],[0,9,2,1,O],[2,10,2,1,O],
      // Bigger angry eye.
      [3,7,2,2,EYE],[3,7,1,1,EYEK],
      // Feet tucked.
      [9,10,2,2,O],[13,10,2,2,O]
    ]);
  }

  drawSeagullFrame(key, wingPose) {
    const O=0x313844,D=0x7d8791,W=0xf4f1e6,L=0xd7dce0,BEAK=0xe8a333,EYE=0x111820;
    const wings = wingPose === 0
      ? [[9,0,6,9,O],[10,1,5,7,W],[14,4,8,5,O],[15,5,6,3,L]]
      : wingPose === 1
        ? [[8,6,14,5,O],[9,7,12,3,W],[16,9,8,3,O],[17,9,6,2,L]]
        : [[10,4,10,6,O],[11,5,8,3,W],[15,8,7,5,O],[16,9,5,3,L]];
    this.drawObstacleTexture(key,30,15,[
      ...wings,
      [7,6,15,6,O],[8,6,13,5,W],[10,7,8,3,L],[3,5,7,6,O],[4,6,6,4,W],
      [0,7,5,2,BEAK],[5,6,1,1,EYE],
      [21,7,9,3,O],[22,7,7,2,W],[25,6,5,2,O]
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
    const colors = [0x686767, 0x626769, 0x656965, 0x706d67, 0x696767, 0x74736f, 0x676369];
    let x = 18;
    let index = 0;
    while (x < tileWidth - 90) {
      const bodyW = Phaser.Math.Between(62, 86);
      const bodyH = Phaser.Math.Between(14, 19);
      const roofH = Phaser.Math.Between(11, 17);
      const bottom = tileHeight - 5;
      const bodyY = bottom - bodyH;
      const color = colors[index % colors.length];
      const dark = Phaser.Display.Color.IntegerToColor(color).darken(22).color;
      const light = Phaser.Display.Color.IntegerToColor(color).lighten(13).color;
      const wagon = index % 4 === 1;
      const van = index % 7 === 5;
      const coupe = index % 5 === 2;
      const taxi = index % 6 === 3;
      // Tires sit behind the body.
      g.fillStyle(0x17191c, 1);
      g.fillCircle(x + bodyW * 0.22, bottom - 2, 7);
      g.fillCircle(x + bodyW * 0.78, bottom - 2, 7);
      g.fillStyle(0x858b8d, 1);
      g.fillCircle(x + bodyW * 0.22, bottom - 2, 3);
      g.fillCircle(x + bodyW * 0.78, bottom - 2, 3);
      // Tapered nose and tail keep the lower shell from reading as a box.
      g.fillStyle(0x202328, 1);
      g.fillPoints([
        { x, y: bodyY + 6 }, { x: x + 6, y: bodyY },
        { x: x + bodyW - 10, y: bodyY }, { x: x + bodyW, y: bodyY + 5 },
        { x: x + bodyW - 2, y: bottom }, { x: x + 2, y: bottom }
      ], true);
      g.fillStyle(color, 1);
      g.fillPoints([
        { x: x + 2, y: bodyY + 6 }, { x: x + 7, y: bodyY + 2 },
        { x: x + bodyW - 11, y: bodyY + 2 }, { x: x + bodyW - 2, y: bodyY + 6 },
        { x: x + bodyW - 4, y: bottom - 2 }, { x: x + 4, y: bottom - 2 }
      ], true);
      g.fillStyle(light, 1);
      g.fillRect(x + 8, bodyY + 2, bodyW - 20, 1);
      g.fillStyle(dark, 1);
      g.fillRect(x + 3, bottom - 8, bodyW - 6, 4);
      // Recognizable cabin profiles: squared wagon/van or a sedan/coupe
      // with visibly raked windshield and rear glass.
      const cabinX = Math.round(x + bodyW * (van ? 0.18 : wagon ? 0.22 : coupe ? 0.34 : 0.28));
      const cabinW = Math.round(bodyW * (van ? 0.64 : wagon ? 0.58 : coupe ? 0.42 : 0.5));
      const roofY = bodyY - roofH;
      g.fillStyle(0x202328, 1);
      g.fillPoints([
        { x: cabinX - 2, y: bodyY + 1 },
        { x: cabinX + (van || wagon ? 1 : 6), y: roofY - 2 },
        { x: cabinX + cabinW - (coupe ? 10 : 5), y: roofY - 2 },
        { x: cabinX + cabinW + 3, y: bodyY + 1 }
      ], true);
      g.fillStyle(color, 1);
      g.fillRect(cabinX, bodyY - 3, cabinW, 5);
      g.fillPoints([
        { x: cabinX, y: bodyY },
        { x: cabinX + (van || wagon ? 3 : 8), y: roofY },
        { x: cabinX + cabinW - (coupe ? 11 : 6), y: roofY },
        { x: cabinX + cabinW, y: bodyY }
      ], true);
      const frontGlassX = cabinX + (van || wagon ? 5 : 9);
      const rearGlassX = cabinX + cabinW - (coupe ? 12 : 9);
      g.fillStyle(0x4b5154, 1);
      g.fillPoints([
        { x: frontGlassX, y: roofY + 2 },
        { x: cabinX + Math.round(cabinW * 0.49), y: roofY + 2 },
        { x: cabinX + Math.round(cabinW * 0.49), y: bodyY - 2 },
        { x: cabinX + 3, y: bodyY - 2 }
      ], true);
      g.fillPoints([
        { x: cabinX + Math.round(cabinW * 0.54), y: roofY + 2 },
        { x: rearGlassX, y: roofY + 2 },
        { x: cabinX + cabinW - 3, y: bodyY - 2 },
        { x: cabinX + Math.round(cabinW * 0.54), y: bodyY - 2 }
      ], true);
      g.fillStyle(0x686f72, 1);
      g.fillRect(frontGlassX + 1, roofY + 2, Math.max(5, cabinW * 0.28), 2);
      // Door seams, sill, hood and trunk edges make the side elevation read.
      g.fillStyle(dark, 1);
      g.fillRect(cabinX + Math.round(cabinW * 0.51), bodyY + 2, 1, bodyH - 7);
      g.fillRect(x + 7, bodyY + 3, Math.max(8, cabinX - x - 8), 1);
      g.fillRect(cabinX + cabinW, bodyY + 3, Math.max(7, x + bodyW - cabinX - cabinW - 6), 1);
      g.fillRect(x + 8, bottom - 5, bodyW - 16, 1);
      // Bumpers, lights, handles, and occasional taxi roof sign.
      g.fillStyle(0x929491, 1);
      g.fillRect(x, bottom - 7, 5, 3);
      g.fillRect(x + bodyW - 5, bottom - 7, 5, 3);
      g.fillStyle(0x747166, 1);
      g.fillRect(x + bodyW - 3, bodyY + 4, 3, 4);
      g.fillStyle(0x685b5b, 1);
      g.fillRect(x, bodyY + 4, 3, 4);
      g.fillStyle(0x929592, 1);
      g.fillRect(x + bodyW * 0.54, bodyY + 4, 6, 1);
      if (taxi) {
        g.fillStyle(0x22252a, 1);
        g.fillRect(cabinX + cabinW * 0.38, roofY - 5, 12, 2);
        g.fillStyle(0x756b53, 1);
        g.fillRect(cabinX + cabinW * 0.4, roofY - 8, 9, 3);
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
      frames: [{ key: 'obstacle-trashbin1' }, { key: 'obstacle-trashbin2' }],
      frameRate: 5,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-cat-run',
      frames: [
        { key: 'obstacle-cat0' },
        { key: 'obstacle-cat1' },
        { key: 'obstacle-cat2' },
        { key: 'obstacle-cat3' }
      ],
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'obstacle-cat-hiss',
      frames: [{ key: 'obstacle-cat-hiss0' }, { key: 'obstacle-cat-hiss1' }],
      frameRate: 6,
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
      key: 'obstacle-sleeping-breathe',
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
      key: 'obstacle-rats-scurry',
      frames: [
        { key: 'obstacle-rats0' },
        { key: 'obstacle-rats1' },
        { key: 'obstacle-rats0' }
      ],
      frameRate: 10,
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
      key: 'seagull-fly',
      frames: [
        { key: 'seagull-fly0' },
        { key: 'seagull-fly1' },
        { key: 'seagull-fly2' },
        { key: 'seagull-fly1' }
      ],
      frameRate: 8,
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
    this.anims.create({
      key: 'dog-attack',
      frames: [{ key: 'dog-attack0' }, { key: 'dog-attack1' }],
      frameRate: 10,
      repeat: -1
    });
    this.anims.create({
      key: 'dog-lick',
      frames: [
        { key: 'dog-lick0' }, { key: 'dog-lick0' },
        { key: 'dog-lick1' }, { key: 'dog-lick0' }
      ],
      frameRate: 4,
      repeat: -1
    });

    this.scene.start('Play');
  }
}
