import Link from "next/link";
import type {
  LandingDiscoverabilityItemViewModel,
  LandingSurfaceViewModel,
  LandingSummaryBlockViewModel,
} from "@/lib/landing/landingSurface";

type RiasecLandingSurfaceSectionsProps = {
  surface: LandingSurfaceViewModel | null;
};

type RiasecLandingModule = {
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

function buildModules(surface: LandingSurfaceViewModel): RiasecLandingModule[] {
  const moduleSpecs = [
    {
      key: "six-types",
      testId: "riasec-landing-six-types",
      needles: ["six_type", "six-type", "riasec_type", "riasec-type", "holland_type", "holland-type"],
    },
    {
      key: "careers",
      testId: "riasec-landing-career-direction",
      needles: ["career", "career_direction", "career-direction", "job_direction", "job-direction"],
    },
    {
      key: "major-selection",
      testId: "riasec-landing-major-selection",
      needles: ["major", "major_selection", "major-selection", "college_major", "college-major", "study_direction"],
    },
    {
      key: "transition",
      testId: "riasec-landing-transition-scenarios",
      needles: ["transition", "career_transition", "career-transition", "switch_career", "switch-career", "transfer"],
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

function findCareerLinks(surface: LandingSurfaceViewModel): LandingDiscoverabilityItemViewModel[] {
  return surface.discoverabilityItems.filter(
    (item) =>
      itemMatches(item, ["career", "occupation", "job", "major", "riasec_internal_link"]) ||
      item.href.includes("/career/") ||
      item.href.includes("/jobs/")
  );
}

export function RiasecLandingSurfaceSections({ surface }: RiasecLandingSurfaceSectionsProps) {
  if (!surface) {
    return null;
  }

  const modules = buildModules(surface);
  const careerLinks = findCareerLinks(surface);

  if (!modules.length && !careerLinks.length) {
    return null;
  }

  return (
    <section className="space-y-4" data-testid="riasec-landing-surface-sections" data-authority-source="landing_surface_v1">
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

      {careerLinks.length > 0 ? (
        <div
          className="grid gap-3 rounded-2xl border border-[var(--fm-border)] bg-[var(--fm-surface)] p-5 shadow-[var(--fm-shadow-sm)] md:grid-cols-2"
          data-testid="riasec-landing-career-internal-links"
        >
          {careerLinks.map((item) => (
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
