import { CAREER_ASSESSMENT_LANDING_PATH } from "@/lib/career/assessmentEntry";
import Link from "next/link";
import { ArrowDown, ArrowRight, ArrowUpRight, BarChart3, BookOpen, Compass, ListChecks, ScanLine } from "lucide-react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { hollandLandingTitle } from "@/lib/tests/assessmentLandingUi";
import { hollandDimensions, hollandFaq } from "@/lib/tests/hollandLanding";
import { SCALE_CANONICAL_SLUG_MAP } from "@/lib/assessmentSlugMap";
import { hollandCodeExamples, hollandJobs } from "./CoreAssessmentExplore";
import { HollandHeroReport, HollandReportPreview } from "./HollandReportPreview";
import { HollandCodeLetters, HollandHexagon, HollandStickyAction } from "./HollandLandingInteractions";
import styles from "./holland-landing.module.css";

type StartChoice = { href: string | null; testId?: string; eventProperties?: Record<string, string> };

const benefits = [
  [BarChart3, "六维兴趣图谱", "把六类工作活动的兴趣放在同一量尺上，看到高分项，也看清整个分布。"],
  [ScanLine, "三字代码与结果解读", "从前三个字母读出优先探索的方向。分数接近时，可以把几类活动一起试做。"],
  [Compass, "职业档案与行动工具", "从六维兴趣出发，查看代表岗位的日常任务，把候选方向写进行动工作表。"],
] as const;

const tools = [
  [BookOpen, "/zh/career", "浏览 1,046 个中外规范职业档案库", "看真实工作任务与入行条件"],
  [Compass, "/zh/career/compare", "打开双职业对比", "把两个候选职业放在一起看"],
  [ListChecks, "/zh/career/interest-worksheet", "填写行动工作表", "记录一个本周可以完成的试做任务"],
] as const;

const occupations = [
  ["安装与检修电路", "切割与装配木件", "排查工业设备故障"],
  ["分析数据并解释发现", "设计调查并评估误差", "检验物质成分与性质"],
  ["把信息转成视觉设计", "调研主题并撰写内容", "规划空间布局与材料"],
  ["评估患者状态并实施护理", "了解来访者需求并梳理选择", "协调社区项目与服务"],
  ["制定销售目标并带领团队", "研究市场并策划推广", "协调人员与日常运营"],
  ["审查账目与财务记录", "登记并核对交易", "复核工时与薪资记录"],
] as const;

const fields = [
  ["电气安装", "木工建造", "设备运维"],
  ["科技 · 算法", "统计 · 调研", "化学 · 实验"],
  ["视觉设计", "写作 · 内容", "空间设计"],
  ["医疗护理", "教育 · 咨询", "社区服务"],
  ["销售管理", "市场营销", "运营管理"],
  ["财税 · 合规", "会计核算", "薪资管理"],
] as const;

const scenarios = [
  ["选专业", "挑两三门核心课，看看实验、创作、分析和协作各占多少，再找一项课程任务试做。", "#holland-careers", "按活动找方向"],
  ["找第一份工作", "同样叫运营或分析，日常任务也可能差很多。挑两个岗位，比较它们每天主要做什么。", "/zh/career/compare", "比较两个岗位"],
  ["考虑转行", "把消耗你的具体任务，与工时、管理或团队条件分开记录，再判断是换岗位还是换环境。", "/zh/career/interest-worksheet", "填写行动工作表"],
] as const;

const exampleCareers: Record<string, ReadonlyArray<readonly [string, string]>> = {
  IAS: [["human-factors-engineers-and-ergonomists", "人因工程师与工效学专家"], ["instructional-coordinators", "课程与教学协调员"]],
  RIA: [["industrial-designers", "工业设计师"], ["computer-hardware-engineers", "计算机硬件工程师"]],
  SEC: [["training-and-development-specialists", "培训与发展专员"], ["human-resources-specialists", "人力资源专员"]],
  EIC: [["management-analysts", "管理分析师"], ["general-and-operations-managers", "总经理和运营经理"]],
};

const comparisons = [
  [null, "霍兰德职业兴趣测试", "我愿意投入哪些工作活动？", "60 题 · 约 8 分钟", "想先缩小职业探索范围"],
  [`/zh${CAREER_ASSESSMENT_LANDING_PATH}`, "费马职业测试", "哪些工作方向值得进一步了解？", "94 题 · 约 12–15 分钟", "选专业、找第一份工作或准备转行"],
  ["/zh/tests/mbti-personality-test-16-personality-types", "MBTI 性格测试", "我习惯怎样获取信息和做决定？", "93 / 144 题 · 约 10–15 分钟", "想理解性格偏好与协作方式"],
] as const;

