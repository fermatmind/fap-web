#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-04T06:08:17.376Z";
const OUT_JSON = "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json";
const OUT_MD = "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.md";
const OUT_CSV = "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.csv";

const sourceArtifacts = {
  priority_ranker: "docs/seo/personality/mbti64-agent-priority-ranker-2026-06-23.csv",
  page_snapshot: "docs/seo/personality/mbti64-gsc-performance-page-snapshot-2026-06-22.csv",
  existing_recommendations: "docs/seo/personality/personality-agent-operations-next-batch-recommendations-2026-06-25.json",
};

const profiles = [
  {
    priority_rank: 1,
    path: "/zh/personality/intp-a",
    target_url: "https://fermatmind.com/zh/personality/intp-a",
    locale: "zh-CN",
    mbti_type: "INTP",
    variant: "A",
    archetype: "逻辑学家",
    base_focus: "分析、概念建模和独立解题",
    variant_focus: "更稳定地推进自己的判断，较少反复寻求外部确认",
    impressions: 9,
    clicks: 0,
    average_position: 12.7,
    keyword_opportunity: ["intp a", "intp-a", "intp-a 人格"],
  },
  {
    priority_rank: 2,
    path: "/zh/personality/esfp-a",
    target_url: "https://fermatmind.com/zh/personality/esfp-a",
    locale: "zh-CN",
    mbti_type: "ESFP",
    variant: "A",
    archetype: "表演者",
    base_focus: "现场感、表达力和即时互动",
    variant_focus: "更容易把当下反馈转化为行动，而不是长时间纠结外部评价",
    impressions: 1,
    clicks: 0,
    average_position: 7,
    keyword_opportunity: ["esfp-a", "esfp-a 人格"],
  },
  {
    priority_rank: 3,
    path: "/en/personality/enfj-a",
    target_url: "https://fermatmind.com/en/personality/enfj-a",
    locale: "en",
    mbti_type: "ENFJ",
    variant: "A",
    archetype: "Protagonist",
    base_focus: "people leadership, values alignment, and group momentum",
    variant_focus: " steadier self-trust when coordinating others and absorbing feedback",
    impressions: 21,
    clicks: 0,
    average_position: 26.9,
    keyword_opportunity: ["enfj-a", "enfj a personality"],
  },
  {
    priority_rank: 4,
    path: "/zh/personality/istp-a",
    target_url: "https://fermatmind.com/zh/personality/istp-a",
    locale: "zh-CN",
    mbti_type: "ISTP",
    variant: "A",
    archetype: "鉴赏家",
    base_focus: "动手试错、工具感和现实问题拆解",
    variant_focus: "更倾向于相信自己的现场判断，并在压力下保持操作节奏",
    impressions: 7,
    clicks: 0,
    average_position: 7.3,
    keyword_opportunity: ["istp-a", "istp-a 人格"],
  },
  {
    priority_rank: 5,
    path: "/zh/personality/esfj-a",
    target_url: "https://fermatmind.com/zh/personality/esfj-a",
    locale: "zh-CN",
    mbti_type: "ESFJ",
    variant: "A",
    archetype: "执政官",
    base_focus: "照顾秩序、关系维护和责任分配",
    variant_focus: "更能在既定关系网络中保持稳定自信，不轻易被短期评价带偏",
    impressions: 1,
    clicks: 0,
    average_position: 8,
    keyword_opportunity: ["esfj-a", "esfj-a 人格"],
  },
  {
    priority_rank: 6,
    path: "/en/personality/esfj-t",
    target_url: "https://fermatmind.com/en/personality/esfj-t",
    locale: "en",
    mbti_type: "ESFJ",
    variant: "T",
    archetype: "Consul",
    base_focus: "relationship maintenance, shared standards, and practical support",
    variant_focus: "more frequent self-review when group expectations or feedback shift",
    impressions: 15,
    clicks: 0,
    average_position: 26.7,
    keyword_opportunity: ["esfj-t", "esfj t personality"],
  },
  {
    priority_rank: 7,
    path: "/en/personality/intp-a",
    target_url: "https://fermatmind.com/en/personality/intp-a",
    locale: "en",
    mbti_type: "INTP",
    variant: "A",
    archetype: "Logician",
    base_focus: "analysis, model building, and independent problem solving",
    variant_focus: "steadier confidence in chosen hypotheses and less repeated reassurance seeking",
    impressions: 1,
    clicks: 0,
    average_position: 9,
    keyword_opportunity: ["intp-a", "intp a personality"],
  },
  {
    priority_rank: 8,
    path: "/en/personality/istp-a",
    target_url: "https://fermatmind.com/en/personality/istp-a",
    locale: "en",
    mbti_type: "ISTP",
    variant: "A",
    archetype: "Virtuoso",
    base_focus: "hands-on troubleshooting, tools, and direct experimentation",
    variant_focus: "more confidence in in-the-moment judgment under practical pressure",
    impressions: 1,
    clicks: 0,
    average_position: 11,
    keyword_opportunity: ["istp-a", "istp a personality"],
  },
  {
    priority_rank: 9,
    path: "/en/personality/enfp-a",
    target_url: "https://fermatmind.com/en/personality/enfp-a",
    locale: "en",
    mbti_type: "ENFP",
    variant: "A",
    archetype: "Campaigner",
    base_focus: "possibility scanning, expression, and energizing new ideas",
    variant_focus: "more stable self-direction when many options or social reactions compete",
    impressions: 10,
    clicks: 0,
    average_position: 38.4,
    keyword_opportunity: ["enfp-a", "enfp a personality"],
  },
  {
    priority_rank: 10,
    path: "/zh/personality/istj-a",
    target_url: "https://fermatmind.com/zh/personality/istj-a",
    locale: "zh-CN",
    mbti_type: "ISTJ",
    variant: "A",
    archetype: "物流师",
    base_focus: "秩序、责任、事实核对和稳定执行",
    variant_focus: "更能坚持既定标准，并在反馈出现时先按证据复核",
    impressions: 23,
    clicks: 1,
    average_position: 9,
    keyword_opportunity: ["istj-a", "istj-a人格", "istj a"],
  },
];

