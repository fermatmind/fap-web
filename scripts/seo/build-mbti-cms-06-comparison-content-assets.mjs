#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const GENERATED_AT = "2026-07-04T07:45:00.000Z";
const OUT_JSON = "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.json";
const OUT_MD = "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.md";
const OUT_CSV = "docs/seo/personality/mbti-cms-06-comparison-content-assets-2026-07-04.csv";

const typeInfo = {
  INTJ: { zh: "建筑师", focus: "长期系统、独立判断和结构化推进" },
  INTP: { zh: "逻辑学家", focus: "概念建模、分析推理和独立解题" },
  ENTJ: { zh: "指挥官", focus: "目标拆解、组织推进和决策责任" },
  ENTP: { zh: "辩论家", focus: "机会试探、快速验证和观点碰撞" },
  INFJ: { zh: "提倡者", focus: "意义洞察、长期关系和价值边界" },
  INFP: { zh: "调停者", focus: "价值感受、个人表达和内在一致性" },
  ENFJ: { zh: "主人公", focus: "群体协调、价值鼓励和关系动员" },
  ENFP: { zh: "竞选者", focus: "可能性探索、表达连接和创意启动" },
  ISTJ: { zh: "物流师", focus: "事实核对、责任秩序和稳定执行" },
  ISFJ: { zh: "守卫者", focus: "经验照顾、现实支持和可靠维护" },
  ESTJ: { zh: "总经理", focus: "规则执行、资源调度和现场管理" },
  ESFJ: { zh: "执政官", focus: "关系照顾、共同标准和实际支持" },
  ISTP: { zh: "鉴赏家", focus: "动手试错、工具判断和现实排障" },
  ISFP: { zh: "探险家", focus: "体验审美、安静表达和现场选择" },
  ESTP: { zh: "企业家", focus: "即时行动、现实机会和现场影响" },
  ESFP: { zh: "表演者", focus: "当下互动、表达感染和体验带动" },
};

const atTargets = Object.keys(typeInfo).map((type) => ({
  page_type: "at_comparison",
  left: `${type}-A`,
  right: `${type}-T`,
  path: `/zh/personality/${type.toLowerCase()}-a-vs-${type.toLowerCase()}-t`,
}));

const hotTargets = [
  { page_type: "hot_comparison", left: "INTJ", right: "INTP", path: "/zh/personality/intj-vs-intp", reason: "战略建模 vs 逻辑拆解" },
  { page_type: "hot_comparison", left: "ENTJ", right: "INTJ", path: "/zh/personality/entj-vs-intj", reason: "外部推进 vs 内部建模" },
  { page_type: "hot_comparison", left: "INFJ", right: "INFP", path: "/zh/personality/infj-vs-infp", reason: "意义洞察 vs 价值感受" },
  { page_type: "hot_comparison", left: "ISTJ", right: "ISFJ", path: "/zh/personality/istj-vs-isfj", reason: "事实秩序 vs 经验照顾" },
];

function baseType(code) {
  return code.replace(/-[AT]$/, "");
}

function label(code) {
  const base = baseType(code);
  const info = typeInfo[base];
  return code.includes("-") ? `${code} ${info.zh}` : `${code} ${info.zh}`;
}

function comparisonTitle(target) {
  if (target.page_type === "at_comparison") {
    const base = baseType(target.left);
    return `${target.left} 和 ${target.right} 的区别：${typeInfo[base].zh} A/T 对比 | FermatMind`;
  }
  return `${target.left} 和 ${target.right} 的区别：${target.reason} | FermatMind`;
}

function h1(target) {
  if (target.page_type === "at_comparison") {
    const base = baseType(target.left);
    return `${target.left} 和 ${target.right} 的区别：${typeInfo[base].zh} A/T 对比`;
  }
  return `${target.left} 和 ${target.right} 的区别：${target.reason}`;
}

