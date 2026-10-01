import { Entity } from './Entity.js';
import { GAME_WIDTH } from '../config.js';

export class BarkBlastPickup extends Entity {
  constructor(scene, speed) {
    const sprite = scene.physics.add.sprite(GAME_WIDTH + 45, 185, 'pickup-bark-blast');
    super(scene, sprite);
    this.baseY = sprite.y;
    this.spawnedAt = scene.time.now;
    this.sprite.setDisplaySize(48, 48).setDepth(14);
    this.sprite.body.setAllowGravity(false);
    this.setSpeed(speed);
  }

  setSpeed(speed) {
    this.sprite.setVelocityX(-speed * 0.76);
  }

  onUpdate(time) {
    const phase = (time - this.spawnedAt) * 0.006;
    this.sprite.y = this.baseY + Math.sin(phase) * 9;
    // A little shake, like the bubble is mid-bark.
    this.sprite.setAngle(Math.sin(phase * 4) * 5);
    if (this.sprite.x < -60) this.destroy();
  }

  collect() {
    if (!this.alive) return;
    this.scene.activateBarkBlast();
    this.destroy();
  }
}
