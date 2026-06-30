import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SCRIPT_PATH = "scripts/seo/validate-mbti64-zh32-original-v8-3-package.mjs";
const CONTRACT_PATH = "docs/seo/personality/mbti64-zh32-original-v8-3-content-contract-2026-06-30.json";

type Contract = {
  accepted_target_sets: Record<string, { paths: string[] }>;
  module_contract: Array<{ order: number; id: string; title: string }>;
};

function readJson<T>(file: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, file), "utf8")) as T;
}

function tempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "mbti64-zh32-v8-3-"));
}

function typeAndVariant(pagePath: string): { type: string; variant: "a" | "t" } {
  const match = pagePath.match(/\/([a-z]{4})-([at])$/);
  if (!match) throw new Error(`Invalid fixture path: ${pagePath}`);
  return { type: match[1], variant: match[2] as "a" | "t" };
}

function longParagraph(type: string, variant: string, moduleId: string, index: number): string {
  return [
    `${type.toUpperCase()}-${variant.toUpperCase()} 在 FermatMind V8.3 写法中被当作一种可讨论的自我理解语言，而不是诊断、筛选或命运说明。`,
    `这个模块 ${moduleId} 的第 ${index} 段会把工作、关系、压力和成长放在同一个现实场景里解释，帮助读者理解这种类型如何判断、行动、复盘和调整。`,
    `内容需要保持第三人称叙事，既有可读性，也有边界感；它可以引用人格研究和测评方法的限制，但不能把 MBTI 当作诊疗工具或用人决策工具。`,
    `这一段还会提醒读者把 Big Five、RIASEC 和职业探索作为交叉参考，而不是用任何单一类型标签替代个人经验、能力、价值观和环境约束。`,
  ].join("");
}

function buildPage(contract: Contract, pagePath: string) {
  const { type, variant } = typeAndVariant(pagePath);
  const opposite = variant === "a" ? "t" : "a";
  return {
    path: pagePath,
    locale: "zh",
    type_code: type,
    variant,
    seo: {
      title: `${type.toUpperCase()}-${variant.toUpperCase()} 人格特点：判断方式、压力反馈与成长路径`,
      description: `理解 ${type.toUpperCase()}-${variant.toUpperCase()} 的思维方式、工作场景、关系沟通和安全使用边界。`,
      primary_keywords: [
        `${type.toUpperCase()}-${variant.toUpperCase()} 人格`,
        `${type.toUpperCase()} ${variant.toUpperCase()}`,
        "MBTI 人格特点",
        "A/T 差异",
        "人格成长",
      ],
      search_intents: ["类型解释", "A/T 差异", "工作沟通", "关系压力"],
    },
    geo_summary: {
      direct_answer: `${type.toUpperCase()}-${variant.toUpperCase()} 适合被理解为一种判断、行动和压力反馈模式，而不是固定标签。`,
      answer_targets: ["是什么", "特点", "优势", "盲区", "职业参考"],
      answer_entities: [
        type.toUpperCase(),
        variant.toUpperCase(),
        "MBTI",
        "Big Five",
        "RIASEC",
        "工作",
        "关系",
        "压力",
      ],
      site_path: pagePath,
      citation_boundary: "学术资料用于限定解释边界，不用于证明职业或关系结果。",
    },
    modules: contract.module_contract.map((module) => ({
      order: module.order,
      id: module.id,
      title: module.title,
      paragraphs: [1, 2, 3, 4].map((index) => longParagraph(type, variant, module.id, index)),
    })),
    faq: Array.from({ length: 10 }, (_, index) => ({
      question: `${type.toUpperCase()}-${variant.toUpperCase()} 常见问题 ${index + 1} 是什么？`,
      answer: `${type.toUpperCase()}-${variant.toUpperCase()} 的第 ${index + 1} 个回答会强调边界、场景和自我校准，避免把人格结果当成诊疗结论、用人决策或人生承诺。`,
    })),
    internal_links: [
      "/zh/tests/mbti-personality-test-16-personality-types",
      "/zh/tests/big-five-personality-test-ocean-model",
      "/zh/articles/riasec-holland-career-interest-test-explained",
      "/zh/careers",
      `/zh/personality/${type}-a-vs-${type}-t`,
      `/zh/personality/${type}-${opposite}`,
    ],
    source_ledger: [
      {
        label: "Personality framework boundary",
        note: "人格类型用于自我理解和沟通，不替代个人经验。",
      },
      {
        label: "Big Five cross-reference",
        note: "Big Five 提供维度参考，不能与 MBTI 互相替代。",
      },
      {
        label: "RIASEC vocational interest model",
        note: "RIASEC 用于职业兴趣探索，不证明职业命运。",
      },
    ],
    qa_self_check: {
      original_wording: true,
      no_competitor_copy: true,
      no_private_route: true,
      no_deterministic_claims: true,
    },
    forbidden_claims_absent: {
      official_affiliation: true,
      clinical_diagnosis: true,
      hiring_screening: true,
      iq_ranking: true,
      deterministic_outcomes: true,
      competitor_copy: true,
    },
  };
}

