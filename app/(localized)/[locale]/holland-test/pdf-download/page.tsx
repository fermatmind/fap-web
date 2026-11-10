import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { RiasecWorksheet } from "@/components/marketing/RiasecWorksheet";
import { RiasecResultExamples } from "@/components/tests/RiasecResultExamples";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type DisplayLocale } from "@/lib/i18n/locales";
import worksheet from "@/lib/marketing/riasecWorksheet.json";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };
const META = {
  "zh-TW": { title: "霍蘭德職業興趣測驗 PDF：結果解讀與職涯探索工作表", description: "免費下載費馬 RIASEC 結果解讀與職涯探索工作表 PDF。預覽六維興趣記錄、三字代碼與探索步驟。" },
  zh: { title: "霍兰德职业兴趣测试 PDF：结果解读与探索工作表", description: "免费下载费马 RIASEC 结果解读与职业探索工作表 PDF，在线预览六维兴趣记录、三字代码阅读与职业探索步骤。本资源不是量表题本或个人测试报告。" },
  en: { title: "Holland Code Test PDF: Results & Career Exploration Worksheet", description: "Preview and download a free RIASEC results and career exploration worksheet. Record your interests and plan next steps. Not a test questionnaire or personal report." },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  if (raw === "zh-TW") {
    return {
      ...META["zh-TW"],
      alternates: { canonical: "/zh-TW/holland-test/pdf-download" },
      robots: { index: false, follow: true },
    };
  }
  const locale = resolveLocale(raw);
  return buildPageMetadata({ locale, pathname: localizedPath("/holland-test/pdf-download", locale), ...META[locale], alternatesByLocale: {
    zh: "/zh/holland-test/pdf-download", en: "/en/holland-test/pdf-download", xDefault: "/zh/holland-test/pdf-download",
  } });
}

