import Phaser from 'phaser';
import { Entity } from './Entity.js';
import { GAME_WIDTH, GROUND_Y, PLAYER } from '../config.js';

// Day and night rosters are mutually exclusive until dusk (matching the
// "dusk" stop in dayNightPalette.js) - full weight on its own side of that
// line, then a linear handoff from dusk to night so it's all-night by the
// time dayPhase reaches 1. No overlap during the day/afternoon stretch.
const DUSK_START = 2 / 3;

function dayWeight(phase) {
  if (phase <= DUSK_START) return 1;
  return 1 - (phase - DUSK_START) / (1 - DUSK_START);
}

function daylightOnlyWeight(phase) {
  return phase < DUSK_START ? 1 : 0;
}

function halfDayWeight(phase) {
  return dayWeight(phase) * 0.5;
}

function nightWeight(phase) {
  if (phase <= DUSK_START) return 0;
  return (phase - DUSK_START) / (1 - DUSK_START);
}

// Some street props belong in either roster and remain eligible throughout
// the full day-to-night transition.
function allDayWeight() {
  return 1;
}

// Each type has one authored display height and keeps its texture's aspect
// ratio. This gives repeated objects a stable world scale instead of making
// every spawn a randomly taller or shorter version of the same prop.
const TYPES = [
  // Day: sunny neighborhood
  { key: 'obstacle-mailbox', aspect: 22 / 34, height: 56, safeFirst: true, weight: dayWeight },
  { key: 'obstacle-cone', aspect: 18 / 30, height: 46, safeFirst: true, weight: dayWeight },
  { key: 'obstacle-child0', animation: 'obstacle-child-jumprope', aspect: 30 / 28, height: 42, groundOffset: 3, weight: daylightOnlyWeight },
  { key: 'obstacle-trashbin0', animation: 'obstacle-trashbin-flies', aspect: 30 / 36, height: 54, safeFirst: true, weight: dayWeight },
  { key: 'obstacle-crate', aspect: 1, height: 50, safeFirst: true, weight: dayWeight },
  { key: 'obstacle-hydrant0', family: 'hydrant', animation: 'obstacle-hydrant-spray', aspect: 38 / 28, height: 42, groundOffset: 2, weight: halfDayWeight },
  { key: 'obstacle-hydrant-long0', family: 'hydrant', animation: 'obstacle-hydrant-long-spray', aspect: 90 / 28, height: 42, groundOffset: 2, weight: halfDayWeight },
  { key: 'obstacle-shoppingcart0', animation: 'obstacle-shoppingcart-roll', aspect: 56 / 42, height: 68, speedFactor: 1.18, flipX: true, weight: dayWeight },
  { key: 'obstacle-hotdogcart', aspect: 44 / 64, height: 96, weight: dayWeight },
  { key: 'obstacle-parkingmeter', aspect: 18 / 60, height: 75, weight: dayWeight },
  // Night: derelict city
  { key: 'obstacle-cat0', animation: 'obstacle-cat-hiss', aspect: 30 / 27, height: 44, groundOffset: 2, weight: nightWeight },
  { key: 'obstacle-trashfire0', animation: 'obstacle-fire-flicker', aspect: 28 / 36, height: 60, weight: nightWeight },
  { key: 'obstacle-sleeping0', animation: 'obstacle-sleeping-flies', aspect: 48 / 20, height: 28, weight: nightWeight },
  { key: 'obstacle-boombox0', animation: 'obstacle-boombox-boom', aspect: 44 / 28, height: 40, safeFirst: true, weight: allDayWeight },
  { key: 'obstacle-steamstack0', animation: 'obstacle-steamstack-puff', aspect: 34 / 42, height: 76, weight: nightWeight },
  { key: 'obstacle-garbagebags0', animation: 'obstacle-rat-tail', aspect: 48 / 44, height: 118, weight: nightWeight },
  { key: 'obstacle-cop0', animation: 'obstacle-cop-patrol', aspect: 30 / 48, height: 70, chasesAfterAvoid: true, weight: nightWeight },
  { key: 'obstacle-streetwalker0', animation: 'obstacle-streetwalker-idle', aspect: 24 / 38, height: 57, weight: nightWeight }
];

function obstacleFamily(type) {
  return type.family ?? type.key.replace(/\d+$/, '');
}

