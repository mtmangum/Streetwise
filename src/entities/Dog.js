import { GROUND_Y, PLAYER, DOG } from '../config.js';

// Purely cosmetic companion - no physics body, no collision, so (like
// Ground/Parallax) this isn't an Entity subclass. Trailing "behind" the
// player is just a fixed x offset (see DOG.trailDistance in config.js);
// only the hand-authored jump arc actually moves it.
export class Dog {
  constructor(scene) {
    this.scene = scene;
    this.sprite = scene.add
      .sprite(PLAYER.startX - DOG.trailDistance, GROUND_Y, 'dog-idle')
      .setOrigin(0, 1)
      .setScale(DOG.displayScale)
      .setDepth(9);
    this.sprite.anims.play('dog-idle');
    this.jumping = false;
    this.jumpT = 0;
  }

  jump() {
    if (this.jumping) return;
    this.jumping = true;
    this.jumpT = 0;
  }

  rest() {
    this.jumping = false;
    this.jumpT = 0;
    this.sprite.y = GROUND_Y;
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
      const arc = Math.sin(Math.min(this.jumpT, 1) * Math.PI);
      this.sprite.y = GROUND_Y - arc * DOG.jumpHeight;
      this.sprite.anims.play('dog-jump', true);
    } else {
      this.sprite.y = GROUND_Y;
      this.sprite.anims.play('dog-run', true);
    }
  }
}
