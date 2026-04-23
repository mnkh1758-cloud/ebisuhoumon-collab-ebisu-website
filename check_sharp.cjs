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
  await checkImage('./public/body_front.png'); // 12608 bytes
  await checkImage('./public/body_front.webp'); // 23338 bytes
  await checkImage('./public/body_handFoot.webp'); // 23864 bytes
}
main();
