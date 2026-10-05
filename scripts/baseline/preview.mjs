import http from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import console from 'node:console';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(scriptDir, '../..');
const dist = path.join(root, 'dist');
const port = Number(process.env.BASELINE_PORT || 4173);
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('Invalid BASELINE_PORT');
await stat(path.join(dist, 'index.html'));

const mime = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml',
  '.gif': 'image/gif', '.mp3': 'audio/mpeg', '.mp4': 'video/mp4',
  '.pdf': 'application/pdf', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.otf': 'font/otf', '.ttf': 'font/ttf', '.wasm': 'application/wasm',
  '.glb': 'model/gltf-binary',
};
const probes = new Map([
  ['/__baseline__/probe.js', path.join(scriptDir, 'probe.js')],
  ['/__baseline__/metrics.mjs', path.join(scriptDir, 'metrics.mjs')],
  ['/__qa__/environment.js', path.join(scriptDir, '../qa/environment.js')],
]);

const server = http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) {
      response.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    const url = new URL(request.url, `http://127.0.0.1:${port}`);
    const pathname = decodeURIComponent(url.pathname);
    let target = probes.get(pathname);
    let inject = false;
    if (!target) {
      target = path.resolve(dist, '.' + pathname);
      const relative = path.relative(dist, target);
      if (relative.startsWith('..') || path.isAbsolute(relative)) {
        response.writeHead(403).end();
        return;
      }
      const info = await stat(target).catch(() => null);
      if (pathname === '/' || (!info && !path.extname(pathname))) {
        target = path.join(dist, 'index.html');
        inject = true;
      } else if (!info?.isFile()) {
        response.writeHead(404).end();
        return;
      } else if (path.extname(target) === '.html') {
        inject = true;
      }
    }
    let body = await readFile(target);
    if (inject) {
      body = Buffer.from(body.toString('utf8').replace('<head>', '<head>\n<script type="module" src="/__baseline__/probe.js"></script>'));
      if (url.searchParams.get('qaEnvironment') === '1') {
        body = Buffer.from(body.toString('utf8').replace('<head>', '<head>\n<script src="/__qa__/environment.js"></script>'));
      }
    }
    const headers = {
      'Content-Type': mime[path.extname(target)] || 'application/octet-stream',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Accept-Ranges': 'bytes',
    };
    const range = request.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
    if (range && !inject) {
      const start = Number(range[1]);
      const end = range[2] ? Math.min(Number(range[2]), body.length - 1) : body.length - 1;
      if (start > end || start >= body.length) {
        response.writeHead(416, { 'Content-Range': `bytes */${body.length}` }).end();
        return;
      }
      response.writeHead(206, { ...headers, 'Content-Range': `bytes ${start}-${end}/${body.length}`, 'Content-Length': end - start + 1 });
      response.end(request.method === 'HEAD' ? undefined : body.subarray(start, end + 1));
      return;
    }
    response.writeHead(200, { ...headers, 'Content-Length': body.length });
    response.end(request.method === 'HEAD' ? undefined : body);
  } catch (error) {
    response.writeHead(error.code === 'ENOENT' ? 404 : 500).end();
  }
});
server.listen(port, '127.0.0.1', () => console.log(`Baseline-only production preview: http://127.0.0.1:${port}/`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => process.exit(0)));
