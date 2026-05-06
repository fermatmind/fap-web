import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../..");
const FIXTURE_PATH = path.join(
  ROOT,
  "tests/contracts/fixtures/discoverability-foundation/cms-seo-completeness-matrix.v1.json"
);
const DOC_PATH = path.join(ROOT, "docs/seo/cms-seo-completeness-matrix.md");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function read(relPath) {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function assertArray(value, name) {
  assert(Array.isArray(value), `${name} must be an array`);
  assert(value.length > 0, `${name} must not be empty`);
}

function assertUnique(values, name) {
  const unique = new Set(values);
  assert(unique.size === values.length, `${name} must not contain duplicates`);
}

function assertCoreAuthority(fixture, doc) {
  assert(fixture.version === "discoverability.cms_seo_completeness_matrix.v1", "unexpected fixture version");
  assert(fixture.scope === "PR-DF-06", "unexpected fixture scope");
  assert(doc.includes(fixture.version), "doc must include fixture version");

  for (const principle of [
    "backend_owns_seo_truth",
    "frontend_deterministic_render_only",
    "no_frontend_fallback_seo_authority",
    "private_flows_never_discoverable",
  ]) {
    assert(fixture.authorityPrinciples.includes(principle), `missing authority principle: ${principle}`);
  }

  for (const field of [
    "metadata_contract_version",
    "canonical_url",
    "robots_policy",
    "indexability_state",
    "sitemap_state",
    "llms_exposure_state",
    "structured_data_keys",
    "answer_surface_v1",
  ]) {
    assert(fixture.requiredAuthorityFields.includes(field), `missing required authority field: ${field}`);
    assert(doc.includes(field), `doc must mention required field: ${field}`);
  }
}

function assertPageFamilies(fixture, doc) {
  assertArray(fixture.pageFamilies, "pageFamilies");
  const names = fixture.pageFamilies.map((family) => family.name);
  const lowerDoc = doc.toLowerCase();
  assertUnique(names, "pageFamilies.name");

  for (const familyName of [
    "test_detail",
    "topic_detail",
    "personality_detail",
    "career_job_detail",
    "career_guide_detail",
    "article_detail",
    "landing_surface",
    "content_page",
    "dataset_method",
  ]) {
    assert(names.includes(familyName), `missing page family: ${familyName}`);
    assert(lowerDoc.includes(familyName.replaceAll("_", " ")), `doc must mention page family: ${familyName}`);
  }

  for (const family of fixture.pageFamilies) {
    assert(typeof family.owner === "string" && family.owner.length > 0, `${family.name} owner is required`);
    assert(typeof family.frontendConsumer === "string" && family.frontendConsumer.length > 0, `${family.name} consumer is required`);
    assertArray(family.requiredFields, `${family.name}.requiredFields`);
    assertUnique(family.requiredFields, `${family.name}.requiredFields`);
    assertArray(family.forbiddenFields, `${family.name}.forbiddenFields`);
    assert(
      fixture.allowedStates.evidence_container_readiness.includes(family.evidenceContainerReadiness),
      `${family.name} has invalid Evidence Container readiness`
    );

    if (family.name.endsWith("_detail") || family.name === "test_detail" || family.name === "dataset_method") {
      assert(family.requiredFields.includes("canonical_url"), `${family.name} must require canonical_url`);
      assert(family.requiredFields.includes("title"), `${family.name} must require title`);
      assert(family.requiredFields.includes("description"), `${family.name} must require description`);
    }
  }
}

function assertForbiddenStates(fixture, doc) {
  assertArray(fixture.forbiddenStateCombinations, "forbiddenStateCombinations");
  const ruleIds = fixture.forbiddenStateCombinations.map((rule) => rule.id);

  for (const requiredRule of [
    "llms_allow_requires_indexable",
    "sitemap_included_requires_indexable_robots",
    "indexable_detail_requires_canonical",
    "structured_data_requires_visible_or_backend_authority",
    "private_flows_forbidden",
  ]) {
    assert(ruleIds.includes(requiredRule), `missing forbidden state rule: ${requiredRule}`);
  }

  assert(doc.includes("`llms_exposure_state=allow`"), "doc must describe llms/indexability forbidden state");
  assert(doc.includes("Private flows"), "doc must mention private-flow forbidden state");
}

function assertSourceContracts(fixture) {
  assertArray(fixture.sourceTokenContracts, "sourceTokenContracts");

  for (const contract of fixture.sourceTokenContracts) {
    const source = read(contract.source);
    assertArray(contract.requiredTokens, `${contract.source}.requiredTokens`);

    for (const token of contract.requiredTokens) {
      assert(source.includes(token), `${contract.source} is missing required token: ${token}`);
    }
  }
}

export function validateCmsSeoCompletenessMatrix({
  fixture = readJson(FIXTURE_PATH),
  doc = fs.readFileSync(DOC_PATH, "utf8"),
} = {}) {
  assertCoreAuthority(fixture, doc);
  assertPageFamilies(fixture, doc);
  assertForbiddenStates(fixture, doc);
  assertSourceContracts(fixture);

  return {
    version: fixture.version,
    pageFamilies: fixture.pageFamilies.length,
    requiredAuthorityFields: fixture.requiredAuthorityFields.length,
    forbiddenStateCombinations: fixture.forbiddenStateCombinations.length,
    sourceTokenContracts: fixture.sourceTokenContracts.length,
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const summary = validateCmsSeoCompletenessMatrix();
  if (process.argv.includes("--json")) {
    process.stdout.write(`${JSON.stringify(summary, null, 2)}\n`);
  } else {
    process.stdout.write(
      [
        "cms seo completeness matrix ok",
        `pageFamilies=${summary.pageFamilies}`,
        `requiredAuthorityFields=${summary.requiredAuthorityFields}`,
        `forbiddenStateCombinations=${summary.forbiddenStateCombinations}`,
        `sourceTokenContracts=${summary.sourceTokenContracts}`,
      ].join("\n") + "\n"
    );
  }
}
