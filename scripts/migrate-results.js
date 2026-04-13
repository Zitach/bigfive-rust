const fs = require('fs');
const path = require('path');
const vm = require('vm');

const TS_SOURCE_DIR = '/Users/zhouquan/Desktop/bigfive-rust/bigfive-web-master/packages/results/src/data';
const JS_SOURCE_DIR = '/Users/zhouquan/Desktop/bigfive-rust/bigfive-web-master/old-packages/results/lib/data';
const OUTPUT_DIR = '/Users/zhouquan/Desktop/bigfive-rust/backend/src/data/results';

const DOMAIN_FILES = ['agreeableness', 'extraversion', 'neuroticism', 'conscientiousness', 'openness_to_experience'];

function evalModuleLikeCode(code, filePath) {
  let transformed = code
    .split('\n')
    .filter(line => !line.trim().startsWith('import '))
    .join('\n');

  transformed = transformed.replace(/(\w+)\s*:\s*\w+\s*=/g, '$1 =');
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

function loadDomainFile(langDir, filename) {
  const tsPath = path.join(langDir, `${filename}.ts`);
  const jsPath = path.join(langDir, `${filename}.js`);

  if (fs.existsSync(tsPath)) {
    const code = fs.readFileSync(tsPath, 'utf-8');
    return evalModuleLikeCode(code, tsPath);
  }
  if (fs.existsSync(jsPath)) {
    return require(jsPath);
  }
  return null;
}

function main() {
  const tsLangs = fs.existsSync(TS_SOURCE_DIR) ? fs.readdirSync(TS_SOURCE_DIR).filter(d => {
    const p = path.join(TS_SOURCE_DIR, d);
    return fs.statSync(p).isDirectory();
  }) : [];

  const jsLangs = fs.existsSync(JS_SOURCE_DIR) ? fs.readdirSync(JS_SOURCE_DIR).filter(d => {
    const p = path.join(JS_SOURCE_DIR, d);
    return fs.statSync(p).isDirectory();
  }) : [];

  const allLangs = Array.from(new Set([...tsLangs, ...jsLangs]));

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let count = 0;
  for (const lang of allLangs) {
    const tsLangDir = path.join(TS_SOURCE_DIR, lang);
    const jsLangDir = path.join(JS_SOURCE_DIR, lang);

    const domains = [];
    let success = true;
    for (const file of DOMAIN_FILES) {
      const data = loadDomainFile(tsLangDir, file) || loadDomainFile(jsLangDir, file);
      if (!data) {
        console.warn(`Missing ${file} for language ${lang}`);
        success = false;
        break;
      }
      domains.push(data);
    }

    if (!success) continue;

    const outputPath = path.join(OUTPUT_DIR, `${lang}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(domains, null, 2));
    count++;
  }

  console.log(`${count} result languages migrated`);
}

main();