function isZh(locale) {
  return locale === "zh-CN";
}

function siblingPath(profile) {
  return profile.path.replace(/-[at]$/i, profile.variant === "A" ? "-t" : "-a");
}

function comparisonPath(profile) {
  const lower = profile.mbti_type.toLowerCase();
  return profile.path.replace(/\/personality\/[^/]+$/, `/personality/${lower}-a-vs-${lower}-t`);
}

function contentFor(profile) {
  const zh = isZh(profile.locale);
  const code = `${profile.mbti_type}-${profile.variant}`;
  const sibling = `${profile.mbti_type}-${profile.variant === "A" ? "T" : "A"}`;
  if (zh) {
    return {
      title: `${code} ${profile.archetype}人格：特点、A/T差异、职业与关系 | FermatMind`,
      h1: `${code} ${profile.archetype}人格特点`,
      meta_description: `系统了解 ${code} 的${profile.base_focus}，以及${profile.variant_focus}。包含适合谁、不适合谁、常见误解、职业、关系、压力场景和 FAQ。`,
      answer_block: `${code} 是 ${profile.mbti_type} 核心人格加上 ${profile.variant} 型身份风格的公开解释页，重点说明${profile.base_focus}，并补充${profile.variant_focus}。阅读时应把它当作测试结果后的解释框架，用来比较个人偏好、压力反应和沟通方式。它适合用于自我理解、沟通校准和测试结果延伸，不适合作为职业录用、诊断或关系结论。`,
      sections: {
        definition: `${code} 不是独立于 ${profile.mbti_type} 的新类型，而是在 ${profile.mbti_type} 的认知与行为偏好上加入 A/T 身份风格视角，用来解释自信稳定度、反馈处理和压力下复盘方式。`,
        suitable_for: `适合已经知道自己可能接近 ${profile.mbti_type}，并希望理解${profile.base_focus}如何影响学习、工作、关系沟通、压力处理和自我复盘的人。`,
        not_suitable_for: `不适合把人格类型当作招聘筛选、医学诊断、伴侣匹配结论或能力证明的人；页面只能提供语言和观察框架，不能替代个人评估或专业判断。`,
        common_misread: `常见误解是把 ${code} 看成永远自信或永远正确。更准确的理解是：它描述反馈和不确定性下的倾向，不代表能力上限、道德水平或固定命运。`,
        base16_difference: `${code} 与 ${profile.mbti_type} 的关系是“基础 16 型 + A/T 身份风格”。基础 16 型解释信息关注和决策偏好，A/T 解释自我确认、压力反应和反馈复盘。`,
        at_difference: `${code} 与 ${sibling} 的主要差异不在兴趣或能力，而在压力后是否更频繁复盘、是否更容易受外界评价牵动，以及行动前需要多少确认。`,
        career_scenarios: `职业场景应围绕${profile.base_focus}来观察任务结构、反馈节奏、协作方式、决策责任和长期成长条件，而不是直接得出职业结论。`,
        relationship_scenarios: `关系场景适合观察表达需求、回应冲突、处理边界和修复误会的方式；不要用 ${code} 给对方贴标签或替代真实沟通与持续反馈。`,
        stress_scenarios: `压力下重点观察${profile.variant_focus}是否让行动更稳定，或是否导致忽视新证据；建议配合具体情境记录，而不是只看类型名。`,
      },
      faq: [
        [`${code} 人格特点是什么？`, `${code} 通常体现为${profile.base_focus}，并在 A/T 维度上呈现${profile.variant_focus}。`],
        [`${code} 适合什么工作？`, `更适合讨论任务环境和工作方式，例如反馈频率、独立度、协作密度和决策责任；不能直接推出职业结论。`],
        [`${code} 和 ${sibling} 有什么不同？`, `主要差异在自我确认、压力反应和反馈复盘方式，而不是基础兴趣、能力或价值高低；判断时应结合真实情境。`],
        [`${code} 在关系中容易被误解什么？`, `容易被简化成固定标签。实际关系仍要看沟通习惯、边界、承诺、冲突修复方式和双方持续反馈。`],
        [`这个页面可以替代 MBTI 测试吗？`, `不能。它是公共解释和内容资产草案，个人结果仍应结合正式测试、完整报告、真实反馈和长期观察。`],
      ],
    };
  }
  return {
    title: `${code} ${profile.archetype} Personality: Traits, A/T Difference, Career and Relationships | FermatMind`,
    h1: `${code} ${profile.archetype} Personality Traits`,
    meta_description: `Understand ${code} through ${profile.base_focus}, ${profile.variant_focus}, fit signals, misreads, A/T differences, career, relationships, stress scenarios, and FAQ.`,
    answer_block: `${code} is a public profile page for the ${profile.mbti_type} core pattern plus the ${profile.variant} identity style. It explains ${profile.base_focus} and ${profile.variant_focus}. Use it for self-understanding and communication calibration, not for hiring, diagnosis, or relationship conclusions.`,
    sections: {
      definition: `${code} is not a separate system from ${profile.mbti_type}; it layers the A/T identity style onto the base type to explain confidence, feedback processing, and pressure recovery.`,
      suitable_for: `Best for readers who already relate to ${profile.mbti_type} and want to understand how ${profile.base_focus} may show up in work, learning, relationships, and stress.`,
      not_suitable_for: `Not suitable as a hiring filter, clinical diagnosis, relationship verdict, or proof of ability. The page provides a language framework only.`,
      common_misread: `A common misread is treating ${code} as permanently confident, fragile, talented, or limited. It describes tendencies under feedback and uncertainty, not fixed capability.`,
      base16_difference: `${code} combines the base ${profile.mbti_type} pattern with an A/T identity style. The base type explains preference patterns; A/T explains confidence, self-review, and pressure response.`,
      at_difference: `${code} differs from ${sibling} mostly in self-confirmation, feedback sensitivity, and how much review is needed before acting, not in worth or ability.`,
      career_scenarios: `Career discussion should focus on task structure, feedback rhythm, autonomy, collaboration, and decision ownership around ${profile.base_focus}, not on deterministic job matching.`,
      relationship_scenarios: `Relationship discussion should focus on needs, boundaries, conflict repair, and communication habits. Do not use ${code} as a label that replaces real conversation.`,
      stress_scenarios: `Under stress, watch whether ${profile.variant_focus} supports steadier action or leads to ignoring new evidence. Pair the profile with concrete situation notes.`,
    },
    faq: [
      [`What are ${code} personality traits?`, `${code} usually combines ${profile.base_focus} with ${profile.variant_focus}.`],
      [`What careers fit ${code}?`, `Use this page to discuss work environments and task patterns, not to make deterministic career decisions.`],
      [`How is ${code} different from ${sibling}?`, `The difference is mainly self-confirmation, pressure response, and feedback review style, not ability or value.`],
      [`What is a common ${code} misconception?`, `A common misconception is turning the type into a fixed label instead of a context-sensitive reflection tool.`],
      [`Can this page replace an MBTI test?`, `No. It is a public explanation and non-production content asset; personal results should come from a full assessment and report.`],
    ],
  };
}

