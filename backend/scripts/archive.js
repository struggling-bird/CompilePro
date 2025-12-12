const fs = require('fs');
const path = require('path');
const tar = require('tar');

const enabled = String(process.env.ARCHIVE_ENABLED ?? 'true') === 'true';
if (!enabled) process.exit(0);

const distDir = path.resolve(__dirname, '..', 'dist');
const artifactsDir = path.resolve(__dirname, '..', 'artifacts');
const name = process.env.ARCHIVE_NAME || 'dist.tar.gz';
if (!fs.existsSync(artifactsDir)) fs.mkdirSync(artifactsDir);
const outPath = path.join(artifactsDir, name);

tar
  .c({ gzip: true, cwd: distDir }, ['.'])
  .pipe(fs.createWriteStream(outPath))
  .on('finish', () => process.exit(0))
  .on('error', () => process.exit(1));
