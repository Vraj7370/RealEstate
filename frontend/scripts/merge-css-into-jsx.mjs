import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'src');

function escapeTemplateLiteral(s) {
  return s.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$\{/g, '\\${');
}

function gitShow(relJsPath) {
  return execSync(`git show HEAD:frontend/src/${relJsPath}`, {
    cwd: path.join(ROOT, '..'),
    encoding: 'utf8',
  });
}

function appendStylesBeforeExport(content, css) {
  const block = `\nconst componentStyles = \`${escapeTemplateLiteral(css)}\`;\n\n`;
  const idx = content.lastIndexOf('export default');
  if (idx === -1) return content + block;
  return content.slice(0, idx) + block + content.slice(idx);
}

function wrapArrowComponent(content, name) {
  const open = `const ${name} = () => (`;
  const openIdx = content.indexOf(open);
  if (openIdx === -1) throw new Error(`Open not found: ${name}`);
  const afterOpen = openIdx + open.length;
  if (!content.slice(afterOpen).trimStart().startsWith('<>')) {
    content =
      content.slice(0, afterOpen) +
      '\n  <>\n    <style>{componentStyles}</style>\n' +
      content.slice(afterOpen);
  }
  const exportTag = `export default ${name}`;
  const exportIdx = content.indexOf(exportTag);
  const head = content.slice(0, exportIdx);
  const tail = content.slice(exportIdx);
  const closeIdx = head.lastIndexOf('\n);');
  if (closeIdx === -1) throw new Error(`Close not found: ${name}`);
  return head.slice(0, closeIdx) + '\n  </>' + head.slice(closeIdx) + tail;
}

/** Wrap each `return (` and close with `</>` before following `\n  );\n};` */
function wrapReturnBlocks(content) {
  let code = content.replace(
    /return \((\s*\n)(\s*)(?!<>)/g,
    'return (\n$2<>\n$2  <style>{componentStyles}</style>\n$2'
  );

  let open = (code.match(/<style>\{componentStyles\}<\/style>/g) || []).length;
  code = code.replace(/\n {2}\);\n\};/g, () => {
    if (open > 0) {
      open--;
      return '\n    </>\n  );\n};';
    }
    return '\n  );\n};';
  });

  // default export arrow: `\n);\n\nexport default`
  open = (code.match(/<style>\{componentStyles\}<\/style>/g) || []).length;
  const closed = (code.match(/<\/>\n {2}\);\n\};/g) || []).length;
  const remaining = open - closed;
  if (remaining > 0) {
    code = code.replace(/\n\);\n\nexport default /, '\n    </>\n);\n\nexport default ');
  }

  return code;
}

function mergeFromGit(jsRel, { arrowName } = {}) {
  const content = gitShow(jsRel);
  const importMatch = content.match(/import\s+['"](\.\/[^'"]+\.css)['"];\s*\n/);
  if (!importMatch) throw new Error(`No css import in ${jsRel}`);

  const cssPath = path.join(SRC, path.dirname(jsRel), path.basename(importMatch[1]));
  const css = fs.readFileSync(cssPath, 'utf8');
  let jsx = content.replace(importMatch[0], '');
  jsx = appendStylesBeforeExport(jsx, css);
  jsx = arrowName ? wrapArrowComponent(jsx, arrowName) : wrapReturnBlocks(jsx);

  const jsxPath = path.join(SRC, jsRel.replace(/\.js$/, '.jsx'));
  fs.writeFileSync(jsxPath, jsx);
  fs.unlinkSync(cssPath);
  console.log('OK:', jsxPath);
}

const arrow = [
  ['pages/About.js', 'About'],
  ['App.js', 'App'],
];

const returns = [
  'pages/Home.js',
  'pages/Properties.js',
  'pages/PropertyDetail.js',
  'pages/Auth.js',
  'pages/admin/AdminPanel.js',
  'pages/dashboard/DashboardPages.js',
  'pages/dashboard/ListProperty.js',
  'pages/dashboard/OwnerPages.js',
  'components/layout/Navbar.js',
  'components/layout/DashboardLayout.js',
  'components/property/PropertyCard.js',
  'components/property/SearchFilter.js',
];

for (const [file, name] of arrow) {
  if (file === 'pages/About.js' && fs.readFileSync(path.join(SRC, 'pages/About.jsx'), 'utf8').includes('componentStyles')) {
    console.log('Skip About (already merged)');
    fs.unlinkSync(path.join(SRC, 'pages/About.css'));
    continue;
  }
  mergeFromGit(file, { arrowName: name });
}

for (const file of returns) {
  mergeFromGit(file);
}

// Footer already merged
fs.unlinkSync(path.join(SRC, 'components/layout/Footer.css'), { force: true });
