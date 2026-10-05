import { readFile, readdir, mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import assert from 'node:assert/strict';
import console from 'node:console';
import { createRequire } from 'node:module';
import { Buffer } from 'node:buffer';
import process from 'node:process';
import { extractEmbeddedRapierWasm } from '../build/externalRapierWasm.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const directory = path.join(root, 'dist/assets');
const names = await readdir(directory);
const wasmName = names.find(name => name.startsWith('rapier-physics-') && name.endsWith('.wasm'));
assert.ok(wasmName, 'Physics binary must be emitted');
const wasm = await readFile(path.join(directory, wasmName));
// Resolve from the actual consumer: a separate older compatibility package may
// exist at the workspace root for another dependency.
const require = createRequire(import.meta.url);
const physicsRequire = createRequire(require.resolve('@react-three/rapier'));
const physicsEntry = physicsRequire.resolve('@dimforge/rapier3d-compat');
const physicsPackage = JSON.parse(await readFile(path.join(path.dirname(physicsEntry), 'package.json'), 'utf8'));
const installed = await readFile(physicsEntry, 'utf8');
assert.ok(extractEmbeddedRapierWasm(installed).wasm.equals(wasm), 'Do not change the physics binary');
await WebAssembly.compile(wasm);
const lanyardName = names.find(name => name.startsWith('Lanyard-') && name.endsWith('.js'));
const lanyard = await readFile(path.join(directory, lanyardName), 'utf8');
assert.ok(lanyard.includes(wasmName), 'Lanyard must resolve the emitted binary');
assert.ok(!lanyard.includes('AGFzbQEAAAAB'), 'Base64 binary must not remain in JavaScript');
assert.ok(names.some(name => name.startsWith('WorkArchivePage-') && name.endsWith('.js')));
assert.ok(names.some(name => name.startsWith('AboutProfilePage-') && name.endsWith('.js')));
assert.ok(names.some(name => name.startsWith('ContactFormPage-') && name.endsWith('.js')));
const html = await readFile(path.join(root, 'dist/index.html'), 'utf8');
assert.ok(!html.includes('fonts.googleapis.com'));
assert.match(html, /rel="preload"[^>]*Yink-[^>]*\.woff2/);
const report = { physicsVersion: physicsPackage.version, physicsBytes: wasm.length, physicsSha256: createHash('sha256').update(wasm).digest('hex'), binaryUnchanged: true, wasmCompiles: true, embeddedBase64Removed: true, lanyardJsBytes: Buffer.byteLength(lanyard), separateNavEntries: true, localFontsAndHeroPreload: true };
const serialized = JSON.stringify(report, null, 2) + '\n';
const reportIndex = process.argv.indexOf('--report');
if (reportIndex >= 0) {
  const target = path.resolve(root, process.argv[reportIndex + 1]);
  const relative = path.relative(root, target);
  assert.ok(!relative.startsWith('..') && !path.isAbsolute(relative), 'Report must stay inside the repository');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, serialized);
}
console.log(serialized);
