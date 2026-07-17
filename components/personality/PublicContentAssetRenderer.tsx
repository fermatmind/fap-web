import Link from "next/link";
import { ArrowRight, BookOpen, ShieldCheck } from "lucide-react";
import { SanitizedCmsHtml } from "@/components/content/SanitizedCmsHtml";
import { buttonVariants } from "@/components/ui/button";
import { renderSimpleMarkdown } from "@/lib/content/renderSimpleMarkdown";
import type { PersonalityPublicContentAsset, PersonalityPublicContentSection } from "@/lib/cms/personality-public-content-assets";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

function entityLabel(asset: PersonalityPublicContentAsset, locale: Locale): string {
  if (asset.entityType === "hub") {
    return asset.framework === "enneagram" ? (locale === "zh" ? "九型人格" : "Enneagram") : locale === "zh" ? "大五人格" : "Big Five";
  }

  const labels: Record<PersonalityPublicContentAsset["entityType"], Record<Locale, string>> = {
    hub: { en: "Big Five", zh: "大五人格" },
    domain: { en: "Domain", zh: "维度" },
    polarity: { en: "Pole", zh: "高低极" },
    facet_hub: { en: "Facets", zh: "细分面" },
    facet_detail: { en: "Facet Detail", zh: "细分面向详情" },
    center: { en: "Center", zh: "中心" },
    core_type: { en: "Core type", zh: "核心型" },
    wing: { en: "Wing", zh: "翼型" },
    instinctual_subtype: { en: "Instinctual subtype", zh: "本能副型" },
  };

  return labels[asset.entityType][locale];
}

function frameworkCta(asset: PersonalityPublicContentAsset, locale: Locale): { href: string; label: string } {
  if (asset.framework === "enneagram") {
    return {
      href: localizedPath("/tests/enneagram-personality-test-nine-types", locale),
      label: locale === "zh" ? "开始九型人格免费测试" : "Start the free Enneagram test",
    };
  }

  return {
    href: localizedPath("/tests/big-five-personality-test-ocean-model", locale),
    label: locale === "zh" ? "开始大五人格免费测试" : "Start the free Big Five test",
  };
}

function SectionBody({ section, locale }: { section: PersonalityPublicContentSection; locale: Locale }) {
  if (section.bodyHtml.trim()) {
    return <SanitizedCmsHtml allowImages={false} className="fm-content-page-prose" html={section.bodyHtml} locale={locale} />;
  }

  if (section.bodyMd.trim()) {
    return <div className="fm-content-page-prose">{renderSimpleMarkdown(section.bodyMd, { allowImages: false, locale, minimumHeadingLevel: 3 })}</div>;
  }

  return null;
}

function hasRenderableSectionBody(section: PersonalityPublicContentSection): boolean {
  return Boolean(section.bodyMd.trim() || section.bodyHtml.trim());
}

function formatAuthorityDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en", {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(value));
}

function sourceTypeLabel(value: string): string {
  return value.replaceAll("_", " ");
}

