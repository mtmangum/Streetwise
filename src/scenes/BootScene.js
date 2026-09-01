import Phaser from 'phaser';
import { COLORS } from '../config.js';

// Placeholder art generated at runtime. Swap this for real spritesheet
// loading (this.load.spritesheet(...)) once art is ready, and the rest
// of the game doesn't need to change.
export class BootScene extends Phaser.Scene {
  constructor() {
    super('Boot');
  }

  preload() {
    this.generatePlayerPlaceholder();
    this.generateObstaclePlaceholder();
    this.generateGroundPlaceholder();
  }

  generatePlayerPlaceholder() {
    const g = this.add.graphics();
    g.fillStyle(0xf4c542, 1);
    g.fillRect(0, 0, 34, 44);
    g.generateTexture('player', 34, 44);
    g.destroy();
  }

  generateObstaclePlaceholder() {
    const g = this.add.graphics();
    g.fillStyle(COLORS.obstacle, 1);
    g.fillRect(0, 0, 24, 60);
    g.generateTexture('obstacle', 24, 60);
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

  create() {
    this.scene.start('Play');
  }
}
