import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';

const root = path.join(process.cwd(), 'content/career-comparisons');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'manifest.json'), 'utf8'));
const sha = raw => createHash('sha256').update(raw).digest('hex');
const ids = new Set();
let pages = 0;
for (const pair of manifest) {
  if (ids.has(pair.id) || pair.slugs.join('-vs-') !== pair.id) throw new Error(`Invalid pair identity: ${pair.id}`);
  ids.add(pair.id);
  for (const [route, locale] of [['zh', 'zh-CN'], ['en', 'en'], ['zh-TW', 'zh-TW']]) {
    const folder = path.join(root, pair.id);
    const raw = fs.readFileSync(path.join(folder, `${locale}.md`));
    const contextRaw = fs.readFileSync(path.join(folder, `${locale}-verified-context.json`));
    const match = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/.exec(raw.toString('utf8'));
    if (!match) throw new Error(`Invalid frontmatter: ${pair.id}/${locale}`);
    const meta = JSON.parse(match[1]);
    const context = JSON.parse(contextRaw);
    if (sha(raw) !== pair.pages[route].sha256 || sha(contextRaw) !== pair.pages[route].contextSha256
      || meta.pair_id !== pair.id || meta.locale !== locale || meta.title !== pair.pages[route].title
      || context.inputs.pair_id !== pair.id || context.inputs.locale !== locale || meta.input_hash !== context.input_hash) {
      throw new Error(`Asset binding mismatch: ${pair.id}/${locale}`);
    }
    if ((match[2].match(/^## /gm) ?? []).length !== 8 || match[2].split('<!-- comparison-faq -->').length !== 2) {
      throw new Error(`Missing modules or FAQ: ${pair.id}/${locale}`);
    }
    pages++;
  }
}
if (manifest.length !== 734 || pages !== 2202) throw new Error('Incomplete three-language comparison asset set');
console.log(`PASS: ${manifest.length} pairs, ${pages} source/context bindings, eight modules and FAQ per page.`);
