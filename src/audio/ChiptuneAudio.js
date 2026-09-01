const midiToHz = (note) => 440 * (2 ** ((note - 69) / 12));

// Tiny Web Audio synth: no downloaded assets, just square/triangle waves
// arranged into a looping 8-bit street theme and short gameplay stingers.
export class ChiptuneAudio {
  constructor(scene) {
    this.scene = scene;
    this.context = scene.sound.context;
    this.musicStep = 0;
    this.musicEvent = null;
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
    this.context?.resume?.();
    if (this.musicEvent) return;
    this.playMusicStep();
    this.musicEvent = this.scene.time.addEvent({
      delay: 145,
      loop: true,
      callback: () => this.playMusicStep()
    });
  }

  stop() {
    this.musicEvent?.remove(false);
    this.musicEvent = null;
  }

  playMusicStep() {
    const melody = [76,null,79,null,83,81,79,null,74,null,76,79,81,null,79,null,
      76,null,79,81,83,null,86,83,81,79,76,null,74,null,71,null];
    const bass = [40,40,43,43,36,36,38,38];
    const step = this.musicStep % melody.length;
    if (melody[step] !== null) this.tone(midiToHz(melody[step]), 0.105, 0.025, 'square');
    if (step % 4 === 0) this.tone(midiToHz(bass[(step / 4) % bass.length]), 0.22, 0.035, 'triangle');
    if (step % 2 === 0) this.tone(step % 4 === 0 ? 95 : 125, 0.025, 0.012, 'square');
    this.musicStep += 1;
  }

  jump() {
    this.tone(260, 0.11, 0.07, 'square', 520);
  }

  superJump() {
    this.tone(390, 0.16, 0.08, 'square', 920);
    this.tone(780, 0.08, 0.035, 'square', null, 0.08);
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

  hit() {
    this.tone(170, 0.28, 0.1, 'sawtooth', 55);
  }

  gameOver() {
    [55, 52, 48, 43].forEach((note, i) => this.tone(midiToHz(note), 0.28, 0.07, 'square', null, i * 0.18));
  }
}
