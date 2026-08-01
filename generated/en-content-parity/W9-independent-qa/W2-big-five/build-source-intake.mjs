import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { lstatSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';

const webRoot = process.cwd();
const apiRoot = '/Users/rainie/Desktop/GitHub/fap-api';
const controlCommit = '83c49f544e371a7e927a851af07f22d8f2a267cc';
const historicalCommit = '2b2c971c6077fa4101a54826c6b3703eb5b6b3e1';
const resultCommit = '44350a696d8d1123fa2ea7831708d709831cf34b';
const packageSha = 'a41816a824c30979af7b5ebcb95c689ff71584f7ad2c21df277f127f18eaa82b';
const sourceLedgerSha = '5f7c3e2c39a4301c8d0ad79028a3757ec0e541d1b532570c643f64727476fb3f';
const en52ReleaseSha = '91f3c1e94894cfe59ce17ee00e5046d26a9cafc9113fe1eeb4488e4951e4940a';
const historicalEvidenceSha = '7bb6cf15b93058337299dd4a1c32a881fa59e29f98ec33c71e6a0df2ec7dcbdd';
const resultPackageSha = 'aea87a8c0545d1be6cb1a32ff981576d62d077a8eab36834f34ec9d41c1bfc81';
// This is the captured reader baseline before PR A writes any intake metadata.
// Rebased W3-only main advancement must not turn this PR's own HEAD into a renderer identity.
const rendererCommit = 'b1f7589c1241cf17599bac1e352a11485b6d7468';
const root = join(webRoot, 'generated/en-content-parity/W9-independent-qa/W2-big-five', `${packageSha.slice(0, 8)}-renderer-${rendererCommit.slice(0, 8)}`);

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const gitShow = (cwd, spec) => execFileSync('git', ['-C', cwd, 'show', spec], { maxBuffer: 32 * 1024 * 1024 });
const write = (path, value) => { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, value); };
const writeJson = (path, value) => write(path, `${JSON.stringify(value, null, 2)}\n`);
const readJson = (path) => JSON.parse(gitShow(webRoot, `${controlCommit}:${path}`).toString('utf8'));
const listedFiles = (directory) => {
  const output = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) output.push(...listedFiles(path));
    else if (entry.isFile()) output.push(path);
    else throw new Error(`non-regular snapshot entry: ${path}`);
  }
  return output;
};

rmSync(root, { recursive: true, force: true });
mkdirSync(root, { recursive: true });

// The CONTROL commit, not the mutable checkout, is the byte authority for all ten files.
const frozenSource = 'generated/en-content-parity/W2-big-five';
const frozenTarget = join(root, 'frozen_package');
const frozenFiles = execFileSync('git', ['-C', webRoot, 'ls-tree', '-r', '--name-only', controlCommit, frozenSource], { encoding: 'utf8' })
  .trim().split('\n').filter(Boolean);
if (frozenFiles.length !== 10) throw new Error(`expected ten W2 files, got ${frozenFiles.length}`);
for (const sourcePath of frozenFiles) write(join(frozenTarget, relative(frozenSource, sourcePath)), gitShow(webRoot, `${controlCommit}:${sourcePath}`));
const frozenManifest = JSON.parse(gitShow(webRoot, `${controlCommit}:${frozenSource}/sha256_manifest.json`).toString('utf8'));
for (const entry of frozenManifest.files) {
  const bytes = gitShow(webRoot, `${controlCommit}:${frozenSource}/${entry.path}`);
  if (sha256(bytes) !== entry.sha256) throw new Error(`frozen file mismatch: ${entry.path}`);
}
const envelope = frozenManifest.files.filter(({ path }) => !['sha256_manifest.json', 'master_manifest_patch.candidate.json'].includes(path));
const envelopeCanonicalEntries = envelope.map(({ path, sha256: value }) => `${path}:${value}`).join('\n');
if (envelope.length !== 8 || sha256(envelopeCanonicalEntries) !== packageSha || frozenManifest.package_sha256 !== packageSha) throw new Error('W2 envelope SHA mismatch');
if (sha256(gitShow(webRoot, `${controlCommit}:${frozenSource}/source_ledger.json`)) !== sourceLedgerSha) throw new Error('frozen source ledger SHA mismatch');

