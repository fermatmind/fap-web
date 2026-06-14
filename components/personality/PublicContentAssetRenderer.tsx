import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import { buttonVariants } from "@/components/ui/button";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import type { PersonalityPublicContentAsset, PersonalityPublicContentSection } from "@/lib/cms/personality-public-content-assets";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

function entityLabel(entityType: PersonalityPublicContentAsset["entityType"], locale: Locale): string {
  const labels: Record<PersonalityPublicContentAsset["entityType"], Record<Locale, string>> = {
    hub: { en: "Big Five", zh: "大五人格" },
    domain: { en: "Domain", zh: "维度" },
    polarity: { en: "Pole", zh: "高低极" },
    facet_hub: { en: "Facets", zh: "细分面" },
  };

  return labels[entityType][locale];
}

function SectionBody({ section }: { section: PersonalityPublicContentSection }) {
  if (section.bodyHtml.trim()) {
    return <SanitizedCmsHtml className="fm-content-page-prose" html={section.bodyHtml} />;
  }

  if (section.bodyMd.trim()) {
    return <div className="fm-content-page-prose">{renderSimpleMarkdown(section.bodyMd, { minimumHeadingLevel: 3 })}</div>;
  }

  return null;
}

export function PublicContentAssetRenderer({
  asset,
  locale,
}: {
  asset: PersonalityPublicContentAsset;
  locale: Locale;
}) {
  const testHref = localizedPath("/tests/big-five-personality-test-ocean-model", locale);
  const visibleSections = asset.sections.filter((section) => section.title || section.bodyMd || section.bodyHtml);
  const visibleFaq = asset.faq.filter((item) => item.question && item.answer);
  const visibleLinks = asset.internalLinks.filter((item) => item.label && item.href);
  const boundary = asset.methodBoundary;

  return (
    <main className="bg-[var(--fm-bg)] text-[var(--fm-text)]" data-testid="big-five-public-content-page">
      <section className="border-b border-[var(--fm-border)] bg-[var(--fm-surface)]">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:px-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-center lg:py-18">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--fm-border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fm-text-muted)]">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {entityLabel(asset.entityType, locale)}
            </div>
            <div className="space-y-4">
              <h1 className="m-0 max-w-4xl text-4xl font-semibold leading-tight tracking-normal text-[var(--fm-text)] md:text-6xl">
                {asset.title}
              </h1>
              {asset.summary ? (
                <p className="m-0 max-w-3xl text-lg leading-8 text-[var(--fm-text-muted)] md:text-xl">
                  {asset.summary}
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href={testHref} className={buttonVariants({ variant: "default", size: "lg" })}>
                {locale === "zh" ? "开始大五人格测试" : "Take the Big Five test"}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {visibleSections[0] ? (
                <a href={`#${visibleSections[0].key}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
                  {locale === "zh" ? "阅读全文" : "Read the guide"}
                </a>
              ) : null}
            </div>
          </div>

          <aside className="rounded-2xl border border-[var(--fm-border)] bg-white p-5 shadow-[var(--fm-shadow-sm)]">
            {asset.media.imageUrl ? (
              <Image
                src={asset.media.imageUrl}
                alt={asset.media.alt || asset.title}
                width={640}
                height={420}
                className="h-auto w-full rounded-xl object-cover"
              />
            ) : (
              <div className="grid aspect-[4/3] place-items-center rounded-xl bg-[var(--fm-surface-muted)] text-center">
                <div>
                  <p className="m-0 text-5xl font-semibold text-[var(--fm-trust-blue)]">OCEAN</p>
                  <p className="m-0 mt-3 text-sm font-medium text-[var(--fm-text-muted)]">{asset.code}</p>
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:px-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-8">
          {visibleSections.map((section) => (
            <section
              key={section.key}
              id={section.key}
              className="scroll-mt-24 rounded-2xl border border-[var(--fm-border)] bg-white p-6 shadow-[var(--fm-shadow-sm)] md:p-8"
              data-testid="public-content-section"
            >
              {section.title ? (
                <h2 className="m-0 text-2xl font-semibold leading-tight tracking-normal text-[var(--fm-text)] md:text-3xl">
                  {section.title}
                </h2>
              ) : null}
              <div className={section.title ? "mt-5" : undefined}>
                <SectionBody section={section} />
              </div>
            </section>
          ))}

          {visibleFaq.length > 0 ? (
            <section id="faq" className="scroll-mt-24 rounded-2xl border border-[var(--fm-border)] bg-white p-6 shadow-[var(--fm-shadow-sm)] md:p-8">
              <h2 className="m-0 text-2xl font-semibold tracking-normal text-[var(--fm-text)]">
                {locale === "zh" ? "常见问题" : "FAQ"}
              </h2>
              <div className="mt-6 divide-y divide-[var(--fm-border)]">
                {visibleFaq.map((item) => (
                  <details key={item.question} className="group py-5">
                    <summary className="cursor-pointer list-none text-base font-semibold text-[var(--fm-text)]">
                      {item.question}
                    </summary>
                    <p className="m-0 mt-3 text-sm leading-7 text-[var(--fm-text-muted)]">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          ) : null}
        </div>

        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {boundary ? (
            <section className="rounded-2xl border border-[var(--fm-border)] bg-white p-5 shadow-[var(--fm-shadow-sm)]" data-testid="method-boundary">
              <div className="flex items-center gap-2 text-sm font-semibold text-[var(--fm-text)]">
                <ShieldCheck className="h-4 w-4 text-[var(--fm-trust-blue)]" aria-hidden="true" />
                {locale === "zh" ? "方法边界" : "Method boundary"}
              </div>
              {boundary.summary ? <p className="m-0 mt-3 text-sm leading-6 text-[var(--fm-text-muted)]">{boundary.summary}</p> : null}
              {boundary.notFor.length > 0 ? (
                <ul className="mt-4 space-y-2 pl-5 text-sm leading-6 text-[var(--fm-text-muted)]">
                  {boundary.notFor.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : null}

          {visibleLinks.length > 0 ? (
            <section className="rounded-2xl border border-[var(--fm-border)] bg-white p-5 shadow-[var(--fm-shadow-sm)]" data-testid="internal-links">
              <h2 className="m-0 text-base font-semibold tracking-normal text-[var(--fm-text)]">
                {locale === "zh" ? "继续浏览" : "Explore next"}
              </h2>
              <div className="mt-4 grid gap-3">
                {visibleLinks.map((item) => (
                  <Link
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    className="group flex items-center justify-between rounded-xl border border-[var(--fm-border)] px-4 py-3 text-sm font-medium text-[var(--fm-text)] transition hover:border-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue)]"
                  >
                    <span>{item.label}</span>
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" aria-hidden="true" />
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          {asset.evidenceNotes.length > 0 ? (
            <section className="rounded-2xl border border-[var(--fm-border)] bg-white p-5 shadow-[var(--fm-shadow-sm)]">
              <h2 className="m-0 text-base font-semibold tracking-normal text-[var(--fm-text)]">
                {locale === "zh" ? "证据说明" : "Evidence notes"}
              </h2>
              <ul className="mt-4 space-y-3 pl-5 text-sm leading-6 text-[var(--fm-text-muted)]">
                {asset.evidenceNotes.map((item) => (
                  <li key={`${item.sourceType ?? "note"}-${item.note}`}>{item.note}</li>
                ))}
              </ul>
            </section>
          ) : null}
        </aside>
      </div>
    </main>
  );
}
