import test from 'node:test';
import assert from 'node:assert/strict';
import { mapAssetsWithConcurrency } from '../src/utils/assetLoading.js';
import externalRapierWasm, { extractEmbeddedRapierWasm } from '../scripts/build/externalRapierWasm.mjs';

test('asset queue bounds concurrency and keeps the original artwork order', async () => {
  let active = 0, peak = 0;
  const items = Array.from({ length: 25 }, (_, index) => index);
  const result = await mapAssetsWithConcurrency(items, async item => {
    active += 1;
    peak = Math.max(peak, active);
    await new Promise(resolve => setTimeout(resolve, item % 3));
    active -= 1;
    return item * 2;
  }, 4);
  assert.equal(peak, 4);
  assert.equal(active, 0);
  assert.deepEqual(result, items.map(item => item * 2));
});

test('empty and invalid-concurrency queues complete without hanging', async () => {
  assert.deepEqual(await mapAssetsWithConcurrency([], () => { throw new Error('not called'); }), []);
  assert.deepEqual(await mapAssetsWithConcurrency([1, 2], item => item, 0), [1, 2]);
  assert.deepEqual(await mapAssetsWithConcurrency([1, 2], item => item, Infinity), [1, 2]);
  await assert.rejects(mapAssetsWithConcurrency([1], () => Promise.reject(new Error('failed'))), /failed/);
});

test('WASM extraction retains binary bytes and rejects ambiguous dependency changes', () => {
  const bytes = new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0]);
  const code = 'yield init(decoder.toByteArray("AGFzbQEAAAA="))';
  const result = extractEmbeddedRapierWasm(code);
  assert.deepEqual(new Uint8Array(result.wasm), bytes);
  assert.equal(result.expression, 'decoder.toByteArray("AGFzbQEAAAA=")');
  assert.equal(extractEmbeddedRapierWasm(code.replace('))', ').buffer)')).expression, 'decoder.toByteArray("AGFzbQEAAAA=").buffer');
  assert.throws(() => extractEmbeddedRapierWasm('no embedded binary'), /Expected one/);
  assert.throws(() => extractEmbeddedRapierWasm(code + code), /Expected one/);
  assert.throws(() => extractEmbeddedRapierWasm('decoder.toByteArray("AGFzbQAAAAA=")'), /Invalid/);
});

test('the physics asset uses the configured public base without a CommonJS import.meta.url', () => {
  const plugin = externalRapierWasm();
  plugin.configResolved({ base: '/portfolio/' });
  plugin.buildStart();
  const source = 'const module_or_path = true; decoder.toByteArray("AGFzbQEAAAA=").buffer';
  const transformed = plugin.transform.call({ emitFile: () => 'wasmAsset' }, source, '/node_modules/@dimforge/rapier3d-compat/rapier.cjs.js');
  assert.match(transformed.code, /module_or_path:import.meta.ROLLUP_FILE_URL_wasmAsset/);
  assert.doesNotMatch(transformed.code, /\.buffer/);
  assert.equal(plugin.resolveFileUrl({ referenceId: 'wasmAsset', fileName: 'assets/physics.wasm' }), '"/portfolio/assets/physics.wasm"');
  assert.equal(plugin.resolveFileUrl({ referenceId: 'unrelated', fileName: 'other.js' }), null);
  assert.equal(plugin.transform('unrelated', '/src/component.jsx'), null);
  plugin.generateBundle.call({ error: () => assert.fail('binary was emitted') });
  plugin.buildStart();
  assert.throws(() => plugin.generateBundle.call({ error: message => { throw new Error(message); } }), /was not applied/);
});
