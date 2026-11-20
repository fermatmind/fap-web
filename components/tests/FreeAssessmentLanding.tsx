import Link from "next/link";
import { CareerAssessmentIntro } from "./CareerAssessmentIntro";
import { CareerAssessmentContent } from "./CareerAssessmentContent";
import careerStyles from "./career-assessment-intro.module.css";
import { AssessmentLandingIntro } from "@/components/tests/AssessmentLandingIntro";
import { JsonLd } from "@/components/seo/JsonLd";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { buildPageMetadata } from "@/lib/seo/metadata";
import { traditionalSearchMetadata } from "@/lib/seo/traditionalSearchMetadata";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd } from "@/lib/seo/generateSchema";
import { JUNG_FORMS, freeAssessmentCopy, jungLandingCopy } from "@/lib/tests/freeAssessmentLanding";
import { freeAssessmentGuide } from "@/lib/tests/freeAssessmentGuides";
import { canonicalUrl } from "@/lib/site";
import styles from "./mbti-preview.module.css";

type Landing = "career" | "jung";

export function freeAssessmentMetadata(assessment: Landing, locale: DisplayLocale, indexable = true) {
  const copy = assessment === "jung" ? jungLandingCopy(locale) : freeAssessmentCopy("career", locale);
  const primary = locale === "zh-TW" ? "zh" : locale;
  const pathname = `/${locale}${copy.path}`;
  const metadata = buildPageMetadata({
    locale: primary,
    pathname,
    canonicalPathname: `/${primary}${copy.path}`,
    title: copy.searchTitle,
    description: copy.intro,
    noindex: !indexable,
    alternatesByLocale: { en: `/en${copy.path}`, zh: `/zh${copy.path}`, xDefault: `/en${copy.path}` },
  });
  if (locale !== "zh-TW") return metadata;
  const localized = traditionalSearchMetadata(pathname, {
    ...metadata,
    alternates: { ...metadata.alternates, canonical: pathname },
  });
  return { ...localized, robots: indexable ? localized.robots : metadata.robots };
}

