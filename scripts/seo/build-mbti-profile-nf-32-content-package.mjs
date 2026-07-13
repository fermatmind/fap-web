#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const DATE = process.env.MBTI_PROFILE_NF_32_DATE ?? "2026-07-13";
const OUTPUT_BASE = `docs/seo/personality/mbti-profile-nf-32-content-package-${DATE}`;
const AUDIT_PATH = "docs/seo/personality/mbti-full-audit-30-inventory-runtime-baseline-2026-07-13.json";
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payment|history|share)(?:\/|$|[?#])/i;
const FORBIDDEN_CLAIM_PATTERN = /(官方MBTI|官方认证|临床级|保证职业|决定命运)/;

const TYPES = {
  infj: { archetype: "提倡者", functions: "Ni-Fe-Ti-Se", core: "意义建构、关系洞察和价值导向", definition: "INFJ 常把零散的人际线索收束成较长的意义图景；这不是读心能力，而是一种偏好性的模式理解与沟通方式。", suitable: "需要理解长期人际模式、整合价值与方向、提供深度支持或把复杂处境讲清楚的场景。", unsuitable: "只奖励即时表态、长期压缩独处消化时间，或把所有关系问题都简化成单一立场的环境。", misread: "INFJ 的安静整理常被误读为神秘或过度敏感。更健康的做法是说明自己已看到什么、还不确定什么，而不是替别人定义意义。", baseDifference: "基础 16 型的 INFJ 描述意义收束与关系理解；A/T 仅补充压力、反馈与自我确认的节奏，不是共情力或成熟度的排名。", work: "在辅导、研究、内容策划或跨角色协作中，把直觉判断拆成观察、影响、假设和可验证的下一步。", relationship: "关系中先表达自己的期待和界限，再邀请对方说明真实感受，避免把体贴变成没有说出口的测试。", stress: "压力下可能过度替别人承担解释工作，或因失望退回沉默。先确认事实、责任和可协商边界，能减少内耗。", comparison: "/zh/personality/infj-vs-infp" },
  infp: { archetype: "调停者", functions: "Fi-Ne-Si-Te", core: "内在价值、想象力和真实表达", definition: "INFP 往往先确认一件事是否符合内在价值，再通过想象和可能性寻找表达方式；它不是逃避现实，而是重视真实感受与意义。", suitable: "需要价值判断、叙事表达、创意探索、倾听支持或能让个人观点逐步成熟的场景。", unsuitable: "持续要求压抑真实感受、只用短期排名决定价值，或不允许保留个人表达和迭代空间的环境。", misread: "INFP 的温和并不等于没有立场。成熟的表现是把在乎的事说成可理解的边界，而不是只在心里承受失望。", baseDifference: "基础 16 型的 INFP 描述价值校准和可能性探索；A/T 仅补充面对评价、压力和自我复盘时的反应节奏。", work: "在创作、研究或支持型工作中，把直觉和价值转成受众、场景、证据和可交付版本，避免理想只停在愿望。", relationship: "关系里可先说出感受、需求和不可接受的界限；真诚不是要求别人自动猜到全部期待。", stress: "压力下可能反复回想伤害、延迟决定或退回想象。为一个价值选择设定最小行动和反馈时点，会比继续自责更有帮助。", comparison: "/zh/personality/infj-vs-infp" },
  enfj: { archetype: "主人公", functions: "Fe-Ni-Se-Ti", core: "人际带动、共同方向和支持行动", definition: "ENFJ 常从人的需要与共同目标出发组织关系和行动；这不是必须照顾所有人，而是偏好让支持、方向和协作变得可见。", suitable: "需要团队激励、跨角色协调、辅导反馈、社区建设或把不同人带向共同目标的场景。", unsuitable: "把情感劳动当作默认责任、长期否定边界，或只要求个人竞争却不允许公开协调关系和资源的环境。", misread: "ENFJ 的支持容易被误读为讨好。更成熟的支持会明确角色、同意和责任边界，而不是替别人承担决定。", baseDifference: "基础 16 型的 ENFJ 描述人际组织和方向感；A/T 仅描述在评价、压力和自我确认上的节奏，不衡量领导力。", work: "在团队调整或辅导中，先确认目标、角色、支持方式和复盘时间，让鼓励落实为对方能采取的行动。", relationship: "关系里要区分关心、建议和替代决定；主动询问对方需要什么，也要让自己的疲惫和边界被看见。", stress: "压力下可能过度介入、把冲突等同于关系失败。回到事实、角色和可协商的请求，能让支持不失去界限。", comparison: "/zh/personality/infj-vs-infp" },
  enfp: { archetype: "竞选者", functions: "Ne-Fi-Te-Si", core: "可能性连接、价值驱动和创意动能", definition: "ENFP 常从新的可能、人与人之间的连接和个人价值中获得行动动力；这不是注意力必然分散，而是偏好在探索中找到有意义的方向。", suitable: "需要创意发散、机会发现、社群连接、叙事表达和把新想法转成试验的场景。", unsuitable: "完全禁止探索、只认可单一路径、长期以机械重复消耗热情，或不给优先级与交付支持的环境。", misread: "ENFP 的热情和兴趣广泛容易被误读为不可靠。成熟表现是把真正重要的方向变成明确承诺、节奏和反馈。", baseDifference: "基础 16 型的 ENFP 描述可能性探索与价值选择；A/T 只补充压力、反馈和自我复盘的差异，不代表创造力高低。", work: "在创意或社群工作中，先保留发散空间，再用影响、可行性和截止时间选择一个值得推进的版本。", relationship: "关系里可把热情和承诺分开说明：既表达想法，也明确何时能回应、需要什么空间和怎样复盘误解。", stress: "压力下可能不断开启新选项或回避收尾。选定一个最有价值的下一步，并请可信的人协助校准优先级。", comparison: "/zh/personality/infj-vs-infp" },
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
  return {
    asset_id: `mbti-profile-nf-32:${code.toLowerCase()}`,
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
}

function validate(assets) {
  assert(assets.length === 8, `expected 8 NF profile assets, got ${assets.length}`);
  assert(new Set(assets.map((asset) => asset.path)).size === 8, "duplicate NF profile path");
  assert(new Set(assets.map((asset) => asset.cms_fields.direct_answer)).size === 8, "duplicate direct answer");
  for (const asset of assets) {
    assert(asset.locale === "zh" && asset.path.startsWith("/zh/personality/"), `locale/path mismatch: ${asset.path}`);
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
  const rows = report.assets.map((asset) => `| ${asset.path} | ${asset.archetype} | ${asset.variant} | ${asset.cms_fields.sections.length} | ${asset.cms_fields.faq.length} | ${asset.cms_fields.internal_links.length} |`).join("\n");
  return [
    "# MBTI-PROFILE-NF-32 Chinese Content Package",
    "",
    `- Final decision: \`${report.final_decision}\``,
    "- Scope: exactly 8 zh-CN NF profile candidates (INFJ, INFP, ENFJ, ENFP; A/T).",
    "- This is a non-production CMS approval artifact. It does not write CMS, deploy, mutate feeds, or submit to GSC.",
    "",
    "| URL | Archetype | Variant | Sections | FAQ | Internal links |",
    "| --- | --- | --- | ---: | ---: | ---: |",
    rows,
    "",
    "## Handoff",
    "",
    "Send this package to MBTI-FULL-QA-36. Only a later CMS dry-run, approval package, exact authorization, and production import may change authority-layer records.",
    "",
  ].join("\n");
}

function csv(assets) {
  const header = ["path", "mbti_type", "variant", "archetype", "section_count", "faq_count", "internal_link_count", "gsc_evidence_status", "direct_answer"];
  const rows = assets.map((asset) => [
    asset.path,
    asset.mbti_type,
    asset.variant,
    asset.archetype,
    asset.cms_fields.sections.length,
    asset.cms_fields.faq.length,
    asset.cms_fields.internal_links.length,
    asset.gsc_evidence_status,
    asset.cms_fields.direct_answer,
  ]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n").concat("\n");
}

const audit = auditRecordMap();
const assets = Object.keys(TYPES).flatMap((base) => ["A", "T"].map((variant) => {
  const slug = `${base}-${variant.toLowerCase()}`;
  const record = audit.get(slug);
  assert(record, `missing audit record: ${slug}`);
  assert(record.content_status === "needs_content_repair", `unexpected audit status: ${slug}`);
  return buildAsset(base, variant, record);
}));
validate(assets);

const report = {
  artifact: "MBTI-PROFILE-NF-32-CONTENT-PACKAGE",
  generated_at: `${DATE}T12:00:00.000Z`,
  final_decision: "PASS_NON_PRODUCTION_NF_PROFILE_CONTENT_PACKAGE_READY_FOR_FULL_QA",
  source_audit: AUDIT_PATH,
  summary: { target_count: 8, group: "NF", profile_count: 8, sections_per_page: 9, faq_per_page: 6, internal_links_per_page: 5 },
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