const en52Dir = 'generated/big-five-en52-release';
const en52Release = gitShow(apiRoot, `${resultCommit}:${en52Dir}/release-package.json`);
const en52Compile = gitShow(apiRoot, `${resultCommit}:${en52Dir}/compile-report.json`);
if (sha256(en52Release) !== en52ReleaseSha) throw new Error('EN52 release SHA mismatch');
const en52 = JSON.parse(en52Release.toString('utf8'));
if (en52.asset_count !== 52 || en52.claims_count !== 170 || en52.faq_count !== 261 || en52.media_supported !== false) throw new Error('EN52 count or media boundary mismatch');
const familyCounts = en52.family_counts;
if (familyCounts.hub !== 1 || familyCounts.domain !== 5 || familyCounts.polarity !== 15 || familyCounts.facet_hub !== 1 || familyCounts.facet_detail !== 30) throw new Error('EN52 family count mismatch');
write(join(root, 'source_snapshots/en52-release/release-package.json'), en52Release);
write(join(root, 'source_snapshots/en52-release/compile-report.json'), en52Compile);
for (const asset of en52.assets) {
  const assetIdentity = asset.asset_id ?? asset.authority_asset_key ?? asset.asset?.authority?.asset_id ?? asset.asset?.code ?? asset.slug ?? asset.code;
  if (!assetIdentity) throw new Error('EN52 asset without identity');
  writeJson(join(root, 'source_snapshots/en52-release/assets', `${assetIdentity}.json`), asset);
}
writeJson(join(root, 'source_snapshots/en52-release/source_attestation.json'), {
  authority: 'fap-api immutable git object', source_repository: apiRoot, commit: resultCommit, source_directory: en52Dir,
  release_package_sha256: sha256(en52Release), expected_release_package_sha256: en52ReleaseSha, asset_count: en52.assets.length,
  claims_count: en52.claims_count, faq_count: en52.faq_count, family_counts: familyCounts, media_supported: false,
});

const historicalPath = 'backend/docs/seo/generated/en-parity-w2-big-five-draft-inventory.v1.json';
const historical = gitShow(apiRoot, `${historicalCommit}:${historicalPath}`);
if (sha256(historical) !== historicalEvidenceSha) throw new Error('historical evidence SHA mismatch');
const historicalJson = JSON.parse(historical.toString('utf8'));
if (historicalJson.rows.length !== 50 || historicalJson.counts.independent_current_drafts !== 0 || historicalJson.counts.current_working_equals_published !== 50) throw new Error('historical lifecycle mismatch');
write(join(root, 'source_snapshots/historical-revisions/en-parity-w2-big-five-draft-inventory.v1.json'), historical);
writeJson(join(root, 'source_snapshots/historical-revisions/source_attestation.json'), {
  authority: 'fap-api immutable git object', source_repository: apiRoot, commit: historicalCommit, source_path: historicalPath,
  sha256: sha256(historical), expected_sha256: historicalEvidenceSha, historical_rows: historicalJson.rows.length,
  independent_current_drafts: 0, current_working_equals_published: 50,
});

const resultDir = 'backend/content_packs/BIG5_OCEAN/v2/packages/en_parity/w2_result_content_v1';
const resultFiles = execFileSync('git', ['-C', apiRoot, 'ls-tree', '-r', '--name-only', resultCommit, resultDir], { encoding: 'utf8' }).trim().split('\n').filter(Boolean);
for (const sourcePath of resultFiles) write(join(root, 'source_snapshots/w2-result-content-v1', relative(resultDir, sourcePath)), gitShow(apiRoot, `${resultCommit}:${sourcePath}`));
const resultShaManifest = JSON.parse(gitShow(apiRoot, `${resultCommit}:${resultDir}/sha256_manifest.json`).toString('utf8'));
for (const entry of resultShaManifest.files) {
  const bytes = gitShow(apiRoot, `${resultCommit}:${resultDir}/${entry.path}`);
  if (sha256(bytes) !== entry.sha256) throw new Error(`result child mismatch: ${entry.path}`);
}
if (resultShaManifest.package_sha256 !== resultPackageSha) throw new Error('result package aggregate SHA mismatch');
const resultManifest = JSON.parse(gitShow(apiRoot, `${resultCommit}:${resultDir}/package_manifest.json`).toString('utf8'));
if (resultManifest.inventory_unit_count !== 16 || resultManifest.content_asset_count !== 16 || resultManifest.runtime_use !== 'draft_review_only' || resultManifest.ready_for_runtime || resultManifest.ready_for_production || resultManifest.production_use_allowed) throw new Error('result package readiness mismatch');

const rendererPaths = [
  ['public_page_renderer', 'app/(localized)/[locale]/personality/big-five/[...slug]/page.tsx'],
  ['public_api_adapter', 'lib/cms/personalityPublicAssetLoader.ts'],
  ['public_route_catalog', 'lib/personality/bigFivePublicRoutes.ts'],
  ['result_v2_shell', 'components/result/big5/Big5ResultPageV2Shell.tsx'],
  ['result_v2_adapter', 'lib/big5/resultPageV2.ts'],
  ['result_api_adapter', 'lib/big5/api.ts'],
  ['pdf_consumer', 'components/big5/pdf/PdfDownloadButton.tsx'],
  ['history_page', 'app/(localized)/[locale]/(app)/history/big5/page.tsx'],
  ['history_client', 'app/(localized)/[locale]/(app)/history/big5/Big5HistoryClient.tsx'],
  ['generic_share_consumer', 'app/(localized)/[locale]/share/[id]/ShareClient.tsx'],
];
const rendererConsumers = rendererPaths.map(([consumer, path]) => {
  try { return { consumer, path, exists_at_renderer_baseline: true, blob_sha: execFileSync('git', ['rev-parse', `${rendererCommit}:${path}`], { cwd: webRoot, encoding: 'utf8' }).trim(), alignment_status: 'captured_for_independent_review_not_asserted_aligned' }; }
  catch { return { consumer, path, exists_at_renderer_baseline: false, blob_sha: null, alignment_status: 'consumer_not_present_or_not_big-five-specific' }; }
});
writeJson(join(root, 'renderer_baseline.json'), {
  renderer_repository: 'fap-web', renderer_commit: rendererCommit, renderer_sha8: rendererCommit.slice(0, 8),
  source_intake_base_sha: rendererCommit, consumers: rendererConsumers,
  note: 'This intake records reader/API surfaces for W9 review; it does not assert runtime alignment or production consumption.',
});

