import visual from "@/components/career/display/CareerProductionVisual.module.css";
import { CareerEvidenceLine } from "@/components/career/display/CareerEvidenceLine";
import type { CareerContentV3 } from "@/lib/career/contentV3";
import type { CareerPublishedValue } from "@/lib/career/publishedComponentContract";

type ScalarRow = Record<string, string>;

type AiImpactContent = {
  heading: string;
  answer: string;
  methodCards: ScalarRow[];
  taskRows: ScalarRow[];
  evidenceIntro: string;
  evidenceRows: ScalarRow[];
  differenceIntro: string;
  differenceRows: ScalarRow[];
  responsibilityIntro: string;
  responsibilitySteps: ScalarRow[];
  riskRows: ScalarRow[];
  actionRows: ScalarRow[];
  questions: ScalarRow[];
  authorityLinks: ScalarRow[];
  transition: string;
};

const AI_SOURCE_HOSTS = new Set([
  "www.bls.gov",
  "www.weforum.org",
  "www.ilo.org",
  "pcaobus.org",
  "www.cicpa.org.cn",
  "pubsonline.informs.org",
  "link.springer.com",
  "www.onetonline.org",
  "arxiv.org",
  "www.sagaftra.org",
  "nvlpubs.nist.gov",
  "scjgj.gz.gov.cn",
  "www.samr.gov.cn",
  "fermatmind.com",
]);

