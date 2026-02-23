import Link from "next/link";
import { Container } from "@/components/layout/Container";
import type { TestListItem } from "@/lib/content";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import type { SiteDictionary } from "@/lib/i18n/types";

function renderStars(rating: number) {
  const rounded = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <div className="flex items-center gap-1 text-[var(--fm-gold)]" aria-label={`rating-${rounded}`}>
      {Array.from({ length: 5 }, (_, idx) => (
        <span key={idx} aria-hidden className={idx < rounded ? "opacity-100" : "opacity-35"}>
          ★
        </span>
      ))}
    </div>
  );
}

function localizedTagline(test: TestListItem, locale: Locale): string {
  const source = test.card_tagline_i18n;
  if (!source) return test.scale_code ?? "Assessment";
  const direct = locale === "zh" ? source.zh ?? source["zh-CN"] : source.en;
  if (typeof direct === "string" && direct.trim().length > 0) return direct.trim();
  return test.scale_code ?? "Assessment";
}

function fallbackSeoCopy(test: TestListItem, locale: Locale): string {
  if (locale === "zh") {
    return `${test.title} 基于结构化心理测评框架，覆盖题项反应、维度评分和可解释报告输出。通过统一量表与标准化流程，帮助你在职业选择、协作沟通与自我成长上获得可行动的结论。`;
  }
  return `${test.title} follows a structured assessment framework with standardized scoring and interpretable reporting. It supports practical decisions across career choice, collaboration patterns, and personal growth planning.`;
}

export function HighlightedTestsSection({
  dict,
  locale,
  tests,
}: {
  dict: SiteDictionary;
  locale: Locale;
  tests: TestListItem[];
}) {
  const withLocale = (path: string) => localizedPath(path, locale);

  return (
    <section className="fm-section-teal py-20 text-white">
      <Container className="space-y-10">
        <div className="space-y-2 text-center">
          <h2 className="m-0 font-serif text-3xl font-semibold">{dict.home.highlighted.title}</h2>
          <p className="m-0 text-teal-50/85">{dict.home.highlighted.subtitle}</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tests.map((test) => (
            <div key={test.slug} className="flex h-full flex-col gap-4">
              <article className="flex h-full flex-col rounded-2xl bg-white p-6 text-[var(--fm-text)] shadow-[var(--fm-shadow-lg)]">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    href={withLocale(`/tests/${test.slug}`)}
                    className="font-serif text-xl font-semibold leading-tight text-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue-strong)]"
                  >
                    {test.title}
                  </Link>
                  {renderStars(5)}
                </div>
                <p className="mt-3 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--fm-text-muted)]">
                  {localizedTagline(test, locale)}
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--fm-text-muted)]">{test.description}</p>
                <div className="mt-auto pt-5">
                  <Link
                    href={withLocale(`/tests/${test.slug}/take`)}
                    className="text-sm font-semibold text-[var(--fm-trust-blue)] hover:text-[var(--fm-trust-blue-strong)]"
                  >
                    {dict.home.highlighted.cta} →
                  </Link>
                </div>
              </article>

              <p className="m-0 px-1 text-sm leading-7 text-teal-50/85">{fallbackSeoCopy(test, locale)}</p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
