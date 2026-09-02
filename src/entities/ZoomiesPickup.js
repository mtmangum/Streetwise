import { Entity } from './Entity.js';
import { GAME_WIDTH } from '../config.js';

export class ZoomiesPickup extends Entity {
  constructor(scene, speed) {
    const sprite = scene.physics.add.sprite(GAME_WIDTH + 45, 225, 'pickup-zoomies-treat');
    super(scene, sprite);
    this.baseY = sprite.y;
    this.spawnedAt = scene.time.now;
    this.sprite.setDisplaySize(46, 52).setDepth(14);
    this.sprite.body.setAllowGravity(false);
    this.setSpeed(speed);
  }

  setSpeed(speed) {
    this.sprite.setVelocityX(-speed * 0.78);
  }

  onUpdate(time) {
    const phase = (time - this.spawnedAt) * 0.007;
    this.sprite.y = this.baseY + Math.sin(phase) * 9;
    this.sprite.setAngle(Math.sin(phase) * 8);
    if (this.sprite.x < -60) this.destroy();
  }

  collect() {
    if (!this.alive) return;
    this.scene.activateZoomies(this.sprite.x, this.sprite.y);
    this.destroy();
  }
}
