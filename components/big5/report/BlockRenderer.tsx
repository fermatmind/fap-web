import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BIG5_DOMAIN_LABELS, type Big5DomainCode } from "@/lib/big5/taxonomy";

type Block = { id?: string; kind?: string; title?: string; body?: string; bullets?: string[]; tips?: string[]; tags?: string[]; metric_code?: string; bucket?: string; percentile?: number | string | null; component?: string; resolved_copy?: Record<string, unknown>; [key: string]: unknown };

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}
function text(value: unknown): string { return typeof value === "string" ? value.trim() : ""; }
function list(value: unknown): string[] { return Array.isArray(value) ? value.map(text).filter(Boolean) : []; }
function percentile(value: unknown): number | null {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? Math.max(0, Math.min(100, parsed)) : null;
}
function domainLabel(code: unknown, locale: "en" | "zh"): string {
  const normalized = text(code).toUpperCase() as Big5DomainCode;
  return BIG5_DOMAIN_LABELS[normalized]?.[locale] ?? "";
}
function bandLabel(value: unknown, locale: "en" | "zh"): string {
  const labels = locale === "zh"
    ? { low: "较低", low_mid: "中低", mid: "中等", high_mid: "中高", high: "较高", not_available: "暂无" }
    : { low: "Lower", low_mid: "Lower-mid", mid: "Mid-range", high_mid: "Upper-mid", high: "Higher", not_available: "Unavailable" };
  return labels[text(value).toLowerCase() as keyof typeof labels] ?? "";
}
function Badge({ children }: { children: string }) {
  return children ? <span className="rounded-full border border-slate-300 px-2 py-0.5 text-xs text-slate-600">{children}</span> : null;
}

function QualityNotice({ copy, retakeHref }: { copy: Record<string, unknown>; retakeHref?: string }) {
  const grade = text(copy.grade).toUpperCase();
  return <aside data-testid="big5-quality-notice" className="rounded-2xl border-2 border-rose-300 bg-rose-50 p-5 text-rose-950">
    <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="m-0 text-base font-semibold">{text(copy.title)}</h4>{grade ? <Badge>{grade}</Badge> : null}</div>
    {text(copy.body) ? <p className="mt-2 whitespace-pre-wrap text-sm">{text(copy.body)}</p> : null}
    {text(copy.why) ? <p className="mt-2 whitespace-pre-wrap text-sm text-rose-800">{text(copy.why)}</p> : null}
    {retakeHref && text(copy.retest_label) ? <Link href={retakeHref} className={`${buttonVariants({ variant: "outline" })} mt-4 border-rose-300 bg-white text-rose-900`}>{text(copy.retest_label)}</Link> : null}
  </aside>;
}

function SynergyCallout({ copy, locale, showPrecise }: { copy: Record<string, unknown>; locale: "en" | "zh"; showPrecise: boolean }) {
  const evidence = Array.isArray(copy.evidence) ? copy.evidence.map(record).filter(Boolean) as Record<string, unknown>[] : [];
  const fields = [copy.mechanism, copy.strengths, copy.tradeoffs, copy.context_boundary, copy.action_bridge].map(text).filter(Boolean);
  return <article data-testid="big5-synergy-callout" data-evidence-mode={showPrecise ? "precise" : "provisional"} className="rounded-2xl border border-indigo-200 bg-indigo-50/70 p-5">
    <h4 className="m-0 text-base font-semibold text-indigo-950">{text(copy.headline)}</h4>
    {evidence.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{evidence.map((item, index) => {
      const label = domainLabel(item.code, locale); const value = percentile(item.percentile);
      return label ? <Badge key={`${label}-${index}`}>{value === null || !showPrecise ? label : `${label} · ${value}`}</Badge> : null;
    })}</div> : null}
    <div className="mt-3 space-y-2 text-sm text-indigo-950">{fields.map((field) => <p key={field} className="m-0 whitespace-pre-wrap">{field}</p>)}</div>
  </article>;
}