export default async function HollandPdfPage({ params }: Props) {
  const raw = (await params).locale;
  const sourceLocale = resolveLocale(raw);
  const traditional = raw === "zh-TW";
  const locale: DisplayLocale = traditional ? "zh-TW" : sourceLocale;
  const text = (zh: string, en: string, tw: string) => traditional ? tw : locale === "zh" ? zh : en;
  const path = (pathname: string) => traditional ? `/zh-TW${pathname === "/" ? "" : pathname}` : localizedPath(pathname, sourceLocale);
  const copy = worksheet[locale];
  const pathname = path("/holland-test/pdf-download");
  const breadcrumbs = [
    { name: text("首页", "Home", "首頁"), path: path("/") },
    { name: text("职业测试", "Career tests", "職業測試"), path: path(traditional ? "/tests/category/career" : "/career/tests") },
    { name: text("PDF 工作表", "PDF worksheet", "PDF 工作表"), path: pathname },
  ];
  return (
    <Container as={traditional ? "div" : "main"} className="space-y-8 py-12 md:py-20">
      {traditional ? null : <JsonLd id="holland-pdf-webpage" data={buildWebPageJsonLd({ path: pathname, locale: sourceLocale, ...META[locale] })} />}
      {traditional ? null : <JsonLd id="holland-pdf-breadcrumb" data={buildBreadcrumbJsonLd(breadcrumbs)} />}
      <Breadcrumb items={breadcrumbs.map((item, index) => ({ label: item.name, href: index < breadcrumbs.length - 1 ? item.path : undefined }))} />
      <header className="mx-auto max-w-4xl space-y-4">
        <h1 className="m-0 text-3xl font-semibold tracking-tight md:text-4xl">{META[locale].title}</h1>
        <p className="m-0 leading-7 text-slate-600">{copy.intro}</p>
        <div className="flex flex-wrap gap-3">
          <a href="#my-worksheet" className={buttonVariants({ variant: "default" })}>
            {text("在线填写我的探索记录", "Fill in my exploration record", "線上填寫我的探索記錄")}
          </a>
          <a href={`/resources/riasec/fermatmind-career-exploration-${locale}.pdf`} download className={buttonVariants({ variant: "outline" })} data-testid="riasec-pdf-download">
            {text("下载空白 PDF 工作表（2 页）", "Download the blank PDF worksheet (2 pages)", "下載空白 PDF 工作表（2 頁）")}
          </a>
          <Link href={path("/tests/holland-career-interest-test-riasec")} className={buttonVariants({ variant: "outline" })}>
            {text("霍兰德职业兴趣测试免费版（60/140题）", "Take the online Holland Code interest test", "霍蘭德職業興趣測驗免費版（60/140題）")}
          </Link>
        </div>
      </header>
      {locale !== "en" ? <p className="mx-auto max-w-4xl text-sm leading-7 text-slate-600">{traditional ? "還沒有自己的六維結果？上方免費測驗提供 60 題與 140 題兩個版本。已有結果可直接使用下方記錄和合成範例，無須重新測驗。" : "还没有自己的六维结果？上方免费测试入口提供60题与140题两个版本。已有结果可直接使用下方记录和合成示例，不必为了查看工作表重新测试。"}</p> : null}
      <RiasecWorksheet locale={locale} />
      <RiasecResultExamples locale={locale} />
      <section id="interpret-results" aria-labelledby="interpret-results-title" className="mx-auto max-w-4xl scroll-mt-24 space-y-4" data-testid="riasec-interpretation-path">
        <h2 id="interpret-results-title" className="m-0 text-2xl font-semibold">{text("把你的结果变成一次职业探索", "Turn your result into a career exploration", "把你的結果變成一次職業探索")}</h2>
        <ol className="m-0 list-decimal space-y-4 pl-5 leading-7 text-slate-600">
          <li>{text("先读本次报告的作答质量。若有谨慎解读提示，结合近期经历重新核对，不急着定方向。这里的合成示例不能代替你的个人结果。", "Start with your report’s response-quality guidance. If it calls for caution, check it against recent experiences before choosing a direction. The synthetic examples here cannot replace your personal result.", "先讀本次報告的作答質量。若有謹慎解讀提示，結合近期經歷重新核對，不急著定方向。這裡的合成範例不能代替你的個人結果。")}</li>
          <li>{text("看完整六维，再看 Top 3。把分数较高的维度改写为愿意尝试的活动；分数接近或并列时保留多个阅读顺序。", "Read all six dimensions before the Top 3. Turn higher-scoring interests into activities you would like to try; keep alternative reading orders when scores are close or tied.", "看完整六維，再看 Top 3。把分數較高的維度改寫為願意嘗試的活動；分數接近或並列時保留多個閱讀順序。")} <a className="underline underline-offset-4" href="#result-examples">{text("查看三种合成示例", "See the three synthetic examples", "檢視三種合成範例")}</a></li>
          <li><Link className="underline underline-offset-4" href={path("/career")}>{text("进入职业中心", "Open the career center", "進入職業中心")}</Link>{text("，按职业名称或工作领域选 2–3 个感兴趣的职业，打开详情阅读日常任务、技能与进入条件。逐项记下愿意做、不确定和不愿做的任务；不要把三字代码当作自动匹配或资格判断。", ", choose 2–3 roles by name or field, and open their details to read daily tasks, skills, and entry requirements. Mark tasks you want to try, are unsure about, or would avoid. A three-letter code is not an automatic match or qualification decision.", "，按職業名稱或工作領域選 2–3 個感興趣的職業，開啟詳情閱讀日常任務、技能與進入條件。逐項記下願意做、不確定和不願做的任務；不要把三字代碼當作自動匹配或資格判斷。")}</li>
          <li><Link className="underline underline-offset-4" href={path("/career/guides")}>{text("查看职业指南", "Browse career guides", "檢視職業指南")}</Link>{text("，选择一次小项目、访谈或短期体验。用下方 PDF 工作表记录投入感、实际产出、他人反馈及下一步，同时核对技能、当地资格、时间和经济条件。兴趣不能替代这些现实条件。", ", then choose a small project, conversation, or brief trial. Use the PDF worksheet below to record engagement, work produced, feedback, and a next step. Check skills, local qualifications, time, and financial constraints separately from interests.", "，選擇一次小專案、訪談或短期體驗。用下方 PDF 工作表記錄投入感、實際產出、他人回饋及下一步，同時核對技能、當地資格、時間和經濟條件。興趣不能替代這些現實條件。")}</li>
        </ol>
        <p className="m-0 text-sm leading-7 text-slate-600">{text("如果没有找到目标职业或指南，先换一个职业名称或工作领域继续浏览；不要把目录暂缺或无搜索结果理解为“不适合”。若个人结果未能加载，请返回原结果页重试或使用已有的结果找回入口，不以示例补齐个人分数。", "If a role or guide is unavailable, try another role name or field. Missing content or an empty search does not mean a poor fit. If your personal result has not loaded, return to its page to retry or use the existing result-recovery option; do not fill missing scores with these examples.", "如果沒有找到目標職業或指南，先換一個職業名稱或工作領域繼續瀏覽；不要把目錄暫缺或無搜尋結果理解為“不適合”。若個人結果未能載入，請返回原結果頁重試或使用已有的結果找回入口，不以示例補齊個人分數。")}</p>
      </section>
      <article aria-labelledby="worksheet-preview-title" className="mx-auto max-w-4xl space-y-8" data-testid="riasec-pdf-preview">
        <h2 id="worksheet-preview-title" className="m-0 text-2xl font-semibold">{text("完整 HTML 预览", "Full HTML preview", "完整 HTML 預覽")}</h2>
        {copy.pages.map((page) => <section key={page.title} className="space-y-6 border-t border-slate-200 pt-6">
          <h3 className="m-0 text-xl font-semibold">{page.title}</h3>
          {page.sections.map((section) => <section key={section.heading} className="space-y-3">
            <h4 className="m-0 font-semibold">{section.heading}</h4>
            <p className="m-0 text-sm leading-7 text-slate-600">{section.body}</p>
            <ul className="m-0 list-none space-y-2 p-0 text-sm">{section.prompts.map(prompt => <li key={prompt} className="break-words [overflow-wrap:anywhere]">{prompt}</li>)}</ul>
          </section>)}
        </section>)}
        <section className="space-y-3 border-t border-slate-200 pt-6">
          <h3 className="m-0 text-xl font-semibold">{text("继续阅读", "Further reading", "繼續閱讀")}</h3>
          <ul className="m-0 list-disc space-y-2 pl-5">
            {[0, 2].map(index => <li key={copy.sources[index]}><a className="underline underline-offset-4" href={copy.sources[index + 1]}>{copy.sources[index]}</a></li>)}
          </ul>
        </section>
      </article>
    </Container>
  );
}
