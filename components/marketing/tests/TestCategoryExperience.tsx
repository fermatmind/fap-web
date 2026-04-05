import Link from "next/link";
import { Container } from "@/components/layout/Container";
import {
  HubTestCard,
  ResourceCard,
  SectionHeading,
  TrustAccordion,
} from "@/components/marketing/tests/TestsShared";
import type { Locale } from "@/lib/i18n/locales";
import type { CategoryContent } from "@/lib/marketing/testsHubContent";

export function TestCategoryExperience({
  locale,
  content,
}: {
  locale: Locale;
  content: CategoryContent;
}) {
  return (
    <>
      <section className="relative overflow-hidden bg-[#0e151d] text-white">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.16),transparent_25%),linear-gradient(180deg,#0e151d_0%,#172230_100%)]" />
        <Container className="relative z-10 max-w-[104rem] px-5 pb-[4.5rem] pt-[calc(var(--fm-space-16)+var(--fm-space-8))] md:px-8 md:pb-[6rem] md:pt-[calc(var(--fm-space-18)+var(--fm-space-9))] xl:px-12">
          <div className="max-w-[52rem] space-y-5">
            <nav aria-label="Breadcrumb" className="text-sm text-white/62">
              <ol className="m-0 flex flex-wrap items-center gap-2 p-0">
                {content.breadcrumb.map((item, index) => (
                  <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                    {index > 0 ? <span aria-hidden>/</span> : null}
                    {item.href ? (
                      <Link href={item.href} className="transition hover:text-white">
                        {item.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-white">{item.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
            <p className="m-0 text-xs font-semibold uppercase tracking-[0.24em] text-white/52">{content.hero.eyebrow}</p>
            <h1 className="m-0 text-balance text-[clamp(2.5rem,5vw,4.6rem)] font-semibold leading-[0.98] tracking-[-0.055em] text-white">
              {content.hero.title}
            </h1>
            <p className="m-0 max-w-[42rem] text-[1.02rem] leading-8 text-slate-300 md:text-[1.08rem]">{content.hero.body}</p>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.hero.points.map((point) => (
              <article key={point} className="rounded-[1.5rem] border border-white/10 bg-white/[0.05] p-4 text-sm leading-7 text-slate-200">
                {point}
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#f5f2eb] py-[var(--fm-space-20)] md:py-[7rem]">
        <Container className="max-w-[104rem] px-5 md:px-8 xl:px-12">
          <SectionHeading eyebrow={content.featured.kicker} title={content.featured.title} body={content.featured.body} />
          <div className="mt-8 grid gap-4">
            {content.featured.items.map((item) => (
              <HubTestCard key={`featured-${item.key}`} item={item} showPreview />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#ece7de] py-[var(--fm-space-20)] md:py-[7rem]">
        <Container className="max-w-[104rem] px-5 md:px-8 xl:px-12">
          <SectionHeading eyebrow={content.allTests.kicker} title={content.allTests.title} body={content.allTests.body} />
          <div className="mt-8 grid gap-4 xl:grid-cols-2">
            {content.allTests.items.map((item) => (
              <HubTestCard key={`all-${item.key}`} item={item} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#131c25] py-[var(--fm-space-20)] md:py-[6.5rem]">
        <Container className="max-w-[104rem] px-5 md:px-8 xl:px-12">
          <SectionHeading eyebrow={content.differences.kicker} title={content.differences.title} body={content.differences.body} invert />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.differences.items.map((item) => (
              <article key={item.title} className="rounded-[1.7rem] border border-white/10 bg-white/[0.04] p-5">
                <h3 className="m-0 text-[1.08rem] font-semibold tracking-[-0.028em] text-white">{item.title}</h3>
                <p className="m-0 mt-3 text-sm leading-7 text-slate-300">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#101821] py-[var(--fm-space-20)] md:py-[6.5rem]">
        <Container className="max-w-[96rem] px-5 md:px-8 xl:px-12">
          <TrustAccordion title={content.trust.title} items={content.trust.items} locale={locale} />
        </Container>
      </section>

      <section className="bg-[#f8f5ef] py-[var(--fm-space-20)] md:py-[7rem]">
        <Container className="max-w-[104rem] px-5 md:px-8 xl:px-12">
          <SectionHeading eyebrow={content.resources.kicker} title={content.resources.title} body={content.resources.body} />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.resources.items.map((item) => (
              <ResourceCard key={item.key} item={item} locale={locale} />
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
