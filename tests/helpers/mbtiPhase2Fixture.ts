import type { ReportResponse } from "@/lib/api/v0_3";

type EiBand = "clear" | "strong";

type MbtiPhase2FixtureOptions = {
  eiBand?: EiBand;
  eiPct?: number;
  eiDelta?: number;
  isRevisit?: boolean;
  hasUnlock?: boolean;
  hasFeedback?: boolean;
  hasShare?: boolean;
  hasActionEngagement?: boolean;
  primaryFocusKey?: string;
  feedbackSentiment?: string;
  feedbackCoverage?: string;
  actionCompletionTendency?: string;
  lastDeepReadSection?: string;
  currentIntentCluster?: string;
};

function buildReadContractFixture() {
  return {
    version: "mbti.read_contract.v1",
    canonical_read_model: {
      personalization_fields: [
        "schema_version",
        "locale",
        "type_code",
        "identity",
        "axis_vector",
        "scene_fingerprint",
        "action_plan_summary",
        "pack_id",
        "engine_version",
        "dynamic_sections_version",
      ],
      surface_fields: [
        "report.summary",
        "report.profile",
        "report.sections",
        "report.recommended_reads",
        "mbti_public_summary_v1",
        "mbti_public_projection_v1.summary_card",
        "mbti_public_projection_v1.profile",
        "mbti_public_projection_v1.sections",
      ],
      sources: ["report_snapshot", "report_projection"],
    },
    overlay_patch: {
      personalization_fields: [
        "user_state",
        "orchestration",
        "sections",
        "variant_keys",
        "ordered_recommendation_keys",
        "ordered_action_keys",
        "recommendation_priority_keys",
        "action_priority_keys",
        "reading_focus_key",
        "action_focus_key",
        "continuity",
        "cross_assessment_v1",
        "synthesis_keys",
        "supporting_scales",
        "big5_influence_keys",
        "mbti_adjusted_focus_keys",
        "working_life_v1",
        "career_focus_key",
        "career_journey_keys",
        "career_action_priority_keys",
      ],
      surface_fields: [
        "report._meta.personalization.user_state",
        "report._meta.personalization.orchestration",
        "report._meta.personalization.sections",
        "report._meta.personalization.variant_keys",
        "report._meta.personalization.ordered_recommendation_keys",
        "report._meta.personalization.continuity",
        "report._meta.personalization.cross_assessment_v1",
        "report._meta.personalization.working_life_v1",
        "report._meta.personalization.career_focus_key",
        "report._meta.personalization.career_journey_keys",
        "report._meta.personalization.career_action_priority_keys",
        "mbti_public_projection_v1._meta.personalization.user_state",
        "mbti_public_projection_v1._meta.personalization.orchestration",
        "mbti_public_projection_v1._meta.personalization.sections",
        "mbti_public_projection_v1._meta.personalization.variant_keys",
        "mbti_public_projection_v1._meta.personalization.ordered_recommendation_keys",
        "mbti_public_projection_v1._meta.personalization.continuity",
        "mbti_public_projection_v1._meta.personalization.cross_assessment_v1",
        "mbti_public_projection_v1._meta.personalization.working_life_v1",
        "mbti_public_projection_v1._meta.personalization.career_focus_key",
        "mbti_public_projection_v1._meta.personalization.career_journey_keys",
        "mbti_public_projection_v1._meta.personalization.career_action_priority_keys",
      ],
      sources: ["attempt_access", "attempt_events", "share_rows"],
    },
    cacheable_fields: [
      "report",
      "report.summary",
      "report.profile",
      "report.sections",
      "report.recommended_reads",
      "mbti_public_summary_v1",
      "mbti_privacy_contract_v1",
      "mbti_public_projection_v1",
      "mbti_public_projection_v1.summary_card",
      "mbti_public_projection_v1.profile",
      "mbti_public_projection_v1.dimensions",
      "mbti_public_projection_v1.sections",
      "mbti_read_contract_v1",
    ],
    non_cacheable_fields: [
      "report._meta.personalization.user_state",
      "report._meta.personalization.orchestration",
      "report._meta.personalization.sections",
      "report._meta.personalization.variant_keys",
      "report._meta.personalization.ordered_recommendation_keys",
      "report._meta.personalization.continuity",
      "report._meta.personalization.cross_assessment_v1",
      "report._meta.personalization.working_life_v1",
      "report._meta.personalization.career_focus_key",
      "report._meta.personalization.career_journey_keys",
      "report._meta.personalization.career_action_priority_keys",
      "mbti_public_projection_v1._meta.personalization.user_state",
      "mbti_public_projection_v1._meta.personalization.orchestration",
      "mbti_public_projection_v1._meta.personalization.sections",
      "mbti_public_projection_v1._meta.personalization.variant_keys",
      "mbti_public_projection_v1._meta.personalization.ordered_recommendation_keys",
      "mbti_public_projection_v1._meta.personalization.continuity",
      "mbti_public_projection_v1._meta.personalization.cross_assessment_v1",
      "mbti_public_projection_v1._meta.personalization.working_life_v1",
      "mbti_public_projection_v1._meta.personalization.career_focus_key",
      "mbti_public_projection_v1._meta.personalization.career_journey_keys",
      "mbti_public_projection_v1._meta.personalization.career_action_priority_keys",
    ],
    telemetry_parity_fields: [
      "user_state",
      "orchestration.primary_focus_key",
      "orchestration.cta_priority_keys",
      "continuity.carryover_focus_key",
      "ordered_recommendation_keys",
      "ordered_action_keys",
      "reading_focus_key",
      "action_focus_key",
      "cross_assessment_v1.synthesis_keys",
      "cross_assessment_v1.supporting_scales",
      "cross_assessment_v1.big5_influence_keys",
      "cross_assessment_v1.mbti_adjusted_focus_keys",
      "working_life_v1.career_focus_key",
      "working_life_v1.career_journey_keys",
      "working_life_v1.career_action_priority_keys",
    ],
  };
}

function normalizeText(...values: unknown[]): string {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) {
      return normalized;
    }
  }

  return "";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function getProjectionMeta(reportData: ReportResponse): Record<string, unknown> {
  const projection = (reportData.mbti_public_projection_v1 ?? {}) as Record<string, unknown>;
  const meta = asRecord(projection._meta) ?? {};
  projection._meta = meta;
  reportData.mbti_public_projection_v1 = projection;
  return meta;
}

function getReportMeta(reportData: ReportResponse): Record<string, unknown> {
  const report = (reportData.report ?? {}) as Record<string, unknown>;
  const meta = asRecord(report._meta) ?? {};
  report._meta = meta;
  reportData.report = report;
  return meta;
}

function resolveProjectionSectionTitle(key: string): string {
  switch (key) {
    case "traits.why_this_type":
      return "为什么是这个类型";
    case "traits.close_call_axes":
      return "最接近边界的轴";
    case "traits.adjacent_type_contrast":
      return "为什么你像相邻类型";
    case "traits.decision_style":
      return "决策模式";
    case "career.collaboration_fit":
      return "团队协作匹配";
    case "career.work_environment":
      return "工作环境偏好";
    case "career.work_experiments":
      return "工作实验";
    case "career.next_step":
      return "职业下一步";
    case "growth.stress_recovery":
      return "压力与恢复";
    case "growth.stability_confidence":
      return "稳定性与情境敏感";
    case "growth.next_actions":
      return "下一步动作";
    case "growth.weekly_experiments":
      return "本周实验";
    case "growth.watchouts":
      return "风险提醒";
    case "relationships.communication_style":
      return "沟通与协作";
    case "relationships.try_this_week":
      return "本周关系练习";
    default:
      return key;
  }
}

const CHAPTER_SECTION_KEYS = {
  career: [
    "career.summary",
    "career.collaboration_fit",
    "career.work_environment",
    "career.work_experiments",
    "career.advantages",
    "career.weaknesses",
    "career.preferred_roles",
    "career.next_step",
    "career.upgrade_suggestions",
  ],
  growth: [
    "growth.summary",
    "growth.stability_confidence",
    "growth.next_actions",
    "growth.weekly_experiments",
    "growth.strengths",
    "growth.weaknesses",
    "growth.stress_recovery",
    "growth.watchouts",
    "growth.motivators",
    "growth.drainers",
  ],
  traits: [
    "letters_intro",
    "overview",
    "trait_overview",
    "traits.why_this_type",
    "traits.close_call_axes",
    "traits.adjacent_type_contrast",
    "traits.decision_style",
  ],
  relationships: [
    "relationships.summary",
    "relationships.strengths",
    "relationships.weaknesses",
    "relationships.communication_style",
    "relationships.try_this_week",
    "relationships.rel_advantages",
    "relationships.rel_risks",
  ],
} as const;

const ACTION_SECTION_KEYS = [
  "growth.next_actions",
  "growth.weekly_experiments",
  "relationships.try_this_week",
  "career.work_experiments",
  "growth.watchouts",
] as const;

function isClarifySectionKey(sectionKey: string): boolean {
  return sectionKey === "scene_fingerprint"
    || sectionKey === "growth.stability_confidence"
    || sectionKey.startsWith("traits.");
}

function isKnownSectionKey(sectionKey: string): boolean {
  return Object.values(CHAPTER_SECTION_KEYS).some((chapterSections) =>
    chapterSections.includes(sectionKey as never)
  );
}

