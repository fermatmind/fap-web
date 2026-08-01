import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const apiRoot = process.env.FAP_API_ROOT ?? '/Users/rainie/Desktop/GitHub/fap-api';
const apiCommit = '660280d00a57e58bd8bc76608e19de2492c03f53';
const webCommit = '02c028e1c81712fa242c8fe4496f74a4ce673f46';
const packageId = 'EN-PARITY-W4-RIASEC-QUALITY-ASSETS-2026-08-01';
const permissions = { cms_write_authorized:false, staging_write_authorized:false, production_import_authorized:false, public_release_authorized:false, seo_runtime_release_authorized:false, search_submission_authorized:false, master_manifest_write_authorized:false };
const sha = value => createHash('sha256').update(value).digest('hex');
const writeJson = (path, value) => writeFile(join(root, path), `${JSON.stringify(value, null, 2)}\n`);
const writeJsonl = (path, value) => writeFile(join(root, path), `${value.map(JSON.stringify).join('\n')}\n`);
const sourcePath = name => join(apiRoot, 'backend/content_assets/riasec', name);
const hasCjk = value => /[\u3400-\u9fff]/.test(value);

const [quality, profile, confidence, nearTie] = await Promise.all([
  readFile(sourcePath('low_quality_cautious_reading_v1.zh-CN.json'), 'utf8').then(JSON.parse),
  readFile(sourcePath('profile_shape_copy_v1.zh-CN.json'), 'utf8').then(JSON.parse),
  readFile(sourcePath('top_code_confidence_copy_v1.zh-CN.json'), 'utf8').then(JSON.parse),
  readFile(sourcePath('near_tie_alternate_code_copy_v1.zh-CN.json'), 'utf8').then(JSON.parse),
]);
const sources = [
  ['backend/content_assets/riasec/low_quality_cautious_reading_v1.zh-CN.json', quality],
  ['backend/content_assets/riasec/profile_shape_copy_v1.zh-CN.json', profile],
  ['backend/content_assets/riasec/top_code_confidence_copy_v1.zh-CN.json', confidence],
  ['backend/content_assets/riasec/near_tie_alternate_code_copy_v1.zh-CN.json', nearTie],
];

const qualityState = Object.fromEntries(quality.states.map(row => [row.quality_state, row]));
const qualitySlot = Object.fromEntries(quality.copy_slots.map(row => [row.slot, row]));
const input = [
  ['confidence', confidence.states, 'state', {
    high_confidence: ['A stronger reading signal', 'The first dimension stands noticeably apart from the later dimensions, giving this result a clearer reading entry point. You can begin with the three-letter code, while using the second and third dimensions to add task conditions. This is not an accuracy rating, an ability judgment, or a career-prospect judgment.'],
    moderate_confidence: ['A standard reading', 'The main signal is readable, but it should not be written as a single conclusion. Start with the Top 2 combination, then look at Top 3 activity signals. Treat the difference as reading strength, not as higher or lower ability.'],
    near_tie: ['Nearly tied signals', 'When the first two or three dimensions are close, do not rush to fix one letter order. Read this as several interest signals worth observing, and compare specific activities through small experiments rather than deciding which is stronger.'],
    broad_profile: ['A broad interest profile', 'When several dimensions are close, put less emphasis on one code and show more observable activities and low-risk choices. A flatter distribution only means the signals are spread out; it does not mean the result is invalid or that the person lacks ability.'],
    low_clarity: ['Read with care', 'This result is best used as an initial signal. Start with the relative six-dimension distribution. Do not give a strong activity-pattern interpretation or treat low clarity as a problem with the respondent.'],
  }],
  ['near_tie', nearTie.states, 'state', {
    top1_top2_near_tie: ['The first two dimensions are close', 'Read the current code first, while also referring to the activity pattern with the first two dimensions reversed. You are not another code; the two interest entry points are simply close.'],
    top2_top3_near_tie: ['The second and third dimensions are close', 'The third dimension is not a decorative detail. It may shape whether this activity pattern is oriented toward materials, expression, real people, goals, or order.'],
    multi_near_tie: ['Several dimensions are close', 'Look at activities before letters. When several dimensions are close, a useful next step is a small task that helps you observe which activities draw you in.'],
    alternate_code_available: ['An alternate code can be consulted', 'An alternate code is a reading aid, not a second answer. It helps you understand how the emphasis of an activity pattern changes when the order differs.'],
  }],
  ['profile_shape', profile.profile_shapes, 'shape', {
    clear_code: ['A clearer main signal', 'The six-dimension distribution shows one relatively leading interest entry point. You can begin with the three-letter order, while keeping the second and third dimensions as additional signals to observe. This is not a fixed identity, an ability conclusion, or a career conclusion.'],
    blended_code: ['Several signals work together', 'The first two or three interest signals are all worth reading. Compare the activities suggested by Top 2 and Top 3, then use small tasks to observe which kinds of activity you want to continue. Do not summarize the whole result with only the first letter.'],
    broad_profile: ['A broad distribution of interests', 'When several dimensions are close, the result is more like an interest map to test than a single path. Narrow it through activities and small experiments: which tasks make you want to continue, and which only seem appealing at first?'],
    near_tie: ['Leading signals are close', 'Letter order is only the reading order for this score pattern. It is not an identity ranking, an ability ranking, or a final answer. Read the alternate-code interpretation as well, then observe one or two real tasks.'],
    low_quality: ['Read with care', 'This result is not suitable for a strong interpretation. The page should protect the user first: soften the three-letter code, hide occupation examples, and suggest a retake or a view limited to the relative six-dimension pattern.'],
    low_clarity: ['The main signal is not concentrated enough', 'The result is not invalid, but the gaps across the six dimensions are not enough to support a strong reading. It is better to start with candidate activities and observation questions than to form a direction conclusion immediately.'],
  }],
];

