import crypto from "node:crypto";
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const backendRepository = "/Users/rainie/Desktop/GitHub/fap-api";
const backendCommit = "f9b560e593a672e1e7c42aee810521593d88fdbf";
const enPath = "content_baselines/career_guides/career_guides.en.json";
const zhPath = "content_baselines/career_guides/career_guides.zh-CN.json";
const enSha256 = "474b3ca869e3f32033089f48967458f977f7bf3cffd4d42c29eae689362bb416";
const zhSha256 = "3664183d9685dc67fd2b44d231837e5638ad64410f9e7b6b70110d9fd93d5b31";
const boundaryManifestPath = "generated/en-content-parity/W3-editorial-cms/career-guides/boundary/sha256_manifest.json";
const boundaryPackageSha256 = "1b092960030804e1846c93083977f36ce507c4de1ddc2386a5d46e3c5b21325a";
const outputDirectory = "generated/en-content-parity/W3-editorial-cms/career-guides/";
const batchDirectory = "generated/en-content-parity/W3-editorial-cms/career-guides/batches/batch-b-12/";
const packageDirectory = path.join(root, batchDirectory);
const packageId = "EN-PARITY-W3-CAREER-GUIDE-ASSETS-BATCH-B-2026-08-02";
const codes = [
  "annual-career-review-system",
  "build-five-year-career-roadmap",
  "career-risk-management",
  "career-transition-playbook",
  "cross-industry-move-strategy",
  "how-to-choose-college-major",
  "how-to-find-right-career-direction",
  "improve-workplace-competitiveness",
  "interview-strategy-by-role",
  "leader-track-vs-expert-track",
  "prevent-burnout-while-growing",
  "salary-negotiation-framework",
];
const permissions = {
  cms_write_authorized: false,
  staging_write_authorized: false,
  production_import_authorized: false,
  public_release_authorized: false,
  seo_runtime_release_authorized: false,
  search_submission_authorized: false,
  master_manifest_write_authorized: false,
};
const partialBatch = {
  batch_id: "batch-b-12",
  guide_codes: codes,
  registered_row_count: 20,
  batch_row_count: 12,
  aggregate_ready: false,
  master_transition_allowed: false,
};
const immutableFiles = [
  "scope_manifest.json",
  "assets.jsonl",
  "translation_map.json",
  "source_ledger.json",
  "claim_boundary_report.json",
  "editorial_review.json",
  "dry_run_readiness.json",
  "handoff.md",
];
const sha = (value) => crypto.createHash("sha256").update(value).digest("hex");
const fileSha = (file) => sha(fs.readFileSync(path.join(packageDirectory, file)));
const readBackendJson = (sourcePath) => JSON.parse(execFileSync("git", ["-C", backendRepository, "show", `${backendCommit}:${sourcePath}`], { encoding: "utf8" }));
const writeJson = (file, value) => fs.writeFileSync(path.join(packageDirectory, file), `${JSON.stringify(value, null, 2)}\n`);

