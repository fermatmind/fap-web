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

function findTypeLinks(surface: LandingSurfaceViewModel): LandingDiscoverabilityItemViewModel[] {
  return surface.discoverabilityItems.filter(
    (item) =>
      itemMatches(item, ["personality_type", "mbti_type", "type_profile", "type_internal_link"]) ||
      item.href.includes("/personality/") ||
      item.href.includes("/personality-types/")
  );
}

export function MbtiLandingSurfaceSections({ surface }: MbtiLandingSurfaceSectionsProps) {
  if (!surface) {
    return null;
  }

  const modules = buildModules(surface);
  const typeLinks = findTypeLinks(surface);

  if (!modules.length && !typeLinks.length) {
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

      {typeLinks.length > 0 ? (
        <div
          className="grid gap-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:grid-cols-2"
          data-testid="mbti-landing-type-internal-links"
        >
          {typeLinks.map((item) => (
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
      ) : null}
    </section>
  );
}
