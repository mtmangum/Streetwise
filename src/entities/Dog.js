import Phaser from 'phaser';
import { GAME_WIDTH, GROUND_Y, PLAYER, DOG, ZOOMIES, PROTECTIVE_LEAP, BARK_BLAST } from '../config.js';

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
    this.leap = null;
    this.barkElapsed = null;
  }

  jump() {
    if (this.jumping || this.leap || this.barkElapsed !== null || this.attackTarget || this.markingHydrant || this.returning || this.zoomiesActive) return;
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
    this.leap = null;
    this.barkElapsed = null;
    this.jumpT = 0;
    this.sprite.x = this.restX;
    this.sprite.y = GROUND_Y;
    this.sprite.setAngle(0).setFlipX(false).setDepth(9).clearTint();
    this.markingDrops.forEach((drop) => drop.setVisible(false));
    this.sprite.anims.play('dog-idle', true);
  }

  attackCop(cop) {
    if (this.attackTarget || this.leap || this.zoomiesActive || !cop?.alive) return;
    this.barkElapsed = null;
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

  // Stella's Protective Leap: she launches from behind Nicole, clears her, and
  // snaps the diving crow out of the air in front of her. The contact point is
  // predicted from the crow's dive vector so the two meet at the leap's apex.
  // Returns false (leaving her free) when she is busy with a cop or zoomies.
  protectiveLeap(crow) {
    if (this.leap || this.attackTarget || this.zoomiesActive || !crow?.alive) return false;
    const cfg = PROTECTIVE_LEAP;
    const { x: vx, y: vy } = crow.sprite.body.velocity;
    const w = this.sprite.displayWidth;
    const h = this.sprite.displayHeight;
    // Aim the snap at the crow's body: her mouth sits near the front of the
    // sprite, a little below its top edge.
    const mouthX = 0.92 * w;
    const mouthDrop = 0.8 * h;

    const idealCenterY = GROUND_Y - cfg.idealLift - mouthDrop;
    const wantedMs = vy > 1 ? ((idealCenterY - crow.sprite.y) / vy) * 1000 : cfg.contactMaxMs;
    const contactMs = Phaser.Math.Clamp(wantedMs, cfg.contactMinMs, cfg.contactMaxMs);
    const crowX = crow.sprite.x + vx * (contactMs / 1000);
    const crowY = crow.sprite.y + vy * (contactMs / 1000);

    this.jumping = false;
    this.barkElapsed = null;
    this.markingHydrant = false;
    this.returning = false;
    this.markingDrops.forEach((drop) => drop.setVisible(false));
    this.leap = {
      crow,
      elapsed: 0,
      struck: false,
      contactMs,
      durationMs: contactMs + cfg.afterContactMs,
      startX: this.sprite.x,
      contactX: crowX - mouthX,
      landX: crowX - mouthX + cfg.landingAheadPx,
      lift: Phaser.Math.Clamp(GROUND_Y - (crowY + mouthDrop), cfg.minLift, cfg.maxLift),
      strikeX: crowX,
      strikeY: crowY
    };
    this.sprite.setFlipX(false).setDepth(11).clearTint();
    this.sprite.anims.play('dog-jump', true);
    return true;
  }

  updateProtectiveLeap(delta) {
    const leap = this.leap;
    leap.elapsed += delta;
    const t = Math.min(leap.elapsed, leap.durationMs);

    let x, lift, angle;
    if (t < leap.contactMs) {
      const u = t / leap.contactMs;
      x = Phaser.Math.Linear(leap.startX, leap.contactX, 1 - (1 - u) ** 2);
      lift = leap.lift * Math.sin(u * Math.PI / 2);
      angle = -8 - 20 * u;
    } else {
      const u = (t - leap.contactMs) / (leap.durationMs - leap.contactMs);
      x = Phaser.Math.Linear(leap.contactX, leap.landX, u);
      lift = leap.lift * Math.cos(u * Math.PI / 2);
      angle = -28 + 40 * u;
    }
    this.sprite.x = x;
    this.sprite.y = GROUND_Y - lift;
    this.sprite.setAngle(angle);

    if (!leap.struck && leap.elapsed >= leap.contactMs) {
      leap.struck = true;
      if (leap.crow.alive) {
        leap.crow.knockAway();
        this.scene.showProtectiveLeapStrike(leap.crow.sprite.x, leap.crow.sprite.y);
      }
    }
    const snapping = leap.struck && leap.elapsed < leap.contactMs + PROTECTIVE_LEAP.snapMs;
    this.sprite.anims.play(snapping ? 'dog-attack' : 'dog-jump', true);

    if (leap.elapsed >= leap.durationMs) {
      this.leap = null;
      this.sprite.y = GROUND_Y;
      this.sprite.setAngle(0);
      this.returning = true;
      if (leap.struck) this.scene.showProtectiveLeapLanding();
    }
  }

  // Stella plants her feet and barks: the snapping head pose with a small
  // recoil bob. Returns false (she just doesn't pose) while she is busy with
  // something else; the blast itself still goes off from where she is.
  bark() {
    if (
      this.jumping || this.leap || this.attackTarget || this.markingHydrant ||
      this.returning || this.zoomiesActive || this.barkElapsed !== null
    ) return false;
    this.barkElapsed = 0;
    this.barkX = this.sprite.x;
    this.sprite.setFlipX(false).setDepth(11).setAngle(0);
    this.sprite.anims.play('dog-attack', true);
    return true;
  }

  updateBark(delta) {
    this.barkElapsed += delta;
    const bob = Math.abs(Math.sin(this.barkElapsed * 0.022));
    this.sprite.y = GROUND_Y - bob * 4;
    this.sprite.x = this.barkX - Math.max(0, Math.sin(this.barkElapsed * 0.011)) * 3;
    this.sprite.anims.play('dog-attack', true);
    if (this.barkElapsed >= BARK_BLAST.poseMs) {
      this.barkElapsed = null;
      this.sprite.x = this.barkX;
      this.sprite.y = GROUND_Y;
      this.sprite.setDepth(9);
    }
  }

  stopAtHydrant(scrollSpeed) {
    if (this.jumping || this.leap || this.barkElapsed !== null || this.attackTarget || this.markingHydrant || this.returning || this.zoomiesActive) return false;
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
    this.leap = null;
    this.barkElapsed = null;
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
    } else if (this.leap) {
      this.updateProtectiveLeap(delta);
    } else if (this.barkElapsed !== null) {
      this.updateBark(delta);
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
