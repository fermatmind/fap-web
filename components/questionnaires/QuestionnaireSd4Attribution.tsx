import Link from "next/link";
import type { Locale } from "@/lib/i18n/locales";

export function QuestionnaireSd4Attribution({ locale }: { locale: Locale }) {
  const zh = locale === "zh";
  return <section data-sd4-source className="my-6 rounded-lg border border-slate-200 bg-slate-50 p-5 text-sm leading-7" aria-label={zh ? "SD4版本、来源与限制" : "SD4 version, source and limits"}>
    <p>{zh ? "SD4发表版完整28题：英文顺序、五个认同选项、四组各七题与同向计分键依作者原页；无共同回忆时段。中文为本站工作译文，尚未完成中文或本站人群的心理测量验证。" : "Published SD4, all 28 items: English order, five agreement anchors, four seven-item subscales and direct keys follow the author’s page, with no common recall window. Chinese is our working translation, without psychometric validation for this translation or this website’s users."}</p>
    <p className="mt-3">{zh ? "Paulhus、Buckels、Trapnell与Jones（2021），Screening for Dark Personalities。Paulhus将SD4列为无需另行许可的公有领域工具。网站附加未评分选项，任一题缺失时不生成所属分量表均值；这不是原作者验证的缺失处理。" : "Paulhus, Buckels, Trapnell and Jones (2021), Screening for Dark Personalities. Paulhus lists SD4 in the public domain, available without permission. The website adds an unscored response and withholds a subscale mean if any rating is missing; this is not an author-validated missing-data procedure."}</p>
    <ul className="mt-3 list-disc space-y-2 pl-5">
      <li><a className="underline" href="https://www.erinbuckels.com/project/short-dark-tetrad-sd4/">{zh ? "作者题本、五选项与计分键" : "Author’s items, anchors and scoring key"}</a></li>
      <li><a className="underline" href="https://www2.psych.ubc.ca/~dpaulhus/Paulhus_measures/">{zh ? "Paulhus公有领域授权页" : "Paulhus public-domain permission page"}</a></li>
      <li><Link prefetch={false} className="underline" href={`/${locale}/tests/explore/dark-triad`}>{zh ? "Mini 18题原创主题观察：独立版本，分数不换算" : "Original Mini 18-item reflection: a separate version, without score conversion"}</Link></li>
    </ul>
  </section>;
}
