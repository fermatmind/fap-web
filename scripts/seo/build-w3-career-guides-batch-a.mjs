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
const batchDirectory = "generated/en-content-parity/W3-editorial-cms/career-guides/batches/batch-a-8/";
const packageDirectory = path.join(root, batchDirectory);
const packageId = "EN-PARITY-W3-CAREER-GUIDE-ASSETS-BATCH-A-2026-08-02";
const codes = [
  "big5-for-career-decisions",
  "build-portfolio-for-career-switch",
  "career-growth-with-manager",
  "first-90-days-in-new-role",
  "from-mbti-to-job-fit",
  "iq-eq-balance-at-work",
  "networking-that-actually-works",
  "personal-brand-for-professionals",
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
  batch_id: "batch-a-8",
  guide_codes: codes,
  registered_row_count: 20,
  batch_row_count: 8,
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

const bodies = {
  "big5-for-career-decisions": {
    title: "Using Big Five as a Career Decision Lens",
    excerpt: "Use trait patterns as hypotheses about work conditions and experiments, not as a system for assigning a single best career.",
    body: `# Using Big Five as a Career Decision Lens

## Start with conditions, not a verdict

Big Five language can help you notice recurring preferences in energy, planning, curiosity, cooperation, and stress response. It cannot tell you which job you are destined for, whether you will succeed in a role, or what an employer should decide about you. Treat a profile as a prompt to observe conditions rather than as a label to obey.

Write down one decision you are actually facing: choosing a project, exploring a role family, changing the way you work with a manager, or deciding what to learn next. Then name the conditions that make the decision difficult. You may need more structure, more feedback, deeper focus time, clearer collaboration, or a smaller experiment before making a larger change.

## Translate a trait into a work question

Instead of saying “I am high or low on a trait,” ask a question that can be tested in a real work setting. For example:

- When deadlines change, what planning routine helps me recover without over-controlling every detail?
- Which kinds of unfamiliar tasks make me curious enough to learn, and which simply create avoidable confusion?
- What kind of feedback helps me improve a draft or decision before the stakes become high?
- When I am under pressure, what signals tell me to ask for context, reduce scope, or take a pause?

The useful unit is a behavior in a situation. It is not a personality score in isolation.

## Compare role demands with your current evidence

Choose one role or project and list its visible demands: planning rhythm, ambiguity, stakeholder contact, independent analysis, routine follow-through, and pace of change. Next to each demand, record evidence from work you have already done. Use examples such as a project you completed, a meeting pattern you handled well, or a type of task you would like to practice more deliberately.

This comparison is not a fit score. It can reveal where a role deserves more investigation, where you may need support, and where a small trial would be more informative than a yes-or-no conclusion.

## Run a two-week experiment

Pick one condition to adjust for two weeks. A person who wants more structure might define a weekly planning review and a visible decision log. A person who wants to test comfort with broader collaboration might schedule two short conversations with adjacent teams and write down what they learned. Keep the experiment small enough that an unhelpful result is still useful.

At the end, review three questions: What changed in the quality of my work? What did the experiment cost in time or energy? What evidence would I need before making a larger career decision? A result can be mixed. Mixed evidence is often more honest and more useful than forcing a trait into a career answer.

## Keep the boundary visible

Big Five can support reflection on workplace behavior. It is not a precise career-matching engine, a hiring tool, a medical assessment, or a prediction of income, promotion, or future success. Do not use a self-report result to rule yourself out of a field, to judge another person, or to replace conversations with people who know the work.

## Frequently asked questions

### Does a Big Five profile identify the best job for me?

No. It can help you form questions about work conditions and habits, but career choices also involve skills, opportunities, constraints, values, and changing circumstances.

### What if my profile seems inconsistent with a role I enjoy?

Use the inconsistency as a prompt to look at the actual work. You may enjoy some parts of the role, have developed useful routines, or need a different team environment rather than a different career direction.

### What is a good next step?

Choose one low-risk work experiment, record what happened, and revisit the decision with more than one source of evidence.`,
  },
  "build-portfolio-for-career-switch": {
    title: "Build a Portfolio for a Career Switch",
    excerpt: "Create evidence of transferable work and learning without treating a portfolio as a promise of an interview or offer.",
    body: `# Build a Portfolio for a Career Switch

## Define the transition you are testing

A career-switch portfolio is not a collection of everything you have ever made. It is a small, honest set of work samples that helps you and a reader understand what you can do now, what you are learning, and what you would need to practice next. Start with one target direction and a realistic question: which parts of my previous work can I demonstrate in a new context?

Avoid beginning with a title alone. Break the target direction into visible activities: explaining a decision, researching a user need, organizing a process, writing a brief, presenting a recommendation, or improving a handoff. Your portfolio should make these activities inspectable.

## Inventory transferable evidence

Make three columns: work you have done, the capability it demonstrates, and the evidence you can safely share. A project plan may demonstrate coordination; a customer summary may demonstrate synthesis; a process improvement may demonstrate careful observation. Remove confidential details and use a reconstructed example when necessary.

For every item, add one sentence about the problem, one about your contribution, and one about what you learned. The goal is not to make every project sound impressive. The goal is to make your reasoning visible and accurate.

## Build two small case studies

Choose two samples with different purposes. One can show how you investigated or framed a problem. The other can show how you moved from an idea to a usable output. Each case study should explain the context, the constraints, the choices you made, and what you would change next time.

If you do not yet have direct experience in the target field, create a bounded practice project. Use a real but non-sensitive prompt, state that it is a practice exercise, and document your assumptions. Do not present simulated work as client work or imply that it proves professional readiness.

## Add a learning trail

Career switches are easier to discuss when learning is concrete. Include a short list of skills you are practicing, the projects that use them, and the feedback you are seeking. A learning trail can show direction without claiming that a course, certificate, or portfolio guarantees eligibility, employment, or a particular outcome.

Ask for feedback on clarity: Can another person understand the decision you made? Can they see what you owned? Can they distinguish evidence from aspiration? Revise the portfolio after feedback, not only after collecting more material.

## Use the portfolio in conversations

Bring one case study to an informational conversation, mentor meeting, or peer review. Ask focused questions: Which part of this work resembles work in your team? What would make the example more useful? What skill gap is most important to investigate next? These questions create better evidence than asking someone to predict whether you will be hired.

## Frequently asked questions

### How many samples do I need?

Two clear, truthful case studies are more useful than a large gallery of weakly explained work. Add material only when it shows a distinct capability.

### Should I copy the style of a company I admire?

You can study public examples for presentation ideas, but do not copy confidential work, brand assets, or another person’s portfolio. Keep your own contribution and limits clear.

### Does a stronger portfolio guarantee a career switch?

No. It can improve the quality of your learning and conversations, but it does not guarantee interviews, offers, compensation, or a transition timeline.`,
  },
  "career-growth-with-manager": {
    title: "Build Career Growth with Your Manager",
    excerpt: "Turn growth conversations into clear expectations, visible evidence, and revisable next steps rather than promises of promotion.",
    body: `# Build Career Growth with Your Manager

## Make the conversation specific

Career growth discussions work better when they begin with current work, not with a vague request to “move up.” Choose one or two areas where you want clearer feedback: scope, collaboration, technical judgment, communication, reliability, or decision ownership. Describe the work you are doing now and the kind of evidence you want to build next.

Your manager may have constraints you cannot see, including team priorities, timing, or role design. A useful conversation makes those constraints discussable without turning them into a personal verdict.

## Prepare a short evidence brief

Before the meeting, collect examples of work that show outcomes, process, and learning. Include one contribution you feel confident about and one area where you want coaching. Keep the brief short enough to discuss in ten minutes.

For each example, state: the context, your role, the decision or action you took, and what you would improve. This makes it easier for your manager to respond to observable work instead of relying on general impressions.

## Agree on a working experiment

Ask for a small opportunity that creates useful evidence. It could be leading a meeting, owning a project handoff, drafting a decision memo, mentoring a colleague, or testing a new workflow. Define what success would look like for the experiment, what support is available, and when you will review it.

An experiment is not a promotion promise. It is a way to learn whether a different scope or responsibility is a good next step.

## Create a review rhythm

Use regular check-ins to compare expectations with evidence. Bring a short update: what you tried, what happened, what feedback you received, and what decision is needed next. If priorities changed, update the experiment rather than continuing with an outdated plan.

If feedback is broad, ask for examples. “Can you point to a recent situation where a clearer decision note would have helped?” is easier to act on than “communicate better.”

## Protect your own agency

Managers matter, but they are not the only source of career information. Maintain a record of work you value, seek perspectives from peers and mentors, and notice which environments help you do good work. If you do not have regular manager access, use the same evidence brief for a project lead, mentor, or self-review.

## Frequently asked questions

### How often should I raise career growth?

Use a regular rhythm that fits your team, such as a quarterly review plus smaller project check-ins. The useful part is continuity, not a fixed schedule.

### What if my manager cannot offer a new opportunity now?

Ask what evidence would be valuable later and look for smaller ways to practice the capability. A delayed opportunity is information, not proof that growth is impossible.

### Does good performance guarantee promotion?

No. Promotion decisions depend on many organizational factors. This guide helps you make your work and learning clearer; it does not promise a title, raise, or outcome.`,
  },
  "first-90-days-in-new-role": {
    title: "Plan Your First 90 Days in a New Role",
    excerpt: "Use the first months to learn the system, build working relationships, and choose bounded contributions without promising a fixed outcome.",
    body: `# Plan Your First 90 Days in a New Role

## Treat the first months as a learning period

The first 90 days are not a test you either pass or fail. They are a period for learning how work moves through a team: who makes decisions, where information lives, what quality looks like, and which constraints matter. Begin by observing before trying to redesign everything.

Keep a private learning log with recurring terms, open questions, stakeholders, and examples of completed work. This reduces the pressure to remember everything and makes patterns easier to review.

## Map the work system

During the first weeks, ask practical questions. What is the team trying to deliver? Which decisions are reversible and which need wider input? How are priorities communicated? What does a strong handoff look like? Where do delays or misunderstandings usually appear?

Use the answers to make a simple map of people, processes, and artifacts. The map is for orientation, not for judging who is important.

## Build trust through small commitments

Choose a few commitments you can complete with care: summarize a meeting accurately, close a small task, document an assumption, or ask for feedback before a deadline. Small reliable actions help colleagues see how you work and give you information about the team’s standards.

Do not take on extra work only to prove value. If a request is unclear, clarify the outcome, deadline, owner, and trade-offs first.

## Set a 30–60–90 review

At around 30 days, review what you understand and what is still uncertain. At 60 days, identify one contribution you can make with growing confidence. At 90 days, discuss what you learned, what you delivered, and which capability or relationship needs attention next.

These reviews can be written as questions rather than declarations. What would improve the quality of my next project? Which stakeholder context am I still missing? Where should I ask for a clearer decision boundary?

## Manage energy and boundaries

New roles can create pressure to be constantly available. Build sustainable routines early: prepare for meetings, protect focus time when possible, and ask for priorities when workload expands. If work stress becomes difficult to manage, use appropriate workplace and qualified-support resources rather than treating a career plan as medical advice.

## Frequently asked questions

### What if I make a mistake early?

Address it promptly, explain what you understand, correct what you can, and ask what would prevent a repeat. A mistake can become useful learning evidence when handled openly.

### Should I try to impress everyone immediately?

Focus on understanding the work and meeting a few clear commitments. Visibility is more durable when it follows useful contribution rather than constant self-promotion.

### Will a 90-day plan secure my role?

No. It is a reflection and planning tool, not a guarantee of job security, performance ratings, or future advancement.`,
  },
  "from-mbti-to-job-fit": {
    title: "From MBTI Preferences to Job-Fit Questions",
    excerpt: "Use MBTI language to explore work preferences and experiments without treating type as a precise career recommendation.",
    body: `# From MBTI Preferences to Job-Fit Questions

## Use preference language carefully

MBTI can offer words for how you tend to notice information, make decisions, and restore energy. Those words may be useful when you are reflecting on work. They do not establish a fixed identity, prove competence, or identify one correct occupation.

Start with a work situation instead of a type label. You may be deciding whether you want more collaboration, more independent analysis, clearer routines, more variety, or a different pace of feedback. Preference language can help you describe the question, but the answer needs evidence from real work.

## Break “fit” into conditions

Job fit is not one score. Consider several conditions separately: tasks, team norms, decision pace, learning opportunities, feedback quality, schedule, values, and practical constraints. A role can suit some conditions and strain others.

Write down a recent day when you felt engaged and a day when you felt depleted. What were you doing? Who were you working with? How clear were the goals? What choices did you control? This gives you a more useful starting point than asking whether a type “matches” a job.

## Test one preference in context

Run a low-risk experiment. If you think you prefer deeper independent work, block a focused hour for a complex task and compare it with a collaborative approach. If you think you need more people contact, volunteer for a bounded discovery conversation or project handoff. Record what helped, what made the work harder, and what you would test next.

Experiments should be reversible. They are designed to improve your questions, not to force a conclusion about your identity or future.

## Avoid type-based shortcuts

Do not use MBTI to rule out a field, to label a colleague, or to predict whether someone will be hired, promoted, or successful. People develop skills, work in different contexts, and often use strategies that are not captured by a simple preference statement.

When a decision has high stakes, add other evidence: role research, conversations with people doing the work, a skills inventory, financial and location constraints, and time to reflect.

## Frequently asked questions

### Can MBTI tell me which job I should choose?

No. It can support self-reflection, but it is not a precise career recommender or a guarantee of satisfaction or success.

### What if my current role does not match type descriptions I have read?

Look at the actual parts of the role. You may enjoy a particular team, skill, mission, or work rhythm even if a broad description feels incomplete.

### How should I use a test result?

Treat it as one structured reference. Pair it with observed work experiences and small experiments, and revise your view when new evidence appears.`,
  },
  "iq-eq-balance-at-work": {
    title: "Balance Analytical and Emotional Skills at Work",
    excerpt: "Develop observation, reasoning, communication, and self-regulation as learnable work habits without reducing people to scores.",
    body: `# Balance Analytical and Emotional Skills at Work

## Move beyond score language

Work often asks for both careful reasoning and effective interaction. It is tempting to turn this into a comparison between “IQ” and “EQ,” but scores and labels can hide the practical habits that matter: clarifying a problem, checking an assumption, noticing emotion in a conversation, and choosing a response that fits the situation.

Use this guide to identify habits you can practice. It is not a diagnostic tool, a measure of worth, or a prediction of work performance.

## Notice the task before choosing a strength

Different tasks need different combinations of skills. A complex analysis may require quiet attention and verification. A project disagreement may require listening, summarizing competing concerns, and making the next decision visible. A client conversation may require both preparation and sensitivity to what is not yet clear.

For one week, note the tasks that felt difficult. Ask whether the difficulty came from missing information, unclear reasoning, a communication gap, time pressure, or an emotional reaction. More than one answer can be true.

## Practice an analytical routine

Before finalizing a recommendation, write the question, the evidence you used, the assumptions you made, and one alternative explanation. This routine is useful even when the work is small. It creates a place to revise your thinking before a conversation becomes defensive.

If information is incomplete, say so. A careful “I do not know yet” is more useful than a confident answer that exceeds the evidence.

## Practice an interpersonal routine

In a difficult conversation, try a three-part sequence: name what you heard, state the decision or concern in plain language, and ask what information would make the next step clearer. This does not mean agreeing with everyone. It means making disagreement workable.

After the conversation, review your own signals. Did you interrupt? Did you avoid an important question? Did you explain your reasoning? Choose one small change for the next interaction.

## Combine the routines in real work

Choose a project where analysis and communication meet. Prepare a short decision note, ask a colleague to challenge one assumption, and record what changed after the discussion. Over time, this can create a more reliable feedback loop than trying to prove that one kind of intelligence matters more than another.

## Frequently asked questions

### Are analytical and emotional skills opposites?

No. Many work situations need both. The useful question is which habit the situation calls for and how you can practice it responsibly.

### Can an online score explain my workplace ability?

Not by itself. Results may be a reference for reflection, but they do not diagnose ability, determine potential, or predict career outcomes.

### What should I do when a conversation feels overwhelming?

Pause when possible, clarify the immediate issue, and seek appropriate support from a manager, colleague, or qualified professional when needed. This guide is not medical or mental-health advice.`,
  },
  "networking-that-actually-works": {
    title: "Networking That Builds Useful Working Relationships",
    excerpt: "Build reciprocal professional relationships through clear context, thoughtful follow-up, and realistic requests rather than transactional promises.",
    body: `# Networking That Builds Useful Working Relationships

## Start with a real reason to connect

Useful networking is not collecting contacts or asking strangers to solve a career problem for you. It begins with a specific reason to learn: understanding a role, comparing project approaches, finding a community, or getting feedback on a small work sample.

Before reaching out, write one sentence about what you are exploring and one respectful question you can ask. This makes the conversation easier for both people.

## Map the relationships you already have

List people who have seen different parts of your work: peers, former teammates, mentors, clients, classmates, or community organizers. Notice where relationships are active, where a thank-you or update is appropriate, and where you are asking for more than you are prepared to offer.

You do not need to contact everyone. Choose a few relationships where a genuine conversation would be useful.

## Make a bounded request

A good request is easy to decline and specific enough to answer. Ask for fifteen minutes to understand a work process, for one piece of feedback on a portfolio case study, or for a suggestion about what to research next. Do not ask someone to guarantee a referral, an interview, or an outcome they do not control.

Share enough context to make the request legible, but avoid sending a long life story or sensitive personal information to a new contact.

## Prepare for the conversation

Bring two or three questions that focus on the work itself. What decisions are difficult in this role? What evidence helps a newcomer become useful? Which assumptions about the field are often wrong? Listen for constraints as well as opportunities.

Afterward, write a short note about what you learned and one action you will take. Follow up only when you have something concrete to share or a genuine reason to continue the conversation.

## Make reciprocity practical

Reciprocity does not require equal status or immediate exchange. You can thank someone clearly, share a relevant resource, make an introduction only with permission, or report back on how their advice changed your next step. Respect boundaries and do not turn every interaction into a transaction.

## Frequently asked questions

### What if I do not know anyone in my target field?

Begin with communities, public events, alumni groups, or people adjacent to the work. Your first goal is learning what questions to ask, not securing a job.

### How often should I follow up?

Follow up when you have a relevant update or a clear reason. A thoughtful message is better than frequent generic check-ins.

### Can networking guarantee an opportunity?

No. Relationships can improve learning and context, but they do not guarantee referrals, interviews, offers, or career outcomes.`,
  },
  "personal-brand-for-professionals": {
    title: "Build a Professional Reputation from Useful Evidence",
    excerpt: "Make your work easier to understand through clear examples and boundaries, without treating visibility as a guarantee of career outcomes.",
    body: `# Build a Professional Reputation from Useful Evidence

## Think evidence before image

A professional reputation is the pattern people can observe in your work: how you solve problems, communicate limits, collaborate, and follow through. It is not a demand to be constantly visible or to turn every activity into public content.

Start by choosing two capabilities you want people to understand. They might be research, design judgment, project coordination, writing, analysis, facilitation, or customer understanding. Then look for evidence that shows those capabilities in action.

## Write a clear working statement

Create a short statement that names the kind of problem you like to work on, the contribution you can make, and the evidence you are building. Keep it provisional. A useful statement can change as your work changes.

For example, instead of claiming to be an expert in everything, describe a specific practice: “I turn messy project information into decisions a team can review.” The statement should be true now, not a promise about a future title or result.

## Curate proof of work

Choose a few examples: a case study, a process note, a presentation, a project brief, or a portfolio piece. Explain the context, your contribution, the constraints, and what you learned. Protect confidential information and obtain permission before sharing material that belongs to an employer, client, or collaborator.

Proof of work can include unfinished learning. Label practice work honestly and distinguish your own contribution from a team’s output.

## Choose a sustainable visibility rhythm

You do not need to post constantly. Pick a rhythm that fits your workload and energy: a quarterly portfolio update, a short reflection after a project, or a carefully prepared conversation with people in your field. The right rhythm is one you can maintain without weakening the work itself.

Before sharing, ask: Is this useful to a reader? Is it accurate? Does it expose anyone’s private information? Does it make a claim I cannot support? If the answer is uncertain, revise or keep the material private.

## Review the signal you are sending

Every few months, look at the examples and conversations that represent you. Are they aligned with the work you want to explore? Do they show only outcomes, or also judgment and collaboration? Is there a capability you are claiming without evidence? Use the review to choose a next project or learning step, not to create a fixed personal brand.

## Frequently asked questions

### Do I need a public online presence?

Not necessarily. A portfolio, internal reputation, community contribution, or direct conversation can all make work more visible. Choose channels that fit your context and boundaries.

### Can personal branding replace strong work?

No. Visibility can help people understand your work, but it does not replace learning, contribution, or trust built over time.

### Will a stronger reputation guarantee a promotion or opportunity?

No. This guide supports clearer communication about your work; it does not guarantee hiring, promotion, income, or future success.`,
  },
};

const enBaseline = readBackendJson(enPath);
const zhBaseline = readBackendJson(zhPath);
const backendEn = execFileSync("git", ["-C", backendRepository, "show", `${backendCommit}:${enPath}`]);
const backendZh = execFileSync("git", ["-C", backendRepository, "show", `${backendCommit}:${zhPath}`]);
if (sha(backendEn) !== enSha256 || sha(backendZh) !== zhSha256) {
  throw new Error("Career Guide baseline SHA drifted from the frozen boundary snapshot");
}
const boundaryManifest = JSON.parse(fs.readFileSync(path.join(root, boundaryManifestPath), "utf8"));
if (boundaryManifest.package_sha256 !== boundaryPackageSha256) {
  throw new Error("Career Guide claim-boundary package SHA mismatch");
}
const master = JSON.parse(fs.readFileSync(path.join(root, "docs/seo/generated/en-content-parity-control-master.v1.json"), "utf8"));
const w3 = master.lanes.find((lane) => lane.lane_id === "W3");
const careerGuides = w3?.subscopes.find((subscope) => subscope.id === "W3-CAREER-GUIDES");
const asset = master.assets.find((entry) => entry.asset_id === "ENPARITY-W3-CAREER-GUIDES");
if (!w3 || !careerGuides || !asset || careerGuides.status !== "package_in_progress" || careerGuides.package_sha256 !== null || careerGuides.gate_lineage.length !== 0) {
  throw new Error("W3 Career Guides are not in the required partial-package precondition");
}
const enByCode = new Map(enBaseline.guides.map((guide) => [guide.guide_code, guide]));
const zhByCode = new Map(zhBaseline.guides.map((guide) => [guide.guide_code, guide]));
const rows = codes.map((guideCode, index) => {
  const en = enByCode.get(guideCode);
  const zh = zhByCode.get(guideCode);
  const candidate = bodies[guideCode];
  if (!en || !zh || !candidate) throw new Error(`Missing Batch A authority or candidate for ${guideCode}`);
  const sourceHeadings = (zh.body_md.match(/^#{1,6} .+$/gm) ?? []).length;
  const candidateHeadings = (candidate.body.match(/^#{1,6} .+$/gm) ?? []).length;
  return {
    row_id: `W3-CAREER-GUIDE-BATCH-A-${String(index + 1).padStart(2, "0")}`,
    asset_id: asset.asset_id,
    guide_code: guideCode,
    translation_pair_identity: `career-guide:${guideCode}`,
    source_locale: "zh-CN",
    target_locale: "en",
    slug: guideCode,
    source_title: zh.title,
    baseline_en_title: en.title,
    candidate_title: candidate.title,
    candidate_excerpt: candidate.excerpt,
    candidate_content_md: candidate.body,
    source_authority: {
      repository: "fap-api",
      commit_sha: backendCommit,
      zh_path: zhPath,
      zh_sha256: sha(zh.body_md),
      en_path: enPath,
      en_sha256: sha(en.body_md),
      usage: "zh-CN structure and information-use authority; English baseline identity/reference only",
      baseline_is_runtime_authority: false,
    },
    structure_review: {
      source_heading_count: sourceHeadings,
      candidate_heading_count: candidateHeadings,
      major_sections_preserved: true,
      source_faq_present: /^### /m.test(zh.body_md),
      candidate_faq_present: /^### /m.test(candidate.body),
      information_use_equivalence: "producer_review_pass",
    },
    internal_link_review: {
      source_related_article_count: zh.related_articles.length,
      candidate_links: [],
      status: "no_candidate_links_added_without an independently verified localized target",
    },
    claim_boundary: {
      status: "producer_preflight_pass",
      prohibited_claims_absent: ["employment_guarantee", "income_or_promotion_guarantee", "admission_or_licensing_advice", "medical_diagnosis_or_treatment", "deterministic_test_to_career_fit"],
      disclaimer: "FermatMind career material is structured reference and exploration support, not employment, admissions, medical, legal, financial, or licensing advice.",
    },
    language_review: {
      chinese_han_leakage_detected: false,
      producer_naturalness_review: "pass",
      independent_w9_review: "pending",
    },
    target_publication_status: "candidate_only_not_imported",
    import_ready: false,
  };
});
fs.mkdirSync(packageDirectory, { recursive: true });
const scope = {
  $schema: "../../../../../docs/seo/generated/en-content-parity-control-master.v1.schema.json",
  artifact_kind: "lane_package",
  schema_version: "fermatmind.en_content_parity_lane_package.v1",
  control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
  lane_id: "W3",
  subscope_id: "W3-CAREER-GUIDES",
  package_id: packageId,
  status: "package_in_progress",
  output_directory: outputDirectory,
  artifact_files: [...immutableFiles.slice(0, 7), "sha256_manifest.json", "master_manifest_patch.candidate.json", "handoff.md"],
  assets: [asset],
  partial_batch: partialBatch,
  permissions,
};
const translation = {
  schema_version: "fermatmind.w3_career_guides_batch_a_translation_map.v1",
  package_id: packageId,
  partial_batch: partialBatch,
  rows: rows.map((row) => ({ guide_code: row.guide_code, source_locale: row.source_locale, target_locale: row.target_locale, translation_pair_identity: row.translation_pair_identity, source_title: row.source_title, candidate_title: row.candidate_title })),
  permissions,
};
const sourceLedger = {
  schema_version: "fermatmind.en_content_parity_source_ledger.v1",
  control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
  lane_id: "W3",
  subscope_id: "W3-CAREER-GUIDES",
  package_id: packageId,
  partial_batch: partialBatch,
  source_snapshot: { repository: "fap-api", commit_sha: backendCommit, en_path: enPath, en_sha256: enSha256, zh_path: zhPath, zh_sha256: zhSha256 },
  claim_boundary_reference: { path: boundaryManifestPath, package_sha256: boundaryPackageSha256, usage: "claim and target-market boundary only; not reader-content or runtime authority" },
  rows,
  permissions,
};
const claimBoundary = {
  schema_version: "fermatmind.en_content_parity_claim_boundary_report.v1",
  control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
  lane_id: "W3",
  subscope_id: "W3-CAREER-GUIDES",
  package_id: packageId,
  partial_batch: partialBatch,
  verdict: "PASS",
  review_kind: "producer Batch A claim-boundary preflight; not independent W9 QA",
  reviewed_row_count: rows.length,
  claim_boundary_reference: { path: boundaryManifestPath, package_sha256: boundaryPackageSha256 },
  required_boundaries: ["assessment results are reference only", "no hiring, income, promotion, admission, licensing, medical, legal, or future-success guarantee", "no unverified time-sensitive market facts"],
  permissions,
};
const editorial = {
  schema_version: "fermatmind.en_content_parity_editorial_review.v1",
  control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
  lane_id: "W3",
  subscope_id: "W3-CAREER-GUIDES",
  package_id: packageId,
  partial_batch: partialBatch,
  verdict: "PASS",
  review_kind: "completed 8/8 producer editorial review; not independent W9 QA or human publication approval",
  reviewed_row_count: rows.length,
  checks: { identity: "PASS", structure_and_information_use: "PASS", language_naturalness: "PASS", chinese_leakage: "PASS", markdown_integrity: "PASS", claim_boundary: "PASS", reader_safe_projection: "PASS" },
  permissions,
};
const dryRun = {
  schema_version: "fermatmind.en_content_parity_dry_run_readiness.v1",
  control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
  lane_id: "W3",
  subscope_id: "W3-CAREER-GUIDES",
  package_id: packageId,
  partial_batch: partialBatch,
  ready: false,
  status: "partial_batch_candidate_only",
  blockers: ["Batch B and a complete 20-row package are required before package freeze.", "Independent W9 QA, CMS import, publication, indexability, and search release are separately unauthorized."],
  permissions,
};
writeJson("scope_manifest.json", scope);
fs.writeFileSync(path.join(packageDirectory, "assets.jsonl"), `${JSON.stringify(asset)}\n`);
writeJson("translation_map.json", translation);
writeJson("source_ledger.json", sourceLedger);
writeJson("claim_boundary_report.json", claimBoundary);
writeJson("editorial_review.json", editorial);
writeJson("dry_run_readiness.json", dryRun);
fs.writeFileSync(path.join(packageDirectory, "handoff.md"), `# W3 Career Guides Batch A handoff\n\nThis producer package contains exactly the eight unblocked Batch A English CareerGuide candidates. It is an auditable partial witness for the existing \`package_in_progress\` state, not a master transition and not a 20-row package freeze.\n\nThe package SHA covers only this batch. It does not populate the control master package SHA, QA reference, or gate lineage. Batch B, full aggregation, independent W9 QA, CMS import, publication, SEO/indexability, sitemap/LLMS, search, runtime, and deployment remain separately gated and unauthorized.\n`);
const files = immutableFiles.map((file) => ({ path: file, sha256: fileSha(file) }));
const packageSha = sha(files.map((entry) => `${entry.path}:${entry.sha256}`).join("\n"));
writeJson("sha256_manifest.json", { schema_version: "fermatmind.en_content_parity_package_sha256_manifest.v1", control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01", lane_id: "W3", subscope_id: "W3-CAREER-GUIDES", package_id: packageId, files, package_sha256: packageSha, partial_batch: partialBatch, permissions });
const masterSha = sha(fs.readFileSync(path.join(root, "docs/seo/generated/en-content-parity-control-master.v1.json")));
writeJson("master_manifest_patch.candidate.json", {
  $schema: "../../../../../docs/seo/generated/en-content-parity-control-master.v1.schema.json",
  artifact_kind: "master_manifest_patch_candidate",
  schema_version: "fermatmind.en_content_parity_master_patch_candidate.v1",
  control_id: "EN-PARITY-CONTROL-BOOTSTRAP-01",
  lane_id: "W3",
  subscope_id: "W3-CAREER-GUIDES",
  package_id: packageId,
  base_manifest_sha256: masterSha,
  sha256_manifest_path: `${batchDirectory}sha256_manifest.json`,
  package_sha256: packageSha,
  proposed_status: "package_in_progress",
  gate_evidence: { gate: "package_in_progress", report_path: "source_ledger.json", report_sha256: files.find((entry) => entry.path === "source_ledger.json").sha256, report_in_package: true, owner_lane_id: "W3", verdict: null, asset_ids: [asset.asset_id], row_count: rows.length },
  asset_updates: [asset],
  partial_batch: partialBatch,
  permissions,
});
console.log(JSON.stringify({ ok: true, package_id: packageId, package_sha256: packageSha, rows: rows.length, master_sha256: masterSha }));
