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
        // undo ../target -> ../../target
        const regex = new RegExp(`\\.\\./${target}`, 'g');
        if (content.match(regex)) {
          // Check if we need to undo.
          // Wait. What if it was originally ../firebase? Then it became ../firebase.
          // Let's just do an intelligent check.
          // Is `target` present in `src/` ? Yes.
          // We can use a path resolution check.
        }
      }
    }
  }
}
