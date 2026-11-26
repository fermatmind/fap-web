"use client";

import { useEffect, useRef } from "react";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { articleEditorialCopy } from "./articleEditorialCopy";

export type ArticleHeading = { id: string; level: number; text: string };

export function ArticleReadingNavigation({ headings, locale }: { headings: ArticleHeading[]; locale: DisplayLocale }) {
  const nav = useRef<HTMLElement>(null);
  const progress = useRef<HTMLDivElement>(null);
  const sections = headings.filter(({ level }) => level === 2);
  const label = articleEditorialCopy[locale].toc;

  useEffect(() => {
    const body = document.querySelector("[data-testid='article-detail-content']");
    if (!body) return;
    const links = Array.from(nav.current?.querySelectorAll("a") ?? []);
    const targets = links.map((link) => document.getElementById(link.hash.slice(1)));
    let frame = 0;
    function update() {
      const box = body?.getBoundingClientRect();
      if (box && progress.current) {
        const ratio = Math.min(1, Math.max(0, -box.top / Math.max(1, box.height - window.innerHeight)));
        progress.current.style.transform = `scaleX(${ratio})`;
      }
      const current = targets.reduce<string | undefined>((active, el) => el && el.getBoundingClientRect().top < 125 ? el.id : active, undefined);
      links.forEach((link) => {
        if (link.hash.slice(1) === current) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }
    function schedule() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    }
    schedule();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [headings]);

  const items = sections.map((section) => <li key={section.id}><a href={`#${section.id}`}>{section.text}</a></li>);
  return <>
    <div className="fm-article-reading-progress" aria-hidden="true" ref={progress} />
    {sections.length > 1 ? <nav className="fm-article-reading-toc" data-testid="article-toc" aria-label={label} ref={nav}>
      <details><summary>{label}</summary><ol>{items}</ol></details>
      <div className="fm-article-desktop-toc"><strong>{label}</strong><ol>{items}</ol></div>
    </nav> : null}
  </>;
}
