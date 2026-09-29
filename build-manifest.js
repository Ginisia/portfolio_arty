/**
 * build-manifest.js
 *
 * Scans img/portfolio/<series>/ folders and writes img/portfolio/manifest.json,
 * a simple { "series-folder-name": ["file1.jpg", "file2.jpg", ...] } map.
 *
 * The site (js/main.js) fetches this manifest at runtime and builds the
 * portfolio grid from whatever images are actually sitting in each folder —
 * so adding or removing a file from img/portfolio/<series>/ is all it takes.
 *
 * Run manually:   node build-manifest.js
 * (On Netlify this runs automatically on every deploy — see netlify.toml)
 */
const fs = require('fs');
const path = require('path');

const PORTFOLIO_DIR = path.join(__dirname, 'img', 'portfolio');
const IMAGE_EXT = /\.(jpe?g|png|gif|webp)$/i;

function main() {
  if (!fs.existsSync(PORTFOLIO_DIR)) {
    console.error('No img/portfolio directory found at', PORTFOLIO_DIR);
    process.exit(1);
  }

  const manifest = {};
  const seriesFolders = fs.readdirSync(PORTFOLIO_DIR, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);

  seriesFolders.forEach((folder) => {
    const folderPath = path.join(PORTFOLIO_DIR, folder);
    const files = fs.readdirSync(folderPath)
      .filter((f) => IMAGE_EXT.test(f))
      .sort(); // alphabetical; rename files (01_, 02_...) to control order
    manifest[folder] = files;
  });

  const outPath = path.join(PORTFOLIO_DIR, 'manifest.json');
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));

  console.log('manifest.json written:');
  Object.entries(manifest).forEach(([folder, files]) => {
    console.log('  ' + folder + ': ' + files.length + ' image(s)');
  });
}

main();
