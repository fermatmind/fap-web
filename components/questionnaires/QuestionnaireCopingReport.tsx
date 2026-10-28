import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { MiniCopingQuestionnaire, MiniCopingResult } from "@/lib/questionnaires/miniCoping";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

type Complete = Extract<MiniCopingResult, { status: "complete" }>;
export function QuestionnaireCopingReport({ quiz, result, locale }: { quiz: MiniCopingQuestionnaire; result: Complete; locale: Locale }) {
  const zh = locale === "zh";
  return <div data-coping-result className="my-6 space-y-8">
    <p className="leading-8">{zh ? "四组分别读，两侧各记录本组六次比较中的选择次数，合计六次。不合总分、跨组排名、综合类型、年龄或成熟等级。下方全文是每组的一般性读法，不从次数补出能力或健康结论。" : "Read the four groups separately. The two sides record choices within six comparisons and sum to six. There is no overall score, cross-group ranking, combined type, age or maturity grade. The complete texts below are general readings, without inferring ability or health from a count."}</p>
    {result.interactionPairs.map(pair => {
      const profile = quiz.profiles.find(p => p.id === pair.profileId)!;
      return <section key={pair.id} data-coping-pair={pair.id} aria-labelledby={`coping-${pair.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`coping-${pair.id}`} className="text-2xl font-semibold">{profile.title[locale]}</h3>
        <dl className="my-4 space-y-3" aria-label={zh ? "本组原始选择次数" : "Raw choices within this group"}>
          {profile.directionIds.map(id => <div key={id} data-coping-pole={id}>
            <dt>{quiz.directions.find(d => d.id === id)!.title[locale]}</dt>
            <dd data-coping-count className="font-semibold">{pair.counts[id]} / 6</dd>
          </div>)}
        </dl>
        <p data-coping-tie={pair.leaders.length === 2 ? "true" : "false"} className="mb-5 leading-8">{pair.leaders.length === 2
          ? (zh ? "两侧各三次，保留并列；不表示完美平衡或心理年龄居中，无需改答选赢家。" : "Three choices each: both sides remain tied. This is neither perfect balance nor an intermediate psychological age, and no answer needs changing to choose a winner.")
          : (zh ? "本组六次相对选择中一侧次数较多。较少的一侧仍有完整解释，不表示缺失或缺点，也不证明年龄、成熟度或能力。" : "One side has more selections within these six relative choices. The other side still has a full explanation and is not missing or a deficit; no count establishes age, maturity or ability.")}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`coping-report-${profile.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "单独阅读本组完整公开指南" : "Read this group’s complete public guide separately"}</Link>
      </section>;
    })}
    <aside role="note" className="rounded-lg border border-slate-200 p-4 leading-8"><p>{zh ? "原创题本与英文工作译文尚未完成心理测量学验证。选择可能随任务、资源、关系、隐私、健康与可支配时间变化；不同记录本身不证明改善、退步或年龄变化。" : "The original form and working English translation have not completed psychometric validation. Choices can change with tasks, resources, relationships, privacy, health and available time; different records do not by themselves establish improvement, deterioration or an age change."}</p><p className="mt-3">{zh ? "回答与本次记录只在当前页面内存中，刷新、换语或离开会清除。复制的公开指南链接不含次数或选项，不要求公开个人记录。" : "Responses and this record stay in current-page memory and clear on reload, language change or leaving. Copied public guide links contain no counts or options, and no personal record needs to be disclosed."}</p></aside>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </div>;
}
