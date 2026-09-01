import { PARALLAX, GAME_WIDTH, GAME_HEIGHT, GROUND_Y } from '../config.js';

// Purely decorative depth-of-field scenery: a sky gradient, sun and moon,
// and hill/cloud layers that scroll slower than the ground to fake
// distance. No physics, no collision, so - like Ground - this isn't an
// Entity subclass. applyPalette() drives everything from dayNightPalette();
// scroll() just moves the tile layers each frame.
export class Parallax {
  constructor(scene) {
    const { sun, hillsFar, hillsNear, clouds } = PARALLAX;

    this.sky = scene.add.graphics().setDepth(-11);

    this.sunOuter = scene.add.circle(sun.x, sun.y, sun.radius, 0xf2c14e).setDepth(-9);
    this.sunCore = scene.add.circle(sun.x, sun.y, sun.coreRadius, 0xfbe08a).setDepth(-9);

    this.moonOuter = scene.add.circle(sun.x, sun.y, sun.radius * 0.8, 0xe3e8f2).setDepth(-9).setAlpha(0);
    this.moonCraterA = scene.add.circle(sun.x - 6, sun.y - 4, 3, 0xc7cede).setDepth(-9).setAlpha(0);
    this.moonCraterB = scene.add.circle(sun.x + 6, sun.y + 6, 4, 0xc7cede).setDepth(-9).setAlpha(0);

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

    // Same silhouette as hillsNear, sparse lit-window squares baked in -
    // fading this in over hillsNear is what sells "grassy hills at day"
    // slowly becoming "building skyline at night" without swapping geometry.
    this.hillsWindows = scene.add
      .tileSprite(0, GROUND_Y - hillsNear.height, GAME_WIDTH, hillsNear.height, 'hillsWindows')
      .setOrigin(0, 0)
      .setDepth(-5)
      .setAlpha(0);
  }

  scroll(speed, delta) {
    const dt = delta / 1000;
    this.hillsFar.tilePositionX += speed * PARALLAX.hillsFar.speedFactor * dt;
    this.clouds.tilePositionX += speed * PARALLAX.clouds.speedFactor * dt;
    this.hillsNear.tilePositionX += speed * PARALLAX.hillsNear.speedFactor * dt;
    this.hillsWindows.tilePositionX = this.hillsNear.tilePositionX;
  }

  applyPalette(palette) {
    this.sky.clear();
    this.sky.fillGradientStyle(palette.sky1, palette.sky1, palette.sky2, palette.sky2, 1);
    this.sky.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.sunOuter.setY(palette.sunY).setAlpha(palette.sunAlpha);
    this.sunCore.setY(palette.sunY).setAlpha(palette.sunAlpha);

    this.moonOuter.setY(palette.moonY).setAlpha(palette.moonAlpha);
    this.moonCraterA.setY(palette.moonY - 4).setAlpha(palette.moonAlpha);
    this.moonCraterB.setY(palette.moonY + 6).setAlpha(palette.moonAlpha);

    this.hillsFar.setTint(palette.hillFar);
    this.hillsNear.setTint(palette.hillNear);
    this.clouds.setTint(palette.cloud);
    this.hillsWindows.setAlpha(palette.windowGlow);
  }
}
