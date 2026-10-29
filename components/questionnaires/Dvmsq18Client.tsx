"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { isDvmsq18ConfigurationValid, scoreDvmsq18, type Dvmsq18Questionnaire, type Dvmsq18Result } from "@/lib/questionnaires/dvmsq18";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { useEntertainmentMetrics, useEntertainmentResultView } from "@/components/entertainment/useEntertainmentMetrics";
import { QuestionnaireReport } from "./QuestionnaireReport";

const button = "min-h-12 rounded-lg border border-slate-300 px-4 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const subscribeReady = () => () => {};

export function Dvmsq18Client({ quiz, locale }: { quiz: unknown; locale: Locale }) {
  if (!isDvmsq18ConfigurationValid(quiz)) return <p role="status">{locale === "zh" ? "问卷内容暂不可用。" : "The questionnaire content is unavailable."}</p>;
  return <ValidDvmsq18Client key={`${locale}:${quiz.version}`} quiz={quiz} locale={locale} />;
}
function ValidDvmsq18Client({ quiz, locale }: { quiz: Dvmsq18Questionnaire; locale: Locale }) {
  const zh = locale === "zh", ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const { start: recordStart, complete: recordComplete, view: recordView, share: recordShare, consent: activityConsent } = useEntertainmentMetrics(quiz.slug, quiz.version, locale, true);
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({}), [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [result, setResult] = useState<Dvmsq18Result | null>(null);
  const [message, setMessage] = useState(""), [manual, setManual] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), revision = useRef(0), submitted = useRef(false);
  const clear = useCallback(() => {
    revision.current++; submitted.current = false;
    setAnswers({}); setStage("welcome"); setPosition(0); setResult(null); setMessage(""); setManual("");
  }, []);
  useEffect(() => {
    const revisionClock = revision;
    const leave = () => clear(), restore = (e: PageTransitionEvent) => { if (e.persisted) clear(); };
    window.addEventListener("pagehide", leave); window.addEventListener("pageshow", restore);
    return () => { revisionClock.current++; window.removeEventListener("pagehide", leave); window.removeEventListener("pageshow", restore); };
  }, [clear]);
  useEffect(() => { if (stage !== "welcome") { heading.current?.focus(); heading.current?.scrollIntoView({ block: "start" }); } }, [position, stage]);
  useEntertainmentResultView(recordView, stage === "result");
  function next() {
    if (submitted.current) return;
    const checked = scoreDvmsq18(quiz, answers);
    if (checked.status === "invalid" || checked.status === "unavailable") { setMessage(zh ? "当前回答无法读取，请清除后重新开始。" : "These responses cannot be read. Clear and start again."); return; }
    if (!Object.hasOwn(answers, quiz.questions[position].id)) { setMessage(zh ? "请选择一种可用回答，也可明确选择不计分。" : "Choose an available response, including an explicit unscored choice."); return; }
    setMessage("");
    if (position === 0 && answers.DV_S1 === "yes") setPosition(1);
    else if (position > 0 && position < 18) setPosition(position + 1);
    else if (checked.status === "complete") { submitted.current = true; revision.current++; setResult(checked.result); setStage("result"); recordComplete(); }
    else setMessage(zh ? "仍有未选择的题项；空白与不计分不同，请返回检查。" : "Some prompts have no choice. Blank and unscored are different; go back to check.");
  }

  async function copyPublicLinks() {
    const text = quiz.profiles.map(p => `${p.title[locale]}\nhttps://fermatmind.com${questionnaireGuidePath(locale, quiz.slug, p.id)}`).join("\n\n");
    const copiedRevision = revision.current;
    try { await navigator.clipboard.writeText(text); if (revision.current !== copiedRevision) return; recordShare(); setManual(""); setMessage(zh ? "已复制公开解释链接，不含答案或个人分数。" : "Copied public explanation links, without answers or personal scores."); }
    catch { if (revision.current !== copiedRevision) return; setManual(text); setMessage(zh ? "无法自动复制，可从下方手动复制公开链接。" : "Automatic copying is unavailable. Copy the public links below manually."); }
  }
  const question = quiz.questions[position];
  return <section id="take-test" data-dvmsq18-client aria-busy={!ready} className="my-8 scroll-mt-24 rounded-xl border border-violet-200 bg-white p-5 sm:p-7">
    {activityConsent}
    <p className="mb-4 text-sm leading-7 text-slate-600">{quiz.dvmsq18.privacy[locale]}</p>
    <fieldset disabled={!ready} className="min-w-0 space-y-5 p-0"><legend className="sr-only">{quiz.title[locale]}</legend>
      {stage === "welcome" && <>
        <h2 className="text-2xl font-semibold">{quiz.dvmsq18.subtitle[locale]}</h2>
        <p className="leading-8">{quiz.instructions?.[locale]}</p>
        <p className="leading-8">{quiz.dvmsq18.editionNotice[locale]}</p>
        <p className="leading-8">{zh ? "先答前置题；选否按源表结束，选是进入18条源题。新增不确定或不愿回答可无分数结束。无需收集声音或身体描述，不做声音暴露。" : "Start with the screening question. No ends the source form; yes opens 18 source prompts. Added unsure or decline can finish without a score. No sound list, bodily description or sound exposure is needed."}</p>
        <button type="button" className={button} onClick={() => { revision.current++; setStage("answer"); setPosition(0); setMessage(""); recordStart(); }}>{zh ? "开始测试" : "Start test"}</button>
      </>}
      {stage === "answer" && <>
        <p data-dvmsq18-progress className="text-sm text-slate-600">{position === 0 ? (zh ? "前置问题" : "Initial screening question") : (zh ? `源题 ${position} / 18` : `Source prompt ${position} of 18`)}</p>
        <h2 id="dvmsq18-question" ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold leading-relaxed">{question.prompt[locale]}</h2>
        {position === 0 ? <><p className="leading-8">{quiz.dvmsq18.gateExamples[locale]}</p><p className="leading-8 font-medium">{quiz.dvmsq18.gateClarification[locale]}</p></> : <>
          {position === 1 && <p className="leading-8">{quiz.dvmsq18.privateContext[locale]}</p>}
          {position <= 10 && <p className="leading-8">{quiz.dvmsq18.frequencyContext[locale]}</p>}
          {position >= 12 && position <= 15 && <p className="leading-8">{quiz.dvmsq18.interferenceContext[locale]}</p>}
          {position >= 16 && <p className="leading-8">{quiz.dvmsq18.globalContext[locale]}</p>}
          {position === 3 && <p className="text-sm leading-7">{zh ? "此题保留回答，但不计入总分或分项。" : "This response is retained but excluded from every sum."}</p>}
        </>}
        <div role="radiogroup" aria-labelledby="dvmsq18-question" className="space-y-3">{question.options.map(o => <label key={o.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-3">
          <input type="radio" name={question.id} value={o.id} checked={answers[question.id] === o.id} className="mt-1 size-5 shrink-0 accent-violet-700" onChange={() => { revision.current++; setAnswers(question.id === "DV_S1" && answers.DV_S1 !== o.id ? { DV_S1: o.id } : { ...answers, [question.id]: o.id }); setMessage(""); setManual(""); }} />
          <span className="leading-7">{o.label[locale]}</span>
        </label>)}</div>
        <div className="flex flex-wrap gap-3"><button type="button" className={button} disabled={position === 0} onClick={() => { setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button type="button" className={button} onClick={next}>{position === 18 || (position === 0 && answers.DV_S1 && answers.DV_S1 !== "yes") ? (zh ? "查看记录与完整读法" : "See record and full guides") : (zh ? "下一题" : "Next")}</button></div>
      </>}
      {stage === "result" && result && <>
        <h2 ref={heading} tabIndex={-1} className="scroll-mt-24 text-2xl font-semibold">{quiz.resultHeading?.[locale]}</h2>
        {result.gate !== "yes" ? <div className="space-y-4 rounded-lg bg-slate-50 p-4 leading-8">
          {result.gate === "no" ? <><p data-dvmsq18-total className="text-xl font-semibold">{zh ? "源表前置结束：原始总分 0" : "Source form ended at the screening question: raw total 0"}</p><p>{zh ? "你在前置题选了否，按来源结束；其余18题与分项均未施测，不替它们填零。这不是诊断排除或没有困难的证明。" : "You chose no at the initial question, so the source ends here. The other 18 prompts and subscores were not administered and are not filled with zeros. This is not a diagnostic all-clear or proof of no difficulty."}</p></> : <p data-dvmsq18-unscored>{zh ? "你选择了不确定或不愿回答，本次结束但无数字结果；其余题未施测，不当作否或零。" : "You chose unsure or prefer not to answer. This ends without a numerical result; other items were not administered, and your choice is not treated as no or zero."}</p>}
        </div> : <>
          <p className="leading-8">{zh ? "全部18条源题已作明确选择，包括不计分项。第3题保留但不进入数字；原始合计没有诊断、严重程度分段、常模或概率含义。" : "All 18 source prompts have explicit choices, including unscored choices. Item 3 is retained but excluded from every sum. Raw sums do not provide a diagnosis, severity band, norm or probability."}</p>
          <div data-dvmsq18-result className="space-y-5">
            {result.total === null ? <p data-dvmsq18-total-withheld className="rounded-lg bg-slate-50 p-4 leading-8">{zh ? "总分暂不显示：17条计入题存在不计分回答，不补值、不当零。" : "Total withheld: at least one of the 17 counted items is unscored. No value is imputed or treated as zero."}</p> : <p data-dvmsq18-total className="rounded-lg bg-slate-50 p-4 text-xl font-semibold leading-8">{zh ? `原始总分：${result.total}（范围0—68；17题，不含第3题）` : `Raw total: ${result.total} (range 0–68; 17 items, excluding item 3)`}</p>}
            {result.parts && Object.entries(result.parts).map(([id, part]) => <section key={id} data-dvmsq18-part={id} className="rounded-lg border border-slate-200 p-4 leading-8">
              <h3 className="scroll-mt-24 text-xl font-semibold">{quiz.directions.find(d => d.id === id)!.title[locale]}</h3>
              <p data-dvmsq18-count>{zh ? `数字答案 ${part.rated}/${part.required}；不计分 ${part.skipped} 条。` : `Numeric responses ${part.rated}/${part.required}; ${part.skipped} unscored.`}</p>
              {part.sum === null ? <p data-dvmsq18-unscored>{zh ? "本组暂不计分：需全部计入条目为数字，不取均值、不补缺。" : "This sum is withheld: all counted items must be numerical, without averaging or filling gaps."}</p> : <p data-dvmsq18-sum className="font-semibold">{zh ? `原始合计：${part.sum}（范围0—${part.maximum}）` : `Raw sum: ${part.sum} (range 0–${part.maximum})`}</p>}
            </section>)}
            <p data-dvmsq18-fear className="leading-8">{zh ? "第3题（不计分）：" : "Item 3 (not scored): "}{quiz.questions[3].options.find(o => o.id === answers.DV_03)!.label[locale]}</p>
          </div>
        </>}
        <details data-dvmsq18-response-record className="my-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "查看本次逐项回答" : "View these individual responses"}</summary><ol className="mt-4 space-y-4">{result.responses.map(response => {
          const item = quiz.questions.find(q => q.id === response.questionId)!;
          return <li key={item.id} className="rounded-lg bg-slate-50 p-4 leading-8"><p>{item.prompt[locale]}</p><p className="mt-2 font-semibold">{item.options.find(o => o.id === response.choice)!.label[locale]}</p></li>;
        })}</ol></details>
        <div className="space-y-6">{quiz.profiles.map(profile => <section key={profile.id} data-dvmsq18-guide={profile.id} className="rounded-lg border border-slate-200 p-4 sm:p-6">
          <h3 className="scroll-mt-24 text-xl font-semibold">{profile.title[locale]}</h3>
          <details className="my-4"><summary className="min-h-11 cursor-pointer py-2 font-semibold underline">{zh ? "展开此部分完整读法" : "Expand this full reading"}</summary><div className="mt-5"><QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`dvmsq18-${profile.id}`} /></div></details>
          <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读完整公开指南" : "Read the complete public guide"}</Link>
        </section>)}</div>
        <button type="button" className={button} onClick={copyPublicLinks}>{zh ? "复制公开解释链接" : "Copy public explanation links"}</button>
        {manual && <label className="block leading-7">{zh ? "手动复制公开链接" : "Public links for manual copying"}<textarea readOnly value={manual} className="mt-2 min-h-40 w-full rounded-lg border border-slate-300 p-3" /></label>}
        <button type="button" className={button} onClick={clear}>{zh ? "清空并重新测试" : "Clear and retake"}</button>
      </>}
      {stage !== "welcome" && <button type="button" className={button} onClick={clear}>{zh ? "退出并清除本次回答" : "Exit and clear these responses"}</button>}
    </fieldset>
    <p role="status" aria-live="polite" className="my-4 text-sm leading-7">{ready ? message : (zh ? "正在准备问卷，请稍候。" : "Preparing the questionnaire. Please wait.")}</p>
    <noscript><p>{zh ? "作答需启用JavaScript；全部公开指南仍可直接阅读。" : "Answering requires JavaScript; all public guides remain readable."}</p></noscript>
  </section>;
}
