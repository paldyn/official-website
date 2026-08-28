import { mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const outputDir = path.join(projectRoot, 'dist', 'server');
const publicEntries = [
  'index.html',
  'favicon.ico',
  'robots.txt',
  'sitemap.xml',
  'assets',
  'ascend',
  'cnt',
];

const mimeTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
};

async function collect(entry, files) {
  const absolute = path.join(projectRoot, entry);
  const children = await readdir(absolute, { withFileTypes: true }).catch(() => null);
  if (!children) {
    files.push(entry);
    return;
  }

  for (const child of children) {
    if (child.name === '.DS_Store') continue;
    const nested = path.posix.join(entry.replaceAll(path.sep, '/'), child.name);
    if (child.isDirectory()) await collect(nested, files);
    else if (child.isFile()) files.push(nested);
  }
}

const files = [];
for (const entry of publicEntries) await collect(entry, files);
files.sort();

const encodedFiles = {};
const routes = {};

for (const relative of files) {
  const normalized = relative.replaceAll(path.sep, '/');
  const extension = path.extname(normalized).toLowerCase();
  encodedFiles[normalized] = {
    body: (await readFile(path.join(projectRoot, relative))).toString('base64'),
    contentType: mimeTypes[extension] || 'application/octet-stream',
  };

  const publicPath = `/${normalized}`;
  routes[publicPath] = { file: normalized };

  if (normalized === 'index.html') routes['/'] = { file: normalized };
  else if (normalized.endsWith('/index.html')) {
    const directoryPath = `/${normalized.slice(0, -'index.html'.length)}`;
    routes[directoryPath] = { file: normalized };
    routes[directoryPath.slice(0, -1)] = { redirect: directoryPath };
  }
}

const worker = `const FILES = ${JSON.stringify(encodedFiles)};
const ROUTES = ${JSON.stringify(routes)};

function decodeBase64(value) {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) bytes[index] = binary.charCodeAt(index);
  return bytes;
}

export default {
  async fetch(request) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }

    const url = new URL(request.url);
    let pathname;
    try { pathname = decodeURIComponent(url.pathname); }
    catch { return new Response('Bad Request', { status: 400 }); }

    const route = ROUTES[pathname];
    if (!route) return new Response('Not Found', { status: 404 });
    if (route.redirect) {
      const target = new URL(route.redirect + url.search, url.origin);
      return Response.redirect(target.toString(), 308);
    }

    const asset = FILES[route.file];
    const html = asset.contentType.startsWith('text/html');
    const headers = new Headers({
      'Content-Type': asset.contentType,
      'Cache-Control': html ? 'public, max-age=0, must-revalidate' : 'public, max-age=3600',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Content-Type-Options': 'nosniff',
    });

    return new Response(request.method === 'HEAD' ? null : decodeBase64(asset.body), { status: 200, headers });
  },
};
`;

await rm(path.join(projectRoot, 'dist'), { recursive: true, force: true });
await mkdir(outputDir, { recursive: true });
await writeFile(path.join(outputDir, 'index.js'), worker);
console.log(`Built ${files.length} static files for Sites.`);
