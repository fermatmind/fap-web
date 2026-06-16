import type { CareerSalaryAssetPreviewAsset, CareerSalaryAssetPreviewReference } from "@/lib/career/api/fetchCareerSalaryAssetPreview";
import type { Locale } from "@/lib/i18n/locales";

type CareerSalaryAssetPreviewSectionProps = {
  asset: CareerSalaryAssetPreviewAsset | null;
  locale: Locale;
};

const RAW_ENUM_PATTERN =
  /\b(?:industry_proxy|source_bounded_reference_only|recruitment_sample|salary_and_outlook|macro_context_only|exact_soc|low_confidence_adjacent_range|platform_salary_page|official_wage_reference)\b/i;

function textOrNull(value: string | null | undefined): string | null {
  const normalized = String(value ?? "").trim();
  if (!normalized || RAW_ENUM_PATTERN.test(normalized)) {
    return null;
  }

  return normalized;
}

function hasReferenceContent(reference: CareerSalaryAssetPreviewReference | undefined): reference is CareerSalaryAssetPreviewReference {
  return Boolean(
    textOrNull(reference?.heading) ||
      textOrNull(reference?.body) ||
      textOrNull(reference?.display_monthly_range_cny) ||
      textOrNull(reference?.data_boundary) ||
      reference?.limitations?.some((item) => textOrNull(item))
  );
}

function ReferenceCard({
  reference,
  fallbackTitle,
}: {
  reference: CareerSalaryAssetPreviewReference | undefined;
  fallbackTitle: string;
}) {
  if (!hasReferenceContent(reference)) {
    return null;
  }

  const title = textOrNull(reference.heading) ?? fallbackTitle;
  const range = textOrNull(reference.display_monthly_range_cny);
  const body = textOrNull(reference.body);
  const boundary = textOrNull(reference.data_boundary);
  const limitations = (reference.limitations ?? []).map(textOrNull).filter((item): item is string => item !== null).slice(0, 3);

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

function SectionList({ title, items }: { title: string; items: string[] }) {
  const visibleItems = items.map(textOrNull).filter((item): item is string => item !== null).slice(0, 5);
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

  const heading = textOrNull(asset.heading);
  if (!heading) {
    return null;
  }

  const summary = textOrNull(asset.summary?.short_answer);
  const salaryDrivers = (asset.salary_drivers ?? [])
    .map((item) => [textOrNull(item.factor), textOrNull(item.description)].filter(Boolean).join(": "))
    .filter(Boolean);
  const sourceItems = (asset.sources ?? [])
    .map((source) => {
      const name = textOrNull(source.name?.replace(/^\//, ""));
      const market = textOrNull(source.market);
      return name && market ? `${market}: ${name}` : name;
    })
    .filter((item): item is string => Boolean(item))
    .slice(0, 6);

  return (
    <section
      className="space-y-6 rounded-lg border border-emerald-200 bg-emerald-50/60 p-5 shadow-sm md:p-7"
      data-testid="career-salary-asset-preview"
    >
      <div className="max-w-4xl">
        <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
          {locale === "zh" ? "薪资与就业参考" : "Salary and outlook reference"}
        </p>
        <h2 className="m-0 mt-2 text-2xl font-semibold tracking-normal text-slate-950 md:text-3xl">{heading}</h2>
        {summary ? <p className="m-0 mt-3 text-base leading-8 text-slate-700">{summary}</p> : null}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <ReferenceCard
          reference={asset.china_recruitment_reference}
          fallbackTitle={locale === "zh" ? "中国招聘市场参考" : "China recruitment-market reference"}
        />
        <ReferenceCard
          reference={asset.china_official_context}
          fallbackTitle={locale === "zh" ? "中国官方工资语境" : "China official wage context"}
        />
        <ReferenceCard
          reference={asset.us_official_reference}
          fallbackTitle={locale === "zh" ? "美国官方参考" : "US official reference"}
        />
        <ReferenceCard reference={asset.uk_reference} fallbackTitle={locale === "zh" ? "英国参考" : "UK reference"} />
        <ReferenceCard
          reference={asset.eu_context_boundary}
          fallbackTitle={locale === "zh" ? "欧盟语境边界" : "EU context boundary"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <SectionList title={locale === "zh" ? "影响薪资的因素" : "Salary drivers"} items={salaryDrivers} />
        <SectionList title={locale === "zh" ? "如何阅读这些数据" : "How to read this"} items={asset.reader_guidance ?? []} />
      </div>

      <SectionList title={locale === "zh" ? "来源" : "Sources"} items={sourceItems} />
    </section>
  );
}
