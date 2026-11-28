import type { FixedComparisonLocale } from "./fixedComparisonPreview";

export type ModularPluginKey = "ai" | "thirtyDay";

export type ModularPluginFlags = {
  ai: boolean;
  thirtyDay: boolean;
};

export type ModularPluginPreset = "none" | "ai" | "30day" | "all";

export type ModularSourceLink = {
  label: string;
  href: string;
  note?: string;
};

export type ModularSourceGroup = {
  id: string;
  title: string;
  requiresPlugin?: ModularPluginKey;
  links: readonly ModularSourceLink[];
};

export type ModularFaqItem = {
  id: string;
  question: string;
  answer: string;
  requiresPlugin?: ModularPluginKey;
};

export type ModularMatrixRow = {
  id: string;
  dimension: string;
  roleA: string;
  roleB: string;
  defaultVisible: boolean;
};

export type ModularHandoffRow = {
  stage: string;
  roleLabel: string;
  tone: "roleA" | "roleB";
  verifiedFacts: string;
  openGaps: string;
  actionAndApproval: string;
};

export type ModularCertRow = {
  name: string;
  officialScope: string;
  workplaceBoundary: string;
  verificationTips: string;
  officialLinks?: readonly ModularSourceLink[];
};

export type ModularChecklistOption = {
  id: string;
  track?: "roleA" | "roleB";
  label: string;
  summary: string;
  interviewQuestions: readonly string[];
};

export type ModularAiTier = {
  tier: string;
  tone: "blue" | "amber" | "green";
  roleALabel: string;
  roleBLabel: string;
  roleAScenario: string;
  roleBScenario: string;
  svgRoleALine: string;
  svgRoleBLine: string;
  svgCounterHeading: string;
  svgCounterLines: readonly string[];
  editorialCounterExample: string;
  redline: string;
};

export type ModularAiEvidenceRecord = {
  id: string;
  studyType: string;
  subject: string;
  findingBoundary: string;
  linkLabel: string;
  href: string;
};

export type ModularAiPluginSpec = {
  badge: string;
  title: string;
  summary: string;
  diagramCaption: string;
  diagramAriaLabel: string;
  tableRoleAColumn: string;
  tableRoleBColumn: string;
  tiers: readonly ModularAiTier[];
  evidenceHeading: string;
  evidenceRecords: readonly ModularAiEvidenceRecord[];
  governanceBoundaryNote: string;
  interviewQuestionsTitle: string;
  interviewQuestions: readonly string[];
  scenarioExerciseTitle: string;
  scenarioExerciseBody: string;
};

export type ModularThirtyDayWeek = {
  weekLabel: string;
  deliverable: string;
  deliverableWhenAiEnabled?: string;
};

export type ModularThirtyDayTrack = {
  id: string;
  title: string;
  badge: string;
  tone: "roleA" | "roleB";
  weeks: readonly ModularThirtyDayWeek[];
};

export type ModularThirtyDayPluginSpec = {
  badge: string;
  title: string;
  summary: string;
  tracks: readonly ModularThirtyDayTrack[];
};

export type ModularDesktopExerciseSpec = {
  sectionTitle: string;
  summary: string;
  publicLinksHeading?: string;
  factSummaryHeading?: string;
  factSummarySegments?: readonly { text: string; tone?: "strong" | "code" }[];
  factSummary?: string;
  publicLinks: readonly ModularSourceLink[];
  taskA: { title: string; instruction: string };
  taskB: { title: string; instruction: string };
  rubricTitle: string;
  rubricHeading?: string;
  rubricPassRule: string;
  rubricItems: readonly string[];
  sampleAnswerALabel?: string;
  sampleAnswerA: string;
  sampleAnswerBLabel?: string;
  sampleAnswerB: string;
};

export type ModularToolCard = {
  id: string;
  badge: string;
  meta: string;
  tone: "roleA" | "roleB" | "neutral" | "accent";
  title: string;
  description: string;
  purposeHint: string;
  ctaLabel: string;
  href: string;
};

