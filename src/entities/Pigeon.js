import Phaser from 'phaser';
import { Entity } from './Entity.js';
import { GAME_WIDTH } from '../config.js';
import { flyAwayFrightened } from './birdScare.js';

// Optional airborne bonus target. It flies above normal-jump reach and only
// reacts to a powered collision; ordinary contact is harmless.
export class Pigeon extends Entity {
  constructor(scene, speed) {
    const y = Phaser.Math.Between(100, 112);
    const movingLeft = Math.random() < 0.5;
    const sprite = scene.physics.add.sprite(movingLeft ? GAME_WIDTH + 30 : -120, y, 'pigeon-fly0');
    super(scene, sprite);

    this.direction = movingLeft ? -1 : 1;
    this.sprite.setDisplaySize(42, 24).setDepth(8);
    this.sprite.setFlipX(!movingLeft);
    this.sprite.body.setAllowGravity(false);
    this.sprite.anims.play('pigeon-fly');
    this.setSpeed(speed);
  }

  barkAway() {
    if (!this.alive || this.scared) return false;
    flyAwayFrightened(this);
    return true;
  }

  setSpeed(speed) {
    if (this.scared) return;
    const magnitude = this.direction < 0 ? speed * 0.72 + 75 : speed * 0.45 + 50;
    this.sprite.setVelocityX(this.direction * magnitude);
  }

  onUpdate() {
    if (this.scared) {
      if (this.sprite.x > GAME_WIDTH + 50 || this.sprite.y < -40) this.destroy();
      return;
    }
    const player = this.scene.player;
    if (
      player?.hasSneakerBoost &&
      player.powerJumpUsed &&
      Math.abs(this.sprite.x - player.sprite.x) < 62 &&
      Math.abs(this.sprite.y - (player.sprite.y - 30)) < 105
    ) {
      this.onCollide(player);
      return;
    }
    if (
      (this.direction < 0 && this.sprite.x < -50) ||
      (this.direction > 0 && this.sprite.x > GAME_WIDTH + 50)
    ) this.destroy();
  }

  onCollide(player) {
    if (!this.alive || this.scared || !player.powerJumpUsed) return;
    this.scene.collectPigeon(this.sprite.x, this.sprite.y);
    this.destroy();
  }
}
