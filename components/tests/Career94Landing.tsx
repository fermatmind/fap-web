import { ArrowDown, ArrowRight, ArrowUpRight, ChartNoAxesCombined, GitBranch, Map } from "lucide-react";
import Link from "next/link";
import { TrackedEntryCtaLink } from "@/components/analytics/TrackedEntryCtaLink";
import { JsonLd } from "@/components/seo/JsonLd";
import type { DisplayLocale } from "@/lib/i18n/locales";
import { buildBreadcrumbJsonLd, buildFAQPageJsonLd } from "@/lib/seo/generateSchema";
import { canonicalUrl } from "@/lib/site";
import { freeAssessmentCopy } from "@/lib/tests/freeAssessmentLanding";
import { careerComparison, careerDirections, careerJobs, careerScenarios, careerText, career94Faq, mainlandCareerExamples, mainlandMajorExamples } from "@/lib/tests/career94Landing";
import { Career94Layers, Career94Sample, Career94Sticky } from "./Career94LandingInteractions";
import styles from "./career94-landing.module.css";

const benefits = [
  { icon: ChartNoAxesCombined, title: ["六维图谱与三字代码", "Six interest scores and your code", "六維圖譜與三字代碼"], body: ["在同一把 0–100 量尺上看六种兴趣。用前三项代码记下你更想尝试的活动。", "Read six interests on one 0–100 scale. Use the three-letter code to note the activities that stand out.", "在同一個 0–100 量尺上閱讀六類興趣，用前三項代碼記下想嘗試的活動。"] },
  { icon: GitBranch, title: ["接近的方向，可以一起看", "Explore close scores together", "分數接近，可以一起探索"], body: ["看见并列或近分时，带着两种解释去对照任务，保留下一步的选择。", "When scores are tied or close, compare real tasks in both directions before narrowing your options.", "遇到並列或近分，可以用兩種解讀對照工作任務，先保留選擇。"] },
  { icon: Map, title: ["从候选走到真实岗位", "Go from a shortlist to real jobs", "從候選方向走到實際職位"], body: ["从兴趣候选进入职业档案，比较任务、入行条件和学习成本，再决定先试哪一步。", "Open career profiles to compare tasks, entry requirements and training before deciding what to try.", "從興趣選項進入職業檔案，比較任務、入行條件與學習成本，再選一步試試看。"] },
] as const;

