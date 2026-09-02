import { Entity } from './Entity.js';
import { GAME_WIDTH } from '../config.js';

export class SneakerBoost extends Entity {
  constructor(scene, speed) {
    const sprite = scene.physics.add.sprite(GAME_WIDTH + 45, 205, 'pickup-pink-sneakers');
    super(scene, sprite);
    this.baseY = sprite.y;
    this.spawnedAt = scene.time.now;
    this.collected = false;
    this.sprite.setDisplaySize(54, 38).setDepth(14);
    this.sprite.body.setAllowGravity(false);
    this.setSpeed(speed);
  }

  setSpeed(speed) {
    this.sprite.setVelocityX(-speed * 0.82);
  }

  onUpdate(time) {
    const phase = (time - this.spawnedAt) * 0.006;
    this.sprite.y = this.baseY + Math.sin(phase) * 11;
    this.sprite.setAngle(Math.sin(phase * 0.7) * 5);
    this.sprite.setAlpha(0.78 + (Math.sin(phase * 2) + 1) * 0.11);
    if (this.sprite.x < -70) this.destroy();
  }

  collect() {
    if (!this.alive || this.collected) return;
    this.collected = true;
    this.scene.activateSneakerBoost(this.sprite.x, this.sprite.y);
    this.destroy();
  }
}
