import Phaser from 'phaser';
import { Entity } from './Entity.js';
import { GAME_WIDTH, GROUND_Y } from '../config.js';

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
  { key: 'obstacle-mailbox', aspect: 22 / 34, height: 56, weight: dayWeight },
  { key: 'obstacle-cone', aspect: 18 / 30, height: 46, weight: dayWeight },
  { key: 'obstacle-child0', animation: 'obstacle-child-jumprope', aspect: 30 / 28, height: 42, groundOffset: 3, weight: daylightOnlyWeight },
  { key: 'obstacle-trashbin', aspect: 30 / 36, height: 54, weight: dayWeight },
  { key: 'obstacle-crate', aspect: 1, height: 50, weight: dayWeight },
  { key: 'obstacle-hydrant0', animation: 'obstacle-hydrant-spray', aspect: 38 / 28, height: 42, groundOffset: 2, weight: dayWeight },
  { key: 'obstacle-shoppingcart', aspect: 40 / 30, height: 45, weight: dayWeight },
  { key: 'obstacle-hotdogcart', aspect: 44 / 56, height: 84, weight: dayWeight },
  { key: 'obstacle-parkingmeter', aspect: 18 / 60, height: 75, weight: dayWeight },
  // Night: derelict city
  { key: 'obstacle-cat0', animation: 'obstacle-cat-hiss', aspect: 30 / 27, height: 44, groundOffset: 2, weight: nightWeight },
  { key: 'obstacle-trashfire0', animation: 'obstacle-fire-flicker', aspect: 28 / 36, height: 60, weight: nightWeight },
  { key: 'obstacle-sleeping0', animation: 'obstacle-sleeping-flies', aspect: 48 / 20, height: 28, weight: nightWeight },
  { key: 'obstacle-boombox0', animation: 'obstacle-boombox-boom', aspect: 44 / 28, height: 40, weight: allDayWeight },
  { key: 'obstacle-steamstack0', animation: 'obstacle-steamstack-puff', aspect: 34 / 42, height: 62, weight: nightWeight },
  { key: 'obstacle-garbagebags0', animation: 'obstacle-rat-tail', aspect: 38 / 22, height: 33, weight: nightWeight },
  { key: 'obstacle-cop0', animation: 'obstacle-cop-patrol', aspect: 24 / 38, height: 57, weight: nightWeight },
  { key: 'obstacle-streetwalker0', animation: 'obstacle-streetwalker-idle', aspect: 24 / 38, height: 57, weight: nightWeight }
];

function pickType(phase) {
  const weighted = TYPES.map((t) => ({ ...t, w: t.weight(phase) }));
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
  constructor(scene, speed, phase) {
    const type = pickType(phase);
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

    this.sprite.setDisplaySize(width, height);
    if (type.animation) this.sprite.anims.play(type.animation);
    this.sprite.body.setAllowGravity(false);
    this.sprite.setVelocityX(-speed);
  }

  setSpeed(speed) {
    this.sprite.setVelocityX(-speed);
  }

  onUpdate() {
    if (this.sprite.x < -60) {
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
