"use client";

import { useEffect, useState } from "react";
import visual from "@/components/career/display/CareerProductionVisual.module.css";

type TocItem = { id: string; label: string };

export function CareerStickyToc({ items, label }: { items: TocItem[]; label: string }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");

  useEffect(() => {
    const sections = items.map((item) => document.getElementById(`career-visual-group-${item.id}`)).filter(Boolean) as HTMLElement[];
    if (sections.length === 0 || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver((entries) => {
      const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
      if (visible?.target.id) setActiveId(visible.target.id.replace("career-visual-group-", ""));
    }, { rootMargin: "-18% 0px -68%", threshold: [0, 0.05] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [items]);

  return (
    <details className={`rounded-2xl border border-[#E5E9F2] bg-white ${visual.toc}`}>
      <summary className="cursor-pointer text-xs font-bold uppercase tracking-wide text-[#5B6678] lg:pointer-events-none lg:list-none">{label}</summary>
      <nav className="mt-3 grid" aria-label={label}>
        {items.map((item) => <a key={item.id} href={`#career-visual-group-${item.id}`} aria-current={activeId === item.id ? "location" : undefined} className={`border-b border-[#F0F3FA] text-[#3a4255] last:border-0 hover:text-[#2C3E8C] hover:no-underline ${visual.tocLink} ${activeId === item.id ? visual.tocLinkActive : ""}`}>{item.label}</a>)}
      </nav>
    </details>
  );
}
