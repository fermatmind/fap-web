import Image from "next/image";
import type { ReactNode } from "react";

const illustratedTests = new Set([
  "8-values-political",
  "anime-character-archetype-test",
  "aura-color",
  "blue-lock",
  "chiikawa",
  "cyberpunk-edgerunners",
  "dexter",
  "disc",
  "dungeons-dragons-class",
  "friendship-compatibility",
  "friendship-quiz",
  "introvert-extrovert",
  "jujutsu-kaisen-character",
  "jungian-archetype",
  "moral-alignment",
  "overthinking-screener",
  "philosopher-personality-test",
  "response-color",
  "south-park",
  "space-marine-chapter",
  "spirit-animal",
  "temperament",
  "tsundere-dere-type",
  "which-tarot-card-are-you",
]);

export function DirectoryCover({
  slug,
  children,
}: {
  slug: string;
  children: ReactNode;
}) {
  return (
    <div className="catalog-cover" data-directory-cover={slug} aria-hidden="true">
      {illustratedTests.has(slug) ? (
        <Image
          src={`/images/test-covers/${slug}.webp`}
          alt=""
          fill
          unoptimized
        />
      ) : children}
    </div>
  );
}
