import { Entity } from './Entity.js';
import { GAME_WIDTH, PLAYER } from '../config.js';

// Hostile city bird. Unlike the high bonus pigeon, it dives toward Nicole's
// standing path and deals normal damage; jumping over the low pass avoids it.
export class Crow extends Entity {
  constructor(scene, speed) {
    const startY = 80;
    const movingLeft = Math.random() < 0.5;
    const startX = movingLeft ? GAME_WIDTH + 30 : -140;
    const sprite = scene.physics.add.sprite(startX, startY, 'crow-fly0');
    super(scene, sprite);

    this.direction = movingLeft ? -1 : 1;
    this.sprite.setDisplaySize(46, 26).setDepth(9);
    this.sprite.setFlipX(!movingLeft);
    this.sprite.body.setAllowGravity(false);
    this.sprite.anims.play('crow-fly');
    this.setSpeed(speed);

    const travelSeconds = Math.abs(startX - PLAYER.startX) / Math.abs(this.sprite.body.velocity.x);
    this.sprite.setVelocityY((270 - startY) / travelSeconds);
  }

  setSpeed(speed) {
    const magnitude = this.direction < 0 ? speed * 0.8 + 70 : speed * 0.5 + 55;
    this.sprite.setVelocityX(this.direction * magnitude);
  }

  onUpdate() {
    if (
      (this.direction < 0 && this.sprite.x < -55) ||
      (this.direction > 0 && this.sprite.x > GAME_WIDTH + 55) ||
      this.sprite.y > 330
    ) this.destroy();
  }

  onCollide(player) {
    if (!this.alive) return;
    player.onCrowCollide(this);
    this.destroy();
  }
}
