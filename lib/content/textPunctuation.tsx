import type { ReactNode } from "react";

const CJK_PUNCTUATION_PATTERN = /([?？!！:：;；])/g;
const CJK_PUNCTUATION_TOKEN = /^[?？!！:：;；]$/;

export function renderCjkPunctuationText(text: string, keyPrefix: string): ReactNode[] {
  return text
    .split(CJK_PUNCTUATION_PATTERN)
    .filter((part) => part.length > 0)
    .map((part, index) => {
      const key = `${keyPrefix}-${index}`;
      if (CJK_PUNCTUATION_TOKEN.test(part)) {
        return (
          <span key={key} className="fm-cjk-punctuation">
            {part}
          </span>
        );
      }

      return <span key={key}>{part}</span>;
    });
}
