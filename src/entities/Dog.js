import Phaser from 'phaser';
import { GAME_WIDTH, GROUND_Y, PLAYER, DOG, ZOOMIES } from '../config.js';

// Companion character with scripted jumps and street interactions. She has
// no physics body, so these authored sequences can stay expressive without
// interfering with Nicole's obstacle collisions.
export class Dog {
  constructor(scene) {
    this.scene = scene;
    this.restX = PLAYER.startX - DOG.trailDistance;
    this.sprite = scene.add
      .sprite(this.restX, GROUND_Y, 'dog-idle')
      .setOrigin(0, 1)
      .setScale(DOG.displayScale)
      .setDepth(9);
    this.sprite.anims.play('dog-idle');
    this.markingDrops = [0, 1, 2].map(() => scene.add
      .rectangle(0, 0, 2, 3, 0xe8d85a, 0.9)
      .setDepth(10)
      .setVisible(false));
    this.jumping = false;
    this.jumpT = 0;
    this.jumpStartX = this.restX;
    this.attackTarget = null;
    this.attackElapsed = 0;
    this.chasingCop = false;
    this.markingHydrant = false;
    this.markingElapsed = 0;
    this.returning = false;
    this.zoomiesActive = false;
    this.zoomiesElapsed = 0;
  }

  jump() {
    if (this.jumping || this.attackTarget || this.markingHydrant || this.returning || this.zoomiesActive) return;
    this.jumping = true;
    this.jumpT = 0;
    this.jumpStartX = this.sprite.x;
  }

  rest() {
    this.jumping = false;
    this.attackTarget = null;
    this.chasingCop = false;
    this.markingHydrant = false;
    this.returning = false;
    this.zoomiesActive = false;
    this.jumpT = 0;
    this.sprite.x = this.restX;
    this.sprite.y = GROUND_Y;
    this.sprite.setAngle(0).setFlipX(false).setDepth(9).clearTint();
    this.markingDrops.forEach((drop) => drop.setVisible(false));
    this.sprite.anims.play('dog-idle', true);
  }

  attackCop(cop) {
    if (this.attackTarget || this.zoomiesActive || !cop?.alive) return;
    this.jumping = false;
    this.markingHydrant = false;
    this.returning = false;
    this.markingDrops.forEach((drop) => drop.setVisible(false));
    this.attackTarget = cop;
    this.attackElapsed = 0;
    this.chasingCop = false;
    this.sprite.y = GROUND_Y;
    this.sprite.setAngle(0).setFlipX(false).setDepth(11);
    this.sprite.anims.play('dog-run', true);
  }

  stopAtHydrant(scrollSpeed) {
    if (this.jumping || this.attackTarget || this.markingHydrant || this.returning || this.zoomiesActive) return false;
    this.markingHydrant = true;
    this.markingElapsed = 0;
    this.markingScrollSpeed = scrollSpeed;
    this.sprite.y = GROUND_Y;
    this.sprite.setAngle(0).setFlipX(false).setDepth(11);
    this.sprite.anims.stop();
    this.sprite.setTexture('dog-marking');
    this.markingDrops.forEach((drop) => drop.setVisible(true));
    return true;
  }

  updateHydrantStop(delta) {
    this.markingElapsed += delta;
    // Stella stays with the hydrant in world space, so the scrolling street
    // carries her briefly out of view before she sprints back to Nicole.
    this.sprite.x -= this.markingScrollSpeed * (delta / 1000);
    this.sprite.y = GROUND_Y;
    this.sprite.setTexture('dog-marking');
    this.markingDrops.forEach((drop, index) => {
      const cycle = (this.markingElapsed * 0.018 + index * 0.34) % 1;
      drop.x = this.sprite.x + 13 + cycle * 7;
      drop.y = GROUND_Y - 13 + cycle * 12;
      drop.setAlpha(1 - cycle);
    });
    if (this.markingElapsed >= DOG.hydrantPauseMs) {
      this.markingHydrant = false;
      this.returning = true;
      this.markingDrops.forEach((drop) => drop.setVisible(false));
    }
  }

  updateAttack(delta) {
    const cop = this.attackTarget;
    if (!cop?.alive) {
      this.attackTarget = null;
      this.chasingCop = false;
      this.returning = true;
      return;
    }

    if (this.chasingCop) {
      const targetX = cop.sprite.x - DOG.chaseDistance;
      const chaseStep = DOG.chaseSpeed * (delta / 1000);
      this.sprite.x += Math.sign(targetX - this.sprite.x) * Math.min(chaseStep, Math.abs(targetX - this.sprite.x));
      this.sprite.y = GROUND_Y;
      this.sprite.setAngle(0).setFlipX(false);
      this.sprite.anims.play('dog-run', true);
      return;
    }

    const targetX = cop.sprite.x - DOG.attackDistance;
    const step = DOG.attackRunSpeed * (delta / 1000);
    if (this.sprite.x < targetX - 2) {
      this.sprite.x = Math.min(targetX, this.sprite.x + step);
      this.sprite.y = GROUND_Y;
      this.sprite.anims.play('dog-run', true);
      return;
    }

    this.attackElapsed += delta;
    // Repeat the two dedicated snapping poses while Stella lunges at his
    // heels, then transition directly into the off-screen chase.
    const lunge = Math.sin(this.attackElapsed * 0.035);
    this.sprite.x = targetX + Math.max(0, lunge) * 8;
    this.sprite.y = GROUND_Y - Math.max(0, lunge) * 5;
    this.sprite.setAngle(-Math.max(0, lunge) * 8);
    this.sprite.anims.play('dog-attack', true);

    if (this.attackElapsed >= DOG.attackDurationMs) {
      cop.scareOff();
      this.scene.audio.dogAttack();
      this.chasingCop = true;
      this.sprite.setAngle(0);
    }
  }

