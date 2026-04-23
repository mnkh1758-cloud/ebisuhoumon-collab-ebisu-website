import fs from 'fs';
import path from 'path';

function walkAndReplace(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkAndReplace(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let updated = false;

      // Match paths that point to files we moved to root
      const targets = [
        'firebase',
        'types',
        'constants',
        'lib/',
        'components/'
      ];

      for (const target of targets) {
        // e.g. ../../firebase -> ../firebase
        const regex = new RegExp(`\\.\\./\\.\\./${target}`, 'g');
        if (content.match(regex)) {
          content = content.replace(regex, `../${target}`);
          updated = true;
        }

        // Also if something in depth 3 was doing ../../../firebase it should now be ../../firebase
        // But let's just do a simple string replace for now.
      }

      if (updated) {
        fs.writeFileSync(fullPath, content);
        console.log(`Updated ${fullPath}`);
      }
    }
  }
}

walkAndReplace('./src');