function buildOrderedSectionKeys(primaryFocusKey: string, secondaryFocusKeys: string[]): string[] {
  const ordered: string[] = [];

  for (const chapterSections of Object.values(CHAPTER_SECTION_KEYS)) {
    const promoted = [
      primaryFocusKey,
      ...secondaryFocusKeys.filter((key) => key !== primaryFocusKey),
    ].filter((key) => chapterSections.includes(key as never));

    const seen = new Set<string>();
    for (const key of [...promoted, ...chapterSections]) {
      if (!key || seen.has(key) || !chapterSections.includes(key as never)) {
        continue;
      }

      seen.add(key);
      ordered.push(key);
    }
  }

  return ordered;
}

function resolvePrimaryFocusKey(input: {
  hasUnlock: boolean;
  isRevisit: boolean;
  hasFeedback: boolean;
  hasActionEngagement: boolean;
  primaryFocusKey?: string;
  feedbackSentiment: string;
  feedbackCoverage: string;
  actionCompletionTendency: string;
  lastDeepReadSection: string;
  currentIntentCluster: string;
}): string {
  if (input.primaryFocusKey) {
    return input.primaryFocusKey;
  }

  if (
    ["negative", "mixed"].includes(input.feedbackSentiment)
    && ["scene_only", "explainability_only", "mixed"].includes(input.feedbackCoverage)
  ) {
    if (isKnownSectionKey(input.lastDeepReadSection) && isClarifySectionKey(input.lastDeepReadSection)) {
      return input.lastDeepReadSection;
    }

    return "traits.close_call_axes";
  }

  if (input.currentIntentCluster === "career_move") {
    return input.hasUnlock ? "career.work_experiments" : "career.next_step";
  }

  if (input.currentIntentCluster === "relationship_tuning") {
    return "relationships.try_this_week";
  }

  if (
    input.currentIntentCluster === "action_activation"
    && ["repeatable", "committed"].includes(input.actionCompletionTendency)
  ) {
    if (ACTION_SECTION_KEYS.includes(input.lastDeepReadSection as (typeof ACTION_SECTION_KEYS)[number])) {
      return input.lastDeepReadSection;
    }

    return input.hasUnlock ? "career.work_experiments" : "growth.weekly_experiments";
  }

  if (input.currentIntentCluster === "deep_reading" && isKnownSectionKey(input.lastDeepReadSection)) {
    return input.lastDeepReadSection;
  }

  if (input.hasFeedback) {
    return "growth.stability_confidence";
  }

  if (!input.hasUnlock) {
    return input.isRevisit ? "growth.weekly_experiments" : "growth.next_actions";
  }

  if (!input.isRevisit) {
    return "career.next_step";
  }

  return input.hasActionEngagement ? "growth.watchouts" : "growth.weekly_experiments";
}

function resolveSecondaryFocusKeys(input: {
  isRevisit: boolean;
  primaryFocusKey: string;
  currentIntentCluster: string;
  lastDeepReadSection: string;
}): string[] {
  const candidates: string[] = [];

  if (isKnownSectionKey(input.lastDeepReadSection) && input.lastDeepReadSection !== input.primaryFocusKey) {
    candidates.push(input.lastDeepReadSection);
  }

  const intentCandidates = (() => {
    switch (input.currentIntentCluster) {
      case "career_move":
        return ["career.next_step", "growth.weekly_experiments", "relationships.try_this_week"];
      case "relationship_tuning":
        return ["relationships.communication_style", "growth.watchouts", "career.work_experiments"];
      case "clarify_type":
        return ["traits.adjacent_type_contrast", "growth.stability_confidence", "career.work_experiments"];
      case "action_activation":
        return ["growth.weekly_experiments", "career.work_experiments", "relationships.try_this_week"];
      case "deep_reading":
        return ["career.work_experiments", "traits.close_call_axes", "growth.watchouts"];
      default:
        return [];
    }
  })();

  candidates.push(...intentCandidates);
  candidates.push(
    ...(input.isRevisit
      ? ["career.work_experiments", "relationships.try_this_week", "growth.watchouts"]
      : ["traits.close_call_axes", "traits.adjacent_type_contrast", "career.work_experiments"])
  );

  const selected: string[] = [];
  for (const candidate of candidates) {
    if (!isKnownSectionKey(candidate) || candidate === input.primaryFocusKey || selected.includes(candidate)) {
      continue;
    }

    selected.push(candidate);
    if (selected.length >= 2) {
      break;
    }
  }

  return selected;
}

function resolveCtaPriorityKeys(input: {
  hasUnlock: boolean;
  isRevisit: boolean;
  hasFeedback: boolean;
  hasShare: boolean;
  hasActionEngagement: boolean;
  feedbackSentiment: string;
  actionCompletionTendency: string;
  currentIntentCluster: string;
  primaryFocusKey: string;
}): string[] {
  if (input.currentIntentCluster === "career_move" || input.primaryFocusKey.startsWith("career.")) {
    return input.hasUnlock
      ? ["career_bridge", "workspace_lite", "share_result"]
      : ["career_bridge", "unlock_full_report", "share_result"];
  }

  if (
    input.currentIntentCluster === "clarify_type"
    || ["negative", "mixed"].includes(input.feedbackSentiment)
  ) {
    return input.hasUnlock
      ? ["workspace_lite", "career_bridge", "share_result"]
      : ["unlock_full_report", "share_result", "career_bridge"];
  }

  if (
    input.currentIntentCluster === "action_activation"
    && ["repeatable", "committed"].includes(input.actionCompletionTendency)
  ) {
    return input.hasUnlock
      ? ["workspace_lite", "career_bridge", "share_result"]
      : ["career_bridge", "unlock_full_report", "share_result"];
  }

  if (!input.hasUnlock) {
    if (input.isRevisit && (input.hasFeedback || input.hasShare)) {
      return ["career_bridge", "unlock_full_report", "share_result"];
    }

    return ["unlock_full_report", "career_bridge", "share_result"];
  }

  if (input.isRevisit && input.hasActionEngagement) {
    return ["career_bridge", "workspace_lite", "share_result"];
  }

  return ["career_bridge", "share_result", "workspace_lite"];
}

function resolveCarryoverReason(input: {
  isRevisit: boolean;
  hasUnlock: boolean;
  hasFeedback: boolean;
  hasActionEngagement: boolean;
  primaryFocusKey: string;
}): string {
  if (input.hasFeedback) {
    return "refine_after_feedback";
  }

  if (input.isRevisit && input.hasActionEngagement) {
    return "resume_action_loop";
  }

  if (input.primaryFocusKey.startsWith("career.")) {
    return "continue_career_bridge";
  }

  if (input.primaryFocusKey.startsWith("relationships.")) {
    return "continue_relationship_practice";
  }

  if (input.primaryFocusKey.startsWith("traits.")) {
    return "continue_explainability_focus";
  }

  if (input.isRevisit) {
    return "resume_previous_focus";
  }

  return input.hasUnlock ? "resume_previous_focus" : "unlock_to_continue_focus";
}

function resolveCarryoverSceneKeys(primaryFocusKey: string): string[] {
  if (primaryFocusKey.startsWith("career.")) {
    return ["work", "growth"];
  }

  if (primaryFocusKey.startsWith("relationships.")) {
    return ["relationships", "communication"];
  }

  if (primaryFocusKey.startsWith("traits.")) {
    return ["decision", "work"];
  }

  return ["growth", "work"];
}

function resolveOrderedRecommendationKeys(primaryFocusKey: string): string[] {
  if (primaryFocusKey.startsWith("career.")) {
    return ["read-career", "read-action", "read-explain", "read-relationship"];
  }

  if (primaryFocusKey.startsWith("relationships.")) {
    return ["read-relationship", "read-action", "read-career", "read-explain"];
  }

  if (
    primaryFocusKey === "growth.stability_confidence"
    || primaryFocusKey === "growth.watchouts"
    || primaryFocusKey.startsWith("traits.")
  ) {
    return ["read-explain", "read-action", "read-career", "read-relationship"];
  }

  return ["read-action", "read-career", "read-relationship", "read-explain"];
}

function resolveOrderedActionKeys(primaryFocusKey: string): string[] {
  if (primaryFocusKey.startsWith("career.")) {
    return [
      "work_experiment.theme.name_decision_rule",
      "weekly_action.theme.name_decision_rule",
      "relationship_action.theme.name_decision_rule",
      "watchout.stability.context_sensitive",
    ];
  }

  if (primaryFocusKey.startsWith("relationships.")) {
    return [
      "relationship_action.theme.name_decision_rule",
      "weekly_action.theme.name_decision_rule",
      "work_experiment.theme.name_decision_rule",
      "watchout.stability.context_sensitive",
    ];
  }

  if (primaryFocusKey === "growth.stability_confidence" || primaryFocusKey === "growth.watchouts") {
    return [
      "watchout.stability.context_sensitive",
      "weekly_action.theme.name_decision_rule",
      "work_experiment.theme.name_decision_rule",
      "relationship_action.theme.name_decision_rule",
    ];
  }

  return [
    "weekly_action.theme.name_decision_rule",
    "work_experiment.theme.name_decision_rule",
    "relationship_action.theme.name_decision_rule",
    "watchout.stability.context_sensitive",
  ];
}

