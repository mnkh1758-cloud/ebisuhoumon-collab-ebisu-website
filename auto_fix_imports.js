import fs from 'fs';
import path from 'path';

function fixImports(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      fixImports(fullPath);
    } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
      let content = fs.readFileSync(fullPath, 'utf8');
      let updated = false;

      // We only want to restore ../firebase to ../../firebase for files inside src/components and src/ledger
      // where the file depth from src is 2 or 3.
      // Actually, we can just check if imports resolve!

      // Let's use regex to find all from '.*' and verify if the path exists.
      const importRegex = /from\s+['"]([^'"]+)['"]/g;
      let match;
      while ((match = importRegex.exec(content)) !== null) {
        const importPath = match[1];
        if (importPath.startsWith('.')) {
          // let's check if the file exists.
          let resolved = path.resolve(path.dirname(fullPath), importPath);
          let exists = fs.existsSync(resolved + '.ts') || fs.existsSync(resolved + '.tsx') || fs.existsSync(resolved + '/index.ts') || fs.existsSync(resolved + '/index.tsx') || fs.existsSync(resolved);
          if (!exists) {
            // try adding another ../
            const newImportPath = '../' + importPath;
            let resolved2 = path.resolve(path.dirname(fullPath), newImportPath);
            let exists2 = fs.existsSync(resolved2 + '.ts') || fs.existsSync(resolved2 + '.tsx') || fs.existsSync(resolved2 + '/index.ts') || fs.existsSync(resolved2 + '/index.tsx');

            if (exists2) {
              content = content.replace(`from '${importPath}'`, `from '${newImportPath}'`);
              content = content.replace(`from "${importPath}"`, `from "${newImportPath}"`);
              updated = true;
            } else {
              // try removing one ../
              if (importPath.startsWith('../')) {
                const newImportPath3 = importPath.substring(3);
                let resolved3 = path.resolve(path.dirname(fullPath), newImportPath3);
                let exists3 = fs.existsSync(resolved3 + '.ts') || fs.existsSync(resolved3 + '.tsx') || fs.existsSync(resolved3 + '/index.ts') || fs.existsSync(resolved3 + '/index.tsx');
                if (exists3) {
                  // Only if we need it. Actually I just blindly replaced ../../ with ../
                  content = content.replace(`from '${importPath}'`, `from '${newImportPath3}'`);
                  content = content.replace(`from "${importPath}"`, `from "${newImportPath3}"`);
                  updated = true;
                }
              }
            }
          }
        }
      }

      if (updated) {
        fs.writeFileSync(fullPath, content);
        console.log(`Auto-fixed imports in ${fullPath}`);
      }
    }
  }
}

fixImports('./src');
