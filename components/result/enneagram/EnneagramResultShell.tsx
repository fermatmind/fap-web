"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { CalendarDays, UserRound } from "lucide-react";
import {
  assignEnneagramObservation,
  fetchEnneagramObservation,
  submitEnneagramObservationDay3,
  submitEnneagramObservationDay7,
  type EnneagramObservationDay3Payload,
  type EnneagramObservationDay7Payload,
  type EnneagramObservationStateV1,
} from "@/lib/api/v0_3";
import { PdfDownloadButton } from "@/components/big5/pdf/PdfDownloadButton";
import { SectionRenderer } from "@/components/big5/report/SectionRenderer";
import { Alert } from "@/components/ui/alert";
import { buttonVariants } from "@/components/ui/button";
import type { AttemptReportAccessView } from "@/lib/access/unifiedAccess";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { buildEnneagramTakeHref } from "@/lib/enneagram/forms";
import type {
  EnneagramCanonicalSection,
  EnneagramResultViewModel,
} from "@/lib/enneagram/resultAssembler";
import type { Locale } from "@/lib/i18n/locales";
import styles from "./enneagramResult.module.css";

const CHAPTERS = [
  ["chapter-1", "01", "你的九型人格测试结果", "Your Enneagram test results"],
  ["chapter-2", "02", "理解你的核心模式", "Understanding your core pattern"],
  ["chapter-3", "03", "优势与容易付出的代价", "Strengths and their costs"],
  ["chapter-4", "04", "你在关系中的样子", "You in relationships"],
  ["chapter-5", "05", "你在工作中的样子", "You at work"],
  ["chapter-6", "06", "压力下的变化与恢复", "Stress, change and recovery"],
  ["chapter-7", "07", "接下来如何观察自己", "What to observe next"],
] as const;
const CHAPTER_SECTIONS: Record<string, string[]> = {
  "chapter-2": ["2.1", "2.2", "2.3", "2.4", "2.5", "2.6"],
  "chapter-3": ["3.1", "3.2", "3.3"],
  "chapter-4": ["4.1", "4.2", "4.3"],
  "chapter-5": ["5.1", "5.2", "5.3"],
  "chapter-6": ["6.1", "6.2", "6.3", "6.4", "6.5"],
};
const COLORS = [
  "#587aa0",
  "#a56b92",
  "#cc6c45",
  "#d4953f",
  "#839b54",
  "#3c907c",
  "#347da2",
  "#595e9c",
  "#7f628e",
];

function polarPoint(radius: number, angle: number) {
  const radians = ((angle - 90) * Math.PI) / 180;
  return { x: Math.cos(radians) * radius, y: Math.sin(radians) * radius };
}