function buildRecommendedReads(): Array<Record<string, unknown>> {
  return [
    {
      id: "read-action",
      canonical_id: "read-action",
      type: "article",
      title: "Action experiments that keep the result moving",
      desc: "Start with a small weekly experiment that turns this profile into action.",
      url: "https://example.com/read-action",
      canonical_url: "https://example.com/read-action",
      cta: "Read the action note",
      priority: 10,
      tags: ["action", "growth"],
      estimated_minutes: 5,
      status: "published",
      published_at: "2026-03-01T00:00:00Z",
      updated_at: "2026-03-02T00:00:00Z",
    },
    {
      id: "read-career",
      canonical_id: "read-career",
      type: "article",
      title: "Career environment alignment",
      desc: "Continue with the work and role-fit cues that match this profile.",
      url: "https://example.com/read-career",
      canonical_url: "https://example.com/read-career",
      cta: "Read the career note",
      priority: 20,
      tags: ["career", "work"],
      estimated_minutes: 7,
      status: "published",
      published_at: "2026-03-03T00:00:00Z",
      updated_at: "2026-03-04T00:00:00Z",
    },
    {
      id: "read-relationship",
      canonical_id: "read-relationship",
      type: "article",
      title: "Relationship boundary reading",
      desc: "Read the interaction patterns and boundary cues to use this week.",
      url: "https://example.com/read-relationship",
      canonical_url: "https://example.com/read-relationship",
      cta: "Read the relationship note",
      priority: 30,
      tags: ["relationships", "communication"],
      estimated_minutes: 6,
      status: "published",
      published_at: "2026-03-05T00:00:00Z",
      updated_at: "2026-03-06T00:00:00Z",
    },
    {
      id: "read-explain",
      canonical_id: "read-explain",
      type: "article",
      title: "Why this type still fits",
      desc: "Read the borderline and explainability layer before changing anything.",
      url: "https://example.com/read-explain",
      canonical_url: "https://example.com/read-explain",
      cta: "Read the explainability note",
      priority: 40,
      tags: ["explainability", "stability", "mbti"],
      estimated_minutes: 8,
      status: "published",
      published_at: "2026-03-07T00:00:00Z",
      updated_at: "2026-03-08T00:00:00Z",
    },
  ];
}

function createProjectionSectionShell(key: string): Record<string, unknown> {
  return {
    key,
    title: resolveProjectionSectionTitle(key),
    render: "rich_text",
    body_md: "",
    payload: {},
    source: "projection",
  };
}

function getProjectionSection(reportData: ReportResponse, key: string): Record<string, unknown> {
  const projection = reportData.mbti_public_projection_v1 as Record<string, unknown> | null | undefined;
  const sections = Array.isArray(projection?.sections) ? projection.sections : [];
  let section = sections.find((item) => asRecord(item)?.key === key);
  if (!section || !asRecord(section)) {
    section = createProjectionSectionShell(key);
    sections.push(section);
    if (projection) {
      projection.sections = sections;
    }
  }

  return section as Record<string, unknown>;
}

function updateSection(
  reportData: ReportResponse,
  key: string,
  patch: {
    variantKey: string;
    sceneKey: string;
    styleKey: string;
    actionKey?: string;
    contrastKey?: string;
    primaryAxis: Record<string, unknown>;
    supportAxis?: Record<string, unknown> | null;
    boundaryAxes: string[];
    closeCallAxes?: Array<Record<string, unknown>>;
    neighborTypeKeys?: string[];
    blocks: Array<Record<string, unknown>>;
  }
) {
  const section = getProjectionSection(reportData, key);
  const payload = asRecord(section.payload) ?? {};
  payload.personalization = {
    variant_key: patch.variantKey,
    scene_key: patch.sceneKey,
    style_key: patch.styleKey,
    action_key: patch.actionKey ?? "",
    contrast_key: patch.contrastKey ?? "",
    primary_axis: patch.primaryAxis,
    support_axis: patch.supportAxis ?? null,
    boundary_axes: patch.boundaryAxes,
    close_call_axes: patch.closeCallAxes ?? [],
    neighbor_type_keys: patch.neighborTypeKeys ?? [],
    selected_blocks: patch.blocks.map((block) => normalizeText(block.id)),
  };
  payload.blocks = patch.blocks;
  section.payload = payload;
  section._meta = {
    ...(asRecord(section._meta) ?? {}),
    variant_key: patch.variantKey,
  };
}

