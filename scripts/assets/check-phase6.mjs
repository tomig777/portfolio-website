import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import console from 'node:console';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const read = async name => JSON.parse(await readFile(path.join(root, 'docs/verification/phase-6-assets', name), 'utf8'));
const [build, capture, images, fonts, contract, video] = await Promise.all([
  read('build-release.json'), read('browser-final.json'), read('images.json'),
  read('fonts.json'), read('build-contract.json'), read('video.json'),
]);
let checks = 0;
const check = (name, value) => { assert.ok(value, name); checks += 1; console.log(`PASS ${name}`); };
check('browser capture identifies the release runtime', capture.sourceHash === build.runtimeSourceSha256);
check('browser capture identifies the release build inputs', capture.buildInputsHash === build.buildInputsSha256);
check('browser capture identifies the emitted release assets', capture.emittedAssetsHash === build.emittedAssetsSha256);
check('eight converted images have unchanged visible pixels', images.assets.length === 8 && images.assets.every(asset => asset.changedVisiblePixels === 0));
check('all 21 converted fonts retain outlines, metrics and shaping', fonts.fonts.length === 21 && fonts.fonts.every(font => font.glyphOutlinesAndMetricsMatch && font.shapingTablesMatch));
check('external physics binary is unchanged and compiles', contract.binaryUnchanged && contract.wasmCompiles && contract.embeddedBase64Removed);
check('navigation bundles and local font preload exist', contract.separateNavEntries && contract.localFontsAndHeroPreload);
check('archive video keeps its encoded streams and moves metadata first', video.encodedStreamsUnchanged && video.outputAtoms.indexOf('moov') < video.outputAtoms.indexOf('mdat'));
const o = capture.observations;
for (const [name, view] of [['phone', o.phone], ['desktop', o.desktop]]) {
  check(`${name} live lanyard settles`, view.graphics.some(g => g.canvases.some(c => c.motion === 'settled')));
  check(`${name} work media is not fetched on untouched landing`, view.images.filter(i => i.src === '').length === 4 && view.videos.length === 0);
}
check('phone renders no desktop arm SVG', o.phoneLayout.arms === 0);
check('phone work previews load after scrolling', o.phoneScroll.images.length === 4 && o.phoneScroll.images.every(i => i.complete && i.naturalWidth > 0));
check('gallery is loaded at phone dimensions', o.gallery.loaderCount === 0 && o.gallery.opacity === '1' && o.gallery.canvases.some(c => c.width === 390 && c.height === 844));
check('gallery paints above navigation page and header', o.gallery.layer > o.gallery.pageLayer && o.gallery.layer > o.gallery.headerLayer);
check('desktop arms start without mask downloads', o.armsBefore.arms === 1 && o.armsBefore.maskHrefs.every(href => href === null));
check('desktop artwork loads and scroll continues to its target', o.armsAfter.scrollTop >= 16199 && o.armsAfter.arms.some(a => a.visible === 'visible' && a.maskHrefs.every(Boolean) && a.glyphCharacters > 30000));
check('all work videos pause when offscreen at final scene', o.armsAfter.videos.length === 4 && o.armsAfter.videos.every(v => v.paused));
check('separate Work page has loaded preview images', o.work.images.length === 4 && o.work.images.every(i => i.complete && i.naturalWidth > 0));
check('About portrait retains full dimensions', o.about.portrait.some(p => p.complete && p.naturalWidth === 1114 && p.naturalHeight === 1412));
check('Contact has three fields and no horizontal overflow', o.contact.fields.length === 3 && o.contact.overflowX === false);
check('archive video plays from its fast-start asset', o.archiveVideo.some(v => v.src.includes('background-faststart-') && v.readyState === 4 && !v.paused && v.time > 0 && v.error === null));
check('phone and desktop reported initial transfer sizes are lower', capture.comparisons.phone.savedBytes > 0 && capture.comparisons.desktop.savedBytes > 0);
check('clean phone console sample contains no errors', capture.console.phone.errors === 0);
console.log(`${checks} saved-observation checks passed. These assertions do not independently drive the browser.`);
