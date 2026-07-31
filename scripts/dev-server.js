/**
 * Local static server that mirrors the routing in vercel.json.
 *
 * Serving src/ directly does not work: index.html lives in src/, but the data
 * it fetches (names/, namesbystate/, data/, assets/, fonts/) lives at the repo
 * root. In production Vercel serves src/index.html at "/" and rewrites asset
 * requests into src/, so both resolve. This reproduces that.
 *
 * Does not serve /api -- those are serverless functions. Use `vercel dev` if
 * you need the API locally.
 *
 *   npm run dev
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const PORT = process.env.PORT || 8000;

// Mirrors the rewrite in vercel.json: these extensions are looked up in src/.
const SRC_EXTENSIONS = new Set(
    ['.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.gif', '.ico',
     '.woff', '.woff2', '.ttf', '.otf', '.pdf']
);

const CONTENT_TYPES = {
    '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
    '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
    '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif',
    '.ico': 'image/x-icon', '.txt': 'text/plain', '.woff': 'font/woff',
    '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.otf': 'font/otf'
};

function resolve(urlPath) {
    const clean = decodeURIComponent(urlPath.split('?')[0]);

    if (clean === '/' || clean === '/index.html') {
        return path.join(ROOT, 'src', 'index.html');
    }

    // Keep the request inside the repo.
    const relative = path.normalize(clean).replace(/^(\.\.[/\\])+/, '');
    const ext = path.extname(relative).toLowerCase();

    if (SRC_EXTENSIONS.has(ext)) {
        const inSrc = path.join(ROOT, 'src', relative);
        if (fs.existsSync(inSrc)) return inSrc;
    }

    const atRoot = path.join(ROOT, relative);
    if (fs.existsSync(atRoot) && fs.statSync(atRoot).isFile()) return atRoot;

    // Unknown paths fall through to the app, matching the catch-all rewrite.
    return path.join(ROOT, 'src', 'index.html');
}

http.createServer((req, res) => {
    const file = resolve(req.url);

    fs.readFile(file, (error, body) => {
        if (error) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            return res.end('Not found');
        }
        res.writeHead(200, {
            'Content-Type': CONTENT_TYPES[path.extname(file).toLowerCase()] || 'application/octet-stream'
        });
        res.end(body);
    });
}).listen(PORT, () => {
    console.log(`Serving http://localhost:${PORT} (repo root, vercel.json routing)`);
});
