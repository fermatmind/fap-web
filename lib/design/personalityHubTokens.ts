export const PERSONALITY_HUB_COLOR_TOKENS = {
  shellBg: "var(--fm-hub-shell-bg)",
  heroBg: "var(--fm-hub-hero-bg)",
  navy: "var(--fm-hub-navy)",
  navyStrong: "var(--fm-hub-navy-strong)",
  decisionGreen: "var(--fm-hub-decision-green)",
  decisionGreenSoft: "var(--fm-hub-decision-green-soft)",
  frictionRose: "var(--fm-hub-friction-rose)",
  frictionRoseSoft: "var(--fm-hub-friction-rose-soft)",
} as const;

export const PERSONALITY_HUB_SURFACE_TOKENS = {
  panelBg: "var(--fm-hub-panel-bg)",
  panelMutedBg: "var(--fm-hub-panel-muted-bg)",
  matrixBg: "var(--fm-hub-matrix-bg)",
  railBg: "var(--fm-hub-rail-bg)",
  stickyBg: "var(--fm-hub-sticky-bg)",
  stickyBorder: "var(--fm-hub-sticky-border)",
} as const;

export const PERSONALITY_HUB_TYPOGRAPHY_TOKENS = {
  display: "var(--fm-hub-heading-display)",
  section: "var(--fm-hub-heading-section)",
  bodyLg: "var(--fm-hub-body-lg)",
  bodySm: "var(--fm-hub-body-sm)",
} as const;

export const PERSONALITY_HUB_DENSITY_TOKENS = {
  compact: "var(--fm-hub-density-compact)",
  comfortable: "var(--fm-hub-density-comfortable)",
  spacious: "var(--fm-hub-density-spacious)",
} as const;

export const PERSONALITY_HUB_SECTION_TOKENS = {
  shell: {
    background: PERSONALITY_HUB_COLOR_TOKENS.shellBg,
  },
  hero: {
    background: PERSONALITY_HUB_COLOR_TOKENS.heroBg,
    accent: PERSONALITY_HUB_COLOR_TOKENS.navy,
  },
  matrix: {
    background: PERSONALITY_HUB_SURFACE_TOKENS.matrixBg,
    successAccent: PERSONALITY_HUB_COLOR_TOKENS.decisionGreen,
    frictionAccent: PERSONALITY_HUB_COLOR_TOKENS.frictionRose,
  },
  stickyDecisionBar: {
    background: PERSONALITY_HUB_SURFACE_TOKENS.stickyBg,
    border: PERSONALITY_HUB_SURFACE_TOKENS.stickyBorder,
  },
} as const;

export const PERSONALITY_HUB_TOKENS = {
  colors: PERSONALITY_HUB_COLOR_TOKENS,
  surfaces: PERSONALITY_HUB_SURFACE_TOKENS,
  typography: PERSONALITY_HUB_TYPOGRAPHY_TOKENS,
  density: PERSONALITY_HUB_DENSITY_TOKENS,
  sections: PERSONALITY_HUB_SECTION_TOKENS,
} as const;

export type PersonalityHubTokens = typeof PERSONALITY_HUB_TOKENS;
