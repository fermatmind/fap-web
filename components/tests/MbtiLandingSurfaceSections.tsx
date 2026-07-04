import Link from "next/link";
import type {
  LandingDiscoverabilityItemViewModel,
  LandingSurfaceViewModel,
  LandingSummaryBlockViewModel,
} from "@/lib/landing/landingSurface";

type MbtiLandingSurfaceSectionsProps = {
  surface: LandingSurfaceViewModel | null;
};

type MbtiLandingModule = {
  key: string;
  testId: string;
  blocks: LandingSummaryBlockViewModel[];
};

function tokenIncludes(value: string | null | undefined, needles: string[]): boolean {
  const normalized = String(value ?? "").toLowerCase();

  return needles.some((needle) => normalized.includes(needle));
}

function blockMatches(block: LandingSummaryBlockViewModel, needles: string[]): boolean {
  return tokenIncludes(block.key, needles) || tokenIncludes(block.kind, needles);
}

function itemMatches(item: LandingDiscoverabilityItemViewModel, needles: string[]): boolean {
  return tokenIncludes(item.key, needles) || tokenIncludes(item.kind, needles);
}

function getHrefPath(item: LandingDiscoverabilityItemViewModel): string {
  return item.href.split(/[?#]/)[0]?.replace(/\/+$/, "") || "/";
}

function isPersonalityHref(item: LandingDiscoverabilityItemViewModel): boolean {
  return /^\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?personality(?:\/|$)/.test(getHrefPath(item));
}

function isPersonalityHubLink(item: LandingDiscoverabilityItemViewModel): boolean {
  const path = getHrefPath(item);

  return (
    itemMatches(item, ["personality_hub", "mbti_personality_hub", "personality_directory", "type_directory"]) ||
    /^\/(?:[a-z]{2}(?:-[A-Z]{2})?\/)?personality$/.test(path)
  );
}

function isPersonalityComparisonLink(item: LandingDiscoverabilityItemViewModel): boolean {
  return (
    !isPersonalityHubLink(item) &&
    (itemMatches(item, ["personality_comparison", "mbti_comparison", "type_comparison", "compare_types", "comparison_internal_link"]) ||
      (isPersonalityHref(item) && getHrefPath(item).includes("-vs-")))
  );
}

function buildModules(surface: LandingSurfaceViewModel): MbtiLandingModule[] {
  const moduleSpecs = [
    {
      key: "types",
      testId: "mbti-landing-types-overview",
      needles: ["16_type", "sixteen_type", "type_overview", "personality_type_overview", "mbti_type_overview"],
    },
    {
      key: "careers",
      testId: "mbti-landing-career-direction",
      needles: ["career", "career_direction", "job_direction", "work_style"],
    },
    {
      key: "comparisons",
      testId: "mbti-landing-comparisons",
      needles: ["comparison", "compare", "big_five", "big5", "holland", "riasec", "ocean"],
    },
  ] as const;

  return moduleSpecs
    .map((spec) => ({
      key: spec.key,
      testId: spec.testId,
      blocks: surface.summaryBlocks.filter((block) => blockMatches(block, [...spec.needles])),
    }))
    .filter((module) => module.blocks.length > 0);
}

function findPersonalityHubLinks(surface: LandingSurfaceViewModel): LandingDiscoverabilityItemViewModel[] {
  return surface.discoverabilityItems.filter(isPersonalityHubLink);
}

function findTypeLinks(surface: LandingSurfaceViewModel): LandingDiscoverabilityItemViewModel[] {
  return surface.discoverabilityItems.filter(
    (item) =>
      !isPersonalityHubLink(item) &&
      !isPersonalityComparisonLink(item) &&
      (itemMatches(item, ["personality_type", "mbti_type", "type_profile", "type_internal_link"]) ||
        isPersonalityHref(item) ||
        item.href.includes("/personality-types/"))
  );
}

function findComparisonLinks(surface: LandingSurfaceViewModel): LandingDiscoverabilityItemViewModel[] {
  return surface.discoverabilityItems.filter(isPersonalityComparisonLink);
}

function LandingDiscoverabilityLinks({
  items,
  testId,
}: {
  items: LandingDiscoverabilityItemViewModel[];
  testId: string;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div
      className="grid gap-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:grid-cols-2"
      data-testid={testId}
    >
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4 transition hover:border-[var(--fm-accent)]"
        >
          {item.badgeLabel ? (
            <span className="mb-2 inline-flex text-xs font-semibold uppercase tracking-[0.12em] text-[var(--fm-accent)]">
              {item.badgeLabel}
            </span>
          ) : null}
          <span className="block text-base font-semibold text-[var(--fm-text)]">{item.title}</span>
          {item.summary ? <span className="mt-2 block text-sm leading-7 text-[var(--fm-text-muted)]">{item.summary}</span> : null}
        </Link>
      ))}
    </div>
  );
}

export function MbtiLandingSurfaceSections({ surface }: MbtiLandingSurfaceSectionsProps) {
  if (!surface) {
    return null;
  }

  const modules = buildModules(surface);
  const hubLinks = findPersonalityHubLinks(surface);
  const typeLinks = findTypeLinks(surface);
  const comparisonLinks = findComparisonLinks(surface);

  if (!modules.length && !hubLinks.length && !typeLinks.length && !comparisonLinks.length) {
    return null;
  }

  return (
    <section className="space-y-4" data-testid="mbti-landing-surface-sections" data-authority-source="landing_surface_v1">
      {modules.map((module) => (
        <div
          key={module.key}
          className="grid gap-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:grid-cols-2"
          data-testid={module.testId}
        >
          {module.blocks.map((block) => (
            <article key={block.key} className="rounded-xl border border-[var(--fm-border)] bg-[var(--fm-surface-muted)] p-4">
              {block.title ? <h2 className="m-0 text-lg font-semibold text-[var(--fm-text)]">{block.title}</h2> : null}
              {block.body ? <p className="m-0 mt-2 text-sm leading-7 text-[var(--fm-text-muted)]">{block.body}</p> : null}
            </article>
          ))}
        </div>
      ))}

      <LandingDiscoverabilityLinks items={hubLinks} testId="mbti-landing-personality-hub-links" />
      <LandingDiscoverabilityLinks items={typeLinks} testId="mbti-landing-type-internal-links" />
      <LandingDiscoverabilityLinks items={comparisonLinks} testId="mbti-landing-comparison-internal-links" />
    </section>
  );
}