function NormEvidenceCard({ copy, locale }: { copy: Record<string, unknown>; locale: "en" | "zh" }) {
  const allowed = copy.comparison_allowed === true;
  const details = allowed ? [text(copy.sample_label), text(copy.match_label), [text(copy.locale), text(copy.region), text(copy.gender), text(copy.age_range)].filter(Boolean).join(" · "), copy.sample_n ? `${locale === "zh" ? "样本量" : "Sample"} · ${String(copy.sample_n)}` : "", text(copy.norm_version) ? `${locale === "zh" ? "版本" : "Version"} · ${text(copy.norm_version)}` : ""].filter(Boolean) : [];
  return <article data-testid="big5-norm-evidence" className="rounded-2xl border border-sky-200 bg-sky-50 p-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="m-0 font-semibold text-sky-950">{text(copy.status_label)}</h4>{text(copy.status_label) ? <Badge>{text(copy.status_label)}</Badge> : null}</div>
    {details.length > 0 ? <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-sky-950">{details.map((item) => <li key={item}>{item}</li>)}</ul> : null}
    {text(copy.percentile_explanation) ? <p className="mt-3 text-sm text-sky-900">{text(copy.percentile_explanation)}</p> : null}
    {text(copy.unavailable_explanation) ? <p className="mt-3 text-sm text-sky-900">{text(copy.unavailable_explanation)}</p> : null}
  </article>;
}

function FacetCard({ copy, locale, showPrecise }: { copy: Record<string, unknown>; locale: "en" | "zh"; showPrecise: boolean }) {
  const values = [text(copy.body), text(copy.why_it_matters), text(copy.daily_meaning), text(copy.evidence)].filter(Boolean);
  const trait = domainLabel(copy.domain_code, locale); const delta = percentile(copy.delta_abs);
  return <article data-testid="big5-facet-anomaly" data-evidence-mode={showPrecise ? "precise" : "provisional"} className="rounded-xl border border-violet-200 bg-white p-4 shadow-sm">
    <div className="flex flex-wrap items-center justify-between gap-2"><h4 className="m-0 font-semibold text-slate-900">{text(copy.title)}</h4>{trait ? <Badge>{delta === null || !showPrecise ? trait : `${trait} · Δ${delta}`}</Badge> : null}</div>
    <div className="mt-2 space-y-2 text-sm text-slate-700">{values.map((value) => <p key={value} className="m-0 whitespace-pre-wrap">{value}</p>)}</div>
  </article>;
}

function ActionCards({ copy, locale, showPrecise }: { copy: Record<string, unknown>; locale: "en" | "zh"; showPrecise: boolean }) {
  const items = Array.isArray(copy.items) ? copy.items.map(record).filter(Boolean) as Record<string, unknown>[] : [];
  return <div data-testid="big5-action-matrix" data-evidence-mode={showPrecise ? "precise" : "provisional"} className="space-y-3">
    {text(copy.title) ? <h4 className="m-0 font-semibold text-slate-900">{text(copy.title)}</h4> : null}
    {items.map((item, index) => <article key={`${text(item.title)}-${index}`} className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4">
      <div className="flex flex-wrap items-center justify-between gap-2"><h5 className="m-0 font-semibold text-emerald-950">{text(item.label) || text(item.title)}</h5><div className="flex gap-2">{text(item.time_horizon_label) ? <Badge>{text(item.time_horizon_label)}</Badge> : null}{text(item.difficulty_label) ? <Badge>{text(item.difficulty_label)}</Badge> : null}</div></div>
      {text(item.title) && text(item.label) ? <p className="mt-2 font-medium text-emerald-950">{text(item.title)}</p> : null}
      {text(item.body) ? <p className="mt-1 whitespace-pre-wrap text-sm text-emerald-950">{text(item.body)}</p> : null}
      {text(item.why_recommended) ? <p className="mt-2 text-sm text-emerald-900"><span className="font-semibold">{locale === "zh" ? "为什么推荐：" : "Why this fits: "}</span>{text(item.why_recommended)}</p> : null}
      {text(item.completion_signal) ? <p className="mt-2 text-sm text-emerald-900"><span className="font-semibold">{locale === "zh" ? "完成信号：" : "Completion signal: "}</span>{text(item.completion_signal)}</p> : null}
      {Array.isArray(item.evidence) ? <div className="mt-3 flex flex-wrap gap-2">{item.evidence.map(record).filter(Boolean).map((evidence, evidenceIndex) => {
        const label = domainLabel(evidence?.code, locale); const value = percentile(evidence?.percentile);
        return label ? <Badge key={`${label}-${evidenceIndex}`}>{value === null || !showPrecise ? label : `${label} · ${value}`}</Badge> : null;
      })}</div> : null}
    </article>)}
  </div>;
}

function ActionPriority({ copy }: { copy: Record<string, unknown> }) {
  return <article data-testid="big5-action-priority" className="rounded-xl border-2 border-emerald-300 bg-emerald-50 p-4">
    {text(copy.title) ? <h4 className="m-0 font-semibold text-emerald-950">{text(copy.title)}</h4> : null}
    {text(copy.body) ? <p className="mt-2 text-sm text-emerald-950">{text(copy.body)}</p> : null}
    {text(copy.why_priority) ? <p className="mt-2 text-sm text-emerald-900">{text(copy.why_priority)}</p> : null}
  </article>;
}

export function BlockRenderer({ block, locale = "en", retakeHref, showPrecisePercentiles = true }: { block: Block; sectionKey: string; normsStatus?: string; locale?: "en" | "zh"; retakeHref?: string; showPrecisePercentiles?: boolean }) {
  const component = text(block.component); const copy = record(block.resolved_copy) ?? {};
  if (component === "BigFiveQualityNotice") return <QualityNotice copy={copy} retakeHref={retakeHref} />;
  if (component === "BigFiveSynergyCallout") return <SynergyCallout copy={copy} locale={locale} showPrecise={showPrecisePercentiles} />;
  if (component === "BigFiveNormEvidenceCard") return <NormEvidenceCard copy={copy} locale={locale} />;
  if (component === "BigFiveFacetAnomalyCard") return <FacetCard copy={copy} locale={locale} showPrecise={showPrecisePercentiles} />;
  if (component === "BigFiveActionMatrixScenarioBullets") return <ActionCards copy={copy} locale={locale} showPrecise={showPrecisePercentiles} />;
  if (component === "BigFiveActionMatrixTopPriority") return <ActionPriority copy={copy} />;

  const kind = text(block.kind).toLowerCase(); const title = text(block.title); const body = text(block.body); const bullets = list(block.bullets); const tips = list(block.tips); const tags = list(block.tags); const metricPercentile = percentile(block.percentile); const bucket = bandLabel(block.bucket, locale);
  if (!title && !body && bullets.length === 0) return null;
  if (kind === "callout") return <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">{title ? <p className="m-0 font-semibold">{title}</p> : null}{body ? <p className="m-0 mt-1 whitespace-pre-wrap">{body}</p> : null}{bullets.length > 0 ? <ul className="mb-0 mt-2 list-disc space-y-1 pl-5">{bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}</div>;
  if (kind === "bullets") return <Card>{title ? <CardHeader className="pb-2"><CardTitle className="text-base">{title}</CardTitle></CardHeader> : null}<CardContent>{body ? <p className="m-0 mb-2 text-sm text-slate-700">{body}</p> : null}<ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">{bullets.map((item) => <li key={item}>{item}</li>)}</ul></CardContent></Card>;
  if (kind === "metric_card" || kind === "chart") return <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"><div className="mb-1 flex items-center justify-between gap-2">{title || text(block.metric_code) ? <p className="m-0 text-sm font-semibold text-slate-900">{title || text(block.metric_code)}</p> : null}<Badge>{bucket}</Badge></div>{metricPercentile !== null && showPrecisePercentiles ? <div className="h-2 overflow-hidden rounded-full bg-slate-200" role="progressbar" aria-valuenow={metricPercentile} aria-valuemin={0} aria-valuemax={100}><div className="h-full bg-sky-700" style={{ width: `${metricPercentile}%` }} /></div> : null}{body ? <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">{body}</p> : null}{bullets.length > 0 ? <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-700">{bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}{tips.length > 0 ? <ul className="mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">{tips.map((item) => <li key={item}>{item}</li>)}</ul> : null}{tags.length > 0 ? <div className="mt-3 flex flex-wrap gap-2">{tags.map((tag) => <Badge key={tag}>{tag}</Badge>)}</div> : null}</div>;
  if (kind === "table_row") return <div className="grid grid-cols-[minmax(0,1fr)_120px] gap-2 border-b border-slate-100 py-2 text-sm"><div>{title || text(block.metric_code) ? <p className="m-0 font-medium text-slate-900">{title || text(block.metric_code)}</p> : null}{body ? <p className="m-0 whitespace-pre-wrap text-slate-600">{body}</p> : null}{bullets.length > 0 ? <ul className="mb-0 mt-1 list-disc pl-5 text-slate-600">{bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}</div><div className="text-right text-slate-500">{bucket}</div></div>;
  if (kind === "paragraph") return <div className="rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">{title ? <p className="m-0 mb-1 font-semibold text-slate-900">{title}</p> : null}{body ? <p className="m-0 whitespace-pre-wrap">{body}</p> : null}{bullets.length > 0 ? <ul className="mb-0 mt-2 list-disc space-y-1 pl-5">{bullets.map((item) => <li key={item}>{item}</li>)}</ul> : null}</div>;
  return null;
}
