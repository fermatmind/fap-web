import { ArrowDown, ArrowRight, ChartNoAxesCombined, ClipboardList, Map } from "lucide-react";
import Link from "next/link";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import { CAREER_ASSESSMENT_LANDING_PATH } from "@/lib/career/assessmentEntry";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd, buildOrganizationJsonLd } from "@/lib/seo/generateSchema";
import { canonicalUrl } from "@/lib/site";
import { FOOTER_SOCIAL_ITEMS } from "@/lib/ui/footerSocialIcons";
import { career94ZhDescription, career94ZhFaq, career94ZhModules, career94ZhUnlockTerms } from "@/lib/tests/career94ZhLanding";
import { Career94Sticky } from "./Career94LandingInteractions";
import { Career94ZhSample } from "./Career94ZhSample";
import styles from "./career94-landing.module.css";
import zh from "./career94-zh-landing.module.css";

const titleParts = ["免费职业测试：", "结合职业兴趣、工作方式", "与现实条件找方向"];
const title = titleParts.join("");
const publisher = buildOrganizationJsonLd({
  path: "/",
  name: "FermatMind / 费马测试",
  description: "提供用于自我理解、能力观察、职业方向与协作判断的结构化测评。",
  locale: "zh",
});
const publisherProfiles = FOOTER_SOCIAL_ITEMS.flatMap(({ key, href }) => {
  if (!href || !["x", "yt", "ig"].includes(key)) return [];
  const { origin, pathname } = new URL(href);
  return [origin + pathname];
});
const start = "/zh/career/assessment/take";
const sample = "/zh/reports/samples/career94";
const tools = [
  { href: "/zh/career", label: "职业档案" },
  { href: "/zh/career/compare", label: "两岗对比" },
  { href: "/zh/career/interest-worksheet", label: "职业探索工作表" },
] as const;
const holland = "/zh/tests/holland-career-interest-test-riasec";
const columns = ["测评工具", "解决什么问题", "题量与用时", "适合谁"];
const comparisons = [
  ["费马职业测试（本页）", "筛出兴趣方向，再核对工作方式、条件与当前处境", "94 题 · 约 12–15 分钟", "正在选专业、找工作或评估转行的人"],
  ["霍兰德职业兴趣测试", "快速认识六种活动兴趣和三字代码", "60 题 · 约 8 分钟", "想先了解职业兴趣的人"],
  ["MBTI 16 型人格测试", "认识自己获取信息、作决定及与人互动的偏好", "93／144 题 · 约 10／15 分钟", "想了解人格偏好、沟通和协作习惯的人"],
] as const;
const roles = [
  {
    name: "工业设计师",
    href: "/zh/career/jobs/industrial-designers",
    tasks: "研究产品的使用场景，画概念草图，制作或验证原型，与工程和制造团队核对尺寸、材料及成本。",
    style: "待核实：设计评审多久一次？改原型要和哪些团队协作？并行项目切换有多频繁？",
    conditions: "待核实：打样前的工时与交付峰值怎样？这个岗位要求怎样的作品集和建模经验？",
  },
  {
    name: "平面设计师",
    href: "/zh/career/jobs/graphic-designers",
    tasks: "按简报构思图形与版式，选择字体和图像，校对最终版式，准备印刷或数字交付文件。",
    style: "待核实：谁审批版式？通常有几轮返工？品牌项目和临时素材会怎样排期？",
    conditions: "待核实：上线前的工时与交付峰值怎样？有没有渠道经验或作品集门槛？",
  },
];
const scenarios = [
  {
    title: "大学生选专业 / 应届毕业",
    concern: "专业和岗位名称听起来都差不多，怕选完才发现日常工作不喜欢。",
    next: "用六维兴趣和探索目标挑出两个愿意了解的方向，再到职业档案对照日常任务、学历门槛和工作节奏。",
    tool: tools[0],
  },
  {
    title: "找第一份工作 / 纠结 Offer",
    concern: "手里有几个岗位都可以投，拿不准哪份工作干起来更顺手。",
    next: "带着你偏好的工作方式和能接受的现实条件，挑两个候选做两岗对比，把协作节奏、加班和出差等没查清的事列成面试反问清单。",
    tool: tools[1],
  },
  {
    title: "评估转行 / 职业调整",
    concern: "现在的工作做得很累，想换方向，又怕从零开始的成本太高。",
    next: "列出想延续的经验、能投入的再培训时间，以及收入和夜班底线。用职业探索工作表选一个成本可控的小试做。",
    tool: tools[2],
  },
];