export type ModularComparisonSpec = {
  pairId: string;
  locale: FixedComparisonLocale;
  title: string;
  shortTitle?: string;
  description: string;
  regionLabel: string;
  authorName: string;
  datePublished: string;
  dateModified: string;
  defaultPlugins: ModularPluginFlags;
  hero: {
    directAnswer: string;
    roleA: {
      badgeTitle: string;
      riasecLabel: string;
      aliases: string;
      keywords: string;
    };
    roleB: {
      badgeTitle: string;
      riasecLabel: string;
      aliases: string;
      keywords: string;
    };
    interviewBoundaryTitle: string;
    interviewBoundaryQuestions: readonly string[];
    riasecBoundaryNote: string;
  };
  topology: {
    title: string;
    summary: string;
    ariaLabel: string;
    leftZoneTitle: string;
    leftSteps: readonly { title: string; detail: string }[];
    centerZoneTitle: string;
    upperBridge: { title: string; line1: string; line2: string };
    lowerBridge: { title: string; line1: string; line2: string };
    rightZoneTitle: string;
    rightSteps: readonly { title: string; detail: string }[];
  };
  matrix: {
    title: string;
    summary: string;
    roleAColumn: string;
    roleBColumn: string;
    expandButtonLabel?: string;
    collapseButtonLabel?: string;
    rows: readonly ModularMatrixRow[];
    hybridRoleNote?: {
      prefix: string;
      linkLabel: string;
      href: string;
      suffix: string;
    };
  };
  aiPlugin?: ModularAiPluginSpec;
  incident: {
    title: string;
    summary: string;
    triggerLabel: string;
    triggerBody: string;
    triggerCaveat: string;
    rows: readonly ModularHandoffRow[];
    recoveryAcceptanceTitle: string;
    recoveryAcceptanceCriteria: string;
    defenseLayerNote: string;
  };
  payAndCerts: {
    title: string;
    summary: string;
    salaryHeading: string;
    salaryBody: string;
    certs: readonly ModularCertRow[];
    interviewChecklistTitle: string;
    interviewChecklistQuestions: readonly { label: string; question: string }[];
  };
  thirtyDayPlugin?: ModularThirtyDayPluginSpec;
  checklist: {
    title: string;
    summary: string;
    skillsHeading: string;
    skillsOptions: readonly ModularChecklistOption[];
    conditionsHeading: string;
    conditionsOptions: readonly ModularChecklistOption[];
    defaultInterviewQuestions: readonly string[];
    crossTrackNote: string;
    offlinePrintHint: string;
  };
  desktopExercise: ModularDesktopExerciseSpec;
  tools: {
    title: string;
    summary: string;
    cards: readonly ModularToolCard[];
    profileLinksLabel: string;
    profileLinks: readonly { label: string; href: string }[];
  };
  faqs: readonly ModularFaqItem[];
  sourceGroups: readonly ModularSourceGroup[];
};

const CN_NUMERALS = ["一", "二", "三", "四", "五", "六", "七", "八", "九", "十", "十一", "十二"] as const;

export function formatCnSectionHeading(indexZeroBased: number, title: string): string {
  const numeral = CN_NUMERALS[indexZeroBased] ?? String(indexZeroBased + 1);
  return `${numeral}、${title}`;
}

export function formatSectionHeading(
  locale: FixedComparisonLocale,
  indexZeroBased: number,
  title: string
): string {
  if (locale === "en") {
    return `${indexZeroBased + 1}. ${title}`;
  }
  return formatCnSectionHeading(indexZeroBased, title);
}

const VIEW_LABELS: Record<
  FixedComparisonLocale,
  {
    toc: Record<ResolvedSectionMeta["key"], string>;
    faqTitle: (count: number) => string;
    aiPluginName: string;
    thirtyDayPluginName: string;
    coreOnlySummary: string;
    coreWithPluginsSummary: (names: string[]) => string;
  }
