import { Heart, Link2, Sprout } from "lucide-react";
import { getArchetypeHonorCopy } from "@/lib/questionnaires/archetypeHonorCardCopy";
import { getWave2aHonorCopy } from "@/lib/questionnaires/wave2aHonorCopy";
import { wave2aTitles, wave2aVariant, type Wave2aSlug } from "@/lib/questionnaires/wave2aResult";
import { ResultHonorCard } from "./ArchetypeHonorCard";
import { existingResultPortrait } from "./PortraitResultLead";

type HonorProps = Parameters<typeof ResultHonorCard>[0];

const ageContextArt = { "older-adult-context": Heart, "similar-age-context": Link2, "younger-adult-context": Sprout };

export function Wave2aHonorCard({ slug, locale, readingId, ...props }: Omit<HonorProps, "slug" | "shortTitle" | "theme" | "reading"> & {
  slug: Wave2aSlug;
  readingId?: string;
}) {
  const variant = wave2aVariant(slug, locale);
  if (!variant || !props.matches.length) return null;
  const id = readingId ?? (props.matches.length === 1 ? props.matches[0].id : undefined);
  const reading = id ? (slug === "chiikawa" ? getArchetypeHonorCopy(slug, id, locale) : getWave2aHonorCopy(slug, id, locale)) : undefined;
  const portraitPath = props.portraitPath ?? (slug === "chiikawa" && id ? existingResultPortrait(slug, id) : undefined);
  const Mark = slug === "adult-age-preferences" && props.matches.length === 1 ? ageContextArt[id as keyof typeof ageContextArt] : undefined;
  return <ResultHonorCard {...props} slug={slug} locale={locale} theme={variant.theme} spaceAfterActions
    shortTitle={wave2aTitles[slug][locale]} portraitPath={portraitPath} reading={reading} artworkMark={Mark && <Mark className="size-16" strokeWidth={1.5} />} />;
}
