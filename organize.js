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

// Move folders to src
console.log('Moving components...');
if (fs.existsSync('./components')) moveContents('./components', './src/components');

console.log('Moving ledger...');
if (fs.existsSync('./ledger')) moveContents('./ledger', './src/ledger');

console.log('Moving root TS files...');
['firebase.ts', 'types.ts', 'constants.tsx'].forEach(file => {
  if (fs.existsSync('./' + file)) {
    fs.renameSync('./' + file, './src/' + file);
    console.log(`Moved ${file}`);
  }
});

// Since the whole directory has been moved, we can safely delete the empty original directories
try { if (fs.existsSync('./components') && fs.readdirSync('./components').length === 0) fs.rmdirSync('./components'); } catch(e){}
try { if (fs.existsSync('./ledger') && fs.readdirSync('./ledger').length === 0) fs.rmdirSync('./ledger'); } catch(e){}

console.log('Done organizing.');
