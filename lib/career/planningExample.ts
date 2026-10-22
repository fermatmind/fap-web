import type { Locale } from "@/lib/i18n/locales";

export function careerPlanningExample(markdown: string, locale: Locale): string | null {
  const lines = markdown.replace(/\r\n?/g, "\n").split("\n");
  const start = lines.findIndex((line) => locale === "zh"
    ? /^## 5\.2 完整填写示例：/.test(line)
    : line === "## Worked example: compare, test, review");
  if (start < 0) return null;
  const end = lines.findIndex((line, index) => index > start && /^## /.test(line));
  const body = lines.slice(start + 1, end < 0 ? undefined : end).join("\n").trim();
  return body || null;
}
