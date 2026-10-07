import Link from "next/link";
import { articleByline } from "@/lib/content/articleByline";
import type { Locale } from "@/lib/i18n/locales";

export function ArticleByline({ authorName, locale }: { authorName?: string | null; locale: Locale }) {
  const byline = articleByline(authorName, locale);
  return byline.href ? <Link href={byline.href}>{byline.name}</Link> : <span>{byline.name}</span>;
}
