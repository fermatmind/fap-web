import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { scoreDataEntryRound } from "@/lib/questionnaires/dataEntry";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { countSamplePresentation } from "./comparison-samples";

const text = {
  en: { titles: ["All fields exact", "One field differs", "Two fields left blank"], count: "Exact field accuracy", rate: "character KPH", heading: "Inspect a fictional source record", time: "60 seconds" },
  zh: { titles: ["四个字段都录对", "有一个字段不同", "两个字段留空"], count: "字段精确准确率", rate: "字符 KPH", heading: "先看一条虚构记录的格式", time: "60 秒" },
  "zh-TW": { titles: ["四個欄位都輸入正確", "有一個欄位不同", "有兩個欄位留白"], count: "欄位精確正確率", rate: "字元 KPH", heading: "先看看一筆虛構資料的格式", time: "60 秒" },
};

const standard = countSamplePresentation(0, 3, {
  en: { headline: "Original 60-second entry practice · Two formats", stylesTitle: "Two formats you can try", focus: "Transcribing supplied fictional data to matching form fields", output: "Exact fields, accuracy and character rate" },
  zh: { headline: "原创 60 秒录入练习 · 两种记录", stylesTitle: "两种记录格式都可以练", focus: "把虚构源记录原样录到对应字段", output: "精确字段、准确率和字符速率" },
  "zh-TW": { headline: "原創 60 秒錄入練習 · 兩種資料格式", stylesTitle: "有兩種資料格式可以練習", focus: "把畫面上的虛構資料逐項輸入對應欄位", output: "正確欄位數、正確率與字元速率" },
}, {
  en: "Sample bars show exact field accuracy. Character KPH is shown separately.",
  zh: "样张长条只显示字段准确率。字符 KPH 单独列出。",
  "zh-TW": "範例的長條呈現欄位正確率，字元 KPH 另外列出。",
});

export const dataEntryPresentation = {
  en: { ...standard.en, trust: "60 seconds per round · Free · No sign-up", current: [standard.en.focus, "60 seconds per round", standard.en.output] },
  zh: { ...standard.zh, trust: "每轮 60 秒 · 免费 · 免注册", current: [standard.zh.focus, "每轮 60 秒", standard.zh.output] },
  "zh-TW": { ...standard["zh-TW"], trust: "每輪 60 秒 · 免費 · 免註冊", current: [standard["zh-TW"].focus, "每輪 60 秒", standard["zh-TW"].output] },
};
export const dataEntrySampleHeading = (locale: DisplayLocale) => text[locale].heading;

export function dataEntrySamples(quiz: Questionnaire, locale: DisplayLocale, key: Locale) {
  const config = quiz.dataEntry!;
  const labels = text[locale];
  return ["exact", "one-error", "two-blanks"].map((id, index) => {
    const round = config.rounds[index % config.rounds.length];
    const record = round.records[0];
    const values = record.values.map((value, field) => index === 1 && field === 0 ? value + "X" : index === 2 && field >= 2 ? "" : value);
    const result = scoreDataEntryRound(round, [{ recordId: record.id, values }], config.durationMs);
    if (result.status !== "complete" || result.fieldAccuracy === null) throw new Error(`Invalid data entry sample ${id}`);
    return { id, title: labels.titles[index], axes: [{
      id: "field-accuracy", title: `${round.title[key]} · ${labels.count}`,
      value: result.fieldAccuracy, maximum: 100,
      score: `${result.exactFields} / ${result.consideredFields} · ${result.fieldAccuracy.toFixed(1)}% · ${result.characterKph.toFixed(1)} ${labels.rate}`,
    }] };
  });
}
