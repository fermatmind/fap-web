"use client";
import { hasTraditionalArchetype } from "@/lib/i18n/traditionalArchetypePaths";
import { useQuestionnaireDisplayCopy } from "./TraditionalQuestionnaireCopy";
import { QuestionnaireSevenSinsOverview } from "./QuestionnaireSevenSinsOverview";
import { useQuestionnaireTake, QuestionnaireLegacyControl } from "./QuestionnaireTakeContext";
import { QuestionnaireTakeOptions } from "./QuestionnaireTakeOptions";
import { QuestionnaireChoiceInteraction } from "./QuestionnaireChoiceInteraction";
import { selectedChoiceIds } from "@/lib/questionnaires/orderedChoices";
import takeStyles from "@/components/quiz/AssessmentTake.module.css";
import sessionStyles from "./QuestionnaireTake.module.css";

import { questionnaireTrackingPayload } from "@/lib/questionnaires/tracking";
import { QuestionnaireWelcome, questionnaireButtonClass as button } from "./QuestionnaireWelcome";
import { QuestionnaireResultReading } from "./QuestionnaireResultReading";
import { questionnaireResultVariant, ResultOverview, ResultScoreRow, ResultSection } from "./QuestionnaireResultPresentation";
import resultStyles from "./QuestionnaireResultPresentation.module.css";

import { recordEntertainmentActivity } from "@/lib/entertainment/activity";
import { preparationActions20GuideLinks } from "@/lib/questionnaires/preparationActions20";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { QuestionnairePaletteSwatches } from "./QuestionnairePaletteSwatches";
import { QuestionnaireJavaCode } from "./QuestionnaireJavaCode";
import { QuestionnaireJavaScriptCode } from "./QuestionnaireJavaScriptCode";
import { QuestionnairePythonCode } from "./QuestionnairePythonCode";
import { QuestionnaireSqlCode } from "./QuestionnaireSqlCode";
import { QuestionnaireInkblotStimulus } from "./QuestionnaireInkblotStimulus";
import { getInkblotStimulus } from "@/lib/questionnaires/inkblotStimuli";
import type { Questionnaire, QuestionnaireAnswers } from "@/lib/questionnaires/types";
import type { scoreQuestionnaire as GeneralScorer } from "@/lib/questionnaires/scoring";
import { readQuestionnaireDraftWithScorer } from "@/lib/questionnaires/draft";
import { questionnaireModule } from "./QuestionnaireModule";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import type { Locale } from "@/lib/i18n/locales";
import { trackEvent } from "@/lib/analytics";

const archetypeShareFeedbackSlugs = new Set(["aura-color", "moon-phase", "chiikawa", "bleach", "philosopher-personality-test"]);

const directionPresentation = {
  disc: { eyebrow: { zh: "本题组内的选择结果", en: "Choices in this question set" }, previews: ["editorial-scene", "editorial-experiment"] },
  "relationship-values": { eyebrow: { zh: "亲密关系 · 本次配对选择", en: "Relationships · Your paired choices" }, previews: ["scene", "private-exercise"] },
  "response-color": { eyebrow: { zh: "四色回应 · 本次配对选择", en: "Four response colours · Your paired choices" }, previews: ["editorial-scene", "editorial-conversation"] },
  "egen-teto": { eyebrow: { zh: "先接住感受，还是先明确行动", en: "Make space for feelings or clarify what to do" }, previews: ["example", "practice", "experiment"] },
  "likable-person-test": { eyebrow: { zh: "五种互动贡献 · 本次选择", en: "Five ways to contribute in an interaction" }, previews: ["dialogue", "optional-observation"] },
  "food-choice": { eyebrow: { zh: "餐桌选择 · 本次搭配", en: "Table choices · This attempt" }, previews: ["scene", "next-step"] },
  "love-personality": { eyebrow: { zh: "四种相处方式 · 本次选择", en: "Four ways of relating · Your choices" }, previews: ["real-world-scenes", "real-world-checkpoints", "balancing-actions", "counterbalance-prompts"] },
  "adult-age-preferences": { eyebrow: { zh: "本次选择", en: "Your choices" }, previews: ["fictional-example", "optional-step"] },
};

const EightQuizPersonalCard = questionnaireModule<Parameters<typeof import("./EightQuizPersonalCard").EightQuizPersonalCard>[0]>(() => import("./EightQuizPersonalCard").then(module => ({ default: module.EightQuizPersonalCard })));
const SevenSinsPersonalCard = questionnaireModule<Omit<import("./SevenSinsPersonalCard").SevenSinsPersonalCardProps, "locale"> & { locale: Locale }>(() => import("./SevenSinsPersonalCard").then(module => ({ default: module.SevenSinsPersonalCard })));

