# Scroller

A 16-bit-style side-scroller game built with [Phaser 4](https://phaser.io/) and [Vite](https://vitejs.dev/).

## Stack

- **Phaser 4** — 2D game framework (sprites, animation, arcade physics, scenes)
- **Vite** — dev server and build tool

## Getting started

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`).

## Controls

- **Space / click / tap** — jump, or start/restart the game

## Project structure

```
index.html          Mounts the game, no game logic
src/
  config.js           Tunable constants (sizes, gravity, scroll speed,
                       colors, parallax layout, health tuning)
  main.js              Phaser boot and game config
  gfx/
    playerFrames.js      Procedural pixel-art part/pose data for the player
    dogFrames.js           Procedural pixel-art part/pose data for the dog
    healthColor.js          Red -> orange -> yellow -> green health bar ramp
    dayNightPalette.js       Sky/hill/ground/sun/moon interpolation by dayPhase
  scenes/
    BootScene.js         Generates all textures + player/dog animations, hands off to Play
    PlayScene.js          Game loop: scrolling ground/scenery, obstacle
                           spawning, health bar, collisions, game over/restart
  entities/
    Player.js              Player sprite wrapper (physics body, jump,
                            animation, stumble/fall/get-up)
    Dog.js                  Companion greyhound - cosmetic, no physics/collision
    Parallax.js             Sky, sun/moon, brownstones, clouds scenery layer
```

## Current state

The player is a procedurally-drawn, animated 16-bit-style chibi sprite — big
head, brown bob haircut, pink dress — with shaded, outlined idle/walk/jump poses plus a
stumble/fall/get-up sequence played on hit (see `src/gfx/playerFrames.js`
and `Player.js`). She's trailed by a cosmetic companion greyhound
(`Dog.js`, `src/gfx/dogFrames.js`) whose run cycle alternates a gathered
and a fully-extended pose — the real "double suspension gallop" a
greyhound runs in — and which echoes her jumps after a delay computed from
how long the same obstacle takes to travel from her position to the dog's
at the current scroll speed (not a flat delay - see "The dog's jump delay
is computed" in `HANDOFF.md`).

Each run plays out one full day -> night arc over 90 seconds: sunny
morning -> afternoon -> dusk -> derelict night, driving the sky color, a
row of brownstones on the horizon (cornice/stoop/windows by day, dark with
lit windows by night), and the obstacle roster. Obstacles are a hard split
by time of day — day: mailbox, traffic cone, sitting child, trash bin,
crate; night: angry cat, burning trash bin, a low prone silhouette,
boombox — full day roster until dusk, full night roster by the time it's
fully dark (`Obstacle.js`). The ground itself is still a plain scrolling
tile, tinted to match.

There's no numeric score. A health bar (top-left) starts full and grows
past 100% into a sparking "overcharge" zone as obstacles are dodged
(shifting red -> orange -> yellow -> green along the way, then a fixed
neon green once overcharged), and shrinks back toward red on every hit —
which also makes the player stumble and recover (~0.9s). An empty bar ends
the run. See "Health bar, not score" in `HANDOFF.md` for the mechanics.

## Architecture

Game objects follow the four pillars of OOP:

- **Encapsulation** — `Entity` and its subclasses own their Phaser sprite
  and physics body; `PlayScene` never touches sprite internals directly.
- **Abstraction** — `Entity` is an abstract base class (throws if
  instantiated directly) exposing a small stable interface: `update()`,
  `onCollide()`, `bounds`, `destroy()`.
- **Inheritance** — `Player` and `Obstacle` both extend `Entity` and get
  lifecycle/bookkeeping for free.
- **Polymorphism** — `PlayScene` loops over a list of entities and calls
  `entity.update()` / `entity.onCollide()` on all of them the same way;
  each subclass supplies its own behavior.

```
src/entities/
  Entity.js     Abstract base class
  Player.js     extends Entity — jump, animate, stumble/fall/get up on hit
  Obstacle.js   extends Entity — scroll, avoid/hit, self-destroy off screen
  Ground.js     scrolling floor tile (not a collidable-lifecycle Entity)
  Parallax.js   sky/sun/moon/brownstones/clouds (not a collidable-lifecycle Entity)
  Dog.js        companion greyhound (not an Entity - cosmetic, no physics/collision)
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds
the project and publishes `dist/` to GitHub Pages automatically.

One-time setup in the GitHub repo: **Settings → Pages → Source → GitHub
Actions**. After that, every push to `main` redeploys.

The site will be served at `https://<your-username>.github.io/scroller/`.
If you rename the repo, update `base` in `vite.config.js` to match.

## Roadmap

- [x] Animated player sprite (idle / walk / jump / stumble)
- [x] Parallax background layers
- [x] Obstacle variety, split day/night
- [x] Health bar with overcharge (replaces numeric score)
- [x] Day -> night run arc with matching scenery
- [x] Companion greyhound
- [ ] Foreground street-level parallax (fire hydrants, trees, etc.)
- [ ] Sound effects
- [ ] Local high-score storage (e.g. best dodge streak)
