# Codex Stage 4 To SEO Agent Goal Template

Use this template after GPT 5.5 Pro returns a daily SEO Mode C content package and images. It is for the SEO article window, before handing execution to the SEO agent window.

The purpose is to make Codex do Stage 4 only:

1. scan the returned package and repo technical context;
2. enrich / de-AI the article content;
3. run package QA;
4. normalize the image manifest;
5. write a clean repaired package output directory;
6. produce the exact `/goal` instruction for the SEO agent to run Stage 5+.

It must not import CMS, publish, mutate URL Truth, mutate sitemap/llms, enable schema/hreflang, submit search, revalidate, deploy, or create a PR.

## User Prompt To Codex In SEO Article Window

```text
Use repo-scoped skills:
- .agents/skills/fermatmind-wechat-seo-article-editor/
- .agents/skills/fermatmind-seo-ops/

Task:
I am giving you a GPT-generated SEO Mode C content package and article images. First scan the package and repo technical docs, then complete Stage 4 only:

Stage 4:
内容加厚/去 AI 味 -> package QA -> image manifest 规范化

Inputs:
- source_package: <PATH_TO_GPT_PACKAGE_ZIP_OR_DIR>
- cover_image: <PATH_TO_COVER_IMAGE_IF_SEPARATE>
- body_visual_image: <PATH_TO_BODY_VISUAL_IMAGE_IF_SEPARATE>
- target_slug: <SLUG>
- locale: zh-CN
- proposed_title: <TITLE>
- translation_group_id: <TRANSLATION_GROUP_ID>
- primary_keyword: <PRIMARY_KEYWORD>
- primary_cta: <PUBLIC_CTA_ROUTE>
- secondary_cta: <PUBLIC_CTA_ROUTE_OR_EMPTY>

Required repo/context scan:
- Read the package manifest and all package contracts.
- Read relevant repo skills/docs for:
  - Mode C package rules
  - image asset bundle workflow
  - CMS draft package contract
  - GPT content production contract
  - WeChat SEO article editor rules
  - recent article workflow blockers if present in generated reports
- Check related FermatMind article/test routes enough to avoid obvious cannibalization or private-route leakage.

Allowed Stage 4 actions:
- unpack/copy package into a new generated repaired output directory;
- edit only the repaired package copy, unless I explicitly said in-place;
- improve article body for human zh-CN public-account quality;
- remove AI-pattern prose;
- strengthen examples, checklist, tables, FAQ, CTA transitions, and internal-link logic;
- keep CMS body markdown / CMS import draft body fields synchronized;
- normalize media/IMAGE_ASSET_MANIFEST.json to local source filenames and stable proposed asset keys;
- verify image manifest does not invent Media Library URLs, asset IDs, CDN URLs, or variants;
- run local package QA/readiness scans;
- produce a Stage 5 SEO agent `/goal` instruction using the repaired package path.

Forbidden Stage 4 actions:
- no CMS write/import/draft creation;
- no publish;
- no make-indexable;
- no URL Truth write;
- no sitemap/llms mutation;
- no schema/hreflang enablement;
- no Search Channel enqueue/approve/submit;
- no IndexNow/GSC/Baidu/360/Sogou/Shenma action;
- no revalidation;
- no deploy;
- no PR;
- no frontend editorial fallback content;
- no invented Media Library URLs;
- no competitor content copying.

Content quality requirements:
- Article must open from a concrete reader scene, not a definition.
- First 150-220 Chinese characters must answer the main search intent.
- Each major section should contain practical decision value: judgment rule, example, checklist/table, script, or next action.
- Use natural zh-CN mobile reading rhythm.
- Preserve title/meta honesty; no panic, guarantee, official-system implication, or unsupported numeric claim.
- CTA should feel like the next step after the article framework.

Claim boundaries:
- no admission prediction;
- no major matching guarantee;
- no salary/employment/career-success prediction;
- no diagnosis/treatment/hiring fit;
- no official admission-system implication;
- FermatMind is not an official志愿填报 system;
- RIASEC / MBTI / Big Five / other tests are exploration tools, not decision engines.

Required outputs:
- new repaired package directory under:
  /Users/rainie/Desktop/GitHub/fap-web/generated/<generated-run-id>/
- STAGE4_CONTENT_ENRICHMENT_REPORT.md
- PACKAGE_QA_REPORT.md
- IMAGE_MANIFEST_NORMALIZATION_REPORT.md
- SEO_AGENT_STAGE5_GOAL.md
- NEXT_EXACT_AUTHORIZATION_PROMPTS.md
- scan_manifest.json

SEO_AGENT_STAGE5_GOAL.md must contain one paste-ready `/goal` for the separate SEO agent window. It should start from the repaired package path and run the technical release chain from package QA / Media Library / CMS draft dry-run onward.

Daily cadence:
- Default to one high-quality bilingual SEO article per day.
- Generate a one-article full-chain goal unless the operator explicitly requests a batch/exception.
- The preferred terminal state is `ARTICLE_RELEASE_COMPLETE_SEARCH_OBSERVATION_PENDING`.
- Do not instruct the SEO agent to start a second article in the same goal.

Default to the conservative gate-by-gate shape only when the operator has not
asked for full-chain preauthorization. In the conservative shape, preserve
separate approval gates for:
- production Media Library image import/register;
- CMS draft creation;
- preview repair if needed;
- operator/editorial approval;
- controlled publish;
- discoverability release;
- URL Truth write;
- Search Channel enqueue/approve/submit;
- GSC Request Indexing;
- schema/hreflang holds.

When the operator explicitly asks for a next-day fully authorized run, generate
the full-chain preauthorized variant instead of the gate-by-gate variant. In
that mode `SEO_AGENT_STAGE5_GOAL.md` must include one Authorization Profile that
preauthorizes the entire article release chain for the target package and target
canonical URLs:

- `authorization_mode=full_chain_preapproved`;
- production Media Library image import/register;
- resolved package write;
- CMS image metadata backfill;
- production CMS draft dry-run/import;
- preview QA;
- publish metadata/editorial readiness repair when source-backed;
- controlled publish after rehearsal passes;
- public smoke;
- sitemap/llms/llms-full discoverability release;
- content-release revalidation and sitemap-source warm when required for parity;
- URL Truth refresh/write;
- Search Channel enqueue, approve, and bounded live submit for `indexnow` and `baidu_push`;
- GSC manual Request Indexing for the exact zh/en canonical URLs;
- final reconciliation and D1/D7/D14 observation checklist.

The full-chain variant must still hold schema and hreflang unless the operator
explicitly asks for those rollout gates. It must stop on failed preflight,
failed dry-run, claim/private URL risk, article identity mismatch, missing image
asset, CDN verification failure, login/CAPTCHA, provider quota/platform block,
or any deploy/runtime fix not preauthorized by target SHA/release.

Final decision must be one of:
- STAGE4_READY_FOR_SEO_AGENT_FULL_RELEASE_GOAL
- STAGE4_READY_FOR_OPERATOR_CONTENT_REVIEW
- BLOCKED_PACKAGE_QA
- BLOCKED_IMAGE_MANIFEST
- BLOCKED_CLAIM_OR_PRIVATE_URL_RISK
- BLOCKED_NEEDS_OPERATOR_INPUT
```