> = {
  zh: {
    toc: {
      topology: "职责全景",
      matrix: "核心对照",
      ai: "AI工作流边界",
      incident: "模拟交接",
      certs: "薪资与考证",
      thirtyDay: "30天作品",
      checklist: "JD核对清单",
      trial: "桌面验证",
      tools: "工具分流",
      faq: "直答FAQ",
    },
    faqTitle: (count) => `高意图常见问题直答（${count} 问）`,
    aiPluginName: "AI工作流边界",
    thirtyDayPluginName: "30天作品清单",
    coreOnlySummary: "5 核心模块",
    coreWithPluginsSummary: (names) => `5 核心模块 + ${names.length} 选配（${names.join(" / ")}）`,
  },
  "zh-TW": {
    toc: {
      topology: "職責全景",
      matrix: "核心對照",
      ai: "AI工作流邊界",
      incident: "模擬交接",
      certs: "薪資與證照",
      thirtyDay: "30天作品",
      checklist: "JD核對清單",
      trial: "桌面驗證",
      tools: "工具分流",
      faq: "直答FAQ",
    },
    faqTitle: (count) => `高意圖常見問題直答（${count} 問）`,
    aiPluginName: "AI工作流邊界",
    thirtyDayPluginName: "30天作品清單",
    coreOnlySummary: "5 核心模組",
    coreWithPluginsSummary: (names) => `5 核心模組 + ${names.length} 選配（${names.join(" / ")}）`,
  },
  en: {
    toc: {
      topology: "Workflow",
      matrix: "Core Matrix",
      ai: "AI Workflow",
      incident: "Handoff Case",
      certs: "Pay & Licensing",
      thirtyDay: "30-Day Plan",
      checklist: "Fit Checklist",
      trial: "Desktop Exercise",
      tools: "Tools",
      faq: "FAQ",
    },
    faqTitle: (count) => `High-Intent FAQs (${count})`,
    aiPluginName: "AI Workflow Boundary",
    thirtyDayPluginName: "30-Day Portfolio",
    coreOnlySummary: "5 Core Modules",
    coreWithPluginsSummary: (names) => `5 Core Modules + ${names.length} Optional (${names.join(" / ")})`,
  },
};

export function resolveModularPluginFlags(
  defaultFlags: ModularPluginFlags,
  rawQueryParam?: string | string[]
): ModularPluginFlags {
  const raw = Array.isArray(rawQueryParam) ? rawQueryParam[0] : rawQueryParam;
  if (!raw) return defaultFlags;
  switch (raw.trim().toLowerCase() as ModularPluginPreset) {
    case "none":
      return { ai: false, thirtyDay: false };
    case "ai":
      return { ai: true, thirtyDay: false };
    case "30day":
      return { ai: false, thirtyDay: true };
    case "all":
      return { ai: true, thirtyDay: true };
    default:
      return defaultFlags;
  }
}

export function resolveEffectiveModularPluginFlags(
  spec: Pick<ModularComparisonSpec, "aiPlugin" | "thirtyDayPlugin">,
  requestedFlags: ModularPluginFlags
): ModularPluginFlags {
  return {
    ai: Boolean(requestedFlags.ai && spec.aiPlugin),
    thirtyDay: Boolean(requestedFlags.thirtyDay && spec.thirtyDayPlugin),
  };
}

function isPluginActive(flags: ModularPluginFlags, required?: ModularPluginKey): boolean {
  if (!required) return true;
  return flags[required];
}

/**
 * Server-side pruning: strips disabled optional plugins, their FAQs, their sources,
 * and cross-plugin alternate copy BEFORE props are serialized into Next.js RSC HTML.
 */
export function pruneModularComparisonSpec(
  spec: ModularComparisonSpec,
  flags: ModularPluginFlags
): ModularComparisonSpec {
  const effectiveFlags = resolveEffectiveModularPluginFlags(spec, flags);

  const prunedThirtyDay: ModularThirtyDayPluginSpec | undefined =
    effectiveFlags.thirtyDay && spec.thirtyDayPlugin
      ? {
          ...spec.thirtyDayPlugin,
          tracks: spec.thirtyDayPlugin.tracks.map((track) => ({
            ...track,
            weeks: track.weeks.map((week) => ({
              weekLabel: week.weekLabel,
              deliverable:
                effectiveFlags.ai && week.deliverableWhenAiEnabled
                  ? week.deliverableWhenAiEnabled
                  : week.deliverable,
            })),
          })),
        }
      : undefined;

  const pruned: ModularComparisonSpec = {
    ...spec,
    faqs: spec.faqs.filter((item) => isPluginActive(effectiveFlags, item.requiresPlugin)),
    sourceGroups: spec.sourceGroups.filter((group) => isPluginActive(effectiveFlags, group.requiresPlugin)),
  };

  if (effectiveFlags.ai && spec.aiPlugin) {
    pruned.aiPlugin = spec.aiPlugin;
  } else {
    delete pruned.aiPlugin;
  }

  if (prunedThirtyDay) {
    pruned.thirtyDayPlugin = prunedThirtyDay;
  } else {
    delete pruned.thirtyDayPlugin;
  }

  return pruned;
}

