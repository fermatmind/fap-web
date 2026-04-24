"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { searchPersonalityQuickLocate, type PersonalityQuickLocateIndex } from "@/lib/mbti/personalityQuickLocate";

type QuickLocateItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  secondaryHref?: string;
  secondaryLabel?: string;
  kind: "type" | "career";
};

function flattenResults(index: PersonalityQuickLocateIndex, query: string): QuickLocateItem[] {
  const result = searchPersonalityQuickLocate(index, query);
  return [
    ...result.typeResults.map((item) => ({
      id: `type-${item.typeCode}`,
      label: `${item.typeCode} · ${item.title}`,
      description: item.excerpt,
      href: item.href,
      secondaryHref: item.recommendationHref,
      secondaryLabel: "Career recommendation",
      kind: "type" as const,
    })),
    ...result.careerResults.map((item) => ({
      id: `career-${item.slug}`,
      label: item.title,
      description: item.summary,
      href: item.href,
      kind: "career" as const,
    })),
  ].slice(0, 8);
}

export function PersonalityQuickLocateBar({
  locale,
  index,
  fallbackHref,
}: {
  locale: "en" | "zh";
  index: PersonalityQuickLocateIndex;
  fallbackHref: string;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const results = useMemo(() => flattenResults(index, query), [index, query]);
  const hasQuery = query.trim().length > 0;

  return (
    <div
      id="personality-quick-locate"
      className="scroll-mt-24 space-y-2 sm:scroll-mt-28 sm:space-y-3"
      data-testid="personality-quick-locate-bar"
    >
      <label className="block text-sm font-medium text-[var(--fm-text)]" htmlFor="personality-quick-locate-input">
        {locale === "zh" ? "快速定位人格代码或职业名" : "Quick locate a type code or career title"}
      </label>
      <div className="rounded-2xl border border-[var(--fm-border)] bg-white p-3 shadow-[var(--fm-shadow-sm)]">
        <input
          id="personality-quick-locate-input"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((value) => Math.min(value + 1, Math.max(results.length - 1, 0)));
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((value) => Math.max(value - 1, 0));
            }
            if (event.key === "Enter" && results[activeIndex]) {
              window.location.href = results[activeIndex].href;
            }
          }}
          placeholder={locale === "zh" ? "例如 INTJ、建筑师、产品经理" : "Try INTJ, Architect, or Product Manager"}
          className="w-full border-0 bg-transparent text-base text-[var(--fm-text)] outline-none"
          data-testid="personality-quick-locate-input"
        />
      </div>
      {hasQuery ? (
        results.length > 0 ? (
          <div className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-2 shadow-[var(--fm-shadow-sm)]" data-testid="personality-quick-locate-results">
            {results.map((item, indexPosition) => (
              <div
                key={item.id}
                className={`rounded-xl px-3 py-3 ${indexPosition === activeIndex ? "bg-[var(--fm-hub-panel-muted-bg)]" : "bg-transparent"}`}
                data-testid={`personality-quick-locate-result-${item.id}`}
              >
                <Link href={item.href} className="block font-medium text-[var(--fm-hub-navy)]">
                  {item.label}
                </Link>
                <p className="m-0 mt-1 text-sm text-[var(--fm-text-muted)]">{item.description}</p>
                {item.secondaryHref ? (
                  <Link href={item.secondaryHref} className="mt-2 inline-flex text-xs font-semibold text-[var(--fm-accent)]">
                    {locale === "zh" ? "查看职业推荐" : item.secondaryLabel}
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-[var(--fm-border)] bg-[var(--fm-hub-panel-muted-bg)] p-4" data-testid="personality-quick-locate-empty">
            <p className="m-0 text-sm text-[var(--fm-text-muted)]">
              {locale === "zh" ? "没有直接匹配。先从 MBTI 测试入口开始，再回到人格目录缩小范围。" : "No direct match yet. Start from the MBTI test landing, then return here to narrow the list."}
            </p>
            <Link href={fallbackHref} className="mt-3 inline-flex text-sm font-semibold text-[var(--fm-accent)]">
              {locale === "zh" ? "进入 MBTI 测试入口" : "Open the MBTI test landing"}
            </Link>
          </div>
        )
      ) : null}
    </div>
  );
}
