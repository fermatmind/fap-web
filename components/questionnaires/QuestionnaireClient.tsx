"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { QuestionnaireSocialReport } from "./QuestionnaireSocialReport";
import { QuestionnaireGritReport } from "./QuestionnaireGritReport";
import { QuestionnaireHabitsReport } from "./QuestionnaireHabitsReport";
import { QuestionnaireLocusReport } from "./QuestionnaireLocusReport";
import { QuestionnaireGrowthReport } from "./QuestionnaireGrowthReport";
import { QuestionnaireMaturityReport } from "./QuestionnaireMaturityReport";
import { QuestionnaireCompassReport } from "./QuestionnaireCompassReport";
import { QuestionnaireInkblotStimulus } from "./QuestionnaireInkblotStimulus";
import { getInkblotStimulus } from "@/lib/questionnaires/inkblotStimuli";
import { QuestionnaireLtsReport } from "./QuestionnaireLtsReport";
import { QuestionnaireValuesReport } from "./QuestionnaireValuesReport";
import { QuestionnaireSdtNeedsReport } from "./QuestionnaireSdtNeedsReport";
import { QuestionnaireTypeAbReport } from "./QuestionnaireTypeAbReport";
import { QuestionnaireFacetReport } from "./QuestionnaireFacetReport";
import { QuestionnaireArchetypeReport } from "./QuestionnaireArchetypeReport";
import { QuestionnaireAlignmentReport } from "./QuestionnaireAlignmentReport";
import { QuestionnaireOptimismReport } from "./QuestionnaireOptimismReport";
import { QuestionnaireExtraversionReport } from "./QuestionnaireExtraversionReport";
import { QuestionnaireAffectionReport } from "./QuestionnaireAffectionReport";
import { QuestionnaireAttachmentReport } from "./QuestionnaireAttachmentReport";
import { QuestionnaireCharacterStrengthsReport } from "./QuestionnaireCharacterStrengthsReport";
import { QuestionnaireLearningPreferenceReport } from "./QuestionnaireLearningPreferenceReport";
import { QuestionnaireProcrastinationReport } from "./QuestionnaireProcrastinationReport";
import { QuestionnaireFrictionReport } from "./QuestionnaireFrictionReport";
import { QuestionnairePpsReport } from "./QuestionnairePpsReport";
import { QuestionnaireMusicReport } from "./QuestionnaireMusicReport";
import { QuestionnaireHumorReport } from "./QuestionnaireHumorReport";
import { QuestionnaireCommunicationReport } from "./QuestionnaireCommunicationReport";
import { QuestionnaireReport } from "./QuestionnaireReport";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import { readQuestionnaireDraft, scoreQuestionnaire } from "@/lib/questionnaires/scoring";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Locale } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/analytics";
import { listMbtiFormMetas } from "@/lib/mbti/forms";
import { appendSeoCtaContextParamsToHref, buildSeoCtaContextParams, buildSeoCtaTrackingPayload } from "@/lib/tracking/seoCtaAttribution";

const button = "min-h-12 rounded-lg border border-slate-300 px-5 py-3 font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-700 disabled:opacity-50";
const draftEvent = "fm-questionnaire-draft";
const subscribeReady = () => () => {};
function subscribe(listener: () => void) {
  window.addEventListener(draftEvent, listener);
  return () => window.removeEventListener(draftEvent, listener);
}

