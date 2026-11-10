import Image from "next/image";
import { RelatedFantasyQuizzes } from "./RelatedFantasyQuizzes";
import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";

export const hasFantasyArtwork = (slug: string) => ["soldier-poet-king-quiz", "avatar-bender-quiz", "patronus-quiz"].includes(slug);

export function FantasyPortrait({ slug, id, name, large = false }: { slug: string; id: string; name: string; large?: boolean }) {
  return <Image unoptimized src={`/images/quiz-portraits/${slug}/${id}.svg`} width={480} height={480} alt={name} className={large ? "my-4 size-56 max-w-full rounded-2xl" : "size-24 shrink-0 rounded-xl"} />;
}

export function FantasyRoster({ quiz, locale, preserveResult = false, displayLocale = locale }: { quiz: Questionnaire; locale: Locale; preserveResult?: boolean; displayLocale?: DisplayLocale }) {
  if (!hasFantasyArtwork(quiz.slug)) return null;
  const traditional = displayLocale === "zh-TW";
  const Heading = preserveResult ? "h3" : "h2", ItemHeading = preserveResult ? "h4" : "h3";
  return <section className="my-8" aria-label={traditional ? "比較全部結果" : locale === "zh" ? "比较全部结果" : "Compare all results"}>
    <Heading className="text-2xl font-semibold">{traditional ? "先認識不同結果" : locale === "zh" ? "先认识不同结果" : "Meet the different results"}</Heading>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(profile => <article key={profile.id} className="rounded-xl border border-slate-200 p-4">
      <FantasyPortrait slug={quiz.slug} id={profile.id} name={profile.title[locale]} />
      <ItemHeading className="mt-3 text-xl font-semibold"><Link prefetch={false} href={questionnaireGuidePath(displayLocale, quiz.slug, profile.id)} target={preserveResult ? "_blank" : undefined} rel={preserveResult ? "noopener" : undefined} className="inline-flex min-h-11 items-center underline">{profile.title[locale]}{preserveResult && <span className="sr-only">{traditional ? "（新分頁）" : locale === "zh" ? "（新标签页）" : " (new tab)"}</span>}</Link></ItemHeading>
      <p className="mt-2 leading-7">{profile.headline[locale]}</p>
    </article>)}</div>
    {!preserveResult && <RelatedFantasyQuizzes slug={quiz.slug} locale={locale} traditional={traditional} />}
  </section>;
}
