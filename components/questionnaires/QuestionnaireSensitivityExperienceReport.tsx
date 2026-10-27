import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { FacetResult } from "@/lib/questionnaires/scoring";
import type { Locale } from "@/lib/i18n/locales";
export function QuestionnaireSensitivityExperienceReport({ quiz, result, locale }: {
  quiz: Questionnaire;
  result: Extract<FacetResult, { status: "complete" }>;
  locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-sensitivity-experience-result>
    <p className="leading-8">{zh
      ? "四组分别概括过去四周题述体验的自报发生频率。没有综合分、HSP判定线或主导类型；均分不能证明大脑机制、感官能力、共情准确性或与他人的差异。"
      : "The four groups separately summarize reported frequency of the listed experiences in the past four weeks. There is no overall score, HSP cutoff or dominant type. Means do not establish brain mechanisms, sensory ability, empathic accuracy or differences from other people."}</p>
    <p className="text-sm leading-7 text-slate-600">{zh
      ? "回答选项：1从不、2很少、3有时、4经常、5几乎总是。分母固定为六项；这些是回答的描述性均分，不是实际事件发生比例。"
      : "Response anchors: 1 Never, 2 Rarely, 3 Sometimes, 4 Often, 5 Almost always. The denominator is six items. These are descriptive response means, not proportions of actual events."}</p>
    {quiz.directions.map(direction => {
      const score = result.facets[direction.id], profile = quiz.profiles.find(p => p.directionIds[0] === direction.id)!;
      return <section key={direction.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-sensitivity-experience-part={direction.id} aria-labelledby={`sensitivity-experience-${direction.id}`}>
        <h3 id={`sensitivity-experience-${direction.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-sensitivity-experience-score={direction.id} className="my-4 font-semibold">{score.mean === null
          ? (zh ? `资料不足：${score.rated}/6题有数值回答；需要六题完整，不计算本组均分。` : `Insufficient information: ${score.rated}/6 items rated; all six are needed. No mean is calculated for this group.`)
          : (zh ? `近期体验频率均分：${score.mean.toFixed(1)} / 5（6/6题有效）` : `Recent-experience frequency mean: ${score.mean.toFixed(1)} / 5 (6/6 items rated)`)}</p>
        {score.mean === null && <p className="mb-4 text-sm leading-7 text-slate-600">{zh
          ? "没有相关机会、无法判断或选择不回答，均不转成零分，也不解释为没有情绪或感知。以下完整指南仍可阅读。"
          : "No relevant occasion, uncertainty or a choice not to answer never becomes a zero or evidence of absent emotion or perception. The complete guide remains readable below."}</p>}
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`sensitivity-experience-report-${direction.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本组完整公开指南" : "Read this group’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "这些原创双语题目与解释尚未建立信度、常模、因子结构或语言等价性。DOES只是概念背景，本页没有施测或改编原作者HSP量表。可以从一个真实情境和一个可撤回的小调整开始，也可以在这里结束。"
      : "These original bilingual questions and guides have no established reliability, norms, factor structure or language equivalence. DOES is conceptual background; this page does not administer or adapt the author’s HSP instruments. You can start with one actual situation and one reversible adjustment, or finish here."}</p>
  </div>;
}

export function QuestionnaireSensitivityExperienceNextSteps({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-sensitivity-experience-next-steps className="mt-10 border-t pt-7">
    <h3 className="text-xl font-semibold">{zh ? "本次作答已结束，下一步由你选择" : "This attempt is finished. Choose what comes next."}</h3>
    <p className="my-4 leading-7 text-slate-600">{zh
      ? "四份完整指南都已显示，包括资料不足的部分。可以挑一个有具体经历的情境，在自己的私人记录里比较一种可撤回的小调整；不需要寻找主导HSP类型，也无需继续作答。你可以回看指南、返回全部测试，或在这里结束。"
      : "All four full guides remain available, including parts with insufficient information. You can choose one situation you actually experienced and privately compare one reversible adjustment. There is no dominant HSP type to find and no need to continue testing. Review the guides, return to all tests or finish here."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/hsp-sensitivity-quiz#questionnaire-results`}>{zh ? "回看四份完整指南" : "Review all four full guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{zh ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
