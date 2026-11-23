import Image from "next/image";
import { getMbtiResultPortrait } from "@/lib/mbti/resultPortrait";
import { mbtiFunctionStacks } from "@/lib/mbti/landingTypeDynamics";
import type { MbtiLandingPublicSample } from "@/lib/mbti/landingReportPreview";
import Link from "next/link";
import { ArrowDown, ArrowRight, BookOpen, ChartNoAxesCombined, Compass } from "lucide-react";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import {
  assessmentLinks, careerDirections, careerLandingTitle, careerSections, choiceRows, mbtiLandingTitle,
  mbtiReportAccess, mbtiTypeGroups, type LandingFaq, type LandingProfile,
} from "@/lib/tests/assessmentLandingEditorial";
import { AssessmentPrinciple, AssessmentReportSample, MbtiCognitiveExplorer, MbtiLandingReportPreview } from "./AssessmentLandingVisuals";
import { HollandStickyAction } from "./HollandLandingInteractions";
import shared from "./holland-landing.module.css";
import styles from "./assessment-landing-editorial.module.css";

type Choice = {
  key: string;
  href: string | null;
  label: string;
  testId?: string;
  eventProperties?: Record<string, string>;
};

const careerFree = "无需注册，免费查看六维兴趣概览与初步职业候选。";
const mbtiActions = [
  { heading: "我为什么会这样想？", body: "回想一次让你越做越有劲的事，再想一次做完只想安静待会儿的事。你在两件事里分别把注意力放在哪儿？", links: [[assessmentLinks.personality, "找找相似的人格画像"]] },
  { heading: "我们为什么总聊岔？", body: "下次有人跟你吐槽，先问一句「想让我听，还是一起想办法？」看看对方真正需要的是哪一种。", links: [["/zh/personality/intj-vs-intp", "看两种相近类型怎么想"]] },
  { heading: "什么样的工作更适合我？", body: "把两个感兴趣的岗位摆在一起，挑一项日常任务试做。再想想，这样的任务你愿不愿意每周做。", links: [[assessmentLinks.holland, "了解喜欢的工作活动"], [assessmentLinks.career, "一起看看工作方式和条件"]] },
] as const;
const mbtiChoiceRows = [...choiceRows, {
  key: "big-five",
  title: "大五人格测试",
  question: "我在五种连续人格特质上处于什么位置？",
  timing: "90 题 · 约 11 分钟",
  audience: "想对照开放性、自律、人际与情绪倾向",
}] as const;
const careerActions = [
  ["选专业", "挑两三门核心课，核实作业、实验、实习和毕业去向，再安排一次旁听。", "/zh/career", "浏览 1,046 个职业档案"],
  ["找第一份工作", "把两个意向岗位放在一起，逐项对照日常任务、入行条件和工作环境。", assessmentLinks.compare, "打开 C1 双职业对比"],
  ["准备转行", "把不喜欢的任务与无法接受的工时分开记录，安排一次访谈或试做。", assessmentLinks.worksheet, "填写 C2 行动工作表"],
] as const;

