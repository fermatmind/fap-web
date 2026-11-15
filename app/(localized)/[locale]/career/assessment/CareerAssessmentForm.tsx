"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { resolveApiBaseUrl } from "@/lib/api-base";

const sectionNames = {
  interest: ["职业兴趣", "Career interests"],
  style: ["工作方式", "Work style"],
  value: ["工作条件", "Work values"],
  context: ["当前情况", "Current circumstances"],
} as const;

const axisNames: Record<string, readonly [string, string]> = {
  R: ["实际型 R", "Realistic R"], I: ["研究型 I", "Investigative I"],
  A: ["艺术型 A", "Artistic A"], S: ["社会型 S", "Social S"],
  E: ["企业型 E", "Enterprising E"], C: ["常规型 C", "Conventional C"],
  coordination: ["持续协作", "Ongoing coordination"],
  method_discretion: ["自主选择工作方法", "Choice of work methods"],
  task_switching: ["在任务之间切换", "Switching between tasks"],
  external_contact: ["直接对外沟通", "Direct external contact"],
  physical_activity: ["工作中走动", "Moving around at work"],
  predictable_hours: ["工时可预期", "Predictable hours"],
  learning_support: ["学习支持", "Learning support"],
  stable_income: ["收入稳定", "Stable income"],
  visible_benefit: ["看得见的贡献", "Visible benefit"],
  advancement_path: ["晋升路径", "Advancement path"],
  flexible_location: ["地点灵活性", "Location flexibility"],
};

type Locale = "zh" | "en";
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
type Scores = {
  form_version: string;
  axes: Record<RatedSection, Record<string, { score: number | null; answered: number; total: number }>>;
};

const endpoint = `${resolveApiBaseUrl()}/v0.5/career-assessment`;
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
  const empty = { answers: {}, page: 0 };
  try {
    const draft = JSON.parse(sessionStorage.getItem(draftKey) ?? "null");
    if (!draft?.answers || !Number.isInteger(draft.page)) return empty;
    const answers: Answers = {};
    for (const item of form.items) {
      const value = draft.answers[item.id];
      if (choicesFor(form, item, "en").some(([option]) => value === option)) answers[item.id] = value;
    }
    return { answers, page: Math.max(0, Math.min(draft.page, pagesFor(form).length - 1)) };
  } catch {
    return empty;
  }
}

function saveDraft(answers: Answers, page: number) {
  try {
    sessionStorage.setItem(draftKey, JSON.stringify({ answers, page }));
  } catch {
    // Storage is optional. In-memory answers remain available.
  }
}

