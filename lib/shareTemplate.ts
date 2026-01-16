// fap-web/lib/shareTemplate.ts

export type Dict = Record<string, string | number>;

export function renderPlaceholders(input: string, data: Dict): string {
  return String(input || "").replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const v = (data as any)[key];
    return v === undefined || v === null ? "" : String(v);
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
export function buildSocialProofSchema(template: any, data: Dict): any | null {
  if (!template || typeof template !== "object") return null;

  // 先做“字符串层面”占位符渲染（覆盖深层字段）
  const renderedJson = renderPlaceholders(JSON.stringify(template), data);

  let obj: any;
  try {
    obj = JSON.parse(renderedJson);
  } catch {
    return null;
  }

  // InteractionCounter 正确字段：userInteractionCount（数字）
  if (obj && typeof obj === "object") {
    // 兼容两种写法：userInteractionCount / userInteractionCount（你如果写错了也能救回来）
    const key1 = "userInteractionCount";
    if (obj[key1] !== undefined) {
      obj[key1] = toSafeCount(obj[key1], 0);
    }
  }

  return obj;
}