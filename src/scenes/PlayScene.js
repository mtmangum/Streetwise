import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, RENDER_SCALE, WORLD, HEALTH, DAY_CYCLE, DOG } from '../config.js';
import { Player } from '../entities/Player.js';
import { Obstacle } from '../entities/Obstacle.js';
import { Ground } from '../entities/Ground.js';
import { Parallax } from '../entities/Parallax.js';
import { Dog } from '../entities/Dog.js';
import { Pigeon } from '../entities/Pigeon.js';
import { Crow } from '../entities/Crow.js';
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
    this.nextPigeonAt = Infinity;
    this.nextCrowAt = Infinity;
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

    this.birdGroup = this.physics.add.group();
    this.physics.add.overlap(
      this.player.sprite,
      this.birdGroup,
      (_playerSprite, birdSprite) => {
        const bird = birdSprite.getData('entity');
        if (bird) bird.onCollide(this.player);
      },
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

    const panelX = GAME_WIDTH / 2 - 190;
    const panelY = GAME_HEIGHT / 2 - 64;
    this.overlayPanel = this.add.graphics().setDepth(19);
    this.overlayPanel.fillStyle(0x05070c, 0.45);
    this.overlayPanel.fillRoundedRect(panelX + 4, panelY + 5, 380, 128, 14);
    this.overlayPanel.fillStyle(0x121823, 0.94);
    this.overlayPanel.fillRoundedRect(panelX, panelY, 380, 128, 14);
    this.overlayPanel.lineStyle(2, 0xe0752f, 0.9);
    this.overlayPanel.strokeRoundedRect(panelX, panelY, 380, 128, 14);
    this.overlayPanel.fillStyle(0xf2c14e, 1);
    this.overlayPanel.fillRoundedRect(panelX + 18, panelY + 13, 344, 3, 2);

    this.overlayTitle = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 34, 'STREETWISE: NICOLE & STELLA', {
        fontFamily: 'sans-serif',
        fontSize: '19px',
        fontStyle: 'bold',
        resolution: RENDER_SCALE,
        color: '#f2c14e',
        stroke: '#090b10',
        strokeThickness: 4,
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(20);

    this.overlayText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 20, 'SPACE / TAP  —  JUMP\nDOUBLE-PRESS  —  POWER JUMP', {
        fontFamily: 'sans-serif',
        fontSize: '16px',
        fontStyle: 'bold',
        resolution: RENDER_SCALE,
        color: '#eef3f6',
        stroke: '#090b10',
        strokeThickness: 3,
        lineSpacing: 7,
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
      return;
    }
    this.player.powerJump();
  }

  startRun() {
    this.state = 'running';
    this.nextPigeonAt = this.time.now + Phaser.Math.Between(7000, 12000);
    this.nextCrowAt = this.time.now + Phaser.Math.Between(5000, 9000);
    this.overlayPanel.setVisible(false);
    this.overlayTitle.setVisible(false);
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
    this.overlayTitle.setText('RUN OVER');
    this.overlayText.setText(`DODGED ${this.avoidedCount}\nSPACE / TAP  —  TRY AGAIN`);
    this.overlayPanel.setVisible(true);
    this.overlayTitle.setVisible(true);
    this.overlayText.setVisible(true);
  }

  spawnObstacle() {
    const obstacle = new Obstacle(this, this.scrollSpeed, this.dayPhase);
    obstacle.sprite.setData('entity', obstacle);
    this.obstacleGroup.add(obstacle.sprite);
    this.entities.push(obstacle);
  }

  spawnPigeon() {
    const pigeon = new Pigeon(this, this.scrollSpeed);
    pigeon.sprite.setData('entity', pigeon);
    this.birdGroup.add(pigeon.sprite);
    this.entities.push(pigeon);
  }

  spawnCrow() {
    const crow = new Crow(this, this.scrollSpeed);
    crow.sprite.setData('entity', crow);
    this.birdGroup.add(crow.sprite);
    this.entities.push(crow);
  }

  collectPigeon(x, y) {
    if (this.state !== 'running') return;
    // A powered bird strike is the jackpot: fill both the normal track and
    // the complete overcharge extension to the absolute life-force cap.
    this.health = HEALTH.overchargeMax;
    this.updateHealthBar();
    this.rainHealthSparks();

    const burstColors = [0xffffff, 0xd8d8d2, 0xa8adb5, 0x777d87];
    for (let i = 0; i < 14; i++) {
      const angle = (Math.PI * 2 * i) / 14;
      const distance = 22 + (i % 4) * 7;
      const feather = i % 3 === 0
        ? this.add.circle(x, y, 3 + (i % 2), 0xf4f1e8).setDepth(16)
        : this.add.rectangle(x, y, 3, 8, burstColors[i % burstColors.length]).setDepth(16);
      feather.setAngle(i * 31);
      this.tweens.add({
        targets: feather,
        x: x + Math.cos(angle) * distance,
        y: y + Math.sin(angle) * distance + 10,
        angle: feather.angle + 160,
        alpha: 0,
        duration: 520 + (i % 3) * 90,
        ease: 'Quad.easeOut',
        onComplete: () => feather.destroy()
      });
    }

    const bonusText = this.add
      .text(x, y - 22, 'FULL LIFE!', {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        resolution: RENDER_SCALE,
        color: '#b8ffbf',
        stroke: '#17331d',
        strokeThickness: 3
      })
      .setOrigin(0.5)
      .setDepth(17);
    this.tweens.add({
      targets: bonusText,
      y: y - 48,
      alpha: 0,
      duration: 900,
      ease: 'Quad.easeOut',
      onComplete: () => bonusText.destroy()
    });
  }

  rainHealthSparks() {
    const trackWidth = HEALTH_BAR.width + HEALTH_BAR.overchargeWidth;
    const colors = [0xf2c14e, 0xcfff79, 0x58f28b, 0xffffff];
    for (let i = 0; i < 28; i++) {
      const x = HEALTH_BAR.x + 5 + ((i * 47) % (trackWidth - 10));
      const startY = HEALTH_BAR.y - 15 - (i % 4) * 5;
      const spark = i % 3 === 0
        ? this.add.star(x, startY, 4, 1, 3, colors[i % colors.length]).setDepth(26)
        : this.add.rectangle(x, startY, 2, 6, colors[i % colors.length]).setDepth(26);
      spark.setAngle((i * 37) % 180).setScale(i % 5 === 0 ? 1.4 : 1);
      this.tweens.add({
        targets: spark,
        x: x + ((i % 3) - 1) * 7,
        y: HEALTH_BAR.y + HEALTH_BAR.height + 13 + (i % 5) * 4,
        angle: spark.angle + 150 + (i % 4) * 35,
        alpha: 0,
        scale: 0.35,
        delay: (i % 10) * 32,
        duration: 430 + (i % 6) * 55,
        ease: 'Quad.easeIn',
        onComplete: () => spark.destroy()
      });
    }
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

    if (time > this.nextPigeonAt) {
      this.spawnPigeon();
      this.nextPigeonAt = time + Phaser.Math.Between(11000, 19000);
    }
    if (time > this.nextCrowAt) {
      this.spawnCrow();
      this.nextCrowAt = time + Phaser.Math.Between(12000, 20000);
    }
  }
}