// Additional links are exact URLs from the validated Current package.
const AI_SOURCE_URLS = new Set([
  "https://airc.nist.gov/airmf-resources/airmf/5-sec-core/",
  "https://cpc.people.com.cn/n1/2024/0702/c64094-40268797.html",
  "https://csrc.nist.gov/pubs/sp/800/53/r5/upd1/final",
  "https://dbc.ca.gov/consumers/dental_auxiliaries_faqs.shtml",
  "https://dhbc.ca.gov/applicants/rdh_clincial.shtml",
  "https://fgs.moa.gov.cn/flfg/202104/t20210425_6366545.htm",
  "https://gdconf.com/article/gdc-2026-state-of-the-game-industry-reveals-impact-of-layoffs-generative-ai-and-more/",
  "https://gdkfq.ezhou.gov.cn/gk/xxgkml/zcfg_1828/gjzcfg/202011/t20201113_368318.html",
  "https://ghzrzyw.beijing.gov.cn/zhengwuxinxi/zcfg/gz/202607/t20260722_4778090.html",
  "https://info.narm.org/article/16-certification-and-legal-authority-to-practice",
  "https://jncc.jinan.gov.cn/cms_files/jcms1/web19/site/attach/0/9d0c7e1be25747879ba1fe1771616ebc.pdf",
  "https://kjs.mof.gov.cn/zt/kjfxcgc/kjfqw/202408/t20240814_3941788.htm",
  "https://media.defense.gov/2023/Jul/31/2003271432/-1/-1/0/DOD-LAW-OF-WAR-MANUAL-JUNE-2015-UPDATED-JULY%202023.PDF",
  "https://mzzj.sh.gov.cn/zcfg1/20220417/839faa637238493ba630b5ef21278aae.html",
  "https://nij.ojp.gov/library/publications/death-investigation-guide-scene-investigator-2024",
  "https://openstd.samr.gov.cn/bzgk/std/newGbInfo?hcno=34BC987838BEBE03B9AD6EE3D17F9AAA",
  "https://pilot.caac.gov.cn/servlet/FileUploadManagerServlet?UUID=661aaa3d-84a2-40b9-8ab7-6ecb4bfebf97&method=noDownload",
  "https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=100341",
  "https://policy.mofcom.gov.cn/claw/clawContent.shtml?id=104495",
  "https://sfj.beijing.gov.cn/sfj/zwgk/2024zcwj/744120751/fl91/744123073/index.html",
  "https://sjfg.samr.gov.cn/law/file/pdf/3238901/1763351546670.pdf",
  "https://sjj.beijing.gov.cn/zwxx/flfg/202304/t20230424_3066813.html",
  "https://srsj.cngy.gov.cn/Files/UploadFile/SiteFile/20160720104022026/2026/04/14/8a8384d8e7d34d90b1a8e191a4f585cb.pdf",
  "https://studentprivacy.ed.gov/ferpa?exp=8",
  "https://wjw.beijing.gov.cn/zwgk_20040/zcwj2022/flfg/202304/t20230407_2992842.html",
  "https://wjw.shanxi.gov.cn/zfxxgk/fdzdgknr/flfg/xzfg/202505/t20250513_9832919.shtml",
  "https://wjw.wuxi.gov.cn/doc/2023/02/13/3881836.shtml",
  "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpcd/classification.cfm?id=1087",
  "https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/denovo.cfm?ID=DEN250044",
  "https://www.af.mil/",
  "https://www.ai.mil/Portals/137/Documents/Resources%20Page/2024-12GenAI-Responsible-AI-Toolkit.pdf",
  "https://www.americanbar.org/content/aba-cms-dotorg/en/groups/paralegals/profession-information/information_for_lawyers_how_paralegals_can_improve_your_practice/",
  "https://www.americanbar.org/news/abanews/aba-news-archives/2024/07/aba-issues-first-ethics-guidance-ai-tools/",
  "https://www.apa.org/ethics/code",
  "https://www.archives.gov/isoo/policy-documents/cnsi-eo.html",
  "https://www.army.mil/",
  "https://www.beijing.gov.cn/zhengce/zhengcefagui/202204/t20220412_2674457.html",
  "https://www.beijing.gov.cn/zhengce/zhengcefagui/qtwj/202111/t20211124_2544351.html",
  "https://www.beijing.gov.cn/zhengce/zhengcefagui/qtwj/202307/t20230710_3158991.html",
  "https://www.beijing.gov.cn/zhengce/zhengcefagui/qtwj/202307/t20230719_3165890.html",
  "https://www.caac.gov.cn/big5/www.caac.gov.cn/XXGK/XXGK/MHGZ/202006/t20200608_202988.html",
  "https://www.cac.gov.cn/2021-08/20/c_1631050028355286.htm",
  "https://www.cac.gov.cn/2021-12/20/c_1641594960049078.htm",
  "https://www.cdc.gov/comec/data-systems/modernizing-data-systems.html",
  "https://www.cdc.gov/heads-up/response/index.html",
  "https://www.cdss.ca.gov/inforesources/cdss-programs/adult-protective-services/information-for-mandated-reporters",
  "https://www.consumerfinance.gov/rules-policy/regulations/1006/2/",
  "https://www.court.gov.cn/zixun/xiangqing/233181.html",
  "https://www.cpsc.gov/business--manufacturing/business-education/business-guidance/BestPractices",
  "https://www.ecfr.gov/current/title-14/section-91.3",
  "https://www.goarmy.com/how-to-join/requirements",
  "https://www.gov.cn/zhengce/content/202309/content_6901383.htm",
  "https://www.gov.cn/zhengce/content/202601/content_7054168.htm",
  "https://www.govinfo.gov/content/pkg/GOVPUB-ED-PURL-gpo229415/pdf/GOVPUB-ED-PURL-gpo229415.pdf",
  "https://www.guangde.gov.cn/OpennessContent/show/2373481.html",
  "https://www.hbs.edu/ris/Publication%20Files/dell-acqua-et-al-2026-navigating-the-jagged-technological-frontier_5c589c8c-fbb5-458f-b285-c944746cd717.pdf",
  "https://www.imo.org/en/mediacentre/pressbriefings/pages/imo-adopts-mass-code.aspx",
  "https://www.iso.org/standard/75106.html",
  "https://www.leg.state.fl.us/statutes/index.cfm?App_mode=Display_Statute&URL=0400-0499/0458/Sections/0458.3475.html",
  "https://www.marines.mil/",
  "https://www.mee.gov.cn/xxgk2018/xxgk/xxgk03/202401/W020240105345156323747.pdf",
  "https://www.mee.gov.cn/ywgz/fgbz/fl/202603/t20260313_1146496.shtml",
  "https://www.mem.gov.cn/fw/flfgbz/fg/202107/t20210716_416558.shtml",
  "https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/gz11/202312/t20231208_471426.shtml",
  "https://www.mem.gov.cn/gk/zfxxgkpt/fdzdgknr/gz11/202512/t20251219_589223.shtml",
  "https://www.moe.gov.cn/jyb_sjzl/sjzl_zcfg/zcfg_jyfl/202204/t20220421_620257.html",
  "https://www.moe.gov.cn/jyb_sjzl/sjzl_zcfg/zcfg_jyfl/tnull_1314.html",
  "https://www.mohurd.gov.cn/gongkai/zhengce/gzk/art/2022/art_17337_763864.html",
  "https://www.most.gov.cn/xxgk/xinxifenlei/fdzdgknr/fgzc/gfxwj/gfxwj2023/202310/t20231008_188309.html",
  "https://www.mynextmove.org/vets/profile/wages/45-2021.00?p=hourly&s=KY",
  "https://www.navy.mil/",
  "https://www.ncac.gov.cn/xxfb/flfg/flfg_532/202103/t20210309_50530.html",
  "https://www.nhc.gov.cn/fzs/c100048/201312/8a6d5b30fe9f444c8914e93a3f3496c9.shtml",
  "https://www.nhc.gov.cn/fzs/c100048/201808/6878dddd2a3d48c59de1c43a6c68423d.shtml",
  "https://www.nhc.gov.cn/wjw/s9496/201701/491ec38efc884531801549cfb90d865d.shtml",
  "https://www.nhtsa.gov/risky-driving/distracted-driving",
  "https://www.nhtsa.gov/vehicle-safety/driver-assistance-technologies",
  "https://www.nist.gov/itl/ai-risk-management-framework",
  "https://www.nist.gov/publications/artificial-intelligence-risk-management-framework-generative-artificial-intelligence",
  "https://www.osha.gov/control-hazardous-energy",
  "https://www.osha.gov/etools/construction/trenching/",
  "https://www.osha.gov/hair-salons",
  "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.147",
  "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.269",
  "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.333",
  "https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.422",
  "https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1417",
  "https://www.osha.gov/machine-guarding",
  "https://www.osha.gov/sites/default/files/publications/osha3150.pdf",
  "https://www.parktool.com/en-us/blog/repair-help/wheel-and-rim-truing",
  "https://www.sac.gov.cn/xxgk/flfg/art/2026/art_2b60cf5549a24e98bef65061636c949b.html",
  "https://www.sara.gov.cn/static/content/xxgk/gfxwj/2025-09-16/1417173278783471616.html",
  "https://www.shanghai.gov.cn/nw18519/20231020/d7820aacb11c40159d856398188c4249.html",
  "https://www.spaceforce.mil/",
  "https://www.stats.gov.cn/sj/zxfb/202605/t20260515_1963707.html",
  "https://www.stats.gov.cn/zwfwck/sjfb/202605/t20260515_1963707.html",
  "https://www.unesco.org/en/articles/ai-competency-framework-teachers",
  "https://www.who.int/news/item/18-01-2024-who-releases-ai-ethics-and-governance-guidance-for-large-multi-modal-models",
  "https://www.who.int/news/item/28-06-2021-who-issues-first-global-report-on-ai-in-health-and-six-guiding-principles-for-its-design-and-use",
  "https://www.who.int/publications/i/item/9789240029200",
  "https://xmsyj.moa.gov.cn/gzdt/202209/t20220909_6408942.htm",
  "https://xxgk.mot.gov.cn/2020/jigou/fgs/202312/t20231204_3961931.html",
  "https://xxgk.mot.gov.cn/jigou/fgs/202312/t20231204_3961931.html",
  "https://xxgk.mot.gov.cn/jigou/fgs/202601/t20260120_4198163.html",
  "https://xzfg.moj.gov.cn/front/law/detail?LawID=1736",
  "https://xzfg.moj.gov.cn/front/law/detail?LawID=342",
  "https://xzfy.moj.gov.cn/c/2021-01-17/488814.shtml",
  "https://ypjg.ln.gov.cn/ypjg/ztzl/ypyfcxxxfw/zcfgzq/flfg/2026071921180223928/index.shtml"
]);

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value : null;
}

