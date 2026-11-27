"use client";

import { Compass, Feather, Moon, Sparkles } from "lucide-react";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";
import { wave3bArchetypeVariant } from "@/lib/questionnaires/archetypeResultCard";
import { getWave3bArchetypeHonorCopy, wave3bArchetypeTitles } from "@/lib/questionnaires/wave3bArchetypeHonorCopy";
import { ArchetypeHonorCard, type ArchetypeHonorCardProps } from "./ArchetypeHonorCard";
import { fantasyPortraitPath, hasFantasyArtwork } from "./FantasyRoster";

const publicEntryShares = new Set(["style-impression-preferences", "values-assessment", "euphoria-character-quiz"]);
const marks = { neon: Sparkles, gold: Feather, dusk: Moon, slate: Compass };

export function Wave3bArchetypeHonorCard(props: ArchetypeHonorCardProps) {
  const { quiz, profiles, locale } = props;
  const variant = wave3bArchetypeVariant(quiz.slug);
  if (!variant || !profiles.length) return null;

  const single = profiles.length === 1;
  const profile = profiles[0];
  const Mark = marks[variant.theme];
  const styleImpression = quiz.slug === "style-impression-preferences";

  return <ArchetypeHonorCard {...props} archive={{
    shortTitle: wave3bArchetypeTitles[quiz.slug][locale],
    reading: single ? getWave3bArchetypeHonorCopy(quiz.slug, profile.id, locale) : undefined,
    portraitPath: single && hasFantasyArtwork(quiz.slug) ? fantasyPortraitPath(quiz.slug, profile.id) : undefined,
    artworkMark: <Mark className="size-16" strokeWidth={1.5} />,
    publicEntryOnly: publicEntryShares.has(quiz.slug),
    suppressRunner: styleImpression,
    onShare: styleImpression ? undefined : method =>
      recordEntertainmentActivity(quiz.slug, quiz.version, locale === "en" ? "en" : "zh", "share", "single", method),
  }} />;
}
