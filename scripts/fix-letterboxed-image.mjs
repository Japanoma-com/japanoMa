#!/usr/bin/env node
/**
 * Fix area-card hero images that were exported with solid-black
 * letterbox bars baked in. The renderer dropped the content into a
 * 2400×1350 canvas without filling the bars, so the rest of the
 * site's CSS (object-cover) shows them as visible bands inside the
 * hero card.
 *
 * Process: detect the content rows, extract that band, then resize +
 * centre-crop back to 2400×1350 (16:9) so the image lines up with
 * every other hero. Output overwrites the existing JPG and re-emits
 * the AVIF sibling so both formats stay in sync.
 *
 * Usage:
 *   node scripts/fix-letterboxed-image.mjs <slug>
 *
 * Example:
 *   node scripts/fix-letterboxed-image.mjs semboku
 */

import sharp from 'sharp';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const slug = process.argv[2];
if (!slug) {
  console.error('usage: node scripts/fix-letterboxed-image.mjs <slug>');
  process.exit(1);
}

const _dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(_dirname, '..');
const jpg = path.join(root, 'public/areas', `${slug}.jpg`);
const avif = path.join(root, 'public/areas', `${slug}.avif`);

async function detectBars(file) {
  const img = sharp(file);
  const { width, height } = await img.metadata();
  const raw = await img.raw().toBuffer();
  const rowBlack = (y, threshold = 8) => {
    let max = 0;
    for (let x = 0; x < width; x += 8) {
      const i = (y * width + x) * 3;
      const v = Math.max(raw[i], raw[i + 1], raw[i + 2]);
      if (v > max) max = v;
    }
    return max <= threshold;
  };
  let top = 0;
  while (top < height && rowBlack(top)) top++;
  let bot = height - 1;
  while (bot > top && rowBlack(bot)) bot--;
  return { width, height, top, bot };
}

(async () => {
  const { width, height, top, bot } = await detectBars(jpg);
  const contentH = bot - top + 1;
  console.log(`${slug}: content rows ${top}-${bot} (${contentH}/${height})`);
  if (top < 4 && height - 1 - bot < 4) {
    console.log('  no bars detected — nothing to do.');
    return;
  }

  // Extract the content band, then resize+cover-crop to 2400×1350
  // (the standard area-image dimension) so it slots in next to every
  // other hero without further changes.
  const TARGET_W = 2400;
  const TARGET_H = 1350;

  const extracted = await sharp(jpg)
    .extract({ left: 0, top, width, height: contentH })
    .resize(TARGET_W, TARGET_H, { fit: 'cover', position: 'center' })
    .toBuffer();

  await sharp(extracted).jpeg({ quality: 88, mozjpeg: true }).toFile(jpg);
  await sharp(extracted).avif({ quality: 56 }).toFile(avif);

  console.log(`  ✔ rewrote ${path.relative(root, jpg)}`);
  console.log(`  ✔ rewrote ${path.relative(root, avif)}`);
})();