function rows(value: unknown, keys: string[], minimum: number, optionalKeys: string[] = []): ScalarRow[] | null {
  if (!Array.isArray(value) || value.length < minimum) return null;
  const parsed = value.map((item) => {
    if (!isRecord(item) || Object.keys(item).some((key) => !keys.includes(key) && !optionalKeys.includes(key)) || keys.some((key) => !(key in item))) return null;
    const row = Object.fromEntries(keys.map((key) => [key, key === "链接" && item[key] === null ? "" : text(item[key])])) as Record<string, string | null>;
    if (keys.some(key => key !== "链接" && !row[key]) || (keys.includes("链接") && item["链接"] !== null && !row["链接"])) return null;
    for (const key of optionalKeys) {
      const optionalValue = text(item[key]);
      if (optionalValue) row[key] = optionalValue;
    }
    return row as ScalarRow;
  });
  return parsed.some((row) => row === null) ? null : parsed as ScalarRow[];
}

function safeSourceUrl(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password && (AI_SOURCE_HOSTS.has(url.hostname) || AI_SOURCE_URLS.has(url.href)) ? url.toString() : null;
  } catch {
    return null;
  }
}

// Published link cells also permit editorial notes. Notes remain escaped text;
// URL-shaped values must still satisfy the existing exact URL/host policy.
function parseAiImpact(value: CareerPublishedValue): AiImpactContent | null {
  if (!isRecord(value)) return null;

  const heading = text(value.heading);
  const answer = text(value.answer);
  const evidenceIntro = text(value.evidence_intro);
  const differenceIntro = text(value.difference_intro);
  const responsibilityIntro = text(value.responsibility_intro);
  const transition = text(value.transition);
  const methodCards = rows(value.method_cards, ["概念", "含义"], 3);
  const taskRows = rows(value.task_rows, ["工作方向", "任务", "当前变化", "人的控制点"], 4);
  const evidenceRows = rows(value.evidence_rows, ["来源", "研究对象", "结论", "使用限制", "链接"], 3, ["fact_ref", "source_ref"]);
  const differenceRows = rows(value.difference_rows, ["方向", "AI主要改变", "仍由人负责"], 2);
  const responsibilitySteps = rows(value.responsibility_steps, ["步骤", "说明"], 4);
  const riskRows = rows(value.risk_rows, ["风险", "为什么重要", "控制方式"], 3);
  const actionRows = rows(value.action_rows, ["人群", "应对重点"], 3);
  const questions = rows(value.questions, ["问题", "回答", "来源", "链接"], 3, ["fact_ref", "source_ref"]);
  const authorityLinks = rows(value.authority_links, ["来源", "类型", "适用范围", "链接"], 3);

  if (!heading || !answer || !evidenceIntro || !differenceIntro || !responsibilityIntro ||
    !transition || !methodCards || !taskRows || !evidenceRows || !differenceRows ||
    !responsibilitySteps || !riskRows || !actionRows || !questions || !authorityLinks ||
    [...evidenceRows, ...questions, ...authorityLinks].some((row) => row["链接"] !== "" && safeSourceUrl(row["链接"]) === null &&
      /(?:[a-z][a-z0-9+.-]*\s*:|\/\/|www\.)/iu.test(row["链接"]))) {
    return null;
  }

  return {
    heading,
    answer,
    methodCards,
    taskRows,
    evidenceIntro,
    evidenceRows,
    differenceIntro,
    differenceRows,
    responsibilityIntro,
    responsibilitySteps,
    riskRows,
    actionRows,
    questions,
    authorityLinks,
    transition,
  };
}

