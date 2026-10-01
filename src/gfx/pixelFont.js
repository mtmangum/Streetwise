import Phaser from 'phaser';

// A tiny 5x7 bitmap font, so the title screen and menu can look like an NES
// game without depending on a web font. Glyphs are drawn pixel by pixel into
// small textures (cached by their style), then used as ordinary images.
const GLYPHS = {
  A: '.###./#...#/#...#/#####/#...#/#...#/#...#',
  B: '####./#...#/#...#/####./#...#/#...#/####.',
  C: '.###./#...#/#..../#..../#..../#...#/.###.',
  D: '####./#...#/#...#/#...#/#...#/#...#/####.',
  E: '#####/#..../#..../####./#..../#..../#####',
  F: '#####/#..../#..../####./#..../#..../#....',
  G: '.###./#...#/#..../#.###/#...#/#...#/.###.',
  H: '#...#/#...#/#...#/#####/#...#/#...#/#...#',
  I: '.###./..#../..#../..#../..#../..#../.###.',
  J: '..###/...#./...#./...#./...#./#..#./.##..',
  K: '#...#/#..#./#.#../##.../#.#../#..#./#...#',
  L: '#..../#..../#..../#..../#..../#..../#####',
  M: '#...#/##.##/#.#.#/#.#.#/#...#/#...#/#...#',
  N: '#...#/##..#/#.#.#/#..##/#...#/#...#/#...#',
  O: '.###./#...#/#...#/#...#/#...#/#...#/.###.',
  P: '####./#...#/#...#/####./#..../#..../#....',
  Q: '.###./#...#/#...#/#...#/#.#.#/#..#./.##.#',
  R: '####./#...#/#...#/####./#.#../#..#./#...#',
  S: '.####/#..../#..../.###./....#/....#/####.',
  T: '#####/..#../..#../..#../..#../..#../..#..',
  U: '#...#/#...#/#...#/#...#/#...#/#...#/.###.',
  V: '#...#/#...#/#...#/#...#/#...#/.#.#./..#..',
  W: '#...#/#...#/#...#/#.#.#/#.#.#/##.##/#...#',
  X: '#...#/#...#/.#.#./..#../.#.#./#...#/#...#',
  Y: '#...#/#...#/.#.#./..#../..#../..#../..#..',
  Z: '#####/....#/...#./..#../.#.../#..../#####',
  0: '.###./#..##/#.#.#/##..#/#...#/#...#/.###.',
  1: '..#../.##../..#../..#../..#../..#../.###.',
  2: '.###./#...#/....#/...#./..#../.#.../#####',
  3: '####./....#/....#/.###./....#/....#/####.',
  4: '#...#/#...#/#...#/#####/....#/....#/....#',
  5: '#####/#..../####./....#/....#/#...#/.###.',
  6: '.###./#..../#..../####./#...#/#...#/.###.',
  7: '#####/....#/...#./..#../.#.../.#.../.#...',
  8: '.###./#...#/#...#/.###./#...#/#...#/.###.',
  9: '.###./#...#/#...#/.####/....#/....#/.###.',
  '&': '.##../#..#./#.#../.#.../#.#.#/#..#./.##.#',
  ':': '...../..#../..#../...../..#../..#../.....',
  '-': '...../...../...../#####/...../...../.....',
  '(': '..#../.#.../#..../#..../#..../.#.../..#..',
  ')': '..#../...#./....#/....#/....#/...#./..#..',
  '!': '..#../..#../..#../..#../..#../...../..#..',
  '.': '...../...../...../...../...../.##../.##..',
  '>': '#..../##.../###../####./###../##.../#....',
  ' ': '.../.../.../.../.../.../...'
};

const hex = (color) => Phaser.Display.Color.HexStringToColor(color).color;

// Builds (or reuses) a texture for `text` and returns its key and size.
function pixelTexture(scene, text, { scale, top, bottom, outline, shadow }) {
  const key = `px|${text}|${scale}|${top}|${bottom}|${outline}|${shadow}`;
  const glyphs = [...text.toUpperCase()].map((ch) => GLYPHS[ch] ?? GLYPHS[' ']);
  const cells = [];
  let cursor = 0;
  glyphs.forEach((rows) => {
    const rowList = rows.split('/');
    const width = rowList[0].length;
    rowList.forEach((row, y) => {
      [...row].forEach((c, x) => {
        if (c === '#') cells.push([cursor + x, y]);
      });
    });
    cursor += width + 1;
  });
  const cols = cursor - 1;
  const pad = 1;
  const extra = shadow ? 1 : 0;
  const width = (cols + pad * 2 + extra) * scale;
  const height = (7 + pad * 2 + extra) * scale;
  if (!scene.textures.exists(key)) {
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    const fill = (color, x, y) => {
      g.fillStyle(color, 1);
      g.fillRect((x + pad) * scale, (y + pad) * scale, scale, scale);
    };
    if (shadow) cells.forEach(([x, y]) => fill(hex(shadow), x + 1, y + 1));
    if (outline) {
      cells.forEach(([x, y]) => {
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) fill(hex(outline), x + dx, y + dy);
        }
      });
    }
    // The top three rows use `top` and the rest `bottom`, the two-tone bevel
    // that classic logos have.
    cells.forEach(([x, y]) => fill(hex(y < 4 ? top : bottom ?? top), x, y));
    g.generateTexture(key, width, height);
    g.destroy();
  }
  return { key, width, height };
}

// Adds a pixel-font image to the scene. Colors are CSS hex strings.
export function pixelText(scene, x, y, text, options = {}) {
  const {
    scale = 3,
    top = '#ffffff',
    bottom = null,
    outline = '#000000',
    shadow = null,
    originX = 0.5,
    originY = 0.5
  } = options;
  const { key } = pixelTexture(scene, text, { scale, top, bottom, outline, shadow });
  return scene.add.image(x, y, key).setOrigin(originX, originY);
}
