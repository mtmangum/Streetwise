const midiToHz = (note) => 440 * (2 ** ((note - 69) / 12));

const MELODY = [76,null,79,null,83,81,79,null,74,null,76,79,81,null,79,null,
  76,null,79,81,83,null,86,83,81,79,76,null,74,null,71,null];
const STORM_MELODY = [64,null,null,63,59,null,58,null,64,null,67,null,63,null,58,null,
  61,null,null,60,56,null,55,null,61,60,56,null,51,null,null,null];

const ARRANGEMENTS = {
  day: { transpose: 0, bass: [40,40,43,43,36,36,38,38], lead: 'square', pulse: 2 },
  afternoon: { transpose: 2, bass: [40,43,45,43,38,40,43,38], lead: 'square', pulse: 2 },
  dusk: { transpose: -2, bass: [38,38,41,41,34,34,36,36], lead: 'triangle', pulse: 4 },
  night: { transpose: -5, bass: [35,35,38,38,31,31,33,33], lead: 'square', pulse: 4 },
  storm: { melody: STORM_MELODY, transpose: 0, bass: [28,28,31,29,25,25,30,24], lead: 'square', pulse: 2 },
  dawn: { transpose: -1, bass: [36,36,40,40,33,33,35,35], lead: 'triangle', pulse: 4 }
};

// Tiny Web Audio synth: no downloaded assets, just square/triangle waves
// arranged into a looping 8-bit street theme and short gameplay stingers.
export class ChiptuneAudio {
  constructor(scene) {
    this.scene = scene;
    this.context = scene.sound.context;
    this.musicStep = 0;
    this.musicEvent = null;
    this.startPromise = null;
    this.sceneName = 'day';
  }