function DistributionChart({
  viewModel,
  locale,
}: {
  viewModel: EnneagramResultViewModel;
  locale: Locale;
}) {
  const max = Math.max(
    ...viewModel.distribution.map((row) => row.scoreDisplay),
    1,
  );
  return (
    <figure className={styles.resultChart}>
      <div className={styles.polarChartWrap}>
        <svg
          viewBox="35 50 500 390"
          role="img"
          aria-labelledby="enneagram-chart-title enneagram-chart-description"
        >
          <title id="enneagram-chart-title">
            {locale === "zh"
              ? "九型完整相对分布"
              : "Full nine-type relative distribution"}
          </title>
          <desc id="enneagram-chart-description">
            {locale === "zh"
              ? "每个扇区的径向长度来自本次真实计分结果。"
              : "Each sector radius comes from this attempt's scored result."}
          </desc>
          <g transform="translate(285 285)">
            {viewModel.distribution.map((score, index) => {
              const radius = Math.max(24, (score.scoreDisplay / max) * 250);
              const start = polarPoint(radius, index * 40 + 0.5);
              const end = polarPoint(radius, (index + 1) * 40 - 0.5);
              const innerStart = polarPoint(3, index * 40 + 0.5);
              const innerEnd = polarPoint(3, (index + 1) * 40 - 0.5);
              const label = polarPoint(radius + 15, index * 40 + 20);
              return (
                <g key={score.typeId} className={styles.pieItem}>
                  <path
                    d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} L ${innerEnd.x} ${innerEnd.y} A 3 3 0 0 0 ${innerStart.x} ${innerStart.y} Z`}
                    fill={COLORS[index]}
                  >
                    <title>{`${score.typeId}: ${score.scoreDisplay}`}</title>
                  </path>
                  <text
                    transform={`translate(${label.x} ${label.y})`}
                    fill={COLORS[index]}
                    className={styles.chartLabel}
                  >
                    {score.typeId}
                  </text>
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      <figcaption className={styles.chartCaption}>
        {locale === "zh"
          ? "仅用于同一题型内的相对比较。"
          : "For relative comparison within this form only."}
      </figcaption>
    </figure>
  );
}

function Section({ section }: { section: EnneagramCanonicalSection }) {
  return (
    <section
      id={`section-${section.sectionId}`}
      data-section-id={section.sectionId}
      className={styles.reportSection}
    >
      <div className={styles.sectionNumber}>{section.sectionId}</div>
      <div className={styles.sectionBody}>
        <h3>{section.title}</h3>
        <p className={styles.lead}>{section.lead}</p>
        {section.paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <ul className={styles.pointList}>
          {section.points.map((point) => (
            <li key={point}>{point}</li>
          ))}
        </ul>
        {section.levels.length === 9 ? (
          <div className={styles.levels}>
            <ol>
              {section.levels.map((level) => (
                <li key={level.level}>
                  <span>{level.level}</span>
                  <p>
                    <strong>{level.title}</strong>
                    <br />
                    {level.description}
                    <br />
                    <em>{level.observationPrompt}</em>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        ) : null}
        <div className={styles.reflection} role="note">
          <strong>
            {section.sectionId === "6.4"
              ? "THEORY · NOT AN ASSIGNMENT"
              : "REFLECTION"}
          </strong>
          <p>{section.reflectionQuestion}</p>
        </div>
      </div>
    </section>
  );
}

function ObservationPanel({
  locale,
  attemptId,
  selectedActionId,
  state,
  loading,
  error,
  refresh,
}: {
  locale: Locale;
  attemptId: string;
  selectedActionId: string;
  state: EnneagramObservationStateV1 | null;
  loading: boolean;
  error: string | null;
  refresh: (next: EnneagramObservationStateV1 | null) => void;
}) {
  const isZh = locale === "zh";
  const [busy, setBusy] = useState(false);
  const [day3, setDay3] = useState<EnneagramObservationDay3Payload>({
    more_like: "unclear",
    evidence_sentence: "",
    confidence_self_rating: 3,
    scene_type: "other",
  });
  const [day7, setDay7] = useState<EnneagramObservationDay7Payload>({
    final_resonance: "still_uncertain",
    wants_fc144: false,
    wants_retake_same_form: false,
  });
  if (loading)
    return <p>{isZh ? "正在读取观察状态…" : "Loading observation state…"}</p>;
  return (
    <div
      className={styles.feedbackGrid}
      data-testid="enneagram-observation-panel"
    >
      {error ? <Alert>{error}</Alert> : null}
      <p data-testid="enneagram-observation-guidance">
        {isZh
          ? "前三候选与行动仅作为七天观察假设；反馈不会静默改写系统测量结果。"
          : "The Top 3 and actions are seven-day observation hypotheses only; feedback never silently rewrites the measured result."}
      </p>
      {!state ? (
        <div>
          <strong>
            {isZh ? "启动七天观察" : "Start seven-day observation"}
          </strong>
          <button
            data-testid="enneagram-observation-assign"
            type="button"
            disabled={busy || selectedActionId === ""}
            onClick={async () => {
              setBusy(true);
              try {
                refresh(
                  (await assignEnneagramObservation({ attemptId, selectedActionId }))
                    .observation_state_v1 ?? null,
                );
              } finally {
                setBusy(false);
              }
            }}
          >
            {selectedActionId === ""
              ? isZh
                ? "先选择一个行动"
                : "Choose an action first"
              : isZh
                ? "开始 7 天观察"
                : "Start observation"}
          </button>
        </div>
      ) : (
        <>
          <div>
            <strong>Day 3</strong>
            {state.day3_observation_feedback ? (
              <p data-testid="enneagram-observation-day3-summary">
                {isZh ? "已记录" : "Recorded"}
              </p>
            ) : (
              <form
                data-testid="enneagram-observation-day3-form"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setBusy(true);
                  try {
                    refresh(
                      (
                        await submitEnneagramObservationDay3({
                          attemptId,
                          payload: day3,
                        })
                      ).observation_state_v1 ?? null,
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <label>
                  {isZh ? "更像哪个候选" : "More like"}
                  <select
                    value={day3.more_like}
                    onChange={(e) =>
                      setDay3({
                        ...day3,
                        more_like: e.target
                          .value as EnneagramObservationDay3Payload["more_like"],
                      })
                    }
                  >
                    <option value="top1">top1</option>
                    <option value="top2">top2</option>
                    <option value="unclear">unclear</option>
                    <option value="other">other</option>
                  </select>
                </label>
                <label>
                  {isZh ? "证据句" : "Evidence sentence"}
                  <textarea
                    required
                    value={day3.evidence_sentence}
                    onChange={(e) =>
                      setDay3({ ...day3, evidence_sentence: e.target.value })
                    }
                  />
                </label>
                <button disabled={busy}>
                  {isZh ? "提交 Day 3" : "Submit Day 3"}
                </button>
              </form>
            )}
          </div>
          <div>
            <strong>Day 7</strong>
            {state.day7_resonance_feedback ? (
              <p data-testid="enneagram-observation-user-confirmed">
                {isZh
                  ? `已记录；自我观察确认 ${state.user_confirmed_type ?? "未定"}，系统结果保持不变。`
                  : `Recorded; self-observation ${state.user_confirmed_type ?? "uncertain"}, measured result unchanged.`}
              </p>
            ) : (
              <form
                data-testid="enneagram-observation-day7-form"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setBusy(true);
                  try {
                    refresh(
                      (
                        await submitEnneagramObservationDay7({
                          attemptId,
                          payload: day7,
                        })
                      ).observation_state_v1 ?? null,
                    );
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                <label>
                  {isZh ? "最终共鸣" : "Final resonance"}
                  <select
                    value={day7.final_resonance}
                    onChange={(e) =>
                      setDay7({
                        ...day7,
                        final_resonance: e.target
                          .value as EnneagramObservationDay7Payload["final_resonance"],
                      })
                    }
                  >
                    <option value="top1">top1</option>
                    <option value="top2">top2</option>
                    <option value="top3">top3</option>
                    <option value="still_uncertain">still uncertain</option>
                    <option value="other">other</option>
                  </select>
                </label>
                <label>
                  {isZh ? "自我观察确认号码" : "Self-observed type"}
                  <input
                    value={day7.user_confirmed_type ?? ""}
                    onChange={(e) =>
                      setDay7({
                        ...day7,
                        user_confirmed_type: e.target.value || null,
                      })
                    }
                  />
                </label>
                <button disabled={busy}>
                  {isZh ? "提交 Day 7" : "Submit Day 7"}
                </button>
              </form>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function EnneagramResultShell({
  locale,
  attemptId,
  reportLocked,
  accessProjection,
  viewModel,
}: {
  locale: Locale;
  attemptId: string;
  reportLocked: boolean;
  accessProjection?: AttemptReportAccessView | null;
  viewModel: EnneagramResultViewModel;
}) {
  const isZh = locale === "zh";
  const report = viewModel.reportV2;
  const [selectedType, setSelectedType] = useState(
    viewModel.candidates[0]?.typeId ?? "",
  );
  const [activeChapter, setActiveChapter] = useState("chapter-1");
  const [selectedAction, setSelectedAction] = useState("");
  const [observationState, setObservationState] =
    useState<EnneagramObservationStateV1 | null>(null);
  const [observationLoading, setObservationLoading] = useState(true);
  const [observationError, setObservationError] = useState<string | null>(null);
  const candidate =
    viewModel.candidates.find((item) => item.typeId === selectedType) ??
    viewModel.candidates[0];
  const overview = report?.moduleMap.result_overview?.content ?? {};
  const retakeHref = buildEnneagramTakeHref(
    SCALE_CANONICAL_SLUG_MAP.ENNEAGRAM,
    locale,
    viewModel.formCode,
  );
  const pdfAttemptId = accessProjection?.attemptId ?? attemptId;
  const chapters = useMemo(
    () =>
      CHAPTERS.map(([id, number, zh, en]) => ({
        id,
        number,
        title: isZh ? zh : en,
      })),
    [isZh],
  );
  useEffect(() => {
    let active = true;
    void fetchEnneagramObservation({ attemptId })
      .then((response) => {
        if (active) setObservationState(response.observation_state_v1 ?? null);
      })
      .catch((cause) => {
        if (active)
          setObservationError(
            cause instanceof Error ? cause.message : String(cause),
          );
      })
      .finally(() => {
        if (active) setObservationLoading(false);
      });
    return () => {
      active = false;
    };
  }, [attemptId]);
  useEffect(() => {
    const update = () => {
      const line = Math.max(96, window.innerHeight * 0.12);
      const current = chapters
        .map((chapter) => document.getElementById(chapter.id))
        .filter((node): node is HTMLElement => Boolean(node))
        .filter((node) => node.getBoundingClientRect().top <= line)
        .at(-1);
      if (current) setActiveChapter(current.id);
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [chapters]);
  if (!report || report.pages.length !== 7 || !candidate) {
    if (viewModel.authority?.mode === "immutable_legacy_snapshot")
      return (
        <article data-testid="enneagram-legacy-snapshot" className="space-y-8">
          <h1>{isZh ? "九型人格历史结果" : "Historical Enneagram result"}</h1>
          {viewModel.visibleSections.map((section) => (
            <SectionRenderer
              key={section.key ?? section.title ?? "legacy"}
              section={section}
              locked={false}
              locale={locale}
              scaleCode="ENNEAGRAM"
            />
          ))}
        </article>
      );
    return (
      <Alert data-testid="enneagram-canonical-payload-unavailable">
        {isZh
          ? "结果内容暂不可用，请稍后重试。"
          : "Result content is temporarily unavailable. Please try again later."}
      </Alert>
    );
  }
  return (
    <main
      className={styles.page}
      data-testid="enneagram-result-shell"
      data-interpretation-scope={viewModel.interpretationScope}
      data-form-variant={viewModel.formVariant}
      data-enneagram-source-hash={viewModel.sourceHash ?? undefined}
    >
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <h1>
            {isZh
              ? "九型人格类型测评结果"
              : "Enneagram type assessment results"}
          </h1>
          <hr className={styles.heroRule} />
          <div className={styles.heroResultMeta}>
            <span>
              <UserRound size={20} aria-hidden="true" />
              {isZh ? "个人测评" : "Personal assessment"}
            </span>
            <span>
              <CalendarDays size={20} aria-hidden="true" />
              {viewModel.formSummaryLabel}
            </span>
          </div>
        </div>
        <div className={styles.heroMark} aria-hidden="true">
          <span>1</span>
          <span>5</span>
          <span>9</span>
        </div>
      </header>
      <div className={styles.reportShell}>
        <aside className={styles.leftRail}>
          <nav
            className={styles.chapterNav}
            aria-label={isZh ? "报告章节" : "Report chapters"}
          >
            <p className={styles.railHeading}>
              {isZh ? "章节导航" : "CHAPTERS"}
            </p>
            <div className={styles.navInner}>
              {chapters.map((chapter) => (
                <a
                  key={chapter.id}
                  href={`#${chapter.id}`}
                  aria-current={
                    activeChapter === chapter.id ? "location" : undefined
                  }
                >
                  <span>{chapter.number}</span>
                  {chapter.title}
                </a>
              ))}
            </div>
          </nav>
        </aside>
        <article className={styles.report}>
          <section id="chapter-1" className={styles.chapter}>
            <header className={styles.resultOverview}>
              <div className={styles.resultOverviewHeader}>
                <span>01</span>
                <div>
                  <h2>{chapters[0].title}</h2>
                  <p>{String(overview.body ?? "")}</p>
                </div>
              </div>
              <div className={styles.resultOverviewGrid}>
                <DistributionChart viewModel={viewModel} locale={locale} />
                <section
                  className={styles.aboutType}
                  style={
                    {
                      "--candidate-accent":
                        COLORS[(Number(candidate.typeId) - 1) % COLORS.length],
                    } as CSSProperties
                  }
                >
                  <div className={styles.aboutTitle}>
                    <h3>
                      {isZh
                        ? `当前阅读候选：${candidate.typeName}`
                        : `Current reading candidate: ${candidate.typeName}`}
                    </h3>
                  </div>
                  <p className={styles.aboutLead}>
                    {candidate.sectionMap["2.1"].lead}
                  </p>
                  <p>{candidate.sectionMap["2.1"].paragraphs[0]}</p>
                  <dl className={styles.candidateLens}>
                    <div>
                      <dt>{isZh ? "有余地时" : "With capacity"}</dt>
                      <dd>{candidate.sectionMap["3.1"].lead}</dd>
                    </div>
                    <div>
                      <dt>{isZh ? "倾向过量时" : "When overused"}</dt>
                      <dd>{candidate.sectionMap["3.2"].lead}</dd>
                    </div>
                    <div>
                      <dt>
                        {isZh ? "优先寻找的反例" : "Counter-evidence to seek"}
                      </dt>
                      <dd>{candidate.sectionMap["2.5"].reflectionQuestion}</dd>
                    </div>
                  </dl>
                  <div className={styles.resultMethodNote} role="note">
                    <strong>
                      {String(overview.title ?? chapters[0].title)}
                    </strong>
                    <p>
                      {String(overview.methodology_copy ?? "")}{" "}
                      {String(overview.score_space_boundary ?? "")}
                    </p>
                  </div>
                </section>
              </div>
            </header>
            <div
              className={styles.candidatePicker}
              role="group"
              aria-label={
                isZh ? "切换当前阅读候选" : "Switch reading candidate"
              }
            >
              {viewModel.candidates.map((item) => (
                <button
                  key={item.typeId}
                  type="button"
                  aria-pressed={item.typeId === candidate.typeId}
                  onClick={() => {
                    setSelectedType(item.typeId);
                    setSelectedAction("");
                  }}
                  style={
                    {
                      "--candidate-accent":
                        COLORS[(Number(item.typeId) - 1) % COLORS.length],
                    } as CSSProperties
                  }
                >
                  <strong>
                    #{item.rank} · {item.typeName}
                  </strong>
                  <span>{item.shortTitle}</span>
                </button>
              ))}
            </div>
          </section>
          {chapters.slice(1, 6).map((chapter) => (
            <section
              id={chapter.id}
              className={styles.chapter}
              key={`${candidate.typeId}-${chapter.id}`}
            >
              <header className={styles.chapterHeader}>
                <span>{chapter.number}</span>
                <h2>{chapter.title}</h2>
              </header>
              <div className={styles.typeContent}>
                {(CHAPTER_SECTIONS[chapter.id] ?? []).map((id) => (
                  <Section key={id} section={candidate.sectionMap[id]} />
                ))}
              </div>
            </section>
          ))}
          <section id="chapter-7" className={styles.chapter}>
            <header className={styles.chapterHeader}>
              <span>07</span>
              <h2>{chapters[6].title}</h2>
            </header>
            <section className={styles.reportSection}>
              <div className={styles.sectionNumber}>7.1</div>
              <div className={styles.sectionBody}>
                <h3>
                  {isZh
                    ? "与这种模式对应的具体成长建议"
                    : "Concrete growth actions for this pattern"}
                </h3>
                <p className={styles.lead}>
                  {isZh
                    ? "选择一个足够小、能够观察结果的行动。选择不会改写系统测量结果。"
                    : "Choose one small action with an observable outcome. Your choice never rewrites the measured result."}
                </p>
              </div>
            </section>
            <div className={styles.actionChooser}>
              {candidate.growthActions.map((action) => (
                <button
                  type="button"
                  key={action.actionId}
                  aria-pressed={selectedAction === action.actionId}
                  onClick={() => setSelectedAction(action.actionId)}
                >
                  <span>{selectedAction === action.actionId ? "✓" : ""}</span>
                  <strong>{action.title}</strong>
                  <p>
                    {action.instruction} · {action.observableOutcome}
                  </p>
                </button>
              ))}
            </div>
            <ObservationPanel
              locale={locale}
              attemptId={attemptId}
              selectedActionId={selectedAction}
              state={observationState}
              loading={observationLoading}
              error={observationError}
              refresh={setObservationState}
            />
          </section>
          <footer className={styles.chapter}>
            <div className={styles.localTools}>
              {pdfAttemptId ? (
                <PdfDownloadButton
                  attemptId={pdfAttemptId}
                  locked={reportLocked}
                  accessProjection={accessProjection}
                  locale={locale}
                  filenamePrefix="enneagram-report"
                  safetyDisabled
                  safetyDisabledLabel={
                    isZh ? "PDF 暂不可用" : "PDF unavailable"
                  }
                />
              ) : null}
              <Link
                href={retakeHref}
                className={buttonVariants({ variant: "outline" })}
              >
                {isZh ? "重新测试" : "Retake test"}
              </Link>
            </div>
          </footer>
        </article>
      </div>
    </main>
  );
}