export type ResolvedSectionMeta = {
  key: "topology" | "matrix" | "ai" | "incident" | "certs" | "thirtyDay" | "checklist" | "trial" | "tools" | "faq";
  id: string;
  tocLabel: string;
  heading: string;
  isPlugin?: boolean;
};

export type ModularComparisonView = {
  flags: ModularPluginFlags;
  sections: readonly ResolvedSectionMeta[];
  sectionByKey: Record<ResolvedSectionMeta["key"], ResolvedSectionMeta | undefined>;
  faqs: readonly ModularFaqItem[];
  sourceGroups: readonly ModularSourceGroup[];
  activeModuleSummary: string;
};

export function buildModularComparisonView(
  spec: ModularComparisonSpec,
  flags: ModularPluginFlags
): ModularComparisonView {
  const effectiveFlags = resolveEffectiveModularPluginFlags(spec, flags);
  const labels = VIEW_LABELS[spec.locale] ?? VIEW_LABELS.zh;

  const ordered: Array<{
    key: ResolvedSectionMeta["key"];
    id: string;
    tocLabel: string;
    rawTitle: string;
    isPlugin?: boolean;
  }> = [
    { key: "topology", id: "sec-topology", tocLabel: labels.toc.topology, rawTitle: spec.topology.title },
    { key: "matrix", id: "sec-matrix", tocLabel: labels.toc.matrix, rawTitle: spec.matrix.title },
  ];

  if (effectiveFlags.ai && spec.aiPlugin) {
    ordered.push({
      key: "ai",
      id: "sec-ai",
      tocLabel: labels.toc.ai,
      rawTitle: spec.aiPlugin.title,
      isPlugin: true,
    });
  }

  ordered.push(
    { key: "incident", id: "sec-incident", tocLabel: labels.toc.incident, rawTitle: spec.incident.title },
    { key: "certs", id: "sec-certs", tocLabel: labels.toc.certs, rawTitle: spec.payAndCerts.title }
  );

  if (effectiveFlags.thirtyDay && spec.thirtyDayPlugin) {
    ordered.push({
      key: "thirtyDay",
      id: "sec-30days",
      tocLabel: labels.toc.thirtyDay,
      rawTitle: spec.thirtyDayPlugin.title,
      isPlugin: true,
    });
  }

  const faqs = spec.faqs.filter((item) => isPluginActive(effectiveFlags, item.requiresPlugin));
  const sourceGroups = spec.sourceGroups.filter((group) => isPluginActive(effectiveFlags, group.requiresPlugin));

  ordered.push(
    { key: "checklist", id: "sec-checklist", tocLabel: labels.toc.checklist, rawTitle: spec.checklist.title },
    { key: "trial", id: "sec-trial", tocLabel: labels.toc.trial, rawTitle: spec.desktopExercise.sectionTitle },
    { key: "tools", id: "sec-tools", tocLabel: labels.toc.tools, rawTitle: spec.tools.title },
    { key: "faq", id: "sec-faq", tocLabel: labels.toc.faq, rawTitle: labels.faqTitle(faqs.length) }
  );

  const sections: ResolvedSectionMeta[] = ordered.map((item, idx) => ({
    key: item.key,
    id: item.id,
    tocLabel: item.tocLabel,
    heading: formatSectionHeading(spec.locale, idx, item.rawTitle),
    isPlugin: item.isPlugin,
  }));

  const sectionByKey = {} as Record<ResolvedSectionMeta["key"], ResolvedSectionMeta | undefined>;
  for (const s of sections) {
    sectionByKey[s.key] = s;
  }

  const enabledPlugins = [
    effectiveFlags.ai ? labels.aiPluginName : null,
    effectiveFlags.thirtyDay ? labels.thirtyDayPluginName : null,
  ].filter((name): name is string => Boolean(name));

  const activeModuleSummary =
    enabledPlugins.length === 0
      ? labels.coreOnlySummary
      : labels.coreWithPluginsSummary(enabledPlugins);

  return {
    flags: effectiveFlags,
    sections,
    sectionByKey,
    faqs,
    sourceGroups,
    activeModuleSummary,
  };
}
