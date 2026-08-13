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

const ZH_QUALITY_FLAG_LABELS: Record<string, string> = {
  SPEEDING: "作答速度过快，建议在注意力充足时重新作答。",
  INCONSISTENT: "部分答案的一致性偏低，结果需要谨慎阅读。",
  LONGSTRING: "连续多题使用了相同选项，结果需要结合当时状态复核。",
  EXTREME_RESPONSE_BIAS: "极端选项使用较多，建议确认这些选择是否符合真实体验。",
  NEUTRAL_RESPONSE_BIAS: "中立选项使用较多，结果可能不足以区分当前倾向。",
};

const EN_QUALITY_FLAG_LABELS: Record<string, string> = {
  SPEEDING: "Responses were completed unusually quickly; retake when you have enough time and attention.",
  INCONSISTENT: "Some answers were less internally consistent, so interpret this session cautiously.",
  LONGSTRING: "The same option was used across a long run of items; review whether that reflects your experience.",
  EXTREME_RESPONSE_BIAS: "Extreme options were used often; check whether those choices reflect your experience.",
  NEUTRAL_RESPONSE_BIAS: "Neutral options were used often, which may limit how clearly this session distinguishes tendencies.",
};

function normalizedTechnicalValue(value: string): string {
  return value.trim().replaceAll("_", " ").replace(/\s+/g, " ").toLowerCase();
}

export function localizeEqTechnicalValue(value: string | undefined, locale: Locale): string {
  if (!value) return "";
  if (locale !== "zh") return value;
  return ZH_TECHNICAL_VALUE_LABELS[normalizedTechnicalValue(value)] ?? value;
}

export function localizeEqQualityFlag(flag: string, locale: Locale): string {
  const normalizedFlag = flag.trim().toUpperCase();
  if (locale === "zh") {
    return ZH_QUALITY_FLAG_LABELS[normalizedFlag] ?? "检测到其他需要复核的作答质量信号。";
  }
  return EN_QUALITY_FLAG_LABELS[normalizedFlag] ?? "Another response-quality signal needs review.";
}
