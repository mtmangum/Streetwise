const loadingScreen = document.getElementById('loading-screen');
const loadingStatus = document.getElementById('loading-status');
const retryButton = document.getElementById('loading-retry');

function setLoadingStatus(message) {
  if (loadingStatus) loadingStatus.textContent = message;
}

async function startGame() {
  try {
    setLoadingStatus('LOADING THE CITY…');
    const [phaserModule, config, bootModule, playModule] = await Promise.all([
      import('phaser'),
      import('./config.js'),
      import('./scenes/BootScene.js'),
      import('./scenes/PlayScene.js')
    ]);
    const Phaser = phaserModule.default;
    const { GAME_WIDTH, GAME_HEIGHT, RENDER_SCALE } = config;
    setLoadingStatus('DRAWING THE STREETS…');

    new Phaser.Game({
      type: Phaser.AUTO,
      parent: 'app',
      width: GAME_WIDTH * RENDER_SCALE,
      height: GAME_HEIGHT * RENDER_SCALE,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: GAME_WIDTH * RENDER_SCALE,
        height: GAME_HEIGHT * RENDER_SCALE
      },
      pixelArt: true,
      physics: {
        default: 'arcade',
        arcade: { gravity: { y: 0 }, debug: false }
      },
      scene: [bootModule.BootScene, playModule.PlayScene]
    });
  } catch (error) {
    console.error('Unable to start Streetwise', error);
    loadingScreen?.classList.add('has-error');
    loadingScreen?.setAttribute('aria-busy', 'false');
    setLoadingStatus(navigator.onLine ? 'LOAD FAILED — TRY AGAIN' : 'YOU APPEAR TO BE OFFLINE');
  }
}

retryButton?.addEventListener('click', () => window.location.reload());
window.addEventListener('offline', () => setLoadingStatus('CONNECTION LOST — WAITING FOR NETWORK'));
startGame();
