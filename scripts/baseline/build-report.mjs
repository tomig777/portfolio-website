import { readFile, readdir, mkdir, writeFile, stat } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { gzipSync, brotliCompressSync } from 'node:zlib';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map(entry => entry.isDirectory() ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]));
  return nested.flat().sort();
}
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const assets = await Promise.all((await files(path.join(root, 'dist'))).map(async file => {
  const body = await readFile(file);
  const extension = path.extname(file).toLowerCase();
  return {
    file: relative(file), extension, bytes: body.length,
    sha256: createHash('sha256').update(body).digest('hex'),
    ...(['.js', '.css', '.html', '.svg'].includes(extension) ? {
      gzipBytes: gzipSync(body).length,
      brotliBytes: brotliCompressSync(body).length,
    } : {}),
  };
}));
const runtimeFiles = (await files(path.join(root, 'src'))).filter(file => /\.(jsx?|css)$/.test(file));
runtimeFiles.push(path.join(root, 'index.html'), path.join(root, 'vite.config.js'));
runtimeFiles.sort();
const hash = createHash('sha256');
for (const file of runtimeFiles) {
  hash.update(relative(file) + '\0');
  hash.update(await readFile(file));
  hash.update('\0');
}
const sourceAssets = await Promise.all((await files(path.join(root, 'src/assets'))).map(async file => ({ file: relative(file), bytes: (await stat(file)).size })));
const buildScriptRoot = path.join(root, 'scripts/build');
const buildScripts = await stat(buildScriptRoot).then(() => files(buildScriptRoot), () => []);
const buildInputHash = createHash('sha256');
for (const file of [...runtimeFiles, ...buildScripts].sort()) {
  buildInputHash.update(relative(file) + '\0');
  buildInputHash.update(await readFile(file));
  buildInputHash.update('\0');
}
const emittedAssetHash = createHash('sha256');
for (const asset of assets) emittedAssetHash.update(asset.file + '\0' + asset.sha256 + '\0');
const totals = {};
for (const asset of assets) {
  const group = totals[asset.extension] ||= { files: 0, bytes: 0, gzipBytes: 0 };
  group.files += 1;
  group.bytes += asset.bytes;
  group.gzipBytes += asset.gzipBytes || 0;
}
const git = args => execFileSync('git', args, { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
const report = {
  schemaVersion: 1,
  generatedAt: new Date().toISOString(),
  timezone: 'Europe/Budapest',
  commit: git(['rev-parse', 'HEAD']),
  nodeVersion: process.version,
  runtimeSourceSha256: hash.digest('hex'),
  runtimeSourceFileCount: runtimeFiles.length,
  buildInputsSha256: buildInputHash.digest('hex'),
  emittedAssetsSha256: emittedAssetHash.digest('hex'),
  totals,
  largestJs: assets.filter(asset => asset.extension === '.js').sort((a, b) => b.bytes - a.bytes).slice(0, 15),
  largestBuiltMedia: assets.filter(asset => !['.js', '.css', '.html'].includes(asset.extension)).sort((a, b) => b.bytes - a.bytes).slice(0, 20),
  largestSourceAssets: sourceAssets.sort((a, b) => b.bytes - a.bytes).slice(0, 20),
  assets,
  notes: [
    'Total emitted assets are not the initial page download: many routes and media are lazy-loaded.',
    'gzip and Brotli sizes are calculated estimates, not observed hosting response compression.',
    'Runtime source hash covers src JS/JSX/CSS, index.html and vite.config.js; test/docs/package-script additions do not alter it.',
  ],
};
const serialized = JSON.stringify(report, null, 2) + '\n';
const outputIndex = process.argv.indexOf('--out');
if (outputIndex >= 0) {
  const target = path.resolve(root, process.argv[outputIndex + 1]);
  const location = path.relative(root, target);
  if (location.startsWith('..') || path.isAbsolute(location)) throw new Error('Report output must stay inside this repository');
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, serialized, { flag: 'wx' });
  process.stdout.write(`Saved ${relative(target)}\n`);
} else process.stdout.write(serialized);