## SEO Agent Goal Shape To Generate

`SEO_AGENT_STAGE5_GOAL.md` should generate a full-chain preauthorized goal like:

```text
/goal SEO-OPS-<SLUG-UPPER>-FULL-RELEASE-<YYYYMMDD>-00

Use repo-scoped skill:
.agents/skills/fermatmind-seo-ops/

Workflow:
seo_article_full_release

Target:
- operation_type: new_article
- locales: zh-CN,en
- slug: <SLUG>
- canonical_url: https://fermatmind.com/zh/articles/<SLUG>
- en_canonical_url: https://fermatmind.com/en/articles/<SLUG>
- translation_group_id: <TRANSLATION_GROUP_ID>
- source_package: <REPAIRED_PACKAGE_PATH>
- primary_cta: <PRIMARY_CTA>
- secondary_cta: <SECONDARY_CTA_OR_EMPTY>

Current state:
- Stage 4 content enrichment/package QA/image manifest normalization completed in SEO article window.
- Repaired package path: <REPAIRED_PACKAGE_PATH>
- Stage 4 report path: <STAGE4_REPORT_PATH>

Allowed dry-run/read-only chain:
1. package QA / identity lock
2. image asset bundle preflight
3. Media Library image import/register dry-run
4. CMS draft import dry-run
5. preview/readback QA after authorized draft creation
6. publish rehearsal after authorized operator approval
7. public smoke/read-only closeout after authorized publish

Authorization Profile:
- authorization_mode=full_chain_preapproved
- allow_package_autofix=true
- allow_social_image_auto_resolve=true
- allow_image_bundle_dry_run=true
- allow_media_library_image_import=true
- allow_resolved_package_write=true
- allow_image_metadata_backfill=true
- allow_production_draft_import=true
- allow_preview_qa=true
- allow_publish_metadata_autofill=true
- allow_publish_after_rehearsal=true
- allow_make_indexable_after_smoke=true
- allow_sitemap_llms_release=true
- allow_url_truth_refresh=true
- allow_search_channel_enqueue=true
- allow_search_channel_approve=true
- allow_indexnow_bounded_submission=true
- allow_baidu_bounded_submission=true
- allow_gsc_manual_request_indexing=true
- schema=hold
- hreflang=hold
- allowed_search_channels=indexnow,baidu_push
- disallowed_search_channels=360,sogou,shenma
- gsc_request_indexing_target_urls=https://fermatmind.com/zh/articles/<SLUG>,https://fermatmind.com/en/articles/<SLUG>

Explicit holds unless separately authorized:
- schema/hreflang enablement
- deploy unless a target SHA/release is specified in this goal
- PR

Required outputs:
- generated evidence directory
- package QA report
- image import dry-run/import reports
- CMS draft dry-run/creation reports
- preview QA report
- publish rehearsal/report
- public smoke report
- discoverability parity report
- URL Truth/Search Channel/GSC reports
- answer-surface FAQ check, including `ANSWER_SURFACE_FAQ_ENHANCEMENT_RECOMMENDED` when package FAQ is present but the public answer-surface block still renders generic FAQ
- D1/D7/D14 observation queue with `Unknown` placeholders for missing metrics
- NEXT_EXACT_AUTHORIZATION_PROMPTS.md only for blockers outside this full-chain profile
- scan_manifest.json

Final decision:
- ARTICLE_RELEASE_COMPLETE_SEARCH_OBSERVATION_PENDING
- ARTICLE_RELEASE_COMPLETE_PROVIDER_HELD
- BLOCKED_NEEDS_OPERATOR_INPUT
- BLOCKED_PACKAGE_QA
- BLOCKED_RUNTIME_OR_PROVIDER
```

For a conservative gate-by-gate run, use the older separate-authorization shape
only when the operator explicitly says not to preauthorize the full chain.

## Notes

- Stage 4 belongs in the SEO article/content window.
- Stage 5+ belongs in the SEO agent window.
- Do not mix content rewriting and production release execution in the same goal unless the user explicitly asks for a single-window emergency run.
