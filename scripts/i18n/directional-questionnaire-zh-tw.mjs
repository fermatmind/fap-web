import { readFileSync, writeFileSync, renameSync } from "node:fs";
import { build } from "./convert-zh-tw.mjs";

const root = new URL("../../", import.meta.url);
const output = new URL("lib/i18n/zh-TW/directional-questionnaires.generated.json", root);
const sources = [
    'lib/questionnaires/data/adult-age-preferences.json',
    'lib/questionnaires/result-content/adult-age-preferences.json',
    'components/questionnaires/AdultAgePreferencesLandingEditorial.ts',
    'lib/questionnaires/data/disc.json',
    'lib/questionnaires/result-content/disc.json',
    'lib/questionnaires/data/egen-teto.json',
    'lib/questionnaires/result-content/egen-teto.json',
    'components/questionnaires/EgenTetoLandingEditorial.ts',
    'lib/questionnaires/data/food-choice.json',
    'lib/questionnaires/result-content/food-choice.json',
    'components/questionnaires/FoodChoiceLandingEditorial.ts',
    'lib/questionnaires/data/likable-person-test.json',
    'lib/questionnaires/result-content/liked-reason.json',
    'components/questionnaires/LikableLandingEditorial.ts',
    'lib/questionnaires/data/love-personality.json',
    'lib/questionnaires/result-content/love-personality.json',
    'components/questionnaires/LovePersonalityLandingEditorial.ts',
    'lib/questionnaires/data/relationship-values.json',
    'lib/questionnaires/result-content/relationship-values.json',
    'components/questionnaires/RelationshipValuesLandingEditorial.ts',
    'lib/questionnaires/data/response-color.json',
    'lib/questionnaires/result-content/response-color.json',
    'components/questionnaires/ResponseColorLandingEditorial.ts',
];

function standaloneDirectionalCopy(value) {
  const restart = "作答進度不會儲存。重新整理、切換語言或離開後，需要重新開始";
  return JSON.parse(JSON.stringify(value), (key, text) => {
    if (key !== "zh" || typeof text !== "string") return text;
    return text
      .replace("直接开始、完整免费与可选草稿", "直接開始、完整免費與作答隱私")
      .replaceAll("分享只含公开入口", "分享會複製結果名稱與公開指南連結")
      .replace("草稿需主动开启，只在本标签页短期保存，完成、重测或清除即删除", restart)
      .replace("只有主动选择临时保存后，才在本标签页保留可恢复草稿；", "")
      .replace("本站不通过该草稿保留历史个人报告", "本站不保留可恢復的個人報告")
      .replace("原有页面内存、自选24小时标签页草稿和完成退出重测清除不变，", restart + "。")
      .replace(/[^。！？；]*(?:草稿|保存|存储)[^。！？；]*24\s*小时[^。！？；]*/gu, clause => {
        const share = /[，,](复制[^，,]*(?:分享|公开).*)/u.exec(clause)?.[1];
        return share ? restart + "。" + share : restart;
      })
      .replace(/(?:；|。)24\s*小时后失效[^。！？；]*/gu, "。" + restart)
      .replace(restart + "；完成、清除或重测即删除", restart)
      .replace(/(?:已保存草稿|已存草稿)[^。！？；]*(?:恢复|继续)[^。！？；]*[。；]/gu, "");
  });
}

const previous = readFileSync(output, "utf8");
const editorials = Object.fromEntries(await Promise.all(sources.map(async path => {
  const file = new URL(path, root);
  const value = path.endsWith("LandingEditorial.ts") ? await import(file) : JSON.parse(readFileSync(file, "utf8"));
  return [path, standaloneDirectionalCopy(value)];
})));
const { artifact, snapshots } = build(JSON.parse(previous), sources, editorials);
const next = JSON.stringify(artifact, null, 2) + "\n";
if (previous !== next) {
  if (process.argv.includes("--check")) throw new Error("Taiwan directional questionnaire sources changed");
  if (readFileSync(output, "utf8") !== previous ||
      Object.entries(snapshots).some(([path, raw]) => readFileSync(new URL(path, root), "utf8") !== raw)) {
    throw new Error("Taiwan directional questionnaire sources or target changed during generation");
  }
  const temporary = new URL(output.href + "." + process.pid + ".tmp");
  writeFileSync(temporary, next, { flag: "wx" });
  renameSync(temporary, output);
}
console.log(`zh-TW directional questionnaires: ${Object.keys(artifact.units).length} source-bound strings`);