function answerBlock(target) {
  if (target.page_type === "at_comparison") {
    const base = baseType(target.left);
    const info = typeInfo[base];
    return `${target.left} 和 ${target.right} 共享 ${base} ${info.zh}的核心偏好，差异主要体现在自我确认、反馈敏感度、压力复盘和行动前需要多少外部校准。${target.left} 更适合观察稳定自信和快速恢复，${target.right} 更适合观察谨慎复盘和风险扫描。这个对比不用于判断优劣、诊断、招聘或关系结论，只用于帮助用户理解 ${info.focus} 在压力和反馈中的不同表现。`;
  }
  const left = typeInfo[target.left];
  const right = typeInfo[target.right];
  return `${target.left} 和 ${target.right} 的最大区别不只是一个字母不同，而是现实场景中的注意力入口、判断节奏和推进方式不同。${target.left} 更需要从${left.focus}理解，${target.right} 更需要从${right.focus}理解。这个页面应帮助用户快速判断差异、避免把相似的高频词当成同一种人格，并把对比结果连接回测试、单人格页和具体工作/关系场景。`;
}

function quickRows(target) {
  if (target.page_type === "at_comparison") {
    return [
      { dimension: "最大区别", left: "更稳定地确认自己的判断", right: "更频繁复盘风险和反馈" },
      { dimension: "压力反应", left: "先保持节奏，再根据证据修正", right: "先扫描问题，再寻找更稳妥方案" },
      { dimension: "容易误判", left: "被误读为固执或过度自信", right: "被误读为犹豫或不够坚定" },
      { dimension: "使用边界", left: "不能替代能力、职业或关系判断", right: "不能替代能力、职业或关系判断" },
    ];
  }
  const left = typeInfo[target.left];
  const right = typeInfo[target.right];
  return [
    { dimension: "最大区别", left: left.focus, right: right.focus },
    { dimension: "信息入口", left: "先看目标、结构或外部推进线索", right: "先看模型、价值或经验中的关键矛盾" },
    { dimension: "容易误判", left: `把 ${target.left} 的高效率误读成同一种深度判断`, right: `把 ${target.right} 的谨慎或内在判断误读成低行动力` },
    { dimension: "使用边界", left: "只解释偏好，不替代能力证明", right: "只解释偏好，不替代能力证明" },
  ];
}

function modulesFor(target) {
  const rows = quickRows(target);
  return [
    {
      key: "biggest_difference",
      required: true,
      body: answerBlock(target),
    },
    {
      key: "quick_judgment_table",
      required: true,
      body: rows.map((row) => `${row.dimension}：${target.left}=${row.left}；${target.right}=${row.right}`).join("；"),
      rows,
    },
    {
      key: "easy_misread",
      required: true,
      body: `${target.left} 和 ${target.right} 容易被混淆，是因为用户常只看字母、标签或单一行为。更稳妥的写法应把差异放回任务压力、反馈节奏、沟通场景和长期选择里解释。`,
    },
    {
      key: "real_scenario_differences",
      required: true,
      body: `在工作中比较决策节奏、协作方式和复盘习惯；在关系中比较表达需求、处理边界和修复误会；在压力中比较先行动还是先校准。页面应给出场景差异，不给出确定性结论。`,
    },
    {
      key: "do_not_misjudge",
      required: true,
      body: `不要把 ${target.left} 写成更好，也不要把 ${target.right} 写成更差。不要把人格对比用于诊断、招聘筛选、伴侣裁决或能力排名；页面只提供观察语言和沟通线索。`,
    },
    {
      key: "faq",
      required: true,
      body: "FAQ 应覆盖最大区别、适合谁、如何快速判断、常见误区、是否能替代测试，以及 A/T 或跨类型对比的安全边界，并明确不做医学、招聘或关系结论。",
    },
  ];
}

