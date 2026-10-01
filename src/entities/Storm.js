import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, STORM } from '../config.js';

// Late-night winter storm. One pool of particles is recycled rather than
// created every frame; each time a particle respawns it picks rain, sleet or
// snow according to how far through the storm we are, so the weather changes
// gradually rather than switching. Lightning (with delayed thunder) belongs to
// the rain half only. Snow cover builds on the ground as the storm turns and
// then stays: see `cover`, which PlayScene hands to Ground.
export class Storm {
  constructor(scene) {
    this.scene = scene;
    this.active = false;
    this.clearing = false;
    this.hasStarted = false;
    this.progress = 0;
    this.cover = 0;
    this.nextLightningAt = Infinity;
    this.drops = Array.from({ length: STORM.rainDropCount }, () => {
      const drop = scene.add
        .rectangle(
          Phaser.Math.Between(0, GAME_WIDTH),
          Phaser.Math.Between(-GAME_HEIGHT, GAME_HEIGHT),
          1,
          8,
          0x779bb8,
          0.3
        )
        .setDepth(7)
        .setVisible(false);
      this.restyle(drop);
      return drop;
    });
    this.flash = scene.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0xddeaff, 1)
      .setDepth(18)
      .setAlpha(0);
  }

  // Weights for rain / sleet / snow at the current point in the storm, easing
  // across each boundary instead of flipping.
  mix() {
    const p = this.progress;
    const blend = 0.08;
    const toSleet = Phaser.Math.Clamp((p - (STORM.rainEnd - blend)) / (2 * blend), 0, 1);
    const toSnow = Phaser.Math.Clamp((p - (STORM.sleetEnd - blend)) / (2 * blend), 0, 1);
    return { rain: 1 - toSleet, sleet: toSleet * (1 - toSnow), snow: toSnow };
  }

  // Gives a (re)spawned particle the look and motion of rain, sleet or snow.
  restyle(drop) {
    const { rain, sleet } = this.mix();
    const roll = Math.random();
    if (roll < rain) {
      drop.setSize(Math.random() < 0.14 ? 2 : 1, Phaser.Math.Between(6, 12));
      drop.setFillStyle(Math.random() < 0.33 ? 0xb8d8ee : 0x779bb8, Phaser.Math.FloatBetween(0.16, 0.38));
      drop.setAngle(14);
      drop.setData('fallSpeed', Phaser.Math.Between(280, 470));
      drop.setData('drift', 70);
      drop.setData('sway', 0);
    } else if (roll < rain + sleet) {
      // Short, fast, pale pellets: slushier and heavier than snow.
      drop.setSize(2, Phaser.Math.Between(3, 5));
      drop.setFillStyle(Math.random() < 0.5 ? 0xdfeaf4 : 0xa9c4da, Phaser.Math.FloatBetween(0.4, 0.7));
      drop.setAngle(10);
      drop.setData('fallSpeed', Phaser.Math.Between(170, 280));
      drop.setData('drift', 55);
      drop.setData('sway', 0);
    } else {
      // Fat, slow flakes that wobble sideways as they fall.
      const size = Phaser.Math.Between(3, 5);
      drop.setSize(size, size);
      drop.setFillStyle(0xffffff, Phaser.Math.FloatBetween(0.7, 1));
      drop.setAngle(0);
      drop.setData('fallSpeed', Phaser.Math.Between(45, 95));
      drop.setData('drift', 28);
      drop.setData('sway', Phaser.Math.FloatBetween(0.6, 1.6));
    }
  }

  start(time) {
    if (this.hasStarted) return;
    this.hasStarted = true;
    this.active = true;
    this.progress = 0;
    this.drops.forEach((drop) => {
      this.restyle(drop);
      drop.setVisible(true);
    });
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

  // elapsed is the run's elapsed seconds; progress is 0-1 through the storm.
  update(time, delta, elapsed) {
    if (this.active) {
      this.progress = Phaser.Math.Clamp(
        (elapsed - STORM.startSeconds) / (STORM.endSeconds - STORM.startSeconds),
        0,
        1
      );
      this.updateCover(delta);
    }
    if (!this.active && !this.clearing) return;
    const seconds = delta / 1000;
    for (const drop of this.drops) {
      drop.y += drop.getData('fallSpeed') * seconds;
      const sway = drop.getData('sway');
      drop.x -= drop.getData('drift') * seconds;
      if (sway) drop.x += Math.sin(time * 0.003 * sway + drop.y * 0.05) * 18 * seconds;
      if (drop.y > GAME_HEIGHT + 18 || drop.x < -12) {
        drop.x = Phaser.Math.Between(20, GAME_WIDTH + 80);
        drop.y = Phaser.Math.Between(-100, -10);
        this.restyle(drop);
      }
    }
    if (this.active && this.progress < STORM.lightningUntil && time >= this.nextLightningAt) {
      this.strike(time);
    }
  }

  // Ground cover only grows (the street stays white once it has settled):
  // slowly through the sleet, then faster as proper snow falls.
  updateCover(delta) {
    const p = this.progress;
    let target = 0;
    if (p > STORM.rainEnd) {
      const sleetT = Phaser.Math.Clamp((p - STORM.rainEnd) / (STORM.sleetEnd - STORM.rainEnd), 0, 1);
      target = sleetT * STORM.coverAfterSleet;
    }
    if (p > STORM.sleetEnd) {
      const snowT = Phaser.Math.Clamp((p - STORM.sleetEnd) / (1 - STORM.sleetEnd), 0, 1);
      target = STORM.coverAfterSleet + snowT * (1 - STORM.coverAfterSleet);
    }
    // Ease toward the target so the build-up is smooth.
    this.cover = Math.max(this.cover, Phaser.Math.Linear(this.cover, target, Math.min(1, delta / 400)));
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
