import type { CareerSalaryAssetPreviewAsset, CareerSalaryAssetPreviewReference } from "@/lib/career/api/fetchCareerSalaryAssetPreview";
import type { Locale } from "@/lib/i18n/locales";

type CareerSalaryAssetPreviewSectionProps = {
  asset: CareerSalaryAssetPreviewAsset | null;
  locale: Locale;
};

const RAW_ENUM_PATTERN =
  /\b(?:industry_proxy|source_bounded_reference_only|recruitment_sample|salary_and_outlook|macro_context_only|exact_soc|low_confidence_adjacent_range|platform_salary_page|official_wage_reference)\b/i;

const ZH_TRANSLATION_RULES: Array<[RegExp, string]> = [
  [
    /This is a China recruitment-market reference derived from platform samples, posting snippets, salary pages, or adjacent-role evidence; it is not an official Chinese single-occupation median wage\./i,
    "这是基于平台样本、招聘片段、薪资页或相邻岗位证据形成的中国招聘市场参考，不是中国官方单职业中位薪资。",
  ],
  [
    /China recruitment estimates are platform, posting, or salary-report signals only; they are not official Chinese single-occupation wages and not personal salary predictions\./i,
    "中国招聘薪资仅是平台、岗位片段或薪资报告信号，不是中国官方单职业工资，也不能作为个人薪资预测。",
  ],
  [
    /OOH 10th\/90th percentile evidence was captured where visible; p25\/p75 still require OEWS or CareerOneStop extraction\./i,
    "美国 OOH 可见的 10/90 分位证据按来源边界阅读；p25/p75 未由 OEWS 或 CareerOneStop 捕获时保持为空。",
  ],
  [
    /p25\/p75 are left null pending a systematic BLS OEWS\/CareerOneStop percentile pipeline\./i,
    "p25/p75 未由已通过证据账本捕获时保持为空，不补造分位数。",
  ],
  [
    /p25 is not filled because the passed evidence ledger did not capture an official p25 value from OEWS or CareerOneStop\./i,
    "p25 未由 OEWS 或 CareerOneStop 的已通过证据捕获时保持为空。",
  ],
  [
    /Auditor profile also exists but salary not captured in this pass\./i,
    "英国审计师 profile 可作为边界参考；本轮未捕获该 profile 的薪资数字。",
  ],
  [
    /Do not present this as a unified EU occupation salary; use only as regional\/macro boundary unless occupation-level EU data is later captured\./i,
    "欧盟部分只作为区域或宏观边界；除非后续取得职业级欧盟数据，否则不写成统一欧洲职业薪资。",
  ],
  [
    /EU evidence is macro\/regional context only and must not be presented as an EU occupation-specific salary\./i,
    "欧盟证据仅用于宏观或区域语境，不得作为欧盟职业专项薪资。",
  ],
];

function isLikelyEnglishProse(value: string): boolean {
  const latinWords = value.match(/[A-Za-z]{3,}/g)?.length ?? 0;
  const cjkChars = value.match(/[\u3400-\u9fff]/g)?.length ?? 0;
  return latinWords >= 6 && cjkChars < 4;
}

function localizeText(value: string, locale: Locale): string | null {
  if (locale === "zh") {
    const translated = ZH_TRANSLATION_RULES.find(([pattern]) => pattern.test(value))?.[1];
    if (translated) {
      return translated;
    }

    return isLikelyEnglishProse(value) ? null : value;
  }

  return /[\u3400-\u9fff]/.test(value) ? null : value;
}

function textOrNull(value: string | null | undefined, locale: Locale): string | null {
  const normalized = String(value ?? "").trim();
  if (!normalized || RAW_ENUM_PATTERN.test(normalized)) {
    return null;
  }

  return localizeText(normalized, locale);
}

function hasReferenceContent(reference: CareerSalaryAssetPreviewReference | undefined, locale: Locale): reference is CareerSalaryAssetPreviewReference {
  return Boolean(
    textOrNull(reference?.heading, locale) ||
      textOrNull(reference?.body, locale) ||
      textOrNull(reference?.display_monthly_range_cny, locale) ||
      textOrNull(reference?.data_boundary, locale) ||
      reference?.limitations?.some((item) => textOrNull(item, locale))
  );
}

function isSparseBoundaryOnlyReference(reference: CareerSalaryAssetPreviewReference | undefined, locale: Locale): boolean {
  const range = textOrNull(reference?.display_monthly_range_cny, locale);
  const body = textOrNull(reference?.body, locale);
  const boundary = textOrNull(reference?.data_boundary, locale);
  const limitations = (reference?.limitations ?? []).map((item) => textOrNull(item, locale)).filter(Boolean);

  return !range && limitations.length === 0 && Boolean(body || boundary);
}

