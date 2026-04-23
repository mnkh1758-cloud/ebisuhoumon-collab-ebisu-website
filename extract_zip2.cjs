const extract = require('extract-zip');
const path = require('path');

async function main() {
  try {
    await extract(path.resolve('public/update.zip'), { dir: path.resolve('/tmp/old_source2') });
    console.log('Extraction complete');
  } catch (err) {
    console.error(err);
  }
}
main();
