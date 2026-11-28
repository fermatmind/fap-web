"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { FixedComparisonLocale, FixedComparisonPair } from "@/lib/career/fixedComparisonPreview";
import { fixedComparisonPath } from "@/lib/career/fixedComparisonPreview";
import {
  buildModularComparisonView,
  type ModularComparisonSpec,
  type ModularPluginFlags,
} from "@/lib/career/modularComparison";
import styles from "./ModularCareerComparison.module.css";

type ModularCareerComparisonProps = {
  spec: ModularComparisonSpec;
  locale: FixedComparisonLocale;
  pair: FixedComparisonPair;
  pluginFlags: ModularPluginFlags;
};

const LANGUAGE_LABELS: Record<FixedComparisonLocale, string> = {
  zh: "简体中文",
  en: "English",
  "zh-TW": "繁體中文",
};

type UiCopy = {
  tocAriaLabel: string;
  breadcrumbAriaLabel: string;
  allComparisonsLabel: string;
  verifiedPrefix: string;
  authorPrefix: string;
  heroSummaryAriaLabel: string;
  oneLineConclusion: string;
  colon: string;
  semicolon: string;
  topologyRegionAriaLabel: string;
  expandMatrixDefault: string;
  collapseMatrixDefault: string;
  matrixRegionAriaLabel: (count: number) => string;
  matrixDimensionHeader: string;
  aiTableRegionAriaLabel: string;
  aiTierHeader: string;
  aiCounterExampleHeader: string;
  aiRedlinePrefix: string;
  aiSubjectFormat: (subject: string) => string;
  aiDiagramRegionAriaLabel: string;
  incidentTableRegionAriaLabel: string;
  incidentStageHeader: string;
  incidentFactsHeader: string;
  incidentGapsHeader: string;
  incidentActionHeader: string;
  certTableRegionAriaLabel: string;
  certNameHeader: string;
  certScopeHeader: string;
  certBoundaryHeader: string;
  certTipsHeader: string;
  checklistCol1Title: string;
  checklistCol1Empty: string;
  checklistCol2Title: string;
  checklistCol2Empty: string;
  checklistCol3Title: string;
  exercisePublicLinksDefault: string;
  exerciseFactSummaryDefault: string;
  exerciseRubricHeadingDefault: (count: number) => string;
  exerciseRubricRuleWrap: (heading: string, rule: string) => string;
  exerciseSampleAnswerDefault: (taskTitle: string) => string;
  faqSubtitle: string;
  sourcesFooterHeading: (dateModified: string) => string;
  sourceNoteWrap: (note: string) => string;
};

const UI_COPY: Record<FixedComparisonLocale, UiCopy> = {
  zh: {
    tocAriaLabel: "页内目录导航",
    breadcrumbAriaLabel: "职业对比导航",
    allComparisonsLabel: "全部职业对比",
    verifiedPrefix: "原证核验：",
    authorPrefix: "署名：",
    heroSummaryAriaLabel: "首屏核心分界",
    oneLineConclusion: "单句结论：",
    colon: "：",
    semicolon: "；",
    topologyRegionAriaLabel: "可横向滚动的职责拓扑图",
    expandMatrixDefault: "展开其余维度",
    collapseMatrixDefault: "收起额外维度",
    matrixRegionAriaLabel: (count) => `核心${count}维对比表格`,
    matrixDimensionHeader: "对照维度",
    aiTableRegionAriaLabel: "AI工作流三层责任边界对照表",
    aiTierHeader: "工作流分层",
    aiCounterExampleHeader: "编辑模拟反例与核验红线",
    aiRedlinePrefix: "红线：",
    aiSubjectFormat: (subject) => `（对象：${subject}）：`,
    aiDiagramRegionAriaLabel: "AI辅助工作流三层责任边界示意图",
    incidentTableRegionAriaLabel: "模拟交接案例责任拆分表",
    incidentStageHeader: "阶段与角色",
    incidentFactsHeader: "已证实事实（可追溯记录）",
    incidentGapsHeader: "待核缺口（不可跳步推断）",
    incidentActionHeader: "动作与审批权归属",
    certTableRegionAriaLabel: "官方考证对照表",
    certNameHeader: "认证名称",
    certScopeHeader: "官方性质与报考/维持要求",
    certBoundaryHeader: "职场与制度适用边界",
    certTipsHeader: "核验与避坑要点",
    checklistCol1Title: "① 已具备技能",
    checklistCol1Empty: "暂未勾选已有技能项（可按当前基础多选）。",
    checklistCol2Title: "② 可接受条件",
    checklistCol2Empty: "暂未勾选工作条件项（与技能分开独立勾选）。",
    checklistCol3Title: "③ 面试待核清单",
    exercisePublicLinksDefault: "公开官方材料：",
    exerciseFactSummaryDefault: "统一事实口径（来源自官方原公告）：",
    exerciseRubricHeadingDefault: (count) => `${count} 项自检标准`,
    exerciseRubricRuleWrap: (heading, rule) => `${heading}（${rule}）`,
    exerciseSampleAnswerDefault: (taskTitle) => `参考样答（${taskTitle}）：`,
    faqSubtitle: "每题首句直给分场景结论与核验方法，服务读者答疑与检索清晰摘引。",
    sourcesFooterHeading: (dateModified) => `逐项官方权威出处与方法边界（核验日期：${dateModified}）`,
    sourceNoteWrap: (note) => `（${note}）`,
  },
  "zh-TW": {
    tocAriaLabel: "頁內目錄導覽",
    breadcrumbAriaLabel: "職業對比導覽",
    allComparisonsLabel: "全部職業對比",
    verifiedPrefix: "原證核驗：",
    authorPrefix: "署名：",
    heroSummaryAriaLabel: "首屏核心分界",
    oneLineConclusion: "單句結論：",
    colon: "：",
    semicolon: "；",
    topologyRegionAriaLabel: "可橫向捲動的職責拓撲圖",
    expandMatrixDefault: "展開其餘維度",
    collapseMatrixDefault: "收起額外維度",
    matrixRegionAriaLabel: (count) => `核心${count}維對比表格`,
    matrixDimensionHeader: "對照維度",
    aiTableRegionAriaLabel: "AI工作流三層責任邊界對照表",
    aiTierHeader: "工作流分層",
    aiCounterExampleHeader: "編輯模擬反例與核驗紅線",
    aiRedlinePrefix: "紅線：",
    aiSubjectFormat: (subject) => `（對象：${subject}）：`,
    aiDiagramRegionAriaLabel: "AI輔助工作流三層責任邊界示意圖",
    incidentTableRegionAriaLabel: "模擬交接案例責任拆分表",
    incidentStageHeader: "階段與角色",
    incidentFactsHeader: "已證實事實（可追溯紀錄）",
    incidentGapsHeader: "待核缺口（不可跳步推斷）",
    incidentActionHeader: "動作與核准權歸屬",
    certTableRegionAriaLabel: "官方證照對照表",
    certNameHeader: "證照／資格名稱",
    certScopeHeader: "官方性質與報考／換照要求",
    certBoundaryHeader: "職場與法規適用邊界",
    certTipsHeader: "核驗與避坑要點",
    checklistCol1Title: "① 已具備技能",
    checklistCol1Empty: "尚未勾選已有技能項（可依目前基礎複選）。",
    checklistCol2Title: "② 可接受條件",
    checklistCol2Empty: "尚未勾選工作條件項（與技能分開獨立勾選）。",
    checklistCol3Title: "③ 面試待核清單",
    exercisePublicLinksDefault: "公開官方材料：",
    exerciseFactSummaryDefault: "統一事實口徑（來源自官方原文件）：",
    exerciseRubricHeadingDefault: (count) => `${count} 項自檢標準`,
    exerciseRubricRuleWrap: (heading, rule) => `${heading}（${rule}）`,
    exerciseSampleAnswerDefault: (taskTitle) => `參考樣答（${taskTitle}）：`,
    faqSubtitle: "每題首句直給分情境結論與核驗方式，服務讀者查核與搜尋清楚摘引。",
    sourcesFooterHeading: (dateModified) => `逐項官方權威出處與方法邊界（核驗日期：${dateModified}）`,
    sourceNoteWrap: (note) => `（${note}）`,
  },
  en: {
    tocAriaLabel: "In-page table of contents",
    breadcrumbAriaLabel: "Career comparison navigation",
    allComparisonsLabel: "All comparisons",
    verifiedPrefix: "Verified: ",
    authorPrefix: "By: ",
    heroSummaryAriaLabel: "At-a-glance comparison boundary",
    oneLineConclusion: "Bottom line: ",
    colon: ": ",
    semicolon: "; ",
    topologyRegionAriaLabel: "Horizontally scrollable responsibility workflow diagram",
    expandMatrixDefault: "Show more dimensions",
    collapseMatrixDefault: "Hide extra dimensions",
    matrixRegionAriaLabel: (count) => `Core ${count}-dimension comparison table`,
    matrixDimensionHeader: "Dimension",
    aiTableRegionAriaLabel: "AI workflow three-tier responsibility boundary table",
    aiTierHeader: "Workflow Tier",
    aiCounterExampleHeader: "Simulated Counter-Example & Verification Redline",
    aiRedlinePrefix: "Redline: ",
    aiSubjectFormat: (subject) => ` (Subject: ${subject}): `,
    aiDiagramRegionAriaLabel: "AI-assisted workflow three-tier responsibility boundary diagram",
    incidentTableRegionAriaLabel: "Simulated handoff accountability table",
    incidentStageHeader: "Stage & Role",
    incidentFactsHeader: "Verified Facts (Traceable Record)",
    incidentGapsHeader: "Open Gaps (Do Not Assume)",
    incidentActionHeader: "Action & Sign-Off Authority",
    certTableRegionAriaLabel: "Official licensing and credential comparison table",
    certNameHeader: "Credential / License",
    certScopeHeader: "Issuing Body & Requirements",
    certBoundaryHeader: "Workplace & Legal Scope",
    certTipsHeader: "Verification & Pitfalls",
    checklistCol1Title: "1. Skills You Already Have",
    checklistCol1Empty: "No skills selected yet (select all that match your current background).",
    checklistCol2Title: "2. Conditions You Accept",
    checklistCol2Empty: "No work conditions selected yet (kept separate from skills).",
    checklistCol3Title: "3. Interview Verification List",
    exercisePublicLinksDefault: "Official public references: ",
    exerciseFactSummaryDefault: "Shared fact baseline (from primary public docs): ",
    exerciseRubricHeadingDefault: (count) => `${count}-Item Self-Check Rubric`,
    exerciseRubricRuleWrap: (heading, rule) => `${heading} (${rule})`,
    exerciseSampleAnswerDefault: (taskTitle) => `Sample Answer (${taskTitle}): `,
    faqSubtitle: "Each answer opens with a direct, scenario-scoped conclusion and verification method.",
    sourcesFooterHeading: (dateModified) => `Primary Sources & Scope Boundaries (Verified: ${dateModified})`,
    sourceNoteWrap: (note) => ` (${note})`,
  },
};