function pickType(phase, excludedFamily, stationaryOnly, safeFirstOnly) {
  const weighted = TYPES.map((t) => ({
    ...t,
    w: obstacleFamily(t) === excludedFamily ||
      (stationaryOnly && (t.speedFactor !== undefined || t.chasesAfterAvoid)) ||
      (safeFirstOnly && !t.safeFirst)
      ? 0
      : t.weight(phase)
  }));
  const total = weighted.reduce((sum, t) => sum + t.w, 0);
  let roll = Math.random() * total;
  for (const t of weighted) {
    roll -= t.w;
    if (roll <= 0) return t;
  }
  return weighted[weighted.length - 1];
}

// Another Entity subclass. Same base interface as Player, completely
// different behavior — that's the polymorphism payoff: PlayScene's update
// loop treats every entity the same way and each one does its own thing.
export class Obstacle extends Entity {
  constructor(scene, speed, phase, excludedFamily = null, stationaryOnly = false, safeFirstOnly = false) {
    const type = pickType(phase, excludedFamily, stationaryOnly, safeFirstOnly);
    const height = type.height;
    const width = Math.round(height * type.aspect);
    // Spawn far enough right that the widest obstacle is still fully
    // off-screen (center-anchored, so this accounts for its own half-width).
    const spawnX = GAME_WIDTH + width / 2 + 10;
    // A few animated textures retain transparent rows below their authored
    // feet/base. Sink that padding behind the foreground pavement so their
    // visible silhouette still makes exact contact with the street.
    const groundOffset = type.groundOffset ?? 0;
    const sprite = scene.physics.add.sprite(spawnX, GROUND_Y - height / 2 + groundOffset, type.key);
    super(scene, sprite);

    this.speedFactor = type.speedFactor ?? 1;
    this.family = obstacleFamily(type);
    this.currentSpeed = speed;
    this.chasesAfterAvoid = type.chasesAfterAvoid ?? false;
    this.chasing = false;
    this.retiring = false;
    this.rewarded = false;
    this.sprite.setDisplaySize(width, height);
    if (type.flipX) this.sprite.setFlipX(true);
    if (type.animation) this.sprite.anims.play(type.animation);
    this.sprite.body.setAllowGravity(false);
    this.sprite.setVelocityX(-speed * this.speedFactor);
  }

  setSpeed(speed) {
    this.currentSpeed = speed;
    if (this.chasing || this.retiring) return;
    this.sprite.setVelocityX(-speed * this.speedFactor);
  }

  onUpdate(time, delta) {
    if (
      this.chasesAfterAvoid &&
      !this.chasing &&
      !this.retiring &&
      this.sprite.x + this.sprite.displayWidth / 2 < PLAYER.startX
    ) {
      // Reaching Nicole's far side without colliding means she successfully
      // cleared him. Turn him around for a harmless, screen-fixed pursuit.
      this.chasing = true;
      this.rewarded = true;
      this.chaseEndsAt = time + Phaser.Math.Between(3200, 4600);
      this.sprite.body.setVelocity(0, 0);
      this.sprite.body.enable = false;
      this.sprite.setFlipX(true).setDepth(8);
      this.scene.onObstacleAvoided(
        this.sprite.x,
        this.sprite.y - this.sprite.displayHeight / 2
      );
    }

    if (this.chasing) {
      const targetX = PLAYER.startX - 76 + Math.sin(time * 0.012) * 5;
      this.sprite.x = Phaser.Math.Linear(this.sprite.x, targetX, 0.065);
      if (time >= this.chaseEndsAt) {
        this.chasing = false;
        this.retiring = true;
        this.sprite.setFlipX(false).setDepth(0);
      }
      return;
    }

    if (this.retiring) {
      this.sprite.x -= this.currentSpeed * 1.15 * (delta / 1000);
      if (this.sprite.x < -60) this.destroy();
      return;
    }

    if (
      !this.rewarded &&
      this.sprite.x + this.sprite.displayWidth / 2 < PLAYER.startX
    ) {
      // Reward as soon as the obstacle is visibly cleared so the health
      // token can rise from it while it is still on screen.
      this.rewarded = true;
      this.scene.onObstacleAvoided(
        this.sprite.x,
        this.sprite.y - this.sprite.displayHeight / 2
      );
    }

    if (this.sprite.x < -60) {
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