const QuestionnaireResultSections = questionnaireModule<import("./QuestionnaireReports").QuestionnaireReportProps>(() => import("./QuestionnaireReports").then(module => ({ default: module.QuestionnaireResultSections })));

const draftEvent = "fm-questionnaire-draft";
const subscribeReady = () => () => {};
function subscribe(listener: () => void) {
  window.addEventListener(draftEvent, listener);
  return () => window.removeEventListener(draftEvent, listener);
}


export function QuestionnaireRunner({ scoreQuestionnaire, quiz, locale, startOnEntry = false, resumeOnEntry = false, emitStartOnEntry = true, workRoleReadingProfiles, loveTypeReadingProfiles, mentalAgeReadingProfile, fds32ReadingProfiles, breakupReadingProfiles, parentingReadingProfiles }: { scoreQuestionnaire: typeof GeneralScorer; quiz: Questionnaire; locale: Locale; startOnEntry?: boolean; resumeOnEntry?: boolean; emitStartOnEntry?: boolean; workRoleReadingProfiles?: Questionnaire["profiles"]; loveTypeReadingProfiles?: Questionnaire["profiles"]; mentalAgeReadingProfile?: Questionnaire["profiles"][number]; fds32ReadingProfiles?: Questionnaire["profiles"]; breakupReadingProfiles?: Questionnaire["profiles"]; parentingReadingProfiles?: Questionnaire["profiles"] }) {
  const { displayText, traditional } = useQuestionnaireDisplayCopy();
  const traditionalArchetype = traditional && hasTraditionalArchetype(quiz.slug);
  const traditionalEntryShare = traditional && (!traditionalArchetype || quiz.slug === "euphoria-character-quiz");
  const standalone = useQuestionnaireTake();
  const readQuestionnaireDraft = useCallback((value: Questionnaire, raw: string | null) => readQuestionnaireDraftWithScorer(value, raw, scoreQuestionnaire), [scoreQuestionnaire]);
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const zh = locale === "zh", key = `fm_questionnaire_draft:${quiz.slug}`;
  const [loadedStimulusId, setLoadedStimulusId] = useState<string | null>(null);
  const requiresStimulus = quiz.slug === "inkblot-personality-quiz";
  const [answers, setAnswers] = useState<QuestionnaireAnswers>({});
  const [stage, setStage] = useState<"welcome" | "answer" | "result">(startOnEntry ? "answer" : "welcome");
  const [position, setPosition] = useState(0), [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(""), [manualCopy, setManualCopy] = useState("");
  const questionContext = useRef<HTMLParagraphElement>(null);
  const heading = useRef<HTMLHeadingElement>(null), submitted = useRef(false), viewed = useRef(false), enteredLegacyPlay = useRef(false);
  const draft = useSyncExternalStore(subscribe, () => {
    if (standalone) return null;
    try { const raw = sessionStorage.getItem(key); return readQuestionnaireDraft(quiz, raw) ? raw : null; } catch { return null; }
  }, () => null);
  const result = scoreQuestionnaire(quiz, answers);
  const tipi10 = result.status === "complete" && "tipi10" in result ? result : undefined;
  const directional = result.status === "complete" && "profileId" in result ? result : undefined;
  const archetypes = result.status === "complete" && "profileIds" in result ? result : undefined;
  const compass = result.status === "complete" && "compassProfileIds" in result ? result : undefined;
  const alignment = result.status === "complete" && "alignmentIds" in result ? result : undefined;
  const optimism = result.status === "complete" && "outlookProfileIds" in result ? result : undefined;
  const extraversion = result.status === "complete" && "scaleProfileIds" in result ? result : undefined;
  const extraversionUnscored = extraversion?.total === null;
  const affection = result.status === "complete" && "affectionFacets" in result ? result : undefined;
  const attachment = result.status === "complete" && "attachmentAxes" in result ? result : undefined;
  const miniVirtues = result.status === "complete" && "miniVirtues" in result ? result : undefined;
  const miniFriction = result.status === "complete" && "miniFriction" in result ? result : undefined;
  const ctl41 = result.status === "complete" && "ctl41" in result ? result : undefined;
  const interactionPairs = result.status === "complete" && "interactionPairs" in result ? result : undefined;
  const distributedWork = result.status === "complete" && "distributedWork" in result ? result : undefined;
  const workRole = result.status === "complete" && "workRole" in result ? result : undefined;
  const skillsEvidence = result.status === "complete" && "skillsEvidence" in result ? result : undefined;
  const preparationActions20 = result.status === "complete" && "preparationActions20" in result ? result : undefined;
  const holdingBack35 = result.status === "complete" && "holdingBack35" in result ? result : undefined;
  const spq92 = result.status === "complete" && "spq92" in result ? result : undefined;
  const adexi14 = result.status === "complete" && "adexi14" in result ? result : undefined;
  const ptq15 = result.status === "complete" && "ptq15" in result ? result : undefined;
  const saps = result.status === "complete" && "sapsDomains" in result ? result : undefined;
  const pairedDimensions = result.status === "complete" && "pairedDimensions" in result ? result : undefined;
  const practice = result.status === "complete" && "practice" in result ? result : undefined;
  const loveType16 = result.status === "complete" && "loveType16" in result ? result : undefined;
  const mentalAge = result.status === "complete" && "mentalAge" in result ? result : undefined;
  const hasCompleteResult = result.status === "complete";
  const profile = directional ? quiz.profiles.find(p => p.id === directional.profileId) : undefined;
  const reportProps = { quiz, result, answers, locale, workRoleReadingProfiles, loveTypeReadingProfiles, mentalAgeReadingProfile, fds32ReadingProfiles, breakupReadingProfiles, parentingReadingProfiles };
  const question = quiz.questions[position];
  const answeredCount = quiz.questions.filter(q => selectedChoiceIds(q, answers[q.id], true) !== null).length;
  const emit = (event: string) => { if (event === "start_test" || event === "complete_test") recordEntertainmentActivity(quiz.slug, quiz.version, locale, event === "start_test" ? "start" : "complete"); trackEvent(event, questionnaireTrackingPayload(quiz, locale)); };
  const entryStartRecorded = useRef(false);
  useEffect(() => {
    if (ready && startOnEntry && !entryStartRecorded.current) {
      entryStartRecorded.current = true;
      if (standalone) {
        try { sessionStorage.removeItem(key); } catch { /* No draft restoration in standalone sessions. */ }
      }
      if (resumeOnEntry && !standalone) {
        const saved = readQuestionnaireDraft(quiz, draft);
        if (saved) {
          const first = quiz.questions.findIndex(q => !saved[q.id]);
          setAnswers(saved); setPosition(first < 0 ? quiz.questions.length - 1 : first); setSaving(true);
        }
      }
      if (emitStartOnEntry) {
        recordEntertainmentActivity(quiz.slug, quiz.version, locale, "start");
        trackEvent("start_test", questionnaireTrackingPayload(quiz, locale));
      }
    }
  }, [ready, startOnEntry, resumeOnEntry, emitStartOnEntry, draft, quiz, locale, readQuestionnaireDraft, standalone, key]);

  useEffect(() => {
    if (ready && quiz.slug === "relationship-values" && !enteredLegacyPlay.current) {
      enteredLegacyPlay.current = true;
      trackEvent("landing_view", { slug: quiz.slug, locale, entry_surface: "entertainment", scale_code: "ENTERTAINMENT", form_code: `fun_${quiz.slug}_v1` });
    }
  }, [ready, quiz.slug, locale]);

  useEffect(() => {
    if (stage !== "welcome") {
      heading.current?.focus({ preventScroll: standalone });
      if (!standalone) (stage === "answer" ? questionContext.current : heading.current)?.scrollIntoView({ block: "start" });
      if (standalone && stage === "result") window.scrollTo({ top: 0, behavior: "instant" });
    }
  }, [position, stage, quiz.slug, quiz.kind, standalone]);
  useEffect(() => {
    if (stage === "result" && hasCompleteResult && !viewed.current) {
      viewed.current = true;
      recordEntertainmentActivity(quiz.slug, quiz.version, locale, "result_view");
      trackEvent("view_result", questionnaireTrackingPayload(quiz, locale));
    }
  }, [stage, hasCompleteResult, quiz, locale]);

  function clear() {
    try { sessionStorage.removeItem(key); } catch { /* Saving is optional. */ }
    window.dispatchEvent(new Event(draftEvent));
  }
  function persist(next: QuestionnaireAnswers, enabled: boolean) {
    if (standalone || !enabled) return;
    try {
      sessionStorage.setItem(key, JSON.stringify({ version: quiz.version, savedAt: Date.now(), answers: next }));
      window.dispatchEvent(new Event(draftEvent));
    } catch { setMessage(zh ? displayText("浏览器无法保存进度。仍可继续作答，但刷新会丢失当前进度。") : "This browser could not save progress. You can continue, but a refresh will lose this attempt."); }
  }
  function start(resume = false) {
    let next: QuestionnaireAnswers = {};
    if (resume && !standalone) {
      try { const saved = readQuestionnaireDraft(quiz, sessionStorage.getItem(key)); if (!saved) throw new Error("expired"); next = saved; }
      catch { clear(); setMessage(zh ? displayText("已存进度已过期或不可用，请开始新作答。") : "Saved progress expired or is unavailable. Start a new attempt."); return; }
    } else clear();
    const first = quiz.questions.findIndex(q => !next[q.id]);
    submitted.current = false; viewed.current = false;
    setLoadedStimulusId(null); setAnswers(next); setPosition(first < 0 ? quiz.questions.length - 1 : first); setSaving(resume && !standalone);
    setMessage(""); setManualCopy(""); setStage("answer"); emit("start_test");
  }
  function advance() {
    if (requiresStimulus && loadedStimulusId !== question?.id) return;
    if (question?.interaction && !selectedChoiceIds(question, answers[question.id], true)) { setMessage(zh ? displayText("请按题目要求完成选择或排序。") : "Complete the selection or ranking before continuing."); return; }
    if (!question || !answers[question.id]) { setMessage(zh ? displayText("请选择一个选项再继续。") : "Choose an option before continuing."); return; }
    if (position < quiz.questions.length - 1) { setLoadedStimulusId(null); setPosition(position + 1); setMessage(""); return; }
    if (submitted.current) return;
    if (result.status !== "complete") { setMessage(zh ? displayText("本次结果暂不可用，请检查完整作答后重试。") : "The result is unavailable. Check that all questions are answered and try again."); return; }
    submitted.current = true; clear(); setStage("result"); setMessage(""); emit("complete_test");
  }
  async function copy() {
    if (!hasCompleteResult) return;
    const matchedIds = pairedDimensions?.pairedProfileIds ?? compass?.compassProfileIds ?? alignment?.alignmentIds ?? optimism?.outlookProfileIds ?? extraversion?.scaleProfileIds ?? archetypes?.profileIds;
    const single = profile ?? (matchedIds?.length === 1 ? quiz.profiles.find(p => p.id === matchedIds[0]) : undefined);
    const label = single?.title[locale] ?? (matchedIds?.length ? matchedIds.map(id => quiz.profiles.find(p => p.id === id)!.title[locale]).join(zh ? "、" : ", ") : (interactionPairs || distributedWork || workRole || skillsEvidence || practice || extraversion || optimism || saps) ? quiz.title[locale] : (zh ? displayText("完整自我观察") : "Complete self-reflection"));
    const text = traditionalEntryShare ? `${quiz.title[locale]}\nhttps://fermatmind.com${questionnairePath("zh-TW", quiz.slug)}` : (saps || quiz.slug === "hsp-sensitivity-quiz" || adexi14 || ptq15 || miniFriction || interactionPairs || extraversionUnscored || affection || attachment || distributedWork || workRole || skillsEvidence || quiz.slug === "work-traits-reflection" || quiz.slug === "work-activity-interests" || quiz.slug === "interpersonal-preferences" || quiz.slug === "everyday-control-style" || quiz.slug === "relationship-worry-habits" || quiz.slug === "face-self-image" || quiz.slug === "dating-outlook" || quiz.slug === "relationship-habits" || quiz.slug === "intimacy-values" || tipi10 || loveType16 || mentalAge || quiz.kind === "fds32" || quiz.slug === "energy-flow" || quiz.slug === "cognitive-functions-test" || quiz.slug === "cultural-dimensions" || quiz.slug === "food-choice" || quiz.slug === "values-assessment" || quiz.slug === "eq-dashboard" || miniVirtues || quiz.slug === "euphoria-character-quiz") ? `${quiz.title[locale]}\nhttps://fermatmind.com${questionnairePath(locale, quiz.slug)}` : preparationActions20 ? (preparationActions20GuideLinks(quiz, locale) ?? "") : (holdingBack35 || quiz.kind === "mini-breakup" || quiz.kind === "parenting-practices" || spq92 || miniFriction || ctl41) ? `${quiz.title[locale]}\nhttps://fermatmind.com${questionnairePath(locale, quiz.slug)}` : `${quiz.title[locale]}\n${label}\nhttps://fermatmind.com${single ? questionnaireGuidePath(traditionalArchetype ? "zh-TW" : locale, quiz.slug, single.id) : questionnairePath(traditionalArchetype ? "zh-TW" : locale, quiz.slug)}`;
    const archetypeFeedback = archetypes && archetypeShareFeedbackSlugs.has(quiz.slug)
      ? single
        ? (zh ? "已复制结果名称与该结果的公开指南链接，不含答案或次数。" : "Copied the result name and its public guide link, without answers or counts.")
        : (zh ? "已复制所有并列结果名称与测试入口链接，不含答案或次数。" : "Copied all tied result names and the quiz link, without answers or counts.")
      : undefined;
    try {
      await navigator.clipboard.writeText(text);
      recordEntertainmentActivity(quiz.slug, quiz.version, locale, "share", "single", "copy");
      setMessage(archetypeFeedback ?? (traditionalArchetype && !traditionalEntryShare ? displayText(single ? "已复制结果名称与公开说明链接。" : "已复制所有并列结果名称与测试入口链接，不含答案或次数。") : (traditional || saps || quiz.slug === "hsp-sensitivity-quiz" || adexi14 || ptq15 || miniFriction || interactionPairs || extraversionUnscored || affection || attachment || distributedWork || workRole || skillsEvidence || quiz.slug === "work-traits-reflection" || quiz.slug === "work-activity-interests" || quiz.slug === "interpersonal-preferences" || quiz.slug === "everyday-control-style" || quiz.slug === "relationship-worry-habits" || quiz.slug === "face-self-image" || quiz.slug === "dating-outlook" || quiz.slug === "relationship-habits" || quiz.slug === "intimacy-values" || tipi10 || loveType16 || mentalAge || quiz.kind === "fds32" || quiz.slug === "energy-flow" || quiz.slug === "cognitive-functions-test" || quiz.slug === "cultural-dimensions" || quiz.slug === "food-choice" || quiz.slug === "values-assessment" || quiz.slug === "eq-dashboard" || miniVirtues || quiz.slug === "euphoria-character-quiz" ? (zh ? displayText("已复制公开标题与入口链接，不含个人答案或次数。") : "Copied the public title and entry link, without personal answers or counts.") : (zh ? "已复制结果名称与公开说明链接。" : "Copied the result name and public explanation link."))));
    }
    catch { setManualCopy(text); setMessage(zh ? displayText("请选中下方文字手动复制。") : "Select the text below to copy it manually."); }
  }

  const disc = quiz.slug === "disc";
  const responseColor = quiz.slug === "response-color";
  const adultAgePreferences = quiz.slug === "adult-age-preferences";
  const preserveResultOnGuideOpen = adultAgePreferences || disc || responseColor || quiz.slug === "likable-person-test";
  const directionReading = Object.hasOwn(directionPresentation, quiz.slug) ? directionPresentation[quiz.slug as keyof typeof directionPresentation] : undefined;
  const showDirectionCounts = Boolean(directionReading);
  const directionEyebrow = directionReading?.eyebrow[locale] ?? (zh ? "本题组内的选择结果" : "Choices in this question set");
  const directionCounts = directional && <ResultSection className={showDirectionCounts ? resultStyles.choiceCounts : undefined} title={adultAgePreferences ? (zh ? "三项选择次数" : "Your three choice counts") : (zh ? "各方向的本次选择次数" : "Your counts across the directions")} aria-label={zh ? "本次原始选择次数" : "Raw choice counts for this attempt"}>
    {quiz.directions.map(direction => <ResultScoreRow key={direction.id} data-disc-direction={disc ? direction.id : undefined} data-colour-direction={responseColor ? direction.id : undefined} data-egen-teto-direction={quiz.slug === "egen-teto" ? direction.id : undefined} label={direction.title[locale]} value={`${directional.counts[direction.id]} / ${direction.comparisons}`} score={directional.counts[direction.id]} min={0} max={direction.comparisons} />)}
    <p className="mt-3 text-sm leading-7">{adultAgePreferences ? (zh
      ? `每种情境出现 12 次，三项合计 18 次。${directional.leaders.length === 3 ? "三项各选 6 次，没有单独的最高项。" : directional.leaders.length === 2 ? "两项同为最高，结果保留两项。" : "最高项是你在这组题里选得最多的情境。"}次数不能换算成理想年龄差。`
      : `Each context appeared 12 times. Your counts add up to 18. ${directional.leaders.length === 3 ? "All three were chosen 6 times, so there is no single leader." : directional.leaders.length === 2 ? "Two contexts share the highest count, so both are shown." : "The highest count is the context you chose most often in these questions."} These counts do not tell you an ideal age gap.`)
      : zh ? "分母为该方向参加比较的次数。原始次数只比较本题组内的选择，不是人群排名或能力分数。" : "The denominator is the number of comparisons for that direction. Raw counts compare choices within this question set, not population ranks or ability scores."}</p>
  </ResultSection>;
  return <section id="take-test" data-questionnaire-slug={quiz.slug} data-stage={stage} data-result-variant={stage === "result" && !miniVirtues ? questionnaireResultVariant(quiz.kind) : undefined} data-result-kind={stage === "result" && miniVirtues ? "mini-virtues" : undefined} className={`my-8 rounded-xl border border-violet-200 bg-white p-5 sm:p-8 ${stage === "result" && !miniVirtues ? resultStyles.page : ""}`} aria-label={zh ? displayText("作答与完整结果") : "Questionnaire and full results"}>
    {quiz.slug === "relationship-values" && <span id="play" className="block scroll-mt-24" aria-hidden="true" />}
    {stage === "welcome" && <QuestionnaireWelcome quiz={quiz} locale={locale} ready={ready} hasDraft={Boolean(draft)} onStart={start} />}
    {stage === "answer" && question && <>
      {standalone ? <div className={sessionStyles.progress}><div className={takeStyles.progressMeta}><p ref={questionContext}>{zh ? displayText(`第 ${position + 1} 题 / 共 ${quiz.questions.length} 题`) : `Question ${position + 1} of ${quiz.questions.length}`}</p><span className={takeStyles.percent}>{Math.round(answeredCount / quiz.questions.length * 100)}%</span></div><progress aria-label={zh ? displayText("已作答题数") : "Questions answered"} max={quiz.questions.length} value={answeredCount} className="w-full" /></div> : <>      <p ref={questionContext} className="mb-3 text-sm scroll-mt-24">{zh ? displayText(`第${position + 1}题，共${quiz.questions.length}题`) : `Question ${position + 1} of ${quiz.questions.length}`}</p>
      <progress aria-label={zh ? displayText("已作答题数") : "Questions answered"} max={quiz.questions.length} value={answeredCount} className="mb-5 w-full accent-violet-700" />
</>}
      {quiz.kind === "tipi10" && <p className="mb-3 leading-7">{zh ? "总体上，我认为自己：请评价这对特质整体符合的程度，即使其中一项更符合。" : "I see myself as: rate the pair overall, even if one trait applies more strongly than the other."}</p>}
      <h2 ref={heading} tabIndex={-1} className="text-xl font-semibold leading-8 outline-none scroll-mt-24">{(quiz.slug === "java-test" || quiz.slug === "javascript-test" || quiz.slug === "python-test" || quiz.slug === "sql-test") ? question.prompt[locale].split("\n\n")[0] : question.prompt[locale]}</h2>
      {quiz.slug === "java-test" && <QuestionnaireJavaCode code={question.prompt[locale].split("\n\n").slice(1).join("\n\n")} locale={locale} number={position + 1} />}
      {quiz.slug === "javascript-test" && <QuestionnaireJavaScriptCode code={question.prompt[locale].split("\n\n").slice(1).join("\n\n")} locale={locale} number={position + 1} />}
      {quiz.slug === "python-test" && <QuestionnairePythonCode code={question.prompt[locale].split("\n\n").slice(1).join("\n\n")} locale={locale} number={position + 1} />}
      {quiz.slug === "sql-test" && <QuestionnaireSqlCode code={question.prompt[locale].split("\n\n").slice(1).join("\n\n")} locale={locale} number={position + 1} />}
      {requiresStimulus && <QuestionnaireInkblotStimulus key={question.id} stimulus={getInkblotStimulus(question.id)} locale={locale} onAvailabilityChange={available => setLoadedStimulusId(available ? question.id : null)} />}
      {question.interaction ? <QuestionnaireChoiceInteraction question={question} value={answers[question.id]} locale={locale} traditional={traditionalArchetype} onChange={value => { if (submitted.current) return; const next = { ...answers, [question.id]: value }; setAnswers(next); setMessage(""); persist(next, saving); }} /> : standalone ? <QuestionnaireTakeOptions questionId={question.id} prompt={(quiz.slug === "java-test" || quiz.slug === "javascript-test" || quiz.slug === "python-test" || quiz.slug === "sql-test") ? question.prompt[locale].split("\n\n")[0] : question.prompt[locale]} options={question.options.map(option => ({ id: option.id, unscored: option.score === null, label: <>{option.label[locale]}{quiz.slug === "color-season" && option.paletteSwatches && <QuestionnairePaletteSwatches swatches={option.paletteSwatches} locale={locale} showLabels={false} />}</> }))} value={answers[question.id]} scale={quiz.kind === "likert" || quiz.kind === "tipi10"} positiveLast onChange={id => { if (submitted.current) return; const next = { ...answers, [question.id]: id }; setAnswers(next); setMessage(""); persist(next, saving); }} /> :       <fieldset className="mt-5 space-y-3"><legend className="sr-only">{(quiz.slug === "java-test" || quiz.slug === "javascript-test" || quiz.slug === "python-test" || quiz.slug === "sql-test") ? question.prompt[locale].split("\n\n")[0] : question.prompt[locale]}</legend>{question.options.map(option => <label key={option.id} className="flex min-h-12 cursor-pointer items-start gap-3 rounded-lg border border-slate-300 p-4 has-[:checked]:border-violet-700 has-[:checked]:bg-violet-50">
        <input type="radio" className="mt-1 size-5 shrink-0 accent-violet-700" name={question.id} value={option.id} checked={answers[question.id] === option.id} onChange={() => { if (submitted.current) return; const next = { ...answers, [question.id]: option.id }; setAnswers(next); setMessage(""); persist(next, saving); }} /><span className={`min-w-0 leading-7 [overflow-wrap:anywhere]${quiz.slug === "color-season" ? " flex-1" : ""}`}>{option.label[locale]}{quiz.slug === "color-season" && option.paletteSwatches && <QuestionnairePaletteSwatches swatches={option.paletteSwatches} locale={locale} showLabels={false} />}</span>
      </label>)}</fieldset>}
      <div className={standalone ? sessionStyles.actions : "mt-6 flex flex-wrap gap-3"}><button className={button} disabled={position === 0} onClick={() => { setLoadedStimulusId(null); setPosition(position - 1); setMessage(""); }}>{zh ? displayText("上一题") : "Back"}</button><button data-questionnaire-next className={`${button} bg-violet-700 text-white`} disabled={requiresStimulus && loadedStimulusId !== question.id} onClick={advance}>{position === quiz.questions.length - 1 ? (zh ? displayText("查看完整结果") : "See full result") : (zh ? displayText("下一题") : "Next")}</button></div>
      <QuestionnaireLegacyControl><label className="mt-6 flex items-start gap-3 text-sm leading-7 text-slate-600"><input type="checkbox" className="mt-1 size-5 shrink-0" checked={saving} onChange={event => { setSaving(event.target.checked); if (event.target.checked) persist(answers, true); else clear(); }} /><span>{zh ? displayText("在本标签页临时保存进度，刷新或换语言后可主动恢复；24小时后失效，完成、清除或重测即删除。") : "Save progress in this tab so I can resume after a refresh or language change. It expires after 24 hours and clears on completion, exit-and-clear or retake."}</span></label></QuestionnaireLegacyControl>
      <QuestionnaireLegacyControl><button className="mt-3 min-h-11 text-sm underline" onClick={() => { clear(); setAnswers({}); setSaving(false); setStage("welcome"); setMessage(""); }}>{zh ? displayText("退出并清除本次进度") : "Exit and clear this attempt"}</button></QuestionnaireLegacyControl>
    </>}
    {stage === "result" && result.status === "complete" && <>
      {miniVirtues?.model === "dual" ? <QuestionnaireSevenSinsOverview result={miniVirtues} locale={locale} headingRef={heading} /> :
      <h2 ref={heading} tabIndex={-1} className="text-3xl font-semibold leading-tight outline-none [overflow-wrap:anywhere] scroll-mt-24">{miniVirtues ? (zh ? "七宗罪与七美德测试结果" : "Seven Sins and Virtues: Your Results") : profile?.title[locale] ?? quiz.resultHeading?.[locale] ?? (zh ? displayText(`${quiz.title.zh}：完整结果`) : `${quiz.title.en}: your complete result`)}</h2>}
      {directional && profile && <>
      <div className={resultStyles.readingFlow} data-result-reading-flow={quiz.slug}>
        {!adultAgePreferences && <ResultOverview eyebrow={directionEyebrow} title={profile.headline[locale]} description={profile.summary[locale]} />}
        {showDirectionCounts && directionCounts}
        {adultAgePreferences && <div className="space-y-1 border-t border-slate-200 px-5 py-3 sm:px-6">
          <a className="inline-flex min-h-11 items-center font-semibold underline underline-offset-4" href={`/og/fun/adult-age-preferences?locale=${locale}&portrait=${profile.id}&v=${quiz.version}-art`} target="_blank" rel="noreferrer">{zh ? "打开结果分享图" : "Open result share card"}</a>
          <p className="text-sm leading-6 text-slate-600">{zh ? "分享图和链接只展示公开结果类别，不含你的答案、次数或个人资料。" : "The card and link show only the public result category, with no answers, counts, or personal details."}</p>
        </div>}
        <div className={resultStyles.profileBody}>
          <QuestionnaireResultReading quizSlug={quiz.slug} profile={profile} locale={locale} showHeadline={false} showSummary={false} mode="result" previewSectionIds={directionReading?.previews} />
        </div>
      </div>
      {!showDirectionCounts && <details className={resultStyles.fullReading}>
        <summary>{zh ? "查看各方向的原始选择次数" : "View the raw counts for every direction"}</summary>
        {directionCounts}
      </details>}
      <Link prefetch={false} className="my-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)} target={preserveResultOnGuideOpen ? "_blank" : undefined} rel={preserveResultOnGuideOpen ? "noopener" : undefined}>{zh ? "阅读这项结果的公开说明" : "Read the public explanation of this result"}{preserveResultOnGuideOpen && (zh ? "（新标签页）" : " (new tab)")}</Link>
      </>}
      <QuestionnaireResultSections {...reportProps} />
      {["hogwarts-house-quiz", "love-languages", "hazbin-hotel-character-quiz", "hello-kitty", "love-type-16", "spirit-animal", "moral-alignment"].includes(quiz.slug) && <EightQuizPersonalCard quiz={quiz} result={result} locale={locale} />}
      {(quiz.slug === "cyberpunk-edgerunners" || quiz.slug === "chiikawa") && archetypes && <p className="mt-4 text-sm leading-6">
        {archetypes.profileIds.length === 1
          ? (zh ? displayText("分享会复制角色名和公开指南链接，不包含答卷或次数。") : "Sharing copies the character name and public guide link, without your answers or counts.")
          : (zh ? displayText("分享会复制全部并列角色的名称和测试入口，不包含答卷或次数。") : "Sharing copies all tied character names and the quiz link, without your answers or counts.")}
      </p>}
      {miniVirtues?.model === "dual" && <SevenSinsPersonalCard result={miniVirtues} locale={locale} formCode={quiz.source.formCode} />}
      <div data-mini-virtues-actions={miniVirtues ? "true" : undefined} className={miniVirtues ? "flex flex-wrap gap-3" : resultStyles.runnerActions}><button className={button} onClick={copy}>{traditionalEntryShare || quiz.slug === "hsp-sensitivity-quiz" || adexi14 || ptq15 || miniFriction || interactionPairs || extraversionUnscored || affection || attachment || distributedWork || workRole || skillsEvidence || quiz.slug === "work-traits-reflection" || quiz.slug === "work-activity-interests" || quiz.slug === "interpersonal-preferences" || quiz.slug === "everyday-control-style" || loveType16 || mentalAge || quiz.kind === "fds32" || quiz.slug === "energy-flow" || quiz.slug === "cognitive-functions-test" || quiz.slug === "cultural-dimensions" || quiz.slug === "food-choice" || quiz.slug === "values-assessment" || quiz.slug === "eq-dashboard" || miniVirtues || quiz.slug === "euphoria-character-quiz" ? (zh ? displayText("复制公开入口") : "Copy public entry") : preparationActions20 ? (zh ? "复制五份公开指南链接" : "Copy five public guide links") : (zh ? displayText("复制结果与链接") : "Copy result and link")}</button><button className={button} onClick={() => start()}>{zh ? displayText("重新测试") : "Retake test"}</button></div>
      {adultAgePreferences && <Link prefetch={false} className="mt-3 inline-flex min-h-11 items-center underline underline-offset-4" href={questionnairePath(locale, quiz.slug)}>{zh ? "返回测试介绍" : "Back to quiz introduction"}</Link>}
      {manualCopy && <textarea readOnly aria-label={zh ? displayText("手动复制结果") : "Result text for manual copying"} value={manualCopy} onFocus={e => e.target.select()} className="mt-4 min-h-40 w-full rounded border p-3" />}
    </>}
    {message && <p role="status" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm leading-7">{message}</p>}
  </section>;
}

export type QuestionnaireClientProps = Omit<Parameters<typeof QuestionnaireRunner>[0], "scoreQuestionnaire">;
