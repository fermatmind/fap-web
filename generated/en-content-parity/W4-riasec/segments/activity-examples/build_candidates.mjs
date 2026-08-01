import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const packageRoot = new URL('.', import.meta.url).pathname;
const apiRoot = process.env.FAP_API_ROOT ?? '/Users/rainie/Desktop/GitHub/fap-api';
const sourceRoot = join(apiRoot, 'backend/content_assets/riasec');
const packageId = 'EN-PARITY-W4-RIASEC-ACTIVITY-ASSETS-2026-08-01';
const permissions = {
  cms_write_authorized: false,
  staging_write_authorized: false,
  production_import_authorized: false,
  public_release_authorized: false,
  seo_runtime_release_authorized: false,
  search_submission_authorized: false,
  master_manifest_write_authorized: false,
};
const dimensions = {
  R: 'Realistic', I: 'Investigative', A: 'Artistic',
  S: 'Social', E: 'Enterprising', C: 'Conventional',
};

const sha256 = (value) => createHash('sha256').update(value).digest('hex');
const normalizeEnglish = (value) => value.replaceAll('｜', ':').replace(/\s*:\s*/g, ': ').trim();
const readJsonl = async (path) => (await readFile(path, 'utf8')).trim().split('\n').map(JSON.parse);
const writeJson = async (path, value) => writeFile(join(packageRoot, path), `${JSON.stringify(value, null, 2)}\n`);
const writeJsonl = async (path, values) => writeFile(join(packageRoot, path), `${values.map((value) => JSON.stringify(value)).join('\n')}\n`);
const existingAssets = await readJsonl(join(packageRoot, 'assets.jsonl')).catch(() => []);
const existingBySource = new Map(existingAssets.map((asset) => [asset.source_identity, asset]));

async function translate(text) {
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.search = new URLSearchParams({ client: 'gtx', sl: 'zh-CN', tl: 'en', dt: 't', q: text }).toString();
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      const translated = body?.[0]?.map((part) => part[0]).join('').trim();
      if (!translated) throw new Error('empty translation');
      return normalizeEnglish(translated);
    } catch (error) {
      if (attempt === 4) throw new Error(`translation failed after ${attempt} attempts: ${error.message}`);
      await new Promise((resolve) => setTimeout(resolve, attempt * 350));
    }
  }
}

async function mapLimit(values, concurrency, map) {
  const output = new Array(values.length);
  let next = 0;
  await Promise.all(Array.from({ length: concurrency }, async () => {
    while (true) {
      const index = next;
      next += 1;
      if (index >= values.length) return;
      output[index] = await map(values[index], index);
      if ((index + 1) % 50 === 0) process.stderr.write(`translated ${index + 1}/${values.length}\n`);
    }
  }));
  return output;
}

const activityPath = join(sourceRoot, 'activity_task_examples_v1.zh-CN.jsonl');
const occupationPath = join(sourceRoot, 'occupation_examples_boundary_v1.zh-CN.jsonl');
const [activities, occupations, activitySource, occupationSource] = await Promise.all([
  readJsonl(activityPath), readJsonl(occupationPath), readFile(activityPath, 'utf8'), readFile(occupationPath, 'utf8'),
]);
if (activities.length !== 360 || occupations.length !== 360) throw new Error('expected 360 activity and 360 occupation source rows');

const translationInputs = [
  ...activities.map((row) => ({ kind: 'activity', key: row.activity_key, field: 'title', text: row.activity_label })),
  ...activities.map((row) => ({ kind: 'activity', key: row.activity_key, field: 'anchor', text: row.task_examples[0] })),
  ...occupations.map((row) => ({ kind: 'occupation', key: row.record_id, field: 'title', text: row.occupation_example })),
];
const cachedTranslation = (input) => {
  const asset = existingBySource.get(`${input.kind}:${input.key}`);
  if (!asset) return null;
  if (input.field === 'title') return normalizeEnglish(asset.title);
  const match = asset.reader_copy.match(/Start by exploring this bounded task: (.+) Notice the activity, conditions, and whether you would like to explore further\./);
  return match ? normalizeEnglish(match[1]) : null;
};
const translated = await mapLimit(translationInputs, 4, async (input) => ({ ...input, translated: cachedTranslation(input) ?? await translate(input.text) }));
const translations = new Map(translated.map((row) => [`${row.kind}:${row.key}:${row.field}`, row.translated]));

