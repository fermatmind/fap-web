"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AdaptiveOptionGroup } from "@/components/quiz/immersive/AdaptiveOptionGroup";
import { ImmersiveTakeLayout } from "@/components/quiz/immersive/ImmersiveTakeLayout";
import { V2LikertScale } from "@/components/quiz/immersive/V2LikertScale";
import { QuizTakeHeaderV2 } from "@/components/quiz/QuizTakeHeaderV2";
import takeStyles from "@/components/quiz/AssessmentTake.module.css";
import { CareerAssessmentResult } from "./CareerAssessmentResult";
import { assembleRiasecResultViewModel } from "@/lib/riasec/resultAssembler";
import { Button } from "@/components/ui/button";
import { Career94SaveResult } from "./Career94Purchase";
import { careerAssessmentEndpoint as endpoint, requestCareer94Result, type Career94Market, Career94Offer } from "./career94-api";

const sectionNames = {
  interest: ["职业兴趣", "Career interests"],
  style: ["工作方式", "Work style"],
  value: ["工作条件", "Work values"],
  context: ["当前情况", "Current circumstances"],
} as const;

export type Locale = "zh" | "en";
type ItemLocale = "zh-CN" | "en";
type Localized<T> = Record<ItemLocale, T>;
type Section = keyof typeof sectionNames;
type RatedSection = Exclude<Section, "context">;
type Answer = number | string | null;
type Answers = Record<string, Answer>;
type Item = {
  id: string;
  section: Section;
  text: Localized<string>;
  options?: Record<string, Localized<string>>;
};
type Questionnaire = {
  form_version: string;
  anchors: Record<RatedSection, Localized<string[]>>;
  instructions: Record<Section, Localized<string>>;
  unknown_option: Localized<string>;
  items: Item[];
};
const draftKey = "fermat-career-assessment/career_v1";
const sections = Object.keys(sectionNames) as Section[];

function pagesFor(form: Questionnaire) {
  return sections.flatMap(section => {
    const items = form.items.filter(item => item.section === section);
    return Array.from({ length: Math.ceil(items.length / 8) }, (_, index) => ({
      section,
      items: items.slice(index * 8, index * 8 + 8),
    }));
  });
}

function choicesFor(form: Questionnaire, item: Item, locale: ItemLocale): [Answer, string][] {
  const choices: [Answer, string][] = item.section === "context"
    ? Object.entries(item.options ?? {}).map(([key, text]) => [key, text[locale]])
    : form.anchors[item.section][locale].map((text, index) => [index + 1, text]);
  return [...choices, [null, form.unknown_option[locale]]];
}

function readDraft(form: Questionnaire) {
  const empty = { answers: {}, index: 0 };
  try {
    const draft = JSON.parse(sessionStorage.getItem(draftKey) ?? "null");
    if (!draft?.answers) return empty;
    const answers: Answers = {};
    for (const item of form.items) {
      const value = draft.answers[item.id];
      if (choicesFor(form, item, "en").some(([option]) => value === option)) answers[item.id] = value;
    }
    const legacyItem = Number.isInteger(draft.page) ? pagesFor(form)[draft.page]?.items[0] : undefined;
    const index = Number.isInteger(draft.index) ? draft.index : legacyItem ? form.items.indexOf(legacyItem) : 0;
    return { answers, index: Math.max(0, Math.min(index, form.items.length - 1)) };
  } catch {
    return empty;
  }
}

function saveDraft(answers: Answers, index: number) {
  try {
    sessionStorage.setItem(draftKey, JSON.stringify({ answers, index }));
  } catch {
    // Storage is optional. In-memory answers remain available.
  }
}

