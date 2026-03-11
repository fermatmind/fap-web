import Link from "next/link";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type { ShareSummaryResponse } from "@/lib/api/v0_3";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const TECHNICAL_TAG_PREFIXES = [
  "axis:",
  "state:",
  "type:",
  "role:",
  "strategy:",
  "borderline:",
] as const;

export type MbtiShareDimensionViewModel = {
  code: string;
  label: string;
  percent: number;
};

export type MbtiShareSummaryViewModel = {
  typeCode: string;
  typeName: string;
  subtitle: string;
  summary: string;
  rarity: string;
  publicTags: string[];
  dimensions: MbtiShareDimensionViewModel[];
};

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    if (typeof value !== "string" && typeof value !== "number") {
      continue;
    }

    const normalized = String(value).trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function normalizeStringArray(values: unknown): string[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((value) => normalizeText(value))
    .filter(Boolean);
}

function resolveRarity(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return normalizeText(value);
  }

  const record = asRecord(value);
  if (!record) {
    return "";
  }

  return normalizeText(record.label, record.text, record.value, record.title);
}

function toRoundedPercent(value: unknown): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return 0;
  }

  const normalized = value > 1 ? value : value * 100;
  return Math.max(0, Math.min(100, Math.round(normalized)));
}

function normalizeDimensions(values: unknown): MbtiShareDimensionViewModel[] {
  if (!Array.isArray(values)) {
    return [];
  }

  return values
    .map((item, index) => {
      const record = asRecord(item);
      if (!record) {
        return null;
      }

      const code = normalizeText(record.code);
      const label =
        normalizeText(record.label, record.axis_label, record.name, code)
        || `Dimension ${index + 1}`;
      const percent = toRoundedPercent(
        typeof record.percent === "number"
          ? record.percent
          : typeof record.score === "number"
            ? record.score
            : typeof record.value === "number"
              ? record.value
              : 0
      );

      return {
        code,
        label,
        percent,
      };
    })
    .filter((item): item is MbtiShareDimensionViewModel => Boolean(item));
}

function isPublicTag(tag: string): boolean {
  const normalized = tag.trim().toLowerCase();
  if (!normalized) return false;
  return !TECHNICAL_TAG_PREFIXES.some((prefix) => normalized.startsWith(prefix));
}

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
}

