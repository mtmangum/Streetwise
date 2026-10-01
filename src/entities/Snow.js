import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT } from '../config.js';

// Gentle ambient flurries for the Christmas look, always falling (on the start
// menu too). Most flakes sit behind the action; a few drift in front of it.
// The heavier late-night storm is separate (see Storm.js). Flakes are pooled
// and recycled, and lean with the world's scroll speed so they feel part of it.
export class Snow {
  constructor(scene, backCount = 46, frontCount = 12) {
    this.flakes = [];
    const make = (front) => {
      const size = front ? Phaser.Math.Between(3, 4) : Phaser.Math.Between(2, 3);
      const flake = scene.add
        .rectangle(
          Phaser.Math.Between(0, GAME_WIDTH),
          Phaser.Math.Between(0, GAME_HEIGHT),
          size,
          size,
          0xffffff,
          front ? Phaser.Math.FloatBetween(0.55, 0.85) : Phaser.Math.FloatBetween(0.4, 0.8)
        )
        .setDepth(front ? 15 : -3.9);
      flake.setData('fall', front ? Phaser.Math.Between(40, 70) : Phaser.Math.Between(18, 42));
      flake.setData('sway', Phaser.Math.FloatBetween(0.6, 1.5));
      flake.setData('phase', Math.random() * 6.28);
      flake.setData('lean', front ? 0.22 : 0.1);
      this.flakes.push(flake);
    };
    for (let i = 0; i < backCount; i++) make(false);
    for (let i = 0; i < frontCount; i++) make(true);
  }

  update(time, delta, scrollSpeed) {
    const seconds = delta / 1000;
    for (const flake of this.flakes) {
      flake.y += flake.getData('fall') * seconds;
      flake.x += Math.sin(time * 0.0018 * flake.getData('sway') + flake.getData('phase')) * 14 * seconds
        - scrollSpeed * flake.getData('lean') * seconds;
      if (flake.y > GAME_HEIGHT + 6) {
        flake.y = -6;
        flake.x = Phaser.Math.Between(0, GAME_WIDTH + 40);
      }
      if (flake.x < -6) flake.x = GAME_WIDTH + 6;
      else if (flake.x > GAME_WIDTH + 46) flake.x = -6;
    }
  }
}
