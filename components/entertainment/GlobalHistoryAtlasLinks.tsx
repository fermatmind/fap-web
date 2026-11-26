import Link from "next/link";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { historyAtlasCopy } from "@/lib/entertainment/global-history/atlas";
import { GLOBAL_HISTORY_ATLAS_SLUGS, globalHistoryAtlasPath, globalHistoryResultPath } from "@/lib/entertainment/global-history/config";
import { globalHistoryGeoEditorial } from "@/lib/entertainment/global-history/geo-editorial";
import { historyPeople } from "@/lib/entertainment/global-history/people";
import { getHistoryResult, resultCopy } from "@/lib/entertainment/global-history/result-v2";
import { displayHistoryPerson } from "@/lib/entertainment/global-history/traditional-roster";

const mbtiType = /^[ie][ns][ft][jp]$/i;

export function GlobalHistoryAtlasLinks({ locale }: { locale: DisplayLocale }) {
  return <nav aria-label={resultCopy("历史人物资料库", "歷史人物資料庫", "Historical figure reference archives")[locale]} className="flex flex-wrap gap-x-6 gap-y-2">
    {GLOBAL_HISTORY_ATLAS_SLUGS.map(atlas => <Link className="underline underline-offset-4" key={atlas}
      href={globalHistoryAtlasPath(locale, atlas)} prefetch={false}>{historyAtlasCopy[atlas].title[locale]}</Link>)}
  </nav>;
}

export function GlobalHistoryTypeFigures({ locale, type }: { locale: DisplayLocale; type: string }) {
  if (!mbtiType.test(type)) return null;
  const code = type.toUpperCase();
  const lang = locale === "en" ? "en" : "zh";
  const candidates = historyPeople.flatMap(person => {
    const result = getHistoryResult(person);
    if (result?.personality_benchmark.inferred_mbti !== code) return [];
    return [{ person, result, detail: globalHistoryGeoEditorial[person.id] }];
  });
  const figures = candidates.sort((a, b) => Number(Boolean(b.detail)) - Number(Boolean(a.detail))).slice(0, 8);
  if (!figures.length) return null;
  const heading = resultCopy(`历史人物中的 ${code} 传记原型`, `歷史人物中的 ${code} 傳記原型`, `Historical figures read as ${code}`)[locale];
  return <section aria-label={heading} data-history-type-figures={code} className="my-8 rounded-2xl border p-5">
    <h2>{heading}</h2>
    <p>{resultCopy(
      "下面是费马以人物经历和作品为依据的传记解读，供比较具体做法。",
      "以下是費馬依人物經歷和作品所做的傳記解讀，供比較具體做法。",
      "FermatMind uses episodes from these lives and works to illustrate an editorial interpretation.",
    )[locale]}</p>
    <ul className="grid gap-3 sm:grid-cols-2">
      {figures.map(({ person, result, detail }) => <li className="rounded-lg border p-3" key={person.id}>
        <Link className="font-semibold underline" href={globalHistoryResultPath(locale, person.id)} prefetch={false}>
          {displayHistoryPerson(person, locale).name[lang]}
        </Link>
        <p>{detail?.decision.fact[locale] ?? result.superpower[locale]}</p>
      </li>)}
    </ul>
    <Link className="underline underline-offset-4" href={`${globalHistoryAtlasPath(locale, "personality-atlas")}?type=${code}#atlas-rows`} prefetch={false}>
      {resultCopy(`浏览全部 ${code} 历史人物`, `瀏覽所有 ${code} 歷史人物`, `Browse all ${code} figures in the atlas`)[locale]}
    </Link>
  </section>;
}
