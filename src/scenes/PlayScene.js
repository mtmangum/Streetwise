import Phaser from 'phaser';
import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, RENDER_SCALE, PLAYER, WORLD, SPAWN_RHYTHM, HEALTH, SNEAKER_BOOST, DAY_CYCLE, DOG, STORM, DAWN } from '../config.js';
import { Player } from '../entities/Player.js';
import { Obstacle } from '../entities/Obstacle.js';
import { Ground } from '../entities/Ground.js';
import { Parallax } from '../entities/Parallax.js';
import { Dog } from '../entities/Dog.js';
import { Pigeon } from '../entities/Pigeon.js';
import { Crow } from '../entities/Crow.js';
import { Seagull } from '../entities/Seagull.js';
import { Storm } from '../entities/Storm.js';
import { SneakerBoost } from '../entities/SneakerBoost.js';
import { healthBarColor, OVERCHARGE_COLOR } from '../gfx/healthColor.js';
import { dayNightPalette } from '../gfx/dayNightPalette.js';
import { ChiptuneAudio } from '../audio/ChiptuneAudio.js';
import { JumpController } from '../systems/JumpController.js';

// `width` is the 0..max track; `overchargeWidth` is extra track for the
// max..overchargeMax stretch, rendered as a distinct sparking color rather
// than continuing the normal color ramp (which already tops out at green).
const HEALTH_BAR = { x: 16, y: 14, width: 360, overchargeWidth: 160, height: 16, padding: 2 };
const FINALE_START_SECONDS = DAWN.startSeconds + DAWN.durationSeconds;

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
    const loadingScreen = document.getElementById('loading-screen');
    loadingScreen?.setAttribute('aria-busy', 'false');
    loadingScreen?.classList.add('is-hidden');
    this.time.delayedCall(260, () => loadingScreen?.remove());

    this.state = 'ready'; // ready | running | paused | ending | complete | gameover
    this.elapsed = 0;
    this.nextSpawnAt = 0;
    this.nextPigeonAt = Infinity;
    this.nextCrowAt = Infinity;
    this.nextSeagullAt = Infinity;
    this.nextSneakerAt = Infinity;
    this.lastObstacleFamily = null;
    this.firstObstacleSpawned = false;
    this.firstObstacleHintShown = false;
    this.firstObstacleFeedbackShown = false;
    this.firstTallHintShown = false;
    this.clusterSpawnsRemaining = 0;
    this.scrollSpeed = WORLD.baseScrollSpeed;
    this.momentumFactor = 1;
    this.health = HEALTH.start;
    this.damageInvulnerableUntil = 0;
    this.avoidedCount = 0;
    this.overchargeActive = false;
    this.dayPhase = 0;
    this.healthTextureKey = '';
    this.healthColorBucket = -1;
    this.nextPaletteUpdateAt = 0;
    this.nextSneakerSparkAt = 0;
    this.audio = new ChiptuneAudio(this);

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
    this.jumpController = new JumpController(
      this,
      this.player,
      this.audio,
      () => this.scheduleDogJump()
    );
    this.storm = new Storm(this);

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

    this.pickupGroup = this.physics.add.group();
    this.physics.add.overlap(
      this.player.sprite,
      this.pickupGroup,
      (_playerSprite, pickupSprite) => pickupSprite.getData('entity')?.collect(),
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
        HEALTH_BAR.width - HEALTH_BAR.padding * 2,
        HEALTH_BAR.height - HEALTH_BAR.padding * 2,
        healthBarColor(HEALTH.start / HEALTH.max)
      )
      .setOrigin(0, 0)
      .setScale(0, 1)
      .setDepth(21);
    this.overchargeBarFill = this.add
      .rectangle(
        HEALTH_BAR.x + HEALTH_BAR.width,
        HEALTH_BAR.y + HEALTH_BAR.padding,
        HEALTH_BAR.overchargeWidth - HEALTH_BAR.padding,
        HEALTH_BAR.height - HEALTH_BAR.padding * 2,
        OVERCHARGE_COLOR
      )
      .setOrigin(0, 0)
      .setScale(0, 1)
      .setDepth(21);
    this.healthBarTexture = this.add.graphics().setDepth(22);
    this.healthDangerFlash = this.add
      .rectangle(HEALTH_BAR.x, HEALTH_BAR.y, trackWidth, HEALTH_BAR.height, 0xff253f, 0.18)
      .setOrigin(0, 0)
      .setStrokeStyle(3, 0xff253f, 1)
      .setDepth(24)
      .setVisible(false);
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
    const panelY = GAME_HEIGHT / 2 - 74;
    this.overlayPanel = this.add.graphics().setDepth(19);
    this.overlayPanel.fillStyle(0x05070c, 0.45);
    this.overlayPanel.fillRoundedRect(panelX + 4, panelY + 5, 380, 148, 14);
    this.overlayPanel.fillStyle(0x121823, 0.94);
    this.overlayPanel.fillRoundedRect(panelX, panelY, 380, 148, 14);
    this.overlayPanel.lineStyle(2, 0xe0752f, 0.9);
    this.overlayPanel.strokeRoundedRect(panelX, panelY, 380, 148, 14);
    this.overlayPanel.fillStyle(0xf2c14e, 1);
    this.overlayPanel.fillRoundedRect(panelX + 18, panelY + 13, 344, 3, 2);

    this.overlayTitle = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 43, 'STREETWISE: NICOLE & STELLA', {
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
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 23, 'TAP  —  JUMP\nDOUBLE-TAP  —  POWER JUMP\nPOWER JUMP TO STRIKE BIRDS', {
        fontFamily: 'sans-serif',
        fontSize: '15px',
        fontStyle: 'bold',
        resolution: RENDER_SCALE,
        color: '#eef3f6',
        stroke: '#090b10',
        strokeThickness: 3,
        lineSpacing: 5,
        align: 'center'
      })
      .setOrigin(0.5)
      .setDepth(20);

    const hintBack = this.add
      .rectangle(0, 0, 330, 58, 0x111722, 0.92)
      .setStrokeStyle(2, 0xf2c14e, 0.95);
    this.hintTitle = this.add
      .text(0, -12, 'NICOLE!  JUMP OR SUPER JUMP', {
        fontFamily: 'sans-serif',
        fontSize: '14px',
        fontStyle: 'bold',
        resolution: RENDER_SCALE,
        color: '#f2c14e',
        stroke: '#090b10',
        strokeThickness: 3
      })
      .setOrigin(0.5);
    this.hintControls = this.add
      .text(0, 13, 'TAP TO JUMP  ·  DOUBLE-TAP TO JUMP HIGH', {
        fontFamily: 'monospace',
        fontSize: '11px',
        fontStyle: 'bold',
        resolution: RENDER_SCALE,
        color: '#eef3f6'
      })
      .setOrigin(0.5);
    this.openingHint = this.add
      .container(GAME_WIDTH / 2, 150, [hintBack, this.hintTitle, this.hintControls])
      .setDepth(25)
      .setVisible(false);

    this.pauseShade = this.add
      .rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x05070c, 0.55)
      .setDepth(27)
      .setVisible(false);
    this.pauseCard = this.add.graphics().setDepth(28).setVisible(false);
    this.pauseCard.fillStyle(0x111722, 0.97);
    this.pauseCard.fillRoundedRect(GAME_WIDTH / 2 - 135, GAME_HEIGHT / 2 - 48, 270, 96, 12);
    this.pauseCard.lineStyle(2, 0xf2c14e, 0.95);
    this.pauseCard.strokeRoundedRect(GAME_WIDTH / 2 - 135, GAME_HEIGHT / 2 - 48, 270, 96, 12);
    this.pauseTitle = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 14, 'PAUSED', {
        fontFamily: 'sans-serif',
        fontSize: '24px',
        fontStyle: 'bold',
        resolution: RENDER_SCALE,
        color: '#f2c14e',
        stroke: '#090b10',
        strokeThickness: 4
      })
      .setOrigin(0.5)
      .setDepth(29)
      .setVisible(false);
    this.pauseHint = this.add
      .text(GAME_WIDTH / 2, GAME_HEIGHT / 2 + 22, 'PRESS P, ESC, OR RESUME', {
        fontFamily: 'sans-serif',
        fontSize: '13px',
        fontStyle: 'bold',
        resolution: RENDER_SCALE,
        color: '#eef3f6'
      })
      .setOrigin(0.5)
      .setDepth(29)
      .setVisible(false);

    this.pauseButton = this.add
      .rectangle(GAME_WIDTH - 62, 22, 104, 28, 0x141b27, 0.94)
      .setStrokeStyle(2, 0xf2c14e, 0.9)
      .setDepth(30)
      .setInteractive({ useHandCursor: true });
    this.pauseButtonText = this.add
      .text(GAME_WIDTH - 62, 22, 'PAUSE', {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        resolution: RENDER_SCALE,
        color: '#f2c14e'
      })
      .setOrigin(0.5)
      .setDepth(31);
    this.pauseButton.on('pointerdown', (_pointer, _x, _y, event) => {
      event?.stopPropagation();
      this.togglePause();
    });

    this.input.keyboard.on('keydown-SPACE', (event) => {
      if (!event.repeat) this.handleInputDown();
    });
    this.input.keyboard.on('keyup-SPACE', () => this.handleInputUp());
    this.input.keyboard.on('keydown-P', () => this.togglePause());
    this.input.keyboard.on('keydown-ESC', () => this.togglePause());
    if (import.meta.env.DEV) {
      this.input.keyboard.on('keydown-F', () => this.skipToFinale());
    }
    this.input.on('pointerdown', () => this.handleInputDown());
    this.input.on('pointerup', () => this.handleInputUp());
    this.input.on('pointerupoutside', () => this.handleInputUp());
  }

  handleInputDown() {
    if (this.state === 'ready') return this.startRun();
    if (this.state === 'gameover' || this.state === 'complete') return this.restart();
    if (this.state === 'paused' || this.state === 'ending') return;
    this.jumpController.press();
  }

  handleInputUp() {
    this.jumpController.release();
  }

  skipToFinale() {
    if (this.state === 'ready') this.startRun();
    if (this.state !== 'running') return;
    this.elapsed = FINALE_START_SECONDS;
    this.dayPhase = 0;
    const palette = dayNightPalette(0);
    this.parallax.applyPalette(palette);
    this.ground.setTint(palette.ground);
    this.beginFinale();
  }

  scheduleDogJump() {
    const travelMs = (DOG.trailDistance / this.scrollSpeed) * 1000;
    this.time.delayedCall(travelMs + DOG.jumpReactionMs, () => this.dog.jump());
  }

  onBufferedPlayerJump() {
    if (this.state === 'running') {
      this.audio.jump();
      this.scheduleDogJump();
    }
  }

  togglePause() {
    if (this.state === 'running') {
      this.state = 'paused';
      this.physics.pause();
      this.time.paused = true;
      this.tweens.pauseAll();
      this.anims.pauseAll();
      this.pauseShade.setVisible(true);
      this.pauseCard.setVisible(true);
      this.pauseTitle.setVisible(true);
      this.pauseHint.setVisible(true);
      this.pauseButtonText.setText('RESUME');
      return;
    }
    if (this.state === 'paused') {
      this.state = 'running';
      this.time.paused = false;
      this.physics.resume();
      this.tweens.resumeAll();
      this.anims.resumeAll();
      this.pauseShade.setVisible(false);
      this.pauseCard.setVisible(false);
      this.pauseTitle.setVisible(false);
      this.pauseHint.setVisible(false);
      this.pauseButtonText.setText('PAUSE');
    }
  }

  startRun() {
    this.state = 'running';
    this.audio.start();
    const easyStartMs = SPAWN_RHYTHM.easyStartSeconds * 1000;
    this.nextPigeonAt = this.time.now + easyStartMs + Phaser.Math.Between(3000, 7000);
    this.nextCrowAt = this.time.now + easyStartMs + Phaser.Math.Between(2000, 6000);
    this.nextSeagullAt = this.time.now + Phaser.Math.Between(45000, 75000);
    this.nextSneakerAt = this.time.now + Phaser.Math.Between(
      SNEAKER_BOOST.firstSpawnMinMs,
      SNEAKER_BOOST.firstSpawnMaxMs
    );
    this.overlayPanel.setVisible(false);
    this.overlayTitle.setVisible(false);
    this.overlayText.setVisible(false);
  }

  showControlHint(title, controls) {
    this.tweens.killTweensOf(this.openingHint);
    this.hintHideEvent?.remove();
    this.hintTitle.setText(title);
    this.hintControls.setText(controls);
    this.openingHint
      .setPosition(GAME_WIDTH / 2, 150)
      .setVisible(true)
      .setAlpha(1)
      .setScale(0.92);
    this.tweens.add({
      targets: this.openingHint,
      scale: 1,
      duration: 220,
      ease: 'Back.easeOut'
    });
    this.hintHideEvent = this.time.delayedCall(2800, () => {
      this.tweens.add({
        targets: this.openingHint,
        y: 140,
        alpha: 0,
        duration: 500,
        ease: 'Quad.easeIn',
        onComplete: () => this.openingHint.setVisible(false)
      });
    });
  }

  onObstacleApproaching(obstacle) {
    if (!this.firstObstacleHintShown) {
      this.firstObstacleHintShown = true;
      this.showControlHint('NICOLE!  OBSTACLE AHEAD', 'TAP TO JUMP');
      return;
    }
    if (obstacle.isTall && !this.firstTallHintShown) {
      this.firstTallHintShown = true;
      this.showControlHint('NICOLE!  TALL OBSTACLE AHEAD', 'DOUBLE-TAP TO SUPER JUMP');
    }
  }

  restart() {
    this.scene.restart();
  }

  // A collision just tells both sides who they hit — each entity decides
  // what that means for itself (polymorphism), PlayScene doesn't referee.
  handleCollision(obstacleSprite) {
    const obstacle = obstacleSprite.getData('entity');
    if (!obstacle) return;

    if (obstacle.isFirst && !this.firstObstacleFeedbackShown) {
      this.firstObstacleFeedbackShown = true;
      const jumpedTooSoon = this.player.isAirborne && this.player.sprite.body.velocity.y >= 0;
      this.showControlHint(
        jumpedTooSoon ? 'YOU JUMPED TOO SOON!' : 'JUMP A LITTLE EARLIER!',
        jumpedTooSoon ? 'WAIT UNTIL IT GETS CLOSER' : 'TAP BEFORE YOU REACH IT'
      );
    }

    obstacle.onCollide(this.player);
  }

  updateHealthBar() {
    const normalFraction = Phaser.Math.Clamp(this.health, 0, HEALTH.max) / HEALTH.max;
    const overchargeFraction =
      this.health > HEALTH.max
        ? Phaser.Math.Clamp((this.health - HEALTH.max) / (HEALTH.overchargeMax - HEALTH.max), 0, 1)
        : 0;

    const normalWidth = (HEALTH_BAR.width - HEALTH_BAR.padding * 2) * normalFraction;
    const overchargeWidth = overchargeFraction * (HEALTH_BAR.overchargeWidth - HEALTH_BAR.padding);

    this.healthBarFill.setScale(normalFraction, 1);
    const colorBucket = Math.round(normalFraction * 100);
    if (colorBucket !== this.healthColorBucket) {
      this.healthColorBucket = colorBucket;
      this.healthBarFill.fillColor = healthBarColor(colorBucket / 100);
    }
    this.overchargeBarFill.setScale(overchargeFraction, 1);
    const textureNormalWidth = Math.round(normalWidth);
    const textureOverchargeWidth = Math.round(overchargeWidth);
    const textureKey = `${textureNormalWidth}:${textureOverchargeWidth}`;
    if (textureKey !== this.healthTextureKey) {
      this.healthTextureKey = textureKey;
      this.updateHealthBarTexture(textureNormalWidth, textureOverchargeWidth);
    }

    this.setOverchargeFx(overchargeFraction > 0);
    this.sparkStars.forEach((star, index) => {
      const starThreshold = [0.28, 0.55, 0.82][index];
      star.setVisible(overchargeFraction >= starThreshold);
    });

    const danger = this.state === 'running' && this.health > 0 && this.health <= HEALTH.dangerThreshold;
    this.healthDangerFlash.setVisible(danger);
    if (danger) {
      const flash = (Math.sin(this.time.now * 0.014) + 1) / 2;
      this.healthDangerFlash.setAlpha(0.2 + flash * 0.8);
      this.healthBarFill.setAlpha(0.4 + flash * 0.6);
      this.healthBarTexture.setAlpha(0.4 + flash * 0.6);
    } else {
      this.healthBarFill.setAlpha(1);
      this.healthBarTexture.setAlpha(1);
    }
  }

  updateHealthBarTexture(normalWidth, overchargeWidth) {
    const g = this.healthBarTexture;
    if (!g) return;
    g.clear();
    const innerY = HEALTH_BAR.y + HEALTH_BAR.padding;
    const innerHeight = HEALTH_BAR.height - HEALTH_BAR.padding * 2;
    const normalX = HEALTH_BAR.x + HEALTH_BAR.padding;

    if (normalWidth > 0) {
      // Glossy upper edge and a dark lower lip give the normal fill depth.
      g.fillStyle(0xffffff, 0.3);
      g.fillRect(normalX, innerY, normalWidth, 2);
      g.fillStyle(0x10151a, 0.28);
      g.fillRect(normalX, innerY + innerHeight - 2, normalWidth, 2);
      // Closely spaced meter divisions make growth readable at a glance.
      g.fillStyle(0x10151a, 0.25);
      for (let x = normalX + 12; x < normalX + normalWidth; x += 14) {
        g.fillRect(x, innerY + 2, 1, innerHeight - 4);
      }
    }

    if (overchargeWidth > 0) {
      const overX = HEALTH_BAR.x + HEALTH_BAR.width;
      g.fillStyle(0xe6ffeb, 0.48);
      g.fillRect(overX, innerY, overchargeWidth, 2);
      g.fillStyle(0x087a38, 0.42);
      g.fillRect(overX, innerY + innerHeight - 2, overchargeWidth, 2);
      // Repeating diagonal energy cuts distinguish overcharge from ordinary
      // health even when both sections are green.
      g.lineStyle(2, 0xd9ffe3, 0.38);
      for (let x = overX + 5; x < overX + overchargeWidth; x += 13) {
        const endX = Math.min(x + 7, overX + overchargeWidth);
        g.lineBetween(x, innerY + innerHeight - 2, endX, innerY + 2);
      }
    }
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
  onObstacleAvoided(x, y, jumped = false) {
    if (this.state !== 'running') return;
    if (jumped) {
      this.momentumFactor = Math.max(
        WORLD.minimumMomentum,
        this.momentumFactor - WORLD.jumpClearSlowdown
      );
    }
    this.avoidedCount += 1;
    this.health = Phaser.Math.Clamp(this.health + HEALTH.gainPerAvoid, 0, HEALTH.overchargeMax);
    this.updateHealthBar();
    this.showHealthReward(x, y, HEALTH.gainPerAvoid);
    this.audio.health();
  }

  showHealthReward(x, y, amount) {
    const token = this.add.container(x, y - 10).setDepth(18);
    const glow = this.add.circle(0, 0, 10, 0x58f28b, 0.25);
    const core = this.add.circle(0, 0, 7, 0x173d27, 0.95)
      .setStrokeStyle(1, 0xaef2c1, 1);
    const plusH = this.add.rectangle(0, 0, 9, 3, 0xaef2c1);
    const plusV = this.add.rectangle(0, 0, 3, 9, 0xaef2c1);
    const label = this.add.text(14, 0, `+${amount}`, {
      fontFamily: 'monospace',
      fontSize: '12px',
      fontStyle: 'bold',
      resolution: RENDER_SCALE,
      color: '#b8ffbf',
      stroke: '#10251a',
      strokeThickness: 3
    }).setOrigin(0, 0.5);
    token.add([glow, core, plusH, plusV, label]);

    this.tweens.add({
      targets: glow,
      scale: { from: 0.7, to: 1.45 },
      alpha: { from: 0.65, to: 0 },
      duration: 520,
      ease: 'Quad.easeOut'
    });
    this.tweens.add({
      targets: token,
      y: y - 42,
      alpha: 0,
      duration: 850,
      ease: 'Quad.easeOut',
      onComplete: () => token.destroy()
    });
  }

  // Called by Player.onCollide when an obstacle hits it.
  takeDamage(reaction = 'ground', damage = HEALTH.lossPerHit) {
    if (this.state !== 'running') return;
    if (this.time.now < this.damageInvulnerableUntil) return;
    this.damageInvulnerableUntil = this.time.now + HEALTH.invulnerabilityMs;
    this.health = Phaser.Math.Clamp(this.health - damage, 0, HEALTH.overchargeMax);
    this.updateHealthBar();
    this.audio.hit();

    if (this.health <= 0) {
      this.player.fallDown();
      this.gameOver();
    } else {
      if (reaction === 'air') this.player.airTumble();
      else this.player.stumble();
      this.tweens.add({
        targets: this.player.sprite,
        alpha: { from: 0.35, to: 1 },
        duration: 75,
        yoyo: true,
        repeat: 4,
        onComplete: () => this.player.sprite.setAlpha(1)
      });
    }
  }

  gameOver() {
    if (this.state !== 'running') return;
    this.state = 'gameover';
    this.jumpController.resetInput();
    this.audio.stop();
    this.audio.gameOver();
    this.physics.pause();
    this.dog.rest();
    this.overlayTitle.setText('RUN OVER');
    this.overlayText.setText(`DODGED ${this.avoidedCount}\nSPACE / TAP  —  TRY AGAIN`);
    this.overlayPanel.setVisible(true);
    this.overlayTitle.setVisible(true);
    this.overlayText.setVisible(true);
  }

  beginFinale() {
    if (this.state !== 'running') return;
    this.state = 'ending';
    this.jumpController.resetInput();
    this.audio.setScene('day');
    this.entities.forEach((entity) => entity.destroy());
    this.entities.length = 0;
    this.player.sprite.body.setVelocity(0, 0);
    this.player.sprite.body.enable = false;
    this.player.sprite.anims.stop();
    this.player.sprite.setTexture('player-idle0').setAngle(0);
    this.dog.rest();
    this.pauseButton.setVisible(false);
    this.pauseButtonText.setVisible(false);
    this.openingHint.setVisible(false);
    this.finaleElapsedMs = 0;
    this.finaleDogStartX = this.dog.sprite.x;
    this.finaleHeartsShown = false;

    const matt = this.add.sprite(GAME_WIDTH + 55, GROUND_Y, 'matt-standing')
      .setOrigin(0, 1)
      .setDepth(11);
    this.matt = matt;
  }

  updateFinale(delta) {
    if (!this.matt) return;
    this.finaleElapsedMs += Math.min(delta, 100);
    const finaleElapsed = this.finaleElapsedMs;
    const smooth = (value) => {
      const t = Phaser.Math.Clamp(value, 0, 1);
      return t * t * (3 - 2 * t);
    };

    const mattArrival = smooth(finaleElapsed / 1800);
    this.matt.x = Phaser.Math.Linear(GAME_WIDTH + 55, 410, mattArrival);

    if (finaleElapsed < 1500) {
      const dogArrival = smooth(finaleElapsed / 1500);
      this.dog.sprite.x = Phaser.Math.Linear(this.finaleDogStartX, 450, dogArrival);
      this.dog.sprite.setFlipX(false);
      this.dog.sprite.anims.play('dog-run', true);
    } else if (finaleElapsed < 2850) {
      this.dog.sprite.x = 450;
      this.dog.sprite.setTexture('dog-idle').setFlipX(true);
      this.matt.setTexture('matt-pat');
    } else if (finaleElapsed < 3700) {
      this.matt.setTexture('matt-standing');
      const dogMove = smooth((finaleElapsed - 2850) / 450);
      this.dog.sprite.x = Phaser.Math.Linear(450, 500, dogMove);
      this.dog.sprite.setFlipX(true).anims.play('dog-lick', true);
      const nicoleMove = smooth((finaleElapsed - 2850) / 850);
      this.player.sprite.x = Phaser.Math.Linear(PLAYER.startX, 370, nicoleMove);
    } else {
      this.dog.sprite.x = 500;
      this.dog.sprite.setFlipX(true).anims.play('dog-lick', true);
      this.player.sprite.x = 370;
      this.player.sprite.setTexture('player-idle0').setFlipX(false);
      this.matt.setTexture('matt-hug');
      if (!this.finaleHeartsShown) {
        this.finaleHeartsShown = true;
        this.showFinaleHearts(400, GROUND_Y - 72);
      }
    }

    if (finaleElapsed >= 5400) {
      this.state = 'complete';
      this.audio.stop();
      this.overlayTitle.setText('HOME AT LAST');
      this.overlayText.setText(`MATT, NICOLE & STELLA\nDODGED ${this.avoidedCount}\nSPACE / TAP  —  RUN AGAIN`);
      this.overlayPanel.setVisible(true).setDepth(40);
      this.overlayTitle.setVisible(true).setDepth(41);
      this.overlayText.setVisible(true).setDepth(41);
    }
  }

  showFinaleHearts(x, y) {
    [-38, -15, 12, 36, 0].forEach((offset, index) => {
      const heart = this.add.text(x + offset, y + (index % 2) * 13, '♥', {
        fontFamily: 'sans-serif',
        fontSize: index === 4 ? '24px' : '17px',
        resolution: RENDER_SCALE,
        color: index % 2 ? '#ff7897' : '#ef315d',
        stroke: '#7a1834',
        strokeThickness: 2
      }).setOrigin(0.5).setDepth(30).setScale(0);
      this.tweens.add({
        targets: heart,
        y: heart.y - 55 - index * 7,
        alpha: { from: 1, to: 0 },
        scale: { from: 0.4, to: 1.25 },
        delay: index * 130,
        duration: 1500,
        ease: 'Sine.easeOut',
        onComplete: () => heart.destroy()
      });
    });
  }

  spawnObstacle() {
    const easyStart = this.elapsed < SPAWN_RHYTHM.easyStartSeconds;
    const isFirst = !this.firstObstacleSpawned;
    const obstacle = new Obstacle(
      this,
      this.scrollSpeed,
      this.dayPhase,
      this.lastObstacleFamily,
      easyStart,
      isFirst
    );
    obstacle.isFirst = isFirst;
    this.firstObstacleSpawned = true;
    this.lastObstacleFamily = obstacle.family;
    this.registerEntity(obstacle, this.obstacleGroup);
  }

  scheduleNextObstacleSpawn(time, ramp) {
    let gap;
    if (this.elapsed < SPAWN_RHYTHM.easyStartSeconds) {
      this.clusterSpawnsRemaining = 0;
      gap = Phaser.Math.Between(SPAWN_RHYTHM.easyGapMinMs, SPAWN_RHYTHM.easyGapMaxMs);
    } else if (this.clusterSpawnsRemaining > 0) {
      this.clusterSpawnsRemaining -= 1;
      gap = this.clusterSpawnsRemaining > 0
        ? Phaser.Math.Between(SPAWN_RHYTHM.clusterGapMinMs, SPAWN_RHYTHM.clusterGapMaxMs)
        : Phaser.Math.Between(SPAWN_RHYTHM.postClusterRestMinMs, SPAWN_RHYTHM.postClusterRestMaxMs);
    } else {
      const roll = Math.random();
      if (roll < SPAWN_RHYTHM.clusterChance) {
        this.clusterSpawnsRemaining = Phaser.Math.Between(
          SPAWN_RHYTHM.clusterExtraMin,
          SPAWN_RHYTHM.clusterExtraMax
        );
        gap = Phaser.Math.Between(SPAWN_RHYTHM.clusterGapMinMs, SPAWN_RHYTHM.clusterGapMaxMs);
      } else if (roll < SPAWN_RHYTHM.clusterChance + SPAWN_RHYTHM.lullChance) {
        gap = Phaser.Math.Between(SPAWN_RHYTHM.lullMinMs, SPAWN_RHYTHM.lullMaxMs);
      } else {
        gap = Phaser.Math.Between(SPAWN_RHYTHM.steadyMinMs, SPAWN_RHYTHM.steadyMaxMs);
      }
    }

    // Preserve reaction time as speed rises without flattening the authored
    // cluster/lull contrast.
    this.nextSpawnAt = time + gap - ramp * 100;
  }

  registerEntity(entity, group) {
    entity.sprite.setData('entity', entity);
    group.add(entity.sprite);
    this.entities.push(entity);
  }

  spawnBird(BirdType) {
    this.registerEntity(new BirdType(this, this.scrollSpeed), this.birdGroup);
  }

  spawnSneakerBoost() {
    this.registerEntity(new SneakerBoost(this, this.scrollSpeed), this.pickupGroup);
  }

  activateSneakerBoost(x, y) {
    const until = this.time.now + SNEAKER_BOOST.durationMs;
    this.player.activateSneakerBoost(until);
    this.audio.sneakerBoost();
    this.showControlHint('PINK SNEAKER BOOST!', 'HIGHER JUMPS  ·  8 SECONDS');
    for (let i = 0; i < 10; i++) {
      const spark = this.add.star(x, y, 4, 2, 5, i % 2 ? 0xff66ad : 0x73f4ff, 1)
        .setDepth(25);
      this.tweens.add({
        targets: spark,
        x: x + Phaser.Math.Between(-65, 65),
        y: y + Phaser.Math.Between(-55, 35),
        alpha: 0,
        scale: { from: 0.45, to: 1.2 },
        duration: Phaser.Math.Between(450, 800),
        ease: 'Quad.easeOut',
        onComplete: () => spark.destroy()
      });
    }
  }

  updateSneakerBoost(time) {
    const active = time < this.player.sneakerBoostUntil;
    if (!active) {
      this.player.sprite.clearTint();
      return;
    }
    this.player.sprite.setTint(Math.sin(time * 0.018) > 0 ? 0xff8fc9 : 0xffffff);
    if (time < this.nextSneakerSparkAt) return;
    this.nextSneakerSparkAt = time + 110;
    const spark = this.add.circle(
      this.player.sprite.x + Phaser.Math.Between(4, 36),
      this.player.sprite.y - Phaser.Math.Between(5, 55),
      Phaser.Math.Between(1, 3),
      Math.random() < 0.5 ? 0xff66ad : 0x73f4ff,
      0.9
    ).setDepth(16);
    this.tweens.add({
      targets: spark,
      y: spark.y - 22,
      alpha: 0,
      duration: 420,
      onComplete: () => spark.destroy()
    });
  }

  canSpawnBird() {
    if (this.birdGroup.countActive(true) > 0) return false;
    // An obstacle already close to Nicole should resolve before a bird begins
    // its dive/bonus line, avoiding contradictory overlapping inputs.
    return !this.obstacleGroup.getChildren().some((sprite) =>
      sprite.active && sprite.x > this.player.sprite.x - 70 && sprite.x < this.player.sprite.x + 330
    );
  }

  collectPigeon(x, y) {
    if (this.state !== 'running') return;
    this.health = Phaser.Math.Clamp(this.health + HEALTH.pigeonBoost, 0, HEALTH.overchargeMax);
    this.updateHealthBar();
    this.audio.pigeon();
    this.burstBirdReward(x, y, 'LIFE BOOST!', '#f2e88f');
  }

  collectSeagull(x, y) {
    if (this.state !== 'running') return;
    this.health = HEALTH.overchargeMax;
    this.updateHealthBar();
    this.audio.fullLife();
    this.rainHealthSparks();
    this.burstBirdReward(x, y, 'FULL LIFE!', '#b8ffbf');
  }

  burstBirdReward(x, y, label, color) {

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
      .text(x, y - 22, label, {
        fontFamily: 'sans-serif',
        fontSize: '12px',
        fontStyle: 'bold',
        resolution: RENDER_SCALE,
        color,
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
    if (this.state === 'ending') {
      this.updateFinale(delta);
      return;
    }
    if (this.state !== 'running') return;

    this.elapsed += delta / 1000;
    this.jumpController.update();
    if (!this.storm.hasStarted && this.elapsed >= STORM.startSeconds) this.storm.start(time);
    if (this.storm.active && this.elapsed >= STORM.endSeconds) this.storm.stop();
    this.storm.update(time, delta);
    this.health = Phaser.Math.Clamp(
      this.health - HEALTH.drainPerSecond * (delta / 1000),
      0,
      HEALTH.overchargeMax
    );
    this.updateHealthBar();
    if (this.health <= 0) {
      this.player.fallDown();
      this.gameOver();
      return;
    }
    const ramp = Phaser.Math.Clamp(this.elapsed / WORLD.rampSeconds, 0, 1);
    this.momentumFactor = Math.min(
      1,
      this.momentumFactor + WORLD.momentumRecoveryPerSecond * (delta / 1000)
    );
    const paceSpeed = Phaser.Math.Linear(
      WORLD.baseScrollSpeed,
      WORLD.maxScrollSpeed,
      ramp
    );
    this.scrollSpeed = paceSpeed * this.momentumFactor;

    this.dayPhase = this.elapsed >= DAWN.startSeconds
      ? 1 - Phaser.Math.Clamp(
          (this.elapsed - DAWN.startSeconds) / DAWN.durationSeconds,
          0,
          1
        )
      : Phaser.Math.Clamp(this.elapsed / DAY_CYCLE.durationSeconds, 0, 1);
    if (this.elapsed >= FINALE_START_SECONDS) {
      this.dayPhase = 0;
      const palette = dayNightPalette(0);
      this.parallax.applyPalette(palette);
      this.ground.setTint(palette.ground);
      this.beginFinale();
      return;
    }
    if (time >= this.nextPaletteUpdateAt) {
      this.nextPaletteUpdateAt = time + 50;
      const palette = dayNightPalette(this.dayPhase);
      this.parallax.applyPalette(palette);
      this.ground.setTint(palette.ground);
    }
    const musicScene = this.storm.active
      ? 'storm'
      : this.elapsed >= DAWN.startSeconds && this.dayPhase > 0
        ? 'dawn'
      : this.dayPhase >= 1
        ? 'night'
        : this.dayPhase >= 2 / 3
          ? 'dusk'
          : this.dayPhase >= 1 / 3
            ? 'afternoon'
            : 'day';
    this.audio.setScene(musicScene);

    this.ground.scroll(this.scrollSpeed, delta);
    this.parallax.scroll(this.scrollSpeed, delta);
    this.player.update(time, delta);
    this.updateSneakerBoost(time);
    this.dog.update(delta);

    // Same call, different behavior per entity type — no type-checking here.
    let activeEntityCount = 0;
    for (const entity of this.entities) {
      if (entity.alive) {
        entity.setSpeed?.(this.scrollSpeed);
        entity.update(time, delta);
      }
      if (entity.alive) this.entities[activeEntityCount++] = entity;
    }
    this.entities.length = activeEntityCount;

    if (this.elapsed < FINALE_START_SECONDS - 6 && time > this.nextSpawnAt && this.birdGroup.countActive(true) === 0) {
      this.spawnObstacle();
      this.scheduleNextObstacleSpawn(time, ramp);
    }

    if (time > this.nextPigeonAt && this.canSpawnBird()) {
      this.spawnBird(Pigeon);
      this.nextPigeonAt = time + Phaser.Math.Between(11000, 19000);
    }
    if (time > this.nextCrowAt && this.canSpawnBird()) {
      this.spawnBird(Crow);
      this.nextCrowAt = time + Phaser.Math.Between(12000, 20000);
    }
    if (time > this.nextSeagullAt && this.canSpawnBird()) {
      this.spawnBird(Seagull);
      this.nextSeagullAt = time + Phaser.Math.Between(60000, 100000);
    }
    if (
      this.elapsed < FINALE_START_SECONDS - 12 &&
      time > this.nextSneakerAt &&
      this.pickupGroup.countActive(true) === 0
    ) {
      this.spawnSneakerBoost();
      this.nextSneakerAt = time + Phaser.Math.Between(
        SNEAKER_BOOST.respawnMinMs,
        SNEAKER_BOOST.respawnMaxMs
      );
    }
  }
}