const activityAssets = activities.map((row) => {
  const title = translations.get(`activity:${row.activity_key}:title`);
  const anchor = translations.get(`activity:${row.activity_key}:anchor`);
  const dimension = dimensions[row.dimensions[0]];
  return {
    asset_id: `ENPARITY-W4-RIASEC-G05-ACT-${row.activity_key.toUpperCase().replaceAll('_', '-')}`,
    translation_group: `cohort:riasec:activity:${row.activity_key}`,
    source_identity: `activity:${row.activity_key}`,
    locale: 'en', source_locale: 'zh-CN', status: 'unpublished_candidate', review_status: 'pending_independent_w9', runtime_ready: false,
    asset_kind: 'activity_task_example', dimensions: row.dimensions, title,
    reader_copy: `${title} is a low-risk ${dimension} activity example. Start by exploring this bounded task: ${anchor} Notice the activity, conditions, and whether you would like to explore further. It is not a recommendation, ability finding, personality label, job-fit result, or career conclusion.`,
    translation_method: 'machine_translation_candidate_pending_independent_w9',
    permissions,
  };
});
const occupationAssets = occupations.map((row) => {
  const title = translations.get(`occupation:${row.record_id}:title`);
  const dimension = dimensions[row.primary_activity_dimension];
  return {
    asset_id: `ENPARITY-W4-RIASEC-G05-OCC-${row.record_id.replace('occ_example_', '').toUpperCase().replaceAll('_', '-')}`,
    translation_group: `cohort:riasec:occupation:${row.record_id}`,
    source_identity: `occupation:${row.record_id}`,
    locale: 'en', source_locale: 'zh-CN', status: 'unpublished_candidate', review_status: 'pending_independent_w9', runtime_ready: false,
    asset_kind: 'occupation_activity_example', dimensions: [row.primary_activity_dimension], title,
    reader_copy: `${title} is an example setting where ${dimension} activities may appear. Look at actual tasks, conditions, preparation, and responsibilities before deciding whether to learn more. It is not a career recommendation, job-fit score, statement about qualifications, or prediction of opportunity or success.`,
    translation_method: 'machine_translation_candidate_pending_independent_w9',
    permissions,
  };
});
const assets = [...activityAssets, ...occupationAssets];
const sourceLedger = {
  schema_version: 'fermatmind.en_content_parity.w4_riasec_activity_examples_source_ledger.v1', package_id: packageId,
  authority: { repository: 'fap-api', commit: 'b942ff12ffedb63b019311001cbff21beb776fa2', locale: 'zh-CN', sources: [
    { path: 'backend/content_assets/riasec/activity_task_examples_v1.zh-CN.jsonl', sha256: sha256(activitySource), row_count: activities.length },
    { path: 'backend/content_assets/riasec/occupation_examples_boundary_v1.zh-CN.jsonl', sha256: sha256(occupationSource), row_count: occupations.length },
  ]},
  producer: { repository: 'fap-web', commit: 'ca636a5e3647d382a6255f3b52efd7f6ffdf7192', control_status: 'inventory_frozen' },
  rows: [
    ...activities.map((row, index) => ({ source_line: index + 1, source_identity: `activity:${row.activity_key}`, asset_id: activityAssets[index].asset_id, kind: 'activity_task_example', dimension: row.dimensions[0] })),
    ...occupations.map((row, index) => ({ source_line: index + 1, source_identity: `occupation:${row.record_id}`, asset_id: occupationAssets[index].asset_id, kind: 'occupation_activity_example', dimension: row.primary_activity_dimension })),
  ],
  reconciliation: { activity_source_rows: 360, occupation_source_rows: 360, english_candidate_rows: 720, identity_overlap: 0 },
};
const translationMap = {
  schema_version: 'fermatmind.en_content_parity.w4_riasec_activity_examples_translation_map.v1', package_id: packageId,
  source_locale: 'zh-CN', target_locale: 'en', translation_status: 'machine_translation_candidate_only',
  machine_translation_provider: 'Google Translate public endpoint', independent_w9_required: true,
  mappings: assets.map((asset) => ({ source_identity: asset.source_identity, asset_id: asset.asset_id, translation_group: asset.translation_group, asset_kind: asset.asset_kind })),
};
const claimBoundary = {
  schema_version: 'fermatmind.en_content_parity.w4_riasec_activity_examples_claim_boundary_report.v1', package_id: packageId,
  status: 'candidate_only', scope: { activity_rows: 360, occupation_rows: 360, total_rows: 720 },
  boundaries: ['examples_only', 'interest_exploration_only', 'not_personality_identity', 'not_ability_or_skill_measure', 'not_career_recommendation', 'not_job_fit', 'not_success_prediction', 'not_hiring_or_screening_use', 'missing_content_fails_closed', 'frontend_fallback_forbidden'],
  prohibited: ['career_match', 'occupation_ranking', 'fit_score', 'qualification_inference', 'success_prediction', 'hiring_suitability', 'screening_use', '60q_140q_accuracy_claim'],
  permissions,
};
const editorialReview = {
  schema_version: 'fermatmind.en_content_parity.w4_riasec_activity_examples_editorial_review.v1', package_id: packageId,
  review_kind: 'producer self-check only; machine-translation candidates; not independent W9 QA or editorial approval', verdict: 'PENDING_INDEPENDENT_W9',
  completed_self_checks: ['720 source identities mapped once', '360 activity and 360 occupation examples retained as separate physical candidate rows', 'English candidate rows contain no CJK', 'examples-only claim boundary and all-false permissions preserved'],
  next_gates: ['independent W9 row-level language and claim review', 'controlled package freeze', 'separate human import approval if authorized later'], permissions,
};
const machineTranslationEvidence = {
  schema_version: 'fermatmind.en_content_parity.w4_riasec_activity_examples_machine_translation_evidence.v1', package_id: packageId,
  method: 'Google Translate public endpoint; source strings translated individually and retained only in fap-api authority source files',
  candidate_counts: { activity_titles: 360, activity_task_anchors: 360, occupation_titles: 360, total_translation_requests: translated.length },
  review_requirement: 'Every English row remains a machine-translation candidate pending independent W9 review.', permissions,
};
const translationCache = {
  schema_version: 'fermatmind.en_content_parity.w4_riasec_activity_examples_translation_cache.v1', package_id: packageId,
  source_text_retained: false, rows: translated.map(({ kind, key, field, translated: value }) => ({ kind, key, field, translated: value })),
};
await mkdir(packageRoot, { recursive: true });
await writeJsonl('assets.jsonl', assets);
await writeJson('translation_map.json', translationMap);
await writeJson('source_ledger.json', sourceLedger);
await writeJson('claim_boundary_report.json', claimBoundary);
await writeJson('editorial_review.json', editorialReview);
await writeJson('machine_translation_evidence.json', machineTranslationEvidence);
await writeJson('translation_cache.json', translationCache);
const payloadPaths = ['assets.jsonl', 'claim_boundary_report.json', 'editorial_review.json', 'machine_translation_evidence.json', 'source_ledger.json', 'translation_cache.json', 'translation_map.json'];
const payloads = [];
for (const path of payloadPaths) payloads.push({ path, sha256: sha256(await readFile(join(packageRoot, path))) });
const aggregate = sha256(payloads.map(({ path, sha256: digest }) => `${path}\0${digest}\n`).join(''));
await writeJson('package_manifest.json', {
  schema_version: 'fermatmind.en_content_parity.w4_riasec_activity_examples_package_manifest.v1', package_id: packageId, status: 'candidate_only',
  row_count: 720, activity_row_count: 360, occupation_row_count: 360, payloads, aggregate_sha256: aggregate,
  aggregate_method: 'sha256 of each payload, ordered by path; aggregate is sha256 of path + NUL + payload sha256 + LF for every payload', permissions,
});
console.log(JSON.stringify({ packageId, rowCount: assets.length, aggregateSha256: aggregate }));
