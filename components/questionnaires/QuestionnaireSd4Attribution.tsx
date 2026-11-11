import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireSd4Attribution({ locale, traditional = false }: { locale: Locale; traditional?: boolean }) {
  const zh = locale === "zh";
  return <section data-sd4-source className="my-6 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-7" aria-label={traditional ? "SD4 版本、來源與限制" : zh ? "SD4版本、来源与限制" : "SD4 version, source and limits"}>
    <p>{traditional ? "SD4 發表版共 28 題。英文題序、五個同意程度選項、每組七題的四個分量表與同向計分依作者原頁。題目沒有共同的回顧時段。繁體中文為本站試譯，本站譯文與使用者樣本尚未經心理計量驗證。" : zh ? "SD4发表版完整28题：英文顺序、五个认同选项、四组各七题与同向计分键依作者原页；无共同回忆时段。中文为本站工作译文，尚未完成中文或本站人群的心理测量验证。" : "Published SD4, all 28 items: English order, five agreement anchors, four seven-item subscales and direct keys follow the author’s page, with no common recall window. Chinese is our working translation, without psychometric validation for this translation or this website’s users."}</p>
    <p className="mt-3">{traditional ? "Paulhus、Buckels、Trapnell 與 Jones（2021），Screening for Dark Personalities。Paulhus 將 SD4 列為可自由使用的公有領域工具。本站加入不計分選項，任一題缺少有效分數，該組就不顯示平均分數。這項缺答處理方式尚未經原作者驗證。" : zh ? "Paulhus、Buckels、Trapnell与Jones（2021），Screening for Dark Personalities。Paulhus将SD4列为无需另行许可的公有领域工具。网站附加未评分选项，任一题缺失时不生成所属分量表均值；这不是原作者验证的缺失处理。" : "Paulhus, Buckels, Trapnell and Jones (2021), Screening for Dark Personalities. Paulhus lists SD4 in the public domain, available without permission. The website adds an unscored response and withholds a subscale mean if any rating is missing; this is not an author-validated missing-data procedure."}</p>
    <ul className="mt-3 list-disc space-y-2 pl-5">
      <li><a className="underline" href="https://www.erinbuckels.com/project/short-dark-tetrad-sd4/">{traditional ? "作者題本、五個選項與計分方式" : zh ? "作者题本、五选项与计分键" : "Author’s items, anchors and scoring key"}</a></li>
      <li><a className="underline" href="https://www2.psych.ubc.ca/~dpaulhus/Paulhus_measures/">{traditional ? "Paulhus 公有領域說明" : zh ? "Paulhus公有领域授权页" : "Paulhus public-domain permission page"}</a></li>
      <li><Link prefetch={false} className="underline" href={`/${traditional ? "zh-TW" : locale}/tests/explore/dark-triad`}>{traditional ? "Mini 18 題原創主題觀察：獨立版本，分數各自解讀" : zh ? "Mini 18题原创主题观察：独立版本，分数不换算" : "Original Mini 18-item reflection: a separate version, without score conversion"}</Link></li>
    </ul>
  </section>;
}
