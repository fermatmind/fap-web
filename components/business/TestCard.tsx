import Link from "next/link";
import { DataGlyph } from "@/components/assessment-cards/DataGlyph";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveCardSpec } from "@/lib/design/card-resolver";
import { getDictSync } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";
import {
  buildMbtiTakeHref,
  getMbtiDurationSummary,
  getMbtiQuestionSummary,
  getMbtiStartLabel,
  isMbtiScaleCode,
  isMbtiSlug,
  listMbtiFormMetas,
} from "@/lib/mbti/forms";
import { formatCardTitleForUi } from "@/lib/ui/testTitleDisplay";

type TestCardProps = {
  slug: string;
  title: string;
  description: string;
  coverImage: string;
  questions: number;
  timeMinutes: number;
  scaleCode?: string;
  locale?: Locale;
  cardVisual?: string;
  cardTone?: string;
  cardSeed?: string;
  cardDensity?: string;
  highlightRating?: number;
};

export function TestCard({
  slug,
  title,
  description,
  coverImage,
  questions,
  timeMinutes,
  scaleCode,
  locale = "en",
  cardVisual,
  cardTone,
  cardSeed,
  cardDensity,
  highlightRating = 5,
}: TestCardProps) {
  const dict = getDictSync(locale);
  const hasCoverImage = Boolean(coverImage);
  const cardSpec = resolveCardSpec({
    slug,
    scale_code: scaleCode,
    card_visual: cardVisual,
    card_tone: cardTone,
    card_seed: cardSeed,
    card_density: cardDensity,
  });

  const isCompact = cardSpec.density === "compact";
  const stars = Math.max(0, Math.min(5, Math.round(highlightRating)));
  const titleDisplay = formatCardTitleForUi({
    title,
    slug,
    locale,
    surface: "tests_grid_card",
  });
  const showsMbtiActions = isMbtiScaleCode(scaleCode) || isMbtiSlug(slug);

  return (
    <Card
      data-cover-available={hasCoverImage ? "1" : "0"}
      className="group/card relative flex h-full flex-col overflow-hidden border-[var(--fm-border)] bg-[var(--fm-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--fm-shadow-lg)]"
    >
      <div className="p-[var(--fm-space-5)] pb-0">
        <div className="mb-[var(--fm-space-4)] flex items-center justify-between gap-[var(--fm-gap-xs)]">
          <Badge>{showsMbtiActions ? getMbtiQuestionSummary(locale) : `${questions} ${dict.common.questions_unit}`}</Badge>
          <Badge>{showsMbtiActions ? getMbtiDurationSummary(locale) : `${timeMinutes} ${dict.common.minutes_unit}`}</Badge>
        </div>

        <DataGlyph
          kind={cardSpec.visual}
          tone={cardSpec.tone}
          compact={isCompact}
          ariaLabel={dict.card.a11yVisualDescriptions[cardSpec.visual]}
          fallbackAriaLabel={dict.card.a11yVisualFallback}
          className="md:h-[7.5rem] md:max-h-[7.5rem] max-md:max-h-20"
        />
      </div>

      <CardHeader className="space-y-[var(--fm-gap-sm)]">
        <CardTitle
          title={titleDisplay.plain}
          className="min-h-[2.9rem] w-full font-sans text-[0.98rem] font-semibold leading-[1.2] tracking-tight group-hover/card:text-[var(--fm-accent)] md:text-[1.05rem] lg:text-[1.1rem]"
        >
          {titleDisplay.multilineFallback ? (
            <span className="inline-flex w-full flex-col">
              <span className="whitespace-nowrap">{titleDisplay.line1}</span>
              <span className="mt-1 whitespace-nowrap">{titleDisplay.line2}</span>
            </span>
          ) : (
            <span className="inline-flex w-full flex-col">
              <span className="whitespace-nowrap">{titleDisplay.line1}</span>
              <span aria-hidden className="mt-1 select-none text-transparent">&nbsp;</span>
            </span>
          )}
        </CardTitle>
        <div data-testid="tests-grid-card-rating" className="flex items-center gap-1 text-[var(--fm-gold)]" aria-hidden>
          {Array.from({ length: 5 }, (_, idx) => (
            <span key={`star-${idx}`} className={idx < stars ? "opacity-100" : "opacity-35"}>★</span>
          ))}
        </div>
        <p className="text-sm text-[var(--fm-text-muted)]">{description}</p>
      </CardHeader>

      <CardContent className="mt-auto pt-0">
        {isCompact ? <p className="m-0 text-xs text-[var(--fm-text-muted)]">{dict.card.compactLabel}</p> : null}
      </CardContent>

      <CardFooter className="flex flex-wrap gap-[var(--fm-gap-xs)]">
        {showsMbtiActions ? listMbtiFormMetas().map((form) => (
          <Link
            key={form.formCode}
            href={buildMbtiTakeHref(slug, locale, form.formCode)}
            className={buttonVariants({ size: "sm" })}
          >
            {getMbtiStartLabel(form.formCode, locale)}
          </Link>
        )) : (
          <Link href={localizedPath(`/tests/${slug}/take`, locale)} className={buttonVariants({ size: "sm" })}>
            {dict.common.start}
          </Link>
        )}
        <Link
          href={localizedPath(`/tests/${slug}`, locale)}
          className={buttonVariants({ size: "sm", variant: "outline" })}
        >
          {dict.common.details}
        </Link>
      </CardFooter>
    </Card>
  );
}