export function Career94Landing() {
  return (
    <main className={`${styles.page} ${zh.page}`} data-career94-landing>
      <JsonLd id="free-assessment-page" data={{
        "@context": "https://schema.org", "@type": "WebPage", url: canonicalUrl(`/zh${CAREER_ASSESSMENT_LANDING_PATH}`),
        name: title, description: career94ZhDescription, inLanguage: "zh-CN", isAccessibleForFree: true,
        publisher: { "@id": publisher["@id"] },
      }} />
      <JsonLd id="free-assessment-breadcrumb" data={buildBreadcrumbJsonLd([
        { name: "首页", path: "/" }, { name: "测试", path: "/zh/tests" },
        { name: "费马职业测试", path: `/zh${CAREER_ASSESSMENT_LANDING_PATH}` },
      ])} />
      <JsonLd id="career94-organization" data={{ ...publisher, alternateName: "费马测试", sameAs: publisherProfiles }} />
      <JsonLd id="free-assessment-faq" data={buildFAQPageJsonLd(career94ZhFaq)} />

      <header className={styles.hero} data-career-hero>
        <div className={styles.wrap}>
          <nav className={styles.breadcrumb} aria-label="面包屑">
            <Link href="/">首页</Link><span aria-hidden>/</span><Link href="/zh/tests">测试</Link><span aria-hidden>/</span><span aria-current="page">费马职业测试</span>
          </nav>
          <div className={styles.heroGrid}>
            <div className={zh.heroCopy}>
              <p className={zh.eyebrow}>费马职业兴趣与工作偏好测评 · 94 题 · 约 12–15 分钟 · 免注册</p>
              <h1>{titleParts.map(part => <span className={zh.titlePart} key={part}>{part}</span>)}</h1>
              <p className={styles.lead}>选专业、找第一份工作或考虑转行时，光看“喜不喜欢”往往不够。花 12–15 分钟做一次 94 题免费在线职业测评。先用六维兴趣筛出值得探索的职业方向，再把你偏好的做事方式、看重的工作条件和当前处境摆上桌逐项核对。交卷即可免费查看六维兴趣分、霍兰德三字代码与初步职业候选。</p>
              <div className={styles.heroActions}>
                <TrackedEntryCtaLink href={start} data-testid="free-assessment-start" eventProperties={{}} className={styles.primary}>
                  免费开始测试（约 12–15 分钟）<ArrowRight size={18} aria-hidden />
                </TrackedEntryCtaLink>
                <a href="#sample-comparison" className={styles.secondary}>先看结果样例与双岗对比 <ArrowDown size={17} aria-hidden /></a>
              </div>
              <Link href={sample} prefetch={false} className={zh.heroLink}>查看完整公开报告样例</Link>
            </div>
            <Career94ZhSample />
          </div>
        </div>
      </header>

      <section className={`${styles.wrap} ${styles.section}`} aria-labelledby="career-results-title">
        <h2 id="career-results-title">交卷后，你会看到什么？</h2>
        <p className={styles.answer}>费马职业兴趣与工作偏好测评共 94 题，作答约需 12–15 分钟、无需注册。题本包含 42 题活动兴趣（RIASEC）、20 题工作方式、24 题看重的工作条件与 8 题当前处境。交卷即可免费查看六维兴趣分、霍兰德三字代码、基础兴趣解读与初步职业候选；如需展开个人工作方式与条件分项、现实约束核对提示及行动计划，可选购深度报告。测评结果用于缩小职业探索范围并配合职业档案与两岗对比工具核实日常任务，不构成能力诊断或唯一职业判定。</p>
        <div className={`${styles.benefits} ${zh.benefits}`}>
          <article>
            <ChartNoAxesCombined size={24} aria-hidden />
            <h3>免费基础结果</h3>
            <p><b>不强制注册、不绑手机号、不锁核心基础结果。</b> 交卷后直接查看六维兴趣分（0–100 题本内量尺）、霍兰德三字代码（含近分提示）与基础兴趣解读。初步候选从简中 339 个精选主流岗位中筛选。六维兴趣分化度较低（SD &lt; 10）时，改为给出两条默认试做路线。</p>
          </article>
          <article>
            <ClipboardList size={24} aria-hidden />
            <h3>可选深度报告</h3>
            <p><b>自愿按次解锁，无自动续费。</b> {career94ZhUnlockTerms} 查看个人 5 项工作方式与 6 项工作条件重视度分项、固定夜班与频繁过夜出差约束核对提示，以及 7 天行动计划。有可比较的候选时，可按日常任务、工作方式和现实条件核对首推两岗。</p>
          </article>
          <article>
            <Map size={24} aria-hidden />
            <h3>职业资料与探索工具</h3>
            <p>339 个简中精选岗位用于本页结果筛选，743 个向量岗位组成兴趣匹配资料库，1,046 份公开职业档案用于查资料。职业档案按岗位参考 O*NET、BLS 与《中华人民共和国职业分类大典（2022年版）》等来源。</p>
            <div className={styles.methodLinks}>{tools.map(tool => <Link key={tool.href} href={tool.href} prefetch={false}>{tool.label}</Link>)}</div>
          </article>
        </div>
      </section>

      <section id="sample-comparison" className={styles.insight} aria-labelledby="career-decision-title">
        <div className={`${styles.wrap} ${styles.section} ${zh.decision}`}>
          <div>
            <h2 id="career-decision-title">为什么光靠兴趣选工作容易踩坑？用两步把方向核实清楚</h2>
            <p className={zh.sectionNote}>MBTI 等性格测试可以帮你认识自己的沟通偏好，兴趣能帮你找到愿意投入的活动。可每天临时被打断、反复改稿、工时难预料，或者夜班和出差超出你的底线，再喜欢的事也可能做得很累。</p>
            <ol className={zh.steps}>
              <li>
                <span aria-hidden>1</span>
                <div><h3>活动兴趣（42 题）筛出候选方向</h3><p>先从你愿意反复做的活动里找几个值得探索的岗位。候选只按活动兴趣筛选，四块内容各自解读。</p></div>
              </li>
              <li>
                <span aria-hidden>2</span>
                <div><h3>方式、条件与处境（52 题）核实差异</h3><p>再问自己能接受怎样的协作频率、打断和改稿节奏，以及怎样的工时和出差安排。档案里查不到的，就看招聘说明、问在岗的人，或者先试做一次。</p></div>
              </li>
            </ol>
          </div>
          <article className={zh.roleExample}>
            <h3>合成示例：高艺术（A）＋高研究（I）探索者</h3>
            <p>样例作答为合成示例。三栏对应结果报告的两岗核对方式。</p>
            <table className={zh.roleTable}>
              <thead><tr><th scope="col">核对项目</th>{roles.map(role => <th scope="col" key={role.href}><Link href={role.href} prefetch={false}>{role.name}</Link></th>)}</tr></thead>
              <tbody>
                <tr><th scope="row">日常任务</th>{roles.map(role => <td key={role.href}>{role.tasks}</td>)}</tr>
                <tr><th scope="row">工作方式</th>{roles.map(role => <td key={role.href}>{role.style}</td>)}</tr>
                <tr><th scope="row">现实条件</th>{roles.map(role => <td key={role.href}>{role.conditions}</td>)}</tr>
              </tbody>
            </table>
          </article>
          <div className={zh.actionStrip}>
            <strong>交卷后，三步核实方向</strong>
            <ol>
              <li><Link href={tools[0].href} prefetch={false}>查档案，核对日常工作和门槛</Link></li>
              <li><Link href={tools[1].href} prefetch={false}>挑两岗，并排看差异</Link></li>
              <li><Link href={tools[2].href} prefetch={false}>用工作表记下一次小试做</Link></li>
            </ol>
          </div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section}`} aria-labelledby="career-matrix-title">
        <h2 id="career-matrix-title">94 道题分别测什么？四大模块全透明拆解</h2>
        <p className={zh.sectionNote}>都是按日常直觉作答的选择题，没有对错。全套分成四块，可按每段约 2–4 分钟安排，实际用时随题量和作答速度而变。活动兴趣只按“愿不愿意做”选，先不用考虑会不会做。其余三块按当前偏好和现实底线回答。</p>
        <div className={zh.matrix} data-career-matrix>
          {career94ZhModules.map(({ name, details, guidance, axes }) => (
            <article key={name}>
              <h3>{name}</h3><p>{details}</p><p>{guidance}</p>
              <ul>{axes.map(axis => <li key={axis}>{axis}</li>)}</ul>
            </article>
          ))}
        </div>
        <div className={zh.midCta}>
          <div>
            <p><b>四块内容看清楚了？花 12–15 分钟，把兴趣、做事方式与现实底线一次理清</b></p>
            <p>免注册 · 交卷直接看基础结果</p>
          </div>
          <TrackedEntryCtaLink href={start} data-testid="free-assessment-start-mid" eventProperties={{}} className={styles.primary}>
            免费开始 94 题测试 <ArrowRight size={18} aria-hidden />
          </TrackedEntryCtaLink>
        </div>
      </section>

      <section className={styles.scenarioBand} aria-labelledby="career-scenario-title">
        <div className={`${styles.wrap} ${styles.section}`}>
          <h2 id="career-scenario-title">把测试结果用在正在做的决定上</h2>
          <p className={zh.sectionNote}>制定职业规划或调整方向前，先用 94 题梳理兴趣、工作方式与现实条件，再用<Link href="/zh/career/guides" prefetch={false}>职业指南</Link>找下一步的核对方法。</p>
          <div className={`${styles.scenarios} ${zh.scenarios}`}>
            {scenarios.map(({ title, concern, next, tool }) => (
              <article key={title}>
                <h3>{title}</h3>
                <p className={zh.scenarioConcern}>{concern}</p>
                <p>{next}</p>
                <Link href={tool.href} prefetch={false}>{tool.label} <ArrowRight size={15} aria-hidden /></Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.wrap} ${styles.section}`} aria-labelledby="career-choose-title">
        <h2 id="career-choose-title">我该做 94 题职业测试，还是先做霍兰德 60 题？</h2>
        <table className={styles.comparison} role="table">
          <thead role="rowgroup"><tr role="row">{columns.map(column => <th scope="col" role="columnheader" key={column}>{column}</th>)}</tr></thead>
          <tbody role="rowgroup">{comparisons.map(([name, ...values], rowIndex) => (
            <tr role="row" key={name} data-current={rowIndex === 0}>
              <th scope="row" role="rowheader">{name}</th>
              {values.map((value, index) => <td role="cell" key={value}><span aria-hidden className={styles.mobileColumn}>{columns[index + 1]}</span>{value}</td>)}
            </tr>
          ))}</tbody>
        </table>
        <p className={styles.comparisonNote}>只想了解活动兴趣，可先做<Link href={holland} prefetch={false}>霍兰德 60 题</Link>；拿不准先做哪套，打开<Link href="/zh/career/tests" prefetch={false}>职业测评选型页</Link>。</p>
      </section>

      <section id="assessment-faq" className={`${styles.wrap} ${styles.section} ${styles.faq}`} aria-labelledby="career-faq">
        <h2 id="career-faq">常见问题</h2>
        {career94ZhFaq.map(({ question, answer }, index) => (
          <details open={index < 3} key={question}>
            <summary>{question}<span aria-hidden /></summary>
            <p>{answer}</p>
            {index === 0 && <div className={`${styles.methodLinks} ${zh.faqLinks}`}>{tools.slice(1).map(tool => <Link key={tool.href} href={tool.href} prefetch={false}>{tool.label}</Link>)}</div>}
          </details>
        ))}
        <TrackedEntryCtaLink href={start} data-testid="free-assessment-start-closing" eventProperties={{}} className={styles.primary}>
          免费开始测试 <ArrowRight size={18} aria-hidden />
        </TrackedEntryCtaLink>
      </section>

      <section className={styles.science} aria-labelledby="career-science-title">
        <div className={`${styles.wrap} ${styles.section}`}>
          <h2 id="career-science-title">计分公式、方法来源与适用边界</h2>
          <div className={zh.editorial} data-career94-editorial>
            <p>题本 <code>career_v1</code> · 评分 <code>career_profile_v1</code></p>
            <p>编制与审校：费马测试测评编辑部（FermatMind）</p>
            <p>最近核对：<time dateTime="2026-11">2026-11</time></p>
            <div className={styles.methodLinks}>
              <Link href="/zh/science" prefetch={false}>测评科学</Link>
              <Link href="/zh/reliability-validity" prefetch={false}>信度与效度</Link>
              <Link href="/zh/item-design-notes" prefetch={false}>题目设计说明</Link>
            </div>
          </div>
          <div className={`${styles.scienceGrid} ${zh.scienceGrid}`}>
            <article>
              <h3>轴分怎么算</h3>
              <p className={styles.formula}><code>轴分 = 25 × (有效作答平均值 - 1)</code></p>
              <p>按未舍入的平均值计算，轴分保留 4 位小数。活动兴趣每轴 7 题至少 6 题有效，工作方式与工作条件每轴 4 题至少 3 题有效。工作方式含 9 道反向题，按 6 - x 转换后计分。明确选 3 计入，未作答与不确定不计入。8 道当前处境题原样保留，不计分。</p>
            </article>
            <article>
              <h3>两个验算示例</h3>
              <p><b>正向轴</b>：5, 4, 5, 4, 5, 4, 5 → 有效均值 4.5714 → 得分 89.2857。</p>
              <p><b>任务切换频率</b>（该轴第 4 题反向）：4, 5, 4, 2 → 转换后 4, 5, 4, 4 → 均值 4.2500 → 得分 81.2500。</p>
            </article>
            <article>
              <h3>参考框架与适用边界</h3>
              <p>活动兴趣参考霍兰德 RIASEC 与 O*NET 兴趣向量的形状相似度思路。工作方式、条件与当前处境为费马测试（FermatMind）自研。资料包括 339 个简中精选岗位、743 个向量岗位和 1,046 份公开职业档案。</p>
              <p>这是自评探索工具。0–100 为题本内部量尺，无人口常模百分位，不能据此诊断能力、预测录取或给出唯一职业选择。</p>
            </article>
          </div>
        </div>
      </section>
      <Career94Sticky locale="zh" href={start} label="免费开始测试" />
    </main>
  );
}
