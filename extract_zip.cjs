const extract = require('extract-zip');
const path = require('path');

async function main() {
  try {
    await extract(path.resolve('public/ebisu-hp05-v2-source.zip'), { dir: path.resolve('/tmp/old_source') });
    console.log('Extraction complete');
  } catch (err) {
    console.error(err);
  }
}
main();