const rows = [];
for (const [kind, collection, key, english] of input) {
  for (const row of collection) {
    const state = row[key];
    const [title, summary] = english[state] ?? [];
    if (!title || !summary) throw new Error(`missing English mapping for ${kind}:${state}`);
    rows.push({ source_identity: `${kind}:${state}`, asset_kind: kind === 'confidence' ? 'top_code_confidence_reading' : kind === 'near_tie' ? 'near_tie_safe_reading' : 'profile_shape_reading', source_title: row.title ?? row.label, source_summary: row.summary ?? row.copy, title, summary });
  }
}

const qualityRows = [
  ['top_notice', 'top_notice', 'This result needs to be read with care', 'This result needs a careful reading. You can keep it as an initial interest signal without treating the three-letter code as a fixed identity or a career judgment.'],
  ['user_not_blamed_message', null, 'This is not an evaluation of you', 'Answering too quickly, being distracted, finding the questions hard to picture, missing items, or being in an unsettled state can all affect how readable a result is.'],
  ['what_happened_explanation', null, 'Why the reading is being softened', 'When answer quality or result clarity is not sufficient, the system does not present a strong interpretation, so that initial signals are not mistaken for fixed conclusions.'],
  ['hidden_modules_explanation', 'module_downgrade', 'The page will reduce strong interpretations', 'The page will reduce strong interpretations, occupation examples, and deep combination follow-through so that unstable signals are not read as a directional conclusion.'],
  ['retake_guidance', 'retake_guidance', 'A suggestion for retaking later', 'If you were distracted, rushed, or could not picture the questions clearly, you can retake the assessment later when you feel more settled. This improves the answering conditions; it is not blame and it does not require a longer version.'],
  ['share_pdf_boundary', 'share_pdf_note', 'Share and PDF boundary', 'A cautious-reading result should show its boundary in sharing and PDF by default. It should not show strong activity-pattern combinations, occupation examples, or a public Holland Code summary.'],
  ['next_step', null, 'A next step', 'Save the cautious-reading version first, or retake the assessment later when you feel more settled. A longer version is not recommended as the next step right now.'],
  ['cautious_reading_notice', 'caution', 'A light reference', 'This result can be read, but strong conclusions should be softened into signals to observe. Use a small experiment to check activity attraction before making a career judgment.'],
  ['minimal_quality_boundary_60q', 'minimal_60q', 'Minimum quality boundary for 60Q', 'For 60Q, a strong downgrade is used only when there are clear conditions such as missing items or insufficient completion. Other weaker signals only prompt a cautious reading; they are not a low-quality personality judgment.'],
];
for (const [slot, assetSlot, title, summary] of qualityRows) {
  const source = assetSlot && qualitySlot[assetSlot] ? qualitySlot[assetSlot].text : assetSlot && qualityState[assetSlot] ? qualityState[assetSlot].copy : null;
  const defaultSource = {
    user_not_blamed_message: '作答太快、注意力分散、题目想象不清楚、缺题或当时状态不稳定，都可能影响结果的可读性。',
    what_happened_explanation: '当作答质量或结果清晰度不足时，系统暂不把结果写成强解释，以避免把初步线索误读成固定结论。',
    next_step: '先保存谨慎阅读版，或稍后在状态更稳定时重测。当前不推荐继续进入更长版本。',
  };
  rows.push({ source_identity: `quality:${slot}`, asset_kind: 'quality_copy_runtime_slot', source_title: slot, source_summary: source ?? defaultSource[slot], title, summary, slot_name: slot });
}
if (rows.length !== 24 || new Set(rows.map(row => row.source_identity)).size !== 24) throw new Error('expected 24 unique G08 source identities');

