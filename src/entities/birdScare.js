// Shared by every bird: Stella's bark sends it flapping away, up and back
// the way it came, and takes it out of play (no strike bonus, no damage).
export function flyAwayFrightened(bird) {
  bird.scared = true;
  const { sprite } = bird;
  sprite.setFlipX(true).setAngle(-18);
  sprite.setVelocity(300 + Math.random() * 60, -(150 + Math.random() * 50));
  sprite.anims.timeScale = 1.7;
}
