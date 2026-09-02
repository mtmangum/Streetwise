import Phaser from 'phaser';
import { PLAYER, RENDER_SCALE } from '../config.js';

const METER = { labelX: 16, labelY: 39, trackX: 64, trackY: 34, width: 150, height: 10 };

// Owns jump input interpretation and the recoverable double-tap power meter.
// PlayScene only decides whether gameplay currently accepts input.
export class JumpController {
  constructor(scene, player, audio, onJump) {
    this.scene = scene;
    this.player = player;
    this.audio = audio;
    this.onJump = onJump;
    this.held = false;
    this.lastTapAt = -Infinity;
    this.powerReadyAt = 0;
    this.wasReady = true;

    this.label = scene.add
      .text(METER.labelX, METER.labelY, 'POWER', {
        fontFamily: 'monospace',
        fontSize: '10px',
        fontStyle: 'bold',
        resolution: RENDER_SCALE,
        color: '#b8ffbf',
        stroke: '#090b10',
        strokeThickness: 2
      })
      .setOrigin(0, 0.5)
      .setDepth(23);
    scene.add
      .rectangle(METER.trackX, METER.trackY, METER.width, METER.height, 0x14161c)
      .setOrigin(0, 0)
      .setStrokeStyle(1, 0x000000, 0.8)
      .setDepth(22);
    this.fill = scene.add
      .rectangle(METER.trackX + 2, METER.trackY + 2, METER.width - 4, METER.height - 4, 0xf2c14e)
      .setOrigin(0, 0)
      .setDepth(23);
  }

  press() {
    if (this.held) return;
    this.held = true;
    const now = this.scene.time.now;
    const doubleTap = now - this.lastTapAt <= PLAYER.doubleTapWindowMs;
    this.lastTapAt = now;

    if (doubleTap && now >= this.powerReadyAt && this.player.powerJump()) {
      this.powerReadyAt = now + PLAYER.powerJumpRecoveryMs;
      this.wasReady = false;
      this.lastTapAt = -Infinity;
      this.audio.superJump();
      return;
    }
    if (this.player.jump()) {
      this.audio.jump();
      this.onJump();
    }
  }

  release() {
    this.held = false;
  }

  resetInput() {
    this.held = false;
    this.lastTapAt = -Infinity;
  }

  update() {
    const recovery = Phaser.Math.Clamp(
      1 - (this.powerReadyAt - this.scene.time.now) / PLAYER.powerJumpRecoveryMs,
      0,
      1
    );
    this.fill.setScale(recovery, 1);
    const ready = recovery >= 1;
    this.fill.setFillStyle(ready ? 0xf2c14e : 0x58c8f2);
    this.label.setText(ready ? 'POWER' : 'RECOVER');
    this.label.setColor(ready ? '#b8ffbf' : '#f2c14e');
    if (ready && !this.wasReady) this.audio.powerReady();
    this.wasReady = ready;
  }
}
