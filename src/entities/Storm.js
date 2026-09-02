import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, STORM } from '../config.js';

// Late-night foreground weather. Drops are recycled rather than created
// every frame, while lightning uses brief full-screen flashes and a delayed
// chiptune rumble to suggest the strike arriving before its thunder.
export class Storm {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.clearing = false;
    this.hasStarted = false;
    this.nextLightningAt = Infinity;
    this.drops = Array.from({ length: STORM.rainDropCount }, (_, index) => {
      const drop = scene.add
        .rectangle(
          Phaser.Math.Between(0, GAME_WIDTH),
          Phaser.Math.Between(-GAME_HEIGHT, GAME_HEIGHT),
          index % 7 === 0 ? 2 : 1,
          Phaser.Math.Between(6, 12),
          index % 3 === 0 ? 0xb8d8ee : 0x779bb8,
          Phaser.Math.FloatBetween(0.16, 0.38)
        )
        .setAngle(14)
        .setDepth(7)
        .setVisible(false);
      drop.setData('fallSpeed', Phaser.Math.Between(280, 470));
      return drop;
    });
    this.flash = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xddeaff, 1)
      .setDepth(18)
      .setAlpha(0);
  }

  start(time) {
    if (this.hasStarted) return;
    this.hasStarted = true;
    this.active = true;
    this.drops.forEach((drop) => drop.setVisible(true));
    this.nextLightningAt = time + Phaser.Math.Between(2600, 5200);
  }

  stop() {
    if (!this.active) return;
    this.active = false;
    this.clearing = true;
    this.nextLightningAt = Infinity;
    this.flash.setAlpha(0);
    this.scene.tweens.add({
      targets: this.drops,
      alpha: 0,
      duration: 2400,
      ease: 'Quad.easeIn',
      onComplete: () => {
        this.clearing = false;
        this.drops.forEach((drop) => drop.setVisible(false));
      }
    });
  }

  update(time, delta) {
    if (!this.active && !this.clearing) return;
    const seconds = delta / 1000;
    for (const drop of this.drops) {
      drop.y += drop.getData('fallSpeed') * seconds;
      drop.x -= 70 * seconds;
      if (drop.y > GAME_HEIGHT + 18 || drop.x < -12) {
        drop.x = Phaser.Math.Between(20, GAME_WIDTH + 80);
        drop.y = Phaser.Math.Between(-100, -10);
      }
    }
    if (this.active && time >= this.nextLightningAt) this.strike(time);
  }

  strike(time) {
    this.nextLightningAt = time + Phaser.Math.Between(STORM.lightningMinMs, STORM.lightningMaxMs);
    this.flash.setAlpha(0.36);
    this.scene.tweens.add({ targets: this.flash, alpha: 0, duration: 105, ease: 'Quad.easeOut' });
    this.scene.time.delayedCall(145, () => {
      this.flash.setAlpha(0.18);
      this.scene.tweens.add({ targets: this.flash, alpha: 0, duration: 150, ease: 'Quad.easeOut' });
    });
    this.scene.time.delayedCall(280, () => this.scene.audio.thunder());
  }
}
