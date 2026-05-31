"use client";

import Link from "next/link";
import { useState } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { TestFamilyItem } from "@/lib/marketing/testsHubContent";
import { cn } from "@/lib/utils";
import { HubTestCard } from "@/components/marketing/tests/TestsShared";

export function TestsFamilyExplorer({
  families,
  locale,
}: {
  families: TestFamilyItem[];
  locale: Locale;
}) {
  const [activeId, setActiveId] = useState(families[0]?.id ?? "");
  const activeFamily = families.find((family) => family.id === activeId) ?? families[0];

  if (!activeFamily) {
    return null;
  }

  return (
    <div className="mt-10 grid gap-6 xl:grid-cols-[19rem_minmax(0,1fr)] xl:items-start">
      <div className="overflow-x-auto pb-1 xl:overflow-visible">
        <div
          className="flex min-w-max gap-2 xl:min-w-0 xl:flex-col"
          role="tablist"
          aria-label={locale === "zh" ? "测评家族" : "Test families"}
        >
          {families.map((family) => {
            const isActive = family.id === activeFamily.id;

            return (
              <button
                key={family.id}
                id={`family-tab-${family.id}`}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-controls={`family-panel-${family.id}`}
                tabIndex={0}
                onClick={() => setActiveId(family.id)}
                className={cn(
                  "min-h-[52px] rounded-full border px-4 py-3 text-left text-sm font-medium transition xl:rounded-[1.35rem] xl:px-5 xl:py-4",
                  isActive
                    ? "border-slate-900 bg-slate-950 text-white shadow-[0_20px_50px_rgba(15,23,42,0.16)]"
                    : "border-slate-200 bg-white/75 text-slate-600 hover:border-slate-300 hover:text-slate-950"
                )}
              >
                <span className="block whitespace-nowrap xl:whitespace-normal">{family.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <section
        id={`family-panel-${activeFamily.id}`}
        role="tabpanel"
        aria-labelledby={`family-tab-${activeFamily.id}`}
        className="rounded-[2rem] border border-slate-200/80 bg-white/86 p-5 shadow-[0_24px_80px_rgba(15,23,42,0.08)] md:p-6"
      >
        <div className="flex flex-col gap-4 border-b border-slate-200/80 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-[42rem] space-y-2">
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
              {locale === "zh" ? "当前家族" : "Current family"}
            </p>
            <h3 id={activeFamily.id} className="m-0 text-[1.55rem] font-semibold tracking-[-0.035em] text-slate-950">
              {activeFamily.title}
            </h3>
            <p className="m-0 text-sm leading-7 text-slate-600">{activeFamily.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {activeFamily.representativeLabels.map((label) => (
              <span key={`${activeFamily.id}-${label}`} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-500">
                {label}
              </span>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4">
          {activeFamily.tests.map((item) => (
            <HubTestCard key={`${activeFamily.id}-${item.key}`} item={item} locale={locale} />
          ))}
        </div>

        <div className="mt-6">
          <Link href={activeFamily.exploreHref} prefetch={false} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-[var(--fm-cta-orange)]">
            {activeFamily.exploreLabel}
            <span aria-hidden>+</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
