import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import console from 'node:console';

// Download exactly the WOFF2 URLs returned for the site's existing families
// and weight requests; do not substitute a different font build or subset.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const output = path.join(root, 'src/assets/fonts/google');
const headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Safari/537.36' };
const url = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Inter:wght@300;400;500;600;700;800&family=Outfit:wght@300;400;500;600;700&display=swap';
const response = await fetch(url, { headers });
if (!response.ok) throw new Error(`Font stylesheet: HTTP ${response.status}`);
const sourceCss = await response.text();
const urls = [...new Set([...sourceCss.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g)].map(match => match[1]))];
if (!urls.length) throw new Error('No WOFF2 font URLs found');
await mkdir(output, { recursive: true });
const assets = [];
for (const assetUrl of urls) {
  const fontResponse = await fetch(assetUrl);
  if (!fontResponse.ok) throw new Error(`Font asset: HTTP ${fontResponse.status}`);
  const bytes = Buffer.from(await fontResponse.arrayBuffer());
  if (bytes.toString('ascii', 0, 4) !== 'wOF2') throw new Error('Expected WOFF2');
  const filename = new URL(assetUrl).pathname.split('/').slice(-3).join('-');
  await writeFile(path.join(output, filename), bytes);
  assets.push({ url: assetUrl, file: `src/assets/fonts/google/${filename}`, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
}
const licenses = path.join(root, 'public/font-licenses');
await mkdir(licenses, { recursive: true });
for (const family of ['inter', 'outfit', 'bebasneue']) {
  const licenseUrl = `https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`;
  const license = await fetch(licenseUrl);
  if (!license.ok) throw new Error(`Font license: HTTP ${license.status}`);
  await writeFile(path.join(licenses, `${family}-OFL.txt`), await license.text());
}
// This is generated font CSS, not a source-code rewrite. Keep all returned
// Unicode ranges/weights, including non-Latin subsets and archive typography.
let css = sourceCss;
for (const asset of assets) css = css.replaceAll(asset.url, `./${path.basename(asset.file)}`);
await writeFile(path.join(output, 'google-fonts.css'), '/* Same font builds as the former Google Fonts requests; locally hosted. */\n' + css);
const report = { sourceStylesheet: url, retrievedAt: new Date().toISOString(), assets };
const reportPath = path.join(root, 'docs/verification/phase-6-assets/google-fonts.json');
await mkdir(path.dirname(reportPath), { recursive: true });
await writeFile(reportPath, JSON.stringify(report, null, 2) + '\n');
console.log(JSON.stringify({ fonts: assets.length, bytes: assets.reduce((total, asset) => total + asset.bytes, 0), licenses: ['Inter', 'Outfit', 'Bebas Neue'] }));
