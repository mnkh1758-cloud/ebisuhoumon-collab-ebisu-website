import fs from 'fs';
import path from 'path';

function moveContents(srcDir, destDir) {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const items = fs.readdirSync(srcDir);
  for (const item of items) {
    const srcPath = path.join(srcDir, item);
    const destPath = path.join(destDir, item);

    if (fs.existsSync(destPath)) {
      console.log(`Conflict: ${destPath} already exists! Skipping...`);
    } else {
      fs.renameSync(srcPath, destPath);
      console.log(`Moved ${srcPath} to ${destPath}`);
    }
  }
}

console.log('Moving lib...');
if (fs.existsSync('./lib')) moveContents('./lib', './src/lib');
try { if (fs.readdirSync('./lib').length === 0) fs.rmdirSync('./lib'); } catch(e){}

