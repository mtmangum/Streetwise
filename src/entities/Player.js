import { Entity } from './Entity.js';
import { PLAYER, GROUND_Y } from '../config.js';

// A stumble/fall told in four beats - recoil, overshoot into the topple,
// bounce on impact, settle - reads much more like losing your balance than
// a single rigid rotation would. Get-up mirrors that with its own beats:
// push off the ground, wobble upright, settle standing.
const FALL_TWEENS = [
  { angle: -12, scaleX: 1.08, scaleY: 0.92, duration: 70, ease: 'Quad.easeOut' },
  { angle: 95, duration: 220, ease: 'Back.easeIn' },
  { angle: 80, scaleX: 1.15, scaleY: 0.88, duration: 90, ease: 'Quad.easeOut' },
  { scaleX: 1, scaleY: 1, duration: 90, ease: 'Quad.easeOut' }
];

const GET_UP_TWEENS = [
  { angle: 65, scaleX: 0.92, scaleY: 1.08, duration: 130, ease: 'Quad.easeOut' },
  { angle: -6, duration: 160, ease: 'Quad.easeInOut' },
  { angle: 0, scaleX: 1, scaleY: 1, duration: 120, ease: 'Quad.easeOut' }
];

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
    // and rotation — normal idle/walk/jump switching is suspended until it
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
  }

  // Private-ish (by convention) — internal detail callers shouldn't need.
  get _isOnGround() {
    return this.sprite.body.blocked.down || this.sprite.body.touching.down;
  }

  jump() {
    if (this._isOnGround && !this.recovering) {
      this.sprite.body.setVelocityY(PLAYER.jumpVelocity);
    }
  }

  // Called once per frame while the run is active (PlayScene drives this
  // explicitly - Player isn't in the generic `entities` list since it's
  // never spawned/despawned the way obstacles are).
  onUpdate() {
    if (this.recovering) return;
    if (!this._isOnGround) {
      this.sprite.anims.play('player-jump', true);
    } else {
      this.sprite.anims.play('player-walk', true);
    }
  }

  // Non-fatal hit: stumble, topple, bounce, then climb back up and resume
  // the run (rotation/squash via tween rather than hand-drawing "lying
  // down" and "getting up" frames).
  stumble() {
    this._cancelRecovery();
    this.recovering = true;
    this.sprite.anims.stop();
    this.sprite.setTexture('player-stumble');

    this.scene.tweens.chain({
      targets: this.sprite,
      tweens: FALL_TWEENS,
      onComplete: () => {
        this.recoveryTimer = this.scene.time.delayedCall(300, () => {
          this.recoveryTimer = null;
          this.scene.tweens.chain({
            targets: this.sprite,
            tweens: GET_UP_TWEENS,
            onComplete: () => {
              this.recovering = false;
            }
          });
        });
      }
    });
  }

  // Fatal hit (health hit zero): fall and stay down. Recovering never
  // clears — PlayScene.restart() rebuilds the Player from scratch anyway.
  fallDown() {
    this._cancelRecovery();
    this.recovering = true;
    this.sprite.anims.stop();
    this.sprite.setTexture('player-stumble');
    this.scene.tweens.chain({ targets: this.sprite, tweens: FALL_TWEENS });
  }

  // Polymorphism: PlayScene calls entity.onCollide(player) on whatever it
  // hit without knowing whether it's an Obstacle or something else later.
  // The health bar (grow on dodge, shrink on hit) lives on PlayScene since
  // it's shared run state, not something the player entity owns.
  onCollide() {
    this.scene.takeDamage();
  }
}