export function applyMbtiPhase2Fixture(
  reportData: ReportResponse,
  options: MbtiPhase2FixtureOptions = {}
) {
  const eiBand = options.eiBand ?? "clear";
  const eiPct = options.eiPct ?? (eiBand === "strong" ? 77 : 67);
  const eiDelta = options.eiDelta ?? (eiBand === "strong" ? 27 : 17);
  const isRevisit = options.isRevisit ?? false;
  const hasUnlock = options.hasUnlock ?? false;
  const hasFeedback = options.hasFeedback ?? false;
  const hasShare = options.hasShare ?? false;
  const hasActionEngagement = options.hasActionEngagement ?? false;
  const feedbackSentiment = options.feedbackSentiment ?? "none";
  const feedbackCoverage = options.feedbackCoverage ?? "none";
  const actionCompletionTendency =
    options.actionCompletionTendency
    ?? (hasActionEngagement ? (isRevisit ? "repeatable" : "warming_up") : hasUnlock ? "available" : "idle");
  const lastDeepReadSection = options.lastDeepReadSection ?? "";
  const currentIntentCluster = options.currentIntentCluster ?? "default";

  const eiAxis = {
    axis: "EI",
    axis_label: "能量方向",
    side: "E",
    side_label: "外倾",
    pct: eiPct,
    delta: eiDelta,
    state: eiBand,
    band: eiBand,
  };
  const snAxis = {
    axis: "SN",
    axis_label: "信息偏好",
    side: "N",
    side_label: "直觉",
    pct: 64,
    delta: 14,
    state: "clear",
    band: "clear",
  };
  const tfAxis = {
    axis: "TF",
    axis_label: "决策偏好",
    side: "T",
    side_label: "思考",
    pct: 59,
    delta: 9,
    state: "balanced",
    band: "boundary",
  };
  const jpAxis = {
    axis: "JP",
    axis_label: "生活方式",
    side: "J",
    side_label: "判断",
    pct: 57,
    delta: 7,
    state: "moderate",
    band: "boundary",
  };
  const atAxis = {
    axis: "AT",
    axis_label: "身份层",
    side: "T",
    side_label: "敏感",
    pct: 68,
    delta: 18,
    state: "clear",
    band: "clear",
  };

  const overviewVariantKey = `overview:EI.E.${eiBand}:identity.T:boundary.none`;
  const traitOverviewVariantKey = `trait_overview:EI.E.${eiBand}:identity.T:boundary.none`;
  const workStyleKey = `work.primary.EI.E.${eiBand}`;
  const growthStyleKey = `growth.primary.EI.E.${eiBand}`;
  const communicationStyleKey = `communication.primary.EI.E.${eiBand}`;
  const roleFitKeys = [
    "role_fit.role.NF",
    `role_fit.primary.EI.E.${eiBand}`,
    "role_fit.support.JP.J.boundary",
    "role_fit.identity.T",
    "role_fit.boundary.JP",
    "role_fit.boundary.TF",
  ];
  const collaborationFitKeys = [
    `collaboration_fit.primary.EI.E.${eiBand}`,
    "collaboration_fit.support.TF.T.boundary",
    "collaboration_fit.identity.T",
    "collaboration_fit.boundary.TF",
    "collaboration_fit.boundary.JP",
    "collaboration_fit.decision_boundary.TF",
    "collaboration_fit.decision_boundary.JP",
  ];
  const workEnvPreferenceKeys = [
    `work_env.primary.EI.E.${eiBand}`,
    "work_env.support.JP.J.boundary",
    "work_env.identity.T",
    "work_env.boundary.JP",
    "work_env.boundary.TF",
    "work_env.preference.high_collaboration",
  ];
  const careerNextStepKeys = [
    "career_next_step.primary.TF.T.boundary",
    "career_next_step.support.JP.J.boundary",
    "career_next_step.identity.T",
    "career_next_step.boundary.TF",
    "career_next_step.boundary.JP",
    "career_next_step.theme.clarify_decision_criteria",
  ];
  const actionPlanSummary =
    "接下来最值得做的，是把成长、关系和工作里的高匹配动作都缩成一周内能重复的小实验。你的主类型很清楚，但 TF 和 JP 靠近边界，所以动作越小，越能帮你看清什么真正适合你。";
  const weeklyActionKeys = [
    `weekly_action.primary.EI.E.${eiBand}`,
    "weekly_action.support.SN.N.clear",
    "weekly_action.identity.T",
    "weekly_action.boundary.TF",
    "weekly_action.boundary.JP",
    "weekly_action.theme.name_decision_rule",
  ];
  const relationshipActionKeys = [
    `relationship_action.primary.EI.E.${eiBand}`,
    "relationship_action.support.TF.T.boundary",
    "relationship_action.identity.T",
    "relationship_action.boundary.TF",
    "relationship_action.boundary.JP",
    "relationship_action.theme.name_decision_rule",
  ];
  const workExperimentKeys = [
    `work_experiment.primary.EI.E.${eiBand}`,
    "work_experiment.support.JP.J.boundary",
    "work_experiment.identity.T",
    "work_experiment.boundary.JP",
    "work_experiment.boundary.TF",
    "work_experiment.theme.name_decision_rule",
  ];
  const watchoutKeys = [
    "watchout.primary.JP.J.boundary",
    "watchout.support.EI.E.clear",
    "watchout.identity.T",
    "watchout.close_call.JP",
    "watchout.close_call.TF",
    "watchout.stability.context_sensitive",
  ];
  const explainabilitySummary =
    "你的主类型不是靠单一标签撑起来的，而是由外倾这条主轴拉开基础差距，再由接近边界的生活方式与决策偏好决定你为什么不像刻板印象里那么单一。";
  const closeCallAxes = [
    {
      ...jpAxis,
      opposite_side: "P",
      opposite_side_label: "感知",
      boundary: true,
    },
    {
      ...tfAxis,
      opposite_side: "F",
      opposite_side_label: "情感",
      boundary: true,
    },
  ];
  const neighborTypeKeys = ["ENFJ", "ENTP"];
  const contrastKeys = {
    "traits.why_this_type": `traits.why_this_type:dominant.EI.E.${eiBand}`,
    "traits.close_call_axes": "traits.close_call_axes:close.JP-TF",
    "traits.adjacent_type_contrast": "traits.adjacent_type_contrast:neighbor.ENFJ-ENTP",
    "growth.stability_confidence": "growth.stability_confidence:stability.context_sensitive",
  };
  const confidenceOrStabilityKeys = [
    "stability.bucket.context_sensitive",
    "stability.close_call.JP",
    "stability.close_call.TF",
    "stability.identity.T",
  ];
  const primaryFocusKey = resolvePrimaryFocusKey({
    hasUnlock,
    isRevisit,
    hasFeedback,
    hasActionEngagement,
    primaryFocusKey: options.primaryFocusKey,
    feedbackSentiment,
    feedbackCoverage,
    actionCompletionTendency,
    lastDeepReadSection,
    currentIntentCluster,
  });
  const secondaryFocusKeys = resolveSecondaryFocusKeys({
    isRevisit,
    primaryFocusKey,
    currentIntentCluster,
    lastDeepReadSection,
  });
  const ctaPriorityKeys = resolveCtaPriorityKeys({
    hasUnlock,
    isRevisit,
    hasFeedback,
    hasShare,
    hasActionEngagement,
    feedbackSentiment,
    actionCompletionTendency,
    currentIntentCluster,
    primaryFocusKey,
  });
  const orderedSectionKeys = buildOrderedSectionKeys(primaryFocusKey, secondaryFocusKeys);
  const carryoverReason = resolveCarryoverReason({
    isRevisit,
    hasUnlock,
    hasFeedback,
    hasActionEngagement,
    primaryFocusKey,
  });
  const carryoverSceneKeys = resolveCarryoverSceneKeys(primaryFocusKey);
  const carryoverActionKeys = [
    normalizeText(weeklyActionKeys[5]),
    normalizeText(workExperimentKeys[5], relationshipActionKeys[5]),
  ].filter(Boolean);
  const recommendedResumeKeys = Array.from(
    new Set([primaryFocusKey, ...secondaryFocusKeys, "career.next_step"].filter(Boolean))
  );
  const orderedRecommendationKeys = resolveOrderedRecommendationKeys(primaryFocusKey);
  const orderedActionKeys = resolveOrderedActionKeys(primaryFocusKey);
  const recommendedReads = buildRecommendedReads();
  const crossAssessment = {
    version: "mbti_big5.cross_assessment.v1",
    supporting_scales: ["BIG5_OCEAN"],
    supporting_attempt_id: "big5-attempt-1",
    synthesis_keys: [
      "big5.neuroticism.high.buffer_reactivity",
      "big5.conscientiousness.low.use_external_scaffolding",
      "big5.career_next_step.low.reduce_activation_friction",
    ],
    big5_influence_keys: ["big5.band.n.high", "big5.band.c.low"],
    mbti_adjusted_focus_keys: [
      "growth.stability_confidence",
      "growth.next_actions",
      "career.next_step",
    ],
    supporting_traits: ["N", "A", "O"],
    section_enhancements: {
      "growth.stability_confidence": {
        section_key: "growth.stability_confidence",
        supporting_scale: "BIG5_OCEAN",
        synthesis_key: "big5.neuroticism.high.buffer_reactivity",
        title: "Big Five 补充：高情绪性会放大情境敏感",
        body: "Big Five 显示你的情绪性更高，这会放大 MBTI 里“情境敏感型稳定”的体感强度。",
        influence_keys: ["big5.band.n.high"],
      },
      "growth.next_actions": {
        section_key: "growth.next_actions",
        supporting_scale: "BIG5_OCEAN",
        synthesis_key: "big5.conscientiousness.low.use_external_scaffolding",
        title: "Big Five 补充：低尽责性更需要外部支架",
        body: "Big Five 显示你的尽责性更低，所以 MBTI 的下一步动作不要依赖纯意志力。",
        influence_keys: ["big5.band.c.low"],
      },
      "career.next_step": {
        section_key: "career.next_step",
        supporting_scale: "BIG5_OCEAN",
        synthesis_key: "big5.career_next_step.low.reduce_activation_friction",
        title: "Big Five 补充：低尽责性更适合先降低职业动作摩擦",
        body: "Big Five 显示你的尽责性更低，所以职业下一步更适合先收缩成一次对话、一次投递或一次环境试探。",
        influence_keys: ["big5.band.c.low"],
      },
    },
  };
  const careerFocusKey = primaryFocusKey.startsWith("career.")
    ? primaryFocusKey
    : currentIntentCluster === "career_move"
      ? hasUnlock
        ? "career.work_experiments"
        : "career.next_step"
      : "career.next_step";
  const careerJourneyKeys =
    careerFocusKey === "career.work_experiments"
      ? ["career.work_experiments", "career.next_step", "career.work_environment", "career.collaboration_fit"]
      : ["career.next_step", "career.work_experiments", "career.work_environment", "career.collaboration_fit"];
  const careerActionPriorityKeys = Array.from(
    new Set([careerFocusKey, "career.next_step", "career.work_experiments", "career_bridge"])
  );
  const workingLife = {
    version: "mbti.working_life.v1",
    career_focus_key: careerFocusKey,
    career_journey_keys: careerJourneyKeys,
    role_fit_keys: roleFitKeys,
    collaboration_fit_keys: collaborationFitKeys,
    work_env_preference_keys: workEnvPreferenceKeys,
    career_next_step_keys: careerNextStepKeys,
    career_action_priority_keys: careerActionPriorityKeys,
    career_reading_keys: orderedRecommendationKeys.filter(
      (key) => key.includes("career") || key.includes("action")
    ),
    supporting_scales: ["BIG5_OCEAN"],
    big5_influence_keys: ["big5.band.n.high", "big5.band.c.low"],
    synthesis_keys: ["big5.career_next_step.low.reduce_activation_friction"],
  };

  reportData.locked = hasUnlock ? false : true;
  reportData.variant = hasUnlock ? "full" : "free";
  reportData.access_level = hasUnlock ? "full" : "preview";

  const personalization = {
    schema_version: "mbti.personalization.phase9c.v1",
    locale: "zh-CN",
    type_code: "ENFP-T",
    identity: "T",
    explainability_summary: explainabilitySummary,
    close_call_axes: closeCallAxes,
    neighbor_type_keys: neighborTypeKeys,
    contrast_keys: contrastKeys,
    confidence_or_stability_keys: confidenceOrStabilityKeys,
    axis_vector: {
      EI: eiAxis,
      SN: snAxis,
      TF: tfAxis,
      JP: jpAxis,
      AT: atAxis,
    },
    axis_bands: {
      EI: eiBand,
      SN: "clear",
      TF: "boundary",
      JP: "boundary",
      AT: "clear",
    },
    boundary_flags: {
      EI: false,
      SN: false,
      TF: true,
      JP: true,
      AT: false,
    },
    dominant_axes: [eiAxis, snAxis, tfAxis, jpAxis],
    scene_fingerprint: {
      work: {
        scene: "work",
        title: "你的工作模式",
        summary:
          eiBand === "strong"
            ? "在工作里，你通常先用把能量投向外部互动、讨论与现场反馈开局，再用收拢重点、快速定版把节奏拉回可执行。T 身份层会放大你对反馈和结果波动的感知。"
            : "在工作里，你通常先用把能量投向外部互动、讨论与现场反馈开局，再用收拢重点、快速定版把节奏拉回可执行。T 身份层会放大你对反馈和结果波动的感知。",
        style_key: workStyleKey,
        style_keys: [
          workStyleKey,
          "work.support.JP.J.boundary",
          "work.identity.T",
          "work.boundary.JP",
          "work.boundary.TF",
        ],
        chapter_anchor: "career",
        primary_axis: eiAxis,
        support_axis: jpAxis,
        boundary_axes: ["JP", "TF"],
      },
      relationships: {
        scene: "relationships",
        title: "你的关系模式",
        summary:
          "在关系里，你常先以按逻辑、结构和可验证性来判断稳定边界，再通过外部互动和反馈决定要靠近、回应还是设边界。",
        style_key: "relationships.primary.TF.T.boundary",
        style_keys: [
          "relationships.primary.TF.T.boundary",
          "relationships.support.EI.E.clear",
          "relationships.identity.T",
          "relationships.boundary.TF",
          "relationships.boundary.JP",
        ],
        chapter_anchor: "relationships",
        primary_axis: tfAxis,
        support_axis: eiAxis,
        boundary_axes: ["TF", "JP"],
      },
      growth: {
        scene: "growth",
        title: "你的成长模式",
        summary: "成长上，你的高杠杆点通常来自外部互动与反馈；当你再补上趋势感和整体意义时，进步会更稳定。",
        style_key: growthStyleKey,
        style_keys: [
          growthStyleKey,
          "growth.support.SN.N.clear",
          "growth.identity.T",
          "growth.boundary.TF",
          "growth.boundary.JP",
        ],
        chapter_anchor: "growth",
        primary_axis: eiAxis,
        support_axis: snAxis,
        boundary_axes: ["TF", "JP"],
      },
      decision: {
        scene: "decision",
        title: "你的决策模式",
        summary: "做决定时，你通常先靠逻辑、结构和可验证性来判断缩小范围，再用收拢重点和明确优先级确认是否值得推进。",
        style_key: "decision.primary.TF.T.boundary",
        style_keys: [
          "decision.primary.TF.T.boundary",
          "decision.support.JP.J.boundary",
          "decision.identity.T",
          "decision.boundary.TF",
          "decision.boundary.JP",
        ],
        chapter_anchor: "overview",
        primary_axis: tfAxis,
        support_axis: jpAxis,
        boundary_axes: ["TF", "JP"],
      },
      stress_recovery: {
        scene: "stress_recovery",
        title: "你的压力恢复模式",
        summary: "压力升高时，你容易先滑向收拢范围、快速定版来求稳；恢复阶段则更需要外部互动与反馈把你拉回可用区。",
        style_key: "stress_recovery.primary.JP.J.boundary",
        style_keys: [
          "stress_recovery.primary.JP.J.boundary",
          "stress_recovery.support.EI.E.clear",
          "stress_recovery.identity.T",
          "stress_recovery.boundary.JP",
          "stress_recovery.boundary.TF",
        ],
        chapter_anchor: "growth",
        primary_axis: jpAxis,
        support_axis: eiAxis,
        boundary_axes: ["JP", "TF"],
      },
      communication: {
        scene: "communication",
        title: "你的沟通模式",
        summary: "沟通里，你通常先以外部互动和反馈发起，再用逻辑框架与协作边界修正对齐。",
        style_key: communicationStyleKey,
        style_keys: [
          communicationStyleKey,
          "communication.support.TF.T.boundary",
          "communication.identity.T",
          "communication.boundary.TF",
          "communication.boundary.JP",
        ],
        chapter_anchor: "relationships",
        primary_axis: eiAxis,
        support_axis: tfAxis,
        boundary_axes: ["TF", "JP"],
      },
    },
    work_style_keys: [
      workStyleKey,
      "work.support.JP.J.boundary",
      "work.identity.T",
      "work.boundary.JP",
      "work.boundary.TF",
    ],
    relationship_style_keys: [
      "relationships.primary.TF.T.boundary",
      "relationships.support.EI.E.clear",
      "relationships.identity.T",
      "relationships.boundary.TF",
      "relationships.boundary.JP",
    ],
    decision_style_keys: [
      "decision.primary.TF.T.boundary",
      "decision.support.JP.J.boundary",
      "decision.identity.T",
      "decision.boundary.TF",
      "decision.boundary.JP",
    ],
    stress_recovery_keys: [
      "stress_recovery.primary.JP.J.boundary",
      "stress_recovery.support.EI.E.clear",
      "stress_recovery.identity.T",
      "stress_recovery.boundary.JP",
      "stress_recovery.boundary.TF",
    ],
    communication_style_keys: [
      communicationStyleKey,
      "communication.support.TF.T.boundary",
      "communication.identity.T",
      "communication.boundary.TF",
      "communication.boundary.JP",
    ],
    work_style_summary:
      "在工作里，你通常先用把能量投向外部互动、讨论与现场反馈开局，再用收拢重点、快速定版把节奏拉回可执行。T 身份层会放大你对反馈和结果波动的感知。",
    role_fit_keys: roleFitKeys,
    collaboration_fit_keys: collaborationFitKeys,
    work_env_preference_keys: workEnvPreferenceKeys,
    career_next_step_keys: careerNextStepKeys,
    action_plan_summary: actionPlanSummary,
    weekly_action_keys: weeklyActionKeys,
    relationship_action_keys: relationshipActionKeys,
    work_experiment_keys: workExperimentKeys,
    watchout_keys: watchoutKeys,
    ordered_recommendation_keys: orderedRecommendationKeys,
    ordered_action_keys: orderedActionKeys,
    recommendation_priority_keys: orderedRecommendationKeys.slice(0, 3),
    action_priority_keys: orderedActionKeys.slice(0, 4),
    reading_focus_key: orderedRecommendationKeys[0] ?? "",
    action_focus_key: orderedActionKeys[0] ?? "",
    user_state: {
      is_first_view: !isRevisit,
      is_revisit: isRevisit,
      has_unlock: hasUnlock,
      has_feedback: hasFeedback,
      has_share: hasShare,
      has_action_engagement: hasActionEngagement,
      feedback_sentiment: feedbackSentiment,
      feedback_coverage: feedbackCoverage,
      action_completion_tendency: actionCompletionTendency,
      last_deep_read_section: lastDeepReadSection,
      current_intent_cluster: currentIntentCluster,
    },
    orchestration: {
      ordered_section_keys: orderedSectionKeys,
      primary_focus_key: primaryFocusKey,
      secondary_focus_keys: secondaryFocusKeys,
      cta_priority_keys: ctaPriorityKeys,
    },
    continuity: {
      carryover_focus_key: primaryFocusKey,
      carryover_reason: carryoverReason,
      recommended_resume_keys: recommendedResumeKeys,
      carryover_scene_keys: carryoverSceneKeys,
      carryover_action_keys: carryoverActionKeys,
    },
    read_contract_v1: buildReadContractFixture(),
    cross_assessment_v1: crossAssessment,
    synthesis_keys: crossAssessment.synthesis_keys,
    supporting_scales: crossAssessment.supporting_scales,
    big5_influence_keys: crossAssessment.big5_influence_keys,
    mbti_adjusted_focus_keys: crossAssessment.mbti_adjusted_focus_keys,
    working_life_v1: workingLife,
    career_focus_key: careerFocusKey,
    career_journey_keys: careerJourneyKeys,
    career_action_priority_keys: careerActionPriorityKeys,
    variant_keys: {
      overview: overviewVariantKey,
      trait_overview: traitOverviewVariantKey,
      "traits.why_this_type": `traits.why_this_type:EI.E.${eiBand}:identity.T:boundary.JP`,
      "traits.close_call_axes": "traits.close_call_axes:JP.J.boundary:identity.T:boundary.JP",
      "traits.adjacent_type_contrast": "traits.adjacent_type_contrast:JP.J.boundary:identity.T:neighbor.ENFJ",
      "traits.decision_style": "traits.decision_style:TF.T.boundary:identity.T:boundary.TF",
      "career.summary": `career.summary:EI.E.${eiBand}:identity.T:boundary.JP`,
      "career.collaboration_fit": `career.collaboration_fit:EI.E.${eiBand}:identity.T:boundary.TF`,
      "career.work_environment": `career.work_environment:EI.E.${eiBand}:identity.T:boundary.JP`,
      "career.work_experiments": `career.work_experiments:EI.E.${eiBand}:identity.T:action.work_experiment_theme_name_decision_rule:boundary.JP`,
      "career.advantages": `career.advantages:EI.E.${eiBand}:identity.T:boundary.JP`,
      "growth.summary": `growth.summary:EI.E.${eiBand}:identity.T:boundary.TF`,
      "growth.stability_confidence": "growth.stability_confidence:stability.context_sensitive:identity.T:boundary.JP:synth.big5_neuroticism_high_buffer_reactivity",
      "growth.next_actions": `growth.next_actions:EI.E.${eiBand}:identity.T:action.weekly_action_theme_name_decision_rule:boundary.TF:synth.big5_conscientiousness_low_use_external_scaffolding`,
      "growth.weekly_experiments": `growth.weekly_experiments:EI.E.${eiBand}:identity.T:action.weekly_action_theme_name_decision_rule:boundary.TF`,
      "growth.stress_recovery": "growth.stress_recovery:JP.J.boundary:identity.T:boundary.JP",
      "growth.watchouts": "growth.watchouts:JP.J.boundary:identity.T:action.watchout_stability_context_sensitive:boundary.JP",
      "growth.drainers": "growth.drainers:JP.J.boundary:identity.T:boundary.JP",
      "relationships.summary": "relationships.summary:TF.T.boundary:identity.T:boundary.TF",
      "relationships.communication_style": `relationships.communication_style:EI.E.${eiBand}:identity.T:boundary.TF`,
      "relationships.try_this_week": `relationships.try_this_week:EI.E.${eiBand}:identity.T:action.relationship_action_theme_name_decision_rule:boundary.TF`,
      "relationships.rel_advantages": `relationships.rel_advantages:EI.E.${eiBand}:identity.T:boundary.TF`,
      "relationships.rel_risks": "relationships.rel_risks:TF.T.boundary:identity.T:boundary.TF",
      "career.next_step": "career.next_step:TF.T.boundary:identity.T:boundary.TF:synth.big5_career_next_step_low_reduce_activation_friction",
    },
    pack_id: "MBTI.cn-mainland.zh-CN.v0.3",
    engine_version: "v1.2",
    dynamic_sections_version: "phase9c.v1",
  };

  if (reportData.report) {
    reportData.report.recommended_reads = structuredClone(recommendedReads);
  }
  reportData.mbti_read_contract_v1 = structuredClone(buildReadContractFixture());
  reportData.mbti_cross_assessment_v1 = structuredClone(crossAssessment);
  getProjectionMeta(reportData).personalization = structuredClone(personalization);
  getReportMeta(reportData).personalization = structuredClone(personalization);

  updateSection(reportData, "overview", {
    variantKey: overviewVariantKey,
    sceneKey: "overview",
    styleKey: "",
    primaryAxis: eiAxis,
    supportAxis: snAxis,
    boundaryAxes: [],
    blocks: [
      {
        id: `overview.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在能量方向上，你的外倾偏好已经很鲜明。你通常不会先停在中间，而会自然把注意力和行动拉向这一侧。"
            : "在能量方向上，你已经呈现出稳定的外倾倾向；它会解释你多数第一反应，但不会压扁另一侧的可用性。",
      },
      {
        id: "overview.scene.EI.E",
        kind: "scene",
        label: "场景应用",
        text: "放到日常场景里，这条主轴通常会表现成：你更容易先把能量投向外部互动、讨论与现场反馈。这会决定别人首先从哪里理解你。",
      },
      {
        id: "overview.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
    ],
  });

  updateSection(reportData, "trait_overview", {
    variantKey: traitOverviewVariantKey,
    sceneKey: "overview",
    styleKey: "",
    primaryAxis: eiAxis,
    supportAxis: snAxis,
    boundaryAxes: [],
    blocks: [
      {
        id: `trait_overview.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在能量方向上，你的外倾偏好已经很鲜明。你通常不会先停在中间，而会自然把注意力和行动拉向这一侧。"
            : "在能量方向上，你已经呈现出稳定的外倾倾向；它会解释你多数第一反应，但不会压扁另一侧的可用性。",
      },
      {
        id: "trait_overview.scene.EI.E",
        kind: "scene",
        label: "场景应用",
        text: "放到日常场景里，这条主轴通常会表现成：你更容易先把能量投向外部互动、讨论与现场反馈。这会决定别人首先从哪里理解你。",
      },
      {
        id: "trait_overview.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
    ],
  });

  updateSection(reportData, "traits.why_this_type", {
    variantKey: `traits.why_this_type:EI.E.${eiBand}:identity.T:boundary.JP`,
    sceneKey: "explainability",
    styleKey: "",
    contrastKey: contrastKeys["traits.why_this_type"],
    primaryAxis: eiAxis,
    supportAxis: snAxis,
    boundaryAxes: ["JP", "TF"],
    closeCallAxes,
    neighborTypeKeys,
    blocks: [
      {
        id: `traits.why_this_type.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "外倾这条主轴已经足够鲜明，所以它会先把你的主类型结构拉稳。"
            : "外倾这条主轴已经拉开差距，所以它解释了为什么主类型最终落在这一边。",
      },
      {
        id: "traits.why_this_type.why_this_type.EI.E",
        kind: "why_this_type",
        label: "为什么是这个类型",
        text: "主类型之所以成立，是因为你在能量方向上仍会稳定回到外倾这一侧；接近边界的 JP 与 TF 只是在不同场景里改变你的表现方式，而不会改写主类型本身。",
        contrast_key: contrastKeys["traits.why_this_type"],
      },
      {
        id: "traits.why_this_type.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你更敏感于结果波动，所以你会比典型印象里的 ENFP 更容易显得克制、校准和在意误差。",
      },
    ],
  });

  updateSection(reportData, "traits.close_call_axes", {
    variantKey: "traits.close_call_axes:JP.J.boundary:identity.T:boundary.JP",
    sceneKey: "explainability",
    styleKey: "",
    contrastKey: contrastKeys["traits.close_call_axes"],
    primaryAxis: jpAxis,
    supportAxis: tfAxis,
    boundaryAxes: ["JP", "TF"],
    closeCallAxes,
    neighborTypeKeys,
    blocks: [
      {
        id: "traits.close_call_axes.borderline_axis.JP",
        kind: "borderline_axis",
        label: "边界轴解释",
        text: "在生活方式上，你最后仍偏向判断，但和另一侧只拉开了7个点差。熟悉情境下你会先收拢节奏、推进定版；压力、角色变化或信息负荷升高时，感知那一侧会很快进场补位。",
        contrast_key: contrastKeys["traits.close_call_axes"],
      },
      {
        id: "traits.close_call_axes.borderline_axis.TF",
        kind: "borderline_axis",
        label: "边界轴解释",
        text: "在决策偏好上，你虽然仍偏向思考，但这条轴也接近中线，所以你会比外界以为的更容易把关系与氛围一起纳入判断。",
        contrast_key: contrastKeys["traits.close_call_axes"],
      },
      {
        id: "traits.close_call_axes.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "这也是为什么你并不是“不稳定”，而是在不同情境下会显出不同齿轮：主类型没变，近边界轴在变。",
      },
    ],
  });

  updateSection(reportData, "traits.adjacent_type_contrast", {
    variantKey: "traits.adjacent_type_contrast:JP.J.boundary:identity.T:neighbor.ENFJ",
    sceneKey: "explainability",
    styleKey: "",
    contrastKey: contrastKeys["traits.adjacent_type_contrast"],
    primaryAxis: jpAxis,
    supportAxis: tfAxis,
    boundaryAxes: ["JP", "TF"],
    closeCallAxes,
    neighborTypeKeys,
    blocks: [
      {
        id: "traits.adjacent_type_contrast.primary",
        kind: "adjacent_type_contrast",
        label: "相邻类型对照",
        text: "如果别人只看到你最接近边界的部分，最容易把你看成ENFJ。原因不是测错了，而是 JP 与 TF 都太靠近中线，让你在外显风格上更容易借用相邻类型的节奏；真正区分你们的，是你最后仍会回到更外倾、更以结果校准的判断方式。",
        contrast_key: contrastKeys["traits.adjacent_type_contrast"],
      },
      {
        id: "traits.adjacent_type_contrast.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会进一步放大这种“像相邻类型”的体感，因为你会比典型 ENFP 更强调误差、标准和结果波动。",
      },
    ],
  });

  updateSection(reportData, "traits.decision_style", {
    variantKey: "traits.decision_style:TF.T.boundary:identity.T:boundary.TF",
    sceneKey: "decision",
    styleKey: "decision.primary.TF.T.boundary",
    primaryAxis: tfAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: "traits.decision_style.axis_strength.TF.T.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "做决定时，这条轴靠近中线，所以你不是单一路径地下判断，而是会在两套入口之间切换。",
      },
      {
        id: "traits.decision_style.decision.TF.T",
        kind: "decision",
        label: "决策场景",
        text: "放到决策里，这条主轴会决定你先用哪一种入口缩小范围：你更容易先按逻辑、结构和可验证性来判断。",
      },
      {
        id: "traits.decision_style.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "traits.decision_style.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "做决定时，决策偏好靠近中线意味着你并不是摇摆不定，而是在两套判断入口之间来回校准。",
      },
    ],
  });

  updateSection(reportData, "career.summary", {
    variantKey: `career.summary:EI.E.${eiBand}:identity.T:boundary.JP`,
    sceneKey: "work",
    styleKey: workStyleKey,
    primaryAxis: eiAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: `career.summary.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在工作场景里，外倾已经很鲜明。匹配环境会放大你的效率，不匹配环境也会更快放大摩擦。"
            : "在工作场景里，外倾已经是你较稳定的默认工作方式。它会影响你启动任务、协作和接收反馈的第一反应。",
      },
      {
        id: "career.summary.scene.EI.E",
        kind: "work_style",
        label: "工作风格桥接",
        text: "放到工作方式上，这条主轴会决定你默认怎么开工、怎么协作、怎么接收反馈：你更容易先把能量投向外部互动、讨论与现场反馈。",
      },
      {
        id: "career.summary.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "career.summary.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "在工作里，生活方式靠近中线会让你在任务、协作和压力场景下切换齿轮。团队若只看到其中一面，就会误判你的节奏和稳定性。",
      },
    ],
  });

  updateSection(reportData, "career.collaboration_fit", {
    variantKey: `career.collaboration_fit:EI.E.${eiBand}:identity.T:boundary.TF`,
    sceneKey: "communication",
    styleKey: communicationStyleKey,
    primaryAxis: eiAxis,
    supportAxis: tfAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: `career.collaboration_fit.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在团队协作里，外倾已经很鲜明。你更容易把问题直接拉到桌面上，也更需要团队跟得上你的反馈速度。"
            : "在团队协作里，外倾已经是你较稳定的默认对齐方式。你通常会先通过互动确认方向，再推进下一步。",
      },
      {
        id: "career.collaboration_fit.collaboration_fit.EI.E",
        kind: "collaboration_fit",
        label: "协作匹配桥接",
        text: "放到团队协作里，这条主轴会决定你更自然的对齐、配合与修正方式：你更容易先把能量投向外部互动、讨论与现场反馈。",
      },
      {
        id: "career.collaboration_fit.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在协作里更敏感于反馈质量、标准清晰度和协作中的微小失真。",
      },
      {
        id: "career.collaboration_fit.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "在团队里，决策偏好靠近中线意味着你会在标准与关系之间来回校准。别人如果只看到其中一面，就会误判你到底是在推进结果，还是在照顾人。",
      },
    ],
  });

  updateSection(reportData, "career.work_environment", {
    variantKey: `career.work_environment:EI.E.${eiBand}:identity.T:boundary.JP`,
    sceneKey: "work",
    styleKey: workStyleKey,
    primaryAxis: eiAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: `career.work_environment.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在工作环境上，外倾已经很鲜明。高互动、高反馈、高节奏的环境更容易把你的效率拉满。"
            : "在工作环境上，外倾已经是你较稳定的默认入口。环境越能提供互动和反馈，你越容易更快进入状态。",
      },
      {
        id: "career.work_environment.work_env.EI.E",
        kind: "work_env",
        label: "工作环境桥接",
        text: "放到工作环境里，这条主轴会决定你更需要哪类节奏、边界和反馈方式：你更容易先把能量投向外部互动、讨论与现场反馈。",
      },
      {
        id: "career.work_environment.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会放大你对环境噪音、反馈质量和结果波动的感知，所以环境匹配会直接影响你是否稳定输出。",
      },
      {
        id: "career.work_environment.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "在工作环境上，生活方式靠近中线意味着你既需要一定结构，也需要一定弹性。真正适配你的不是绝对死板或绝对松散，而是节奏感可被商量的环境。",
      },
    ],
  });

  updateSection(reportData, "career.work_experiments", {
    variantKey: `career.work_experiments:EI.E.${eiBand}:identity.T:action.work_experiment_theme_name_decision_rule:boundary.JP`,
    sceneKey: "work",
    styleKey: workStyleKey,
    actionKey: "work_experiment.theme.name_decision_rule",
    primaryAxis: eiAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: `career.work_experiments.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在工作实验上，外倾已经很鲜明。越小范围地把反馈、对齐和节奏拉到真实场景里，你越快知道什么环境真适合你。"
            : "在工作实验上，外倾已经是你较稳定的入口。你最适合先做一个能看见互动、反馈和协作节奏的小范围试跑。",
      },
      {
        id: "career.work_experiments.work_experiment.EI.E",
        kind: "work_experiment",
        label: "工作实验",
        text: "放到工作实验，这条主轴最适合先试一个可逆动作：把一次真实协作、反馈或环境切换缩成一周内可完成的小试跑，再看你是否更容易进入高质量输出。",
      },
      {
        id: "career.work_experiments.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你更在意这次试跑有没有真实信息量，所以与其一次做大，不如先做一个能复盘的小实验。",
      },
      {
        id: "career.work_experiments.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "在工作实验里，生活方式靠近中线意味着你不是只能在一种节奏里工作。真正要测的，不是你喜不喜欢这个岗位名，而是你在什么节奏里最稳定。",
      },
    ],
  });

  updateSection(reportData, "career.advantages", {
    variantKey: `career.advantages:EI.E.${eiBand}:identity.T:boundary.JP`,
    sceneKey: "work",
    styleKey: workStyleKey,
    primaryAxis: eiAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: `career.advantages.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在工作场景里，外倾已经很鲜明。匹配环境会放大你的效率，不匹配环境也会更快放大摩擦。"
            : "在工作场景里，外倾已经是你较稳定的默认工作方式。它会影响你启动任务、协作和接收反馈的第一反应。",
      },
      {
        id: "career.advantages.scene.EI.E",
        kind: "scene",
        label: "场景应用",
        text: "放到工作里，这条主轴更像你的默认操作系统：你更容易先把能量投向外部互动、讨论与现场反馈。它会直接影响你更适配的岗位节奏与协作环境。",
      },
      {
        id: "career.advantages.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "career.advantages.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "在工作里，生活方式靠近中线会让你在任务、协作和压力场景下切换齿轮。团队若只看到其中一面，就会误判你的节奏和稳定性。",
      },
    ],
  });

  updateSection(reportData, "growth.summary", {
    variantKey: `growth.summary:EI.E.${eiBand}:identity.T:boundary.TF`,
    sceneKey: "growth",
    styleKey: growthStyleKey,
    primaryAxis: eiAxis,
    supportAxis: snAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: `growth.summary.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "成长上，你不缺方向感，缺的是校正机制。因为外倾已经很强，真正有价值的是给它加上稳定的对侧检查点。"
            : "成长上，你更适合先放大这条已经清晰的外倾优势，再为它补一条低成本的对侧校正动作。",
      },
      {
        id: "growth.summary.scene.EI.E",
        kind: "scene",
        label: "场景应用",
        text: "把它放进成长情境时，更有效的做法不是否定这条主轴，而是让它在能量方向上多带一个反向校正动作：你更容易先把能量投向外部互动、讨论与现场反馈。",
      },
      {
        id: "growth.summary.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "growth.summary.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "成长上，决策偏好靠近中线意味着你真正要学的不是选边站，而是识别什么时候该让情感先开路，什么时候该让思考接手收尾。",
      },
    ],
  });

  updateSection(reportData, "growth.next_actions", {
    variantKey: `growth.next_actions:EI.E.${eiBand}:identity.T:action.weekly_action_theme_name_decision_rule:boundary.TF:synth.big5_conscientiousness_low_use_external_scaffolding`,
    sceneKey: "growth",
    styleKey: growthStyleKey,
    actionKey: "weekly_action.theme.name_decision_rule",
    primaryAxis: eiAxis,
    supportAxis: snAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: `growth.next_actions.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "成长动作上，你的外倾已经很鲜明。真正有用的不是继续理解自己，而是把高匹配动作直接放进真实互动里去试。"
            : "成长动作上，你的外倾已经是清晰入口。你最值得先做的，是把成长动作缩成一个看得见反馈的小步骤。",
      },
      {
        id: "growth.next_actions.next_action.EI.E",
        kind: "next_action",
        label: "下一步动作",
        text: "把它翻译成下一步动作，最值得先做的是：先把你这周最重要的一次反馈、对话或复盘排进真实日程，而不是继续停在脑内准备。",
      },
      {
        id: "growth.next_actions.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你更容易一边行动一边校正，所以动作越小、反馈越快，你越容易知道什么是真的有效。",
      },
      {
        id: "growth.next_actions.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "成长上，决策偏好靠近中线意味着你既需要标准，也需要体感确认。最好的下一步不是空想“对的答案”，而是先让两条线都进入一次真实验证。",
      },
    ],
  });

  updateSection(reportData, "growth.weekly_experiments", {
    variantKey: `growth.weekly_experiments:EI.E.${eiBand}:identity.T:action.weekly_action_theme_name_decision_rule:boundary.TF`,
    sceneKey: "growth",
    styleKey: growthStyleKey,
    actionKey: "weekly_action.theme.name_decision_rule",
    primaryAxis: eiAxis,
    supportAxis: snAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: `growth.weekly_experiments.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "本周实验上，外倾已经很鲜明。你更适合先把实验放进真实互动和现场反馈里，而不是单独闭门打磨。"
            : "本周实验上，外倾已经是清晰入口。你最适合先做一个能在一周内反复出现的小实验。",
      },
      {
        id: "growth.weekly_experiments.weekly_experiment.EI.E",
        kind: "weekly_experiment",
        label: "本周实验",
        text: "放到这周可执行实验，这条主轴最适合变成一个低成本重复动作：连续一周，在关键判断前先写出你的判断标准，再把它拿去做一次真实对话或小验证。",
      },
      {
        id: "growth.weekly_experiments.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你特别在意实验是否真的有信息量，所以本周实验最好能留下可回看的标准和结果。",
      },
      {
        id: "growth.weekly_experiments.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "这一周最值得测的，不是“我到底更像哪边”，而是你什么时候更依赖标准、什么时候更需要关系反馈，顺序一旦看清，动作就会稳定很多。",
      },
    ],
  });

  updateSection(reportData, "growth.stability_confidence", {
    variantKey: "growth.stability_confidence:stability.context_sensitive:identity.T:boundary.JP:synth.big5_neuroticism_high_buffer_reactivity",
    sceneKey: "stability",
    styleKey: "",
    contrastKey: contrastKeys["growth.stability_confidence"],
    primaryAxis: jpAxis,
    supportAxis: tfAxis,
    boundaryAxes: ["JP", "TF"],
    closeCallAxes,
    neighborTypeKeys,
    blocks: [
      {
        id: "growth.stability_confidence.stability.context_sensitive",
        kind: "stability_explanation",
        label: "稳定性解释",
        text: "这份结果最适合读成情境敏感型稳定。主类型仍然成立，但 JP 和 TF 都接近边界，所以你在不同任务、人际和压力场景里会显出不同切换方式。",
        contrast_key: contrastKeys["growth.stability_confidence"],
      },
      {
        id: "growth.stability_confidence.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "真正需要关注的不是“我是不是测得不准”，而是你在哪些情境里会更快切到另一套节奏。",
      },
    ],
  });

  updateSection(reportData, "growth.watchouts", {
    variantKey: "growth.watchouts:JP.J.boundary:identity.T:action.watchout_stability_context_sensitive:boundary.JP",
    sceneKey: "stress_recovery",
    styleKey: "stress_recovery.primary.JP.J.boundary",
    actionKey: "watchout.stability.context_sensitive",
    primaryAxis: jpAxis,
    supportAxis: eiAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: "growth.watchouts.axis_strength.JP.J.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "风险提醒上，这条轴靠近中线，意味着你在高压里很容易先切到“先收拢局面”的模式，之后才想起恢复和弹性。",
      },
      {
        id: "growth.watchouts.watchout.JP.J",
        kind: "watchout",
        label: "风险提醒",
        text: "放到风险提醒，这条主轴最容易在高压时把你推向一种默认反应：先把局面收紧、先把标准拉高、先把节奏压得更死。真正要防的不是一次用力过猛，而是不知不觉每次都复制同一种过载方式。",
      },
      {
        id: "growth.watchouts.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会放大你对误差和结果波动的感知，所以一旦过载，你更容易把“再控制一点”误当成解决方案。",
      },
      {
        id: "growth.watchouts.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "生活方式靠近中线时，你的风险不是没有节奏，而是太晚发现自己已经把节奏收得过紧。越早看见切换，越能减少重复性消耗。",
      },
    ],
  });

  updateSection(reportData, "career.next_step", {
    variantKey: "career.next_step:TF.T.boundary:identity.T:boundary.TF:synth.big5_career_next_step_low_reduce_activation_friction",
    sceneKey: "decision",
    styleKey: "decision.primary.TF.T.boundary",
    primaryAxis: tfAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: "career.next_step.axis_strength.TF.T.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "职业下一步上，这条轴靠近中线，说明你做选择时不是只看一个标准，而是会在两套入口之间反复校准。",
      },
      {
        id: "career.next_step.career_next_step.TF.T",
        kind: "career_next_step",
        label: "职业下一步桥接",
        text: "放到职业下一步，这条主轴提示你先去试一个更贴近自己的动作：先把你看重的判断标准写清楚，再用一次真实对话或岗位验证去校正，而不是只在脑内继续拉扯。",
      },
      {
        id: "career.next_step.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你更在意这一步是否真的靠谱，所以与其逼自己马上定案，不如先把标准说清楚、再去验证。",
      },
      {
        id: "career.next_step.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "在职业选择上，决策偏好靠近中线并不代表你不稳定，而是你会同时守住标准与关系、速度与准确度。最有效的下一步，是让这两条线都能被看见。",
      },
    ],
  });

  updateSection(reportData, "growth.drainers", {
    variantKey: "growth.drainers:JP.J.boundary:identity.T:boundary.JP",
    sceneKey: "stress_recovery",
    styleKey: "stress_recovery.primary.JP.J.boundary",
    primaryAxis: jpAxis,
    supportAxis: eiAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: "growth.drainers.axis_strength.JP.J.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "在压力与恢复上，这条轴靠近中线，意味着你在过载时和恢复时可能会切到不同挡位。",
      },
      {
        id: "growth.drainers.scene.JP.J",
        kind: "scene",
        label: "场景应用",
        text: "放到压力与恢复里，这条主轴通常会变成你最先启动的自救方式：你更容易先收拢范围、快速定版，再用结构把局面稳住。",
      },
      {
        id: "growth.drainers.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "growth.drainers.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "压力上来时，生活方式靠近中线意味着你可能先滑向感知来保住当下，再在恢复阶段调回判断重新平衡。",
      },
    ],
  });

  updateSection(reportData, "growth.stress_recovery", {
    variantKey: "growth.stress_recovery:JP.J.boundary:identity.T:boundary.JP",
    sceneKey: "stress_recovery",
    styleKey: "stress_recovery.primary.JP.J.boundary",
    primaryAxis: jpAxis,
    supportAxis: eiAxis,
    boundaryAxes: ["JP", "TF"],
    blocks: [
      {
        id: "growth.stress_recovery.axis_strength.JP.J.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "在压力与恢复上，这条轴靠近中线，意味着你在过载时和恢复时可能会切到不同挡位。",
      },
      {
        id: "growth.stress_recovery.stress_recovery.JP.J",
        kind: "stress_recovery",
        label: "压力恢复场景",
        text: "放到压力与恢复里，这条主轴通常会变成你最先启动的自救方式：你更容易先收拢范围、快速定版，再用结构把局面稳住。",
      },
      {
        id: "growth.stress_recovery.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "growth.stress_recovery.boundary.JP",
        kind: "boundary",
        label: "边界深解释",
        text: "压力上来时，生活方式靠近中线意味着你可能先滑向判断来收拢局面，再在恢复阶段把弹性找回来。",
      },
    ],
  });

  updateSection(reportData, "relationships.summary", {
    variantKey: "relationships.summary:TF.T.boundary:identity.T:boundary.TF",
    sceneKey: "relationships",
    styleKey: "relationships.primary.TF.T.boundary",
    primaryAxis: tfAxis,
    supportAxis: eiAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: "relationships.summary.axis_strength.TF.T.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "在人际里，这条轴接近边界，意味着你不会一直用同一种方式靠近别人；不同关系会唤起你不同侧的表达。",
      },
      {
        id: "relationships.summary.scene.TF.T",
        kind: "scene",
        label: "场景应用",
        text: "放到关系里，这条主轴通常会变成一种相处节奏：你更容易先按逻辑、结构和可验证性来判断。如果对方没有读懂这一点，就容易把你的方式误解成距离感、迟疑或控制感。",
      },
      {
        id: "relationships.summary.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "relationships.summary.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "在人际里，决策偏好靠近中线意味着你不会永远只走思考这一条路。你可能先用思考稳住边界，遇到压力或误解时又改用情感修复关系。",
      },
    ],
  });

  updateSection(reportData, "relationships.rel_advantages", {
    variantKey: `relationships.rel_advantages:EI.E.${eiBand}:identity.T:boundary.TF`,
    sceneKey: "communication",
    styleKey: communicationStyleKey,
    primaryAxis: eiAxis,
    supportAxis: tfAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: `relationships.rel_advantages.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在沟通里，外倾已经很鲜明。别人通常会先感受到这一侧，因此误读也往往从这里开始。"
            : "在沟通里，外倾已经是你更常见的起手方式，但当场景变化时，另一侧仍会迅速进场补位。",
      },
      {
        id: "relationships.rel_advantages.scene.EI.E",
        kind: "scene",
        label: "场景应用",
        text: "放到沟通里，这条主轴通常会变成你的起手表达方式：你更容易先把能量投向外部互动、讨论与现场反馈。",
      },
      {
        id: "relationships.rel_advantages.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "relationships.rel_advantages.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "沟通里，决策偏好靠近中线意味着你不会永远只用一种表达方式。你可能先用情感出手，但一旦对方反馈变化，又迅速调动思考补位。",
      },
    ],
  });

  updateSection(reportData, "relationships.communication_style", {
    variantKey: `relationships.communication_style:EI.E.${eiBand}:identity.T:boundary.TF`,
    sceneKey: "communication",
    styleKey: communicationStyleKey,
    primaryAxis: eiAxis,
    supportAxis: tfAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: `relationships.communication_style.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "在沟通里，外倾已经很鲜明。别人通常会先感受到这一侧，因此误读也往往从这里开始。"
            : "在沟通里，外倾已经是你更常见的起手方式，但当场景变化时，另一侧仍会迅速进场补位。",
      },
      {
        id: "relationships.communication_style.communication.EI.E",
        kind: "communication",
        label: "沟通协作场景",
        text: "放到沟通里，这条主轴通常会变成你的起手表达方式：你更容易先把能量投向外部互动、讨论与现场反馈，再用逻辑框架把协作收束起来。",
      },
      {
        id: "relationships.communication_style.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "relationships.communication_style.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "沟通里，决策偏好靠近中线意味着你不会永远只用一种表达方式；别人如果只看到前半段，常会误读你的真实意图。",
      },
    ],
  });

  updateSection(reportData, "relationships.try_this_week", {
    variantKey: `relationships.try_this_week:EI.E.${eiBand}:identity.T:action.relationship_action_theme_name_decision_rule:boundary.TF`,
    sceneKey: "communication",
    styleKey: communicationStyleKey,
    actionKey: "relationship_action.theme.name_decision_rule",
    primaryAxis: eiAxis,
    supportAxis: tfAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: `relationships.try_this_week.axis_strength.EI.E.${eiBand}`,
        kind: "axis_strength",
        label: "强度层",
        text:
          eiBand === "strong"
            ? "本周关系练习上，外倾已经很鲜明。你最适合把练习放进真实互动里，而不是先在脑内打很多草稿。"
            : "本周关系练习上，外倾已经是你较稳定的起手方式。最有效的动作，是让你的意图在互动里更早被看见。",
      },
      {
        id: "relationships.try_this_week.relationship_practice.EI.E",
        kind: "relationship_practice",
        label: "本周关系练习",
        text: "放到本周关系练习，这条主轴最适合变成一个可见的小动作：在一次重要沟通前，先把你真正想推进的标准和期待说出来，再邀请对方补充他的担心或需要。",
      },
      {
        id: "relationships.try_this_week.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你更敏感于关系里的误差，所以这周最有价值的不是更克制，而是更早把判断标准说清楚。",
      },
      {
        id: "relationships.try_this_week.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "关系里的决策偏好靠近中线，说明你会在标准与关系之间来回校准。本周最值得练的，是把这两条线同时说出来，而不是只让对方看到其中一面。",
      },
    ],
  });

  updateSection(reportData, "relationships.rel_risks", {
    variantKey: "relationships.rel_risks:TF.T.boundary:identity.T:boundary.TF",
    sceneKey: "decision",
    styleKey: "decision.primary.TF.T.boundary",
    primaryAxis: tfAxis,
    supportAxis: jpAxis,
    boundaryAxes: ["TF", "JP"],
    blocks: [
      {
        id: "relationships.rel_risks.axis_strength.TF.T.boundary",
        kind: "axis_strength",
        label: "强度层",
        text: "做决定时，这条轴靠近中线，所以你不是单一路径地下判断，而是会在两套入口之间切换。",
      },
      {
        id: "relationships.rel_risks.scene.TF.T",
        kind: "scene",
        label: "场景应用",
        text: "放到决策里，这条主轴会决定你先用哪一种入口缩小范围：你更容易先按逻辑、结构和可验证性来判断。",
      },
      {
        id: "relationships.rel_risks.identity.t",
        kind: "identity",
        label: "身份层",
        text: "T 身份层会让你在当前类型骨架上更容易放大细节波动与结果质量，因此同一类型也会表现出更高的自我校准和压力感知。",
      },
      {
        id: "relationships.rel_risks.boundary.TF",
        kind: "boundary",
        label: "边界深解释",
        text: "做决定时，决策偏好靠近中线意味着你并不是摇摆不定，而是在两套判断入口之间来回校准。你可能先用思考开路，再用情感复核；场景一变，顺序也会反过来。",
      },
    ],
  });

  return reportData;
}