function packageProfile(profile) {
  const content = contentFor(profile);
  return {
    asset_id: `mbti-cms-04:${profile.path}`,
    target_url: profile.target_url,
    path: profile.path,
    framework: "mbti64",
    locale: profile.locale,
    page_type: "variant",
    mbti_type: profile.mbti_type,
    variant: profile.variant,
    archetype: profile.archetype,
    gsc_evidence: {
      impressions: profile.impressions,
      clicks: profile.clicks,
      average_position: profile.average_position,
      keyword_opportunity: profile.keyword_opportunity,
      source_policy: "repo_artifact_snapshot_only_no_live_gsc_call",
    },
    cms_fields: {
      title: content.title,
      h1: content.h1,
      meta_description: content.meta_description,
      answer_block: content.answer_block,
      modules: [
        { key: "definition", required: true, body: content.sections.definition },
        { key: "suitable_for", required: true, body: content.sections.suitable_for },
        { key: "not_suitable_for", required: true, body: content.sections.not_suitable_for },
        { key: "common_misread", required: true, body: content.sections.common_misread },
        { key: "base16_difference", required: true, body: content.sections.base16_difference },
        { key: "at_difference", required: true, body: content.sections.at_difference },
        { key: "career_scenarios", required: true, body: content.sections.career_scenarios },
        { key: "relationship_scenarios", required: true, body: content.sections.relationship_scenarios },
        { key: "stress_scenarios", required: true, body: content.sections.stress_scenarios },
      ],
      faq: content.faq.map(([question, answer]) => ({ question, answer })),
      internal_links: [
        { href: "/zh/personality", anchor_text: "MBTI人格", purpose: "hub_return", safe_public_route: true },
        { href: siblingPath(profile), anchor_text: `${profile.mbti_type}-${profile.variant === "A" ? "T" : "A"}`, purpose: "at_sibling", safe_public_route: true },
        { href: comparisonPath(profile), anchor_text: `${profile.mbti_type}-A vs ${profile.mbti_type}-T`, purpose: "at_comparison", safe_public_route: true },
        { href: profile.locale === "zh-CN" ? "/zh/tests/mbti-personality-test-16-personality-types" : "/en/tests/mbti-personality-test-16-personality-types", anchor_text: "MBTI test", purpose: "test_loop", safe_public_route: true },
        { href: profile.locale === "zh-CN" ? "/zh/personality/intj-vs-intp" : "/en/personality/intj-vs-intp", anchor_text: "INTJ vs INTP", purpose: "hot_comparison", safe_public_route: true },
      ],
    },
    handoff_policy: {
      artifact_only: true,
      cms_write_required_before_publish: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      frontend_runtime_change_attempted: false,
      sitemap_llms_mutation_attempted: false,
      search_submission_attempted: false,
    },
  };
}

