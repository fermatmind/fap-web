import Link from "next/link";
import type { DisplayLocale, Locale } from "@/lib/i18n/locales";
import { philosopherPresentations } from "@/lib/questionnaires/philosopherPresentation";
import { PhilosopherPortrait } from "./PhilosopherPortrait";

export function PhilosopherRoster({ locale, displayLocale = locale, copy = value => value }: { locale: Locale; displayLocale?: DisplayLocale; copy?: (text: string) => string }) {
  const zh = locale === "zh";
  return <section className="my-8 space-y-4" aria-labelledby="philosopher-roster-title">
    <h2 id="philosopher-roster-title" className="text-2xl font-semibold">{zh ? copy("九位哲学家，九种提问起点") : "Nine thinkers, nine ways to start a question"}</h2>
    <p className="leading-7 text-slate-700">{zh ? copy("从名字和问题开始认识他们，也可以先读任何一份完整指南。以下为本站原创人物意象，并非经核实的历史容貌。") : "Meet the names and questions, or read any full guide first. These original editorial illustrations are imagined, not verified historical likenesses."}</p>
    <ul className="grid grid-cols-3 gap-3 sm:gap-5">{Object.entries(philosopherPresentations).map(([id, person]) => <li key={id}>
      <Link prefetch={false} href={`/${displayLocale}/tests/explore/philosopher-personality-test/results/${id}`} className="block space-y-2 rounded-xl border border-slate-200 bg-white p-2 text-center sm:p-3" data-philosopher-roster={id}>
        <PhilosopherPortrait id={id} locale={locale} copy={copy} />
        <span className="block min-h-11 text-sm font-semibold leading-6 underline underline-offset-4 sm:text-base">{copy(person.name[locale])}</span>
        <span className="hidden text-sm leading-6 text-slate-600 sm:block">{copy(person.conclusion[locale])}</span>
      </Link>
    </li>)}</ul>
  </section>;
}
