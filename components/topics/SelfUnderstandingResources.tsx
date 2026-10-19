import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { getSelfUnderstandingResources } from "@/lib/navigation/selfUnderstandingResources";

const linkFocus = "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--fm-focus)] focus-visible:ring-offset-4";

export function SelfUnderstandingResources({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const resources = getSelfUnderstandingResources(locale);
  const questions = zh ? ["了解概念", "读懂结果", "实际应用"] : ["The concept", "Your result", "In practice"];

  return (
    <>
      <section aria-labelledby="self-understanding-title" className="pb-8 pt-6 md:pb-10 md:pt-8">
        <h1 id="self-understanding-title" className="mb-3 mt-3 font-serif text-3xl font-semibold tracking-tight text-[var(--fm-text-main)] md:text-4xl">{zh ? "认识自己，从好问题开始。" : "Understand yourself. Start with a good question."}</h1>
        <p className="m-0 max-w-3xl text-sm leading-7 text-[var(--fm-text-muted)] md:text-base">{zh ? "了解概念，读懂结果，找到适合自己的实践。" : "Understand the concepts, read your results, and find practical next steps."}</p>
      </section>
      <div id="explore-directions" aria-label={zh ? "六个自我探索方向" : "Six directions for self-exploration"} className="grid scroll-mt-24 gap-x-10 md:grid-cols-2 lg:gap-x-14">
        {resources.map((item, index) => (
          <section key={item.id} id={item.id} aria-labelledby={`${item.id}-title`} className="min-w-0 scroll-mt-24 border-t border-[var(--fm-border-subtle)] py-6">
            <div className="flex items-baseline gap-3">
              <span className="font-mono text-xs text-[var(--fm-text-muted)]">0{index + 1}</span>
              <h2 id={`${item.id}-title`} className="m-0 font-serif text-xl font-semibold text-[var(--fm-text-main)] md:text-2xl">{item.title}</h2>
            </div>
            <ol className="m-0 mt-3 list-none p-0">
              {item.paths.map((path, step) => (
                <li key={step}>
                  <Link href={localizedPath(path.href, locale)} prefetch={false} className={`group flex min-h-11 items-center gap-3 rounded-sm py-2 text-sm text-[var(--fm-text-main)] transition-colors hover:text-[#526223] ${linkFocus}`}>
                    <span className="w-16 shrink-0 text-xs text-[var(--fm-text-muted)]">{questions[step]}</span>
                    <span className="font-semibold underline decoration-[var(--fm-border-subtle)] underline-offset-4 group-hover:decoration-current">{path.label}</span>
                    <ArrowUpRight aria-hidden="true" className="ml-auto h-4 w-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 motion-reduce:transform-none" />
                  </Link>
                </li>
              ))}
            </ol>
            <Link href={localizedPath(item.testHref, locale)} prefetch={false} className={`mt-1 inline-flex min-h-11 items-center gap-2 rounded-sm text-xs font-semibold text-[var(--fm-text-muted)] hover:text-[var(--fm-text-main)] hover:underline ${linkFocus}`}>
              {zh ? "想了解自己的结果？查看测评" : "Explore your own result: view assessment"}<ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </Link>
          </section>
        ))}
      </div>
    </>
  );
}
