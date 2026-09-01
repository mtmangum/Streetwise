import { Entity } from './Entity.js';
import { GAME_WIDTH, PLAYER } from '../config.js';

// Hostile city bird. Unlike the high bonus pigeon, it dives toward Nicole's
// standing path and deals normal damage; jumping over the low pass avoids it.
export class Crow extends Entity {
  constructor(scene, speed) {
    const startY = 80;
    const sprite = scene.physics.add.sprite(GAME_WIDTH + 30, startY, 'crow-fly0');
    super(scene, sprite);

    this.sprite.setDisplaySize(46, 26).setDepth(9);
    this.sprite.body.setAllowGravity(false);
    this.sprite.anims.play('crow-fly');
    this.setSpeed(speed);

    const travelSeconds = (GAME_WIDTH + 30 - PLAYER.startX) / Math.abs(this.sprite.body.velocity.x);
    this.sprite.setVelocityY((270 - startY) / travelSeconds);
  }

  setSpeed(speed) {
    this.sprite.setVelocityX(-(speed * 0.8 + 70));
  }

  onUpdate() {
    if (this.sprite.x < -55 || this.sprite.y > 330) this.destroy();
  }

  onCollide(player) {
    if (!this.alive) return;
    player.onCrowCollide(this);
    this.destroy();
  }
}
