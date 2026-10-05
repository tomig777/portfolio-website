import { Buffer } from 'node:buffer';

export function extractEmbeddedRapierWasm(code) {
  const matches = [...code.matchAll(/\w+\.toByteArray\("(AGFzbQ[A-Za-z0-9+/=]+)"\)(?:\.buffer)?/g)];
  if (matches.length !== 1) throw new Error('Expected one embedded Rapier WASM binary; review the loader after a dependency upgrade.');
  const wasm = Buffer.from(matches[0][1], 'base64');
  if (!wasm.subarray(0, 8).equals(Buffer.from([0, 97, 115, 109, 1, 0, 0, 0]))) throw new Error('Invalid Rapier WASM header');
  return { expression: matches[0][0], wasm };
}

// Build-only transformation, specifically for the installed rapier3d-compat
// wasm-bindgen initializer. No dependency files are edited. Physics still starts
// on the first lanyard mount, but the browser fetches/compiles binary WASM rather
// than parsing and decoding a multi-megabyte base64 string in JavaScript.
export default function externalRapierWasm() {
  let emitted = false;
  let base = '/';
  const references = new Set();
  const inspected = new Set();
  return {
    name: 'external-rapier-wasm',
    apply: 'build',
    enforce: 'pre',
    configResolved(config) { base = config.base; },
    buildStart() { emitted = false; inspected.clear(); references.clear(); },
    transform(code, id) {
      if (!id.includes('rapier3d-compat')) return null;
      inspected.add(id);
      if (!code.includes('AGFzbQ')) return null;
      if (!code.includes('module_or_path')) throw new Error('Unsupported Rapier initializer; review external WASM compatibility.');
      const { expression, wasm } = extractEmbeddedRapierWasm(code);
      const reference = this.emitFile({ type: 'asset', name: 'rapier-physics.wasm', source: wasm });
      references.add(reference);
      emitted = true;
      return { code: code.replace(expression, `{module_or_path:import.meta.ROLLUP_FILE_URL_${reference}}`), map: null };
    },
    resolveFileUrl({ referenceId, fileName }) {
      // This dependency may resolve through its CommonJS entry, which cannot
      // retain import.meta.url. Use Vite's configured public base explicitly.
      if (references.has(referenceId)) return JSON.stringify(`${base}${fileName}`);
      return null;
    },
    generateBundle() {
      if (!emitted) this.error(`Rapier WASM optimization was not applied. Inspected: ${[...inspected].join(', ')}`);
    },
  };
}
