import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const MANIFEST_PATH = "docs/seo/generated/en-content-parity-control-master.v1.json";
const SCHEMA_PATH = "docs/seo/generated/en-content-parity-control-master.v1.schema.json";
const PROMPTS_PATH = "docs/seo/generated/en-content-parity-first-wave-prompts.v1.json";
const VALIDATOR_PATH = "scripts/seo/validate-en-content-parity-control.mjs";
const ARTIFACT_FILES = [
  "scope_manifest.json",
  "assets.jsonl",
  "translation_map.json",
  "source_ledger.json",
  "claim_boundary_report.json",
  "editorial_review.json",
  "dry_run_readiness.json",
  "sha256_manifest.json",
  "master_manifest_patch.candidate.json",
  "handoff.md",
];
const IMMUTABLE_PACKAGE_PAYLOAD_FILES = ARTIFACT_FILES.filter(
  (file) => file !== "sha256_manifest.json" && file !== "master_manifest_patch.candidate.json"
);
const REGISTERED_PACKAGE_BACKUPS = new Map<string, string>();

type Permissions = {
  cms_write_authorized: false;
  staging_write_authorized: false;
  production_import_authorized: false;
  public_release_authorized: false;
  seo_runtime_release_authorized: false;
  search_submission_authorized: false;
  master_manifest_write_authorized: false;
};

type GateLineageEntry = {
  status: string;
  evidence_owner_lane_id: string;
  report_ref: string;
  report_sha256: string;
  package_sha256: string;
  accepted_at: string;
};

type Lane = {
  lane_id: string;
  lane_kind: "producer" | "independent_qa";
  launch_state: string;
  status: string;
  blocked_from_status: string | null;
  dependencies: string[];
  output_directory: string;
  counts: {
    cohort_count: number;
    expected_en_assets: number | null;
    current_en_assets: number | null;
    remaining_en_assets: number | null;
    unknown_inventory_cohorts: number;
  };
  package_sha256: string | null;
  qa_report_ref: string | null;
  gate_lineage: GateLineageEntry[];
  blockers: string[];
  next_action: string;
  subscopes: Array<{
    id: string;
    sequence: number;
    resource: string;
    output_subdirectory: string;
    asset_ids: string[];
    status: string;
    blocked_from_status: string | null;
    package_sha256: string | null;
    qa_report_ref: string | null;
    gate_lineage: GateLineageEntry[];
    blockers: string[];
    separate_package_required: true;
    same_pr_allowed: false;
  }>;
  permissions: Permissions;
};

type Asset = {
  asset_id: string;
  lane_id: string;
  asset_type: string;
  translation_group: string;
  locales: string[];
  authority_source: string;
  expected_en_count: number | null;
  current_en_count: number | null;
  remaining_en_count: number | null;
  parity_state: string;
  evidence: string[];
  notes: string;
};

type MasterManifest = {
  artifact_kind: "master_manifest";
  control_id: string;
  is_master: true;
  baseline: {
    frontend: { commit_sha: string };
    backend: { commit_sha: string };
    live: {
      sitemap: {
        total_urls: number;
        zh_urls: number;
        en_urls: number;
        paired_paths: number;
        only_zh_paths: number;
        only_en_paths: number;
      };
      articles: { zh_public: number; en_public: number };
      career_guides: { zh_public: number; en_public: number };
      career_jobs: { zh_index_rows: number; en_index_rows: number };
    };
  };
  state_machine: {
    ordered_states: string[];
    blocked_state: string;
    skip_transitions_allowed: false;
  };
  handoff_contract: {
    required_files: string[];
    leaf_may_edit_master: false;
  };
  existing_state_reference: {
    path: string;
    usage: string;
    copy_or_reset_allowed: false;
  };
  lanes: Lane[];
  assets: Asset[];
  permissions: Permissions;
  launch_policy: {
    first_wave: string[];
    max_concurrent_producer_lanes: number;
  };
  repository_rule_impact: {
    runtime_behavior_changed: false;
    content_authority_changed: false;
    public_exposure_changed: false;
  };
};

function readJson<T>(relativePath: string): T {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), "utf8")) as T;
}

function sha256File(relativePath: string): string {
  return createHash("sha256").update(fs.readFileSync(path.join(ROOT, relativePath))).digest("hex");
}

function sha256AbsoluteFile(filePath: string): string {
  return createHash("sha256").update(fs.readFileSync(filePath)).digest("hex");
}

function packageSha256(files: Array<{ path: string; sha256: string }>): string {
  const canonicalEntries = files.map((file) => `${file.path}:${file.sha256}`).join("\n");
  return createHash("sha256").update(canonicalEntries).digest("hex");
}

function makeW9QaDirectory(): string {
  const authorityDirectory = path.join(ROOT, "generated/en-content-parity/W9-independent-qa");
  fs.mkdirSync(authorityDirectory, { recursive: true });
  return fs.mkdtempSync(path.join(authorityDirectory, "contract-"));
}

function makeControlApprovalDirectory(): string {
  const authorityDirectory = path.join(ROOT, "generated/en-content-parity/CONTROL-approvals");
  fs.mkdirSync(authorityDirectory, { recursive: true });
  return fs.mkdtempSync(path.join(authorityDirectory, "contract-"));
}

function makeW3ArticlesPreBlockManifest(sourceManifest: MasterManifest): {
  directory: string;
  manifestPath: string;
  manifestSha256: string;
} {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w3-pre-block-"));
  const manifestPath = path.join(directory, "master.json");
  const preBlockManifest = structuredClone(sourceManifest);
  const w3 = preBlockManifest.lanes.find((lane) => lane.lane_id === "W3");
  const articles = w3?.subscopes.find((subscope) => subscope.id === "W3-ARTICLES");
  const careerGuides = w3?.subscopes.find((subscope) => subscope.id === "W3-CAREER-GUIDES");
  if (!w3 || !articles || !careerGuides) {
    throw new Error("missing W3 Article pre-block fixture");
  }

  w3.status = "inventory_frozen";
  w3.blocked_from_status = null;
  w3.blockers = [];
  w3.next_action =
    "Submit the exact frozen W3-ARTICLES package to fresh independent W9 QA, and begin W3-CAREER-GUIDES package production as a separate sequential scope without combining either package or gate lineage.";
  articles.status = "package_frozen";
  articles.blocked_from_status = null;
  articles.package_sha256 = "37f9bf4576085b04076db031582d09fef86d71229d596f77df6f73334dd44669";
  articles.qa_report_ref = null;
  articles.gate_lineage = [
    {
      status: "package_frozen",
      evidence_owner_lane_id: "W3",
      report_ref: "generated/en-content-parity/W3-editorial-cms/articles/editorial_review.json",
      report_sha256: "91f26ce51490e07a57e12a4f464818e0b9d1cbb469471eee85e4f595682ccfd3",
      package_sha256: "37f9bf4576085b04076db031582d09fef86d71229d596f77df6f73334dd44669",
      accepted_at: "2026-07-30T22:19:50.000Z",
    },
  ];
  articles.blockers = [];
  careerGuides.status = "inventory_frozen";
  careerGuides.blocked_from_status = null;
  careerGuides.package_sha256 = null;
  careerGuides.qa_report_ref = null;
  careerGuides.gate_lineage = [];
  careerGuides.blockers = [];

  fs.writeFileSync(manifestPath, JSON.stringify(preBlockManifest));
  return {
    directory,
    manifestPath,
    manifestSha256: sha256AbsoluteFile(manifestPath),
  };
}

function makeCurrentW3ArticlesPreBlockManifest(sourceManifest: MasterManifest): {
  directory: string;
  manifestPath: string;
  manifestSha256: string;
} {
  const packageManifest = readJson<{ package_sha256: string }>(
    "generated/en-content-parity/W3-editorial-cms/articles/sha256_manifest.json"
  );
  const packageSha256 = packageManifest.package_sha256;
  const editorialReviewSha256 = sha256File(
    "generated/en-content-parity/W3-editorial-cms/articles/editorial_review.json"
  );
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w3-current-pre-block-"));
  const manifestPath = path.join(directory, "master.json");
  const preBlockManifest = structuredClone(sourceManifest);
  const w3 = preBlockManifest.lanes.find((lane) => lane.lane_id === "W3");
  const articles = w3?.subscopes.find((subscope) => subscope.id === "W3-ARTICLES");
  const careerGuides = w3?.subscopes.find((subscope) => subscope.id === "W3-CAREER-GUIDES");
  if (!w3 || !articles || !careerGuides) {
    throw new Error("missing current W3 Article pre-block fixture");
  }

  w3.status = "inventory_frozen";
  w3.blocked_from_status = null;
  w3.blockers = [];
  articles.status = "package_frozen";
  articles.blocked_from_status = null;
  articles.package_sha256 = packageSha256;
  articles.qa_report_ref = null;
  articles.gate_lineage = [
    {
      status: "package_frozen",
      evidence_owner_lane_id: "W3",
      report_ref: "generated/en-content-parity/W3-editorial-cms/articles/editorial_review.json",
      report_sha256: editorialReviewSha256,
      package_sha256: packageSha256,
      accepted_at: "2026-08-01T12:36:10Z",
    },
  ];
  articles.blockers = [];
  careerGuides.status = "inventory_frozen";
  careerGuides.blocked_from_status = null;
  careerGuides.package_sha256 = null;
  careerGuides.qa_report_ref = null;
  careerGuides.gate_lineage = [];
  careerGuides.blockers = [];

  fs.writeFileSync(manifestPath, JSON.stringify(preBlockManifest));
  return {
    directory,
    manifestPath,
    manifestSha256: sha256AbsoluteFile(manifestPath),
  };
}

function makeRegisteredPackageDirectory(outputDirectory: string): string {
  const packageDirectory = path.join(ROOT, outputDirectory);
  fs.mkdirSync(packageDirectory, { recursive: true });
  const existingArtifacts = [...ARTIFACT_FILES, "external_package"].filter((fileName) =>
    fs.existsSync(path.join(packageDirectory, fileName))
  );
  if (existingArtifacts.length > 0) {
    const backupDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "en-content-parity-contract-package-")
    );
    const movedArtifacts: string[] = [];
    try {
      for (const fileName of existingArtifacts) {
        fs.renameSync(
          path.join(packageDirectory, fileName),
          path.join(backupDirectory, fileName)
        );
        movedArtifacts.push(fileName);
      }
      REGISTERED_PACKAGE_BACKUPS.set(packageDirectory, backupDirectory);
    } catch (error) {
      for (const fileName of movedArtifacts.reverse()) {
        fs.renameSync(
          path.join(backupDirectory, fileName),
          path.join(packageDirectory, fileName)
        );
      }
      fs.rmdirSync(backupDirectory);
      throw error;
    }
  }
  return packageDirectory;
}

function cleanupRegisteredPackageDirectory(
  packageDirectory: string,
  extraFileNames: string[] = []
): void {
  for (const fileName of [...ARTIFACT_FILES, ...extraFileNames]) {
    fs.rmSync(path.join(packageDirectory, fileName), { force: true });
  }
  const backupDirectory = REGISTERED_PACKAGE_BACKUPS.get(packageDirectory);
  if (backupDirectory) {
    for (const fileName of fs.readdirSync(backupDirectory)) {
      fs.renameSync(
        path.join(backupDirectory, fileName),
        path.join(packageDirectory, fileName)
      );
    }
    fs.rmdirSync(backupDirectory);
    REGISTERED_PACKAGE_BACKUPS.delete(packageDirectory);
    return;
  }
  try {
    fs.rmdirSync(packageDirectory);
  } catch {
    // Preserve a pre-existing or non-empty generated directory.
  }
}

function writePackagePayload(
  tempDirectory: string,
  scopeManifest: Record<string, unknown>,
  assets: Asset[],
  payloadAssets: Asset[] = assets,
  ledgerAssets: Asset[] = payloadAssets
): { packageSha256: string; reportSha256: string; shaManifestPath: string } {
  const packageId = String(scopeManifest.package_id);
  const laneId = String(scopeManifest.lane_id);
  const subscopeId = scopeManifest.subscope_id ?? null;
  const ledgerRows = ledgerAssets.flatMap((asset) =>
    Array.from({ length: asset.expected_en_count ?? 0 }, (_, index) => ({
      row_id: `${asset.asset_id}:${index + 1}`,
      asset_id: asset.asset_id,
      source_id: `${asset.translation_group}:${index + 1}`,
    }))
  );
  const payloads = new Map<string, string>([
    ["scope_manifest.json", JSON.stringify(scopeManifest)],
    ["assets.jsonl", payloadAssets.map((asset) => JSON.stringify(asset)).join("\n")],
    ["translation_map.json", JSON.stringify({ lane_id: laneId, package_id: packageId, rows: [] })],
    [
      "source_ledger.json",
      JSON.stringify({
        schema_version: "fermatmind.en_content_parity_source_ledger.v1",
        lane_id: laneId,
        subscope_id: subscopeId,
        package_id: packageId,
        rows: ledgerRows,
      }),
    ],
    [
      "claim_boundary_report.json",
      JSON.stringify({
        schema_version: "fermatmind.en_content_parity_claim_boundary_report.v1",
        lane_id: laneId,
        subscope_id: subscopeId,
        package_id: packageId,
        verdict: "PASS",
      }),
    ],
    [
      "editorial_review.json",
      JSON.stringify({
        schema_version: "fermatmind.en_content_parity_editorial_review.v1",
        lane_id: laneId,
        subscope_id: subscopeId,
        package_id: packageId,
        verdict: "PASS",
      }),
    ],
    ["dry_run_readiness.json", JSON.stringify({ lane_id: laneId, ready: false })],
    ["handoff.md", `# ${packageId}\n`],
  ]);

  for (const [fileName, contents] of payloads) {
    fs.writeFileSync(path.join(tempDirectory, fileName), contents);
  }

  const files = IMMUTABLE_PACKAGE_PAYLOAD_FILES.map((fileName) => ({
    path: fileName,
    sha256: sha256AbsoluteFile(path.join(tempDirectory, fileName)),
  }));
  const aggregateSha256 = packageSha256(files);
  const shaManifestPath = path.join(tempDirectory, "sha256_manifest.json");
  fs.writeFileSync(
    shaManifestPath,
    JSON.stringify({
      schema_version: "fermatmind.en_content_parity_package_sha256_manifest.v1",
      lane_id: laneId,
      subscope_id: subscopeId,
      package_id: packageId,
      files,
      package_sha256: aggregateSha256,
    })
  );

  return {
    packageSha256: aggregateSha256,
    reportSha256: files.find((file) => file.path === "source_ledger.json")?.sha256 ?? "",
    shaManifestPath,
  };
}

function writeExternalPackageSnapshot(
  packageDirectory: string,
  identity: {
    packageId: string;
    laneId: string;
    assetId: string;
    rowCountField: "asset_count" | "inventory_row_count";
    rowCount: number;
  }
): { manifestSha256: string; packageSha256: string; snapshotDirectory: string } {
  const snapshotDirectory = path.join(packageDirectory, "external_package");
  fs.mkdirSync(snapshotDirectory);
  const payloads = new Map([
    ["assets.json", JSON.stringify({ package_id: identity.packageId, rows: identity.rowCount })],
    ["editorial_review.json", JSON.stringify({ package_id: identity.packageId, verdict: "PASS" })],
  ]);
  for (const [fileName, contents] of payloads) {
    fs.writeFileSync(path.join(snapshotDirectory, fileName), contents);
  }
  const files = [...payloads.keys()].map((fileName) => ({
    path: fileName,
    sha256: sha256AbsoluteFile(path.join(snapshotDirectory, fileName)),
  }));
  const externalPackageSha256 = createHash("sha256")
    .update(files.map((file) => `${file.path}\0${file.sha256}\n`).join(""))
    .digest("hex");
  const manifestPath = path.join(snapshotDirectory, "package_manifest.json");
  fs.writeFileSync(
    manifestPath,
    JSON.stringify({
      schema_version: "fermatmind.en_parity.immutable_content_package_manifest.v1",
      package_id: identity.packageId,
      lane_id: identity.laneId,
      asset_id: identity.assetId,
      status: "unpublished_candidate",
      [identity.rowCountField]: identity.rowCount,
      files,
      package_sha256_algorithm:
        "sha256 of the UTF-8 concatenation of each manifest file path, NUL, lowercase file SHA-256, and newline in files[] order",
      package_sha256: externalPackageSha256,
    })
  );
  return {
    manifestSha256: sha256AbsoluteFile(manifestPath),
    packageSha256: externalPackageSha256,
    snapshotDirectory,
  };
}

function collectPermissionValues(value: unknown): Array<[string, unknown]> {
  const found: Array<[string, unknown]> = [];
  const permissionKeys = new Set([
    "cms_write_authorized",
    "staging_write_authorized",
    "production_import_authorized",
    "public_release_authorized",
    "seo_runtime_release_authorized",
    "search_submission_authorized",
    "master_manifest_write_authorized",
  ]);

  function visit(current: unknown, currentPath: string) {
    if (Array.isArray(current)) {
      current.forEach((entry, index) => visit(entry, `${currentPath}/${index}`));
      return;
    }
    if (current === null || typeof current !== "object") {
      return;
    }
    for (const [key, child] of Object.entries(current)) {
      const childPath = `${currentPath}/${key}`;
      if (permissionKeys.has(key)) {
        found.push([childPath, child]);
      }
      visit(child, childPath);
    }
  }

  visit(value, "$");
  return found;
}

function dependencyGraphIsAcyclic(lanes: Lane[]): boolean {
  const graph = new Map(lanes.map((lane) => [lane.lane_id, lane.dependencies]));
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(laneId: string): boolean {
    if (visiting.has(laneId)) {
      return false;
    }
    if (visited.has(laneId)) {
      return true;
    }
    visiting.add(laneId);
    for (const dependency of graph.get(laneId) ?? []) {
      if (!graph.has(dependency) || !visit(dependency)) {
        return false;
      }
    }
    visiting.delete(laneId);
    visited.add(laneId);
    return true;
  }

  return lanes.every((lane) => visit(lane.lane_id));
}

function w1ComparisonsInventoryFixture(source: MasterManifest): MasterManifest {
  const fixture = structuredClone(source);
  const w1 = fixture.lanes.find((lane) => lane.lane_id === "W1");
  const comparisons = w1?.subscopes.find((subscope) => subscope.id === "W1-MBTI-COMPARISONS");
  if (!w1 || !comparisons) {
    throw new Error("missing W1 comparison fixture target");
  }
  comparisons.status = "inventory_frozen";
  comparisons.blocked_from_status = null;
  comparisons.package_sha256 = null;
  comparisons.qa_report_ref = null;
  comparisons.gate_lineage = [];
  comparisons.blockers = [];
  w1.status = "inventory_frozen";
  return fixture;
}