function truncateText(value: string, maxLength: number): string {
  const normalized = value.trim();
  if (!normalized || normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, maxLength - 1)).trimEnd()}…`;
}

export function normalizeMbtiShareSummary(data: ShareSummaryResponse): MbtiShareSummaryViewModel {
  const root = asRecord(data) ?? {};
  const result = asRecord(root.result);
  const profile =
    asRecord(root.profile)
    ?? asRecord(asRecord(root.report)?.profile)
    ?? asRecord(root.summary_card)
    ?? asRecord(root.summaryCard);
  const identityCard =
    asRecord(root.identity_card)
    ?? asRecord(root.identityCard)
    ?? asRecord(asRecord(root.report)?.identity_card);

  const typeCode = normalizeText(
    root.type_code,
    root.typeCode,
    result?.type_code,
    result?.typeCode,
    identityCard?.type_code,
    identityCard?.typeCode,
    profile?.type_code,
    profile?.typeCode
  );
  const typeName = normalizeText(
    root.type_name,
    root.typeName,
    root.title,
    identityCard?.title,
    profile?.type_name,
    profile?.typeName
  );
  const subtitle = normalizeText(
    root.subtitle,
    root.tagline,
    identityCard?.subtitle,
    identityCard?.tagline,
    profile?.tagline
  );
  const summary = normalizeText(
    root.summary,
    result?.summary,
    identityCard?.summary,
    profile?.short_summary,
    root.description
  );
  const rarity = resolveRarity(root.rarity ?? root.rarity_label ?? profile?.rarity);
  const publicTags = unique(
    [
      ...normalizeStringArray(root.public_tags),
      ...normalizeStringArray(root.publicTags),
      ...normalizeStringArray(root.tags),
      ...normalizeStringArray(identityCard?.tags),
      ...normalizeStringArray(profile?.keywords),
    ].filter(isPublicTag)
  );
  const dimensions = normalizeDimensions(
    root.dimensions
    ?? result?.dimensions
    ?? asRecord(root.summary_card)?.dimensions
    ?? asRecord(root.summaryCard)?.dimensions
    ?? asRecord(root.report)?.dimensions
  );

  return {
    typeCode,
    typeName,
    subtitle,
    summary,
    rarity,
    publicTags,
    dimensions,
  };
}

export function buildMbtiShareMetadataCopy({
  locale,
  data,
}: {
  locale: Locale;
  data?: ShareSummaryResponse | null;
}) {
  const view = data ? normalizeMbtiShareSummary(data) : null;
  const identityLabel = [view?.typeCode, view?.typeName].filter(Boolean).join(" · ");
  const title = identityLabel
    ? locale === "zh"
      ? `${identityLabel}｜MBTI 分享摘要`
      : `${identityLabel} | Shared MBTI summary`
    : locale === "zh"
      ? "MBTI 分享摘要"
      : "Shared MBTI summary";

  const descriptionSource = truncateText(
    normalizeText(view?.subtitle, view?.summary),
    160
  );
  const description = descriptionSource
    || (locale === "zh"
      ? "查看这份公开 MBTI 分享摘要：类型、副标题、稀有度、公开标签与维度概览。"
      : "View the public MBTI share summary with type, subtitle, rarity, public tags, and dimension highlights.");

  return { title, description };
}

export default function MbtiShareSummaryCard({
  locale,
  data,
}: {
  locale: Locale;
  data: ShareSummaryResponse;
}) {
  const view = normalizeMbtiShareSummary(data);
  const startTestHref = localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.MBTI}/take`, locale);
  const testsHref = localizedPath("/tests", locale);
  const heading = view.typeCode || view.typeName || (locale === "zh" ? "MBTI 分享摘要" : "MBTI shared summary");

  return (
    <main
      data-testid="mbti-share-summary-card"
      className="mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-14"
    >
      <div className="overflow-hidden rounded-[32px] border border-emerald-100 bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.18),_transparent_40%),linear-gradient(135deg,_#ffffff_0%,_#f0fdf4_46%,_#ecfeff_100%)] shadow-[0_24px_64px_rgba(15,23,42,0.10)]">
        <div className="grid gap-6 p-6 md:p-8 lg:grid-cols-[minmax(0,1.2fr)_320px] lg:gap-8">
          <section className="space-y-5">
            <div className="space-y-3">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">
                {locale === "zh" ? "公开分享摘要" : "Public share summary"}
              </p>
              <div className="space-y-2">
                <h1 className="m-0 text-4xl font-bold tracking-tight text-slate-950 md:text-5xl">
                  {heading}
                </h1>
                {view.typeName && view.typeName !== heading ? (
                  <p className="m-0 text-lg font-semibold text-slate-700">{view.typeName}</p>
                ) : null}
                {view.subtitle ? (
                  <p className="m-0 text-lg leading-8 text-slate-700">{view.subtitle}</p>
                ) : null}
              </div>
            </div>

            {view.summary ? (
              <p className="m-0 max-w-3xl text-base leading-8 text-slate-700">
                {view.summary}
              </p>
            ) : null}

            {view.publicTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {view.publicTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-sm text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Link href={startTestHref} className={buttonVariants({ className: "min-w-[180px]" })}>
                {locale === "zh" ? "开始 MBTI 测试" : "Start MBTI test"}
              </Link>
              <Link
                href={testsHref}
                className={buttonVariants({ variant: "outline", className: "min-w-[160px]" })}
              >
                {locale === "zh" ? "查看全部测试" : "Browse all tests"}
              </Link>
            </div>
          </section>

          <section className="space-y-4">
            <Card className="border-white/70 bg-white/88 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">
                  {locale === "zh" ? "轻量结果卡" : "Lightweight result card"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {view.rarity ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      {locale === "zh" ? "稀有度" : "Rarity"}
                    </p>
                    <p className="m-0 mt-2 text-lg font-semibold text-slate-900">{view.rarity}</p>
                  </div>
                ) : null}

                {view.dimensions.length > 0 ? (
                  <div data-testid="mbti-share-dimension-bars" className="space-y-3">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                      {locale === "zh" ? "维度概览" : "Dimension overview"}
                    </p>
                    {view.dimensions.map((dimension) => (
                      <div key={`${dimension.code}-${dimension.label}`} className="space-y-1.5">
                        <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
                          <span>{dimension.label}</span>
                          <span>{dimension.percent}%</span>
                        </div>
                        <Progress value={dimension.percent} />
                      </div>
                    ))}
                  </div>
                ) : null}

                <Link href={startTestHref} className={buttonVariants({ variant: "outline", className: "w-full" })}>
                  {locale === "zh" ? "我也来测一下" : "Take the test myself"}
                </Link>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