export function PublicContentAssetRenderer({
  asset,
  locale,
}: {
  asset: PersonalityPublicContentAsset;
  locale: Locale;
}) {
  const testCta = frameworkCta(asset, locale);
  const visibleSections = asset.sections.filter(hasRenderableSectionBody);
  const visibleFaq = asset.faq.filter((item) => item.question && item.answer);
  const visibleLinks = asset.internalLinks.filter((item) => item.label && item.href);
  const boundary = asset.methodBoundary;
  const authority = asset.authorityV2;
  const visibleEvidence = authority?.visibleEvidence.eligible ? authority.visibleEvidence : null;
  const authorityLimitations = authority?.visibleEvidence.limitations ?? [];
  const editorial = authority?.editorialAuthority;
  const sourceTitles = new Map(
    visibleEvidence?.sources.map((source) => [source.id, source.title]) ?? []
  );
  const hasEditorialAuthority = Boolean(
    (asset.framework === "enneagram" && editorial?.reviewState) ||
    editorial?.author ||
      editorial?.reviewer ||
      editorial?.publishedAt ||
      editorial?.updatedAt ||
      editorial?.lastReviewedAt
  );

  return (
    <main className="bg-[var(--fm-bg)] text-[var(--fm-text)]" data-testid={`${asset.framework}-public-content-page`}>
      <section className="border-b border-[var(--fm-border)] bg-[var(--fm-surface)]">
        <div className="mx-auto max-w-6xl px-5 py-14 md:px-8 lg:py-18">
          <div className="space-y-7">
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--fm-border)] bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--fm-text-muted)]">
              <BookOpen className="h-3.5 w-3.5" aria-hidden="true" />
              {entityLabel(asset, locale)}
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
              <Link href={testCta.href} className={buttonVariants({ variant: "default", size: "lg" })}>
                {testCta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
              {visibleSections[0] ? (
                <a href={`#${visibleSections[0].key}`} className={buttonVariants({ variant: "outline", size: "lg" })}>
                  {locale === "zh" ? "阅读全文" : "Read the guide"}
                </a>
              ) : null}
            </div>
          </div>

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
                <SectionBody section={section} locale={locale} />
              </div>
            </section>
          ))}

          {visibleEvidence || authorityLimitations.length > 0 ? (
            <section
              id="sources"
              className="scroll-mt-24 rounded-2xl border border-[var(--fm-border)] bg-white p-6 shadow-[var(--fm-shadow-sm)] md:p-8"
              data-testid="visible-authority-evidence"
            >
              <h2 className="m-0 text-2xl font-semibold tracking-normal text-[var(--fm-text)]">
                {locale === "zh" ? "来源与引用" : "Sources and citations"}
              </h2>
              {visibleEvidence ? (
                <div className="mt-6 grid gap-5">
                  {visibleEvidence.sources.map((source) => (
                    <article key={source.id} className="rounded-xl border border-[var(--fm-border)] p-5">
                      <h3 className="m-0 text-base font-semibold tracking-normal text-[var(--fm-text)]">
                        {source.publicUrl ? (
                          <a
                            href={source.publicUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline decoration-[var(--fm-border)] underline-offset-4 hover:text-[var(--fm-trust-blue)]"
                          >
                            {source.title}
                          </a>
                        ) : (
                          source.title
                        )}
                      </h3>
                      <p className="m-0 mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">
                        {source.authorOrOrganization} · {source.year} · {sourceTypeLabel(source.sourceType)}
                      </p>
                      {source.doi ? (
                        <p className="m-0 mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">DOI: {source.doi}</p>
                      ) : null}
                      {source.accessedAt ? (
                        <p className="m-0 mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">
                          {locale === "zh" ? "访问日期" : "Accessed"}: {formatAuthorityDate(source.accessedAt, locale)}
                        </p>
                      ) : null}
                      {source.limitation ? (
                        <p className="m-0 mt-3 text-sm leading-6 text-[var(--fm-text-muted)]">{source.limitation}</p>
                      ) : null}
                    </article>
                  ))}
                </div>
              ) : null}

              {visibleEvidence && visibleEvidence.claimMapping.length > 0 ? (
                <div className="mt-7">
                  <h3 className="m-0 text-base font-semibold tracking-normal text-[var(--fm-text)]">
                    {locale === "zh" ? "证据映射" : "Evidence mapping"}
                  </h3>
                  <ul className="mt-3 space-y-3 pl-5 text-sm leading-6 text-[var(--fm-text-muted)]">
                    {visibleEvidence.claimMapping.map((mapping) => (
                      <li key={mapping.claimId}>
                        <code>{mapping.claimId}</code>: {mapping.sourceIds.map((id) => sourceTitles.get(id) ?? id).join("; ")}
                        {mapping.limitation ? ` — ${mapping.limitation}` : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {authorityLimitations.length > 0 ? (
                <div className="mt-7 rounded-xl bg-[var(--fm-surface-muted)] p-5">
                  <h3 className="m-0 text-base font-semibold tracking-normal text-[var(--fm-text)]">
                    {locale === "zh" ? "证据边界" : "Evidence limitations"}
                  </h3>
                  <ul className="mt-3 space-y-2 pl-5 text-sm leading-6 text-[var(--fm-text-muted)]">
                    {authorityLimitations.map((limitation) => (
                      <li key={limitation}>{limitation}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </section>
          ) : null}

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
          {hasEditorialAuthority && editorial ? (
            <section
              className="rounded-2xl border border-[var(--fm-border)] bg-white p-5 shadow-[var(--fm-shadow-sm)]"
              data-testid="editorial-authority"
            >
              <h2 className="m-0 text-base font-semibold tracking-normal text-[var(--fm-text)]">
                {locale === "zh" ? "编辑信息" : "Editorial authority"}
              </h2>
              <dl className="m-0 mt-4 grid gap-4 text-sm leading-6">
                {asset.framework === "enneagram" && editorial.reviewState ? (
                  <div>
                    <dt className="font-semibold text-[var(--fm-text)]">{locale === "zh" ? "审核状态" : "Review state"}</dt>
                    <dd className="m-0 text-[var(--fm-text-muted)]">{editorial.reviewState}</dd>
                  </div>
                ) : null}
                {editorial.author ? (
                  <div>
                    <dt className="font-semibold text-[var(--fm-text)]">{locale === "zh" ? "作者" : "Author"}</dt>
                    <dd className="m-0 text-[var(--fm-text-muted)]">
                      {editorial.author.name}
                      {editorial.author.organization ? ` · ${editorial.author.organization}` : null}
                      {editorial.author.role ? ` · ${editorial.author.role}` : null}
                    </dd>
                  </div>
                ) : null}
                {editorial.reviewer ? (
                  <div>
                    <dt className="font-semibold text-[var(--fm-text)]">{locale === "zh" ? "审核者" : "Reviewer"}</dt>
                    <dd className="m-0 text-[var(--fm-text-muted)]">
                      {editorial.reviewer.name}
                      {editorial.reviewer.organization ? ` · ${editorial.reviewer.organization}` : null}
                      {editorial.reviewer.role ? ` · ${editorial.reviewer.role}` : null}
                    </dd>
                  </div>
                ) : null}
                {editorial.publishedAt ? (
                  <div>
                    <dt className="font-semibold text-[var(--fm-text)]">{locale === "zh" ? "发布于" : "Published"}</dt>
                    <dd className="m-0 text-[var(--fm-text-muted)]">
                      <time dateTime={editorial.publishedAt}>{formatAuthorityDate(editorial.publishedAt, locale)}</time>
                    </dd>
                  </div>
                ) : null}
                {editorial.updatedAt ? (
                  <div>
                    <dt className="font-semibold text-[var(--fm-text)]">{locale === "zh" ? "更新于" : "Updated"}</dt>
                    <dd className="m-0 text-[var(--fm-text-muted)]">
                      <time dateTime={editorial.updatedAt}>{formatAuthorityDate(editorial.updatedAt, locale)}</time>
                    </dd>
                  </div>
                ) : null}
                {editorial.lastReviewedAt ? (
                  <div>
                    <dt className="font-semibold text-[var(--fm-text)]">{locale === "zh" ? "最近审核" : "Last reviewed"}</dt>
                    <dd className="m-0 text-[var(--fm-text-muted)]">
                      <time dateTime={editorial.lastReviewedAt}>{formatAuthorityDate(editorial.lastReviewedAt, locale)}</time>
                    </dd>
                  </div>
                ) : null}
              </dl>
            </section>
          ) : null}

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
                    prefetch={false}
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
