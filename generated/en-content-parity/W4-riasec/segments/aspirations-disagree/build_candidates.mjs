import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const apiRoot = process.env.FAP_API_ROOT ?? '/Users/rainie/Desktop/GitHub/fap-api';
const apiCommit = '660280d00a57e58bd8bc76608e19de2492c03f53';
const webCommit = 'e093d89e9362b77b29d7e64dbaa79f20a8f1f4ea';
const packageId = 'EN-PARITY-W4-RIASEC-CALIBRATION-ASSETS-2026-08-01';
const permissions = { cms_write_authorized:false, staging_write_authorized:false, production_import_authorized:false, public_release_authorized:false, seo_runtime_release_authorized:false, search_submission_authorized:false, master_manifest_write_authorized:false };
const sha = value => createHash('sha256').update(value).digest('hex');
const assetKey = identity => `${identity.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '')}-${sha(identity).slice(0, 12)}`;
const writeJson = (path, value) => writeFile(join(root, path), `${JSON.stringify(value, null, 2)}\n`);
const writeJsonl = (path, value) => writeFile(join(root, path), `${value.map(JSON.stringify).join('\n')}\n`);
const readJsonl = async path => (await readFile(path, 'utf8')).trim().split('\n').map(JSON.parse);
const sourcePath = name => join(apiRoot, 'backend/content_assets/riasec', name);
const clean = value => value.replaceAll('｜', ' — ').replaceAll('“', '“').replaceAll('”', '”').trim();

async function translate(text) {
  const url = new URL('https://translate.googleapis.com/translate_a/single');
  url.search = new URLSearchParams({ client:'gtx', sl:'zh-CN', tl:'en', dt:'t', q:text }).toString();
  for (let attempt = 1; attempt <= 4; attempt += 1) {
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const body = await response.json();
      const translated = clean(body?.[0]?.map(part => part[0]).join('') ?? '');
      if (!translated || /[\u3400-\u9fff]/.test(translated)) throw new Error('empty or CJK translation');
      return translated;
    } catch (error) {
      if (attempt === 4) throw error;
      await new Promise(resolve => setTimeout(resolve, attempt * 250));
    }
  }
  throw new Error('unreachable');
}
async function mapLimit(values, parallelism, fn) {
  const output = Array(values.length); let next = 0;
  await Promise.all(Array.from({ length: parallelism }, async () => {
    while (true) { const index = next++; if (index >= values.length) return; output[index] = await fn(values[index]); }
  }));
  return output;
}