function faqFor(target) {
  return [
    {
      question: `${target.left} 和 ${target.right} 最大区别是什么？`,
      answer: target.page_type === "at_comparison"
        ? `${target.left} 和 ${target.right} 共享同一个基础类型，最大区别主要在自我确认、反馈敏感度、压力复盘和行动前校准方式。`
        : `${target.left} 和 ${target.right} 的最大区别要放在真实任务、关系和压力场景中看，不应只根据一个字母或单个标签判断。`,
    },
    {
      question: `怎么快速判断自己更像 ${target.left} 还是 ${target.right}？`,
      answer: "先记录最近三类场景：做决定时先看什么、收到反馈后怎么复盘、压力下先行动还是先校准。再结合完整测试结果和长期反馈判断。",
    },
    {
      question: `${target.left} 和 ${target.right} 哪个更好？`,
      answer: "没有更好或更差。不同风格在不同任务、关系和压力环境下各有成本与优势，页面只能帮助理解差异。",
    },
    {
      question: `这个对比可以替代 MBTI 测试吗？`,
      answer: "不能。对比页适合解释差异和建立判断线索，个人结果仍应结合测试、报告、真实经历和持续反馈。",
    },
    {
      question: `这个对比可以用于招聘或诊断吗？`,
      answer: "不能。人格对比不是医学诊断、招聘筛选、能力证明或关系裁决工具，只能作为自我理解和沟通参考。",
    },
  ];
}

function linksFor(target) {
  const leftBase = baseType(target.left).toLowerCase();
  const rightBase = baseType(target.right).toLowerCase();
  const links = [
    { href: "/zh/personality", anchor_text: "MBTI人格", purpose: "hub_return", safe_public_route: true },
    { href: "/zh/tests/mbti-personality-test-16-personality-types", anchor_text: "MBTI免费测试", purpose: "test_loop", safe_public_route: true },
  ];
  if (target.page_type === "at_comparison") {
    links.push(
      { href: `/zh/personality/${leftBase}-a`, anchor_text: target.left, purpose: "left_variant", safe_public_route: true },
      { href: `/zh/personality/${leftBase}-t`, anchor_text: target.right, purpose: "right_variant", safe_public_route: true },
      { href: `/zh/personality/${leftBase}`, anchor_text: baseType(target.left), purpose: "base_type_if_available", safe_public_route: true },
    );
  } else {
    links.push(
      { href: `/zh/personality/${leftBase}-a`, anchor_text: `${target.left}-A`, purpose: "left_variant_a", safe_public_route: true },
      { href: `/zh/personality/${rightBase}-a`, anchor_text: `${target.right}-A`, purpose: "right_variant_a", safe_public_route: true },
      { href: `/zh/personality/${leftBase}-a-vs-${leftBase}-t`, anchor_text: `${target.left}-A vs ${target.left}-T`, purpose: "left_at_comparison", safe_public_route: true },
      { href: `/zh/personality/${rightBase}-a-vs-${rightBase}-t`, anchor_text: `${target.right}-A vs ${target.right}-T`, purpose: "right_at_comparison", safe_public_route: true },
    );
  }
  return links;
}

function packageTarget(target, index) {
  const modules = modulesFor(target);
  return {
    asset_id: `mbti-cms-06:${target.path}`,
    priority_rank: index + 1,
    target_url: `https://fermatmind.com${target.path}`,
    path: target.path,
    framework: "mbti_comparison",
    locale: "zh-CN",
    page_type: target.page_type,
    comparison_pair: {
      left: target.left,
      right: target.right,
      left_label: label(target.left),
      right_label: label(target.right),
    },
    cms_fields: {
      title: comparisonTitle(target),
      h1: h1(target),
      meta_description: `系统对比 ${target.left} 与 ${target.right} 的最大区别、快速判断、容易误判、真实场景差异、使用边界和 FAQ。内容用于 MBTI 自我理解与沟通校准，不用于诊断、招聘或关系裁决。`,
      answer_block: answerBlock(target),
      modules,
      quick_judgment_table: quickRows(target),
      faq: faqFor(target),
      internal_links: linksFor(target),
    },
    handoff_policy: {
      cms_review_required: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      db_migration_attempted: false,
      frontend_runtime_change_attempted: false,
      frontend_local_editorial_fallback_added: false,
    },
  };
}

