const { execSync } = require('child_process');
try {
  execSync('python3 -m zipfile -e public/ebisu-hp05-source.zip /tmp/old', { stdio: 'inherit' });
  console.log('Extracted ebisu-hp05-source.zip');
} catch (e) {
  console.error('Failed to extract ebisu-hp05-source.zip', e);
}
try {
  execSync('python3 -m zipfile -e public/ebisu-hp05-v2-source.zip /tmp/old_v2', { stdio: 'inherit' });
  console.log('Extracted ebisu-hp05-v2-source.zip');
} catch (e) {
  console.error('Failed to extract ebisu-hp05-v2-source.zip', e);
}
try {
  execSync('python3 -m zipfile -e public/update.zip /tmp/update', { stdio: 'inherit' });
  console.log('Extracted update.zip');
} catch (e) {
  console.error('Failed to extract update.zip', e);
}
