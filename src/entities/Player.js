import { Entity } from './Entity.js';
import { PLAYER, GROUND_Y } from '../config.js';

// Inheritance: Player extends Entity and gets update()/bounds/destroy for
// free. It only needs to define what makes it a player.
export class Player extends Entity {
  constructor(scene, x = PLAYER.startX) {
    const sprite = scene.physics.add.sprite(x, GROUND_Y, 'player');
    super(scene, sprite);

    this.sprite.setOrigin(0, 1);
    this.sprite.body.setGravityY(PLAYER.gravity);
    this.sprite.body.setCollideWorldBounds(true);
    this.sprite.setDepth(10);
  }

  // Private-ish (by convention) — internal detail callers shouldn't need.
  get _isOnGround() {
    return this.sprite.body.blocked.down || this.sprite.body.touching.down;
  }

  jump() {
    if (this._isOnGround) {
      this.sprite.body.setVelocityY(PLAYER.jumpVelocity);
      // this.sprite.play('jump'); // once real animations exist
    }
  }

  // Polymorphism: PlayScene calls entity.onCollide(player) on whatever it
  // hit without knowing whether it's an Obstacle or something else later.
  onCollide() {
    this.scene.gameOver();
  }
}