  tone(frequency, duration = 0.1, volume = 0.06, type = 'square', slideTo = null, delay = 0) {
    if (!this.context) return;
    const start = this.context.currentTime + delay;
    const oscillator = this.context.createOscillator();
    const gain = this.context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, start);
    if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);
    gain.gain.setValueAtTime(volume, start);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    oscillator.connect(gain);
    gain.connect(this.context.destination);
    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  start() {
    if (this.musicEvent || this.startPromise) return this.startPromise;

    // Browsers are allowed to keep Web Audio suspended until a user gesture.
    // Waiting for resume() is significant on Safari/iOS: scheduling oscillators
    // before its promise settles can leave the synth silent on hosted pages.
    this.context = this.scene.sound.context ?? this.context;
    if (!this.context) return null;

    this.startPromise = Promise.resolve(
      this.context.state === 'running' ? undefined : this.context.resume?.()
    )
      .then(() => {
        if (this.context.state !== 'running' || this.musicEvent) return;
        this.playMusicStep();
        this.musicEvent = this.scene.time.addEvent({
          delay: 145,
          loop: true,
          callback: () => this.playMusicStep()
        });
      })
      .catch((error) => {
        // A later gameplay gesture can call start() again if the browser did
        // not accept the first unlock attempt.
        console.warn('Unable to start Streetwise audio', error);
      })
      .finally(() => {
        this.startPromise = null;
      });

    return this.startPromise;
  }

  stop() {
    this.musicEvent?.remove(false);
    this.musicEvent = null;
  }

  setScene(sceneName) {
    if (!ARRANGEMENTS[sceneName] || sceneName === this.sceneName) return;
    this.sceneName = sceneName;
    // A tiny two-note cue makes the visual transition audible without
    // interrupting or restarting the main loop.
    const cue = sceneName === 'storm' ? [47, 40] : [64, 67];
    cue.forEach((note, index) => this.tone(midiToHz(note), 0.12, 0.025, 'square', null, index * 0.07));
  }

  playMusicStep() {
    const arrangement = ARRANGEMENTS[this.sceneName];
    const melody = arrangement.melody ?? MELODY;
    const step = this.musicStep % melody.length;
    const note = melody[step];
    const sparseNightBeat = this.sceneName === 'night' && step % 4 === 2;
    if (note !== null && !sparseNightBeat) {
      this.tone(midiToHz(note + arrangement.transpose), 0.105, 0.025, arrangement.lead);
    }
    if (step % 4 === 0) {
      this.tone(midiToHz(arrangement.bass[(step / 4) % arrangement.bass.length]), 0.22, 0.035, 'triangle');
    }
    if (step % arrangement.pulse === 0) {
      this.tone(step % 4 === 0 ? 95 : 125, 0.025, this.sceneName === 'storm' ? 0.018 : 0.012, 'square');
    }
    this.musicStep += 1;
  }

  jump() {
    this.tone(260, 0.11, 0.07, 'square', 520);
  }

  superJump() {
    this.tone(390, 0.16, 0.08, 'square', 920);
    this.tone(780, 0.08, 0.035, 'square', null, 0.08);
  }

  powerReady() {
    [72, 79, 84].forEach((note, i) => this.tone(midiToHz(note), 0.09, 0.04, 'square', null, i * 0.045));
  }

  health() {
    [72, 76, 79].forEach((note, i) => this.tone(midiToHz(note), 0.1, 0.045, 'square', null, i * 0.055));
  }

  pigeon() {
    [79, 83, 86].forEach((note, i) => this.tone(midiToHz(note), 0.12, 0.06, 'square', null, i * 0.07));
  }

  fullLife() {
    [72, 76, 79, 84, 88].forEach((note, i) => this.tone(midiToHz(note), 0.2, 0.075, 'square', null, i * 0.075));
  }

  sneakerBoost() {
    [76, 81, 88, 93].forEach((note, i) =>
      this.tone(midiToHz(note), 0.14, 0.055, 'square', null, i * 0.055)
    );
  }

  zoomies() {
    [55, 67, 79, 91].forEach((note, i) =>
      this.tone(midiToHz(note), 0.12, 0.055, i % 2 ? 'square' : 'triangle', null, i * 0.045)
    );
  }

  pinkStar() {
    [72, 79, 84, 91, 96].forEach((note, i) =>
      this.tone(midiToHz(note), 0.16, 0.055, 'square', null, i * 0.05)
    );
  }

  starDeflect() {
    this.tone(980, 0.1, 0.045, 'triangle', 1450);
    this.tone(620, 0.08, 0.035, 'square', null, 0.04);
  }

  hit() {
    this.tone(170, 0.28, 0.1, 'sawtooth', 55);
  }

  dogAttack() {
    this.tone(185, 0.08, 0.075, 'square', 115);
    this.tone(155, 0.1, 0.065, 'square', 95, 0.11);
  }

  crowDive() {
    this.tone(720, 0.34, 0.045, 'sawtooth', 145);
  }

  stellaLeap() {
    this.tone(330, 0.1, 0.06, 'square', 620);
    this.tone(620, 0.08, 0.05, 'square', 880, 0.1);
  }

  crowKnocked() {
    this.tone(980, 0.22, 0.05, 'sawtooth', 230);
    this.tone(660, 0.16, 0.04, 'square', 180, 0.05);
  }

  cartTopple() {
    this.tone(150, 0.12, 0.07, 'sawtooth', 70);
    this.tone(980, 0.05, 0.03, 'square', 620, 0.1);
    this.tone(760, 0.05, 0.03, 'square', 480, 0.17);
  }

  coffee() {
    // A sip, then the beat drops: notes sliding down into a slower groove.
    [76, 72, 67, 64].forEach((note, i) =>
      this.tone(midiToHz(note), 0.14, 0.05, 'triangle', midiToHz(note - 2), i * 0.07)
    );
  }

  coffeeEnd() {
    [64, 67, 72].forEach((note, i) =>
      this.tone(midiToHz(note), 0.08, 0.04, 'square', null, i * 0.05)
    );
  }

  // Dragging the music clock slows the whole loop without touching its notes.
  setMusicTempo(scale) {
    if (this.musicEvent) this.musicEvent.timeScale = scale;
  }

  thunder() {
    this.tone(72, 0.7, 0.11, 'sawtooth', 34);
    this.tone(49, 0.9, 0.08, 'triangle', 29, 0.08);
    this.tone(96, 0.18, 0.045, 'square', 42, 0.03);
  }

  gameOver() {
    [55, 52, 48, 43].forEach((note, i) => this.tone(midiToHz(note), 0.28, 0.07, 'square', null, i * 0.18));
  }
}
