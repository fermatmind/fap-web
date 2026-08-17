import type { Locale } from "@/lib/i18n/locales";

const ZH_TECHNICAL_VALUE_LABELS: Record<string, string> = {
  "core insight hero": "核心结论",
  "evidence snapshot": "证据快照",
  "reality translation": "现实场景",
  "key finding": "核心结论",
  "supporting scores": "分数依据",
  "situation review": "现实核对",
  "next practice focus": "下一步练习重点",
  proficient: "较成熟",
  foundational: "基础阶段",
  developing: "发展中",
  stable: "较稳定",
  integrated: "较整合",
  provisional: "阶段性",
  preliminary: "初步建立",
  planned: "计划验证",
  high: "高",
  medium: "中",
  low: "低",
  "high confidence": "高",
  "medium confidence": "中",
  "low confidence": "低",
};

function normalizedTechnicalValue(value: string): string {
  return value.trim().replaceAll("_", " ").replace(/\s+/g, " ").toLowerCase();
}

export function localizeEqTechnicalValue(value: string | undefined, locale: Locale): string {
  if (!value) return "";
  if (locale !== "zh") return value;
  return ZH_TECHNICAL_VALUE_LABELS[normalizedTechnicalValue(value)] ?? value;
}
