import Phaser from 'phaser';
import { GROUND_Y, PLAYER, DOG } from '../config.js';

// Purely cosmetic companion - no physics body, no collision, so (like
// Ground/Parallax) this isn't an Entity subclass. Trailing "behind" the
// player is just a fixed x offset (see DOG.trailDistance in config.js);
// only the hand-authored jump arc actually moves it.
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
    this.jumping = false;
    this.jumpT = 0;
    this.jumpStartX = this.restX;
  }

  jump() {
    if (this.jumping) return;
    this.jumping = true;
    this.jumpT = 0;
    this.jumpStartX = this.sprite.x;
  }

  rest() {
    this.jumping = false;
    this.jumpT = 0;
    this.sprite.x = this.restX;
    this.sprite.y = GROUND_Y;
    this.sprite.setAngle(0);
    this.sprite.anims.play('dog-idle', true);
  }

  // Called only while the run is active (PlayScene drives this
  // explicitly, same reasoning as Player.update()).
  update(delta) {
    if (this.jumping) {
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