export function FreeAssessmentLanding({ assessment, locale }: {
  assessment: Landing;
  locale: DisplayLocale;
}) {
  const jung = assessment === "jung";
  const copy = jung ? jungLandingCopy(locale) : freeAssessmentCopy("career", locale);
  const traditional = locale === "zh-TW";
  const english = locale === "en";
  const takeLocale = traditional ? "zh" : locale;
  const l = (zh: string, tw: string, en: string) => english ? en : traditional ? tw : zh;
  const forms = jung ? JUNG_FORMS : (["career"] as const);
  const guides = forms.map(key => ({ key, ...freeAssessmentCopy(key, locale), guide: freeAssessmentGuide(key, locale) }));
  const choices = guides.map(({ key, path, intro }) => ({
    key,
    label: key === "archetypes" ? l("开始十二原型测试 · 48 题", "開始十二原型測驗 · 48 題", "Start 12 Archetypes · 48 questions")
      : key === "functions" ? l("开始八维认知功能测试 · 64 题", "開始八維認知功能測驗 · 64 題", "Start 8 Cognitive Functions · 64 questions")
      : l("开始免费职业测试", "開始免費職業測驗", "Start the free career test"),
    href: `/${takeLocale}${path}/take`,
    testId: key === "career" ? "free-assessment-start" : `free-assessment-start-${key}`,
    summary: traditional ? "作答使用簡體中文題本。" : jung ? intro : undefined,
  }));
  const extraFaq = jung ? [
    {
      question: l("两套荣格测试必须一起做吗？", "兩套榮格測驗一定要一起做嗎？", "Do I have to take both Jung tests?"),
      answer: l("可以只做一套。原型分析近期动机，八维比较处理信息和判断的方式。两份报告独立出分，不合成一个总分。", "可以只做一套。原型分析近期動機，八維比較處理資訊與判斷的方式。兩份報告各自計分，不合成總分。", "You can take either one. Archetypes describe recent motives and the functions test compares ways of processing information and judging. The reports are scored independently."),
    },
    {
      question: l("0–100 分是百分位吗？", "0–100 分是百分位嗎？", "Is a 0–100 score a percentile?"),
      answer: l("分数来自题本量尺的换算。75 分说明本次作答在该维度的量尺位置，并没有拿人群样本来计算百分位。", "分數由題本量尺換算。75 分表示這次作答在該面向的量尺位置，沒有使用人群樣本計算百分位。", "Scores are rescaled from the questionnaire. A score of 75 locates your responses on that scale; no population sample is used to calculate a percentile."),
    },
  ] : [
    {
      question: l("有效作答太少时怎么办？", "有效作答太少時怎麼辦？", "What if I have too few usable answers?"),
      answer: l("每个兴趣维度至少需要 6 个有效回答，工作方式及条件每维至少需要 3 个。达不到时不显示该维分数。尤其是没体验过的活动，可以选不确定，之后再找机会体验。", "每項興趣面向至少要有 6 個有效回答，工作方式與條件每項至少要有 3 個。未達門檻就不顯示分數。沒體驗過的活動可以選不確定，再找機會試試。", "Each interest score needs six usable answers. Each dimension for work style or working conditions needs three. The report omits scores below those thresholds. Mark unfamiliar activities unsure and look for ways to try them."),
    },
  ];
  const guideFaq = guides.flatMap(guide => guide.faq);
  const faq = jung ? [...extraFaq, ...guideFaq] : [...guideFaq, ...extraFaq];
  const breadcrumb = [
    { name: l("首页", "首頁", "Home"), path: english ? "/en" : traditional ? "/zh-TW" : "/" },
    { name: l("测试", "測驗", "Tests"), path: `/${locale}/tests` },
    { name: copy.title, path: `/${locale}${copy.path}` },
  ];
  const related = jung
    ? [{ path: "/tests/mbti-personality-test-16-personality-types", title: l("免费 MBTI 性格测试", "免費 MBTI 性格測驗", "Free MBTI-style test") }]
    : [
      { path: "/tests/holland-career-interest-test-riasec", title: l("免费霍兰德职业兴趣测试", "免費霍蘭德職業興趣測驗", "Free Holland Code Test") },
      { path: "/career/tests", title: l("比较职业测试", "比較職涯測驗", "Compare career tests") },
      { path: "/career/jobs/accountants-and-auditors", title: l("职业档案示例：会计与审计人员", "職涯檔案例子：會計與審計人員", "Example career profile: accountants and auditors") },
    ];

  return (
    <main className={jung ? styles.page : `${styles.page} ${careerStyles.page}`}>
      <JsonLd id="free-assessment-page" data={{
        "@context": "https://schema.org",
        "@type": "WebPage",
        url: canonicalUrl(`/${locale}${copy.path}`),
        name: copy.title,
        description: copy.intro,
        inLanguage: locale === "zh" ? "zh-CN" : locale,
        isAccessibleForFree: true,
      }} />
      <JsonLd id="free-assessment-breadcrumb" data={buildBreadcrumbJsonLd(breadcrumb)} />
      <JsonLd id="free-assessment-faq" data={buildFAQPageJsonLd(faq)} />
      <nav className={`${styles.breadcrumb} ${!jung ? careerStyles.breadcrumb : ""}`} aria-label={l("面包屑导航", "導覽路徑", "Breadcrumb")}>
        {breadcrumb.slice(0, -1).map(item => <Link key={item.path} href={item.path} prefetch={false}>{item.name}</Link>)}
        <span aria-current="page">{copy.title}</span>
      </nav>
      <div className={jung ? styles.content : careerStyles.landing}>
        {jung ? <AssessmentLandingIntro locale={locale} title={copy.title} description={copy.intro}
          heroArtwork="functions" disabled={false} choices={choices} showChoiceSummaries wide />
          : <CareerAssessmentIntro locale={locale} title={copy.title} description={copy.intro} choice={choices[0]} />}
        {jung ? <>
        <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label={l("本页目录", "本頁目錄", "On this page")}>
          {guides.map(({ key }) => <a className="underline underline-offset-4" key={key} href={`#${key}`}>{
            key === "archetypes" ? l("十二原型 · 48 题", "十二原型 · 48 題", "12 Archetypes · 48 questions")
              : key === "functions" ? l("八维认知功能 · 64 题", "八維認知功能 · 64 題", "8 Cognitive Functions · 64 questions")
              : l("题本、计分与结果示例", "題本、計分與結果示例", "Questionnaire, scoring and example")
          }</a>)}
          <a className="underline underline-offset-4" href="#assessment-faq">{l("常见问题", "常見問題", "Frequently asked questions")}</a>
        </nav>
        {guides.map(({ key, title, sections, guide, source }) => (
          <section id={key} className={styles.whyChoose} key={key}>
            <h2>{jung ? title : l("94 题职业测试的方法与报告", "94 題職業測驗的方法與報告", "How the 94-question career assessment works")}</h2>
            <div className={styles.tableScroll} role="region" aria-label={guide.title} tabIndex={0}>
              <table>
                <caption>{guide.title}</caption>
                <thead><tr>
                  <th scope="col">{l("维度", "面向", "Dimension")}</th>
                  <th scope="col">{l("含义", "含義", "Meaning")}</th>
                  <th scope="col">{l("情境示例", "情境示例", "Example")}</th>
                </tr></thead>
                <tbody>{guide.rows.map(row => <tr key={row.label}>
                  <th scope="row">{row.label}</th><td>{row.interpretation}</td><td>{row.example}</td>
                </tr>)}</tbody>
              </table>
            </div>
            <div className="mt-8">
              {sections.map(({ heading, body }) => <article key={heading}><h3>{heading}</h3><p>{body}</p></article>)}
              <article><h3>{guide.exampleTitle}</h3><p>{guide.example}</p></article>
              {source && <p><a className="underline underline-offset-4" href={source.href}>{source.label}</a></p>}
              {!jung && <p><a className="underline underline-offset-4" href="https://www.onetcenter.org/reports/IP_Manual.html">{l("RIASEC 背景阅读：O*NET 职业兴趣量表手册", "RIASEC 背景閱讀：O*NET 職涯興趣量表手冊", "RIASEC background: O*NET Interest Profiler technical manual")}</a></p>}
            </div>
          </section>
        ))}
        <section id="assessment-faq" className={styles.faq} aria-labelledby="free-assessment-faq-title">
          <h2 id="free-assessment-faq-title">{l("常见问题", "常見問題", "Frequently asked questions")}</h2>
          {faq.map(({ question, answer }) => <article className={styles.faqItem} key={question}><h3>{question}</h3><p>{answer}</p></article>)}
        </section>
        <section aria-labelledby="free-assessment-related">
          <h2 id="free-assessment-related">{l("相关测试与资料", "相關測驗與資料", "Related tests and resources")}</h2>
          <ul className="space-y-3">{related.map(link => <li key={link.path}><Link className="underline underline-offset-4" href={`/${locale}${link.path}`}>{link.title}</Link></li>)}</ul>
        </section>
        </> : <CareerAssessmentContent locale={locale} choice={choices[0]} faq={faq} rows={guides[0].guide.rows} />}
      </div>
    </main>
  );
}
