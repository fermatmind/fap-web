import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CareerDisplaySurface } from "@/components/career/display/CareerDisplaySurface";
import {
  CAREER_FIELD_CONSUMPTION_LEDGER,
  CAREER_VISUAL_GROUPS,
  CAREER_VISUAL_GROUP_IDS,
} from "@/lib/career/careerVisualGroups";
import {
  CAREER_DISPLAY_COMPONENT_ORDER,
  adaptCareerDisplaySurface,
} from "@/lib/career/displaySurface";
import {
  CAREER_PRESENTATION_V1_VERSION,
  CAREER_V12_DESIGN_AUTHORITY_SHA256,
  normalizeCareerPresentationV1,
} from "@/lib/career/presentationV1";
import {
  buildCareerPresentationV1Fixture,
  buildSelectedCareerDisplaySurfaceFixture,
} from "@/tests/contracts/careerDisplaySurface.fixture";

const AUTHORITY_HTML = "/Users/rainie/Desktop/1046个职业/accountants-5个html模板/accountants-career-page-v1.2.html";

function buildZhSurface() {
  return adaptCareerDisplaySurface(
    buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleEn: "Accountants and Auditors",
      titleZh: "会计与审计人员",
    }),
    "zh"
  );
}

describe("career v1.2 presentation contract", () => {
  it("locks the v1.2 design authority SHA without copying the authority HTML into the repository", () => {
    expect(CAREER_V12_DESIGN_AUTHORITY_SHA256).toBe(
      "85c71abac0180a6807222b297e66b0dd611ca79a5cc4bd17db5da416459eafe7"
    );
    if (existsSync(AUTHORITY_HTML)) {
      const actual = createHash("sha256").update(readFileSync(AUTHORITY_HTML)).digest("hex");
      expect(actual).toBe(CAREER_V12_DESIGN_AUTHORITY_SHA256);
    }
  });

  it("normalizes only the versioned, SHA-bound presentation contract", () => {
    const normalized = normalizeCareerPresentationV1(buildCareerPresentationV1Fixture());

    expect(normalized?.contractVersion).toBe(CAREER_PRESENTATION_V1_VERSION);
    expect(normalized?.hero.stats).toHaveLength(5);
    expect(normalized?.hero.aiExposure?.value).toBe(7);
    expect(normalizeCareerPresentationV1({
      ...buildCareerPresentationV1Fixture(),
      design_authority: {
        id: "accountants-career-page-v1.2",
        sha256: "0".repeat(64),
      },
    })).toBeNull();
  });

  it.each([
    ["wrong metric kind", { metric_kind: "ai_survival" }],
    ["unpublished", { availability: "draft" }],
    ["below range", { value: -1 }],
    ["above range", { value: 11 }],
    ["missing label", { label: "" }],
    ["missing source", { source_label: "" }],
    ["missing note", { note: "" }],
  ])("hides only an invalid AI gauge slot: %s", (_label, patch) => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleZh: "会计与审计人员",
    }) as unknown as Record<string, unknown>;
    const presentation = fixture.presentation_v1 as ReturnType<typeof buildCareerPresentationV1Fixture>;
    presentation.hero.ai_exposure = { ...presentation.hero.ai_exposure, ...patch } as typeof presentation.hero.ai_exposure;

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.queryByTestId("career-production-ai-gauge")).not.toBeInTheDocument();
    expect(screen.getByTestId("career-production-hero-stats")).toBeInTheDocument();
    expect(screen.getByTestId("career-display-surface")).toHaveTextContent("会计与审计人员");
  });

  it("does not infer presentation slots from legacy score or narrative fields", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "actuaries",
      locale: "zh",
      titleZh: "精算师",
    }) as unknown as Record<string, unknown>;
    delete fixture.presentation_v1;
    const page = (fixture.page as { content: Record<string, unknown> }).content;
    const salary = (page.career_snapshot_primary_locale as { salary: Record<string, unknown> }).salary;
    salary.china_ai_row = "8/10，正文叙述，不是视觉投影";
    (page.ai_impact_table as Record<string, unknown>).ai_s4_p = "AI 曝光评分为 8/10";

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.queryByTestId("career-production-ai-gauge")).not.toBeInTheDocument();
    expect(screen.queryByTestId("career-production-hero-stats")).not.toBeInTheDocument();
    expect(screen.getByTestId("career-display-hero")).not.toHaveTextContent("8/10");
  });

  it("keeps a valid Chinese page available when presentation_v1 is absent and hides only visual slots", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleZh: "会计与审计人员",
    }) as unknown as Record<string, unknown>;
    delete fixture.presentation_v1;

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.getByTestId("career-display-surface")).toHaveTextContent("会计与审计人员");
    expect(screen.queryByTestId("career-production-hero-badges")).not.toBeInTheDocument();
    expect(screen.queryByTestId("career-production-hero-stats")).not.toBeInTheDocument();
    expect(screen.queryByTestId("career-production-ai-gauge")).not.toBeInTheDocument();
    expect(document.querySelectorAll("[data-career-visual-group]")).toHaveLength(11);
    expect(document.querySelector('[data-career-visual-group="snapshot"]')).not.toBeInTheDocument();
  });

  it("compacts every formally optional projection slot without placeholders or empty cards", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleZh: "会计与审计人员",
    }) as unknown as Record<string, unknown>;
    const presentation = fixture.presentation_v1 as Record<string, unknown>;
    const hero = presentation.hero as Record<string, unknown>;
    hero.onet_code = null;
    const badges = hero.badges as Array<Record<string, unknown>>;
    badges[1] = { key: "scene", text: null, availability: "missing" };
    hero.ai_exposure = {
      ...(hero.ai_exposure as Record<string, unknown>),
      value: null,
      display_value: null,
      note: null,
      availability: "missing",
    };
    hero.stats = (hero.stats as Array<Record<string, unknown>>).filter((stat) => stat.key !== "employment");
    hero.cta = { label: null, href: null, availability: "missing" };

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    const heroElement = screen.getByTestId("career-display-hero");
    expect(screen.queryByTestId("career-production-ai-gauge")).not.toBeInTheDocument();
    expect(screen.getByTestId("career-production-hero-badges").children).toHaveLength(2);
    expect(screen.getByTestId("career-production-hero-stats").children).toHaveLength(4);
    expect(heroElement).not.toHaveTextContent(/O\*NET|0\/10|undefined|暂无数据|数据缺失/u);
    expect(document.querySelector('[data-career-api-field="presentation_v1.hero.onet_code"]')).not.toBeInTheDocument();
    expect(document.querySelectorAll('[data-career-api-component="primary_cta"]')).toHaveLength(0);
    expect(document.querySelectorAll("[data-career-component-id]")).toHaveLength(26);
    expect(document.querySelectorAll("section:empty, article:empty, aside:empty")).toHaveLength(0);
  });

  it("does not render salary or AI sidecar slots on the Chinese production path", () => {
    render(
      <CareerDisplaySurface
        surface={buildZhSurface()}
        salarySlot={<div data-testid="forbidden-salary-sidecar" />}
        aiImpactSlot={<div data-testid="forbidden-ai-sidecar" />}
      />
    );

    expect(screen.queryByTestId("forbidden-salary-sidecar")).not.toBeInTheDocument();
    expect(screen.queryByTestId("forbidden-ai-sidecar")).not.toBeInTheDocument();
  });

  it("renders ordered visual groups while preserving the declared API component set", () => {
    const surface = buildZhSurface();
    render(<CareerDisplaySurface surface={surface} />);

    const groups = [...document.querySelectorAll("[data-career-visual-group]")];
    const expectedVisualGroupIds = CAREER_VISUAL_GROUP_IDS.filter((groupId) => groupId !== "snapshot");
    expect(groups.map((group) => group.getAttribute("data-career-visual-group"))).toEqual(expectedVisualGroupIds);
    const expectedRenderedOrder = CAREER_VISUAL_GROUPS
      .filter((group) => group.id !== "snapshot")
      .flatMap((group) => group.componentIds)
      .filter((componentId) => surface?.componentOrder.includes(componentId));
    expect([...document.querySelectorAll("[data-career-component-id]")].map((element) =>
      element.getAttribute("data-career-component-id")
    )).toEqual(expectedRenderedOrder);
    expect(document.querySelectorAll("[data-career-api-component]")).toHaveLength((surface?.componentOrder.length ?? 1) - 1);
    expect(screen.getByRole("complementary", { name: "页面目录" }).querySelectorAll("nav a")).toHaveLength(11);
  });

  it("replaces the accountants snapshot with a work-style fit triage while retaining salary data", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleZh: "会计与审计人员",
    });
    const page = fixture.page.content as unknown as Record<string, Record<string, unknown>>;
    page.fermat_decision_card = {
      title: "会计与审计适合什么样的人？",
      summary: "先判断你是否接受持续核对、证据留痕、集中截止日期，以及对专业判断承担责任。",
      caveat: "这是适配初筛，不是职业结论。",
    };
    page.fit_decision_checklist = {
      suit: "愿意追查差异并留下证据。",
      boundary: "强烈厌恶细节复核和书面留痕时需要慎重。",
      how: "先核对 20 笔模拟交易并写一段证据说明。",
    };
    delete page.career_snapshot_primary_locale.callout;
    delete page.career_snapshot_primary_locale.scene;

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    expect(screen.queryByRole("heading", { name: "职业快照" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "会计与审计适合什么样的人？" })).toBeInTheDocument();
    const decisionCard = screen.getByTestId("career-published-fermat_decision_card");
    expect(decisionCard).toHaveTextContent("持续核对、证据留痕、集中截止日期");
    expect(decisionCard).not.toHaveTextContent("费马快速判断");
    expect(decisionCard).not.toHaveTextContent("这是适配初筛，不是职业结论");
    expect(screen.getByTestId("fit-decision-checklist")).toHaveTextContent("更可能适合");
    expect(screen.getByTestId("fit-decision-checklist")).toHaveTextContent("需要慎重");
    expect(screen.getByTestId("fit-decision-checklist")).toHaveTextContent("先做一次小实验");
    expect(screen.getByTestId("career-published-primary-locale-china")).toHaveTextContent("中国大陆薪资参考");
  });

  it("renders the structured Chinese accountants profile as one evidence-led desktop narrative", () => {
    const fixture = buildSelectedCareerDisplaySurfaceFixture({
      slug: "accountants-and-auditors",
      locale: "zh",
      titleZh: "会计与审计人员",
    });
    const page = fixture.page.content as unknown as Record<string, unknown>;
    page.definition_block = "会计师和审计师围绕交易、账簿、财务报表和审计证据开展工作，记录、分析和解释财务信息，并判断其是否准确、完整、合规且可核验。";
    page.career_quick_answers_block = {
      availability: "published",
      schema_version: "career.quick_answers.v1",
      heading: "职业画像结构化说明",
      items: [
        {
          key: "qa3",
          question: "两套相连但独立的工作系统",
          answer: "会计生产财务信息，审计独立评价财务信息。",
          table: { rows: [
            { label: "会计信息生产线", value: "经济事项 → 确认与计量 → 记录与分类 → 结账与调节 → 报表与披露 → 分析与解释", alternate_value: null, secondary_value: "账簿、财务报表、附注与管理报告" },
            { label: "审计鉴证线", value: "业务范围与独立性 → 重要性与风险 → 审计程序 → 获取和评价证据 → 形成意见 → 沟通发现", alternate_value: null, secondary_value: "审计底稿、审计发现、管理建议和审计报告" },
            { label: "共同专业底座", value: "准则 · 内部控制 · 信息系统 · 职业判断 · 证据留痕 · 职业道德", alternate_value: null, secondary_value: null },
          ] },
        },
        {
          key: "qa2",
          question: "会计和审计有什么区别？职责、产出与保证边界",
          answer: "会计依据适用的财务报告编制基础，将交易和事项转化为会计记录、财务报表及披露；财务报表审计由独立注册会计师识别和评估重大错报风险、获取充分、适当的审计证据，并对财务报表是否在所有重大方面按照适用基础编制发表意见。审计不代替管理层编制财务报表和维护必要内部控制的责任，也只能提供合理保证，而不是绝对保证。",
          table: { rows: [
            { label: "核心目的", value: "提供反映企业财务状况、经营成果和现金流量的信息，反映管理层受托责任履行情况，并支持使用者作出经济决策。", alternate_value: null, secondary_value: "提高财务报表预期使用者对财务报表的信赖程度。" },
            { label: "主要对象与依据", value: "交易和事项、合同与凭证、业务数据、会计政策和会计估计，以及适用的财务报告编制基础。", alternate_value: null, secondary_value: "财务报表及披露、相关认定、重大错报风险、相关内部控制和获取的审计证据。" },
            { label: "核心过程", value: "确认、计量、记录、对账、结账、列报、披露、分析和解释。", alternate_value: null, secondary_value: "了解被审计单位，识别和评估重大错报风险，设计并实施审计程序，评价证据、形成意见并沟通。" },
            { label: "主要产出", value: "会计记录、账簿、财务报表及附注、管理报表和财务分析。", alternate_value: null, secondary_value: "审计工作底稿、审计发现、与管理层及治理层的沟通，以及审计报告和审计意见。" },
            { label: "责任主体", value: "管理层对按照适用基础编制财务报表、作出合理会计估计和维护必要内部控制承担责任；会计人员履行具体核算、报告和专业判断职责。", alternate_value: null, secondary_value: "注册会计师对按照审计准则独立实施审计、获取合理保证并发表审计意见承担责任。" },
            { label: "独立性要求", value: "通常属于组织的信息生产和管理职能，不构成独立鉴证。", alternate_value: null, secondary_value: "应遵守独立性及相关职业道德要求，并在全过程保持职业怀疑、运用职业判断。" },
            { label: "保证边界", value: "会计编制过程本身不提供独立审计保证。", alternate_value: null, secondary_value: "提供高水平的合理保证，而非绝对保证；重点关注对财务报表整体具有重大影响的错报。" },
          ] },
        },
        {
          key: "qa1",
          question: "关键职业判断",
          answer: "职业判断必须建立在适用准则、事实和证据之上。",
          table: { rows: [
            { label: "01", value: "交易或事项是否满足确认条件，应何时确认并采用何种计量基础？", alternate_value: null, secondary_value: "判断依据包括交易实质、合同条款、权利义务及适用准则；结论会影响会计要素、确认时点、计量基础和列报分类。" },
            { label: "02", value: "重大会计估计所使用的数据、假设和模型是否合理？", alternate_value: null, secondary_value: "重点评价数据是否完整相关、关键假设是否可支持、模型是否适当，以及估计不确定性和管理层偏向是否得到充分考虑。" },
            { label: "03", value: "识别出的错报单独或汇总后是否重大，应如何处置？", alternate_value: null, secondary_value: "需要结合错报金额、性质和发生背景评价单项及汇总影响，并决定调整、披露或审计报告层面的处理。" },
            { label: "04", value: "重大错报风险评估是否需要修正，进一步审计程序是否充分应对？", alternate_value: null, secondary_value: "风险评估应随新证据动态更新；若原程序未覆盖相关认定风险，应调整程序的性质、时间安排和范围。" },
            { label: "05", value: "获取的审计证据是否充分、适当，是否需要追加程序？", alternate_value: null, secondary_value: "充分性关注证据数量，适当性关注相关性和可靠性；证据不足、相互矛盾或来源存疑时，应追加或替代程序。" },
            { label: "06", value: "已获取的证据支持何种审计意见，哪些事项需要沟通？", alternate_value: null, secondary_value: "综合未更正错报、审计范围限制和重大不确定性判断意见类型，并确定需要向管理层、治理层或报表使用者沟通的事项。" },
          ] },
        },
      ],
    };
    page.responsibilities_block = [
      "会计｜会计确认与计量｜识别交易和事项，依据适用准则判断确认条件、确认时点、会计要素、计量基础与列报分类。",
      "会计｜账务处理、对账与期末结账｜记录和汇总交易，执行账户及系统对账、差异调节、调整分录和期末结账。",
      "会计｜财务报表编制与列报披露｜编制财务报表及附注，复核会计政策、列报分类和重大披露。",
      "共有｜财务分析、复核与管理沟通｜分析财务状况、经营成果、现金流和异常变动，解释驱动因素、风险及决策影响。",
      "审计｜重大错报风险识别、评估与审计应对｜了解被审计单位及内部控制，识别、评估重大错报风险，并据此设计审计程序。",
      "审计｜审计证据评价、意见形成与沟通｜评价证据、错报和控制缺陷，形成审计意见，并与管理层和治理层沟通。",
    ];
    page.work_context_block = "板块标题｜会计师和审计师的工作环境与工作方式\n直接答案｜企业会计通常嵌入组织的日常经营，持续处理交易、关账、报告和管理分析；财务报表审计通常按项目和报告期推进，在事务所办公室、客户现场或远程环境中获取和复核证据。\n常见组织与地点｜会计人员主要在企业财务部门、共享服务中心、金融机构、政府及事业单位工作；审计人员主要在会计师事务所、内部审计部门和公共审计机构工作。\n工作材料与系统｜会计工作主要处理合同、发票、凭证、业务数据、总账与明细账，并使用 ERP、总账、合并报表、税务和分析系统。\n任务组织方式｜会计以持续核算和周期性报告为主，需要完成日常记账、对账、关账、报表编制和管理分析。\n截止日期与工作强度｜会计在月结、季报、年报、预算和税务申报期间形成集中工作高峰。\n协作与汇报关系｜会计通常与业务、资金、税务、法务、采购、销售、IT和管理层协作。\n复核与责任链条｜会计成果通常经过制单、复核、审批、关账和报表签发等控制环节。\n质量与职业要求｜会计强调信息的准确性、完整性、及时性、一致性和可追溯性。";
    page.onet_structured_fields_block = {
      availability: "published",
      schema_version: "career.onet_structured_fields.v1",
      heading: "专业依据与使用边界",
      rows: [
        { label: "O*NET 13-2011.00", value: "任务、技能、知识与工作情境参考。", alternate_value: null, secondary_value: null },
      ],
    };

    render(<CareerDisplaySurface surface={adaptCareerDisplaySurface(fixture, "zh")} />);

    const profile = screen.getByTestId("accountants-career-profile");
    expect(profile).toHaveTextContent("会计信息生产线");
    expect(profile).toHaveTextContent("审计鉴证线");
    expect(profile).toHaveTextContent("会计师和审计师围绕交易、账簿、财务报表和审计证据开展工作");
    expect(profile).toHaveTextContent("会计信息生产线：账簿、财务报表、附注与管理报告");
    expect(profile).toHaveTextContent("审计鉴证线：审计底稿、审计发现、管理建议和审计报告");
    expect(profile).not.toHaveTextContent("审计独立评价这些信息是否在重大方面符合适用的报告框架");
    expect(profile).toHaveTextContent("主要产出");
    expect(profile).toHaveTextContent("会计和审计有什么区别？职责、产出与保证边界");
    expect(profile).toHaveTextContent("审计不代替管理层编制财务报表和维护必要内部控制的责任");
    expect(profile).toHaveTextContent("提供高水平的合理保证，而非绝对保证");
    expect(profile.querySelectorAll("[data-career-quick-answer-key='qa2'] tbody tr")).toHaveLength(7);
    expect(profile).toHaveTextContent("会计师和审计师的工作环境与工作方式");
    expect(profile).toHaveTextContent("企业会计通常嵌入组织的日常经营");
    expect(profile).toHaveTextContent("复核与责任链条");
    expect(profile.querySelectorAll("[data-testid='work-context-block'] dl > div")).toHaveLength(7);
    expect(profile).toHaveTextContent("专业依据与使用边界");
    expect(profile).not.toHaveTextContent("核心定义");
    expect(profile).not.toHaveTextContent("二者共同提升财务信息的决策有用性与可信度");
    expect(profile).not.toHaveTextContent("本页以企业会计和财务报表审计为主");
    expect(profile).not.toHaveTextContent("会计生产财务信息，审计独立评价财务信息");
    expect(profile).not.toHaveTextContent("管理层对财务报表编制负责，审计师对独立审计意见负责");
    expect(profile).not.toHaveTextContent("按信息生产、分析和鉴证责任划分");
    expect(profile).not.toHaveTextContent("专业价值集中在规则无法直接给出唯一答案的地方");
    expect(profile).not.toHaveTextContent("职业判断必须建立在适用准则、事实和证据之上");
    expect(profile).not.toHaveTextContent("用于职业探索，不构成会计、审计或法律意见");
    expect(profile).toHaveTextContent("会计确认与计量");
    expect(profile).toHaveTextContent("重大错报风险识别、评估与审计应对");
    expect(profile).toHaveTextContent("关键职业判断");
    expect(profile).toHaveTextContent("充分性关注证据数量，适当性关注相关性和可靠性");
    expect(profile.querySelectorAll("[data-career-quick-answer-key='qa1'] li")).toHaveLength(6);
    expect(profile.querySelectorAll("[data-career-quick-answer-key]")).toHaveLength(3);
    expect(profile.querySelectorAll("[data-career-api-list='responsibilities_block'] > li")).toHaveLength(6);
    expect([...profile.querySelectorAll("[data-career-component-id]")].map((element) =>
      element.getAttribute("data-career-component-id")
    )).toEqual([
      "definition_block",
      "career_quick_answers_block",
      "responsibilities_block",
      "work_context_block",
      "onet_structured_fields_block",
    ]);
  });

  it("maps every component once and declares every field-ledger entry without accidental duplicates", () => {
    const groupedComponents = CAREER_VISUAL_GROUPS.flatMap((group) => group.componentIds);
    expect(new Set(groupedComponents).size).toBe(CAREER_DISPLAY_COMPONENT_ORDER.length);
    expect([...groupedComponents].sort()).toEqual([...CAREER_DISPLAY_COMPONENT_ORDER].sort());

    const coveredComponents = new Set(CAREER_FIELD_CONSUMPTION_LEDGER.map((entry) => entry.componentId));
    for (const componentId of CAREER_DISPLAY_COMPONENT_ORDER) {
      expect(coveredComponents.has(componentId), `missing ledger component ${componentId}`).toBe(true);
    }

    const ledgerKeys = CAREER_FIELD_CONSUMPTION_LEDGER.map(
      (entry) => `${entry.componentId}:${entry.fieldPattern}:${entry.visualGroupId}`
    );
    expect(new Set(ledgerKeys).size).toBe(ledgerKeys.length);
  });

  it("emits testable DOM field markers for every optional presentation slot", () => {
    render(<CareerDisplaySurface surface={buildZhSurface()} />);

    const fieldMarkers = [...document.querySelectorAll("[data-career-api-field]")]
      .map((element) => element.getAttribute("data-career-api-field") ?? "");
    expect(fieldMarkers.filter((field) => field.startsWith("presentation_v1.hero.badges["))).toHaveLength(3);
    expect(fieldMarkers.filter((field) => field.startsWith("presentation_v1.hero.stats["))).toHaveLength(14);
    expect(fieldMarkers.filter((field) => field.startsWith("presentation_v1.hero.ai_exposure."))).toHaveLength(5);

    const hero = screen.getByTestId("career-display-hero");
    expect(hero).toHaveTextContent("常规型 C 主导 · 研究型 I 辅助");
    expect(hero).toHaveTextContent("主要风险：责任 · 压力 · 技术变化");
    expect(screen.queryByTestId("career-published-career_snapshot_primary_locale")).not.toBeInTheDocument();
    expect(screen.getByTestId("fit-decision-checklist")).toHaveTextContent("更可能适合");
    expect(screen.getByTestId("fit-decision-checklist")).toHaveTextContent("需要慎重");
    expect(screen.getByTestId("fit-decision-checklist")).toHaveTextContent("先做一次小实验");
  });

  it("locks the production dossier layout, visual hierarchy, TOC, and responsive tokens", () => {
    const css = readFileSync("components/career/display/CareerProductionVisual.module.css", "utf8");
    const renderer = readFileSync("components/career/display/CareerProductionDisplaySurface.tsx", "utf8");
    for (const token of [
      "padding: 42px 44px",
      "padding: 34px 38px",
      "border-top: 4px solid var(--group-accent)",
      "border-radius: 24px",
      "padding: 13px 15px",
      "padding: 13px 26px",
      "grid-auto-flow: column",
      "scroll-snap-type: inline proximity",
      "@media (prefers-reduced-motion: reduce)",
      "@media (max-width: 1023px)",
      "@media (max-width: 640px)",
    ]) {
      expect(css).toContain(token);
    }
    for (const token of [
      "max-w-[1440px]",
      "lg:grid-cols-[280px_minmax(0,1fr)]",
      "lg:gap-8",
      "visual.tocIndex",
      "visual.assessmentRail",
      "lg:top-[84px]",
    ]) {
      expect(renderer).toContain(token);
    }
  });
});
