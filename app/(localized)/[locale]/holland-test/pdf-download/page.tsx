import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { RiasecWorksheet } from "@/components/marketing/RiasecWorksheet";
import { RiasecResultExamples } from "@/components/tests/RiasecResultExamples";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath } from "@/lib/i18n/locales";
import worksheet from "@/lib/marketing/riasecWorksheet.json";
import { buildBreadcrumbJsonLd, buildWebPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Props = { params: Promise<{ locale: string }> };
const META = {
  zh: { title: "霍兰德职业兴趣测试 PDF：结果解读与探索工作表", description: "免费下载费马 RIASEC 结果解读与职业探索工作表 PDF，在线预览六维兴趣记录、三字代码阅读与职业探索步骤。本资源不是量表题本或个人测试报告。" },
  en: { title: "Holland Code Test PDF: Results & Career Exploration Worksheet", description: "Preview and download a free RIASEC results and career exploration worksheet. Record your interests and plan next steps. Not a test questionnaire or personal report." },
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  return buildPageMetadata({ locale, pathname: localizedPath("/holland-test/pdf-download", locale), ...META[locale], alternatesByLocale: {
    zh: "/zh/holland-test/pdf-download", en: "/en/holland-test/pdf-download", xDefault: "/zh/holland-test/pdf-download",
  } });
}

export default async function HollandPdfPage({ params }: Props) {
  const locale = resolveLocale((await params).locale);
  const copy = worksheet[locale];
  const pathname = localizedPath("/holland-test/pdf-download", locale);
  const breadcrumbs = [
    { name: locale === "zh" ? "首页" : "Home", path: localizedPath("/", locale) },
    { name: locale === "zh" ? "职业测试" : "Career tests", path: localizedPath("/career/tests", locale) },
    { name: locale === "zh" ? "PDF 工作表" : "PDF worksheet", path: pathname },
  ];
  return (
    <Container as="main" className="space-y-8 py-12 md:py-20">
      <JsonLd id="holland-pdf-webpage" data={buildWebPageJsonLd({ path: pathname, locale, ...META[locale] })} />
      <JsonLd id="holland-pdf-breadcrumb" data={buildBreadcrumbJsonLd(breadcrumbs)} />
      <Breadcrumb items={breadcrumbs.map((item, index) => ({ label: item.name, href: index < breadcrumbs.length - 1 ? item.path : undefined }))} />
      <header className="mx-auto max-w-4xl space-y-4">
        <h1 className="m-0 text-3xl font-semibold tracking-tight md:text-4xl">{META[locale].title}</h1>
        <p className="m-0 leading-7 text-slate-600">{copy.intro}</p>
        <div className="flex flex-wrap gap-3">
          <a href="#my-worksheet" className={buttonVariants({ variant: "default" })}>
            {locale === "zh" ? "在线填写我的探索记录" : "Fill in my exploration record"}
          </a>
          <a href={`/resources/riasec/fermatmind-career-exploration-${locale}.pdf`} download className={buttonVariants({ variant: "outline" })} data-testid="riasec-pdf-download">
            {locale === "zh" ? "下载空白 PDF 工作表（2 页）" : "Download the blank PDF worksheet (2 pages)"}
          </a>
          <Link href={localizedPath("/tests/holland-career-interest-test-riasec", locale)} className={buttonVariants({ variant: "outline" })}>
            {locale === "zh" ? "霍兰德职业兴趣测试免费版（60/140题）" : "Take the online Holland Code interest test"}
          </Link>
        </div>
      </header>
      {locale === "zh" ? <p className="mx-auto max-w-4xl text-sm leading-7 text-slate-600">还没有自己的六维结果？上方免费测试入口提供60题与140题两个版本。已有结果可直接使用下方记录和合成示例，不必为了查看工作表重新测试。</p> : null}
      <RiasecWorksheet locale={locale} />
      <RiasecResultExamples locale={locale} />
      <section id="interpret-results" aria-labelledby="interpret-results-title" className="mx-auto max-w-4xl scroll-mt-24 space-y-4" data-testid="riasec-interpretation-path">
        <h2 id="interpret-results-title" className="m-0 text-2xl font-semibold">{locale === "zh" ? "把你的结果变成一次职业探索" : "Turn your result into a career exploration"}</h2>
        <ol className="m-0 list-decimal space-y-4 pl-5 leading-7 text-slate-600">
          <li>{locale === "zh" ? "先读本次报告的作答质量。若有谨慎解读提示，结合近期经历重新核对，不急着定方向。这里的合成示例不能代替你的个人结果。" : "Start with your report’s response-quality guidance. If it calls for caution, check it against recent experiences before choosing a direction. The synthetic examples here cannot replace your personal result."}</li>
          <li>{locale === "zh" ? "看完整六维，再看 Top 3。把分数较高的维度改写为愿意尝试的活动；分数接近或并列时保留多个阅读顺序。" : "Read all six dimensions before the Top 3. Turn higher-scoring interests into activities you would like to try; keep alternative reading orders when scores are close or tied."} <a className="underline underline-offset-4" href="#result-examples">{locale === "zh" ? "查看三种合成示例" : "See the three synthetic examples"}</a></li>
          <li><Link className="underline underline-offset-4" href={localizedPath("/career", locale)}>{locale === "zh" ? "进入职业中心" : "Open the career center"}</Link>{locale === "zh" ? "，按职业名称或工作领域选 2–3 个感兴趣的职业，打开详情阅读日常任务、技能与进入条件。逐项记下愿意做、不确定和不愿做的任务；不要把三字代码当作自动匹配或资格判断。" : ", choose 2–3 roles by name or field, and open their details to read daily tasks, skills, and entry requirements. Mark tasks you want to try, are unsure about, or would avoid. A three-letter code is not an automatic match or qualification decision."}</li>
          <li><Link className="underline underline-offset-4" href={localizedPath("/career/guides", locale)}>{locale === "zh" ? "查看职业指南" : "Browse career guides"}</Link>{locale === "zh" ? "，选择一次小项目、访谈或短期体验。用下方 PDF 工作表记录投入感、实际产出、他人反馈及下一步，同时核对技能、当地资格、时间和经济条件。兴趣不能替代这些现实条件。" : ", then choose a small project, conversation, or brief trial. Use the PDF worksheet below to record engagement, work produced, feedback, and a next step. Check skills, local qualifications, time, and financial constraints separately from interests."}</li>
        </ol>
        <p className="m-0 text-sm leading-7 text-slate-600">{locale === "zh" ? "如果没有找到目标职业或指南，先换一个职业名称或工作领域继续浏览；不要把目录暂缺或无搜索结果理解为“不适合”。若个人结果未能加载，请返回原结果页重试或使用已有的结果找回入口，不以示例补齐个人分数。" : "If a role or guide is unavailable, try another role name or field. Missing content or an empty search does not mean a poor fit. If your personal result has not loaded, return to its page to retry or use the existing result-recovery option; do not fill missing scores with these examples."}</p>
      </section>
      <article aria-labelledby="worksheet-preview-title" className="mx-auto max-w-4xl space-y-8" data-testid="riasec-pdf-preview">
        <h2 id="worksheet-preview-title" className="m-0 text-2xl font-semibold">{locale === "zh" ? "完整 HTML 预览" : "Full HTML preview"}</h2>
        {copy.pages.map((page) => <section key={page.title} className="space-y-6 border-t border-slate-200 pt-6">
          <h3 className="m-0 text-xl font-semibold">{page.title}</h3>
          {page.sections.map((section) => <section key={section.heading} className="space-y-3">
            <h4 className="m-0 font-semibold">{section.heading}</h4>
            <p className="m-0 text-sm leading-7 text-slate-600">{section.body}</p>
            <ul className="m-0 list-none space-y-2 p-0 text-sm">{section.prompts.map(prompt => <li key={prompt} className="break-words [overflow-wrap:anywhere]">{prompt}</li>)}</ul>
          </section>)}
        </section>)}
        <section className="space-y-3 border-t border-slate-200 pt-6">
          <h3 className="m-0 text-xl font-semibold">{locale === "zh" ? "继续阅读" : "Further reading"}</h3>
          <ul className="m-0 list-disc space-y-2 pl-5">
            {[0, 2].map(index => <li key={copy.sources[index]}><a className="underline underline-offset-4" href={copy.sources[index + 1]}>{copy.sources[index]}</a></li>)}
          </ul>
        </section>
      </article>
    </Container>
  );
}
