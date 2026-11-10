import type { DisplayLocale } from "@/lib/i18n/locales";

export function careerPlanningExample(markdown: string, locale: DisplayLocale): string | null {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const heading: Record<DisplayLocale, RegExp> = {
    en: /^## Worked example: compare, test, review$/u,
    zh: /^## 5\.2 完整填写示例：/u,
    "zh-TW": /^## 5\.2 完整填寫示例：/u,
  };
  const start = lines.findIndex((line) => heading[locale].test(line));
  if (start < 0) return null;
  const end = lines.findIndex((line, index) => index > start && /^## /.test(line));
  const body = lines.slice(start + 1, end < 0 ? undefined : end).join("\n").trim();
  return body || null;
}
