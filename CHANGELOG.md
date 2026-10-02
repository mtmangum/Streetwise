# Changelog

All notable changes to Streetwise: Nicole & Stella are recorded here.

## 2026-09-30 — Christmas edition

### Christmas theme

- Dressed the brownstones for the season: snow on roofs, window sills and stoops, sagging strings of twinkling lights along the rooflines, and pixel-art holly wreaths with berries, ornaments and a ribbon bow.
- Added gentle ambient snowfall (including on the start menu), a wintry sky, and a snowy street palette that shades to cool blue-grey at dusk and night.
- Nicole and Stella now wear Santa hats in every pose, and Stella has a gold collar bell.
- Gave the start menu a red outline and a red/green candy-stripe bar.
- The late-night thunderstorm is now a winter storm: it opens as rain, turns to sleet and ends as a heavy, wind-blown snowstorm with a thickening white haze. Lightning and thunder belong to the rain stage only.
- Snow now builds up on the street during the storm and stays for the rest of the run.
- Updated the cover art for the season: Santa hats on Nicole and Stella, falling snow, snow settled on the mailbox and the hot dog cart's umbrella, and a "Special Christmas Edition" banner under the title.

### Easy (Nicole) mode and start menu

- Added an Easy (Nicole) mode: a slower world (75% speed), wider obstacle spacing, softer hits, longer protection after a hit, slower health drain, more forgiving jump timing, and a longer, floatier jump. Power-ups come around more often and birds less often.
- Added an NES-style title screen (chunky pixel-font logo, Christmas ribbon, blinking "PUSH START" / "TOUCH TO START") that holds for a beat, or until tapped, before the menu.
- Replaced the start screen with a simple NES-style menu of two large rows with a blinking cursor, Normal and Easy (Nicole). Tapping a card starts the run in that mode, and the last choice is remembered. Stray taps no longer start a run; keyboard shortcuts still work but are secondary, since tablets are the main target.

### Power-ups and Stella

- Added the Coffee power-up: the world slows to half speed for five seconds while Nicole's jump is unchanged, with an amber wash, steam, and a slower soundtrack.
- Added the Stella Bark Blast power-up: Stella barks, and every bird, cat, rat and cop on screen bolts as a shockwave reaches it. Scared obstacles that had not yet been passed count as cleared.
- Added Streetwise Streak: five clean jumps in a row (four in Easy mode) make Nicole invulnerable for five seconds (six in Easy). A small STREAK meter under the power meter fills as the streak builds, a real hit resets it, and Nicole glows gold with sparkles while the bonus runs.
- Added Stella's Protective Leap: once per run she leaps over Nicole and snaps the first diving crow out of the air.
- Stella's zoomies now topple shopping carts onto their sides, a much lower and easier hop.
- Redrew the running cat and its hiss/charge pose in profile.

### Sprite Gallery

- Renamed the Art Read-Check page to the Sprite Gallery (now at `sprite-gallery.html`; the old `art-read-check.html` link redirects to it).
- Split the old Airborne section into Birds and Power-ups, and added a Christmas & weather section, cards for Coffee, Bark Blast, the protective leap and the toppled cart, and the Santa hats on the cast cards.

## 2026-09-02

### Pickups and finale

- Added the pink-sneakers jump boost, the "zoomies" dog-treat pickup (Stella sprints through small hazards), and the pink-star pickup (temporary invulnerability and sparkling super jumps).
- Added the end-of-run reunion finale with Matt.
- Reworked and animated much of the obstacle art for readability, and added recoverable double-tap power jumps.
- Added the Art Read-Check page (since renamed the Sprite Gallery) (obstacles, pickups and cast drawn from their exact pixel data), served from the site build.
- Added the late-night storm, a refactored systems layer, and a resilient loading screen.

## 2026-09-01

### Gameplay

- Added regular and super jumps, buffered input, coyote time, and an opening control hint.
- Added an easy 20-second opening with widely spaced stationary obstacles before the full difficulty ramp.
- Added clustered spawns, quiet beats, non-repeating obstacle families, moving shopping carts, and cop pursuits.
- Added pause/resume controls through keyboard and an on-screen button.

### Life force and birds

- Replaced numeric scoring with a long, textured health bar and sparking overcharge section.
- Added gradual life-force drain, eight-point obstacle-clear rewards, and animated floating reward tokens.
- Added pigeons that grant a 35-point boost when struck with a super jump.
- Added rare seagulls that restore the complete life-force bar.
- Added hostile black birds that cause heavy damage and an improved aerial tumble.

### World and obstacles

- Expanded the day roster with spraying hydrants, shopping carts, umbrella food carts, parking meters, crates, cones, mailboxes, trash bins, and animated boomboxes.
- Expanded the night roster with burning barrels, steam stacks, garbage bags and rats, cats, cops, streetwalkers, and sleeping street figures.
- Added animated flies, water, fire, steam, rat tails, cop running, billy-club waving, and rolling cart details.
- Enriched parallax scenery with varied brownstones, fire escapes, roof tanks, muted parked cars, varied parking gaps, and silhouette pedestrians.

### Nicole and Stella

- Enlarged the game resolution and character presentation.
- Added Nicole's stumble, fall, recovery, and aerial tumble reactions.
- Moved Stella farther behind Nicole, enlarged her, lengthened her airtime, and added a graceful forward jump arc with landing recovery.

### Audio and presentation

- Added a synthesized 8-bit soundtrack with jump, super-jump, reward, bird, damage, and game-over effects.
- Improved instruction panels, text rendering, health feedback, and the title: *Streetwise: Nicole & Stella*.
