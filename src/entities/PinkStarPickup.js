import { Entity } from './Entity.js';
import { GAME_WIDTH } from '../config.js';

export class PinkStarPickup extends Entity {
  constructor(scene, speed) {
    const sprite = scene.physics.add.sprite(GAME_WIDTH + 45, 180, 'pickup-pink-star');
    super(scene, sprite);
    this.baseY = sprite.y;
    this.spawnedAt = scene.time.now;
    this.sprite.setDisplaySize(48, 48).setDepth(14);
    this.sprite.body.setAllowGravity(false);
    this.setSpeed(speed);
  }

  setSpeed(speed) {
    this.sprite.setVelocityX(-speed * 0.74);
  }

  onUpdate(time) {
    const phase = (time - this.spawnedAt) * 0.006;
    this.sprite.y = this.baseY + Math.sin(phase) * 10;
    this.sprite.setAngle(Math.sin(phase * 0.6) * 10);
    this.sprite.setAlpha(0.82 + (Math.sin(phase * 2.2) + 1) * 0.09);
    if (this.sprite.x < -60) this.destroy();
  }

  collect() {
    if (!this.alive) return;
    this.scene.activatePinkStar(this.sprite.x, this.sprite.y);
    this.destroy();
  }
}
