#!/usr/bin/env node
/* Prepares a background video and its poster frame.

     node optimise-video.mjs <source.mp4> [--width 1600] [--crf 28] [--seek 2]

   Writes assets/video/prestine-dental-hero.mp4 and its poster .jpg.

   Background video is decorative, muted and heavily scrimmed, so it can
   take far more compression than footage anyone actually watches. Audio is
   stripped: the track can never be heard and only costs bytes. faststart
   moves the index to the front so playback can begin before the whole file
   has arrived. */
import { mkdir, stat } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { join } from 'node:path';
import { findFfmpeg } from './lib/ffmpeg.mjs';

const run = promisify(execFile);
const FFMPEG = findFfmpeg(['x264', 'mp4', 'mjpeg']).bin;
const OUT = 'assets/video';
const NAME = 'prestine-dental-hero';

const [src] = process.argv.slice(2).filter((a) => !a.startsWith('--'));
if (!src) {
  console.error('usage: node optimise-video.mjs <source.mp4> [--width 1600] [--crf 28] [--seek 2]');
  process.exit(1);
}
const arg = (n, d) => {
  const i = process.argv.indexOf('--' + n);
  return i === -1 ? d : Number(process.argv[i + 1]);
};
const WIDTH = arg('width', 1600), CRF = arg('crf', 28), SEEK = arg('seek', 2);

await mkdir(OUT, { recursive: true });
const before = (await stat(src)).size;
const mp4 = join(OUT, `${NAME}.mp4`);
const jpg = join(OUT, `${NAME}-poster.jpg`);

await run(FFMPEG, ['-y', '-loglevel', 'error', '-i', src,
  '-an',                                   // no audio: it can never be heard
  '-vf', `scale='min(${WIDTH},iw)':-2`,
  '-c:v', 'libx264', '-profile:v', 'high', '-pix_fmt', 'yuv420p',
  '-crf', String(CRF), '-preset', 'slow',
  '-movflags', '+faststart',
  mp4]);

await run(FFMPEG, ['-y', '-loglevel', 'error', '-ss', String(SEEK), '-i', src,
  '-frames:v', '1', '-vf', `scale='min(${WIDTH},iw)':-2`, '-q:v', '4', jpg]);

const kb = async (f) => ((await stat(f)).size / 1024).toFixed(0) + ' KB';
console.log(`\n  ${src}  ${(before / 1024 / 1024).toFixed(1)} MB`);
console.log(`  → ${mp4}     ${await kb(mp4)}`);
console.log(`  → ${jpg}  ${await kb(jpg)}`);
console.log(`\nThe poster is the resting state: it is what shows before playback,`);
console.log(`under prefers-reduced-motion, on save-data, and if autoplay is refused.`);
console.log(`Check that the frame at ${SEEK}s is one worth sitting still on — pass`);
console.log(`--seek to pick another.\n`);
