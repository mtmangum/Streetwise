import { PARALLAX, GAME_WIDTH, GROUND_Y } from '../config.js';

// Purely decorative depth-of-field scenery: a sun plus two hill bands and a
// cloud layer that scroll slower than the ground to fake distance. No
// physics, no collision, so - like Ground - this isn't an Entity subclass.
export class Parallax {
  constructor(scene) {
    const { sun, hillsFar, hillsNear, clouds } = PARALLAX;

    // Strictly greater than Ground's sky-gradient depth (-10) so the sun
    // renders in front of it regardless of creation order / depth ties.
    scene.add.circle(sun.x, sun.y, sun.radius, 0xf2c14e).setDepth(-9);
    scene.add.circle(sun.x, sun.y, sun.coreRadius, 0xfbe08a).setDepth(-9);

    this.hillsFar = scene.add
      .tileSprite(0, GROUND_Y - hillsFar.height, GAME_WIDTH, hillsFar.height, 'hillsFar')
      .setOrigin(0, 0)
      .setDepth(-8);

    this.clouds = scene.add
      .tileSprite(0, clouds.y, GAME_WIDTH, clouds.height, 'clouds')
      .setOrigin(0, 0)
      .setDepth(-7);

    this.hillsNear = scene.add
      .tileSprite(0, GROUND_Y - hillsNear.height, GAME_WIDTH, hillsNear.height, 'hillsNear')
      .setOrigin(0, 0)
      .setDepth(-6);
  }

  scroll(speed, delta) {
    const dt = delta / 1000;
    this.hillsFar.tilePositionX += speed * PARALLAX.hillsFar.speedFactor * dt;
    this.clouds.tilePositionX += speed * PARALLAX.clouds.speedFactor * dt;
    this.hillsNear.tilePositionX += speed * PARALLAX.hillsNear.speedFactor * dt;
  }
}
