#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const DATE = process.env.MBTI_PROFILE_SP_34_DATE ?? "2026-07-13";
const OUTPUT_BASE = `docs/seo/personality/mbti-profile-sp-34-content-package-${DATE}`;
const AUDIT_PATH = "docs/seo/personality/mbti-full-audit-30-inventory-runtime-baseline-2026-07-13.json";
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payment|history|share)(?:\/|$|[?#])/i;
const FORBIDDEN_CLAIM_PATTERN = /(官方MBTI|官方认证|临床级|保证职业|决定命运)/;

const TYPES = {
  istp: { archetype: "鉴赏家", functions: "Ti-Se-Ni-Fe", core: "问题拆解、即时观察和动手验证", definition: "ISTP 往往先观察事物如何运作，再用动手尝试和逻辑拆解寻找有效解法；这不是冷漠或冲动，而是偏好让判断经得起现场反馈。", suitable: "需要故障排查、工具使用、现场应变、技术试验或把复杂问题拆成可验证步骤的场景。", unsuitable: "长期只讨论抽象立场却不允许试验、过度微观管理操作细节，或把快速观察误作必须立即承诺的环境。", misread: "ISTP 的独立处理和简洁表达容易被误读为不关心。成熟表现是说明自己正在验证什么、何时会回应，以及需要哪些实际信息。", baseDifference: "基础 16 型的 ISTP 描述逻辑拆解与现场观察；A/T 仅补充在压力、评价和自我复盘中的节奏，不代表技术能力或情感成熟度。", work: "在技术、产品、维修或问题解决任务中，先明确安全边界、测试条件和可回退方案，再用小实验验证假设。", relationship: "关系里可把需要独处、处理问题的方式和回复节奏说清楚；实际帮助应配合明确沟通，避免让沉默替代说明。", stress: "压力下可能过度独自处理、推迟表达或把情绪问题当成纯技术问题。先区分事实、感受和可请求的支持，再决定下一步。", comparison: "/zh/personality/intj-vs-intp" },
  isfp: { archetype: "探险家", functions: "Fi-Se-Ni-Te", core: "真实感受、当下体验和审美表达", definition: "ISFP 常从真实感受、当下体验和个人价值出发回应环境，并通过具体行动或审美表达形成选择；这不是缺乏规划，而是偏好先确认什么对自己真实重要。", suitable: "需要审美判断、体验设计、细致照顾、创作实践或在具体情境中感知他人需要的场景。", unsuitable: "长期否定个人价值与感受、以统一标准压缩表达，或要求在信息不足时作出不可逆承诺的环境。", misread: "ISFP 的低调和随和容易被误读为没有方向。成熟表现是把在乎的事转成可说明的选择、界限和行动，而不是只在压力后退出。", baseDifference: "基础 16 型的 ISFP 描述价值感受与具体体验；A/T 只补充反馈、压力和自我确认的节奏，不衡量艺术感、善意或能力。", work: "在设计、服务、创作或支持型工作中，把直觉体验转成受众、限制、样例和反馈，既保留真实感也形成可交付成果。", relationship: "关系中可直接说明喜欢什么、哪里不舒服和希望怎样被支持；温和表达边界比回避冲突更能保护真实连接。", stress: "压力下可能回避高压表达、沉浸在即时体验或延迟处理问题。选择一个可逆的小行动，并找可信的人讨论实际影响。", comparison: "/zh/personality/infj-vs-infp" },
  estp: { archetype: "企业家", functions: "Se-Ti-Fe-Ni", core: "现场行动、机会判断和快速协商", definition: "ESTP 常从当前可见的信息、机会与实际反馈中快速行动，并通过试探和协商调整方向；这不是鲁莽，而是偏好在行动中获得更真实的判断。", suitable: "需要现场协商、机会识别、销售沟通、快速迭代或在变化中做出可调整决定的场景。", unsuitable: "完全没有行动空间、长期只允许纸面推演，或把风险、权限和后果交代不清却要求立即拍板的环境。", misread: "ESTP 的行动快和表达直接容易被误读为只追求刺激。成熟表现是把机会判断与风险边界、承诺和后续复盘放在一起。", baseDifference: "基础 16 型的 ESTP 描述现场行动与机会判断；A/T 仅补充面对质疑、压力和自我调节时的节奏，不代表勇气或商业能力。", work: "在业务、谈判、项目试点或现场运营中，用小范围试验验证机会，同时明确权限、止损条件和交接责任。", relationship: "关系里可把直率和尊重并行：表达想法后留出对方回应时间，并说明哪些承诺是当下意向、哪些是确定安排。", stress: "压力下可能加快行动、忽略长期影响或把冲突当作即时胜负。先暂停确认代价、同意和可回退空间，再继续推进。", comparison: "/zh/personality/entj-vs-intj" },
  esfp: { archetype: "表演者", functions: "Se-Fi-Te-Ni", core: "体验连接、热情表达和实际带动", definition: "ESFP 常从当下体验、人际连接和真实热情中带动行动，倾向让抽象想法变得可感知、可参与；这不是只追求关注，而是偏好在具体互动中建立动力。", suitable: "需要客户体验、活动组织、服务沟通、创意呈现或把团队能量转为具体参与的场景。", unsuitable: "长期隔离人际反馈、把情绪表达一概视为问题，或要求在没有体验和信息时独自完成高度抽象决策的环境。", misread: "ESFP 的外向热情容易被误读为缺少深度。成熟表现是把热情落实为可靠承诺，也在需要时为长期后果留出考虑时间。", baseDifference: "基础 16 型的 ESFP 描述体验连接和实际表达；A/T 只补充对评价、压力和自我确认的反应节奏，不代表社交价值或表演能力。", work: "在服务、体验、销售或创意协作中，把现场洞察记录为受众需求、可执行动作和复盘指标，让热情形成连续改进。", relationship: "关系里可以直接表达喜欢、期待和担忧，同时尊重对方的恢复节奏与边界；持续的回应比即时热情更能建立信任。", stress: "压力下可能依赖即时刺激、回避不舒服的对话或过度迎合气氛。为重要问题安排一个安静复盘点，并把感受转成具体请求。", comparison: "/zh/personality/infj-vs-infp" },
};

const VARIANTS = {
  A: {
    label: "坚定型",
    rhythm: "更容易在反馈后恢复判断，并用可行版本继续推进",
    difference: "A 型常更快回到自己的判断与下一步。优势是减少反复内耗；风险是把一次稳定感误当作证据充分，因此仍要保留反证和外部反馈入口。",
    suitablePrefix: "当任务需要在不确定中维持节奏时，",
    stress: "先检查是否把自我确认变成忽略他人输入；保留一个能挑战当前判断的证据入口。",
  },
  T: {
    label: "谨慎型",
    rhythm: "更容易在反馈和压力下追加复盘、修正与风险检查",
    difference: "T 型常更主动地重新检查标准、漏洞和外部评价。优势是提高校准质量；风险是让复盘拖延行动，因此需要设定足够好的证据阈值。",
    suitablePrefix: "当任务需要细致复核和风险校准时，",
    stress: "先检查是否把必要的复盘变成无限加码；设置明确的决策截止点和可逆的下一步。",
  },
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function write(relativePath, value) {
  const absolute = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, value);
}

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8"));
}

function auditRecordMap() {
  return new Map(readJson(AUDIT_PATH).records.map((record) => [record.slug, record]));
}

function safeLink(href, label, reason) {
  assert(href.startsWith("/zh/"), `non-zh internal route: ${href}`);
  assert(!PRIVATE_PATH_PATTERN.test(href), `private internal route: ${href}`);
  return { href, label, reason, safe_public_route: true };
}

function buildAsset(base, variant, audit) {
  const type = TYPES[base];
  const mode = VARIANTS[variant];
  const code = `${base.toUpperCase()}-${variant}`;
  const siblingVariant = variant === "A" ? "T" : "A";
  const sibling = `${base}-${siblingVariant.toLowerCase()}`;
  const comparison = `${base}-a-vs-${base}-t`;
  const directAnswer = `${code} 是 ${type.archetype} 型 ${base.toUpperCase()} 的 ${mode.label}表达。它更常围绕${type.core}展开；在反馈与压力下，${mode.rhythm}。这是一种用于自我观察、沟通和成长复盘的偏好语言，不用于诊断、招聘筛选或替代具体选择。`;
  const faq = [
    {
      question: `${code} 是什么意思？`,
      answer: `${code} 指 ${base.toUpperCase()} 的 ${mode.label}表达，关注的是${type.core}与反馈、压力下的自我调节节奏，而不是固定身份或能力结论。`,
    },
    {
      question: `${code} 和 ${base.toUpperCase()}-${siblingVariant} 最大差别是什么？`,
      answer: `${code} 的差异主要在面对质疑、压力和自我确认时的节奏。${mode.difference}两者都应结合具体情境、经验和反馈理解。`,
    },
    {
      question: `${code} 适合什么工作？`,
      answer: `${mode.suitablePrefix}${type.suitable}但职业选择还取决于技能、兴趣、训练、机会和团队环境，不能只根据人格类型决定。`,
    },
    {
      question: `${code} 常被误解为什么？`,
      answer: type.misread,
    },
    {
      question: `${code} 在关系中应注意什么？`,
      answer: type.relationship,
    },
    {
      question: `A/T 能用于诊断、招聘或判断能力吗？`,
      answer: `不能。${code} 页面只把 A/T 作为压力、反馈和自我调节的观察语言，不构成临床诊断、招聘筛选、智力判断或关系预测。`,
    },
  ];
  const expandedFaq = faq.map((item) => ({
    ...item,
    answer: `${item.answer}具体表现仍应结合长期行为、情境与真实反馈理解。`,
  }));
  const links = [
    safeLink(`/zh/personality/${sibling}`, `${base.toUpperCase()}-${siblingVariant}`, "同一基础类型的另一种 A/T 表达"),
    safeLink(`/zh/personality/${comparison}`, `${base.toUpperCase()}-A 与 ${base.toUpperCase()}-T 对比`, "进入同类型 A/T 对比页"),
    safeLink("/zh/personality", "MBTI 人格", "返回 32 人格 hub"),
    safeLink("/zh/tests/mbti-personality-test-16-personality-types", "免费 MBTI 测试", "进入公开 MBTI 测试入口"),
    safeLink(type.comparison, "相关人格对比", "查看相邻搜索意图的热门跨类型对比"),
  ];
  const sections = [
    { key: "definition", title: `${code} 一句话定义`, body: directAnswer },
    { key: "suitable_for", title: "更容易发挥作用的场景", body: `${mode.suitablePrefix}${type.suitable}适配来自任务结构、真实技能和协作条件的交集，不是类型自动决定的结果。` },
    { key: "not_suitable_for", title: "不应只靠类型硬套的场景", body: `${type.unsuitable}遇到这类限制时，应先看任务边界、资源和支持系统，而不是把困难归因于人格标签。` },
    { key: "common_misread", title: "常见误解", body: `${type.misread}更可靠的判断是观察持续行为、具体情境和对反馈的回应。` },
    { key: "base16_difference", title: `与基础 ${base.toUpperCase()} 的关系`, body: `${type.baseDifference}应结合长期行为、情境与反馈理解。` },
    { key: "at_difference", title: `${base.toUpperCase()}-A 与 ${base.toUpperCase()}-T 的差异`, body: `${mode.difference}重点是观察实际反应，而不是给自己或他人贴高低标签。` },
    { key: "career_scenarios", title: "职业与工作场景", body: `${type.work}职业决策还应同时检查能力证据、兴趣、训练机会和实际工作环境。` },
    { key: "relationship_scenarios", title: "关系与沟通场景", body: `${type.relationship}类型语言只能帮助说明偏好，不能替代对具体关系、同意和边界的尊重。` },
    { key: "stress_scenarios", title: "压力下的观察与调整", body: `${type.stress}${mode.stress}必要时把观察写成可讨论的事实、影响和下一步。` },
  ];
  const shared = {
    asset_id: `mbti-profile-sp-34:${code.toLowerCase()}`,
    path: `/zh/personality/${base}-${variant.toLowerCase()}`,
    locale: "zh",
    framework: "mbti64",
    page_type: "profile",
    mbti_type: base.toUpperCase(),
    variant,
    archetype: type.archetype,
    audit_status: audit.content_status,
    gsc_evidence_status: audit.gsc_evidence_status,
    cms_fields: {
      title: `${code} 人格特点：${type.core} | FermatMind`,
      h1: `${code} 人格特点`,
      meta_description: `了解 ${code} 的${type.core}、适合与不适合的场景、A/T 差异、职业、关系、压力应对、常见误解与 FAQ。内容仅用于自我理解和成长复盘。`,
      direct_answer: directAnswer,
      sections,
      faq: expandedFaq,
      internal_links: links,
    },
    source_ledger: ["MBTI-FULL-AUDIT-30", "mbti64_remaining_58_v2", "public_profile_seo_asset_factory"],
    claim_boundary: {
      medical_diagnostic_claim: false,
      hiring_screen_claim: false,
      official_mbti_affiliation_claim: false,
      deterministic_career_claim: false,
      relationship_prediction_claim: false,
      frontend_editorial_fallback: false,
    },
    handoff_policy: {
      artifact_only: true,
      cms_write_attempted: false,
      production_import_attempted: false,
      frontend_runtime_change_attempted: false,
      sitemap_llms_mutation_attempted: false,
      gsc_mutation_attempted: false,
      production_deploy_attempted: false,
    },
  };
  if (audit.content_status === "verify_only") {
    return {
      ...shared,
      change_mode: "verify_only",
      verification_contract: {
        no_unjustified_rewrite: true,
        required_section_keys: sections.map((section) => section.key),
        minimum_faq_count: 6,
        minimum_internal_link_count: 5,
        expected_indexability: "indexable",
        required_action_if_failed: "needs_revision_only_for_failed_fields",
      },
      cms_update_fields: [],
      cms_fields: null,
    };
  }
  return { ...shared, change_mode: "repair", cms_update_fields: ["title", "h1", "meta_description", "direct_answer", "sections", "faq", "internal_links"] };
}

function validate(assets) {
  assert(assets.length === 8, `expected 8 SP profile assets, got ${assets.length}`);
  assert(new Set(assets.map((asset) => asset.path)).size === 8, "duplicate SP profile path");
  const repairAnswers = assets.filter((asset) => asset.change_mode === "repair").map((asset) => asset.cms_fields.direct_answer);
  assert(repairAnswers.length === 6 && new Set(repairAnswers).size === 6, "duplicate repair direct answer");
  for (const asset of assets) {
    assert(asset.locale === "zh" && asset.path.startsWith("/zh/personality/"), `locale/path mismatch: ${asset.path}`);
    assert(["repair", "verify_only"].includes(asset.change_mode), `invalid mode: ${asset.path}`);
    if (asset.change_mode === "verify_only") {
      assert(asset.cms_fields === null, `verify-only must not propose CMS rewrite: ${asset.path}`);
      assert(asset.cms_update_fields.length === 0, `verify-only update fields: ${asset.path}`);
      assert(asset.verification_contract?.no_unjustified_rewrite, `missing verify contract: ${asset.path}`);
      continue;
    }
    assert(asset.cms_fields.sections.length === 9, `section count: ${asset.path}`);
    assert(asset.cms_fields.faq.length === 6, `FAQ count: ${asset.path}`);
    assert(asset.cms_fields.internal_links.length === 5, `link count: ${asset.path}`);
    assert(asset.cms_fields.direct_answer.length >= 100, `answer too short: ${asset.path}`);
    for (const section of asset.cms_fields.sections) {
      assert(section.body.length >= 60, `section too short: ${asset.path}:${section.key}:${section.body.length}`);
    }
    assert(asset.cms_fields.faq.every((item) => item.answer.length >= 40), `FAQ too short: ${asset.path}`);
    assert(asset.cms_fields.internal_links.every((link) => link.safe_public_route), `unsafe link: ${asset.path}`);
    const text = JSON.stringify(asset.cms_fields);
    assert(!FORBIDDEN_CLAIM_PATTERN.test(text), `forbidden claim: ${asset.path}`);
  }
}

function markdown(report) {
  const rows = report.assets.map((asset) => `| ${asset.path} | ${asset.archetype} | ${asset.variant} | ${asset.change_mode} | ${asset.cms_fields?.sections.length ?? "verify"} | ${asset.cms_fields?.faq.length ?? "verify"} | ${asset.cms_fields?.internal_links.length ?? "verify"} |`).join("\n");
  return [
    "# MBTI-PROFILE-SP-34 Chinese Content Package",
    "",
    `- Final decision: \`${report.final_decision}\``,
    "- Scope: exactly 8 zh-CN SP profile candidates (ISTP, ISFP, ESTP, ESFP; A/T). ISTP-A and ISFP-A are verify-only and do not propose CMS replacements.",
    "- This is a non-production CMS approval artifact. It does not write CMS, deploy, mutate feeds, or submit to GSC.",
    "",
    "| URL | Archetype | Variant | Action | Sections | FAQ | Internal links |",
    "| --- | --- | --- | --- | ---: | ---: | ---: |",
    rows,
    "",
    "## Handoff",
    "",
    "Send this package to MBTI-FULL-QA-36. Only a later CMS dry-run, approval package, exact authorization, and production import may change authority-layer records.",
    "",
  ].join("\n");
}

function csv(assets) {
  const header = ["path", "mbti_type", "variant", "archetype", "change_mode", "section_count", "faq_count", "internal_link_count", "gsc_evidence_status", "direct_answer"];
  const rows = assets.map((asset) => [
    asset.path,
    asset.mbti_type,
    asset.variant,
    asset.archetype,
    asset.change_mode,
    asset.cms_fields?.sections.length ?? "verify_only",
    asset.cms_fields?.faq.length ?? "verify_only",
    asset.cms_fields?.internal_links.length ?? "verify_only",
    asset.gsc_evidence_status,
    asset.cms_fields?.direct_answer ?? "",
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n").concat("\n");
}

const audit = auditRecordMap();
const assets = Object.keys(TYPES).flatMap((base) => ["A", "T"].map((variant) => {
  const slug = `${base}-${variant.toLowerCase()}`;
  const record = audit.get(slug);
  assert(record, `missing audit record: ${slug}`);
  assert(["needs_content_repair", "verify_only"].includes(record.content_status), `unexpected audit status: ${slug}`);
  return buildAsset(base, variant, record);
}));
validate(assets);

const report = {
  artifact: "MBTI-PROFILE-SP-34-CONTENT-PACKAGE",
  generated_at: `${DATE}T12:00:00.000Z`,
  final_decision: "PASS_NON_PRODUCTION_SP_PROFILE_CONTENT_PACKAGE_READY_FOR_FULL_QA",
  source_audit: AUDIT_PATH,
  summary: { target_count: 8, group: "SP", profile_count: 8, repair_count: 6, verify_only_count: 2, sections_per_repair_page: 9, faq_per_repair_page: 6, internal_links_per_repair_page: 5 },
  safety_boundary: {
    artifact_only: true,
    cms_write_attempted: false,
    production_import_attempted: false,
    frontend_runtime_change_attempted: false,
    frontend_editorial_fallback_added: false,
    sitemap_llms_mutation_attempted: false,
    gsc_mutation_attempted: false,
    production_deploy_attempted: false,
  },
  assets,
};
report.package_sha256 = crypto.createHash("sha256").update(JSON.stringify(report.assets)).digest("hex");

write(`${OUTPUT_BASE}.json`, `${JSON.stringify(report, null, 2)}\n`);
write(`${OUTPUT_BASE}.md`, markdown(report));
write(`${OUTPUT_BASE}.csv`, csv(assets));
console.log(JSON.stringify({ ok: true, artifact: report.artifact, output_json: `${OUTPUT_BASE}.json`, output_md: `${OUTPUT_BASE}.md`, output_csv: `${OUTPUT_BASE}.csv`, target_count: assets.length, final_decision: report.final_decision }));
