import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
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
          <a href={`/resources/riasec/fermatmind-career-exploration-${locale}.pdf`} download className={buttonVariants({ variant: "default" })} data-testid="riasec-pdf-download">
            {locale === "zh" ? "免费下载 PDF 工作表（2 页）" : "Download the free PDF worksheet (2 pages)"}
          </a>
          <Link href={localizedPath("/tests/holland-career-interest-test-riasec", locale)} className={buttonVariants({ variant: "outline" })}>
            {locale === "zh" ? "在线完成霍兰德职业兴趣测试" : "Take the online Holland Code interest test"}
          </Link>
        </div>
      </header>
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
