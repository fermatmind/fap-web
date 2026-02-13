// fap-web/lib/shareTemplate.ts

export type Dict = Record<string, string | number>;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function renderPlaceholders(input: string, data: Dict): string {
  return String(input || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const value = data[key];
    return value === undefined || value === null ? "" : String(value);
  });
}

/**
 * 把可能是 "100000" / 100000 / "10w+" / "10万+" 之类的 count 强转成 number
 * - 只取数字部分： "10w+" -> 10  (如果你希望 10w=100000，可再扩展)
 */
export function toSafeCount(v: unknown, fallback = 0): number {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const s = v.trim();
    const m = s.match(/\d+/g);
    if (!m) return fallback;
    const n = parseInt(m.join(""), 10);
    return Number.isFinite(n) ? n : fallback;
  }
  return fallback;
}

/**
 * 渲染 social_proof_schema，并强制把 userInteractionCount 转 number。
 * - template 可包含 "{{count}}" 等占位符
 * - 返回 object（可直接 JSON.stringify 注入）
 */
export function buildSocialProofSchema(
  template: unknown,
  data: Dict
): Record<string, unknown> | null {
  if (!isObjectRecord(template)) return null;

  // 先做“字符串层面”占位符渲染（覆盖深层字段）
  const renderedJson = renderPlaceholders(JSON.stringify(template), data);

  let parsed: unknown;
  try {
    parsed = JSON.parse(renderedJson);
  } catch {
    return null;
  }

  if (!isObjectRecord(parsed)) {
    return null;
  }

  // InteractionCounter 正确字段：userInteractionCount（数字）
  const key = "userInteractionCount";
  if (parsed[key] !== undefined) {
    parsed[key] = toSafeCount(parsed[key], 0);
  }

  return parsed;
}
