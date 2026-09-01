import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, WORLD, HEALTH } from '../config.js';
import { Player } from '../entities/Player.js';
import { Obstacle } from '../entities/Obstacle.js';
import { Ground } from '../entities/Ground.js';
import { Parallax } from '../entities/Parallax.js';
import { healthBarColor } from '../gfx/healthColor.js';

const HEALTH_BAR = { x: 16, y: 14, width: 200, height: 16, padding: 2 };

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('Play');
  }

  create() {
    this.state = 'ready'; // ready | running | gameover
    this.elapsed = 0;
    this.nextSpawnAt = 0;
    this.scrollSpeed = WORLD.baseScrollSpeed;
    this.health = HEALTH.start;
    this.avoidedCount = 0;

    this.parallax = new Parallax(this);
    this.ground = new Ground(this);
    this.player = new Player(this);
    this.physics.add.collider(this.player.sprite, this.ground.body);

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
    // as obstacles are dodged, shrinks back toward red on every hit.
    this.healthBarBg = this.add
      .rectangle(HEALTH_BAR.x, HEALTH_BAR.y, HEALTH_BAR.width, HEALTH_BAR.height, 0x14161c)
      .setOrigin(0, 0)
      .setStrokeStyle(2, 0x000000, 0.5)
      .setDepth(20);
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
    this.updateHealthBar();

    this.overlayText = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2, 'Press Space or tap to start', {
        fontFamily: 'sans-serif',
        fontSize: '22px',
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
    this.player.jump();
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
    const fraction = Phaser.Math.Clamp(this.health / HEALTH.max, 0, 1);
    this.healthBarFill.width = (HEALTH_BAR.width - HEALTH_BAR.padding * 2) * fraction;
    this.healthBarFill.fillColor = healthBarColor(fraction);
  }

  // Called by Obstacle when it scrolls safely past the player.
  onObstacleAvoided() {
    if (this.state !== 'running') return;
    this.avoidedCount += 1;
    this.health = Phaser.Math.Clamp(this.health + HEALTH.gainPerAvoid, 0, HEALTH.max);
    this.updateHealthBar();
  }

  // Called by Player.onCollide when an obstacle hits it.
  takeDamage() {
    if (this.state !== 'running') return;
    this.health = Phaser.Math.Clamp(this.health - HEALTH.lossPerHit, 0, HEALTH.max);
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
    this.overlayText.setText(`Game over — dodged ${this.avoidedCount}\nSpace / tap to try again`);
    this.overlayText.setVisible(true);
  }

  spawnObstacle() {
    const height = Phaser.Math.Between(30, 70);
    const obstacle = new Obstacle(this, height, this.scrollSpeed);
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

    this.ground.scroll(this.scrollSpeed, delta);
    this.parallax.scroll(this.scrollSpeed, delta);
    this.player.update(time, delta);

    // Same call, different behavior per entity type — no type-checking here.
    for (const entity of this.entities) {
      if (entity.alive) entity.setSpeed?.(this.scrollSpeed);
      entity.update(time, delta);
    }
    this.entities = this.entities.filter((e) => e.alive);

    if (time > this.nextSpawnAt) {
      this.spawnObstacle();
      const gap = Phaser.Math.Between(900, 1500) - ramp * 300;
      this.nextSpawnAt = time + gap;
    }
  }
}
