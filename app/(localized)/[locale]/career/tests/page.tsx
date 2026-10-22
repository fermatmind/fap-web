import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/breadcrumb/Breadcrumb";
import { Container } from "@/components/layout/Container";
import { JsonLd } from "@/components/seo/JsonLd";
import { buttonVariants } from "@/components/ui/button";
import { resolveLocale } from "@/lib/i18n/getDict";
import { localizedPath, type Locale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildCollectionPageJsonLd } from "@/lib/seo/generateSchema";
import { buildPageMetadata } from "@/lib/seo/metadata";

type Copy = {
  title: string;
  description: string;
  h1: string;
  intro: string;
  assessment: string;
  versions: string;
  cta: string;
  mapTitle: string;
  mapColumns: string[];
  assessmentMap: Array<{ goal: string; test: string; output: string; path: string }>;
  comparisonTitle: string;
  comparisonColumns: string[];
  comparison: Array<{ subject: string; holland: string; mbti: string }>;
  scopeTitle: string;
  scope: Array<{ title: string; body: string }>;
  nextTitle: string;
  next: Array<{ title: string; body: string; href: string }>;
  faqTitle: string;
  faq: Array<{ question: string; answer: string }>;
};

const COPY = {
  zh: {
    title: "职业测试与职业兴趣测试：霍兰德、MBTI 怎么选",
    description: "比较霍兰德 RIASEC、MBTI 与大五人格测试的用途、结果和边界。免费完成 60 或 140 题职业兴趣测试，读懂六维兴趣与三字代码，再探索职业方向。",
    h1: "职业测试：先做职业兴趣测试",
    intro: "先了解自己喜欢哪些工作活动，再结合技能、价值观与现实条件，比较值得探索的职业方向。",
    assessment: "霍兰德职业兴趣测试（RIASEC）",
    versions: "60 / 140 题，约 8 / 18 分钟。两版均可免费完成并查看六维兴趣分布与三字代码；题目更多不自动代表更准确。",
    cta: "开始霍兰德职业兴趣免费测试",
    mapTitle: "测评分类选型地图：先看你要解决什么问题",
    mapColumns: ["你的问题", "可了解的测评", "能得到什么"],
    assessmentMap: [
      { goal: "想了解喜欢哪些工作活动", test: "霍兰德职业兴趣测试（RIASEC）", output: "六维兴趣分布与三字代码，用于探索工作任务。", path: "/tests/holland-career-interest-test-riasec" },
      { goal: "想反思偏好与沟通方式", test: "MBTI 偏好测试", output: "偏好维度与类型解释，不能替代职业兴趣或能力评估。", path: "/tests/mbti-personality-test-16-personality-types" },
      { goal: "想了解连续的人格特质", test: "大五人格测试", output: "五个连续人格维度及其解释，不能单独决定职业。", path: "/tests/big-five-personality-test-ocean-model" },
    ],
    comparisonTitle: "霍兰德 vs MBTI：职业选择时分别怎么用？",
    comparisonColumns: ["比较项目", "霍兰德 RIASEC", "MBTI 偏好"],
    comparison: [
      { subject: "主要问题", holland: "更愿意投入哪些工作活动和环境？", mbti: "如何描述自己的偏好与互动方式？" },
      { subject: "结果形式", holland: "六维兴趣分布与三字代码。", mbti: "偏好维度与类型解释。" },
      { subject: "职业探索用途", holland: "提出活动与职业方向，再核对真实任务。", mbti: "反思工作方式与协作情境，再与实际经历比较。" },
      { subject: "共同边界", holland: "兴趣不等于技能、资格或职业成功率。", mbti: "类型不等于技能、资格或职业成功率。" },
    ],
    scopeTitle: "选择职业测试前，先分清三个问题",
    scope: [
      { title: "我喜欢做什么？", body: "职业兴趣测评帮助整理你愿意投入的活动与工作环境，不能直接判断你已经具备哪些技能。" },
      { title: "我能完成什么？", body: "结合课程、作品、项目经历和实际任务表现判断能力，不能用兴趣分数代替能力证据。" },
      { title: "这份工作符合我的条件吗？", body: "继续核对价值取舍、教育与资格要求、工作条件和现实机会。一次测试不能替你决定职业。" },
    ],
    nextTitle: "做完职业兴趣测试，接下来怎么用？",
    next: [
      { title: "读懂六维兴趣与三字代码", body: "保留完整分布和分数差距；方向接近时，一起探索，不必强选唯一类型。", href: "/articles/riasec-holland-career-interest-test-explained" },
      { title: "了解职业与真实工作任务", body: "从职业中心继续查找工作内容和探索路径，结合入行条件形成候选方向。", href: "/career" },
      { title: "制定职业探索行动", body: "阅读职业路径指南，用小项目、访谈或课程体验补充判断依据。", href: "/career/guides" },
      { title: "下载结果解读与职业探索 PDF 工作表", body: "免费预览和打印兴趣记录与行动计划；这不是量表题本或个人报告。", href: "/holland-test/pdf-download" },
    ],
    faqTitle: "关于职业测试的常见问题",
    faq: [
      { question: "职业测试和职业兴趣测试有什么区别？", answer: "职业测试是较宽泛的说法。不同工具可能关注兴趣、人格、价值观或能力；费马这里提供的 RIASEC 测评关注职业兴趣。选择前先核对具体工具测什么、输出什么。" },
      { question: "这里的职业兴趣测试免费吗？", answer: "费马霍兰德 60 题与 140 题版均可免费完成并查看六维兴趣分布与三字代码。开始前可在测试入口比较两个版本。" },
      { question: "测完就能知道最适合我的职业吗？", answer: "结果可以帮助提出探索方向，不能保证某项职业适合你或证明岗位胜任力。还需要结合技能、工作条件和实际体验验证。" },
    ],
  },
  en: {
    title: "Career Tests & Career Interest Tests: Holland vs. MBTI",
    description: "Compare Holland Code, MBTI-style and Big Five tests. Take a free 60- or 140-question career interest test, understand your RIASEC profile and explore careers.",
    h1: "Career tests: start with a career interest test",
    intro: "Explore the work activities you enjoy, then consider skills, values and practical constraints when comparing career directions.",
    assessment: "Holland Career Interest Test (RIASEC)",
    versions: "60 / 140 questions, about 8 / 18 minutes. Both versions are free to complete and show your six interest areas and three-letter code. More questions do not automatically mean greater accuracy.",
    cta: "Start the free Holland Code test",
    mapTitle: "Assessment selection map: start with your question",
    mapColumns: ["Your question", "Assessment to explore", "What it offers"],
    assessmentMap: [
      { goal: "Which work activities interest me?", test: "Holland Code career interest test (RIASEC)", output: "Six interest areas and a three-letter code to explore work activities.", path: "/tests/holland-career-interest-test-riasec" },
      { goal: "How can I reflect on preferences and communication?", test: "MBTI-style preference test", output: "Preference dimensions and type explanations, not an interest or ability assessment.", path: "/tests/mbti-personality-test-16-personality-types" },
      { goal: "What are my continuous personality traits?", test: "Big Five personality test", output: "Five continuous trait dimensions and explanations, not a career decision on their own.", path: "/tests/big-five-personality-test-ocean-model" },
    ],
    comparisonTitle: "Holland Code vs. MBTI: how can each inform career exploration?",
    comparisonColumns: ["Comparison", "Holland Code / RIASEC", "MBTI-style preferences"],
    comparison: [
      { subject: "Main question", holland: "Which work activities and environments would I enjoy?", mbti: "How do I describe my preferences and interactions?" },
      { subject: "Results", holland: "Six interest areas and a three-letter code.", mbti: "Preference dimensions and type explanations." },
      { subject: "Career use", holland: "Suggest activities and directions, then check real work tasks.", mbti: "Reflect on work styles and collaboration, then compare real experiences." },
      { subject: "Shared limits", holland: "Interests do not establish skills, qualifications or career success rates.", mbti: "Types do not establish skills, qualifications or career success rates." },
    ],
    scopeTitle: "Three questions to separate before choosing a career test",
    scope: [
      { title: "What do I enjoy doing?", body: "An interest assessment organizes activities and work environments you would like to explore. It does not establish the skills you already have." },
      { title: "What can I do?", body: "Use coursework, portfolios, projects and performance on real tasks to assess skills. Interest scores cannot replace evidence of capability." },
      { title: "Does the work fit my circumstances?", body: "Check values, education and qualification requirements, working conditions and opportunities. One test cannot choose a career for you." },
    ],
    nextTitle: "What should you do after a career interest test?",
    next: [
      { title: "Read your six interests and Holland Code", body: "Keep the full profile and score differences in view. Explore close interests together rather than forcing one type.", href: "/articles/what-is-riasec-holland-code-career-interest-test" },
      { title: "Explore careers and real work activities", body: "Use the career center to continue exploring work and entry requirements, then build a shortlist.", href: "/career" },
      { title: "Plan your next exploration step", body: "Use career guides to plan a small project, conversation or course experience that adds practical evidence.", href: "/career/guides" },
      { title: "Download the results and career exploration PDF worksheet", body: "Preview and print interest notes and an action plan for free. Not a questionnaire or personal report.", href: "/holland-test/pdf-download" },
    ],
    faqTitle: "Career test questions",
    faq: [
      { question: "How is a career test different from a career interest test?", answer: "Career test is a broad term. Different tools may address interests, personality, values or abilities. The RIASEC assessment offered here focuses on career interests. Check each tool's purpose and outputs before choosing." },
      { question: "Is this career interest test free?", answer: "FermatMind's 60-question and 140-question Holland Code versions are free to complete and show all six interest areas and your three-letter code. Compare the versions on the test page before starting." },
      { question: "Will the test identify the perfect career for me?", answer: "Results suggest directions to explore. They do not guarantee career fit or establish job competence. Consider skills, working conditions and real experience as well." },
    ],
  },
} satisfies Record<Locale, Copy>;

