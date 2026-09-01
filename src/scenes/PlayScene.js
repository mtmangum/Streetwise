import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, WORLD } from '../config.js';
import { Player } from '../entities/Player.js';
import { Obstacle } from '../entities/Obstacle.js';
import { Ground } from '../entities/Ground.js';

export class PlayScene extends Phaser.Scene {
  constructor() {
    super('Play');
  }

  create() {
    this.state = 'ready'; // ready | running | gameover
    this.elapsed = 0;
    this.nextSpawnAt = 0;
    this.scrollSpeed = WORLD.baseScrollSpeed;

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

    this.scoreText = this.add
      .text(16, 12, 'Score: 0', {
        fontFamily: 'sans-serif',
        fontSize: '20px',
        color: '#f0f0f0'
      })
      .setDepth(20);

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

  gameOver() {
    if (this.state !== 'running') return;
    this.state = 'gameover';
    this.physics.pause();
    const score = Math.floor(this.elapsed * 10);
    this.overlayText.setText(`Game over — score ${score}\nSpace / tap to try again`);
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

    this.scoreText.setText(`Score: ${Math.floor(this.elapsed * 10)}`);
  }
}
