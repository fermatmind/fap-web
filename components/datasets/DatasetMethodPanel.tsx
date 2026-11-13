import Link from "next/link";
import { EvidenceDrawer } from "@/components/career/v1/EvidenceDrawer";
import type { CareerDatasetMethodGuide } from "@/lib/career/adapters/types";
import { localizedPath, type Locale } from "@/lib/i18n/locales";

type DatasetMethodPanelProps = {
  locale: Locale;
  readerGuide: CareerDatasetMethodGuide | null;
  title: string;
  summary: string;
  sourceSummary: string;
  reviewDisciplineSummary: string;
  included: string[];
  excluded: string[];
  boundaryNotes: string[];
  scopeSummary: {
    memberCount: number;
    includedCount: number;
    excludedCount: number;
    releaseCohortCounts: Record<string, number>;
    strongIndexDecisionCounts: Record<string, number>;
  };
  publication: {
    publisherName: string;
    publisherUrl: string;
    licenseName: string;
    licenseUrl: string;
    usageSummary: string;
    downloadUrl: string;
  };
};

export function DatasetMethodPanel({ locale, readerGuide, title, summary, sourceSummary, reviewDisciplineSummary, included, excluded, boundaryNotes, scopeSummary, publication }: DatasetMethodPanelProps) {
  const label = (zh: string, en: string) => locale === "zh" ? zh : en;
  const usageSummary = locale === "zh" && publication.usageSummary ===
    "Public viewing and on-site exploration allowed; redistribution, bulk extraction, and mirrored republication require explicit permission."
    ? "可以公开浏览及在站内探索。再分发、批量提取或镜像转载需获得明确许可。"
    : publication.usageSummary;
  return (
    <section className="space-y-8" data-testid="dataset-method-panel">
      <header className="mx-auto max-w-4xl space-y-4 text-center">
        <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{title}</h1>
        <p className="mx-auto m-0 max-w-2xl text-base leading-7 text-slate-500">{readerGuide?.intro ?? summary}</p>
      </header>

      {readerGuide?.sections.map((section) => (
        <section key={section.id} id={section.id} aria-labelledby={`${section.id}-title`} className="mx-auto max-w-4xl space-y-3 rounded-3xl border border-slate-200 bg-white p-5 md:p-6">
          <h2 id={`${section.id}-title`} className="m-0 text-xl font-semibold text-slate-950">{section.title}</h2>
          <p className="m-0 leading-7 text-slate-700">{section.body}</p>
          <ul className="m-0 flex list-none flex-wrap gap-x-5 gap-y-2 p-0 text-sm">
            {section.sources.map((source) => (
              <li key={source.href}>
                <PublicationLink href={source.href.startsWith("/") ? localizedPath(source.href, locale) : source.href}>
                  {source.label}
                </PublicationLink>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <h2 className="m-0 text-2xl font-semibold text-slate-950">{label("数据集收录与使用范围", "Dataset scope and terms of use")}</h2>
      <div className="grid gap-4 md:grid-cols-3">
        <Metric label={label("跟踪的职业条目", "Tracked occupations")} value={String(scopeSummary.memberCount)} />
        <Metric label={label("公开纳入", "Included publicly")} value={String(scopeSummary.includedCount)} />
        <Metric label={label("排除在公开详情之外", "Excluded from public detail")} value={String(scopeSummary.excludedCount)} />
      </div>

      <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <h2 className="m-0 text-2xl font-semibold tracking-tight text-slate-950">{label("来源与审核", "Sources and review")}</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <CopyBlock title={label("数据来源", "Sources")} body={sourceSummary} />
          <CopyBlock title={label("审核方式", "Review discipline")} body={reviewDisciplineSummary} />
        </div>
        <p className="m-0 mt-5 text-sm leading-6 text-slate-500">{usageSummary}</p>
        <div className="mt-4 flex flex-wrap gap-3 text-sm">
          <PublicationLink href={publication.publisherUrl}>{publication.publisherName}</PublicationLink>
          {publication.licenseName ? <span>{label("费马职业数据库自有许可", publication.licenseName)}</span> : null}
        </div>
      </section>

      <div className="space-y-3">
        <EvidenceDrawer title={label("查看纳入与排除范围", "View inclusion boundary")} testId="dataset-method-inclusion-drawer">
          <List title={label("纳入内容", "Included")} items={included} />
          <List title={label("排除内容", "Excluded")} items={excluded} />
        </EvidenceDrawer>
        <EvidenceDrawer title={label("查看方法边界", "View method boundary")} testId="dataset-method-boundary-drawer">
          <List title={label("边界说明", "Boundary notes")} items={boundaryNotes} />
        </EvidenceDrawer>
        <EvidenceDrawer title={label("查看发布状态分布", "View technical distributions")} testId="dataset-method-distribution-drawer">
          <Facet title={label("发布分组", "Release cohort distribution")} facet={scopeSummary.releaseCohortCounts} locale={locale} />
          <Facet title={label("索引资格分布", "Strong-index decision distribution")} facet={scopeSummary.strongIndexDecisionCounts} locale={locale} />
        </EvidenceDrawer>
      </div>
    </section>
  );
}

function PublicationLink({ href, children }: { href: string; children: string }) {
  if (!href || !children) {
    return null;
  }

  return (
    <Link href={href} className="font-semibold text-orange-600 hover:text-orange-700">
      {children}
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 text-center shadow-sm">
      <p className="m-0 text-xs font-medium uppercase tracking-[0.16em] text-slate-400">{label}</p>
      <p className="m-0 mt-3 text-4xl font-semibold tracking-tight text-slate-950">{value}</p>
    </div>
  );
}

function CopyBlock({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h2 className="m-0 text-base font-semibold text-slate-950">{title}</h2>
      <p className="m-0 mt-2 text-sm leading-6 text-slate-500">{body}</p>
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="m-0 text-base font-semibold text-slate-950">{title}</h2>
      <ul className="m-0 mt-2 list-disc space-y-1 pl-5">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

const zhFacetLabels: Record<string, string> = {
  public_detail_indexable: "公开详情可索引",
  strong_index_ready: "已通过索引资格检查",
};

function Facet({ title, facet, locale }: { title: string; facet: Record<string, number>; locale: Locale }) {
  const entries = Object.entries(facet).sort((left, right) => right[1] - left[1]);
  if (entries.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="m-0 text-base font-semibold text-slate-950">{title}</h2>
      <ul className="m-0 mt-2 list-disc space-y-1 pl-5">
        {entries.map(([key, value]) => (
          <li key={`${title}-${key}`}>{locale === "zh" ? zhFacetLabels[key] ?? key : key}: {value}</li>
        ))}
      </ul>
    </div>
  );
}
