/**
 * Generates the PWA icon set from a vector description so the repo stays
 * dependency-free (no sharp / imagemagick required).
 *
 *   node scripts/generate-icons.mjs
 *
 * Output: public/icons/*.png  (referenced by manifest.webmanifest + index.html)
 */
import { deflateSync } from 'node:zlib';
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const OUT_DIR = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'icons');

const NAVY = [0x00, 0x1a, 0x4d];
const GOLD = [0xfe, 0xd0, 0x00];

/** Lightning bolt, normalised 0..1 with y pointing down. */
const BOLT = [
  [0.58, 0.08],
  [0.26, 0.56],
  [0.44, 0.56],
  [0.4, 0.92],
  [0.74, 0.44],
  [0.56, 0.44],
];

const CRC_TABLE = (() => {
  const table = new Int32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }
  return table;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([len, body, crc]);
}

function encodePng(width, height, rgba) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // truecolour + alpha
  ihdr[10] = 0; // deflate
  ihdr[11] = 0; // adaptive filtering
  ihdr[12] = 0; // no interlace

  const stride = width * 4;
  const raw = Buffer.alloc((stride + 1) * height);
  for (let y = 0; y < height; y++) {
    raw[y * (stride + 1)] = 0; // filter: none
    rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }

  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

function insidePolygon(x, y, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/**
 * Renders one icon. `scale` shrinks the bolt towards the centre so that a
 * maskable icon keeps its glyph inside the guaranteed safe zone.
 */
function renderIcon(size, { scale = 1, SS = 4 } = {}) {
  const rgba = Buffer.alloc(size * size * 4);
  const offset = (1 - scale) / 2;
  const bolt = BOLT.map(([x, y]) => [offset + x * scale, offset + y * scale]);

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let r = 0;
      let g = 0;
      let b = 0;
      let a = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const px = (x + (sx + 0.5) / SS) / size;
          const py = (y + (sy + 0.5) / SS) / size;
          const [cr, cg, cb] = insidePolygon(px, py, bolt) ? GOLD : NAVY;
          r += cr;
          g += cg;
          b += cb;
          a += 255;
        }
      }
      const n = SS * SS;
      const i = (y * size + x) * 4;
      rgba[i] = Math.round(r / n);
      rgba[i + 1] = Math.round(g / n);
      rgba[i + 2] = Math.round(b / n);
      rgba[i + 3] = Math.round(a / n);
    }
  }
  return encodePng(size, size, rgba);
}

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  { file: 'icon-192.png', size: 192, scale: 0.78 },
  { file: 'icon-512.png', size: 512, scale: 0.78 },
  // Maskable icons are cropped to a circle by the OS, so keep the glyph small.
  { file: 'icon-maskable-192.png', size: 192, scale: 0.56 },
  { file: 'icon-maskable-512.png', size: 512, scale: 0.56 },
  { file: 'apple-touch-icon.png', size: 180, scale: 0.7 },
  { file: 'favicon-64.png', size: 64, scale: 0.86 },
];

for (const { file, size, scale } of targets) {
  const png = renderIcon(size, { scale });
  writeFileSync(resolve(OUT_DIR, file), png);
  console.log(`${file.padEnd(26)} ${size}x${size}  ${png.length} bytes`);
}