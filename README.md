# Scroller

A simple side-scroller game built with [Phaser 3](https://phaser.io/) and [Vite](https://vitejs.dev/).

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
    healthColor.js        Red -> orange -> yellow -> green health bar ramp
  scenes/
    BootScene.js         Generates all textures + player animations, hands off to Play
    PlayScene.js          Game loop: scrolling ground/scenery, obstacle
                           spawning, health bar, collisions, game over/restart
  entities/
    Player.js              Player sprite wrapper (physics body, jump,
                            animation, stumble/fall/get-up)
    Parallax.js             Sun/hills/clouds scenery layer
```

## Current state

The player is a procedurally-drawn, animated chibi pixel-art sprite — big
head, brown bob haircut, pink dress — with idle/walk/jump poses plus a
stumble/fall/get-up sequence played on hit (see `src/gfx/playerFrames.js`
and `Player.js`). Obstacles come in three types (spike/crate/barrel) and
the sky has a parallax scenery layer (sun, two hill bands, drifting
clouds — `src/entities/Parallax.js`); the ground itself is still a plain
scrolling tile.

There's no numeric score. A health bar (top-left) grows and shifts red ->
orange -> yellow -> green as obstacles are dodged, and shrinks back toward
red on every hit; an empty bar ends the run. See "Health bar, not score" in
`HANDOFF.md` for the mechanics.

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
  Parallax.js   sun/hills/clouds scenery (not a collidable-lifecycle Entity)
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
- [x] Obstacle variety
- [x] Health bar (replaces numeric score)
- [ ] Sound effects
- [ ] Local high-score storage (e.g. best dodge streak)