const assets = rows.map(row => ({
  asset_id: `ENPARITY-W4-RIASEC-G08-${row.source_identity.toUpperCase().replace(/[^A-Z0-9]+/g, '-')}`,
  translation_group: `cohort:riasec:quality:${row.source_identity}`,
  source_identity: row.source_identity,
  locale: 'en', source_locale: 'zh-CN', status: 'unpublished_candidate', review_status: 'pending_independent_w9', runtime_ready: false,
  asset_kind: row.asset_kind, slot_name: row.slot_name ?? null, title: row.title, summary: row.summary,
  reader_boundary: 'This is a cautious reading of interest signals only. It is not a personality identity, ability finding, job-fit conclusion, career recommendation, score correction, or Holland Code change.',
  user_blame_allowed: false, upsell_140q_allowed: false, strong_interpretation_allowed: false, result_mutation_allowed: false, score_mutation_allowed: false, measured_holland_code_mutation_allowed: false,
  recommended_action_type: 'cautious_reading_or_retake_only', frontend_fallback_allowed: false, fallback_behavior: 'omit_module',
  translation_method: 'source_anchored_English_candidate_pending_independent_w9', permissions,
}));
if (assets.some(asset => hasCjk(`${asset.title}\n${asset.summary}\n${asset.reader_boundary}`))) throw new Error('CJK found in candidate reader text');

const ledger = {
  schema_version: 'fermatmind.en_content_parity.w4_riasec_quality_source_ledger.v1', package_id: packageId,
  authority: { repository: 'fap-api', commit: apiCommit, locale: 'zh-CN', sources: await Promise.all(sources.map(async ([path]) => ({ path, sha256: sha(await readFile(join(apiRoot, path))), source_kind: 'backend_authority' }))), registry: { path: 'backend/app/Services/Riasec/RiasecDeepCopySlotRegistry.php', slots: 9 } },
  producer: { repository: 'fap-web', commit: webCommit, control_status: 'inventory_frozen' },
  rows: rows.map((row, index) => ({ source_row: index + 1, source_identity: row.source_identity, asset_id: assets[index].asset_id, translation_group: assets[index].translation_group, group_id: 'W4-G08' })),
  reconciliation: { group_id: 'W4-G08', zh_authority_rows: 24, english_candidate_rows: 24, identity_unique: true, private_data_accessed: false },
};
const map = { schema_version: 'fermatmind.en_content_parity.w4_riasec_quality_translation_map.v1', package_id: packageId, source_locale: 'zh-CN', target_locale: 'en', translation_status: 'candidate_only', mappings: assets.map(asset => ({ source_identity: asset.source_identity, asset_id: asset.asset_id, translation_group: asset.translation_group, asset_kind: asset.asset_kind })) };
const claim = { schema_version: 'fermatmind.en_content_parity.w4_riasec_quality_claim_boundary_report.v1', package_id: packageId, status: 'candidate_only', boundaries: ['interest_evidence_only', 'not_personality_identity', 'not_ability_or_skill_measure', 'not_career_recommendation', 'not_job_fit', 'not_success_prediction', 'no_result_or_score_mutation', 'no_holland_code_mutation', 'no_140q_upsell', 'missing_content_fails_closed', 'frontend_fallback_forbidden'], prohibited_claims: ['ability_inference', 'identity_label', 'career_match', 'job_fit', 'success_prediction', 'hiring_or_screening_use', 'result_override', 'raw_score_comparison', '140q_more_accurate'], permissions };
const review = { schema_version: 'fermatmind.en_content_parity.w4_riasec_quality_editorial_review.v1', package_id: packageId, review_kind: 'producer self-check only; not independent W9 QA or editorial approval', verdict: 'PENDING_INDEPENDENT_W9', completed_self_checks: ['24 frozen source identities mapped once', 'candidate reader text contains no CJK', 'cautious-reading, no-blame, no-upsell, and fail-closed boundaries retained', 'all permissions remain false'], next_gates: ['independent W9 language, psychometrics, and product-boundary review', 'controlled package freeze'], permissions };
const cache = { schema_version: 'fermatmind.en_content_parity.w4_riasec_quality_translation_cache.v1', package_id: packageId, source_text_retained: false, rows: rows.map(row => ({ source_identity: row.source_identity, title: row.title, summary: row.summary, method: 'source_anchored_English_candidate_pending_independent_w9' })) };

await mkdir(root, { recursive: true });
await writeJsonl('assets.jsonl', assets); await writeJson('translation_map.json', map); await writeJson('source_ledger.json', ledger); await writeJson('claim_boundary_report.json', claim); await writeJson('editorial_review.json', review); await writeJson('translation_cache.json', cache);
const paths = ['assets.jsonl', 'claim_boundary_report.json', 'editorial_review.json', 'source_ledger.json', 'translation_cache.json', 'translation_map.json'];
const payloads = await Promise.all(paths.map(async path => ({ path, sha256: sha(await readFile(join(root, path))) })));
const aggregate = sha(payloads.map(payload => `${payload.path}\0${payload.sha256}\n`).join(''));
await writeJson('package_manifest.json', { schema_version: 'fermatmind.en_content_parity.w4_riasec_quality_package_manifest.v1', package_id: packageId, status: 'candidate_only', row_count: 24, payloads, aggregate_sha256: aggregate, aggregate_method: 'sha256 of each payload, ordered by path; aggregate is sha256 of path + NUL + payload sha256 + LF for every payload', permissions });
console.log(JSON.stringify({ rows: assets.length, aggregate_sha256: aggregate }));