export function HollandLanding({ start }: { start: StartChoice | undefined }) {
  const [title, version] = hollandLandingTitle.split("（");
  const samplePath = `/zh/tests/${SCALE_CANONICAL_SLUG_MAP.RIASEC}/sample`;
  return <div className={styles.page}>
    <div className={styles.hero}>
      <div className={styles.shell}>
        <nav className={styles.breadcrumb} aria-label="面包屑">
          <Link href="/zh">首页</Link><span aria-hidden="true">/</span>
          <Link href="/zh/tests">全部测评</Link><span aria-hidden="true">/</span>
          <span aria-current="page">霍兰德职业兴趣测试</span>
        </nav>
        <div className={styles.heroGrid}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>职业兴趣测评 <span aria-hidden="true">/</span> RIASEC</p>
            <h1>{title}<wbr /><span className={styles.heroVersion}>（{version}</span>
              <span className={styles.heroSubheading}>测出你的 RIASEC 三字代码与职业探索方向</span>
            </h1>
            <p className={styles.lead}>看清你愿意投入的工作方向。约 8 分钟，免费查看六维兴趣分数、三字代码和基础解读。</p>
            <div className={styles.actions}>
              {start?.href ? <TrackedEntryCtaLink className={styles.primary} href={start.href} prefetch={false}
                data-testid={start.testId} eventProperties={start.eventProperties ?? {}}>
                免费开始 60 题测试 <ArrowRight size={19} aria-hidden="true" />
              </TrackedEntryCtaLink> : <button type="button" className={styles.primary} disabled>60 题测试暂不可用</button>}
              <HollandReportPreview samplePath={samplePath} />
            </div>
            <p className={styles.heroNote}>无需注册，六维各 10 题</p>
          </div>
          <HollandHeroReport />
        </div>
      </div>
    </div>

    <section className={`${styles.shell} ${styles.section}`} aria-labelledby="holland-deliverables">
      <h2 id="holland-deliverables">交卷后，你会看到什么？</h2>
      <p className={styles.definition}>费马测试（FermatMind）的免费霍兰德职业兴趣测试基于 RIASEC 六维模型：现实型（R）、研究型（I）、艺术型（A）、社会型（S）、企业型（E）、常规型（C）。每维 10 题，共 60 题，约 8 分钟。无需注册即可免费查看六维兴趣雷达图与分数（0–100）、前三字母兴趣代码和基础解读，并可在 1,046 个职业档案中对照真实工作任务。</p>
      <div className={styles.benefits}>{benefits.map(([Icon, heading, body]) => <article key={heading}>
        <span className={styles.benefitIcon}><Icon size={22} aria-hidden="true" /></span>
        <h3>{heading}</h3><p>{body}</p>
      </article>)}</div>
    </section>

    <section className={`${styles.shell} ${styles.section} ${styles.fit}`} aria-labelledby="holland-fit">
      <div>
        <h2 id="holland-fit">能力够用、薪水不错，为什么上班还是很消耗？</h2>
        <p>如果每天的大部分时间都花在缺乏兴趣的活动上，即使工作做得来，也可能很难持续投入。</p>
        <p>人与环境匹配研究发现，兴趣与工作内容越契合，工作满意度通常越高。工时、管理方式和工作条件也值得一起看。</p>
        <p>霍兰德用六边形表示六类兴趣之间的关系：相邻兴趣的活动通常更相似，对角兴趣更不同，两者也可以出现在同一个岗位。</p>
      </div>
      <HollandHexagon />
    </section>

    <section className={styles.explore} aria-labelledby="holland-careers">
      <div className={`${styles.shell} ${styles.section}`}>
        <div className={styles.sectionHeading}>
          <div><h2 id="holland-careers">RIASEC 六维兴趣与代表职业</h2>
            <p>以下岗位来自费马的 1,046 个职业档案。美国资料按岗位参考 <a href="https://www.onetcenter.org/database.html">O*NET</a> 与 <a href="https://www.bls.gov/oes/">美国劳工统计局（BLS）</a>。中国大陆职业分类参考人力资源社会保障部发布的<a href="https://www.mohrss.gov.cn/wap/xw/rsxw/202209/t20220929_487969.html">《中华人民共和国职业分类大典（2022年版）》</a>及<a href="https://chinajob.mohrss.gov.cn/c/2024-08-01/413001.shtml">后续新职业公告</a>。具体任务、入行条件和薪资口径见各档案。</p>
          </div>
          <Link href="/zh/career">浏览职业库 <ArrowUpRight size={17} aria-hidden="true" /></Link>
        </div>
        <div className={styles.jobs}>{hollandJobs.map(({ code, jobs }, index) => {
          const [, title, preference, trial, friction] = hollandDimensions[index];
          return <article className={styles.job} data-dimension={code} key={code}>
            <div className={styles.jobHeading}><span className={styles.letter}>{code}</span><div><h3>{title}</h3><p>{preference}</p></div></div>
            <ul>{jobs.map(([slug, label], jobIndex) => <li key={slug}>
              <Link href={`/zh/career/jobs/${slug}`} prefetch={false}>
                <span><strong>{label[0]}</strong> <span className={styles.jobField}>{fields[index][jobIndex]}</span><small>{occupations[index][jobIndex]}</small></span><ArrowUpRight size={15} aria-hidden="true" />
              </Link>
            </li>)}</ul>
            <p className={styles.trial}><strong>试做</strong> {trial}</p>
            <p className={styles.friction}><strong>易内耗场景</strong> {friction}</p>
          </article>;
        })}</div>
        <h3 className={styles.codeHeading}>把三字代码变成可以试做的任务</h3>
        <p className={styles.exampleNote}>这些职业展示不同兴趣如何在同一工作中结合。点开档案，看看任务占比和入行条件。</p>
        <dl className={styles.examples}>{hollandCodeExamples.map(([code, example]) => <div key={code}>
          <dt aria-label={code}><HollandCodeLetters code={code} /></dt>
          <dd><p>{example[0]}</p>
            <ul>{exampleCareers[code].map(([slug, label]) => <li key={slug}><Link prefetch={false} href={`/zh/career/jobs/${slug}`}>{label}<ArrowUpRight size={13} aria-hidden="true" /></Link></li>)}</ul>
          </dd>
        </div>)}</dl>
        <div className={styles.tools}>{tools.map(([Icon, href, label, body]) => <Link key={href} href={href}>
          <Icon size={23} aria-hidden="true" /><span><strong>{label}</strong><small>{body}</small></span><ArrowUpRight size={16} aria-hidden="true" />
        </Link>)}</div>
      </div>
    </section>

    <section className={`${styles.shell} ${styles.section}`} aria-labelledby="holland-scenarios">
      <h2 id="holland-scenarios">把兴趣用在你正在做的决定上</h2>
      <div className={styles.scenarios}>{scenarios.map(([heading, body, href, label]) => <article key={heading}>
        <h3>{heading}</h3><p>{body}</p><Link href={href}>{label} <ArrowUpRight size={15} aria-hidden="true" /></Link>
      </article>)}</div>
    </section>

    <section className={`${styles.shell} ${styles.comparisonSection}`} aria-labelledby="holland-comparison">
      <h2 id="holland-comparison">三款测评，怎么选？</h2>
      <div className={styles.comparison} tabIndex={0} role="region" aria-label="测评对比表，可横向滚动">
        <table><thead><tr><th scope="col">测评</th><th scope="col">解决什么问题</th><th scope="col">题量与用时</th><th scope="col">适合谁</th></tr></thead>
          <tbody>{comparisons.map(([href, label, question, length, audience]) => <tr key={label}>
            <th scope="row">{href ? <Link href={href}>{label}</Link> : <>{label}<small>当前测评</small></>}</th>
            <td>{question}</td><td>{length}</td><td>{audience}</td>
          </tr>)}</tbody>
        </table>
      </div>
    </section>

    <section className={`${styles.shell} ${styles.faqSection}`} aria-labelledby="holland-faq">
      <h2 id="holland-faq">常见问题</h2>
      <div className={styles.faq}>{hollandFaq.map(({ question, answer }, index) => <details key={question} open={index < 3}>
        <summary><h3>{question}<ArrowDown size={17} aria-hidden="true" /></h3></summary><p>{answer}</p>
      </details>)}</div>
    </section>

    <section className={`${styles.shell} ${styles.methodSection}`} aria-labelledby="holland-method">
      <div className={styles.method}>
        <h2 id="holland-method">测评科学与计分方法</h2>
        <p>费马题本采用约翰·霍兰德的 RIASEC 六维职业兴趣模型。结果用于职业探索，帮助你选择值得进一步了解的活动与工作。</p>
        <h3>60 题如何计分</h3>
        <p>六类活动兴趣各 10 题。每题按对所述活动的兴趣程度选 1–5 分。单维原始总分 <var>S</var> 为 10–50 分，展示分 <var>P</var> 线性换算至 0–100。</p>
        <p className={styles.equation} aria-label="P 等于 100 乘以 S 减 10 的差，再除以 40"><var>P</var> = 100 × (<var>S</var> − 10) ÷ 40</p>
        <p>验算：<var>S</var> = 38 时，<span className={styles.inlineMath}><var>P</var> = 100 × (38 − 10) ÷ 40 = 70</span>。</p>
        <p>同分按 R → I → A → S → E → C 排列。清晰度是前两名的分差，分化程度用六维分数的总体标准差描述。</p>
        <h3>量尺与常模</h3>
        <p>0–100 是本题本内的兴趣量尺分。70 分表示该维度原始总分换算为 70，不能解读为超过 70% 的人或有 70% 的职业匹配度。此处公开题项结构和计分规则，未披露这份 60 题题本的常模或内部一致性系数。O*NET 技术手册说明的是其自身题本的研究证据。</p>
        <div className={styles.sources}><a href="https://www.onetcenter.org/reports/IP_Manual.html">O*NET Interest Profiler 技术手册 <ArrowUpRight size={15} aria-hidden="true" /></a>
          <a href="https://doi.org/10.1016/j.jvb.2020.103503">兴趣匹配与工作满意度研究 <ArrowUpRight size={15} aria-hidden="true" /></a>
          <Link href={`/zh/tests/${SCALE_CANONICAL_SLUG_MAP.RIASEC}/technical-note`}>费马测评技术说明 <ArrowUpRight size={15} aria-hidden="true" /></Link></div>
      </div>
    </section>
    {start?.href ? <HollandStickyAction href={start.href} eventProperties={start.eventProperties ?? {}} /> : null}
  </div>;
}
