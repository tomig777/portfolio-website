import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import { evaluateBrowserContracts } from './browser-contracts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const supplied = process.argv.slice(2).find(value => !value.startsWith('--'));
const target = path.resolve(root, supplied || 'docs/baseline/2026-10-01/browser.json');
const capture = JSON.parse(await readFile(target, 'utf8'));
const known = new Set(capture.knownIssueIds || []);
const results = evaluateBrowserContracts(capture);
if (!results.length) throw new Error('No browser contract measurements in the supplied report');
for (const result of results) {
  const status = result.passed ? 'PASS' : known.has(result.id) ? 'KNOWN FAIL' : 'NEW FAIL';
  process.stdout.write(`${status} [${result.id}] ${result.title}\n`);
  if (!result.passed) process.stdout.write(`  ${JSON.stringify(result.actual)}\n`);
}
const failing = results.filter(result => !result.passed);
process.stdout.write(`\n${results.length - failing.length} passing; ${failing.length} failing (${failing.filter(result => known.has(result.id)).length} recorded known failures).\n`);
process.stdout.write('This checks captured browser measurements. Re-capture the current build to verify later fixes.\n');
process.exitCode = failing.some(result => !known.has(result.id)) || (process.argv.includes('--strict') && failing.length) ? 1 : 0;
