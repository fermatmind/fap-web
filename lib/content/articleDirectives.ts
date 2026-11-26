const directiveNames = ["takeaways", "timeline", "verdict-grid", "script-compare", "checklist", "callout", "references", "methodology"] as const;
type BasicName = "takeaways" | "checklist" | "callout" | "references" | "methodology";
export type ArticleDirective =
  | { name: BasicName; title?: string; lines: string[] }
  | { name: "timeline" | "verdict-grid"; title?: string; entries: { tag?: string; tone?: "green" | "yellow" | "red"; title: string; body: string }[] }
  | { name: "script-compare"; title?: string; bad: string; good: string; badLabel?: string; goodLabel?: string };

const opener = /^:::(\S+?)(?:\s+title="([^"\n]+)")?\s*$/u;
const fence = /^:::/;
const itemPrefix = /^[-*+]\s+/u;

function fields(source: string, allowed: readonly string[]) {
  const tokens = Array.from(source.matchAll(new RegExp(`(?:^|\\s+)(${allowed.join("|")}):[ \\t]*`, "gu")));
  if (tokens[0]?.index !== 0) return null;
  const result: Record<string, string> = {};
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    const key = token[1];
    const value = source.slice(token.index + token[0].length, tokens[i + 1]?.index).trim();
    if (!value || result[key]) return null;
    result[key] = value;
  }
  return result;
}

export function parseArticleDirective(lines: string[], start: number): { value: ArticleDirective; next: number } | null {
  const match = opener.exec(lines[start]);
  const name = directiveNames.find((candidate) => candidate === match?.[1]);
  if (!name) return null;
  let end = start + 1;
  while (end < lines.length && !fence.test(lines[end].trim()) && !/^\s*```/u.test(lines[end])) end++;
  if (lines[end]?.trim() !== ":::") return null;
  const title = match?.[2];
  const source = lines.slice(start + 1, end).map((line) => line.trim()).filter(Boolean);
  if (!source.length) return null;
  const next = end + 1;
  if (name === "timeline" || name === "verdict-grid") {
    const marker = name === "timeline" ? "tag" : "tone";
    const entries: { tag?: string; tone?: "green" | "yellow" | "red"; title: string; body: string }[] = [];
    for (const line of source) {
      const entry = fields(line.replace(itemPrefix, ""), [marker, "title", "body"]);
      if (!entry?.title || !entry.body) return null;
      if (marker === "tag") {
        if (!entry.tag) return null;
        entries.push({ tag: entry.tag, title: entry.title, body: entry.body });
      } else {
        const tone = entry.tone;
        if (tone !== "green" && tone !== "yellow" && tone !== "red") return null;
        entries.push({ tone, title: entry.title, body: entry.body });
      }
    }
    return { value: { name, title, entries }, next };
  }
  if (name === "script-compare") {
    const entry = fields(source.join("\n"), ["bad_label", "bad", "good_label", "good"]);
    if (!entry?.bad || !entry.good) return null;
    return { value: { name, title, bad: entry.bad, good: entry.good, badLabel: entry.bad_label, goodLabel: entry.good_label }, next };
  }
  return { value: { name, title, lines: source.map((line) => line.replace(itemPrefix, "")) }, next };
}
