import type { Locale } from "@/lib/i18n/locales";

const ZH_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/FC144\s*(?:深度版|Deep Form)/gi, "FC144 二选一迫选版"],
  [/E105\s*(?:标准版|Standard Form)/gi, "E105 五点量表版"],
  [/Technical Note(?:\s*v?0\.1)?/gi, "技术说明"],
  [/Confidence Band/gi, "解释稳定性"],
  [/置信带/g, "解释稳定性"],
  [/Close[- ]call result/gi, "接近型结果"],
  [/Close[- ]call/gi, "接近型辨析"],
  [/Diffuse-result boundary/gi, "分布较分散时的解释边界"],
  [/\bdiffuse\b/gi, "分布较分散"],
  [/All\s*9/gi, "九型完整轮廓"],
  [/九型全谱轮廓/g, "九型完整轮廓"],
  [/Top\s*3/gi, "前三候选"],
  [/Top\s*2/gi, "第二候选"],
  [/Top\s*1/gi, "第一候选"],
  [/score space/gi, "计分空间"],
  [/forced[- ]choice/gi, "二选一迫选"],
  [/跨\s*form/gi, "跨题型"],
  [/当前\s*form/gi, "当前题型"],
  [/另一个\s*form/gi, "另一题型"],
  [/当前题型\s+的/g, "当前题型的"],
  [/的\s+计分空间/g, "的计分空间"],
];

const EN_REPLACEMENTS: ReadonlyArray<readonly [RegExp, string]> = [
  [/FC144\s+Deep Form/gi, "FC144 Two-option Forced-choice Form"],
  [/E105\s+Standard Form/gi, "E105 Five-point Likert Form"],
];

export function localizeEnneagramPresentationText(value: string, locale: Locale): string {
  const replacements = locale === "zh" ? ZH_REPLACEMENTS : EN_REPLACEMENTS;
  return replacements.reduce((text, [pattern, replacement]) => text.replace(pattern, replacement), value);
}

export function localizeEnneagramPresentationValue(value: unknown, locale: Locale): unknown {
  if (typeof value === "string") {
    return localizeEnneagramPresentationText(value, locale);
  }

  if (Array.isArray(value)) {
    return value.map((item) => localizeEnneagramPresentationValue(item, locale));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, localizeEnneagramPresentationValue(item, locale)])
    );
  }

  return value;
}