  updateReturn(delta) {
    const step = DOG.returnSpeed * (delta / 1000);
    const direction = Math.sign(this.restX - this.sprite.x);
    this.sprite.x += direction * Math.min(step, Math.abs(this.restX - this.sprite.x));
    this.sprite.y = GROUND_Y;
    this.sprite.setFlipX(direction < 0).setAngle(0);
    this.sprite.anims.play('dog-run', true);
    if (this.sprite.x === this.restX) {
      this.sprite.x = this.restX;
      this.sprite.setFlipX(false).setDepth(9);
      this.returning = false;
    }
  }

  startZoomies() {
    this.jumping = false;
    this.attackTarget = null;
    this.chasingCop = false;
    this.markingHydrant = false;
    this.returning = false;
    this.zoomiesActive = true;
    this.zoomiesElapsed = 0;
    this.zoomiesStartX = this.sprite.x;
    this.markingDrops.forEach((drop) => drop.setVisible(false));
    this.sprite.setAngle(0).setFlipX(false).setDepth(17).setTint(0x75efff);
    this.sprite.anims.play('dog-run', true);
  }

  updateZoomies(delta) {
    this.zoomiesElapsed += delta;
    const outbound = this.zoomiesElapsed < ZOOMIES.outboundMs;
    if (outbound) {
      const t = Phaser.Math.Clamp(this.zoomiesElapsed / ZOOMIES.outboundMs, 0, 1);
      this.sprite.x = Phaser.Math.Linear(this.zoomiesStartX, GAME_WIDTH + 40, t * t * (3 - 2 * t));
      this.sprite.setFlipX(false);
    } else {
      const t = Phaser.Math.Clamp(
        (this.zoomiesElapsed - ZOOMIES.outboundMs) / (ZOOMIES.durationMs - ZOOMIES.outboundMs),
        0,
        1
      );
      this.sprite.x = Phaser.Math.Linear(GAME_WIDTH + 40, this.restX, t * t * (3 - 2 * t));
      this.sprite.setFlipX(true);
    }
    this.sprite.y = GROUND_Y - Math.abs(Math.sin(this.zoomiesElapsed * 0.025)) * 5;
    this.sprite.anims.play('dog-run', true);
    this.scene.clearZoomiesObstacles(this.sprite.getBounds());
    if (this.zoomiesElapsed >= ZOOMIES.durationMs) this.rest();
  }

  // Called only while the run is active (PlayScene drives this
  // explicitly, same reasoning as Player.update()).
  update(delta) {
    if (this.zoomiesActive) {
      this.updateZoomies(delta);
    } else if (this.attackTarget) {
      this.updateAttack(delta);
    } else if (this.markingHydrant) {
      this.updateHydrantStop(delta);
    } else if (this.returning) {
      this.updateReturn(delta);
    } else if (this.jumping) {
      this.jumpT += delta / DOG.jumpDurationMs;
      if (this.jumpT >= 1) {
        this.jumpT = 1;
        this.jumping = false;
      }
      const t = Math.min(this.jumpT, 1);
      const smoothTravel = t * t * (3 - 2 * t);
      const arc = Math.sin(t * Math.PI) ** 0.9;
      const landingX = this.restX + DOG.jumpForwardDistance;
      this.sprite.x = Phaser.Math.Linear(this.jumpStartX, landingX, smoothTravel);
      this.sprite.y = GROUND_Y - arc * DOG.jumpHeight;
      // Nose rises on takeoff, levels at the apex, then reaches toward the
      // pavement on landing. The small angle keeps the long greyhound body
      // expressive without turning the leap into a tumble.
      this.sprite.setAngle(-9 * Math.cos(t * Math.PI));
      this.sprite.anims.play('dog-jump', true);
    } else {
      const recovery = Math.min(1, delta / DOG.landingRecoveryMs);
      this.sprite.x = Phaser.Math.Linear(this.sprite.x, this.restX, recovery);
      this.sprite.y = GROUND_Y;
      this.sprite.setAngle(Phaser.Math.Linear(this.sprite.angle, 0, recovery * 2));
      this.sprite.anims.play('dog-run', true);
    }
  }
}
