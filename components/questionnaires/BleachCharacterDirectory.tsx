import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import type { Questionnaire } from "@/lib/questionnaires/types";
import { bleachPresentation, bleachPortraitPath } from "@/lib/questionnaires/bleachPresentation";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";
import { bleachDirectionNote } from "./BleachLandingEditorial";

export function BleachCharacterDirectory({ quiz, locale, publicGuide = false, result = false }: { quiz: Questionnaire; locale: Locale; publicGuide?: boolean; result?: boolean }) {
  const zh = locale === "zh", Heading = publicGuide ? "h2" : "h3";
  return <section id="bleach-character-directory" data-bleach-character-directory aria-labelledby="bleach-directory-title" className="scroll-mt-24 my-7 space-y-4 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">
    <Heading id="bleach-directory-title" className="text-2xl font-semibold">{zh ? "七角色对照：看看本版的不同读法" : "Compare all seven BLEACH character readings"}</Heading>
    <p className="text-sm leading-7 text-slate-600">{zh ? "不必重测。下面每个角色对应一类日常选择，可直接打开完整指南比较；这些是公开读法，不表示你获得了其余角色结果。" : "No retake needed. Each character groups a different everyday approach. Open any full guide to compare; these public readings do not assign you additional results."}</p>
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">{quiz.profiles.map(profile => {
      const person = bleachPresentation(profile.id);
      if (!person) return null;
      return <li key={profile.id} data-bleach-directory-character={profile.id}><Link prefetch={false} href={questionnaireGuidePath(locale, quiz.slug, profile.id)} target={result ? "_blank" : undefined} rel={result ? "noopener" : undefined} aria-label={(zh ? `阅读${person.name.zh}完整人物指南` : `Read ${person.name.en}’s full character guide`) + (result ? (zh ? "（新标签页）" : " (new tab)") : "")} className="flex h-full flex-col gap-2 rounded-lg border border-slate-200 p-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700">
        <Image unoptimized src={bleachPortraitPath(profile.id)} width={78} height={90} alt="" className="mx-auto h-24 w-auto rounded-lg" />
        <p className="font-semibold leading-6">{person.name[locale]}</p>
        <p className="text-sm leading-6 text-slate-600">{bleachDirectionNote(profile.id, locale)}</p>
        <span className="mt-auto inline-flex min-h-11 items-center text-sm font-semibold underline">{zh ? "查看完整指南" : "Read full guide"}{result && (zh ? "（新标签页）" : " (new tab)")}</span>
      </Link></li>;
    })}</ul>
  </section>;
}
