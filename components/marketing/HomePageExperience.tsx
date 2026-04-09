import Link from "next/link";
import {
  buildBig5TakeHref,
  getBig5VariantLabel,
  listBig5FormMetas,
} from "@/lib/big5/forms";
import { Container } from "@/components/layout/Container";
import { ResultsPreviewShowcase } from "@/components/marketing/ResultsPreviewShowcase";
import { SbtiHeroEntryCard } from "@/components/sbti/SbtiHeroEntryCard";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { getHomePageContent, type HomeLinkItem } from "@/lib/marketing/homepageContent";
import {
  buildMbtiTakeHref,
  getMbtiStartLabel,
  listMbtiFormMetas,
} from "@/lib/mbti/forms";
import { cn } from "@/lib/utils";

function SectionHeader({
  kicker,
  title,
  body,
  invert = false,
}: {
  kicker: string;
  title: string;
  body: string;
  invert?: boolean;
}) {
  return (
    <div className="max-w-[42rem] space-y-4">
      <p className={cn("fm-home-section-kicker", invert && "text-white/65")}>{kicker}</p>
      <h2
        className={cn(
          "m-0 text-balance text-[clamp(2.2rem,4vw,3.8rem)] font-semibold tracking-[-0.05em]",
          invert ? "text-white" : "text-slate-950"
        )}
      >
        {title}
      </h2>
      {body ? (
        <p
          className={cn(
            "m-0 max-w-[38rem] text-[0.98rem] leading-7 md:text-[1.02rem]",
            invert ? "text-slate-300" : "text-slate-600"
          )}
        >
          {body}
        </p>
      ) : null}
    </div>
  );
}

function VariantLink({
  href,
  label,
  meta,
}: {
  href: string;
  label: string;
  meta: string;
}) {
  return (
    <Link href={href} prefetch={false} className="fm-home-lineup-variant">
      <span>{label}</span>
      <small>{meta}</small>
    </Link>
  );
}

