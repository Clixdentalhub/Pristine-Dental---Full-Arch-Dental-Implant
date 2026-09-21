/* Resolves a usable ffmpeg and fails early with something actionable.

   Playwright ships an ffmpeg binary, but it is a stripped build for capturing
   traces: no lavfi, no libx264, no mp4 muxer, no mjpeg encoder. It cannot do
   any of this work, so it is not used. */
import { execFileSync } from 'node:child_process';

const CANDIDATES = [process.env.FFMPEG, 'ffmpeg', '/usr/bin/ffmpeg', '/usr/local/bin/ffmpeg'].filter(Boolean);

function probe(bin) {
  try {
    const encoders = execFileSync(bin, ['-hide_banner', '-encoders'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    const muxers = execFileSync(bin, ['-hide_banner', '-muxers'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    return {
      bin,
      mjpeg: /\bmjpeg\b/.test(encoders),
      x264: /libx264/.test(encoders),
      mp4: /\bmp4\b/.test(muxers),
    };
  } catch {
    return null;
  }
}

export function findFfmpeg(need = []) {
  const tried = [];
  for (const bin of CANDIDATES) {
    const cap = probe(bin);
    if (!cap) { tried.push(`${bin} (not runnable)`); continue; }
    const missing = need.filter((n) => !cap[n]);
    if (missing.length) { tried.push(`${bin} (missing: ${missing.join(', ')})`); continue; }
    return cap;
  }
  console.error(`\nNo usable ffmpeg found. Tried:\n  ${tried.join('\n  ') || '(none)'}`);
  console.error(`\nThis needs a full ffmpeg build with: ${need.join(', ')}.`);
  console.error(`  macOS    brew install ffmpeg`);
  console.error(`  Debian   sudo apt install ffmpeg`);
  console.error(`  Windows  winget install Gyan.FFmpeg`);
  console.error(`\nOr point FFMPEG at one:  FFMPEG=/path/to/ffmpeg node ${process.argv[1].split('/').pop()} ...\n`);
  process.exit(1);
}
