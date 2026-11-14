"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import { Compass, GitMerge, ScrollText } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buildRiasecTakeHref } from "@/lib/riasec/forms";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import {
  getRenderableRiasecDeepContentSlots,
  getRiasecModuleVisibility,
  type RiasecDeepContentSlot,
  type RiasecModuleVisibility,
  type RiasecResultViewModel,
} from "@/lib/riasec/resultAssembler";
import {
  formatDeepContentKey,
  formatRiasecDetailValue,
  sanitizeRiasecRenderableText as clean,
} from "./readingContent";
import styles from "./RiasecReadingReport.module.css";
import { RiasecExploration } from "./RiasecExploration";
import { RiasecCareerNextSteps } from "./RiasecCareerNextSteps";

type Props = {
  viewModel: RiasecResultViewModel;
  locale: Locale;
  displayLocale?: DisplayLocale;
  actions: ReactNode;
  emailRecovery?: ReactNode;
};
const COLORS: Record<string, string> = {
  R: "#547886",
  I: "#7563a8",
  A: "#b45b79",
  S: "#398276",
  E: "#a97632",
  C: "#5777a3",
};
const INTEREST_ART: Record<string, string> = {
  R: "/images/riasec/realistic.webp",
  I: "/images/riasec/ias-researcher.webp",
  A: "/images/riasec/artistic.webp",
  S: "/images/riasec/social.webp",
  E: "/images/riasec/enterprising.webp",
  C: "/images/riasec/conventional.webp",
};
const ANCHORS = {
  overview: "riasec-overview",
  dimensions: "riasec-dimensions",
  combinations: "riasec-combinations",
  activities: "riasec-activities",
  context: "riasec-context",
  career: "riasec-career-next",
  action: "riasec-action-plan",
  methods: "riasec-methods",
  contextual: "riasec-contextual-clues",
};

