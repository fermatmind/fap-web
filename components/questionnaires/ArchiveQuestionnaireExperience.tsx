import { archive90Topic } from "@/lib/entertainment/archive90";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { canonicalUrl as publicGuideUrl } from "@/lib/site";
import { PublicGuideShare } from "./PublicGuideShare";
import Link from "next/link";
import { getArchiveExperience, getArchiveSnapshot } from "@/lib/entertainment/archiveExperience";
import type { DisplayLocale } from "@/lib/i18n/locales";

export function ArchiveReadingSnapshot({ slug, id, locale }: { slug: string; id: string; locale: DisplayLocale }) {
  const snapshot = getArchiveSnapshot(slug, id, locale);
  if (!snapshot) return null;
  const [line, ...traits] = snapshot;
  return (
    <div className="my-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4" data-archive-reading={id}>
      <p className="font-semibold leading-7">{line}</p>
      <ul className="flex flex-wrap gap-2">
        {traits.map(trait => <li key={trait} className="rounded-md bg-white px-2.5 py-1 text-sm leading-6">{trait}</li>)}
      </ul>
    </div>
  );
}

const nextCopy = {
  en: { heading: "Optional next step", boundary: "You can finish here. The other assessment has its own questions and uses only your new answers." },
  zh: { heading: "可选的下一步", boundary: "可以读到这里就结束。后续测评有独立题目，只根据你新作答的内容生成结果。" },
  "zh-TW": { heading: "想再多了解自己？", boundary: "你也可以在這裡結束。另一份測驗有自己的題目，會依你重新作答的內容提供結果。" },
} as const;

export function ArchiveQuestionnaireNextStep({ slug, locale }: { slug: string; locale: DisplayLocale }) {
  const next = getArchiveExperience(slug)?.next ?? archive90Topic(slug);
  if (!next) return null;
  const text = nextCopy[locale];
  return (
    <section className="mt-8 space-y-3 border-t border-slate-200 pt-6" data-archive-next-step>
      <h3 className="text-xl font-semibold">{text.heading}</h3>
      <p className="leading-7">{next.detail[locale]}</p>
      <p className="leading-7">{text.boundary}</p>
      <Link href={`/${locale}/tests/${next.slug}`} prefetch={false} referrerPolicy="no-referrer" className="inline-block min-h-11 py-2 font-semibold underline">
        {next.label[locale]}
      </Link>
    </section>
  );
}

export function Archive90GuideShare({ slug, id, locale }: { slug: string; id: string; locale: DisplayLocale }) {
  if (!archive90Topic(slug)) return null;
  return (
    <div className="mx-auto w-full max-w-3xl px-5 pb-8" data-archive-guide={id}>
      <PublicGuideShare url={publicGuideUrl(questionnaireGuidePath(locale, slug, id))} locale={locale} />
    </div>
  );
}
