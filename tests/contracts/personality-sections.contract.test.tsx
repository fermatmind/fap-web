import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { CmsPersonalitySection, PersonalityProjectionSection } from "@/lib/cms/personality";
import {
  buildPersonalitySectionLinks,
  extractPersonalityFaqItems,
  extractProjectionFaqItems,
  normalizeProjectionSections,
  renderPersonalitySections,
  renderProjectionSections,
} from "@/lib/cms/personality-sections";

function section(overrides: Partial<PersonalityProjectionSection>): PersonalityProjectionSection {
  return {
    key: "overview",
    title: "Overview",
    render: "rich_text",
    bodyMd: "Default body",
    payload: null,
    isEnabled: true,
    source: "base",
    ...overrides,
  };
}

function cmsSection(overrides: Partial<CmsPersonalitySection>): CmsPersonalitySection {
  return {
    sectionKey: "quick_answer",
    title: "Quick answer",
    renderVariant: "rich_text",
    bodyMd: "Default CMS body",
    bodyHtml: "",
    payloadJson: null,
    sortOrder: 100,
    isEnabled: true,
    ...overrides,
  };
}

describe("personality projection section renderer contract", () => {
  it("keeps generic canonical keys instead of filtering them through the legacy allowlist", () => {
    const sections = normalizeProjectionSections([
      section({ key: "overview", title: "Overview" }),
      section({ key: "career.summary", title: "Career summary" }),
      section({ key: "growth.summary", title: "Growth summary" }),
      section({ key: "relationships.summary", title: "Relationships summary" }),
    ]);

    expect(sections.map((item) => item.key)).toEqual([
      "overview",
      "career.summary",
      "growth.summary",
      "relationships.summary",
    ]);
  });

  it("renders letters_intro payload with headline and per-letter content", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({
              key: "letters_intro",
              title: "Letter-by-letter introduction",
              render: "letters_intro",
              bodyMd: "",
              payload: {
                headline: "How the four letters create the public profile.",
                letters: [
                  { letter: "I", title: "Introversion", description: "Starts with inward pattern synthesis." },
                  { letter: "N", title: "Intuition", description: "Tracks abstractions and future patterns." },
                ],
              },
            }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("How the four letters create the public profile.")).toBeInTheDocument();
    expect(screen.getByText("这个类型是什么")).toBeInTheDocument();
    expect(screen.getByText("Introversion")).toBeInTheDocument();
    expect(screen.getByText("Tracks abstractions and future patterns.")).toBeInTheDocument();
  });

  it("removes inline letter suffixes for zh letter cards", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({
              key: "letters_intro",
              title: "Letter-by-letter introduction",
              render: "letters_intro",
              bodyMd: "",
              payload: {
                headline: "内向 · 直觉 · 思考 · 规划 · 自信型",
                letters: [
                  { letter: "I", title: "内向（I）", description: "向内整理信息。" },
                  { letter: "A", title: "自信型（-A）", description: "更能稳定判断。" },
                ],
              },
            }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("内向")).toBeInTheDocument();
    expect(screen.getByText("自信型")).toBeInTheDocument();
    expect(screen.queryByText("内向（I）")).not.toBeInTheDocument();
    expect(screen.queryByText("自信型（-A）")).not.toBeInTheDocument();
  });

  it("localizes generic zh projection headings", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({ key: "overview", title: "Overview", bodyMd: "A compact type overview." }),
            section({ key: "growth.drainers", title: "Growth drainers", bodyMd: "Common energy drains." }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("这个类型是什么")).toBeInTheDocument();
    expect(screen.getByText("能量消耗")).toBeInTheDocument();
    expect(screen.queryByText("Overview")).not.toBeInTheDocument();
    expect(screen.queryByText("Growth drainers")).not.toBeInTheDocument();
  });

  it("renders trait_overview as a canonical dimension grid", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({
              key: "trait_overview",
              title: "Trait overview",
              render: "trait_dimension_grid",
              bodyMd: "",
              payload: {
                summary: "Five canonical MBTI dimensions.",
                dimensions: [
                  {
                    id: "SN",
                    name: "Information",
                    axis_left: "Sensing",
                    axis_right: "Intuition",
                    summary: "Leans toward pattern reading.",
                    description: "Builds abstract models before locking details.",
                  },
                ],
              },
            }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("常见特征")).toBeInTheDocument();
    expect(screen.queryByText("Five canonical MBTI dimensions.")).not.toBeInTheDocument();
    expect(screen.getByText("Information")).toBeInTheDocument();
    expect(screen.queryByText("Sensing / Intuition")).not.toBeInTheDocument();
    expect(screen.getByText("Builds abstract models before locking details.")).toBeInTheDocument();
  });

  it("renders career.preferred_roles with grouped examples", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({
              key: "career.preferred_roles",
              title: "Preferred roles",
              render: "preferred_role_list",
              bodyMd: "",
              payload: {
                title: "Roles that reward long-cycle strategy.",
                intro: "Look for systems, leverage, and autonomy.",
                groups: [
                  {
                    groupTitle: "Strategic systems roles",
                    description: "High-fit roles when the brief values foresight.",
                    examples: ["Product strategist", "Research lead"],
                  },
                ],
              },
            }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("适合工作")).toBeInTheDocument();
    expect(screen.getByText("Roles that reward long-cycle strategy.")).toBeInTheDocument();
    expect(screen.getByText("Strategic systems roles")).toBeInTheDocument();
    expect(screen.getByText("Product strategist")).toBeInTheDocument();
    expect(screen.getByText("Research lead")).toBeInTheDocument();
  });

  it("renders premium teaser sections without pretending to be full sections", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({
              key: "growth.motivators",
              title: "Growth motivators",
              render: "premium_teaser",
              bodyMd: "Preview: recognition, purpose, and intellectual momentum.",
            }),
            section({
              key: "relationships.rel_advantages",
              title: "Relationship advantages",
              render: "premium_teaser",
              bodyMd: "Preview: steadiness, clarity, and selective loyalty.",
            }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("成长动力")).toBeInTheDocument();
    expect(screen.getByText("Preview: recognition, purpose, and intellectual momentum.")).toBeInTheDocument();
    expect(screen.queryByText("Premium section preview")).not.toBeInTheDocument();
    expect(screen.queryByText("Unlock the full section in the premium experience.")).not.toBeInTheDocument();
  });

  it("renders and extracts backend projection FAQ sections as visible semantic content", () => {
    const sections = [
      section({
        key: "faq",
        title: "FAQ",
        render: "faq",
        bodyMd: "",
        payload: {
          items: [
            {
              question: "What does INTJ-A mean?",
              answer: "INTJ-A describes an Assertive INTJ profile returned by the backend.",
            },
            {
              question: "How is INTJ-A different from INTJ-T?",
              answer: "The A/T difference is provided by backend personality content, not frontend copy.",
            },
          ],
        },
      }),
    ];

    render(<div>{renderProjectionSections(sections, "en")}</div>);

    expect(screen.getByText("FAQ")).toBeInTheDocument();
    expect(screen.getByText("What does INTJ-A mean?")).toBeInTheDocument();
    expect(screen.getByText("INTJ-A describes an Assertive INTJ profile returned by the backend.")).toBeInTheDocument();
    expect(extractProjectionFaqItems(sections)).toEqual([
      {
        question: "What does INTJ-A mean?",
        answer: "INTJ-A describes an Assertive INTJ profile returned by the backend.",
      },
      {
        question: "How is INTJ-A different from INTJ-T?",
        answer: "The A/T difference is provided by backend personality content, not frontend copy.",
      },
    ]);
  });

  it("maps the backend MBTI variant section skeleton to search-intent headings", () => {
    render(
      <div>
        {renderProjectionSections(
          [
            section({ key: "letters_intro", title: "Letter introduction", render: "letters_intro", bodyMd: "Letters." }),
            section({ key: "trait_overview", title: "Trait overview", render: "rich_text", bodyMd: "Traits." }),
            section({ key: "relationships.summary", title: "Relationships summary", bodyMd: "Relationships." }),
            section({ key: "career.summary", title: "Career summary", bodyMd: "Career." }),
            section({ key: "career.preferred_roles", title: "Preferred roles", bodyMd: "Roles." }),
            section({ key: "growth.strengths", title: "Growth strengths", bodyMd: "Strengths." }),
            section({ key: "growth.weaknesses", title: "Growth weaknesses", bodyMd: "Weaknesses." }),
          ],
          "zh"
        )}
      </div>
    );

    expect(screen.getByText("这个类型是什么")).toBeInTheDocument();
    expect(screen.getByText("常见特征")).toBeInTheDocument();
    expect(screen.getByText("爱情 / 关系")).toBeInTheDocument();
    expect(screen.getByText("职业倾向")).toBeInTheDocument();
    expect(screen.getByText("适合工作")).toBeInTheDocument();
    expect(screen.getByText("优势")).toBeInTheDocument();
    expect(screen.getByText("弱点")).toBeInTheDocument();
  });

  it("renders promoted MBTI64 zh variant sections without frontend-side translation or private routes", () => {
    const sections = [
      cmsSection({
        sectionKey: "meaning",
        title: "ISTJ-A 是什么人格？",
        bodyMd: "ISTJ-A 表示更稳定自信的 ISTJ 表达方式。",
      }),
      cmsSection({
        sectionKey: "core_traits",
        title: "ISTJ-A 的核心特点",
        bodyMd: "",
        payloadJson: {
          raw: {
            h2: "ISTJ-A 的核心特点",
            items: [
              "责任闭环：倾向于把承诺落实到流程、时间表和可检查的结果。",
              "稳定执行：在压力下通常更愿意按既定标准推进。",
            ],
          },
        },
      }),
      cmsSection({
        sectionKey: "strengths_blind_spots",
        title: "优势与盲点",
        bodyMd: "",
        payloadJson: {
          raw: {
            strengths: ["可靠、守时、重视标准。"],
            blind_spots: ["可能过早把不确定性排除在计划外。"],
          },
        },
      }),
      cmsSection({
        sectionKey: "faq",
        title: "FAQ",
        renderVariant: "faq",
        bodyMd: "",
        payloadJson: {
          items: [
            {
              question: "ISTJ-A 比 ISTJ-T 更好吗？",
              answer: "不是。A/T 描述的是压力和自我确认方式，不是好坏排序。",
            },
          ],
        },
      }),
      cmsSection({
        sectionKey: "related_content",
        title: "Related content",
        renderVariant: "links",
        bodyMd: "",
        payloadJson: {
          links: [
            {
              href: "/zh/personality",
              anchor_text: "人格主入口",
              role: "hub",
              safe_public_route: true,
            },
            {
              href: "/zh/tests/big-five-personality-test-ocean-model",
              anchor_text: "大五人格测试",
              role: "related_test",
              safe_public_route: true,
            },
            {
              href: "/zh/results/lookup",
              anchor_text: "结果查询",
              role: "private",
              safe_public_route: false,
            },
          ],
        },
      }),
      cmsSection({
        sectionKey: "mbti64_promotion_metadata",
        title: "Promotion metadata",
        renderVariant: "callout",
        bodyMd: "",
        payloadJson: {
          raw_row: {
            method_boundary: "本页用于自我理解，不用于招聘、诊断或重大决策。",
            trademark_boundary: "FermatMind 发布独立 16 型教育内容。",
          },
        },
      }),
    ];

    const { container } = render(<div>{renderPersonalitySections(sections, "zh")}</div>);

    expect(screen.getByRole("heading", { level: 2, name: "ISTJ-A 是什么人格？" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { level: 2, name: "这个类型是什么意思" })).not.toBeInTheDocument();
    expect(screen.getByText("ISTJ-A 表示更稳定自信的 ISTJ 表达方式。")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "ISTJ-A 的核心特点" })).toBeInTheDocument();
    expect(screen.getByText("责任闭环：倾向于把承诺落实到流程、时间表和可检查的结果。")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "优势与盲点" })).toBeInTheDocument();
    expect(screen.getByText("可靠、守时、重视标准。")).toBeInTheDocument();
    expect(screen.getByText("可能过早把不确定性排除在计划外。")).toBeInTheDocument();
    expect(screen.getByText("ISTJ-A 比 ISTJ-T 更好吗？")).toBeInTheDocument();
    expect(screen.getByText("大五人格测试")).toBeInTheDocument();
    expect(screen.getAllByText("方法边界").length).toBeGreaterThan(0);
    expect(screen.getByText("商标与体系边界")).toBeInTheDocument();
    expect(screen.queryByText("结果查询")).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("/results");
    expect(extractPersonalityFaqItems(sections)).toEqual([
      {
        question: "ISTJ-A 比 ISTJ-T 更好吗？",
        answer: "不是。A/T 描述的是压力和自我确认方式，不是好坏排序。",
      },
    ]);
  });

  it("renders MBTI64 V8.5/V5 reader-experience fields from backend recommendation payloads", () => {
    const sections = [
      cmsSection({
        sectionKey: "meaning",
        title: "INTJ-A 人格特点",
        bodyMd: "后端提供的人格定义正文。",
        payloadJson: {
          raw_row: {
            reader_experience: {
              thirty_second_overview: [
                "INTJ-A 的核心张力是长期系统、独立判断和现实反馈之间的校准。",
                "A 型通常更能保留自我确认，但需要避免低估早期反馈。",
              ],
              ai_search_answer: {
                what_is: "INTJ-A 描述建筑师人格中更稳定的自我确认方式。",
                at_difference: "A/T 差异描述压力和反馈校准方式，不是能力排序。",
                work_pattern: "工作中更适合长期规划、复杂拆解和关键路径判断。",
                relationship_pattern: "关系里常把关心表达成方案、边界和持续行动。",
                not_for: "不能用于诊断、招聘筛选、智商判断或职业承诺。",
              },
              strengths: [
                {
                  title: "把复杂问题整理成可行动线索",
                  detail: "会先区分事实、假设、限制条件和下一步。",
                },
              ],
              watch_outs: [
                {
                  title: "过早相信模型完整",
                  detail: "稳定判断可能让他们错过现场反馈。",
                },
              ],
              at_difference_scenarios: {
                work: "在工作中，A 型更容易先保持判断节奏。",
                relationship: "关系里需要解释稳定背后的在意。",
                pressure: "压力下要拆分事实、感受、责任和下一步。",
              },
              work_decision_card: {
                best_fit: "目标清楚、反馈真实、允许独立判断的任务。",
                likely_stuck: "权责含混、反馈绕圈或只看态度不看证据的环境。",
                boundary: "不能由类型直接推出固定职业。",
              },
              relationship_communication_card: {
                care_language: "把关心表达成建议、方案和长期保护。",
                conflict_pattern: "冲突中先处理问题结构，再处理情绪余波。",
                misread: "容易被误读成冷淡、强势或回避。",
              },
              pressure_growth_card: {
                signals: "现实反馈打断长期计划时容易收紧控制。",
                compensation: "可能加速控制、反复复查或撤回表达。",
                weekly_experiment: "把事实、担心和希望的下一步分开说。",
                not_for: "不能替代专业判断。",
              },
            },
            modules: [
              {
                id: "core-reading",
                title: "01｜先理解这个类型",
                insight: "INTJ-A 的关键不是冷静本身，而是如何让反馈进入长期系统。",
                paragraphs: ["他们会先判断结构，再决定投入方式。"],
              },
            ],
            faq: [
              {
                question: "INTJ-A 人格是什么意思？",
                answer: "它描述一种判断、压力和沟通偏好，不是诊断或命运结论。",
              },
            ],
            internal_links: [
              {
                path: "/zh/tests/mbti-personality-test-16-personality-types",
                label: "免费 16 型人格测试",
                reason: "回到测评入口，确认类型来源和结果解释。",
              },
              {
                path: "/zh/account",
                label: "账号中心",
                reason: "不应出现在公开人格页。",
                safe_public_route: false,
              },
            ],
          },
        },
      }),
    ];

    const { container } = render(<div>{renderPersonalitySections(sections, "zh")}</div>);

    expect(screen.getByText("30 秒速览")).toBeInTheDocument();
    expect(screen.getByText("INTJ-A 的核心张力是长期系统、独立判断和现实反馈之间的校准。")).toBeInTheDocument();
    expect(screen.getByText("AI / Search 摘要答案")).toBeInTheDocument();
    expect(screen.getByText("A/T 最大区别")).toBeInTheDocument();
    expect(screen.getByText("A/T 差异描述压力和反馈校准方式，不是能力排序。")).toBeInTheDocument();
    expect(screen.getByText("优势")).toBeInTheDocument();
    expect(screen.getByText("把复杂问题整理成可行动线索")).toBeInTheDocument();
    expect(screen.getByText("注意风险")).toBeInTheDocument();
    expect(screen.getByText("A/T 场景差异")).toBeInTheDocument();
    expect(screen.getByText("工作决策场景")).toBeInTheDocument();
    expect(screen.getByText("关系与沟通场景")).toBeInTheDocument();
    expect(screen.getByText("压力与成长")).toBeInTheDocument();
    expect(screen.getByText("深度解读模块")).toBeInTheDocument();
    expect(screen.getByText("01｜先理解这个类型")).toBeInTheDocument();
    expect(screen.getByText("INTJ-A 人格是什么意思？")).toBeInTheDocument();
    expect(screen.getByText("免费 16 型人格测试")).toBeInTheDocument();
    expect(screen.queryByText("账号中心")).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("/account");
    expect(extractPersonalityFaqItems(sections)).toEqual([
      {
        question: "INTJ-A 人格是什么意思？",
        answer: "它描述一种判断、压力和沟通偏好，不是诊断或命运结论。",
      },
    ]);
  });

  it("renders promoted MBTI64 comparison content, FAQ, boundaries, and safe related-test links", () => {
    const sections = [
      cmsSection({
        sectionKey: "mbti64_comparison_a_vs_t",
        title: "INTJ-A vs INTJ-T",
        renderVariant: "rich_text",
        bodyMd: "Fallback comparison summary",
        payloadJson: {
          content: {
            quick_answer: "INTJ-A and INTJ-T share the same INTJ core; A/T changes confidence and stress response.",
            side_by_side_summary: {
              h2: "INTJ-A vs INTJ-T at a glance",
              rows: [
                {
                  dimension: "Decision confidence",
                  a_variant: "Commits when the strategy is good enough.",
                  t_variant: "Re-checks assumptions before committing.",
                },
              ],
            },
            core_traits_comparison: {
              h2: "What stays the same",
              body: "Both variants stay strategic, independent and systems-oriented.",
            },
          },
          faq: [
            {
              question: "Is INTJ-A better than INTJ-T?",
              answer: "No. They describe different operating styles around the same type core.",
            },
          ],
          internal_links: [
            {
              href: "/en/personality/intj-a",
              anchor_text: "Read INTJ-A",
              role: "sibling_variant",
              safe_public_route: true,
            },
            {
              href: "/en/tests/holland-career-interest-test-riasec",
              anchor_text: "Explore Holland/RIASEC",
              role: "related_test",
              safe_public_route: true,
            },
            {
              href: "/en/account",
              anchor_text: "Account",
              role: "account",
              safe_public_route: false,
            },
          ],
          raw_row: {
            method_boundary: "Use this as structured self-reflection, not as a hiring or clinical tool.",
            trademark_boundary: "A/T is treated as an interpretation layer, not the four-letter core code.",
          },
        },
      }),
    ];

    const { container } = render(<div>{renderPersonalitySections(sections, "en")}</div>);

    expect(screen.getByRole("heading", { level: 2, name: "A/T comparison" })).toBeInTheDocument();
    expect(screen.getByText("INTJ-A vs INTJ-T at a glance")).toBeInTheDocument();
    expect(screen.getByText("Decision confidence")).toBeInTheDocument();
    expect(screen.getByText("Commits when the strategy is good enough.")).toBeInTheDocument();
    expect(screen.getByText("Is INTJ-A better than INTJ-T?")).toBeInTheDocument();
    expect(screen.getByText("Read INTJ-A")).toBeInTheDocument();
    expect(screen.getByText("Explore Holland/RIASEC")).toBeInTheDocument();
    expect(screen.getByText("Method boundary")).toBeInTheDocument();
    expect(screen.getByText("Trademark and framework boundary")).toBeInTheDocument();
    expect(screen.queryByText("Account")).not.toBeInTheDocument();
    expect(container.innerHTML).not.toContain("/account");
    expect(container.innerHTML).not.toContain("/results/lookup");
    expect(extractPersonalityFaqItems(sections)).toEqual([
      {
        question: "Is INTJ-A better than INTJ-T?",
        answer: "No. They describe different operating styles around the same type core.",
      },
    ]);
  });

  it("omits unsafe internal links and keeps safe public related-test links", () => {
    const links = buildPersonalitySectionLinks(
      cmsSection({
        sectionKey: "related_content",
        renderVariant: "links",
        payloadJson: {
          links: [
            { href: "/en/tests/mbti-personality-test-16-personality-types", anchor_text: "MBTI test", safe_public_route: true },
            { href: "/en/tests/big-five-personality-test-ocean-model", anchor_text: "Big Five test", safe_public_route: true },
            { href: "/en/tests/holland-career-interest-test-riasec", anchor_text: "RIASEC test", safe_public_route: true },
            { href: "/en/results/lookup?result_id=abc", anchor_text: "Result lookup", safe_public_route: true },
            { href: "/en/orders/lookup", anchor_text: "Order lookup", safe_public_route: false },
          ],
        },
      }),
      "en"
    );

    expect(links).toEqual([
      { title: "MBTI test", href: "/en/tests/mbti-personality-test-16-personality-types", summary: "" },
      { title: "Big Five test", href: "/en/tests/big-five-personality-test-ocean-model", summary: "" },
      { title: "RIASEC test", href: "/en/tests/holland-career-interest-test-riasec", summary: "" },
    ]);
  });
});
