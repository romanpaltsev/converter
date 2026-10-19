// Статический сервер для e2e-тестов и локального просмотра сборки.
// Повторяет поведение nginx из nginx/default.conf: маршрутизацию, 404 на двух языках,
// кэширование и заголовки безопасности (их берёт прямо из nginx/snippets/security-headers.conf).
import { createReadStream, readFileSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = fileURLToPath(new URL('..', import.meta.url));
const DIST = resolve(ROOT_DIR, process.env.DIST_DIR ?? 'dist');
const PORT = Number(process.env.PORT ?? 4321);
const HOST = process.env.HOST ?? '127.0.0.1';
const INDEXING = process.env.PUBLIC_INDEXING === 'true';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.wasm': 'application/wasm',
  '.woff2': 'font/woff2',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
  '.icc': 'application/vnd.iccprofile',
};

function securityHeaders() {
  const conf = readFileSync(join(ROOT_DIR, 'nginx/snippets/security-headers.conf'), 'utf8');
  const headers = {};
  for (const match of conf.matchAll(/^\s*add_header\s+([\w-]+)\s+"([^"]*)"\s+always;/gm)) headers[match[1]] = match[2];
  if (!headers['Content-Security-Policy']) throw new Error('security-headers.conf: не найден CSP');
  if (!INDEXING) headers['X-Robots-Tag'] = 'noindex, nofollow';
  return headers;
}

const HEADERS = securityHeaders();

function fileAt(urlPath) {
  const full = normalize(join(DIST, urlPath));
  if (!full.startsWith(DIST)) return null;
  try {
    return statSync(full).isFile() ? full : null;
  } catch {
    return null;
  }
}

function send(res, status, file, extraHeaders = {}) {
  const type = MIME[extname(file)] ?? 'application/octet-stream';
  const cache = file.includes(`${DIST}/_astro/`) ? 'public, max-age=31536000, immutable' : 'no-cache';
  res.writeHead(status, { ...HEADERS, 'Content-Type': type, 'Cache-Control': cache, ...extraHeaders });
  if (res.req.method === 'HEAD') return res.end();
  createReadStream(file).pipe(res);
}

createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { ...HEADERS, Allow: 'GET, HEAD' });
    return res.end();
  }
  const url = new URL(req.url ?? '/', 'http://localhost');
  let path;
  try {
    path = decodeURIComponent(url.pathname);
  } catch {
    res.writeHead(400, HEADERS);
    return res.end();
  }
  const query = url.search;
  // канонические адреса: /heic-v-jpg без слеша, /en/ со слешем
  if (path.length > 1 && path.endsWith('/') && fileAt(path.slice(0, -1) + '.html')) {
    res.writeHead(301, { ...HEADERS, Location: path.slice(0, -1) + query });
    return res.end();
  }
  if (!path.endsWith('/') && !fileAt(path) && fileAt(path + '/index.html')) {
    res.writeHead(301, { ...HEADERS, Location: path + '/' + query });
    return res.end();
  }
  const file = fileAt(path) ?? fileAt(path + '.html') ?? (path.endsWith('/') ? fileAt(path + 'index.html') : null);
  if (file) return send(res, 200, file);
  const notFound = fileAt(path.startsWith('/en/') || path === '/en' ? '/en/404.html' : '/404.html');
  if (notFound) return send(res, 404, notFound);
  res.writeHead(404, { ...HEADERS, 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('Not found');
}).listen(PORT, HOST, () => console.log(`serve-dist: http://${HOST}:${PORT} (${DIST})`));