export function Career94Landing({ locale }: { locale: DisplayLocale }) {
  const t = (zh: string, en: string, tw: string) => careerText(locale, [zh, en, tw]);
  const path = (suffix: string) => `/${locale}${suffix}`;
  const english = locale === "en";
  const mainland = locale === "zh";
  const traditional = locale === "zh-TW";
  const takeLocale = traditional ? "zh" : locale;
  const start = `/${takeLocale}/career/assessment/take`;
  const sample = `/${takeLocale}/career/assessment/sample`;
  const { title, intro: lead } = freeAssessmentCopy("career", locale);
  const separator = english ? ":" : "：";
  const [titleMain, titleDetail] = title.split(separator);
  const cta = t("免费开始测试", "Start the free career test", "免費開始測驗");
  const position = t("费马职业测试", "FermatMind Career94", "費馬職業測驗");
  const tests = t("测试", "Tests", "測驗");
  const faq = career94Faq(locale);
  const home = t("首页", "Home", "首頁");
  const homePath = traditional ? "/zh-TW" : english ? "/en" : "/";
  const headers = [
    t("测评工具", "Assessment", "測驗工具"), t("解决什么问题", "What it helps you answer", "想解決的問題"),
    t("题量与用时", "Questions & time", "題數與時間"), t("适合谁", "Who it’s for", "適合誰"),
  ];

  return <main className={styles.page} data-career94-landing>
    <JsonLd id="free-assessment-page" data={{ "@context": "https://schema.org", "@type": "WebPage",
      url: canonicalUrl(path("/career/assessment")), name: title, description: lead, inLanguage: locale === "zh" ? "zh-CN" : locale, isAccessibleForFree: true }} />
    <JsonLd id="free-assessment-breadcrumb" data={buildBreadcrumbJsonLd([
      { name: home, path: homePath }, { name: tests, path: path("/tests") }, { name: position, path: path("/career/assessment") },
    ])} />
    <JsonLd id="free-assessment-faq" data={buildFAQPageJsonLd(faq)} />
    <header className={styles.hero} data-career-hero>
      <div className={styles.wrap}>
        <nav className={styles.breadcrumb} aria-label={t("面包屑", "Breadcrumb", "導覽路徑")}>
          <Link href={homePath}>{home}</Link><span aria-hidden>/</span><Link href={path("/tests")}>{tests}</Link><span aria-hidden>/</span><span aria-current="page">{position}</span>
        </nav>
        <div className={styles.heroGrid}>
          <div className={mainland ? styles.mainlandHeroCopy : undefined}>
            <h1>{titleMain}{!mainland && separator} <span>{titleDetail.trim()}</span></h1>
            <p className={styles.lead}>{lead}</p>
            <p className={styles.heroPromise}>{t("免注册完成 94 题，做完即可查看六维兴趣图谱、三字代码与职业方向。", "No signup. Finish all 94 questions and explore your six interest scores, Holland Code and career directions.", "無須註冊完成 94 題，做完即可查看六維興趣圖譜、三字代碼與職涯方向。")}</p>
            <div className={styles.heroActions}>
              <TrackedEntryCtaLink href={start} data-testid="free-assessment-start" eventProperties={{}} className={styles.primary}>{cta} <ArrowRight size={18} aria-hidden /></TrackedEntryCtaLink>
              <a href="#career-directions" className={styles.secondary}>{t("浏览 1,046 个职业档案", "Explore 1,046 career profiles", "瀏覽 1,046 份職業檔案")} <ArrowDown size={17} aria-hidden /></a>
            </div>
            {traditional && <p className={styles.localeNote}>目前作答頁提供簡體中文題本。此頁完整提供繁中報告預覽與職業檔案連結。</p>}
          </div>
          <Career94Sample locale={locale} />
        </div>
      </div>
    </header>

    <section className={`${styles.wrap} ${styles.section}`} aria-labelledby="career-results-title">
      <h2 id="career-results-title">{t("职业测试报告包含什么？免费查看六维图谱与职业候选", "What will you see when you finish?", "測完，你會看到什麼？")}</h2>
      <p className={styles.answer}>{t("费马职业测试共 94 题（42 兴趣、20 工作方式、24 工作条件、8 当前处境），约 12–15 分钟。免注册免费看六维兴趣、三字码与 743 个职业中的候选；深度报告可选购。速测兴趣可选霍兰德 60 题（约 8 分钟）。", "Career94 takes about 12–15 minutes and covers 42 interest, 20 work-style, 24 job-condition and eight background questions. No signup is needed to see your free interest profile, code and suggestions drawn from 743 careers. The full report is optional. For interests alone, try the eight-minute Holland Code test.", "費馬職業測驗共 94 題（興趣 42、工作方式 20、工作條件 24、目前處境 8），約 12–15 分鐘。無須註冊可免費查看六維興趣、三字代碼，以及從 743 個有興趣向量的職業篩出的初步選項。深度報告可選購。只想測興趣，可做約 8 分鐘的霍蘭德 60 題。")}</p>
      <div className={styles.benefits}>{benefits.map(({ icon: Icon, title, body }, index) => <article key={title[0]}>
        <Icon aria-hidden size={24} /><h3>{careerText(locale, title)}</h3><p>{careerText(locale, body)}</p>
        {index === 2 && <div className={styles.methodLinks}>
          <Link href={path("/career/compare")} prefetch={false}>{t("比较两个职业", "Compare two careers", "比較兩個職業")}</Link>
          <Link href={path("/holland-test/pdf-download")} prefetch={false}>{t("职业探索工作表", "Career worksheet", "職涯探索工作表")}</Link>
        </div>}
      </article>)}</div>
      <Link className={styles.textLink} href={sample} prefetch={false}>{t("查看完整免费兴趣样张", "Read the full sample interest report", "閱讀完整興趣報告範例（簡體中文）")} <ArrowUpRight size={16} aria-hidden /></Link>
    </section>

    <section className={styles.insight} aria-labelledby="career-layers-title">
      <div className={`${styles.wrap} ${styles.section} ${styles.insightGrid}`}>
        <div className={mainland ? styles.mainlandInsightCopy : undefined}>
          <h2 id="career-layers-title">
            {mainland ? <>职业选择只看霍兰德兴趣够吗？<br />还要核对工作方式与条件</>
              : english ? "Why can work you enjoy still wear you out?" : "明明喜歡做分析，為什麼還是想換工作？"}
          </h2>
          <p>{t("想象两份都叫数据分析的工作。一个留出整段时间做研究，另一个每小时都要回应临时需求。你可能对两份工作的核心任务同样感兴趣，却更愿意长期做其中一份。", "Imagine two roles with the same title: data analyst. One gives you uninterrupted time to investigate; the other means responding to new requests all day. You might enjoy the core work in both and still prefer one of those weeks.", "想像兩份都叫資料分析師的工作。一份保留整段時間做研究，另一份整天都要回應臨時需求。你可能同樣喜歡兩份工作的核心任務，卻只想長期做其中一份。")}</p>
          <p>{t("把兴趣、做事方式、想要的条件和目前的限制分开看，找出下一步该核实什么。", "Look at what you enjoy, how you work, the conditions you need and what’s feasible now. Then decide what to verify.", "把興趣、做事方式、想要的條件與眼前限制分開看，找出下一步該核對什麼。")}</p>
        </div>
        <Career94Layers locale={locale} />
      </div>
    </section>

    <section id="career-directions" className={`${styles.wrap} ${styles.section}`} aria-labelledby="career-directions-title">
      <div className={styles.sectionHeader}>
        <div><h2 id="career-directions-title">{t("霍兰德六维职业类型（RIASEC）与真实岗位对照", "Six interests, seen through real work", "六類興趣，放進實際工作裡看")}</h2>
          <p>{t("从感兴趣的活动出发，看看不同岗位怎样完成它。1,046 个职业档案按岗位参考美国 O*NET / BLS 与《中华人民共和国职业分类大典（2022年版）》。", "Start with routines you’d like to try. Our 1,046 career profiles draw on sources including O*NET, the U.S. Bureau of Labor Statistics and China’s 2022 occupational classification, as applicable.", "從想嘗試的活動出發，看看不同職位怎麼完成它。1,046 份職業檔案依職位參考美國 O*NET、BLS 與《中華人民共和國職業分類大典（2022年版）》。")}</p></div>
        <Link className={styles.textLink} href={path("/career")} prefetch={false}>{t("进职业档案库", "Browse all careers", "瀏覽職業檔案庫")} <ArrowRight size={17} aria-hidden /></Link>
      </div>
      <div className={styles.directions}>{careerDirections.map(direction => <article key={direction.code} data-code={direction.code}>
        <h3><span className={styles.badge}>{direction.code}</span> {careerText(locale, direction.name)}</h3>
        <p className={styles.driving}>{careerText(locale, direction.drive)}</p>
        <p><b>{t("更投入时", "What may energize you", "容易投入時")}</b> {careerText(locale, direction.energy)}</p>
        <p><b>{t("容易耗能", "What may drain you", "容易耗能時")}</b> {careerText(locale, direction.friction)}</p>
        {mainland && <div className={styles.localExample}>
          <p><b>国内岗位举例</b> {mainlandCareerExamples[direction.code].roles}</p>
          <p><b>专业与课程参考</b> {mainlandCareerExamples[direction.code].study}</p>
        </div>}
        <ul>{direction.jobs.map(slug => <li key={slug}><Link prefetch={false} href={path(`/career/jobs/${slug}`)}>{careerText(locale, careerJobs[slug])} <ArrowUpRight size={13} aria-hidden /></Link></li>)}</ul>
      </article>)}</div>
      {mainland && <p className={styles.localSources}>国内岗位按实际任务举例，常见招聘名称与标准职业名称可能不同。专业方向用于查课程和实践要求。
        <a href="https://www.mohrss.gov.cn/wap/xw/rsxw/202210/t20221028_489104.html">人社部职业分类资料</a>
        <a href="https://www.moe.gov.cn/srcsite/A08/moe_1034/s3882/202604/t20260427_1434931.html">教育部本科专业目录（2026年）</a>
      </p>}
    </section>

    <section className={styles.scenarioBand} aria-labelledby="career-scenario-title">
      <div className={`${styles.wrap} ${styles.section}`}>
        <h2 id="career-scenario-title">{t("职业规划实战指南：高考选专业、应届求职与跨行转岗", "Put your results to work on a real decision", "把結果用在你眼前的決定上")}</h2>
        <div className={styles.scenarios}>{careerScenarios.map((scenario, index) => <article key={scenario.title[0]}>
          <h3>{careerText(locale, scenario.title)}</h3><p>{careerText(locale, scenario.text)}</p>
          {mainland && index === 0 && <dl className={styles.majorExamples}>
            {mainlandMajorExamples.map(([field, example]) => <div key={field}><dt>{field}</dt><dd>{example}</dd></div>)}
          </dl>}
          <ul>{scenario.links.map(([href, label]) => <li key={href}><Link href={path(href)} prefetch={false}>{careerText(locale, label)} <ArrowRight size={14} aria-hidden /></Link></li>)}</ul>
        </article>)}</div>
      </div>
    </section>

    <section className={`${styles.wrap} ${styles.section}`} aria-labelledby="career-choose-title">
      <h2 id="career-choose-title">{t("三款测评，怎么选？", "Which test should you take?", "三款測驗，怎麼選？")}</h2>
      <table className={styles.comparison} role="table">
        <thead role="rowgroup"><tr role="row">{headers.map(header => <th scope="col" role="columnheader" key={header}>{header}</th>)}</tr></thead>
        <tbody role="rowgroup">{careerComparison.map(row => <tr role="row" key={row.name[0]} data-current={!row.href}>
          <th scope="row" role="rowheader">{row.href ? <Link href={path(row.href)} prefetch={false}>{careerText(locale, row.name)} <ArrowUpRight size={14} aria-hidden /></Link> : careerText(locale, row.name)}</th>
          {[row.goal, row.time, row.audience].map((value, index) => <td role="cell" key={value[0]}><span aria-hidden className={styles.mobileColumn}>{headers[index + 1]}</span>{careerText(locale, value)}</td>)}
        </tr>)}</tbody>
      </table>
      {english && <p className={styles.comparisonNote}>Comparing 94-question tests? <a href="https://www.truity.com/test/career-personality-profiler-test">Truity pairs the Big Five with Holland interests</a>. Career94 adds questions on work style and conditions, including hours, stability and learning support.</p>}
    </section>

    <section id="assessment-faq" className={`${styles.wrap} ${styles.section} ${styles.faq}`} aria-labelledby="career-faq">
      <h2 id="career-faq">{t("常见问题", "Frequently asked questions", "常見問題")}</h2>
      {faq.map(({ question, answer }, index) => <details open={mainland || index < 3} key={question}>
        <summary>{question}<span aria-hidden /></summary><p>{answer}</p>
      </details>)}
      <TrackedEntryCtaLink href={start} data-testid="free-assessment-start-closing" eventProperties={{}} className={styles.primary}>{cta} <ArrowRight size={18} aria-hidden /></TrackedEntryCtaLink>
    </section>

    <section className={styles.science} aria-labelledby="career-science-title">
      <div className={`${styles.wrap} ${styles.section}`}>
        <h2 id="career-science-title">{t("测评科学与计分方法", "How scoring works", "測驗科學與計分方式")}</h2>
        <div className={styles.scienceGrid}>
          <article><h3>{t("有效答案怎么算", "Which answers count", "哪些答案會計分")}</h3>
            <p>{t("作答为 1–5。反向题先换算为 6 − x。不确定或未作答（null）不计入；明确选中立（3）计入。兴趣每维至少 6 个有效答案，方式与条件各维至少 3 个。", "Answers range from 1 to 5. Reverse-scored items use 6 − x. Unsure or missing answers (null) are excluded; an explicit neutral answer (3) counts. Interest dimensions require at least six valid answers; work style and conditions require three.", "作答為 1–5。反向題先換算成 6 − x。不確定或未作答（null）不計入，明確選中立（3）則計入。興趣每項至少 6 個有效答案，工作方式與條件每項至少 3 個。")}</p></article>
          <article><h3>{t("从有效答案换算到 0–100", "Rescaling valid answers to 0–100", "從有效答案換算為 0–100")}</h3>
            <p className={styles.formula}><code>P = round(25 × (S/n − 1), 4)</code></p>
            <p>{t("S 为定向有效答案之和，n 为有效答案数。某工作方式轴 n = 3、S = 13，则 25 × (13/3 − 1) ≈ 83.3333。未达到有效门槛的维度不显示得分。", "S is the sum of scored responses and n is the number of valid responses. For one work-style dimension, n = 3 and S = 13 give 25 × (13/3 − 1) ≈ 83.3333. Scores below the minimum response count are omitted.", "S 是按方向換算後的有效答案總和，n 是有效答案數。某工作方式面向 n = 3、S = 13，則 25 × (13/3 − 1) ≈ 83.3333。未達有效答案門檻就不顯示分數。")}</p></article>
          <article><h3>{t("量尺与数据来源", "Scope and sources", "量尺與資料來源")}</h3>
            <p>{t("0–100 为题本内部量尺。兴趣采用霍兰德 RIASEC 框架，O*NET 手册用于理论参考；费马评分和档案来源各自独立。分数不用于推断人群百分位、能力或录用概率。", "Scores are on this questionnaire’s own scale. The interest section uses the Holland RIASEC framework, with the O*NET manual as a reference. Scores do not measure percentiles, ability or the odds of being hired.", "0–100 是此題本的內部量尺。興趣採用霍蘭德 RIASEC 架構，O*NET 手冊作為理論參考。分數不代表人群百分位、能力或錄取機率。")}</p>
            <a href="https://www.onetcenter.org/reports/IP_Manual.html">{t("O*NET 兴趣量表手册", "O*NET Interest Profiler manual", "O*NET 興趣量表手冊")}</a></article>
        </div>
        {mainland && <aside className={styles.evidenceNote} aria-labelledby="career-evidence-title">
          <h3 id="career-evidence-title">题本结构、信度与常模</h3>
          <p><b>可核对的参数</b> 42 题职业兴趣、20 题工作方式、24 题工作条件、8 题当前处境。1,046 个档案用于查工作任务和入行条件，按岗位注明参考来源。</p>
          <p><b>信度和常模怎么读</b> 本页未公布内部一致性系数、重测信度或常模抽样数据。0–100 分按题本换算，题量和职业库规模分别描述覆盖范围，无法推算准确率。</p>
          <p><b>与短测怎么比较</b> 想快速想起几个感兴趣的活动，可以用简短问答作起点。要比较工作方式或现实条件，先看题本有没有实际测这些内容，再用课程、岗位与试做核对。</p>
        </aside>}
        <div className={styles.methodLinks}>
          <Link href={path("/method-boundaries")} prefetch={false}>{t("测评边界", "Assessment boundaries", "測驗使用範圍")}</Link>
          <Link href={path("/item-design-notes")} prefetch={false}>{t("题目设计说明", "Questionnaire design notes", "題目設計說明")}</Link>
        </div>
      </div>
    </section>
    <Career94Sticky locale={locale} href={start} label={cta} />
  </main>;
}
