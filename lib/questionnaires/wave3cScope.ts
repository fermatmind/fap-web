import type { archetypeCorePath, archetypeCardThemes } from "./archetypeResultCard";

type Wave3cVariant = {
  shell: "dimensions" | "scalar" | "practice";
  target: Parameters<typeof archetypeCorePath>[1];
  theme: keyof typeof archetypeCardThemes;
};

// Scope is pinned to wave3c_native_other in the 261-item archive plan.
export const wave3cScope = {
  "activity-engagement-patterns": { shell: "dimensions", target: "BIG5_OCEAN", theme: "dusk" },
  "ai-literacy": { shell: "practice", target: "RIASEC", theme: "slate" },
  "arabic-personality-compass": { shell: "dimensions", target: "BIG5_OCEAN", theme: "neon" },
  "asvab-practice-test": { shell: "practice", target: "RIASEC", theme: "gold" },
  "asvab-science-mechanical-practice-test": { shell: "practice", target: "RIASEC", theme: "gold" },
  "caliper-style-assessment-test": { shell: "dimensions", target: "RIASEC", theme: "gold" },
  "competency-test": { shell: "dimensions", target: "RIASEC", theme: "slate" },
  "culture-fit": { shell: "dimensions", target: "RIASEC", theme: "slate" },
  "customer-service-aptitude": { shell: "practice", target: "RIASEC", theme: "slate" },
  "cybersecurity-awareness": { shell: "practice", target: "RIASEC", theme: "slate" },
  "digital-ethics-citizenship": { shell: "practice", target: "RIASEC", theme: "slate" },
  "empathy": { shell: "scalar", target: "EQ_60", theme: "dusk" },
  "employer-reasoning-practice-test": { shell: "practice", target: "RIASEC", theme: "slate" },
  "eras-of-you-test": { shell: "dimensions", target: "BIG5_OCEAN", theme: "dusk" },
  "excel-skills": { shell: "practice", target: "RIASEC", theme: "slate" },
  "feminine-energy": { shell: "dimensions", target: "BIG5_OCEAN", theme: "dusk" },
  "four-axes-test": { shell: "dimensions", target: "BIG5_OCEAN", theme: "neon" },
  "freelance-ready": { shell: "scalar", target: "RIASEC", theme: "gold" },
  "grit-test": { shell: "dimensions", target: "BIG5_OCEAN", theme: "slate" },
  "growth-mindset-fixed-mindset": { shell: "scalar", target: "BIG5_OCEAN", theme: "dusk" },
  "habit-patterns-test": { shell: "dimensions", target: "BIG5_OCEAN", theme: "dusk" },
  "java-test": { shell: "practice", target: "RIASEC", theme: "slate" },
  "javascript-test": { shell: "practice", target: "RIASEC", theme: "slate" },
  "learning-style": { shell: "dimensions", target: "BIG5_OCEAN", theme: "dusk" },
  "libertarian": { shell: "dimensions", target: "BIG5_OCEAN", theme: "neon" },
  "light-triad-test": { shell: "dimensions", target: "BIG5_OCEAN", theme: "dusk" },
  "locus-of-control": { shell: "scalar", target: "BIG5_OCEAN", theme: "slate" },
  "mechanical-reasoning": { shell: "practice", target: "RIASEC", theme: "gold" },
  "mote-type": { shell: "dimensions", target: "EQ_60", theme: "neon" },
  "multiple-intelligences": { shell: "dimensions", target: "BIG5_OCEAN", theme: "dusk" },
  "outfit-line-preferences": { shell: "dimensions", target: "BIG5_OCEAN", theme: "dusk" },
  "personal-finance-literacy": { shell: "practice", target: "RIASEC", theme: "gold" },
  "procrastinator-type-test": { shell: "dimensions", target: "BIG5_OCEAN", theme: "dusk" },
  "project-management": { shell: "practice", target: "RIASEC", theme: "gold" },
  "python-test": { shell: "practice", target: "RIASEC", theme: "slate" },
  "remote-work": { shell: "scalar", target: "RIASEC", theme: "gold" },
  "sdt-motivation": { shell: "dimensions", target: "BIG5_OCEAN", theme: "dusk" },
  "social-intelligence-test": { shell: "scalar", target: "EQ_60", theme: "dusk" },
  "spanish-proficiency": { shell: "practice", target: "RIASEC", theme: "slate" },
  "spatial-reasoning": { shell: "practice", target: "RIASEC", theme: "slate" },
  "spelling-test": { shell: "practice", target: "RIASEC", theme: "slate" },
  "sql-test": { shell: "practice", target: "RIASEC", theme: "slate" },
  "tech-savvy": { shell: "scalar", target: "RIASEC", theme: "slate" },
  "time-management": { shell: "dimensions", target: "RIASEC", theme: "slate" },
  "tipi-10": { shell: "dimensions", target: "BIG5_OCEAN", theme: "slate" },
  "type-ab": { shell: "dimensions", target: "BIG5_OCEAN", theme: "neon" },
  "verbal-reasoning": { shell: "practice", target: "RIASEC", theme: "slate" },
  "watson-glaser-practice-test": { shell: "practice", target: "RIASEC", theme: "slate" },
  "work-activity-interests": { shell: "dimensions", target: "RIASEC", theme: "gold" },
  "work-ethics": { shell: "dimensions", target: "RIASEC", theme: "slate" },
  "workplace-technology": { shell: "practice", target: "RIASEC", theme: "slate" },
  "written-coordination-practice": { shell: "practice", target: "RIASEC", theme: "slate" },
} satisfies Record<string, Wave3cVariant>;

export function wave3cVariant(slug: string): Wave3cVariant | undefined {
  return Object.hasOwn(wave3cScope, slug) ? wave3cScope[slug as keyof typeof wave3cScope] : undefined;
}