function ReferenceCard({
  reference,
  fallbackTitle,
  locale,
}: {
  reference: CareerSalaryAssetPreviewReference | undefined;
  fallbackTitle: string;
  locale: Locale;
}) {
  if (!hasReferenceContent(reference, locale)) {
    return null;
  }

  const title = textOrNull(reference.heading, locale) ?? fallbackTitle;
  const range = textOrNull(reference.display_monthly_range_cny, locale);
  const body = textOrNull(reference.body, locale);
  const boundary = textOrNull(reference.data_boundary, locale);
  const limitations = (reference.limitations ?? [])
    .map((item) => textOrNull(item, locale))
    .filter((item): item is string => item !== null)
    .slice(0, 3);

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="m-0 text-lg font-semibold tracking-normal text-slate-950">{title}</h3>
      {range ? <p className="m-0 mt-3 text-2xl font-semibold tracking-normal text-slate-950">{range}</p> : null}
      {body ? <p className="m-0 mt-3 text-sm leading-7 text-slate-600">{body}</p> : null}
      {boundary ? <p className="m-0 mt-3 text-xs leading-6 text-slate-500">{boundary}</p> : null}
      {limitations.length > 0 ? (
        <ul className="m-0 mt-4 list-disc space-y-2 pl-5 text-xs leading-6 text-slate-500">
          {limitations.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}

function SectionList({ title, items, locale }: { title: string; items: string[]; locale: Locale }) {
  const visibleItems = items
    .map((item) => textOrNull(item, locale))
    .filter((item): item is string => item !== null)
    .slice(0, 5);
  if (visibleItems.length === 0) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="m-0 text-lg font-semibold tracking-normal text-slate-950">{title}</h3>
      <ul className="m-0 mt-4 list-disc space-y-2 pl-5 text-sm leading-7 text-slate-600">
        {visibleItems.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export function CareerSalaryAssetPreviewSection({ asset, locale }: CareerSalaryAssetPreviewSectionProps) {
  if (!asset) {
    return null;
  }

  const heading = textOrNull(asset.heading, locale);
  if (!heading) {
    return null;
  }

  const summary = textOrNull(asset.summary?.short_answer, locale);
  const salaryDrivers = (asset.salary_drivers ?? [])
    .map((item) => [textOrNull(item.factor, locale), textOrNull(item.description, locale)].filter(Boolean).join(": "))
    .filter(Boolean);
  const sourceItems = (asset.sources ?? [])
    .map((source) => {
      const name = textOrNull(source.name?.replace(/^\//, ""), locale);
      const market = textOrNull(source.market, locale);
      return name && market ? `${market}: ${name}` : name;
    })
    .filter((item): item is string => Boolean(item))
    .slice(0, 6);
  const chinaOfficialContextNote = isSparseBoundaryOnlyReference(asset.china_official_context, locale)
    ? textOrNull(asset.china_official_context?.body, locale) ?? textOrNull(asset.china_official_context?.data_boundary, locale)
    : null;

  return (
    <section
      className="space-y-6 rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm md:p-7"
      data-testid="career-salary-asset-preview"
    >
      <div className="max-w-4xl">
        <h2 className="m-0 text-2xl font-semibold tracking-normal text-slate-950 md:text-3xl">{heading}</h2>
        {summary ? <p className="m-0 mt-3 text-base leading-8 text-slate-700">{summary}</p> : null}
        {chinaOfficialContextNote ? (
          <p className="m-0 mt-3 rounded-md border border-emerald-200 bg-white/70 px-3 py-2 text-sm leading-7 text-slate-600">
            {chinaOfficialContextNote}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReferenceCard
          reference={asset.china_recruitment_reference}
          fallbackTitle={locale === "zh" ? "中国招聘市场参考" : "China recruitment-market reference"}
          locale={locale}
        />
        {chinaOfficialContextNote ? null : (
          <ReferenceCard
            reference={asset.china_official_context}
            fallbackTitle={locale === "zh" ? "中国官方工资语境" : "China official wage context"}
            locale={locale}
          />
        )}
        <ReferenceCard
          reference={asset.us_official_reference}
          fallbackTitle={locale === "zh" ? "美国官方参考" : "US official reference"}
          locale={locale}
        />
        <ReferenceCard reference={asset.uk_reference} fallbackTitle={locale === "zh" ? "英国参考" : "UK reference"} locale={locale} />
        <ReferenceCard
          reference={asset.eu_context_boundary}
          fallbackTitle={locale === "zh" ? "欧盟语境边界" : "EU context boundary"}
          locale={locale}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionList title={locale === "zh" ? "影响薪资的因素" : "Salary drivers"} items={salaryDrivers} locale={locale} />
        <SectionList title={locale === "zh" ? "如何阅读这些数据" : "How to read this"} items={asset.reader_guidance ?? []} locale={locale} />
      </div>

      <SectionList title={locale === "zh" ? "来源" : "Sources"} items={sourceItems} locale={locale} />
    </section>
  );
}
