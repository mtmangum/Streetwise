// Base class for anything that lives in the world and needs per-frame
// behavior. It owns the Phaser sprite/physics body and exposes a small,
// stable interface (update, onCollide, destroy, bounds) so PlayScene never
// has to reach into Phaser internals directly (encapsulation).
//
// Subclasses provide their own onUpdate()/onCollide() — PlayScene calls the
// same method names on every entity regardless of type and gets different
// behavior back (polymorphism). This class is never instantiated directly.
export class Entity {
  constructor(scene, sprite) {
    if (new.target === Entity) {
      throw new Error('Entity is abstract and cannot be instantiated directly');
    }
    this.scene = scene;
    this.sprite = sprite;
    this.alive = true;
  }

  get bounds() {
    return this.sprite.getBounds();
  }

  get x() {
    return this.sprite.x;
  }

  set x(value) {
    this.sprite.x = value;
  }

  // Template method: shared per-frame bookkeeping lives here, the
  // type-specific behavior is deferred to the subclass override.
  update(time, delta) {
    if (!this.alive) return;
    this.onUpdate(time, delta);
  }

  // Subclasses override this.
  onUpdate(_time, _delta) {}

  // Subclasses override this to react to a collision with the player.
  onCollide(_player) {}

  destroy() {
    this.alive = false;
    this.sprite.destroy();
  }
}
