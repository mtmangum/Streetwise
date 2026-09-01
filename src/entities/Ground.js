import { GAME_WIDTH, GAME_HEIGHT, GROUND_Y, GROUND_HEIGHT, COLORS } from '../config.js';

// Encapsulates the scrolling ground + sky. Not every game object needs to
// be an Entity — this has no collision or per-entity lifecycle, just visuals
// that scroll. Keeping it as its own small class still hides its Phaser
// details from PlayScene.
export class Ground {
  constructor(scene) {
    this.scene = scene;

    const bg = scene.add.graphics().setDepth(-10);
    bg.fillGradientStyle(COLORS.sky1, COLORS.sky1, COLORS.sky2, COLORS.sky2, 1);
    bg.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    this.visual = scene.add
      .tileSprite(0, GROUND_Y, GAME_WIDTH, GROUND_HEIGHT, 'groundTile')
      .setOrigin(0, 0)
      .setDepth(5);

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
  }
}
