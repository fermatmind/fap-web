import { articleFeedPath } from "@/lib/cms/articleFeed";
import type { Locale } from "@/lib/i18n/locales";

export function BlogFeedLink({ locale }: { locale: Locale }) {
  return <p className="m-0 text-sm leading-6 text-[var(--fm-text-muted)]" data-testid="blog-feed-discovery">
    <a href={articleFeedPath(locale)} type="application/atom+xml" className="text-[var(--fm-accent)] underline underline-offset-4">
      {locale === "zh" ? "订阅中文博客（Atom）" : "Subscribe to the English blog (Atom)"}
    </a>{" · "}{locale === "zh"
      ? "将链接添加到支持 Atom 的 RSS 阅读器，接收最新公开文章和实质更新。"
      : "Add this link to an RSS reader that supports Atom for newly published articles and substantive updates."}
  </p>;
}
