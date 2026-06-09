const ALLOWED_TAGS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "del",
  "div",
  "dd",
  "dl",
  "dt",
  "em",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "section",
  "span",
  "strong",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const VOID_TAGS = new Set(["br", "hr", "img"]);
const DROP_CONTENT_TAGS = new Set([
  "applet",
  "audio",
  "base",
  "button",
  "canvas",
  "embed",
  "form",
  "iframe",
  "input",
  "link",
  "math",
  "meta",
  "noembed",
  "noframes",
  "noscript",
  "object",
  "option",
  "plaintext",
  "script",
  "select",
  "source",
  "style",
  "svg",
  "template",
  "textarea",
  "title",
  "track",
  "video",
  "xmp",
]);

const GLOBAL_ATTRIBUTES = new Set(["aria-describedby", "aria-label", "aria-labelledby", "class", "id", "lang", "title"]);
const TAG_ATTRIBUTES: Record<string, Set<string>> = {
  a: new Set(["href", "rel", "target", "title"]),
  blockquote: new Set(["cite"]),
  code: new Set(["data-language"]),
  img: new Set(["alt", "decoding", "height", "loading", "src", "title", "width"]),
  ol: new Set(["start", "type"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
};
const SAFE_URL_SCHEMES = new Set(["http", "https", "mailto", "tel"]);
const SAFE_TARGETS = new Set(["_blank", "_parent", "_self", "_top"]);
const SAFE_REL_TOKENS = new Set(["external", "nofollow", "noopener", "noreferrer", "ugc"]);
const CONTROL_CHARS_RE = /[\u0000-\u001F\u007F-\u009F]/g;

export type CmsHtmlSanitizeOptions = {
  minimumHeadingLevel?: 1 | 2 | 3 | 4 | 5 | 6;
};

function normalizeHeadingTag(tagName: string, options: CmsHtmlSanitizeOptions): string {
  const minimumHeadingLevel = options.minimumHeadingLevel ?? 1;
  if (!/^h[1-6]$/.test(tagName)) {
    return tagName;
  }

  const level = Number.parseInt(tagName.slice(1), 10);
  return `h${Math.max(level, minimumHeadingLevel)}`;
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(?:#(\d{1,7})|#x([0-9a-f]{1,6})|([a-z][a-z0-9]+));?/gi, (match, decimal, hex, named) => {
    if (decimal) {
      const codePoint = Number.parseInt(decimal, 10);
      return Number.isFinite(codePoint) ? safeCodePointToString(codePoint, match) : match;
    }

    if (hex) {
      const codePoint = Number.parseInt(hex, 16);
      return Number.isFinite(codePoint) ? safeCodePointToString(codePoint, match) : match;
    }

    switch (String(named).toLowerCase()) {
      case "amp":
        return "&";
      case "apos":
        return "'";
      case "colon":
        return ":";
      case "gt":
        return ">";
      case "lt":
        return "<";
      case "nbsp":
        return " ";
      case "quot":
        return "\"";
      default:
        return match;
    }
  });
}

function safeCodePointToString(codePoint: number, fallback: string): string {
  try {
    return String.fromCodePoint(codePoint);
  } catch {
    return fallback;
  }
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, "&quot;");
}

export function sanitizeCmsUrl(value: string): string | null {
  const decoded = decodeHtmlEntities(value).replace(CONTROL_CHARS_RE, "").trim();
  if (!decoded || /[<>]/.test(decoded)) {
    return null;
  }

  const compact = decoded.replace(/\s+/g, "").toLowerCase();
  if (compact.startsWith("//") || compact.startsWith("\\\\")) {
    return null;
  }

  const schemeMatch = compact.match(/^([a-z][a-z0-9+.-]*):/);
  if (schemeMatch && !SAFE_URL_SCHEMES.has(schemeMatch[1] ?? "")) {
    return null;
  }

  return decoded;
}

function isAllowedAttribute(tagName: string, attributeName: string): boolean {
  if (GLOBAL_ATTRIBUTES.has(attributeName) || attributeName.startsWith("aria-") || attributeName.startsWith("data-")) {
    return true;
  }

  return TAG_ATTRIBUTES[tagName]?.has(attributeName) ?? false;
}

function sanitizeId(value: string): string | null {
  const normalized = value.trim();
  return /^[A-Za-z][\w:.-]{0,127}$/.test(normalized) ? normalized : null;
}

function sanitizeNumberAttribute(value: string): string | null {
  const normalized = value.trim();
  return /^\d{1,4}$/.test(normalized) ? normalized : null;
}

function sanitizeRel(value: string, target: string | null): string {
  const tokens = value
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => SAFE_REL_TOKENS.has(token));

  if (target === "_blank") {
    tokens.push("noopener", "noreferrer");
  }

  return Array.from(new Set(tokens)).join(" ");
}