const assets = profiles.map(packageProfile);
const report = {
  artifact: "MBTI-CMS-04-TOP-PROFILE-CONTENT-ASSETS",
  generated_at: GENERATED_AT,
  status: "ready_for_cms_review_no_production_write",
  final_decision: "PASS_NON_PRODUCTION_CONTENT_ASSET_PACKAGE_READY_FOR_CMS_REVIEW",
  input_artifacts: sourceArtifacts,
  selection_policy: {
    scope: "Top 10 exposed MBTI64 single personality pages from repo GSC/priority artifacts.",
    excludes: ["comparison pages", "production CMS writes", "DB migrations", "frontend runtime renderer changes"],
    note: "This artifact packages draft CMS fields only. Publishing requires an explicit backend/CMS import PR or approval-gated CMS operation.",
  },
  summary: {
    target_count: assets.length,
    variant_pages: assets.length,
    comparison_pages: 0,
    zh_pages: assets.filter((item) => item.locale === "zh-CN").length,
    en_pages: assets.filter((item) => item.locale === "en").length,
    modules_per_page: 9,
    faq_per_page: 5,
    internal_links_min: Math.min(...assets.map((item) => item.cms_fields.internal_links.length)),
  },
  assets,
  safety_boundary: {
    artifact_only: true,
    cms_write_attempted: false,
    production_import_attempted: false,
    db_migration_attempted: false,
    frontend_runtime_change_attempted: false,
    frontend_local_editorial_fallback_added: false,
    sitemap_llms_mutation_attempted: false,
    gsc_api_call_attempted: false,
    search_submission_attempted: false,
    production_deploy_attempted: false,
  },
  blockers: [],
  recommended_next_tasks: {
    cms_review: "Review MBTI-CMS-04 package in docs/seo/personality before any backend CMS import.",
    import: "Create a separate backend/CMS-authoritative import PR or approval-gated CMS operation if these fields are approved.",
    followup_frontend: "MBTI-SEO-05 comparison template refresh remains separate.",
  },
};

