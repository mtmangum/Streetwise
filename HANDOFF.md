# Handoff: Scroller

Status as of this handoff: playable game with an animated player sprite, a
full day-to-night run arc with matching scenery/obstacle themes, a health
bar (with overcharge) replacing the score, OOP entity model in place,
pushed to GitHub with GitHub Pages deploying on every push to main.

## What exists

A simple HTML5 side-scroller: player jumps over obstacles that spawn from
the right, scroll speed ramps up over time (from a slower base than
before), space/click/tap restarts. She's trailed by a companion greyhound
(cosmetic only — no collision) that echoes her jumps a beat later; her own
screen position was nudged from the left edge toward center to make room
for it. Each run plays out one full day -> night arc (sunny morning ->
afternoon -> dusk -> derelict night) over 90 seconds of elapsed play, and
the obstacle roster swaps with it - a daytime neighborhood set until dusk,
a night/urban-decay set from dusk on, no overlap during the day/afternoon
stretch.

There's no numeric score — a health bar grows (and shifts red -> orange ->
yellow -> green) each time an obstacle is dodged, and shrinks back toward
red on every hit; it starts full and can keep growing past 100% into a
sparking neon-green "overcharge" zone. A hit makes the player stumble,
topple, and get back up (~0.9s); if the bar empties she falls and stays
down and the run ends.

- **Stack:** Phaser 4 (game framework) + Vite (dev server/build)
- **Art:** player is a procedurally-drawn, animated 16-bit-style chibi sprite
  (big head, brown bob haircut, pink dress — idle/walk/jump/stumble poses,
  see `src/gfx/playerFrames.js`); obstacles split evenly day/night — day:
  mailbox, traffic cone, sitting child, trash bin, crate; night: angry cat,
  burning trash bin, a low prone silhouette, a boombox (`Obstacle.js`
  `TYPES`, textures in `BootScene.generateObstacleTextures()`); scenery is
  a procedural parallax layer — sky gradient, sun/moon, a row of
  brownstones (cornice + stoop + window grid by day, dark with lit windows
  by night — reaching ~2/3 up the screen), drifting clouds — all driven by
  `src/gfx/dayNightPalette.js` (`src/entities/Parallax.js`); ground is a
  plain scrolling tile, tinted by time of day.
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
    dogFrames.js             Procedural pixel-art part/pose data for the dog
    healthColor.js            Red -> orange -> yellow -> green health bar ramp
    dayNightPalette.js         Sky/hill/ground/sun/moon interpolation by dayPhase
  scenes/
    BootScene.js           Generates all textures + player/dog anims, hands off to Play
    PlayScene.js            Game loop: spawning, health bar, collisions, restart
  entities/
    Entity.js               Abstract base class (update/onCollide/bounds/destroy)
    Player.js                extends Entity — jump, animate, stumble/fall/get up
    Obstacle.js               extends Entity — scroll, avoid/hit, self-destroy
    Ground.js                 scrolling floor tile (plain class, not an Entity)
    Parallax.js                sun/hills/clouds scenery (plain class, not an Entity)
    Dog.js                     companion greyhound (plain class, not an Entity —
                                cosmetic only, no physics body or collision)
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
- **No foreground street-level parallax** (fire hydrants, trees, etc.) —
  suggested as a natural next step; would slot in as another `Parallax`
  layer, probably between `hillsNear` and the ground tile in depth.
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
- **Health bar, not score.** `HEALTH` in `config.js` (max/overchargeMax/
  start/gain-per-avoid/loss-per-hit) is the whole tuning surface —
  `PlayScene.health` starts at `max` (full), grows on `onObstacleAvoided()`
  and shrinks on `takeDamage()`, and can keep growing past `max` up to
  `overchargeMax` — that extra stretch renders in a fixed sparking neon
  green (`OVERCHARGE_COLOR` in `healthColor.js`) with pulsing star
  GameObjects, not a continuation of the red->orange->yellow->green ramp
  (which already tops out at green at fraction 1). Health hitting 0 is what
  ends the run, not the collision itself — `Obstacle.onCollide()` always
  destroys the obstacle it hit (one hit each, can't double-damage), but
  `takeDamage()` only triggers `gameOver()` once the bar is empty.
  `avoidedCount` (shown on the game-over screen as "dodged N") is the
  closest thing left to a score, but nothing on screen during a run is
  numeric.
- **Stumble/fall/get-up is rotation, not drawn frames.** `Player.stumble()`
  /`fallDown()` reuse the single `player-stumble` texture and animate it
  with a Phaser tween chain (`FALL_TWEENS`/`GET_UP_TWEENS` in `Player.js`,
  ~0.9s total) rather than hand-drawing a "lying down" pose — much lower
  art risk than authoring prone pixel art by hand. `Player.recovering`
  gates normal idle/walk/jump switching while a sequence is in flight;
  `_cancelRecovery()` kills any in-flight tween/timer so a second hit
  landing mid-recovery can't leave two sequences fighting each other.
- **Obstacle day/night weighting is a hard split, not a gradient.**
  `dayWeight()`/`nightWeight()` in `Obstacle.js` hold each roster at 100%
  until dusk (`dayPhase` 2/3, matching the dusk stop in
  `dayNightPalette.js`), then linearly hand off so it's all-night by
  `dayPhase` 1 — no cross-mixing during the day/afternoon stretch.
- **Brownstone shading uses distinct base shades, not alpha tricks.** The
  cornice/window/stoop detail on `hillsFar`/`hillsNear` is drawn as
  genuinely different RGB values (not the same color layered at partial
  alpha over itself, which composites to a visual no-op — a mistake made
  and fixed twice in this file's history, on the ground tile and then the
  brownstones) so the detail survives `Parallax`'s per-frame tint.
- **The dog's jump delay is computed, not tuned.** `Dog` has no physics body
  and never moves horizontally — like `Player`, it sits at a fixed screen x
  (`PLAYER.startX - DOG.trailDistance`) while the world scrolls under it.
  That means the same obstacle reaches the dog's x exactly
  `DOG.trailDistance / scrollSpeed` seconds after it reaches the player's -
  `PlayScene.handleInput()` computes that travel time fresh from the
  current `scrollSpeed` every jump (plus a small fixed `DOG.jumpReactionMs`
  for personality) rather than using a flat delay constant. A flat delay
  was tried first and immediately desynced from the obstacle at any speed
  other than the one it was eyeballed at - jumped early at low speed, late
  at high speed, so the dog visibly failed to clear tall obstacles.