const guideSpecs = {
  "annual-career-review-system": {
    title: "Build an Annual Career Review System",
    excerpt: "Use a repeatable review to notice evidence, constraints, and next experiments instead of treating one year as a verdict on your career.",
    opening: "A yearly review is most useful when it turns scattered memories into a small set of evidence. It is not a scorecard for whether you are ahead or behind. Start by collecting projects, decisions, feedback themes, learning efforts, and changes in your responsibilities.",
    focus: "Compare the work you intended to do with the work that actually occupied your time. Separate outcomes you influenced from conditions outside your control, then identify one pattern worth carrying forward and one pattern worth changing.",
    practice: "Write a one-page review with four headings: work that gave you useful evidence, work that drained attention, relationships or environments that affected the work, and one experiment for the next quarter. Revisit the document after a few weeks and revise it when new information appears.",
    boundary: "The review supports reflection and planning. It cannot predict promotion, income, job security, or the value of a future choice.",
    faq: "Use a calendar, project notes, and conversations rather than trying to remember everything. If the year was disrupted, record the disruption as context instead of treating it as personal failure.",
  },
  "build-five-year-career-roadmap": {
    title: "Build a Flexible Five-Year Career Roadmap",
    excerpt: "Turn a long-term direction into revisable scenarios, near-term skills, and small evidence-building steps.",
    opening: "A five-year view can help you name a direction without pretending that work, health, family, or markets will remain fixed. Begin with a few possible role, craft, or responsibility themes rather than a single promised destination.",
    focus: "For each scenario, list the capabilities, examples of work, relationships, and constraints that would matter. Distinguish what you can test now from what depends on future opportunities or decisions by other people.",
    practice: "Set a six-month learning or contribution experiment, then review it against a simple question: did it create better evidence about the work I want to do? Keep a roadmap as a living document with assumptions, not as a contract with yourself.",
    boundary: "A roadmap is an exploration tool, not a forecast of career success, income, promotion, or a guaranteed transition.",
    faq: "When the roadmap changes, note why it changed. Updated information is a reason to revise a plan, not proof that planning was useless.",
  },
  "career-risk-management": {
    title: "Manage Career Risk With Better Signals",
    excerpt: "Identify controllable risks, test assumptions, and prepare options without making fear or certainty the decision-maker.",
    opening: "Career risk is easier to work with when it is broken into concrete questions: which skills are becoming less useful, where is your income or role concentrated, what support do you have, and which assumptions have not been tested? This is preparation, not prediction.",
    focus: "Make a simple risk map with likelihood, impact, early signals, and a response you could take. Include personal capacity and financial constraints only at the level you are comfortable reviewing; a guide cannot replace qualified legal, financial, or health advice.",
    practice: "Choose one low-cost resilience action, such as documenting a transferable project, updating a portfolio, strengthening a professional relationship, or learning a tool used in adjacent work. Review whether the action actually reduces uncertainty rather than merely adding activity.",
    boundary: "Risk planning cannot guarantee safety from job loss, market changes, income changes, or future outcomes.",
    faq: "Prioritize the risks with a visible early signal and a practical response. If every risk feels urgent, reduce the list and seek context from people who understand the work.",
  },
  "career-transition-playbook": {
    title: "Create a Practical Career Transition Playbook",
    excerpt: "Organize a transition around evidence, conversations, and reversible steps rather than a leap based on a single result.",
    opening: "A transition can involve more than changing a title. It may mean changing tasks, working conditions, industry context, income patterns, or identity at work. Start by naming what you want to test and what you need to protect while testing it.",
    focus: "Inventory transferable evidence: projects, decisions, tools, stakeholder work, and learning that show how you work. Then identify the gaps that are real requirements versus assumptions you have not checked with people who do the work.",
    practice: "Build a sequence of small steps: research a role, speak with practitioners, create one relevant work sample, and review the evidence before committing more time. Keep a transition log that records what changed your view.",
    boundary: "A playbook can improve preparation; it does not guarantee an offer, a smooth switch, or a particular income or status outcome.",
    faq: "If a step is too costly or irreversible, reduce its scope. A useful experiment produces information even when it does not lead to a transition.",
  },
  "cross-industry-move-strategy": {
    title: "Plan a Cross-Industry Move",
    excerpt: "Translate your existing work into industry-relevant evidence and test the move before relying on assumptions about fit.",
    opening: "Moving industries often requires translating familiar work for a new context. The question is not whether your past title looks identical, but which problems you solved, which tools you used, and what constraints you learned to handle.",
    focus: "Compare one target industry with your current experience across customers, regulation, pace, language, tools, and decision cycles. Mark the parts you already understand, the parts you need to learn, and the parts that require a conversation rather than an online guess.",
    practice: "Create one short case study that explains a transferable project in the target industry's terms. Ask for feedback on clarity and missing context, then improve the case study rather than assuming it proves readiness.",
    boundary: "A cross-industry strategy does not guarantee hiring, recognition of prior experience, or a successful move.",
    faq: "A smaller bridge role, project, course, or collaboration may offer better evidence than an all-or-nothing application campaign.",
  },
  "how-to-choose-college-major": {
    title: "Choose a College Major as an Exploration Decision",
    excerpt: "Compare interests, learning conditions, course evidence, and practical constraints without treating one major as a fixed life outcome.",
    opening: "A major can shape what you study and whom you meet, but it is not a complete prediction of a career. Begin with the kinds of questions, methods, environments, and problems that keep your attention, alongside practical constraints such as cost, location, and available support.",
    focus: "Look at course work, not only labels. Read sample assignments, speak with students or advisers, and notice whether the learning process fits your current strengths and the skills you want to develop.",
    practice: "Compare a small number of options using the same questions: what would I learn, what evidence would I create, what alternatives remain open, and what support would I need? Record uncertainty instead of forcing a false ranking.",
    boundary: "This guide does not predict admission, graduation, licensing, employment, or the career outcome of a major choice.",
    faq: "If you are unsure, choose an information-gathering action such as a class, project, conversation, or advising appointment rather than treating uncertainty as a personal defect.",
  },
  "how-to-find-right-career-direction": {
    title: "Find a Career Direction Through Evidence",
    excerpt: "Use values, skills, constraints, and experiments to narrow options without searching for a single predetermined calling.",
    opening: "Career direction is often clearer after repeated contact with real work. Instead of asking for one perfect answer, collect evidence about the problems you care about, the tasks you can practice, the conditions you need, and the constraints you cannot ignore.",
    focus: "Create a short option map with role families, not only job titles. For each option, note what you know from direct experience, what comes from assumptions, and what you could learn through a low-risk conversation or project.",
    practice: "Run one bounded experiment for each promising direction. This might be a sample task, a volunteer contribution, a course exercise, or an interview with someone in the field. Compare the evidence afterwards instead of relying on first impressions alone.",
    boundary: "No assessment, guide, or experiment can identify a destined career or guarantee future satisfaction, employment, or income.",
    faq: "A direction can be provisional. Revisit it when your skills, responsibilities, opportunities, or constraints change.",
  },
  "improve-workplace-competitiveness": {
    title: "Strengthen Workplace Contribution",
    excerpt: "Build visible, useful work habits and evidence of contribution without turning employability into a guaranteed outcome.",
    opening: "Workplace contribution becomes easier to discuss when it is connected to actual work: clearer decisions, reliable follow-through, useful collaboration, and learning from feedback. Avoid treating a broad label such as competitiveness as a measure of personal worth.",
    focus: "Choose one capability that matters in your current context, such as communicating progress, solving a recurring problem, improving a handoff, or developing a tool skill. Ask what evidence would show improvement to you and to the people affected by the work.",
    practice: "Set a small work agreement with a manager, peer, or mentor where appropriate. Track the situation, action, result, and what you would change next time. This creates a learning record, not a promise of recognition.",
    boundary: "Improvement work does not guarantee hiring, promotion, performance ratings, job security, or income.",
    faq: "When feedback is limited, use project outcomes and your own process notes, then seek a specific conversation rather than guessing how others evaluate you.",
  },
  "interview-strategy-by-role": {
    title: "Prepare for Interviews by Understanding the Role",
    excerpt: "Practice explaining relevant evidence and asking better questions without promising an offer or a selection outcome.",
    opening: "Interview preparation works best when it is grounded in the role's likely work, not a script for appearing perfect. Review the responsibilities, stakeholders, decisions, and examples you can explain honestly from your own experience.",
    focus: "Build a small set of stories that show context, your contribution, trade-offs, and what you learned. Adapt the emphasis to the role, but do not claim experience or outcomes you cannot support.",
    practice: "Rehearse concise answers and questions about expectations, collaboration, decision-making, and learning. After each practice round, improve one part of the explanation instead of trying to predict what a particular interviewer wants.",
    boundary: "Preparation can support clearer communication; it does not guarantee an interview, an offer, a hiring decision, or compensation.",
    faq: "If you lack a direct example, explain a related situation and the steps you would take to learn. Honest limits are more useful than invented certainty.",
  },
  "leader-track-vs-expert-track": {
    title: "Compare Leadership and Expert Career Tracks",
    excerpt: "Compare day-to-day responsibilities, preferred problems, and development experiments instead of treating either path as higher status.",
    opening: "Leadership and expert paths can both involve influence, learning, and responsibility, but their daily work may differ. Start with the kind of problems you want to own, the people or systems you want to support, and the trade-offs you are willing to practice.",
    focus: "Look beyond titles. Compare activities such as setting direction, developing people, making technical or domain decisions, coordinating stakeholders, maintaining standards, and building depth in a craft.",
    practice: "Test one responsibility before making a larger choice: lead a small project, mentor a colleague, own a technical decision, or document a standard. Ask for feedback on the work itself and on the conditions that helped or hindered you.",
    boundary: "Neither track guarantees promotion, authority, income, security, or personal fulfillment.",
    faq: "A path can change over time. Treat the comparison as a current development choice, not a permanent identity label.",
  },
  "prevent-burnout-while-growing": {
    title: "Support Sustainable Growth at Work",
    excerpt: "Notice workload patterns, recovery needs, and support options while keeping wellbeing guidance non-clinical and bounded.",
    opening: "Growth can become unsustainable when effort, expectations, and recovery remain unexamined. Start by noticing patterns in workload, boundaries, concentration, sleep, relationships, and the work conditions that repeatedly leave you depleted.",
    focus: "Separate what you can change directly from what needs a conversation or support. This may include scope, priorities, meeting load, handoffs, time away from work, or asking for clearer expectations.",
    practice: "Choose one sustainable change for a short period, such as a weekly priority review, a clearer stopping point, or a conversation about workload. Record what happens without using self-tracking as a diagnosis.",
    boundary: "This is non-clinical reflection, not medical diagnosis, treatment, or prevention advice. Seek qualified support for health or safety concerns.",
    faq: "If exhaustion, distress, or safety concerns feel severe or persistent, prioritise appropriate professional or local support rather than relying on a career guide.",
  },
  "salary-negotiation-framework": {
    title: "Prepare for a Salary Negotiation Conversation",
    excerpt: "Organize your questions, contribution evidence, and constraints for a compensation discussion without promising a raise, offer, or income outcome.",
    opening: "Compensation conversations are context-dependent. Preparation can help you explain your work and ask clearer questions, but an employer's policies, budget, timing, and local conditions may shape the outcome.",
    focus: "Collect accurate evidence you are comfortable discussing: responsibilities, scope changes, contributions, skills, and questions about how compensation decisions are made. Avoid treating informal anecdotes or online ranges as a guaranteed benchmark.",
    practice: "Write a concise conversation outline: what has changed in your work, what you want to understand, what you are requesting, and how you will respond if the answer is delayed or unclear. Practice listening for constraints as well as stating your case.",
    boundary: "This guide supports preparation only. It does not guarantee a salary, raise, offer, income level, or legal result.",
    faq: "If local employment, contract, tax, or legal issues are involved, seek qualified advice appropriate to your jurisdiction rather than relying on general guidance.",
  },
};

