#!/usr/bin/env node
/* Prepares camera-original photography for the web.
   The Drive originals are 2–4 MB each; dropped in raw, 23 of them make an
   ~80 MB page. This resizes and re-encodes them with the ffmpeg that ships
   with Playwright, so there is nothing extra to install.

     node optimise-images.mjs <source-folder> [--width 1600] [--quality 4]

   Writes assets/practice/, preserving each filename. */
import { readdir, mkdir, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join, extname, basename } from 'node:path';

const run = promisify(execFile);
const FFMPEG = process.env.FFMPEG || '/opt/pw-browsers/ffmpeg-1011/ffmpeg-linux';

const [src] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!src) {
  console.error('usage: node optimise-images.mjs <source-folder> [--width 1600] [--quality 4]');
  process.exit(1);
}
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i === -1 ? d : Number(process.argv[i + 1]);
};
const WIDTH = arg('width', 1600);
const Q = arg('quality', 4);            // ffmpeg mjpeg qscale: 2 best … 31 worst
const OUT = 'assets/practice';

await mkdir(OUT, { recursive: true });
const files = (await readdir(src)).filter((f) => /\.(jpe?g|png|webp)$/i.test(f)).sort();
if (!files.length) { console.error(`no images found in ${src}`); process.exit(1); }

let before = 0, after = 0;
for (const f of files) {
  const from = join(src, f);
  const to = join(OUT, basename(f, extname(f)) + '.jpg');
  before += (await stat(from)).size;
  await run(FFMPEG, ['-y', '-loglevel', 'error', '-i', from,
    '-vf', `scale='min(${WIDTH},iw)':-2`, '-q:v', String(Q), to]);
  const a = (await stat(to)).size;
  after += a;
  console.log(`  ${f} → ${to}  ${(a / 1024).toFixed(0)} KB`);
}
const mb = (n) => (n / 1024 / 1024).toFixed(1) + ' MB';
console.log(`\n${files.length} image(s): ${mb(before)} → ${mb(after)} (${(100 - after / before * 100).toFixed(0)}% smaller)`);
console.log(`\nThe page expects these filenames. If any photograph is in the wrong slot,`);
console.log(`swap the src in index.html — the gallery and the card images all read from ${OUT}/.`);
