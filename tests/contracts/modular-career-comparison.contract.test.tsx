import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { ModularCareerComparison } from "@/components/career/ModularCareerComparison";
import { resolveFixedComparisonPair } from "@/lib/career/fixedComparisonPreview";
import {
  buildModularComparisonView,
  pruneModularComparisonSpec,
  resolveEffectiveModularPluginFlags,
  resolveModularPluginFlags,
  type ModularComparisonSpec,
  type ModularPluginPreset,
} from "@/lib/career/modularComparison";
import { infosecComparisonZhSpec } from "@/lib/career/modularComparisons/infosecComparisonZh";
import { listModularComparisonSpecs } from "@/lib/career/modularComparisons";

const pair = resolveFixedComparisonPair(infosecComparisonZhSpec.pairId)!;

describe("ModularCareerComparison v5.0 master contract", () => {
  it.each([
    ["en", [": ", "? ", ": ", "! ", ": "]],
    ["zh-TW", ["：", "？", "：", "！", "："]],
    ["zh", ["：", "？", "：", "！", "："]],
  ] as const)("separates inline labels and preserves terminal punctuation in %s", (locale, separators) => {
    const original = ["Trigger", `Materials${locale === "en" ? "?" : "？"}`, "Facts", `First answer${locale === "en" ? "! " : "！"}`, "Second answer:"];
    if (locale !== "en") original[4] = "Second answer：";
    const labels = ["Trigger", "Materials", "Facts", "First answer", "Second answer"];
    const spec: ModularComparisonSpec = {
      ...infosecComparisonZhSpec,
      locale,
      incident: { ...infosecComparisonZhSpec.incident, triggerLabel: original[0], triggerBody: "Packet received." },
      desktopExercise: {
        ...infosecComparisonZhSpec.desktopExercise,
        publicLinksHeading: original[1],
        publicLinks: [{ label: "Read the source", href: "https://example.com/source" }],
        factSummaryHeading: original[2],
        factSummarySegments: undefined,
        factSummary: "Start with the index.",
        sampleAnswerALabel: original[3],
        sampleAnswerA: "Check the index.",
        sampleAnswerBLabel: original[4],
        sampleAnswerB: "Record the date.",
      },
    };
    render(<ModularCareerComparison spec={spec} locale={locale} pair={pair} pluginFlags={{ ai: false, thirtyDay: false }} />);

    const following = ["Packet received.", "Read the source", "Start with the index.", "Check the index.", "Record the date."];
    labels.forEach((label, index) => {
      const expected = label + separators[index];
      const element = screen.getByText(expected.trim(), { selector: "span, strong" });
      expect(element.textContent).toBe(expected);
      expect(element.parentElement?.textContent).toContain(expected + following[index]);
    });
  });

  it("renders salary and plain exercise facts as separate paragraphs without repeating the heading", () => {
    const spec: ModularComparisonSpec = {
      ...infosecComparisonZhSpec,
      locale: "en",
      payAndCerts: {
        ...infosecComparisonZhSpec.payAndCerts,
        salaryHeading: "Compare pay",
        salaryBody: "Compare base pay.\n\nSeparate premiums.\r\n\r\nCalculate guaranteed cash.",
      },
      desktopExercise: {
        ...infosecComparisonZhSpec.desktopExercise,
        factSummaryHeading: "Offline facts",
        factSummarySegments: undefined,
        factSummary: "The index is current.\n\nThe second file is a draft.",
      },
    };
    render(<ModularCareerComparison spec={spec} locale="en" pair={pair} pluginFlags={{ ai: false, thirtyDay: false }} />);

    const salary = screen.getByText("Compare pay").parentElement;
    expect(Array.from(salary?.querySelectorAll("p") ?? [], (p) => p.textContent)).toEqual([
      "Compare base pay.",
      "Separate premiums.",
      "Calculate guaranteed cash.",
    ]);
    const firstFact = screen.getByText("Offline facts:").closest("p");
    expect(firstFact?.textContent).toBe("Offline facts: The index is current.");
    expect(firstFact?.nextElementSibling?.tagName).toBe("P");
    expect(firstFact?.nextElementSibling?.textContent).toBe("The second file is a draft.");
  });

  it.each<[ModularPluginPreset, { ai: boolean; thirtyDay: boolean; expectedSectionCount: number; expectedFaqCount: number }]>([
    ["none", { ai: false, thirtyDay: false, expectedSectionCount: 8, expectedFaqCount: 6 }],
    ["ai", { ai: true, thirtyDay: false, expectedSectionCount: 9, expectedFaqCount: 7 }],
    ["30day", { ai: false, thirtyDay: true, expectedSectionCount: 9, expectedFaqCount: 6 }],
    ["all", { ai: true, thirtyDay: true, expectedSectionCount: 10, expectedFaqCount: 7 }],
  ])("prunes disabled plugins from server payload and renders self-consistent DOM for preset '%s'", (preset, expected) => {
    const flags = resolveModularPluginFlags(infosecComparisonZhSpec.defaultPlugins, preset);
    expect(flags).toEqual({ ai: expected.ai, thirtyDay: expected.thirtyDay });

    const prunedSpec = pruneModularComparisonSpec(infosecComparisonZhSpec, flags);
    const serialized = JSON.stringify(prunedSpec);

    // Server-side payload pruning checks (protects raw RSC HTML from leaking disabled plugins)
    if (!expected.ai) {
      expect(prunedSpec.aiPlugin).toBeUndefined();
      expect(serialized).not.toContain("arXiv:2411");
      expect(serialized).not.toContain("NSA 2026-05-20");
      expect(serialized).not.toContain("CSI_MCP_SECURITY");
      expect(serialized).not.toContain("deliverableWhenAiEnabled");
      expect(serialized).not.toContain("引导式响应");
      expect(serialized).not.toContain("faq-ai-boundary");
      expect(serialized).not.toContain("src-ai");
    } else {
      expect(prunedSpec.aiPlugin).toBeDefined();
      expect(serialized).toContain("arXiv:2411.03116");
    }

    if (!expected.thirtyDay) {
      expect(prunedSpec.thirtyDayPlugin).toBeUndefined();
      expect(serialized).not.toContain("30 天");
      expect(serialized).not.toContain("30天");
      expect(serialized).not.toContain("轨道 A");
      expect(serialized).not.toContain("轨道 B");
    } else {
      expect(prunedSpec.thirtyDayPlugin).toBeDefined();
      expect(serialized).not.toContain("deliverableWhenAiEnabled");
    }

    const view = buildModularComparisonView(prunedSpec, flags);
    expect(view.sections).toHaveLength(expected.expectedSectionCount);
    expect(view.faqs).toHaveLength(expected.expectedFaqCount);

    const { container } = render(
      <ModularCareerComparison spec={prunedSpec} locale="zh" pair={pair} pluginFlags={flags} />
    );

    // Zero duplicate element IDs
    const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
    expect(new Set(ids).size).toBe(ids.length);

    // Every TOC link resolves to an actual rendered section ID
    const tocLinks = Array.from(container.querySelectorAll('nav[aria-label="页内目录导航"] a'));
    expect(tocLinks).toHaveLength(expected.expectedSectionCount);
    for (const link of tocLinks) {
      const targetId = link.getAttribute("href")?.replace(/^#/, "");
      expect(targetId).toBeTruthy();
      expect(container.querySelector(`#${targetId}`)).not.toBeNull();
    }

    // Sequential Chinese headings with no skipped numerals
    const h2Texts = Array.from(container.querySelectorAll("section > div > h2, section > div > div > h2")).map(
      (h) => h.textContent ?? ""
    );
    const numerals = ["一、", "二、", "三、", "四、", "五、", "六、", "七、", "八、", "九、", "十、"];
    expect(h2Texts).toHaveLength(expected.expectedSectionCount);
    h2Texts.forEach((heading, idx) => {
      expect(heading.startsWith(numerals[idx])).toBe(true);
    });

    const fullText = container.textContent ?? "";

    if (!expected.ai) {
      expect(container.querySelector('[data-optional-plugin="ai"]')).toBeNull();
      expect(container.querySelector('[data-source-group="src-ai"]')).toBeNull();
      expect(fullText).not.toContain("arXiv:2411");
      expect(fullText).not.toContain("NSA 2026-05-20");
      expect(fullText).not.toContain("引导式响应");
    } else {
      expect(container.querySelector('[data-optional-plugin="ai"]')).not.toBeNull();
      expect(container.querySelector('[data-source-group="src-ai"]')).not.toBeNull();
    }

    if (!expected.thirtyDay) {
      expect(container.querySelector('[data-optional-plugin="thirtyDay"]')).toBeNull();
      expect(fullText).not.toContain("30 天");
      expect(fullText).not.toContain("30天");
    } else {
      expect(container.querySelector('[data-optional-plugin="thirtyDay"]')).not.toBeNull();
    }
  });

  it("supports specs where optional plugin blocks are completely omitted", () => {
    const coreOnlySpec = pruneModularComparisonSpec(infosecComparisonZhSpec, { ai: false, thirtyDay: false });
    const view = buildModularComparisonView(coreOnlySpec, { ai: true, thirtyDay: true });
    expect(view.flags).toEqual({ ai: false, thirtyDay: false });
    expect(view.sections).toHaveLength(8);
    expect(view.faqs).toHaveLength(6);
  });

  it.each([
    ["both omitted", false, false, "no-ai_no-30day", 8, 6],
    ["only AI", true, false, "ai_no-30day", 9, 7],
    ["only 30-day", false, true, "no-ai_30day", 9, 6],
  ] as const)("%s renders the available plugins when all are requested", (_, ai, thirtyDay, tag, sectionCount, faqCount) => {
    const spec = { ...infosecComparisonZhSpec };
    if (!ai) delete spec.aiPlugin;
    if (!thirtyDay) delete spec.thirtyDayPlugin;
    const requested = resolveModularPluginFlags(spec.defaultPlugins, "all");
    const effective = resolveEffectiveModularPluginFlags(spec, requested);
    expect(effective).toEqual({ ai, thirtyDay });

    const pruned = pruneModularComparisonSpec(spec, effective);
    const view = buildModularComparisonView(pruned, requested);
    expect(view.flags).toEqual(effective);
    expect(view.sections).toHaveLength(sectionCount);
    expect(view.faqs).toHaveLength(faqCount);

    const { container } = render(
      <ModularCareerComparison spec={pruned} locale="zh" pair={pair} pluginFlags={requested} />
    );
    expect(container.querySelector("main")?.getAttribute("data-modular-plugins")).toBe(tag);
    expect(container.querySelector("[data-active-module-summary]")?.textContent).toBe(
      ai ? "5 核心模块 + 1 选配（AI工作流边界）"
        : thirtyDay ? "5 核心模块 + 1 选配（30天作品清单）" : "5 核心模块"
    );
    expect(Boolean(container.querySelector('[data-optional-plugin="ai"]'))).toBe(ai);
    expect(Boolean(container.querySelector('[data-optional-plugin="thirtyDay"]'))).toBe(thirtyDay);
    for (const representation of [container.innerHTML, JSON.stringify(pruned)]) {
      if (!ai) {
        for (const marker of ["aiPlugin", "arXiv:2411", "CSI_MCP_SECURITY", "faq-ai-boundary", "src-ai", "deliverableWhenAiEnabled"]) {
          expect(representation).not.toContain(marker);
        }
      }
      if (!thirtyDay) {
        for (const marker of ["thirtyDayPlugin", "sec-30days", "轨道 A", "轨道 B", "30 天", "30天"]) {
          expect(representation).not.toContain(marker);
        }
      }
    }
  });

  it("enforces P0/P1 factual accuracy across AI attribution, SG egress wording, certs, hiring, and NGINX CVE", () => {
    const prunedSpec = pruneModularComparisonSpec(infosecComparisonZhSpec, { ai: true, thirtyDay: true });
    const { container } = render(
      <ModularCareerComparison
        spec={prunedSpec}
        locale="zh"
        pair={pair}
        pluginFlags={{ ai: true, thirtyDay: true }}
      />
    );
    const fullText = container.textContent ?? "";

    // NGINX CVE-2024-24989 single source of truth
    expect(fullText).toContain("CVE-2024-24989");
    expect(fullText).toContain("NGINX 1.25.3");
    expect(fullText).toContain("1.25.4");
    expect(fullText).toContain("error.log");
    expect(fullText).toContain("access.log");
    expect(fullText).toContain("资产受影响");
    expect(fullText).toContain("观察到崩溃");
    expect(fullText).toContain("触发原因待证");
    expect(fullText).not.toContain("1.25.0–1.25.3");
    expect(fullText).not.toContain("1.25.0-1.25.3");

    // Item 1 (P0): Strict AI study attribution & actual task names
    expect(fullText).not.toContain("三项研究共同提示");
    expect(fullText).not.toContain("复杂安全响应子任务");
    expect(fullText).toContain("真实 SOC 观察性研究");
    expect(fullText).toContain("Entra / Intune");
    expect(fullText).toContain("事件摘要");
    expect(fullText).toContain("脚本分析");
    expect(fullText).toContain("事件报告");
    expect(fullText).toContain("引导式响应");
    expect(fullText).toContain("2026-05-20");
    expect(fullText).toContain("编辑模拟反例");
    expect(fullText).toContain("以组织安全预案与岗位授权为准");

    // Item 2 (P0): Accurate Security Group egress wording & FAQ 6 authority
    expect(fullText).not.toContain("安全组对象限流");
    expect(fullText).toContain("目的 IP/CIDR 或安全组，以及协议和端口，限制允许的出站访问");
    expect(fullText).toContain("正常财务结算与离线报表回归用例全部通过");
    expect(fullText).toContain("涉事旧凭证已撤销");
    expect(fullText).toContain("预案指定人员审批，获授权人员执行并留痕");
    expect(fullText).not.toContain("5 人以下");

    // Item 3 (P1): Cert & hiring precision
    expect(fullText).not.toContain("生产环境通常配置只读查询权限");
    expect(fullText).toContain("生产环境的查询权限范围有多大");
    expect(fullText).toContain("5 年全职相关工作经验");
    expect(fullText).toContain("带薪或无薪实习");
    expect(fullText).toContain("Associate of ISC2");
    expect(fullText).toContain("OffSec CPE 与年度维护官方手册");
    expect(fullText).toContain("PEN-200 课程入口");
    expect(fullText).toContain("V2EX 公开招聘贴 #1200917");
    expect(fullText).toContain("2026-03-25");
    expect(fullText).toContain("约 8 分钟");

    const handbookLinks = Array.from(container.querySelectorAll('a[href*="35366391096596-OffSec-CPE-Program-and-Annual-Maintenance-Handbook"]'));
    expect(handbookLinks.length).toBeGreaterThanOrEqual(2);

    // External links all have rel="noopener noreferrer"
    const externalLinks = Array.from(container.querySelectorAll('a[href^="https://"]'));
    expect(externalLinks.length).toBeGreaterThanOrEqual(20);
    for (const a of externalLinks) {
      expect(a.getAttribute("rel")).toContain("noopener");
      expect(a.getAttribute("rel")).toContain("noreferrer");
    }
  });

  it("keeps skills and work conditions strictly separate in the interactive checklist (no cross-dimension vote mixing)", () => {
    const prunedSpec = pruneModularComparisonSpec(infosecComparisonZhSpec, { ai: false, thirtyDay: false });
    const { container } = render(
      <ModularCareerComparison
        spec={prunedSpec}
        locale="zh"
        pair={pair}
        pluginFlags={{ ai: false, thirtyDay: false }}
      />
    );

    const analystSkill = container.querySelector('input[data-checklist-skill="skill-analyst"]') as HTMLInputElement;
    const engineerCondition = container.querySelector('input[data-checklist-condition="cond-engineer"]') as HTMLInputElement;

    fireEvent.click(analystSkill);
    fireEvent.click(engineerCondition);

    const output = container.querySelector('[data-checklist-output="three-column"]');
    expect(output?.textContent).toContain("① 已具备技能");
    expect(output?.textContent).toContain("协议、Linux 与日志筛选基础");
    expect(output?.textContent).toContain("② 可接受条件");
    expect(output?.textContent).toContain("工程改造根治问题");
    expect(output?.textContent).toContain("③ 面试待核清单");
    expect(output?.textContent).not.toContain("暂不确定");
    expect(container.querySelector('[data-checklist-cross-track="true"]')).not.toBeNull();
  });

  it("exposes accessible matrix expand/collapse controls with all 9 rows in static DOM", () => {
    const prunedSpec = pruneModularComparisonSpec(infosecComparisonZhSpec, { ai: true, thirtyDay: true });
    const { container } = render(
      <ModularCareerComparison
        spec={prunedSpec}
        locale="zh"
        pair={pair}
        pluginFlags={{ ai: true, thirtyDay: true }}
      />
    );

    const btn = screen.getByRole("button", { name: /展开其余 5 维细节/ });
    expect(btn.getAttribute("aria-expanded")).toBe("false");
    expect(btn.getAttribute("aria-controls")).toBe("core-comparison-matrix-table");
    expect(btn.textContent).toContain("职业摩擦");
    expect(btn.textContent).not.toContain("薪酬");

    const rows = container.querySelectorAll("#core-comparison-matrix-table tbody tr");
    expect(rows).toHaveLength(9);

    fireEvent.click(btn);
    expect(btn.getAttribute("aria-expanded")).toBe("true");
  });
  it("renders a non-security comparison using only its spec", () => {
    const archivePair = { slugs: ["cataloguer", "exhibit-designer"], labels: { en: "Cataloguer vs Exhibit Designer" } };
    const spec: ModularComparisonSpec = {
      pairId: "cataloguer-vs-exhibit-designer",
      locale: "en",
      title: "Cataloguer vs Exhibit Designer: daily work",
      shortTitle: "Compare museum roles",
      description: "Compare museum collection and exhibition work.",
      regionLabel: "Museum work",
      authorName: "Test Editorial",
      datePublished: "2026-11-24",
      dateModified: "2026-11-24",
      defaultPlugins: { ai: false, thirtyDay: false },
      hero: {
        directAnswer: "Check collection records or plan how to display them.",
        roleA: { badgeTitle: "Cataloguer", riasecLabel: "C", aliases: "Registrar", keywords: "Collection inventory" },
        roleB: { badgeTitle: "Exhibit Designer", riasecLabel: "A", aliases: "Designer", keywords: "Exhibition layout" },
        interviewBoundaryTitle: "Ask about responsibility",
        interviewBoundaryQuestions: ["Who signs the object transfer?"],
        riasecBoundaryNote: "Interests and skills are assessed separately.",
      },
      topology: {
        title: "Collection workflow",
        summary: "The handoff starts with an object list.",
        ariaLabel: "Museum workflow",
        leftZoneTitle: "Collections",
        leftSteps: [{ title: "Record", detail: "Check inventory" }],
        centerZoneTitle: "Transfer",
        upperBridge: { title: "Object list", line1: "Verify IDs", line2: "Request display" },
        lowerBridge: { title: "Return", line1: "Check condition", line2: "Record custody" },
        rightZoneTitle: "Exhibitions",
        rightSteps: [{ title: "Plan display", detail: "Set layout" }],
      },
      matrix: {
        title: "Compare museum teams",
        summary: "Compare final outputs.",
        roleAColumn: "Catalogue",
        roleBColumn: "Exhibition",
        rows: ["Intake", "Register", "Handoff", "Review", "Delivery"].map((dimension) => ({
          id: dimension.toLowerCase(),
          dimension,
          roleA: "Inventory form",
          roleB: "Floor plan",
          defaultVisible: true,
        })),
      },
      incident: {
        title: "Object transfer",
        summary: "Check who owns the handoff.",
        triggerLabel: "Scenario",
        triggerBody: "A label needs correction.",
        triggerCaveat: "Example only.",
        rows: [{ stage: "Review", roleLabel: "Cataloguer", tone: "roleA", verifiedFacts: "ID matches", openGaps: "Date unknown", actionAndApproval: "Curator checks label" }],
        recoveryAcceptanceTitle: "Accept transfer",
        recoveryAcceptanceCriteria: "Both copies list the same object ID.",
        defenseLayerNote: "Keep a signed copy.",
      },
      payAndCerts: {
        title: "Hiring",
        summary: "Check employer requirements.",
        salaryHeading: "Compare local postings",
        salaryBody: "Use the same hours and currency.",
        certs: [],
        interviewChecklistTitle: "Ask the hiring team",
        interviewChecklistQuestions: [],
      },
      checklist: {
        title: "Check your fit",
        summary: "Separate skills and conditions.",
        skillsHeading: "Skills",
        skillsOptions: [{ id: "inventory", track: "roleA", label: "Inventory", summary: "Record IDs", interviewQuestions: [] }],
        conditionsHeading: "Conditions",
        conditionsOptions: [
          { id: "weekend", label: "Weekend", summary: "Weekend setup", interviewQuestions: [] },
          { id: "gallery", track: "roleB", label: "Gallery", summary: "Gallery installation", interviewQuestions: [] },
        ],
        defaultInterviewQuestions: ["Ask about access."],
        crossTrackNote: "A cross-track fit.",
        offlinePrintHint: "Print and check off.",
      },
      desktopExercise: {
        sectionTitle: "Review a transfer form",
        summary: "Use paper only.",
        publicLinksHeading: "Public museum references:",
        publicLinks: [{ label: "Museum", href: "https://www.si.edu/" }],
        factSummaryHeading: "Facts from the record:",
        factSummary: "An object ID binds inventory and transfer records.",
        taskA: { title: "Record custody", instruction: "Fill out the inventory form." },
        taskB: { title: "Draw the gallery", instruction: "Mark the display location." },
        rubricTitle: "Check the two records",
        rubricPassRule: "Two checks",
        rubricItems: ["Match the ID.", "Check the location."],
        sampleAnswerALabel: "Inventory answer:",
        sampleAnswerA: "Record the ID in the register.",
        sampleAnswerBLabel: "Gallery answer:",
        sampleAnswerB: "Use the same ID on the layout.",
      },
      tools: { title: "Next step", summary: "Compare outputs.", cards: [], profileLinksLabel: "Profiles", profileLinks: [] },
      faqs: [],
      sourceGroups: [],
    };

    const { container } = render(
      <ModularCareerComparison spec={spec} locale="en" pair={archivePair} pluginFlags={{ ai: true, thirtyDay: true }} />
    );
    expect(container.querySelector("main")?.getAttribute("lang")).toBe("en");
    expect(screen.getByText(spec.shortTitle!)).toBeTruthy();
    expect(screen.getByRole("region", { name: "Core 5-dimension comparison table" })).toBeTruthy();
    expect(container.querySelector("#toggle-matrix-rows")).toBeNull();
    expect(container.querySelector("#sec-matrix a")).toBeNull();
    expect(screen.getByText("2-Item Self-Check Rubric (Two checks)")).toBeTruthy();
    expect(screen.getByText("Inventory answer:")).toBeTruthy();
    expect(screen.getByText("Gallery answer:")).toBeTruthy();
    expect(screen.getByText("Facts from the record:").parentElement?.textContent).toContain(spec.desktopExercise.factSummary);
    expect(container.querySelector("[data-active-module-summary]")?.textContent).toBe("5 Core Modules");
    expect(container.textContent).not.toMatch(/[\u4e00-\u9fff]/);

    fireEvent.click(container.querySelector('input[data-checklist-skill="inventory"]')!);
    fireEvent.click(container.querySelector('input[data-checklist-condition="weekend"]')!);
    expect(container.querySelector('[data-checklist-cross-track="true"]')).toBeNull();
    fireEvent.click(container.querySelector('input[data-checklist-condition="gallery"]')!);
    expect(container.querySelector('[data-checklist-cross-track="true"]')).not.toBeNull();
    expect(container.textContent).not.toMatch(/CVE|NGINX|error\.log|access\.log/);

    // Verify zh-TW chrome renders native Traditional Chinese labels on the same shared UI
    const twSpec: ModularComparisonSpec = { ...spec, locale: "zh-TW" };
    const twRender = render(
      <ModularCareerComparison spec={twSpec} locale="zh-TW" pair={archivePair} pluginFlags={{ ai: false, thirtyDay: false }} />
    );
    expect(twRender.container.querySelector("main")?.getAttribute("lang")).toBe("zh-TW");
    expect(twRender.container.querySelector("[data-active-module-summary]")?.textContent).toBe("5 核心模組");
    expect(twRender.container.querySelector('nav[aria-label="頁內目錄導覽"]')).not.toBeNull();
  });
});

describe.each(listModularComparisonSpecs())("registered comparison $locale/$pairId", (spec) => {
  const presets = ["none", "ai", "30day", "all"] as const;

  it.each(presets)("renders the core and available plugins for %s", (preset) => {
    const pair = resolveFixedComparisonPair(spec.pairId);
    expect(pair).toBeDefined();
    const requested = resolveModularPluginFlags(spec.defaultPlugins, preset);
    const expected = {
      ai: (preset === "ai" || preset === "all") && Boolean(spec.aiPlugin),
      thirtyDay: (preset === "30day" || preset === "all") && Boolean(spec.thirtyDayPlugin),
    };
    const pruned = pruneModularComparisonSpec(spec, requested);
    const view = buildModularComparisonView(pruned, requested);
    expect(view.flags).toEqual(expected);
    expect(Object.hasOwn(pruned, "aiPlugin")).toBe(expected.ai);
    expect(Object.hasOwn(pruned, "thirtyDayPlugin")).toBe(expected.thirtyDay);
    const included = (item: { requiresPlugin?: "ai" | "thirtyDay" }) =>
      item.requiresPlugin === undefined || expected[item.requiresPlugin];
    expect(view.faqs).toEqual(spec.faqs.filter(included));
    expect(view.sourceGroups).toEqual(spec.sourceGroups.filter(included));

    const { container } = render(
      <ModularCareerComparison spec={pruned} locale={spec.locale} pair={pair!} pluginFlags={requested} />
    );
    const main = container.querySelector("main")!;
    expect(main.getAttribute("data-fixed-comparison")).toBe(spec.pairId);
    expect(main.querySelector("h1")?.textContent).toBe(spec.title);
    expect(main.getAttribute("data-modular-plugins")).toBe(
      `${expected.ai ? "ai" : "no-ai"}_${expected.thirtyDay ? "30day" : "no-30day"}`
    );
    expect(main.querySelector("[data-active-module-summary]")?.textContent).toBe(view.activeModuleSummary);
    if (!expected.ai && !expected.thirtyDay) {
      const expectedCoreSummary =
        spec.locale === "en" ? "5 Core Modules" : spec.locale === "zh-TW" ? "5 核心模組" : "5 核心模块";
      expect(view.activeModuleSummary).toBe(expectedCoreSummary);
    }
    const renderedPlugins = Array.from(main.querySelectorAll("[data-optional-plugin]"))
      .map((element) => element.getAttribute("data-optional-plugin"));
    expect(renderedPlugins).toEqual((["ai", "thirtyDay"] as const).filter((key) => expected[key]));
    expect(Array.from(main.querySelectorAll("[data-source-group]"), (element) =>
      element.getAttribute("data-source-group"))).toEqual(view.sourceGroups.map(({ id }) => id));
    expect(main.querySelectorAll("#sec-faq details")).toHaveLength(view.faqs.length);
    expect(main.querySelector("#sec-trial")?.textContent).toContain(spec.desktopExercise.sampleAnswerA);
    expect(main.querySelector("#sec-trial")?.textContent).toContain(spec.desktopExercise.sampleAnswerB);

    const ids = Array.from(main.querySelectorAll("[id]"), (element) => element.id);
    expect(new Set(ids).size).toBe(ids.length);
    const anchors = Array.from(main.querySelectorAll('nav[data-toc-nav="true"] a'), (element) =>
      element.getAttribute("href"));
    expect(anchors).toEqual(view.sections.map(({ id }) => `#${id}`));
    expect(anchors).toHaveLength(8 + Number(expected.ai) + Number(expected.thirtyDay));
    for (const anchor of anchors) {
      expect(ids).toContain(anchor?.slice(1));
    }

    const toolLinks = Array.from(main.querySelectorAll("#sec-tools a"), (link) =>
      link.getAttribute("href"));
    expect(toolLinks).toContain(`/${spec.locale}/career/compare`);
    expect(toolLinks).toContain(`/${spec.locale}/tests/holland-career-interest-test-riasec`);
    expect(spec.tools.cards.map((card) => card.href)).toContain(
      `/${spec.locale}/tests/holland-career-interest-test-riasec`
    );
    expect(toolLinks).toContain(`/${spec.locale}/tests/career-planning-and-work-style-test`);
    expect(toolLinks.some((href) =>
      href === `/${spec.locale}/career/interest-worksheet` ||
      href === `/${spec.locale}/career/interest-worksheet#my-worksheet`
    )).toBe(true);

    const externalLinks = Array.from(main.querySelectorAll('a[href^="https://"]'));
    expect(externalLinks.length).toBeGreaterThan(0);
    for (const link of externalLinks) {
      const rel = (link.getAttribute("rel") ?? "").split(/\s+/);
      expect(rel).toEqual(expect.arrayContaining(["noopener", "noreferrer"]));
    }
  });

  it("detects a cross-track selection without mixing skills and conditions", () => {
    const pair = resolveFixedComparisonPair(spec.pairId)!;
    const skill = spec.checklist.skillsOptions.find((option) =>
      option.track && spec.checklist.conditionsOptions.some((condition) =>
        condition.track && condition.track !== option.track));
    expect(skill).toBeDefined();
    const condition = spec.checklist.conditionsOptions.find((option) =>
      option.track && option.track !== skill!.track)!;
    const { container } = render(
      <ModularCareerComparison spec={spec} locale={spec.locale} pair={pair} pluginFlags={{ ai: false, thirtyDay: false }} />
    );
    const findInput = (attribute: string, id: string) =>
      Array.from(container.querySelectorAll(`input[${attribute}]`))
        .find((element) => element.getAttribute(attribute) === id)!;
    const crossTrack = '[data-checklist-cross-track="true"]';
    fireEvent.click(findInput("data-checklist-skill", skill!.id));
    expect(container.querySelector(crossTrack)).toBeNull();
    const conditionInput = findInput("data-checklist-condition", condition.id);
    fireEvent.click(conditionInput);
    expect(container.querySelector(crossTrack)?.textContent).toBe(spec.checklist.crossTrackNote);
    const output = container.querySelector('[data-checklist-output="three-column"]')!;
    expect(output.children[0].textContent).toContain(skill!.summary);
    expect(output.children[1].textContent).toContain(condition.summary);
    fireEvent.click(conditionInput);
    expect(container.querySelector(crossTrack)).toBeNull();
  });

  it("matches topology vertical arrows to step count, wraps long details, and sizes the tools grid cleanly", () => {
    const pair = resolveFixedComparisonPair(spec.pairId)!;
    const { container } = render(
      <ModularCareerComparison spec={spec} locale={spec.locale} pair={pair} pluginFlags={spec.defaultPlugins} />
    );

    expect(container.querySelectorAll('[data-topology-vertical-arrow="left"]')).toHaveLength(
      Math.max(0, spec.topology.leftSteps.length - 1)
    );
    expect(container.querySelectorAll('[data-topology-vertical-arrow="right"]')).toHaveLength(
      Math.max(0, spec.topology.rightSteps.length - 1)
    );

    const hasLongDetail = [...spec.topology.leftSteps, ...spec.topology.rightSteps].some((s) => s.detail.length > 20);
    const tspans = container.querySelectorAll('#sec-topology svg[role="img"] tspan');
    expect(tspans.length).toBeGreaterThanOrEqual(spec.topology.leftSteps.length + spec.topology.rightSteps.length);
    if (hasLongDetail) {
      expect(tspans.length).toBeGreaterThan(
        spec.topology.leftSteps.length + spec.topology.rightSteps.length + 4
      );
    }

    const toolsGrid = container.querySelector("[data-tools-grid]")!;
    if (spec.tools.cards.length === 3) {
      expect(toolsGrid.className).toContain("sm:grid-cols-3");
    } else {
      expect(toolsGrid.className).toContain("sm:grid-cols-2");
    }
  });
});