const csvHeader = [
  "priority_rank",
  "path",
  "locale",
  "mbti_type",
  "variant",
  "archetype",
  "impressions",
  "clicks",
  "average_position",
  "module_count",
  "faq_count",
  "internal_link_count",
].join(",");
const csvRows = assets.map((item) =>
  [
    item.gsc_evidence ? profiles.find((profile) => profile.path === item.path)?.priority_rank : "",
    item.path,
    item.locale,
    item.mbti_type,
    item.variant,
    item.archetype,
    item.gsc_evidence.impressions,
    item.gsc_evidence.clicks,
    item.gsc_evidence.average_position,
    item.cms_fields.modules.length,
    item.cms_fields.faq.length,
    item.cms_fields.internal_links.length,
  ]
    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
    .join(","),
);

const md = [
  "# MBTI-CMS-04 Top Exposed Personality Content Assets",
  "",
  `Generated: ${report.generated_at}`,
  "",
  "## Scope",
  "",
  "- Non-production CMS review package only.",
  "- No production CMS write, DB migration, sitemap/llms mutation, frontend runtime change, or search submission.",
  "- Covers Top 10 exposed MBTI64 single personality pages from repository GSC/priority artifacts.",
  "",
  "## Targets",
  "",
  ...assets.map(
    (item) =>
      `- ${item.path}: ${item.cms_fields.h1}; modules=${item.cms_fields.modules.length}; faq=${item.cms_fields.faq.length}; links=${item.cms_fields.internal_links.length}`,
  ),
  "",
  "## Required CMS Modules Per Page",
  "",
  "- definition",
  "- suitable_for",
  "- not_suitable_for",
  "- common_misread",
  "- base16_difference",
  "- at_difference",
  "- career_scenarios",
  "- relationship_scenarios",
  "- stress_scenarios",
  "",
  "## Next Step",
  "",
  "Review this package, then run a separate backend/CMS-authoritative import workflow only after explicit approval.",
  "",
].join("\n");

for (const file of [OUT_JSON, OUT_MD, OUT_CSV]) {
  fs.mkdirSync(path.dirname(path.join(ROOT, file)), { recursive: true });
}

fs.writeFileSync(path.join(ROOT, OUT_JSON), JSON.stringify(report, null, 2) + "\n");
fs.writeFileSync(path.join(ROOT, OUT_MD), md);
fs.writeFileSync(path.join(ROOT, OUT_CSV), [csvHeader, ...csvRows].join("\n") + "\n");

console.log(
  JSON.stringify({
    ok: true,
    artifact: report.artifact,
    output_json: OUT_JSON,
    output_md: OUT_MD,
    output_csv: OUT_CSV,
    target_count: assets.length,
    final_decision: report.final_decision,
  }),
);