const aspirationsPath = sourcePath('aspirations_calibration_v1.zh-CN.jsonl');
const disagreePath = sourcePath('disagree_path_v1.zh-CN.jsonl');
const [aspirations, disagreements] = await Promise.all([readJsonl(aspirationsPath), readJsonl(disagreePath)]);
if (aspirations.length !== 70 || disagreements.length !== 45) throw new Error(`expected 70/45 source rows, got ${aspirations.length}/${disagreements.length}`);
const fields = [];
for (const row of aspirations) {
  const identity = row.domain_key;
  fields.push({ identity, field:'aspiration_label', text:row.user_aspiration_label });
  fields.push({ identity, field:'overlap_reading', text:row.overlap_reading });
  row.reality_questions.forEach((text, index) => fields.push({ identity, field:`reality_question_${index + 1}`, text }));
  fields.push({ identity, field:'next_low_risk_experiment', text:row.next_low_risk_experiment });
}
for (const row of disagreements) {
  const identity = row.state;
  fields.push({ identity, field:'title', text:row.title });
  fields.push({ identity, field:'summary', text:row.summary });
  row.questions.forEach((text, index) => fields.push({ identity, field:`question_${index + 1}`, text }));
  fields.push({ identity, field:'recommended_next_action', text:row.recommended_next_action });
}
const translated = await mapLimit(fields, 4, async field => ({ ...field, value: await translate(field.text) }));
const valueFor = new Map(translated.map(row => [`${row.identity}\0${row.field}`, row.value]));
const get = (identity, field) => {
  const value = valueFor.get(`${identity}\0${field}`);
  if (!value) throw new Error(`missing translation ${identity}:${field}`);
  return value;
};
const common = {
  locale:'en', source_locale:'zh-CN', status:'unpublished_candidate', review_status:'pending_independent_w9', runtime_ready:false,
  reader_boundary:'This is an exploration overlay and next-step prompt only. It does not infer ability, provide a career recommendation or job-fit conclusion, modify scores or the measured Holland Code, or change a report snapshot, sharing, or PDF.',
  score_mutation_allowed:false, measured_holland_code_mutation_allowed:false, result_mutation_allowed:false, snapshot_mutation_allowed:false, share_pdf_mutation_allowed:false,
  frontend_fallback_allowed:false, fallback_behavior:'omit_module', translation_method:'machine_translation_candidate_pending_independent_w9', permissions,
};
const aspirationAssets = aspirations.map(row => ({
  ...common, asset_id:`ENPARITY-W4-RIASEC-G09-${assetKey(row.domain_key)}`,
  translation_group:`cohort:riasec:aspirations:${row.domain_key}`, source_identity:row.domain_key, asset_kind:'aspiration_calibration',
  aspiration_label:get(row.domain_key, 'aspiration_label'), likely_overlap_dimensions:row.likely_overlap_dimensions,
  overlap_reading:get(row.domain_key, 'overlap_reading'), reality_questions:row.reality_questions.map((_, index) => get(row.domain_key, `reality_question_${index + 1}`)),
  next_low_risk_experiment:get(row.domain_key, 'next_low_risk_experiment'), validation_questions_only:true, aspiration_override_allowed:false, aspiration_replaces_measured_result_allowed:false,
  recommended_output:'validation_questions_and_low_risk_experiment', result_binding:'overlay_only_does_not_mutate_measured_result',
}));
const disagreeAssets = disagreements.map(row => ({
  ...common, asset_id:`ENPARITY-W4-RIASEC-G10-${assetKey(row.state)}`,
  translation_group:`cohort:riasec:disagree:${row.state}`, source_identity:row.state, asset_kind:'disagree_path',
  title:get(row.state, 'title'), summary:get(row.state, 'summary'), questions:row.questions.map((_, index) => get(row.state, `question_${index + 1}`)), recommended_next_action:get(row.state, 'recommended_next_action'),
  retake_allowed:Boolean(row.retake_allowed), next_steps_only:true, feedback_replaces_measured_result_allowed:false, result_override_allowed:false, raw_feedback_public_exposure_allowed:false,
  recommended_output:'next_steps_and_optional_retake_only', result_binding:'overlay_only_does_not_mutate_snapshot_share_pdf',
}));
const assets = [...aspirationAssets, ...disagreeAssets];
const readerText = asset => [asset.aspiration_label, asset.overlap_reading, ...(asset.reality_questions ?? []), asset.next_low_risk_experiment, asset.title, asset.summary, ...(asset.questions ?? []), asset.recommended_next_action, asset.reader_boundary].filter(Boolean).join('\n');
if (assets.length !== 115 || new Set(assets.map(asset => asset.source_identity)).size !== 115 || assets.some(asset => /[\u3400-\u9fff]/.test(readerText(asset)))) throw new Error('candidate identity or visible CJK validation failed');
const ledger = { schema_version:'fermatmind.en_content_parity.w4_riasec_calibration_source_ledger.v1', package_id:packageId,
  authority:{ repository:'fap-api', commit:apiCommit, locale:'zh-CN', sources:[{ path:'backend/content_assets/riasec/aspirations_calibration_v1.zh-CN.jsonl', sha256:sha(await readFile(aspirationsPath)), row_count:70 },{ path:'backend/content_assets/riasec/disagree_path_v1.zh-CN.jsonl', sha256:sha(await readFile(disagreePath)), row_count:45 }], registry:'backend/app/Services/Riasec/RiasecDeepCopySlotRegistry.php' },
  producer:{ repository:'fap-web', commit:webCommit, control_status:'inventory_frozen' },
  rows:assets.map((asset, index) => ({ source_row:index + 1, source_identity:asset.source_identity, asset_id:asset.asset_id, translation_group:asset.translation_group, group_id:index < 70 ? 'W4-G09' : 'W4-G10' })),
  reconciliation:{ aspirations_rows:70, disagree_rows:45, english_candidate_rows:115, identity_unique:true, private_data_accessed:false },
};
const map = { schema_version:'fermatmind.en_content_parity.w4_riasec_calibration_translation_map.v1', package_id:packageId, source_locale:'zh-CN', target_locale:'en', translation_status:'candidate_only', mappings:assets.map(asset => ({ source_identity:asset.source_identity, asset_id:asset.asset_id, translation_group:asset.translation_group, asset_kind:asset.asset_kind })) };
const claim = { schema_version:'fermatmind.en_content_parity.w4_riasec_calibration_claim_boundary_report.v1', package_id:packageId, status:'candidate_only', boundaries:['interest_evidence_only','not_personality_identity','not_ability_or_skill_measure','not_career_recommendation','not_job_fit','not_success_prediction','feedback_does_not_mutate_measured_result','no_score_or_holland_code_mutation','no_snapshot_share_pdf_mutation','missing_content_fails_closed','frontend_fallback_forbidden'], permissions };
const review = { schema_version:'fermatmind.en_content_parity.w4_riasec_calibration_editorial_review.v1', package_id:packageId, review_kind:'producer self-check only; not independent W9 QA or editorial approval', verdict:'PENDING_INDEPENDENT_W9', completed_self_checks:['70 aspiration and 45 disagree source identities mapped once','candidate text contains no CJK','exploration-only and no-result-mutation boundaries retained','all permissions remain false'], next_gates:['independent W9 language, psychometrics, and product-boundary review','controlled package freeze'], permissions };
const cache = { schema_version:'fermatmind.en_content_parity.w4_riasec_calibration_translation_cache.v1', package_id:packageId, source_text_retained:false, rows:translated.map(({ identity, field, value }) => ({ identity, field, value, method:'machine_translation_candidate_pending_independent_w9' })) };
await mkdir(root, { recursive:true }); await writeJsonl('assets.jsonl', assets); await writeJson('translation_map.json', map); await writeJson('source_ledger.json', ledger); await writeJson('claim_boundary_report.json', claim); await writeJson('editorial_review.json', review); await writeJson('translation_cache.json', cache);
const paths = ['assets.jsonl','claim_boundary_report.json','editorial_review.json','source_ledger.json','translation_cache.json','translation_map.json']; const payloads = await Promise.all(paths.map(async path => ({ path, sha256:sha(await readFile(join(root, path))) }))); const aggregate = sha(payloads.map(payload => `${payload.path}\0${payload.sha256}\n`).join(''));
await writeJson('package_manifest.json', { schema_version:'fermatmind.en_content_parity.w4_riasec_calibration_package_manifest.v1', package_id:packageId, status:'candidate_only', row_count:115, aspirations_row_count:70, disagree_row_count:45, payloads, aggregate_sha256:aggregate, aggregate_method:'sha256 of each payload, ordered by path; aggregate is sha256 of path + NUL + payload sha256 + LF for every payload', permissions });
console.log(JSON.stringify({ rows:assets.length, aggregate_sha256:aggregate }));
