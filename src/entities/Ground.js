import { GAME_WIDTH, GROUND_Y, GROUND_HEIGHT } from '../config.js';

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

  // groundTile is generated as a neutral white/grey base (see BootScene)
  // specifically so it can be recolored across the day/night cycle here.
  setTint(color) {
    this.visual.setTint(color);
  }
}