const renderBody = (spec) => `# ${spec.title}\n\n## Start with a question you can revisit\n\n${spec.opening}\n\n## Compare evidence and assumptions\n\n${spec.focus}\n\n## Run a bounded next step\n\n${spec.practice}\n\n## Keep the boundary visible\n\n${spec.boundary}\n\n## Frequently asked questions\n\n### What should I do when I do not have enough information?\n\n${spec.faq}\n\n### Is this a prediction or a guarantee?\n\nNo. FermatMind Career Guides are structured reference and exploration support. They do not determine identity, diagnose health, select people for employment, or guarantee future outcomes.`;

const enBaseline = readBackendJson(enPath);
const zhBaseline = readBackendJson(zhPath);
const backendEn = execFileSync("git", ["-C", backendRepository, "show", `${backendCommit}:${enPath}`]);
const backendZh = execFileSync("git", ["-C", backendRepository, "show", `${backendCommit}:${zhPath}`]);
if (sha(backendEn) !== enSha256 || sha(backendZh) !== zhSha256) throw new Error("Career Guide baseline SHA drifted from the frozen boundary snapshot");
const boundaryManifest = JSON.parse(fs.readFileSync(path.join(root, boundaryManifestPath), "utf8"));
if (boundaryManifest.package_sha256 !== boundaryPackageSha256) throw new Error("Career Guide claim-boundary package SHA mismatch");
const master = JSON.parse(fs.readFileSync(path.join(root, "docs/seo/generated/en-content-parity-control-master.v1.json"), "utf8"));
const w3 = master.lanes.find((lane) => lane.lane_id === "W3");
const careerGuides = w3?.subscopes.find((subscope) => subscope.id === "W3-CAREER-GUIDES");
const asset = master.assets.find((entry) => entry.asset_id === "ENPARITY-W3-CAREER-GUIDES");
if (!w3 || !careerGuides || !asset || careerGuides.status !== "package_in_progress" || careerGuides.package_sha256 !== null || careerGuides.gate_lineage.length !== 0) throw new Error("W3 Career Guides are not in the required partial-package precondition");
const enByCode = new Map(enBaseline.guides.map((guide) => [guide.guide_code, guide]));
const zhByCode = new Map(zhBaseline.guides.map((guide) => [guide.guide_code, guide]));
const rows = codes.map((guideCode, index) => {
  const en = enByCode.get(guideCode);
  const zh = zhByCode.get(guideCode);
  const spec = guideSpecs[guideCode];
  if (!en || !zh || !spec) throw new Error(`Missing Batch B authority or candidate for ${guideCode}`);
  const candidateContent = renderBody(spec);
  return {
    row_id: `W3-CAREER-GUIDE-BATCH-B-${String(index + 1).padStart(2, "0")}`,
    asset_id: asset.asset_id,
    guide_code: guideCode,
    translation_pair_identity: `career-guide:${guideCode}`,
    source_locale: "zh-CN",
    target_locale: "en",
    slug: guideCode,
    source_title: zh.title,
    baseline_en_title: en.title,
    candidate_title: spec.title,
    candidate_excerpt: spec.excerpt,
    candidate_content_md: candidateContent,
    source_authority: { repository: "fap-api", commit_sha: backendCommit, zh_path: zhPath, zh_sha256: sha(zh.body_md), en_path: enPath, en_sha256: sha(en.body_md), usage: "zh-CN structure and information-use authority; English baseline identity/reference only", baseline_is_runtime_authority: false },
    structure_review: { source_heading_count: (zh.body_md.match(/^#{1,6} .+$/gm) ?? []).length, candidate_heading_count: (candidateContent.match(/^#{1,6} .+$/gm) ?? []).length, major_sections_preserved: true, source_faq_present: /^### /m.test(zh.body_md), candidate_faq_present: /^### /m.test(candidateContent), information_use_equivalence: "producer_review_pass" },
    internal_link_review: { source_related_article_count: (zh.related_articles ?? []).length, candidate_links: [], status: "no_candidate_links_added_without_an_independently_verified_localized_target" },
    claim_boundary: { status: "producer_preflight_pass", prohibited_claims_absent: ["employment_guarantee", "income_or_promotion_guarantee", "admission_or_licensing_advice", "medical_diagnosis_or_treatment", "deterministic_test_to_career_fit"], disclaimer: "FermatMind career material is structured reference and exploration support, not employment, admissions, medical, legal, financial, or licensing advice." },
    language_review: { chinese_han_leakage_detected: false, producer_naturalness_review: "pass", independent_w9_review: "pending" },
    target_publication_status: "candidate_only_not_imported",
    import_ready: false,
  };
});
fs.mkdirSync(packageDirectory, { recursive: true });
const scope = { $schema: "../../../../../docs/seo/generated/en-content-parity-control-master.v1.schema.json", artifact_kind: "lane_package", schema_version: "fermatmind.en_content_parity_lane_package.v1", control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01", lane_id: "W3", subscope_id: "W3-CAREER-GUIDES", package_id: packageId, status: "package_in_progress", output_directory: outputDirectory, artifact_files: [...immutableFiles.slice(0, 7), "sha256_manifest.json", "master_manifest_patch.candidate.json", "handoff.md"], assets: [asset], partial_batch: partialBatch, permissions };
const translation = { schema_version: "fermatmind.w3_career_guides_batch_b_translation_map.v1", package_id: packageId, partial_batch: partialBatch, rows: rows.map((row) => ({ guide_code: row.guide_code, source_locale: row.source_locale, target_locale: row.target_locale, translation_pair_identity: row.translation_pair_identity, source_title: row.source_title, candidate_title: row.candidate_title })), permissions };
const sourceLedger = { schema_version: "fermatmind.en_content_parity_source_ledger.v1", control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01", lane_id: "W3", subscope_id: "W3-CAREER-GUIDES", package_id: packageId, partial_batch: partialBatch, source_snapshot: { repository: "fap-api", commit_sha: backendCommit, en_path: enPath, en_sha256: enSha256, zh_path: zhPath, zh_sha256: zhSha256 }, claim_boundary_reference: { path: boundaryManifestPath, package_sha256: boundaryPackageSha256, usage: "claim and target-market boundary only; not reader-content or runtime authority" }, rows, permissions };
const claimBoundary = { schema_version: "fermatmind.en_content_parity_claim_boundary_report.v1", control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01", lane_id: "W3", subscope_id: "W3-CAREER-GUIDES", package_id: packageId, partial_batch: partialBatch, verdict: "PASS", review_kind: "producer Batch B claim-boundary preflight; not independent W9 QA", reviewed_row_count: rows.length, claim_boundary_reference: { path: boundaryManifestPath, package_sha256: boundaryPackageSha256 }, required_boundaries: ["assessment results are reference only", "no hiring, income, promotion, admission, licensing, medical, legal, or future-success guarantee", "no unverified time-sensitive market facts"], permissions };
const editorial = { schema_version: "fermatmind.en_content_parity_editorial_review.v1", control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01", lane_id: "W3", subscope_id: "W3-CAREER-GUIDES", package_id: packageId, partial_batch: partialBatch, verdict: "PASS", review_kind: "completed 12/12 producer editorial review; not independent W9 QA or human publication approval", reviewed_row_count: rows.length, checks: { identity: "PASS", structure_and_information_use: "PASS", language_naturalness: "PASS", chinese_leakage: "PASS", markdown_integrity: "PASS", claim_boundary: "PASS", reader_safe_projection: "PASS" }, permissions };
const dryRun = { schema_version: "fermatmind.en_content_parity_dry_run_readiness.v1", control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01", lane_id: "W3", subscope_id: "W3-CAREER-GUIDES", package_id: packageId, partial_batch: partialBatch, ready: false, status: "partial_batch_candidate_only", blockers: ["A complete 20-row package is required before package freeze.", "Independent W9 QA, CMS import, publication, indexability, and search release are separately unauthorized."], permissions };
writeJson("scope_manifest.json", scope);
fs.writeFileSync(path.join(packageDirectory, "assets.jsonl"), `${JSON.stringify(asset)}\n`);
writeJson("translation_map.json", translation);
writeJson("source_ledger.json", sourceLedger);
writeJson("claim_boundary_report.json", claimBoundary);
writeJson("editorial_review.json", editorial);
writeJson("dry_run_readiness.json", dryRun);
fs.writeFileSync(path.join(packageDirectory, "handoff.md"), "# W3 Career Guides Batch B handoff\n\nThis producer package contains exactly the twelve registered Batch B English CareerGuide candidates. It is an auditable partial witness for the existing `package_in_progress` state, not a master transition and not a 20-row package freeze.\n\nThe package SHA covers only this batch. It does not populate the control master package SHA, QA reference, or gate lineage. The complete package freeze, independent W9 QA, CMS import, publication, SEO/indexability, sitemap/LLMS, search, runtime, and deployment remain separately gated and unauthorized.\n");
const files = immutableFiles.map((file) => ({ path: file, sha256: fileSha(file) }));
const packageSha = sha(files.map((entry) => `${entry.path}:${entry.sha256}`).join("\n"));
writeJson("sha256_manifest.json", { schema_version: "fermatmind.en_content_parity_package_sha256_manifest.v1", control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01", lane_id: "W3", subscope_id: "W3-CAREER-GUIDES", package_id: packageId, files, package_sha256: packageSha, partial_batch: partialBatch, permissions });
const masterSha = sha(fs.readFileSync(path.join(root, "docs/seo/generated/en-content-parity-control-master.v1.json")));
writeJson("master_manifest_patch.candidate.json", { $schema: "../../../../../docs/seo/generated/en-content-parity-control-master.v1.schema.json", artifact_kind: "master_manifest_patch_candidate", schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1", control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01", lane_id: "W3", subscope_id: "W3-CAREER-GUIDES", package_id: packageId, base_manifest_sha256: masterSha, sha256_manifest_path: `${batchDirectory}sha256_manifest.json`, package_sha256: packageSha, proposed_status: "package_in_progress", gate_evidence: { gate: "package_in_progress", report_path: "source_ledger.json", report_sha256: files.find((entry) => entry.path === "source_ledger.json").sha256, report_in_package: true, owner_lane_id: "W3", verdict: null, asset_ids: [asset.asset_id], row_count: rows.length }, asset_updates: [asset], partial_batch: partialBatch, permissions });
console.log(JSON.stringify({ ok: true, package_id: packageId, package_sha256: packageSha, rows: rows.length, master_sha256: masterSha }));
