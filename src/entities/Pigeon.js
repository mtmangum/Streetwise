import Phaser from 'phaser';
import { Entity } from './Entity.js';
import { GAME_WIDTH } from '../config.js';

// Optional airborne bonus target. It flies above normal-jump reach and only
// reacts to a powered collision; ordinary contact is harmless.
export class Pigeon extends Entity {
  constructor(scene, speed) {
    const y = Phaser.Math.Between(100, 112);
    const sprite = scene.physics.add.sprite(GAME_WIDTH + 30, y, 'pigeon-fly0');
    super(scene, sprite);

    this.sprite.setDisplaySize(42, 24).setDepth(8);
    this.sprite.body.setAllowGravity(false);
    this.sprite.anims.play('pigeon-fly');
    this.setSpeed(speed);
  }

  setSpeed(speed) {
    this.sprite.setVelocityX(-(speed * 0.72 + 75));
  }

  onUpdate() {
    if (this.sprite.x < -50) this.destroy();
  }

  onCollide(player) {
    if (!this.alive || !player.powerJumpUsed) return;
    this.scene.collectPigeon(this.sprite.x, this.sprite.y);
    this.destroy();
  }
}
