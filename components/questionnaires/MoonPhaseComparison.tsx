import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";
import { moonPhaseDisplayCopy, moonPhasePresentations, moonPhaseImage, moonPhaseDiagramNote, type MoonPhaseId } from "@/lib/questionnaires/moonPhasePresentation";
import { questionnaireGuidePath } from "@/lib/questionnaires/paths";

/** The existing eight editorial metaphors in lunar order, without assigning a result. */
export function MoonPhaseComparison({ locale, selected = [], result = false, traditionalCopy }: { locale: Locale; traditionalCopy?: (text: string) => string; selected?: string[]; result?: boolean }) {
  const copy = moonPhaseDisplayCopy(traditionalCopy);
  const displayLocale = traditionalCopy ? "zh-TW" : locale;
  const zh = locale === "zh", id = result ? "moon-phase-result-comparison" : "moon-phase-comparison";
  return <section id={id} aria-labelledby={`${id}-title`} data-moon-phase-comparison className="my-8 space-y-4 rounded-xl border border-slate-200 bg-white p-5 text-slate-950">
    <h2 id={`${id}-title`} className="text-2xl font-semibold">{zh ? copy("八种月相意象，一起看看") : "Compare all eight moon phase images"}</h2>
    <p className="text-sm leading-7">{zh ? copy("先比较八种做法，再打开想读的完整指南。这些意象说明本问卷中的选择，不是必须依次完成的阶段。") : "Compare the approaches, then open any full guide. These images describe choices in this quiz; they are not a sequence you need to follow."}</p>
    <ol className="grid grid-cols-2 gap-3 sm:grid-cols-4">{(Object.keys(moonPhasePresentations) as MoonPhaseId[]).map(key => {
      const phase = moonPhasePresentations[key];
      return <li key={key} data-moon-phase-comparison-id={key} className="flex flex-col rounded-lg border border-slate-200 p-3">
        <Image unoptimized src={moonPhaseImage(key)} width={80} height={80} alt="" className="mb-3 size-16 rounded-lg" />
        <h3 className="font-semibold leading-6">{copy(phase.name[locale])}</h3>
        {selected.includes(key) && <p className="mt-1 text-xs font-semibold text-teal-800">{zh ? copy("本次最高项") : "Your top count"}</p>}
        <p className="my-2 flex-1 text-sm leading-6">{copy(phase.conclusion[locale])}</p>
        <Link prefetch={false} aria-label={(zh ? copy(`阅读${phase.name.zh}完整指南`) : `Read the full ${phase.name.en} guide`) + (result ? (zh ? copy("（新标签页）") : " (new tab)") : "")} className="inline-flex min-h-11 items-center text-sm font-semibold underline" href={questionnaireGuidePath(displayLocale, "moon-phase", key)} target={result ? "_blank" : undefined} rel={result ? "noopener" : undefined}>{zh ? copy("阅读完整指南") : "Read the full guide"}{result && (zh ? copy("（新标签页）") : " (new tab)")}</Link>
      </li>;
    })}</ol>
    <div className="space-y-2 border-t border-slate-200 pt-4" data-moon-phase-reading-help>
      <details><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("还没作答，也能先比较八种月相吗？") : "Can I compare all eight phases before taking the test?"}</summary><p className="text-sm leading-7">{zh ? copy("可以。在‘八种月相意象，一起看看’中查看每种意象的简短说明，再点‘阅读完整指南’。这些是通用说明，不是你的个人测试结果。") : "Yes. Use ‘Compare all eight moon phase images’ for the short descriptions, then choose ‘Read the full guide’. These are general descriptions, not your personal test result."}</p></details>
      <details><summary className="min-h-11 cursor-pointer py-2 font-semibold">{zh ? copy("怎样打开每一项并列结果的完整说明？") : "How do I open the full reading for each tied match?"}</summary><p className="text-sm leading-7">{zh ? copy("结果总览会保留全部最高项。在任一项下打开‘展开这项完整解读’，即可阅读该项全部内容；也可以前往对应的公共指南。只读其中一项，不会取消其他并列结果。") : "Every highest match stays in the result overview. Open ‘Read this match in full’ beneath any match, or follow its public guide. Reading one match does not remove the others."}</p></details>
    </div>
    <p className="text-xs leading-6 text-slate-600">{copy(moonPhaseDiagramNote[locale])}</p>
  </section>;
}
