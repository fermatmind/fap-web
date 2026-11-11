"use client";

import { coreShareUrlForDisplay } from "@/lib/i18n/coreShareDisplay";

import { useState } from "react";
import { BIG5_DOMAIN_LABELS, type Big5DomainCode } from "@/lib/big5/taxonomy";
import { createAttemptShare } from "@/lib/api/v0_3";
import type { Big5ResultPageV2Block, Big5ResultPageV2Payload } from "@/lib/big5/resultPageV2";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { assessmentChineseCopy } from "@/lib/tests/traditionalAssessmentDisplay";

type RecordValue = Record<string, unknown>;

const FIELD_LABELS = {
  benefit: { zh: "优势", "zh-TW": "優勢", en: "Strength" },
  cost: { zh: "代价", "zh-TW": "代價", en: "Trade-off" },
  common_misread: { zh: "常见误读", "zh-TW": "常見誤讀", en: "Common misread" },
  action: { zh: "行动", "zh-TW": "行動", en: "Action" },
  repair: { zh: "修复方式", "zh-TW": "修復方式", en: "Repair" },
} as const;

const BAND_LABELS: Record<string, Record<DisplayLocale, string>> = {
  very_low: { zh: "明显偏低", "zh-TW": "明顯偏低", en: "Very low" },
  low: { zh: "偏低", "zh-TW": "偏低", en: "Low" },
  mid: { zh: "中位", "zh-TW": "中位", en: "Mid-range" },
  high: { zh: "偏高", "zh-TW": "偏高", en: "High" },
  very_high: { zh: "明显偏高", "zh-TW": "明顯偏高", en: "Very high" },
};

function asRecord(value: unknown): RecordValue | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as RecordValue
    : null;
}

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function localized(content: RecordValue, locale: Locale, key: string): string {
  return text(content[`${key}_${locale}`] ?? content[key]);
}

function localizedFrom(content: RecordValue, locale: Locale, keys: string[]): string {
  for (const key of keys) {
    const value = localized(content, locale, key);
    if (value) return value;
  }
  return "";
}

