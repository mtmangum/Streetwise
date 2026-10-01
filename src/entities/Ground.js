import { GAME_WIDTH, GROUND_Y, GROUND_HEIGHT } from '../config.js';

const SNOW_COVER_HEIGHT = 12;

// Encapsulates the scrolling ground strip. Not every game object needs to
// be an Entity — this has no collision-per-instance lifecycle, just visuals
// that scroll. The sky/scenery live in Parallax now; this is just the
// floor. Keeping it as its own small class still hides its Phaser details
// from PlayScene.
export class Ground {
  constructor(scene) {
    this.scene = scene;

    this.visual = scene.add
      .tileSprite(0, GROUND_Y, GAME_WIDTH, GROUND_HEIGHT, 'groundTile')
      .setOrigin(0, 0)
      .setDepth(5);

    // Snow that settles on the street during the storm. The texture's top edge
    // is a lumpy drift line; shortening the sprite shows less of it.
    this.snowCover = scene.add
      .tileSprite(0, GROUND_Y, GAME_WIDTH, SNOW_COVER_HEIGHT, 'snowCover')
      .setOrigin(0, 0)
      .setDepth(5.5)
      .setVisible(false);

    this.body = scene.physics.add.staticGroup();
    const floor = scene.add.rectangle(
      GAME_WIDTH / 2,
      GROUND_Y + GROUND_HEIGHT / 2,
      GAME_WIDTH,
      GROUND_HEIGHT
    );
    floor.setVisible(false);
    scene.physics.add.existing(floor, true);
    this.body.add(floor);
  }

  scroll(speed, delta) {
    this.visual.tilePositionX += speed * (delta / 1000);
    this.snowCover.tilePositionX = this.visual.tilePositionX;
  }

  // amount: 0 (bare street) to 1 (fully covered).
  setSnowCover(amount) {
    const height = Math.round(SNOW_COVER_HEIGHT * Math.min(1, Math.max(0, amount)));
    this.snowCover.setVisible(height > 0);
    if (height <= 0) return;
    this.snowCover.setSize(GAME_WIDTH, height).setY(GROUND_Y - height + 4);
  }

  // groundTile is generated as a neutral white/grey base (see BootScene)
  // specifically so it can be recolored across the day/night cycle here.
  setTint(color) {
    this.visual.setTint(color);
  }
}
