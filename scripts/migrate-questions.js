const fs = require('fs');
const path = require('path');

const SOURCE_DIR = '/Users/zhouquan/Desktop/bigfive-rust/bigfive-web-master/old-packages/questions/data';
const OUTPUT_DIR = '/Users/zhouquan/Desktop/bigfive-rust/backend/src/data/questions';

function main() {
  const langs = fs.readdirSync(SOURCE_DIR).filter(dir => {
    const dirPath = path.join(SOURCE_DIR, dir);
    return fs.statSync(dirPath).isDirectory();
  });

  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  let count = 0;
  for (const lang of langs) {
    const questionsPath = path.join(SOURCE_DIR, lang, 'questions.json');
    const choicesPath = path.join(SOURCE_DIR, lang, 'choices.js');

    if (!fs.existsSync(questionsPath) || !fs.existsSync(choicesPath)) {
      console.warn(`Skipping ${lang}: missing questions.json or choices.js`);
      continue;
    }

    const questions = JSON.parse(fs.readFileSync(questionsPath, 'utf-8'));
    const choices = require(choicesPath);

    for (const q of questions) {
      const keyed = q.keyed || 'plus';
      q.choices = choices[keyed] || choices.plus;
    }

    const outputPath = path.join(OUTPUT_DIR, `${lang}.json`);
    fs.writeFileSync(outputPath, JSON.stringify(questions, null, 2));
    count++;
  }

  console.log(`${count} question languages migrated`);
}

main();
