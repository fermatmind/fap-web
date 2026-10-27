import Link from "next/link";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { InteractionPairsResult } from "@/lib/questionnaires/interactionPairs";
import type { Locale } from "@/lib/i18n/locales";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { QuestionnaireReport } from "./QuestionnaireReport";

export function QuestionnaireInteractionPairsReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<InteractionPairsResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-interaction-pairs-result>
    <p className="leading-8">{zh
      ? "四组分别阅读，每组两侧次数之和为六。这里显示的是本题组的选择次数，不是魅力、人气、能力或百分位；四组不合成类型，也不跨组排名。"
      : "Read the four comparisons separately. Each pair sums to six choices from this bank, not charm, popularity, ability or a percentile. The groups do not form a combined type or a cross-group ranking."}</p>
    {result.interactionPairs.map(pair => {
      const profile = quiz.profiles.find(p => p.id === pair.profileId)!;
      return <section key={pair.id} data-interaction-pair={pair.id} aria-labelledby={`interaction-${pair.id}`}
        className="rounded-lg border border-slate-200 p-4 sm:p-6">
        <h3 id={`interaction-${pair.id}`} className="text-xl font-semibold">{profile.title[locale]}</h3>
        <dl className="my-4 space-y-3" aria-label={zh ? "本组原始选择次数" : "Raw choices within this comparison"}>
          {profile.directionIds.map(id => <div key={id} data-interaction-pole={id}>
            <dt>{quiz.directions.find(d => d.id === id)!.title[locale]}</dt>
            <dd className="font-semibold" data-interaction-count>{pair.counts[id]} / 6</dd>
          </div>)}
        </dl>
        <p className="mb-5 leading-8" data-interaction-tie={pair.leaders.length === 2 ? "true" : "false"}>{pair.leaders.length === 2
          ? (zh ? "两侧各三次，保留并列；这不证明完美平衡，也不需要改答来选出唯一方向。" : "Three choices each: both sides remain. A tie does not prove perfect balance, and you need not change answers to produce a single direction.")
          : (zh ? "本组一侧次数较多，只表示这六次相对选择；较少的一侧仍有完整解释，不表示缺失或缺点。" : "One side has more choices in this set of six. The less-selected side still has a full explanation and is not a deficit.")}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`interaction-report-${pair.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline"
          href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组完整公开指南" : "Read this comparison’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "本原创题本和新增英文译文尚未完成心理测量学验证。互动选择会随对象、场合、精力、文化和安全条件改变。可以只作私人观察，不要求披露、联系他人或改变边界。"
      : "This original bank and its new English translation have not completed psychometric validation. Choices may change with the person, setting, energy, culture and safety. Private observation is enough; no disclosure, contact or change of boundaries is required."}</p>
  </div>;
}
