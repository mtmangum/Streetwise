import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, RENDER_SCALE, WORLD, HEALTH, DAY_CYCLE, DOG } from '../config.js';
import { Player } from '../entities/Player.js';
import { Obstacle } from '../entities/Obstacle.js';
import { Ground } from '../entities/Ground.js';
import { Parallax } from '../entities/Parallax.js';
import { Dog } from '../entities/Dog.js';
import { healthBarColor, OVERCHARGE_COLOR } from '../gfx/healthColor.js';
import { dayNightPalette } from '../gfx/dayNightPalette.js';

// `width` is the 0..max track; `overchargeWidth` is extra track for the
// max..overchargeMax stretch, rendered as a distinct sparking color rather
// than continuing the normal color ramp (which already tops out at green).
const HEALTH_BAR = { x: 16, y: 14, width: 200, overchargeWidth: 96, height: 16, padding: 2 };

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('Play');
  }

  create() {
    // Render the original 800x360 gameplay view into a true 1600x720 canvas.
    // Centering the 2x camera preserves all authored world coordinates and
    // collision timing while doubling the backing resolution.
    this.cameras.main.setZoom(RENDER_SCALE);
    this.cameras.main.centerOn(GAME_WIDTH / 2, GAME_HEIGHT / 2);

    this.state = 'ready'; // ready | running | gameover
    this.elapsed = 0;
    this.nextSpawnAt = 0;
    this.scrollSpeed = WORLD.baseScrollSpeed;
    this.health = HEALTH.start;
    this.avoidedCount = 0;
    this.overchargeActive = false;
    this.dayPhase = 0;

    this.parallax = new Parallax(this);
    this.ground = new Ground(this);
    // Applied once here so the sunny-day look is already in place on the
    // "Press Space to start" screen, before update() (and dayPhase
    // progression) ever runs.
    const startPalette = dayNightPalette(0);
    this.parallax.applyPalette(startPalette);
    this.ground.setTint(startPalette.ground);

    this.player = new Player(this);
    this.physics.add.collider(this.player.sprite, this.ground.body);
    this.dog = new Dog(this);

    // Every non-player game object lives here. PlayScene doesn't care what
    // type each one is — it just calls entity.update() on all of them.
    this.entities = [];

    this.obstacleGroup = this.physics.add.group();
    this.physics.add.overlap(
      this.player.sprite,
      this.obstacleGroup,
      (playerSprite, obstacleSprite) => this.handleCollision(obstacleSprite),
      null,
      this
    );

    // Health bar replaces a numeric score: it grows and shifts toward green
    // as obstacles are dodged, shrinks back toward red on every hit, and
    // past 100% keeps extending in a sparking overcharge color.
    const trackWidth = HEALTH_BAR.width + HEALTH_BAR.overchargeWidth;
    this.healthBarBg = this.add
      .rectangle(HEALTH_BAR.x, HEALTH_BAR.y, trackWidth, HEALTH_BAR.height, 0x14161c)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x000000, 0.5)
      .setDepth(20);
    // Boundary tick marking where "full" ends and overcharge begins.
    this.add
      .rectangle(HEALTH_BAR.x + HEALTH_BAR.width, HEALTH_BAR.y, 2, HEALTH_BAR.height, 0x000000, 0.6)
      .setOrigin(0, 0)
      .setDepth(22);
    this.healthBarFill = this.add
      .rectangle(
        HEALTH_BAR.x + HEALTH_BAR.padding,
        HEALTH_BAR.y + HEALTH_BAR.padding,
        0,
        HEALTH_BAR.height - HEALTH_BAR.padding * 2,
        healthBarColor(HEALTH.start / HEALTH.max)
      )
      .setOrigin(0, 0)
      .setDepth(21);
    this.overchargeBarFill = this.add
      .rectangle(
        HEALTH_BAR.x + HEALTH_BAR.width,
        HEALTH_BAR.y + HEALTH_BAR.padding,
        0,
        HEALTH_BAR.height - HEALTH_BAR.padding * 2,
        OVERCHARGE_COLOR
      )
      .setOrigin(0, 0)
      .setDepth(21);
    this.sparkStars = [0.28, 0.55, 0.82].map((t) =>
      this.add
        .star(
          HEALTH_BAR.x + HEALTH_BAR.width + HEALTH_BAR.overchargeWidth * t,
          HEALTH_BAR.y + HEALTH_BAR.height / 2,
          5,
          2,
          5,
          0xaef2c1,
          1
        )
        .setDepth(23)
        .setVisible(false)
    );
    this.updateHealthBar();

    this.overlayText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Press Space or tap to start', {
        fontFamily: 'sans-serif',
        fontSize: '22px',
        resolution: RENDER_SCALE,
        color: '#ffffff',
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.input.keyboard.on('keydown-SPACE', () => this.handleInput());
    this.input.on('pointerdown', () => this.handleInput());
  }

  handleInput() {
    if (this.state === 'ready') return this.startRun();
    if (this.state === 'gameover') return this.restart();
    if (this.player.jump()) {
      // The obstacle she just cleared reaches the dog's (screen-fixed)
      // position trailDistance/scrollSpeed later - that travel time is the
      // real delay, not a flat number, or the echo desyncs from the
      // obstacle at any scroll speed but the one it was tuned for.
      const travelMs = (DOG.trailDistance / this.scrollSpeed) * 1000;
      this.time.delayedCall(travelMs + DOG.jumpReactionMs, () => this.dog.jump());
    }
  }

  startRun() {
    this.state = 'running';
    this.overlayText.setVisible(false);
  }

  restart() {
    this.scene.restart();
  }

  // A collision just tells both sides who they hit — each entity decides
  // what that means for itself (polymorphism), PlayScene doesn't referee.
  handleCollision(obstacleSprite) {
    const obstacle = obstacleSprite.getData('entity');
    if (obstacle) obstacle.onCollide(this.player);
  }

  updateHealthBar() {
    const normalFraction = Phaser.Math.Clamp(this.health, 0, HEALTH.max) / HEALTH.max;
    const overchargeFraction =
      this.health > HEALTH.max
        ? Phaser.Math.Clamp((this.health - HEALTH.max) / (HEALTH.overchargeMax - HEALTH.max), 0, 1)
        : 0;

    const normalWidth = (HEALTH_BAR.width - HEALTH_BAR.padding * 2) * normalFraction;
    const overchargeWidth = overchargeFraction * (HEALTH_BAR.overchargeWidth - HEALTH_BAR.padding);

    this.healthBarFill.width = normalWidth;
    this.healthBarFill.fillColor = healthBarColor(normalFraction);
    this.overchargeBarFill.width = overchargeWidth;

    this.setOverchargeFx(overchargeFraction > 0);
    this.sparkStars.forEach((star, index) => {
      const starThreshold = [0.28, 0.55, 0.82][index];
      star.setVisible(overchargeFraction >= starThreshold);
    });
  }

  setOverchargeFx(active) {
    if (active === this.overchargeActive) return;
    this.overchargeActive = active;

    if (active) {
      this.sparkTween = this.tweens.add({
        targets: this.sparkStars,
        scale: { from: 0.6, to: 1.3 },
        alpha: { from: 0.5, to: 1 },
        duration: 220,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    } else {
      if (this.sparkTween) {
        this.sparkTween.stop();
        this.sparkTween = null;
      }
      this.sparkStars.forEach((s) => s.setVisible(false).setScale(1).setAlpha(1));
    }
  }

  // Called by Obstacle when it scrolls safely past the player.
  onObstacleAvoided() {
    if (this.state !== 'running') return;
    this.avoidedCount += 1;
    this.health = Phaser.Math.Clamp(this.health + HEALTH.gainPerAvoid, 0, HEALTH.overchargeMax);
    this.updateHealthBar();
  }

  // Called by Player.onCollide when an obstacle hits it.
  takeDamage() {
    if (this.state !== 'running') return;
    this.health = Phaser.Math.Clamp(this.health - HEALTH.lossPerHit, 0, HEALTH.overchargeMax);
    this.updateHealthBar();

    if (this.health <= 0) {
      this.player.fallDown();
      this.gameOver();
    } else {
      this.player.stumble();
    }
  }

  gameOver() {
    if (this.state !== 'running') return;
    this.state = 'gameover';
    this.physics.pause();
    this.dog.rest();
    this.overlayText.setText(`Game over — dodged ${this.avoidedCount}\nSpace / tap to try again`);
    this.overlayText.setVisible(true);
  }

  spawnObstacle() {
    const obstacle = new Obstacle(this, this.scrollSpeed, this.dayPhase);
    obstacle.sprite.setData('entity', obstacle);
    this.obstacleGroup.add(obstacle.sprite);
    this.entities.push(obstacle);
  }

  update(time, delta) {
    if (this.state !== 'running') return;

    this.elapsed += delta / 1000;
    const ramp = Phaser.Math.Clamp(this.elapsed / WORLD.rampSeconds, 0, 1);
    this.scrollSpeed = Phaser.Math.Linear(
      WORLD.baseScrollSpeed,
      WORLD.maxScrollSpeed,
      ramp
    );

    this.dayPhase = Phaser.Math.Clamp(this.elapsed / DAY_CYCLE.durationSeconds, 0, 1);
    const palette = dayNightPalette(this.dayPhase);
    this.parallax.applyPalette(palette);
    this.ground.setTint(palette.ground);

    this.ground.scroll(this.scrollSpeed, delta);
    this.parallax.scroll(this.scrollSpeed, delta);
    this.player.update(time, delta);
    this.dog.update(delta);

    // Same call, different behavior per entity type — no type-checking here.
    for (const entity of this.entities) {
      if (entity.alive) entity.setSpeed?.(this.scrollSpeed);
      entity.update(time, delta);
    }
    this.entities = this.entities.filter((e) => e.alive);

    if (time > this.nextSpawnAt) {
      this.spawnObstacle();
      // Keep obstacles readable as individual challenges. The previous gap
      // compressed to 600ms at top speed, which could create near-impossible
      // back-to-back jumps as the world accelerated.
      const gap = Phaser.Math.Between(1250, 1950) - ramp * 150;
      this.nextSpawnAt = time + gap;
    }
  }
}