export function CareerAssessmentForm({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  const language = zh ? "zh-CN" : "en";
  const label = (name: readonly [string, string]) => name[zh ? 0 : 1];
  const [form, setForm] = useState<Questionnaire>();
  const [loadFailed, setLoadFailed] = useState(false);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [answers, setAnswers] = useState<Answers>({});
  const [page, setPage] = useState(0);
  const [missing, setMissing] = useState<string>();
  const [submitError, setSubmitError] = useState<"retry" | "rate">();
  const [busy, setBusy] = useState(false);
  const [scores, setScores] = useState<Scores>();
  const heading = useRef<HTMLHeadingElement>(null);
  const scoreHeading = useRef<HTMLHeadingElement>(null);

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
        setPage(draft.page);
        setForm(next);
      } catch {
        if (!controller.signal.aborted) setLoadFailed(true);
      }
    }
    void load();
    return () => controller.abort();
  }, [loadAttempt]);

  useEffect(() => {
    if (scores) scoreHeading.current?.focus();
  }, [scores]);

  if (!form) {
    return loadFailed ? (
      <div role="alert" className="space-y-3">
        <p>{zh ? "题目暂时无法加载。" : "The questions could not be loaded."}</p>
        <Button onClick={() => { setLoadFailed(false); setLoadAttempt(loadAttempt + 1); }}>{zh ? "重试" : "Try again"}</Button>
      </div>
    ) : <p role="status">{zh ? "正在加载题目…" : "Loading questions…"}</p>;
  }

  const pages = pagesFor(form);
  const { section, items } = pages[page];
  const last = page === pages.length - 1;
  const completed = Object.keys(answers).length;
  const answered = (item: Item) => Object.hasOwn(answers, item.id);

  function moveTo(index: number, missingItem?: string) {
    setMissing(missingItem);
    setSubmitError(undefined);
    setPage(index);
    saveDraft(answers, index);
    requestAnimationFrame(() => {
      const target = missingItem ? document.getElementsByName(missingItem)[0] : heading.current;
      target?.focus();
    });
  }

  function selectAnswer(item: Item, answer: Answer) {
    const next = { ...answers, [item.id]: answer };
    setAnswers(next);
    if (missing === item.id) setMissing(undefined);
    setSubmitError(undefined);
    setScores(undefined);
    saveDraft(next, page);
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy || !form) return;

    const firstMissing = (last ? form.items : items).find(item => !answered(item));
    if (firstMissing) {
      moveTo(pages.findIndex(batch => batch.items.includes(firstMissing)), firstMissing.id);
      return;
    }
    if (!last) {
      moveTo(page + 1);
      return;
    }

    setBusy(true);
    setSubmitError(undefined);
    try {
      const response = await fetch(`${endpoint}/score`, {
        method: "POST", credentials: "omit",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ form_version: form.form_version, answers }),
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 429) {
        setSubmitError("rate");
        return;
      }
      if (!response.ok) throw new Error("Scoring unavailable");
      setScores(await response.json() as Scores);
    } catch {
      setSubmitError("retry");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <nav aria-label={zh ? "题目分区" : "Question sections"} className="flex flex-wrap gap-2">
        {sections.map(key => (
          <Button type="button" size="sm" key={key} variant={key === section ? "secondary" : "outline"}
            disabled={busy} aria-current={key === section ? "step" : undefined}
            onClick={() => moveTo(pages.findIndex(batch => batch.section === key))}>
            {label(sectionNames[key])}
          </Button>
        ))}
      </nav>
      <form className="space-y-6" onSubmit={submit}>
        <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-700">
          <label htmlFor="career-progress">
            {zh ? `已作答或跳过 ${completed} / 94` : `Answered or skipped ${completed} / 94`}
          </label>
          <progress id="career-progress" max={94} value={completed} className="h-2 w-36 accent-blue-700" />
        </div>
        <div className="space-y-2">
          <h2 ref={heading} tabIndex={-1} className="m-0 text-2xl font-semibold text-slate-950">
            {label(sectionNames[section])} · {page + 1} / {pages.length}
          </h2>
          <p className="m-0 text-sm text-slate-700">{form.instructions[section][language]}</p>
        </div>
        {items.map(item => (
          <fieldset key={item.id} disabled={busy} aria-describedby={item.id === missing ? "career-missing" : undefined}
            className="min-w-0 rounded-2xl border border-slate-200 bg-white px-4 pb-3">
            <legend className="px-1 text-base font-semibold leading-6 text-slate-950">
              {form.items.indexOf(item) + 1}. {item.text[language]}
            </legend>
            {item.id === missing && (
              <p role="alert" id="career-missing" className="my-1 text-sm text-red-700">
                {zh ? "请为这一题选一个答案，或选择跳过。" : "Choose an answer for this question, or skip it."}
              </p>
            )}
            <div className="mt-2 grid gap-1">
              {choicesFor(form, item, language).map(([value, text]) => (
                <label key={value ?? "skip"} className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-800 hover:bg-slate-50 has-checked:bg-sky-50">
                  <input type="radio" name={item.id} value={value ?? "skip"} checked={answered(item) && answers[item.id] === value}
                    className="accent-blue-700" onChange={() => selectAnswer(item, value)} />
                  {text}
                </label>
              ))}
            </div>
          </fieldset>
        ))}
        {submitError && (
          <p role="alert" className="text-sm text-red-700">
            {submitError === "rate"
              ? (zh ? "提交太频繁，请稍后重试。" : "Too many submissions. Please try again in a moment.")
              : (zh ? "暂时无法计分。答卷已保留，请重试。" : "Scoring is temporarily unavailable. Your answers are still here. Please try again.")}
          </p>
        )}
        <div className="flex justify-between gap-3">
          <Button type="button" variant="outline" disabled={page === 0 || busy} onClick={() => moveTo(page - 1)}>
            {zh ? "上一页" : "Previous"}
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? (zh ? "正在计分…" : "Scoring…") : last ? (zh ? "提交并查看分数" : "Submit and see scores") : (zh ? "下一页" : "Next")}
          </Button>
        </div>
      </form>
      {scores && (
        <section aria-labelledby="career-scores-heading" className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
          <h2 id="career-scores-heading" ref={scoreHeading} tabIndex={-1} className="m-0 text-xl font-semibold">
            {zh ? "本次提交的分数" : "Scores for this submission"}
          </h2>
          <p className="text-sm text-slate-700">
            {zh ? "分数越高，表示你越喜欢该类活动、越倾向该工作方式，或越看重该条件。当前情况不计分。"
              : "Higher scores indicate stronger interest, a stronger preference for the named work style, or greater importance. Current circumstances are unscored."}
          </p>
          {(Object.entries(scores.axes) as [RatedSection, Scores["axes"][RatedSection]][]).map(([group, axes]) => (
            <table key={group} className="w-full table-fixed border-collapse text-left text-sm">
              <caption className="py-2 text-left font-semibold">{label(sectionNames[group])}</caption>
              <thead className="border-b border-slate-200">
                <tr>
                  <th scope="col" className="w-1/2 py-2 pr-2">{zh ? "维度" : "Dimension"}</th>
                  <th scope="col" className="py-2 pr-2">{zh ? "分数" : "Score"}</th>
                  <th scope="col" className="py-2">{zh ? "有效作答" : "Valid answers"}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(axes).map(([axis, data]) => (
                  <tr key={axis} className="border-b border-slate-100" data-axis={axis}>
                    <th scope="row" className="py-2 pr-2 font-medium">{label(axisNames[axis] ?? [axis, axis])}</th>
                    <td className="break-words py-2 pr-2 tabular-nums">{data.score ?? (zh ? "有效作答不足" : "Insufficient answers")}</td>
                    <td className="py-2 tabular-nums">{data.answered} / {data.total}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ))}
        </section>
      )}
    </>
  );
}
