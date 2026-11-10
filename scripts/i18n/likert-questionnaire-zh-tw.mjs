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
    'lib/questionnaires/data/time-management.json',
    'lib/questionnaires/result-content/time-management.json',
    'components/questionnaires/TimeManagementLandingEditorial.ts',
    'lib/questionnaires/data/procrastinator-type-test.json',
    'lib/questionnaires/result-content/procrastination.json',
    'components/questionnaires/ProcrastinationLandingEditorial.ts',
    'lib/questionnaires/data/everyday-control-style.json',
    'lib/questionnaires/result-content/everyday-control-style.json',
    'components/questionnaires/EverydayControlLandingEditorial.ts',
    'lib/questionnaires/data/apology-language.json',
    'lib/questionnaires/result-content/apology-language.json',
    'components/questionnaires/ApologyLandingEditorial.ts',
    'lib/questionnaires/data/conflict-styles.json',
    'lib/questionnaires/result-content/conflict-styles.json',
    'components/questionnaires/ConflictStylesLandingEditorial.ts',
    'lib/questionnaires/data/love-fight-style.json',
    'lib/questionnaires/result-content/love-fight-style.json',
    'lib/questionnaires/data/friendship-compatibility.json',
    'lib/questionnaires/result-content/friendship-compatibility.json',
    'components/questionnaires/FriendshipFitLandingEditorial.ts',
    'lib/questionnaires/data/relationship-worry-habits.json',
    'lib/questionnaires/result-content/relationship-worry-habits.json',
    'components/questionnaires/RelationshipWorryLandingEditorial.ts',
    'lib/questionnaires/data/relationship-habits.json',
    'lib/questionnaires/result-content/relationship-habits.json',
    'components/questionnaires/RelationshipHabitsLandingEditorial.ts',
    'lib/questionnaires/data/dating-outlook.json',
    'lib/questionnaires/result-content/dating-outlook.json',
    'components/questionnaires/DatingOutlookLandingEditorial.ts',
    'lib/questionnaires/data/intimacy-values.json',
    'lib/questionnaires/result-content/intimacy-values.json',
    'components/questionnaires/IntimacyValuesLandingEditorial.ts',
    'lib/questionnaires/data/relationship-commitment.json',
    'lib/questionnaires/result-content/relationship-commitment.json',
    'components/questionnaires/CommitmentLandingEditorial.ts',
    'lib/questionnaires/data/work-activity-interests.json',
    'lib/questionnaires/result-content/work-activity-interests.json',
    'components/questionnaires/WorkActivityLandingEditorial.ts',
    'lib/questionnaires/data/work-ethics.json',
    'lib/questionnaires/result-content/work-ethics.json',
    'components/questionnaires/WorkEthicsLandingEditorial.ts',
    'lib/questionnaires/data/culture-fit.json',
    'lib/questionnaires/result-content/culture-fit.json',
    'components/questionnaires/CultureFitLandingEditorial.ts',
    'lib/questionnaires/data/competency-test.json',
    'lib/questionnaires/result-content/competency-test.json',
    'components/questionnaires/CompetencyLandingEditorial.ts',
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
    "可选标签页草稿最多保留24小时，",
    "主动勾选才保存最长24小时标签页草稿，完成或清空会删除。",
    "默认不保存，只有主动保存才提供本标签页24小时内恢复；完成、清除或重测即删除。",
    "浏览器内计分，默认不保存；主动保存的本标签页草稿24小时内可恢复，完成、清除或重测即删除。",
    "原有页面内存、主动选择的24小时标签页草稿及完成退出重测清除不变，",
    "可选标签页草稿沿用明确主动选择，24小时失效，完成、退出清除或重测时删除。",
    "可选标签页草稿需要主动保存，二十四小时失效，完成或重测清除。",
    "主动选择的标签页草稿最多二十四小时，完成、重测或退出清除即删。",
    "主动选择后才在本标签页保存最多24小时进度，完成、重置或退出并清除会删除；",
    "页面内存、自选24小时标签页草稿及完成、重测、退出清除保持不变，",
    "主动选择后才在本标签页保存最多24小时进度；完成、重置或退出并清除会移除。",
    "主动勾选才在标签页保存最多24小时草稿，完成或重置即清除。",
    "可选草稿最多在本标签页保留24小时，完成或重置清除。",
    "原有页面内存、自选24小时标签页草稿及完成退出重测清除不变，",
    "原有页面内存、主动选择的24小时标签页草稿及完成退出重测清除保持不变，",
    "保存需要主动选择，进度最多在本标签页保留24小时；完成、重测或退出清除会删除草稿。",
    "只有主动选择才保存最多24小时的标签页草稿，完成、重测或退出清除时删除。",
    "只有主动选择才保存最多24小时标签页草稿；完成、重测或退出清除时删除。",
    "只有主动保存才会在本标签页保留最多24小时草稿；完成、重测或退出清除会删除草稿。",
    "草稿可自行选择，仅在当前浏览器标签页最多保存24小时，完成、清除或重测即删除。",
    "可选进度仅在当前标签页最多保留24小时，完成、清除或重测即删除。",
    "进度可自行选择，仅在当前浏览器标签页最多保留24小时，完成、清除或重测即删除。",
    "只有主动勾选，当前标签页才暂存可恢复的选择，24小时到期；完成、重测或退出清除时删除。",
    "原有可选标签页草稿24小时期限及完成、重测清除保持不变，",
    "只有主动选择才保存最多24小时的标签页草稿；完成、退出清除或重测时删除。",
    "原有可选标签页草稿24小时期限与完成、重测清除保持不变，",
    "只有主动保存才在本标签页保留24小时草稿，完成或重测清除；",
    "可选标签页草稿最多保留二十四小时，完成、清除或重测后删除。",
    "原有可选标签页草稿24小时期限与完成、重测清除保持原样，",
    "可选进度仅在当前浏览器标签页最多保留二十四小时，完成、清除或重测后删除。",
  ];
  return JSON.parse(raw, (key, value) => {
    if (key === 'zh' && typeof value === 'string') {
      return replacements.reduce((text, from) => text.replaceAll(from, restart), value)
        .replace("若换了技能，回答可能改变；恢复草稿时请仍用原先参照，不记得可以清除后重测，而不是把两种情境当作同一结果。", "若换了技能，回答可能改变。重测同一情境时，请继续用原先的技能作参照；若想换一项技能，就把它当成一次新的观察。")
        .replace("最终答卷不作草稿保存，", "")
        .replace("普通路由分析关闭；可选匿名活动计数需要另行主动选择。", "網站可能依 Cookie 設定記錄不含答案的使用事件。")
        .replace("可选匿名活动计数未经选择保持关闭，且不包含答案；关闭它不影响题目或指南。", "網站可能依 Cookie 設定記錄不含答案的使用事件。")
        .replace("直接作答、免费指南与可选保存", "直接作答、免费指南与隐私")
        .replace("临时标签页草稿为独立可选功能，不是作答条件。", "作答進度不會儲存。重新整理或離開後，需要重新開始。")
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
    return [path, ['Hexaco', 'TechConfidence', 'EverydayControl', 'RelationshipWorry', 'RelationshipHabits', 'DatingOutlook', 'IntimacyValues', 'Commitment', 'WorkActivity', 'WorkEthics', 'CultureFit', 'Competency'].some(name => path.endsWith('/'+name+'LandingEditorial.ts')) ? standaloneLikertSource(JSON.stringify(editorial)) : editorial];
  }
  const raw = readFileSync(new URL(path, root), 'utf8');
  return [path, path.startsWith('lib/questionnaires/data/') || path.endsWith('/work-traits-reflection.json') || path.endsWith('/tech-savvy.json') || path.endsWith('/everyday-control-style.json') || path.endsWith('/love-fight-style.json') || path.endsWith('/relationship-worry-habits.json') || path.endsWith('/relationship-habits.json') || path.endsWith('/dating-outlook.json') || path.endsWith('/intimacy-values.json') || path.endsWith('/relationship-commitment.json') || path.endsWith('/work-activity-interests.json') || path.endsWith('/work-ethics.json') || path.endsWith('/culture-fit.json') || path.endsWith('/competency-test.json')
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
