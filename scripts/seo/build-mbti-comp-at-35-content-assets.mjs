#!/usr/bin/env node
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { csvEscape } from "./artifactSafety.mjs";

const ROOT = process.cwd();
const DATE = process.env.MBTI_COMP_AT_35_DATE ?? "2026-07-13";
const OUTPUT_BASE = `docs/seo/personality/mbti-comp-at-35-content-assets-${DATE}`;
const AUDIT_PATH = "docs/seo/personality/mbti-full-audit-30-inventory-runtime-baseline-2026-07-13.json";
const PRIVATE_PATH_PATTERN = /\/(?:result|attempt|report|orders?|payment|history|share)(?:\/|$|[?#])/i;
const FORBIDDEN_CLAIM_PATTERN = /(官方MBTI|官方认证|临床级|保证职业|决定命运)/;

const TYPES = {
  intj: ["建筑师", "长期系统、独立判断和结构化推进", "先搭建判断框架，再安排验证与推进", "把稳定判断误作不需要外部反证"],
  intp: ["逻辑学家", "概念建模、分析推理和独立解题", "先澄清模型与矛盾，再决定是否行动", "把持续校验误作不愿承担决定"],
  entj: ["指挥官", "目标拆解、组织推进和决策责任", "先明确目标与资源，再分配责任推进", "把直接推进误作无需听取现场信息"],
  entp: ["辩论家", "机会试探、快速验证和观点碰撞", "先测试可能性与反例，再选择值得投入的方向", "把开放讨论误作不愿意收束"],
  infj: ["提倡者", "意义洞察、长期关系和价值边界", "先理解关系与意义线索，再形成表达", "把安静整理误作神秘或过度敏感"],
  infp: ["调停者", "价值感受、个人表达和内在一致性", "先确认是否符合内在价值，再寻找表达方式", "把温和表达误作没有立场"],
  enfj: ["主人公", "群体协调、价值鼓励和关系动员", "先理解共同需要，再组织支持与行动", "把支持他人误作必须替代他人决定"],
  enfp: ["竞选者", "可能性探索、表达连接和创意启动", "先发现可能性与连接，再决定如何试验", "把热情广泛误作无法兑现承诺"],
  istj: ["物流师", "事实核对、责任秩序和稳定执行", "先确认经验、标准与责任，再拆分步骤", "把谨慎执行误作缺乏弹性"],
  isfj: ["守卫者", "经验照顾、现实支持和可靠维护", "先看具体需要与承诺，再安排持续支持", "把体贴支持误作没有个人边界"],
  estj: ["总经理", "规则执行、资源调度和现场管理", "先明确标准、角色与时间，再组织推进", "把效率语言误作不在乎人的感受"],
  esfj: ["执政官", "关系照顾、共同标准和实际支持", "先看共同需要与协作安排，再落实支持", "把主动协调误作控制或讨好"],
  istp: ["鉴赏家", "动手试错、工具判断和现实排障", "先观察系统如何运作，再用小试验验证", "把独立处理误作不关心他人"],
  isfp: ["探险家", "体验审美、安静表达和现场选择", "先确认真实感受与实际体验，再作选择", "把低调随和误作没有方向"],
  estp: ["企业家", "即时行动、现实机会和现场影响", "先利用可见信息试探机会，再快速调整", "把行动快误作忽略长期代价"],
  esfp: ["表演者", "当下互动、表达感染和体验带动", "先从真实互动与体验获得动力，再带动参与", "把外向热情误作缺少深度或承诺"],
};

const RELATED_AT = {
  intj: "intp", intp: "intj", entj: "entp", entp: "entj", infj: "infp", infp: "infj", enfj: "enfp", enfp: "enfj",
  istj: "isfj", isfj: "istj", estj: "esfj", esfj: "estj", istp: "isfp", isfp: "istp", estp: "esfp", esfp: "estp",
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function write(relativePath, value) {
  const absolute = path.join(ROOT, relativePath);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, value);
}

function safeLink(href, label, purpose) {
  assert(href.startsWith("/zh/"), `non-zh link: ${href}`);
  assert(!PRIVATE_PATH_PATTERN.test(href), `private link: ${href}`);
  return { href, label, purpose, safe_public_route: true };
}

function readAudit() {
  return new Map(JSON.parse(fs.readFileSync(path.join(ROOT, AUDIT_PATH), "utf8")).records.map((record) => [record.slug, record]));
}

function tableRows(code, focus, approach, risk) {
  return [
    { dimension: "最大区别", a: "更快回到自己的判断并保持行动节奏", t: "更频繁检查评价、风险与可改进处" },
    { dimension: "压力反应", a: `${code} 的${focus}更容易先保持稳定推进`, t: `${code} 的${focus}更容易先复盘遗漏与外部反馈` },
    { dimension: "工作场景", a: `${approach}，再用最小证据修正`, t: `${approach}，并先补足风险检查与反馈窗口` },
    { dimension: "容易误判", a: `可能被误读为${risk}`, t: "可能被误读为犹豫或不够坚定" },
  ];
}

function faq(code, archetype) {
  return [
    { question: `${code}-A 和 ${code}-T 最大区别是什么？`, answer: `${code}-A 与 ${code}-T 共享同一基础类型和${archetype}偏好；差异主要体现在面对评价、压力和自我确认时的节奏，不是能力或价值高低。` },
    { question: `怎么快速判断自己更像 ${code}-A 还是 ${code}-T？`, answer: "回看最近的决定、反馈和压力场景：你是更快恢复判断后推进，还是更常追加复盘和风险检查。再结合长期行为与完整测试结果理解。" },
    { question: `${code}-A 一定比 ${code}-T 更自信吗？`, answer: "不一定。A/T 只能描述自我确认和反馈处理的倾向，不能替代对具体能力、成熟度、训练或环境支持的判断。" },
    { question: `这个 A/T 对比能决定职业或关系吗？`, answer: "不能。职业与关系需要结合技能、兴趣、经验、现实约束、沟通和双方边界；页面只提供自我观察与沟通线索。" },
    { question: `这个页面可以用于诊断或招聘筛选吗？`, answer: "不能。该内容不是医学诊断、招聘筛选、能力证明或关系裁决工具，也不应据此为自己或他人贴确定性标签。" },
  ];
}

function repairAsset(base, audit) {
  const [archetype, focus, approach, risk] = TYPES[base];
  const code = base.toUpperCase();
  const pathName = `/zh/personality/${base}-a-vs-${base}-t`;
  const directAnswer = `${code}-A 与 ${code}-T 的最大区别，是在相同${archetype}核心偏好下处理反馈、压力与自我确认的节奏不同。A 型通常更快恢复判断并继续推进；T 型通常更愿意复盘风险、标准和外部反馈。两者都可能表现出${focus}，不应用于诊断、招聘、能力排名或关系裁决。`;
  const rows = tableRows(code, focus, approach, risk);
  const sections = [
    { key: "biggest_difference", title: "最大区别", body: directAnswer },
    { key: "quick_judgment_table", title: "快速判断表", body: rows.map((row) => `${row.dimension}：${code}-A=${row.a}；${code}-T=${row.t}`).join("；"), rows },
    { key: "easy_misread", title: "为什么容易混淆", body: `${code}-A 与 ${code}-T 的字母核心相同，日常行为也可能相似。只看一次自信、一次焦虑或一个标签会造成误判；更可靠的是观察反馈后如何复盘、压力下如何恢复，以及是否愿意根据证据调整。` },
    { key: "work_scenarios", title: "真实工作场景", body: `在工作中，${code}-A 往往在${approach}后较快进入执行与迭代；${code}-T 往往会增加对标准、遗漏和风险的核对。两种方式都需要清楚的责任、证据和复盘节点，不能替代岗位技能判断。` },
    { key: "relationship_scenarios", title: "真实关系场景", body: `在关系中，${code}-A 可能较快确认自己的理解并提出下一步；${code}-T 可能更在意是否遗漏对方感受或误解。有效沟通不是选出更好的一方，而是说清期待、边界、事实和需要复盘的地方。` },
    { key: "stress_scenarios", title: "压力场景差异", body: `压力下，${code}-A 的优势是维持节奏，风险是过早把稳定感当成结论；${code}-T 的优势是发现风险，风险是让复盘无限延长。两者都可用可逆下一步、反馈时间和休息边界恢复校准。` },
    { key: "do_not_misjudge", title: "不要如何误判", body: `不要把 ${code}-A 写成更好、更强或必然更自信，也不要把 ${code}-T 写成更弱或必然焦虑。A/T 只是观察语言；任何结论都应回到真实行为、情境、经验和反馈。` },
    { key: "common_ground", title: "共同点", body: `${code}-A 与 ${code}-T 都共享${archetype}的${focus}。它们共同面对的不是谁更优，而是怎样把偏好转成更清楚的决定、协作和复盘。` },
    { key: "usage_boundary", title: "使用边界", body: `该对比仅用于自我理解、沟通与成长复盘，不构成医学诊断、招聘筛选、智力或能力证明、职业保证、伴侣匹配或未来预测。` },
  ];
  const related = RELATED_AT[base];
  return {
    asset_id: `mbti-comp-at-35:${base}-a-vs-${base}-t`, path: pathName, locale: "zh", framework: "mbti64", page_type: "at_comparison", comparison_pair: { left: `${code}-A`, right: `${code}-T` }, audit_status: audit.content_status, change_mode: "repair",
    query_fit: { primary: `${code}-A 和 ${code}-T 的区别`, secondary: [`${code}-A`, `${code}-T`, `${code} A/T 区别`] },
    source_refs: ["MBTI-FULL-AUDIT-30", "public_profile_seo_asset_factory", "mbti64_remaining_58_v2"],
    duplicate_differentiation_note: `Uses ${code}-specific focus (${focus}), decision approach (${approach}), and misread boundary (${risk}) rather than a generic A/T page body.`,
    cms_fields: { title: `${code}-A 和 ${code}-T 的区别：${archetype} A/T 对比 | FermatMind`, h1: `${code}-A 和 ${code}-T 的区别`, meta_description: `对比 ${code}-A 与 ${code}-T 的最大区别、快速判断表、容易误判、工作、关系、压力场景、共同点、使用边界和 FAQ。`, direct_answer: directAnswer, sections, quick_judgment_table: rows, faq: faq(code, archetype), internal_links: [safeLink(`/zh/personality/${base}-a`, `${code}-A`, "left_profile"), safeLink(`/zh/personality/${base}-t`, `${code}-T`, "right_profile"), safeLink(`/zh/personality/${related}-a-vs-${related}-t`, `${related.toUpperCase()} A/T 对比`, "related_at_comparison"), safeLink("/zh/personality", "MBTI 人格", "personality_hub"), safeLink("/zh/tests/mbti-personality-test-16-personality-types", "免费 MBTI 测试", "test_loop")] },
    handoff_policy: { artifact_only: true, cms_write_attempted: false, production_import_attempted: false, frontend_runtime_change_attempted: false, sitemap_llms_mutation_attempted: false, gsc_mutation_attempted: false, production_deploy_attempted: false },
  };
}

function verifyOnlyAsset(audit) {
  return {
    asset_id: "mbti-comp-at-35:intp-a-vs-intp-t", path: "/zh/personality/intp-a-vs-intp-t", locale: "zh", framework: "mbti64", page_type: "at_comparison", comparison_pair: { left: "INTP-A", right: "INTP-T" }, audit_status: audit.content_status, change_mode: "verify_only", cms_update_fields: [],
    query_fit: { primary: "INTP-A 和 INTP-T 的区别", secondary: ["INTP-A", "INTP-T", "INTP A/T 区别"] }, source_refs: ["MBTI-FULL-AUDIT-30"], duplicate_differentiation_note: "Existing complete cohort asset; validate only, with no content rewrite proposed.",
    verification_contract: { no_unjustified_rewrite: true, required_section_keys: ["biggest_difference", "quick_judgment_table", "easy_misread", "work_scenarios", "relationship_scenarios", "stress_scenarios", "do_not_misjudge", "common_ground", "usage_boundary"], minimum_quick_judgment_rows: 4, minimum_faq_count: 5, minimum_internal_link_count: 5, expected_indexability: "indexable", required_action_if_failed: "needs_revision_only_for_failed_fields" },
    cms_fields: null, handoff_policy: { artifact_only: true, cms_write_attempted: false, production_import_attempted: false, frontend_runtime_change_attempted: false, sitemap_llms_mutation_attempted: false, gsc_mutation_attempted: false, production_deploy_attempted: false },
  };
}

function validate(assets) {
  assert(assets.length === 16, `expected 16 A/T assets, got ${assets.length}`);
  assert(new Set(assets.map((asset) => asset.path)).size === 16, "duplicate comparison path");
  const repairs = assets.filter((asset) => asset.change_mode === "repair");
  const verifies = assets.filter((asset) => asset.change_mode === "verify_only");
  assert(repairs.length === 15 && verifies.length === 1 && verifies[0].path.endsWith("intp-a-vs-intp-t"), "repair/verify split mismatch");
  assert(new Set(repairs.map((asset) => asset.cms_fields.direct_answer)).size === 15, "duplicate direct answers");
  for (const asset of repairs) {
    assert(asset.cms_fields.sections.length === 9, `section count: ${asset.path}`);
    assert(asset.cms_fields.quick_judgment_table.length >= 4, `table rows: ${asset.path}`);
    assert(asset.cms_fields.faq.length >= 5, `FAQ count: ${asset.path}`);
    assert(asset.cms_fields.internal_links.length >= 5, `links: ${asset.path}`);
    assert(asset.cms_fields.internal_links.every((link) => link.safe_public_route && !PRIVATE_PATH_PATTERN.test(link.href)), `unsafe link: ${asset.path}`);
    assert(asset.cms_fields.direct_answer.length >= 120, `short answer: ${asset.path}`);
    assert(!FORBIDDEN_CLAIM_PATTERN.test(JSON.stringify(asset.cms_fields)), `forbidden claim: ${asset.path}`);
  }
}

function markdown(report) {
  const rows = report.assets.map((asset) => `| ${asset.path} | ${asset.change_mode} | ${asset.cms_fields?.sections.length ?? "verify"} | ${asset.cms_fields?.faq.length ?? "verify"} | ${asset.cms_fields?.internal_links.length ?? "verify"} |`).join("\n");
  return ["# MBTI-COMP-AT-35 Chinese A/T Comparison Content Assets", "", `- Final decision: \`${report.final_decision}\``, "- Scope: exactly 16 zh-CN A/T comparison candidates. INTP-A vs INTP-T is verify-only and does not propose a CMS rewrite.", "- This is a non-production CMS-review artifact. It does not write CMS, mutate feeds, deploy, or submit to GSC.", "", "| URL | Action | Sections | FAQ | Internal links |", "| --- | --- | ---: | ---: | ---: |", rows, "", "## Handoff", "", "Send this package to MBTI-FULL-QA-36. A later CMS dry-run, approval, exact authorization, and production import may change authority-layer records.", ""].join("\n");
}

function csv(assets) {
  const header = ["path", "left", "right", "change_mode", "section_count", "faq_count", "quick_judgment_rows", "internal_link_count", "query_primary", "direct_answer"];
  const rows = assets.map((asset) => [asset.path, asset.comparison_pair.left, asset.comparison_pair.right, asset.change_mode, asset.cms_fields?.sections.length ?? "verify_only", asset.cms_fields?.faq.length ?? "verify_only", asset.cms_fields?.quick_judgment_table.length ?? "verify_only", asset.cms_fields?.internal_links.length ?? "verify_only", asset.query_fit.primary, asset.cms_fields?.direct_answer ?? ""]);
  return [header, ...rows].map((row) => row.map(csvEscape).join(",")).join("\n").concat("\n");
}

const audit = readAudit();
const assets = Object.keys(TYPES).map((base) => {
  const slug = `${base}-a-vs-${base}-t`;
  const record = audit.get(slug);
  assert(record, `missing audit record: ${slug}`);
  if (slug === "intp-a-vs-intp-t") {
    assert(record.content_status === "verify_only", `unexpected verify status: ${slug}`);
    return verifyOnlyAsset(record);
  }
  assert(record.content_status === "needs_content_repair", `unexpected repair status: ${slug}`);
  return repairAsset(base, record);
});
validate(assets);
const report = { artifact: "MBTI-COMP-AT-35-CONTENT-ASSETS", generated_at: `${DATE}T12:00:00.000Z`, final_decision: "PASS_NON_PRODUCTION_AT_COMPARISON_CONTENT_PACKAGE_READY_FOR_FULL_QA", source_audit: AUDIT_PATH, summary: { target_count: 16, at_comparison_count: 16, repair_count: 15, verify_only_count: 1, sections_per_repair_page: 9, faq_per_repair_page: 5, quick_judgment_rows_per_repair_page: 4, internal_links_per_repair_page: 5 }, safety_boundary: { artifact_only: true, cms_write_attempted: false, production_import_attempted: false, frontend_runtime_change_attempted: false, frontend_editorial_fallback_added: false, sitemap_llms_mutation_attempted: false, gsc_mutation_attempted: false, production_deploy_attempted: false }, assets };
report.package_sha256 = crypto.createHash("sha256").update(JSON.stringify(report.assets)).digest("hex");
write(`${OUTPUT_BASE}.json`, `${JSON.stringify(report, null, 2)}\n`);
write(`${OUTPUT_BASE}.md`, markdown(report));
write(`${OUTPUT_BASE}.csv`, csv(assets));
console.log(JSON.stringify({ ok: true, artifact: report.artifact, output_json: `${OUTPUT_BASE}.json`, output_md: `${OUTPUT_BASE}.md`, output_csv: `${OUTPUT_BASE}.csv`, target_count: assets.length, repair_count: 15, verify_only_count: 1, final_decision: report.final_decision }));