function MethodPanel({ profile }: { profile: LandingProfile }) {
  return <section id={profile === "mbti" ? "method-and-evidence" : undefined} className={`${shared.shell} ${shared.methodSection}`} aria-labelledby="assessment-method">
    <div className={`${shared.method} ${styles.method}`}>
      <h2 id="assessment-method">测评科学与计分方法</h2>
      {profile === "mbti" ? <div className={styles.methodBlocks}>
        <article><h3>四组偏好如何计分</h3>
        <p>先将 −2 到 +2 的作答按题目方向归到每轴第一极。设 <var>n</var> 为有效题数，<var>S</var> 为定向作答和，<var>P</var> 为第一极百分比。</p>
        <p className={`${shared.equation} ${styles.equation}`}>P = round[100 × (S + 2n) ÷ (4n)]</p>
        <p>验算：n = 10、S = 8 时，P = 100 × (8 + 20) ÷ 40 = 70%，两极为 70% / 30%。</p></article>
        <article><h3>加权兼容与清晰度</h3>
        <p>兼容计分使用题目权重 <var>wᵢ</var> 和定向作答 <var>xᵢ</var>，换算后限定在 0–100，并按计分规范舍入。</p>
        <p className={`${shared.equation} ${styles.equation}`}>P = 50 + 25 × (Σ wᵢxᵢ) ÷ (Σ wᵢ)</p>
        <p>清晰度为 <span className={shared.inlineMath}>2 × |P − 50|</span>。例中的清晰度为 40。百分比描述作答方向，50% 附近表示方向较弱。</p></article>
        <article><h3>四字母、A/T 与量尺</h3>
        <p>A/T 是费马附加轴，独立于四组偏好与四字母判型。功能顺序按类型理论推导，四组题本未单独测量八种功能。百分比描述本次作答方向，不是人群百分位。费马使用独立题本和评分方法，Myers-Briggs Type Indicator® 是另行发布的商业量表。</p>
        <p><a href="https://www.myersbriggs.org/unique-features-of-myers-briggs/type-dynamics-processes/">阅读类型动力学参考</a></p></article>
      </div> : <>
        <h3>有效作答与 0–100 分</h3>
        <p>兴趣每维至少 6 个有效回答，工作方式和工作条件每维至少 3 个，达不到则该维暂不显示分数。反向题先反向计分，未知回答不计入均值。当前情况 8 题只提供背景。</p>
        <p className={`${shared.equation} ${styles.equation}`}>P = 25 × (有效作答均值 − 1)</p>
        <p>验算：有效作答均值为 4.2，P = 25 × (4.2 − 1) = 80。0–100 是题本换算量尺，不是人群百分位。</p>
        <h3>兴趣理论与职业档案</h3>
        <p>六维兴趣使用霍兰德 RIASEC 框架，<a href="https://www.onetcenter.org/reports/IP_Manual.html">O*NET Interest Profiler 技术手册</a>提供理论背景。费马 94 题有独立题本与计分，并将工作方式、工作条件和当前情况一并纳入探索。</p>
      </>}
      <div className={shared.sources}><Link href="/zh/item-design-notes">题目设计说明</Link><Link href="/zh/method-boundaries">测评方法与使用范围</Link></div>
    </div>
  </section>;
}

type LandingProps = { choices: Choice[]; faq: LandingFaq[] } & (
  | { profile: "mbti"; fullMbtiReport: boolean; mbtiSample: MbtiLandingPublicSample }
  | { profile: "career"; fullMbtiReport?: never; mbtiSample?: never }
);

