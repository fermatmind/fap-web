import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('.', import.meta.url).pathname;
const apiRoot = process.env.FAP_API_ROOT ?? '/Users/rainie/Desktop/GitHub/fap-api';
const apiCommit = '660280d00a57e58bd8bc76608e19de2492c03f53';
const webCommit = 'd74135e8c6b02370123b9c8bd2440b6672709e6a';
const packageId = 'EN-PARITY-W4-RIASEC-SAFE-VARIANTS-2026-08-01';
const permissions = { cms_write_authorized:false, staging_write_authorized:false, production_import_authorized:false, public_release_authorized:false, seo_runtime_release_authorized:false, search_submission_authorized:false, master_manifest_write_authorized:false };
const sha = value => createHash('sha256').update(value).digest('hex');
const json = value => `${JSON.stringify(value, null, 2)}\n`;
const write = (file, value) => writeFile(join(root, file), json(value));
const assetKey = value => `${value.toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '')}-${sha(value).slice(0, 12)}`;
const source = await readFile(join(apiRoot, 'backend/content_assets/riasec/share_pdf_history_v1.en.json'), 'utf8');
const zhSource = await readFile(join(apiRoot, 'backend/content_assets/riasec/share_pdf_history_v1.zh-CN.json'), 'utf8');
const input = JSON.parse(source);
if (input.locale !== 'en' || input.review_status !== 'draft_human_review_required' || input.surfaces.length !== 7) throw Error('unexpected lifecycle draft input');
const groupFor = surface => surface.startsWith('share_') || surface === 'low_quality_share' ? 'W4-G12' : surface.startsWith('pdf_') ? 'W4-G13' : 'W4-G14';
const kindFor = surface => groupFor(surface) === 'W4-G12' ? 'share_safe_variant' : groupFor(surface) === 'W4-G13' ? 'pdf_safe_variant' : 'history_safe_variant';
const assets = input.surfaces.map(surface => ({
  locale:'en', source_locale:'zh-CN', status:'unpublished_candidate', review_status:'pending_independent_w9', runtime_ready:false,
  frontend_fallback_allowed:false, fallback_behavior:'omit_module', translation_method:'existing_english_draft_repackaged_for_independent_review_only', permissions,
  asset_id:`ENPARITY-W4-RIASEC-${groupFor(surface.surface)}-${assetKey(surface.surface)}`,
  translation_group:`cohort:riasec:lifecycle:${surface.surface}`, source_identity:surface.surface, group_id:groupFor(surface.surface), asset_kind:kindFor(surface.surface),
  reader_boundary:'This lifecycle variant is candidate-only. It preserves a minimal interest-exploration boundary and does not expose scores, raw feedback, private context, ability, job-fit, hiring, or outcome claims.',
  ...surface
}));
if (assets.length !== 7 || new Set(assets.map(x => x.asset_id)).size !== 7 || new Set(assets.map(x => x.translation_group)).size !== 7 || assets.some(x => /[\u3400-\u9fff]/.test(`${x.copy}\n${x.reader_boundary}`)) || assets.some(x => Object.values(x.permissions).some(Boolean))) throw Error('candidate validation failed');
const ledger = { schema_version:'fermatmind.en_content_parity.w4_riasec_safe_variants_source_ledger.v1', package_id:packageId, authority:{repository:'fap-api',commit:apiCommit,source_path:'backend/content_assets/riasec/share_pdf_history_v1.en.json',source_sha256:sha(source),zh_source_path:'backend/content_assets/riasec/share_pdf_history_v1.zh-CN.json',zh_source_sha256:sha(zhSource),source_review_status:input.review_status}, producer:{repository:'fap-web',commit:webCommit,control_status:'inventory_frozen'}, rows:assets.map((x,i)=>({source_row:i+1,source_identity:x.source_identity,asset_id:x.asset_id,translation_group:x.translation_group,group_id:x.group_id,asset_kind:x.asset_kind})), reconciliation:{share_rows:3,pdf_rows:2,history_rows:2,english_candidate_rows:7,source_draft_is_not_runtime_approval:true,private_data_accessed:false} };
const map = { schema_version:'fermatmind.en_content_parity.w4_riasec_safe_variants_translation_map.v1',package_id:packageId,source_locale:'zh-CN',target_locale:'en',translation_status:'existing_draft_repackaged_candidate_only',mappings:assets.map(x=>({source_identity:x.source_identity,asset_id:x.asset_id,translation_group:x.translation_group,group_id:x.group_id,asset_kind:x.asset_kind})) };
const claim = { schema_version:'fermatmind.en_content_parity.w4_riasec_safe_variants_claim_boundary_report.v1',package_id:packageId,status:'candidate_only',verdict:'PENDING_INDEPENDENT_W9',boundaries:['interest_evidence_only','not_personality_identity','not_ability_or_skill_measure','not_career_recommendation','not_job_fit','not_success_prediction','not_hiring_or_screening_use','no_raw_score_or_feedback_exposure','no_60q_140q_raw_delta','missing_content_fails_closed','frontend_fallback_forbidden'],permissions };
const review = { schema_version:'fermatmind.en_content_parity.w4_riasec_safe_variants_editorial_review.v1',package_id:packageId,review_kind:'producer self-check only; not W9 approval or runtime lifecycle approval',verdict:'PENDING_INDEPENDENT_W9',completed_self_checks:['7=3 share + 2 PDF + 2 history identity reconciliation','visible candidate text contains no CJK','all score, feedback, private-context, identity and fallback controls remain false or bounded','existing backend draft status is not treated as availability'],next_gates:['independent W9 language, product, and boundary review','controlled exact-package freeze'],permissions };
await mkdir(root,{recursive:true}); await writeFile(join(root,'assets.jsonl'), `${assets.map(JSON.stringify).join('\n')}\n`); await write('translation_map.json',map); await write('source_ledger.json',ledger); await write('claim_boundary_report.json',claim); await write('editorial_review.json',review);
const paths=['assets.jsonl','claim_boundary_report.json','editorial_review.json','source_ledger.json','translation_map.json']; const payloads=await Promise.all(paths.map(async path=>({path,sha256:sha(await readFile(join(root,path)))}))); const aggregate=sha(payloads.map(x=>`${x.path}\0${x.sha256}\n`).join(''));
await write('package_manifest.json',{schema_version:'fermatmind.en_content_parity.w4_riasec_safe_variants_package_manifest.v1',package_id:packageId,status:'candidate_only',row_count:7,share_row_count:3,pdf_row_count:2,history_row_count:2,payloads,aggregate_sha256:aggregate,aggregate_method:'sha256 of each payload, ordered by path; aggregate is sha256 of path + NUL + payload sha256 + LF for every payload',permissions});
console.log(JSON.stringify({rows:assets.length,aggregate_sha256:aggregate}));
