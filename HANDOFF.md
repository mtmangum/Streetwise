# Handoff: Scroller

Status as of this handoff: playable game with an animated player sprite,
OOP entity model in place, pushed to GitHub with GitHub Pages deploying
on every push to main.

## What exists

A simple HTML5 side-scroller: player jumps over obstacles that spawn from
the right, scroll speed ramps up over time, space/click/tap restarts.
There's no numeric score — a health bar grows (and shifts red -> orange ->
yellow -> green) each time an obstacle is dodged, and shrinks back toward
red on every hit. A hit makes the player stumble, topple, and get back up;
if the bar empties she falls and stays down and the run ends.

- **Stack:** Phaser 4 (game framework) + Vite (dev server/build)
- **Art:** player is a procedurally-drawn, animated chibi pixel-art sprite
  (big head, brown bob haircut, pink dress — idle/walk/jump/stumble poses,
  see `src/gfx/playerFrames.js`); obstacles come in three procedurally-drawn
  types (spike/crate/barrel, `BootScene.generateObstacleTextures()`);
  scenery is a procedural parallax layer (sun, two hill bands, drifting
  clouds — `src/entities/Parallax.js`); ground is still a plain scrolling
  tile.
- **Repo:** https://github.com/mtmangum/scroller — pushed, deploy workflow
  has run successfully, live at https://mtmangum.github.io/scroller/

## Architecture

```
index.html            Mounts the game, no game logic
vite.config.js         base: '/scroller/' for GitHub Pages
src/
  main.js               Phaser boot/config
  config.js              Tunable constants (sizes, gravity, scroll speed,
                          colors, parallax layout, health tuning)
  gfx/
    playerFrames.js        Procedural pixel-art part/pose data for the player
    healthColor.js          Red -> orange -> yellow -> green health bar ramp
  scenes/
    BootScene.js           Generates all textures + player anims, hands off to Play
    PlayScene.js            Game loop: spawning, health bar, collisions, restart
  entities/
    Entity.js               Abstract base class (update/onCollide/bounds/destroy)
    Player.js                extends Entity — jump, animate, stumble/fall/get up
    Obstacle.js               extends Entity — scroll, avoid/hit, self-destroy
    Ground.js                 scrolling floor tile (plain class, not an Entity)
    Parallax.js                sun/hills/clouds scenery (plain class, not an Entity)
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

- **Ground is still a plain scrolling tile** — no texture variety, unlike
  the now-varied obstacles/scenery.
- **No invulnerability window.** A second obstacle can hit the player again
  while she's still mid-stumble from the first; `Player._cancelRecovery()`
  makes that clean (kills the in-flight tween/timer rather than letting two
  recovery sequences fight each other) but doesn't prevent the double hit
  itself. Worth revisiting if playtesting finds it feels unfair.
- **No sound.**
- **No persistent high score.** There isn't a numeric score at all now —
  see "Health bar, not score" below — but a persisted best-run stat (e.g.
  longest dodge streak) would be a natural addition.

## Known constraints / decisions worth knowing

- `Entity` throws if instantiated directly — it's abstract by design, not
  an oversight.
- `Ground` and `Parallax` deliberately do **not** extend `Entity` — neither
  has collision or per-entity lifecycle, so forcing inheritance there
  wasn't worth it.
- `vite.config.js`'s `base: '/scroller/'` must match the GitHub repo name
  exactly, or the deployed site's asset paths will 404. Update it first if
  the repo gets renamed.
- **Health bar, not score.** `HEALTH` in `config.js` (max/start/gain-per-
  avoid/loss-per-hit) is the whole tuning surface — `PlayScene.health`
  grows on `onObstacleAvoided()` and shrinks on `takeDamage()`, and the bar
  color comes from `healthBarColor()` (a plain red->orange->yellow->green
  lerp, no Phaser color utilities). Health hitting 0 is what ends the run,
  not the collision itself — `Obstacle.onCollide()` always destroys the
  obstacle it hit (one hit each, can't double-damage), but `takeDamage()`
  only triggers `gameOver()` once the bar is empty. `avoidedCount` (shown
  on the game-over screen as "dodged N") is the closest thing left to a
  score, but nothing on screen during a run is numeric.
- **Stumble/fall/get-up is rotation, not drawn frames.** `Player.stumble()`
  /`fallDown()` reuse the single `player-stumble` texture and animate it
  with a Phaser tween chain (`FALL_TWEENS`/`GET_UP_TWEENS` in `Player.js`)
  rather than hand-drawing a "lying down" pose — much lower art risk than
  authoring prone pixel art by hand. `Player.recovering` gates normal
  idle/walk/jump switching while a sequence is in flight.
