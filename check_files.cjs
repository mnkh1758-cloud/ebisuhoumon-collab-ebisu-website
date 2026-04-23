const fs = require('fs');
['public/body_front.webp', 'public/body_back.webp', 'public/body_handFoot.webp'].forEach(f => {
  try {
    const stat = fs.statSync(f);
    console.log(`${f}: ${stat.size} bytes, modified ${stat.mtime}`);
  } catch(e) {
    console.log(`${f}: not found`);
  }
});
