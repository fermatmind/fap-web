import Link from "next/link";
import { ExploreTestIntro } from "@/components/tests/ExploreTestIntro";
import { FantasyRoster } from "@/components/questionnaires/FantasyRoster";
import { QuestionnaireTakeEntry } from "@/components/questionnaires/QuestionnaireTakeEntry";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";

export function FantasyQuestionnaireLanding({ quiz }: { quiz: Questionnaire }) {
  const [method] = quiz.guide;
  return <div className="mx-auto max-w-3xl space-y-8">
    <ExploreTestIntro slug={quiz.slug} locale="zh">
      <h1 className="mt-3 text-4xl font-semibold leading-tight">{quiz.title.zh}</h1>
      <p className="mt-5 text-lg leading-8">{quiz.description.zh}</p>
      <p className="explore-intro-meta"><span>{quiz.questions.length} 題 · 約 {quiz.minutes} 分鐘 · 無需註冊</span><span>原創象徵測驗 · 完整結果免費</span></p>
      <QuestionnaireTakeEntry quiz={quiz} locale="zh" displayLocale="zh-TW" />
    </ExploreTestIntro>
    <FantasyRoster quiz={quiz} locale="zh" displayLocale="zh-TW" />
    <section className="space-y-3 leading-8" aria-labelledby="questionnaire-purpose">
      <h2 id="questionnaire-purpose" className="text-2xl font-semibold">這份問卷探索什麼？</h2>
      <p>{quiz.introduction.zh}</p>
    </section>
    <section className="space-y-3 leading-8" aria-labelledby="questionnaire-method">
      <h2 id="questionnaire-method" className="text-2xl font-semibold">計分怎樣產生結果？</h2>
      {method && <><h3 className="text-xl font-semibold">{method.title.zh}</h3>{method.paragraphs.map((item, index) => <p key={index}>{item.zh}</p>)}</>}
    </section>
    <section className="space-y-3" aria-labelledby="questionnaire-results">
      <h2 id="questionnaire-results" className="text-2xl font-semibold">全部結果說明</h2>
      <ul className="grid gap-4 sm:grid-cols-2">
        {quiz.profiles.map(profile => <li key={profile.id} className="rounded-lg border p-4">
          <Link href={questionnaireGuidePath("zh-TW", quiz.slug, profile.id)} className="inline-block min-h-11 py-2 font-semibold underline">{profile.title.zh}</Link>
          <p className="leading-7">{profile.summary.zh}</p>
        </li>)}
      </ul>
    </section>
    <section className="space-y-4 leading-8" aria-labelledby="questionnaire-faq">
      <h2 id="questionnaire-faq" className="text-2xl font-semibold">關於這項測驗</h2>
      {quiz.faq.map((entry, index) => <div key={index}><h3 className="text-xl font-semibold">{entry.question.zh}</h3><p>{entry.answer.zh}</p></div>)}
    </section>
    <details className="space-y-4 leading-8" id="questionnaire-reading-scope">
      <summary className="min-h-11 cursor-pointer py-2 font-semibold">題本、結果讀法與使用範圍</summary>
      {quiz.guide.map(section => <section key={section.id}>
        <h3 className="text-xl font-semibold">{section.title.zh}</h3>
        {section.paragraphs.map((paragraph, index) => <p key={index}>{paragraph.zh}</p>)}
      </section>)}
    </details>
  </div>;
}