function extractTestSlugFromHref(href: string): string | null {
  const trimmed = href.trim();
  const matched = trimmed.match(/^\/tests\/([^/?#]+)/);
  return matched?.[1] ?? null;
}

function resolveQuickCardKind(href: string): "mbti" | "big5" | "iq" | "eq" | "depression" | null {
  if (href.includes("mbti-personality-test-16-personality-types")) return "mbti";
  if (href.includes("big-five-personality-test-ocean-model")) return "big5";
  if (href.includes("iq-test-intelligence-quotient-assessment")) return "iq";
  if (href.includes("eq-test-emotional-intelligence-assessment")) return "eq";
  if (href.includes("depression-screening-test-standard-edition")) return "depression";
  return null;
}

function resolveVariantFamily(title: string): "mbti" | "big5" | null {
  const normalized = title.trim().toLowerCase();
  if (normalized === "mbti") {
    return "mbti";
  }
  if (normalized === "big five" || normalized === "big5") {
    return "big5";
  }
  return null;
}

function PersonalityFamilyPanel({
  locale,
  withLocale,
  family,
}: {
  locale: Locale;
  withLocale: (path: string) => string;
  family: {
    title: string;
    description: string;
    exploreHref: string;
    exploreLabel: string;
    links: HomeLinkItem[];
  };
}) {
  const variantLinks = family.links
    .map((link) => {
      const linkSlug = extractTestSlugFromHref(link.href);
      const variantFamily = resolveVariantFamily(link.title);

      if (variantFamily === "mbti" && linkSlug) {
        return {
          key: "mbti",
          title: "MBTI",
          description: locale === "zh"
            ? "先快速读懂整体，再决定是否进入更完整画像。"
            : "Start with the fast read, then move into the fuller profile if needed.",
          variants: listMbtiFormMetas().map((form) => ({
            formCode: form.formCode,
            href: buildMbtiTakeHref(linkSlug, locale, form.formCode),
            label: getMbtiStartLabel(form.formCode, locale),
            meta: locale === "zh" ? `${form.questionCount} 题` : `${form.questionCount} questions`,
          })),
        };
      }

      if (variantFamily === "big5" && linkSlug) {
        return {
          key: "big5",
          title: "Big Five",
          description: locale === "zh"
            ? "从轮廓进入，或直接读取更完整的五维分布。"
            : "Start from the outline, or go straight to the fuller five-factor profile.",
          variants: listBig5FormMetas().map((form) => ({
            formCode: form.formCode,
            href: buildBig5TakeHref(linkSlug, locale, form.formCode),
            label: getBig5VariantLabel(form.formCode, locale),
            meta: locale === "zh" ? `${form.questionCount} 题` : `${form.questionCount} questions`,
          })),
        };
      }

      return null;
    })
    .filter((item): item is NonNullable<typeof item> => item !== null);

  return (
    <article className="fm-home-family-panel fm-home-family-panel--lead">
      <div className="space-y-3">
        <h3 className="m-0 text-[1.5rem] font-semibold tracking-[-0.045em] text-slate-950">{family.title}</h3>
        <p className="m-0 max-w-[38rem] text-[0.95rem] leading-7 text-slate-600">{family.description}</p>
      </div>

      <div className="fm-home-lineup-grid">
        {variantLinks.map((variantGroup) => (
          <section key={variantGroup.key} className="fm-home-lineup-block">
            <div className="fm-home-lineup-block-head">
              <h4>{variantGroup.title}</h4>
              <p>{variantGroup.description}</p>
            </div>
            <div className="fm-home-lineup-variants">
              {variantGroup.variants.map((variant) => (
                <VariantLink
                  key={`${variantGroup.key}-${variant.formCode}`}
                  href={variant.href}
                  label={variant.label}
                  meta={variant.meta}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="fm-home-family-footer">
        {family.links
          .filter((link) => !["MBTI", "Big Five"].includes(link.title))
          .map((link) => (
            <Link key={`${family.title}-${link.title}`} href={withLocale(link.href)} prefetch={false} className="fm-home-family-muted-link">
              <span>{link.title}</span>
              <span aria-hidden>+</span>
            </Link>
          ))}
        <Link href={withLocale(family.exploreHref)} prefetch={false} className="fm-home-family-explore">
          {family.exploreLabel}
          <span aria-hidden>+</span>
        </Link>
      </div>
    </article>
  );
}

export function HomePageExperience({ locale }: { locale: Locale }) {
  const copy = getHomePageContent(locale);
  const withLocale = (path: string) => localizedPath(path, locale);
  const heroTitleParts = copy.hero.title.split("，");
  const heroTitleHasMutedComma = locale === "zh" && heroTitleParts.length > 1;
  const heroTitleLead = heroTitleParts[0] ?? copy.hero.title;
  const heroTitleTail = heroTitleParts.slice(1).join("，");
  const dossierCopy = locale === "zh"
    ? {
      title: "认知档案册",
      summary: "把人格、能力与状态折叠成一页可判断的产品界面。",
      fields: ["人格结构", "能力基线", "状态信号"],
      cueLabel: "结构摘要",
      cueLead: "判断线索稳定，决策噪音更低。",
      scenarioLabel: "场景线索",
      scenarioLine: "学习、职业、协作分别对齐到同一份档案。",
      nextLabel: "下一步",
      nextLine: "先验证最关键的一条，再决定是否继续深入。",
      metrics: [
        { label: "结构一致性", value: "高" },
        { label: "情境敏感度", value: "中高" },
        { label: "执行回路", value: "中位" },
      ],
      backMethodTitle: "方法框架",
      backMethodLine: "30 分面结构 · 常模参照 · 场景解释",
      backUseTitle: "应用域",
      backUseLine: "学习 / 职业 / 协作",
      sourceTags: ["人格", "能力", "状态"],
    }
    : {
      title: "Cognitive Dossier",
      summary: "Fold personality, ability, and state into one decision-ready product surface.",
      fields: ["Personality", "Ability", "State"],
      cueLabel: "Structure summary",
      cueLead: "Judgment signals are stable with lower decision noise.",
      scenarioLabel: "Scenario cues",
      scenarioLine: "Learning, career, and collaboration map to one dossier.",
      nextLabel: "Next step",
      nextLine: "Validate the highest-leverage path before going deeper.",
      metrics: [
        { label: "Structure coherence", value: "High" },
        { label: "Context sensitivity", value: "Mid-high" },
        { label: "Execution loop", value: "Mid" },
      ],
      backMethodTitle: "Method frame",
      backMethodLine: "30-facet model · Norm context · Scenario interpretation",
      backUseTitle: "Use domains",
      backUseLine: "Learning / Career / Collaboration",
      sourceTags: ["Personality", "Ability", "State"],
    };

  return (
    <>
      <section className="fm-home-hero-surface fm-home-motion-section relative overflow-hidden">
        <div aria-hidden className="fm-home-ambient fm-home-ambient--left" />
        <div aria-hidden className="fm-home-ambient fm-home-ambient--right" />
        <div aria-hidden className="fm-home-hero-gridline fm-home-hero-gridline--x" />
        <div aria-hidden className="fm-home-hero-gridline fm-home-hero-gridline--y" />

        <Container className="fm-home-hero-frame relative z-10 max-w-[110rem] px-5 pb-[var(--fm-space-6)] pt-[calc(var(--fm-space-6)+var(--fm-space-6))] md:px-8 md:pb-[var(--fm-space-8)] md:pt-[calc(var(--fm-space-7)+var(--fm-space-6))] xl:px-12">
          <div className="fm-home-hero-composition">
            <div className="fm-home-hero-copy-shell">
              <div className="fm-home-hero-lockup">
                <h1 className="fm-home-hero-title m-0 text-white">
                  <span
                    className={cn(
                      "fm-home-hero-title-line fm-home-hero-title-line--poster fm-home-hero-line fm-home-hero-line--identity",
                      locale === "zh" && "fm-home-hero-title-line--mobile-single"
                    )}
                  >
                    {heroTitleHasMutedComma ? (
                      <>
                        {heroTitleLead}
                        <span className="fm-home-hero-title-punc">，</span>
                        {heroTitleTail}
                      </>
                    ) : (
                      copy.hero.title
                    )}
                  </span>
                </h1>
                <p className="fm-home-hero-subhead fm-home-hero-line fm-home-hero-line--function m-0">{copy.hero.subhead}</p>
              </div>
            </div>

            {locale === "zh" ? (
              <div className={cn("fm-home-hero-product-stage", "xl:translate-x-8 2xl:translate-x-12")}>
                <SbtiHeroEntryCard locale={locale} />
              </div>
            ) : (
              <div className="fm-home-hero-product-stage" aria-hidden>
                <div className="fm-home-dossier-stack">
                  <article className="fm-home-dossier-card fm-home-dossier-card--rear">
                    <span>{dossierCopy.backMethodTitle}</span>
                    <p>{dossierCopy.backMethodLine}</p>
                  </article>

                  <article className="fm-home-dossier-card fm-home-dossier-card--middle">
                    <span>{dossierCopy.backUseTitle}</span>
                    <p>{dossierCopy.backUseLine}</p>
                  </article>

                  <article className="fm-home-dossier-card fm-home-dossier-card--front">
                    <div className="fm-home-dossier-head">
                      <span>{dossierCopy.title}</span>
                      <div className="fm-home-dossier-tags">
                        {dossierCopy.sourceTags.map((tag) => (
                          <i key={tag}>{tag}</i>
                        ))}
                      </div>
                    </div>

                    <p className="fm-home-dossier-summary">{dossierCopy.summary}</p>

                    <div className="fm-home-dossier-main">
                      <section className="fm-home-dossier-chart">
                        <svg viewBox="0 0 220 188" className="fm-home-dossier-radar" role="presentation">
                          <polygon points="110,18 183,59 183,129 110,170 37,129 37,59" className="fm-home-hero-radar-ring is-outer" />
                          <polygon points="110,38 167,70 167,118 110,150 53,118 53,70" className="fm-home-hero-radar-ring" />
                          <polygon points="110,61 146,82 146,106 110,127 74,106 74,82" className="fm-home-hero-radar-ring" />
                          <polygon points="110,29 170,63 157,123 110,146 69,114 61,66" className="fm-home-hero-radar-shape" />
                        </svg>
                        <div className="fm-home-dossier-fields">
                          {dossierCopy.fields.map((field) => (
                            <span key={field}>{field}</span>
                          ))}
                        </div>
                      </section>

                      <section className="fm-home-dossier-cues">
                        <div className="fm-home-dossier-cue-card">
                          <label>{dossierCopy.cueLabel}</label>
                          <strong>{dossierCopy.cueLead}</strong>
                        </div>
                        {dossierCopy.metrics.map((metric, index) => (
                          <div key={metric.label} className="fm-home-dossier-meter-row">
                            <div className="fm-home-dossier-meter-head">
                              <span>{metric.label}</span>
                              <b>{metric.value}</b>
                            </div>
                            <i className={cn(index === 0 && "is-long", index === 1 && "is-mid", index === 2 && "is-short")} />
                          </div>
                        ))}
                      </section>
                    </div>

                    <div className="fm-home-dossier-support">
                      <article>
                        <span>{dossierCopy.scenarioLabel}</span>
                        <p>{dossierCopy.scenarioLine}</p>
                      </article>
                      <article>
                        <span>{dossierCopy.nextLabel}</span>
                        <p>{dossierCopy.nextLine}</p>
                      </article>
                    </div>
                  </article>
                </div>
              </div>
            )}
          </div>
        </Container>
      </section>

      <section id="home-quick-start" className="fm-home-featured-tests-section bg-[#111922]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="fm-home-quick-start-shell">
            <div className="fm-home-featured-head">
              <div className="fm-home-featured-copy">
                <h2 className="fm-home-featured-title m-0 text-white">{copy.quickStart.title}</h2>
                <p className="fm-home-featured-subhead m-0 text-slate-300">{copy.quickStart.body}</p>
              </div>
              <Link href={withLocale("/tests")} prefetch={false} className="fm-home-featured-all-link">
                {locale === "zh" ? "查看全部测评" : "View all assessments"}
                <span aria-hidden>→</span>
              </Link>
            </div>

            <div className="fm-home-quick-grid fm-home-quick-grid--featured lg:grid-cols-6">
              {copy.quickStart.items.map((item, index) => (
                (() => {
                  const kind = resolveQuickCardKind(item.href);
                  const isPrimary = index < 2;
                  const isDepression = kind === "depression";
                  const depressionDescription = locale === "zh"
                    ? "标准版与学术专业版，用于确认当前状态基线。"
                    : "Standard and Academic Pro versions establish your current baseline.";

                  return (
                <article
                  key={item.title}
                  className={cn(
                    "fm-home-quick-card",
                    isPrimary ? "is-primary lg:col-span-3" : "is-secondary lg:col-span-2"
                  )}
                >
                  {isPrimary ? (
                    <>
                      <div className="fm-home-quick-primary-layout">
                        <div className="fm-home-quick-primary-content">
                          <div className="fm-home-quick-card-head">
                            <h3 className="m-0 text-[1.95rem] font-semibold tracking-[-0.035em] text-white">{item.title}</h3>
                          </div>

                          {item.variants?.length ? (
                            <div className="fm-home-quick-variants" aria-label={locale === "zh" ? "版本选择" : "Version options"}>
                              {item.variants.map((variant) => (
                                <div key={`${item.title}-${variant.title}`} className="fm-home-quick-variant">
                                  <p className="m-0">{variant.title}</p>
                                  <small>{variant.description}</small>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="fm-home-quick-card-body m-0">{item.description}</p>
                          )}
                        </div>

                        <div className={cn("fm-home-quick-primary-visual", kind === "mbti" ? "is-mbti" : "is-big5")} aria-hidden>
                          {kind === "mbti" ? (
                            <svg viewBox="0 0 192 192" role="presentation">
                              <rect x="18" y="18" width="156" height="156" rx="18" className="fm-home-quick-visual-frame" />
                              <path d="M57 18V174M96 18V174M135 18V174M18 57H174M18 96H174M18 135H174" className="fm-home-quick-visual-grid" />
                              <path d="M18 18L174 174M174 18L18 174" className="fm-home-quick-visual-grid-weak" />
                            </svg>
                          ) : (
                            <svg viewBox="0 0 210 192" role="presentation">
                              <rect x="18" y="20" width="174" height="152" rx="18" className="fm-home-quick-visual-frame" />
                              <path d="M55 138H170M55 114H157M55 90H145M55 66H131M55 42H118" className="fm-home-quick-visual-bar" />
                              <path d="M44 36V142" className="fm-home-quick-visual-axis" />
                            </svg>
                          )}
                        </div>
                      </div>
                      <div className="fm-home-quick-card-action">
                        <Link href={withLocale(item.href)} prefetch={false} className="fm-home-quick-card-link is-featured-primary">
                          {item.label ?? (locale === "zh" ? "查看入口" : "Open path")}
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="fm-home-quick-secondary-head">
                        <h3 className="m-0 text-[1.6rem] font-semibold tracking-[-0.03em] text-white">{item.title}</h3>
                        {kind === "iq" || kind === "eq" ? (
                          <span className={cn("fm-home-quick-secondary-icon", kind === "iq" ? "is-iq" : "is-eq")} aria-hidden>
                            {kind === "iq" ? "◫" : "≈"}
                          </span>
                        ) : null}
                      </div>
                      <p className="fm-home-quick-card-body m-0">
                        {isDepression ? depressionDescription : item.description}
                      </p>
                      {isDepression && item.variants?.length ? (
                        <div className="fm-home-quick-version-line" aria-label={locale === "zh" ? "版本" : "Versions"}>
                          {item.variants.map((variant) => (
                            <span key={`${item.title}-${variant.title}`}>{variant.title}</span>
                          ))}
                        </div>
                      ) : null}
                      <div className="fm-home-quick-card-action">
                        <Link href={withLocale(item.href)} prefetch={false} className="fm-home-quick-card-link is-featured-secondary">
                          {item.label ?? (locale === "zh" ? "查看入口" : "Open path")}
                        </Link>
                      </div>
                    </>
                  )}
                </article>
                  );
                })()
              ))}
            </div>
          </div>
        </Container>
      </section>

      <section id="home-featured-paths" className="bg-[#f4efe7] py-[var(--fm-space-24)] md:py-[8.5rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <SectionHeader kicker={copy.families.kicker} title={copy.families.title} body={copy.families.body} />

          <div className="fm-home-family-grid mt-12">
            {copy.families.items.map((family) => {
              if (family.title === (locale === "zh" ? "人格与风格" : "Personality and style")) {
                return (
                  <PersonalityFamilyPanel
                    key={family.title}
                    locale={locale}
                    withLocale={withLocale}
                    family={family}
                  />
                );
              }

              return (
                <article key={family.title} className="fm-home-family-panel">
                  <div className="space-y-2">
                    <h3 className="m-0 text-[1.28rem] font-semibold tracking-[-0.04em] text-slate-950">{family.title}</h3>
                    <p className="m-0 max-w-[28rem] text-[0.92rem] leading-7 text-slate-600">{family.description}</p>
                  </div>

                  <div className="fm-home-family-link-stack">
                    {family.links.map((link) => {
                      return (
                        <div key={`${family.title}-${link.title}`} className="fm-home-family-link-row">
                          <Link href={withLocale(link.href)} prefetch={false} className="fm-home-family-muted-link">
                            <span>{link.title}</span>
                            <span aria-hidden>+</span>
                          </Link>
                          {link.description ? <p className="fm-home-family-link-note m-0">{link.description}</p> : null}
                        </div>
                      );
                    })}
                  </div>

                  <Link href={withLocale(family.exploreHref)} prefetch={false} className="fm-home-family-explore">
                    {family.exploreLabel}
                    <span aria-hidden>+</span>
                  </Link>
                </article>
              );
            })}
          </div>
        </Container>
      </section>

      <section className="bg-[#ebe5db] py-[var(--fm-space-24)] md:py-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="space-y-10">
            <div className="fm-home-results-header">
              <p className="fm-home-section-kicker">{copy.results.kicker}</p>
              <h2 className={cn("fm-home-results-heading", locale === "zh" && "fm-home-results-heading--zh-single-line")}>
                {copy.results.title}
              </h2>
              <p className="fm-home-results-heading-body">{copy.results.body}</p>
            </div>
            <ResultsPreviewShowcase locale={locale} previews={copy.results.previews} />
          </div>
        </Container>
      </section>

      <section className="bg-[#10171f] pb-0 pt-[var(--fm-space-24)] md:pt-[8rem]">
        <Container className="max-w-[110rem] px-5 md:px-8 xl:px-12">
          <div className="fm-home-trust-wrap">
            <div className="grid gap-10 xl:grid-cols-[minmax(0,0.82fr)_minmax(0,1.18fr)] xl:items-start">
              <SectionHeader kicker={copy.trust.kicker} title={copy.trust.title} body={copy.trust.body} invert />
              <div className="space-y-3">
                {copy.trust.items.map((item) => (
                  <details key={item.title} className="fm-home-trust-item group">
                    <summary className="fm-home-trust-summary">
                      <div>
                        <p className="m-0 text-[0.98rem] font-semibold tracking-[-0.02em] text-white">{item.title}</p>
                        <p className="m-0 mt-1.5 max-w-[42rem] text-[0.92rem] leading-7 text-slate-400">{item.summary}</p>
                      </div>
                      <span className="fm-home-trust-plus" aria-hidden>
                        <span />
                        <span />
                      </span>
                    </summary>
                    <div className="fm-home-trust-body">
                      {item.paragraphs[0] ? <p className="m-0 text-[0.9rem] leading-7 text-slate-300">{item.paragraphs[0]}</p> : null}
                      {item.href && item.hrefLabel ? (
                        <Link href={withLocale(item.href)} prefetch={false} className="fm-home-inline-link inline-flex items-center gap-2 text-white">
                          {item.hrefLabel}
                          <span aria-hidden>+</span>
                        </Link>
                      ) : null}
                    </div>
                  </details>
                ))}
              </div>
            </div>
            <div className="fm-home-trust-footer-divider" aria-hidden />
          </div>
        </Container>
      </section>
    </>
  );
}
