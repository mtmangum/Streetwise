import Phaser from 'phaser';
import { Entity } from './Entity.js';
import { GAME_WIDTH, GROUND_Y } from '../config.js';

const TEXTURES = ['obstacle-spike', 'obstacle-crate', 'obstacle-barrel'];

// Another Entity subclass. Same base interface as Player, completely
// different behavior — that's the polymorphism payoff: PlayScene's update
// loop treats every entity the same way and each one does its own thing.
export class Obstacle extends Entity {
  constructor(scene, height, speed) {
    const texture = Phaser.Utils.Array.GetRandom(TEXTURES);
    const sprite = scene.physics.add.sprite(GAME_WIDTH + 20, GROUND_Y - height / 2, texture);
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
      // Made it past the player without a hit — reward for the dodge.
      this.scene.onObstacleAvoided();
      this.destroy();
    }
  }

  onCollide(player) {
    if (!this.alive) return;
    player.onCollide(this);
    // Consumed on impact so it can't deal damage again next frame while
    // still overlapping.
    this.destroy();
  }
}
