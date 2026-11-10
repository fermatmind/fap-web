import type { Locale } from "@/lib/i18n/locales";

export function QuestionnairePpsAttribution({ locale, traditional = false }: { locale: Locale; traditional?: boolean }) {
  const zh = locale === "zh";
  return <aside data-pps-attribution className="my-6 space-y-3 rounded-lg border border-slate-200 bg-white p-4 text-sm leading-7" aria-label={traditional ? "PPS 題目來源與授權" : zh ? "PPS条目来源与许可" : "PPS item source and licence"}>
    <p>{traditional ? "題目來源為 Christian Blötner（2026）的" : zh ? "条目：Christian Blötner（2026），" : "Items: Christian Blötner (2026), "}<a className="underline" href="https://link.springer.com/article/10.1007/s12144-026-09519-2">Valuing others over oneself: development and validation of a people pleasing scale in two German samples</a>{traditional ? "，最終 10 題見" : zh ? "，最终10条见" : ", final ten items in "}<a className="underline" href="https://link.springer.com/article/10.1007/s12144-026-09519-2/tables/1">Table 1</a>{traditional ? "，依" : zh ? "；按" : "; used under "}<a className="underline" href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>{traditional ? " 授權使用。" : zh ? "使用。" : "."}</p>
    <p>{traditional ? "網站英文版沿用作者提供的英文題目。費馬翻譯簡體中文及臺灣繁體中文，並加入 NA 選項、中間選項標籤、最低有效題數、取到小數點後一位的平均分數及原創解說。原研究只施測德文版，本站各語言版本、缺答規則與解說尚未經本地驗證，也沒有常模或作者背書。" : zh ? "保留作者提供英文；费马独立翻译中文，并加入NA、中间标签、最低条数、一位小数均分与原创解释。原研究只实际施测德文，本站英中文、缺失规则与解释未做本地验证，没有常模，也不代表作者背书。" : "Author-provided English is retained. FermatMind independently translated Chinese and added NA, intermediate labels, minimum counts, one-decimal means and original explanations. The studies administered German only; website English–Chinese forms, missing-data rules and interpretations have no local validation or norms, and imply no author endorsement."}</p>
  </aside>;
}
