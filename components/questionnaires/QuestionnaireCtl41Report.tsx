import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Ctl41Result } from "@/lib/questionnaires/ctl41";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireCtl41Report({ quiz, result, locale }: {
  quiz: Questionnaire; result: Extract<Ctl41Result, { status: "complete" }>; locale: Locale;
}) {
  const zh = locale === "zh";
  return <div className="my-6 space-y-8" data-ctl41-result>
    <p className="leading-8">{zh
      ? "四十一项有效选择已齐。六个源领域分别显示计分和与均值，不合总分、不排名领域、不划爱的能力等级或伴侣匹配。均值范围相同不证明心理单位相同，同分和近分均保留。"
      : "All forty-one valid choices are complete. Six source domains show separate keyed sums and means, without an overall score, domain ranking, love-capacity level or partner match. A shared numeric range does not establish common psychological units; close and equal means remain visible."}</p>
    {result.ctl41.map(part => {
      const direction = quiz.directions.find(d => d.id === part.id)!;
      const profile = quiz.profiles.find(p => p.id === part.profileId)!;
      return <section key={part.id} className="rounded-lg border border-slate-200 p-4 sm:p-6"
        data-ctl41-part={part.id} aria-labelledby={`ctl41-${part.id}`}>
        <h3 id={`ctl41-${part.id}`} className="text-xl font-semibold">{direction.title[locale]}</h3>
        <p data-ctl41-score={part.id} className="my-4 rounded-lg bg-slate-50 p-4 font-semibold">{zh
          ? `本域${part.itemCount}题计分和：${part.rawSum}（范围${part.itemCount}—${part.itemCount * 4}）；计分均值：${part.mean.toFixed(2)}（范围1—4）。`
          : `${part.itemCount}-item keyed sum: ${part.rawSum} (range ${part.itemCount}–${part.itemCount * 4}); keyed mean: ${part.mean.toFixed(2)} (range 1–4).`}</p>
        <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`ctl41-report-${part.id}`} />
        <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读本领域完整公开指南" : "Read this domain’s full public guide"}</Link>
      </section>;
    })}
    <p className="leading-8">{zh
      ? "英文按2018表一，中文为费马新工作译；源德语和波兰语研究不验证本显示或译文。PSP两题为一般陈述，不评个人性功能或取向；信任不要求披露，哀伤不设期限或新关系要求。"
      : "English follows the 2018 Table 1 and Chinese is a new FermatMind working translation; the source German and Polish research does not validate these displays or translation. The two PSP items are general statements, not personal sexual functioning or orientation. Trust requires no disclosure, and mourning has no deadline or requirement for a new relationship."}</p>
  </div>;
}

export function QuestionnaireCtl41NextSteps({ locale }: { locale: Locale }) {
  return <section className="mt-10 border-t pt-7"><h3 className="text-xl font-semibold">{locale === "zh" ? "选择一个自愿阅读话题，或结束" : "Choose an optional reading topic, or finish"}</h3>
    <p className="my-4 leading-8">{locale === "zh"
      ? "可以分别回看六份完整指南，私下保留一项观察或未知，也可不行动。本结果不换算MBTI、三角爱、嫉妒或伴侣匹配。无需披露、联系、性活动、原谅或继续关系；安全与拒绝无需测试许可。"
      : "You may reread the six full guides separately and keep one private observation or unknown, or take no action. Results do not convert to MBTI, triangular love, jealousy or partner match. No disclosure, contact, sexual activity, forgiveness or continuation is required; safety and refusal need no test’s permission."}</p>
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests/explore/capacity-to-love-test#questionnaire-results`}>{locale === "zh" ? "回看六份完整指南" : "Reread all six full guides"}</Link><br />
    <Link prefetch={false} className="inline-block min-h-11 py-2 underline" href={`/${locale}/tests#more-tests`}>{locale === "zh" ? "返回全部测试" : "Back to all tests"}</Link>
  </section>;
}
