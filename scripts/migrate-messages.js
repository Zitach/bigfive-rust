const fs = require('fs');
const path = require('path');
const vm = require('vm');

const SOURCE_DIR = '/Users/zhouquan/Desktop/bigfive-rust/bigfive-web-master/web/src/messages';
const OUTPUT_DIR = '/Users/zhouquan/Desktop/bigfive-rust/frontend/public/messages';

function evalDefaultExport(code, filePath) {
  let transformed = code
    .split('\n')
    .filter(line => !line.trim().startsWith('import '))
    .join('\n');

  transformed = transformed.replace(/export\s+default\s+(\w+)\s*;?\s*$/m, 'module.exports = $1;');

  if (transformed.includes('module.exports')) {
    const context = { module: { exports: {} }, exports: {} };
    vm.runInNewContext(transformed, context, { filename: filePath, timeout: 1000 });
    return context.module.exports;
  }

  const match = transformed.match(/const\s+(\w+)\s*=\s*\{/s);
  if (match) {
    const varName = match[1];
    transformed += `\nmodule.exports = ${varName};`;
    const context = { module: { exports: {} }, exports: {} };
    vm.runInNewContext(transformed, context, { filename: filePath, timeout: 1000 });
    return context.module.exports;
  }

  throw new Error(`Could not parse ${filePath}`);
}

function main() {
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.js'));

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let count = 0;
  for (const file of files) {
    const lang = path.basename(file, '.js');
    const filePath = path.join(SOURCE_DIR, file);
    const code = fs.readFileSync(filePath, 'utf-8');
    const data = evalDefaultExport(code, filePath);

    const outputPath = path.join(OUTPUT_DIR, `${lang}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    count++;
  }

  console.log(`${count} message languages migrated`);
}

main();