const targets = [...atTargets, ...hotTargets];
const assets = targets.map(packageTarget);

const report = {
  artifact: "MBTI-CMS-06-COMPARISON-CONTENT-ASSETS",
  generated_at: GENERATED_AT,
  status: "ready_for_cms_review_no_production_write",
  final_decision: "PASS_NON_PRODUCTION_COMPARISON_CONTENT_ASSET_PACKAGE_READY_FOR_CMS_REVIEW",
  input_artifacts: {
    previous_top_profile_package: "docs/seo/personality/mbti-cms-04-top-profile-content-assets-2026-07-04.json",
    comparison_frontend_template_pr: "MBTI-SEO-05",
  },
  selection_policy: {
    scope: "16 Chinese A/T comparison pages plus four hot cross-type comparison pages requested for MBTI SEO/GEO P1.",
    excludes: [
      "production CMS writes",
      "DB migrations",
      "frontend runtime renderer changes",
      "sitemap/llms URL expansion",
    ],
    note: "This artifact packages draft CMS fields only. Publishing requires an explicit backend/CMS import PR or approval-gated CMS operation.",
  },
  summary: {
    target_count: assets.length,
    at_comparison_pages: assets.filter((item) => item.page_type === "at_comparison").length,
    hot_comparison_pages: assets.filter((item) => item.page_type === "hot_comparison").length,
    modules_per_page: 6,
    faq_per_page: 5,
    quick_judgment_rows_per_page: 4,
    internal_links_min: 5,
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
};

const md = [
  "# MBTI-CMS-06 Comparison Content Assets",
  "",
  `Generated: ${GENERATED_AT}`,
  "",
  "## Scope",
  "",
  "- Non-production CMS review package only.",
  "- Covers 16 A/T comparison pages and four hot cross-type comparison pages.",
  "- No production CMS write, DB migration, sitemap/llms mutation, frontend runtime change, or search submission.",
  "",
  "## Targets",
  "",
  ...assets.map((item) => `- ${item.path}: ${item.cms_fields.h1}; modules=${item.cms_fields.modules.length}; faq=${item.cms_fields.faq.length}; links=${item.cms_fields.internal_links.length}`),
  "",
  "## Required CMS Modules Per Page",
  "",
  ...["biggest_difference", "quick_judgment_table", "easy_misread", "real_scenario_differences", "do_not_misjudge", "faq"].map((key) => `- ${key}`),
  "",
  "## Next Step",
  "",
  "Review this package, then run a separate backend/CMS-authoritative import workflow only after explicit approval.",
  "",
].join("\n");

const csvRows = [
  [
    "priority_rank",
    "path",
    "page_type",
    "left",
    "right",
    "module_count",
    "faq_count",
    "quick_judgment_rows",
    "internal_link_count",
  ],
  ...assets.map((item) => [
    item.priority_rank,
    item.path,
    item.page_type,
    item.comparison_pair.left,
    item.comparison_pair.right,
    item.cms_fields.modules.length,
    item.cms_fields.faq.length,
    item.cms_fields.quick_judgment_table.length,
    item.cms_fields.internal_links.length,
  ]),
];

fs.mkdirSync(path.join(ROOT, "docs/seo/personality"), { recursive: true });
fs.writeFileSync(path.join(ROOT, OUT_JSON), `${JSON.stringify(report, null, 2)}\n`);
fs.writeFileSync(path.join(ROOT, OUT_MD), md);
fs.writeFileSync(path.join(ROOT, OUT_CSV), `${csvRows.map((row) => row.join(",")).join("\n")}\n`);

console.log(JSON.stringify({
  ok: true,
  artifact: report.artifact,
  output_json: OUT_JSON,
  output_md: OUT_MD,
  output_csv: OUT_CSV,
  target_count: report.summary.target_count,
  at_comparison_pages: report.summary.at_comparison_pages,
  hot_comparison_pages: report.summary.hot_comparison_pages,
  final_decision: report.final_decision,
}));