const AI_TIER_SVG_THEME = {
  blue: { fill: "#eef4fb", stroke: "#153f83", title: "#153f83", boxStroke: "#d5dfe9", strokeWidth: "1.3" },
  amber: { fill: "#fef7ec", stroke: "#b45309", title: "#b45309", boxStroke: "#f0d9b5", strokeWidth: "1.3" },
  green: { fill: "#eaf5f0", stroke: "#1c6b57", title: "#1c6b57", boxStroke: "#cbe3da", strokeWidth: "1.4" },
} as const;

const NO_LINE_START_PUNCTUATION = new Set(["，", "。", "、", "；", "：", "）", "》", "”", "’", ",", ".", ";", ":", ")"]);
const PREFERRED_BREAK_AFTER = new Set(["，", "。", "、", "；", "：", "）", "》", "”", " ", "/", "／"]);

function formatInlineLabel(label: string, colon: string): string {
  const trimmed = label.trimEnd();
  if (!/[:：？?!！]$/.test(trimmed)) return trimmed + colon;
  return colon.endsWith(" ") && label === trimmed ? label + " " : label;
}

function splitParagraphs(text: string): string[] {
  return text.split(/\r?\n(?:[ \t]*\r?\n)+/);
}

function charVisualUnits(char: string): number {
  const code = char.codePointAt(0) ?? 0;
  return code > 0x2e7f ? 1 : 0.56;
}

function wrapSvgLines(text: string, maxUnits: number, maxLines = 3): string[] {
  const chars = Array.from(text.trim());
  if (chars.length === 0) return [""];

  const lines: string[] = [];
  let start = 0;

  while (start < chars.length && lines.length < maxLines) {
    let units = 0;
    let end = start;
    let lastBreak = -1;

    while (end < chars.length) {
      const nextUnits = units + charVisualUnits(chars[end]);
      if (nextUnits > maxUnits && end > start) break;
      units = nextUnits;
      end += 1;
      if (PREFERRED_BREAK_AFTER.has(chars[end - 1]) && units >= maxUnits * 0.5) {
        lastBreak = end;
      }
    }

    if (end >= chars.length) {
      lines.push(chars.slice(start).join("").trim());
      break;
    }

    const isLastAllowedLine = lines.length === maxLines - 1;
    if (isLastAllowedLine) {
      lines.push(chars.slice(start).join("").trim());
      break;
    }

    let cut = lastBreak > start ? lastBreak : end;
    while (cut < chars.length && NO_LINE_START_PUNCTUATION.has(chars[cut])) {
      cut += 1;
    }
    if (cut <= start) cut = end;

    lines.push(chars.slice(start, cut).join("").trim());
    start = cut;
  }

  return lines;
}

type TopologyStepLayout = {
  title: string;
  lines: string[];
  y: number;
  height: number;
};

function layoutTopologySteps(
  steps: readonly { title: string; detail: string }[],
  gap: number
): TopologyStepLayout[] {
  let y = 54;
  return steps.map((step) => {
    const lines = wrapSvgLines(step.detail, 18.5, 3);
    const height = 54 + Math.max(0, lines.length - 1) * 15;
    const item: TopologyStepLayout = { title: step.title, lines, y, height };
    y += height + gap;
    return item;
  });
}

function buildTopologySvgLayout(topology: ModularComparisonSpec["topology"]) {
  const maxStepCount = Math.max(topology.leftSteps.length, topology.rightSteps.length, 1);
  const stepGap = maxStepCount <= 2 ? 38 : 18;
  const leftSteps = layoutTopologySteps(topology.leftSteps, stepGap);
  const rightSteps = layoutTopologySteps(topology.rightSteps, stepGap);

  const upperLines = [
    ...wrapSvgLines(topology.upperBridge.line1, 17.5, 2),
    ...wrapSvgLines(topology.upperBridge.line2, 17.5, 2),
  ];
  const lowerLines = [
    ...wrapSvgLines(topology.lowerBridge.line1, 17.5, 2),
    ...wrapSvgLines(topology.lowerBridge.line2, 17.5, 2),
  ];

  const upperBridgeHeight = Math.max(68, 38 + upperLines.length * 15);
  const lowerBridgeHeight = Math.max(68, 38 + lowerLines.length * 15);

  const firstLeft = leftSteps[0];
  const firstRight = rightSteps[0];
  const lastLeft = leftSteps[leftSteps.length - 1];
  const lastRight = rightSteps[rightSteps.length - 1];

  const isExactThreeSingleLine =
    leftSteps.length === 3 &&
    rightSteps.length === 3 &&
    leftSteps.every((s) => s.lines.length === 1) &&
    rightSteps.every((s) => s.lines.length === 1) &&
    upperLines.length <= 2 &&
    lowerLines.length <= 2;

  if (isExactThreeSingleLine) {
    return {
      viewBoxHeight: 286,
      zoneHeight: 258,
      leftSteps,
      rightSteps,
      centerY: 34,
      centerHeight: 218,
      upperBridge: { title: topology.upperBridge.title, lines: upperLines, y: 74, height: 68 },
      lowerBridge: { title: topology.lowerBridge.title, lines: lowerLines, y: 164, height: 68 },
      upperArrowY: 96,
      lowerArrowY: 210,
    };
  }

  const upperBridgeY = 58;
  const minLowerBridgeY = upperBridgeY + upperBridgeHeight + 18;
  const targetLowerMid =
    lastLeft && lastRight
      ? (lastLeft.y + lastLeft.height / 2 + (lastRight.y + lastRight.height / 2)) / 2
      : minLowerBridgeY + lowerBridgeHeight / 2;
  const lowerBridgeY = Math.max(minLowerBridgeY, Math.round(targetLowerMid - lowerBridgeHeight / 2));

  const leftBottom = lastLeft ? lastLeft.y + lastLeft.height : 120;
  const rightBottom = lastRight ? lastRight.y + lastRight.height : 120;
  const centerY = 24;
  const centerBottom = lowerBridgeY + lowerBridgeHeight + 16;
  const contentBottom = Math.max(leftBottom, rightBottom, centerBottom);
  const zoneHeight = contentBottom - 14 + 18;
  const viewBoxHeight = zoneHeight + 28;
  const centerHeight = Math.max(centerBottom - centerY, zoneHeight - 24);

  const clampArrowY = (targetY: number, boxA?: TopologyStepLayout, boxB?: TopologyStepLayout, bridgeY?: number, bridgeH?: number) => {
    const mins = [boxA?.y, boxB?.y, bridgeY].filter((v): v is number => v !== undefined).map((v) => v + 12);
    const maxs = [
      boxA ? boxA.y + boxA.height : undefined,
      boxB ? boxB.y + boxB.height : undefined,
      bridgeY !== undefined && bridgeH !== undefined ? bridgeY + bridgeH : undefined,
    ]
      .filter((v): v is number => v !== undefined)
      .map((v) => v - 12);
    const low = mins.length ? Math.max(...mins) : targetY;
    const high = maxs.length ? Math.min(...maxs) : targetY;
    if (low <= high) return Math.round(Math.min(high, Math.max(low, targetY)));
    return Math.round(targetY);
  };

  const upperArrowY = clampArrowY(
    upperBridgeY + upperBridgeHeight / 2,
    firstLeft,
    firstRight,
    upperBridgeY,
    upperBridgeHeight
  );
  const lowerArrowY = clampArrowY(
    lowerBridgeY + lowerBridgeHeight / 2,
    lastLeft,
    lastRight,
    lowerBridgeY,
    lowerBridgeHeight
  );

  return {
    viewBoxHeight,
    zoneHeight,
    leftSteps,
    rightSteps,
    centerY,
    centerHeight,
    upperBridge: { title: topology.upperBridge.title, lines: upperLines, y: upperBridgeY, height: upperBridgeHeight },
    lowerBridge: { title: topology.lowerBridge.title, lines: lowerLines, y: lowerBridgeY, height: lowerBridgeHeight },
    upperArrowY,
    lowerArrowY,
  };
}