function sanitizeAttributeValue(tagName: string, attributeName: string, value: string, target: string | null): string | null {
  switch (attributeName) {
    case "cite":
    case "href":
    case "src":
      return sanitizeCmsUrl(value);
    case "height":
    case "rowspan":
    case "start":
    case "width":
      return sanitizeNumberAttribute(value);
    case "colspan":
      return sanitizeNumberAttribute(value);
    case "decoding": {
      const normalized = value.trim().toLowerCase();
      return ["async", "auto", "sync"].includes(normalized) ? normalized : null;
    }
    case "id":
      return sanitizeId(value);
    case "loading": {
      const normalized = value.trim().toLowerCase();
      return ["eager", "lazy"].includes(normalized) ? normalized : null;
    }
    case "rel": {
      const rel = sanitizeRel(value, target);
      return rel || null;
    }
    case "scope": {
      const normalized = value.trim().toLowerCase();
      return ["col", "colgroup", "row", "rowgroup"].includes(normalized) ? normalized : null;
    }
    case "target": {
      const normalized = value.trim().toLowerCase();
      return SAFE_TARGETS.has(normalized) ? normalized : null;
    }
    case "type": {
      const normalized = value.trim();
      if (tagName === "ol") {
        return /^[1AaIi]$/.test(normalized) ? normalized : null;
      }
      return null;
    }
    default:
      return value.replace(CONTROL_CHARS_RE, "").trim();
  }
}

function parseAttributes(rawAttributes: string): Array<{ name: string; value: string }> {
  const attributes: Array<{ name: string; value: string }> = [];
  const attributePattern = /([^\s"'<>/=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/g;
  let match: RegExpExecArray | null;

  while ((match = attributePattern.exec(rawAttributes)) !== null) {
    attributes.push({
      name: String(match[1] ?? ""),
      value: String(match[2] ?? match[3] ?? match[4] ?? ""),
    });
  }

  return attributes;
}

function sanitizeAttributes(tagName: string, rawAttributes: string): string {
  const attributes = parseAttributes(rawAttributes);
  const output: string[] = [];
  const seen = new Set<string>();
  let target: string | null = null;
  const relValues: string[] = [];

  for (const attribute of attributes) {
    const name = attribute.name.toLowerCase();
    if (!name || seen.has(name) || name.startsWith("on") || name === "style" || name === "srcdoc") {
      continue;
    }

    if (!isAllowedAttribute(tagName, name)) {
      continue;
    }

    if (name === "target") {
      target = sanitizeAttributeValue(tagName, name, attribute.value, null);
      if (target) {
        seen.add(name);
        output.push(`${name}="${escapeAttribute(target)}"`);
      }
      continue;
    }

    if (name === "rel") {
      relValues.push(attribute.value);
      continue;
    }

    const sanitized = sanitizeAttributeValue(tagName, name, attribute.value, target);
    if (sanitized === null || sanitized === "") {
      continue;
    }

    seen.add(name);
    output.push(`${name}="${escapeAttribute(sanitized)}"`);
  }

  if (tagName === "a") {
    const rel = sanitizeRel(relValues.join(" "), target);
    if (rel && !seen.has("rel")) {
      output.push(`rel="${escapeAttribute(rel)}"`);
    }
  }

  return output.length > 0 ? ` ${output.join(" ")}` : "";
}

function findTagEnd(input: string, start: number): number {
  let quote: "\"" | "'" | null = null;

  for (let index = start + 1; index < input.length; index += 1) {
    const char = input[index];

    if (quote) {
      if (char === quote) {
        quote = null;
      }
      continue;
    }

    if (char === "\"" || char === "'") {
      quote = char;
      continue;
    }

    if (char === ">") {
      return index;
    }
  }

  return -1;
}

function sanitizeTag(rawTag: string, dropStack: string[], options: CmsHtmlSanitizeOptions): string {
  if (/^<!--/.test(rawTag) || /^<!/i.test(rawTag)) {
    return "";
  }

  const tagMatch = rawTag.match(/^<\s*(\/?)\s*([A-Za-z][A-Za-z0-9:-]*)\b([\s\S]*?)\/?\s*>$/);
  if (!tagMatch) {
    return escapeText(rawTag);
  }

  const isClosing = Boolean(tagMatch[1]);
  const tagName = String(tagMatch[2] ?? "").toLowerCase();
  const rawAttributes = String(tagMatch[3] ?? "");

  if (dropStack.length > 0) {
    if (isClosing && tagName === dropStack[dropStack.length - 1]) {
      dropStack.pop();
    } else if (!isClosing && DROP_CONTENT_TAGS.has(tagName)) {
      dropStack.push(tagName);
    }
    return "";
  }

  if (DROP_CONTENT_TAGS.has(tagName)) {
    if (!isClosing) {
      dropStack.push(tagName);
    }
    return "";
  }

  if (!ALLOWED_TAGS.has(tagName)) {
    return "";
  }

  const outputTagName = normalizeHeadingTag(tagName, options);

  if (isClosing) {
    return VOID_TAGS.has(tagName) ? "" : `</${outputTagName}>`;
  }

  const attributes = sanitizeAttributes(tagName, rawAttributes);
  return `<${outputTagName}${attributes}>`;
}

export function sanitizeCmsHtml(html: string, options: CmsHtmlSanitizeOptions = {}): string {
  if (!html) {
    return "";
  }

  let output = "";
  let cursor = 0;
  const dropStack: string[] = [];

  while (cursor < html.length) {
    const tagStart = html.indexOf("<", cursor);
    if (tagStart === -1) {
      if (dropStack.length === 0) {
        output += html.slice(cursor);
      }
      break;
    }

    if (dropStack.length === 0) {
      output += html.slice(cursor, tagStart);
    }

    const tagEnd = findTagEnd(html, tagStart);
    if (tagEnd === -1) {
      if (dropStack.length === 0) {
        output += escapeText(html.slice(tagStart));
      }
      break;
    }

    output += sanitizeTag(html.slice(tagStart, tagEnd + 1), dropStack, options);
    cursor = tagEnd + 1;
  }

  return output;
}

export const sanitizeCmsRichText = sanitizeCmsHtml;
