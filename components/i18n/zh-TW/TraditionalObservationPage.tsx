import Link from "next/link";
import { notFound } from "next/navigation";
import { QuestionnaireTakeDocument } from "@/components/questionnaires/QuestionnaireTakeDocument";
import { TraditionalQuestionnaireCopy } from "@/components/questionnaires/TraditionalQuestionnaireCopy";
import { loadTraditionalObservation } from "@/lib/i18n/zh-TW/observationQuestionnaires";
import { questionnaireGuidePath, questionnairePath } from "@/lib/questionnaires/paths";
import { loadTraditionalAssessmentText } from "@/lib/tests/traditionalAssessmentDisplay";

const pages = {
  "care-feelings-reflection": () => import("@/components/questionnaires/CareFeelingsPage").then(module => ({ Page: module.CareFeelingsPage, Guide: module.CareFeelingsGuidePage })),
  "connection-belonging-check-in": () => import("@/components/questionnaires/ConnectionCheckInPage").then(module => ({ Page: module.ConnectionCheckInPage, Guide: module.ConnectionCheckInGuidePage })),
  "disconnection-experiences-reflection": () => import("@/components/questionnaires/DisconnectionPage").then(module => ({ Page: module.DisconnectionPage, Guide: module.DisconnectionGuidePage })),
  "emotions-connections-reflection": () => import("@/components/questionnaires/EmotionsConnectionsPage").then(module => ({ Page: module.EmotionsConnectionsPage, Guide: module.EmotionsConnectionsGuidePage })),
  "feelings-connection-reflection": () => import("@/components/questionnaires/FeelingsConnectionPage").then(module => ({ Page: module.FeelingsConnectionPage, Guide: module.FeelingsConnectionGuidePage })),
  "social-context-reflection": () => import("@/components/questionnaires/SocialContextPage").then(module => ({ Page: module.SocialContextPage, Guide: module.SocialContextGuidePage })),
  "communication-routines-context": () => import("@/components/questionnaires/CommunicationRoutinesPage").then(module => ({ Page: module.CommunicationRoutinesPage, Guide: module.CommunicationRoutinesGuidePage })),
  "focus-energy-context-reflection": () => import("@/components/questionnaires/FocusContextPage").then(module => ({ Page: module.FocusContextPage, Guide: module.FocusContextGuidePage })),
  "number-context-reflection": () => import("@/components/questionnaires/NumberContextPage").then(module => ({ Page: module.NumberContextPage, Guide: module.NumberContextGuidePage })),
  "spatial-thinking-reflection": () => import("@/components/questionnaires/SpatialContextPage").then(module => ({ Page: module.SpatialContextPage, Guide: module.SpatialContextGuidePage })),
  "unfamiliar-experiences-reflection": () => import("@/components/questionnaires/UnfamiliarPage").then(module => ({ Page: module.UnfamiliarPage, Guide: module.UnfamiliarGuidePage })),
  "written-language-context-reflection": () => import("@/components/questionnaires/WrittenLanguagePage").then(module => ({ Page: module.WrittenLanguagePage, Guide: module.WrittenLanguageGuidePage })),
};

export async function TraditionalObservationPage({ slug, take, profile }: { slug: string; take: boolean; profile?: string }) {
  if (!Object.hasOwn(pages, slug)) notFound();
  const [item, { Page, Guide }, copy] = await Promise.all([
    loadTraditionalObservation(slug), pages[slug as keyof typeof pages](), loadTraditionalAssessmentText(),
  ]);
  if (!item) notFound();
  const { source, quiz, sections, faq, summaries } = item;
  const entry = questionnairePath("zh-TW", slug);
  if (take) return <TraditionalQuestionnaireCopy>
    <QuestionnaireTakeDocument quiz={quiz} locale="zh" landing={entry}>
      <Page quiz={quiz} locale="zh" displayLocale="zh-TW" scoringQuiz={source} take />
    </QuestionnaireTakeDocument>
  </TraditionalQuestionnaireCopy>;

  const selected = profile ? quiz.profiles.find(item => item.id === profile) : undefined;
  if (profile && !selected) notFound();
  return <>
    <nav aria-label="測驗語言" className="flex flex-wrap gap-5 text-sm">
      {(["zh", "en"] as const).map(locale => <Link key={locale} lang={locale === "zh" ? "zh-CN" : "en"}
        className="min-h-11 py-2 underline" href={selected ? questionnaireGuidePath(locale, slug, selected.id) : questionnairePath(locale, slug)}>
        {locale === "zh" ? "简体中文" : "English"}
      </Link>)}
    </nav>
    {selected
      ? <Guide quiz={quiz} profile={selected} locale="zh" displayLocale="zh-TW" copy={copy} summaries={summaries} />
      : <Page quiz={quiz} locale="zh" displayLocale="zh-TW" copy={copy} sections={sections} faq={faq} summaries={summaries} />}
  </>;
}