type PageProps = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const locale = resolveLocale((await params).locale);
  const copy = COPY[locale];
  return buildPageMetadata({
    locale,
    pathname: localizedPath("/career/tests", locale),
    title: copy.title,
    description: copy.description,
    alternatesByLocale: {
      en: "/en/career/tests",
      zh: "/zh/career/tests",
      xDefault: "/",
    },
  });
}

export default async function CareerTestsPage({ params }: PageProps) {
  const locale = resolveLocale((await params).locale);
  const copy = COPY[locale];
  const withLocale = (path: string) => localizedPath(path, locale);
  const canonicalPath = withLocale("/career/tests");
  const testPath = withLocale("/tests/holland-career-interest-test-riasec");
  const breadcrumbs = [
    { name: locale === "zh" ? "首页" : "Home", path: withLocale("/") },
    { name: locale === "zh" ? "职业" : "Career", path: localizedPath("/career", locale) },
    { name: locale === "zh" ? "职业测试" : "Career tests", path: canonicalPath },
  ];

  return (
    <Container as="main" className="space-y-8 py-12 md:py-20">
      <JsonLd id="career-tests-collection" data={buildCollectionPageJsonLd({
        path: canonicalPath, title: copy.title, description: copy.description, locale,
      })} />
      <JsonLd id="career-tests-breadcrumb" data={buildBreadcrumbJsonLd(breadcrumbs)} />
      <Breadcrumb items={breadcrumbs.map((item, index) => ({
        label: item.name, href: index < breadcrumbs.length - 1 ? item.path : undefined,
      }))} />

      <section className="mx-auto max-w-4xl space-y-4 text-center" data-testid="career-tests-hero">
        <h1 className="m-0 text-4xl font-semibold tracking-tight text-slate-950 md:text-5xl">{copy.h1}</h1>
        <p className="mx-auto m-0 max-w-2xl text-base leading-7 text-slate-600">{copy.intro}</p>
      </section>

      <section aria-labelledby="career-interest-test" className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-6 md:p-8" data-testid="career-tests-single-entry">
        <h2 id="career-interest-test" className="m-0 text-2xl font-semibold tracking-tight text-slate-950">{copy.assessment}</h2>
        <p className="m-0 mt-3 text-sm leading-6 text-slate-600">{copy.versions}</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={testPath} className={buttonVariants({ variant: "default" })} data-testid="career-tests-primary-cta">{copy.cta}</Link>
        </div>
      </section>

      <section aria-labelledby="career-tests-map" className="mx-auto max-w-4xl space-y-4">
        <h2 id="career-tests-map" className="m-0 text-2xl font-semibold">{copy.mapTitle}</h2>
        <div role="region" aria-label={copy.mapTitle} tabIndex={0} className="overflow-x-auto focus-visible:outline focus-visible:outline-2">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm" data-testid="career-tests-selection-map">
            <caption className="sr-only">{copy.mapTitle}</caption>
            <thead><tr>{copy.mapColumns.map(column => <th key={column} scope="col" className="border-b border-slate-300 p-3 font-semibold">{column}</th>)}</tr></thead>
            <tbody>{copy.assessmentMap.map(item => <tr key={item.path}>
              <th scope="row" className="border-b border-slate-200 p-3 align-top font-medium">{item.goal}</th>
              <td className="border-b border-slate-200 p-3 align-top"><Link href={withLocale(item.path)} className="underline underline-offset-4">{item.test}</Link></td>
              <td className="border-b border-slate-200 p-3 align-top text-slate-600">{item.output}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="career-tests-comparison" className="mx-auto max-w-4xl space-y-4">
        <h2 id="career-tests-comparison" className="m-0 text-2xl font-semibold">{copy.comparisonTitle}</h2>
        <div role="region" aria-label={copy.comparisonTitle} tabIndex={0} className="overflow-x-auto focus-visible:outline focus-visible:outline-2">
          <table className="w-full min-w-[640px] border-collapse text-left text-sm" data-testid="career-tests-holland-mbti-comparison">
            <caption className="sr-only">{copy.comparisonTitle}</caption>
            <thead><tr>{copy.comparisonColumns.map(column => <th key={column} scope="col" className="border-b border-slate-300 p-3 font-semibold">{column}</th>)}</tr></thead>
            <tbody>{copy.comparison.map(item => <tr key={item.subject}>
              <th scope="row" className="border-b border-slate-200 p-3 align-top font-medium">{item.subject}</th>
              <td className="border-b border-slate-200 p-3 align-top text-slate-600">{item.holland}</td>
              <td className="border-b border-slate-200 p-3 align-top text-slate-600">{item.mbti}</td>
            </tr>)}</tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="career-tests-scope" className="mx-auto max-w-4xl space-y-6">
        <h2 id="career-tests-scope" className="m-0 text-2xl font-semibold">{copy.scopeTitle}</h2>
        <dl className="m-0 grid gap-6 md:grid-cols-3">
          {copy.scope.map((item) => (
            <div key={item.title}>
              <dt className="font-semibold text-slate-950">{item.title}</dt>
              <dd className="m-0 mt-2 text-sm leading-6 text-slate-600">{item.body}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="career-tests-next" className="mx-auto max-w-4xl space-y-6">
        <h2 id="career-tests-next" className="m-0 text-2xl font-semibold">{copy.nextTitle}</h2>
        <ol className="m-0 list-decimal space-y-5 pl-6">
          {copy.next.map((item) => (
            <li key={item.href} className="pl-1">
              <Link href={withLocale(item.href)} className="font-semibold underline underline-offset-4 hover:text-[var(--fm-accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{item.title}</Link>
              <p className="m-0 mt-2 text-sm leading-6 text-slate-600">{item.body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="career-tests-faq" className="mx-auto max-w-4xl space-y-4">
        <h2 id="career-tests-faq" className="m-0 text-2xl font-semibold">{copy.faqTitle}</h2>
        {copy.faq.map((item) => (
          <details key={item.question} className="border-b border-slate-200 py-4">
            <summary className="cursor-pointer font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4">{item.question}</summary>
            <p className="m-0 mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
          </details>
        ))}
      </section>
    </Container>
  );
}
