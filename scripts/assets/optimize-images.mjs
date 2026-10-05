import { createRequire } from 'node:module';
import { readFile, mkdir, stat, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';

// Build-time utility only. Point SHARP_MODULE at an installed Sharp module;
// neither Sharp nor this script is imported by the application.
const require = createRequire(import.meta.url);
const sharp = require(process.env.SHARP_MODULE || 'sharp');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const assetRoot = path.join(root, 'src/assets');
const outputRoot = path.join(assetRoot, 'web-optimized');
const inputs = ['portrait-2.png', 'szia.png', 'logo-dark.png', 'logo-light.png', 'lanyard.png', 'nuke_logo2.png', 'substance_logo.png', 'touchdesigner_logo.png'];
const report = [];
await mkdir(outputRoot, { recursive: true });

for (const name of inputs) {
  const source = path.join(assetRoot, name);
  const output = path.join(outputRoot, name.replace(/\.png$/, '.webp'));
  await sharp(source).keepIccProfile().webp({ lossless: true, effort: 6 }).toFile(output);
  const original = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const optimized = await sharp(output).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  if (original.info.width !== optimized.info.width || original.info.height !== optimized.info.height || original.data.length !== optimized.data.length) {
    throw new Error(`Dimensions changed: ${name}`);
  }
  let changedVisiblePixels = 0;
  for (let index = 0; index < original.data.length; index += 4) {
    if (original.data[index + 3] !== optimized.data[index + 3] || (original.data[index + 3] !== 0 && !original.data.subarray(index, index + 3).equals(optimized.data.subarray(index, index + 3)))) changedVisiblePixels += 1;
  }
  if (changedVisiblePixels !== 0) throw new Error(`Visible pixels changed: ${name}`);
  const sourceBytes = (await stat(source)).size;
  const outputBytes = (await stat(output)).size;
  report.push({ source: `src/assets/${name}`, output: `src/assets/web-optimized/${path.basename(output)}`, width: original.info.width, height: original.info.height, sourceBytes, outputBytes, savedBytes: sourceBytes - outputBytes, changedVisiblePixels, sourceSha256: createHash('sha256').update(await readFile(source)).digest('hex'), outputSha256: createHash('sha256').update(await readFile(output)).digest('hex') });
}

const summary = { tool: `Sharp ${sharp.versions.sharp}`, mode: 'lossless; original dimensions and ICC profile retained; no visible pixel differences', assets: report };
const outputIndex = process.argv.indexOf('--report');
if (outputIndex !== -1) {
  const target = path.resolve(root, process.argv[outputIndex + 1]);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, JSON.stringify(summary, null, 2) + '\n');
}
console.log(JSON.stringify(summary, null, 2));
