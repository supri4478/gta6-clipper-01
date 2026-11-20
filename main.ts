// gta6-clipper-01 entry point (Node 22, standard library only).
//
// The entry itself is a YouTube video: our agent found a GTA 6 moment,
// cut it into a vertical clip, and the clip was uploaded as a public
// Short with the bounty's line and our play code in its description.
// This program's only job is to hand the video's address to the gate:
// it reads VIDEO.json from the repository root, checks that it really
// names a video, and writes it into the output directory where the
// gate reads it.
//
// The grader runs this file twice in a sandbox. It exits 0 when the
// output was written, and non-zero with a plain-English error when
// anything about the input is wrong.
//
// Local test:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const sourceDir = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const destDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

function fail(message: string): never {
  console.error(`gta6-clipper-01: ${message}`);
  process.exit(1);
}

const sourcePath = join(sourceDir, 'VIDEO.json');
const destPath = join(destDir, 'VIDEO.json');

let rawText: string;
try {
  rawText = readFileSync(sourcePath, 'utf8');
} catch (err) {
  fail(`cannot read ${sourcePath}: ${(err as Error).message}`);
}

let payload: unknown;
try {
  payload = JSON.parse(rawText);
} catch (err) {
  fail(`VIDEO.json is not valid JSON: ${(err as Error).message}`);
}

if (
  typeof payload !== 'object' ||
  payload === null ||
  typeof (payload as { url?: unknown }).url !== 'string' ||
  (payload as { url: string }).url.length === 0
) {
  fail('VIDEO.json must be an object with a non-empty "url" string');
}

const videoUrl = (payload as { url: string }).url;
let parsedUrl: URL;
try {
  parsedUrl = new URL(videoUrl);
} catch {
  fail(`VIDEO.json "url" is not a valid URL: ${videoUrl}`);
}
const host = parsedUrl.hostname.replace(/^www\./, '');
const isYouTube =
  host === 'youtube.com' ||
  host === 'youtu.be' ||
  host.endsWith('.youtube.com');
if (!isYouTube) {
  fail(`VIDEO.json "url" does not point at YouTube: ${videoUrl}`);
}

mkdirSync(destDir, { recursive: true });

try {
  writeFileSync(destPath, rawText, 'utf8');
} catch (err) {
  fail(`cannot write ${destPath}: ${(err as Error).message}`);
}

console.log(`gta6-clipper-01: wrote ${destPath}`);
