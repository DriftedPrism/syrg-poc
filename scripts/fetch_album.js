import { writeFile } from 'node:fs/promises';

const albumUrl = 'https://photos.app.goo.gl/WdeoaKBJWkk8Tu4u8';
const htmlOutput = 'album_page.html';
const jsonOutput = 'photos.json';
const urlRegex = /https:\/\/lh3\.googleusercontent\.com\/pw\/[^"'()\s,>]+/g;

async function fetchAlbum() {
  const response = await fetch(albumUrl, {
    redirect: 'follow',
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
    }
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch album page: ${response.status} ${response.statusText}`);
  }

  const html = await response.text();
  await writeFile(htmlOutput, html, 'utf8');

  const matches = Array.from(new Set(html.match(urlRegex) || []));
  const thumbnailPattern = /=w\d+(?:-h\d+)?(?:-p(?:-k)?)?(?:-no)?$/;
  const photoUrls = matches
    .filter(url => !thumbnailPattern.test(url) && !url.endsWith('=w600-h750-p-k-no'))
    .slice(0, 20);

  if (!photoUrls.length) {
    throw new Error('No full-size photo URLs found in the album HTML.');
  }
  await writeFile(jsonOutput, JSON.stringify(photoUrls, null, 2), 'utf8');

  console.log(`Saved ${photoUrls.length} photo URLs to ${jsonOutput} and album HTML to ${htmlOutput}.`);
}

fetchAlbum().catch(err => {
  console.error(err);
  process.exit(1);
});
