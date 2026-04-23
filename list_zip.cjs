const fs = require('fs');
const { execSync } = require('child_process');

try {
  console.log('--- ebisu-hp05-v2-source.zip ---');
  execSync('npx -y adm-zip-cli list public/ebisu-hp05-v2-source.zip', { stdio: 'inherit' });
} catch (e) {
  console.log('adm-zip-cli failed');
}
