"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
  type Ref,
} from "react";
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
    (slot) => slot.slotKey === "pair_blend_copy",
  );
  const contextSlots = slots.filter(
    (slot) => slot.moduleKey === "140q_context_cards",
  );
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

  return (
    <div
      ref={rootRef}
      className={styles.report}
      data-testid="riasec-reading-report"
      data-riasec-source-hash={vm.authority?.sourceHash}
      data-riasec-compiled-hash={vm.authority?.compiledHash}
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
                          <h4>{t("任务例子", "Task examples")}</h4>
                          <ul>
                            {activity.taskExamples
                              .map(formatRiasecDetailValue)
                              .filter(Boolean)
                              .map((item) => (
                                <li key={item}>{item}</li>
                              ))}
                          </ul>
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
            <RiasecExploration
              locale={locale}
              showPreferences={hasContext}
            />
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
          <div data-testid="riasec-result-summary">
            <div className={styles.summaryIntro}>
              <span>{t("本次兴趣重点", "Your interest pattern")}</span>
              <strong>{summary?.rankingDisplay || vm.interpretationState?.tieDisplay?.headline || vm.topCode}</strong>
              {tieNote ? <p>{tieNote}</p> : null}
              {!summary && vm.interpretationState?.tieDisplay?.alternateCodes.length ? (
                <p>{t("可同时参考的阅读顺序", "Additional reading order")}: {vm.interpretationState.tieDisplay.alternateCodes.join(" / ")}</p>
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
          </div>
        </SummaryContent>
      ) : null}
      {caution && (summary?.qualitySummary || vm.qualityDisplay) ? (
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
                  width: `${Math.max(0, Math.min(100, item.score))}%`,
                }}
              />
            </span>
            <span className={styles.number}>{Math.round(item.score)}</span>
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
        {Math.round(dimension.score)}
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
