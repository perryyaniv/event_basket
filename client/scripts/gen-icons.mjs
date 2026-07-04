import sharp from 'sharp';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const svg = resolve(__dirname, '../public/icon.svg');

const targets = [
  { size: 512, out: '../public/icon-512.png' },
  { size: 192, out: '../public/icon-192.png' },
  { size: 180, out: '../public/apple-touch-icon.png' },
];

for (const { size, out } of targets) {
  const dest = resolve(__dirname, out);
  await sharp(svg).resize(size, size).png().toFile(dest);
  console.log(`${size}x${size} → ${dest}`);
}
