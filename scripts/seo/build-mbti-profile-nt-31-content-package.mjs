#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const DATE = process.env.MBTI_PROFILE_NT_31_DATE ?? "2026-07-13";
const OUTPUT_BASE = `docs/seo/personality/mbti-profile-nt-31-content-package-${DATE}`;
const AUDIT_PATH = "docs/seo/personality/mbti-full-audit-30-inventory-runtime-baseline-2026-07-13.json";
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payment|history|share)(?:\/|$|[?#])/i;
const FORBIDDEN_CLAIM_PATTERN = /(官方MBTI|官方认证|临床级|保证职业|决定命运)/;

const TYPES = {
  intj: {
    archetype: "建筑师",
    functions: "Ni-Te-Fi-Se",
    core: "战略规划、独立标准和长期系统",
    definition: "INTJ 更常先收束长期方向，再用标准和结构安排执行；它不是冷漠或万能规划，而是一种偏好性的判断与行动方式。",
    suitable: "需要独立分析、长期规划、架构取舍、复杂问题拆解和把模糊目标转成决策标准的场景。",
    unsuitable: "持续以即时社交反馈决定方向、没有边界的临时救火，或只能执行却不允许解释原则和长期后果的环境。",
    misread: "INTJ 容易因先在内部形成判断而被误读为疏离。成熟的表现是把推理、限制和期待说出来，而不是让别人猜结论。",
    baseDifference: "基础 16 型的 INTJ 描述方向收束与结构化执行；A/T 只补充压力、反馈和自我确认的节奏，不会改变 INTJ 的核心偏好，也不是能力等级。",
    work: "在战略复盘、技术架构或长期项目里，先写清目标、约束、反证和决策截止点；这样可以把个人判断转成团队可复核的路径。",
    relationship: "关系中先说明自己是在整理想法还是需要空间，再表达标准与关心，避免把沉默变成对方必须解读的信号。",
    stress: "压力下可能过早关闭讨论，或躲进复杂规划里延迟沟通。先区分事实、假设和偏好，再邀请关键反证，有助于恢复弹性。",
    comparison: "/zh/personality/intj-vs-intp",
  },
  intp: {
    archetype: "逻辑学家",
    functions: "Ti-Ne-Si-Fe",
    core: "分析建模、可能性探索和独立解题",
    definition: "INTP 往往先检查概念是否自洽，再扩展假设和反例；它不是缺乏行动，而是习惯先理解问题的结构。",
    suitable: "研究分析、技术诊断、原型验证、系统设计和允许通过假设、证据与迭代解决复杂问题的场景。",
    unsuitable: "只靠头衔或情绪快速定论、不能提出反例、长期以表面忙碌代替问题定义的环境。",
    misread: "INTP 的追问常被误读为抬杠或不关心结果。有效协作是说明自己在验证哪个假设，并为讨论设定可交付的下一步。",
    baseDifference: "基础 16 型的 INTP 强调逻辑建模和可能性探索；A/T 仅描述面对质疑、反馈和不确定性时的校准节奏，不能用于衡量聪明程度。",
    work: "在研究、产品原型或排障中，把问题写成定义、假设、反证、实验和结论，避免模型只停留在脑中。",
    relationship: "关系里可先确认对方需要倾听、建议还是共同分析；把解释转成可感受到的回应，比补更多逻辑更有效。",
    stress: "压力下可能无限补充信息、推迟公开版本，或把情感议题完全技术化。先设定足够好的证据阈值，再选择一个可逆行动。",
    comparison: "/zh/personality/intj-vs-intp",
  },
  entj: {
    archetype: "指挥官",
    functions: "Te-Ni-Se-Fi",
    core: "资源组织、目标推进和运营节奏",
    definition: "ENTJ 常把目标、资源和责任组织成可推进的行动；它不等于强势或天生领导，而是偏好通过外部执行检验判断。",
    suitable: "需要明确优先级、跨团队协调、责任拆分、决策推进和把复杂事项转成可执行节奏的场景。",
    unsuitable: "职责始终模糊、任何决定都不能验证、只允许私下猜测而不允许公开讨论风险和资源的环境。",
    misread: "ENTJ 的直接推进容易被误读为不在乎人。成熟的表现是同时说明目标、取舍和不同角色的影响，而不是只给指令。",
    baseDifference: "基础 16 型的 ENTJ 描述外部组织与方向推进；A/T 只补充面对反馈、压力和自我确认的差异，不代表领导力或职业价值高低。",
    work: "在项目受阻时，先区分目标、责任、资源和阻塞原因；用公开节奏让团队看到为什么现在推进、何时复盘，而不是只加压。",
    relationship: "关系中先问对方希望被支持的方式，再提出方案；把效率与同意、边界放在同一张桌面上。",
    stress: "压力下可能把推进速度当成唯一答案，忽略理解成本或长期副作用。暂停确认关键假设和反对意见，能避免把错误方向推得更快。",
    comparison: "/zh/personality/entj-vs-intj",
  },
  entp: {
    archetype: "辩论家",
    functions: "Ne-Ti-Fe-Si",
    core: "可能性探索、观点碰撞和快速实验",
    definition: "ENTP 往往用新可能、反例和讨论来测试一个想法是否站得住；它不等于只会争论，而是偏好在变化中发现更好的问题。",
    suitable: "早期问题定义、产品实验、创意策略、跨领域探索和允许快速迭代、公开讨论假设的场景。",
    unsuitable: "不允许质疑既有做法、所有讨论必须立即形成确定答案，或长期没有试验空间但又要求持续创新的环境。",
    misread: "ENTP 提出反方观点不等于真的相信它。有效沟通是说明自己在测试可能性，并在讨论结束时明确哪些结论需要落地。",
    baseDifference: "基础 16 型的 ENTP 描述可能性探索和逻辑检验；A/T 补充的是压力和反馈的处理节奏，不能推导一个人的可靠性、能力或关系质量。",
    work: "在创意或策略会议中，把发散阶段和收敛阶段分开：先允许反例，再明确选择标准、负责人和实验截止时间。",
    relationship: "关系里先确认辩论对对方是有趣还是消耗；表达好奇时也要给出情感确认，避免把亲密关系变成持续反驳赛。",
    stress: "压力下可能不断追逐新选项，或用玩笑绕开真实冲突。选择一个最有价值的假设做小实验，并同步不会继续做什么。",
    comparison: "/zh/personality/entj-vs-intj",
  },
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
    { key: "base16_difference", title: `与基础 ${base.toUpperCase()} 的关系`, body: type.baseDifference },
    { key: "at_difference", title: `${base.toUpperCase()}-A 与 ${base.toUpperCase()}-T 的差异`, body: `${mode.difference}重点是观察实际反应，而不是给自己或他人贴高低标签。` },
    { key: "career_scenarios", title: "职业与工作场景", body: `${type.work}职业决策还应同时检查能力证据、兴趣、训练机会和实际工作环境。` },
    { key: "relationship_scenarios", title: "关系与沟通场景", body: `${type.relationship}类型语言只能帮助说明偏好，不能替代对具体关系、同意和边界的尊重。` },
    { key: "stress_scenarios", title: "压力下的观察与调整", body: `${type.stress}${mode.stress}必要时把观察写成可讨论的事实、影响和下一步。` },
  ];
  return {
    asset_id: `mbti-profile-nt-31:${code.toLowerCase()}`,
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
      faq,
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
  assert(assets.length === 8, `expected 8 NT profile assets, got ${assets.length}`);
  assert(new Set(assets.map((asset) => asset.path)).size === 8, "duplicate NT profile path");
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
    "# MBTI-PROFILE-NT-31 Chinese Content Package",
    "",
    `- Final decision: \`${report.final_decision}\``,
    "- Scope: exactly 8 zh-CN NT profile candidates (INTJ, INTP, ENTJ, ENTP; A/T).",
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
  artifact: "MBTI-PROFILE-NT-31-CONTENT-PACKAGE",
  generated_at: `${DATE}T12:00:00.000Z`,
  final_decision: "PASS_NON_PRODUCTION_NT_PROFILE_CONTENT_PACKAGE_READY_FOR_FULL_QA",
  source_audit: AUDIT_PATH,
  summary: { target_count: 8, group: "NT", profile_count: 8, sections_per_page: 9, faq_per_page: 6, internal_links_per_page: 5 },
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
