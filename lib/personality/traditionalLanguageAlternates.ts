export type TraditionalPersonalityLanguageAlternates = Record<"en" | "zh-CN" | "zh-TW", string>;

export function normalizeTraditionalPersonalityLanguageAlternates(
  value: unknown,
  canonical: string | null | undefined,
): TraditionalPersonalityLanguageAlternates | undefined {
  if (!canonical || !value || typeof value !== "object") return undefined;
  const path = canonical.replace(/^https:\/\/fermatmind\.com(?=\/)/u, "");
  const suffix = /^\/(?:en|zh|zh-TW)(\/personality(?:\/[a-z0-9-]+)*)$/u.exec(path)?.[1];
  if (!suffix) return undefined;
  const expected = { en: "/en" + suffix, "zh-CN": "/zh" + suffix, "zh-TW": "/zh-TW" + suffix };
  const received = value as Record<string, unknown>;
  return Object.entries(expected).every(([locale, target]) => received[locale] === target) ? expected : undefined;
}
