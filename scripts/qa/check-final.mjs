import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const folder = path.join(root, 'docs/verification/phase-8-final');
const saved = JSON.parse(await readFile(path.join(folder, 'build-final.json'), 'utf8'));
const browser = JSON.parse(await readFile(path.join(folder, 'browser.json'), 'utf8'));
const current = JSON.parse(execFileSync(process.execPath, ['scripts/baseline/build-report.mjs'], { cwd: root, encoding: 'utf8' }));
const checks = [];
function check(name, condition) {
  assert.ok(condition, name);
  checks.push(name);
}

check('Runtime source matches the tested release build', current.runtimeSourceSha256 === saved.runtimeSourceSha256);
check('Build inputs match the tested release build', current.buildInputsSha256 === saved.buildInputsSha256);
check('Emitted assets match the tested release build', current.emittedAssetsSha256 === saved.emittedAssetsSha256);
const final = browser.records.filter(record => record.buildStage === 'final');
check('Final-build browser evidence is present', final.length >= 20);
for (const record of final) {
  check(`${record.label}: no captured console warnings/errors`, record.console.length === 0);
  check(`${record.label}: document has no horizontal overflow`, record.bodyWidth <= record.viewport.width + 1);
}

const byLabel = label => {
  const record = final.find(item => item.label === label);
  assert.ok(record, `Missing final observation: ${label}`);
  return record;
};
for (const [size, mode] of [['small-phone-320x568', 'native'], ['phone-390x844', 'native'], ['landscape-844x390', 'native'], ['tablet-768x1024', 'native'], ['laptop-1024x768', 'smooth'], ['laptop-1366x768', 'smooth'], ['desktop-1440x900', 'smooth']]) {
  const record = byLabel(`final-hero-${size}`);
  check(`${size}: expected scroll owner`, record.scroll.mode === mode);
  check(`${size}: visible hero graphics are running`, record.graphics.some(item => item.class === 'lanyard-wrapper' && item.state === 'running'));
}
const phone = byLabel('final-hero-phone-390x844');
check('Phone background canvas covers the viewport height', phone.canvases[0].rect.height >= phone.viewport.height);
check('Phone arms stay absent', byLabel('final-phone-contact-scene-390x844').arms === 0);
check('Desktop arms remain mounted and running', byLabel('final-desktop-contact-scene-1440x900').graphics.some(item => item.class === 'wt-bubble-ascii-hands' && item.state === 'running'));
check('Simulated hidden document pauses visible graphics', byLabel('final-simulated-hidden-desktop-1440x900').graphics.every(item => item.state === 'paused'));
const resumed = byLabel('final-js-reduced-motion-resume-desktop-1440x900');
check('JavaScript reduced-motion preference selects native scrolling', resumed.scroll.mode === 'native');
check('Lanyard resumes after simulated visibility change', resumed.graphics.some(item => item.class === 'lanyard-wrapper' && item.state === 'running'));
check('Home navigation survives a scroll-owner resize', browser.scrollRegression.finalFix.resizedTop === 0);
check('New user gesture cancels the pending Home destination', browser.scrollRegression.newGesture.resizedTop > 0);
check('Case-study overlay locks background scrolling', byLabel('final-case-study-phone-390x844').scroll.locked === 'true');
check('Final phone scene is reachable after the work pins', byLabel('final-phone-contact-scene-390x844').scroll.top > 14000);
check('Final race completes and reports a winner', /takes the flag/.test(byLabel('final-race-small-phone-finished-320x568').surfaceText));

const index = await readFile(path.join(root, 'dist/index.html'), 'utf8');
check('QA environment harness is not included in the deployed HTML', !index.includes('__qa__') && !index.includes('qaEnvironment'));
const result = { schemaVersion: 1, checkedAt: new Date().toISOString(), passed: checks.length, failed: 0, checks, notes: ['Checks validate saved browser observations and current build provenance; this command does not run a browser.', 'Physical devices, OS CSS reduced-motion settings, real hidden-tab scheduling, CPU throttling and production hosting are outside this evidence.'] };
if (process.argv.includes('--save')) await writeFile(path.join(folder, 'report-validation.json'), JSON.stringify(result, null, 2) + '\n', { flag: 'wx' });
console.log(`Final QA evidence: ${checks.length} checks passed.`);
