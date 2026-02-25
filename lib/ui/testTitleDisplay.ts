export type UiTestTitleDisplay = {
  line1: string;
  line2: string;
  plain: string;
};

const CJK_CHAR_RE = /[\u3400-\u9fff]/;
const ASCII_ALNUM_RE = /[A-Za-z0-9]/;
const BRACKET_SPLIT_RE = /^(.*?)[\(\[（［【]\s*([^()\[\]（）［］【】]+?)\s*[\)\]）］】](.*)$/;

function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function shouldInsertSpace(left: string, right: string): boolean {
  const l = left.trim();
  const r = right.trim();
  if (!l || !r) return false;

  const leftLast = l[l.length - 1] ?? "";
  const rightFirst = r[0] ?? "";
  if (!leftLast || !rightFirst) return false;

  if (CJK_CHAR_RE.test(leftLast) || CJK_CHAR_RE.test(rightFirst)) return false;
  if (rightFirst === "】") return false;
  if (rightFirst === "【") return ASCII_ALNUM_RE.test(leftLast);
  return ASCII_ALNUM_RE.test(leftLast) && ASCII_ALNUM_RE.test(rightFirst);
}

function joinSegments(left: string, right: string): string {
  const l = left.trim();
  const r = right.trim();
  if (!l) return r;
  if (!r) return l;
  return shouldInsertSpace(l, r) ? `${l} ${r}` : `${l}${r}`;
}

function normalizeToDisplayBrackets(value: string): string {
  return normalizeWhitespace(value)
    .replace(/［/g, "[")
    .replace(/］/g, "]")
    .replace(/（/g, "(")
    .replace(/）/g, ")")
    .replace(/【/g, "[")
    .replace(/】/g, "]")
    .replace(/\[\s+/g, "[")
    .replace(/\s+\]/g, "]")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/[\(\[]/g, "【")
    .replace(/[\)\]]/g, "】")
    .replace(/\s*【\s*/g, "【")
    .replace(/\s*】\s*/g, "】")
    .replace(/([A-Za-z0-9])【/g, "$1 【")
    .replace(/([\u3400-\u9fff])\s+【/g, "$1【")
    .replace(/\s+/g, " ")
    .trim();
}

function splitWithoutBrackets(plain: string): { line1: string; line2: string } {
  const normalized = normalizeWhitespace(plain);
  const words = normalized.split(" ").filter(Boolean);
  if (words.length >= 2) {
    const bestIndex = Math.max(1, Math.ceil(words.length / 2));

    return {
      line1: words.slice(0, bestIndex).join(" "),
      line2: words.slice(bestIndex).join(" "),
    };
  }

  const chars = Array.from(normalized);
  if (chars.length <= 1) {
    return { line1: normalized, line2: normalized };
  }

  const pivot = Math.max(1, Math.floor(chars.length / 2));
  return {
    line1: chars.slice(0, pivot).join(""),
    line2: chars.slice(pivot).join(""),
  };
}

export function formatTestTitleForUi(title: string): UiTestTitleDisplay {
  const source = normalizeWhitespace(String(title ?? ""));
  const plain = normalizeToDisplayBrackets(source);
  if (!plain) return { line1: "", line2: "", plain: "" };

  const bracketMatch = source.match(BRACKET_SPLIT_RE);
  if (bracketMatch) {
    const line1 = normalizeWhitespace(bracketMatch[1] ?? "");
    const inner = normalizeWhitespace(bracketMatch[2] ?? "");
    const suffix = normalizeWhitespace(bracketMatch[3] ?? "");

    if (line1 && inner) {
      const line2 = joinSegments(`【${inner}】`, suffix);
      return { line1, line2, plain: joinSegments(line1, line2) };
    }
  }

  const fallback = splitWithoutBrackets(plain);
  const fallbackLine1 = normalizeWhitespace(fallback.line1);
  const fallbackLine2 = normalizeWhitespace(fallback.line2);
  if (fallbackLine1 && fallbackLine2) {
    return {
      line1: fallbackLine1,
      line2: fallbackLine2,
      plain: joinSegments(fallbackLine1, fallbackLine2),
    };
  }

  return { line1: plain, line2: plain, plain };
}
