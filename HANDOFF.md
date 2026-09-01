# Handoff: Scroller

Status as of this handoff: playable placeholder game, OOP entity model in
place, GitHub Pages deploy pipeline configured but not yet pushed live.

## What exists

A simple HTML5 side-scroller: player jumps over obstacles that spawn from
the right, scroll speed ramps up over time, score increases while alive,
collision ends the run, space/click/tap restarts.

- **Stack:** Phaser 3 (game framework) + Vite (dev server/build)
- **Art:** solid-color placeholder rectangles generated at runtime in
  `BootScene.js` — no real sprite art yet
- **Repo:** git initialized locally, two commits, not yet pushed to GitHub

## Architecture

```
index.html            Mounts the game, no game logic
vite.config.js         base: '/scroller/' for GitHub Pages
src/
  main.js               Phaser boot/config
  config.js              Tunable constants (sizes, gravity, scroll speed)
  scenes/
    BootScene.js           Generates placeholder textures, hands off to Play
    PlayScene.js            Game loop: spawning, scoring, collisions, restart
  entities/
    Entity.js               Abstract base class (update/onCollide/bounds/destroy)
    Player.js                extends Entity — jump, collide -> game over
    Obstacle.js               extends Entity — scroll, self-destroy off screen
    Ground.js                 scrolling background/floor (plain class, not an Entity)
.github/workflows/
  deploy.yml              Builds + publishes dist/ to GitHub Pages on push to main
```

Object model follows the four OOP pillars — see the "Architecture" section
in `README.md` for the specifics (encapsulation via `Entity` owning its
sprite, abstraction via the base class's small interface, inheritance via
`Player`/`Obstacle extends Entity`, polymorphism via `PlayScene` calling
the same methods on every entity regardless of type).

## To pick this back up

1. `npm install`
2. `npm run dev` — starts the local dev server with hot reload

## Not done yet

- **Not pushed to GitHub.** Deploy workflow exists but has never run.
  Needs: create a `scroller` repo on GitHub, push this code, then set
  Settings → Pages → Source → GitHub Actions in that repo.
- **No real sprite art.** Player/obstacles/ground are placeholder colored
  rectangles. Next planned step was an animated early-90s-style character
  sprite (idle/run/jump states) — `Player.js` has a commented-out
  `this.sprite.play('jump')` call marking where animation playback goes
  once a spritesheet exists.
- **No sound.**
- **No persistent high score** (resets every reload).

## Known constraints / decisions worth knowing

- `Entity` throws if instantiated directly — it's abstract by design, not
  an oversight.
- `Ground` deliberately does **not** extend `Entity` — it has no collision
  or per-entity lifecycle, so forcing inheritance there wasn't worth it.
- `vite.config.js`'s `base: '/scroller/'` must match the GitHub repo name
  exactly, or the deployed site's asset paths will 404. Update it first if
  the repo gets renamed.
