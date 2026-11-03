"use client";
import { useCallback, useState, useSyncExternalStore } from "react";
import type { Locale } from "@/lib/i18n/locales";
import type { DiscEntryDefinition } from "@/lib/questionnaires/discEntry";
import { scoreDirectionalQuestionnaire } from "@/lib/questionnaires/basicScoring";
import { readQuestionnaireDraftWithScorer } from "@/lib/questionnaires/draft";
import { questionnaireTrackingPayload } from "@/lib/questionnaires/tracking";
import { trackEvent } from "@/lib/analytics";
import { recordEntertainmentActivity } from "@/lib/entertainment/activity";
import { questionnaireModule } from "./QuestionnaireModule";
import { QuestionnaireWelcome, questionnaireButtonClass as button } from "./QuestionnaireWelcome";

const DiscAttempt = questionnaireModule<Parameters<typeof import("./DiscAttemptClient").default>[0]>(() => import("./DiscAttemptClient"));
const draftEvent = "fm-questionnaire-draft";
const subscribeReady = () => () => {};
function subscribe(listener: () => void) { window.addEventListener(draftEvent, listener); return () => window.removeEventListener(draftEvent, listener); }
export function DiscEntryClient({ quiz, locale }: { quiz: DiscEntryDefinition; locale: Locale }) {
  const zh = locale === "zh", key = `fm_questionnaire_draft:${quiz.slug}`;
  const ready = useSyncExternalStore(subscribeReady, () => true, () => false);
  const draft = useSyncExternalStore(subscribe, () => {
    try { const raw = sessionStorage.getItem(key); return readQuestionnaireDraftWithScorer(quiz, raw, scoreDirectionalQuestionnaire) ? raw : null; } catch { return null; }
  }, () => null);
  const [attempt, setAttempt] = useState<{ resume: boolean } | null>(null);
  const [loaded, setLoaded] = useState(false), [message, setMessage] = useState("");
  const onReady = useCallback(() => setLoaded(true), []);
  function clear() { try { sessionStorage.removeItem(key); } catch { /* Saving is optional. */ } window.dispatchEvent(new Event(draftEvent)); }
  function start(resume = false) {
    if (resume) {
      try { if (!readQuestionnaireDraftWithScorer(quiz, sessionStorage.getItem(key), scoreDirectionalQuestionnaire)) throw new Error("expired"); }
      catch { clear(); setMessage(zh ? "已存进度已过期或不可用，请开始新作答。" : "Saved progress expired or is unavailable. Start a new attempt."); return; }
    } else clear();
    setMessage(""); setLoaded(false); setAttempt({ resume });
    recordEntertainmentActivity(quiz.slug, quiz.version, locale, "start");
    trackEvent("start_test", questionnaireTrackingPayload(quiz, locale));
  }
  if (attempt) return <>
    {!loaded && <button type="button" data-disc-prepare-return className={button} onClick={() => { setAttempt(null); setLoaded(false); }}>{zh ? "返回作答说明" : "Back to answering instructions"}</button>}
    <DiscAttempt locale={locale} resume={attempt.resume} onReady={onReady} />
  </>;
  return <section id="take-test" data-stage="welcome" className="my-8 rounded-xl border border-violet-200 bg-white p-5 sm:p-8" aria-label={zh ? "作答与完整结果" : "Questionnaire and full results"}>
    <QuestionnaireWelcome quiz={quiz} locale={locale} ready={ready} hasDraft={Boolean(draft)} onStart={start} />
    {message && <p role="status" className="mt-5 rounded-lg bg-amber-50 p-3 text-sm leading-7">{message}</p>}
  </section>;
}
