import type { CareerAiImpactPreviewAsset, CareerAiImpactPreviewTextItem } from "@/lib/career/api/fetchCareerAiImpactAssetPreview";
import type { Locale } from "@/lib/i18n/locales";

type CareerAiImpactPreviewSectionProps = {
  asset: CareerAiImpactPreviewAsset | null;
  locale: Locale;
};

const EXPOSURE_TYPE_LABELS: Record<string, Record<Locale, string>> = {
  augmentation: { zh: "辅助增强", en: "augmentation" },
  automation: { zh: "自动化", en: "automation" },
  mixed: { zh: "混合暴露", en: "mixed" },
  unknown: { zh: "证据不足", en: "unknown" },
};

function labelForExposureType(value: string, locale: Locale): string {
  const normalized = value.trim().toLowerCase();
  return EXPOSURE_TYPE_LABELS[normalized]?.[locale] ?? value;
}

function labelForConfidence(value: string, locale: Locale): string {
  const normalized = value.trim().toLowerCase();
  if (locale === "en") {
    return value;
  }

  if (normalized === "high") {
    return "高置信";
  }

  if (normalized === "medium") {
    return "中等置信";
  }

  if (normalized === "low") {
    return "低置信";
  }

  return value;
}

function TextItemList({ items }: { items: CareerAiImpactPreviewTextItem[] }) {
  return (
    <ul className="m-0 mt-4 list-disc space-y-3 pl-5 text-sm leading-7 text-slate-600">
      {items.map((item) => (
        <li key={`${item.title}-${item.body}`} className="pl-1">
          <span className="font-semibold text-slate-900">{item.title}: </span>
          {item.body}
        </li>
      ))}
    </ul>
  );
}

function DetailCard({ title, items }: { title: string; items: CareerAiImpactPreviewTextItem[] }) {
  if (items.length === 0) {
    return null;
  }

  return (
    <article className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="m-0 text-lg font-semibold tracking-normal text-slate-950">{title}</h3>
      <TextItemList items={items} />
    </article>
  );
}

export function CareerAiImpactPreviewSection({ asset, locale }: CareerAiImpactPreviewSectionProps) {
  if (!asset) {
    return null;
  }

  const title = locale === "zh" ? "AI 影响" : "AI Impact";
  const scoreLabel = locale === "zh" ? "AI 任务暴露" : "AI task exposure";
  const workflowTitle = locale === "zh" ? "最容易被 AI 加速的工作流" : "Workflows AI may accelerate";
  const accountabilityTitle = locale === "zh" ? "人的责任边界" : "Human accountability anchors";
  const prepareTitle = locale === "zh" ? "怎么准备" : "How to prepare";
  const sourceTitle = locale === "zh" ? "来源" : "Sources";
  const sourceSummary = locale === "zh" ? "查看 AI 影响评估使用的公开来源" : "View public sources used for this AI impact estimate";

  return (
    <section className="space-y-5 rounded-lg border border-sky-200 bg-sky-50/60 p-5 shadow-sm md:p-7" data-testid="career-ai-impact-preview">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.78fr)_minmax(0,1.22fr)] lg:items-start">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">{title}</p>
          <p className="m-0 mt-4 text-4xl font-semibold tracking-normal text-slate-950">
            {asset.ai_exposure_score.score_1_to_10}/10
          </p>
          <p className="m-0 mt-2 text-sm font-semibold text-slate-700">{scoreLabel}</p>
          <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
            <span className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-sky-800">
              {labelForExposureType(asset.ai_exposure_score.exposure_type, locale)}
            </span>
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-slate-700">
              {labelForConfidence(asset.ai_exposure_score.confidence, locale)}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <p className="m-0 text-base leading-8 text-slate-700">{asset.summary}</p>
          <aside className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-7 text-amber-950">
            <span className="font-semibold">{asset.items.reader_boundary.title}: </span>
            {asset.items.reader_boundary.body}
          </aside>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <DetailCard title={workflowTitle} items={asset.items.most_ai_exposed_workflows} />
        <DetailCard title={accountabilityTitle} items={asset.items.human_accountability_anchors} />
        <DetailCard title={prepareTitle} items={asset.items.how_to_prepare} />
      </div>

      <details className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm leading-7 text-slate-600">
        <summary className="cursor-pointer font-semibold text-slate-900">{sourceSummary}</summary>
        <ul className="m-0 mt-3 list-disc space-y-2 pl-5">
          {asset.sources.map((source) => (
            <li key={`${source.name}-${source.url}`} className="pl-1">
              <a className="text-slate-700 underline-offset-2 hover:underline" href={source.url} rel="noreferrer" target="_blank">
                {source.name}
              </a>
            </li>
          ))}
        </ul>
        <span className="sr-only">{sourceTitle}</span>
      </details>
    </section>
  );
}
