import type { ReactNode } from "react";
import { sanitizeCmsUrl } from "@/lib/cms/sanitizeCmsRichText";
import { renderCjkPunctuationText } from "@/lib/content/textPunctuation";

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

type MarkdownBlock =
  | { type: "heading"; level: HeadingLevel; text: string }
  | { type: "image"; alt: string; src: string; title?: string }
  | { type: "paragraph"; text: string }
  | { type: "footnotes"; items: FootnoteItem[] }
  | { type: "unordered-list"; items: string[] }
  | { type: "ordered-list"; items: string[] }
  | { type: "blockquote"; text: string }
  | { type: "table"; headers: string[]; rows: string[][] }
  | { type: "code"; code: string; language: string }
  | { type: "hr" };

type FootnoteItem = {
  label: string;
  text: string;
};

function normalizeLineBreaks(value: string): string {
  return value.replace(/\r\n?/g, "\n");
}

function normalizeText(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

function splitLooseListText(value: string): string[] {
  const lines = normalizeLineBreaks(value)
    .split("\n")
    .map((line) => line.replace(/^[\s>*-]+/, "").trim())
    .filter(Boolean);

  if (lines.length > 1) {
    return lines;
  }

  const single = normalizeText(value);
  if (!single) {
    return [];
  }

  const delimited = single
    .split(/\s*[;；•]\s*/g)
    .map((part) => part.trim())
    .filter(Boolean);

  return delimited.length > 1 ? delimited : [single];
}

function isBlankLine(line: string | undefined): boolean {
  return !line || !line.trim();
}

function isHeading(line: string): boolean {
  return /^(#{1,6})\s+/.test(line);
}

function isUnorderedListItem(line: string): boolean {
  return /^\s*[-*+]\s+/.test(line);
}

function isOrderedListItem(line: string): boolean {
  return /^\s*\d+\.\s+/.test(line);
}

function isBlockquote(line: string): boolean {
  return /^\s*>\s?/.test(line);
}

function isHr(line: string): boolean {
  return /^\s*([-*_])(?:\s*\1){2,}\s*$/.test(line);
}

function parseFootnoteDefinition(line: string): FootnoteItem | null {
  const footnote = line.match(/^\s*\[\^([0-9A-Za-z-]+)\]:\s*(.*?)\s*$/);
  if (!footnote) {
    return null;
  }

  return {
    label: footnote[1] ?? "",
    text: normalizeText(footnote[2] ?? ""),
  };
}

function isFootnoteDefinition(line: string): boolean {
  return parseFootnoteDefinition(line) !== null;
}

function parseImage(line: string): { alt: string; src: string; title?: string } | null {
  const image = line.trim().match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]+)")?\)$/);
  if (!image) {
    return null;
  }

  return {
    alt: normalizeText(image[1] ?? ""),
    src: image[2] ?? "",
    title: image[3] ? normalizeText(image[3]) : undefined,
  };
}

function splitTableRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

