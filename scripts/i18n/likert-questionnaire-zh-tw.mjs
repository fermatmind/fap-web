import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { build } from './convert-zh-tw.mjs';

const root = new URL('../../', import.meta.url);
const output = new URL('lib/i18n/zh-TW/likert-questionnaires.generated.json', root);
const sources = [
    'lib/questionnaires/data/locus-of-control.json',
    'lib/questionnaires/result-content/locus-of-control.json',
    'components/questionnaires/LocusLandingEditorial.ts',
    'lib/questionnaires/data/empathy.json',
    'lib/questionnaires/result-content/empathy.json',
    'lib/questionnaires/data/social-intelligence-test.json',
    'lib/questionnaires/result-content/social-understanding.json',
    'components/questionnaires/SocialIntelligenceLandingEditorial.ts',
    'lib/questionnaires/data/character-strengths.json',
    'lib/questionnaires/result-content/character-strengths.json',
    'components/questionnaires/StrengthsLandingEditorial.ts',
];

function standaloneLikertSource(path) {
  const replacements = [
    "默认不保存；主动保存的当前标签页草稿24小时内可恢复，完成、清除或重测即删除。",
    "默认不保存；主动保存的本标签页草稿24小时内恢复，完成、清除或重测即删。",
    "草稿需主动开启，仅本标签页24小时有效，完成、重测、退出清除即删。",
    "草稿需主动开启，仅本标签页保留24小时，完成、重测或退出并清除时删除。",
    "主动开启的本标签页草稿限24小时，完成、退出清除或重测会清除；不愿保存可直接作答。",
  ];
  return JSON.parse(readFileSync(new URL(path, root), 'utf8'), (key, value) => {
    if (key === 'zh' && typeof value === 'string') {
      return replacements.reduce((text, from) => text.replaceAll(from, "這份測驗不儲存答題進度。重新整理、切換語言或離開後，需要重新開始。"), value)
        .replace("免费阅读、可选草稿与公开分享", "免费阅读、答题进度与公开分享")
        .replace("免费直接作答、公开指南与可选保存", "免费直接作答、公开指南与隐私");
    }
    return value;
  });
}
const previous = existsSync(output) ? readFileSync(output, 'utf8') : '';
const overrides = Object.fromEntries(await Promise.all(sources.map(async path => [
  path,
  path.endsWith('LandingEditorial.ts') ? await import(new URL(path, root)) :
    path.startsWith('lib/questionnaires/data/') ? standaloneLikertSource(path) : JSON.parse(readFileSync(new URL(path, root), 'utf8')),
])));
const { artifact, snapshots } = build(previous ? JSON.parse(previous) : {}, sources, overrides);
const next = JSON.stringify(artifact, null, 2) + '\n';
if (next !== previous) {
  if (process.argv.includes('--check')) throw new Error('Taiwan Likert questionnaire source changed. Run pnpm i18n:zh-TW');
  if (Object.entries(snapshots).some(([path, bytes]) => readFileSync(new URL(path, root), 'utf8') !== bytes) ||
    (existsSync(output) ? readFileSync(output, 'utf8') : '') !== previous) {
    throw new Error('Taiwan Likert questionnaire source or target changed concurrently');
  }
  const temporary = new URL(`${output.href}.${process.pid}.tmp`);
  writeFileSync(temporary, next, { flag: 'wx' });
  renameSync(temporary, output);
}
console.log(`zh-TW Likert questionnaires: ${Object.keys(artifact.units).length} source-bound strings`);
