import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";

export const hasFantasyArtwork = (slug: string) => ["soldier-poet-king-quiz", "avatar-bender-quiz", "patronus-quiz"].includes(slug);

export function FantasyPortrait({ slug, id, name, large = false }: { slug: string; id: string; name: string; large?: boolean }) {
  return <Image unoptimized src={`/images/quiz-portraits/${slug}/${id}.svg`} width={480} height={480} alt={name} className={large ? "my-4 size-56 max-w-full rounded-2xl" : "size-24 shrink-0 rounded-xl"} />;
}

export function FantasyRoster({ quiz, locale, preserveResult = false }: { quiz: Questionnaire; locale: Locale; preserveResult?: boolean }) {
  if (!hasFantasyArtwork(quiz.slug)) return null;
  return <section className="my-8" aria-label={locale === "zh" ? "比较全部结果" : "Compare all results"}>
    <h2 className="text-2xl font-semibold">{locale === "zh" ? "先认识不同结果" : "Meet the different results"}</h2>
    <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{quiz.profiles.map(profile => <article key={profile.id} className="rounded-xl border border-slate-200 p-4">
      <FantasyPortrait slug={quiz.slug} id={profile.id} name={profile.title[locale]} />
      <h3 className="mt-3 text-xl font-semibold"><Link prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, profile.id)} target={preserveResult ? "_blank" : undefined} rel={preserveResult ? "noopener" : undefined} className="inline-flex min-h-11 items-center underline">{profile.title[locale]}{preserveResult && <span className="sr-only">{locale === "zh" ? "（新标签页）" : " (new tab)"}</span>}</Link></h3>
      <p className="mt-2 leading-7">{profile.headline[locale]}</p>
    </article>)}</div>
  </section>;
}