export function ModularCareerComparison({
  spec,
  locale,
  pair,
  pluginFlags,
}: ModularCareerComparisonProps) {
  const view = useMemo(() => buildModularComparisonView(spec, pluginFlags), [spec, pluginFlags]);
  const [matrixExpanded, setMatrixExpanded] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);

  const toggleSelection = (id: string, list: string[], setter: (next: string[]) => void) => {
    setter(list.includes(id) ? list.filter((item) => item !== id) : [...list, id]);
  };

  const checklistReadout = useMemo(() => {
    const skillItems = spec.checklist.skillsOptions.filter((opt) => selectedSkills.includes(opt.id));
    const conditionItems = spec.checklist.conditionsOptions.filter((opt) => selectedConditions.includes(opt.id));

    const interviewQuestions: string[] = [];
    for (const item of [...skillItems, ...conditionItems]) {
      for (const q of item.interviewQuestions) {
        if (!interviewQuestions.includes(q)) interviewQuestions.push(q);
      }
    }
    if (interviewQuestions.length === 0) {
      interviewQuestions.push(...spec.checklist.defaultInterviewQuestions);
    }

    const hasCrossTrack = skillItems.some(
      ({ track }) => track !== undefined && conditionItems.some(
        (option) => option.track !== undefined && option.track !== track
      )
    );

    return {
      skillItems,
      conditionItems,
      interviewQuestions,
      hasCrossTrack,
    };
  }, [selectedSkills, selectedConditions, spec.checklist]);

  const { desktopExercise, matrix } = spec;
  const ui = UI_COPY[locale] ?? UI_COPY.zh;
  const factParagraphs = desktopExercise.factSummary ? splitParagraphs(desktopExercise.factSummary) : [];
  const topologyLayout = useMemo(() => buildTopologySvgLayout(spec.topology), [spec.topology]);
  const hasExtraMatrixRows = matrix.rows.some((row) => !row.defaultVisible);
  const activePluginTag = `${view.flags.ai ? "ai" : "no-ai"}_${view.flags.thirtyDay ? "30day" : "no-30day"}`;
  const breadcrumbTitle = spec.shortTitle ?? spec.title.split(/[：:]/)[0];

  return (
    <main
      lang={locale === "zh" ? "zh-CN" : locale}
      data-fixed-comparison={spec.pairId}
      data-modular-comparison="v5.0"
      data-modular-plugins={activePluginTag}
      className={`${styles.page} pb-16`}
    >
      {/* Accessible In-Page TOC (Visible on Mobile 390px and Desktop; Hidden in Print) */}
      <div className={styles.tocBar}>
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <nav aria-label={ui.tocAriaLabel} data-toc-nav="true" className={styles.tocScroll}>
            {view.sections.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className={`${styles.tocLink} ${section.isPlugin ? styles.tocLinkPlugin : ""}`}
              >
                {section.tocLabel}
              </a>
            ))}
          </nav>
        </div>
      </div>

      <article className={`${styles.articleStack} mx-auto max-w-5xl space-y-8 px-4 pt-6 sm:px-6 sm:pt-8`}>
        {/* Top Breadcrumb + Language Switcher (Preserves Site Contract) */}
        <nav
          aria-label={ui.breadcrumbAriaLabel}
          className={`${styles.noPrint} flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm text-[var(--mc-muted)]`}
        >
          <div className="flex items-center gap-2">
            <Link href={`/${locale}/career-compare`} className="underline underline-offset-4 hover:text-[var(--mc-role-a)]">
              {ui.allComparisonsLabel}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="font-medium text-[var(--mc-text)]">{breadcrumbTitle}</span>
          </div>
          <div data-comparison-languages className="flex flex-wrap gap-3">
            {(["zh", "en", "zh-TW"] as const)
              .filter((language) => pair.labels[language])
              .map((language) => (
                <Link
                  key={language}
                  href={fixedComparisonPath(language, pair)}
                  prefetch={false}
                  hrefLang={language === "zh" ? "zh-CN" : language}
                  lang={language === "zh" ? "zh-CN" : language}
                  aria-current={language === locale ? "page" : undefined}
                  className="underline underline-offset-4 hover:text-[var(--mc-role-a)]"
                >
                  {LANGUAGE_LABELS[language]}
                </Link>
              ))}
          </div>
        </nav>

        {/* CORE MODULE 1: LEAN HERO + DOMESTIC ALIASES + 2 INTERVIEW COUNTER-QUESTIONS */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs text-[var(--mc-muted)]">
            <span className={`${styles.badgeRoleA} rounded-full px-3 py-1 font-semibold`}>
              {spec.regionLabel}
            </span>
            <span>{ui.verifiedPrefix}{spec.dateModified}</span>
            <span aria-hidden="true">·</span>
            <span>{ui.authorPrefix}{spec.authorName}</span>
            <span aria-hidden="true">·</span>
            <span data-active-module-summary>{view.activeModuleSummary}</span>
          </div>

          <h1 className="text-2xl font-bold leading-tight tracking-tight sm:text-4xl">{spec.title}</h1>

          <section
            aria-label={ui.heroSummaryAriaLabel}
            data-geo-summary="true"
            className={`${styles.heroCapsule} ${styles.printKeep} space-y-4 rounded-2xl p-5`}
          >
            <p className="text-sm leading-7 text-[var(--mc-text)] sm:text-base">{spec.hero.directAnswer}</p>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <div className={`${styles.tintRoleA} space-y-2 rounded-xl p-4`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold">{spec.hero.roleA.badgeTitle}</span>
                  <span className={`${styles.badgeRoleA} rounded-full px-2 py-1 text-xs font-medium`}>
                    {spec.hero.roleA.riasecLabel}
                  </span>
                </div>
                <p className="text-xs font-medium text-[var(--mc-text)] sm:text-sm">{spec.hero.roleA.aliases}</p>
                <p className="text-xs text-[var(--mc-muted)]">{spec.hero.roleA.keywords}</p>
              </div>

              <div className={`${styles.tintRoleB} space-y-2 rounded-xl p-4`}>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-sm font-bold">{spec.hero.roleB.badgeTitle}</span>
                  <span className={`${styles.badgeRoleB} rounded-full px-2 py-1 text-xs font-medium`}>
                    {spec.hero.roleB.riasecLabel}
                  </span>
                </div>
                <p className="text-xs font-medium text-[var(--mc-text)] sm:text-sm">{spec.hero.roleB.aliases}</p>
                <p className="text-xs text-[var(--mc-muted)]">{spec.hero.roleB.keywords}</p>
              </div>
            </div>

            <div className="space-y-1 rounded-xl border border-[var(--mc-border)] bg-[var(--mc-surface)] p-4 text-xs sm:text-sm">
              <div className="font-bold text-[var(--mc-text)]">{spec.hero.interviewBoundaryTitle}</div>
              {spec.hero.interviewBoundaryQuestions.map((q) => (
                <p key={q} className="text-[var(--mc-muted)]">
                  {q}
                </p>
              ))}
            </div>

            <p className="text-xs text-[var(--mc-muted)]">{spec.hero.riasecBoundaryNote}</p>
          </section>
        </header>

        {/* CORE MODULE 1B: CLEAN ZERO-CROSSING TOPOLOGY DIAGRAM */}
        {view.sectionByKey.topology && (
          <section id={view.sectionByKey.topology.id} className={`${styles.printKeep} space-y-4`}>
            <div className={`${styles.sectionHead} space-y-1`}>
              <h2 className="text-xl font-bold sm:text-2xl">{view.sectionByKey.topology.heading}</h2>
              <p className="text-sm text-[var(--mc-muted)]">
                <strong className="text-[var(--mc-text)]">{ui.oneLineConclusion}</strong>
                {spec.topology.summary}
              </p>
            </div>

            {/* Mobile-first compact text summary for 390px readability */}
            <div className="grid grid-cols-1 gap-3 sm:hidden">
              <div className={`${styles.tintRoleA} rounded-xl p-4 text-xs space-y-1`}>
                <div className="font-bold text-[var(--mc-role-a)]">{spec.topology.leftZoneTitle}</div>
                {spec.topology.leftSteps.map((s) => (
                  <p key={s.title} className="text-[var(--mc-muted)]">
                    <strong className="text-[var(--mc-text)]">{s.title}{ui.colon}</strong>
                    {s.detail}
                  </p>
                ))}
              </div>
              <div className={`${styles.tintBridge} rounded-xl p-4 text-xs space-y-1`}>
                <div className="font-bold text-[var(--mc-bridge)]">{spec.topology.centerZoneTitle}</div>
                <p className="text-[var(--mc-muted)]">
                  <strong className="text-[var(--mc-text)]">{spec.topology.upperBridge.title}{ui.colon}</strong>
                  {spec.topology.upperBridge.line1}{ui.semicolon}{spec.topology.upperBridge.line2}
                </p>
                <p className="text-[var(--mc-muted)]">
                  <strong className="text-[var(--mc-text)]">{spec.topology.lowerBridge.title}{ui.colon}</strong>
                  {spec.topology.lowerBridge.line1}{ui.semicolon}{spec.topology.lowerBridge.line2}
                </p>
              </div>
              <div className={`${styles.tintRoleB} rounded-xl p-4 text-xs space-y-1`}>
                <div className="font-bold text-[var(--mc-role-b)]">{spec.topology.rightZoneTitle}</div>
                {spec.topology.rightSteps.map((s) => (
                  <p key={s.title} className="text-[var(--mc-muted)]">
                    <strong className="text-[var(--mc-text)]">{s.title}{ui.colon}</strong>
                    {s.detail}
                  </p>
                ))}
              </div>
            </div>

            <div
              role="region"
              aria-label={ui.topologyRegionAriaLabel}
              tabIndex={0}
              className={`${styles.svgWrap} ${styles.printKeep} rounded-2xl border border-[var(--mc-border)] bg-[var(--mc-card)] p-4 sm:p-5`}
            >
              <svg
                viewBox={`0 0 920 ${topologyLayout.viewBoxHeight}`}
                className="h-auto w-full min-w-[680px]"
                role="img"
                aria-label={spec.topology.ariaLabel}
              >
                <defs>
                  <marker
                    id="mc-arr"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto-start-reverse"
                  >
                    <path d="M 0 1 L 10 5 L 0 9 z" fill="#4d5b55" />
                  </marker>
                </defs>

                {/* Left Zone */}
                <rect
                  x="12"
                  y="14"
                  width="278"
                  height={topologyLayout.zoneHeight}
                  rx="14"
                  fill="#eef4fb"
                  stroke="#153f83"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                <text x="28" y="38" fontSize="13" fontWeight="700" fill="#153f83">
                  {spec.topology.leftZoneTitle}
                </text>

                {topologyLayout.leftSteps.map((step, idx) => {
                  const nextStep = topologyLayout.leftSteps[idx + 1];
                  return (
                    <g key={step.title}>
                      <rect
                        x="26"
                        y={step.y}
                        width="250"
                        height={step.height}
                        rx="10"
                        fill="#ffffff"
                        stroke="#d5dfe9"
                        strokeWidth="1.2"
                      />
                      <text x="40" y={step.y + 22} fontSize="12.5" fontWeight="600" fill="#07111c">
                        {step.title}
                      </text>
                      <text x="40" y={step.y + 40} fontSize="11" fill="#4d5b55">
                        {step.lines.map((line, lineIdx) => (
                          <tspan key={`${step.title}-${lineIdx}`} x="40" dy={lineIdx === 0 ? 0 : 15}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                      {nextStep && (
                        <line
                          data-topology-vertical-arrow="left"
                          x1="151"
                          y1={step.y + step.height}
                          x2="151"
                          y2={nextStep.y - 4}
                          stroke="#4d5b55"
                          strokeWidth="1.5"
                          markerEnd="url(#mc-arr)"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Center Zone: Parallel Non-Crossing Upper & Lower Lanes */}
                <rect
                  x="332"
                  y={topologyLayout.centerY}
                  width="256"
                  height={topologyLayout.centerHeight}
                  rx="14"
                  fill="#f1f5f9"
                  stroke="#17324d"
                  strokeWidth="1.5"
                />
                <text x="348" y={topologyLayout.centerY + 24} fontSize="13" fontWeight="700" fill="#17324d">
                  {spec.topology.centerZoneTitle}
                </text>

                <rect
                  x="346"
                  y={topologyLayout.upperBridge.y}
                  width="228"
                  height={topologyLayout.upperBridge.height}
                  rx="10"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />
                <text x="360" y={topologyLayout.upperBridge.y + 22} fontSize="12" fontWeight="600" fill="#07111c">
                  {topologyLayout.upperBridge.title}
                </text>
                <text x="360" y={topologyLayout.upperBridge.y + 40} fontSize="11" fill="#4d5b55">
                  {topologyLayout.upperBridge.lines.map((line, lineIdx) => (
                    <tspan key={`upper-${lineIdx}`} x="360" dy={lineIdx === 0 ? 0 : 15}>
                      {line}
                    </tspan>
                  ))}
                </text>

                <rect
                  x="346"
                  y={topologyLayout.lowerBridge.y}
                  width="228"
                  height={topologyLayout.lowerBridge.height}
                  rx="10"
                  fill="#ffffff"
                  stroke="#cbd5e1"
                  strokeWidth="1.2"
                />
                <text x="360" y={topologyLayout.lowerBridge.y + 22} fontSize="12" fontWeight="600" fill="#07111c">
                  {topologyLayout.lowerBridge.title}
                </text>
                <text x="360" y={topologyLayout.lowerBridge.y + 40} fontSize="11" fill="#4d5b55">
                  {topologyLayout.lowerBridge.lines.map((line, lineIdx) => (
                    <tspan key={`lower-${lineIdx}`} x="360" dy={lineIdx === 0 ? 0 : 15}>
                      {line}
                    </tspan>
                  ))}
                </text>

                {/* Right Zone */}
                <rect
                  x="630"
                  y="14"
                  width="278"
                  height={topologyLayout.zoneHeight}
                  rx="14"
                  fill="#eaf5f0"
                  stroke="#1c6b57"
                  strokeWidth="1.5"
                  strokeDasharray="6 4"
                />
                <text x="646" y="38" fontSize="13" fontWeight="700" fill="#1c6b57">
                  {spec.topology.rightZoneTitle}
                </text>

                {topologyLayout.rightSteps.map((step, idx) => {
                  const nextStep = topologyLayout.rightSteps[idx + 1];
                  return (
                    <g key={step.title}>
                      <rect
                        x="644"
                        y={step.y}
                        width="250"
                        height={step.height}
                        rx="10"
                        fill="#ffffff"
                        stroke="#cbe3da"
                        strokeWidth="1.2"
                      />
                      <text x="658" y={step.y + 22} fontSize="12.5" fontWeight="600" fill="#07111c">
                        {step.title}
                      </text>
                      <text x="658" y={step.y + 40} fontSize="11" fill="#4d5b55">
                        {step.lines.map((line, lineIdx) => (
                          <tspan key={`${step.title}-${lineIdx}`} x="658" dy={lineIdx === 0 ? 0 : 15}>
                            {line}
                          </tspan>
                        ))}
                      </text>
                      {nextStep && (
                        <line
                          data-topology-vertical-arrow="right"
                          x1="769"
                          y1={step.y + step.height}
                          x2="769"
                          y2={nextStep.y - 4}
                          stroke="#4d5b55"
                          strokeWidth="1.5"
                          markerEnd="url(#mc-arr)"
                        />
                      )}
                    </g>
                  );
                })}

                {/* Strictly Horizontal Zero-Crossing Arrows */}
                <line
                  x1="644"
                  y1={topologyLayout.upperArrowY}
                  x2="578"
                  y2={topologyLayout.upperArrowY}
                  stroke="#4d5b55"
                  strokeWidth="1.6"
                  markerEnd="url(#mc-arr)"
                />
                <line
                  x1="346"
                  y1={topologyLayout.upperArrowY}
                  x2="280"
                  y2={topologyLayout.upperArrowY}
                  stroke="#4d5b55"
                  strokeWidth="1.6"
                  markerEnd="url(#mc-arr)"
                />
                <line
                  x1="276"
                  y1={topologyLayout.lowerArrowY}
                  x2="342"
                  y2={topologyLayout.lowerArrowY}
                  stroke="#4d5b55"
                  strokeWidth="1.6"
                  markerEnd="url(#mc-arr)"
                />
                <line
                  x1="574"
                  y1={topologyLayout.lowerArrowY}
                  x2="640"
                  y2={topologyLayout.lowerArrowY}
                  stroke="#4d5b55"
                  strokeWidth="1.6"
                  markerEnd="url(#mc-arr)"
                />
              </svg>
            </div>
          </section>
        )}

        {/* CORE MODULE 2: 9-DIMENSION COMPARISON MATRIX (4 VISIBLE DEFAULT + 5 EXPANDABLE WITH FULL ARIA) */}
        {view.sectionByKey.matrix && (
          <section id={view.sectionByKey.matrix.id} className="space-y-4">
            <div className={`${styles.sectionHead} flex flex-col justify-between gap-3 sm:flex-row sm:items-end`}>
              <div className="space-y-1">
                <h2 className="text-xl font-bold sm:text-2xl">{view.sectionByKey.matrix.heading}</h2>
                <p className="text-sm text-[var(--mc-muted)]">
                  <strong className="text-[var(--mc-text)]">{ui.oneLineConclusion}</strong>
                  {spec.matrix.summary}
                </p>
              </div>
              {hasExtraMatrixRows && (
                <button
                  type="button"
                  id="toggle-matrix-rows"
                  aria-expanded={matrixExpanded}
                  aria-controls="core-comparison-matrix-table"
                  onClick={() => setMatrixExpanded((prev) => !prev)}
                  className={`${styles.noPrint} shrink-0 cursor-pointer rounded-full border border-[var(--mc-border)] bg-[var(--mc-card)] px-4 py-2 text-xs font-semibold text-[var(--mc-role-a)] transition hover:border-[var(--mc-role-a)]`}
                >
                  {matrixExpanded
                    ? `${matrix.collapseButtonLabel ?? ui.collapseMatrixDefault} ▴`
                    : `${matrix.expandButtonLabel ?? ui.expandMatrixDefault} ▾`}
                </button>
              )}
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--mc-border)] bg-[var(--mc-card)]">
              <div role="region" aria-label={ui.matrixRegionAriaLabel(matrix.rows.length)} tabIndex={0} className={styles.tableWrap}>
                <table id="core-comparison-matrix-table" className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--mc-border)] bg-[var(--mc-surface)]">
                      <th scope="col" className="w-[18%] px-4 py-3 font-semibold">
                        {ui.matrixDimensionHeader}
                      </th>
                      <th scope="col" className="w-[41%] px-4 py-3 font-semibold text-[var(--mc-role-a)]">
                        {spec.matrix.roleAColumn}
                      </th>
                      <th scope="col" className="w-[41%] px-4 py-3 font-semibold text-[var(--mc-role-b)]">
                        {spec.matrix.roleBColumn}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--mc-border)]">
                    {spec.matrix.rows.map((row) => {
                      const isHidden = !row.defaultVisible && !matrixExpanded;
                      return (
                        <tr
                          key={row.id}
                          data-matrix-row={row.id}
                          className={isHidden ? styles.extraRowHidden : undefined}
                        >
                          <th scope="row" className="px-4 py-3 align-top font-semibold">
                            {row.dimension}
                          </th>
                          <td className="px-4 py-3 align-top text-[var(--mc-text)]">{row.roleA}</td>
                          <td className="px-4 py-3 align-top text-[var(--mc-text)]">{row.roleB}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {matrix.hybridRoleNote && (
                <div className="border-t border-[var(--mc-border)] bg-[var(--mc-surface)] px-4 py-3 text-xs text-[var(--mc-muted)]">
                  {matrix.hybridRoleNote.prefix}
                  <a
                    href={matrix.hybridRoleNote.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[var(--mc-role-a)] underline underline-offset-2"
                  >
                    {matrix.hybridRoleNote.linkLabel}
                  </a>
                  {matrix.hybridRoleNote.suffix}
                </div>
              )}
            </div>
          </section>
        )}

        {/* OPTIONAL PLUGIN A (INDEPENDENTLY TOGGLEABLE): AI WORKFLOW BOUNDARY */}
        {view.flags.ai && spec.aiPlugin && view.sectionByKey.ai && (
          <section id={view.sectionByKey.ai.id} data-optional-plugin="ai" className="space-y-4">
            <div className={`${styles.sectionHead} space-y-2`}>
              <div className={`${styles.badgeBridge} inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold`}>
                {spec.aiPlugin.badge}
              </div>
              <h2 className="text-xl font-bold sm:text-2xl">{view.sectionByKey.ai.heading}</h2>
              <p className="text-sm text-[var(--mc-muted)]">
                <strong className="text-[var(--mc-text)]">{ui.oneLineConclusion}</strong>
                {spec.aiPlugin.summary}
              </p>
            </div>

            {/* Mobile-First Layout: Native Readable HTML Table First on <640px, SVG First on >=640px */}
            <div className="flex flex-col gap-4">
              <div className="order-1 overflow-hidden rounded-2xl border border-[var(--mc-border)] bg-[var(--mc-card)] sm:order-2">
                <div role="region" aria-label={ui.aiTableRegionAriaLabel} tabIndex={0} className={styles.tableWrap}>
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[var(--mc-border)] bg-[var(--mc-surface)]">
                        <th scope="col" className="w-[17%] px-4 py-3 font-semibold">
                          {ui.aiTierHeader}
                        </th>
                        <th scope="col" className="w-[27%] px-4 py-3 font-semibold">
                          {spec.aiPlugin.tableRoleAColumn}
                        </th>
                        <th scope="col" className="w-[27%] px-4 py-3 font-semibold">
                          {spec.aiPlugin.tableRoleBColumn}
                        </th>
                        <th scope="col" className="w-[29%] px-4 py-3 font-semibold">
                          {ui.aiCounterExampleHeader}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--mc-border)]">
                      {spec.aiPlugin.tiers.map((tier) => (
                        <tr key={tier.tier}>
                          <th scope="row" className="px-4 py-3 align-top font-semibold">
                            {tier.tier}
                          </th>
                          <td className="px-4 py-3 align-top">{tier.roleAScenario}</td>
                          <td className="px-4 py-3 align-top">{tier.roleBScenario}</td>
                          <td className="px-4 py-3 align-top space-y-2">
                            <p className="text-[var(--mc-error)]">{tier.editorialCounterExample}</p>
                            <p className="text-[var(--mc-muted)]">
                              <strong className="text-[var(--mc-text)]">{ui.aiRedlinePrefix}</strong>
                              {tier.redline}
                            </p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Separated Distinct Evidence Records (No Conflation!) */}
                <div className="space-y-3 border-t border-[var(--mc-border)] bg-[var(--mc-surface)] p-4 text-xs">
                  <div className="font-bold text-[var(--mc-text)]">{spec.aiPlugin.evidenceHeading}</div>
                  <ul className="space-y-2 text-[var(--mc-muted)] leading-5">
                    {spec.aiPlugin.evidenceRecords.map((ev) => (
                      <li key={ev.id}>
                        <strong className="text-[var(--mc-text)]">{ev.studyType}</strong>{ui.aiSubjectFormat(ev.subject)}
                        {ev.findingBoundary}{" "}
                        <a
                          href={ev.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-[var(--mc-role-a)] underline underline-offset-2"
                        >
                          {ev.linkLabel}
                        </a>
                      </li>
                    ))}
                  </ul>
                  <p className="rounded-lg border border-[var(--mc-border)] bg-[var(--mc-card)] px-3 py-2 leading-5 text-[var(--mc-muted)]">
                    {spec.aiPlugin.governanceBoundaryNote}
                  </p>
                  <div className={`${styles.printKeep} space-y-1 border-t border-[var(--mc-border)] pt-2 text-[var(--mc-muted)]`}>
                    <div className="font-bold text-[var(--mc-text)]">{spec.aiPlugin.interviewQuestionsTitle}</div>
                    {spec.aiPlugin.interviewQuestions.map((q) => (
                      <p key={q}>{q}</p>
                    ))}
                  </div>
                </div>
              </div>

              <div
                role="region"
                aria-label={ui.aiDiagramRegionAriaLabel}
                tabIndex={0}
                className={`${styles.svgWrap} ${styles.printKeep} order-2 rounded-2xl border border-[var(--mc-border)] bg-[var(--mc-card)] p-4 sm:order-1 sm:p-5`}
              >
                <div className="mb-3 text-xs font-semibold text-[var(--mc-muted)]">{spec.aiPlugin.diagramCaption}</div>
                <svg
                  viewBox="0 0 920 264"
                  className="h-auto w-full min-w-[680px]"
                  role="img"
                  aria-label={spec.aiPlugin.diagramAriaLabel}
                >
                  {spec.aiPlugin.tiers.map((tier, idx) => {
                    const x = 14 + idx * 304;
                    const theme = AI_TIER_SVG_THEME[tier.tone];
                    return (
                      <g key={tier.tier}>
                        <rect
                          x={x}
                          y="12"
                          width="284"
                          height="240"
                          rx="12"
                          fill={theme.fill}
                          stroke={theme.stroke}
                          strokeWidth={theme.strokeWidth}
                        />
                        <text x={x + 14} y="36" fontSize="13" fontWeight="700" fill={theme.title}>
                          {tier.tier}
                        </text>
                        <text x={x + 14} y="60" fontSize="11.5" fontWeight="600" fill="#07111c">
                          {tier.roleALabel}
                        </text>
                        <text x={x + 14} y="77" fontSize="11" fill="#4d5b55">
                          {tier.svgRoleALine}
                        </text>
                        <text x={x + 14} y="103" fontSize="11.5" fontWeight="600" fill="#07111c">
                          {tier.roleBLabel}
                        </text>
                        <text x={x + 14} y="120" fontSize="11" fill="#4d5b55">
                          {tier.svgRoleBLine}
                        </text>
                        <rect
                          x={x + 12}
                          y="142"
                          width="260"
                          height="96"
                          rx="8"
                          fill="#ffffff"
                          stroke={theme.boxStroke}
                        />
                        <text x={x + 22} y="162" fontSize="11" fontWeight="700" fill="#9e4b63">
                          {tier.svgCounterHeading}
                        </text>
                        {tier.svgCounterLines.map((line, lineIdx) => (
                          <text key={line} x={x + 22} y={180 + lineIdx * 17} fontSize="10.8" fill="#4d5b55">
                            {line}
                          </text>
                        ))}
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            <div className={`${styles.tintBridge} ${styles.printKeep} space-y-1 rounded-xl p-4 text-xs sm:text-sm`}>
              <div className="font-bold text-[var(--mc-bridge)]">{spec.aiPlugin.scenarioExerciseTitle}</div>
              <p className="leading-6 text-[var(--mc-muted)]">{spec.aiPlugin.scenarioExerciseBody}</p>
            </div>
          </section>
        )}

        {/* CORE MODULE 3: EXPLICIT SIMULATED HANDOFF CASE + EXECUTABLE RECOVERY ACCEPTANCE */}
        {view.sectionByKey.incident && (
          <section id={view.sectionByKey.incident.id} className="space-y-4">
            <div className={`${styles.sectionHead} space-y-1`}>
              <h2 className="text-xl font-bold sm:text-2xl">{view.sectionByKey.incident.heading}</h2>
              <p className="text-sm text-[var(--mc-muted)]">
                <strong className="text-[var(--mc-text)]">{ui.oneLineConclusion}</strong>
                {spec.incident.summary}
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-[var(--mc-border)] bg-[var(--mc-card)] p-4 sm:p-5">
              <div className={`${styles.tintError} ${styles.printKeep} rounded-xl p-4 text-xs sm:text-sm leading-6`}>
                <span className="font-bold text-[var(--mc-error)]">{formatInlineLabel(spec.incident.triggerLabel, ui.colon)}</span>
                {spec.incident.triggerBody}{" "}
                <strong className="text-[var(--mc-text)]">{spec.incident.triggerCaveat}</strong>
              </div>

              <div className="overflow-hidden rounded-xl border border-[var(--mc-border)] bg-[var(--mc-surface)]">
                <div role="region" aria-label={ui.incidentTableRegionAriaLabel} tabIndex={0} className={styles.tableWrap}>
                  <table className="w-full border-collapse text-left text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-[var(--mc-border)] bg-[var(--mc-card)]">
                        <th scope="col" className="w-[15%] px-3 py-3 font-semibold">
                          {ui.incidentStageHeader}
                        </th>
                        <th scope="col" className="w-[30%] px-3 py-3 font-semibold">
                          {ui.incidentFactsHeader}
                        </th>
                        <th scope="col" className="w-[27%] px-3 py-3 font-semibold">
                          {ui.incidentGapsHeader}
                        </th>
                        <th scope="col" className="w-[28%] px-3 py-3 font-semibold">
                          {ui.incidentActionHeader}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--mc-border)]">
                      {spec.incident.rows.map((row) => (
                        <tr key={row.stage}>
                          <th
                            scope="row"
                            className={`px-3 py-3 align-top font-semibold ${
                              row.tone === "roleA" ? "text-[var(--mc-role-a)]" : "text-[var(--mc-role-b)]"
                            }`}
                          >
                            <div>{row.stage}</div>
                            <div>{row.roleLabel}</div>
                          </th>
                          <td className="px-3 py-3 align-top leading-6">{row.verifiedFacts}</td>
                          <td className="px-3 py-3 align-top leading-6">{row.openGaps}</td>
                          <td className="px-3 py-3 align-top leading-6">{row.actionAndApproval}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className={`${styles.tintOk} ${styles.printKeep} space-y-2 rounded-xl p-4 text-xs sm:text-sm leading-6`}>
                <div className="font-bold text-[var(--mc-role-b)]">{spec.incident.recoveryAcceptanceTitle}</div>
                <p className="text-[var(--mc-text)]">{spec.incident.recoveryAcceptanceCriteria}</p>
                <p className="text-xs text-[var(--mc-muted)]">{spec.incident.defenseLayerNote}</p>
              </div>
            </div>
          </section>
        )}

        {/* CORE MODULE 4: OFFICIAL SALARY SCOPE + STRICTLY VERIFIED CERT TABLE + 3 INTERVIEW QUESTIONS */}
        {view.sectionByKey.certs && (
          <section id={view.sectionByKey.certs.id} className="space-y-4">
            <div className={`${styles.sectionHead} space-y-1`}>
              <h2 className="text-xl font-bold sm:text-2xl">{view.sectionByKey.certs.heading}</h2>
              <p className="text-sm text-[var(--mc-muted)]">
                <strong className="text-[var(--mc-text)]">{ui.oneLineConclusion}</strong>
                {spec.payAndCerts.summary}
              </p>
            </div>

            <div className={`${styles.printKeep} space-y-2 rounded-xl border border-[var(--mc-border)] bg-[var(--mc-card)] p-4 text-xs sm:text-sm`}>
              <div className="font-bold text-[var(--mc-text)]">{spec.payAndCerts.salaryHeading}</div>
              {splitParagraphs(spec.payAndCerts.salaryBody).map((paragraph, index) => (
                <p key={index} className="leading-6 text-[var(--mc-muted)]">{paragraph}</p>
              ))}
            </div>

            <div className="overflow-hidden rounded-2xl border border-[var(--mc-border)] bg-[var(--mc-card)]">
              <div role="region" aria-label={ui.certTableRegionAriaLabel} tabIndex={0} className={styles.tableWrap}>
                <table className="w-full border-collapse text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-[var(--mc-border)] bg-[var(--mc-surface)]">
                      <th scope="col" className="w-[18%] px-4 py-3 font-semibold">
                        {ui.certNameHeader}
                      </th>
                      <th scope="col" className="w-[30%] px-4 py-3 font-semibold">
                        {ui.certScopeHeader}
                      </th>
                      <th scope="col" className="w-[27%] px-4 py-3 font-semibold">
                        {ui.certBoundaryHeader}
                      </th>
                      <th scope="col" className="w-[25%] px-4 py-3 font-semibold">
                        {ui.certTipsHeader}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--mc-border)]">
                    {spec.payAndCerts.certs.map((cert) => (
                      <tr key={cert.name}>
                        <th scope="row" className="px-4 py-3 align-top font-semibold">
                          {cert.name}
                        </th>
                        <td className="px-4 py-3 align-top leading-6">
                          <div>{cert.officialScope}</div>
                          {cert.officialLinks && cert.officialLinks.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                              {cert.officialLinks.map((link) => (
                                <a
                                  key={link.href}
                                  href={link.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="font-medium text-[var(--mc-role-a)] underline underline-offset-2"
                                >
                                  {link.label}
                                </a>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 align-top leading-6">{cert.workplaceBoundary}</td>
                        <td className="px-4 py-3 align-top leading-6">{cert.verificationTips}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className={`${styles.tintOk} ${styles.printKeep} space-y-2 rounded-2xl p-4 sm:p-5`}>
              <div className="text-sm font-bold text-[var(--mc-role-b)]">{spec.payAndCerts.interviewChecklistTitle}</div>
              <ol className="list-decimal space-y-2 pl-5 text-xs leading-6 text-[var(--mc-text)] sm:text-sm">
                {spec.payAndCerts.interviewChecklistQuestions.map((item) => (
                  <li key={item.label}>
                    <strong>{item.label}{ui.colon}</strong>
                    {item.question}
                  </li>
                ))}
              </ol>
            </div>
          </section>
        )}

        {/* OPTIONAL PLUGIN B (INDEPENDENTLY TOGGLEABLE): DUAL-TRACK 30-DAY PORTFOLIO */}
        {view.flags.thirtyDay && spec.thirtyDayPlugin && view.sectionByKey.thirtyDay && (
          <section id={view.sectionByKey.thirtyDay.id} data-optional-plugin="thirtyDay" className="space-y-4">
            <div className={`${styles.sectionHead} space-y-1`}>
              <div className={`${styles.badgeRoleB} inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold`}>
                {spec.thirtyDayPlugin.badge}
              </div>
              <h2 className="text-xl font-bold sm:text-2xl">{view.sectionByKey.thirtyDay.heading}</h2>
              <p className="text-sm text-[var(--mc-muted)]">
                <strong className="text-[var(--mc-text)]">{ui.oneLineConclusion}</strong>
                {spec.thirtyDayPlugin.summary}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {spec.thirtyDayPlugin.tracks.map((track) => (
                <div
                  key={track.id}
                  className={`${track.tone === "roleA" ? styles.tintRoleA : styles.tintRoleB} ${styles.printKeep} space-y-3 rounded-2xl p-5`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-base font-bold">{track.title}</h3>
                    <span
                      className={`${
                        track.tone === "roleA" ? styles.badgeRoleA : styles.badgeRoleB
                      } rounded-full px-2 py-1 text-xs font-medium`}
                    >
                      {track.badge}
                    </span>
                  </div>
                  <ul className="space-y-2 text-xs leading-6 text-[var(--mc-muted)] sm:text-sm">
                    {track.weeks.map((w) => {
                      const text =
                        view.flags.ai && w.deliverableWhenAiEnabled ? w.deliverableWhenAiEnabled : w.deliverable;
                      return (
                        <li key={w.weekLabel}>
                          <strong className="text-[var(--mc-text)]">{w.weekLabel}{ui.colon}</strong>
                          {text}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* CORE MODULE 5A: UNIFIED NON-MIXED JD & WORK-CONDITION CHECKLIST */}
        {view.sectionByKey.checklist && (
          <section id={view.sectionByKey.checklist.id} className="space-y-4">
            <div className={`${styles.sectionHead} space-y-1`}>
              <h2 className="text-xl font-bold sm:text-2xl">{view.sectionByKey.checklist.heading}</h2>
              <p className="text-sm text-[var(--mc-muted)]">
                <strong className="text-[var(--mc-text)]">{ui.oneLineConclusion}</strong>
                {spec.checklist.summary}
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-[var(--mc-border)] bg-[var(--mc-card)] p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <fieldset className={`${styles.printKeep} space-y-3 rounded-xl border border-[var(--mc-border)] bg-[var(--mc-surface)] p-4`}>
                  <legend className="px-1 text-xs font-bold text-[var(--mc-text)]">{spec.checklist.skillsHeading}</legend>
                  {spec.checklist.skillsOptions.map((opt) => (
                    <label key={opt.id} className="flex cursor-pointer items-start gap-3 text-xs leading-5 sm:text-sm">
                      <input
                        type="checkbox"
                        checked={selectedSkills.includes(opt.id)}
                        onChange={() => toggleSelection(opt.id, selectedSkills, setSelectedSkills)}
                        data-checklist-skill={opt.id}
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--mc-role-a)]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </fieldset>

                <fieldset className={`${styles.printKeep} space-y-3 rounded-xl border border-[var(--mc-border)] bg-[var(--mc-surface)] p-4`}>
                  <legend className="px-1 text-xs font-bold text-[var(--mc-text)]">
                    {spec.checklist.conditionsHeading}
                  </legend>
                  {spec.checklist.conditionsOptions.map((opt) => (
                    <label key={opt.id} className="flex cursor-pointer items-start gap-3 text-xs leading-5 sm:text-sm">
                      <input
                        type="checkbox"
                        checked={selectedConditions.includes(opt.id)}
                        onChange={() => toggleSelection(opt.id, selectedConditions, setSelectedConditions)}
                        data-checklist-condition={opt.id}
                        className="mt-1 h-4 w-4 shrink-0 accent-[var(--mc-role-b)]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </fieldset>
              </div>

              {/* 3 Independent Non-Mixed Output Panels */}
              <div
                aria-live="polite"
                data-checklist-output="three-column"
                className={`${styles.printKeep} grid grid-cols-1 gap-3 md:grid-cols-3`}
              >
                <div className="space-y-2 rounded-xl border border-[var(--mc-border)] bg-[var(--mc-surface)] p-4 text-xs">
                  <div className="font-bold text-[var(--mc-role-a)]">{ui.checklistCol1Title}</div>
                  {checklistReadout.skillItems.length === 0 ? (
                    <p className="text-[var(--mc-muted)]">{ui.checklistCol1Empty}</p>
                  ) : (
                    <ul className="list-disc space-y-1 pl-4 text-[var(--mc-text)]">
                      {checklistReadout.skillItems.map((item) => (
                        <li key={item.id}>{item.summary}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2 rounded-xl border border-[var(--mc-border)] bg-[var(--mc-surface)] p-4 text-xs">
                  <div className="font-bold text-[var(--mc-role-b)]">{ui.checklistCol2Title}</div>
                  {checklistReadout.conditionItems.length === 0 ? (
                    <p className="text-[var(--mc-muted)]">{ui.checklistCol2Empty}</p>
                  ) : (
                    <ul className="list-disc space-y-1 pl-4 text-[var(--mc-text)]">
                      {checklistReadout.conditionItems.map((item) => (
                        <li key={item.id}>{item.summary}</li>
                      ))}
                    </ul>
                  )}
                </div>

                <div className="space-y-2 rounded-xl border border-[var(--mc-border)] bg-[var(--mc-surface)] p-4 text-xs">
                  <div className="font-bold text-[var(--mc-bridge)]">{ui.checklistCol3Title}</div>
                  <ul className="list-disc space-y-1 pl-4 text-[var(--mc-muted)]">
                    {checklistReadout.interviewQuestions.map((q) => (
                      <li key={q}>{q}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {checklistReadout.hasCrossTrack && (
                <div
                  data-checklist-cross-track="true"
                  className={`${styles.tintWarn} rounded-xl px-4 py-3 text-xs leading-6 text-[var(--mc-text)] sm:text-sm`}
                >
                  {spec.checklist.crossTrackNote}
                </div>
              )}

              <p className="text-xs text-[var(--mc-muted)]">{spec.checklist.offlinePrintHint}</p>
            </div>
          </section>
        )}

        {/* CORE MODULE 5B: SINGLE-SOURCE DESKTOP EXERCISE */}
        {view.sectionByKey.trial && (
          <section id={view.sectionByKey.trial.id} className="space-y-4">
            <div className={`${styles.sectionHead} space-y-1`}>
              <h2 className="text-xl font-bold sm:text-2xl">{view.sectionByKey.trial.heading}</h2>
              <p className="text-sm text-[var(--mc-muted)]">
                <strong className="text-[var(--mc-text)]">{ui.oneLineConclusion}</strong>
                {desktopExercise.summary}
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-[var(--mc-border)] bg-[var(--mc-card)] p-4 sm:p-5">
              <div className="space-y-2 text-xs leading-6 text-[var(--mc-muted)] sm:text-sm">
                <div>
                  <strong className="text-[var(--mc-text)]">
                    {formatInlineLabel(desktopExercise.publicLinksHeading ?? ui.exercisePublicLinksDefault, ui.colon)}
                  </strong>
                  {desktopExercise.publicLinks.map((link, idx) => (
                    <span key={link.href}>
                      {idx > 0 && " · "}
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-[var(--mc-role-a)] underline underline-offset-2"
                      >
                        {link.label}
                      </a>
                    </span>
                  ))}
                </div>
                {(desktopExercise.factSummarySegments?.length || desktopExercise.factSummary) && (
                  <p>
                    <strong className="text-[var(--mc-text)]">
                      {formatInlineLabel(desktopExercise.factSummaryHeading ?? ui.exerciseFactSummaryDefault, ui.colon)}
                    </strong>
                    {desktopExercise.factSummarySegments?.length
                      ? desktopExercise.factSummarySegments.map(({ text, tone }, index) => {
                          if (tone === "strong") return <strong key={index} className="text-[var(--mc-text)]">{text}</strong>;
                          if (tone === "code") return <code key={index}>{text}</code>;
                          return text;
                        })
                      : factParagraphs[0]}
                  </p>
                )}
                {!desktopExercise.factSummarySegments?.length && factParagraphs.slice(1).map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="grid grid-cols-1 gap-3 text-xs sm:text-sm md:grid-cols-2">
                <div className={`${styles.tintRoleA} ${styles.printKeep} space-y-2 rounded-xl p-4`}>
                  <div className="font-bold text-[var(--mc-role-a)]">{desktopExercise.taskA.title}</div>
                  <p className="leading-6 text-[var(--mc-muted)]">{desktopExercise.taskA.instruction}</p>
                </div>
                <div className={`${styles.tintRoleB} ${styles.printKeep} space-y-2 rounded-xl p-4`}>
                  <div className="font-bold text-[var(--mc-role-b)]">{desktopExercise.taskB.title}</div>
                  <p className="leading-6 text-[var(--mc-muted)]">{desktopExercise.taskB.instruction}</p>
                </div>
              </div>

              <details
                open
                className={`${styles.detailsReset} ${styles.printAllowBreak} rounded-xl border border-[var(--mc-border)] bg-[var(--mc-surface)] p-4`}
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-xs font-semibold sm:text-sm">
                  <span>{desktopExercise.rubricTitle}</span>
                  <span className={`${styles.chev} text-[var(--mc-muted)]`} aria-hidden="true">
                    ▾
                  </span>
                </summary>
                <div className="mt-3 space-y-3 text-xs leading-6 text-[var(--mc-muted)] sm:text-sm">
                  <div className={`${styles.printKeep} space-y-2`}>
                    <div className="font-semibold text-[var(--mc-text)]">
                      {ui.exerciseRubricRuleWrap(
                        desktopExercise.rubricHeading ?? ui.exerciseRubricHeadingDefault(desktopExercise.rubricItems.length),
                        desktopExercise.rubricPassRule
                      )}
                    </div>
                    <ul className="space-y-1 pl-1">
                      {desktopExercise.rubricItems.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={`${styles.printKeep} rounded-lg border border-[var(--mc-border)] bg-[var(--mc-card)] p-4 text-xs leading-6`}>
                    <strong className="text-[var(--mc-text)]">
                      {formatInlineLabel(desktopExercise.sampleAnswerALabel ?? ui.exerciseSampleAnswerDefault(desktopExercise.taskA.title), ui.colon)}
                    </strong>
                    {desktopExercise.sampleAnswerA}
                  </div>
                  <div className={`${styles.printKeep} rounded-lg border border-[var(--mc-border)] bg-[var(--mc-card)] p-4 text-xs leading-6`}>
                    <strong className="text-[var(--mc-text)]">
                      {formatInlineLabel(desktopExercise.sampleAnswerBLabel ?? ui.exerciseSampleAnswerDefault(desktopExercise.taskB.title), ui.colon)}
                    </strong>
                    {desktopExercise.sampleAnswerB}
                  </div>
                </div>
              </details>
            </div>
          </section>
        )}

        {/* CORE MODULE 5C: SINGLE-PURPOSE TOOL ROUTING (NO DOUBLE-TESTING PUSH) */}
        {view.sectionByKey.tools && (
          <section id={view.sectionByKey.tools.id} className={`${styles.printKeep} space-y-4`}>
            <div className={`${styles.sectionHead} space-y-1`}>
              <h2 className="text-xl font-bold sm:text-2xl">{view.sectionByKey.tools.heading}</h2>
              <p className="text-sm text-[var(--mc-muted)]">{spec.tools.summary}</p>
            </div>

            <div
              data-tools-grid
              className={`grid grid-cols-1 gap-4 ${spec.tools.cards.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2"}`}
            >
              {spec.tools.cards.map((card) => {
                const badgeClass =
                  card.tone === "roleA"
                    ? styles.badgeRoleA
                    : card.tone === "roleB"
                      ? styles.badgeRoleB
                      : card.tone === "accent"
                        ? styles.badgeWarn
                        : styles.badgeBridge;
                return (
                  <Link
                    key={card.id}
                    href={card.href}
                    className={`${styles.printKeep} group flex flex-col justify-between gap-3 rounded-2xl border border-[var(--mc-border)] bg-[var(--mc-card)] p-4 transition hover:border-[var(--mc-role-a)]`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-2 text-xs">
                        <span className={`${badgeClass} rounded-full px-2 py-1 font-semibold`}>{card.badge}</span>
                        <span className="text-[var(--mc-muted)]">{card.meta}</span>
                      </div>
                      <h3 className="text-base font-bold transition group-hover:text-[var(--mc-role-a)]">{card.title}</h3>
                      <p className="text-xs leading-5 text-[var(--mc-muted)]">{card.description}</p>
                      <p className="text-xs font-medium text-[var(--mc-text)]">{card.purposeHint}</p>
                    </div>
                    <span className="text-xs font-semibold text-[var(--mc-role-a)]">{card.ctaLabel}</span>
                  </Link>
                );
              })}
            </div>

            <div className={`${styles.printKeep} flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-[var(--mc-border)] bg-[var(--mc-card)] px-4 py-3 text-xs sm:text-sm`}>
              <span className="font-semibold text-[var(--mc-muted)]">{spec.tools.profileLinksLabel}</span>
              {spec.tools.profileLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="font-medium text-[var(--mc-role-a)] underline underline-offset-2"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* CORE MODULE 5D: PLUGIN-AWARE DIRECT-ANSWER FAQS */}
        {view.sectionByKey.faq && (
          <section id={view.sectionByKey.faq.id} data-fixed-comparison-faq className="space-y-4">
            <div className={`${styles.sectionHead} space-y-1`}>
              <h2 className="text-xl font-bold sm:text-2xl">{view.sectionByKey.faq.heading}</h2>
              <p className="text-sm text-[var(--mc-muted)]">
                {ui.faqSubtitle}
              </p>
            </div>

            <div className="space-y-3">
              {view.faqs.map((faq, idx) => (
                <details
                  key={faq.id}
                  open
                  className={`${styles.detailsReset} ${styles.printKeep} rounded-xl border border-[var(--mc-border)] bg-[var(--mc-card)] p-4`}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-4 text-sm font-semibold">
                    <span>
                      {idx + 1}. {faq.question}
                    </span>
                    <span className={`${styles.chev} text-[var(--mc-muted)]`} aria-hidden="true">
                      ▾
                    </span>
                  </summary>
                  <p className="mt-2 text-xs leading-6 text-[var(--mc-muted)] sm:text-sm">{faq.answer}</p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* CORE MODULE 5E: PLUGIN-AWARE VERIFIED AUTHORITATIVE SOURCES */}
        <footer className="border-t border-[var(--mc-border)] pt-4">
          <details
            open
            className={`${styles.detailsReset} ${styles.printKeep} rounded-xl border border-[var(--mc-border)] bg-[var(--mc-card)] p-4`}
          >
            <summary className="flex cursor-pointer items-center justify-between gap-4 text-xs font-semibold sm:text-sm">
              <span>{ui.sourcesFooterHeading(spec.dateModified)}</span>
              <span className={`${styles.chev} text-[var(--mc-muted)]`} aria-hidden="true">
                ▾
              </span>
            </summary>
            <div className="mt-3 space-y-2 text-xs leading-6 text-[var(--mc-muted)]">
              {view.sourceGroups.map((group) => (
                <p key={group.id} data-source-group={group.id}>
                  <strong className="text-[var(--mc-text)]">{group.title}{ui.colon}</strong>
                  {group.links.map((link, idx) => (
                    <span key={link.href}>
                      {idx > 0 && " · "}
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--mc-role-a)] underline underline-offset-2"
                      >
                        {link.label}
                      </a>
                      {link.note ? ui.sourceNoteWrap(link.note) : ""}
                    </span>
                  ))}
                </p>
              ))}
            </div>
          </details>
        </footer>
      </article>
    </main>
  );
}
