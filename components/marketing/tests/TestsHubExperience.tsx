import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import type { Locale } from "@/lib/i18n/locales";
import type { HubTestCardItem, TestsHubContent } from "@/lib/marketing/testsHubContent";

function listTests(items: HubTestCardItem[][]): HubTestCardItem[] {
  const seen = new Set<string>();
  const ordered: HubTestCardItem[] = [];

  for (const group of items) {
    for (const item of group) {
      if (seen.has(item.key)) continue;
      seen.add(item.key);
      ordered.push(item);
    }
  }

  return ordered;
}

function TestListCard({ item, locale }: { item: HubTestCardItem; locale: Locale }) {
  const primaryHref = item.detailsHref ?? item.href;
  const primaryLabel = locale === "zh" ? "查看专属页" : "View dedicated page";

  return (
    <article className="group flex min-h-[19rem] flex-col rounded-[1.35rem] border border-white/10 bg-white/[0.055] p-6 text-white shadow-[0_22px_80px_rgba(5,10,18,0.18)] transition duration-200 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.075] xl:h-[20.75rem]">
      <div className="flex items-start justify-between gap-5">
        <h2 className="m-0 text-[1.35rem] font-semibold leading-tight tracking-normal text-white">{item.title}</h2>
      </div>

      <p className="m-0 mt-5 text-base leading-7 text-slate-300">{item.description}</p>

      <div className="mt-5 flex flex-wrap gap-2">
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{item.questionsLabel}</span>
        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-slate-300">{item.durationLabel}</span>
        <span className="rounded-full border border-orange-300/20 bg-orange-300/10 px-3 py-1 text-xs text-orange-100">{item.outputLabel}</span>
      </div>

      <div className="mt-auto flex flex-wrap gap-3 pt-7">
        <Link href={primaryHref} prefetch={false} className={buttonVariants({ size: "sm", className: "px-4" })}>
          {primaryLabel}
        </Link>
      </div>
    </article>
  );
}

export function TestsHubExperience({ content, locale }: { content: TestsHubContent; locale: Locale }) {
  const tests = listTests(content.families.items.map((family) => family.tests));
  return (
    <section className="min-h-[calc(100svh-4rem)] bg-[#0d141b] py-16 text-white md:py-20">
      <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="m-0 text-balance text-[clamp(2.4rem,4vw,3.5rem)] font-semibold leading-[0.98] tracking-normal text-white md:whitespace-nowrap">
            {content.hero.title}
          </h1>
          <p className="m-0 mx-auto mt-6 max-w-[46rem] text-[1.05rem] leading-8 text-slate-300">
            {content.hero.body}
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-[92rem] gap-5 md:grid-cols-2 xl:grid-cols-3">
          {tests.map((item) => (
            <TestListCard key={item.key} item={item} locale={locale} />
          ))}
        </div>
      </Container>
    </section>
  );
}
