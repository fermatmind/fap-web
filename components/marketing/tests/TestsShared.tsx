import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import type {
  HubQuestionItem,
  HubTestCardItem,
  ResourceItem,
  TrustItem,
} from "@/lib/marketing/testsHubContent";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  body,
  invert = false,
}: {
  eyebrow: string;
  title: string;
  body: string;
  invert?: boolean;
}) {
  return (
    <div className="max-w-[46rem] space-y-4">
      <p className={cn("m-0 text-xs font-semibold uppercase tracking-[0.24em]", invert ? "text-white/54" : "text-slate-500")}>
        {eyebrow}
      </p>
      <h2 className={cn("m-0 text-balance text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.045em]", invert ? "text-white" : "text-slate-950")}>
        {title}
      </h2>
      <p className={cn("m-0 max-w-[42rem] text-[1rem] leading-7", invert ? "text-slate-300" : "text-slate-600")}>
        {body}
      </p>
    </div>
  );
}

export function QuickStartCard({ item, index }: { item: HubQuestionItem; index: number }) {
  return (
    <article className="group relative overflow-hidden rounded-[1.8rem] border border-white/12 bg-white/[0.055] p-5 text-white shadow-[0_20px_80px_rgba(5,10,18,0.12)] transition duration-300 hover:-translate-y-1 hover:border-white/22 hover:bg-white/[0.075]">
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex h-9 min-w-9 items-center justify-center rounded-full border border-white/16 bg-white/[0.04] px-3 text-xs font-semibold tracking-[0.2em] text-white/68">
          0{index + 1}
        </span>
        <div className="hidden items-center gap-1 md:flex">
          {item.scent.slice(0, 3).map((label) => (
            <span
              key={label}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] text-white/52 opacity-0 transition duration-300 group-hover:opacity-100 group-focus-within:opacity-100"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <h3 className="m-0 text-[1.14rem] font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
        <p className="m-0 text-sm leading-7 text-slate-300">{item.description}</p>
        <p className="m-0 flex flex-wrap gap-1 text-[11px] leading-5 text-white/52 md:hidden">
          {item.scent.map((label) => (
            <span key={label} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1">
              {label}
            </span>
          ))}
        </p>
      </div>

      <Link href={item.href} prefetch={false} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[var(--fm-gold)]">
        {item.ctaLabel}
        <ChevronRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

export function SampleReportPreview({
  variant,
  title,
}: {
  variant: HubTestCardItem["previewVariant"];
  title: string;
}) {
  if (variant === "radar") {
    return (
      <div aria-hidden className="relative h-28 overflow-hidden rounded-[1.25rem] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(244,239,229,0.92))]">
        <div className="absolute inset-4 rounded-full border border-slate-300/60" />
        <div className="absolute inset-[1.7rem] rounded-full border border-slate-300/40" />
        <div className="absolute left-1/2 top-3 h-[5.1rem] w-px -translate-x-1/2 bg-slate-300/60" />
        <div className="absolute left-5 right-5 top-1/2 h-px -translate-y-1/2 bg-slate-300/60" />
        <div className="absolute left-1/2 top-1/2 h-[4.15rem] w-[4.15rem] -translate-x-1/2 -translate-y-1/2 rotate-12 rounded-[1rem] border border-[rgba(217,119,6,0.4)] bg-[rgba(217,119,6,0.1)]" />
      </div>
    );
  }

  if (variant === "bars") {
    return (
      <div aria-hidden className="flex h-28 items-end gap-2 overflow-hidden rounded-[1.25rem] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,243,238,0.94))] px-4 pb-4 pt-6">
        {[52, 78, 61, 84].map((height, index) => (
          <div key={`${title}-bar-${height}`} className="flex-1 rounded-full bg-[linear-gradient(180deg,rgba(148,163,184,0.18),rgba(15,23,42,0.72))]" style={{ height: `${height}%`, opacity: 1 - index * 0.12 }} />
        ))}
      </div>
    );
  }

  if (variant === "matrix") {
    return (
      <div aria-hidden className="grid h-28 grid-cols-3 gap-2 overflow-hidden rounded-[1.25rem] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(243,241,234,0.94))] p-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={`${title}-matrix-${index}`}
            className={cn(
              "rounded-[0.9rem] border border-slate-300/50",
              index === 1 || index === 4 ? "bg-[rgba(15,23,42,0.82)]" : "bg-[rgba(148,163,184,0.18)]"
            )}
          />
        ))}
      </div>
    );
  }

  return (
    <div aria-hidden className="overflow-hidden rounded-[1.25rem] border border-[rgba(15,23,42,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(245,243,238,0.94))] p-4">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="h-2 w-2 rounded-full bg-slate-300/80" />
        <span className="h-2 w-2 rounded-full bg-slate-300/60" />
      </div>
      <div className="mt-4 space-y-2">
        <div className="h-3 rounded-full bg-slate-900/80" />
        <div className="h-3 w-[78%] rounded-full bg-slate-300/70" />
        <div className="h-3 w-[62%] rounded-full bg-slate-300/55" />
      </div>
      <div className="mt-5 grid grid-cols-3 gap-2">
        <div className="h-10 rounded-[0.95rem] bg-slate-900/75" />
        <div className="h-10 rounded-[0.95rem] bg-slate-300/65" />
        <div className="h-10 rounded-[0.95rem] bg-slate-300/45" />
      </div>
    </div>
  );
}

export function HubTestCard({
  item,
  showPreview = false,
  showSecondary = true,
}: {
  item: HubTestCardItem;
  showPreview?: boolean;
  showSecondary?: boolean;
}) {
  return (
    <article className="rounded-[1.8rem] border border-slate-200/80 bg-white/95 p-5 shadow-[0_24px_70px_rgba(15,23,42,0.07)]">
      <div className={cn("grid gap-5", showPreview && "xl:grid-cols-[minmax(0,1fr)_12rem] xl:items-start")}>
        <div className="space-y-4">
          <div className="space-y-3">
            <h3 className="m-0 text-[1.16rem] font-semibold tracking-[-0.032em] text-slate-950">{item.title}</h3>
            <p className="m-0 text-sm leading-7 text-slate-600">{item.description}</p>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">{item.questionsLabel}</span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs text-slate-600">{item.durationLabel}</span>
            <span className="rounded-full border border-[rgba(217,119,6,0.2)] bg-[rgba(245,158,11,0.08)] px-3 py-1 text-xs text-slate-700">
              {item.outputLabel}
            </span>
            {item.scientificBasis ? (
              <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-500">{item.scientificBasis}</span>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            {item.primaryActions && item.primaryActions.length > 0 ? (
              item.primaryActions.map((action) => (
                <div key={`${item.key}-${action.href}`} className="min-w-[13rem] space-y-2">
                  <Link href={action.href} prefetch={false} className={buttonVariants({ size: "sm", className: "w-full justify-start px-4" })}>
                    {action.label}
                  </Link>
                  {action.meta ? <p className="m-0 text-xs leading-6 text-slate-500">{action.meta}</p> : null}
                </div>
              ))
            ) : (
              <Link href={item.href} prefetch={false} className={buttonVariants({ size: "sm" })}>
                {item.primaryLabel}
              </Link>
            )}
            {showSecondary && item.detailsHref && item.secondaryLabel ? (
              <Link href={item.detailsHref} prefetch={false} className={buttonVariants({ size: "sm", variant: "outline" })}>
                {item.secondaryLabel}
              </Link>
            ) : null}
          </div>
        </div>

        {showPreview ? <SampleReportPreview variant={item.previewVariant} title={item.title} /> : null}
      </div>
    </article>
  );
}

export function ResourceCard({ item, locale }: { item: ResourceItem; locale: "zh" | "en" }) {
  return (
    <article className="flex h-full flex-col rounded-[1.65rem] border border-slate-200/80 bg-white/88 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">{item.typeLabel}</p>
      <h3 className="m-0 mt-4 text-[1.08rem] font-semibold tracking-[-0.028em] text-slate-950">{item.title}</h3>
      <p className="m-0 mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
      <Link href={item.href} prefetch={false} className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-semibold text-slate-900 transition hover:text-[var(--fm-cta-orange)]">
        <span>{locale === "zh" ? "打开资源" : "Open resource"}</span>
        <ChevronRight className="h-4 w-4" />
      </Link>
    </article>
  );
}

export function TrustAccordion({
  title,
  items,
  locale,
}: {
  title: string;
  items: TrustItem[];
  locale: "zh" | "en";
}) {
  return (
    <section aria-labelledby="tests-trust-heading" className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-5 md:p-8">
      <div className="max-w-[42rem]">
        <h2 id="tests-trust-heading" className="m-0 text-[1.7rem] font-semibold tracking-[-0.035em] text-white">
          {title}
        </h2>
      </div>

      <div className="mt-6 space-y-3">
        {items.map((item) => (
          <details key={item.title} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3 text-white">
            <summary className="cursor-pointer list-none text-sm font-semibold tracking-[-0.01em] text-white [&::-webkit-details-marker]:hidden">
              <span className="flex items-center justify-between gap-4">
                <span>{item.title}</span>
                <span className="text-white/40">{locale === "zh" ? "展开" : "Open"}</span>
              </span>
            </summary>
            <p className="m-0 pt-3 text-sm leading-7 text-slate-300">{item.body}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
