import { Entity } from './Entity.js';
import { GAME_WIDTH, GROUND_Y } from '../config.js';

// Another Entity subclass. Same base interface as Player, completely
// different behavior — that's the polymorphism payoff: PlayScene's update
// loop treats every entity the same way and each one does its own thing.
export class Obstacle extends Entity {
  constructor(scene, height, speed) {
    const sprite = scene.physics.add.sprite(
      GAME_WIDTH + 20,
      GROUND_Y - height / 2,
      'obstacle'
    );
    super(scene, sprite);

    this.sprite.setDisplaySize(24, height);
    this.sprite.body.setAllowGravity(false);
    this.sprite.setVelocityX(-speed);
  }

  setSpeed(speed) {
    this.sprite.setVelocityX(-speed);
  }

  onUpdate() {
    if (this.sprite.x < -40) {
      this.destroy();
    }
  }

  onCollide(player) {
    player.onCollide(this);
  }
}
