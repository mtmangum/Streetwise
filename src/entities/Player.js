import { Entity } from './Entity.js';
import { PLAYER, GROUND_Y } from '../config.js';

const RECOVERY_TIMING = { recoil: 65, fall: 90, down: 130, pushUp: 110, stand: 70 };

// Inheritance: Player extends Entity and gets update()/bounds/destroy for
// free. It only needs to define what makes it a player.
export class Player extends Entity {
  constructor(scene, x = PLAYER.startX) {
    const sprite = scene.physics.add.sprite(x, GROUND_Y, 'player-idle0');
    super(scene, sprite);

    this.sprite.setOrigin(0, 1);
    this.sprite.body.setGravityY(PLAYER.gravity);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
    this.sprite.anims.play('player-idle');

    // True while the stumble/fall/get-up sequence owns the sprite's pose
    // — normal idle/walk/jump switching is suspended until it
    // clears (or, on the fatal hit, never clears).
    this.recovering = false;
    this.recoveryTimer = null;
  }

  // A second hit can land mid-recovery (a different obstacle, while still
  // down from the first). Without this, the still-pending get-up timer
  // from the interrupted sequence would fire later and yank the sprite
  // back upright out from under whatever the new hit is doing.
  _cancelRecovery() {
    this.scene.tweens.killTweensOf(this.sprite);
    if (this.recoveryTimer) {
      this.recoveryTimer.remove();
      this.recoveryTimer = null;
    }
    this.sprite.setAngle(0).setScale(1);
  }

  _nextRecoveryPose(texture, delay, next) {
    this.sprite.setTexture(texture);
    this.recoveryTimer = this.scene.time.delayedCall(delay, () => {
      this.recoveryTimer = null;
      next?.();
    });
  }

  // Private-ish (by convention) — internal detail callers shouldn't need.
  get _isOnGround() {
    return this.sprite.body.blocked.down || this.sprite.body.touching.down;
  }

  // Returns whether it actually jumped (ignored while airborne or
  // recovering) - PlayScene uses that to decide whether to echo the jump
  // to the dog a beat later, rather than echoing every keypress.
  jump() {
    if (this._isOnGround && !this.recovering) {
      this.sprite.body.setVelocityY(PLAYER.jumpVelocity);
      return true;
    }
    return false;
  }

  // Called once per frame while the run is active (PlayScene drives this
  // explicitly - Player isn't in the generic `entities` list since it's
  // never spawned/despawned the way obstacles are).
  onUpdate() {
    if (this.recovering) return;
    if (!this._isOnGround) {
      this.sprite.anims.stop();
      this.sprite.setTexture(this.sprite.body.velocity.y < 40 ? 'player-jumpRise' : 'player-jumpFall');
    } else {
      this.sprite.anims.play('player-walk', true);
    }
  }

  // Non-fatal hit: recoil, pitch forward, land face-down, push to her knees
  // and spring back up. Each beat has its own drawn silhouette; the standing
  // sprite is never rotated like a rigid cardboard cutout.
  stumble() {
    this._cancelRecovery();
    this.recovering = true;
    this.sprite.anims.stop();
    this._nextRecoveryPose('player-stumble', RECOVERY_TIMING.recoil, () =>
      this._nextRecoveryPose('player-fallForward', RECOVERY_TIMING.fall, () =>
        this._nextRecoveryPose('player-prone', RECOVERY_TIMING.down, () =>
          this._nextRecoveryPose('player-kneel', RECOVERY_TIMING.pushUp, () =>
            this._nextRecoveryPose('player-idle0', RECOVERY_TIMING.stand, () => {
              this.recovering = false;
            })
          )
        )
      )
    );
  }

  // Fatal hit (health hit zero): fall and stay down. Recovering never
  // clears — PlayScene.restart() rebuilds the Player from scratch anyway.
  fallDown() {
    this._cancelRecovery();
    this.recovering = true;
    this.sprite.anims.stop();
    this._nextRecoveryPose('player-stumble', RECOVERY_TIMING.recoil, () =>
      this._nextRecoveryPose('player-fallForward', RECOVERY_TIMING.fall, () => {
        this.sprite.setTexture('player-prone');
      })
    );
  }

  // Polymorphism: PlayScene calls entity.onCollide(player) on whatever it
  // hit without knowing whether it's an Obstacle or something else later.
  // The health bar (grow on dodge, shrink on hit) lives on PlayScene since
  // it's shared run state, not something the player entity owns.
  onCollide() {
    this.scene.takeDamage();
  }
}