export function RiasecReadingReport({
  viewModel: vm,
  locale,
  displayLocale = locale,
  actions,
  emailRecovery,
}: Props) {
  const zh = locale === "zh";
  const t = (cn: string, en: string) => (zh ? cn : en);
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);
  const [activeSection, setActiveSection] = useState<string>(ANCHORS.overview);
  const [selected, setSelected] = useState(
    vm.primaryType || vm.dimensions[0]?.code || "",
  );
  const visibility = (key: string) => getRiasecModuleVisibility(vm, key);
  const mapState = visibility("six_dimension_map");
  // Validated slots have their own backend visibility contract. Older envelopes
  // may omit a module entry; an explicit module policy still takes precedence.
  const slotState = (slot: RiasecDeepContentSlot) =>
    vm.moduleVisibilityPolicy?.modules.find(
      (module) => module.key === slot.moduleKey,
    )?.visibility ?? slot.slotVisibility;
  const slots = getRenderableRiasecDeepContentSlots(vm).filter(
    (slot) => slotState(slot) !== "hidden",
  );
  const dimensionSlots = slots.filter(
    (slot) => slot.slotKey === "dimension_deep_copy",
  );
  const combinationSlots = slots.filter(
    (slot) => slot.slotKey === "pair_blend_copy" || (!zh && slot.slotKey === "triad_blend_copy"),
  );
  const contextSlots = slots.filter(
    (slot) => slot.moduleKey === "140q_context_cards",
  );
  const ctaSlots = slots.filter((slot) => slot.moduleKey === "140q_cta");
  const qualityState = vm.trustedResultCard?.qualityState ?? "";
  const disagreeSlots =
    !zh && vm.resultLocale === "en" && ["normal", "caution"].includes(qualityState) &&
    vm.interpretationState?.readingStrength !== "retake_recommended"
      ? slots.filter((slot) =>
          slot.slotKey === "disagree_path_copy" &&
          slot.slotGroup === "feedback_response_copy" &&
          slot.moduleKey === "disagree_path" &&
          ["user_not_wrong_message", "feedback_no_mutation_boundary", "next_step"].includes(slot.state.slot_name) &&
          slot.locale === "en" &&
          slot.applicability.formCodes.includes(vm.formCode ?? "") &&
          slot.applicability.qualityStates.includes(qualityState) &&
          slot.applicability.profileShapes.includes(vm.interpretationState?.profileShape ?? "") &&
          clean(slot.content.title) && clean(slot.content.summary) &&
          clean(slot.boundaries.userVisibleBoundary),
        )
      : [];
  const nearTieState = vm.interpretationState?.nearTieState.state ?? "";
  const alternate = vm.interpretationState?.alternateCode;
  const tieDisplay = vm.interpretationState?.tieDisplay;
  const nearTieReady = ["top1_top2_near_tie", "top2_top3_near_tie", "multi_near_tie"].includes(nearTieState) &&
    (!alternate?.show || (tieDisplay?.kind === "near_tie" && tieDisplay.position === nearTieState &&
      alternate.codes.length === tieDisplay.alternateCodes.length &&
      alternate.codes.every((code, index) => code === tieDisplay.alternateCodes[index])));
  const nearTieSlots =
    !zh && vm.resultLocale === "en" && ["normal", "caution"].includes(qualityState) && nearTieReady &&
    vm.interpretationState?.readingStrength !== "retake_recommended"
      ? slots.filter((slot) =>
          slot.slotKey === "near_tie_alternate_code_copy" &&
          slot.slotGroup === "interpretation_state_copy" &&
          slot.moduleKey === "result_reading_boundary" &&
          (slot.state.slot_name === nearTieState || (slot.state.slot_name === "alternate_code_available" && alternate?.show)) &&
          slot.state.near_tie_copy_state === slot.state.slot_name &&
          slot.locale === "en" &&
          slot.applicability.formCodes.includes(vm.formCode ?? "") &&
          slot.applicability.qualityStates.includes(qualityState) &&
          slot.applicability.profileShapes.includes(vm.interpretationState?.profileShape ?? "") &&
          clean(slot.content.title) && clean(slot.content.summary) &&
          clean(slot.boundaries.userVisibleBoundary),
        )
      : [];
  const aspirationsSlots =
    !zh && vm.resultLocale === "en" && ["normal", "caution"].includes(qualityState) &&
    vm.interpretationState?.readingStrength !== "retake_recommended"
      ? slots.filter((slot) =>
          slot.slotKey === "aspirations_calibration_copy" &&
          slot.slotGroup === "aspirations_copy" &&
          slot.moduleKey === "aspirations_calibration" &&
          ["intro", "input_boundary", "no_score_mutation_boundary"].includes(slot.state.slot_name) &&
          slot.state.aspirations_state === "not_provided" &&
          slot.locale === "en" &&
          slot.applicability.formCodes.includes(vm.formCode ?? "") &&
          slot.applicability.qualityStates.includes(qualityState) &&
          slot.applicability.profileShapes.includes(vm.interpretationState?.profileShape ?? "") &&
          clean(slot.content.title) && clean(slot.content.summary) &&
          clean(slot.boundaries.userVisibleBoundary),
        )
      : [];
  const lifecycle = !zh && vm.lifecycleCopy?.status === "available" ? vm.lifecycleCopy : null;
  const dimension =
    vm.dimensions.find((item) => item.code === selected) ||
    vm.dimensions.find((item) => item.code === vm.primaryType) ||
    vm.dimensions[0];
  const selectedSlot = dimensionSlots.find(
    (slot) => slot.selection?.dimensionCode === dimension?.code,
  );
  const summary = vm.resultSummary;
  const usePortraitLayout = displayLocale === "zh" && vm.formCode === "riasec_60";
  const tieNote = summary?.tieNote || vm.interpretationState?.tieDisplay?.note;
  const activityState = visibility("activity_explorer");
  const hasActivities = activityState !== "hidden";
  const contextState = visibility("140q_context_cards");
  const hasContext =
    vm.formCode === "riasec_140" &&
    contextState !== "hidden" &&
    (contextSlots.length > 0 ||
      Object.values(vm.enhancedBreakdown).some(
        (values) => Object.keys(values).length > 0,
      ));
  const topCodes = vm.topCode.slice(0, 3).split("");
  const comparableTie = tieDisplay && tieDisplay.kind !== "none" && tieDisplay.dimensions.length > 1;
  const desktopContent = usePortraitLayout && mapState !== "hidden" &&
    (!comparableTie || tieDisplay.dimensions.every(code => topCodes.includes(code)))
    ? slots.find(slot =>
        slot.slotKey === "triad_blend_copy" && slot.moduleKey === "hero_activity_chain" &&
        slot.slotVisibility === "visible" && slotState(slot) === "visible" &&
        slot.applicability.dimensions.length === 3 &&
        topCodes.every(code => slot.applicability.dimensions.includes(code)),
      )?.content
    : undefined;
  const desktopFocus = desktopContent && !comparableTie
    ? clean(dimensionSlots.find(slot => slot.selection?.dimensionCode === vm.primaryType)?.content.atlas_profile_focus)
    : "";
  const comparisonCodes = new Set([...topCodes, ...(comparableTie ? tieDisplay.dimensions : [])]);
  const workPairs = combinationSlots.filter(slot => {
    const codes = slot.applicability.dimensions;
    return codes.length === 2
      && codes.every(code => comparisonCodes.has(code))
      && Boolean(clean(slot.content.work_division_scene) || clean(slot.content.positive_value) || clean(slot.content.real_world_cost));
  });
  const showWorkCombination = usePortraitLayout && mapState !== "hidden" && workPairs.length > 0;
  const trialDimensions = comparableTie && tieDisplay.dimensions.includes(vm.primaryType)
    ? tieDisplay.dimensions
    : [vm.primaryType];
  const trialTasks = usePortraitLayout && activityState === "visible" &&
    vm.activityExplorer?.codeActivityPack.status === "available"
    ? trialDimensions.slice(0, 3).flatMap((code) => {
        const trial = vm.activityExplorer?.codeActivityPack.activities.find((activity) =>
          activity.riasecDimensions.includes(code) && clean(activity.activityLabel) && clean(activity.taskExamples[0]));
        const label = vm.dimensions.find((item) => item.code === code)?.label;
        return trial && label ? [{ code, label, title: clean(trial.activityLabel), task: clean(trial.taskExamples[0]) }] : [];
      })
    : [];
  const hasReadingDetails = !usePortraitLayout
    && Boolean(combinationSlots.length || hasActivities || lifecycle || dimensionSlots.length);
  const chapters = [
    ...(mapState !== "hidden"
      ? [{ id: ANCHORS.overview, label: t("兴趣总览", "Overview") }]
      : []),
    ...(usePortraitLayout && dimensionSlots.length ? [{ id: ANCHORS.dimensions, label: "六维解读" }] : []),
    { id: ANCHORS.career, label: displayLocale === "zh-TW" ? "職涯探索" : t("职业探索", "Career exploration") },
    ...(showWorkCombination ? [{ id: ANCHORS.combinations, label: "工作分工" }] : []),
    ...(usePortraitLayout && mapState !== "hidden" ? [{ id: ANCHORS.action, label: "验证职业方向" }] : []),
    ...(hasContext
      ? [{ id: ANCHORS.context, label: t("工作偏好", "Work preferences") }]
      : []),
  ];
  const chapterKey = chapters.map((chapter) => chapter.id).join(",");

  useEffect(() => {
    const root = rootRef.current;
    const nav = navRef.current;
    if (!root || !nav) return;
    const header = document.querySelector<HTMLElement>("[data-site-header]");
    let frame = 0;
    const update = () => {
      const headerHeight = header?.getBoundingClientRect().height ?? 0;
      const offset = headerHeight + 24;
      root.style.setProperty("--report-header-height", `${headerHeight}px`);
      root.style.setProperty("--report-nav-height", "0px");
      const ids = chapterKey.split(",");
      let active = ids[0];
      for (const id of ids) {
        const element = document.getElementById(id);
        if (element && element.getClientRects().length > 0 && element.getBoundingClientRect().top <= offset + 48)
          active = id;
      }
      setActiveSection(active);
      if (insightRef.current) {
        insightRef.current.dataset.sticky = String(
          insightRef.current.getBoundingClientRect().height <
            window.innerHeight - offset - 24,
        );
      }
    };
    const schedule = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(update);
    };
    const observer =
      typeof ResizeObserver !== "undefined"
        ? new ResizeObserver(schedule)
        : null;
    observer?.observe(root);
    observer?.observe(nav);
    if (header) observer?.observe(header);
    if (insightRef.current) observer?.observe(insightRef.current);
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    update();
    return () => {
      observer?.disconnect();
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [chapterKey]);

  useEffect(() => {
    const previous = new Map<HTMLDetailsElement, boolean>();
    const expand = () => {
      rootRef.current?.querySelectorAll("details").forEach((detail) => {
        previous.set(detail, detail.open);
        detail.open = true;
      });
    };
    const restore = () => {
      previous.forEach((open, detail) => {
        detail.open = open;
      });
      previous.clear();
    };
    window.addEventListener("beforeprint", expand);
    window.addEventListener("afterprint", restore);
    return () => {
      window.removeEventListener("beforeprint", expand);
      window.removeEventListener("afterprint", restore);
    };
  }, []);

  const insight = (
    <DimensionInsight
      dimension={dimension}
      mapState={mapState}
      selectedSlot={selectedSlot}
      slotState={selectedSlot ? slotState(selectedSlot) : "hidden"}
      tieNote={tieNote}
      locale={locale}
    />
  );

  const dimensionChapter = dimensionSlots.length ? (
    <section id={ANCHORS.dimensions} className={styles.chapter}>
      {usePortraitLayout ? (
        <details className={styles.dimensionAtlas} open>
          <summary><h2>六维解读</h2></summary>
          <div className={styles.dimensionEntries}>
            {dimensionSlots.map(slot => (
              <DimensionAtlasCard
                key={slot.slotId}
                slot={slot}
                state={slotState(slot)}
                dimension={vm.dimensions.find(item => item.code === slot.selection?.dimensionCode)}
              />
            ))}
          </div>
        </details>
      ) : (
        <>
          <h2>{t("六维解读", "Explore your dimensions")}</h2>
          {mapState !== "hidden" ? (
            <div className={styles.dimensionTabs} aria-label={t("选择维度洞察", "Select a dimension insight")}>
              {vm.dimensions.map(item => (
                <button key={item.code} type="button" aria-pressed={dimension?.code === item.code}
                  aria-controls="riasec-selected-insight" onClick={() => setSelected(item.code)}>
                  {item.code} · {item.label}
                </button>
              ))}
            </div>
          ) : null}
          <div>
            {dimensionSlots.map(slot => (
              <ContentCard key={slot.slotId} slot={slot} state={slotState(slot)} zh={zh} />
            ))}
          </div>
        </>
      )}
    </section>
  ) : null;

  const careerTitle = displayLocale === "zh-TW" ? "值得探索的職涯" : t("值得探索的职业", "Careers worth exploring");
  const careerContent = (
    <RiasecCareerNextSteps
      locale={locale}
      displayLocale={displayLocale}
      scores={mapState !== "hidden" && vm.scoreKind === "dimension_scores_0_100"
        && qualityState === "normal" && vm.interpretationState?.readingStrength !== "retake_recommended" ? vm.dimensions : undefined}
      structured={usePortraitLayout}
      careerLens={clean(desktopContent?.desktop_career_lens)}
      tieDimensions={mapState !== "hidden" && qualityState === "normal" && tieDisplay?.kind !== "none" ? tieDisplay?.dimensions : undefined}
    />
  );
  const careerChapter = (
    <section id={ANCHORS.career} className={styles.chapter}>
      {usePortraitLayout ? (
        <details open className={styles.careerPanel}>
          <summary><h2>{careerTitle}</h2></summary>
          <div className={styles.careerPanelBody}>{careerContent}</div>
        </details>
      ) : <><h2>{careerTitle}</h2>{careerContent}</>}
    </section>
  );

  return (
    <div
      ref={rootRef}
      className={usePortraitLayout ? `${styles.report} ${styles.portraitReport}` : styles.report}
      data-testid="riasec-reading-report"
      data-riasec-source-hash={vm.authority?.sourceHash}
      data-riasec-compiled-hash={vm.authority?.compiledHash}
      data-riasec-display-copy-revision={vm.displayCopy?.revision}
      data-riasec-display-copy-source={vm.displayCopy?.approvedSourceHash}
    >
      <ReportHeader
        vm={vm}
        locale={locale}
        actions={actions}
        emailRecovery={emailRecovery}
        usePortraitLayout={usePortraitLayout}
        workScene={desktopContent ? (
          <section className={styles.workScene}>
            <h3>{clean(desktopContent.desktop_headline)}</h3>
            {desktopFocus ? <p>{desktopFocus}</p> : null}
            <p>{clean(desktopContent.desktop_scene)}</p>
            {desktopContent.desktop_hero_job_tip ? <p>{clean(desktopContent.desktop_hero_job_tip)}</p> : null}
          </section>
        ) : undefined}
      />

      <div className={styles.grid} data-testid="riasec-deep-report">
        <div className={styles.main}>
          <div className={styles.overview}>
            <DimensionChart
              vm={vm}
              mapState={mapState}
              selected={dimension?.code}
              onSelect={setSelected}
              locale={locale}
              showRadar={usePortraitLayout}
            />
            {!usePortraitLayout && mapState !== "hidden" ? (
              <details className="mt-3">
                <summary className="cursor-pointer text-sm">{t("查看所选维度解读", "Read about the selected dimension")}</summary>
                {insight}
              </details>
            ) : null}
          </div>
          <div
            className={styles.body}
            data-testid={slots.length ? "riasec-deep-content-slots" : undefined}
          >
            {usePortraitLayout ? dimensionChapter : null}
            {careerChapter}
            {hasContext ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {([
                  [t("工作环境偏好", "Work environment interests"), vm.enhancedBreakdown.environment],
                  [t("工作角色偏好", "Work role interests"), vm.enhancedBreakdown.role],
                ] as const).map(([label, values]) => Object.keys(values).length ? (
                  <section key={label} className="rounded-lg border bg-white p-4">
                    <h3 className="font-semibold">{label}</h3>
                    <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                      {Object.entries(values).filter(([, value]) => Number.isFinite(value)).map(([code, value]) => (
                        <div key={code} className="flex justify-between gap-2">
                          <dt>{vm.dimensions.find(item => item.code === code)?.label ?? code}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>
                ) : null)}
              </div>
            ) : null}
            <RiasecExploration locale={locale} showPreferences={hasContext} />
            {showWorkCombination ? (
              <ReportTailChapter id={ANCHORS.combinations} title="你在工作中更想做哪一段"
                icon={<GitMerge size={17} />} tone="work" open={workPairs.some(slot => slotState(slot) === "visible")}>
                <p className={styles.tailIntro}>一个项目里，有人梳理问题，有人把方案做出来，也有人接手交付。比较岗位时，先看你想反复做的那一段，再看你能参与到哪一步。</p>
                {comparableTie ? <p className={styles.tailTie}>
                  {tieDisplay.dimensions.map(code => vm.dimensions.find(item => item.code === code)?.label ?? code).join("、")}
                  {tieDisplay.kind === "exact_tie" ? "本次得分相同，可以一起比较对应的工作任务。" : "本次得分接近，可以一起比较对应的工作任务。"}
                </p> : null}
                <div className={styles.tailScenarios}>
                  {workPairs.map(slot => {
                    const dimensions = slot.applicability.dimensions.flatMap(code => vm.dimensions.filter(item => item.code === code));
                    const title = dimensions.map(item => item.label).join(" × ") || clean(slot.content.pair_label);
                    const taskFamilies = activityState === "visible"
                      ? dimensions.map(item => clean(vm.activityExplorer?.dimensionActivityFamilies
                          .find(entry => entry.dimension === item.code)?.activityFamilies[0])).filter(Boolean)
                      : [];
                    const authored = {
                      focus: clean(slot.content.work_division_scene),
                      handoff: clean(slot.content.work_division_tradeoff),
                      question: clean(slot.content.work_division_question),
                    };
                    const example = authored.focus && authored.handoff && authored.question ? authored : null;
                    const body = <>
                      {taskFamilies.length === 2 ? (
                        <ul className={styles.tailTags} aria-label="可比较的任务">
                          {taskFamilies.map((task, index) => <li key={dimensions[index].code}>{task}</li>)}
                        </ul>
                      ) : null}
                      {example ? <>
                        <p className={styles.tailPairCopy}>{example.focus}</p>
                        <dl className={styles.tailPairDetails}>
                          <div><dt>工作取舍</dt><dd>{example.handoff}</dd></div>
                          <div><dt>看岗时可以问</dt><dd>{example.question}</dd></div>
                        </dl>
                      </> : <>
                        {clean(slot.content.positive_value) ? <p className={styles.tailPairCopy}>{clean(slot.content.positive_value)}</p> : null}
                        <dl className={styles.tailPairDetails}>
                          {clean(slot.content.real_world_cost) ? <div><dt>选岗时留意</dt>
                            <dd>{clean(slot.content.real_world_cost).replace(/^现实条件提醒[：:]\s*/, "")}</dd>
                          </div> : null}
                          {taskFamilies.length === 2 ? <div><dt>看岗时可以问</dt>
                            <dd>上个项目中，{taskFamilies[0]}和{taskFamilies[1]}各由谁负责？这个岗位亲自完成哪一段，要把什么交给下一个人？</dd>
                          </div> : null}
                        </dl>
                      </>}
                    </>;
                    return slotState(slot) === "visible" ? (
                      <article className={styles.tailCard} key={slot.slotId}><h3>{title}</h3>{body}</article>
                    ) : (
                      <details className={styles.tailCard} key={slot.slotId}><summary>{title}</summary>{body}</details>
                    );
                  })}
                </div>
              </ReportTailChapter>
            ) : null}
            {hasReadingDetails ? (
              <details className={styles.chapter}>
                <summary className="cursor-pointer font-semibold">
                  {t("更多兴趣解读和活动", "More interest insights and activities")}
                </summary>
                {dimensionChapter}
                {combinationSlots.length ? (
                  <section id={ANCHORS.combinations} className={styles.chapter}>
                    <h2>{t("组合探索", "Explore combinations")}</h2>
                    {combinationSlots.map(slot => (
                      <ContentCard key={slot.slotId} slot={slot} state={slotState(slot)} zh={zh} />
                    ))}
                  </section>
                ) : null}
                {hasActivities ? (
                  <section
                    id={ANCHORS.activities}
                    className={styles.chapter}
                    data-testid="riasec-governed-copy-surface"
                  >
                    <h2>{t("职业活动探索", "Career activity explorer")}</h2>
                    <div className={styles.disclosureBody}>
                      <div data-testid="riasec-activity-families">
                        {vm.activityExplorer?.dimensionActivityFamilies.map(
                          (family) => (
                            <article
                              key={family.dimension}
                              className={styles.contentCard}
                            >
                              <h3>
                                {family.dimension} · {clean(family.label)}
                              </h3>
                              <p>{clean(family.coreDrive)}</p>
                            </article>
                          ),
                        )}
                      </div>
                      <div data-testid="riasec-activity-pack">
                        {vm.activityExplorer?.codeActivityPack.activities.map(
                          (activity) => (
                            <article
                              key={activity.activityKey}
                              className={styles.contentCard}
                            >
                              <h3>{clean(activity.activityLabel)}</h3>
                              <p>{clean(activity.activityUserCopy)}</p>
                              <h4>{t("任务例子", "Task examples")}</h4>
                              <ul>
                                {activity.taskExamples
                                  .map(formatRiasecDetailValue)
                                  .filter(Boolean)
                                  .map((item) => (
                                    <li key={item}>{item}</li>
                                  ))}
                              </ul>
                              {Object.keys(activity.actionDurationOptions ?? {}).length ? (
                                <div data-testid="riasec-activity-duration-options">
                                  <h4>{t("可选试做时长", "Optional time plans")}</h4>
                                  <dl>
                                    {Object.entries(activity.actionDurationOptions ?? {}).map(([duration, text]) => (
                                      <div key={duration}>
                                        <dt>{({ "15min": t("15 分钟", "15 minutes"), "30min": t("30 分钟", "30 minutes"), "2h": t("2 小时", "2 hours"), "1week": t("1 周", "1 week") } as Record<string, string>)[duration]}</dt>
                                        <dd>{clean(text)}</dd>
                                      </div>
                                    ))}
                                  </dl>
                                </div>
                              ) : null}
                              {visibility("occupation_examples") !== "hidden" &&
                              activity.occupationExamples.length ? (
                                <div data-testid="riasec-occupation-examples">
                                  {activity.occupationExamples.map((example) => (
                                    <article key={example.occupationExample}>
                                      <h4>{clean(example.occupationExample)}</h4>
                                      <p>{clean(example.displayLabel)}</p>
                                      <ul>
                                        {example.commonTasks
                                          .map(formatRiasecDetailValue)
                                          .filter(Boolean)
                                          .map((item) => (
                                            <li key={item}>{item}</li>
                                          ))}
                                      </ul>
                                      <p>{example.skillsToCheck.map(clean).filter(Boolean).join(" · ")}</p>
                                      {[example.educationBoundary, example.skillBoundary, example.qualificationBoundary, example.localizationNote].map(clean).filter(Boolean).map(text => <p key={text}>{text}</p>)}
                                    </article>
                                  ))}
                                </div>
                              ) : null}
                            </article>
                          ),
                        )}
                      </div>
                      {!vm.activityExplorer?.codeActivityPack.activities.length ? (
                        <p data-testid="riasec-governed-copy-empty">
                          {t(
                            "当前结果没有可渲染的后端活动内容。",
                            "No backend-governed activity content is available for this result.",
                          )}
                        </p>
                      ) : null}
                    </div>
                  </section>
                ) : null}
                {!zh && (contextSlots.length || ctaSlots.length) ? (
                  <section id={ANCHORS.contextual} className={styles.chapter}>
                    <h2>{t("情境线索", "Contextual clues")}</h2>
                    {[...contextSlots, ...ctaSlots].map(slot => <ContentCard key={slot.slotId} slot={slot} state={slotState(slot)} zh={zh} />)}
                  </section>
                ) : null}
                {lifecycle ? (
                  <section id={ANCHORS.methods} className={styles.chapter} data-testid="riasec-selected-method-copy">
                    <h2>Methods and questions</h2>
                    {lifecycle.technicalSections?.map((section, index) => (
                      <article className={styles.contentCard} key={`technical-${index}`} data-testid="riasec-technical-section">
                        <h3>{section.title}</h3><p>{section.copy}</p>
                        <p>Evidence status: unknown</p>
                      </article>
                    ))}
                    {lifecycle.methodSections?.map(section => <article className={styles.contentCard} key={section.key} data-testid="riasec-method-section"><h3>{section.title}</h3><p>{section.body}</p></article>)}
                    {[...(lifecycle.methodBoundaries ?? []), ...(lifecycle.disclaimers ?? [])].map((note, index) => <article className={styles.contentCard} key={`boundary-${index}`} data-testid="riasec-method-boundary"><h3>{note.label}</h3><p>{note.copy}</p></article>)}
                    {lifecycle.surfaces.map(surface => <p key={surface.surface}>{surface.copy}</p>)}
                    <h3>Frequently asked questions</h3>
                    {lifecycle.faqItems.map((item, index) => <details className={styles.contentCard} key={index} data-testid="riasec-faq-item"><summary>{item.q}</summary><p>{item.a}</p></details>)}
                  </section>
                ) : null}
              </details>
            ) : null}
            {nearTieSlots.length ? (
              <div className={styles.chapter} data-testid="riasec-neartie-reading">
                {nearTieSlots.map((slot) => (
                  <ContentCard key={slot.slotId} slot={slot} state={slotState(slot)} zh={zh} />
                ))}
              </div>
            ) : null}
            {aspirationsSlots.length ? (
              <div className={styles.chapter} data-testid="riasec-aspirations-reading">
                {aspirationsSlots.map((slot) => (
                  <ContentCard key={slot.slotId} slot={slot} state={slotState(slot)} zh={zh} />
                ))}
              </div>
            ) : null}
            {disagreeSlots.length ? (
              <div className={styles.chapter} data-testid="riasec-disagree-reading">
                {disagreeSlots.map((slot) => (
                  <ContentCard key={slot.slotId} slot={slot} state={slotState(slot)} zh={zh} />
                ))}
              </div>
            ) : null}
            {usePortraitLayout && mapState !== "hidden" ? (
              <>
                <ReportTailChapter id={ANCHORS.action} title="怎么验证一个职业方向"
                  icon={<Compass size={17} />} tone="action" open>
                  <p className={styles.tailIntro}>先用下面四步，把两条看起来都不错的路，缩到一个值得继续了解的方向。</p>
                  <ol className={styles.tailSteps}>
                    <li className={styles.tailCard}>
                      <span className={styles.tailStepNumber} aria-hidden="true">1</span>
                      <div>
                        <span className={styles.tailTime}>今天</span>
                        <h3>用两份招聘说明缩小范围</h3>
                        <p>从职业候选里挑两个方向，各找一份同地区、经验要求相近的招聘说明。{desktopContent ? clean(desktopContent.desktop_screen) : "把每周反复做的事、要交的成果和必须满足的条件各挑一条。先圈出你愿意反复做的任务，再标出眼下最难满足的门槛。"}</p>
                        <a href={`#${ANCHORS.career}`} onClick={() => {
                          const list = rootRef.current?.querySelector<HTMLDetailsElement>(`#${ANCHORS.career} > details`);
                          if (list) list.open = true;
                        }}>回到职业探索 ↑</a>
                      </div>
                    </li>
                    <li className={styles.tailCard}>
                      <span className={styles.tailStepNumber} aria-hidden="true">2</span>
                      <div>
                        <span className={styles.tailTime}>这周</span>
                        <h3>请从业者讲一个真实项目</h3>
                        <ul className={styles.tailQuestions}>
                          <li>你们最近一位新人独立交付的第一样东西是什么？</li>
                          <li>{desktopContent ? clean(desktopContent.desktop_question) : "在那个项目里，哪一步最花时间？最常因为什么返工？"}</li>
                          <li>入行时，你们最看重哪一种证明？能举一个过关的例子吗？</li>
                        </ul>
                        <p>把答案和招聘说明对照一次。尤其留意你最期待做的那部分，新人是亲手做、只负责配合，还是很少接触。</p>
                      </div>
                    </li>
                    <li className={styles.tailCard}>
                      <span className={styles.tailStepNumber} aria-hidden="true">3</span>
                      <div>
                        <span className={styles.tailTime}>接下来两周 · 可选</span>
                        <h3>试一次最常做的任务</h3>
                        <p>挑一个候选岗位里反复出现的任务，用公开或模拟材料试一次。涉及专业资质或现场操作时，可以先看公开的工作演示，留意新人需要自己完成哪些环节。</p>
                        {desktopContent ? <p>{clean(desktopContent.desktop_trial)}</p> : trialTasks.length ? (
                          <ul className={styles.tailQuestions} aria-label="按本次兴趣选出的试做示例">
                            {trialTasks.map((trial) => (
                              <li key={trial.code}><strong>{trial.label} · {trial.title}：</strong>{trial.task}</li>
                            ))}
                          </ul>
                        ) : null}
                        <a href="/resources/riasec/fermatmind-career-exploration-zh.pdf">下载职业探索工作表 PDF</a>
                      </div>
                    </li>
                    <li className={styles.tailCard}>
                      <span className={styles.tailStepNumber} aria-hidden="true">4</span>
                      <div>
                        <span className={styles.tailTime}>两周后</span>
                        <h3>决定继续、换一种岗位，还是暂缓</h3>
                        <p>{desktopContent ? clean(desktopContent.desktop_decision) : "如果愿意反复做核心任务，且入行条件有办法满足，就挑一个岗位继续了解。喜欢任务但接受不了工作环境，可以找同类任务在另一种团队里的岗位。最吸引你的工作在新人阶段很少做时，先比较另一个方向。"}</p>
                        <p className={styles.tailActionOutcome}>离开这页时，可以先定下一件事。找一份更接近目标的招聘说明、联系一位从业者，或确认一项入行要求。</p>
                      </div>
                    </li>
                  </ol>
                </ReportTailChapter>
                <section id={ANCHORS.methods} className={`${styles.chapter} ${styles.tailChapter}`}
                  data-tone="method" aria-labelledby="riasec-methods-title">
                  <header className={styles.tailHeader}>
                    <span className={styles.tailIcon} aria-hidden="true"><ScrollText size={17} /></span>
                    <h2 id="riasec-methods-title">测评方法与科学依据</h2>
                  </header>
                  <div className={styles.tailBody}>
                    <dl className={styles.tailMethods}>
                      <div><dt>六维分数怎么得出</dt><dd>60 道题记录你对不同工作活动的喜好，按霍兰德六类职业兴趣分别汇总，再换算为 0–100 分。分数相同的维度并列阅读，分数接近时可以一起比较。</dd></div>
                      <div><dt>职业候选怎么选出</dt><dd>有可用的职业候选时，报告按你的六维兴趣分布与美国 O*NET 职业兴趣资料的相似程度列出候选。相似度用于探索岗位，不代表能力、入行资格或录用概率。</dd></div>
                    </dl>
                    <Link href="/zh/science">查看费马测评方法 →</Link>
                  </div>
                </section>
              </>
            ) : null}
            {emailRecovery ? (
              <section id="riasec-email-recovery" className={styles.chapter}>
                {emailRecovery}
              </section>
            ) : null}
          </div>
        </div>
        <div
          ref={insightRef}
          className={styles.sidebar}
          data-testid="riasec-report-sidebar"
        >
          {usePortraitLayout ? insight : null}
          <ReportNavigation
            navRef={navRef}
            chapters={chapters}
            activeSection={activeSection}
            onSelect={setActiveSection}
            locale={locale}
          />
        </div>
      </div>
    </div>
  );
}

function ReportTailChapter({
  id, title, icon, tone, children, open,
}: {
  id: string;
  title: string;
  icon: ReactNode;
  tone: "work" | "action";
  children: ReactNode;
  open?: boolean;
}) {
  return <section id={id} className={styles.chapter}>
    <details className={styles.tailChapter} data-tone={tone} open={open}>
      <summary className={styles.tailHeader}>
        <span className={styles.tailIcon} aria-hidden="true">{icon}</span>
        <h2>{title}</h2>
      </summary>
      <div className={styles.tailBody}>{children}</div>
    </details>
  </section>;
}

function Disclosure({
  state,
  title,
  boundary,
  children,
  className = "",
}: {
  state: RiasecModuleVisibility;
  title: ReactNode;
  boundary?: string;
  children: ReactNode;
  className?: string;
}) {
  if (state === "hidden") return null;
  return (
    <div className={`${styles.disclosure} ${className}`}>
      {boundary ? <p className={styles.boundary}>{clean(boundary)}</p> : null}
      <details open={state === "visible"}>
        <summary>{title}</summary>
        <div className={styles.disclosureBody}>{children}</div>
      </details>
    </div>
  );
}

function DimensionAtlasCard({
  slot,
  state,
  dimension,
}: {
  slot: RiasecDeepContentSlot;
  state: RiasecModuleVisibility;
  dimension?: RiasecResultViewModel["dimensions"][number];
}) {
  if (state === "hidden" || !slot.selection) return null;
  const { content, selection } = slot;
  const atlasReading = clean(content.atlas_reading);
  const bandAction = clean(content.atlas_next_step);
  const conditions = bandAction ? "" : clean(content.real_world_cost);
  const action = bandAction || clean(content.action_advice);
  const activityExamples = content.atlas_examples ?? content.work_activity_examples;
  const examples = Array.isArray(activityExamples)
    ? activityExamples.map(formatRiasecDetailValue).filter(Boolean).slice(0, 4)
    : [];
  const title = dimension?.label || clean(content.title) || selection.dimensionCode;
  const score = dimension && dimension.scoreAvailable !== false
    ? Math.max(0, Math.min(100, dimension.score))
    : null;

  return (
    <article
      id={`riasec-reading-${selection.dimensionCode}`}
      className={styles.dimensionEntry}
      style={{
        "--interest-score": `${score ?? 0}%`,
        "--dimension-color": COLORS[selection.dimensionCode] || COLORS.R,
      } as CSSProperties}
      data-testid="riasec-deep-content-slot"
    >
      <header className={styles.atlasCardHeader}>
        <span className={styles.atlasRing} aria-hidden="true">{title[0]}</span>
        <div>
          <h3>{title}</h3>
          {score !== null ? <span className={styles.atlasScore}>{score} 分</span> : null}
        </div>
      </header>
      {score !== null ? <div className={styles.atlasMeter} aria-hidden="true" /> : null}
      <div className={styles.atlasCopy}>
        {atlasReading ? <p>{atlasReading}</p> : <DimensionReading slot={slot} locale="zh" />}
      </div>
      {examples.length || conditions || action ? (
        <div className={styles.atlasPanels}>
          {examples.length ? <div className={styles.atlasExamples}>
            <h4>活动示例</h4>
            <ul>{examples.map(example => <li key={example}>{example}</li>)}</ul>
          </div> : null}
          {conditions || action ? <div className={styles.atlasNext}>
            <h4>下一步</h4>
            <ul>
              {action ? <li>{action}</li> : null}
              {conditions ? <li>{conditions}</li> : null}
            </ul>
          </div> : null}
        </div>
      ) : null}
    </article>
  );
}

function ContentCard({
  slot,
  state,
  zh,
}: {
  slot: RiasecDeepContentSlot;
  state: RiasecModuleVisibility;
  zh: boolean;
}) {
  if (state === "hidden") return null;
  const content = slot.content;
  const title =
    clean(content.title || content.pair_label || content.short_label) ||
    (zh ? "深入阅读" : "Further reading");
  if (["disagree_path_copy", "aspirations_calibration_copy", "near_tie_alternate_code_copy"].includes(slot.slotKey) && state === "collapsed") {
    return (
      <details className={`${styles.contentCard} ${styles.disclosure}`} data-testid="riasec-deep-content-slot">
        <summary><h3 className={styles.contentTitle}>{title}</h3></summary>
        <div className={styles.disclosureBody}>
          <p>{clean(content.summary)}</p>
          <p className={styles.boundary}>{slot.boundaries.userVisibleBoundary}</p>
        </div>
      </details>
    );
  }
  if (slot.slotKey === "near_tie_alternate_code_copy") {
    return (
      <article className={styles.contentCard} data-testid="riasec-deep-content-slot">
        <h3 className={styles.contentTitle}>{title}</h3>
        <p>{clean(content.summary)}</p>
        <p className={styles.boundary}>{slot.boundaries.userVisibleBoundary}</p>
      </article>
    );
  }
  return (
    <article
      className={styles.contentCard}
      id={slot.slotKey === "dimension_deep_copy" && slot.selection?.dimensionCode ? `riasec-reading-${slot.selection.dimensionCode}` : undefined}
      data-dimension={slot.selection?.dimensionCode}
      style={{ "--dimension-color": COLORS[slot.selection?.dimensionCode || ""] } as CSSProperties}
      data-testid="riasec-deep-content-slot"
    >
      <h3 className={styles.contentTitle}>
        {slot.selection?.dimensionCode ? <span className={styles.dimensionMark} aria-hidden="true">{slot.selection.dimensionCode}</span> : null}
        {title}
      </h3>
      {clean(content.summary) ? <p>{clean(content.summary)}</p> : null}
      {slot.boundaries.userVisibleBoundary ? (
        <p className={styles.boundary}>{slot.boundaries.userVisibleBoundary}</p>
      ) : null}
      <div className={styles.disclosureBody}>
        <div id={`riasec-slot-${slot.slotId.replace(/[^a-zA-Z0-9_-]/g, "-")}`}>
          {clean(content.body) ? <p>{clean(content.body)}</p> : null}
          {Object.entries(content)
            .filter(([key]) => !["title", "summary", "body"].includes(key))
            .map(([key, value]) => {
              if (!zh && key === "button_label" && slot.slotKey === "140q_cta_copy" && typeof value === "string") {
                return <Link key={key} href={buildRiasecTakeHref(SCALE_CANONICAL_SLUG_MAP.RIASEC, "en", "riasec_140")}>{value}</Link>;
              }
              const label = formatDeepContentKey(key, zh);
              const values = (Array.isArray(value) ? value : [value])
                .map(formatRiasecDetailValue)
                .filter(Boolean);
              if (!label || !values.length) return null;
              return (
                <section key={key} className={styles.detail} data-field={key}>
                  <h4>{label}</h4>
                  {Array.isArray(value) ? (
                    <ul>
                      {values.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  ) : (
                    <p>{values[0]}</p>
                  )}
                </section>
              );
            })}
        </div>
      </div>
    </article>
  );
}

function ReportHeader({
  vm,
  locale,
  actions,
  emailRecovery,
  usePortraitLayout,
  workScene,
}: Omit<Props, "viewModel"> & {
  vm: RiasecResultViewModel;
  usePortraitLayout: boolean;
  workScene?: ReactNode;
}) {
  const t = (cn: string, en: string) => (locale === "zh" ? cn : en);
  const summary = vm.resultSummary;
  const tieNote = summary?.tieNote || vm.interpretationState?.tieDisplay?.note;
  // The snapshot-bound result summary is a separate backend projection.
  // Activity-chain visibility only governs the legacy hero fallback.
  const heroState = summary
    ? "visible"
    : getRiasecModuleVisibility(vm, "hero_activity_chain");
  const caution = vm.trustedResultCard
    ? vm.trustedResultCard.qualityState !== "normal"
    : vm.qualityGrade !== "A" || vm.qualityFlags.length > 0;
  const primary = vm.dimensions.find(item => item.code === vm.primaryType && item.scoreAvailable !== false);
  const tieDisplay = vm.interpretationState?.tieDisplay;
  const dimensionsAtTop = primary ? vm.dimensions.filter(item => item.scoreAvailable !== false && item.score === primary.score) : [];
  const firstPlacesAreClose = tieDisplay?.kind === "near_tie" && tieDisplay.dimensions.includes(vm.primaryType);
  const broadProfile = vm.interpretationState?.profileShape === "broad_profile";
  const showSingleInterest = dimensionsAtTop.length === 1 && !firstPlacesAreClose && !broadProfile;
  const showPortrait = usePortraitLayout && Boolean(primary) && heroState === "visible" && !caution
    && vm.scoreKind === "dimension_scores_0_100"
    && vm.interpretationState?.readingStrength !== "retake_recommended";
  const interestArt = showSingleInterest && primary ? INTEREST_ART[primary.code] : undefined;
  const highlightCodes = summary?.highlights.map(item => item.dimensionCode) ?? [];
  const interestCodes = [...new Set([...highlightCodes, ...(tieDisplay?.dimensions ?? [])])];
  const rankedInterests = interestCodes.flatMap(code => {
    const dimension = vm.dimensions.find(item => item.code === code && item.scoreAvailable !== false);
    return dimension ? [dimension] : [];
  });
  return (
    <header
      className={showPortrait ? `${styles.hero} ${styles.portraitHero}` : styles.hero}
      data-testid="riasec-trusted-result-card"
      data-riasec-source-hash={vm.authority?.sourceHash}
      data-riasec-compiled-hash={vm.authority?.compiledHash}
      data-riasec-display-copy-revision={vm.displayCopy?.revision}
      data-riasec-display-copy-source={vm.displayCopy?.approvedSourceHash}
    >
      <div className={styles.titleRow}>
        <div>
          <h1>
            {t("霍兰德职业兴趣报告", "Your Holland Career Interest Report")}
          </h1>
        </div>
        <div className={styles.tools}>
          {actions}
          {emailRecovery ? (
            <a href="#riasec-email-recovery">{t("保存结果", "Save result")}</a>
          ) : null}
        </div>
      </div>
      {heroState !== "hidden" ? (
        <SummaryContent state={heroState} locale={locale}>
          <div data-testid="riasec-result-summary" className={showPortrait ? styles.portraitLayout : undefined}>
            {showPortrait ? <div className={styles.portraitLead}>
              <p className={styles.portraitLabel}>{showSingleInterest ? "你的主要职业兴趣" : "你的职业兴趣轮廓"}</p>
              <h2>{showSingleInterest ? primary?.label : broadProfile ? "多方面兴趣" : dimensionsAtTop.length > 1 ? "多项兴趣并列" : "前列兴趣接近"}</h2>
              <Image
                className={styles.interestArt}
                src={interestArt ?? "/images/riasec/ai-career-interests.webp"}
                width={interestArt ? 350 : 480}
                height={interestArt ? 350 : 320}
                sizes="(max-width: 639px) 75vw, 280px"
                alt=""
              />
            </div> : null}
            <div className={showPortrait ? styles.rankingPanel : undefined}>
              <div className={styles.summaryIntro}>
                <span>{t("本次兴趣重点", "Your interest pattern")}</span>
                <strong>{summary?.rankingDisplay || vm.interpretationState?.tieDisplay?.headline || vm.topCode}</strong>
                {tieNote ? <p>{tieNote}</p> : null}
                {vm.interpretationState?.tieDisplay?.alternateCodes.length ? (
                  <p>{t("可同时参考的阅读顺序", "Additional reading order")}: {vm.interpretationState.tieDisplay.alternateCodes.join(" / ")}</p>
                ) : null}
                {vm.interpretationState?.tieDisplay?.boundary && vm.interpretationState.tieDisplay.boundary !== summary?.boundary ? (
                  <p>{vm.interpretationState.tieDisplay.boundary}</p>
                ) : null}
              </div>
              {showPortrait && rankedInterests.length > 0 ? (
                <ul className={styles.heroInterests}>
                  {rankedInterests.map(item => <li key={item.code}>
                    <div><strong>{item.code} · {item.label}</strong><span>{item.score}</span></div>
                  </li>)}
                </ul>
              ) : null}
              {showPortrait && workScene ? workScene : summary?.highlights.length && (!showPortrait || showSingleInterest) ? (
                <p className={styles.summaryNext}>{
                  (showPortrait ? summary.highlights.filter(item => item.dimensionCode === primary?.code) : summary.highlights).map(item => item.text).join(" ")
                }</p>
              ) : null}
              {!(showPortrait && workScene) && summary?.boundary ? (
                <p className={styles.summaryNext} data-testid="riasec-result-boundary">{summary.boundary}</p>
              ) : null}
              {showPortrait ? (
                <p className={workScene ? styles.summaryNext : "mt-2 text-[13px] leading-relaxed"}>
                  {workScene
                    ? "这份霍兰德报告帮你看清了自己喜欢做什么，而这只是职业拼图的第一块。接下来，推荐你体验 "
                    : "想进一步了解自己偏好的工作环境和团队角色，可以做 140 题的 "}
                  <Link
                    className={styles.enhancedTestLink}
                    href={buildRiasecTakeHref(SCALE_CANONICAL_SLUG_MAP.RIASEC, locale, "riasec_140")}
                  >
                    {workScene ? "费马职业测试（140 题）→" : "费马综合职业测试 →"}
                  </Link>
                  {workScene ? "，它会将你的职业兴趣与工作风格、看重的工作条件及现有经验结合起来，对照上千种职业，帮你直接比较出值得优先考虑的方向。" : null}
                </p>
              ) : null}
            </div>
          </div>
        </SummaryContent>
      ) : null}
      {caution && (summary?.qualitySummary || vm.qualityDisplay) ? (
        <div
          className={styles.caution}
          data-testid="riasec-quality-display"
        >
          <strong>{t("作答质量", "Response quality")}</strong> ·{" "}
          {summary?.qualitySummary || vm.qualityDisplay?.headline}
          {vm.qualityDisplay ? (
            <>
              <h3>{t("为什么会有这条提示", "Why this note appears")}</h3>
              <ul>
                {vm.qualityDisplay.reasons.map((reason) => (
                  <li key={reason}>{reason}</li>
                ))}
              </ul>
              <h3>
                {t("如何让下次结果更稳定", "How to improve a future result")}
              </h3>
              <ul>
                {vm.qualityDisplay.improvements.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <p>{vm.qualityDisplay.readingBoundary}</p>
            </>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}

function SummaryContent({
  state,
  locale,
  children,
}: {
  state: RiasecModuleVisibility;
  locale: Locale;
  children: ReactNode;
}) {
  if (state === "visible") return <>{children}</>;
  return (
    <Disclosure
      state={state}
      title={locale === "zh" ? "查看阅读重点" : "View reading highlights"}
    >
      {children}
    </Disclosure>
  );
}

function ReportNavigation({
  navRef,
  chapters,
  activeSection,
  onSelect,
  locale,
}: {
  navRef: Ref<HTMLElement>;
  chapters: { id: string; label: string }[];
  activeSection: string;
  onSelect: (id: string) => void;
  locale: Locale;
}) {
  const t = (cn: string, en: string) => (locale === "zh" ? cn : en);
  return (
    <nav
      ref={navRef}
      className={styles.navigation}
      aria-label={t("报告章节", "Report sections")}
    >
      {chapters.map((chapter) => (
        <a
          key={chapter.id}
          href={`#${chapter.id}`}
          aria-current={activeSection === chapter.id ? "location" : undefined}
          onClick={() => onSelect(chapter.id)}
        >
          {chapter.label}
        </a>
      ))}
    </nav>
  );
}

function InterestRadar({ dimensions }: { dimensions: RiasecResultViewModel["dimensions"] }) {
  const ordered = Object.keys(COLORS).map(code => dimensions.find(item => item.code === code));
  if (ordered.some(item => !item || item.scoreAvailable === false || !Number.isFinite(item.score))) return null;

  const coordinates = (score: number, index: number) => {
    const angle = index * Math.PI / 3 - Math.PI / 2;
    const radius = 0.72 * score;
    return [100 + Math.cos(angle) * radius, 100 + Math.sin(angle) * radius] as const;
  };
  const points = (scores: number[]) => scores.map((score, index) => coordinates(score, index).join(",")).join(" ");

  return <svg viewBox="0 0 200 200" className={styles.interestRadar} aria-hidden="true">
    {[25, 50, 75, 100].map(level => <polygon key={level} points={points(ordered.map(() => level))} fill="none" stroke="#cfddd8" />)}
    {ordered.map((axis, index) => {
      const [x, y] = coordinates(100, index);
      const [labelX, labelY] = coordinates(124, index);
      return <g key={axis?.code}>
        <line x1="100" y1="100" x2={x} y2={y} stroke="#cfddd8" />
        <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="central" fill="#35534f" fontSize="13" fontWeight="600">{axis?.code}</text>
      </g>;
    })}
    <polygon points={points(ordered.map(item => Math.max(0, Math.min(100, item?.score ?? 0))))} fill="#398276" fillOpacity=".22" stroke="#398276" strokeWidth="2" />
  </svg>;
}

function DimensionChart({
  vm,
  mapState,
  selected,
  onSelect,
  locale,
  showRadar,
}: {
  vm: RiasecResultViewModel;
  mapState: RiasecModuleVisibility;
  selected?: string;
  onSelect: (code: string) => void;
  locale: Locale;
  showRadar: boolean;
}) {
  const t = (cn: string, en: string) => (locale === "zh" ? cn : en);
  return mapState !== "hidden" ? (
    <section
      id={ANCHORS.overview}
      className={styles.chapter}
      data-testid="riasec-six-dimension-map"
    >
      <h2>{t("六维兴趣地图", "Your broad interests")}</h2>
      <p>{vm.scoreKind === "dimension_scores_0_100" ? t("单位：0–100兴趣维度分，不是人群百分位、能力或职业适配百分比。", "Units: 0–100 interest dimension scores, not population percentiles, ability or career-fit percentages.") : t("分数单位未提供，不推断百分位或职业适配程度。", "Score units were not provided; do not infer percentiles or career fit.")}</p>
      <div className={showRadar ? styles.chartLayout : undefined}>
        {showRadar && vm.scoreKind === "dimension_scores_0_100" ? <InterestRadar dimensions={vm.dimensions} /> : null}
        <div className={styles.bars}>
          {vm.dimensions.map((item) => (
            <button
              type="button"
              key={item.code}
              className={styles.barRow}
              aria-pressed={selected === item.code}
              aria-controls="riasec-selected-insight"
              onMouseEnter={() => onSelect(item.code)}
              onClick={() => onSelect(item.code)}
              data-testid={`riasec-dimension-${item.code}`}
              style={
                {
                  "--dimension-color": COLORS[item.code] || COLORS.R,
                } as CSSProperties
              }
            >
              <span className={styles.dimensionBadge}>{item.code}</span>
              <span className={styles.dimensionLabel}>{item.label}</span>
              <span className={styles.track}>
                <span
                  style={{
                    width: item.scoreAvailable === false ? "0%" : `${Math.max(0, Math.min(100, item.score))}%`,
                  }}
                />
              </span>
              <span className={styles.number}>{item.scoreAvailable === false ? t("未知", "Unknown") : item.score}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  ) : null;
}

function DimensionReading({ slot, locale }: { slot: RiasecDeepContentSlot; locale: Locale }) {
  const { content, selection } = slot;
  const definition = clean(content.core_drive || content.body || content.summary);
  const reading = selection ? clean(content[selection.selectedDetailKey]) : "";
  return (
    <>
      {slot.boundaries.userVisibleBoundary ? (
        <p className={styles.boundary}>{slot.boundaries.userVisibleBoundary}</p>
      ) : null}
      <p>{definition || (locale === "zh"
        ? "该维度暂无可展示的解读。"
        : "No interpretation is available for this dimension.")}</p>
      {reading && reading !== definition ? <p>{reading}</p> : null}
    </>
  );
}

function DimensionInsight({
  dimension,
  mapState,
  selectedSlot,
  slotState,
  tieNote,
  locale,
}: {
  dimension?: RiasecResultViewModel["dimensions"][number];
  mapState: RiasecModuleVisibility;
  selectedSlot?: RiasecDeepContentSlot;
  slotState: RiasecModuleVisibility;
  tieNote?: string;
  locale: Locale;
}) {
  const t = (cn: string, en: string) => (locale === "zh" ? cn : en);
  return dimension && mapState !== "hidden" ? (
    <aside
      className={styles.insight}
      data-testid="riasec-dimension-insight"
      id="riasec-selected-insight"
      aria-label={t("维度洞察", "Dimension insights")}
    >
      <h2>
        {dimension.code} · {dimension.label}
      </h2>
      <div className={styles.insightScore}>
        {dimension.scoreAvailable === false ? t("未知", "Unknown") : dimension.score}
        <span>{t("本次得分", "Your score")}</span>
      </div>
      {tieNote ? <p className={styles.tie}>{tieNote}</p> : null}
      {selectedSlot && slotState !== "hidden" ? (
        <div className={styles.insightReading}>
          {locale === "zh" && selectedSlot.content.desktop_insight_reading ? (
            <p>{clean(selectedSlot.content.desktop_insight_reading)}</p>
          ) : (
            <DimensionReading slot={selectedSlot} locale={locale} />
          )}
        </div>
      ) : (
        <p>
          {t(
            "该维度暂无可展示的解读。",
            "No interpretation is available for this dimension.",
          )}
        </p>
      )}
    </aside>
  ) : null;
}