export function AssessmentEditorialLanding({ profile, choices, faq, fullMbtiReport = false, mbtiSample }: LandingProps) {
  const mbti = profile === "mbti";
  const title = mbti ? mbtiLandingTitle : careerLandingTitle;
  const [heading, subtitle] = title.split("：");
  const available = choices.filter((choice): choice is Choice & { href: string } => Boolean(choice.href));
  const primary = (mbti ? available.find(choice => choice.key === "mbti_93") : undefined) ?? available[0];
  const reportAccess = mbti ? mbtiReportAccess(fullMbtiReport) : careerFree;
  const sampleHref = "/zh/reports/samples/career94";
  const benefits = mbti ? [
    ["四个字母怎么来的？", "看每组偏好背后的两种做法。比如遇到难题，你更常先聊一聊，还是独自想出个头绪？"],
    ["哪一组最接近五五开？", "52% P 和 48% J 很接近。可以回想，在什么事上你习惯先安排好，什么时候愿意临场再定。"],
    [fullMbtiReport ? "我的相处习惯是什么？" : "同一个字母，做法为什么不同？", fullMbtiReport
      ? "比如你习惯用行动照顾别人，报告也会提醒你，什么时候说清自己的需要更有帮助。"
      : "到人格百科比较两个只差一个字母的类型，看看相同场景里，双方可能先在意什么。"],
  ] : [
    ["六维兴趣概览", "从动手、研究、创意、助人、推动和整理六类活动里找到探索起点。"],
    ["现实条件线索", "作答同时梳理工作方式、工时和学习支持，用它们核对候选方向。"],
    ["初步职业候选", "继续查真实工作任务与入行条件，挑两个方向深入比较。"],
  ];
  const [headline, edition] = heading.split("（");
  return <div className={`${shared.page} ${styles.page}${mbti ? ` ${styles.mbtiPage}` : ""}`}>
    <div className={mbti ? `${shared.hero} ${styles.mbtiHero}` : shared.hero}>
      <div className={shared.shell}>
        <nav className={shared.breadcrumb} aria-label="面包屑">
          <Link href="/zh">首页</Link><span aria-hidden="true">/</span><Link href={mbti ? "/zh/tests" : "/zh/career"}>{mbti ? "全部测评" : "职业探索"}</Link>
          <span aria-hidden="true">/</span><span aria-current="page">{headline}</span>
        </nav>
        <div className={mbti ? `${shared.heroGrid} ${styles.mbtiHeroGrid}` : shared.heroGrid}>
          <div className={shared.heroCopy}>
            {mbti ? <>
              <h1 className={styles.mbtiHeading}>{headline}</h1>
              <p className={styles.mbtiEdition}>93 题快速版 · 144 题深度版</p>
              <p className={shared.lead}>有些人边聊边想，有些人想清楚才开口。看看你更习惯怎么接收信息、做决定、和别人相处。</p>
              <p className={styles.mbtiAccess}>{fullMbtiReport
                ? "无需注册，两版做完都能在作答浏览器免费查看完整四章报告。"
                : "无需注册，测完免费查看你的四字母类型与四组偏好分数。"}</p>
            </> : <>
              <p className={shared.kicker}>选专业 · 求职 · 转行</p>
              <h1>{headline}<wbr /><span className={shared.heroVersion}>（{edition}：</span><span className={shared.heroSubheading}>{subtitle}</span></h1>
              <p className={shared.lead}>约 12–15 分钟。{reportAccess}</p>
            </>}
            <div className={shared.actions}>
              {mbti ? <>
                {primary && <details className={styles.versionPicker}>
                  <summary className={shared.primary}>开始免费测试 <ArrowRight size={16} aria-hidden="true" /></summary>
                  <div className={styles.versionMenu}>
                    {[...available].sort((a, b) => Number(b.key === "mbti_93") - Number(a.key === "mbti_93")).map(choice => {
                      const quick = choice.key === "mbti_93";
                      return <TrackedEntryCtaLink key={choice.key} href={choice.href} data-testid={choice.testId} eventProperties={choice.eventProperties ?? {}}>
                        <span><b>{quick ? "93 题快速版" : "144 题深度版"}</b><small>{quick ? "约 10 分钟 · 初次测试推荐" : "约 15 分钟 · 多看一些判断情境"}</small></span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </TrackedEntryCtaLink>;
                    })}
                  </div>
                </details>}
                <a className={shared.secondary} href="#assessment-explore">探索 16 型人格图鉴 <ArrowDown size={16} aria-hidden="true" /></a>
              </> : available.map((choice, index) => <TrackedEntryCtaLink key={choice.key} className={index ? shared.secondary : shared.primary}
                  href={choice.href} data-testid={choice.testId} eventProperties={choice.eventProperties ?? {}}>
                  {choice.label}<ArrowRight size={16} aria-hidden="true" />
                </TrackedEntryCtaLink>)}
              {!primary && <button type="button" className={shared.primary} disabled>测试暂不可用</button>}
            </div>
            {!mbti && <p className={shared.heroNote}><Link href={sampleHref} prefetch={false}>查看示例报告</Link></p>}
          </div>
          {mbtiSample ? <MbtiLandingReportPreview sample={mbtiSample} /> : <AssessmentReportSample />}
        </div>
      </div>
    </div>

    <section className={`${shared.shell} ${shared.section}`} aria-labelledby="assessment-deliverables">
      <h2 id="assessment-deliverables">{mbti ? "测完，你会看到什么？" : "交卷后，你会看到什么？"}</h2>
      <p className={shared.definition}>{mbti
        ? `费马测试（FermatMind）提供 93 题快速版（约 10 分钟）和 144 题深度版（约 15 分钟）。题本计分 E/I、S/N、T/F、J/P 四组自陈偏好，荣格八维用于解释类型。${reportAccess}${fullMbtiReport ? "可查看四维百分比、16 型人格画像和亲密关系与职业探索建议。" : ""}也可继续浏览 185 页 MBTI 人格百科。`
        : `费马职业测试共 94 题，约 12–15 分钟，梳理职业兴趣、工作方式、择业条件和当前情况。${reportAccess}`}</p>
      <div className={shared.benefits}>{benefits.map(([heading, body], i) => {
        const Icon = [ChartNoAxesCombined, BookOpen, Compass][i];
        return <article key={heading}><span className={shared.benefitIcon}><Icon size={20} aria-hidden="true" /></span><h3>{heading}</h3><p>{body}</p></article>;
      })}</div>
    </section>

    {mbti ? <div className={`${shared.shell} ${shared.section}`}><MbtiCognitiveExplorer /></div> :
      <section className={`${shared.shell} ${shared.section} ${shared.fit}`} aria-labelledby="assessment-principles">
        <div><h2 id="assessment-principles">同样的兴趣，为什么两份工作做起来差别很大？</h2>
          <p>你愿意做的事只是一个起点。高频沟通、单人专注、工时和技能学习条件，都可能改变你对同一个岗位的判断。</p>
          <p>霍兰德 60 题先看活动兴趣。94 题把兴趣、方式和条件放到同一张探索清单。点击示意图逐项拆开看。</p>
        </div>
        <AssessmentPrinciple />
      </section>}

    <section className={shared.explore} aria-labelledby="assessment-explore">
      <div className={`${shared.shell} ${shared.section}`}>
        <div className={shared.sectionHeading}>
          <div><h2 id="assessment-explore">{mbti ? "16 型人格全景图鉴" : "从题本结构到六维职业方向"}</h2>
            <p>{mbti ? "挑一个让你想起自己或朋友的类型，看看同一件事，大家可能有几种不同的想法。"
              : <>职业档案按岗位参考美国 <a href="https://www.onetcenter.org/database.html">O*NET</a>、<a href="https://www.bls.gov/oes/">BLS</a> 与<a href="https://www.mohrss.gov.cn/wap/xw/rsxw/202209/t20220929_487969.html">《中华人民共和国职业分类大典（2022年版）》</a>。具体数据口径见各档案。</>}</p>
          </div>
          <Link href={mbti ? assessmentLinks.personality : "/zh/career"}>{mbti ? "浏览 185 页 MBTI 人格百科" : "进入 1,046 职业档案"}</Link>
        </div>
        {mbti ? <div className={styles.typeGroups}>{mbtiTypeGroups.map(group => <section className={styles.typeGroup} key={group.code} data-group={group.code}>
          <h3><b>{group.code}</b> {group.name}</h3>
          <div className={styles.typeGrid}>{group.types.map(([code, name, portrait, strengths, friction]) => {
            const image = getMbtiResultPortrait(code);
            return <article className={styles.archetype} key={code} data-type={code}>
              <div className={styles.typeArt}>
                {image && <Image src={image} alt="" width={360} height={520} sizes="(max-width: 570px) 73px, 101px" />}
              </div>
              <div className={styles.typeContent}>
                <h4><span>{code}</span> · {name}</h4>
                <p>{portrait}</p>
                <p className={styles.strengths}>{strengths}</p>
                <p className={styles.typeStack} aria-label={`常见理论功能栈 ${mbtiFunctionStacks[code].join("、")}`}>{mbtiFunctionStacks[code].join(" · ")}</p>
                <details className={styles.typeFriction}><summary>相处时可以留意 <span aria-hidden="true" /></summary><p>{friction}</p></details>
                <Link href={`/zh/personality/${code.toLowerCase()}`} prefetch={false}
                  aria-label={`查看 ${code} ${name}的类型解析`}>查看类型解析 <ArrowRight size={14} aria-hidden="true" /></Link>
              </div>
            </article>;
          })}</div>
        </section>)}</div> : <>
          <ul className={styles.questionGrid} aria-label="94 题结构">{careerSections.map(([heading, count, body]) => <li key={heading}>
            <span>{count}</span><h3>{heading}</h3><p>{body}</p>
          </li>)}</ul>
          <div className={shared.jobs}>{careerDirections.map(([code, title, task, friction, slug, label]) => <article className={shared.job} data-dimension={code} key={code}>
            <div className={shared.jobHeading}><span className={shared.letter}>{code}</span><h3>{title}</h3></div>
            <p>{task}</p><p className={shared.friction}>易内耗场景 · {friction}</p>
            <Link className={styles.cardLink} href={`/zh/career/jobs/${slug}`} prefetch={false}>{label}的工作任务 <ArrowRight size={15} aria-hidden="true" /></Link>
          </article>)}</div>
        </>}
      </div>
    </section>

    <section className={`${shared.shell} ${shared.section}`} aria-labelledby="assessment-scenarios">
      <h2 id="assessment-scenarios">{mbti ? "把结果带进生活" : "你现在，卡在哪一步？"}</h2>
      <div className={shared.scenarios}>{mbti ? mbtiActions.map(({ heading, body, links }) => <article key={heading}>
        <h3>{heading}</h3><p>{body}</p>{links.map(([link, label]) => <Link key={link} href={link}>{label} <ArrowRight size={15} aria-hidden="true" /></Link>)}
      </article>) : careerActions.map(([heading, body, link, label]) => <article key={heading}>
        <h3>{heading}</h3><p>{body}</p><Link href={link}>{label} <ArrowRight size={15} aria-hidden="true" /></Link>
      </article>)}</div>
    </section>

    <section className={`${shared.shell} ${shared.comparisonSection}`} aria-labelledby="assessment-choice">
      <h2 id="assessment-choice">{mbti ? "四款测评，怎么选？" : "三款测评，怎么选？"}</h2>
      {mbti && <p className={styles.tableHint} aria-hidden="true">左右滑动查看四列 <ArrowRight size={14} /></p>}
      <div className={mbti ? `${shared.comparison} ${styles.mbtiComparison}` : shared.comparison} role="region" aria-label="测评对照表，可横向滚动" tabIndex={0}>
        <table><thead><tr><th scope="col">测评工具</th><th scope="col">解决什么问题</th><th scope="col">题量与用时</th><th scope="col">适合谁</th></tr></thead>
          <tbody>{(mbti ? mbtiChoiceRows : choiceRows).map(row => <tr key={row.key} aria-current={row.key === profile ? "true" : undefined}>
            <th scope="row">{row.key === profile ? row.title : <Link href={row.key === "big-five" ? "/zh/tests/big-five-personality-test-ocean-model" : assessmentLinks[row.key]}>{row.title}</Link>}</th>
            <td>{row.question}</td><td>{row.timing}</td><td>{row.audience}</td>
          </tr>)}</tbody>
        </table>
      </div>

    </section>

    <section className={`${shared.shell} ${shared.faqSection}`} id="assessment-faq" aria-labelledby="assessment-faq-title">
      <h2 id="assessment-faq-title">常见问题</h2>
      <div className={shared.faq}>{faq.map(({ question, answer }, index) => <details key={question} open={index < 3}>
        <summary><h3>{question}</h3>{mbti && <span className={styles.faqIcon} aria-hidden="true" />}</summary><p>{answer}</p>
      </details>)}</div>
    </section>

    {!mbti && primary && <div className={`${shared.shell} ${styles.closing}`}>
      <TrackedEntryCtaLink href={primary.href} eventProperties={primary.eventProperties ?? {}} className={shared.primary}
        data-testid="free-assessment-start-closing">{primary.label} <ArrowRight size={16} aria-hidden="true" /></TrackedEntryCtaLink>
      <Link href={sampleHref} prefetch={false}>查看示例报告</Link>
    </div>}
    <MethodPanel profile={profile} />
    {primary && <HollandStickyAction title={mbti ? headline : heading} description={mbti ? "读懂四组偏好" : "免费查看六维兴趣概览"}
      href={primary.href} eventProperties={primary.eventProperties ?? {}} />}
  </div>;
}
