import Link from "next/link";
import { QuestionnaireReport } from "./QuestionnaireReport";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import type { AttachmentResult } from "@/lib/questionnaires/attachment";
import type { Questionnaire } from "@/lib/questionnaires/types";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireAttachmentReport({ quiz, result, locale }: { quiz: Questionnaire; result: Extract<AttachmentResult, { status: "complete" }>; locale: Locale }) {
  const zh = locale === "zh", anxiety = result.attachmentAxes.anxiety.mean, avoidance = result.attachmentAxes.avoidance.mean;
  return <div className="my-6 space-y-8">
    <section className="space-y-4 rounded-lg bg-slate-50 p-4" aria-labelledby="attachment-axes-title">
      <h3 id="attachment-axes-title" className="text-xl font-semibold">{zh ? "两项连续自评，不派固定类型" : "Two continuous summaries without a fixed type"}</h3>
      <dl className="space-y-5">{quiz.directions.map(direction => {
        const axis = result.attachmentAxes[direction.id];
        return <div key={direction.id} data-attachment-axis={direction.id} className="flex flex-wrap justify-between gap-3"><dt className="font-medium">{direction.title[locale]}</dt><dd><span data-attachment-mean>{axis.mean === null ? (zh ? "资料不足" : "Insufficient information") : `${axis.mean.toFixed(1)} / 5`}</span><span className="block text-sm text-slate-600">{zh ? `${axis.rated} / 12条有效评分` : `${axis.rated} / 12 rated items`}</span></dd></div>;
      })}</dl>
      <p className="text-sm leading-7">{zh ? "每轴12题，4条反向题按6减回答；至少8条有效评分才显示均分。NA不补零，资料不足保留，不合成安全总分、常模或百分位。均分只概括本组题目，不判断担心是否有现实理由、对方的意愿或关系安全。" : "Each axis has 12 items, with four reversed as six minus the response. At least eight ratings are needed for a mean. Unscored responses are never zero; insufficient information stays explicit. There is no security total, norm or percentile. Means summarise this item set, not whether a concern has real grounds, a partner’s wishes or relationship safety."}</p>
      {anxiety === null && avoidance === null && <p className="leading-8" data-attachment-insufficient>{zh ? "本次作答已结束，未生成两维个人均分。可以重新测试，下面四份完整公开说明仍可阅读。" : "This attempt is finished without personal means on either dimension. You can retake it; all four full public guides remain available below."}</p>}
      {anxiety !== null && avoidance !== null && <figure className="mx-auto max-w-md" data-attachment-map>
        <svg viewBox="0 0 320 300" role="img" aria-label={zh ? `本次两维位置：关系担心${anxiety.toFixed(1)}，亲近退缩${avoidance.toFixed(1)}，两轴范围1至5，无类型分区。` : `This attempt: worry ${anxiety.toFixed(1)}, distance ${avoidance.toFixed(1)}, each on a 1–5 response range without type regions.`} className="w-full">
          <path d="M55 45V235H280" fill="none" stroke="#64748b" strokeWidth="2" />
          {[1, 2, 3, 4, 5].map(tick => <g key={tick} fontSize="12" fill="#475569"><text x={55 + (tick - 1) * 55} y="254" textAnchor="middle">{tick}</text><text x="42" y={239 - (tick - 1) * 45} textAnchor="end">{tick}</text></g>)}
          <text x="55" y="25" fontSize="14" fill="#0f172a">{zh ? "关系担心" : "Relationship worry"}</text>
          <text x="166" y="280" fontSize="14" fill="#0f172a" textAnchor="middle">{zh ? "亲近退缩与距离" : "Distance from closeness"}</text>
          <circle cx={55 + (avoidance - 1) * 55} cy={235 - (anxiety - 1) * 45} r="6" fill="#6d28d9" stroke="white" strokeWidth="2" />
        </svg>
        <figcaption className="text-sm leading-7 text-slate-600">{zh ? "坐标只对应本组1—5回答范围，没有高低类型分区线或人群排名；中点3不是人群平均或健康标准。" : "Coordinates show only this item set’s 1–5 response range, without type boundaries or population ranks. Three is not a population average or health standard."}</figcaption>
      </figure>}
    </section>
    <p className="leading-8">{zh ? "以下四份成人风格原型说明全部完整呈现，帮助比较两维的不同组合。它们不是本次获派的个人类型；中间回答、接近的体验或资料不足不需要硬选一个标签。" : "All four full adult prototype guides follow to help compare combinations of the dimensions. They are not personal types assigned to this attempt. Middle-range responses, similar experiences or insufficient information need no forced label."}</p>
    {quiz.profiles.map(profile => <section key={profile.id} data-attachment-profile={profile.id} aria-labelledby={`attachment-title-${profile.id}`} className="rounded-lg border border-slate-200 p-4 sm:p-6">
      <h3 id={`attachment-title-${profile.id}`} className="mb-5 text-2xl font-semibold">{profile.title[locale]}</h3>
      <QuestionnaireReport profile={profile} locale={locale} headingLevel={4} idPrefix={`report-${profile.id}`} />
      <Link prefetch={false} className="mt-5 inline-block min-h-11 py-2 underline" href={questionnaireGuidePath(locale, quiz.slug, profile.id)}>{zh ? "阅读这种原型的公开说明" : "Read this prototype’s public guide"}</Link>
    </section>)}
  </div>;
}
