"use client";

import { brandVisionCopy } from "@/lib/brand/visionCopy";
import { useState } from "react";
import { Link2, Linkedin } from "lucide-react";
import { siFacebook, siPinterest, siX } from "simple-icons";
import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";

const copy = {
  zh: {
    share: "分享文章",
    copyLink: "复制链接",
    copied: "链接已复制",
    copyFailed: "无法自动复制，请手动复制下方链接。",
    title: "关于费马测试",
  },
  en: {
    share: "Share this article",
    copyLink: "Copy link",
    copied: "Link copied",
    copyFailed: "Copy the link below manually.",
    title: "About FermatMind",
  },
  "zh-TW": {
    share: "分享文章",
    copyLink: "複製連結",
    copied: "連結已複製",
    copyFailed: "無法自動複製，請手動複製下方連結。",
    title: "關於費馬測試",
  },
} satisfies Record<DisplayLocale, Record<string, string>>;

export function ArticleClosing({ locale, url }: { locale: DisplayLocale; url: string }) {
  const text = copy[locale];
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const encodedUrl = encodeURIComponent(url);
  const destinations = [
    { name: "Facebook", icon: siFacebook.path, href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "X", icon: siX.path, href: `https://twitter.com/intent/tweet?url=${encodedUrl}` },
    { name: "Pinterest", icon: siPinterest.path, href: `https://www.pinterest.com/pin/create/button/?url=${encodedUrl}` },
    { name: "LinkedIn", icon: null, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
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
      <div role="group" aria-label={text.share} className="flex flex-wrap items-center gap-2">
        {destinations.map(({ name, href, icon }) => (
          <a key={name} href={href} aria-label={name} title={name} target="_blank" rel="noopener noreferrer"
            className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--fm-border)] text-[var(--fm-text)] transition-colors hover:bg-[var(--fm-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2">
            {icon ? <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" aria-hidden="true"><path d={icon} /></svg> : <Linkedin size={16} aria-hidden="true" />}
          </a>
        ))}
        <button type="button" onClick={copyLink} aria-label={text.copyLink} title={text.copyLink}
          className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--fm-border)] text-[var(--fm-text)] transition-colors hover:bg-[var(--fm-surface-muted)] focus-visible:outline-2 focus-visible:outline-offset-2">
          <Link2 size={18} aria-hidden="true" />
        </button>
        <span role="status" className="ml-2 text-sm text-[var(--fm-text-muted)]">
          {copyState === "copied" ? text.copied : copyState === "failed" ? text.copyFailed : null}
        </span>
      </div>
      {copyState === "failed" ? <input readOnly aria-label={text.copyLink} value={url} onFocus={(event) => event.currentTarget.select()} className="w-full rounded border border-[var(--fm-border)] p-2 text-sm" /> : null}
      <div className="space-y-2 rounded-r-lg border-l-4 border-[var(--fm-accent)] bg-[var(--fm-surface-muted)] px-5 py-4">
        <h2 className="m-0 text-lg font-semibold">
          <Link href={`/${locale}/about`} className="underline underline-offset-4">{text.title}</Link>
        </h2>
        <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{brandVisionCopy[locale].articleIntroduction}</p>
      </div>
    </footer>
  );
}
