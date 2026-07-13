#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const DATE = process.env.MBTI_PROFILE_SJ_33_DATE ?? "2026-07-13";
const OUTPUT_BASE = `docs/seo/personality/mbti-profile-sj-33-content-package-${DATE}`;
const AUDIT_PATH = "docs/seo/personality/mbti-full-audit-30-inventory-runtime-baseline-2026-07-13.json";
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payment|history|share)(?:\/|$|[?#])/i;
const FORBIDDEN_CLAIM_PATTERN = /(官方MBTI|官方认证|临床级|保证职业|决定命运)/;

const TYPES = {
  istj: { archetype: "物流师", functions: "Si-Te-Fi-Ne", core: "经验校验、责任边界和稳定执行", definition: "ISTJ 往往先核对事实、既有经验和责任边界，再把任务拆成可执行的步骤；这不是抗拒变化，而是偏好让变化有清楚的依据和交接。", suitable: "需要可靠执行、流程校验、风险控制、信息归档或把长期责任落实为明确步骤的场景。", unsuitable: "频繁改变标准却不说明原因、把承诺和责任长期模糊化，或只奖励临场即兴却不给准备时间的环境。", misread: "ISTJ 的谨慎和按步骤推进容易被误读为缺乏弹性。成熟表现是说明自己需要哪些事实与边界，并在证据充分时调整方法。", baseDifference: "基础 16 型的 ISTJ 描述经验校验与执行偏好；A/T 只补充面对压力、评价和自我复盘时的节奏，不代表可靠性或能力高低。", work: "在运营、质量、项目交付或专业服务中，把要求转为可检查的标准、责任人和完成时间，避免只靠口头承诺。", relationship: "关系中可用具体承诺、可协商的安排和清楚边界表达关心，而不是期待对方自动理解沉默背后的责任感。", stress: "压力下可能更依赖熟悉流程、反复确认细节，或把不确定感误作必须独自承担。先区分已知事实、待确认事项和可求助资源。", comparison: "/zh/personality/istj-vs-isfj" },
  isfj: { archetype: "守卫者", functions: "Si-Fe-Ti-Ne", core: "稳定照顾、细节记忆和关系责任", definition: "ISFJ 常通过记住具体需要、维持可靠安排和照顾关系中的实际细节来表达投入；这不是必须取悦所有人，而是偏好让支持落在可感知的行动上。", suitable: "需要耐心服务、细节跟进、关系维护、流程支持或把承诺持续落实到日常协作中的场景。", unsuitable: "把照顾当作无边界义务、不断变更要求却不给说明，或长期否定个人恢复时间与真实感受的环境。", misread: "ISFJ 的体贴容易被误读为没有意见。成熟表现是把关心和界限一起说清楚，而不是在过度承担后才感到委屈。", baseDifference: "基础 16 型的 ISFJ 描述稳定支持与具体照顾；A/T 只补充压力、反馈与自我确认的节奏，不衡量善良、成熟或关系能力。", work: "在服务、协调、教育支持或组织运营中，把需求记录、交接标准和反馈窗口明确下来，让可靠支持不只依赖个人记忆。", relationship: "关系里既可表达关心，也要说明时间、精力和不可接受的界限；照顾别人不等于替别人承担全部责任。", stress: "压力下可能优先满足所有人、忽略自己的恢复，或因担心冲突延迟表达。先列出需要协商的事项和最小边界，再安排具体沟通。", comparison: "/zh/personality/istj-vs-isfj" },
  estj: { archetype: "总经理", functions: "Te-Si-Ne-Fi", core: "目标组织、标准推进和责任落实", definition: "ESTJ 往往从目标、资源和责任分配出发推进事情，倾向把讨论转成可执行的决定；这不是天然强势，而是一种偏好明确标准与行动路径的方式。", suitable: "需要组织推进、资源协调、流程治理、明确决策或把多人任务落实为可追踪结果的场景。", unsuitable: "目标和权限长期不清、只要求结果却不给资源，或把所有直接沟通都解释为个人冲突的环境。", misread: "ESTJ 的直接和效率导向容易被误读为不在乎感受。成熟的推进会同时说明目标、理由、影响和让对方参与修正的空间。", baseDifference: "基础 16 型的 ESTJ 描述目标组织和执行方式；A/T 仅补充面对评价、压力与自我校准的节奏，不是领导力或价值的排名。", work: "在团队管理或项目推进中，把目标拆成优先级、负责人、风险点和复盘节点，也为一线反馈保留修正入口。", relationship: "关系里应把建议、要求和关心区分开说；先问对方需要支持还是方案，能减少效率语言被听成否定。", stress: "压力下可能加快指令、过度控制细节或忽略不同节奏。暂停确认目标是否仍一致，再选择需要立即决定和可以协商的部分。", comparison: "/zh/personality/entj-vs-intj" },
  esfj: { archetype: "执政官", functions: "Fe-Si-Ne-Ti", core: "共同需求、秩序维护和实际支持", definition: "ESFJ 常关注群体中的实际需要、关系氛围与可持续安排，并用组织和照顾把它们落地；这不是必须迎合所有人，而是偏好让协作关系保持清楚和可靠。", suitable: "需要客户支持、团队协作、活动组织、教育服务或把共同需求转成可执行安排的场景。", unsuitable: "长期忽略沟通和反馈、把关系劳动默认交给一个人，或以不断变更的标准让人无法建立可靠协作的环境。", misread: "ESFJ 的主动支持容易被误读为控制或讨好。成熟表现是先征求需要与同意，再明确自己的资源边界和可提供的支持。", baseDifference: "基础 16 型的 ESFJ 描述共同需求和实际支持的偏好；A/T 仅补充对反馈、压力与自我确认的反应节奏，不代表社交能力或价值。", work: "在服务、协调或团队运营中，把共同目标、沟通渠道、交接安排和反馈节奏说清楚，让关系维护成为团队机制而非个人消耗。", relationship: "关系里可直接说明在乎什么、能够提供什么和需要怎样回应；关心应允许双方协商，而不是以猜测代替沟通。", stress: "压力下可能过度关注外部评价、频繁确认他人是否满意，或承担过多协调。先分辨真实需求、自己的容量与可共同承担的部分。", comparison: "/zh/personality/infj-vs-infp" },
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
    asset_id: `mbti-profile-sj-33:${code.toLowerCase()}`,
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
  assert(assets.length === 8, `expected 8 SJ profile assets, got ${assets.length}`);
  assert(new Set(assets.map((asset) => asset.path)).size === 8, "duplicate SJ profile path");
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
    "# MBTI-PROFILE-SJ-33 Chinese Content Package",
    "",
    `- Final decision: \`${report.final_decision}\``,
    "- Scope: exactly 8 zh-CN SJ profile candidates (ISTJ, ISFJ, ESTJ, ESFJ; A/T). ISTJ-A and ESFJ-A are verify-only and do not propose CMS replacements.",
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
  artifact: "MBTI-PROFILE-SJ-33-CONTENT-PACKAGE",
  generated_at: `${DATE}T12:00:00.000Z`,
  final_decision: "PASS_NON_PRODUCTION_SJ_PROFILE_CONTENT_PACKAGE_READY_FOR_FULL_QA",
  source_audit: AUDIT_PATH,
  summary: { target_count: 8, group: "SJ", profile_count: 8, repair_count: 6, verify_only_count: 2, sections_per_repair_page: 9, faq_per_repair_page: 6, internal_links_per_repair_page: 5 },
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
