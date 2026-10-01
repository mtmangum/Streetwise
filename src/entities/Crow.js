import { Entity } from './Entity.js';
import { GAME_WIDTH, PLAYER } from '../config.js';
import { flyAwayFrightened } from './birdScare.js';

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
    // A knocked-away crow keeps the velocity Stella gave it.
    if (this.knocked) return;
    // Stay well clear of the world scroll speed so the crow always visibly
    // sweeps past obstacles instead of hanging beside one (at a low coefficient
    // it matched obstacle speed at the top scroll rate and looked stuck to it).
    const magnitude = this.direction < 0 ? speed * 1.1 + 130 : speed * 0.5 + 55;
    this.sprite.setVelocityX(this.direction * magnitude);
  }

  // Stella's snap connects: the crow reels back the way it came, spinning,
  // and no longer threatens Nicole.
  knockAway() {
    this.knocked = true;
    this.flightPhase = 'knocked';
    this.sprite.setVelocity(210 + Math.random() * 60, -(190 + Math.random() * 60));
  }

  // Stella's bark: the crow bolts instead of tumbling, and stops being a threat.
  barkAway() {
    if (!this.alive || this.knocked) return false;
    this.knocked = true;
    this.flightPhase = 'knocked';
    flyAwayFrightened(this);
    return true;
  }

  onUpdate(_time, delta) {
    if (this.knocked) {
      if (!this.scared) this.sprite.angle += delta * 0.9;
      if (this.sprite.x > GAME_WIDTH + 55 || this.sprite.y < -55) this.destroy();
      return;
    }

    if (this.flightPhase === 'approach') {
      const distanceAhead = (this.sprite.x - PLAYER.startX) * -this.direction;
      if (distanceAhead < 290) {
        this.flightPhase = 'diving';
        const travelSeconds = Math.max(0.25, distanceAhead / Math.abs(this.sprite.body.velocity.x));
        this.sprite.setVelocityY((272 - this.sprite.y) / travelSeconds);
        this.scene.audio.crowDive();
        this.scene.tryProtectiveLeap(this);
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
    if (!this.alive || this.knocked) return;
    player.onCrowCollide(this);
    this.destroy();
  }
}