function isTableSeparator(line: string): boolean {
  const cells = splitTableRow(line);
  return cells.length > 1 && cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function isTableStart(line: string, nextLine: string | undefined): boolean {
  return line.includes("|") && Boolean(nextLine) && isTableSeparator(nextLine ?? "");
}

function tokenizeMarkdown(markdown: string): MarkdownBlock[] {
  const lines = normalizeLineBreaks(markdown).split("\n");
  const blocks: MarkdownBlock[] = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index] ?? "";

    if (isBlankLine(line)) {
      index += 1;
      continue;
    }

    const codeFence = line.match(/^\s*```([\w-]*)\s*$/);
    if (codeFence) {
      const language = codeFence[1]?.trim() ?? "";
      const codeLines: string[] = [];
      index += 1;

      while (index < lines.length && !/^\s*```\s*$/.test(lines[index] ?? "")) {
        codeLines.push(lines[index] ?? "");
        index += 1;
      }

      if (index < lines.length) {
        index += 1;
      }

      blocks.push({
        type: "code",
        code: codeLines.join("\n").trimEnd(),
        language,
      });
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      blocks.push({
        type: "heading",
        level: Math.min(heading[1].length, 6) as HeadingLevel,
        text: normalizeText(heading[2] ?? ""),
      });
      index += 1;
      continue;
    }

    if (isHr(line)) {
      blocks.push({ type: "hr" });
      index += 1;
      continue;
    }

    const footnote = parseFootnoteDefinition(line);
    if (footnote) {
      const items: FootnoteItem[] = [];

      while (index < lines.length) {
        const item = parseFootnoteDefinition(lines[index] ?? "");
        if (!item) {
          break;
        }

        items.push(item);
        index += 1;
      }

      blocks.push({ type: "footnotes", items });
      continue;
    }

    const image = parseImage(line);
    if (image) {
      blocks.push({ type: "image", ...image });
      index += 1;
      continue;
    }

    if (isTableStart(line, lines[index + 1])) {
      const headers = splitTableRow(line);
      const rows: string[][] = [];
      index += 2;

      while (index < lines.length && (lines[index] ?? "").includes("|") && !isBlankLine(lines[index])) {
        const row = splitTableRow(lines[index] ?? "");
        if (row.length > 1) {
          rows.push(row);
        }
        index += 1;
      }

      blocks.push({ type: "table", headers, rows });
      continue;
    }

    if (isUnorderedListItem(line)) {
      const items: string[] = [];

      while (index < lines.length && isUnorderedListItem(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*[-*+]\s+/, "").trim());
        index += 1;
      }

      blocks.push({ type: "unordered-list", items });
      continue;
    }

    if (isOrderedListItem(line)) {
      const items: string[] = [];

      while (index < lines.length && isOrderedListItem(lines[index] ?? "")) {
        items.push((lines[index] ?? "").replace(/^\s*\d+\.\s+/, "").trim());
        index += 1;
      }

      blocks.push({ type: "ordered-list", items });
      continue;
    }

    if (isBlockquote(line)) {
      const quoteLines: string[] = [];

      while (index < lines.length && isBlockquote(lines[index] ?? "")) {
        quoteLines.push((lines[index] ?? "").replace(/^\s*>\s?/, ""));
        index += 1;
      }

      blocks.push({
        type: "blockquote",
        text: quoteLines.join("\n").trim(),
      });
      continue;
    }

    const paragraphLines: string[] = [];

    while (index < lines.length) {
      const current = lines[index] ?? "";
      if (
        isBlankLine(current) ||
        isHeading(current) ||
        isUnorderedListItem(current) ||
        isOrderedListItem(current) ||
        isBlockquote(current) ||
        parseImage(current) ||
        isHr(current) ||
        isFootnoteDefinition(current) ||
        isTableStart(current, lines[index + 1]) ||
        /^\s*```/.test(current)
      ) {
        break;
      }

      paragraphLines.push(current.trim());
      index += 1;
    }

    const text = paragraphLines.join(" ").trim();
    if (text) {
      blocks.push({ type: "paragraph", text });
    }
  }

  return blocks;
}

function renderInlineMarkdown(text: string, keyPrefix: string): ReactNode[] {
  const normalized = text.replace(/\n/g, "  ");
  const pattern = /(\[[^\]]+\]\([^)]+\)|\[\^[0-9A-Za-z-]+\]|`[^`]+`|\*\*[^*]+\*\*|__[^_]+__|(?<!\w)\*[^*\n]+\*(?!\w)|(?<!\w)_[^_\n]+_(?!\w))/g;
  const parts = normalized.split(pattern).filter((part) => part.length > 0);

  return parts.map((part, index) => {
    const key = `${keyPrefix}-${index}`;
    const footnote = part.match(/^\[\^([0-9A-Za-z-]+)\]$/);
    if (footnote) {
      return (
        <sup key={key} className="font-sans text-[0.78em] font-semibold text-[var(--fm-accent)]">
          【{footnote[1]}】
        </sup>
      );
    }

    const link = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (link) {
      const href = sanitizeCmsUrl(link[2] ?? "");
      if (!href) {
        return <span key={key}>{renderCjkPunctuationText(link[1] ?? "", `${key}-text`)}</span>;
      }

      return (
        <a key={key} href={href} className="text-[var(--fm-accent)] underline-offset-2 hover:underline">
          {renderCjkPunctuationText(link[1] ?? "", `${key}-text`)}
        </a>
      );
    }

    const code = part.match(/^`([^`]+)`$/);
    if (code) {
      return (
        <code key={key} className="rounded bg-[var(--fm-surface-muted)] px-1 py-0.5 text-[0.9em]">
          {code[1]}
        </code>
      );
    }

    const strong = part.match(/^(?:\*\*|__)(.*?)(?:\*\*|__)$/);
    if (strong) {
      return <strong key={key}>{renderCjkPunctuationText(strong[1] ?? "", `${key}-text`)}</strong>;
    }

    const emphasis = part.match(/^(?:\*|_)(.*?)(?:\*|_)$/);
    if (emphasis) {
      return <em key={key}>{renderCjkPunctuationText(emphasis[1] ?? "", `${key}-text`)}</em>;
    }

    return <span key={key}>{renderCjkPunctuationText(part, `${key}-text`)}</span>;
  });
}

function renderHeading(level: HeadingLevel, text: string, key: string) {
  const content = renderInlineMarkdown(text, `${key}-inline`);
  const classNameByLevel: Record<HeadingLevel, string> = {
    1: "mt-0 font-serif text-3xl font-semibold text-[var(--fm-text)]",
    2: "mt-8 font-serif text-2xl font-semibold text-[var(--fm-text)]",
    3: "mt-6 text-xl font-semibold text-[var(--fm-text)]",
    4: "mt-5 text-lg font-semibold text-[var(--fm-text)]",
    5: "mt-4 text-base font-semibold text-[var(--fm-text)]",
    6: "mt-4 text-sm font-semibold uppercase tracking-[0.08em] text-[var(--fm-text)]",
  };

  switch (level) {
    case 1:
      return <h1 key={key} className={classNameByLevel[level]}>{content}</h1>;
    case 2:
      return <h2 key={key} className={classNameByLevel[level]}>{content}</h2>;
    case 3:
      return <h3 key={key} className={classNameByLevel[level]}>{content}</h3>;
    case 4:
      return <h4 key={key} className={classNameByLevel[level]}>{content}</h4>;
    case 5:
      return <h5 key={key} className={classNameByLevel[level]}>{content}</h5>;
    default:
      return <h6 key={key} className={classNameByLevel[level]}>{content}</h6>;
  }
}

export function renderSimpleMarkdown(markdown: string): ReactNode {
  const normalized = normalizeLineBreaks(markdown).trim();
  if (!normalized) {
    return null;
  }

  const blocks = tokenizeMarkdown(normalized);
  if (blocks.length === 0) {
    return null;
  }

  return blocks.map((block, index) => {
    const key = `markdown-block-${index}`;

    switch (block.type) {
      case "heading":
        return renderHeading(block.level, block.text, key);
      case "paragraph":
        return (
          <p key={key} className="m-0 leading-7 text-[var(--fm-text-muted)]">
            {renderInlineMarkdown(block.text, `${key}-inline`)}
          </p>
        );
      case "image": {
        const src = sanitizeCmsUrl(block.src);
        if (!src) {
          return null;
        }

        return (
          <figure key={key} className="m-0 overflow-hidden rounded-lg border border-[var(--fm-border)] bg-[var(--fm-surface-muted)]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={block.alt} title={block.title} loading="lazy" className="block aspect-[16/9] w-full object-cover" />
            {block.title ? (
              <figcaption className="border-t border-[var(--fm-border)] px-4 py-2 text-sm text-[var(--fm-text-muted)]">
                {block.title}
              </figcaption>
            ) : null}
          </figure>
        );
      }
      case "unordered-list":
        return (
          <ul key={key} className="m-0 list-disc space-y-2 pl-5 text-[var(--fm-text-muted)]">
            {block.items.map((item, itemIndex) => (
              <li key={`${key}-item-${itemIndex}`}>{renderInlineMarkdown(item, `${key}-item-${itemIndex}`)}</li>
            ))}
          </ul>
        );
      case "ordered-list":
        return (
          <ol key={key} className="m-0 list-decimal space-y-2 pl-5 text-[var(--fm-text-muted)]">
            {block.items.map((item, itemIndex) => (
              <li key={`${key}-item-${itemIndex}`}>{renderInlineMarkdown(item, `${key}-item-${itemIndex}`)}</li>
            ))}
          </ol>
        );
      case "footnotes":
        return (
          <ol key={key} className="m-0 list-decimal space-y-2 pl-5 text-sm leading-7 text-[var(--fm-text-muted)]">
            {block.items.map((item, itemIndex) => {
              const numericLabel = Number.parseInt(item.label, 10);
              const value = String(numericLabel) === item.label ? numericLabel : undefined;

              return (
                <li key={`${key}-footnote-${item.label || itemIndex}`} value={value}>
                  {renderInlineMarkdown(item.text, `${key}-footnote-${itemIndex}`)}
                </li>
              );
            })}
          </ol>
        );
      case "blockquote":
        return (
          <blockquote
            key={key}
            className="m-0 rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] px-4 py-3 italic text-[var(--fm-text-muted)]"
          >
            {splitLooseListText(block.text).map((item, itemIndex) => (
              <p key={`${key}-quote-${itemIndex}`} className={itemIndex === 0 ? "m-0" : "mt-2"}>
                {renderInlineMarkdown(item, `${key}-quote-${itemIndex}`)}
              </p>
            ))}
          </blockquote>
        );
      case "table":
        return (
          <div key={key} className="overflow-x-auto rounded-xl border border-[var(--fm-border)]">
            <table className="w-full border-collapse text-left text-sm">
              <thead className="bg-[var(--fm-surface-muted)] text-[var(--fm-text)]">
                <tr>
                  {block.headers.map((header, headerIndex) => (
                    <th key={`${key}-head-${headerIndex}`} className="border-b border-[var(--fm-border)] px-3 py-2 font-semibold">
                      {renderInlineMarkdown(header, `${key}-head-${headerIndex}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={`${key}-row-${rowIndex}`} className="border-t border-[var(--fm-border)]">
                    {block.headers.map((_, cellIndex) => (
                      <td key={`${key}-row-${rowIndex}-cell-${cellIndex}`} className="px-3 py-2 align-top text-[var(--fm-text-muted)]">
                        {renderInlineMarkdown(row[cellIndex] ?? "", `${key}-row-${rowIndex}-cell-${cellIndex}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case "code":
        return (
          <pre
            key={key}
            data-language={block.language || undefined}
            className="m-0 overflow-x-auto rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 text-sm text-[var(--fm-text)]"
          >
            <code>{block.code}</code>
          </pre>
        );
      case "hr":
        return <hr key={key} className="border-[var(--fm-border)]" />;
      default:
        return null;
    }
  });
}
