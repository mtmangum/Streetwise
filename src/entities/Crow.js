import { Entity } from './Entity.js';
import { GAME_WIDTH, PLAYER } from '../config.js';

// Hostile city bird. Most cross at a low, jumpable height; occasionally one
// approaches overhead, dive-bombs Nicole, and pulls up after passing her.
export class Crow extends Entity {
  constructor(scene, speed) {
    // Every crow enters from ahead of Nicole on the right. A subset begins
    // overhead and dive-bombs; the rest make a low leftward pass.
    const movingLeft = true;
    const diveBomb = Math.random() < 0.3;
    const startY = diveBomb ? 72 : 242;
    const startX = movingLeft ? GAME_WIDTH + 30 : -140;
    const sprite = scene.physics.add.sprite(startX, startY, 'crow-fly0');
    super(scene, sprite);

    this.direction = movingLeft ? -1 : 1;
    this.diveBomb = diveBomb;
    this.flightPhase = diveBomb ? 'approach' : 'low-pass';
    this.sprite.setDisplaySize(46, 26).setDepth(9);
    this.sprite.setFlipX(!movingLeft);
    this.sprite.body.setAllowGravity(false);
    this.sprite.anims.play('crow-fly');
    this.setSpeed(speed);
  }

  setSpeed(speed) {
    const magnitude = this.direction < 0 ? speed * 0.8 + 70 : speed * 0.5 + 55;
    this.sprite.setVelocityX(this.direction * magnitude);
  }

  onUpdate() {
    if (this.flightPhase === 'approach') {
      const distanceAhead = (this.sprite.x - PLAYER.startX) * -this.direction;
      if (distanceAhead < 290) {
        this.flightPhase = 'diving';
        const travelSeconds = Math.max(0.25, distanceAhead / Math.abs(this.sprite.body.velocity.x));
        this.sprite.setVelocityY((272 - this.sprite.y) / travelSeconds);
        this.scene.audio.crowDive();
      }
    } else if (this.flightPhase === 'diving') {
      const passedNicole = this.direction < 0
        ? this.sprite.x < PLAYER.startX - 34
        : this.sprite.x > PLAYER.startX + 34;
      if (passedNicole) {
        this.flightPhase = 'pull-up';
        this.sprite.setVelocityY(-275);
      }
    }

    const diveAngle = Math.atan2(this.sprite.body.velocity.y, Math.abs(this.sprite.body.velocity.x)) * 180 / Math.PI;
    this.sprite.setAngle(this.direction < 0 ? -diveAngle : diveAngle);

    if (
      (this.direction < 0 && this.sprite.x < -55) ||
      (this.direction > 0 && this.sprite.x > GAME_WIDTH + 55) ||
      this.sprite.y > 330 ||
      this.sprite.y < -55
    ) this.destroy();
  }

  onCollide(player) {
    if (!this.alive) return;
    player.onCrowCollide(this);
    this.destroy();
  }
}
