import Phaser from 'phaser';
import { Entity } from './Entity.js';
import { GAME_WIDTH } from '../config.js';

// Rare high-value target. Like the pigeon, it must be struck during a power
// jump, but catching it restores Nicole's complete life-force bar.
export class Seagull extends Entity {
  constructor(scene, speed) {
    const y = Phaser.Math.Between(92, 106);
    const movingLeft = Math.random() < 0.5;
    const sprite = scene.physics.add.sprite(movingLeft ? GAME_WIDTH + 40 : -140, y, 'seagull-fly0');
    super(scene, sprite);

    this.direction = movingLeft ? -1 : 1;
    this.sprite.setDisplaySize(54, 28).setDepth(8);
    this.sprite.setFlipX(!movingLeft);
    this.sprite.body.setAllowGravity(false);
    this.sprite.anims.play('seagull-fly');
    this.setSpeed(speed);
  }

  setSpeed(speed) {
    const magnitude = this.direction < 0 ? speed * 0.76 + 85 : speed * 0.48 + 58;
    this.sprite.setVelocityX(this.direction * magnitude);
  }

  onUpdate() {
    if (
      (this.direction < 0 && this.sprite.x < -65) ||
      (this.direction > 0 && this.sprite.x > GAME_WIDTH + 65)
    ) this.destroy();
  }

  onCollide(player) {
    if (!this.alive || !player.powerJumpUsed) return;
    this.scene.collectSeagull(this.sprite.x, this.sprite.y);
    this.destroy();
  }
}
