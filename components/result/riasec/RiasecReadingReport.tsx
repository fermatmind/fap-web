"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
import Link from "next/link";
import { buildRiasecTakeHref } from "@/lib/riasec/forms";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import type { Locale } from "@/lib/i18n/locales";
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
import { RiasecTrialRecord } from "./RiasecTrialRecord";

type Props = {
  viewModel: RiasecResultViewModel;
  locale: Locale;
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
const ANCHORS = {
  overview: "riasec-overview",
  dimensions: "riasec-dimensions",
  combinations: "riasec-combinations",
  activities: "riasec-activities",
  context: "riasec-context",
  career: "riasec-career-next",
  methods: "riasec-methods",
  contextual: "riasec-contextual-clues",
};

export function RiasecReadingReport({
  viewModel: vm,
  locale,
  actions,
  emailRecovery,
}: Props) {
  const zh = locale === "zh";
  const t = (cn: string, en: string) => (zh ? cn : en);
  const rootRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const insightRef = useRef<HTMLDivElement>(null);
  const exportPanelRef = useRef<HTMLElement | null>(null);
  const [hasExportPanel, setHasExportPanel] = useState(false);
  const [activeSection, setActiveSection] = useState<string>(ANCHORS.overview);
  const [selected, setSelected] = useState(
    vm.primaryType || vm.dimensions[0]?.code || "",
  );
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
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
  const chapters = [
    ...(mapState !== "hidden"
      ? [{ id: ANCHORS.overview, label: t("兴趣总览", "Overview") }]
      : []),
    ...(dimensionSlots.length
      ? [{ id: ANCHORS.dimensions, label: t("六维解读", "Dimensions") }]
      : []),
    ...(combinationSlots.length
      ? [{ id: ANCHORS.combinations, label: t("组合探索", "Combinations") }]
      : []),
    ...(hasActivities
      ? [{ id: ANCHORS.activities, label: t("活动建议", "Activities") }]
      : []),
    ...(hasContext
      ? [{ id: ANCHORS.context, label: t("工作偏好", "Work preferences") }]
      : []),
    ...(lifecycle ? [{ id: ANCHORS.methods, label: "Methods and questions" }] : []),
    { id: ANCHORS.career, label: t("职业探索", "Career exploration") },
  ];
  const chapterKey = chapters.map((chapter) => chapter.id).join(",");

  useEffect(() => {
    // Navigation only: facts and access remain owned by the shared consumer.
    exportPanelRef.current = rootRef.current?.closest("[data-result-visible-root]")
      ?.querySelector<HTMLElement>('[data-testid="result-export-panel"]') ?? null;
    setHasExportPanel(Boolean(exportPanelRef.current));
  }, [vm]);

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

  return (
    <div
      ref={rootRef}
      className={styles.report}
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
      />

      <div className={styles.grid} data-testid="riasec-deep-report">
        <div className={styles.main}>
          <DimensionChart
            vm={vm}
            mapState={mapState}
            selected={dimension?.code}
            tieNote={tieNote}
            onSelect={setSelected}
            locale={locale}
          />
          {hasExportPanel ? (
            <button type="button" className={styles.takeawayEntry} onClick={() => {
              const summary = exportPanelRef.current?.querySelector<HTMLElement>("summary");
              summary?.scrollIntoView({ block: "center" });
              summary?.focus({ preventScroll: true });
            }}>
              {t("带着结果，与 AI 继续聊", "Explore your results with AI")}
            </button>
          ) : null}
          <div
            className={styles.body}
            data-testid={slots.length ? "riasec-deep-content-slots" : undefined}
          >
            {dimensionSlots.length ? (
              <section id={ANCHORS.dimensions} className={styles.chapter}>
                <h2>{t("六维解读", "Explore your dimensions")}</h2>
                {mapState !== "hidden" ? (
                  <div
                    className={styles.dimensionTabs}
                    aria-label={t("选择维度洞察", "Select a dimension insight")}
                  >
                    {vm.dimensions.map((item) => (
                      <button
                        key={item.code}
                        type="button"
                        aria-pressed={dimension?.code === item.code}
                        aria-controls="riasec-selected-insight"
                        onClick={() => setSelected(item.code)}
                      >
                        {item.code} · {item.label}
                      </button>
                    ))}
                  </div>
                ) : null}
                {dimensionSlots.map((slot) => (
                  <ContentCard
                    key={slot.slotId}
                    slot={slot}
                    state={slotState(slot)}
                    zh={zh}
                  />
                ))}
              </section>
            ) : null}
            {combinationSlots.length ? (
              <section id={ANCHORS.combinations} className={styles.chapter}>
                <h2>{t("组合探索", "Explore combinations")}</h2>
                {combinationSlots.map((slot) => (
                  <ContentCard
                    key={slot.slotId}
                    slot={slot}
                    state={slotState(slot)}
                    zh={zh}
                  />
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
                          <label className={styles.activityChoice}>
                            <input type="checkbox" checked={selectedActivities.includes(activity.activityKey)} onChange={() => setSelectedActivities(previous => previous.includes(activity.activityKey) ? previous.filter(key => key !== activity.activityKey) : [...previous, activity.activityKey])} />
                            <span>{t("我愿意反复做或试做：", "I would repeat or try: ")}{clean(activity.activityLabel)}</span>
                          </label>
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
            <RiasecExploration
              locale={locale}
              showPreferences={hasContext}
            />
            <section id={ANCHORS.career} className={styles.chapter}>
              <h2>{t("从兴趣结果到职业探索", "From your interests to career exploration")}</h2>
              <RiasecCareerNextSteps locale={locale} />
              <RiasecTrialRecord locale={locale} activities={hasActivities ? (vm.activityExplorer?.codeActivityPack.activities ?? []).filter(activity => selectedActivities.includes(activity.activityKey)).map(activity => clean(activity.activityLabel)) : []} />
            </section>
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
          {activeSection !== ANCHORS.context ? insight : null}
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
}: Omit<Props, "viewModel"> & { vm: RiasecResultViewModel }) {
  const t = (cn: string, en: string) => (locale === "zh" ? cn : en);
  const summary = vm.resultSummary;
  const readableDimensions = getRenderableRiasecDeepContentSlots(vm).filter((slot) => {
    const policy = vm.moduleVisibilityPolicy?.modules.find((item) => item.key === slot.moduleKey);
    return slot.slotKey === "dimension_deep_copy" && (policy?.visibility || slot.slotVisibility) !== "hidden";
  });
  const tieNote = summary?.tieNote || vm.interpretationState?.tieDisplay?.note;
  // The snapshot-bound result summary is a separate backend projection.
  // Activity-chain visibility only governs the legacy hero fallback.
  const heroState = summary
    ? "visible"
    : getRiasecModuleVisibility(vm, "hero_activity_chain");
  const caution = vm.trustedResultCard
    ? vm.trustedResultCard.qualityState !== "normal"
    : vm.qualityGrade !== "A" || vm.qualityFlags.length > 0;
  return (
    <header
      className={styles.hero}
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
      <p className={styles.description} data-testid="riasec-form-version">
        {vm.formCode || t("题本未提供", "Form not provided")} · {vm.questionCount ?? t("题数未知", "Item count unknown")}{t("题", " items")} · {t("计分版本", "Score version")}: {vm.trustedResultCard?.scoreSpaceVersion || t("未提供", "not provided")}
      </p>
      {heroState !== "hidden" ? (
        <SummaryContent state={heroState} locale={locale}>
          <div data-testid="riasec-result-summary">
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
            <div className={styles.highlights}>
              {summary?.highlights.map((item) => (
                <section key={item.dimensionCode}>
                  <h2>{item.dimensionCode} · {item.label}</h2>
                  <p>{item.text}</p>
                  {readableDimensions.some((slot) => slot.selection?.dimensionCode === item.dimensionCode) ? (
                    <a href={`#riasec-reading-${item.dimensionCode}`}>{t("了解这个兴趣维度", "Explore this interest")} <span aria-hidden="true">↗</span></a>
                  ) : null}
                </section>
              ))}
              {!summary ? <p>{t("暂无可展示的后端阅读重点。", "No reading highlights are available.")}</p> : null}
            </div>
            <p className={styles.summaryNext}><strong>{t("下一步建议", "Your next step")}</strong>{" "}{summary?.nextStep || t("暂无可展示的后端下一步建议。", "No next-step guidance is available.")}</p>
            {summary?.boundary ? (
              <p className={styles.summaryNext} data-testid="riasec-result-boundary">
                {summary.boundary}
              </p>
            ) : null}
          </div>
        </SummaryContent>
      ) : null}
      {(summary?.qualitySummary || vm.qualityDisplay) ? (
        <div
          className={caution ? styles.caution : styles.quality}
          data-testid="riasec-quality-display"
        >
          <strong>{t("作答质量", "Response quality")}</strong> ·{" "}
          {summary?.qualitySummary || vm.qualityDisplay?.headline}
          {caution && vm.qualityDisplay ? (
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

function DimensionChart({
  vm,
  mapState,
  selected,
  tieNote,
  onSelect,
  locale,
}: {
  vm: RiasecResultViewModel;
  mapState: RiasecModuleVisibility;
  selected?: string;
  tieNote?: string;
  onSelect: (code: string) => void;
  locale: Locale;
}) {
  const t = (cn: string, en: string) => (locale === "zh" ? cn : en);
  return mapState !== "hidden" ? (
    <section
      id={ANCHORS.overview}
      className={styles.chapter}
      data-testid="riasec-six-dimension-map"
    >
      {tieNote ? <p className={styles.description}>{tieNote}</p> : null}
      <h2>{t("六维兴趣地图", "Your broad interests")}</h2>
      <p>{vm.scoreKind === "dimension_scores_0_100" ? t("单位：0–100兴趣维度分，不是人群百分位、能力或职业适配百分比；60与140题不作数值差比较。", "Units: 0–100 interest dimension scores, not population percentiles, ability or career-fit percentages. Do not compare numeric differences across the 60- and 140-item forms.") : t("分数单位未提供，不推断百分位或职业适配程度。", "Score units were not provided; do not infer percentiles or career fit.")}</p>
      <div className={styles.bars}>
        {vm.dimensions.map((item) => (
          <button
            type="button"
            key={item.code}
            className={styles.barRow}
            aria-pressed={selected === item.code}
            aria-controls="riasec-selected-insight"
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
    </section>
  ) : null;
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
          {selectedSlot.boundaries.userVisibleBoundary ? (
            <p className={styles.boundary}>{selectedSlot.boundaries.userVisibleBoundary}</p>
          ) : null}
          {clean(
            selectedSlot.content.core_drive ||
              selectedSlot.content.body ||
              selectedSlot.content.summary,
          ) ? (
            <p>
              {clean(
                selectedSlot.content.core_drive ||
                  selectedSlot.content.body ||
                  selectedSlot.content.summary,
              )}
            </p>
          ) : (
            <p>
              {t(
                "该维度暂无可展示的解读。",
                "No interpretation is available for this dimension.",
              )}
            </p>
          )}
          {selectedSlot.selection &&
          clean(
            selectedSlot.content[selectedSlot.selection.selectedDetailKey],
          ) ? (
            <p>
              {clean(
                selectedSlot.content[selectedSlot.selection.selectedDetailKey],
              )}
            </p>
          ) : null}
          {clean(selectedSlot.content.action_advice) ? (
            <>
              <h3>{t("下一步", "Next step")}</h3>
              <p>{clean(selectedSlot.content.action_advice)}</p>
            </>
          ) : null}
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
