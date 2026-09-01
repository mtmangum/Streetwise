import Phaser from 'phaser';
import { COLORS, PARALLAX } from '../config.js';
import { PLAYER_GRID, PLAYER_POSES, playerFrameParts } from '../gfx/playerFrames.js';

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
    this.generateObstacleTextures();
    this.generateGroundPlaceholder();
    this.generateParallaxTextures();
  }

  generatePlayerFrames() {
    for (const pose of PLAYER_POSES) {
      this.drawPlayerFrame(pose, `player-${pose}`);
    }
  }

  drawPlayerFrame(pose, key) {
    const { pixelSize, cols, rows } = PLAYER_GRID;
    const g = this.add.graphics();
    for (const part of playerFrameParts(pose)) {
      g.fillStyle(part.color, 1);
      g.fillRect(part.x * pixelSize, part.y * pixelSize, part.w * pixelSize, part.h * pixelSize);
    }
    g.generateTexture(key, cols * pixelSize, rows * pixelSize);
    g.destroy();
  }

  generateObstacleTextures() {
    this.drawSpikeObstacle('obstacle-spike');
    this.drawCrateObstacle('obstacle-crate');
    this.drawBarrelObstacle('obstacle-barrel');
  }

  drawSpikeObstacle(key) {
    const g = this.add.graphics();
    g.fillStyle(COLORS.obstacle, 1);
    g.fillTriangle(0, 60, 24, 60, 12, 0);
    g.fillStyle(0xffffff, 0.15);
    g.fillTriangle(12, 0, 16, 60, 20, 60);
    g.generateTexture(key, 24, 60);
    g.destroy();
  }

  drawCrateObstacle(key) {
    const g = this.add.graphics();
    g.fillStyle(COLORS.obstacleCrate, 1);
    g.fillRect(0, 0, 24, 60);
    g.fillStyle(COLORS.obstacleCrateDark, 1);
    g.fillRect(0, 0, 24, 4);
    g.fillRect(0, 56, 24, 4);
    g.fillRect(0, 0, 4, 60);
    g.fillRect(20, 0, 4, 60);
    g.fillStyle(COLORS.obstacleCrateLight, 1);
    g.fillRect(10, 4, 4, 52);
    g.fillRect(4, 28, 16, 4);
    g.generateTexture(key, 24, 60);
    g.destroy();
  }

  drawBarrelObstacle(key) {
    const g = this.add.graphics();
    g.fillStyle(COLORS.obstacleBarrel, 1);
    g.fillRoundedRect(0, 0, 24, 60, 6);
    g.fillStyle(COLORS.obstacleBarrelDark, 1);
    g.fillRect(0, 12, 24, 4);
    g.fillRect(0, 28, 24, 4);
    g.fillRect(0, 44, 24, 4);
    g.fillStyle(COLORS.obstacleBarrelLight, 1);
    g.fillRect(4, 4, 3, 52);
    g.generateTexture(key, 24, 60);
    g.destroy();
  }

  generateGroundPlaceholder() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.ground, 1);
    g.fillRect(0, 0, 40, 8);
    g.fillStyle(COLORS.ground, 0.4);
    g.fillRect(0, 0, 40, 2);
    g.generateTexture('groundTile', 40, 8);
    g.destroy();
  }

  generateParallaxTextures() {
    this.drawHillTexture('hillsFar', COLORS.hillFar, PARALLAX.hillsFar.tileWidth, PARALLAX.hillsFar.height);
    this.drawHillTexture('hillsNear', COLORS.hillNear, PARALLAX.hillsNear.tileWidth, PARALLAX.hillsNear.height);
    this.drawCloudTexture('clouds', COLORS.cloud, PARALLAX.clouds.tileWidth, PARALLAX.clouds.height);
  }

  // A stepped "ziggurat" silhouette, tiered from a full-tile-width base so
  // it always tiles seamlessly regardless of how many steps taper above it.
  drawHillTexture(key, color, tileWidth, tileHeight) {
    const g = this.add.graphics();
    g.fillStyle(color, 1);
    const tiers = 5;
    const step = tileHeight / tiers;
    for (let i = 0; i < tiers; i++) {
      const inset = (tileWidth / 2) * (i / tiers);
      g.fillRect(inset, tileHeight - step * (i + 1), tileWidth - inset * 2, step);
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
      key: 'player-idle',
      frames: [{ key: 'player-idle0' }, { key: 'player-idle1' }],
      frameRate: 2,
      repeat: -1
    });
    this.anims.create({
      key: 'player-walk',
      // Slow, chunky cadence on purpose - a fast walk cycle looks jittery
      // at this pixel density and reads more like a period-appropriate gait.
      frames: [
        { key: 'player-walk0' },
        { key: 'player-walk1' },
        { key: 'player-walk2' },
        { key: 'player-walk3' }
      ],
      frameRate: 6,
      repeat: -1
    });
    this.anims.create({
      key: 'player-jump',
      frames: [{ key: 'player-jump0' }],
      frameRate: 1
    });

    this.scene.start('Play');
  }
}