function buildPackage(contract: Contract) {
  const pages = contract.accepted_target_sets.zh32_full.paths.map((pagePath) => buildPage(contract, pagePath));
  return {
    artifact: "MBTI64-ZH32-V8_3-GPT-CONTENT-PACKAGE",
    generated_at: "2026-06-30",
    locale: "zh",
    framework: "mbti64",
    target_count: 32,
    pages,
    source_ledger: [
      {
        label: "Shared personality content boundary",
        note: "This fixture uses synthetic text for contract validation.",
      },
    ],
    safety_boundary: {
      cms_write: false,
      approval_queue_write: false,
      live_promotion: false,
      publish_index_search: false,
      sitemap_llms_mutation: false,
      search_queue_mutation: false,
      indexnow_submit: false,
      frontend_runtime_change: false,
      url_truth_write: false,
      production_deploy: false,
      external_api_call: false,
    },
  };
}

function runValidator(inputPackage: unknown) {
  const dir = tempDir();
  const input = path.join(dir, "package.json");
  const normalized = path.join(dir, "normalized.json");
  const qa = path.join(dir, "qa.json");
  const md = path.join(dir, "qa.md");
  fs.writeFileSync(input, `${JSON.stringify(inputPackage, null, 2)}\n`);
  const result = spawnSync(
    "node",
    [
      SCRIPT_PATH,
      `--input=${input}`,
      `--output-normalized=${normalized}`,
      `--output-qa=${qa}`,
      `--output-md=${md}`,
    ],
    {
      cwd: ROOT,
      encoding: "utf8",
    },
  );

  return {
    result,
    normalized,
    qa,
    md,
    stdout: result.stdout ? JSON.parse(result.stdout) : null,
    qaJson: fs.existsSync(qa) ? JSON.parse(fs.readFileSync(qa, "utf8")) : null,
  };
}

describe("MBTI64-ZH32-ORIGINAL-V8_3-CONTENT-CONTRACT-QA-01", () => {
  it("has a syntax-valid validator and a machine-readable contract", () => {
    execFileSync("node", ["--check", SCRIPT_PATH], { cwd: ROOT, encoding: "utf8" });
    const contract = readJson<Contract>(CONTRACT_PATH);

    expect(contract.accepted_target_sets.zh32_full.paths).toHaveLength(32);
    expect(contract.accepted_target_sets.zh30_remaining.paths).toHaveLength(30);
    expect(contract.module_contract).toHaveLength(10);
  });

  it("passes a complete zh32 package and emits normalized/QA artifacts", () => {
    const contract = readJson<Contract>(CONTRACT_PATH);
    const inputPackage = buildPackage(contract);
    const { result, stdout, qaJson, normalized, md } = runValidator(inputPackage);

    expect(result.status, result.stderr).toBe(0);
    expect(stdout).toMatchObject({
      ok: true,
      final_decision: "PASS_READY_FOR_FAP_API_ARTIFACT_SYNC",
      package_mode: "zh32_full",
      rows_evaluated: 32,
      rows_passed: 32,
      rows_blocked: 0,
    });
    expect(qaJson.final_decision).toBe("PASS_READY_FOR_FAP_API_ARTIFACT_SYNC");
    expect(qaJson.summary.target_count).toBe(32);
    expect(fs.existsSync(normalized)).toBe(true);
    expect(fs.existsSync(md)).toBe(true);
  });

  it("fails closed when a zh32 page is missing", () => {
    const contract = readJson<Contract>(CONTRACT_PATH);
    const inputPackage = buildPackage(contract);
    inputPackage.pages = inputPackage.pages.filter((page) => page.path !== "/zh/personality/esfp-t");

    const { result, qaJson } = runValidator(inputPackage);

    expect(result.status).toBe(1);
    expect(qaJson.final_decision).toBe("NO_GO_QA_REPAIR_REQUIRED");
    expect(qaJson.blockers.join("\n")).toContain("missing paths: /zh/personality/esfp-t");
  });

  it("fails closed when a required V8.3 module is missing", () => {
    const contract = readJson<Contract>(CONTRACT_PATH);
    const inputPackage = buildPackage(contract);
    inputPackage.pages[0].modules = inputPackage.pages[0].modules.slice(0, 9);

    const { result, qaJson } = runValidator(inputPackage);

    expect(result.status).toBe(1);
    expect(qaJson.final_decision).toBe("NO_GO_QA_REPAIR_REQUIRED");
    expect(qaJson.page_results[0].gates.module_contract_gate.status).toBe("fail");
  });

  it("fails closed on private route leakage", () => {
    const contract = readJson<Contract>(CONTRACT_PATH);
    const inputPackage = buildPackage(contract);
    inputPackage.pages[0].internal_links.push("/zh/result/private-attempt-token");

    const { result, qaJson } = runValidator(inputPackage);

    expect(result.status).toBe(1);
    expect(qaJson.final_decision).toBe("NO_GO_QA_REPAIR_REQUIRED");
    expect(qaJson.page_results[0].gates.private_route_gate.status).toBe("fail");
  });

  it("fails closed on official, clinical, hiring, IQ, or deterministic claims", () => {
    const contract = readJson<Contract>(CONTRACT_PATH);
    const inputPackage = buildPackage(contract);
    inputPackage.pages[0].modules[0].paragraphs[0] +=
      " 这是官方 MBTI 认证解释，可以用于临床诊断、招聘筛选、智商排名，并保证找到完美职业。";

    const { result, qaJson } = runValidator(inputPackage);

    expect(result.status).toBe(1);
    expect(qaJson.final_decision).toBe("NO_GO_QA_REPAIR_REQUIRED");
    expect(qaJson.page_results[0].gates.trademark_affiliation_gate.status).toBe("fail");
    expect(qaJson.page_results[0].gates.clinical_hiring_iq_gate.status).toBe("fail");
    expect(qaJson.page_results[0].gates.deterministic_claim_gate.status).toBe("fail");
  });
});