const sourceLedger = readJson(`${frozenSource}/source_ledger.json`);
if (sourceLedger.rows.length !== 118) throw new Error('source ledger coverage mismatch');
const rowIdentity = sourceLedger.rows.map((row, index) => ({
  row_id: row.row_id, asset_id: row.asset_id, cohort: row.cohort,
  identity_kind: 'row_id_plus_frozen_canonical_row_sha256',
  frozen_row_sha256: sha256(JSON.stringify(row)),
  source_locator: `frozen_package/source_ledger.json#/rows/${index}`,
}));
if (new Set(rowIdentity.map(({ row_id }) => row_id)).size !== 118 || new Set(rowIdentity.map(({ frozen_row_sha256 }) => frozen_row_sha256)).size !== 118) throw new Error('row identity uniqueness mismatch');
writeJson(join(root, 'frozen_source_ledger_identity_projection.json'), {
  package_sha256: packageSha, source_ledger_sha256: sourceLedgerSha, reviewed_row_count: 118,
  counts: { public_profiles: 52, historical_revision_slots: 50, result_report_share_pdf_history_units: 16 }, rows: rowIdentity,
});

// Build a fail-closed manifest from exact snapshot file bytes.
const byteArtifacts = listedFiles(root).filter((path) => !path.endsWith('/source_snapshot_manifest.json') && !path.endsWith('/source_snapshot_sha256_manifest.json') && !path.endsWith('/handoff.md') && !path.endsWith('/build-source-intake.mjs'))
  .map((path) => ({ path: relative(root, path), sha256: sha256(execFileSync('git', ['hash-object', path], { encoding: 'utf8' }).trim()) }));
// `git hash-object` is not SHA-256, so replace with the true file bytes once and retain a fail-closed manifest.
for (const entry of byteArtifacts) entry.sha256 = execFileSync('shasum', ['-a', '256', join(root, entry.path)], { encoding: 'utf8' }).split(/\s+/)[0];
writeJson(join(root, 'source_snapshot_manifest.json'), {
  artifact_kind: 'fermatmind.en_content_parity.w9_w2_source_snapshot.v1', package_sha256: packageSha,
  control_acceptance_commit: controlCommit, source_ledger_sha256: sourceLedgerSha, en52_release_package_sha256: en52ReleaseSha,
  historical_evidence_sha256: historicalEvidenceSha, result_content_commit: resultCommit, result_content_package_sha256: resultPackageSha,
  renderer_commit: rendererCommit, renderer_sha8: rendererCommit.slice(0, 8), files: byteArtifacts,
});
writeJson(join(root, 'source_snapshot_sha256_manifest.json'), {
  artifact_kind: 'fermatmind.en_content_parity.w9_w2_source_snapshot_sha256.v1', files: listedFiles(root)
    .filter((path) => !path.endsWith('/source_snapshot_sha256_manifest.json') && !path.endsWith('/handoff.md') && !path.endsWith('/build-source-intake.mjs'))
    .map((path) => ({ path: relative(root, path), sha256: execFileSync('shasum', ['-a', '256', path], { encoding: 'utf8' }).split(/\s+/)[0] })),
});
write(join(root, 'handoff.md'), `# W2 Big Five W9 immutable source intake\n\n- W2 control package: \`${packageSha}\`, accepted by CONTROL commit \`${controlCommit}\`.\n- W2 source ledger: \`${sourceLedgerSha}\`; identity projection contains exactly 118 unique rows.\n- EN52 source: fap-api \`${resultCommit}\`, release package \`${en52ReleaseSha}\`.\n- Historical evidence: fap-api \`${historicalCommit}\`, \`${historicalEvidenceSha}\`.\n- Result-content child package: fap-api \`${resultCommit}\`, \`${resultPackageSha}\`.\n- Renderer baseline: fap-web \`${rendererCommit}\`.\n\nThis is source intake only: no independent verdict, CONTROL candidate, CMS write, runtime change, import, or publication is present.\n`);

for (const path of listedFiles(root)) if (lstatSync(path).isSymbolicLink()) throw new Error(`symlink rejected: ${path}`);
console.log(JSON.stringify({ root, rendererCommit, frozenFiles: frozenFiles.length, en52Assets: en52.assets.length, historicalRows: historicalJson.rows.length, resultFiles: resultFiles.length, projectedRows: rowIdentity.length }, null, 2));
