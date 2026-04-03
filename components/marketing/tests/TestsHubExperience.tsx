import Link from "next/link";
import { Container } from "@/components/layout/Container";
import { buttonVariants } from "@/components/ui/button";
import { TestsFamilyExplorer } from "@/components/marketing/tests/TestsFamilyExplorer";
import {
  QuickStartCard,
  ResourceCard,
  SectionHeading,
  TrustAccordion,
} from "@/components/marketing/tests/TestsShared";
import type { Locale } from "@/lib/i18n/locales";
import { getTestsHubContent } from "@/lib/marketing/testsHubContent";
import { cn } from "@/lib/utils";

export function TestsHubExperience({ locale }: { locale: Locale }) {
  const content = getTestsHubContent(locale);

  return (
    <>
      <section className="relative overflow-hidden bg-[#0d141b] text-white">
        <div aria-hidden className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_28%),radial-gradient(circle_at_78%_12%,rgba(129,140,248,0.12),transparent_22%),linear-gradient(180deg,#0d141b_0%,#121d28_54%,#162332_100%)]" />
        <Container className="relative z-10 max-w-[110rem] px-5 pb-[5.5rem] pt-[calc(var(--fm-space-16)+var(--fm-space-9))] md:px-8 md:pb-[7rem] md:pt-[calc(var(--fm-space-20)+var(--fm-space-10))] xl:px-12">
          <div className="rounded-[2.25rem] border border-white/10 bg-white/[0.035] px-5 py-6 shadow-[0_32px_120px_rgba(6,10,18,0.28)] backdrop-blur-md md:px-8 md:py-8 xl:px-10 xl:py-10">
            <div className="grid gap-8 xl:grid-cols-[minmax(0,1.02fr)_minmax(20rem,0.84fr)] xl:items-end">
              <div className="space-y-8">
                <div className="space-y-4">
                  <p className="m-0 text-xs font-semibold uppercase tracking-[0.24em] text-white/54">{content.hero.eyebrow}</p>
                  <h1 className="m-0 max-w-[14ch] text-balance text-[clamp(2.7rem,5vw,5rem)] font-semibold leading-[0.96] tracking-[-0.055em] text-white">
                    {content.hero.title}
                  </h1>
                  <p className="m-0 max-w-[39rem] text-[1.02rem] leading-8 text-slate-300 md:text-[1.1rem]">{content.hero.body}</p>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={content.hero.primaryHref} className={buttonVariants({ size: "lg", className: "px-7" })}>
                    {content.hero.primaryLabel}
                  </Link>
                  <Link
                    href={content.hero.secondaryHref}
                    className={buttonVariants({
                      variant: "outline",
                      size: "lg",
                      className: "border-white/16 bg-white/6 px-7 text-white hover:border-white/30 hover:bg-white/10 hover:text-white",
                    })}
                  >
                    {content.hero.secondaryLabel}
                  </Link>
                </div>
              </div>

              <div className="rounded-[1.9rem] border border-white/10 bg-white/[0.045] p-5">
                <p className="m-0 text-xs font-semibold uppercase tracking-[0.22em] text-white/46">{content.hero.previewLabel}</p>
                <h2 className="m-0 mt-4 text-[1.5rem] font-semibold tracking-[-0.04em] text-white">{content.hero.previewTitle}</h2>
                <p className="m-0 mt-3 text-sm leading-7 text-slate-300">{content.hero.previewBody}</p>

                <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-[#111a24] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]">
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-white/44">
                      {locale === "zh" ? "Selection flow" : "Selection flow"}
                    </span>
                    <span className="text-xs text-white/40">{locale === "zh" ? "Structured entry map" : "Structured entry map"}</span>
                  </div>

                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    {content.hero.previewFlow.map((step, index) => (
                      <div key={step} className="rounded-[1.2rem] border border-white/10 bg-white/[0.03] p-3">
                        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/42">0{index + 1}</p>
                        <p className="m-0 mt-3 text-sm font-medium text-white">{step}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid gap-2 md:grid-cols-2">
                    {content.hero.previewFamilies.slice(0, 4).map((family, index) => (
                      <div
                        key={`${family}-${index}`}
                        className={cn(
                          "rounded-[1rem] border px-3 py-3 text-sm",
                          index === 0
                            ? "border-[rgba(245,158,11,0.24)] bg-[rgba(245,158,11,0.08)] text-white"
                            : "border-white/10 bg-white/[0.03] text-slate-300"
                        )}
                      >
                        {family}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div id="tests-quick-start" className="-mt-6 md:-mt-8">
            <div className="rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(18,28,38,0.96),rgba(13,22,31,0.92))] px-5 py-6 shadow-[0_32px_120px_rgba(6,10,18,0.28)] md:px-8 md:py-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                <SectionHeading
                  eyebrow={content.quickStart.kicker}
                  title={content.quickStart.title}
                  body={content.quickStart.body}
                  invert
                />
                <Link href="#tests-families" className="inline-flex items-center gap-2 text-sm font-semibold text-white/78 transition hover:text-white">
                  {content.hero.secondaryLabel}
                  <span aria-hidden>+</span>
                </Link>
              </div>

              <div className="mt-8 grid gap-4 lg:grid-cols-2 xl:grid-cols-5">
                {content.quickStart.items.map((item, index) => (
                  <QuickStartCard key={item.id} item={item} index={index} />
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section id="tests-families" className="bg-[#f4f1ea] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <SectionHeading eyebrow={content.families.kicker} title={content.families.title} body={content.families.body} />
          <TestsFamilyExplorer families={content.families.items} locale={locale} />
        </Container>
      </section>

      <section className="bg-[#ece7de] py-[var(--fm-space-20)] md:py-[7rem]">
        <Container className="max-w-[96rem] px-5 md:px-8 xl:px-12">
          <SectionHeading
            eyebrow={content.howToChoose.kicker}
            title={content.howToChoose.title}
            body={content.howToChoose.body}
          />

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.howToChoose.items.map((item) => (
              <article key={item.title} className="rounded-[1.7rem] border border-white/65 bg-white/85 p-5 shadow-[0_18px_60px_rgba(15,23,42,0.05)]">
                <h3 className="m-0 text-[1.08rem] font-semibold tracking-[-0.028em] text-slate-950">{item.title}</h3>
                <p className="m-0 mt-3 text-sm leading-7 text-slate-600">{item.description}</p>
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
        <Container className="max-w-[96rem] px-5 md:px-8 xl:px-12">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <SectionHeading eyebrow={content.resources.kicker} title={content.resources.title} body={content.resources.body} />
            <Link href={content.resources.allHref} className="inline-flex items-center gap-2 text-sm font-semibold text-slate-900 transition hover:text-[var(--fm-cta-orange)]">
              {content.resources.allLabel}
              <span aria-hidden>+</span>
            </Link>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {content.resources.items.map((item) => (
              <ResourceCard key={item.key} item={item} locale={locale} />
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[#121a22] py-[var(--fm-space-18)] md:py-[5.5rem]">
        <Container className="max-w-[90rem] px-5 md:px-8 xl:px-12">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.04] px-5 py-6 md:px-8 md:py-8">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-[40rem] space-y-4">
                <h2 className="m-0 text-balance text-[clamp(2rem,4vw,3.2rem)] font-semibold tracking-[-0.045em] text-white">
                  {content.finalCta.title}
                </h2>
                <p className="m-0 text-[1rem] leading-7 text-slate-300">{content.finalCta.body}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={content.finalCta.primaryHref} className={buttonVariants({ size: "lg", className: "px-7" })}>
                  {content.finalCta.primaryLabel}
                </Link>
                <Link
                  href={content.finalCta.secondaryHref}
                  className={buttonVariants({
                    variant: "outline",
                    size: "lg",
                    className: "border-white/16 bg-white/6 px-7 text-white hover:border-white/30 hover:bg-white/10 hover:text-white",
                  })}
                >
                  {content.finalCta.secondaryLabel}
                </Link>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