export function CareerAssessmentForm({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const language = zh ? "zh-CN" : "en";
  const t = (cn: string, en: string) => zh ? cn : en;
  const [form, setForm] = useState<Questionnaire>();
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [missing, setMissing] = useState(false);
  const [submitError, setSubmitError] = useState<"retry" | "rate">();
  const [busy, setBusy] = useState(false);
  const [report, setReport] = useState<Parameters<typeof assembleRiasecResultViewModel>[0]>();
  const viewModel = useMemo(() => report ? assembleRiasecResultViewModel(report, locale) : undefined, [report, locale]);
  const [offers, setOffers] = useState<Career94Offer[]>([]);
  const submissionIds = useRef<Partial<Record<Career94Market, string>>>({});
  const reportRegion = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const submitInFlight = useRef(false);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const response = await fetch(`${endpoint}/questions`, {
          cache: "no-store", credentials: "omit", signal: controller.signal,
        });
        if (!response.ok) throw new Error("Questionnaire unavailable");
        const next: Questionnaire = await response.json();
        if (next.form_version !== "career_v1" || next.items.length !== 94) throw new Error("Unexpected questionnaire");
        const draft = readDraft(next);
        setAnswers(draft.answers);
        setIndex(draft.index);
        setForm(next);
      } catch {
        if (!controller.signal.aborted) setLoadFailed(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [loadAttempt]);

  useEffect(() => {
    if (viewModel) reportRegion.current?.focus();
  }, [viewModel]);

  if (!form) {
    return loadFailed ? (
      <div role="alert" className="space-y-3">
        <p>{zh ? "题目暂时无法加载。" : "The questions could not be loaded."}</p>
        <Button onClick={() => { setLoadFailed(false); setLoadAttempt(loadAttempt + 1); }}>{zh ? "重试" : "Try again"}</Button>
      </div>
    ) : <p role="status">{zh ? "正在加载题目…" : "Loading questions…"}</p>;
  }

  const item = form.items[index];
  const completed = Object.keys(answers).length;
  const last = index === form.items.length - 1;
  const choices = choicesFor(form, item, language);
  const options = choices.filter(([value]) => value !== null).map(([value, text]) => ({ code: String(value), text }));

  function moveTo(nextIndex: number, showMissing = false) {
    setIndex(nextIndex);
    setMissing(showMissing);
    setSubmitError(undefined);
    saveDraft(answers, nextIndex);
    requestAnimationFrame(() => heading.current?.focus());
  }

  function selectAnswer(answer: Answer) {
    if (submitInFlight.current) return;
    submissionIds.current = {};
    const nextAnswers = { ...answers, [item.id]: answer };
    const nextIndex = last ? index : index + 1;
    setAnswers(nextAnswers);
    setMissing(false);
    setSubmitError(undefined);
    setIndex(nextIndex);
    saveDraft(nextAnswers, nextIndex);
    if (!last) requestAnimationFrame(() => heading.current?.focus());
  }

  async function submit() {
    if (submitInFlight.current || !form) return;
    const firstMissing = form.items.findIndex(question => !Object.hasOwn(answers, question.id));
    if (firstMissing !== -1) {
      moveTo(firstMissing, true);
      return;
    }

    submitInFlight.current = true;
    setBusy(true);
    setSubmitError(undefined);
    try {
      const response = await fetch(`${endpoint}/score`, {
        method: "POST", credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_version: form.form_version, answers, include_report: true, locale }),
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 429) {
        setSubmitError("rate");
        return;
      }
      if (!response.ok) throw new Error("Scoring unavailable");
      const result = await response.json() as Parameters<typeof assembleRiasecResultViewModel>[0] & { purchase_offers?: Career94Offer[] };
      setOffers(result.purchase_offers ?? []);
      if (!result.riasec_public_projection_v2) throw new Error("Report unavailable");
      setReport(result);
    } catch {
      setSubmitError("retry");
    } finally {
      submitInFlight.current = false;
      setBusy(false);
    }
  }

  if (viewModel) {
    return <div ref={reportRegion} tabIndex={-1}>
      <CareerAssessmentResult purchase={offers.length > 0 && <Career94SaveResult locale={locale} offers={offers} onSave={async market => {
        submissionIds.current[market] ??= crypto.randomUUID();
        const saved = await requestCareer94Result("", {
          submission_id: submissionIds.current[market], market, form_version: form.form_version, answers, locale,
        });
        return saved;
      }} />} model={viewModel} locale={locale} onReview={() => {
        setReport(undefined);
        requestAnimationFrame(() => heading.current?.focus());
      }} />
    </div>;
  }

  const selected = answers[item.id];
  const questionId = "career-assessment-question";
  function chooseOption(code: string) {
    const choice = choices.find(([value]) => value !== null && String(value) === code);
    if (choice) selectAnswer(choice[0]);
  }

  return (
    <ImmersiveTakeLayout
      appearance="focused"
      backHref={`/${locale}/career/assessment`}
      backLabel={t("返回职业测试详情", "Back to the career test details")}
      current={index + 1}
      total={form.items.length}
      answered={completed}
      previousLabel={t("上一题", "Previous question")}
      previousDisabled={index === 0 || busy}
      onPrevious={() => moveTo(index - 1)}
      transitionKey={item.id}
      transitionDirection="none"
      headerSlot={<QuizTakeHeaderV2 appearance="focused" brand={t("费马职业测试（94 题）", "FermatMind Career Assessment (94 questions)")}
        showCompletedCount={false} completedPrefix="" completedSuffix=""
        estimatedTimeLabel={t("预计用时", "Estimated time")} minutesUnit={t("分钟", "min")} estimatedMinutes={15}
        progressText={t(`第 ${index + 1} 题 / 共 ${form.items.length} 题`, `Question ${index + 1} / ${form.items.length}`)}
        current={index + 1} total={form.items.length} answered={completed} />}
      footerSlot={last ? <Button disabled={busy} onClick={() => void submit()}>
        {busy ? t("正在计分…", "Scoring…") : t("提交并查看报告", "Submit and view report")}
      </Button> : Object.hasOwn(answers, item.id) ? <Button variant="outline" onClick={() => moveTo(index + 1)}>
        {t("下一题", "Next question")}
      </Button> : null}
    >
      <article className={takeStyles.question}>
        <h2 ref={heading} id={questionId} tabIndex={-1} className={takeStyles.questionTitle}>{item.text[language]}</h2>
        {missing && <p role="alert" className="text-sm text-red-700">{t("请为这一题选一个答案，或选择跳过。", "Choose an answer for this question, or skip it.")}</p>}
        {item.section === "context" ? (
          <AdaptiveOptionGroup questionId={item.id} options={options} value={selected == null ? undefined : String(selected)}
            disabled={busy} onChange={chooseOption} noOptionsLabel={t("暂无选项", "No options available")} />
        ) : (
          <V2LikertScale appearance="cards" positiveEnd="last" labelledBy={questionId} questionId={item.id}
            options={options} value={selected == null ? undefined : String(selected)} disabled={busy} onChange={chooseOption} />
        )}
        <div className={takeStyles.feedback}>
          <p className="m-0">{sectionNames[item.section][zh ? 0 : 1]} · {form.instructions[item.section][language]}</p>
          <button type="button" className="rounded-full px-3 py-1 text-xs text-[var(--quiz-muted)] underline underline-offset-2 focus-visible:outline-2"
            aria-pressed={selected === null} disabled={busy} onClick={() => selectAnswer(null)}>{form.unknown_option[language]}</button>
        </div>
        {submitError && (
          <p role="alert" className="text-sm text-red-700">
            {submitError === "rate"
              ? t("提交太频繁，请稍后重试。", "Too many submissions. Please try again in a moment.")
              : t("暂时无法计分。答卷已保留，请重试。", "Scoring is temporarily unavailable. Your answers are still here. Please try again.")}
          </p>
        )}
      </article>
    </ImmersiveTakeLayout>
  );
}
