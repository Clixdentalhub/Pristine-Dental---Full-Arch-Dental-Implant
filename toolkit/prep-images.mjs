#!/usr/bin/env node
/* prep-images.mjs — resize, crop and compress campaign photos for the web.
 *
 *   node prep-images.mjs <in-dir> <out-dir> [--width 1600] [--square] [--4x3] [--4x5]
 *
 * Run this BEFORE embedding. A phone or DSLR photo is 3–8 MB; the web needs
 * 60–150 KB. Skipping this step is the single most common reason an embedded
 * page ends up too heavy to paste.
 *
 * Aspect flags crop to a shape using smart attention detection (keeps faces):
 *   --square  1:1   profile portraits
 *   --4x3     4:3   gallery tiles, card images
 *   --4x5     4:5   tall portraits
 *   (omit)          keeps the original shape, just resizes
 *
 * Needs sharp:  npm install sharp
 */
import { readdir, mkdir } from 'node:fs/promises';
import { join, extname, basename } from 'node:path';
import sharp from 'sharp';

const args = process.argv.slice(2);
const [inDir, outDir] = args.filter((a) => !a.startsWith('--'));
if (!inDir || !outDir) {
  console.error('usage: node prep-images.mjs <in-dir> <out-dir> [--width 1600] [--square|--4x3|--4x5]');
  process.exit(1);
}
const flag = (name, fallback) => {
  const i = args.indexOf('--' + name);
  return i === -1 ? fallback : Number(args[i + 1]);
};
const width = flag('width', 1600);
const ratio = args.includes('--square') ? 1
            : args.includes('--4x3') ? 4 / 3
            : args.includes('--4x5') ? 4 / 5
            : null;

await mkdir(outDir, { recursive: true });
const files = (await readdir(inDir)).filter((f) => /\.(jpe?g|png|webp|avif|tiff?)$/i.test(f));
if (!files.length) { console.error(`no images found in ${inDir}`); process.exit(1); }

let total = 0;
for (const file of files) {
  const out = join(outDir, basename(file, extname(file)) + '.jpg');
  let img = sharp(join(inDir, file), { failOn: 'none' }).rotate();   // honour EXIF orientation

  if (ratio) {
    // position:'attention' keeps the most salient region — faces survive the crop
    img = img.resize({ width, height: Math.round(width / ratio), fit: 'cover', position: 'attention' });
  } else {
    img = img.resize({ width, withoutEnlargement: true });
  }

  const info = await img.jpeg({ quality: 84, mozjpeg: true }).toFile(out);
  total += info.size;
  console.log(`${file.padEnd(28)} -> ${basename(out).padEnd(28)} ${info.width}x${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}
console.log(`\n${files.length} image(s), ${(total / 1024).toFixed(0)} KB total -> ${outDir}`);