export function supportsCareerDossierAiImpact(value: CareerPublishedValue): boolean {
  return parseAiImpact(value) !== null;
}

function SourceLink({ href, children, field }: { href: string; children: string; field: string }) {
  if (!safeSourceUrl(href)) return <span data-career-api-field={field}>{href || children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" data-career-api-field={field}>
      {children}
    </a>
  );
}

export function CareerDossierAiImpact({ value, locale, contentV3 = null, interfaceLabels }: { value: CareerPublishedValue; locale: "zh" | "en"; contentV3?: CareerContentV3 | null; interfaceLabels?: Record<string, string> }) {
  const content = parseAiImpact(value);
  if (!content) return null;

  return (
    <section
      className={visual.accountantsAiImpact}
      data-testid="career-dossier-ai-impact"
      data-career-api-component="ai_impact_table"
    >
      <header className={visual.aiImpactHeader}>
        <div className={visual.aiImpactEyebrowRow}>
          <p className={visual.aiImpactEyebrow}>{interfaceLabels?.["interface.ai_impact.heading"] ?? (locale === "zh" ? "AI 对职业的影响" : "AI impact on this career")}</p>
          <span aria-hidden="true" />
        </div>
        <h2 data-career-api-field="ai_impact_table.heading">{content.heading}</h2>
        <p className={visual.aiImpactAnswer} data-career-api-field="ai_impact_table.answer">{content.answer}</p>
      </header>

      <section className={visual.aiImpactSection} aria-label={interfaceLabels?.["interface.ai_impact.method_cards_label"] ?? (locale === "zh" ? "AI 影响判断层次" : "AI impact assessment layers")}>
        <div className={visual.aiImpactMethodGrid} data-career-api-list="ai_impact_table.method_cards">
          {content.methodCards.map((card, index) => (
            <article key={card["概念"]}>
              <h3 data-career-api-field={`ai_impact_table.method_cards[${index}].概念`}>{card["概念"]}</h3>
              <p data-career-api-field={`ai_impact_table.method_cards[${index}].含义`}>{card["含义"]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-task-title">
        <div className={visual.aiImpactSectionTitle}>
          <h3 id="ai-impact-task-title">{interfaceLabels?.["interface.ai_impact.tasks.heading"] ?? (locale === "zh" ? "任务影响矩阵" : "Task impact matrix")}</h3>
        </div>
        <div className={visual.aiImpactTableWrap}>
          <table className={visual.aiImpactTable} data-career-api-table="ai_impact_table.task_rows">
            <caption className="sr-only">{interfaceLabels?.["interface.ai_impact.tasks.caption"] ?? (locale === "zh" ? "职业任务受到人工智能影响的比较" : "Comparison of AI impact across career tasks")}</caption>
            <thead><tr><th scope="col">{interfaceLabels?.["interface.ai_impact.tasks.direction_header"] ?? (locale === "zh" ? "工作方向" : "Work area")}</th><th scope="col">{interfaceLabels?.["interface.ai_impact.tasks.task_header"] ?? (locale === "zh" ? "任务" : "Task")}</th><th scope="col">{interfaceLabels?.["interface.ai_impact.tasks.change_header"] ?? (locale === "zh" ? "当前变化" : "Current change")}</th><th scope="col">{interfaceLabels?.["interface.ai_impact.tasks.human_control_header"] ?? (locale === "zh" ? "人的控制点" : "Human control point")}</th></tr></thead>
            <tbody>
              {content.taskRows.map((row, index) => (
                <tr key={`${row["工作方向"]}:${row["任务"]}`}>
                  <th scope="row" data-label={interfaceLabels?.["interface.ai_impact.tasks.direction_header"] ?? "工作方向"} data-career-api-field={`ai_impact_table.task_rows[${index}].工作方向`}>{row["工作方向"]}</th>
                  <td data-label={interfaceLabels?.["interface.ai_impact.tasks.task_header"] ?? "任务"} data-career-api-field={`ai_impact_table.task_rows[${index}].任务`}>{row["任务"]}</td>
                  <td data-label={interfaceLabels?.["interface.ai_impact.tasks.change_header"] ?? "当前变化"} data-career-api-field={`ai_impact_table.task_rows[${index}].当前变化`}>{row["当前变化"]}</td>
                  <td data-label={interfaceLabels?.["interface.ai_impact.tasks.human_control_header"] ?? "人的控制点"} data-career-api-field={`ai_impact_table.task_rows[${index}].人的控制点`}>{row["人的控制点"]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-evidence-title">
        <div className={visual.aiImpactSectionTitle}>
          <h3 id="ai-impact-evidence-title">{interfaceLabels?.["interface.ai_impact.evidence.heading"] ?? (locale === "zh" ? "为什么就业证据会得出不同结论？" : "Why does employment evidence reach different conclusions?")}</h3>
          <p data-career-api-field="ai_impact_table.evidence_intro">{content.evidenceIntro}</p>
        </div>
        <div className={visual.aiImpactEvidenceGrid} data-career-api-list="ai_impact_table.evidence_rows">
          {content.evidenceRows.map((row, index) => (
            <article key={row["来源"]}>
              <div className={visual.aiImpactEvidenceHeading}>
                <h4 data-career-api-field={`ai_impact_table.evidence_rows[${index}].来源`}>{row["来源"]}</h4>
                <SourceLink href={row["链接"]} field={`ai_impact_table.evidence_rows[${index}].链接`}>{interfaceLabels?.["interface.ai_impact.evidence.source_link_label"] ?? (locale === "zh" ? "查看来源 ↗" : "View source ↗")}</SourceLink>
              </div>
              <dl>
                <div><dt>{interfaceLabels?.["interface.ai_impact.evidence.study_scope_label"] ?? (locale === "zh" ? "研究对象" : "Subject")}</dt><dd data-career-api-field={`ai_impact_table.evidence_rows[${index}].研究对象`}>{row["研究对象"]}</dd></div>
                <div><dt>{interfaceLabels?.["interface.ai_impact.evidence.conclusion_label"] ?? (locale === "zh" ? "主要结论" : "Finding")}</dt><dd data-career-api-field={`ai_impact_table.evidence_rows[${index}].结论`}>{row["结论"]}</dd></div>
                <div><dt>{interfaceLabels?.["interface.ai_impact.evidence.limitation_label"] ?? (locale === "zh" ? "使用限制" : "Limitation")}</dt><dd data-career-api-field={`ai_impact_table.evidence_rows[${index}].使用限制`}>{row["使用限制"]}</dd></div>
              </dl>
              <CareerEvidenceLine content={contentV3} factRefs={row.fact_ref ? [row.fact_ref] : []} sourceRefs={row.source_ref ? [row.source_ref] : []} />
            </article>
          ))}
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-difference-title">
        <div className={visual.aiImpactSectionTitle}>
          <h3 id="ai-impact-difference-title">{interfaceLabels?.["interface.ai_impact.differences.heading"] ?? (locale === "zh" ? "不同工作方向受到的影响为什么不同？" : "Why does impact differ by work direction?")}</h3>
          <p data-career-api-field="ai_impact_table.difference_intro">{content.differenceIntro}</p>
        </div>
        <div className={visual.aiImpactDirectionGrid} data-career-api-list="ai_impact_table.difference_rows">
          {content.differenceRows.map((row, index) => (
            <article key={row["方向"]}>
              <h4 data-career-api-field={`ai_impact_table.difference_rows[${index}].方向`}>{row["方向"]}</h4>
              <p><strong>{interfaceLabels?.["interface.ai_impact.differences.change_label"] ?? (locale === "zh" ? "AI 主要改变" : "AI primarily changes")}</strong><span data-career-api-field={`ai_impact_table.difference_rows[${index}].AI主要改变`}>{row["AI主要改变"]}</span></p>
              <p><strong>{interfaceLabels?.["interface.ai_impact.differences.human_responsibility_label"] ?? (locale === "zh" ? "仍由人负责" : "Human responsibility remains")}</strong><span data-career-api-field={`ai_impact_table.difference_rows[${index}].仍由人负责`}>{row["仍由人负责"]}</span></p>
            </article>
          ))}
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-responsibility-title">
        <div className={visual.aiImpactSectionTitle}>
          <h3 id="ai-impact-responsibility-title">{interfaceLabels?.["interface.ai_impact.responsibility.heading"] ?? (locale === "zh" ? "AI 进入专业流程后，责任链不能断" : "Accountability must remain intact when AI enters professional workflows")}</h3>
          <p data-career-api-field="ai_impact_table.responsibility_intro">{content.responsibilityIntro}</p>
        </div>
        <ol className={visual.aiImpactResponsibility} data-career-api-list="ai_impact_table.responsibility_steps">
          {content.responsibilitySteps.map((step, index) => (
            <li key={step["步骤"]}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <strong data-career-api-field={`ai_impact_table.responsibility_steps[${index}].步骤`}>{step["步骤"]}</strong>
              <p data-career-api-field={`ai_impact_table.responsibility_steps[${index}].说明`}>{step["说明"]}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-risk-title">
        <h3 id="ai-impact-risk-title">{interfaceLabels?.["interface.ai_impact.risks.heading"] ?? (locale === "zh" ? "使用 AI 的专业风险" : "Professional risks of using AI")}</h3>
        <div className={visual.aiImpactRiskGrid} data-career-api-list="ai_impact_table.risk_rows">
          {content.riskRows.map((row, index) => (
            <article key={row["风险"]}>
              <h4 data-career-api-field={`ai_impact_table.risk_rows[${index}].风险`}>{row["风险"]}</h4>
              <p data-career-api-field={`ai_impact_table.risk_rows[${index}].为什么重要`}>{row["为什么重要"]}</p>
              <p><strong>{interfaceLabels?.["interface.ai_impact.risks.control_label"] ?? (locale === "zh" ? "控制方式：" : "Control: ")}</strong><span data-career-api-field={`ai_impact_table.risk_rows[${index}].控制方式`}>{row["控制方式"]}</span></p>
            </article>
          ))}
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-action-title">
        <h3 id="ai-impact-action-title">{interfaceLabels?.["interface.ai_impact.actions.heading"] ?? (locale === "zh" ? "不同人群应该如何应对？" : "How should different audiences respond?")}</h3>
        <div className={visual.aiImpactActionList} data-career-api-list="ai_impact_table.action_rows">
          {content.actionRows.map((row, index) => (
            <article key={row["人群"]}>
              <h4 data-career-api-field={`ai_impact_table.action_rows[${index}].人群`}>{row["人群"]}</h4>
              <p data-career-api-field={`ai_impact_table.action_rows[${index}].应对重点`}>{row["应对重点"]}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={visual.aiImpactSection} aria-labelledby="ai-impact-questions-title">
        <h3 id="ai-impact-questions-title">{interfaceLabels?.["interface.ai_impact.questions.heading"] ?? (locale === "zh" ? "关于 AI 与职业发展的常见问题" : "Common questions about AI and career development")}</h3>
        <div className={visual.aiImpactQuestions} data-career-api-list="ai_impact_table.questions">
          {content.questions.map((item, index) => (
            <article key={item["问题"]}>
              <h4 data-career-api-field={`ai_impact_table.questions[${index}].问题`}>{item["问题"]}</h4>
              <p data-career-api-field={`ai_impact_table.questions[${index}].回答`}>{item["回答"]}</p>
              <p className={visual.aiImpactQuestionSource}>
                {interfaceLabels?.["interface.ai_impact.questions.source_label"] ?? (locale === "zh" ? "来源：" : "Source: ")}<span data-career-api-field={`ai_impact_table.questions[${index}].来源`}>{item["来源"]}</span>
                <span aria-hidden="true"> · </span>
                <SourceLink href={item["链接"]} field={`ai_impact_table.questions[${index}].链接`}>{interfaceLabels?.["interface.ai_impact.questions.source_link_label"] ?? (locale === "zh" ? "原始资料 ↗" : "Original source ↗")}</SourceLink>
              </p>
              <CareerEvidenceLine content={contentV3} factRefs={item.fact_ref ? [item.fact_ref] : []} sourceRefs={item.source_ref ? [item.source_ref] : []} />
            </article>
          ))}
        </div>
      </section>

      <aside className={visual.aiImpactSources} aria-labelledby="ai-impact-sources-title">
        <h3 id="ai-impact-sources-title">{interfaceLabels?.["interface.ai_impact.sources.heading"] ?? (locale === "zh" ? "权威来源与使用边界" : "Authoritative sources and usage boundaries")}</h3>
        <ul data-career-api-list="ai_impact_table.authority_links">
          {content.authorityLinks.map((source, index) => (
            <li key={source["链接"]}>
              <SourceLink href={source["链接"]} field={`ai_impact_table.authority_links[${index}].链接`}>{source["来源"]}</SourceLink>
              <span data-career-api-field={`ai_impact_table.authority_links[${index}].类型`}>{source["类型"]}</span>
              <span data-career-api-field={`ai_impact_table.authority_links[${index}].适用范围`}>{source["适用范围"]}</span>
            </li>
          ))}
        </ul>
      </aside>

      <p className={visual.aiImpactTransition} data-career-api-field="ai_impact_table.transition">{content.transition}</p>
    </section>
  );
}
