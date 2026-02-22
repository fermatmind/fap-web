import Link from "next/link";
import { DataGlyph } from "@/components/assessment-cards/DataGlyph";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { resolveCardSpec } from "@/lib/design/card-resolver";
import { getDictSync } from "@/lib/i18n/getDict";
import type { Locale } from "@/lib/i18n/locales";
import { localizedPath } from "@/lib/i18n/locales";

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
  cardTaglineI18n?: Record<string, string>;
};

function resolveTagline(
  locale: Locale,
  source: Record<string, string> | undefined,
  fallback: string
): string {
  if (!source) return fallback;

  const direct = source[locale];
  if (typeof direct === "string" && direct.trim().length > 0) return direct.trim();

  const normalized = locale === "zh" ? source["zh-CN"] : source.en;
  if (typeof normalized === "string" && normalized.trim().length > 0) return normalized.trim();

  return fallback;
}

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
  cardTaglineI18n,
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
  const tagline = resolveTagline(locale, cardTaglineI18n, scaleCode ?? cardSpec.visual);

  return (
    <Card
      data-cover-available={hasCoverImage ? "1" : "0"}
      className="group/card relative flex h-full flex-col overflow-hidden border-[var(--fm-border)] bg-[var(--fm-surface)] transition duration-300 hover:-translate-y-1 hover:shadow-[var(--fm-shadow-lg)]"
    >
      <div className="p-4 pb-0">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <Badge>{questions} {dict.common.questions_unit}</Badge>
          <Badge>{timeMinutes} {dict.common.minutes_unit}</Badge>
          {scaleCode ? <Badge>{scaleCode}</Badge> : null}
        </div>

        <DataGlyph
          kind={cardSpec.visual}
          tone={cardSpec.tone}
          compact={isCompact}
          ariaLabel={dict.card.a11yVisualDescriptions[cardSpec.visual]}
          fallbackAriaLabel={dict.card.a11yVisualFallback}
          className="md:h-28 md:max-h-28 max-md:max-h-16"
        />
      </div>

      <CardHeader className="space-y-2">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--fm-text-muted)]">
          {tagline}
        </p>
        <CardTitle className="font-serif text-xl leading-tight group-hover/card:text-[var(--fm-accent)]">{title}</CardTitle>
        <p className="text-sm text-[var(--fm-text-muted)]">{description}</p>
      </CardHeader>

      <CardContent className="mt-auto pt-0">
        {isCompact ? <p className="m-0 text-xs text-[var(--fm-text-muted)]">{dict.card.compactLabel}</p> : null}
      </CardContent>

      <CardFooter className="gap-2">
        <Link href={localizedPath(`/tests/${slug}/take`, locale)} className={buttonVariants({ size: "sm" })}>
          {dict.common.start}
        </Link>
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
