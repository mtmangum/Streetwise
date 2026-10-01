import { Entity } from './Entity.js';
import { GAME_WIDTH } from '../config.js';

export class CoffeePickup extends Entity {
  constructor(scene, speed) {
    const sprite = scene.physics.add.sprite(GAME_WIDTH + 45, 190, 'pickup-coffee');
    super(scene, sprite);
    this.baseY = sprite.y;
    this.spawnedAt = scene.time.now;
    this.sprite.setDisplaySize(44, 44).setDepth(14);
    this.sprite.body.setAllowGravity(false);
    this.setSpeed(speed);
  }

  setSpeed(speed) {
    this.sprite.setVelocityX(-speed * 0.74);
  }

  onUpdate(time) {
    const phase = (time - this.spawnedAt) * 0.005;
    this.sprite.y = this.baseY + Math.sin(phase) * 8;
    this.sprite.setAngle(Math.sin(phase * 0.7) * 6);
    if (this.sprite.x < -60) this.destroy();
  }

  collect() {
    if (!this.alive) return;
    this.scene.activateCoffee(this.sprite.x, this.sprite.y);
    this.destroy();
  }
}
