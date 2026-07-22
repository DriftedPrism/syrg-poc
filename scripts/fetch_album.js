#!/usr/bin/env node
/*
Usage:
  node scripts/fetch_album.js [ALBUM_URL]
  ALBUM_URL=https://photos.app.goo.gl/... node scripts/fetch_album.js

This script fetches the provided Google Photos share URL and writes
`album_page.html` into the repository root. It uses the global `fetch`
(if available) or falls back to `node-fetch` when installed.
*/

const fs = require('fs').promises;

(async () => {
  const url = process.argv[2] || process.env.ALBUM_URL || 'https://photos.app.goo.gl/WdeoaKBJWkk8Tu4u8';
  try {
    let fetchFn = global.fetch;
    if (!fetchFn) {
      try {
        // dynamic import of node-fetch for older Node versions
        const mod = await import('node-fetch');
        fetchFn = mod.default || mod;
      } catch (e) {
        // ignore
      }
    }

    if (!fetchFn) {
      console.error('No fetch available. Install node 18+ or run: npm install node-fetch');
      process.exit(2);
    }

    const res = await fetchFn(url, { headers: { 'User-Agent': 'fetch-album-script/1.0' } });
    if (!res.ok) throw new Error(`Request failed: ${res.status} ${res.statusText}`);
    const text = await res.text();
    await fs.writeFile('album_page.html', text, 'utf8');
    console.log(`Saved album_page.html (${Buffer.byteLength(text, 'utf8')} bytes)`);
  } catch (err) {
    console.error('Error fetching album:', err.message || err);
    process.exit(1);
  }
})();
