import Link from "next/link";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { type MbtiPublicProjectionCardViewModel } from "@/lib/mbti/publicProjection";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

function resolveHeading(card: MbtiPublicProjectionCardViewModel | null, locale: Locale): string {
  return (
    card?.displayType
    || card?.canonicalTypeCode
    || card?.title
    || card?.typeName
    || (locale === "zh" ? "MBTI 分享摘要" : "MBTI shared summary")
  );
}

function resolveSecondaryLabel(card: MbtiPublicProjectionCardViewModel | null, heading: string): string {
  return [card?.title, card?.typeName].find((value) => Boolean(value) && value !== heading) ?? "";
}

function resolveNarrative(card: MbtiPublicProjectionCardViewModel | null): string {
  return card?.summary || card?.tagline || "";
}

export default function MbtiShareSummaryCard({
  locale,
  card,
  variant = "page",
  primaryActionHref,
  primaryActionLabel,
  showActions = true,
  showLibraryAction = true,
  testId = "mbti-share-summary-card",
  className,
  onPrimaryActionClick,
  onLibraryActionClick,
}: {
  locale: Locale;
  card: MbtiPublicProjectionCardViewModel | null;
  variant?: "page" | "compact";
  primaryActionHref?: string;
  primaryActionLabel?: string;
  showActions?: boolean;
  showLibraryAction?: boolean;
  testId?: string;
  className?: string;
  onPrimaryActionClick?: () => void;
  onLibraryActionClick?: () => void;
}) {
  const startTestHref = primaryActionHref || localizedPath(`/tests/${SCALE_CANONICAL_SLUG_MAP.MBTI}/take`, locale);
  const startTestLabel = primaryActionLabel || (locale === "zh" ? "开始 MBTI 免费测试" : "Start the free MBTI test");
  const testsHref = localizedPath("/tests", locale);
  const heading = resolveHeading(card, locale);
  const secondaryLabel = resolveSecondaryLabel(card, heading);
  const narrative = resolveNarrative(card);
  const dimensionBars = card && card.dimensions.length > 0 ? (
    <div data-testid="mbti-share-dimension-bars" className="space-y-3">
      <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
        {locale === "zh" ? "维度概览" : "Dimension overview"}
      </p>
      {card.dimensions.map((dimension) => (
        <div key={`${dimension.code}-${dimension.label}`} className="space-y-1.5">
          <div className="flex items-center justify-between gap-3 text-sm text-slate-700">
            <span>{dimension.label}</span>
            <span>{dimension.percent}%</span>
          </div>
          <Progress value={dimension.percent} />
        </div>
      ))}
    </div>
  ) : null;

  if (variant === "compact") {
    return (
      <Card
        data-testid={testId}
        className={cn("border-white/80 bg-white/92 shadow-[0_18px_40px_rgba(15,23,42,0.08)]", className)}
      >
        <CardHeader className="space-y-3 pb-4">
          <CardTitle className="text-2xl text-slate-950">{heading}</CardTitle>
          {secondaryLabel ? (
            <p className="m-0 text-base font-semibold text-slate-700">{secondaryLabel}</p>
          ) : null}
          {card?.subtitle ? (
            <p className="m-0 text-sm leading-7 text-slate-700">{card.subtitle}</p>
          ) : null}
        </CardHeader>
        <CardContent className="space-y-4">
          {narrative ? (
            <p className="m-0 text-sm leading-7 text-slate-700">{narrative}</p>
          ) : null}

          {card && card.publicTags.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {card.publicTags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full border border-emerald-200 bg-emerald-50/60 px-3 py-1 text-xs font-medium text-slate-700"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {card?.rarity ? (
            <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
              <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                {locale === "zh" ? "稀有度" : "Rarity"}
              </p>
              <p className="m-0 mt-2 text-lg font-semibold text-slate-900">{card.rarity}</p>
            </div>
          ) : null}

          {dimensionBars}
        </CardContent>
      </Card>
    );
  }

  return (
    <main
      data-testid={testId}
      className={cn("mx-auto w-full max-w-5xl px-4 py-10 md:px-6 md:py-14", className)}
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
                {secondaryLabel ? (
                  <p className="m-0 text-lg font-semibold text-slate-700">{secondaryLabel}</p>
                ) : null}
                {card?.subtitle ? (
                  <p className="m-0 text-lg leading-8 text-slate-700">{card.subtitle}</p>
                ) : null}
              </div>
            </div>

            {narrative ? (
              <p className="m-0 max-w-3xl text-base leading-8 text-slate-700">
                {narrative}
              </p>
            ) : null}

            {card && card.publicTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {card.publicTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex rounded-full border border-emerald-200 bg-white/90 px-3 py-1 text-sm text-slate-700 shadow-[0_10px_24px_rgba(15,23,42,0.05)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            {showActions ? (
              <div className="flex flex-wrap gap-3">
                <Link
                  href={startTestHref}
                  className={buttonVariants({ className: "min-w-[180px]" })}
                  onClick={onPrimaryActionClick}
                >
                  {startTestLabel}
                </Link>
                {showLibraryAction ? (
                  <Link
                    href={testsHref}
                    className={buttonVariants({ variant: "outline", className: "min-w-[160px]" })}
                    onClick={onLibraryActionClick}
                  >
                    {locale === "zh" ? "查看全部测试" : "Browse all tests"}
                  </Link>
                ) : null}
              </div>
            ) : null}
          </section>

          <section className="space-y-4">
            <Card className="border-white/70 bg-white/88 shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
              <CardHeader className="pb-3">
                <CardTitle className="text-base text-slate-900">
                  {locale === "zh" ? "轻量结果卡" : "Lightweight result card"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {card?.rarity ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/80 p-4">
                    <p className="m-0 text-xs font-semibold uppercase tracking-[0.14em] text-emerald-700">
                      {locale === "zh" ? "稀有度" : "Rarity"}
                    </p>
                    <p className="m-0 mt-2 text-lg font-semibold text-slate-900">{card.rarity}</p>
                  </div>
                ) : null}

                {dimensionBars}

                {showActions ? (
                  <Link
                    href={startTestHref}
                    className={buttonVariants({ variant: "outline", className: "w-full" })}
                    onClick={onPrimaryActionClick}
                  >
                    {locale === "zh" ? "我也来测一下" : "Start my own free test"}
                  </Link>
                ) : null}
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