describe("English content parity control master", () => {
  const manifest = readJson<MasterManifest>(MANIFEST_PATH);

  it("keeps V1 as the sole audit master alongside the generated V2 authority", () => {
    const generatedFiles = fs
      .readdirSync(path.join(ROOT, "docs/seo/generated"))
      .filter((name) => /^en-content-parity-control-master\.v\d+\.json$/.test(name));

    expect(generatedFiles).toEqual([
      "en-content-parity-control-master.v1.json",
      "en-content-parity-control-master.v2.json",
    ]);
    expect(manifest.artifact_kind).toBe("master_manifest");
    expect(manifest.control_id).toBe("EN-PARITY-CONTROL-BOOTSTRAP-01");
    expect(manifest.is_master).toBe(true);
    expect(manifest.baseline.frontend.commit_sha).toBe("c8b549636fcde1abbefe3aaddbd3635a7b4bcea6");
    expect(manifest.baseline.backend.commit_sha).toBe("6cca48a754a3dc7ab52cf40851aeb1d6005e4ee8");
    expect(manifest.baseline.live.sitemap).toEqual({
      total_urls: 2645,
      zh_urls: 1366,
      en_urls: 1278,
      paired_paths: 1268,
      only_zh_paths: 98,
      only_en_paths: 10,
    });
    expect(manifest.baseline.live.articles).toEqual({ zh_public: 89, en_public: 23 });
    expect(manifest.baseline.live.career_guides).toEqual({ zh_public: 20, en_public: 0 });
    expect(manifest.baseline.live.career_jobs).toMatchObject({ zh_index_rows: 1046, en_index_rows: 1046 });
  });

  it("registers eight non-overlapping producer lanes and one independent QA lane", () => {
    expect(manifest.lanes.map((lane) => lane.lane_id)).toEqual([
      "W1",
      "W2",
      "W3",
      "W4",
      "W5",
      "W6",
      "W7",
      "W8",
      "W9",
    ]);
    expect(manifest.lanes.filter((lane) => lane.lane_kind === "producer")).toHaveLength(8);
    expect(manifest.lanes.filter((lane) => lane.lane_kind === "independent_qa").map((lane) => lane.lane_id)).toEqual([
      "W9",
    ]);

    const outputDirectories = manifest.lanes.map((lane) => lane.output_directory);
    expect(new Set(outputDirectories).size).toBe(outputDirectories.length);
    expect(dependencyGraphIsAcyclic(manifest.lanes)).toBe(true);
  });

  it("keeps W1 through W4 launch-ready while later producer lanes remain registered", () => {
    const firstWave = manifest.lanes.filter((lane) => ["W1", "W2", "W3"].includes(lane.lane_id));
    const launchReadyProducers = manifest.lanes.filter((lane) =>
      ["W1", "W2", "W3", "W4"].includes(lane.lane_id)
    );
    const registeredProducers = manifest.lanes.filter((lane) =>
      ["W5", "W6", "W7", "W8"].includes(lane.lane_id)
    );
    expect(manifest.launch_policy.first_wave).toEqual(["W1", "W2", "W3"]);
    expect(manifest.launch_policy.max_concurrent_producer_lanes).toBe(3);
    expect(firstWave.every((lane) => lane.launch_state === "launch_ready")).toBe(true);
    expect(launchReadyProducers.every((lane) => lane.launch_state === "launch_ready")).toBe(true);
    expect(registeredProducers.every((lane) => lane.launch_state === "registered")).toBe(true);
    expect(
      firstWave.every(
        (lane) => manifest.state_machine.ordered_states.includes(lane.status) || lane.status === "blocked"
      )
    ).toBe(true);

    const w4 = manifest.lanes.find((lane) => lane.lane_id === "W4");
    expect(w4).toMatchObject({
      launch_state: "launch_ready",
      status: "qa_pass",
      blocked_from_status: null,
      counts: {
        cohort_count: 1,
        expected_en_assets: 14,
        current_en_assets: 0,
        remaining_en_assets: 14,
        unknown_inventory_cohorts: 0,
      },
      package_sha256: "f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb",
      qa_report_ref:
        "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-f3f2463f/independent_qa_report.json",
      gate_lineage: [
        {
          status: "package_frozen",
          evidence_owner_lane_id: "W4",
          report_ref: "generated/en-content-parity/W4-riasec/editorial_review.json",
          report_sha256: "b8e39eebd501e727fd08babbd9367548ba5417a0820c134946da9eef7409c8a5",
          package_sha256: "f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb",
          accepted_at: "2026-08-01T18:52:23Z",
        },
        {
          status: "qa_pass",
          evidence_owner_lane_id: "W9",
          report_ref:
            "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-f3f2463f/independent_qa_report.json",
          report_sha256: "f2c0f83871ecae1ed76bd742f0ddcf20de71f7980c012bc5cd1affe72dd46882",
          package_sha256: "f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb",
          accepted_at: "2026-08-01T20:50:30Z",
        },
      ],
      blockers: [],
      next_action:
        "A separately authorized exact-package importer dry-run contract may now be planned for package SHA f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb; do not perform CMS import, runtime activation, SEO release, or publication.",
    });
    expect(Object.values(w4?.permissions ?? {})).toEqual(Array(7).fill(false));
    expect(JSON.stringify({ package_sha256: w4?.package_sha256, gate_lineage: w4?.gate_lineage })).not.toContain(
      "944ddac51957b38aa6232335f07269cd904c2513348fad652acb5acb0de59e33"
    );
    const w4QaReport = readJson<{
      package_sha256: string;
      verdict: string;
      reviewed_row_count: number;
      qa_pass_authorized: boolean;
    }>("generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-f3f2463f/independent_qa_report.json");
    expect(sha256File("generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-f3f2463f/independent_qa_report.json")).toBe(
      "f2c0f83871ecae1ed76bd742f0ddcf20de71f7980c012bc5cd1affe72dd46882"
    );
    expect(w4QaReport).toMatchObject({
      package_sha256: "f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb",
      verdict: "PASS",
      reviewed_row_count: 1550,
      qa_pass_authorized: false,
    });

    const w4ReworkReset = readJson<{
      $schema: string;
      artifact_kind: string;
      schema_version: string;
      control_owner: string;
      producer_lane_id: string;
      subscope_id: null;
      blocked_package_sha256: string;
      w9_report_ref: string;
      w9_report_sha256: string;
      w9_row_evidence_ref: string;
      w9_row_evidence_sha256: string;
      w9_frozen_ledger_ref: string;
      w9_frozen_ledger_sha256: string;
      proposed_status: string;
      clear_fields: string[];
      permissions: Permissions;
    }>("generated/en-content-parity/CONTROL-approvals/W4-RIASEC/package-rework-reset-944ddac.json");
    expect(w4ReworkReset).toMatchObject({
      $schema: SCHEMA_PATH,
      artifact_kind: "package_rework_reset",
      schema_version: "fermatmind.en_content_parity_package_rework_reset.v1",
      control_owner: "CONTROL",
      producer_lane_id: "W4",
      subscope_id: null,
      blocked_package_sha256: "944ddac51957b38aa6232335f07269cd904c2513348fad652acb5acb0de59e33",
      w9_report_ref:
        "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac/independent_qa_report.json",
      w9_report_sha256: "eb722ec622b2f55734e0a0126a757b57ee0f0c63eecddb4189d1c9b28d16a694",
      w9_row_evidence_ref:
        "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac/row_review_evidence.json",
      w9_row_evidence_sha256: "b0b366808c7259b7ec389824e65a1fc0328a28b3529adf05dd2fece797a97ca9",
      w9_frozen_ledger_ref:
        "generated/en-content-parity/W9-independent-qa/riasec/w4-riasec-944ddac/frozen_package_identity_projection.json",
      w9_frozen_ledger_sha256: "d80a3764f5d0c20ae14814c061bbf85bbe071f5c8d3259e54a47b7d8f3f97de7",
      proposed_status: "package_in_progress",
    });
    expect([...w4ReworkReset.clear_fields].sort()).toEqual([
      "gate_lineage",
      "package_sha256",
      "qa_report_ref",
    ]);
    expect(Object.values(w4ReworkReset.permissions)).toEqual(Array(7).fill(false));
    expect(sha256File(w4ReworkReset.w9_report_ref)).toBe(w4ReworkReset.w9_report_sha256);
    expect(sha256File(w4ReworkReset.w9_row_evidence_ref)).toBe(w4ReworkReset.w9_row_evidence_sha256);
    expect(sha256File(w4ReworkReset.w9_frozen_ledger_ref)).toBe(w4ReworkReset.w9_frozen_ledger_sha256);

    const w4Candidate = JSON.parse(
      fs.readFileSync(
        path.join(ROOT, "generated/en-content-parity/W4-riasec/master_manifest_patch.candidate.json"),
        "utf8"
      )
    ) as {
      base_manifest_sha256: string;
      package_sha256: string;
      proposed_status: string;
      gate_evidence: { row_count: number; asset_ids: string[] };
      asset_updates: Asset[];
      permissions: Permissions;
    };
    expect(w4Candidate).toMatchObject({
      base_manifest_sha256: "5dfa51907860aaee4dabef952e15c4a6cabaa7d72cd47225089d15470b685039",
      package_sha256: "f3f2463fadd827e586d39d42ecd9e6418b7cb7f36a0697eb06dcead8292f54eb",
      proposed_status: "package_frozen",
      gate_evidence: {
        row_count: 14,
        asset_ids: ["ENPARITY-W4-RIASEC-DEEP-ASSETS"],
      },
    });
    expect(w4Candidate.asset_updates).toHaveLength(1);
    expect(w4Candidate.asset_updates[0]).toMatchObject({
      expected_en_count: 14,
      current_en_count: 0,
      remaining_en_count: 14,
    });
    expect(Object.values(w4Candidate.permissions)).toEqual(Array(7).fill(false));

    const w4SourceLedger = JSON.parse(
      fs.readFileSync(path.join(ROOT, "generated/en-content-parity/W4-riasec/source_ledger.json"), "utf8")
    ) as { reconciliation: { source_ledger_logical_rows: number; expanded_atomic_rows: number } };
    const w4TranslationMap = JSON.parse(
      fs.readFileSync(path.join(ROOT, "generated/en-content-parity/W4-riasec/translation_map.json"), "utf8")
    ) as {
      logical_groups: Array<{ group_id: string }>;
      atomic_rows: Array<{ row_id: string }>;
      reconciliation: { logical_group_count: number; atomic_row_count: number };
    };
    const w4SurfaceMatrix = JSON.parse(
      fs.readFileSync(path.join(ROOT, "generated/en-content-parity/W4-riasec/scan/form_surface_matrix.json"), "utf8")
    ) as { surface_totals: { share_rows: number; pdf_rows: number; history_rows: number } };
    const w4PairMatrix = JSON.parse(
      fs.readFileSync(path.join(ROOT, "generated/en-content-parity/W4-riasec/scan/pair_coverage_matrix.json"), "utf8")
    ) as { unordered_pair_count: number };
    expect(w4SourceLedger.reconciliation).toMatchObject({
      source_ledger_logical_rows: 14,
      expanded_atomic_rows: 1550,
    });
    expect(w4TranslationMap.logical_groups).toHaveLength(14);
    expect(w4TranslationMap.atomic_rows).toHaveLength(1550);
    expect(new Set(w4TranslationMap.atomic_rows.map((row) => row.row_id)).size).toBe(1550);
    expect(w4TranslationMap.reconciliation).toMatchObject({ logical_group_count: 14, atomic_row_count: 1550 });
    expect(w4PairMatrix.unordered_pair_count).toBe(15);
    expect(w4SurfaceMatrix.surface_totals).toEqual({ share_rows: 3, pdf_rows: 2, history_rows: 2 });

    const w1 = manifest.lanes.find((lane) => lane.lane_id === "W1");
    expect(
      w1?.subscopes.map((subscope) => ({
        id: subscope.id,
        sequence: subscope.sequence,
        resource: subscope.resource,
        output_subdirectory: subscope.output_subdirectory,
        asset_ids: subscope.asset_ids,
        separate_package_required: subscope.separate_package_required,
        same_pr_allowed: subscope.same_pr_allowed,
      }))
    ).toEqual([
      {
        id: "W1-MBTI-COMPARISONS",
        sequence: 1,
        resource: "MbtiCrossTypeComparisonAuthority",
        output_subdirectory: "comparisons",
        asset_ids: ["ENPARITY-W1-MBTI-CROSS-COMPARISONS"],
        separate_package_required: true,
        same_pr_allowed: false,
      },
      {
        id: "W1-MBTI-RESULT-CONTENT",
        sequence: 2,
        resource: "MbtiResultContentAuthority",
        output_subdirectory: "result-content",
        asset_ids: ["ENPARITY-W1-MBTI-RESULT-CONTENT"],
        separate_package_required: true,
        same_pr_allowed: false,
      },
    ]);
    expect(w1?.status).toBe("dry_run_ready");
    expect(w1?.counts).toEqual({
      cohort_count: 2,
      expected_en_assets: 53,
      current_en_assets: 24,
      remaining_en_assets: 29,
      unknown_inventory_cohorts: 0,
    });

    const w2 = manifest.lanes.find((lane) => lane.lane_id === "W2");
    expect(w2?.status).toBe("qa_pass");
    expect(w2?.blocked_from_status).toBeNull();
    expect(w2?.package_sha256).toBe("a41816a824c30979af7b5ebcb95c689ff71584f7ad2c21df277f127f18eaa82b");
    expect(w2?.qa_report_ref).toBe(
      "generated/en-content-parity/W9-independent-qa/W2-big-five/a41816a8-w9-review/independent_qa_report.json"
    );
    expect(w2?.gate_lineage).toEqual([
      expect.objectContaining({
        status: "package_frozen",
        evidence_owner_lane_id: "W2",
        package_sha256: "a41816a824c30979af7b5ebcb95c689ff71584f7ad2c21df277f127f18eaa82b",
      }),
      expect.objectContaining({
        status: "qa_pass",
        evidence_owner_lane_id: "W9",
        report_ref: "generated/en-content-parity/W9-independent-qa/W2-big-five/a41816a8-w9-review/independent_qa_report.json",
        report_sha256: "3b685f35fdcba089c325b376f7406ef44b5b5abb30a05fc27f8d5c0f1102c2e2",
        package_sha256: "a41816a824c30979af7b5ebcb95c689ff71584f7ad2c21df277f127f18eaa82b",
      }),
    ]);
    expect(w2?.blockers).toEqual([]);
    expect(w2?.counts).toEqual({
      cohort_count: 3,
      expected_en_assets: 118,
      current_en_assets: 118,
      remaining_en_assets: 0,
      unknown_inventory_cohorts: 0,
    });
    expect(w2?.next_action).toBe(
      "Require a separate read-only dry-run gate before any import or release; all permissions remain false."
    );
    expect(
      manifest.assets
        .filter((asset) => asset.lane_id === "W2")
        .map((asset) => [asset.asset_id, asset.expected_en_count, asset.current_en_count, asset.remaining_en_count])
    ).toEqual([
      ["ENPARITY-W2-BIG-FIVE-PUBLIC-PROFILES", 52, 52, 0],
      ["ENPARITY-W2-BIG-FIVE-DRAFTS", 50, 50, 0],
      ["ENPARITY-W2-BIG-FIVE-RESULT-CONTENT", 16, 16, 0],
    ]);
    expect(manifest.assets.find((asset) => asset.asset_id === "ENPARITY-W2-BIG-FIVE-RESULT-CONTENT"))
      .toMatchObject({ parity_state: "en_draft_requires_verification" });

    const w3 = manifest.lanes.find((lane) => lane.lane_id === "W3");
    expect(
      w3?.subscopes.map((subscope) => ({
        id: subscope.id,
        sequence: subscope.sequence,
        resource: subscope.resource,
        output_subdirectory: subscope.output_subdirectory,
        asset_ids: subscope.asset_ids,
        separate_package_required: subscope.separate_package_required,
        same_pr_allowed: subscope.same_pr_allowed,
      }))
    ).toEqual([
      {
        id: "W3-ARTICLES",
        sequence: 1,
        resource: "Article",
        output_subdirectory: "articles",
        asset_ids: ["ENPARITY-W3-ARTICLES"],
        separate_package_required: true,
        same_pr_allowed: false,
      },
      {
        id: "W3-CAREER-GUIDES",
        sequence: 2,
        resource: "CareerGuide",
        output_subdirectory: "career-guides",
        asset_ids: ["ENPARITY-W3-CAREER-GUIDES"],
        separate_package_required: true,
        same_pr_allowed: false,
      },
    ]);
    expect(
      w3?.subscopes.every(
        (subscope) =>
          manifest.state_machine.ordered_states.includes(subscope.status) || subscope.status === "blocked"
      )
    ).toBe(true);
  });

  it("retains the exact W9 reset evidence and accepts the separately frozen W3 packages", () => {
    const packageSha256 = "2c228eae88ce6fc3edb32c1dda9aabf1e2d51d6a885ef7b90d4a7c1864c0e33e";
    const w9ReportPath =
      "generated/en-content-parity/W9-independent-qa/articles/w3-articles-2c228eae/qa_report.json";
    const w9ReportSha256 = "f9684362929ba66f9f9570ca71bbf72ff1e0027de757d4440581fe655138b9b1";
    const w9RowMatrixPath =
      "generated/en-content-parity/W9-independent-qa/articles/w3-articles-2c228eae/qa_row_matrix.json";
    const w9RowMatrixSha256 = "1a7c5619d083846c9cc57670e29a48fc2245c8647cfccb5613aaa01a4ea78e17";
    const frozenLedgerPath =
      "generated/en-content-parity/W9-independent-qa/articles/w3-articles-2c228eae/frozen_source_ledger_identity_projection.json";
    const frozenLedgerSha256 = "8215a091ccf3f06abf69c7c289a20686e7caa2a2524a02d225a1e9180b228e96";
    const resetApproval = readJson<{
      artifact_kind: string;
      blocked_package_sha256: string;
      w9_report_ref: string;
      w9_report_sha256: string;
      w9_row_evidence_ref: string;
      w9_row_evidence_sha256: string;
      w9_frozen_ledger_ref: string;
      w9_frozen_ledger_sha256: string;
      proposed_status: string;
      clear_fields: string[];
      permissions: Permissions;
    }>("generated/en-content-parity/CONTROL-approvals/W3-ARTICLES/package-rework-reset-2c228eae.json");
    const refrozenCandidate = readJson<{
      base_manifest_sha256: string;
      package_sha256: string;
      proposed_status: string;
      gate_evidence: {
        report_sha256: string;
        row_count: number;
        rework_10_source_evidence_package_sha256: string;
        repaired_stable_asset_identity: string;
      };
      permissions: Permissions;
    }>("generated/en-content-parity/W3-editorial-cms/articles/master_manifest_patch.candidate.json");
    const w3 = manifest.lanes.find((lane) => lane.lane_id === "W3");
    const articles = w3?.subscopes.find((subscope) => subscope.id === "W3-ARTICLES");
    const careerGuides = w3?.subscopes.find((subscope) => subscope.id === "W3-CAREER-GUIDES");

    expect(resetApproval).toMatchObject({
      artifact_kind: "package_rework_reset",
      blocked_package_sha256: packageSha256,
      w9_report_ref: w9ReportPath,
      w9_report_sha256: w9ReportSha256,
      w9_row_evidence_ref: w9RowMatrixPath,
      w9_row_evidence_sha256: w9RowMatrixSha256,
      w9_frozen_ledger_ref: frozenLedgerPath,
      w9_frozen_ledger_sha256: frozenLedgerSha256,
      proposed_status: "package_in_progress",
      clear_fields: ["package_sha256", "qa_report_ref", "gate_lineage"],
    });
    expect(Object.values(resetApproval.permissions)).toEqual(Array(7).fill(false));
    expect(refrozenCandidate).toMatchObject({
      base_manifest_sha256: "5dfa51907860aaee4dabef952e15c4a6cabaa7d72cd47225089d15470b685039",
      package_sha256: "d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a",
      proposed_status: "package_frozen",
      gate_evidence: {
        report_sha256: "753caafa4c979a335aac2cd3b1ebc11ca70f2aa9246c2696ea1a947ff1554c6e",
        row_count: 17,
        rework_10_source_evidence_package_sha256:
          "480523fc03dc09927d420de306aca193da707b32584d84b6ee07701605fec061",
        repaired_stable_asset_identity: "Article:53",
      },
    });
    expect(Object.values(refrozenCandidate.permissions)).toEqual(Array(7).fill(false));
    expect(sha256File(w9ReportPath)).toBe(w9ReportSha256);
    expect(sha256File(w9RowMatrixPath)).toBe(w9RowMatrixSha256);
    expect(sha256File(frozenLedgerPath)).toBe(frozenLedgerSha256);
    expect(w3).toMatchObject({
      launch_state: "launch_ready",
      status: "package_frozen",
      blocked_from_status: null,
      counts: {
        cohort_count: 2,
        expected_en_assets: 37,
        current_en_assets: 0,
        remaining_en_assets: 37,
        unknown_inventory_cohorts: 0,
      },
      package_sha256: null,
      qa_report_ref: null,
      gate_lineage: [],
      blockers: [],
    });
    expect(articles).toMatchObject({
      status: "qa_pass",
      blocked_from_status: null,
      package_sha256: "d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a",
      qa_report_ref:
        "generated/en-content-parity/W9-independent-qa/articles/w3-articles-d70e468b/independent_qa_report.json",
      gate_lineage: [
        {
          status: "package_frozen",
          evidence_owner_lane_id: "W3",
          report_ref: "generated/en-content-parity/W3-editorial-cms/articles/editorial_review.json",
          report_sha256: "753caafa4c979a335aac2cd3b1ebc11ca70f2aa9246c2696ea1a947ff1554c6e",
          package_sha256: "d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a",
        },
        {
          status: "qa_pass",
          evidence_owner_lane_id: "W9",
          report_ref:
            "generated/en-content-parity/W9-independent-qa/articles/w3-articles-d70e468b/independent_qa_report.json",
          report_sha256: "a286486e040b410a28224732e6a4cf61d42255db43e92bba3905bdf0af52caf4",
          package_sha256: "d70e468bb1a07d74e786e5a93b5279feff5347be49a0264916408a6b2ccbdc9a",
        },
      ],
      blockers: [],
    });
    expect(careerGuides).toMatchObject({
      id: "W3-CAREER-GUIDES",
      sequence: 2,
      resource: "CareerGuide",
      output_subdirectory: "career-guides",
      asset_ids: ["ENPARITY-W3-CAREER-GUIDES"],
      status: "package_frozen",
      blocked_from_status: null,
      package_sha256: "0b6728c9a07e9404d0de57698f0f8b59616358ba91e456d1be848a1fe167ca7c",
      qa_report_ref: null,
      gate_lineage: [
        {
          status: "package_frozen",
          evidence_owner_lane_id: "W3",
          report_ref: "generated/en-content-parity/W3-editorial-cms/career-guides/editorial_review.json",
          report_sha256: "137c719a434aa795c41332d89bdd4c10b5e6f2879b4ed5f98a5d0ebcb69fe402",
          package_sha256: "0b6728c9a07e9404d0de57698f0f8b59616358ba91e456d1be848a1fe167ca7c",
        },
      ],
      blockers: [],
      separate_package_required: true,
      same_pr_allowed: false,
    });
    expect(w3?.package_sha256).toBeNull();
    expect(w3?.qa_report_ref).toBeNull();
    expect(w3?.gate_lineage).toEqual([]);
    expect(w3?.next_action).toContain("EN-PARITY-W9-W3-CAREER-GUIDES-INDEPENDENT-QA-01");
    expect(w3?.next_action).toContain("0b6728c9a07e9404d0de57698f0f8b59616358ba91e456d1be848a1fe167ca7c");
    expect(Object.values(w3?.permissions ?? {})).toEqual(Array(7).fill(false));
  });

  it("keeps asset IDs and translation groups unique and reconciles every known count", () => {
    const assetIds = manifest.assets.map((asset) => asset.asset_id);
    const translationGroups = manifest.assets.map((asset) => asset.translation_group);
    expect(new Set(assetIds).size).toBe(assetIds.length);
    expect(new Set(translationGroups).size).toBe(translationGroups.length);

    for (const laneId of ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"]) {
      expect(manifest.assets.some((asset) => asset.lane_id === laneId)).toBe(true);
    }

    for (const asset of manifest.assets) {
      const counts = [asset.expected_en_count, asset.current_en_count, asset.remaining_en_count];
      const allKnown = counts.every((value) => Number.isInteger(value));
      const allNull = counts.every((value) => value === null);
      expect(allKnown || allNull, asset.asset_id).toBe(true);
      if (allKnown) {
        expect(asset.expected_en_count, asset.asset_id).toBe(
          (asset.current_en_count as number) + (asset.remaining_en_count as number)
        );
      }
    }
  });

  it("keeps every write, import, release, search, and master-edit permission false", () => {
    const permissions = collectPermissionValues(manifest);
    expect(permissions.length).toBeGreaterThan(0);
    expect(permissions.filter(([, value]) => value !== false)).toEqual([]);
    expect(manifest.handoff_contract.leaf_may_edit_master).toBe(false);
    expect(manifest.repository_rule_impact).toMatchObject({
      runtime_behavior_changed: false,
      content_authority_changed: false,
      public_exposure_changed: false,
    });
  });

  it("references the existing career state in place without modifying or replacing it", () => {
    expect(manifest.existing_state_reference).toEqual({
      path: "generated/fermatmind-content-agent-state/",
      usage: "reference_existing_career_state_without_duplication",
      copy_or_reset_allowed: false,
    });
    expect(fs.existsSync(path.join(ROOT, manifest.existing_state_reference.path, "global_content_state.json"))).toBe(true);

    const changedStateFiles = execFileSync(
      "git",
      ["diff", "HEAD", "--name-only", "--", "generated/fermatmind-content-agent-state"],
      { cwd: ROOT, encoding: "utf8" }
    ).trim();
    expect(changedStateFiles).toBe("");
  });

  it("freezes the ordered no-skip state machine and ten-file handoff contract", () => {
    expect(manifest.state_machine).toEqual({
      ordered_states: [
        "not_started",
        "inventory_frozen",
        "package_in_progress",
        "package_frozen",
        "qa_pass",
        "dry_run_ready",
        "draft_imported",
        "editorial_approved",
        "published",
        "live_qa_pass",
      ],
      blocked_state: "blocked",
      skip_transitions_allowed: false,
    });
    expect(manifest.handoff_contract.required_files).toEqual([
      "scope_manifest.json",
      "assets.jsonl",
      "translation_map.json",
      "source_ledger.json",
      "claim_boundary_report.json",
      "editorial_review.json",
      "dry_run_readiness.json",
      "sha256_manifest.json",
      "master_manifest_patch.candidate.json",
      "handoff.md",
    ]);
  });

  it("ships complete immutable launch prompts for W1, W2, and W3", () => {
    const bundle = readJson<{
      control_id: string;
      prompts: Array<{ lane_id: string; output_directory: string; prompt: string; acceptance: string[] }>;
    }>(PROMPTS_PATH);

    expect(bundle.control_id).toBe("EN-PARITY-CONTROL-BOOTSTRAP-01");
    expect(bundle.prompts.map((prompt) => prompt.lane_id)).toEqual(["W1", "W2", "W3"]);
    for (const prompt of bundle.prompts) {
      expect(prompt.output_directory).toMatch(/^generated\/en-content-parity\/W[1-3]-/);
      expect(prompt.prompt.length).toBeGreaterThan(800);
      expect(prompt.prompt).toContain("master_manifest_patch.candidate.json");
      expect(prompt.acceptance.length).toBeGreaterThanOrEqual(5);
    }
    const w1Prompt = bundle.prompts.find((prompt) => prompt.lane_id === "W1");
    expect(w1Prompt?.prompt).toContain("W1-MBTI-COMPARISONS");
    expect(w1Prompt?.prompt).toContain("generated/en-content-parity/W1-mbti/comparisons/");
    expect(w1Prompt?.prompt).toContain("W1-MBTI-RESULT-CONTENT");
    expect(w1Prompt?.prompt).toContain("generated/en-content-parity/W1-mbti/result-content/");
    expect(w1Prompt?.prompt).toContain("Never combine these scopes");
    expect(w1Prompt?.acceptance.join("\n")).toContain("distinct subdirectories");
  });

  it("passes the shared Schema and invariant validator", () => {
    expect(fs.existsSync(path.join(ROOT, SCHEMA_PATH))).toBe(true);
    const output = execFileSync("node", [VALIDATOR_PATH], {
      cwd: ROOT,
      encoding: "utf8",
    });
    const report = JSON.parse(output) as {
      ok: boolean;
      lane_count: number;
      producer_lane_count: number;
      qa_lane_count: number;
      errors: string[];
    };

    expect(report).toMatchObject({
      ok: true,
      lane_count: 9,
      producer_lane_count: 8,
      qa_lane_count: 1,
      errors: [],
    });
  });

  it("rejects drift in the registered split-package tuples and output uniqueness", () => {
    const mutations: Array<{
      mutate: (candidate: MasterManifest) => void;
      expectedError: string;
    }> = [
      {
        mutate: (candidate) => {
          const w1 = candidate.lanes.find((lane) => lane.lane_id === "W1");
          const result = w1?.subscopes.find(
            (subscope) => subscope.id === "W1-MBTI-RESULT-CONTENT"
          );
          if (result) result.sequence = 1;
        },
        expectedError: "W1 must retain its complete ordered independent package registry",
      },
      {
        mutate: (candidate) => {
          const w1 = candidate.lanes.find((lane) => lane.lane_id === "W1");
          const result = w1?.subscopes.find(
            (subscope) => subscope.id === "W1-MBTI-RESULT-CONTENT"
          );
          if (result) result.output_subdirectory = "comparisons";
        },
        expectedError: "W1 subscope output directories must be unique",
      },
      {
        mutate: (candidate) => {
          const w1 = candidate.lanes.find((lane) => lane.lane_id === "W1");
          const comparisons = w1?.subscopes.find(
            (subscope) => subscope.id === "W1-MBTI-COMPARISONS"
          );
          if (comparisons) comparisons.resource = "MbtiResultContentAuthority";
        },
        expectedError: "W1 must retain its complete ordered independent package registry",
      },
      {
        mutate: (candidate) => {
          const w1 = candidate.lanes.find((lane) => lane.lane_id === "W1");
          const comparisons = w1?.subscopes.find(
            (subscope) => subscope.id === "W1-MBTI-COMPARISONS"
          );
          if (comparisons) {
            comparisons.asset_ids = ["ENPARITY-W1-MBTI-RESULT-CONTENT"];
          }
        },
        expectedError: "W1 must retain its complete ordered independent package registry",
      },
    ];

    for (const [index, mutation] of mutations.entries()) {
      const tempDirectory = fs.mkdtempSync(
        path.join(os.tmpdir(), `en-parity-control-registry-drift-${index}-`)
      );
      const candidatePath = path.join(tempDirectory, "master.json");
      const candidate = structuredClone(manifest);
      mutation.mutate(candidate);
      fs.writeFileSync(candidatePath, JSON.stringify(candidate));

      try {
        let output = "";
        try {
          execFileSync("node", [VALIDATOR_PATH, "--manifest", candidatePath], {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          });
        } catch (error) {
          output = (error as { stdout?: string }).stdout ?? "";
        }
        expect(JSON.parse(output).errors.join("\n")).toContain(
          mutation.expectedError
        );
      } finally {
        fs.rmSync(tempDirectory, { recursive: true, force: true });
      }
    }
  });

  it("continues to validate after the control window advances a master lane", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-progressed-master-"));
    const progressedManifestPath = path.join(tempDirectory, "en-content-parity-control-master.v1.json");
    const progressedManifest = structuredClone(manifest);
    const w1 = progressedManifest.lanes.find((lane) => lane.lane_id === "W1");
    if (!w1) {
      throw new Error("missing W1 lane fixture");
    }
    w1.status = "dry_run_ready";
    let expectedTotal = 0;
    let currentTotal = 0;
    let remainingTotal = 0;
    progressedManifest.assets = progressedManifest.assets.map((asset) => {
      if (asset.lane_id !== "W1") {
        return asset;
      }
      const frozenAsset =
        asset.parity_state === "inventory_required"
          ? {
              ...asset,
              expected_en_count: 16,
              current_en_count: 0,
              remaining_en_count: 16,
              parity_state: "en_missing",
            }
          : asset;
      expectedTotal += frozenAsset.expected_en_count ?? 0;
      currentTotal += frozenAsset.current_en_count ?? 0;
      remainingTotal += frozenAsset.remaining_en_count ?? 0;
      return frozenAsset;
    });
    w1.counts = {
      cohort_count: 2,
      expected_en_assets: expectedTotal,
      current_en_assets: currentTotal,
      remaining_en_assets: remainingTotal,
      unknown_inventory_cohorts: 0,
    };
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

    try {
      const output = execFileSync("node", [VALIDATOR_PATH, "--manifest", progressedManifestPath], {
        cwd: ROOT,
        encoding: "utf8",
      });
      expect(JSON.parse(output)).toMatchObject({
        ok: true,
        checked_artifacts: [progressedManifestPath],
        errors: [],
      });
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects a progressed master that omits frozen-package and QA gate lineage", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-missing-lineage-"));
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    const progressedManifest = structuredClone(manifest);
    const w3 = progressedManifest.lanes.find((lane) => lane.lane_id === "W3");
    const articles = w3?.subscopes.find((subscope) => subscope.id === "W3-ARTICLES");
    if (!w3 || !articles) {
      throw new Error("missing W3 Article subscope fixture");
    }
    articles.status = "qa_pass";
    articles.package_sha256 = null;
    articles.qa_report_ref = null;
    articles.gate_lineage = [];
    w3.status = "inventory_frozen";
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

    try {
      let output = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--manifest", progressedManifestPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("package_frozen and later states require package_sha256");
      expect(report.errors.join("\n")).toContain("gate lineage must contain every achieved state");
      expect(report.errors.join("\n")).toContain("qa_pass and later states require qa_report_ref");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("requires structured W9 lineage when a frozen package enters blocked", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-blocked-lineage-"));
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    const progressedManifest = structuredClone(manifest);
    const w3 = progressedManifest.lanes.find((lane) => lane.lane_id === "W3");
    const articles = w3?.subscopes.find((subscope) => subscope.id === "W3-ARTICLES");
    if (!w3 || !articles) {
      throw new Error("missing W3 Article blocked-lineage fixture");
    }
    w3.status = "blocked";
    w3.blocked_from_status = "inventory_frozen";
    articles.status = "blocked";
    articles.blocked_from_status = "package_frozen";
    articles.package_sha256 =
      "37f9bf4576085b04076db031582d09fef86d71229d596f77df6f73334dd44669";
    articles.qa_report_ref = null;
    articles.gate_lineage = [
      {
        status: "package_frozen",
        evidence_owner_lane_id: "W3",
        report_ref: "generated/en-content-parity/W3-editorial-cms/articles/editorial_review.json",
        report_sha256:
          "91f26ce51490e07a57e12a4f464818e0b9d1cbb469471eee85e4f595682ccfd3",
        package_sha256:
          "37f9bf4576085b04076db031582d09fef86d71229d596f77df6f73334dd44669",
        accepted_at: "2026-07-30T22:19:50.000Z",
      },
      {
        status: "blocked",
        evidence_owner_lane_id: "W9",
        report_ref:
          "generated/en-content-parity/W9-independent-qa/articles/w3-articles-37f9bf45/independent_qa_report.json",
        report_sha256:
          "c719183f9cba94d50b61bb4064c35754bcb36e8224f9270039267c6dd4d2b0e4",
        package_sha256:
          "37f9bf4576085b04076db031582d09fef86d71229d596f77df6f73334dd44669",
        accepted_at: "2026-07-31T04:57:53.000Z",
      },
    ];
    const blockedEntry = articles.gate_lineage.find((entry) => entry.status === "blocked");
    expect(blockedEntry).toMatchObject({
      evidence_owner_lane_id: "W9",
      report_ref:
        "generated/en-content-parity/W9-independent-qa/articles/w3-articles-37f9bf45/independent_qa_report.json",
      report_sha256: "c719183f9cba94d50b61bb4064c35754bcb36e8224f9270039267c6dd4d2b0e4",
      package_sha256: "37f9bf4576085b04076db031582d09fef86d71229d596f77df6f73334dd44669",
    });
    articles.gate_lineage = articles.gate_lineage.filter((entry) => entry.status !== "blocked");
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

    try {
      let output = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--manifest", progressedManifestPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain(
        "gate lineage must contain every achieved state from package_frozen without gaps"
      );
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("allows producer-owned structured lineage for producer-originated blockers", () => {
    const tempDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "en-parity-control-producer-blocked-lineage-")
    );
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    const progressedManifest = structuredClone(manifest);
    const w3 = progressedManifest.lanes.find((lane) => lane.lane_id === "W3");
    const articles = w3?.subscopes.find((subscope) => subscope.id === "W3-ARTICLES");
    if (!w3 || !articles) {
      throw new Error("missing W3 Article producer-blocked lineage fixture");
    }
    w3.status = "blocked";
    w3.blocked_from_status = "inventory_frozen";
    articles.status = "blocked";
    articles.blocked_from_status = "package_frozen";
    articles.package_sha256 =
      "37f9bf4576085b04076db031582d09fef86d71229d596f77df6f73334dd44669";
    articles.qa_report_ref = null;
    articles.gate_lineage = [
      {
        status: "package_frozen",
        evidence_owner_lane_id: "W3",
        report_ref: "generated/en-content-parity/W3-editorial-cms/articles/editorial_review.json",
        report_sha256:
          "91f26ce51490e07a57e12a4f464818e0b9d1cbb469471eee85e4f595682ccfd3",
        package_sha256:
          "37f9bf4576085b04076db031582d09fef86d71229d596f77df6f73334dd44669",
        accepted_at: "2026-07-30T22:19:50.000Z",
      },
      {
        status: "blocked",
        evidence_owner_lane_id: "W3",
        report_ref: "generated/en-content-parity/W3-editorial-cms/articles/editorial_review.json",
        report_sha256:
          "91f26ce51490e07a57e12a4f464818e0b9d1cbb469471eee85e4f595682ccfd3",
        package_sha256:
          "37f9bf4576085b04076db031582d09fef86d71229d596f77df6f73334dd44669",
        accepted_at: "2026-07-31T04:57:53.000Z",
      },
    ];
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

    try {
      const output = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", progressedManifestPath],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("retains and restores the pre-block state through an explicit recovery transition", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-block-recovery-"));
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W3-editorial-cms/articles/"
    );
    const candidatePath = path.join(packageDirectory, "master_manifest_patch.candidate.json");
    const recoveryReportPath = path.join(tempDirectory, "recovery-report.json");
    const progressedManifest = structuredClone(manifest);
    const w3 = progressedManifest.lanes.find((lane) => lane.lane_id === "W3");
    const articles = w3?.subscopes.find((subscope) => subscope.id === "W3-ARTICLES");
    const articleAsset = progressedManifest.assets.find((asset) => asset.asset_id === "ENPARITY-W3-ARTICLES");
    if (!w3 || !articles || !articleAsset) {
      throw new Error("missing W3 Article recovery fixture");
    }
    articles.status = "inventory_frozen";
    articles.blocked_from_status = null;
    articles.package_sha256 = null;
    articles.qa_report_ref = null;
    articles.gate_lineage = [];
    w3.status = "blocked";
    w3.blocked_from_status = "inventory_frozen";
    articles.status = "blocked";
    articles.blocked_from_status = "inventory_frozen";
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W3",
      subscope_id: "W3-ARTICLES",
      package_id: "W3-ARTICLES-recovery",
      status: "inventory_frozen",
      output_directory: "generated/en-content-parity/W3-editorial-cms/articles/",
      artifact_files: ARTIFACT_FILES,
      assets: [articleAsset],
      permissions,
    };
    const packageEvidence = writePackagePayload(packageDirectory, scopeManifest, [articleAsset]);
    fs.writeFileSync(
      recoveryReportPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "transition_gate_report",
        schema_version: "fermatmind.en_content_parity_transition_gate_report.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        owner_lane_id: "W3",
        producer_lane_id: "W3",
        subscope_id: "W3-ARTICLES",
        package_sha256: packageEvidence.packageSha256,
        gate: "inventory_frozen",
        verdict: "PASS",
        permissions,
      })
    );
    fs.writeFileSync(
      candidatePath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W3",
        subscope_id: "W3-ARTICLES",
        package_id: "W3-ARTICLES-recovery",
        base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "inventory_frozen",
        gate_evidence: {
          gate: "inventory_frozen",
          report_path: recoveryReportPath,
          report_sha256: sha256AbsoluteFile(recoveryReportPath),
          report_in_package: false,
          owner_lane_id: "W3",
          verdict: "PASS",
          asset_ids: [articleAsset.asset_id],
          row_count: articleAsset.expected_en_count ?? 0,
        },
        asset_updates: [articleAsset],
        permissions,
      })
    );

    try {
      const output = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory);
    }
  });

  it("validates the standalone W9 independent QA report contract", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w9-"));
    const qaAuthorityDirectory = makeW9QaDirectory();
    const qaReportPath = path.join(qaAuthorityDirectory, "independent-qa-report.json");
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    const progressedManifest = w1ComparisonsInventoryFixture(manifest);
    const w1 = progressedManifest.lanes.find((lane) => lane.lane_id === "W1");
    const comparisons = w1?.subscopes.find((subscope) => subscope.id === "W1-MBTI-COMPARISONS");
    const assets = progressedManifest.assets
      .filter((entry) => entry.asset_id === "ENPARITY-W1-MBTI-CROSS-COMPARISONS");
    if (!w1 || !comparisons || assets.length === 0) {
      throw new Error("missing W1 asset fixtures");
    }
    const expectedRows = assets.reduce((total, asset) => total + (asset.expected_en_count ?? 0), 0);
    w1.status = "blocked";
    w1.blocked_from_status = "inventory_frozen";
    comparisons.status = "blocked";
    comparisons.blocked_from_status = "package_frozen";
    comparisons.package_sha256 = "a".repeat(64);
    comparisons.gate_lineage = [
      {
        status: "package_frozen",
        evidence_owner_lane_id: "W1",
        report_ref: "fixture://package-frozen",
        report_sha256: "b".repeat(64),
        package_sha256: "a".repeat(64),
        accepted_at: "2026-07-30T12:00:00.000Z",
      },
      {
        status: "blocked",
        evidence_owner_lane_id: "W9",
        report_ref: "fixture://w9-blocker",
        report_sha256: "c".repeat(64),
        package_sha256: "a".repeat(64),
        accepted_at: "2026-07-30T12:05:00.000Z",
      },
    ];
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    fs.writeFileSync(
      qaReportPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "independent_qa_report",
        schema_version: "fermatmind.en_content_parity_independent_qa_report.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        qa_lane_id: "W9",
        output_directory: "generated/en-content-parity/W9-independent-qa/",
        producer_lane_id: "W1",
        subscope_id: "W1-MBTI-COMPARISONS",
        package_sha256: "a".repeat(64),
        verdict: "BLOCKED",
        reviewed_asset_ids: assets.map((asset) => asset.asset_id),
        reviewed_row_count: expectedRows,
        checks: {
          language_naturalness: "BLOCKED",
          chinese_leakage: "PASS",
          claim_boundary: "PASS",
          asset_duplication: "PASS",
          field_leakage: "PASS",
          page_api_alignment: "PASS",
        },
        permissions,
      })
    );

    try {
      const output = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", qaReportPath],
        {
        cwd: ROOT,
        encoding: "utf8",
        }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      fs.rmSync(qaAuthorityDirectory, { recursive: true, force: true });
    }
  });

  it("accepts a W9-owned blocker candidate only with exact report and row-evidence SHAs", () => {
    const candidateDirectory = makeW9QaDirectory();
    const baseManifest = makeW3ArticlesPreBlockManifest(manifest);
    const candidatePath = path.join(candidateDirectory, "master_manifest_patch.candidate.json");
    const checkedInCandidatePath = path.join(
      ROOT,
      "generated/en-content-parity/W9-independent-qa/articles/w3-articles-37f9bf45/master_manifest_patch.candidate.json"
    );
    const candidate = JSON.parse(fs.readFileSync(checkedInCandidatePath, "utf8")) as {
      base_manifest_sha256: string;
      proposed_status: string;
      gate_evidence: {
        owner_lane_id: string;
        verdict: string;
        row_count: number;
        report_path: string;
        report_sha256: string;
        row_evidence: { path: string; sha256: string };
      };
      permissions: Permissions;
    };
    const checkedInDirectory = path.dirname(checkedInCandidatePath);
    const qaReportPath = path.join(candidateDirectory, "independent_qa_report.json");
    const rowEvidencePath = path.join(candidateDirectory, "article_17_row_review_evidence.json");
    const qaReport = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "independent_qa_report.json"), "utf8")
    ) as { permissions: Record<string, boolean> };
    const rowEvidence = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "article_17_row_review_evidence.json"), "utf8")
    ) as {
      permissions: Record<string, boolean>;
      required_checks: Record<string, string>;
    };
    qaReport.permissions = Object.fromEntries(Object.entries(qaReport.permissions).reverse());
    rowEvidence.permissions = Object.fromEntries(Object.entries(rowEvidence.permissions).reverse());
    rowEvidence.required_checks = Object.fromEntries(
      Object.entries(rowEvidence.required_checks).reverse()
    );
    candidate.base_manifest_sha256 = baseManifest.manifestSha256;
    fs.writeFileSync(qaReportPath, JSON.stringify(qaReport));
    fs.writeFileSync(rowEvidencePath, JSON.stringify(rowEvidence));
    candidate.gate_evidence.report_path = qaReportPath;
    candidate.gate_evidence.report_sha256 = sha256AbsoluteFile(qaReportPath);
    candidate.gate_evidence.row_evidence.path = rowEvidencePath;
    candidate.gate_evidence.row_evidence.sha256 = sha256AbsoluteFile(rowEvidencePath);
    fs.writeFileSync(candidatePath, JSON.stringify(candidate));
    const liveProducerScopeManifestPath = path.join(
      ROOT,
      "generated/en-content-parity/W3-editorial-cms/articles/scope_manifest.json"
    );
    const liveProducerScopeManifestBackupPath = path.join(
      candidateDirectory,
      "live-producer-scope-manifest.backup.json"
    );
    fs.renameSync(liveProducerScopeManifestPath, liveProducerScopeManifestBackupPath);

    try {
      const output = execFileSync(
        "node",
        [
          VALIDATOR_PATH,
          "--manifest",
          baseManifest.manifestPath,
          "--artifact",
          candidatePath,
        ],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
      expect(candidate).toMatchObject({
        proposed_status: "blocked",
        gate_evidence: {
          owner_lane_id: "W9",
          verdict: "BLOCKED",
          row_count: 17,
        },
      });
      expect(Object.values(candidate.permissions)).toEqual(
        Array(Object.keys(candidate.permissions).length).fill(false)
      );

      candidate.gate_evidence.row_evidence.sha256 = "0".repeat(64);
      fs.writeFileSync(candidatePath, JSON.stringify(candidate));
      let failedOutput = "";
      try {
        execFileSync(
          "node",
          [
            VALIDATOR_PATH,
            "--manifest",
            baseManifest.manifestPath,
            "--artifact",
            candidatePath,
          ],
          {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          }
        );
      } catch (error) {
        failedOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(failedOutput).errors.join("\n")).toContain("W9 row evidence SHA mismatch");
    } finally {
      fs.renameSync(liveProducerScopeManifestBackupPath, liveProducerScopeManifestPath);
      fs.rmSync(candidateDirectory, { recursive: true, force: true });
      fs.rmSync(baseManifest.directory, { recursive: true, force: true });
    }
  });

  it("accepts candidate-only page/API evidence as NOT_APPLICABLE without treating it as a blocker", () => {
    const candidateDirectory = makeW9QaDirectory();
    const baseManifest = makeCurrentW3ArticlesPreBlockManifest(manifest);
    const checkedInDirectory = path.join(
      ROOT,
      "generated/en-content-parity/W9-independent-qa/articles/w3-articles-2c228eae"
    );
    const candidatePath = path.join(candidateDirectory, "master_manifest_patch.candidate.json");
    const qaReportPath = path.join(candidateDirectory, "qa_report.json");
    const rowEvidencePath = path.join(candidateDirectory, "qa_row_matrix.json");
    const candidate = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "master_manifest_patch.candidate.json"), "utf8")
    ) as {
      base_manifest_sha256: string;
      package_id: string;
      package_sha256: string;
      gate_evidence: {
        report_path: string;
        report_sha256: string;
        row_evidence: { path: string; sha256: string };
      };
    };
    const qaReport = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "qa_report.json"), "utf8")
    ) as {
      package_sha256: string;
      checks: Record<string, string>;
      page_api_alignment_status?: string;
    };
    const rowEvidence = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "qa_row_matrix.json"), "utf8")
    ) as {
      package_id: string;
      package_sha256: string;
      row_reviews: Array<{
        verdict: "PASS" | "BLOCKED";
        checks: Record<string, string>;
      }>;
    };
    const currentPackage = readJson<{ package_id: string; package_sha256: string }>(
      "generated/en-content-parity/W3-editorial-cms/articles/sha256_manifest.json"
    );

    candidate.base_manifest_sha256 = baseManifest.manifestSha256;
    candidate.package_id = currentPackage.package_id;
    candidate.package_sha256 = currentPackage.package_sha256;
    qaReport.package_sha256 = currentPackage.package_sha256;
    rowEvidence.package_id = currentPackage.package_id;
    rowEvidence.package_sha256 = currentPackage.package_sha256;
    fs.writeFileSync(qaReportPath, JSON.stringify(qaReport));
    fs.writeFileSync(rowEvidencePath, JSON.stringify(rowEvidence));
    candidate.gate_evidence.report_path = qaReportPath;
    candidate.gate_evidence.report_sha256 = sha256AbsoluteFile(qaReportPath);
    candidate.gate_evidence.row_evidence.path = rowEvidencePath;
    candidate.gate_evidence.row_evidence.sha256 = sha256AbsoluteFile(rowEvidencePath);
    fs.writeFileSync(candidatePath, JSON.stringify(candidate));

    try {
      const standaloneOutput = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", baseManifest.manifestPath, "--artifact", qaReportPath],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(standaloneOutput)).toMatchObject({ ok: true, errors: [] });

      const noBlockerQaReport = structuredClone(qaReport);
      for (const check of Object.keys(noBlockerQaReport.checks)) {
        if (noBlockerQaReport.checks[check] === "BLOCKED") {
          noBlockerQaReport.checks[check] = "PASS";
        }
      }
      fs.writeFileSync(qaReportPath, JSON.stringify(noBlockerQaReport));
      let noBlockerOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", baseManifest.manifestPath, "--artifact", qaReportPath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        noBlockerOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(noBlockerOutput).errors.join("\n")).toContain(
        "W9 BLOCKED verdict requires at least one blocked QA check"
      );
      fs.writeFileSync(qaReportPath, JSON.stringify(qaReport));

      const output = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", baseManifest.manifestPath, "--artifact", candidatePath],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
      expect(qaReport).toMatchObject({
        verdict: "BLOCKED",
        page_api_alignment_status: "NOT_APPLICABLE",
        checks: { page_api_alignment: "NOT_APPLICABLE", claim_boundary: "BLOCKED" },
      });

      rowEvidence.row_reviews[0].checks.page_api_alignment_applicable = "BLOCKED";
      rowEvidence.row_reviews[0].verdict = "BLOCKED";
      fs.writeFileSync(rowEvidencePath, JSON.stringify(rowEvidence));
      candidate.gate_evidence.row_evidence.sha256 = sha256AbsoluteFile(rowEvidencePath);
      fs.writeFileSync(candidatePath, JSON.stringify(candidate));
      let blockedRowOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", baseManifest.manifestPath, "--artifact", candidatePath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        blockedRowOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(blockedRowOutput).errors.join("\n")).toContain(
        "W9 aggregate check page_api_alignment must match the row reviews"
      );
      rowEvidence.row_reviews[0].checks.page_api_alignment_applicable = "PASS";
      rowEvidence.row_reviews[0].verdict = "PASS";
      fs.writeFileSync(rowEvidencePath, JSON.stringify(rowEvidence));
      candidate.gate_evidence.row_evidence.sha256 = sha256AbsoluteFile(rowEvidencePath);

      delete qaReport.page_api_alignment_status;
      fs.writeFileSync(qaReportPath, JSON.stringify(qaReport));
      let standaloneFailedOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", baseManifest.manifestPath, "--artifact", qaReportPath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        standaloneFailedOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(standaloneFailedOutput).errors.join("\n")).toContain(
        "NOT_APPLICABLE page/API check requires matching report status"
      );
      candidate.gate_evidence.report_sha256 = sha256AbsoluteFile(qaReportPath);
      fs.writeFileSync(candidatePath, JSON.stringify(candidate));
      let failedOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", baseManifest.manifestPath, "--artifact", candidatePath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        failedOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(failedOutput).errors.join("\n")).toContain(
        "NOT_APPLICABLE page/API check requires matching report status"
      );
    } finally {
      fs.rmSync(candidateDirectory, { recursive: true, force: true });
      fs.rmSync(baseManifest.directory, { recursive: true, force: true });
    }
  });

  it.each(["source_equivalence_identity", "internal_link_equivalence"])(
    "accepts a W9 blocker caused only by the %s row check",
    (blockedRowCheck) => {
      const candidateDirectory = makeW9QaDirectory();
      const baseManifest = makeW3ArticlesPreBlockManifest(manifest);
      const candidatePath = path.join(candidateDirectory, "master_manifest_patch.candidate.json");
      const qaReportPath = path.join(candidateDirectory, "independent_qa_report.json");
      const rowEvidencePath = path.join(
        candidateDirectory,
        "article_17_row_review_evidence.json"
      );
      const checkedInDirectory = path.join(
        ROOT,
        "generated/en-content-parity/W9-independent-qa/articles/w3-articles-37f9bf45"
      );
      const candidate = JSON.parse(
        fs.readFileSync(path.join(checkedInDirectory, "master_manifest_patch.candidate.json"), "utf8")
      ) as {
        base_manifest_sha256: string;
        gate_evidence: {
          report_path: string;
          report_sha256: string;
          row_evidence: { path: string; sha256: string };
        };
      };
      const qaReport = JSON.parse(
        fs.readFileSync(path.join(checkedInDirectory, "independent_qa_report.json"), "utf8")
      ) as { checks: Record<string, string> };
      const rowEvidence = JSON.parse(
        fs.readFileSync(path.join(checkedInDirectory, "article_17_row_review_evidence.json"), "utf8")
      ) as {
        required_checks: Record<string, string>;
        row_reviews: Array<{
          verdict: "PASS" | "BLOCKED";
          checks: Record<string, string>;
        }>;
      };
      for (const check of Object.keys(qaReport.checks)) {
        qaReport.checks[check] = "PASS";
        rowEvidence.required_checks[check] = "PASS";
      }
      for (const rowReview of rowEvidence.row_reviews) {
        rowReview.verdict = "PASS";
        for (const check of Object.keys(rowReview.checks)) {
          rowReview.checks[check] = "PASS";
        }
      }
      rowEvidence.row_reviews[0]!.checks[blockedRowCheck] = "BLOCKED";
      rowEvidence.row_reviews[0]!.verdict = "BLOCKED";
      const aggregateCheck =
        blockedRowCheck === "source_equivalence_identity"
          ? "asset_duplication"
          : "field_leakage";
      qaReport.checks[aggregateCheck] = "BLOCKED";
      rowEvidence.required_checks[aggregateCheck] = "BLOCKED";
      candidate.base_manifest_sha256 = baseManifest.manifestSha256;
      fs.writeFileSync(qaReportPath, JSON.stringify(qaReport));
      fs.writeFileSync(rowEvidencePath, JSON.stringify(rowEvidence));
      candidate.gate_evidence.report_path = qaReportPath;
      candidate.gate_evidence.report_sha256 = sha256AbsoluteFile(qaReportPath);
      candidate.gate_evidence.row_evidence.path = rowEvidencePath;
      candidate.gate_evidence.row_evidence.sha256 = sha256AbsoluteFile(rowEvidencePath);
      fs.writeFileSync(candidatePath, JSON.stringify(candidate));

      try {
        const output = execFileSync(
          "node",
          [
            VALIDATOR_PATH,
            "--manifest",
            baseManifest.manifestPath,
            "--artifact",
            candidatePath,
          ],
          {
            cwd: ROOT,
            encoding: "utf8",
          }
        );
        expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
      } finally {
        fs.rmSync(candidateDirectory, { recursive: true, force: true });
        fs.rmSync(baseManifest.directory, { recursive: true, force: true });
      }
    }
  );

  it.each([
    "zero self-reported counts",
    "empty row reviews",
    "duplicate row identity",
    "missing row identity",
    "unknown row identity",
    "missing substantive row fields",
    "empty substantive row evidence",
    "incomplete row checks",
    "row verdict mismatch",
    "aggregate check mismatch",
    "source equivalence aggregate mismatch",
    "internal link aggregate mismatch",
    "row ID and identity pairing mismatch",
    "report permission true",
    "report permission missing",
    "report permission drift",
    "row evidence permission true",
    "row evidence permission missing",
    "row evidence permission drift",
    "aggregate Chinese leakage without blocked row",
    "missing row Chinese leakage",
    "invalid row Chinese leakage verdict",
    "report schema missing",
    "report schema unexpected property",
    ...[
      "language_naturalness",
      "chinese_leakage",
      "claim_boundary",
      "asset_duplication",
      "field_leakage",
      "page_api_alignment",
    ].map((check) => `invalid QA verdict for ${check}`),
  ])("rejects a W9 blocker candidate with %s", (failureMode) => {
    const candidateDirectory = makeW9QaDirectory();
    const baseManifest = makeW3ArticlesPreBlockManifest(manifest);
    const candidatePath = path.join(candidateDirectory, "master_manifest_patch.candidate.json");
    const qaReportPath = path.join(candidateDirectory, "independent_qa_report.json");
    const rowEvidencePath = path.join(candidateDirectory, "article_17_row_review_evidence.json");
    const checkedInDirectory = path.join(
      ROOT,
      "generated/en-content-parity/W9-independent-qa/articles/w3-articles-37f9bf45"
    );
    const candidate = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "master_manifest_patch.candidate.json"), "utf8")
    ) as {
      base_manifest_sha256: string;
      gate_evidence: {
        report_path: string;
        report_sha256: string;
        row_count: number;
        row_evidence: { path: string; sha256: string };
      };
    };
    const qaReport = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "independent_qa_report.json"), "utf8")
    ) as {
      $schema?: string;
      reviewed_row_count: number;
      checks: Record<string, string>;
      permissions: Record<string, boolean>;
      unexpected_contract_field?: boolean;
    };
    const rowEvidence = JSON.parse(
      fs.readFileSync(path.join(checkedInDirectory, "article_17_row_review_evidence.json"), "utf8")
    ) as {
      reviewed_row_count: number;
      required_checks: Record<string, string>;
      permissions: Record<string, boolean>;
      row_reviews: Array<{
        row_id: string;
        source_identity: string;
        title_excerpt_full_body_reviewed?: boolean;
        verdict?: "PASS" | "BLOCKED";
        checks?: Record<string, string>;
        evidence?: string;
      }>;
    };

    if (failureMode === "zero self-reported counts") {
      candidate.gate_evidence.row_count = 0;
      qaReport.reviewed_row_count = 0;
      rowEvidence.reviewed_row_count = 0;
    } else if (failureMode === "empty row reviews") {
      rowEvidence.row_reviews = [];
    } else if (failureMode === "duplicate row identity") {
      rowEvidence.row_reviews.at(-1)!.source_identity = rowEvidence.row_reviews[0]!.source_identity;
    } else if (failureMode === "missing row identity") {
      rowEvidence.row_reviews.pop();
    } else if (failureMode === "unknown row identity") {
      rowEvidence.row_reviews.at(-1)!.source_identity = "Article:999@revision:999";
    } else if (failureMode === "missing substantive row fields") {
      delete rowEvidence.row_reviews[0]!.title_excerpt_full_body_reviewed;
      delete rowEvidence.row_reviews[0]!.verdict;
      delete rowEvidence.row_reviews[0]!.checks;
      delete rowEvidence.row_reviews[0]!.evidence;
    } else if (failureMode === "empty substantive row evidence") {
      rowEvidence.row_reviews[0]!.evidence = "   ";
    } else if (failureMode === "incomplete row checks") {
      delete rowEvidence.row_reviews[0]!.checks!.claim_boundary;
    } else if (failureMode === "row verdict mismatch") {
      rowEvidence.row_reviews[0]!.verdict = "PASS";
    } else if (failureMode === "aggregate check mismatch") {
      qaReport.checks.language_naturalness = "PASS";
      rowEvidence.required_checks.language_naturalness = "PASS";
    } else if (failureMode === "source equivalence aggregate mismatch") {
      for (const rowReview of rowEvidence.row_reviews) {
        rowReview.checks!.source_equivalence_identity = "PASS";
        rowReview.checks!.asset_media_duplication_omission = "PASS";
      }
      rowEvidence.row_reviews[0]!.checks!.source_equivalence_identity = "BLOCKED";
      qaReport.checks.asset_duplication = "PASS";
      rowEvidence.required_checks.asset_duplication = "PASS";
    } else if (failureMode === "internal link aggregate mismatch") {
      for (const rowReview of rowEvidence.row_reviews) {
        rowReview.checks!.internal_link_equivalence = "PASS";
        rowReview.checks!.field_leakage = "PASS";
      }
      rowEvidence.row_reviews[0]!.checks!.internal_link_equivalence = "BLOCKED";
      qaReport.checks.field_leakage = "PASS";
      rowEvidence.required_checks.field_leakage = "PASS";
    } else if (failureMode === "row ID and identity pairing mismatch") {
      const firstIdentity = rowEvidence.row_reviews[0]!.source_identity;
      rowEvidence.row_reviews[0]!.source_identity = rowEvidence.row_reviews[1]!.source_identity;
      rowEvidence.row_reviews[1]!.source_identity = firstIdentity;
    } else if (failureMode === "report permission true") {
      qaReport.permissions.public_release_authorized = true;
    } else if (failureMode === "report permission missing") {
      delete qaReport.permissions.public_release_authorized;
    } else if (failureMode === "report permission drift") {
      qaReport.permissions.report_only_authorized = false;
    } else if (failureMode === "row evidence permission true") {
      rowEvidence.permissions.production_import_authorized = true;
    } else if (failureMode === "row evidence permission missing") {
      delete rowEvidence.permissions.production_import_authorized;
    } else if (failureMode === "row evidence permission drift") {
      rowEvidence.permissions.row_evidence_only_authorized = false;
    } else if (failureMode === "aggregate Chinese leakage without blocked row") {
      qaReport.checks.chinese_leakage = "BLOCKED";
      rowEvidence.required_checks.chinese_leakage = "BLOCKED";
    } else if (failureMode === "missing row Chinese leakage") {
      delete rowEvidence.row_reviews[0]!.checks!.chinese_leakage;
    } else if (failureMode === "invalid row Chinese leakage verdict") {
      rowEvidence.row_reviews[0]!.checks!.chinese_leakage = "NOT_REVIEWED";
    } else if (failureMode === "report schema missing") {
      delete qaReport.$schema;
    } else if (failureMode === "report schema unexpected property") {
      qaReport.unexpected_contract_field = true;
    } else if (failureMode.startsWith("invalid QA verdict for ")) {
      const check = failureMode.replace("invalid QA verdict for ", "");
      qaReport.checks[check] = "NOT_REVIEWED";
      rowEvidence.required_checks[check] = "NOT_REVIEWED";
    }

    fs.writeFileSync(qaReportPath, JSON.stringify(qaReport));
    fs.writeFileSync(rowEvidencePath, JSON.stringify(rowEvidence));
    candidate.gate_evidence.report_path = qaReportPath;
    candidate.gate_evidence.report_sha256 = sha256AbsoluteFile(qaReportPath);
    candidate.gate_evidence.row_evidence.path = rowEvidencePath;
    candidate.gate_evidence.row_evidence.sha256 = sha256AbsoluteFile(rowEvidencePath);
    candidate.base_manifest_sha256 = baseManifest.manifestSha256;
    fs.writeFileSync(candidatePath, JSON.stringify(candidate));

    try {
      let failedOutput = "";
      try {
        execFileSync(
          "node",
          [
            VALIDATOR_PATH,
            "--manifest",
            baseManifest.manifestPath,
            "--artifact",
            candidatePath,
          ],
          {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          }
        );
      } catch (error) {
        failedOutput = (error as { stdout?: string }).stdout ?? "";
      }
      const errors = (JSON.parse(failedOutput) as { errors: string[] }).errors.join("\n");
      if (failureMode === "zero self-reported counts") {
        expect(errors).toContain("W9 blocker row count must cover the complete registered target");
      } else if (failureMode === "empty row reviews" || failureMode === "missing row identity") {
        expect(errors).toContain("W9 row_reviews must contain every registered target row");
      } else if (failureMode === "duplicate row identity") {
        expect(errors).toContain("W9 row review identities must be unique");
      } else if (failureMode === "unknown row identity") {
        expect(errors).toContain("W9 row review identities must exactly cover the frozen target identities");
      } else if (failureMode === "missing substantive row fields") {
        expect(errors).toContain("every W9 row review must confirm title, excerpt, and full body review");
        expect(errors).toContain("every W9 row review must include substantive evidence");
      } else if (failureMode === "empty substantive row evidence") {
        expect(errors).toContain("every W9 row review must include substantive evidence");
      } else if (failureMode === "incomplete row checks") {
        expect(errors).toContain("every W9 row review must include every required row check");
      } else if (failureMode === "row verdict mismatch") {
        expect(errors).toContain("every W9 row review verdict must match its row checks");
      } else if (failureMode === "aggregate check mismatch") {
        expect(errors).toContain("W9 aggregate check language_naturalness must match the row reviews");
      } else if (
        failureMode === "source equivalence aggregate mismatch"
      ) {
        expect(errors).toContain("W9 aggregate check asset_duplication must match the row reviews");
      } else if (failureMode === "internal link aggregate mismatch") {
        expect(errors).toContain("W9 aggregate check field_leakage must match the row reviews");
      } else if (failureMode === "row ID and identity pairing mismatch") {
        expect(errors).toContain("every W9 row review must preserve its frozen row ID and identity pairing");
      } else if (failureMode === "report permission true") {
        expect(errors).toContain("$/w9_qa_report/permissions/public_release_authorized: permission must remain false");
      } else if (failureMode === "report permission missing") {
        expect(errors).toContain("W9 QA report: permissions must include exactly the controlled permission keys");
        expect(errors).toContain("W9 QA report: permissions must exactly match the blocker candidate");
      } else if (failureMode === "report permission drift") {
        expect(errors).toContain("W9 QA report: permissions must include exactly the controlled permission keys");
      } else if (failureMode === "row evidence permission true") {
        expect(errors).toContain(
          "$/w9_row_evidence/permissions/production_import_authorized: permission must remain false"
        );
      } else if (
        failureMode === "row evidence permission missing"
      ) {
        expect(errors).toContain("W9 row evidence: permissions must include exactly the controlled permission keys");
        expect(errors).toContain("W9 row evidence: permissions must exactly match the blocker candidate");
      } else if (failureMode === "row evidence permission drift") {
        expect(errors).toContain("W9 row evidence: permissions must include exactly the controlled permission keys");
      } else if (failureMode === "aggregate Chinese leakage without blocked row") {
        expect(errors).toContain("W9 aggregate check chinese_leakage must match the row reviews");
      } else if (failureMode === "missing row Chinese leakage") {
        expect(errors).toContain("every W9 row review must include every required row check");
      } else if (failureMode === "invalid row Chinese leakage verdict") {
        expect(errors).toContain("every W9 row review check must be PASS or BLOCKED");
      } else if (failureMode === "report schema missing") {
        expect(errors).toContain("W9 QA report Schema error: $: oneOf matched 0 branches");
        expect(errors).toContain("missing required property $schema");
      } else if (failureMode === "report schema unexpected property") {
        expect(errors).toContain("W9 QA report Schema error: $: oneOf matched 0 branches");
        expect(errors).toContain("unexpected property unexpected_contract_field");
      } else if (failureMode.startsWith("invalid QA verdict for ")) {
        const check = failureMode.replace("invalid QA verdict for ", "");
        expect(errors).toContain(
          `W9 QA check ${check} must be ${
            check === "page_api_alignment" ? "PASS, BLOCKED, or NOT_APPLICABLE" : "PASS or BLOCKED"
          }`
        );
      }
    } finally {
      fs.rmSync(candidateDirectory, { recursive: true, force: true });
      fs.rmSync(baseManifest.directory, { recursive: true, force: true });
    }
  });

  it("accepts a CONTROL-only rework reset after exact-SHA W9 blocks a frozen package", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w9-rework-"));
    const invalidApprovalDirectory = makeControlApprovalDirectory();
    const invalidW9Directory = makeW9QaDirectory();
    const blockedManifestPath = path.join(tempDirectory, "blocked-master.json");
    const reworkManifestPath = path.join(tempDirectory, "rework-master.json");
    const reworkApprovalPath =
      "generated/en-content-parity/CONTROL-approvals/W3-ARTICLES/package-rework-reset-7bdbf91b.json";
    const invalidApprovalPath = path.join(
      invalidApprovalDirectory,
      "invalid-package-rework-reset.json"
    );
    const blockedManifest = structuredClone(manifest);
    const blockedW3 = blockedManifest.lanes.find((lane) => lane.lane_id === "W3");
    const blockedArticles = blockedW3?.subscopes.find(
      (subscope) => subscope.id === "W3-ARTICLES"
    );
    if (!blockedW3 || !blockedArticles) {
      throw new Error("missing W3 blocked reset fixture");
    }
    blockedW3.status = "blocked";
    blockedW3.blocked_from_status = "inventory_frozen";
    blockedArticles.status = "blocked";
    blockedArticles.blocked_from_status = "package_frozen";
    blockedArticles.package_sha256 =
      "7bdbf91b767fdb9a5acbb3faa9d96eaddc10cf6eaf6ca331c0a6ff72d8434750";
    blockedArticles.qa_report_ref = null;
    blockedArticles.gate_lineage = [
      {
        status: "package_frozen",
        evidence_owner_lane_id: "W3",
        report_ref:
          "generated/en-content-parity/W3-editorial-cms/articles/editorial_review.json",
        report_sha256:
          "feb60cca6237c9c8113a31e510ffc38cad8828a3f639faab9674fec02ea0716b",
        package_sha256:
          "7bdbf91b767fdb9a5acbb3faa9d96eaddc10cf6eaf6ca331c0a6ff72d8434750",
        accepted_at: "2026-07-30T20:50:31.000Z",
      },
      {
        status: "blocked",
        evidence_owner_lane_id: "W9",
        report_ref:
          "generated/en-content-parity/W9-independent-qa/articles/w3-articles-7bdbf91b/independent_qa_report.json",
        report_sha256:
          "3be77c1328b27ced327e269d8df40d33c623649a8ceb2cd1e9707510e40df192",
        package_sha256:
          "7bdbf91b767fdb9a5acbb3faa9d96eaddc10cf6eaf6ca331c0a6ff72d8434750",
        accepted_at: "2026-07-30T21:00:00.000Z",
      },
    ];
    fs.writeFileSync(blockedManifestPath, JSON.stringify(blockedManifest));

    const reworkManifest = structuredClone(blockedManifest);
    const w3 = reworkManifest.lanes.find((lane) => lane.lane_id === "W3");
    const articles = w3?.subscopes.find((subscope) => subscope.id === "W3-ARTICLES");
    const careerGuides = w3?.subscopes.find(
      (subscope) => subscope.id === "W3-CAREER-GUIDES"
    );
    if (!w3 || !articles || !careerGuides) {
      throw new Error("missing W3 rework reset fixture");
    }
    const approvalOutput = execFileSync(
      "node",
      [VALIDATOR_PATH, "--manifest", blockedManifestPath, "--artifact", reworkApprovalPath],
      { cwd: ROOT, encoding: "utf8" }
    );
    expect(JSON.parse(approvalOutput)).toMatchObject({ ok: true, errors: [] });

    const invalidApproval = JSON.parse(
      fs.readFileSync(reworkApprovalPath, "utf8")
    ) as { w9_report_sha256: string };
    invalidApproval.w9_report_sha256 = "f".repeat(64);
    fs.writeFileSync(invalidApprovalPath, JSON.stringify(invalidApproval));
    let invalidOutput = "";
    try {
      execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", blockedManifestPath, "--artifact", invalidApprovalPath],
        { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
      );
    } catch (error) {
      invalidOutput = (error as { stdout?: string }).stdout ?? "";
    }
    expect(JSON.parse(invalidOutput).errors.join("\n")).toContain(
      "package rework reset W9 report SHA mismatch"
    );

    const checkedInApproval = JSON.parse(
      fs.readFileSync(reworkApprovalPath, "utf8")
    ) as {
      w9_report_ref: string;
      w9_report_sha256: string;
      w9_row_evidence_ref: string;
      w9_row_evidence_sha256: string;
      w9_frozen_ledger_ref: string;
      w9_frozen_ledger_sha256: string;
    };
    const checkedInReport = JSON.parse(
      fs.readFileSync(path.join(ROOT, checkedInApproval.w9_report_ref), "utf8")
    ) as {
      checks: Record<string, string>;
    };
    const checkedInRowEvidence = JSON.parse(
      fs.readFileSync(path.join(ROOT, checkedInApproval.w9_row_evidence_ref), "utf8")
    ) as {
      required_checks: Record<string, string>;
      check_evidence?: Record<string, string>;
      permissions: Record<string, boolean>;
      row_reviews: Array<{
        row_id: string;
        source_identity: string;
        checks: Record<string, string>;
        title_excerpt_full_body_reviewed?: boolean;
        verdict?: "PASS" | "BLOCKED";
        evidence?: string;
        finding?: string;
      }>;
    };
    const checkedInFrozenLedger = JSON.parse(
      fs.readFileSync(path.join(ROOT, checkedInApproval.w9_frozen_ledger_ref), "utf8")
    ) as {
      rows: Array<{
        row_id: string;
        source_identity: string;
      }>;
    };
    const reorderedApproval = structuredClone(checkedInApproval);
    const reorderedRowEvidence = structuredClone(checkedInRowEvidence);
    reorderedRowEvidence.required_checks = Object.fromEntries(
      Object.entries(reorderedRowEvidence.required_checks).reverse()
    );
    for (const rowReview of reorderedRowEvidence.row_reviews) {
      delete rowReview.finding;
    }
    const reorderedRowEvidencePath = path.join(
      invalidW9Directory,
      "reordered-required-checks-row-evidence.json"
    );
    const reorderedApprovalPath = path.join(
      invalidApprovalDirectory,
      "reordered-required-checks-approval.json"
    );
    fs.writeFileSync(reorderedRowEvidencePath, JSON.stringify(reorderedRowEvidence));
    reorderedApproval.w9_row_evidence_ref = reorderedRowEvidencePath;
    reorderedApproval.w9_row_evidence_sha256 = sha256AbsoluteFile(reorderedRowEvidencePath);
    fs.writeFileSync(reorderedApprovalPath, JSON.stringify(reorderedApproval));
    const reorderedOutput = execFileSync(
      "node",
      [VALIDATOR_PATH, "--manifest", blockedManifestPath, "--artifact", reorderedApprovalPath],
      { cwd: ROOT, encoding: "utf8" }
    );
    expect(JSON.parse(reorderedOutput)).toMatchObject({ ok: true, errors: [] });

    for (const failureMode of [
      "all aggregate and row checks PASS",
      "missing row evidence",
      "missing frozen ledger",
      "unique row identity drift",
      "row and projection double forgery",
      "row permission drift",
      "missing substantive row fields",
      "empty substantive row evidence",
      "row verdict mismatch",
      "aggregate check mismatch",
      "missing aggregate evidence",
      "empty aggregate evidence",
    ]) {
      const approval = structuredClone(checkedInApproval);
      const report = structuredClone(checkedInReport);
      const rowEvidence = structuredClone(checkedInRowEvidence);
      const frozenLedger = structuredClone(checkedInFrozenLedger);
      const reportPath = path.join(invalidW9Directory, `${failureMode.replaceAll(" ", "-")}-report.json`);
      const rowEvidencePath = path.join(
        invalidW9Directory,
        `${failureMode.replaceAll(" ", "-")}-row-evidence.json`
      );
      const frozenLedgerPath = path.join(
        invalidW9Directory,
        `${failureMode.replaceAll(" ", "-")}-frozen-ledger.json`
      );
      if (failureMode === "all aggregate and row checks PASS") {
        for (const check of Object.keys(report.checks)) {
          report.checks[check] = "PASS";
          rowEvidence.required_checks[check] = "PASS";
        }
        for (const rowReview of rowEvidence.row_reviews) {
          for (const check of Object.keys(rowReview.checks)) {
            rowReview.checks[check] = "PASS";
          }
          rowReview.verdict = "PASS";
        }
      } else if (failureMode === "unique row identity drift") {
        rowEvidence.row_reviews.at(-1)!.source_identity = "Article:999@revision:999";
      } else if (failureMode === "row and projection double forgery") {
        rowEvidence.row_reviews.forEach((rowReview, index) => {
          rowReview.row_id = `W3-FORGED-${String(index + 1).padStart(2, "0")}`;
          rowReview.source_identity = `Article:${900 + index}@revision:${1900 + index}`;
          frozenLedger.rows[index] = {
            row_id: rowReview.row_id,
            source_identity: rowReview.source_identity,
          };
        });
      } else if (failureMode === "row permission drift") {
        rowEvidence.permissions.production_import_authorized = true;
      } else if (failureMode === "missing substantive row fields") {
        delete rowEvidence.row_reviews[0].title_excerpt_full_body_reviewed;
        delete rowEvidence.row_reviews[0].verdict;
        delete rowEvidence.row_reviews[0].evidence;
      } else if (failureMode === "empty substantive row evidence") {
        rowEvidence.row_reviews[0].evidence = " ";
      } else if (failureMode === "row verdict mismatch") {
        rowEvidence.row_reviews[0].verdict =
          rowEvidence.row_reviews[0].verdict === "BLOCKED" ? "PASS" : "BLOCKED";
      } else if (failureMode === "aggregate check mismatch") {
        report.checks.language_naturalness = "PASS";
        rowEvidence.required_checks.language_naturalness = "PASS";
      } else if (failureMode === "missing aggregate evidence") {
        delete rowEvidence.check_evidence;
      } else if (failureMode === "empty aggregate evidence") {
        rowEvidence.check_evidence!.language_naturalness = " ";
      }
      fs.writeFileSync(reportPath, JSON.stringify(report));
      fs.writeFileSync(rowEvidencePath, JSON.stringify(rowEvidence));
      fs.writeFileSync(frozenLedgerPath, JSON.stringify(frozenLedger));
      approval.w9_report_ref = reportPath;
      approval.w9_report_sha256 = sha256AbsoluteFile(reportPath);
      approval.w9_row_evidence_ref =
        failureMode === "missing row evidence"
          ? path.join(invalidW9Directory, "missing-row-evidence.json")
          : rowEvidencePath;
      approval.w9_row_evidence_sha256 =
        failureMode === "missing row evidence"
          ? "0".repeat(64)
          : sha256AbsoluteFile(rowEvidencePath);
      if (failureMode === "missing frozen ledger") {
        approval.w9_frozen_ledger_ref = path.join(
          invalidW9Directory,
          "missing-frozen-ledger.json"
        );
        approval.w9_frozen_ledger_sha256 = "0".repeat(64);
      } else if (failureMode === "row and projection double forgery") {
        approval.w9_frozen_ledger_ref = frozenLedgerPath;
        approval.w9_frozen_ledger_sha256 = sha256AbsoluteFile(frozenLedgerPath);
      }
      fs.writeFileSync(invalidApprovalPath, JSON.stringify(approval));

      let blockerOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", blockedManifestPath, "--artifact", invalidApprovalPath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        blockerOutput = (error as { stdout?: string }).stdout ?? "";
      }
      const blockerErrors = (JSON.parse(blockerOutput) as { errors: string[] }).errors.join("\n");
      if (failureMode === "all aggregate and row checks PASS") {
        expect(blockerErrors).toContain(
          "package rework: W9 BLOCKED verdict requires at least one blocked QA check"
        );
      } else if (failureMode === "missing row evidence") {
        expect(blockerErrors).toContain("cannot verify package rework W9 evidence");
      } else if (failureMode === "missing frozen ledger") {
        expect(blockerErrors).toContain("cannot verify package rework W9 evidence");
      } else if (failureMode === "unique row identity drift") {
        expect(blockerErrors).toContain(
          "package rework W9 rows must exactly match the frozen ledger row ID and identity pairs"
        );
      } else if (failureMode === "row and projection double forgery") {
        expect(blockerErrors).toContain(
          "package rework frozen projection must exactly match the hashed source ledger"
        );
      } else if (failureMode === "missing substantive row fields") {
        expect(blockerErrors).toContain(
          "package rework: every W9 row review must confirm title, excerpt, and full body review"
        );
      } else if (failureMode === "empty substantive row evidence") {
        expect(blockerErrors).toContain(
          "package rework: every W9 row review must include substantive evidence"
        );
      } else if (failureMode === "row verdict mismatch") {
        expect(blockerErrors).toContain(
          "package rework: every W9 row review verdict must match its row checks"
        );
      } else if (failureMode === "aggregate check mismatch") {
        expect(blockerErrors).toContain(
          "package rework: W9 aggregate check language_naturalness must match the row reviews"
        );
      } else if (failureMode === "missing aggregate evidence") {
        expect(blockerErrors).toContain(
          "package rework: W9 row evidence must include substantive evidence for every aggregate check"
        );
      } else if (failureMode === "empty aggregate evidence") {
        expect(blockerErrors).toContain(
          "package rework: W9 aggregate check language_naturalness must include substantive evidence"
        );
      } else {
        expect(blockerErrors).toContain(
          "$/package_rework_w9_row_evidence/permissions/production_import_authorized: permission must remain false"
        );
      }
    }

    w3.status = "inventory_frozen";
    w3.blocked_from_status = null;
    w3.blockers = [];
    articles.status = "package_in_progress";
    articles.blocked_from_status = null;
    articles.package_sha256 = null;
    articles.qa_report_ref = null;
    articles.gate_lineage = [];
    articles.blockers = [];
    careerGuides.status = "inventory_frozen";
    careerGuides.blocked_from_status = null;
    careerGuides.package_sha256 = null;
    careerGuides.qa_report_ref = null;
    careerGuides.gate_lineage = [];
    careerGuides.blockers = [];
    w3.next_action =
      "Rebuild the complete W3-ARTICLES package, re-freeze it, and repeat fresh independent W9 QA.";
    fs.writeFileSync(reworkManifestPath, JSON.stringify(reworkManifest));

    try {
      const output = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", reworkManifestPath],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });
      expect(careerGuides).toMatchObject({
        status: "inventory_frozen",
        package_sha256: null,
        qa_report_ref: null,
        gate_lineage: [],
      });
      expect(Object.values(w3.permissions).every((value) => value === false)).toBe(true);
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      fs.rmSync(invalidApprovalDirectory, { recursive: true, force: true });
      fs.rmSync(invalidW9Directory, { recursive: true, force: true });
    }
  });

  it("rejects W9 PASS reports that review only a subset of the registered target", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w9-subset-"));
    const qaReportPath = path.join(tempDirectory, "independent-qa-report.json");
    const assets = manifest.assets.filter((entry) => entry.lane_id === "W1");
    if (assets.length < 2) {
      throw new Error("W1 subset fixture requires at least two assets");
    }
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    fs.writeFileSync(
      qaReportPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "independent_qa_report",
        schema_version: "fermatmind.en_content_parity_independent_qa_report.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        qa_lane_id: "W9",
        output_directory: "generated/en-content-parity/W9-independent-qa/",
        producer_lane_id: "W1",
        subscope_id: null,
        package_sha256: "a".repeat(64),
        verdict: "PASS",
        reviewed_asset_ids: [assets[0].asset_id],
        reviewed_row_count: 0,
        checks: {
          language_naturalness: "PASS",
          chinese_leakage: "PASS",
          claim_boundary: "PASS",
          asset_duplication: "PASS",
          field_leakage: "PASS",
          page_api_alignment: "PASS",
        },
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", qaReportPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("QA report must review every registered target asset exactly once");
      expect(report.errors.join("\n")).toContain("QA report row count must cover the complete registered target");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("accepts qa_pass only with an exact-SHA external W9 PASS report", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w9-gate-"));
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W1-mbti/comparisons/"
    );
    const candidatePath = path.join(packageDirectory, "master_manifest_patch.candidate.json");
    const qaAuthorityDirectory = makeW9QaDirectory();
    const controlApprovalDirectory = makeControlApprovalDirectory();
    const qaReportPath = path.join(qaAuthorityDirectory, "w9-independent-qa-report.json");
    const progressedManifest = structuredClone(manifest);
    const w1 = progressedManifest.lanes.find((lane) => lane.lane_id === "W1");
    const comparisons = w1?.subscopes.find((subscope) => subscope.id === "W1-MBTI-COMPARISONS");
    if (!w1 || !comparisons) {
      throw new Error("missing W1 lane fixture");
    }
    const frozenAssets = progressedManifest.assets
      .filter((asset) => asset.asset_id === "ENPARITY-W1-MBTI-CROSS-COMPARISONS");
    const expectedTotal = frozenAssets.reduce(
      (total, asset) => total + (asset.expected_en_count ?? 0),
      0
    );

    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: "W1-MBTI-COMPARISONS",
      package_id: "W1-w9-gate",
      status: "package_frozen",
      output_directory: "generated/en-content-parity/W1-mbti/comparisons/",
      artifact_files: ARTIFACT_FILES,
      assets: frozenAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(packageDirectory, scopeManifest, frozenAssets);
    const frozenReportRef = path.join(packageDirectory, "source_ledger.json");
    comparisons.status = "package_frozen";
    w1.status = "package_frozen";
    comparisons.package_sha256 = packageEvidence.packageSha256;
    comparisons.qa_report_ref = null;
    comparisons.gate_lineage = [
      {
        status: "package_frozen",
        evidence_owner_lane_id: "W1",
        report_ref: frozenReportRef,
        report_sha256: packageEvidence.reportSha256,
        package_sha256: packageEvidence.packageSha256,
        accepted_at: "2026-07-30T12:00:00.000Z",
      },
    ];
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));
    const qaChecks = {
      language_naturalness: "PASS",
      chinese_leakage: "PASS",
      claim_boundary: "PASS",
      asset_duplication: "PASS",
      field_leakage: "PASS",
      page_api_alignment: "PASS",
    };
    fs.writeFileSync(
      qaReportPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "independent_qa_report",
        schema_version: "fermatmind.en_content_parity_independent_qa_report.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        qa_lane_id: "W9",
        output_directory: "generated/en-content-parity/W9-independent-qa/",
        producer_lane_id: "W1",
        subscope_id: "W1-MBTI-COMPARISONS",
        package_sha256: packageEvidence.packageSha256,
        verdict: "PASS",
        reviewed_asset_ids: frozenAssets.map((asset) => asset.asset_id),
        reviewed_row_count: expectedTotal,
        checks: qaChecks,
        permissions,
      })
    );
    fs.writeFileSync(
      candidatePath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: "W1-MBTI-COMPARISONS",
        package_id: "W1-w9-gate",
        base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "qa_pass",
        gate_evidence: {
          gate: "qa_pass",
          report_path: qaReportPath,
          report_sha256: sha256AbsoluteFile(qaReportPath),
          report_in_package: false,
          owner_lane_id: "W9",
          verdict: "PASS",
          asset_ids: frozenAssets.map((asset) => asset.asset_id),
          row_count: expectedTotal,
        },
        asset_updates: frozenAssets,
        permissions,
      })
    );

    try {
      const output = execFileSync(
        "node",
        [
          VALIDATOR_PATH,
          "--manifest",
          progressedManifestPath,
          "--artifact",
          path.join(packageDirectory, "scope_manifest.json"),
          "--artifact",
          qaReportPath,
          "--artifact",
          candidatePath,
        ],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(output)).toMatchObject({ ok: true, errors: [] });

      const contradictoryQaReport = JSON.parse(fs.readFileSync(qaReportPath, "utf8"));
      contradictoryQaReport.page_api_alignment_status = "NOT_APPLICABLE";
      fs.writeFileSync(qaReportPath, JSON.stringify(contradictoryQaReport));
      const contradictoryCandidate = JSON.parse(fs.readFileSync(candidatePath, "utf8"));
      contradictoryCandidate.gate_evidence.report_sha256 = sha256AbsoluteFile(qaReportPath);
      fs.writeFileSync(candidatePath, JSON.stringify(contradictoryCandidate));
      let contradictoryOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        contradictoryOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(contradictoryOutput).errors.join("\n")).toContain(
        "page/API report status must match its aggregate check"
      );
      delete contradictoryQaReport.page_api_alignment_status;
      fs.writeFileSync(qaReportPath, JSON.stringify(contradictoryQaReport));
      contradictoryCandidate.gate_evidence.report_sha256 = sha256AbsoluteFile(qaReportPath);
      fs.writeFileSync(candidatePath, JSON.stringify(contradictoryCandidate));

      const qaFrozenPackageDirectory = path.join(qaAuthorityDirectory, "frozen_package");
      fs.cpSync(packageDirectory, qaFrozenPackageDirectory, { recursive: true });
      const qaFrozenCandidatePath = path.join(
        qaFrozenPackageDirectory,
        "master_manifest_patch.candidate.json"
      );
      const qaFrozenCandidate = JSON.parse(
        fs.readFileSync(qaFrozenCandidatePath, "utf8")
      ) as { sha256_manifest_path: string };
      qaFrozenCandidate.sha256_manifest_path = path.join(
        qaFrozenPackageDirectory,
        "sha256_manifest.json"
      );
      fs.writeFileSync(qaFrozenCandidatePath, JSON.stringify(qaFrozenCandidate));
      const frozenSnapshotOutput = execFileSync(
        "node",
        [
          VALIDATOR_PATH,
          "--manifest",
          progressedManifestPath,
          "--artifact",
          qaFrozenCandidatePath,
        ],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(frozenSnapshotOutput)).toMatchObject({ ok: true, errors: [] });

      const coLocatedQaReportPath = path.join(packageDirectory, "producer-authored-w9-report.json");
      fs.copyFileSync(qaReportPath, coLocatedQaReportPath);
      const coLocatedCandidate = JSON.parse(fs.readFileSync(candidatePath, "utf8")) as {
        gate_evidence: { report_path: string; report_sha256: string };
      };
      coLocatedCandidate.gate_evidence.report_path = coLocatedQaReportPath;
      coLocatedCandidate.gate_evidence.report_sha256 = sha256AbsoluteFile(coLocatedQaReportPath);
      fs.writeFileSync(candidatePath, JSON.stringify(coLocatedCandidate));
      let coLocatedOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        coLocatedOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(coLocatedOutput).errors.join("\n")).toContain(
        "W9 QA report must reside inside the registered W9 authority directory"
      );

      comparisons.status = "qa_pass";
      w1.status = "qa_pass";
      comparisons.qa_report_ref = qaReportPath;
      comparisons.gate_lineage.push({
        status: "qa_pass",
        evidence_owner_lane_id: "W9",
        report_ref: qaReportPath,
        report_sha256: sha256AbsoluteFile(qaReportPath),
        package_sha256: packageEvidence.packageSha256,
        accepted_at: "2026-07-30T12:05:00.000Z",
      });
      fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

      const dryRunPlanPath = path.join(packageDirectory, "dry-run-plan.json");
      fs.writeFileSync(
        dryRunPlanPath,
        JSON.stringify({
          schema_version: "fermatmind.en_parity.test_dry_run_receipt.v1",
          status: "pass",
          ok: true,
          mode: "dry_run",
          dry_run_only: true,
          write_supported_in_this_pr: false,
          writes_committed: false,
          database_write_attempted: false,
          cms_write_attempted: false,
          publish_attempted: false,
          activation_attempted: false,
          indexability_attempted: false,
          search_submission_attempted: false,
          package: { package_sha256: packageEvidence.packageSha256 },
          row_count: expectedTotal,
          rows: Array.from({ length: expectedTotal }, () => ({ write_executed: false })),
        })
      );
      const transitionReportPath = path.join(tempDirectory, "dry-run-gate-report.json");
      fs.writeFileSync(
        transitionReportPath,
        JSON.stringify({
          $schema: SCHEMA_PATH,
          artifact_kind: "transition_gate_report",
          schema_version: "fermatmind.en_content_parity_transition_gate_report.v1",
          control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
          owner_lane_id: "W1",
          producer_lane_id: "W1",
          subscope_id: "W1-MBTI-COMPARISONS",
          package_sha256: packageEvidence.packageSha256,
          gate: "dry_run_ready",
          verdict: "PASS",
          dry_run_evidence: {
            source_repository: "fap-api",
            source_commit_sha: "a".repeat(40),
            plan_path: dryRunPlanPath,
            plan_sha256: sha256AbsoluteFile(dryRunPlanPath),
            plan_schema_version: "fermatmind.en_parity.test_dry_run_receipt.v1",
            row_count: expectedTotal,
          },
          permissions,
        })
      );
      const dryRunCandidate = {
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: "W1-MBTI-COMPARISONS",
        package_id: "W1-w9-gate",
        base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "dry_run_ready",
        gate_evidence: {
          gate: "dry_run_ready",
          report_path: transitionReportPath,
          report_sha256: sha256AbsoluteFile(transitionReportPath),
          report_in_package: false,
          owner_lane_id: "W1",
          verdict: "PASS",
          asset_ids: frozenAssets.map((asset) => asset.asset_id),
          row_count: expectedTotal,
        },
        asset_updates: frozenAssets,
        permissions,
      };
      fs.writeFileSync(candidatePath, JSON.stringify(dryRunCandidate));
      const dryRunOutput = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(dryRunOutput)).toMatchObject({ ok: true, errors: [] });

      const originalDryRunPlan = fs.readFileSync(dryRunPlanPath, "utf8");
      fs.writeFileSync(dryRunPlanPath, `${originalDryRunPlan}\n`);
      let changedDryRunOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        changedDryRunOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(changedDryRunOutput).errors.join("\n")).toContain(
        "dry-run plan SHA mismatch"
      );
      fs.writeFileSync(dryRunPlanPath, originalDryRunPlan);

      fs.writeFileSync(
        candidatePath,
        JSON.stringify({ ...dryRunCandidate, package_sha256: "b".repeat(64) })
      );
      let immutableOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        immutableOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(immutableOutput).errors.join("\n")).toContain(
        "package_frozen SHA is immutable for every later transition"
      );

      comparisons.status = "dry_run_ready";
      w1.status = "dry_run_ready";
      comparisons.gate_lineage.push({
        status: "dry_run_ready",
        evidence_owner_lane_id: "W1",
        report_ref: transitionReportPath,
        report_sha256: sha256AbsoluteFile(transitionReportPath),
        package_sha256: packageEvidence.packageSha256,
        accepted_at: "2026-07-30T12:10:00.000Z",
      });
      fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

      const approvalPath = path.join(controlApprovalDirectory, "draft-import-approval.json");
      fs.writeFileSync(
        approvalPath,
        JSON.stringify({
          $schema: SCHEMA_PATH,
          artifact_kind: "controlled_transition_approval",
          schema_version: "fermatmind.en_content_parity_controlled_transition_approval.v1",
          control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
          approval_owner: "human_operator",
          approval_ref: "operator-approval:test-fixture",
          producer_lane_id: "W1",
          subscope_id: "W1-MBTI-COMPARISONS",
          package_sha256: packageEvidence.packageSha256,
          gate: "draft_imported",
          verdict: "APPROVED",
          permissions,
        })
      );
      const draftImportCandidate = {
        ...dryRunCandidate,
        base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
        proposed_status: "draft_imported",
        gate_evidence: {
          ...dryRunCandidate.gate_evidence,
          gate: "draft_imported",
          report_path: approvalPath,
          report_sha256: sha256AbsoluteFile(approvalPath),
          owner_lane_id: "CONTROL",
          verdict: "APPROVED",
        },
      };
      fs.writeFileSync(candidatePath, JSON.stringify(draftImportCandidate));
      const coLocatedApprovalPath = path.join(packageDirectory, "producer-authored-control-approval.json");
      fs.copyFileSync(approvalPath, coLocatedApprovalPath);
      fs.writeFileSync(
        candidatePath,
        JSON.stringify({
          ...draftImportCandidate,
          gate_evidence: {
            ...draftImportCandidate.gate_evidence,
            report_path: coLocatedApprovalPath,
            report_sha256: sha256AbsoluteFile(coLocatedApprovalPath),
          },
        })
      );
      let coLocatedApprovalOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        coLocatedApprovalOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(coLocatedApprovalOutput).errors.join("\n")).toContain(
        "controlled transition approval must reside inside the registered CONTROL authority directory"
      );

      fs.writeFileSync(candidatePath, JSON.stringify(draftImportCandidate));
      const controlledOutput = execFileSync(
        "node",
        [
          VALIDATOR_PATH,
          "--manifest",
          progressedManifestPath,
          "--artifact",
          approvalPath,
          "--artifact",
          candidatePath,
        ],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(controlledOutput)).toMatchObject({ ok: true, errors: [] });
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      fs.rmSync(qaAuthorityDirectory, { recursive: true, force: true });
      fs.rmSync(controlApprovalDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory, [
        "producer-authored-w9-report.json",
        "producer-authored-control-approval.json",
        "dry-run-plan.json",
      ]);
    }
  });

  it("uses the same Schema to validate a lane package and candidate master patch", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-"));
    const fixtureManifest = w1ComparisonsInventoryFixture(manifest);
    const fixtureManifestPath = path.join(tempDirectory, "inventory-master.json");
    fs.writeFileSync(fixtureManifestPath, JSON.stringify(fixtureManifest));
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W1-mbti/comparisons/"
    );
    const packagePath = path.join(packageDirectory, "scope_manifest.json");
    const patchPath = path.join(packageDirectory, "master_manifest_patch.candidate.json");
    const inventoryAssets = fixtureManifest.assets
      .filter((entry) => entry.asset_id === "ENPARITY-W1-MBTI-CROSS-COMPARISONS");
    expect(inventoryAssets).toHaveLength(1);

    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: "W1-MBTI-COMPARISONS",
      package_id: "W1-contract-sample",
      status: "package_in_progress",
      output_directory: "generated/en-content-parity/W1-mbti/comparisons/",
      artifact_files: ARTIFACT_FILES,
      assets: inventoryAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(packageDirectory, scopeManifest, inventoryAssets);
    fs.writeFileSync(
      patchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: "W1-MBTI-COMPARISONS",
        package_id: "W1-contract-sample",
        base_manifest_sha256: sha256AbsoluteFile(fixtureManifestPath),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "package_in_progress",
        gate_evidence: {
          gate: "package_in_progress",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
          asset_ids: inventoryAssets.map((asset) => asset.asset_id),
          row_count: inventoryAssets.reduce((total, asset) => total + (asset.expected_en_count ?? 0), 0),
        },
        asset_updates: inventoryAssets,
        permissions,
      })
    );

    try {
      const output = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", fixtureManifestPath, "--artifact", packagePath, "--artifact", patchPath],
        { cwd: ROOT, encoding: "utf8" }
      );
      const report = JSON.parse(output) as { ok: boolean; checked_artifacts: string[]; errors: string[] };
      expect(report.ok).toBe(true);
      expect(report.checked_artifacts).toContain(packagePath);
      expect(report.checked_artifacts).toContain(patchPath);
      expect(report.errors).toEqual([]);

      const emptyLedgerEvidence = writePackagePayload(
        packageDirectory,
        scopeManifest,
        inventoryAssets,
        inventoryAssets,
        []
      );
      const emptyLedgerCandidate = JSON.parse(
        fs.readFileSync(patchPath, "utf8")
      ) as {
        sha256_manifest_path: string;
        package_sha256: string;
        gate_evidence: { report_sha256: string; row_count: number };
      };
      emptyLedgerCandidate.sha256_manifest_path = emptyLedgerEvidence.shaManifestPath;
      emptyLedgerCandidate.package_sha256 = emptyLedgerEvidence.packageSha256;
      emptyLedgerCandidate.gate_evidence.report_sha256 =
        emptyLedgerEvidence.reportSha256;
      emptyLedgerCandidate.gate_evidence.row_count = 0;
      fs.writeFileSync(patchPath, JSON.stringify(emptyLedgerCandidate));
      let emptyLedgerOutput = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--manifest", fixtureManifestPath, "--artifact", patchPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        emptyLedgerOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(emptyLedgerOutput).errors.join("\n")).toContain(
        "source ledger count for ENPARITY-W1-MBTI-CROSS-COMPARISONS must match expected_en_count"
      );

      const invalidEmbeddedScope = JSON.parse(fs.readFileSync(packagePath, "utf8")) as Record<string, unknown>;
      delete invalidEmbeddedScope.permissions;
      fs.writeFileSync(packagePath, JSON.stringify(invalidEmbeddedScope));
      let invalidEmbeddedOutput = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--manifest", fixtureManifestPath, "--artifact", patchPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        invalidEmbeddedOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(invalidEmbeddedOutput).errors.join("\n")).toContain(
        "embedded scope manifest Schema error"
      );
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory);
    }
  });

  it("accepts only the two registered W3 package subdirectories", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w3-"));
    const articleAsset = manifest.assets.find((entry) => entry.asset_id === "ENPARITY-W3-ARTICLES");
    if (!articleAsset) {
      throw new Error("missing W3 Article asset fixture");
    }
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const makePackage = (outputDirectory: string) => ({
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W3",
      subscope_id: "W3-ARTICLES",
      package_id: "W3-ARTICLES-contract-sample",
      status: "package_in_progress",
      output_directory: outputDirectory,
      artifact_files: ARTIFACT_FILES,
      assets: [articleAsset],
      permissions,
    });
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W3-editorial-cms/articles/"
    );
    const validPackagePath = path.join(packageDirectory, "scope_manifest.json");
    const invalidPackagePath = path.join(tempDirectory, "invalid-scope.json");
    fs.writeFileSync(validPackagePath, JSON.stringify(makePackage("generated/en-content-parity/W3-editorial-cms/articles/")));
    fs.writeFileSync(invalidPackagePath, JSON.stringify(makePackage("generated/en-content-parity/W3-editorial-cms/")));

    try {
      const validOutput = execFileSync("node", [VALIDATOR_PATH, "--artifact", validPackagePath], {
        cwd: ROOT,
        encoding: "utf8",
      });
      expect(JSON.parse(validOutput)).toMatchObject({ ok: true, errors: [] });

      let invalidOutput = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", invalidPackagePath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        invalidOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(invalidOutput).errors.join("\n")).toContain(
        "package output_directory must match the master registry"
      );
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory);
    }
  });

  it("uses independent W3 states while preserving the Article-before-CareerGuide sequence", () => {
    const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-w3-states-"));
    const bootstrapManifest = structuredClone(manifest);
    const bootstrapW3 = bootstrapManifest.lanes.find((lane) => lane.lane_id === "W3");
    if (!bootstrapW3) {
      throw new Error("missing W3 bootstrap fixture");
    }
    bootstrapW3.status = "inventory_frozen";
    bootstrapW3.blocked_from_status = null;
    for (const subscope of bootstrapW3.subscopes) {
      subscope.status = "inventory_frozen";
      subscope.blocked_from_status = null;
      subscope.package_sha256 = null;
      subscope.qa_report_ref = null;
      subscope.gate_lineage = [];
      subscope.blockers = [];
    }
    const bootstrapManifestPath = path.join(tempRoot, "bootstrap-master.json");
    fs.writeFileSync(bootstrapManifestPath, JSON.stringify(bootstrapManifest));
    const bootstrapManifestSha256 = sha256AbsoluteFile(bootstrapManifestPath);
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const cases = [
      {
        subscopeId: "W3-ARTICLES",
        assetId: "ENPARITY-W3-ARTICLES",
        outputDirectory: "generated/en-content-parity/W3-editorial-cms/articles/",
      },
      {
        subscopeId: "W3-CAREER-GUIDES",
        assetId: "ENPARITY-W3-CAREER-GUIDES",
        outputDirectory: "generated/en-content-parity/W3-editorial-cms/career-guides/",
      },
    ];
    const artifactPathsBySubscope = new Map<string, string[]>();
    const packageDirectories: string[] = [];

    try {
      for (const entry of cases) {
        const asset = manifest.assets.find((candidate) => candidate.asset_id === entry.assetId);
        if (!asset) {
          throw new Error(`missing ${entry.assetId} fixture`);
        }
        const tempDirectory = makeRegisteredPackageDirectory(entry.outputDirectory);
        packageDirectories.push(tempDirectory);
        const packageId = `${entry.subscopeId}-contract-sample`;
        const scopeManifest = {
          $schema: SCHEMA_PATH,
          artifact_kind: "lane_package",
          schema_version: "fermatmind.en_content_parity_lane_package.v1",
          control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
          lane_id: "W3",
          subscope_id: entry.subscopeId,
          package_id: packageId,
          status: "package_in_progress",
          output_directory: entry.outputDirectory,
          artifact_files: ARTIFACT_FILES,
          assets: [asset],
          permissions,
        };
        const packageEvidence = writePackagePayload(tempDirectory, scopeManifest, [asset]);
        const patchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
        fs.writeFileSync(
          patchPath,
          JSON.stringify({
            $schema: SCHEMA_PATH,
            artifact_kind: "master_manifest_patch_candidate",
            schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
            control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
            lane_id: "W3",
            subscope_id: entry.subscopeId,
            package_id: packageId,
            base_manifest_sha256: bootstrapManifestSha256,
            sha256_manifest_path: packageEvidence.shaManifestPath,
            package_sha256: packageEvidence.packageSha256,
            proposed_status: "package_in_progress",
            gate_evidence: {
              gate: "package_in_progress",
              report_path: "source_ledger.json",
              report_sha256: packageEvidence.reportSha256,
              report_in_package: true,
              owner_lane_id: "W3",
              verdict: null,
              asset_ids: [asset.asset_id],
              row_count: asset.expected_en_count ?? 0,
            },
            asset_updates: [asset],
            permissions,
          })
        );
        artifactPathsBySubscope.set(entry.subscopeId, [path.join(tempDirectory, "scope_manifest.json"), patchPath]);
      }

      const articleArguments = (artifactPathsBySubscope.get("W3-ARTICLES") ?? []).flatMap((artifactPath) => [
        "--artifact",
        artifactPath,
      ]);
      const articleOutput = execFileSync(
        "node",
        [VALIDATOR_PATH, "--manifest", bootstrapManifestPath, ...articleArguments],
        {
          cwd: ROOT,
          encoding: "utf8",
        }
      );
      expect(JSON.parse(articleOutput)).toMatchObject({ ok: true, errors: [] });

      const careerArguments = (artifactPathsBySubscope.get("W3-CAREER-GUIDES") ?? []).flatMap(
        (artifactPath) => ["--artifact", artifactPath]
      );
      let careerOutput = "";
      try {
        execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", bootstrapManifestPath, ...careerArguments],
          {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          }
        );
      } catch (error) {
        careerOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(careerOutput).errors.join("\n")).toContain(
        "predecessor W3-ARTICLES must reach package_frozen before this subscope starts"
      );

      const blockedPredecessorManifest = structuredClone(bootstrapManifest);
      const blockedW3 = blockedPredecessorManifest.lanes.find((lane) => lane.lane_id === "W3");
      const blockedArticles = blockedW3?.subscopes.find(
        (subscope) => subscope.id === "W3-ARTICLES"
      );
      if (!blockedW3 || !blockedArticles) {
        throw new Error("missing blocked W3 predecessor fixture");
      }
      blockedW3.status = "blocked";
      blockedW3.blocked_from_status = "inventory_frozen";
      blockedArticles.status = "blocked";
      blockedArticles.blocked_from_status = "package_frozen";
      blockedArticles.package_sha256 = "a".repeat(64);
      blockedArticles.gate_lineage = [
        {
          status: "package_frozen",
          evidence_owner_lane_id: "W3",
          report_ref: "generated/en-content-parity/W3-editorial-cms/articles/editorial_review.json",
          report_sha256: "b".repeat(64),
          package_sha256: "a".repeat(64),
          accepted_at: "2026-07-30T12:00:00.000Z",
        },
        {
          status: "blocked",
          evidence_owner_lane_id: "W9",
          report_ref: "fixture://w9-blocker",
          report_sha256: "c".repeat(64),
          package_sha256: "a".repeat(64),
          accepted_at: "2026-07-30T12:05:00.000Z",
        },
      ];
      const blockedPredecessorManifestPath = path.join(
        tempRoot,
        "blocked-predecessor-master.json"
      );
      fs.writeFileSync(
        blockedPredecessorManifestPath,
        JSON.stringify(blockedPredecessorManifest)
      );
      const careerCandidatePath = (
        artifactPathsBySubscope.get("W3-CAREER-GUIDES") ?? []
      )[1];
      if (!careerCandidatePath) {
        throw new Error("missing W3 Career Guide candidate fixture");
      }
      const careerCandidate = JSON.parse(
        fs.readFileSync(careerCandidatePath, "utf8")
      ) as { base_manifest_sha256: string };
      careerCandidate.base_manifest_sha256 = sha256AbsoluteFile(
        blockedPredecessorManifestPath
      );
      fs.writeFileSync(careerCandidatePath, JSON.stringify(careerCandidate));
      const blockedPredecessorOutput = execFileSync(
        "node",
        [
          VALIDATOR_PATH,
          "--manifest",
          blockedPredecessorManifestPath,
          "--artifact",
          careerCandidatePath,
        ],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(blockedPredecessorOutput)).toMatchObject({
        ok: true,
        errors: [],
      });
    } finally {
      fs.rmSync(tempRoot, { recursive: true, force: true });
      for (const packageDirectory of packageDirectories) {
        cleanupRegisteredPackageDirectory(packageDirectory);
      }
    }
  });

  it("preserves inventory counts after inventory_frozen", () => {
    const tempDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "en-parity-control-frozen-counts-")
    );
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W1-mbti/comparisons/"
    );
    const progressedManifest = structuredClone(manifest);
    const w1 = progressedManifest.lanes.find((lane) => lane.lane_id === "W1");
    const comparisons = w1?.subscopes.find((subscope) => subscope.id === "W1-MBTI-COMPARISONS");
    if (!w1 || !comparisons) {
      throw new Error("missing W1 frozen inventory fixture");
    }
    const frozenAssets = progressedManifest.assets
      .filter((asset) => asset.asset_id === "ENPARITY-W1-MBTI-CROSS-COMPARISONS");
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));

    const changedAssets = frozenAssets.map((asset, index) =>
      index === 0
        ? {
            ...asset,
            expected_en_count: (asset.expected_en_count ?? 0) + 1,
            remaining_en_count: (asset.remaining_en_count ?? 0) + 1,
          }
        : asset
    );
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: "W1-MBTI-COMPARISONS",
      package_id: "W1-frozen-count-drift",
      status: "package_in_progress",
      output_directory: "generated/en-content-parity/W1-mbti/comparisons/",
      artifact_files: ARTIFACT_FILES,
      assets: changedAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(
      packageDirectory,
      scopeManifest,
      changedAssets
    );
    const candidatePath = path.join(
      packageDirectory,
      "master_manifest_patch.candidate.json"
    );
    fs.writeFileSync(
      candidatePath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: "W1-MBTI-COMPARISONS",
        package_id: "W1-frozen-count-drift",
        base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "package_in_progress",
        gate_evidence: {
          gate: "package_in_progress",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
          asset_ids: changedAssets.map((asset) => asset.asset_id),
          row_count: changedAssets.reduce(
            (total, asset) => total + (asset.expected_en_count ?? 0),
            0
          ),
        },
        asset_updates: changedAssets,
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync(
          "node",
          [
            VALIDATOR_PATH,
            "--manifest",
            progressedManifestPath,
            "--artifact",
            candidatePath,
          ],
          {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          }
        );
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const errors = (JSON.parse(output) as { errors: string[] }).errors.join("\n");
      expect(errors).toContain(
        "frozen inventory count expected_en_count cannot change after inventory_frozen"
      );
      expect(errors).toContain(
        "frozen inventory count remaining_en_count cannot change after inventory_frozen"
      );
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory);
    }
  });

  it("requires the transition-specific in-package gate report semantics", () => {
    const tempDirectory = fs.mkdtempSync(
      path.join(os.tmpdir(), "en-parity-control-package-gate-")
    );
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W1-mbti/comparisons/"
    );
    const progressedManifest = w1ComparisonsInventoryFixture(manifest);
    const w1 = progressedManifest.lanes.find((lane) => lane.lane_id === "W1");
    const comparisons = w1?.subscopes.find((subscope) => subscope.id === "W1-MBTI-COMPARISONS");
    if (!w1 || !comparisons) {
      throw new Error("missing W1 package gate fixture");
    }
    const frozenAssets = progressedManifest.assets
      .filter((asset) => asset.asset_id === "ENPARITY-W1-MBTI-CROSS-COMPARISONS");
    comparisons.status = "package_in_progress";
    w1.status = "package_in_progress";
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: "W1-MBTI-COMPARISONS",
      package_id: "W1-package-gate",
      status: "package_frozen",
      output_directory: "generated/en-content-parity/W1-mbti/comparisons/",
      artifact_files: ARTIFACT_FILES,
      assets: frozenAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(
      packageDirectory,
      scopeManifest,
      frozenAssets
    );
    const candidatePath = path.join(
      packageDirectory,
      "master_manifest_patch.candidate.json"
    );
    const expectedRowCount = frozenAssets.reduce(
      (total, asset) => total + (asset.expected_en_count ?? 0),
      0
    );
    const candidate = {
      $schema: SCHEMA_PATH,
      artifact_kind: "master_manifest_patch_candidate",
      schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: "W1-MBTI-COMPARISONS",
      package_id: "W1-package-gate",
      base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
      sha256_manifest_path: packageEvidence.shaManifestPath,
      package_sha256: packageEvidence.packageSha256,
      proposed_status: "package_frozen",
      gate_evidence: {
        gate: "package_frozen",
        report_path: "handoff.md",
        report_sha256: sha256AbsoluteFile(path.join(packageDirectory, "handoff.md")),
        report_in_package: true,
        owner_lane_id: "W1",
        verdict: null,
        asset_ids: frozenAssets.map((asset) => asset.asset_id),
        row_count: expectedRowCount,
      },
      asset_updates: frozenAssets,
      permissions,
    };
    fs.writeFileSync(candidatePath, JSON.stringify(candidate));

    try {
      let invalidOutput = "";
      try {
        execFileSync(
          "node",
          [
            VALIDATOR_PATH,
            "--manifest",
            progressedManifestPath,
            "--artifact",
            candidatePath,
          ],
          {
            cwd: ROOT,
            encoding: "utf8",
            stdio: ["ignore", "pipe", "pipe"],
          }
        );
      } catch (error) {
        invalidOutput = (error as { stdout?: string }).stdout ?? "";
      }
      expect(JSON.parse(invalidOutput).errors.join("\n")).toContain(
        "package_frozen evidence must use editorial_review.json"
      );

      candidate.gate_evidence.report_path = "editorial_review.json";
      candidate.gate_evidence.report_sha256 = sha256AbsoluteFile(
        path.join(packageDirectory, "editorial_review.json")
      );
      fs.writeFileSync(candidatePath, JSON.stringify(candidate));
      const validOutput = execFileSync(
        "node",
        [
          VALIDATOR_PATH,
          "--manifest",
          progressedManifestPath,
          "--artifact",
          candidatePath,
        ],
        { cwd: ROOT, encoding: "utf8" }
      );
      expect(JSON.parse(validOutput)).toMatchObject({ ok: true, errors: [] });
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory);
    }
  });

  it("accepts an exact fap-api frozen package snapshot without replacing its backend package SHA", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-external-package-"));
    const packageDirectory = makeRegisteredPackageDirectory(
      "generated/en-content-parity/W1-mbti/comparisons/"
    );
    const progressedManifest = w1ComparisonsInventoryFixture(manifest);
    const w1 = progressedManifest.lanes.find((lane) => lane.lane_id === "W1");
    const comparisons = w1?.subscopes.find((subscope) => subscope.id === "W1-MBTI-COMPARISONS");
    if (!w1 || !comparisons) {
      throw new Error("missing W1 external package fixture");
    }
    comparisons.status = "package_in_progress";
    w1.status = "package_in_progress";
    const progressedManifestPath = path.join(tempDirectory, "progressed-master.json");
    fs.writeFileSync(progressedManifestPath, JSON.stringify(progressedManifest));
    const frozenAssets = progressedManifest.assets.filter(
      (asset) => asset.asset_id === "ENPARITY-W1-MBTI-CROSS-COMPARISONS"
    );
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const packageId = "W1-external-package-gate";
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: "W1-MBTI-COMPARISONS",
      package_id: packageId,
      status: "package_frozen",
      output_directory: "generated/en-content-parity/W1-mbti/comparisons/",
      artifact_files: ARTIFACT_FILES,
      assets: frozenAssets,
      permissions,
    };
    const controlPackage = writePackagePayload(packageDirectory, scopeManifest, frozenAssets);
    const externalPackage = writeExternalPackageSnapshot(packageDirectory, {
      packageId,
      laneId: "W1",
      assetId: "ENPARITY-W1-MBTI-CROSS-COMPARISONS",
      rowCountField: "asset_count",
      rowCount: 7,
    });
    const candidatePath = path.join(packageDirectory, "master_manifest_patch.candidate.json");
    const candidate = {
      $schema: SCHEMA_PATH,
      artifact_kind: "master_manifest_patch_candidate",
      schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: "W1-MBTI-COMPARISONS",
      package_id: packageId,
      base_manifest_sha256: sha256AbsoluteFile(progressedManifestPath),
      sha256_manifest_path: controlPackage.shaManifestPath,
      package_sha256: externalPackage.packageSha256,
      external_package_evidence: {
        schema_version: "fermatmind.en_content_parity_external_package_evidence.v1",
        source_repository: "fap-api",
        source_commit_sha: "a".repeat(40),
        source_package_path:
          "backend/content_assets/en-content-parity/W1-mbti/comparisons/exact-package",
        manifest_sha256: externalPackage.manifestSha256,
        row_count_field: "asset_count",
        package_sha256_algorithm: "manifest_files_path_nul_sha256_newline_v1",
      },
      proposed_status: "package_frozen",
      gate_evidence: {
        gate: "package_frozen",
        report_path: "editorial_review.json",
        report_sha256: sha256AbsoluteFile(path.join(packageDirectory, "editorial_review.json")),
        report_in_package: true,
        owner_lane_id: "W1",
        verdict: null,
        asset_ids: frozenAssets.map((asset) => asset.asset_id),
        row_count: 7,
      },
      asset_updates: frozenAssets,
      permissions,
    };

    const validateCandidate = (): { ok: boolean; errors: string[] } => {
      fs.writeFileSync(candidatePath, JSON.stringify(candidate));
      try {
        const output = execFileSync(
          "node",
          [VALIDATOR_PATH, "--manifest", progressedManifestPath, "--artifact", candidatePath],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
        return JSON.parse(output) as { ok: boolean; errors: string[] };
      } catch (error) {
        return JSON.parse((error as { stdout?: string }).stdout ?? "{}") as {
          ok: boolean;
          errors: string[];
        };
      }
    };

    try {
      expect(validateCandidate()).toMatchObject({ ok: true, errors: [] });

      const assetsPath = path.join(externalPackage.snapshotDirectory, "assets.json");
      const originalAssets = fs.readFileSync(assetsPath, "utf8");
      fs.writeFileSync(assetsPath, `${originalAssets}\n`);
      expect(validateCandidate().errors.join("\n")).toContain(
        "external package payload SHA mismatch: assets.json"
      );
      fs.writeFileSync(assetsPath, originalAssets);

      candidate.external_package_evidence.manifest_sha256 = "0".repeat(64);
      expect(validateCandidate().errors.join("\n")).toContain(
        "external package manifest SHA mismatch"
      );
    } finally {
      fs.rmSync(externalPackage.snapshotDirectory, { recursive: true, force: true });
      fs.rmSync(tempDirectory, { recursive: true, force: true });
      cleanupRegisteredPackageDirectory(packageDirectory);
    }
  });

  it("rejects stale, skipping, colliding, duplicate, and unreconciled leaf submissions", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-invalid-"));
    const fixtureManifest = w1ComparisonsInventoryFixture(manifest);
    const fixtureManifestPath = path.join(tempDirectory, "inventory-master.json");
    fs.writeFileSync(fixtureManifestPath, JSON.stringify(fixtureManifest));
    const asset = fixtureManifest.assets.find((entry) => entry.lane_id === "W1");
    if (!asset) {
      throw new Error("missing W1 asset fixture");
    }
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const invalidAssets = [
      {
        ...asset,
        authority_source: "frontend invented authority",
        expected_en_count: 7,
        current_en_count: 7,
        remaining_en_count: 7,
      },
      {
        ...asset,
      },
    ];
    const invalidPackagePath = path.join(tempDirectory, "scope_manifest.json");
    const invalidPatchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
    const invalidScopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: "W1-MBTI-COMPARISONS",
      package_id: "W1-invalid-contract-sample",
      status: "package_frozen",
      output_directory: "generated/en-content-parity/W2-big-five/",
      artifact_files: ARTIFACT_FILES,
      assets: invalidAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(tempDirectory, invalidScopeManifest, invalidAssets);
    fs.writeFileSync(
      invalidPatchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: "W1-MBTI-COMPARISONS",
        package_id: "W1-invalid-contract-sample",
        base_manifest_sha256: "0".repeat(64),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "published",
        gate_evidence: {
          gate: "published",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
          asset_ids: [asset.asset_id],
          row_count: 7,
        },
        asset_updates: invalidAssets,
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync(
          "node",
          [
            VALIDATOR_PATH,
            "--manifest",
            fixtureManifestPath,
            "--artifact",
            invalidPackagePath,
            "--artifact",
            invalidPatchPath,
          ],
          { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] }
        );
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("package output_directory must match the master registry");
      expect(report.errors.join("\n")).toContain(
        "package files must reside directly inside the registered output directory"
      );
      expect(report.errors.join("\n")).toContain("base_manifest_sha256 must match the current master manifest");
      expect(report.errors.join("\n")).toContain("proposed_status must be blocked or the immediate next state package_in_progress");
      expect(report.errors.join("\n")).toContain("asset IDs must be unique");
      expect(report.errors.join("\n")).toContain("translation groups must be unique");
      expect(report.errors.join("\n")).toContain("expected count must equal current plus remaining");
      expect(report.errors.join("\n")).toContain("protected field authority_source cannot change from the master registry");
      expect(report.errors.join("\n")).toContain("controlled transition evidence owner must be CONTROL");
      expect(report.errors.join("\n")).toContain(
        "controlled transition approval must remain outside the immutable package"
      );
      expect(report.errors.join("\n")).toContain("controlled transition verdict must be APPROVED");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects inventory freeze without a complete reconciled lane inventory", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-empty-inventory-"));
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: null,
      package_id: "W1-empty-inventory",
      status: "inventory_frozen",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: [],
      permissions,
    };
    const packageEvidence = writePackagePayload(tempDirectory, scopeManifest, []);
    const patchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
    fs.writeFileSync(
      patchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: null,
        package_id: "W1-empty-inventory",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "inventory_frozen",
        gate_evidence: {
          gate: "inventory_frozen",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
          asset_ids: [],
          row_count: 0,
        },
        asset_updates: [],
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", patchPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("inventory_frozen requires every registered lane asset cohort");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects inventory evidence whose hashed payload does not match the candidate", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-unrelated-inventory-"));
    const inventoryAssets = manifest.assets
      .filter((entry) => entry.lane_id === "W1")
      .map((asset) =>
        asset.parity_state === "inventory_required"
          ? {
              ...asset,
              expected_en_count: 16,
              current_en_count: 0,
              remaining_en_count: 16,
              parity_state: "en_missing",
            }
          : asset
      );
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: null,
      package_id: "W1-unrelated-inventory",
      status: "inventory_frozen",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: inventoryAssets,
      permissions,
    };
    const packageEvidence = writePackagePayload(tempDirectory, scopeManifest, inventoryAssets, []);
    const patchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
    fs.writeFileSync(
      patchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: null,
        package_id: "W1-unrelated-inventory",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "inventory_frozen",
        gate_evidence: {
          gate: "inventory_frozen",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
          asset_ids: inventoryAssets.map((asset) => asset.asset_id),
          row_count: inventoryAssets.reduce((total, asset) => total + (asset.expected_en_count ?? 0), 0),
        },
        asset_updates: inventoryAssets,
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", patchPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("assets.jsonl must exactly match candidate asset_updates");
      expect(report.errors.join("\n")).toContain("source ledger row count must match gate evidence");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects a producer-authored qa_pass without an independent W9 verdict", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-self-qa-"));
    const asset = manifest.assets.find((entry) => entry.lane_id === "W1");
    if (!asset) {
      throw new Error("missing W1 asset fixture");
    }
    const unregisteredAsset = {
      ...asset,
      asset_id: "ENPARITY-W1-UNREGISTERED",
      translation_group: "en-parity:w1:unregistered",
    };
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: null,
      package_id: "W1-self-qa",
      status: "qa_pass",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: [unregisteredAsset],
      permissions,
    };
    const packageEvidence = writePackagePayload(tempDirectory, scopeManifest, [unregisteredAsset]);
    const patchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
    fs.writeFileSync(
      patchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: null,
        package_id: "W1-self-qa",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "qa_pass",
        gate_evidence: {
          gate: "qa_pass",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
          asset_ids: [unregisteredAsset.asset_id],
          row_count: asset.expected_en_count ?? 0,
        },
        asset_updates: [unregisteredAsset],
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", patchPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("qa_pass evidence owner must be W9");
      expect(report.errors.join("\n")).toContain("W9 QA report must remain independent");
      expect(report.errors.join("\n")).toContain("qa_pass evidence verdict must be PASS");
      expect(report.errors.join("\n")).toContain(
        "candidate assets must exactly match the complete registered target"
      );
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });

  it("rejects a package SHA manifest when a covered payload file changes", () => {
    const tempDirectory = fs.mkdtempSync(path.join(os.tmpdir(), "en-parity-control-tamper-"));
    const asset = manifest.assets.find((entry) => entry.lane_id === "W1");
    if (!asset) {
      throw new Error("missing W1 asset fixture");
    }
    const permissions: Permissions = {
      cms_write_authorized: false,
      staging_write_authorized: false,
      production_import_authorized: false,
      public_release_authorized: false,
      seo_runtime_release_authorized: false,
      search_submission_authorized: false,
      master_manifest_write_authorized: false,
    };
    const scopeManifest = {
      $schema: SCHEMA_PATH,
      artifact_kind: "lane_package",
      schema_version: "fermatmind.en_content_parity_lane_package.v1",
      control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
      lane_id: "W1",
      subscope_id: null,
      package_id: "W1-tampered-package",
      status: "blocked",
      output_directory: "generated/en-content-parity/W1-mbti/",
      artifact_files: ARTIFACT_FILES,
      assets: [asset],
      permissions,
    };
    const packageEvidence = writePackagePayload(tempDirectory, scopeManifest, [asset]);
    fs.appendFileSync(path.join(tempDirectory, "source_ledger.json"), "\nTAMPERED");
    const patchPath = path.join(tempDirectory, "master_manifest_patch.candidate.json");
    fs.writeFileSync(
      patchPath,
      JSON.stringify({
        $schema: SCHEMA_PATH,
        artifact_kind: "master_manifest_patch_candidate",
        schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
        control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
        lane_id: "W1",
        subscope_id: null,
        package_id: "W1-tampered-package",
        base_manifest_sha256: sha256File(MANIFEST_PATH),
        sha256_manifest_path: packageEvidence.shaManifestPath,
        package_sha256: packageEvidence.packageSha256,
        proposed_status: "blocked",
        gate_evidence: {
          gate: "blocked",
          report_path: "source_ledger.json",
          report_sha256: packageEvidence.reportSha256,
          report_in_package: true,
          owner_lane_id: "W1",
          verdict: null,
          asset_ids: [asset.asset_id],
          row_count: 1,
        },
        asset_updates: [asset],
        permissions,
      })
    );

    try {
      let output = "";
      try {
        execFileSync("node", [VALIDATOR_PATH, "--artifact", patchPath], {
          cwd: ROOT,
          encoding: "utf8",
          stdio: ["ignore", "pipe", "pipe"],
        });
      } catch (error) {
        output = (error as { stdout?: string }).stdout ?? "";
      }
      const report = JSON.parse(output) as { ok: boolean; errors: string[] };
      expect(report.ok).toBe(false);
      expect(report.errors.join("\n")).toContain("package payload SHA mismatch: source_ledger.json");
    } finally {
      fs.rmSync(tempDirectory, { recursive: true, force: true });
    }
  });
});