function number(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function contentOf(block: Big5ResultPageV2Block): RecordValue | null {
  return asRecord(block.content);
}

function blockAttributes(block: Big5ResultPageV2Block) {
  return {
    "data-testid": `big5-v2-block-${block.block_kind}`,
    "data-block-kind": block.block_kind,
    "data-block-key": block.block_key,
    "data-content-source": block.content_source || undefined,
    "data-fallback-policy": block.fallback_policy || undefined,
  };
}

function DetailField({
  kind,
  value,
  displayLocale,
}: {
  kind: keyof typeof FIELD_LABELS;
  value: string;
  displayLocale: DisplayLocale;
}) {
  if (!value) return null;
  return (
    <div data-detail-kind={kind} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">
        {FIELD_LABELS[kind][displayLocale]}
      </p>
      <p className="m-0 mt-1 text-sm leading-7 text-slate-700">{value}</p>
    </div>
  );
}

function TrustBar({
  block,
  projection,
  locale,
  displayLocale = locale,
}: RendererProps) {
  const content = contentOf(block);
  const boundary = content ? localizedFrom(content, locale, ["boundary", "summary", "body", "disclaimer"]) : "";
  const quality = text(projection.quality_status);
  const norm = text(projection.norm_status);
  if (!content || !boundary || !quality || !norm) return null;

  return (
    <aside {...blockAttributes(block)} className="rounded-xl border border-sky-200 bg-sky-50 p-4">
      <dl className="m-0 grid gap-3 text-sm sm:grid-cols-[auto_auto_1fr]">
        <div>
          <dt className="font-semibold text-sky-900">{locale === "zh" ? assessmentChineseCopy(displayLocale, "质量状态", "作答品質狀態") : "Quality"}</dt>
          <dd className="m-0 mt-1 text-sky-800">{quality}</dd>
        </div>
        <div>
          <dt className="font-semibold text-sky-900">{locale === "zh" ? assessmentChineseCopy(displayLocale, "常模状态", "常模狀態") : "Norm status"}</dt>
          <dd className="m-0 mt-1 text-sky-800">{norm}</dd>
        </div>
        <div>
          <dt className="font-semibold text-sky-900">{locale === "zh" ? assessmentChineseCopy(displayLocale, "可信边界", "解讀界線") : "Interpretation boundary"}</dt>
          <dd className="m-0 mt-1 leading-6 text-sky-800">{boundary}</dd>
        </div>
      </dl>
    </aside>
  );
}

function HeroSummary({ block, projection, locale }: RendererProps) {
  const content = contentOf(block);
  if (!content) return null;
  const signature = asRecord(projection.profile_signature);
  if (signature?.is_fixed_type === true) return null;
  const title = localizedFrom(content, locale, ["title"]);
  const summary = localizedFrom(content, locale, ["body", "summary", "short_body"]);
  const labelRole = localizedFrom(content, locale, ["label_role"]);
  if (!summary) return null;

  return (
    <article {...blockAttributes(block)} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {labelRole ? <p className="m-0 text-xs font-semibold tracking-[0.1em] text-sky-700">{labelRole}</p> : null}
      {title ? <h4 className="m-0 mt-2 text-xl font-semibold text-slate-950">{title}</h4> : null}
      <p className="m-0 mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{summary}</p>
    </article>
  );
}

const TAIWAN_TRAIT_LABELS: Record<Big5DomainCode, string> = { O: "開放性", C: "盡責性", E: "外向性", A: "宜人性", N: "情緒性" };

function TraitBar({ block, payload, projection, locale, displayLocale = locale }: RendererProps) {
  const content = contentOf(block);
  const trait = asRecord(content?.trait);
  const code = text(trait?.code).toUpperCase() as Big5DomainCode;
  const domains = asRecord(projection.domains);
  const domain = asRecord(domains?.[code]);
  const score = number(domain?.score);
  const band = text(domain?.band);
  if (!content || !BIG5_DOMAIN_LABELS[code] || score === null || score < 0 || score > 100 || !band) return null;

  const percentileAllowed = projection.percentile_display_allowed === true;
  const percentile = percentileAllowed ? number(domain?.percentile) : null;
  const deepDiveContent = payload.modules
    .find((module) => module.module_key === "module_03_trait_deep_dive")
    ?.blocks
    .filter((item) => item.block_kind === "trait_deep_dive")
    .map(contentOf)
    .find((item) => text(asRecord(item?.trait)?.code).toUpperCase() === code);
  const deepDiveTrait = asRecord(deepDiveContent?.trait);
  const label = localizedFrom(deepDiveTrait ?? trait ?? {}, locale, ["label", "public_name"])
    || (displayLocale === "zh-TW" ? TAIWAN_TRAIT_LABELS[code] : BIG5_DOMAIN_LABELS[code][locale]);
  const bandContent = asRecord(deepDiveContent?.band) ?? asRecord(content.band);
  const bandLabel = localizedFrom(bandContent ?? {}, locale, ["display_band_label"])
    || BAND_LABELS[band]?.[displayLocale]
    || band;

  return (
    <article {...blockAttributes(block)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">{code}</p>
          <h4 className="m-0 mt-1 text-base font-semibold text-slate-950">{label}</h4>
        </div>
        <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-sm font-semibold text-slate-800">
          {Number.isInteger(score) ? score : score.toFixed(1)} / 100
        </span>
      </div>
      <div
        role="progressbar"
        aria-label={`${label} ${score}`}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={score}
        className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200"
      >
        <div className="h-full rounded-full bg-sky-600" style={{ width: `${Math.max(0, Math.min(100, score))}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
        <span>{bandLabel}</span>
        {percentile !== null && percentile >= 0 && percentile <= 100 ? (
          <span data-testid={`big5-v2-percentile-${code}`}>
            {locale === "zh" ? `百分位 ${percentile}` : `Percentile ${percentile}`}
          </span>
        ) : null}
      </div>
    </article>
  );
}

function QuickCards({ block, locale }: RendererProps) {
  const content = contentOf(block);
  if (!content) return null;
  const title = localizedFrom(content, locale, ["title"]);
  const summary = localizedFrom(content, locale, ["summary", "short_body", "body"]);
  if (!summary) return null;
  return (
    <article {...blockAttributes(block)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {title ? <h4 className="m-0 text-base font-semibold text-slate-950">{title}</h4> : null}
      <p className="m-0 mt-2 text-sm leading-7 text-slate-700">{summary}</p>
    </article>
  );
}

function TraitDeepDive({ block, locale, displayLocale = locale }: RendererProps) {
  const content = contentOf(block);
  if (!content) return null;
  const title = localizedFrom(content, locale, ["title"]);
  const body = localizedFrom(content, locale, ["body"]);
  const benefit = localizedFrom(content, locale, ["benefit"]);
  const cost = localizedFrom(content, locale, ["cost"]);
  const misread = localizedFrom(content, locale, ["common_misread"]);
  const action = localizedFrom(content, locale, ["action"]);
  if (!body || !benefit || !cost || !misread || !action) return null;
  return (
    <article {...blockAttributes(block)} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {title ? <h4 className="m-0 text-lg font-semibold text-slate-950">{title}</h4> : null}
      <p className="m-0 mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">{body}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <DetailField kind="benefit" value={benefit} displayLocale={displayLocale} />
        <DetailField kind="cost" value={cost} displayLocale={displayLocale} />
        <DetailField kind="common_misread" value={misread} displayLocale={displayLocale} />
        <DetailField kind="action" value={action} displayLocale={displayLocale} />
      </div>
    </article>
  );
}

function stringList(value: unknown): string[] {
  return Array.isArray(value)
    ? value.flatMap((item) => {
        if (typeof item === "string" && item.trim()) return [item.trim()];
        const record = asRecord(item);
        const value = text(record?.code ?? record?.trait ?? record?.trait_code ?? record?.key);
        return value ? [value] : [];
      })
    : [];
}

function CouplingCards({ block, locale, displayLocale = locale }: RendererProps) {
  const content = contentOf(block);
  if (!content) return null;
  const title = localizedFrom(content, locale, ["title"]);
  const body = localizedFrom(content, locale, ["body"]);
  const benefit = localizedFrom(content, locale, ["benefit"]);
  const cost = localizedFrom(content, locale, ["cost"]);
  const action = localizedFrom(content, locale, ["action"]);
  const traits = stringList(content.involved_traits);
  if (!text(content.coupling_key) || traits.length < 2 || !body || !benefit || !cost || !action) return null;
  return (
    <article {...blockAttributes(block)} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {traits.map((trait) => <span key={trait} className="rounded-full bg-sky-50 px-2 py-1 text-xs font-semibold text-sky-800">{trait}</span>)}
      </div>
      {title ? <h4 className="m-0 mt-3 text-lg font-semibold text-slate-950">{title}</h4> : null}
      <p className="m-0 mt-3 text-sm leading-7 text-slate-700">{body}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <DetailField kind="benefit" value={benefit} displayLocale={displayLocale} />
        <DetailField kind="cost" value={cost} displayLocale={displayLocale} />
        <DetailField kind="action" value={action} displayLocale={displayLocale} />
      </div>
    </article>
  );
}

function FacetReframe({ block, projection, locale, displayLocale = locale }: RendererProps) {
  const content = contentOf(block);
  if (!content) return null;
  const facet = text(content.facet_key ?? content.facet_code).toUpperCase();
  const direction = text(content.facet_direction).toLowerCase();
  const directionLabel = locale === "zh"
    ? (direction === "high" ? "偏高" : "偏低")
    : (direction === "high" ? "High" : "Low");
  const title = localizedFrom(content, locale, ["title"]);
  const body = localizedFrom(content, locale, ["body"]);
  const benefit = localizedFrom(content, locale, ["benefit"]);
  const cost = localizedFrom(content, locale, ["cost"]);
  const action = localizedFrom(content, locale, ["action"]);
  const support = asRecord(content.facet_support);
  const confidence = text(support?.confidence);
  if (!/^[OCEAN][1-6]$/.test(facet) || !["high", "low"].includes(direction) || !body || !benefit || !cost || !action) return null;
  return (
    <article {...blockAttributes(block)} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-sky-800">
        <span>{facet}</span>
        <span>{directionLabel}</span>
        <span>{locale === "zh" ? assessmentChineseCopy(displayLocale, "推断信号", "推斷訊號") : "Inferred signal"}</span>
        {confidence ? <span>{locale === "zh" ? `${assessmentChineseCopy(displayLocale, "置信度", "推論信心")} ${confidence}` : `Confidence ${confidence}`}</span> : null}
        <span>{locale === "zh" ? `${assessmentChineseCopy(displayLocale, "质量", "品質")} ${text(projection.quality_status)}` : `Quality ${text(projection.quality_status)}`}</span>
      </div>
      {title ? <h4 className="m-0 mt-3 text-lg font-semibold text-slate-950">{title}</h4> : null}
      <p className="m-0 mt-3 text-sm leading-7 text-slate-700">{body}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <DetailField kind="benefit" value={benefit} displayLocale={displayLocale} />
        <DetailField kind="cost" value={cost} displayLocale={displayLocale} />
        <DetailField kind="action" value={action} displayLocale={displayLocale} />
      </div>
    </article>
  );
}

function ApplicationMatrix({ block, locale, displayLocale = locale }: RendererProps) {
  const content = contentOf(block);
  if (!content) return null;
  const scenario = text(content.scenario);
  const scenarioLabel = localizedFrom(content, locale, ["scenario_label"]);
  const title = localizedFrom(content, locale, ["title"]);
  const body = localizedFrom(content, locale, ["body"]);
  const benefit = localizedFrom(content, locale, ["benefit"]);
  const cost = localizedFrom(content, locale, ["cost"]);
  const action = localizedFrom(content, locale, ["action"]);
  const repair = localizedFrom(content, locale, ["repair"]);
  if (!scenario || !body || !benefit || !cost || !action) return null;
  return (
    <article {...blockAttributes(block)} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.1em] text-sky-700">{scenarioLabel || scenario}</p>
      {title ? <h4 className="m-0 mt-2 text-lg font-semibold text-slate-950">{title}</h4> : null}
      <p className="m-0 mt-3 text-sm leading-7 text-slate-700">{body}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <DetailField kind="benefit" value={benefit} displayLocale={displayLocale} />
        <DetailField kind="cost" value={cost} displayLocale={displayLocale} />
        <DetailField kind="action" value={action} displayLocale={displayLocale} />
        <DetailField kind="repair" value={repair} displayLocale={displayLocale} />
      </div>
    </article>
  );
}

function CollaborationManual({ block, locale, displayLocale = locale }: RendererProps) {
  const content = contentOf(block);
  if (!content) return null;
  const scenario = text(content.scenario);
  const title = localizedFrom(content, locale, ["title"]);
  const body = localizedFrom(content, locale, ["body"]);
  const benefit = localizedFrom(content, locale, ["benefit"]);
  const cost = localizedFrom(content, locale, ["cost"]);
  const action = localizedFrom(content, locale, ["action"]);
  if (!scenario || !body || !cost || !action) return null;
  return (
    <article {...blockAttributes(block)} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {title ? <h4 className="m-0 text-lg font-semibold text-slate-950">{title}</h4> : null}
      <p className="m-0 mt-3 text-sm leading-7 text-slate-700">{body}</p>
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <DetailField kind="benefit" value={benefit} displayLocale={displayLocale} />
        <DetailField kind="cost" value={cost} displayLocale={displayLocale} />
        <DetailField kind="action" value={action} displayLocale={displayLocale} />
      </div>
    </article>
  );
}

function safePublicShareUrl(value: unknown): string {
  const candidate = text(value);
  if (!candidate || typeof window === "undefined") return "";
  try {
    const url = new URL(candidate, window.location.origin);
    const allowedHost = url.origin === window.location.origin
      || ["fermatmind.com", "www.fermatmind.com", "staging.fermatmind.com", "example.test", "web.example.test"].includes(url.hostname)
      || url.hostname === "localhost"
      || url.hostname === "127.0.0.1";
    const allowedProtocol = url.protocol === "https:"
      || (url.protocol === "http:" && ["localhost", "127.0.0.1", "example.test", "web.example.test"].includes(url.hostname));
    if (!allowedHost || !allowedProtocol || !/^\/(?:en|zh|zh-TW)\/share\/[^/]+\/?$/.test(url.pathname)) return "";
    url.search = "";
    url.hash = "";
    return url.toString();
  } catch {
    return "";
  }
}

function ShareSave({ block, projection, locale, displayLocale = locale }: RendererProps) {
  const content = contentOf(block);
  const [status, setStatus] = useState<"idle" | "loading" | "copied" | "failed">("idle");
  const copy = (simplified: string, traditional: string, english: string) =>
    locale === "zh" ? assessmentChineseCopy(displayLocale, simplified, traditional) : english;
  const summary = content ? localizedFrom(content, locale, ["summary", "body"]) : "";
  if (!content || !summary) return null;

  async function share() {
    if (typeof window === "undefined" || status === "loading") return;
    const attemptId = text(projection.attempt_id);
    if (!attemptId) {
      setStatus("failed");
      return;
    }
    setStatus("loading");
    try {
      const response = await createAttemptShare({ attemptId, locale });
      const shareUrl = safePublicShareUrl(coreShareUrlForDisplay(response.share_url ?? response.shareUrl ?? response.url));
      if (!shareUrl) throw new Error("share_url_invalid");
      if (typeof navigator.share === "function") {
        await navigator.share({
          title: copy("分享测试结果", "分享測評結果", "Share test result"),
          url: shareUrl,
        });
        setStatus("idle");
        return;
      }
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
        setStatus("copied");
        return;
      }
    } catch {
      // The user may cancel native sharing.
    }
    setStatus("failed");
  }

  return (
    <article {...blockAttributes(block)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="m-0 text-sm leading-7 text-slate-700">{summary}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" disabled={status === "loading"} onClick={() => void share()} className="rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white disabled:cursor-wait disabled:opacity-60">
          {status === "loading"
            ? copy("正在生成安全链接", "正在產生安全連結", "Creating safe link")
            : copy("分享安全链接", "分享安全連結", "Share safe link")}
        </button>
        <button type="button" onClick={() => window.print()} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800">
          {copy("保存或打印", "儲存或列印", "Save or print")}
        </button>
      </div>
      {status === "copied" || status === "failed" ? <p role="status" className="m-0 mt-2 text-xs text-slate-600">
        {status === "copied"
          ? copy("链接已复制", "連結已複製", "Link copied")
          : copy("当前环境不支持自动分享", "目前環境不支援自動分享", "Sharing is unavailable")}
      </p> : null}
    </article>
  );
}

function safeActionUrl(value: unknown): string {
  const candidate = text(value);
  if (!candidate) return "";
  if (candidate.startsWith("/") && !candidate.startsWith("//")) return candidate;
  try {
    const url = new URL(candidate);
    return url.protocol === "https:" ? url.toString() : "";
  } catch {
    return "";
  }
}

function FeedbackBlock({ block, locale, displayLocale = locale }: RendererProps) {
  const content = contentOf(block);
  if (!content) return null;
  const url = safeActionUrl(content.feedback_url ?? content.action_url ?? content.href ?? content.url);
  const summary = localizedFrom(content, locale, ["summary", "body"]);
  const label = localizedFrom(content, locale, ["action_label", "label"]);
  if (!url || !summary) return null;
  return (
    <article {...blockAttributes(block)} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="m-0 text-sm leading-7 text-slate-700">{summary}</p>
      <a href={url} rel="noopener noreferrer" className="mt-3 inline-flex rounded-lg bg-slate-950 px-3 py-2 text-sm font-semibold text-white">
        {label || (locale === "zh" ? assessmentChineseCopy(displayLocale, "提交反馈", "提供回饋") : "Send feedback")}
      </a>
    </article>
  );
}

function MethodBoundary({ block, projection, locale, displayLocale = locale }: RendererProps) {
  const content = contentOf(block);
  if (!content) return null;
  const title = localizedFrom(content, locale, ["title"]);
  const form = localizedFrom(content, locale, ["form", "question_format"]) || text(projection.form_code);
  const scoring = localizedFrom(content, locale, ["scoring", "scoring_method"]);
  const error = localizedFrom(content, locale, ["error", "measurement_error"]);
  const nonDiagnostic = localizedFrom(content, locale, ["non_diagnostic", "diagnostic_boundary"]);
  const boundary = localizedFrom(content, locale, ["boundary", "use_boundary"]);
  if (!form || !scoring || !error || !nonDiagnostic || !boundary) return null;
  const rows = [
    [locale === "zh" ? assessmentChineseCopy(displayLocale, "题型", "題型") : "Form", form],
    [locale === "zh" ? assessmentChineseCopy(displayLocale, "计分", "計分") : "Scoring", scoring],
    [locale === "zh" ? "常模" : "Norms", text(projection.norm_status)],
    [locale === "zh" ? assessmentChineseCopy(displayLocale, "误差", "誤差") : "Error", error],
    [locale === "zh" ? assessmentChineseCopy(displayLocale, "非诊断", "非診斷") : "Non-diagnostic", nonDiagnostic],
    [locale === "zh" ? assessmentChineseCopy(displayLocale, "使用边界", "使用界線") : "Use boundary", boundary],
  ];
  return (
    <article {...blockAttributes(block)} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      {title ? <h4 className="m-0 text-lg font-semibold text-slate-950">{title}</h4> : null}
      <dl className="m-0 mt-3 grid gap-3 md:grid-cols-2">
        {rows.map(([label, value]) => <div key={label} className="rounded-lg bg-slate-50 p-3">
          <dt className="text-xs font-semibold text-slate-500">{label}</dt>
          <dd className="m-0 mt-1 text-sm leading-6 text-slate-700">{value}</dd>
        </div>)}
      </dl>
    </article>
  );
}

type RendererProps = {
  block: Big5ResultPageV2Block;
  payload: Big5ResultPageV2Payload;
  projection: RecordValue;
  locale: Locale;
  displayLocale?: DisplayLocale;
};

export function Big5ResultPageV2BlockRenderer(props: RendererProps) {
  switch (props.block.block_kind) {
    case "trust_bar": return <TrustBar {...props} />;
    case "hero_summary": return <HeroSummary {...props} />;
    case "trait_bars": return <TraitBar {...props} />;
    case "quick_cards": return <QuickCards {...props} />;
    case "trait_deep_dive": return <TraitDeepDive {...props} />;
    case "coupling_cards": return <CouplingCards {...props} />;
    case "facet_reframe": return <FacetReframe {...props} />;
    case "application_matrix": return <ApplicationMatrix {...props} />;
    case "collaboration_manual": return <CollaborationManual {...props} />;
    case "share_save": return <ShareSave {...props} />;
    case "feedback_block": return <FeedbackBlock {...props} />;
    case "method_boundary": return <MethodBoundary {...props} />;
    default: return null;
  }
}

export function projectionRecord(payload: Big5ResultPageV2Payload): RecordValue {
  return asRecord(payload.projection_v2) ?? {};
}
