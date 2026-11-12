"use client";

import { useState } from "react";
import { Link2 } from "lucide-react";
import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";

const copy = {
  zh: {
    share: "分享文章",
    copyLink: "复制链接",
    copied: "链接已复制",
    copyFailed: "无法自动复制，请手动复制下方链接。",
    title: "关于费马测试",
    description: "费马测试提供人格、职业兴趣和能力测评。我们也写文章，帮助你理解测评结果，并把它们用到自我探索、职业选择和日常沟通中。",
  },
  en: {
    share: "Share this article",
    copyLink: "Copy link",
    copied: "Link copied",
    copyFailed: "Copy the link below manually.",
    title: "About FermatMind",
    description: "FermatMind offers personality, career interest, and ability assessments. Our articles help you understand your results and apply them to self-discovery, career choices, and everyday conversations.",
  },
  "zh-TW": {
    share: "分享文章",
    copyLink: "複製連結",
    copied: "連結已複製",
    copyFailed: "無法自動複製，請手動複製下方連結。",
    title: "關於費馬測試",
    description: "費馬測試提供人格、職涯興趣與能力測評。我們也撰寫文章，幫助你讀懂測評結果，並應用在自我探索、職涯選擇與日常溝通中。",
  },
} satisfies Record<DisplayLocale, Record<string, string>>;

export function ArticleClosing({ locale, url }: { locale: DisplayLocale; url: string }) {
  const text = copy[locale];
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const encodedUrl = encodeURIComponent(url);
  const destinations = [
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
  ];

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopyState("copied");
    } catch {
      setCopyState("failed");
    }
  }

  return (
    <footer data-testid="article-closing" className="min-w-0 space-y-5 border-t border-[var(--fm-border)] pt-5">
      <div className="flex flex-wrap items-center gap-x-5 text-sm">
        <span className="font-semibold">{text.share}</span>
        {destinations.map(({ name, href }) => (
          <a key={name} href={href} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-[var(--fm-accent)] underline underline-offset-4">
            {name}
          </a>
        ))}
        <button type="button" onClick={copyLink} className="inline-flex min-h-11 items-center gap-2 text-[var(--fm-accent)] underline underline-offset-4">
          <Link2 size={16} aria-hidden="true" />
          {text.copyLink}
        </button>
        <span role="status" className="text-[var(--fm-text-muted)]">
          {copyState === "copied" ? text.copied : copyState === "failed" ? text.copyFailed : null}
        </span>
      </div>
      {copyState === "failed" ? <input readOnly aria-label={text.copyLink} value={url} onFocus={(event) => event.currentTarget.select()} className="w-full rounded border border-[var(--fm-border)] p-2 text-sm" /> : null}
      <div className="space-y-2 rounded-r-lg border-l-4 border-[var(--fm-accent)] bg-[var(--fm-surface-muted)] px-5 py-4">
        <h2 className="m-0 text-lg font-semibold">
          <Link href={`/${locale}/about`} className="underline underline-offset-4">{text.title}</Link>
        </h2>
        <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{text.description}</p>
      </div>
    </footer>
  );
}
