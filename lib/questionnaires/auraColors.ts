import type { DisplayLocale } from "@/lib/i18n/locales";

// Original FermatMind palette used by the on-page artwork and public share cards.
export const auraColors: Readonly<Record<string, string>> = {
  red: "#b82142", orange: "#d76a25", yellow: "#e9ad28", green: "#218b64",
  blue: "#2f6bcc", indigo: "#4d46a9", violet: "#a347ba",
};

export function auraShareCardPath(locale: DisplayLocale, color: string, version: string) {
  const query = new URLSearchParams({ locale, portrait: color, v: `${version}-art` });
  return `/og/fun/aura-color?${query}`;
}
