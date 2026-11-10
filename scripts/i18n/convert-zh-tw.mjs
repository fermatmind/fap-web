import { readFileSync, writeFileSync, renameSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { Converter } from 'opencc-js';

// Explicit current, code-owned sources only. CMS requires its own native importer.
export const sources = ['lib/questionnaires/data/chiikawa.json', 'lib/questionnaires/result-content/chiikawa.json', 'lib/i18n/zh-TW/ui.source.json', 'lib/i18n/zh-TW/about-team.source.json', 'lib/i18n/zh-TW/content-page-labels.source.json'];
const root = new URL('../../', import.meta.url);
export const packages = [
  { output: 'lib/i18n/zh-TW/global-history-roster.generated.json', sources: ['lib/entertainment/global-history/people.json'] },
  { output: 'lib/i18n/zh-TW/changan.generated.json', sources: ['lib/entertainment/data/changan-history-quiz.json'] },
  { output: 'lib/i18n/zh-TW/chiikawa.generated.json', sources },
  { output: 'lib/i18n/zh-TW/seven-sins.generated.json', sources: ['lib/questionnaires/data/seven-sins-virtues-test.json', 'lib/questionnaires/result-content/seven-sins-virtues-test.json', 'lib/questionnaires/virtuesLandingEditorial.json'] },
  { output: 'lib/i18n/zh-TW/seven-sins-ui.generated.json', sources: ['lib/i18n/zh-TW/seven-sins-ui.source.json'] },
  { output: 'lib/i18n/zh-TW/practice-questionnaires.generated.json', sources: [
    'lib/questionnaires/data/attention-to-detail.json',
    'lib/questionnaires/result-content/attention-to-detail.json',
    'lib/questionnaires/data/cybersecurity-awareness.json',
    'lib/questionnaires/result-content/cybersecurity.json',
    'lib/questionnaires/data/workplace-technology.json',
    'lib/questionnaires/result-content/workplace-technology.json',
    'components/questionnaires/AttentionDetailLandingEditorial.ts',
    'components/questionnaires/CybersecurityLandingEditorial.ts',
    'components/questionnaires/WorkplaceTechnologyLandingEditorial.ts',
    'lib/questionnaires/data/computer-literacy.json',
    'lib/questionnaires/result-content/computer-literacy.json',
    'components/questionnaires/ComputerLiteracyLandingEditorial.ts',
    'lib/questionnaires/data/digital-ethics-citizenship.json',
    'lib/questionnaires/result-content/digital-ethics-citizenship.json',
    'components/questionnaires/DigitalCitizenshipLandingEditorial.ts',
    'lib/questionnaires/data/customer-service-aptitude.json',
    'lib/questionnaires/result-content/customer-service-aptitude.json',
    'components/questionnaires/CustomerServiceLandingEditorial.ts',
    'lib/questionnaires/data/sales-aptitude.json',
    'lib/questionnaires/result-content/sales-aptitude.json',
    'components/questionnaires/SalesAptitudeLandingEditorial.ts',
    'lib/questionnaires/data/situational-judgement.json',
    'lib/questionnaires/result-content/situational-judgement.json',
    'components/questionnaires/SituationalJudgementLandingEditorial.ts',
    'lib/questionnaires/data/aptitude-test.json',
    'lib/questionnaires/result-content/aptitude-test.json',
    'components/questionnaires/AptitudeLandingEditorial.ts',
    'lib/questionnaires/data/abstract-reasoning.json',
    'lib/questionnaires/result-content/abstract-reasoning.json',
    'components/questionnaires/AbstractReasoningLandingEditorial.ts',
    'lib/questionnaires/data/logical-reasoning.json',
    'lib/questionnaires/result-content/logical-reasoning.json',
    'components/questionnaires/LogicalReasoningLandingEditorial.ts',
    'lib/questionnaires/data/mechanical-reasoning.json',
    'lib/questionnaires/result-content/mechanical-reasoning.json',
    'components/questionnaires/MechanicalReasoningLandingEditorial.ts',
    'lib/questionnaires/data/verbal-reasoning.json',
    'lib/questionnaires/result-content/verbal-reasoning.json',
    'components/questionnaires/VerbalReasoningLandingEditorial.ts',
    'lib/questionnaires/data/numerical-reasoning.json',
    'lib/questionnaires/result-content/numerical-reasoning.json',
    'components/questionnaires/NumericalReasoningLandingEditorial.ts',
    'lib/questionnaires/data/spatial-reasoning.json',
    'lib/questionnaires/result-content/spatial-reasoning.json',
    'components/questionnaires/SpatialReasoningLandingEditorial.ts',
    'lib/questionnaires/data/english-proficiency.json',
    'lib/questionnaires/result-content/english-proficiency.json',
    'components/questionnaires/EnglishProficiencyLandingEditorial.ts',
    'lib/questionnaires/data/german-proficiency.json',
    'lib/questionnaires/result-content/german-proficiency.json',
    'components/questionnaires/GermanLandingEditorial.ts',
    'lib/questionnaires/data/grammar-test.json',
    'lib/questionnaires/result-content/grammar-test.json',
    'components/questionnaires/GrammarLandingEditorial.ts',
    'lib/questionnaires/data/spanish-proficiency.json',
    'lib/questionnaires/result-content/spanish-proficiency.json',
    'components/questionnaires/SpanishProficiencyLandingEditorial.ts',
    'lib/questionnaires/data/spelling-test.json',
    'lib/questionnaires/result-content/spelling-test.json',
    'components/questionnaires/SpellingLandingEditorial.ts',
    'lib/questionnaires/data/java-test.json',
    'lib/questionnaires/result-content/java-test.json',
    'components/questionnaires/JavaLandingEditorial.ts',
    'lib/questionnaires/data/javascript-test.json',
    'lib/questionnaires/result-content/javascript-test.json',
    'components/questionnaires/JavaScriptLandingEditorial.ts',
    'lib/questionnaires/data/python-test.json',
    'lib/questionnaires/result-content/python-test.json',
    'components/questionnaires/PythonLandingEditorial.ts',
    'lib/questionnaires/data/sql-test.json',
    'lib/questionnaires/result-content/sql-test.json',
    'components/questionnaires/SqlLandingEditorial.ts',
    'lib/questionnaires/data/word-skills.json',
    'lib/questionnaires/result-content/word-skills.json',
    'components/questionnaires/WordSkillsLandingEditorial.ts',
    'lib/questionnaires/data/excel-skills.json',
    'lib/questionnaires/result-content/excel-skills.json',
    'components/questionnaires/ExcelSkillsLandingEditorial.ts',
    'lib/questionnaires/data/financial-accounting.json',
    'lib/questionnaires/result-content/financial-accounting.json',
    'components/questionnaires/FinancialAccountingLandingEditorial.ts',
  ] },
  { output: 'lib/i18n/zh-TW/relationship-questionnaires.generated.json', sources: [
    'lib/questionnaires/data/attachment-styles.json',
    'lib/questionnaires/result-content/attachment-styles.json',
    'lib/questionnaires/data/communication-style.json',
    'lib/questionnaires/result-content/communication-style.json',
  ] },
];
const converter = 'opencc-js@1.4.2:cn:twp';
const glossary = 'fermatmind-tw-1';
const convert = Converter({ from: 'cn', to: 'twp' });
const hash = value => createHash('sha256').update(value).digest('hex');
// Literal tokens in reader text remain byte-for-byte intact, including numbers.
const protectedTokens = /https?:\/\/[^\s<>）)]+|`[^`]*`|\{\{[^}]*\}\}|\$?\{[^}]*\}|%\d*\$?[sdif]|\d+(?:[.,:/-]\d+)*/g;
export function convertText(source, protectedPhrases = []) {
  const tokens = [];
  const protect = value => { tokens.push(value); return `\uE000${String.fromCharCode(0xE100 + tokens.length - 1)}\uE001`; };
  let masked = source.replace(protectedTokens, protect);
  // Apply reviewed reader phrases only after URLs, code and variables have
  // been shielded. Existing questionnaire callers keep the default conversion.
  for (const [phrase, target] of protectedPhrases) masked = masked.replaceAll(phrase, () => protect(target));
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
export function build(previous = {}, selectedSources = sources, loadedEditorials = {}) {
  const units = {}, sourceHashes = {}, snapshots = {};
  for (const path of selectedSources) {
    const raw = readFileSync(new URL(path, root), 'utf8');
    snapshots[path] = raw;
    sourceHashes[path] = hash(raw);
    const sourceValue = Object.hasOwn(loadedEditorials, path) ? loadedEditorials[path] : JSON.parse(raw);
    for (const [context, source] of Object.entries(collect(sourceValue))) {
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
async function main() {
  for (const pkg of packages) {
    const output = new URL(pkg.output, root);
    const previousRaw = existsSync(output) ? readFileSync(output, 'utf8') : '';
    const editorials = Object.fromEntries(await Promise.all(pkg.sources
      .filter(path => path.endsWith('LandingEditorial.ts'))
      .map(async path => [path, await import(new URL(path, root))])));
    const { artifact, snapshots } = build(previousRaw ? JSON.parse(previousRaw) : {}, pkg.sources, editorials);
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
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}
