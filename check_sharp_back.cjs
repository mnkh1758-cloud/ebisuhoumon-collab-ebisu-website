const sharp = require('sharp');

async function checkImage(path) {
  try {
    const metadata = await sharp(path).metadata();
    console.log(`[OK] ${path}: ${metadata.format} ${metadata.width}x${metadata.height}`);
  } catch (err) {
    console.error(`[ERROR] ${path}: ${err.message}`);
  }
}

async function main() {
  await checkImage('./public/body_back.png');
  await checkImage('./public/body_back.webp');
}
main();
