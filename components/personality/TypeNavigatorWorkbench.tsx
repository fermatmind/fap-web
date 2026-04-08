"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { rankPersonalityWorkbenchCards } from "@/lib/mbti/personalityWorkbench";
import type { PersonalityHubFamilyGroup, TypeWorkbenchPayload, TypeWorkbenchSortKey } from "@/lib/mbti/personalityHub.types";

export function TypeNavigatorWorkbench({
  locale,
  payload,
  familyGroups,
}: {
  locale: "en" | "zh";
  payload: TypeWorkbenchPayload;
  familyGroups: PersonalityHubFamilyGroup[];
}) {
  const [activeSort, setActiveSort] = useState<TypeWorkbenchSortKey>("all");
  const [showAllMobile, setShowAllMobile] = useState(false);
  const cards = useMemo(
    () => rankPersonalityWorkbenchCards(payload.cards, activeSort),
    [payload.cards, activeSort]
  );

  return (
    <section className="space-y-5">
      <section
        id="mbti-family-groups"
        className="space-y-4 rounded-3xl border border-[var(--fm-border)] bg-[var(--fm-hub-panel-bg)] p-6 shadow-[var(--fm-shadow-md)]"
        data-testid="mbti-personality-family-grid"
      >
        <div className="space-y-2">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-[var(--fm-hub-navy)]">
            {locale === "zh" ? "类型工作台" : "Type Navigator Workbench"}
          </p>
          <h2 className="m-0 font-serif text-[length:var(--fm-hub-heading-section)] text-[var(--fm-hub-navy-strong)]">
            {locale === "zh" ? "按优先判断逻辑重排 16 型" : "Re-rank all 16 types by decision priority"}
          </h2>
          <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "这一层优先做重排和高亮，不隐藏 inventory。你可以先按稳定副白名单、family 或 I/E 线索把更相关的类型排到前面。"
              : "This layer re-ranks and highlights instead of hiding inventory. Start by moving stable launch types, family clusters, or I/E signals to the front."}
          </p>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-1">
          {payload.sortOptions.map((option) => (
            <button
              key={option.key}
              type="button"
              onClick={() => setActiveSort(option.key)}
              data-active={activeSort === option.key ? "true" : "false"}
              className={
                activeSort === option.key
                  ? "rounded-full border border-[var(--fm-hub-navy)] bg-[var(--fm-hub-navy)] px-3 py-2 text-xs font-semibold text-white"
                  : "rounded-full border border-[var(--fm-border)] bg-[var(--fm-surface)] px-3 py-2 text-xs font-semibold text-[var(--fm-text)]"
              }
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 md:hidden" data-testid="personality-workbench-family-summary-mobile">
          {familyGroups.map((family) => (
            <span
              key={family.groupKey}
              className="rounded-full border border-[var(--fm-border)] bg-[var(--fm-hub-panel-muted-bg)] px-3 py-2 text-xs font-semibold text-[var(--fm-text)]"
            >
              {family.groupKey} · {family.title}
            </span>
          ))}
        </div>

        <div className="hidden gap-3 md:grid md:grid-cols-2 xl:grid-cols-4">
          {familyGroups.map((family) => (
            <article
              key={family.groupKey}
              id={family.groupKey.toLowerCase()}
              className="rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-hub-panel-muted-bg)] p-4"
            >
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-hub-decision-green)]">
                {family.groupKey}
              </p>
              <h3 className="mb-0 mt-2 font-serif text-lg text-[var(--fm-text)]">{family.title}</h3>
              <p className="mb-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{family.summary}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {family.cards.map((item) => (
                  <span
                    key={`${family.groupKey}-${item.typeCode}`}
                    className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-xs font-semibold text-[var(--fm-text)]"
                  >
                    {item.typeCode}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="space-y-3" data-testid="mbti-personality-directory-grid">
        <div className="space-y-1">
          <h2 className="m-0 font-serif text-xl text-[var(--fm-text)]">
            {locale === "zh" ? "全部人格页（动态重排）" : "All profile routes (dynamic reorder)"}
          </h2>
          <p className="m-0 text-sm text-[var(--fm-text-muted)]">
            {locale === "zh"
              ? "全部 16 型继续完整可见；当前交互只改变顺序和高亮，不隐藏链接。"
              : "All 16 types stay visible; the interaction changes order and emphasis, not link availability."}
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((personality, index) => (
            <article
              key={personality.typeCode}
              className={`space-y-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-4 shadow-[var(--fm-shadow-sm)] sm:p-5 ${!showAllMobile && index >= 6 ? "hidden md:block" : ""}`}
            >
              <div className="space-y-2">
                <h3 className="m-0 font-serif text-lg text-[var(--fm-text)]">
                  {personality.typeCode} · {personality.title}
                </h3>
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
                  {personality.groupKey} · {personality.groupTitle}
                </p>
                <p className="m-0 text-sm leading-7 text-[var(--fm-text-muted)]">{personality.excerpt}</p>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-[11px] font-semibold text-[var(--fm-text)]">
                  {locale === "zh" ? "层级" : "Tier"} · {personality.launchTier}
                </span>
                {personality.derivedTraitLabels.map((trait) => (
                  <span
                    key={`${personality.typeCode}-${trait}`}
                    className="rounded-full border border-[var(--fm-border)] px-3 py-1 text-[11px] font-semibold text-[var(--fm-text)]"
                  >
                    {trait}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={personality.href}
                  className={buttonVariants({ size: "sm" })}
                >
                  {locale === "zh" ? "查看人格页" : "View profile"}
                </Link>
                <Link
                  href={personality.recommendationHref}
                  className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                  {locale === "zh" ? "职业建议" : "Career guidance"}
                </Link>
              </div>
            </article>
          ))}
        </div>
        {cards.length > 6 ? (
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setShowAllMobile((value) => !value)}
              className="w-full rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] px-4 py-3 text-sm font-semibold text-[var(--fm-accent)]"
              data-testid="personality-workbench-show-all"
            >
              {showAllMobile
                ? locale === "zh"
                  ? "收起部分类型"
                  : "Show fewer types"
                : locale === "zh"
                  ? "展开全部 16 型"
                  : "Show all 16 types"}
            </button>
          </div>
        ) : null}
      </section>
    </section>
  );
}
