# Scroller

A simple side-scroller game built with [Phaser 3](https://phaser.io/) and [Vite](https://vitejs.dev/).

## Stack

- **Phaser 3** — 2D game framework (sprites, animation, arcade physics, scenes)
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
  config.js           Tunable constants (sizes, gravity, scroll speed)
  main.js              Phaser boot and game config
  scenes/
    BootScene.js         Loads/generates assets, hands off to Play
    PlayScene.js          Game loop: scrolling ground, obstacle spawning,
                           scoring, collisions, game over/restart
  entities/
    Player.js              Player sprite wrapper (physics body, jump)
```

## Current state

Player, obstacles, and ground are placeholder solid-color textures
generated at runtime in `BootScene.js`. No real art yet.

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
  Player.js     extends Entity — jump, collide -> game over
  Obstacle.js   extends Entity — scroll, self-destroy off screen
  Ground.js     scrolling background/floor (not a collidable Entity)
```

## Deployment

Pushing to `main` triggers `.github/workflows/deploy.yml`, which builds
the project and publishes `dist/` to GitHub Pages automatically.

One-time setup in the GitHub repo: **Settings → Pages → Source → GitHub
Actions**. After that, every push to `main` redeploys.

The site will be served at `https://<your-username>.github.io/scroller/`.
If you rename the repo, update `base` in `vite.config.js` to match.

## Roadmap

- [ ] Animated player sprite (idle / run / jump)
- [ ] Parallax background layers
- [ ] Sound effects
- [ ] Local high-score storage
