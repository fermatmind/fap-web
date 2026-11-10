import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs';
import { build } from './convert-zh-tw.mjs';

const root = new URL('../../', import.meta.url);
const output = new URL('lib/i18n/zh-TW/likert-questionnaires.generated.json', root);
const sources = [
    'lib/questionnaires/data/growth-mindset-fixed-mindset.json',
    'lib/questionnaires/result-content/growth-mindset.json',
    'components/questionnaires/GrowthLandingEditorial.ts',
    'lib/questionnaires/data/grit-test.json',
    'lib/questionnaires/result-content/grit.json',
    'components/questionnaires/GritLandingEditorial.ts',
    'lib/questionnaires/data/tech-savvy.json',
    'lib/questionnaires/result-content/tech-savvy.json',
    'components/questionnaires/TechConfidenceLandingEditorial.ts',
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
    'lib/questionnaires/data/hexaco.json',
    'lib/questionnaires/result-content/hexaco.json',
    'components/questionnaires/HexacoLandingEditorial.ts',
    'lib/questionnaires/data/work-traits-reflection.json',
    'lib/questionnaires/result-content/work-traits-reflection.json',
    'components/questionnaires/WorkTraitsLandingEditorial.ts',
];

function standaloneLikertSource(raw) {
  const restart = "這份測驗不儲存答題進度。重新整理、切換語言或離開後，需要重新開始。";
  const replacements = [
    "默认不保存；主动保存的当前标签页草稿24小时内可恢复，完成、清除或重测即删除。",
    "默认不保存；主动保存的本标签页草稿24小时内恢复，完成、清除或重测即删。",
    "草稿需主动开启，仅本标签页24小时有效，完成、重测、退出清除即删。",
    "草稿需主动开启，仅本标签页保留24小时，完成、重测或退出并清除时删除。",
    "主动开启的本标签页草稿限24小时，完成、退出清除或重测会清除；不愿保存可直接作答。",
    "主动保存的草稿在本标签页最多24小时，完成或重测即清除，",
    "默认不保存，主动保存的本标签页草稿24小时后过期，完成、重测或退出清除时删除。",
    "默认仅留在内存，主动选择后才保存标签页草稿。草稿24小时失效，完成、重测或退出并清除时删除。",
    "原有默认页面内存、主动选择的24小时标签页草稿及完成退出重测清除保持不变；",
    "草稿主动开启，仅本设备24小时，完成、退出或重测清除。",
    "草稿需主动开启，本标签页24小时后失效，完成、重测或退出清除即删。",
    "保存进度由你主动选择，在本标签页最长保留24小时，完成、重测或退出清除后删除。",
    "原有页面内存、自选24小时标签页草稿及完成退出重测清除不变；",
    "可选进度保存使用本标签页的会话存储，24小时后失效，完成、重测或退出清除后删除。",
    "可选标签页会话草稿24小时后失效，完成、重测或退出清除后删除。",
  ];
  return JSON.parse(raw, (key, value) => {
    if (key === 'zh' && typeof value === 'string') {
      return replacements.reduce((text, from) => text.replaceAll(from, restart), value)
        .replace("若换了技能，回答可能改变；恢复草稿时请仍用原先参照，不记得可以清除后重测，而不是把两种情境当作同一结果。", "若换了技能，回答可能改变。重测同一情境时，请继续用原先的技能作参照；若想换一项技能，就把它当成一次新的观察。")
        .replace("免费阅读、可选草稿与公开分享", "免费阅读、答题进度与公开分享")
        .replace("免费直接作答、公开指南与可选保存", "免费直接作答、公开指南与隐私")
        .replace("普通页面分析关闭，可选匿名活动计数需要另行主动开启。", "網站可能依 Cookie 設定記錄不含答案的使用事件。");
    }
    return value;
  });
}
const previous = existsSync(output) ? readFileSync(output, 'utf8') : '';
const overrides = Object.fromEntries(await Promise.all(sources.map(async path => {
  if (path.endsWith('LandingEditorial.ts')) {
    const editorial = await import(new URL(path, root));
    return [path, ['Hexaco', 'TechConfidence'].some(name => path.endsWith('/'+name+'LandingEditorial.ts')) ? standaloneLikertSource(JSON.stringify(editorial)) : editorial];
  }
  const raw = readFileSync(new URL(path, root), 'utf8');
  return [path, path.startsWith('lib/questionnaires/data/') || path.endsWith('/work-traits-reflection.json') || path.endsWith('/tech-savvy.json')
    ? standaloneLikertSource(raw) : JSON.parse(raw)];
})));
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
