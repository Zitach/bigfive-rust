const fs = require('fs');
const path = require('path');

const SOURCE_DIR = '/Users/zhouquan/Desktop/bigfive-rust/bigfive-web-master/web/posts';
const OUTPUT_DIR = '/Users/zhouquan/Desktop/bigfive-rust/frontend/public';
const POSTS_OUTPUT_DIR = path.join(OUTPUT_DIR, 'posts');

function parseFrontmatter(content) {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/);
  if (!match) return null;

  const frontmatterText = match[1];
  const body = match[2];

  const data = {};
  const lines = frontmatterText.split('\n');
  let currentKey = null;
  let indentLevel = 0;

  for (const rawLine of lines) {
    const line = rawLine.replace(/\r$/, '');
    const topLevelMatch = line.match(/^(\w+):\s*(.*)$/);
    if (topLevelMatch) {
      currentKey = topLevelMatch[1];
      const value = topLevelMatch[2];
      if (value === '') {
        data[currentKey] = {};
      } else {
        data[currentKey] = value.replace(/^['"](.*)['"]$/g, '$1');
      }
      continue;
    }

    const nestedMatch = line.match(/^\s+(\w+):\s*(.*)$/);
    if (nestedMatch && currentKey && typeof data[currentKey] === 'object') {
      const nestedKey = nestedMatch[1];
      const nestedValue = nestedMatch[2].replace(/^['"](.*)['"]$/g, '$1');
      data[currentKey][nestedKey] = nestedValue;
    }
  }

  return { data, body };
}

function estimateReadingTime(text) {
  const words = text.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / 200);
  return minutes;
}

function excerptFromBody(body, length = 200) {
  const plain = body.replace(/[#*>`\-_\[\]\(\)]/g, ' ').replace(/\s+/g, ' ').trim();
  return plain.length > length ? plain.slice(0, length).trim() + '…' : plain;
}

function main() {
  const files = fs.readdirSync(SOURCE_DIR).filter(f => f.endsWith('.md'));

  fs.mkdirSync(POSTS_OUTPUT_DIR, { recursive: true });

  const articles = [];
  for (const file of files) {
    const sourcePath = path.join(SOURCE_DIR, file);
    const destPath = path.join(POSTS_OUTPUT_DIR, file);
    const content = fs.readFileSync(sourcePath, 'utf-8');

    fs.copyFileSync(sourcePath, destPath);

    const parsed = parseFrontmatter(content);
    if (!parsed) {
      console.warn(`Skipping ${file}: no frontmatter found`);
      continue;
    }

    const fm = parsed.data;
    const slug = path.basename(file, '.md');
    const article = {
      slug,
      title: fm.title || slug,
      date: fm.date || '',
      excerpt: fm.description || excerptFromBody(parsed.body),
      image: fm.image || '',
      author: fm.author || null,
      readingTime: estimateReadingTime(parsed.body)
    };

    articles.push(article);
  }

  articles.sort((a, b) => new Date(b.date) - new Date(a.date));

  const articlesPath = path.join(OUTPUT_DIR, 'articles.json');
  fs.writeFileSync(articlesPath, JSON.stringify(articles, null, 2));

  console.log(`${files.length} articles migrated`);
}

main();
