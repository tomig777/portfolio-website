import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import console from 'node:console';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const directory = path.join(root, 'docs/verification/phase-7-cleanup');
const json = async name => JSON.parse(await readFile(path.join(directory, name), 'utf8'));
const build = await json('build-final.json');
const before = await json('browser-before.json');
const capture = await json('browser-final.json');
let checks = 0;
const check = (label, value) => { assert.ok(value, label); checks++; };

async function files(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(path.join(directory, entry.name)) : [path.join(directory, entry.name)]))).flat();
}
const relative = file => path.relative(root, file).replaceAll('\\', '/');
const runtimeFiles = (await files(path.join(root, 'src'))).filter(file => /\.(jsx?|css)$/.test(file));
runtimeFiles.push(path.join(root, 'index.html'), path.join(root, 'vite.config.js'));
const sourceHash = createHash('sha256');
for (const file of runtimeFiles.sort()) {
  sourceHash.update(relative(file) + '\0').update(await readFile(file)).update('\0');
}
check('the current runtime matches the tested build', sourceHash.digest('hex') === build.runtimeSourceSha256);
check('the browser capture identifies that build', capture.sourceHash === build.runtimeSourceSha256);
const assetHash = createHash('sha256');
for (const file of (await files(path.join(root, 'dist'))).sort()) {
  assetHash.update(relative(file) + '\0' + createHash('sha256').update(await readFile(file)).digest('hex') + '\0');
}
check('the current emitted assets match the tested build', assetHash.digest('hex') === build.emittedAssetsSha256);

const o = capture;
check('the before capture really is a phone viewport', before.phone.viewport.width === 390 && before.phone.viewport.height === 844);
check('the final capture really is the same phone viewport', o.phone.hero.viewport.width === 390 && o.phone.hero.viewport.height === 844);
check('phone cleanup preserves scroll length', o.phone.hero.scroll[0].total === before.phone.scroll[0].total);
check('phone layout has no desktop arms', o.phone.hero.arms === 0);
check('phone lanyard and hero animation remain active', o.phone.hero.graphics.some(g => g.class === 'lanyard-wrapper' && g.state === 'running') && o.phone.hero.graphics.some(g => g.class === 'darkveil-canvas' && g.state === 'running'));
check('the final phone scene reveals normally', o.phone.finalScene.scene.opacity === '1' && o.phone.finalScene.scene.visibility === 'visible');
check('phone interaction copy matches touch', o.phone.finalScene.hint === 'Tap to open');
check('phone console has no errors or warnings in the captured session', o.phone.console.length === 0);
check('About still loads the full-resolution portrait', o.phone.about.portrait.some(p => p.complete && p.width === 1114 && p.height === 1412));
check('Work page remains phone width', o.phone.work.width === 390 && o.phone.work.page === 'Work archive');
check('Contact retains three 16px fields without overflow', o.phone.contact.fields.length === 3 && o.phone.contact.fields.every(f => f.fontSize === '16px') && !o.phone.contact.overflowX);

check('desktop capture really is 1440x900', o.desktop.hero.viewport.width === 1440 && o.desktop.hero.viewport.height === 900);
check('desktop still mounts the arm animation targets', o.desktop.hero.arms === 1);
check('desktop final artwork loads without interrupting scroll', o.desktop.finalScene.top >= 16199 && o.desktop.finalScene.arms.some(a => a.visible === 'visible' && a.maskHrefs.every(Boolean) && a.glyphCharacters === 34800));
check('desktop retains pointer-specific interaction copy', o.desktop.finalScene.hint === 'Click to open');
check('fake phone content is absent without removing social links', !o.desktop.menu.hasPlaceholder && o.desktop.menu.socialLinks.length === 2);
check('desktop menu has a real Budapest offset label', /\(GMT\+[12]\)$/.test(o.desktop.menu.clock));
check('desktop and archive console have no captured errors or warnings', o.desktop.console.length === 0);
check('the existing gate still offers both archive choices', /mobile preview/i.test(o.archive.choices) && /website archive/i.test(o.archive.choices));
check('archive playback still uses the optimized original video', o.archive.initialVideos.some(v => v.src.includes('background-faststart-') && v.readyState === 4 && !v.paused && v.time > 0 && v.error === null));
check('the live archive completed its first video swap', o.archive.initialVideos[1].paused && !o.archive.laterVideos[1].paused && o.archive.laterVideos[1].opacity === '1' && o.archive.laterVideos[0].paused);
check('leaving the archive removes both video elements', o.archive.exit.videoCount === 0 && o.archive.exit.path === '/projects');

const css = await readFile(path.join(root, 'src/components/WebsiteTest.css'), 'utf8');
check('active project and contact-effect CSS is preserved', css.includes('.wt-projects-section') && css.includes('.wt-contact-color-bends'));
check('legacy contact and About CSS is absent', !/\.wt-contact-(?:wash|scene|section)\b|\.wt-about-(?:section|panel)\b/.test(css));
console.log(`${checks} checks passed. Browser assertions validate saved observations; they do not drive a second browser session.`);
