import Image from "next/image";
import type { Locale } from "@/lib/i18n/locales";
import type { QuestionnaireProfile } from "@/lib/questionnaires/types";
import { chapterPortraitPath, chapterScope } from "@/lib/questionnaires/spaceMarineChapters";

export function SpaceMarineChapterGuideIntro({ profile, locale }: {profile: QuestionnaireProfile; locale: Locale}) {
  return <section data-space-marine-guide-intro className="my-6 grid items-center gap-5 rounded-xl border border-slate-200 bg-slate-50 p-5 sm:grid-cols-[16rem_minmax(0,1fr)]">
    <Image unoptimized src={chapterPortraitPath(profile.id)!} width={768} height={768} alt={locale === "zh" ? `${profile.title.zh}的原创同人创作情境` : `Original fan creative scene for ${profile.title.en}`} className="h-auto w-full max-w-sm rounded-xl" />
    <div className="space-y-3"><h2 className="text-xl font-semibold">{locale === "zh" ? "这份战团指南怎样使用？" : "How should I use this Chapter guide?"}</h2><p className="leading-7">{chapterScope[locale]}</p><p className="text-sm leading-7 text-slate-600">{locale === "zh" ? "这是人人可读的公开指南，不表示你已取得该结果。完成测试后，个人页面会引用你真正选中的场景，解释对应关系。" : "This is a public guide anyone can read, without assigning this result to you. After answering, your personal page cites scenes you actually chose to explain the mapping."}</p></div>
  </section>;
}
