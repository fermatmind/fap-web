import { Container } from "@/components/layout/Container";
import type { DisplayLocale } from "@/lib/i18n/locales";

export function OpenDatasetsIndex({ locale }: { locale: DisplayLocale }) {
  const copy = locale === "zh-TW"
    ? { title: "公開資料集", intro: "查看費馬整理的歷史人物研究資料、來源與使用邊界。", atlas: "歷史人物圖鑑：488 位人物", cox: "Cox 1926 歷史估值檔案" }
    : locale === "zh"
      ? { title: "公开数据集", intro: "查看费马整理的历史人物研究资料、来源与使用边界。", atlas: "历史人物图鉴：488 位人物", cox: "Cox 1926 历史估值档案" }
      : { title: "Open Datasets", intro: "Explore FermatMind’s historical research data, sources and limitations.", atlas: "Personality Atlas: 488 historical figures", cox: "Cox 1926 historical estimates archive" };
  return <Container as="main" className="py-12">
    <h1 className="text-3xl font-semibold">{copy.title}</h1>
    <p className="mt-4">{copy.intro}</p>
    <ul className="mt-8 space-y-4">
      <li><a className="underline" href={`/${locale}/tests/explore/global-history-quiz/personality-atlas`}>{copy.atlas}</a></li>
      <li><a className="underline" href={`/${locale}/tests/explore/global-history-quiz/cox-1926`}>{copy.cox}</a></li>
    </ul>
  </Container>;
}