export function QuestionnaireClient({ quiz, locale }: { quiz: Questionnaire; locale: Locale }) {
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const zh = locale === "zh", key = `fm_questionnaire_draft:${quiz.slug}`;
  const [loadedStimulusId, setLoadedStimulusId] = useState<string | null>(null);
  const requiresStimulus = quiz.slug === "inkblot-personality-quiz";
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [stage, setStage] = useState<"welcome" | "answer" | "result">("welcome");
  const [position, setPosition] = useState(0), [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(""), [manualCopy, setManualCopy] = useState("");
  const heading = useRef<HTMLHeadingElement>(null), submitted = useRef(false), viewed = useRef(false);
  const draft = useSyncExternalStore(subscribe, () => {
    try { const raw = sessionStorage.getItem(key); return readQuestionnaireDraft(quiz, raw) ? raw : null; } catch { return null; }
  }, () => null);
  const result = scoreQuestionnaire(quiz, answers);
  const directional = result.status === "complete" && "profileId" in result ? result : undefined;
  const facets = result.status === "complete" && "facets" in result ? result : undefined;
  const archetypes = result.status === "complete" && "profileIds" in result ? result : undefined;
  const compass = result.status === "complete" && "compassProfileIds" in result ? result : undefined;
  const alignment = result.status === "complete" && "alignmentIds" in result ? result : undefined;
  const optimism = result.status === "complete" && "outlookProfileIds" in result ? result : undefined;
  const extraversion = result.status === "complete" && "scaleProfileIds" in result ? result : undefined;
  const affection = result.status === "complete" && "affectionFacets" in result ? result : undefined;
  const attachment = result.status === "complete" && "attachmentAxes" in result ? result : undefined;
  const hasCompleteResult = result.status === "complete";
  const profile = directional ? quiz.profiles.find(p => p.id === directional.profileId) : undefined;
  const question = quiz.questions[position];
  const emit = (event: string) => trackEvent(event, { slug: quiz.slug, locale, entry_surface: "questionnaire", scale_code: quiz.code, form_code: quiz.source.formCode, test_type: "self_report", page_type: "test_detail" });
  const mbtiBase = `/${locale}/tests/mbti-personality-test-16-personality-types`;
  const recommendation = { locale, sourceRouteFamily: "test_detail" as const, sourceSlug: quiz.slug, sourcePath: questionnairePath(locale, quiz.slug), href: mbtiBase, ctaId: "questionnaire_result_mbti", targetAction: "questionnaire_result_mbti", targetTestSlug: "mbti-personality-test-16-personality-types", scaleCode: "MBTI" };
  const mbtiHref = appendSeoCtaContextParamsToHref(mbtiBase, buildSeoCtaContextParams(recommendation));
  const versions = listMbtiFormMetas().map(form => zh ? `${form.questionCount}题（约${form.estimatedMinutes}分钟）` : `${form.questionCount} questions (about ${form.estimatedMinutes} min)`).join(zh ? "、" : " or ");

  useEffect(() => { if (stage !== "welcome") heading.current?.focus(); }, [position, stage]);
  useEffect(() => {
    if (stage === "result" && hasCompleteResult && !viewed.current) {
      viewed.current = true;
      trackEvent("view_result", { slug: quiz.slug, locale, entry_surface: "questionnaire", scale_code: quiz.code, form_code: quiz.source.formCode, test_type: "self_report", page_type: "test_detail" });
    }
  }, [stage, hasCompleteResult, quiz, locale]);

  function clear() {
    try { sessionStorage.removeItem(key); } catch { /* Saving is optional. */ }
    window.dispatchEvent(new Event(draftEvent));
  }
  function persist(next: QuestionnaireAnswers, enabled: boolean) {
    if (!enabled) return;
    try {
      sessionStorage.setItem(key, JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: next }));
      window.dispatchEvent(new Event(draftEvent));
    } catch { setMessage(zh ? "浏览器无法保存进度。仍可继续作答，但刷新会丢失当前进度。" : "This browser could not save progress. You can continue, but a refresh will lose this attempt."); }
  }
  function start(resume = false) {
    let next: QuestionnaireAnswers = {};
    if (resume) {
      try { const saved = readQuestionnaireDraft(quiz, sessionStorage.getItem(key)); if (!saved) throw new Error("expired"); next = saved; }
      catch { clear(); setMessage(zh ? "已存进度已过期或不可用，请开始新作答。" : "Saved progress expired or is unavailable. Start a new attempt."); return; }
    } else clear();
    const first = quiz.questions.findIndex(q => !next[q.id]);
    submitted.current = false; viewed.current = false;
    setLoadedStimulusId(null); setAnswers(next); setPosition(first < 0 ? quiz.questions.length - 1 : first); setSaving(resume);
    setMessage(""); setManualCopy(""); setStage("answer"); emit("start_test");
  }
  function advance() {
    if (requiresStimulus && loadedStimulusId !== question?.id) return;
    if (!question || !answers[question.id]) { setMessage(zh ? "请选择一个选项再继续。" : "Choose an option before continuing."); return; }
    if (position < quiz.questions.length - 1) { setLoadedStimulusId(null); setPosition(position + 1); setMessage(""); return; }
    if (submitted.current) return;
    if (result.status !== "complete") { setMessage(zh ? "本次结果暂不可用，请检查完整作答后重试。" : "The result is unavailable. Check that all questions are answered and try again."); return; }
    submitted.current = true; clear(); setStage("result"); setMessage(""); emit("complete_test");
  }
  async function copy() {
    if (!hasCompleteResult) return;
    const matchedIds = compass?.compassProfileIds ?? alignment?.alignmentIds ?? optimism?.outlookProfileIds ?? extraversion?.scaleProfileIds ?? archetypes?.profileIds;
    const single = profile ?? (matchedIds?.length === 1 ? quiz.profiles.find(p => p.id === matchedIds[0]) : undefined);
    const label = single?.title[locale] ?? (matchedIds?.length ? matchedIds.map(id => quiz.profiles.find(p => p.id === id)!.title[locale]).join(zh ? "、" : ", ") : (extraversion || optimism) ? quiz.title[locale] : (zh ? "完整自我观察" : "Complete self-reflection"));
    const text = `${quiz.title[locale]}\n${label}\nhttps://fermatmind.com${single ? questionnaireGuidePath(locale, quiz.slug, single.id) : questionnairePath(locale, quiz.slug)}`;
    try { await navigator.clipboard.writeText(text); setMessage(zh ? "已复制结果名称与公开说明链接。" : "Copied the result name and public explanation link."); }
    catch { setManualCopy(text); setMessage(zh ? "请选中下方文字手动复制。" : "Select the text below to copy it manually."); }
  }

  return <section id="take-test" className="my-8 rounded-xl border border-violet-200 bg-white p-5 sm:p-8" aria-label={zh ? "作答与完整结果" : "Questionnaire and full results"}>
    {stage === "welcome" && <>
      <h2 className="text-2xl font-semibold">{zh ? `开始${quiz.questions.length}题的自我观察` : `Start your ${quiz.questions.length}-question reflection`}</h2>
      <p className="my-4 leading-7">{quiz.instructions?.[locale] ?? (zh ? "每题比较两种做法，选择通常更自然或更先出现的一项。没有正确答案。答完全部题目后再生成计数和完整解释。" : "Each question compares two responses. Choose the one that comes more naturally or happens first. There are no correct answers. Counts and full explanations appear only after all questions are complete.")}</p>
      {!ready && <p role="status" className="my-3 text-sm text-slate-600">{zh ? "正在准备测试…" : "Preparing the test…"}</p>}
      <div className="flex flex-wrap gap-3"><button disabled={!ready} className={`${button} bg-violet-700 text-white`} onClick={() => start()}>{zh ? "开始测试" : "Start test"}</button>{draft && <button disabled={!ready} className={button} onClick={() => start(true)}>{zh ? "恢复本标签页进度" : "Resume this tab's progress"}</button>}</div>
      <p className="mt-4 text-sm leading-7 text-slate-600">{zh ? "完整题目和结果免费，无需注册。只有主动保存才会在刷新或换语言后提供恢复；本标签页保存24小时后失效，完成或重测即清除。" : "All questions and full results are free, with no signup. Saving is optional; only saved attempts can be resumed after a refresh or language change. Tab drafts expire after 24 hours and clear on completion or retake."}</p>
    </>}
    {stage === "answer" && question && <>
      <p className="mb-3 text-sm">{zh ? `第${position + 1}题，共${quiz.questions.length}题` : `Question ${position + 1} of ${quiz.questions.length}`}</p>
      <progress aria-label={zh ? "已作答题数" : "Questions answered"} max={quiz.questions.length} value={Object.keys(answers).length} className="mb-5 w-full accent-violet-700" />
      <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold leading-8 outline-none">{question.prompt[locale]}</h2>
      {requiresStimulus && <QuestionnaireInkblotStimulus key={question.id} stimulus={getInkblotStimulus(question.id)} locale={locale} onAvailabilityChange={available => setLoadedStimulusId(available ? question.id : null)} />}
      <fieldset className="mt-5 space-y-3"><legend className="sr-only">{question.prompt[locale]}</legend>{question.options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-4 has-[:checked]:border-violet-700 has-[:checked]:bg-violet-50">
        <input type="radio" className="mt-1 size-5 shrink-0 accent-violet-700" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => { if (submitted.current) return; const next = { ...answers, [question.id]: option.id }; setAnswers(next); setMessage(""); persist(next, saving); }} /><span className="min-w-0 leading-7 [overflow-wrap:anywhere]">{option.label[locale]}</span>
      </label>)}</fieldset>
      <div className="mt-6 flex flex-wrap gap-3"><button className={button} disabled={position === 0} onClick={() => { setLoadedStimulusId(null); setPosition(position - 1); setMessage(""); }}>{zh ? "上一题" : "Back"}</button><button className={`${button} bg-violet-700 text-white`} disabled={requiresStimulus && loadedStimulusId !== question.id} onClick={advance}>{position === quiz.questions.length - 1 ? (zh ? "查看完整结果" : "See full result") : (zh ? "下一题" : "Next")}</button></div>
      <label className="mt-6 flex items-start gap-3 text-sm leading-7 text-slate-600"><input type="checkbox" className="mt-1 size-5 shrink-0" checked={saving} onChange={event => { setSaving(event.target.checked); if (event.target.checked) persist(answers, true); else clear(); }} /><span>{zh ? "在本标签页临时保存进度，刷新或换语言后可主动恢复；24小时后失效，完成、清除或重测即删除。" : "Save progress in this tab so I can resume after a refresh or language change. It expires after 24 hours and clears on completion, exit-and-clear or retake."}</span></label>
      <button className="mt-3 min-h-11 text-sm underline" onClick={() => { clear(); setAnswers({}); setSaving(false); setStage("welcome"); setMessage(""); }}>{zh ? "退出并清除本次进度" : "Exit and clear this attempt"}</button>
    </>}
    {stage === "result" && result.status === "complete" && <>
      <h2 ref={heading} tabIndex={-1} className="text-3xl font-semibold leading-tight outline-none [overflow-wrap:anywhere]">{profile?.title[locale] ?? quiz.resultHeading?.[locale] ?? (zh ? `${quiz.title.zh}：完整结果` : `${quiz.title.en}: your complete result`)}</h2>
      {directional && profile && <>
      <section className="my-6 rounded-lg bg-slate-50 p-4" aria-label={zh ? "本次原始选择次数" : "Raw choice counts for this attempt"}><h3 className="font-semibold">{zh ? "各方向的本次选择次数" : "Your counts across the directions"}</h3><dl className="mt-3 space-y-3">{quiz.directions.map(direction => <div className="flex flex-wrap justify-between gap-3" key={direction.id}><dt>{direction.title[locale]}</dt><dd>{directional.counts[direction.id]} / {direction.comparisons}</dd></div>)}</dl><p className="mt-3 text-sm leading-7">{zh ? "分母为该方向参加比较的次数。原始次数只比较本题组内的选择，不是人群排名或能力分数。" : "The denominator is the number of comparisons for that direction. Raw counts compare choices within this question set, not population ranks or ability scores."}</p></section>
      <QuestionnaireReport profile={profile} locale={locale} />
      <Link prefetch={false} className="my-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这项结果的公开说明" : "Read the public explanation of this result"}</Link>
      </>}
      {facets && (quiz.slug === "social-intelligence-test" ? <QuestionnaireSocialReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "grit-test" ? <QuestionnaireGritReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "toxic-trait" ? <QuestionnaireHabitsReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "locus-of-control" ? <QuestionnaireLocusReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "growth-mindset-fixed-mindset" ? <QuestionnaireGrowthReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "maturity-test" ? <QuestionnaireMaturityReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "light-triad-test" ? <QuestionnaireLtsReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "values" ? <QuestionnaireValuesReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "sdt-motivation" ? <QuestionnaireSdtNeedsReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "type-ab" ? <QuestionnaireTypeAbReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "character-strengths" ? <QuestionnaireCharacterStrengthsReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "learning-style" ? <QuestionnaireLearningPreferenceReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "procrastinator-type-test" ? <QuestionnaireProcrastinationReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "difficult-person-test" ? <QuestionnaireFrictionReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "people-pleaser" ? <QuestionnairePpsReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "music-taste-test" ? <QuestionnaireMusicReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "humor-style-test" ? <QuestionnaireHumorReport quiz={quiz} result={facets} locale={locale} /> : quiz.slug === "communication-style" ? <QuestionnaireCommunicationReport quiz={quiz} result={facets} locale={locale} /> : <QuestionnaireFacetReport quiz={quiz} result={facets} locale={locale} />)}
      {archetypes && <QuestionnaireArchetypeReport quiz={quiz} result={archetypes} locale={locale} />}
      {compass && <QuestionnaireCompassReport quiz={quiz} result={compass} locale={locale} />}
      {alignment && <QuestionnaireAlignmentReport quiz={quiz} result={alignment} locale={locale} />}
      {optimism && <QuestionnaireOptimismReport quiz={quiz} result={optimism} locale={locale} />}
      {extraversion && <QuestionnaireExtraversionReport quiz={quiz} result={extraversion} locale={locale} />}
      {affection && <QuestionnaireAffectionReport quiz={quiz} result={affection} locale={locale} />}
      {attachment && <QuestionnaireAttachmentReport quiz={quiz} result={attachment} locale={locale} />}
      <div className="flex flex-wrap gap-3"><button className={button} onClick={copy}>{zh ? "复制结果与链接" : "Copy result and link"}</button><button className={button} onClick={() => start()}>{zh ? "重新测试" : "Retake test"}</button></div>
      {manualCopy && <textarea readOnly aria-label={zh ? "手动复制结果" : "Result text for manual copying"} value={manualCopy} onFocus={e => e.target.select()} className="mt-4 min-h-40 w-full rounded border p-3" />}
      <section className="mt-10 border-t pt-7"><h3 className="text-xl font-semibold">{(optimism?.total === null || extraversion?.total === null || (affection && Object.values(affection.affectionFacets).every(f => f.mean === null)) || (attachment && Object.values(attachment.attachmentAxes).every(a => a.mean === null)) || (facets && ["social-intelligence-test", "grit-test", "toxic-trait", "locus-of-control", "growth-mindset-fixed-mindset", "maturity-test", "light-triad-test", "values", "sdt-motivation", "type-ab", "communication-style", "humor-style-test", "music-taste-test", "people-pleaser", "difficult-person-test", "procrastinator-type-test", "learning-style", "character-strengths"].includes(quiz.slug) && Object.values(facets.facets).every(f => f.mean === null))) ? (zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next.") : (zh ? "完整结果已呈现，下一步由你选择" : "Your full result is ready. Choose what comes next.")}</h3><p className="my-4 leading-7 text-slate-600">{zh ? `如果想用另一套框架探索偏好，可以另做MBTI：${versions}。需要重新完整作答，这项结果不会换算成MBTI类型。也可以在这里结束。` : `For another perspective on preferences, MBTI offers ${versions}. It needs a separate full attempt; this result is never converted into an MBTI type. You can also stop here.`}</p><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={mbtiHref} onClick={() => trackEvent("click_test", buildSeoCtaTrackingPayload(recommendation))}>{zh ? "了解MBTI与题本选择" : "Explore MBTI and its versions"}</Link><br /><Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link></section>
    </>}
    {message && <p role="status" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm leading-7">{message}</p>}
  </section>;
}
