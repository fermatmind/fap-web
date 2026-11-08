import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Converter } from 'opencc-js';

// Explicit current, code-owned sources only. CMS requires its own native importer.
export const sources = ['lib/questionnaires/data/chiikawa.json', 'lib/questionnaires/result-content/chiikawa.json', 'lib/i18n/zh-TW/ui.source.json', 'lib/i18n/zh-TW/about-team.source.json', 'lib/i18n/zh-TW/content-page-labels.source.json'];
const root = new URL('../../', import.meta.url);
export const packages = [
  { output: 'lib/i18n/zh-TW/chiikawa.generated.json', sources },
  { output: 'lib/i18n/zh-TW/seven-sins.generated.json', sources: ['lib/questionnaires/data/seven-sins-virtues-test.json', 'lib/questionnaires/result-content/seven-sins-virtues-test.json', 'lib/questionnaires/virtuesLandingEditorial.json'] },
  { output: 'lib/i18n/zh-TW/seven-sins-ui.generated.json', sources: ['lib/i18n/zh-TW/seven-sins-ui.source.json'] },
];
const converter = 'opencc-js@1.4.2:cn:twp';
const glossary = 'fermatmind-tw-1';
const convert = Converter({ from: 'cn', to: 'twp' });
const hash = value => createHash('sha256').update(value).digest('hex');
// Literal tokens in reader text remain byte-for-byte intact, including numbers.
const protectedTokens = /https?:\/\/[^\s<>）)]+|`[^`]*`|\{\{[^}]*\}\}|\$?\{[^}]*\}|%\d*\$?[sdif]|\d+(?:[.,:/-]\d+)*/g;
export function convertText(source) {
  const tokens = [];
  const masked = source.replace(protectedTokens, value => { tokens.push(value); return `\uE000${String.fromCharCode(0xE100 + tokens.length - 1)}\uE001`; });
  const target = convert(masked);
  return target.replace(/\uE000([\uE100-\uF8FF])\uE001/g, (_, key) => tokens[key.charCodeAt(0) - 0xE100]);
}
export function collect(value, path = '', result = {}) {
  if (value && typeof value === 'object' && !Array.isArray(value) && typeof value.zh === 'string' && typeof value.en === 'string') {
    result[path] = value.zh;
  } else if (value && typeof value === 'object') {
    for (const [key, child] of Object.entries(value)) collect(child, `${path}/${key}`, result);
  }
  return result;
}
export function build(previous = {}, selectedSources = sources) {
  const units = {}, sourceHashes = {}, snapshots = {};
  for (const path of selectedSources) {
    const raw = readFileSync(new URL(path, root), 'utf8');
    snapshots[path] = raw;
    sourceHashes[path] = hash(raw);
    for (const [context, source] of Object.entries(collect(JSON.parse(raw)))) {
      const id = `${path}${context}`;
      const sourceHash = hash(JSON.stringify(['zh-TW', id, source, converter, glossary]));
      const prior = previous.units?.[id];
      units[id] = prior?.sourceHash === sourceHash ? prior : { sourceHash, text: convertText(source) };
      const before = source.match(protectedTokens) ?? [], after = units[id].text.match(protectedTokens) ?? [];
      if (JSON.stringify(before) !== JSON.stringify(after)) throw new Error(`Protected tokens changed: ${id}`);
    }
  }
  return { artifact: { targetLocale: 'zh-TW', converter, glossary, sourceHashes, units }, snapshots };
}
if (process.argv[1] === fileURLToPath(import.meta.url)) for (const pkg of packages) {
  const output = new URL(pkg.output, root);
  const previousRaw = existsSync(output) ? readFileSync(output, 'utf8') : '';
  const { artifact, snapshots } = build(previousRaw ? JSON.parse(previousRaw) : {}, pkg.sources);
  const next = JSON.stringify(artifact, null, 2) + '\n';
  if (process.argv.includes('--check')) {
    if (previousRaw !== next) throw new Error('Traditional resources are missing or stale; run pnpm i18n:zh-TW');
  } else if (previousRaw !== next) {
    // Optimistic source and destination binding; replace the one code-owned package atomically.
    for (const [path, raw] of Object.entries(snapshots)) if (readFileSync(new URL(path, root), 'utf8') !== raw) throw new Error(`Source changed: ${path}`);
    if ((existsSync(output) ? readFileSync(output, 'utf8') : '') !== previousRaw) throw new Error('Target changed concurrently');
    const temporary = new URL(`${output.href}.${process.pid}.tmp`);
    writeFileSync(temporary, next, { flag: 'wx' });
    renameSync(temporary, output);
  }
  console.log(`zh-TW: ${Object.keys(artifact.units).length} reader fields; sources=${pkg.sources.length}; ${process.argv.includes('--check') ? 'verified' : 'generated'}`);
}
