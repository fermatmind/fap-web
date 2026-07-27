#!/usr/bin/env node
import crypto from "node:crypto";
import { execFile, execFileSync } from "node:child_process";
import { createRequire } from "node:module";
import fs from "node:fs";
import { promisify } from "node:util";
import { JSDOM } from "jsdom";
import { csvEscape } from "./artifactSafety.mjs";

const require = createRequire(import.meta.url);
const execFileAsync = promisify(execFile);
const DISCOVERABILITY_POLICY_SOURCE_URL = new URL(
  "../../lib/seo/discoverabilityExposurePolicy.cjs",
  import.meta.url,
);
const { isSharedDiscoverabilityDeniedPath } = require(
  "../../lib/seo/discoverabilityExposurePolicy.cjs",
);
const SITE_ORIGIN = "https://fermatmind.com";
const API_ORIGIN = "https://api.fermatmind.com/api/v0.5/personality";
const PUBLIC_CONTEXT_QUERY = "locale=zh-CN&org_id=0&scale_code=MBTI";
const COMPARISON_LIST_URL = `${API_ORIGIN}/comparisons?${PUBLIC_CONTEXT_QUERY}`;
const FEED_URLS = Object.freeze({
  "sitemap.xml": "https://fermatmind.com/sitemap.xml",
  "llms.txt": "https://fermatmind.com/llms.txt",
  "llms-full.txt": "https://fermatmind.com/llms-full.txt",
});
const ALLOW_NETWORK = process.argv.includes("--allow-network");
const DIAGNOSE_VISIBLE_ONLY = process.argv.includes("--diagnose-visible-only");
const diagnoseSlug = process.argv.find((argument) => argument.startsWith("--diagnose-slug="))
  ?.split("=")[1] ?? null;
const DIAGNOSE_VISIBLE_BODY = process.env.MBTI_INDEX_DIAGNOSE_VISIBLE_BODY === "1";
const runArgument = process.argv.find((argument) => argument.startsWith("--run="));
const RUN = runArgument === "--run=1" ? 1 : runArgument === "--run=2" ? 2 : null;
const CONTRACT_PROBE = process.argv.find((argument) => argument.startsWith("--contract-probe="))
  ?.split("=")[1] ?? null;
const ARTIFACT_PATHS = Object.freeze({
  run1: new URL("../../docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26-run-1.json", import.meta.url),
  run2: new URL("../../docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26-run-2.json", import.meta.url),
  reportJson: new URL("../../docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26.json", import.meta.url),
  reportMarkdown: new URL("../../docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26.md", import.meta.url),
  reportCsv: new URL("../../docs/seo/personality/mbti-index-52-full-55-release-gate-2026-07-26.csv", import.meta.url),
  runTwoLock: new URL("../../docs/seo/personality/.mbti-index-52-full-55-release-gate-run-2.lock", import.meta.url),
  runTwoReclaim: new URL("../../docs/seo/personality/.mbti-index-52-full-55-release-gate-run-2.lock.reclaim", import.meta.url),
});
const MAX_ATTEMPTS = 3;
const MAX_CONCURRENCY = 1;
const REQUEST_TIMEOUT_MS = 45_000;
const FEED_ABORT_CONTROLLER = new AbortController();
const VALIDATOR_SOURCE_SHA256 = crypto
  .createHash("sha256")
  .update("mbti-index-52-validator-bundle-v1\0")
  .update(fs.readFileSync(new URL(import.meta.url)))
  .update("\0discoverability-exposure-policy\0")
  .update(fs.readFileSync(DISCOVERABILITY_POLICY_SOURCE_URL))
  .digest("hex");
const GROUPS = Object.freeze({
  NT: ["intj", "intp", "entj", "entp"],
  NF: ["infj", "infp", "enfj", "enfp"],
  SJ: ["istj", "isfj", "estj", "esfj"],
  SP: ["istp", "isfp", "estp", "esfp"],
});
const ORIGINAL_CROSS_TYPE = Object.freeze([
  "intj-vs-intp",
  "entj-vs-intj",
  "infj-vs-infp",
  "istj-vs-isfj",
]);
const RELEASED_CROSS_TYPE = Object.freeze([
  "enfp-vs-entp",
  "estj-vs-entj",
  "isfp-vs-infp",
]);
const RELEASED_CROSS_SOURCE_SHA256 = Object.freeze({
  "enfp-vs-entp": "a7b14d279daa3d2ccaaffa9442b5254f8e6f75e1ea0d3bf7a5c08817b912af7e",
  "estj-vs-entj": "b73514962b2d72be47c9004f2b5e5fb7572ea82f918c2a0f5a3374e15b2f36cc",
  "isfp-vs-infp": "41e62902dae206acc8735b19ff7e698fd51b5a609d2aeb34bb02556867399a65",
});
const EXPECTED_CROSS_SECTION_COUNT = Object.freeze({
  "intj-vs-intp": 6,
  "entj-vs-intj": 6,
  "infj-vs-infp": 6,
  "istj-vs-isfj": 6,
  "enfp-vs-entp": 8,
  "estj-vs-entj": 8,
  "isfp-vs-infp": 8,
});
const PROFILE_SECTION_COUNT_OVERRIDES = Object.freeze({
  "istj-a": 34,
  "esfj-a": 34,
  "istp-a": 34,
  "isfp-a": 34,
});
const PROFILE_V85_VISIBLE_SECTION_KEYS = Object.freeze([
  "v8_5_thirty_second_overview",
  "v8_5_strengths_watchouts",
  "v8_5_module_01_core_reading",
  "v8_5_module_02_judgment_style",
  "v8_5_module_03_agency_boundary",
  "v8_5_module_04_standards_drive",
  "v8_5_module_05_learning_revision",
  "v8_5_module_06_stress_blindspot",
  "v8_5_module_07_social_feedback",
  "v8_5_module_08_career_workflow",
  "v8_5_module_09_relationships",
  "v8_5_module_10_faq_boundary",
]);
const PROFILE_LEADING_PROJECTION_SECTION_KEYS = Object.freeze([
  "letters_intro",
  "trait_overview",
]);
const MBTI64_PROMOTED_DETAIL_SECTION_KEYS = new Set([
  "quick_answer",
  "meaning",
  "a_t_difference",
  "core_traits",
  "strengths_blind_spots",
  "careers_work_style",
  "relationships_communication",
  "common_misreads",
  "similar_types",
  "mbti64_promotion_metadata",
]);
const CHECK_KEYS = Object.freeze([
  "public_api",
  "authority",
  "authority_fingerprint",
  "visible_body",
  "section_completeness",
  "faq",
  "jsonld",
  "canonical",
  "robots_indexability",
  "sitemap",
  "llms",
  "llms_full",
  "api_no_timeout",
]);
const SAFETY_BOUNDARY = Object.freeze({
  read_only_network: true,
  cms_write_attempted: false,
  database_write_attempted: false,
  publication_mutation_attempted: false,
  indexability_mutation_attempted: false,
  sitemap_llms_mutation_attempted: false,
  sitemap_submission_attempted: false,
  gsc_mutation_attempted: false,
  search_submission_attempted: false,
  production_deploy_attempted: false,
  frontend_editorial_fallback_added: false,
});

function targets() {
  const profiles = Object.entries(GROUPS).flatMap(([group, types]) => types.flatMap((type) => (
    ["a", "t"].map((variant) => ({
      group,
      kind: "profile",
      slug: `${type}-${variant}`,
      expectedSectionCount: PROFILE_SECTION_COUNT_OVERRIDES[`${type}-${variant}`] ?? 35,
    }))
  )));
  const atComparisons = Object.entries(GROUPS).flatMap(([group, types]) => types.map((type) => ({
    group,
    kind: "at_comparison",
    slug: `${type}-a-vs-${type}-t`,
    expectedSectionCount: 9,
  })));
  const crossTypeComparisons = [...ORIGINAL_CROSS_TYPE, ...RELEASED_CROSS_TYPE].map((slug) => ({
    group: RELEASED_CROSS_TYPE.includes(slug) ? "released_cross_type" : "original_cross_type",
    kind: "cross_type_comparison",
    slug,
    expectedSectionCount: EXPECTED_CROSS_SECTION_COUNT[slug],
  }));
  return [...profiles, ...atComparisons, ...crossTypeComparisons];
}

function validateInventory(targetList) {
  const expected = targets().map(({ slug }) => slug);
  const actual = targetList.map(({ slug }) => slug);
  if (actual.length !== 55) throw new Error("MBTI-INDEX-52 requires exactly 55 targets");
  if (new Set(actual).size !== 55) throw new Error("MBTI-INDEX-52 rejects duplicate targets");
  const missing = expected.filter((slug) => !actual.includes(slug));
  const extra = actual.filter((slug) => !expected.includes(slug));
  if (missing.length || extra.length) {
    throw new Error(`MBTI-INDEX-52 inventory drift missing=${missing.join("|")} extra=${extra.join("|")}`);
  }
  const released = actual.filter((slug) => RELEASED_CROSS_TYPE.includes(slug));
  if (released.join("|") !== RELEASED_CROSS_TYPE.join("|")) {
    throw new Error("MBTI-INDEX-52 exact-three release set drifted");
  }
}

function validateRecordEvidence(record) {
  const failed = CHECK_KEYS.filter((key) => record?.checks?.[key] !== true);
  if (failed.length) throw new Error(`MBTI-INDEX-52 record failed: ${failed.join("|")}`);
  if (!/^[0-9a-f]{64}$/.test(record.authority_fingerprint_sha256 ?? "")) {
    throw new Error("MBTI-INDEX-52 authority fingerprint is absent or malformed");
  }
  if (!/^[0-9a-f]{64}$/.test(record.source_revision_sha256 ?? "")) {
    throw new Error("MBTI-INDEX-52 source revision fingerprint is absent or malformed");
  }
}

function runContractProbe(name) {
  if (name === "jsonld-node-identity") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const structured = {
      invalid: false,
      types: ["AboutPage", "BreadcrumbList", "FAQPage", "WebPage"],
      pageIdentities: [
        { types: ["AboutPage"], id: "", url: `${SITE_ORIGIN}/zh/personality/intp-a` },
        { types: ["WebPage"], id: `${canonical}#webpage`, url: canonical },
      ],
      breadcrumbTrails: [[canonical]],
    };
    if (jsonLdValid("profile", structured, canonical)) {
      throw new Error("Stale required JSON-LD page node unexpectedly passed");
    }
    return;
  }
  if (name === "jsonld-conflicting-identity") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const structured = {
      invalid: false,
      types: ["AboutPage", "BreadcrumbList", "FAQPage", "WebPage"],
      pageIdentities: [
        {
          types: ["AboutPage"],
          id: canonical,
          url: `${SITE_ORIGIN}/zh/personality/intp-a`,
        },
        { types: ["WebPage"], id: `${canonical}#webpage`, url: canonical },
      ],
      breadcrumbTrails: [[canonical]],
    };
    if (jsonLdValid("profile", structured, canonical)) {
      throw new Error("Conflicting required JSON-LD identity unexpectedly passed");
    }
    return;
  }
  if (name === "jsonld-empty-optional-identity") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const structured = {
      invalid: false,
      types: ["AboutPage", "BreadcrumbList", "FAQPage", "WebPage"],
      pageIdentities: [
        { types: ["AboutPage"], id: "", url: "" },
        { types: ["WebPage"], id: `${canonical}#webpage`, url: canonical },
      ],
      breadcrumbTrails: [[canonical]],
    };
    if (!jsonLdValid("profile", structured, canonical)) {
      throw new Error("Identity-less optional page node unexpectedly failed");
    }
    return;
  }
  if (name === "jsonld-breadcrumb-terminal") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const structured = {
      invalid: false,
      types: ["AboutPage", "BreadcrumbList", "FAQPage", "WebPage"],
      pageIdentities: [
        { types: ["AboutPage"], id: canonical, url: canonical },
        { types: ["WebPage"], id: `${canonical}#webpage`, url: canonical },
      ],
      breadcrumbTrails: [[canonical, `${SITE_ORIGIN}/zh/personality/intp-a`]],
    };
    if (jsonLdValid("profile", structured, canonical)) {
      throw new Error("Non-terminal canonical breadcrumb unexpectedly passed");
    }
    return;
  }
  if (name === "jsonld-unexpected-page-identity") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-vs-intp`;
    const structured = {
      invalid: false,
      types: ["CollectionPage", "ItemList", "BreadcrumbList", "FAQPage", "WebPage"],
      pageIdentities: [
        { types: ["CollectionPage"], id: canonical, url: canonical },
        {
          types: ["WebPage"],
          id: `${SITE_ORIGIN}/zh/personality/entj-vs-intj#webpage`,
          url: `${SITE_ORIGIN}/zh/personality/entj-vs-intj`,
        },
      ],
      breadcrumbTrails: [[canonical]],
    };
    if (jsonLdValid("cross_type_comparison", structured, canonical)) {
      throw new Error("Unexpected conflicting JSON-LD page identity unexpectedly passed");
    }
    return;
  }
  if (name === "projection-visibility") {
    const payload = {
      comparison_public_projection_v1: {
        claim_boundary: "Use this comparison for reflection, not diagnosis or selection.",
        variants: {
          a: {
            runtime_type_code: "INTJ-A",
            display_type: "INTJ-A",
            type_name: "Architect",
            nickname: "Assertive Architect",
            rarity: "Rare",
            keywords: ["decisive", "steady"],
            summary_card: { summary: "Trusts the plan sooner." },
          },
          t: {
            runtime_type_code: "INTJ-T",
            display_type: "INTJ-T",
            type_name: "Architect",
            nickname: "Turbulent Architect",
            rarity: "Rare",
            keywords: ["reflective", "adaptive"],
            hero_summary: "Rechecks the plan longer.",
          },
        },
        comparison_blocks: [{
          key: "core_difference",
          title: "Core difference",
          variants: {
            a: "Moves once the plan is sound.",
            t: "Keeps testing the plan.",
          },
          body_md: "",
        }],
      },
    };
    const completeVisibleText = [
      "Use this comparison for reflection, not diagnosis or selection.",
      "INTJ-A Architect Assertive Architect Trusts the plan sooner. Rare decisive steady",
      "INTJ-T Architect Turbulent Architect Rechecks the plan longer. Rare reflective adaptive",
      "Core difference Moves once the plan is sound. Keeps testing the plan.",
    ].join(" ");
    if (!comparisonProjectionVisible(
      payload,
      { kind: "at_comparison", slug: "intj-a-vs-intj-t" },
      completeVisibleText,
    )) {
      throw new Error("Complete comparison projection unexpectedly failed");
    }
    if (comparisonProjectionVisible(
      payload,
      { kind: "at_comparison", slug: "intj-a-vs-intj-t" },
      completeVisibleText.replace("Keeps testing the plan.", ""),
    )) {
      throw new Error("Missing comparison projection content unexpectedly passed");
    }
    const crossTypeLinks = Array.from({ length: 7 }, (_, index) => ({
      label: `Comparison link ${index + 1}`,
      href: `/zh/personality/cross-link-${index + 1}`,
      reason: `Check related contrast ${index + 1}.`,
    }));
    const crossTypePayload = {
      comparison_public_projection_v1: {
        claim_boundary: "Use this comparison for reflection, not diagnosis or selection.",
        internal_links: crossTypeLinks,
      },
    };
    const crossTypeVisibleText = crossTypeLinks
      .flatMap((link) => [link.label, link.reason])
      .concat("Use this comparison for reflection, not diagnosis or selection.")
      .join(" ");
    const crossTypeAnchors = crossTypeLinks.map((link) => ({
      href: link.href,
      text: `${link.label} ${link.reason}`,
    }));
    if (!comparisonProjectionVisible(
      crossTypePayload,
      { kind: "cross_type_comparison", slug: "enfp-vs-entp" },
      crossTypeVisibleText,
      crossTypeAnchors,
    )) {
      throw new Error("Complete cross-type internal link unexpectedly failed");
    }
    if (comparisonProjectionVisible(
      crossTypePayload,
      { kind: "cross_type_comparison", slug: "enfp-vs-entp" },
      crossTypeVisibleText,
      [
        { ...crossTypeAnchors[0], href: "/zh/personality/enfp-vs-entp" },
        ...crossTypeAnchors.slice(1),
      ],
    )) {
      throw new Error("Misdirected cross-type internal link unexpectedly passed");
    }
    return;
  }
  if (name === "comparison-summary-runtime-selection") {
    const payload = {
      answer_surface_v1: {
        summary_blocks: [
          { title: "First summary", body: "First summary body." },
          { title: "Second summary", body: "Second summary body." },
        ],
        faq_blocks: [{ q: "Aliased question?", a: "Aliased answer." }],
        compare_blocks: [{ title: "Comparison", body: "Comparison body." }],
        next_step_blocks: [
          {
            title: "Next step",
            body: "Next step body.",
            href: "/zh/tests/mbti-personality-test-16-personality-types",
          },
          {
            title: "Linkless reflection",
            body: "Pause and note the contrast.",
          },
        ],
      },
    };
    const visibleText = [
      "First summary body.",
      "Comparison",
      "Comparison body.",
      "Next step",
      "Next step body.",
      "Linkless reflection",
      "Pause and note the contrast.",
    ].join(" ");
    const visibleAnchors = [{
      text: "Next step",
      href: "/zh/tests/mbti-personality-test-16-personality-types",
    }];
    if (!answerSurfaceVisible(payload, "at_comparison", visibleText, visibleAnchors)) {
      throw new Error("Runtime-selected comparison summary unexpectedly failed");
    }
    const aliasedFaq = apiFaq(payload, "profile");
    if (
      aliasedFaq.length !== 1
      || aliasedFaq[0]?.question !== "Aliased question?"
      || aliasedFaq[0]?.answer !== "Aliased answer."
    ) {
      throw new Error("Runtime-supported FAQ aliases were not preserved");
    }
    if (answerSurfaceVisible(
      payload,
      "at_comparison",
      visibleText.replace("First summary body.", ""),
      visibleAnchors,
    )) {
      throw new Error("Missing runtime-selected comparison summary unexpectedly passed");
    }
    return;
  }
  if (name === "profile-reader-section-membership") {
    const sections = [
      ...PROFILE_LEADING_PROJECTION_SECTION_KEYS.map((key) => ({ key })),
      ...PROFILE_V85_VISIBLE_SECTION_KEYS.map((section_key) => ({ section_key })),
    ];
    sections[sections.length - 1] = {
      section_key: PROFILE_V85_VISIBLE_SECTION_KEYS[0],
    };
    if (profileReaderSectionMembershipValid(sections)) {
      throw new Error("Duplicate profile reader section key unexpectedly passed");
    }
    return;
  }
  if (name === "profile-reader-internal-title") {
    const section = {
      section_key: "v8_5_thirty_second_overview",
      title: "Internal CMS operational title",
      body_md: "Reader-Visible Localized Body.",
    };
    if (!profileSectionVisible(section, "reader-visible localized body.")) {
      throw new Error("Localized reader body unexpectedly required the internal CMS title");
    }
    if (profileSectionVisible(section, "Different visible body.")) {
      throw new Error("Missing localized reader body unexpectedly passed");
    }
    return;
  }
  if (name === "profile-promoted-sections") {
    const faqSection = {
      section_key: "faq",
      is_enabled: true,
      payload_json: {
        items: [{
          question: "How should this profile be used?",
          answer: "Use it for reflection, not diagnosis or selection.",
        }],
      },
    };
    const sections = profileReaderVisibleSections({
      sections: [
        ...PROFILE_V85_VISIBLE_SECTION_KEYS.map((section_key) => ({
          section_key,
          is_enabled: true,
        })),
        { section_key: "related_content", is_enabled: true },
        faqSection,
        { section_key: "meaning", is_enabled: true },
        { section_key: "careers_work_style", is_enabled: false },
        { section_key: "quick_answer", is_enabled: true },
      ],
      mbti_public_projection_v1: {
        sections: PROFILE_LEADING_PROJECTION_SECTION_KEYS.map((key) => ({ key })),
      },
    });
    const keys = sections.map((section) => section?.key ?? section?.section_key);
    if (
      !keys.includes("related_content")
      || !keys.includes("faq")
      || !keys.includes("meaning")
      || keys.includes("careers_work_style")
      || keys.includes("quick_answer")
      || !profileReaderSectionMembershipValid(sections)
    ) {
      throw new Error("Runtime promoted profile section selection drifted");
    }
    const faqVisibleText = "How should this profile be used? Use it for reflection, not diagnosis or selection.";
    if (!profileSectionVisible(faqSection, faqVisibleText)) {
      throw new Error("Complete runtime profile FAQ unexpectedly failed");
    }
    if (profileSectionVisible(
      faqSection,
      faqVisibleText.replace("Use it for reflection, not diagnosis or selection.", ""),
    )) {
      throw new Error("Incomplete runtime profile FAQ unexpectedly passed");
    }
    return;
  }
  if (name === "structured-section-payload") {
    const section = {
      section_key: "mbti64_comparison_a_vs_t",
      title: "A/T 对比正文",
      payload_json: {
        content: {
          core_difference: {
            title: "核心差异",
            rows: [{
              dimension: "决策节奏",
              a_variant: "更快收束",
              t_variant: "继续校验",
            }],
          },
        },
        faq: [{ question: "应该如何使用？", answer: "用于复盘，不用于筛选。" }],
        internal_links: [{
          title: "阅读 INTJ-A",
          summary: "查看完整人格页",
          href: "/zh/personality/intj-a",
        }],
        raw_row: { method_boundary: "这是自我反思工具，不是诊断。" },
      },
    };
    const visibleText = [
      "A/T 对比正文",
      "核心差异",
      "决策节奏",
      "更快收束",
      "继续校验",
      "应该如何使用？",
      "用于复盘，不用于筛选。",
      "阅读 INTJ-A",
      "查看完整人格页",
      "这是自我反思工具，不是诊断。",
    ].join(" ");
    const anchors = [{ text: "阅读 INTJ-A 查看完整人格页", href: "/zh/personality/intj-a" }];
    if (!profileSectionVisible(section, visibleText, anchors)) {
      throw new Error("Complete structured comparison section unexpectedly failed");
    }
    if (profileSectionVisible(
      section,
      visibleText,
      [{ ...anchors[0], href: "/zh/personality/intj-t" }],
    )) {
      throw new Error("Misdirected structured section link unexpectedly passed");
    }
    if (profileSectionVisible(
      section,
      visibleText.replace("核心差异", ""),
      anchors,
    )) {
      throw new Error("Missing reader-visible structured content heading unexpectedly passed");
    }
    return;
  }
  if (name === "robots-header-indexability") {
    if (robotsIndexable({ robots: "index,follow", xRobotsTag: "none" })) {
      throw new Error("X-Robots-Tag none unexpectedly passed");
    }
    if (robotsIndexable({ robots: "index,follow", xRobotsTag: "nofollow" })) {
      throw new Error("X-Robots-Tag nofollow unexpectedly passed");
    }
    return;
  }
  if (name === "robots-meta-conflict") {
    const facts = documentFacts(`
      <html><head>
        <meta name="robots" content="index,follow">
        <meta name="robots" content="noindex,follow">
      </head><body></body></html>
    `);
    if (robotsIndexable(facts)) {
      throw new Error("Conflicting robots meta tags unexpectedly passed");
    }
    return;
  }
  if (name === "css-hidden-visibility") {
    const facts = documentFacts(`
      <html><body>
        <main><p>Visible reader content</p><div class="hidden">Hidden authority content</div></main>
      </body></html>
    `);
    if (facts.visibleText.includes("Hidden authority content")) {
      throw new Error("CSS-hidden content unexpectedly counted as visible");
    }
    return;
  }
  if (name === "frontend-revision-sequence") {
    const revision = "a".repeat(40);
    if (sameFrontendRevisionAcrossSequence({ frontend_revision: "b".repeat(40) }, revision, revision)) {
      throw new Error("Mixed frontend revisions unexpectedly passed");
    }
    return;
  }
  if (name === "profile-hero-visibility") {
    const projection = {
      display_type: "INTJ-A",
      profile: {
        type_name: "建筑师型",
        hero_summary: "先建立可靠结构，再稳定推进。",
        rarity: "较少见",
        keywords: ["战略", "独立", "坚定"],
      },
    };
    const incompleteVisibleText = "INTJ-A 建筑师人格 先建立可靠结构，再稳定推进。 稀有度：较少见 战略 独立";
    if (profileHeroVisible(projection, incompleteVisibleText)) {
      throw new Error("Incomplete profile hero unexpectedly passed");
    }
    const localizedHeroText = [
      "INTJ-A",
      "先建立可靠结构，再稳定推进。",
      "较少见",
      "战略",
      "独立",
      "坚定",
    ].join(" ");
    if (!profileHeroVisible(
      {
        ...projection,
        profile: {
          ...projection.profile,
          type_name: "Internal non-reader archetype",
        },
      },
      localizedHeroText,
    )) {
      throw new Error("Complete localized profile hero unexpectedly required the internal archetype");
    }
    return;
  }
  if (name === "comparison-robots-authority") {
    const payload = {
      seo_surface_v1: { robots_policy: "noindex,follow" },
      seo_meta: { robots: "index,follow" },
    };
    if (comparisonRobotsAuthorityPresent(payload, { robots: "index,follow" })) {
      throw new Error("Backend noindex comparison policy unexpectedly passed");
    }
    if (comparisonRobotsAuthorityPresent(
      {
        seo_surface_v1: { robots_policy: "index,follow" },
        seo_meta: { robots: "noindex,follow" },
      },
      { robots: "index,follow" },
    )) {
      throw new Error("Conflicting backend comparison robots policy unexpectedly passed");
    }
    return;
  }
  if (name === "profile-robots-authority") {
    const seoPayload = {
      meta: { robots: "index,follow" },
      surface: { robots_policy: "noindex,follow" },
    };
    if (profileRobotsAuthorityPresent(
      seoPayload,
      { seo_surface_v1: { robots_policy: "index,follow" } },
      { robots: "index,follow" },
    )) {
      throw new Error("Backend profile noindex policy unexpectedly passed");
    }
    if (profileRobotsAuthorityPresent(
      {
        meta: { robots: "index,follow" },
        surface: { robots_policy: "index,nofollow" },
      },
      { seo_surface_v1: { robots_policy: "index,follow" } },
      { robots: "index,follow" },
    )) {
      throw new Error("Backend profile nofollow policy unexpectedly passed");
    }
    return;
  }
  if (name === "profile-metadata-precedence") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const seoPayload = {
      meta: {
        title: "Legacy metadata title",
        description: "Legacy metadata description",
        canonical,
        alternates: {
          "zh-CN": canonical,
          en: canonical.replace("/zh/", "/en/"),
        },
        robots: "index,follow",
      },
      surface: {
        title: "Surface metadata title",
        description: "Surface metadata description",
        robots_policy: "index,follow",
      },
      jsonld: {
        "@type": "AboutPage",
        "@id": `${canonical}#webpage`,
        url: canonical,
      },
    };
    const pageFacts = {
      title: "Surface metadata title",
      description: "Surface metadata description",
      canonical,
      alternates: {
        ...seoPayload.meta.alternates,
        "x-default": `${SITE_ORIGIN}/`,
      },
      robots: "index,follow",
    };
    if (!profileSeoAuthorityPresent(seoPayload, {}, canonical, pageFacts)) {
      throw new Error("Runtime surface-first profile metadata unexpectedly failed");
    }
    if (profileSeoAuthorityPresent(
      seoPayload,
      {},
      canonical,
      { ...pageFacts, title: seoPayload.meta.title },
    )) {
      throw new Error("Superseded profile metadata title unexpectedly passed");
    }
    return;
  }
  if (name === "profile-seo-conflicting-identity") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const seoPayload = {
      meta: {
        title: "Profile title",
        description: "Profile description",
        canonical,
        alternates: {
          "zh-CN": canonical,
          en: canonical.replace("/zh/", "/en/"),
        },
        robots: "index,follow",
      },
      surface: {
        title: "Profile title",
        description: "Profile description",
        robots_policy: "index,follow",
      },
      jsonld: {
        "@type": "AboutPage",
        "@id": `${canonical}#webpage`,
        url: `${SITE_ORIGIN}/zh/personality/intp-a`,
      },
    };
    const pageFacts = {
      title: "Profile title",
      description: "Profile description",
      canonical,
      alternates: {
        ...seoPayload.meta.alternates,
        "x-default": `${SITE_ORIGIN}/`,
      },
      robots: "index,follow",
    };
    if (profileSeoAuthorityPresent(seoPayload, {}, canonical, pageFacts)) {
      throw new Error("Conflicting profile SEO endpoint identity unexpectedly passed");
    }
    return;
  }
  if (name === "answer-surface-placeholder-collections") {
    const surface = {
      summary_blocks: [{ title: "只有标题的摘要" }],
      faq_blocks: [{ question: "问题", answer: "回答" }],
      compare_blocks: [{ title: "只有标题的对比" }],
      next_step_blocks: [{ title: "下一步", body: "行动建议" }],
    };
    if (requiredAnswerSurfaceCollectionsPresent(surface, "at_comparison")) {
      throw new Error("Placeholder answer-surface collections unexpectedly passed");
    }
    return;
  }
  if (name === "canonical-link-conflict") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const facts = documentFacts(`
      <html><head>
        <link rel="canonical" href="${canonical}">
        <link rel="canonical" href="${SITE_ORIGIN}/zh/personality/intp-a">
      </head><body></body></html>
    `);
    if (canonicalLinkValid(facts, canonical)) {
      throw new Error("Conflicting canonical links unexpectedly passed");
    }
    return;
  }
  if (name === "hreflang-conflict") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const englishCanonical = canonical.replace("/zh/", "/en/");
    const facts = documentFacts(`
      <html><head>
        <link rel="alternate" hreflang="zh-CN" href="${canonical}">
        <link rel="alternate" hreflang="zh-CN" href="${SITE_ORIGIN}/zh/personality/intp-a">
        <link rel="alternate" hreflang="en" href="${englishCanonical}">
        <link rel="alternate" hreflang="x-default" href="${SITE_ORIGIN}/">
      </head><body></body></html>
    `);
    if (exactAlternateLinksPresent(facts, {
      "zh-CN": canonical,
      en: englishCanonical,
      "x-default": `${SITE_ORIGIN}/`,
    })) {
      throw new Error("Conflicting hreflang links unexpectedly passed");
    }
    return;
  }
  if (name === "faq-schema-conflict") {
    const expected = [{ question: "如何使用？", answer: "用于自我反思。" }];
    const schemaRows = [
      ...expected,
      { question: "如何使用？", answer: "用于人员筛选。" },
    ];
    if (faqSchemaMatches(expected, schemaRows)) {
      throw new Error("Conflicting FAQ schema rows unexpectedly passed");
    }
    return;
  }
  if (name === "faq-schema-unmatched") {
    const expected = [{ question: "如何使用？", answer: "用于自我反思。" }];
    const schemaRows = [
      ...expected,
      { question: "隐藏问题？", answer: "不应出现在 schema 中。" },
    ];
    if (faqSchemaMatches(expected, schemaRows)) {
      throw new Error("Unmatched FAQ schema row unexpectedly passed");
    }
    return;
  }
  if (name === "disabled-runtime-sections") {
    const sections = runtimeComparisonSections({
      sections: [
        { section_key: "enabled", is_enabled: true },
        { section_key: "disabled", is_enabled: false },
      ],
    });
    if (sections.length !== 1 || sections[0]?.section_key !== "enabled") {
      throw new Error("Disabled runtime comparison section was not filtered");
    }
    return;
  }
  if (name === "profile-hero-completeness") {
    if (profileHeroVisible(
      { display_type: "INTJ-A", profile: { type_name: "", keywords: [] } },
      "INTJ-A",
    )) {
      throw new Error("Incomplete profile hero authority unexpectedly passed");
    }
    return;
  }
  if (name === "feed-exact-url-membership") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const urls = feedEntryUrls("llms.txt", `- ${canonical}?preview=1`);
    if (urls.has(canonical)) {
      throw new Error("Query-bearing feed URL unexpectedly satisfied canonical membership");
    }
    return;
  }
  if (name === "feed-entry-declaration-membership") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a`;
    const other = `${SITE_ORIGIN}/zh/personality/intj-t`;
    const llmsFullBody = [
      `### [zh] Other | ${other}`,
      `- URL: ${other}`,
      `- Summary: Compare with ${canonical}`,
    ].join("\n");
    if (feedEntryUrls("llms-full.txt", llmsFullBody).has(canonical)) {
      throw new Error("Cited llms-full URL unexpectedly satisfied entry membership");
    }
    if (!allFeedUrls(llmsFullBody).has(canonical)) {
      throw new Error("Cited llms-full URL unexpectedly escaped leak inventory");
    }
    if (!feedEntryUrls("sitemap.xml", `<url><loc>${canonical}</loc></url>`).has(canonical)) {
      throw new Error("Sitemap loc entry unexpectedly failed membership");
    }
    return;
  }
  if (name === "validator-revision-sequence") {
    if (sameValidatorRevisionAcrossSequence(
      { validator_source_sha256: "a".repeat(64) },
      "b".repeat(64),
    )) {
      throw new Error("Mixed validator revisions unexpectedly passed");
    }
    return;
  }
  if (name === "run2-sequence-decision") {
    if (validationRunPassed(2, true, false)) {
      throw new Error("Non-consecutive run 2 unexpectedly passed");
    }
    if (!validationRunPassed(2, true, true)) {
      throw new Error("Consecutive run 2 unexpectedly failed");
    }
    return;
  }
  if (name === "hreflang-root-equivalence") {
    if (!exactAlternateLinksPresent({
      alternateLinks: [
        { locale: "zh-CN", href: `${SITE_ORIGIN}/zh/personality/intj-a` },
        { locale: "x-default", href: SITE_ORIGIN },
      ],
    }, {
      "zh-CN": `${SITE_ORIGIN}/zh/personality/intj-a`,
      "x-default": `${SITE_ORIGIN}/`,
    })) {
      throw new Error("Equivalent root hreflang URLs unexpectedly failed");
    }
    if (exactAlternateLinksPresent({
      alternateLinks: [
        { locale: "zh-CN", href: `${SITE_ORIGIN}/zh/personality/intj-a?preview=1` },
        { locale: "x-default", href: SITE_ORIGIN },
      ],
    }, {
      "zh-CN": `${SITE_ORIGIN}/zh/personality/intj-a`,
      "x-default": SITE_ORIGIN,
    })) {
      throw new Error("Query-bearing hreflang unexpectedly passed");
    }
    return;
  }
  if (name === "comparison-english-alternate-hold") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-vs-intp`;
    const expected = comparisonExpectedAlternates({
      alternates: { "zh-CN": canonical },
    }, canonical);
    if (!expected || Object.hasOwn(expected, "en")) {
      throw new Error("Backend-authoritative English alternate hold was not preserved");
    }
    if (!exactAlternateLinksPresent({
      alternateLinks: [
        { locale: "zh-CN", href: canonical },
        { locale: "x-default", href: SITE_ORIGIN },
      ],
    }, expected)) {
      throw new Error("Held English alternate set unexpectedly failed");
    }
    if (exactAlternateLinksPresent({
      alternateLinks: [
        { locale: "en", href: canonical.replace("/zh/", "/en/") },
        { locale: "zh-CN", href: canonical },
        { locale: "x-default", href: SITE_ORIGIN },
      ],
    }, expected)) {
      throw new Error("Frontend-invented English alternate unexpectedly passed");
    }
    return;
  }
  if (name === "at-comparison-list-authority") {
    const canonical = `${SITE_ORIGIN}/zh/personality/intj-a-vs-intj-t`;
    const target = { kind: "at_comparison", slug: "intj-a-vs-intj-t" };
    const item = {
      slug: target.slug,
      comparison_type: "mbti_at_comparison",
      base_type_code: "INTJ",
      locale: "zh-CN",
      public_route_type: "at-comparison",
      public_url: canonical,
      canonical_url: canonical,
      is_public: true,
      is_indexable: true,
      status: "published",
    };
    if (!atComparisonListAuthorityPresent(item, target, canonical)) {
      throw new Error("Valid A/T comparison list authority unexpectedly failed");
    }
    if (atComparisonListAuthorityPresent({ ...item, is_indexable: false }, target, canonical)) {
      throw new Error("Held A/T comparison list authority unexpectedly passed");
    }
    return;
  }
  if (name === "profile-seo-main-entity-identity") {
    const canonical = `${SITE_ORIGIN}/zh/personality/istj-a`;
    const seoPayload = {
      meta: {
        title: "ISTJ-A profile",
        description: "ISTJ-A profile description",
        canonical,
        alternates: {
          en: canonical.replace("/zh/", "/en/"),
          "zh-CN": canonical,
        },
        robots: "index,follow",
      },
      seo_surface_v1: {
        title: "ISTJ-A profile",
        description: "ISTJ-A profile description",
        robots_policy: "index,follow",
      },
      jsonld: {
        "@context": "https://schema.org",
        "@type": "AboutPage",
        mainEntityOfPage: canonical,
      },
    };
    const detailPayload = {
      mbti_public_projection_v1: { seo: { robots: "index,follow" } },
    };
    const pageFacts = {
      title: "ISTJ-A profile",
      description: "ISTJ-A profile description",
      canonical,
      robots: "index,follow",
      robotsDirectives: ["index,follow"],
      xRobotsTag: "",
      alternateLinks: [
        { locale: "en", href: canonical.replace("/zh/", "/en/") },
        { locale: "zh-CN", href: canonical },
        { locale: "x-default", href: SITE_ORIGIN },
      ],
    };
    if (!profileSeoAuthorityPresent(seoPayload, detailPayload, canonical, pageFacts)) {
      throw new Error("Canonical mainEntityOfPage authority unexpectedly failed");
    }
    if (profileSeoAuthorityPresent({
      ...seoPayload,
      jsonld: {
        ...seoPayload.jsonld,
        mainEntityOfPage: `${SITE_ORIGIN}/zh/personality/istj-t`,
      },
    }, detailPayload, canonical, pageFacts)) {
      throw new Error("Conflicting mainEntityOfPage authority unexpectedly passed");
    }
    return;
  }
  if (name === "description-conflict") {
    if (!exactDescriptionPresent({
      descriptions: ["Authoritative description"],
    }, "Authoritative description")) {
      throw new Error("Single authoritative description unexpectedly failed");
    }
    if (exactDescriptionPresent({
      descriptions: ["Authoritative description", "Stale description"],
    }, "Authoritative description")) {
      throw new Error("Conflicting description unexpectedly passed");
    }
    return;
  }
  if (name === "lock-owner-process-identity") {
    const owner = { pid: 1234, process_start_token: "start-a" };
    if (!lockOwnerMatchesObservedProcess(owner, 1234, "start-a")) {
      throw new Error("Matching lock process identity unexpectedly failed");
    }
    if (lockOwnerMatchesObservedProcess(owner, 1234, "start-b")) {
      throw new Error("Reused lock PID unexpectedly passed");
    }
    return;
  }
  if (name === "cross-llms-full-hold") {
    const released = {
      sitemap_eligible: true,
      llms_eligible: true,
    };
    if (!crossDiscoverabilityAuthorityPresent(released)) {
      throw new Error("Legacy released cross discoverability authority unexpectedly failed");
    }
    if (crossDiscoverabilityAuthorityPresent({
      ...released,
      llms_full_eligible: false,
    })) {
      throw new Error("Explicit backend llms-full hold unexpectedly passed");
    }
    return;
  }
  const inventory = targets();
  if (name === "duplicate") inventory[54] = { ...inventory[53] };
  else if (name === "missing") inventory.pop();
  else if (name === "extra") inventory.push({ kind: "cross_type_comparison", slug: "intp-vs-entp" });
  else {
    const checks = Object.fromEntries(CHECK_KEYS.map((key) => [key, true]));
    const record = {
      checks,
      authority_fingerprint_sha256: "a".repeat(64),
      source_revision_sha256: "b".repeat(64),
    };
    if (name === "section") record.checks.section_completeness = false;
    else if (name === "fingerprint") record.authority_fingerprint_sha256 = "";
    else if (name === "revision") record.checks.authority_fingerprint = false;
    else if (name === "membership") record.checks.llms_full = false;
    else throw new Error("Unknown MBTI-INDEX-52 contract probe");
    validateRecordEvidence(record);
    throw new Error("Invalid record probe unexpectedly passed");
  }
  validateInventory(inventory);
  throw new Error("Invalid inventory probe unexpectedly passed");
}

if (CONTRACT_PROBE) {
  runContractProbe(CONTRACT_PROBE);
  process.exit(0);
}
if (!ALLOW_NETWORK || RUN === null) {
  console.error("HOLD_MBTI_55_INCOMPLETE: pass --allow-network and --run=1 or --run=2");
  process.exit(2);
}

function normalizeText(value) {
  const fragment = JSDOM.fragment(String(value ?? ""));
  fragment.querySelectorAll("script, style, noscript").forEach((node) => node.remove());
  return String(fragment.textContent ?? "").replace(/\s+/g, " ").trim();
}

function sha256(value) {
  return crypto.createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function isTimeout(error) {
  const name = error instanceof Error ? error.name : "";
  const message = error instanceof Error ? error.message : String(error);
  return ["AbortError", "TimeoutError"].includes(name) || /timed?\s*out|timeout/i.test(message);
}

async function fetchBody(
  url,
  parseBody,
  timeoutMs = REQUEST_TIMEOUT_MS,
  extraHeaders = {},
  redirectMode = "follow",
) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const response = await fetch(url, {
        redirect: redirectMode,
        signal: AbortSignal.timeout(timeoutMs),
        headers: {
          "accept-encoding": "identity",
          "user-agent": "FermatMind MBTI INDEX-52 read-only release gate/1.0",
          ...extraHeaders,
        },
      });
      if (!response.ok) {
        const error = new Error(`${url} returned HTTP ${response.status}`);
        if (response.status < 500 || attempt === MAX_ATTEMPTS) throw error;
        lastError = error;
      } else {
        return await parseBody(response);
      }
    } catch (error) {
      lastError = error;
      if (attempt === MAX_ATTEMPTS) throw error;
    }
    await new Promise((resolve) => setTimeout(resolve, attempt * 500));
  }
  throw lastError;
}

async function fetchPage(url) {
  return fetchBody(url, async (response) => ({
    html: await response.text(),
    xRobotsTag: normalizeText(response.headers.get("x-robots-tag")).toLowerCase(),
  }), REQUEST_TIMEOUT_MS, {}, "manual");
}

async function fetchJson(url) {
  return fetchBody(url, async (response) => {
    const payload = await response.json();
    return payload?.data ?? payload;
  });
}

async function fetchFrontendRevision() {
  const payload = await fetchJson(`${SITE_ORIGIN}/revision`);
  const revision = normalizeText(payload?.revision);
  if (!/^[0-9a-f]{40}$/.test(revision)) {
    throw new Error("Production frontend revision is absent or malformed");
  }
  return revision;
}

async function fetchFeedOnce(name) {
  const url = FEED_URLS[name];
  if (!url) throw new Error(`Unsupported feed: ${name}`);
  const { stdout } = await execFileAsync("curl", [
    "--http1.1",
    "--fail",
    "--silent",
    "--show-error",
    "--max-time",
    "120",
    "--header",
    "Accept-Encoding: identity",
    url,
  ], {
    encoding: "utf8",
    maxBuffer: 10_000_000,
    signal: FEED_ABORT_CONTROLLER.signal,
    timeout: 125_000,
    killSignal: "SIGTERM",
  });
  return stdout;
}

async function fetchFeed(name) {
  let lastError;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt += 1) {
    try {
      const body = await fetchFeedOnce(name);
      if (feedEntryUrls(name, body).size < 55) {
        throw new Error(`${name} returned an incomplete canonical URL set`);
      }
      return body;
    } catch (error) {
      lastError = error;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 500));
      }
    }
  }
  throw lastError;
}

function documentFacts(html, xRobotsTag = "") {
  const dom = new JSDOM(html);
  const document = dom.window.document;
  const jsonld = [...document.querySelectorAll('script[type="application/ld+json"]')].map((node) => {
    try {
      return JSON.parse(node.textContent ?? "");
    } catch {
      return { __invalid_jsonld: true };
    }
  });
  const visibleBody = document.body?.cloneNode(true);
  visibleBody?.querySelectorAll(
    [
      "script",
      "style",
      "template",
      "noscript",
      "[hidden]",
      '[aria-hidden="true"]',
      'input[type="hidden"]',
      '[class~="hidden"]',
      '[class~="invisible"]',
      '[class~="sr-only"]',
      '[style*="display: none"]',
      '[style*="display:none"]',
      '[style*="visibility: hidden"]',
      '[style*="visibility:hidden"]',
    ].join(", "),
  ).forEach((node) => node.remove());
  const visibleAnchors = [...(visibleBody?.querySelectorAll("a[href]") ?? [])].map((node) => ({
    href: node.getAttribute("href") ?? "",
    text: normalizeText(node.textContent),
  }));
  const alternateLinks = [...document.querySelectorAll('link[rel~="alternate"][hreflang]')]
    .map((node) => ({
      locale: node.getAttribute("hreflang") ?? "",
      href: node.getAttribute("href") ?? "",
    }));
  const alternates = Object.fromEntries(
    alternateLinks
      .filter(({ locale, href }) => locale && href)
      .map(({ locale, href }) => [locale, href]),
  );
  const canonicalLinks = [...document.querySelectorAll('link[rel~="canonical"]')]
    .map((node) => node.getAttribute("href") ?? "");
  const descriptions = [...document.querySelectorAll('meta[name="description"]')]
    .map((node) => normalizeText(node.getAttribute("content")));
  const robotsDirectives = [...document.querySelectorAll('meta[name="robots"]')]
    .map((node) => (node.getAttribute("content") ?? "").toLowerCase());
  return {
    title: normalizeText(document.title),
    description: descriptions[0] ?? "",
    descriptions,
    canonical: canonicalLinks[0] ?? "",
    canonicalLinks,
    alternates,
    alternateLinks,
    robots: robotsDirectives[0] ?? "",
    robotsDirectives,
    xRobotsTag,
    visibleText: normalizeText(visibleBody?.textContent ?? ""),
    visibleAnchors,
    jsonld,
  };
}

function canonicalLinkValid(facts, canonical) {
  return facts?.canonicalLinks?.length === 1 && facts.canonicalLinks[0] === canonical;
}

function exactAlternateLinksPresent(facts, expectedAlternates) {
  const links = Array.isArray(facts?.alternateLinks)
    ? facts.alternateLinks
    : Object.entries(facts?.alternates ?? {}).map(([locale, href]) => ({ locale, href }));
  const expected = Object.entries(expectedAlternates);
  return links.length === expected.length
    && expected.every(([locale, href]) => (
      links.filter((link) => (
        link.locale === locale && equivalentAbsoluteUrl(link.href, href)
      )).length === 1
    ));
}

function exactDescriptionPresent(facts, expectedDescription) {
  const descriptions = Array.isArray(facts?.descriptions)
    ? facts.descriptions
    : [facts?.description ?? ""];
  return descriptions.length === 1 && descriptions[0] === expectedDescription;
}

function equivalentAbsoluteUrl(left, right) {
  try {
    return new URL(left).href === new URL(right).href;
  } catch {
    return false;
  }
}

function robotsIndexable(facts) {
  const directives = Array.isArray(facts?.robotsDirectives)
    ? facts.robotsDirectives
    : [facts?.robots ?? ""];
  return directives.length > 0
    && directives.every(robotsSourceAllowsIndex)
    && !/(?:^|[\s,])(?:noindex|nofollow|none)(?:[\s,]|$)/.test(facts.xRobotsTag);
}

function robotsSourceAllowsIndex(value) {
  const robots = normalizeText(value).toLowerCase();
  return /(?:^|[\s,])index(?:[\s,]|$)/.test(robots)
    && /(?:^|[\s,])follow(?:[\s,]|$)/.test(robots)
    && !/(?:^|[\s,])(?:noindex|nofollow|none)(?:[\s,]|$)/.test(robots);
}

function comparisonRobotsAuthorityPresent(payload, pageFacts) {
  const robotsPolicies = [
    payload?.seo_surface_v1?.robots_policy,
    payload?.seo_meta?.robots,
  ].filter((value) => nonemptyString(value));
  return robotsPolicies.length > 0
    && robotsPolicies.every((robotsPolicy) => robotsIndexable({
      robots: normalizeText(robotsPolicy).toLowerCase(),
      xRobotsTag: "",
    }))
    && robotsIndexable({ robots: pageFacts?.robots ?? "", xRobotsTag: "" });
}

function profileRobotsAuthorityPresent(seoPayload, detailPayload, pageFacts) {
  const metaRobots = normalizeText(seoPayload?.meta?.robots).toLowerCase();
  const additionalRobotsSources = [
    seoPayload?.seo_surface_v1?.robots_policy
      ?? seoPayload?.surface?.robots_policy
      ?? seoPayload?.surface?.robotsPolicy,
    detailPayload?.seo_surface_v1?.robots_policy,
    detailPayload?.mbti_public_projection_v1?.seo?.robots,
    detailPayload?.seo_meta?.robots,
  ].filter((value) => nonemptyString(value));
  return robotsIndexable({ robots: metaRobots, xRobotsTag: "" })
    && additionalRobotsSources.every(robotsSourceAllowsIndex)
    && robotsIndexable({ robots: pageFacts?.robots ?? "", xRobotsTag: "" });
}

function sameFrontendRevisionAcrossSequence(previousRun, revisionAtStart, revisionAtEnd) {
  return /^[0-9a-f]{40}$/.test(revisionAtStart)
    && revisionAtStart === revisionAtEnd
    && (
      previousRun === null
      || previousRun?.frontend_revision === revisionAtStart
    );
}

function sameValidatorRevisionAcrossSequence(previousRun, validatorSourceSha256) {
  return /^[0-9a-f]{64}$/.test(validatorSourceSha256)
    && previousRun?.validator_source_sha256 === validatorSourceSha256;
}

function validationRunPassed(run, aggregatePassed, consecutivePass) {
  return run === 1 ? aggregatePassed : aggregatePassed && consecutivePass;
}

function walkJson(value, visit) {
  if (!value || typeof value !== "object") return;
  visit(value);
  Object.values(value).forEach((child) => {
    if (Array.isArray(child)) child.forEach((item) => walkJson(item, visit));
    else walkJson(child, visit);
  });
}

function structuredFacts(blocks) {
  const types = new Set();
  const faq = [];
  const pageIdentities = [];
  const breadcrumbTrails = [];
  let invalid = false;
  blocks.forEach((block) => walkJson(block, (node) => {
    if (node.__invalid_jsonld) invalid = true;
    const nodeTypes = Array.isArray(node["@type"]) ? node["@type"] : [node["@type"]];
    nodeTypes.filter(Boolean).forEach((type) => types.add(String(type)));
    if (nodeTypes.some((type) => ["AboutPage", "WebPage", "CollectionPage"].includes(type))) {
      pageIdentities.push({
        types: nodeTypes,
        id: normalizeText(node["@id"]),
        url: normalizeText(node.url),
        mainEntityOfPage: normalizeText(
          typeof node.mainEntityOfPage === "string"
            ? node.mainEntityOfPage
            : (node.mainEntityOfPage?.["@id"] ?? node.mainEntityOfPage?.url),
        ),
      });
    }
    if (nodeTypes.includes("BreadcrumbList") && Array.isArray(node.itemListElement)) {
      const trail = node.itemListElement
        .map((item) => {
          const target = item?.item;
          return normalizeText(
            typeof target === "string"
              ? target
              : (target?.["@id"] ?? target?.url ?? item?.url),
          );
        })
        .filter(Boolean);
      breadcrumbTrails.push(trail);
    }
    if (node["@type"] !== "FAQPage" || !Array.isArray(node.mainEntity)) return;
    node.mainEntity.forEach((question) => faq.push({
      question: normalizeText(question?.name),
      answer: normalizeText(question?.acceptedAnswer?.text),
    }));
  }));
  return {
    types: [...types].sort(),
    faq,
    pageIdentities,
    breadcrumbTrails,
    invalid,
  };
}

function faqSchemaMatches(expectedRows, schemaRows) {
  if (!Array.isArray(expectedRows) || expectedRows.length === 0 || !Array.isArray(schemaRows)) {
    return false;
  }
  const rowsByQuestion = new Map();
  schemaRows.forEach((row) => {
    const matches = rowsByQuestion.get(row.question) ?? [];
    matches.push(row.answer);
    rowsByQuestion.set(row.question, matches);
  });
  if ([...rowsByQuestion.values()].some((answers) => answers.length !== 1)) return false;
  return rowsByQuestion.size === expectedRows.length && expectedRows.every((row) => (
    rowsByQuestion.get(row.question)?.[0] === row.answer
  ));
}

function comparisonProjection(payload) {
  return payload?.comparison_public_projection_v1 ?? payload?.comparison ?? {};
}

function runtimeSectionFaq(payload, kind) {
  if (kind !== "at_comparison") return [];
  return runtimeComparisonSections(payload)
    .filter((section) => section?.is_enabled !== false)
    .flatMap((section) => {
      const sectionKey = section?.section_key ?? section?.key;
      const sectionPayload = section?.payload_json ?? section?.payload ?? {};
      const rows = sectionKey === "mbti64_comparison_a_vs_t"
        ? sectionPayload?.faq
        : (sectionKey === "faq" ? sectionPayload?.items : []);
      return (Array.isArray(rows) ? rows : []).map((row) => ({
        question: normalizeText(row?.question ?? row?.q),
        answer: normalizeText(row?.answer ?? row?.a),
      }));
    })
    .filter((row) => row.question && row.answer);
}

function apiFaq(payload, kind) {
  const primaryRows = kind === "profile"
    ? []
    : comparisonProjection(payload)?.faq;
  const answerSurfaceRows = payload?.answer_surface_v1?.faq_blocks;
  const rows = [
    ...(Array.isArray(primaryRows) ? primaryRows : []),
    ...runtimeSectionFaq(payload, kind),
    ...(Array.isArray(answerSurfaceRows) ? answerSurfaceRows : []),
  ];
  const deduped = new Map();
  rows.map((row) => ({
      question: normalizeText(row?.question ?? row?.q),
      answer: normalizeText(row?.answer ?? row?.a),
    }))
    .filter((row) => row.question && row.answer)
    .forEach((row) => {
      if (!deduped.has(row.question)) deduped.set(row.question, row);
    });
  return [...deduped.values()];
}

function apiSections(payload, kind) {
  const rows = kind === "profile" ? payload?.sections : comparisonProjection(payload)?.sections;
  return Array.isArray(rows) ? rows : [];
}

function runtimeComparisonSections(payload) {
  return Array.isArray(payload?.sections)
    ? payload.sections.filter((section) => section?.is_enabled !== false)
    : [];
}

function nonemptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function validSha256(value) {
  return typeof value === "string" && /^[0-9a-f]{64}$/.test(value);
}

function collectTextLeaves(value, results = []) {
  if (typeof value === "string") {
    const normalized = normalizeMarkdownText(value);
    if (normalized) results.push(normalized);
  } else if (Array.isArray(value)) {
    value.forEach((item) => collectTextLeaves(item, results));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((item) => collectTextLeaves(item, results));
  }
  return results;
}

function normalizeMarkdownText(value) {
  return normalizeText(value)
    .replace(/!\[([^\]]*)\]\([^)]+\)/g, "$1")
    .replace(/\[([^\]]+)\]\([^)]+\)/g, "$1")
    .replace(/^(?:[-+*]|\d+[.)])\s+/g, "")
    .replace(/[*_~`]+/g, "")
    .replace(/[#>|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function markdownContentBlocks(value) {
  return String(value ?? "")
    .split(/\n+/)
    .map((block) => normalizeMarkdownText(block))
    .map((block) => {
      if (/^Strengths$/i.test(block)) return "优势";
      if (/^Watch-outs$/i.test(block)) return "注意风险";
      return block;
    })
    .filter((block) => block.length >= 2);
}

function normalizeComparableText(value) {
  return normalizeText(value)
    .toLocaleLowerCase("en-US")
    .replace(/([。！？.!?：；，,])\s+/g, "$1");
}

function contentBodyCandidate(value) {
  if (typeof value === "string") return normalizeText(value);
  if (!value || typeof value !== "object" || Array.isArray(value)) return "";
  return normalizeText(value?.body ?? value?.summary ?? value?.text ?? value?.answer);
}

function runtimeLinkEvidence(items) {
  return (Array.isArray(items) ? items : []).flatMap((item) => {
    if (!item || typeof item !== "object" || item?.safe_public_route === false) return [];
    const label = normalizeText(item?.title ?? item?.label ?? item?.anchor_text);
    if (!label) return [];
    const summary = normalizeText(item?.summary ?? item?.body ?? item?.reason);
    const explicitHref = normalizeText(item?.href ?? item?.path);
    const slug = normalizeText(item?.slug);
    const href = explicitHref
      ? normalizePublicHref(explicitHref)
      : (slug ? normalizePublicHref(`/zh/personality/${slug}`) : "");
    if (
      explicitHref
      && (
        !href
        || new URL(href).origin !== SITE_ORIGIN
        || !/^\/(?:zh|en)\/personality\//.test(new URL(href).pathname)
      )
    ) {
      return [];
    }
    return [{ label, summary, href }];
  });
}

function runtimeLinksVisible(linkEvidence, visibleText, visibleAnchors) {
  return linkEvidence.every(({ label, summary, href }) => (
    visibleCandidates([label, ...(summary ? [summary] : [])], visibleText)
    && (
      !href
      || visibleAnchors.some((anchor) => (
        normalizePublicHref(anchor?.href) === href
        && normalizeComparableText(anchor?.text).includes(normalizeComparableText(label))
      ))
    )
  ));
}

function faqCandidates(items) {
  return (Array.isArray(items) ? items : []).flatMap((item) => [
    normalizeText(item?.question ?? item?.q),
    normalizeText(item?.answer ?? item?.a),
  ]).filter(Boolean);
}

function boundaryCandidates(payload) {
  const rawRow = payload?.raw_row ?? {};
  const structuredMetadata = payload?.structured_metadata ?? {};
  return [
    normalizeText(rawRow?.method_boundary ?? structuredMetadata?.method_boundary),
    normalizeText(rawRow?.trademark_boundary ?? structuredMetadata?.trademark_boundary),
  ].filter(Boolean);
}

function recommendationPayload(payload) {
  const rawRow = payload?.raw_row ?? {};
  return payload?.recommendation
    ?? rawRow?.recommendations
    ?? payload?.raw_row
    ?? payload?.raw
    ?? payload;
}

function readerExperienceCandidates(payload) {
  const recommendation = recommendationPayload(payload) ?? {};
  const readerExperience = recommendation?.reader_experience ?? {};
  const geoSummary = recommendation?.geo_summary ?? {};
  const aiSearchAnswer = readerExperience?.ai_search_answer
    ?? geoSummary?.ai_search_answer_block
    ?? {};
  const recordCards = [
    aiSearchAnswer,
    readerExperience?.at_difference_scenarios,
    readerExperience?.work_decision_card,
    readerExperience?.relationship_communication_card,
    readerExperience?.pressure_growth_card,
  ];
  const titledCards = [
    ...(Array.isArray(readerExperience?.strengths) ? readerExperience.strengths : []),
    ...(Array.isArray(readerExperience?.watch_outs) ? readerExperience.watch_outs : []),
  ];
  const modules = Array.isArray(recommendation?.modules) ? recommendation.modules : [];
  return [
    ...(Array.isArray(readerExperience?.thirty_second_overview)
      ? readerExperience.thirty_second_overview.map(normalizeText)
      : []),
    ...recordCards.flatMap((card) => (
      card && typeof card === "object"
        ? Object.values(card).map(contentBodyCandidate)
        : []
    )),
    ...titledCards.flatMap((card) => [
      normalizeText(card?.title),
      normalizeText(card?.detail ?? card?.body ?? card?.summary),
    ]),
    ...modules.flatMap((module) => [
      normalizeText(module?.title),
      normalizeText(module?.insight),
      ...(Array.isArray(module?.paragraphs) ? module.paragraphs.map(normalizeText) : []),
    ]),
    ...faqCandidates(recommendation?.faq),
  ].filter(Boolean);
}

function sourceLedgerCandidates(payload) {
  const rows = [
    ...(Array.isArray(payload?.raw_row?.source_ledger) ? payload.raw_row.source_ledger : []),
    ...(Array.isArray(payload?.structured_metadata?.source_ledger)
      ? payload.structured_metadata.source_ledger
      : []),
  ];
  return rows.flatMap((row) => {
    const source = normalizeText(row?.source);
    const title = normalizeText(row?.title);
    const id = normalizeText(row?.id);
    const note = normalizeText(row?.limitation ?? row?.claim)
      || "用于说明本页解释边界。";
    const haystack = `${id} ${source} ${title}`.toLowerCase();
    let visibleSource = title || "来源说明";
    let includeRawNote = true;
    if (haystack.includes("mccrae") || haystack.includes("costa") || haystack.includes("five-factor")) {
      visibleSource = "McCrae & Costa";
      includeRawNote = false;
    } else if (haystack.includes("pittenger") || haystack.includes("cautionary comments")) {
      visibleSource = "Pittenger";
      includeRawNote = false;
    } else if (haystack.includes("holland") || haystack.includes("vocational choices")) {
      visibleSource = "Holland";
      includeRawNote = false;
    } else if (haystack.includes("fermatmind") || haystack.includes("content contract")) {
      visibleSource = "费马测试内容边界";
      includeRawNote = false;
    }
    return [
      visibleSource,
      ...(!includeRawNote ? [normalizeText(row?.year)] : []),
      ...(includeRawNote ? [note] : []),
    ];
  }).filter(Boolean);
}

function comparisonSectionEvidence(section) {
  const payload = section?.payload_json ?? {};
  const content = payload?.content && typeof payload.content === "object"
    ? payload.content
    : {};
  const candidates = Object.values(content).flatMap((value) => {
    const record = value && typeof value === "object" && !Array.isArray(value) ? value : {};
    const rows = Array.isArray(record?.rows) ? record.rows : [];
    const title = normalizeText(record?.h2 ?? record?.title);
    const rowCandidates = rows.flatMap((row) => [
      normalizeText(row?.dimension),
      normalizeText(row?.a_variant ?? row?.assertive ?? row?.a),
      normalizeText(row?.t_variant ?? row?.turbulent ?? row?.t),
    ]).filter(Boolean);
    const body = contentBodyCandidate(value);
    if (rowCandidates.length === 0 && !body) return [];
    return [
      ...(title ? [title] : []),
      ...rowCandidates,
      ...(rowCandidates.length === 0 && body ? [body] : []),
    ];
  });
  const structuredCandidates = [
    ...candidates,
    ...faqCandidates(payload?.faq),
    ...boundaryCandidates(payload),
  ].filter(Boolean);
  const links = runtimeLinkEvidence(payload?.internal_links);
  const hasStructuredContent = structuredCandidates.length > 0 || links.length > 0;
  return {
    candidates: hasStructuredContent
      ? structuredCandidates
      : markdownContentBlocks(section?.body_md),
    links,
  };
}

function profileSectionEvidence(section) {
  const sectionKey = section?.section_key ?? section?.key;
  const payload = section?.payload_json ?? section?.payload ?? {};
  if (sectionKey === "letters_intro") {
    return {
      candidates: (Array.isArray(payload?.letters) ? payload.letters : []).flatMap((item) => [
        normalizeText(item?.letter),
        normalizeText(item?.title).replace(/\s*[（(][A-Z-]+[）)]\s*$/, ""),
        normalizeText(item?.description),
      ]).filter(Boolean),
      links: [],
    };
  }
  if (sectionKey === "trait_overview") {
    return {
      candidates: (Array.isArray(payload?.dimensions) ? payload.dimensions : []).flatMap((item) => [
        normalizeText(item?.summary),
        normalizeText(item?.description),
      ]).filter(Boolean),
      links: [],
    };
  }
  if (sectionKey === "mbti64_comparison_a_vs_t") {
    return comparisonSectionEvidence(section);
  }
  if (sectionKey === "related_content") {
    return {
      candidates: [],
      links: runtimeLinkEvidence([
        ...(Array.isArray(payload?.items) ? payload.items : []),
        ...(Array.isArray(payload?.links) ? payload.links : []),
      ]),
    };
  }
  if (sectionKey === "faq") {
    return {
      candidates: faqCandidates(payload?.items),
      links: [],
    };
  }
  if (sectionKey === "mbti64_promotion_metadata") {
    return {
      candidates: [
        ...boundaryCandidates(payload),
        ...sourceLedgerCandidates(payload),
      ],
      links: [],
    };
  }
  const raw = payload?.raw ?? {};
  const selectedBody = nonemptyString(section?.body_md)
    ? section.body_md
    : (nonemptyString(payload?.body) ? payload.body : raw?.body);
  let bodyCandidates = markdownContentBlocks(selectedBody);
  if (sectionKey === "v8_5_module_10_faq_boundary" && /FAQ|常见问题/.test(bodyCandidates[0] ?? "")) {
    bodyCandidates = bodyCandidates.slice(1);
  }
  const rawListCandidates = [
    raw?.items,
    raw?.strengths,
    raw?.blind_spots,
    raw?.watchouts,
    raw?.best_fit_environments,
    raw?.communication_tips,
  ].flatMap((items) => (Array.isArray(items) ? items.map(normalizeText) : []));
  const recommendation = recommendationPayload(payload) ?? {};
  const links = runtimeLinkEvidence(recommendation?.internal_links);
  const candidates = [
    ...bodyCandidates,
    ...rawListCandidates,
    ...readerExperienceCandidates(payload),
  ].filter(Boolean);
  if (candidates.length === 0 && nonemptyString(section?.body_html)) {
    candidates.push(normalizeText(section.body_html));
  }
  return { candidates, links };
}

function profileSectionVisible(section, visibleText, visibleAnchors = []) {
  const sectionKey = section?.section_key ?? section?.key;
  const { candidates, links } = profileSectionEvidence(section);
  const requiredCandidates = candidates;
  const comparableVisibleText = normalizeComparableText(visibleText);
  const missingCandidates = requiredCandidates.filter((value) => (
    !comparableVisibleText.includes(normalizeComparableText(value))
  ));
  if (missingCandidates.length > 0 && DIAGNOSE_VISIBLE_BODY) {
    console.error(JSON.stringify({
      section_key: sectionKey,
      candidate_count: requiredCandidates.length,
      missing_candidate_count: missingCandidates.length,
      missing_candidate_lengths: missingCandidates.map((value) => value.length),
      missing_candidate_prefixes: missingCandidates.map((value) => value.slice(0, 40)),
    }));
  }
  return nonemptyString(sectionKey)
    && (requiredCandidates.length > 0 || links.length > 0)
    && missingCandidates.length === 0
    && runtimeLinksVisible(links, visibleText, visibleAnchors);
}

function comparisonSectionVisible(section, visibleText) {
  const title = normalizeText(section?.title);
  if (title.length < 2 || !visibleText.includes(title)) return false;
  const expectedValues = [
    ...(Array.isArray(section?.body) ? section.body : [section?.body]),
    ...(Array.isArray(section?.rows) ? section.rows.flatMap((row) => Object.values(row ?? {})) : []),
  ].flatMap((value) => collectTextLeaves(value));
  return expectedValues.length > 0 && expectedValues.every((value) => visibleText.includes(value));
}

function visibleCandidates(candidates, visibleText) {
  const comparableVisibleText = normalizeComparableText(visibleText);
  return candidates.length > 0 && candidates.every((candidate) => (
    comparableVisibleText.includes(normalizeComparableText(candidate))
  ));
}

function comparisonVariantVisible(variant, visibleText) {
  if (!variant || typeof variant !== "object") return false;
  const summary = normalizeText(variant?.summary_card?.summary)
    || normalizeText(variant?.hero_summary)
    || normalizeText(variant?.seo?.description);
  const candidates = [
    normalizeText(variant?.runtime_type_code),
    normalizeText(variant?.type_name) || normalizeText(variant?.display_type),
    normalizeText(variant?.nickname),
    summary,
    normalizeText(variant?.rarity),
    ...(Array.isArray(variant?.keywords) ? variant.keywords.slice(0, 3).map(normalizeText) : []),
  ].filter(Boolean);
  return candidates.length >= 2 && visibleCandidates(candidates, visibleText);
}

function comparisonBlockVisible(block, visibleText) {
  if (!block || typeof block !== "object") return false;
  const key = normalizeText(block?.key);
  const title = normalizeText(block?.title) || key;
  const assertive = normalizeText(block?.variants?.a);
  const turbulent = normalizeText(block?.variants?.t);
  const body = normalizeText(block?.body_md);
  const candidates = [
    title,
    assertive || body,
    turbulent,
  ].filter(Boolean);
  const templateKeywords = [
    "misread", "confus", "mistake", "risk", "watchout", "误", "混淆", "误判", "风险",
    "scenario", "work", "career", "relationship", "communication", "social", "love",
    "stress", "pressure", "场景", "工作", "职业", "关系", "沟通", "压力",
  ];
  if (body && templateKeywords.some((keyword) => `${key} ${title}`.toLowerCase().includes(keyword))) {
    candidates.push(body);
  }
  return Boolean(key)
    && candidates.length >= 2
    && visibleCandidates(candidates, visibleText);
}

function normalizePublicHref(value) {
  try {
    return new URL(String(value ?? ""), SITE_ORIGIN).href;
  } catch {
    return "";
  }
}

function comparisonInternalLinksVisible(projection, target, visibleText, visibleAnchors) {
  const links = Array.isArray(projection?.internal_links) ? projection.internal_links : [];
  const expectedLinkCount = RELEASED_CROSS_TYPE.includes(target.slug) ? 7 : 5;
  return links.length === expectedLinkCount && links.every((link) => {
    const label = normalizeText(link?.label);
    const reason = normalizeText(link?.reason);
    const href = normalizePublicHref(link?.href);
    const matchingAnchor = visibleAnchors.find((anchor) => (
      normalizePublicHref(anchor?.href) === href
      && normalizeComparableText(anchor?.text).includes(normalizeComparableText(label))
      && (!reason || normalizeComparableText(anchor?.text).includes(normalizeComparableText(reason)))
    ));
    return Boolean(label)
      && Boolean(href)
      && visibleCandidates([label, ...(reason ? [reason] : [])], visibleText)
      && Boolean(matchingAnchor);
  });
}

function comparisonProjectionVisible(payload, target, visibleText, visibleAnchors = []) {
  const projection = comparisonProjection(payload);
  const claimBoundary = normalizeText(projection?.claim_boundary);
  if (!claimBoundary || !visibleCandidates([claimBoundary], visibleText)) return false;
  if (target.kind === "cross_type_comparison") {
    return comparisonInternalLinksVisible(projection, target, visibleText, visibleAnchors);
  }
  if (target.kind !== "at_comparison") return true;
  const variants = projection?.variants;
  const blocks = Array.isArray(projection?.comparison_blocks)
    ? projection.comparison_blocks
    : [];
  return comparisonVariantVisible(variants?.a, visibleText)
    && comparisonVariantVisible(variants?.t, visibleText)
    && blocks.length > 0
    && blocks.every((block) => comparisonBlockVisible(block, visibleText));
}

function answerSurfaceBlockCandidates(block, { includeTitle = true, includeBody = true } = {}) {
  const title = normalizeText(block?.title);
  const body = normalizeText(block?.body);
  const href = normalizeText(block?.href);
  const linkLabel = title || (
    href.includes("/tests/mbti-personality-test-16-personality-types")
      ? "MBTI免费测试"
      : href
  );
  return [
    ...(includeTitle && linkLabel ? [linkLabel] : []),
    ...(includeBody && body ? [body] : []),
  ];
}

function requiredAnswerSurfaceCollectionsPresent(surface, kind) {
  const requiredCollections = kind === "profile"
    ? ["summary_blocks", "faq_blocks", "compare_blocks", "scene_summary_blocks", "next_step_blocks"]
    : ["summary_blocks", "faq_blocks", "compare_blocks", "next_step_blocks"];
  return requiredCollections.every((key) => {
    const blocks = surface?.[key];
    if (!Array.isArray(blocks)) return false;
    return blocks.some((block) => {
      if (!block || typeof block !== "object" || Array.isArray(block)) return false;
      if (key === "faq_blocks") {
        return Boolean(
          normalizeText(block?.question ?? block?.q)
          && normalizeText(block?.answer ?? block?.a),
        );
      }
      if (key === "next_step_blocks") {
        return Boolean(
          normalizeText(block?.title)
          || normalizeText(block?.body)
          || normalizePublicHref(block?.href),
        );
      }
      if (kind !== "profile" && key === "summary_blocks") {
        return Boolean(normalizeText(block?.body));
      }
      if (kind !== "profile" && key === "compare_blocks") {
        return Boolean(normalizeText(block?.title) && normalizeText(block?.body));
      }
      return Boolean(normalizeText(block?.title) || normalizeText(block?.body));
    });
  });
}

function answerSurfaceLinksVisible(surface, visibleAnchors) {
  const linkedBlocks = [
    ...(Array.isArray(surface?.scene_summary_blocks) ? surface.scene_summary_blocks : []),
    ...(Array.isArray(surface?.next_step_blocks) ? surface.next_step_blocks : []),
  ];
  return linkedBlocks.every((block) => {
    const rawHref = normalizeText(block?.href);
    if (!rawHref) return true;
    const href = normalizePublicHref(rawHref);
    const label = normalizeText(block?.title) || rawHref;
    return Boolean(href)
      && Boolean(label)
      && visibleAnchors.some((anchor) => (
        normalizePublicHref(anchor?.href) === href
        && normalizeComparableText(anchor?.text).includes(normalizeComparableText(label))
      ));
  });
}

function answerSurfaceVisible(payload, kind, visibleText, visibleAnchors = []) {
  const surface = payload?.answer_surface_v1;
  if (
    !surface
    || typeof surface !== "object"
    || !requiredAnswerSurfaceCollectionsPresent(surface, kind)
  ) {
    return false;
  }

  let candidates = [];
  if (kind === "profile") {
    candidates = [
      ...(Array.isArray(surface.summary_blocks) ? surface.summary_blocks : []),
      ...(Array.isArray(surface.compare_blocks) ? surface.compare_blocks : []),
      ...(Array.isArray(surface.scene_summary_blocks) ? surface.scene_summary_blocks : []),
      ...(Array.isArray(surface.next_step_blocks) ? surface.next_step_blocks : []),
    ].map((block) => answerSurfaceBlockCandidates(block));
  } else {
    const summaryBlocks = Array.isArray(surface.summary_blocks) ? surface.summary_blocks : [];
    const selectedSummaryBody = summaryBlocks
      .map((block) => normalizeText(block?.body))
      .find(Boolean);
    const comparisonCards = [
      ...(Array.isArray(surface.compare_blocks) ? surface.compare_blocks : []),
      ...(Array.isArray(surface.scene_summary_blocks) ? surface.scene_summary_blocks : []),
    ].filter((block) => normalizeText(block?.title) && normalizeText(block?.body));
    candidates = [
      ...(selectedSummaryBody ? [[selectedSummaryBody]] : []),
      ...comparisonCards.map((block) => answerSurfaceBlockCandidates(block)),
      ...(Array.isArray(surface.next_step_blocks) ? surface.next_step_blocks : [])
        .map((block) => answerSurfaceBlockCandidates(block)),
    ];
  }

  const comparableVisibleText = normalizeComparableText(visibleText);
  return candidates.every((blockCandidates) => (
    blockCandidates.length > 0
    && blockCandidates.every((value) => (
      comparableVisibleText.includes(normalizeComparableText(value))
    ))
  )) && answerSurfaceLinksVisible(surface, visibleAnchors);
}

function profileReaderVisibleSections(payload) {
  const rawSections = Array.isArray(payload?.sections) ? payload.sections : [];
  const projectionSections = Array.isArray(payload?.mbti_public_projection_v1?.sections)
    ? payload.mbti_public_projection_v1.sections
    : [];
  const v85Sections = rawSections.filter((section) => (
    section?.is_enabled !== false
    &&
    PROFILE_V85_VISIBLE_SECTION_KEYS.includes(section?.section_key)
  ));
  const leadingSections = projectionSections.filter((section) => (
    PROFILE_LEADING_PROJECTION_SECTION_KEYS.includes(section?.key)
  ));
  const supplementalSections = rawSections.filter((section) => {
    const sectionKey = section?.section_key;
    return section?.is_enabled !== false
      && !sectionKey?.startsWith("v8_5_")
      && sectionKey !== "quick_answer"
      && (
        sectionKey === "related_content"
        || sectionKey === "faq"
        || MBTI64_PROMOTED_DETAIL_SECTION_KEYS.has(sectionKey)
      );
  });
  return [...leadingSections, ...v85Sections, ...supplementalSections];
}

function profileReaderSectionMembershipValid(sections) {
  const expectedKeys = [
    ...PROFILE_LEADING_PROJECTION_SECTION_KEYS,
    ...PROFILE_V85_VISIBLE_SECTION_KEYS,
  ];
  const actualKeys = sections.map((section) => section?.key ?? section?.section_key);
  return actualKeys.length >= expectedKeys.length
    && new Set(actualKeys).size === actualKeys.length
    && expectedKeys.every((key) => actualKeys.includes(key));
}

function profileHeroVisible(projection, visibleText) {
  const profile = projection?.profile ?? {};
  const requiredScalars = [
    normalizeText(projection?.display_type),
    normalizeText(profile?.hero_summary),
    normalizeText(profile?.rarity),
  ];
  const keywords = Array.isArray(profile?.keywords)
    ? profile.keywords.slice(0, 5).map(normalizeText).filter(Boolean)
    : [];
  if (requiredScalars.some((value) => !value) || keywords.length === 0) return false;
  const candidates = [
    ...requiredScalars,
    ...keywords,
  ];
  const comparableVisibleText = normalizeComparableText(visibleText);
  const missingCandidates = candidates.filter((candidate) => (
    !comparableVisibleText.includes(normalizeComparableText(candidate))
  ));
  if (missingCandidates.length > 0 && DIAGNOSE_VISIBLE_BODY) {
    console.error(JSON.stringify({
      hero_missing_candidates: missingCandidates,
    }));
  }
  return candidates.length > 0 && missingCandidates.length === 0;
}

function profileSeoAuthorityPresent(seoPayload, detailPayload, canonical, pageFacts) {
  if (!seoPayload || typeof seoPayload !== "object") return false;
  const meta = seoPayload?.meta ?? {};
  const surface = seoPayload?.seo_surface_v1 ?? seoPayload?.surface ?? {};
  const expectedTitle = normalizeText(surface?.title) || normalizeText(meta?.title);
  const expectedDescription = normalizeText(surface?.description) || normalizeText(meta?.description);
  const seoStructured = structuredFacts([seoPayload?.jsonld]);
  const aboutPageNodes = seoStructured.pageIdentities.filter(({ types }) => (
    types.includes("AboutPage")
  ));
  return nonemptyString(expectedTitle)
    && nonemptyString(expectedDescription)
    && meta?.canonical === canonical
    && meta?.alternates?.["zh-CN"] === canonical
    && meta?.alternates?.en === canonical.replace("/zh/", "/en/")
    && profileRobotsAuthorityPresent(seoPayload, detailPayload, pageFacts)
    && !seoStructured.invalid
    && aboutPageNodes.length > 0
    && aboutPageNodes.every(({ id, url, mainEntityOfPage }) => (
      (!id || id === canonical || id === `${canonical}#webpage`)
      && (!url || url === canonical)
      && (!mainEntityOfPage || mainEntityOfPage === canonical)
      && Boolean(id || url || mainEntityOfPage)
    ))
    && pageFacts?.title === expectedTitle
    && exactDescriptionPresent(pageFacts, expectedDescription)
    && pageFacts?.canonical === meta?.canonical
    && exactAlternateLinksPresent(pageFacts, {
      "zh-CN": meta?.alternates?.["zh-CN"],
      en: meta?.alternates?.en,
      "x-default": `${SITE_ORIGIN}/`,
    });
}

function comparisonIdentityPresent(comparison, target) {
  if (
    comparison?.comparison_slug !== target.slug
    || comparison?.locale !== "zh-CN"
  ) {
    return false;
  }
  if (target.kind === "at_comparison") {
    const baseType = target.slug.slice(0, 4).toUpperCase();
    return comparison?.base_type_code === baseType
      && comparison?.variants?.a?.base_type_code === baseType
      && comparison?.variants?.a?.runtime_type_code === `${baseType}-A`
      && comparison?.variants?.a?.variant_code === "A"
      && comparison?.variants?.a?.public_route_slug === `${baseType.toLowerCase()}-a`
      && comparison?.variants?.t?.base_type_code === baseType
      && comparison?.variants?.t?.runtime_type_code === `${baseType}-T`
      && comparison?.variants?.t?.variant_code === "T"
      && comparison?.variants?.t?.public_route_slug === `${baseType.toLowerCase()}-t`;
  }
  const [leftType, rightType] = target.slug.split("-vs-").map((value) => value.toUpperCase());
  return comparison?.comparison_type === "mbti_cross_type"
    && comparison?.left_type === leftType
    && comparison?.right_type === rightType
    && Array.isArray(comparison?.base_type_codes)
    && comparison.base_type_codes.length === 2
    && comparison.base_type_codes[0] === leftType
    && comparison.base_type_codes[1] === rightType;
}

function comparisonRenderedMetadataPresent(payload, pageFacts, canonical) {
  const comparison = comparisonProjection(payload);
  const title = normalizeText(payload?.seo_surface_v1?.title)
    || normalizeText(comparison?.title)
    || normalizeText(comparison?.seo_title)
    || normalizeText(payload?.seo_meta?.seo_title);
  const description = normalizeText(payload?.seo_surface_v1?.description)
    || normalizeText(comparison?.description)
    || normalizeText(comparison?.seo_description)
    || normalizeText(comparison?.summary)
    || normalizeText(payload?.seo_meta?.seo_description);
  const documentTitle = /FermatMind$/i.test(title) ? title : `${title} | FermatMind`;
  const expectedAlternates = comparisonExpectedAlternates(comparison, canonical);
  return Boolean(title)
    && Boolean(description)
    && expectedAlternates !== null
    && pageFacts?.title === documentTitle
    && exactDescriptionPresent(pageFacts, description)
    && exactAlternateLinksPresent(pageFacts, expectedAlternates)
    && comparisonRobotsAuthorityPresent(payload, pageFacts);
}

function comparisonExpectedAlternates(comparison, canonical) {
  const alternates = comparison?.alternates;
  if (!alternates || typeof alternates !== "object" || Array.isArray(alternates)) return null;
  const entries = Object.entries(alternates)
    .filter(([, href]) => nonemptyString(href));
  if (
    entries.some(([locale]) => !["en", "zh-CN"].includes(locale))
    || alternates["zh-CN"] !== canonical
    || (
      nonemptyString(alternates.en)
      && alternates.en !== canonical.replace("/zh/", "/en/")
    )
  ) {
    return null;
  }
  return {
    ...Object.fromEntries(entries),
    "x-default": SITE_ORIGIN,
  };
}

function atComparisonListAuthorityPresent(item, target, canonical) {
  const expectedBaseType = target.slug.slice(0, 4).toUpperCase();
  return item?.slug === target.slug
    && item?.comparison_type === "mbti_at_comparison"
    && item?.base_type_code === expectedBaseType
    && item?.locale === "zh-CN"
    && item?.public_route_type === "at-comparison"
    && item?.public_url === canonical
    && item?.canonical_url === canonical
    && item?.is_public === true
    && item?.is_indexable === true
    && item?.status === "published";
}

function crossDiscoverabilityAuthorityPresent(comparison) {
  return comparison?.sitemap_eligible === true
    && comparison?.llms_eligible === true
    && comparison?.llms_full_eligible !== false;
}

function authorityFacts(
  payload,
  target,
  canonical,
  seoPayload = null,
  pageFacts = null,
  comparisonListItem = null,
) {
  const sections = apiSections(payload, target.kind);
  if (target.kind === "profile") {
    const profile = payload?.profile ?? {};
    const projection = payload?.mbti_public_projection_v1 ?? {};
    const expectedTypeCode = target.slug.slice(0, 4).toUpperCase();
    const expectedVariantCode = target.slug.slice(-1).toUpperCase();
    const expectedRuntimeTypeCode = target.slug.toUpperCase();
    const revision = {
      id: profile.id,
      slug: profile.slug,
      schema_version: profile.schema_version,
      published_at: profile.published_at,
      updated_at: profile.updated_at,
    };
    const authority = {
      profile: {
        slug: profile.slug,
        status: profile.status,
        is_public: profile.is_public,
        is_indexable: profile.is_indexable,
      },
      sections,
      projection,
      answer_surface: payload?.answer_surface_v1,
      faq: payload?.answer_surface_v1?.faq_blocks,
      canonical: payload?.seo_meta?.canonical_url,
      robots: payload?.seo_meta?.robots,
      seo_endpoint: seoPayload,
    };
    const revisionPresent = Number.isInteger(profile.id)
      && profile.id > 0
      && profile.slug === target.slug.split("-")[0]
      && nonemptyString(profile.schema_version)
      && nonemptyString(profile.published_at)
      && nonemptyString(profile.updated_at)
      && projection.canonical_type_code === expectedTypeCode
      && projection.variant_code === expectedVariantCode
      && projection.runtime_type_code === expectedRuntimeTypeCode
      && projection.display_type === expectedRuntimeTypeCode
      && projection?._meta?.authority_source === "personality_cms_v2"
      && nonemptyString(projection?._meta?.schema_version)
      && Array.isArray(projection.sections)
      && projection.sections.length > 0
      && profileSeoAuthorityPresent(seoPayload, payload, canonical, pageFacts);
    return {
      present: profile.status === "published"
        && profile.is_public === true
        && profile.is_indexable === true
        && payload?.seo_meta?.canonical_url === canonical
        && profileSeoAuthorityPresent(seoPayload, payload, canonical, pageFacts),
      revisionPresent,
      sourceRevisionSha256: sha256(revision),
      authorityFingerprintSha256: sha256(authority),
    };
  }

  const comparison = comparisonProjection(payload);
  if (target.kind === "at_comparison") {
    const expectedOverlaySource = target.slug === "intp-a-vs-intp-t"
      ? "mbti-comp-runtime-46-intp-revision"
      : "mbti_cms_import_40_at_comparison_draft_v1";
    const expectedBaseType = target.slug.slice(0, 4).toUpperCase();
    const revision = {
      contract: comparison.comparison_contract_version,
      overlay_source: comparison.overlay_source,
      source_refs: comparison.source_refs,
    };
    const revisionPresent = comparison.comparison_contract_version === "mbti.at_comparison.v1.mbti64_overlay"
      && comparison.overlay_source?.source === expectedOverlaySource
      && nonemptyString(comparison.overlay_source?.snapshot_key)
      && comparison.overlay_source?.base_type_code === expectedBaseType
      && Array.isArray(comparison.source_refs)
      && comparison.source_refs.length > 0
      && comparison.source_refs.includes(comparison.overlay_source.snapshot_key);
    return {
      present: comparison.comparison_contract_version === "mbti.at_comparison.v1.mbti64_overlay"
        && comparison.overlay_source?.source === expectedOverlaySource
        && atComparisonListAuthorityPresent(comparisonListItem, target, canonical)
        && comparison.canonical_url === canonical
        && comparisonIdentityPresent(comparison, target)
        && comparisonRenderedMetadataPresent(payload, pageFacts, canonical),
      revisionPresent,
      sourceRevisionSha256: sha256(revision),
      authorityFingerprintSha256: sha256({
        list_authority: comparisonListItem,
        projection: comparison,
        sections: runtimeComparisonSections(payload),
        answer_surface: payload?.answer_surface_v1,
        seo_meta: payload?.seo_meta,
        seo_surface: payload?.seo_surface_v1,
        jsonld: payload?.jsonld,
      }),
    };
  }

  const approvedSourceSha256 = RELEASED_CROSS_SOURCE_SHA256[target.slug];
  const revisionPresent = validSha256(comparison.source_sha256)
    && (!approvedSourceSha256 || comparison.source_sha256 === approvedSourceSha256)
    && nonemptyString(comparison.indexability_status)
    && comparison.publish_status === "published"
    && Array.isArray(comparison.source_refs)
    && comparison.source_refs.length > 0;
  return {
    present: comparison.authority_source === "database"
      && comparison.publish_status === "published"
      && comparison.review_status === "approved"
      && comparison.is_public === true
      && comparison.is_indexable === true
      && crossDiscoverabilityAuthorityPresent(comparison)
      && comparison.canonical_url === canonical
      && comparisonIdentityPresent(comparison, target)
      && comparisonRenderedMetadataPresent(payload, pageFacts, canonical),
    revisionPresent,
    sourceRevisionSha256: sha256({
      source_sha256: comparison.source_sha256,
      indexability_status: comparison.indexability_status,
      publish_status: comparison.publish_status,
      source_refs: comparison.source_refs,
    }),
    authorityFingerprintSha256: sha256({
      projection: comparison,
      sections: runtimeComparisonSections(payload),
      answer_surface: payload?.answer_surface_v1,
      seo_meta: payload?.seo_meta,
      seo_surface: payload?.seo_surface_v1,
      jsonld: payload?.jsonld,
    }),
  };
}

function jsonLdValid(kind, structured, canonical) {
  if (structured.invalid) return false;
  const identityMatchesCanonical = ({ id, url }) => {
    const idPresent = nonemptyString(id);
    const urlPresent = nonemptyString(url);
    return (!idPresent || id === canonical || id === `${canonical}#webpage`)
      && (!urlPresent || url === canonical);
  };
  const canonicalIdentityPresent = structured.pageIdentities.some(({ id, url }) => (
    (nonemptyString(id) || nonemptyString(url))
    && identityMatchesCanonical({ id, url })
  ));
  const requiredPageTypes = kind === "profile"
    ? ["AboutPage", "WebPage"]
    : ["CollectionPage"];
  const requiredPageNodesMatch = requiredPageTypes.every((requiredType) => {
    const nodes = structured.pageIdentities.filter(({ types }) => types.includes(requiredType));
    return nodes.length > 0 && nodes.every(identityMatchesCanonical);
  });
  const allPageNodesMatch = structured.pageIdentities.length > 0
    && structured.pageIdentities.every(identityMatchesCanonical);
  const breadcrumbMatches = structured.breadcrumbTrails.length > 0
    && structured.breadcrumbTrails.every((trail) => (
      trail.length > 0 && trail.at(-1) === canonical
    ));
  if (
    !requiredPageNodesMatch
    || !allPageNodesMatch
    || !canonicalIdentityPresent
    || !breadcrumbMatches
  ) return false;
  if (kind === "profile") {
    return structured.types.includes("FAQPage")
      && structured.types.includes("BreadcrumbList")
      && requiredPageTypes.every((type) => structured.types.includes(type));
  }
  return ["CollectionPage", "ItemList", "BreadcrumbList", "FAQPage"]
    .every((type) => structured.types.includes(type));
}

function visibleBodyComplete(payload, target, visibleText, visibleAnchors = []) {
  const sections = apiSections(payload, target.kind);
  if (target.kind === "profile") {
    const readerVisibleSections = profileReaderVisibleSections(payload);
    const expectedReaderVisibleCount = PROFILE_LEADING_PROJECTION_SECTION_KEYS.length
      + PROFILE_V85_VISIBLE_SECTION_KEYS.length
      + Math.max(0, readerVisibleSections.length
        - PROFILE_LEADING_PROJECTION_SECTION_KEYS.length
        - PROFILE_V85_VISIBLE_SECTION_KEYS.length);
    const failedSectionKeys = readerVisibleSections
      .filter((section) => !profileSectionVisible(section, visibleText, visibleAnchors))
      .map((section) => section?.section_key ?? section?.key ?? "unknown");
    const complete = visibleText.length >= 5_000
      && profileReaderSectionMembershipValid(readerVisibleSections)
      && failedSectionKeys.length === 0
      && profileHeroVisible(payload?.mbti_public_projection_v1, visibleText)
      && answerSurfaceVisible(payload, target.kind, visibleText, visibleAnchors);
    if (!complete && DIAGNOSE_VISIBLE_BODY) {
      console.error(JSON.stringify({
        slug: target.slug,
        visible_text_length: visibleText.length,
        reader_visible_section_count: readerVisibleSections.length,
        expected_reader_visible_section_count: expectedReaderVisibleCount,
        failed_section_keys: failedSectionKeys,
        reader_section_membership_valid: profileReaderSectionMembershipValid(readerVisibleSections),
        hero_visible: profileHeroVisible(payload?.mbti_public_projection_v1, visibleText),
        answer_surface_visible: answerSurfaceVisible(
          payload,
          target.kind,
          visibleText,
          visibleAnchors,
        ),
      }));
    }
    return complete;
  }
  const runtimeSections = runtimeComparisonSections(payload);
  const requiredRuntimeSectionsPresent = target.kind !== "at_comparison"
    || runtimeSections.some((section) => (
      (section?.section_key ?? section?.key) === "mbti64_comparison_a_vs_t"
      && section?.is_enabled !== false
    ));
  return sections.length > 0
    && sections.every((section) => comparisonSectionVisible(section, visibleText))
    && requiredRuntimeSectionsPresent
    && runtimeSections.every((section) => profileSectionVisible(section, visibleText, visibleAnchors))
    && comparisonProjectionVisible(payload, target, visibleText, visibleAnchors)
    && answerSurfaceVisible(payload, target.kind, visibleText, visibleAnchors);
}

function normalizedFeedUrl(token) {
  const presentationTrimmed = token.trim().replace(/[.,;:!]+$/u, "");
  try {
    return new URL(presentationTrimmed).href;
  } catch {
    return presentationTrimmed;
  }
}

function allFeedUrls(body) {
  const tokens = body.match(/https:\/\/fermatmind\.com\/[^\s<>"'`)\]}]+/gi) ?? [];
  return new Set(tokens.map(normalizedFeedUrl));
}

function feedEntryUrls(name, body) {
  let tokens;
  if (name === "sitemap.xml") {
    tokens = [...body.matchAll(/<loc>\s*(https:\/\/fermatmind\.com\/[^<\s]+)\s*<\/loc>/gi)]
      .map((match) => match[1]);
  } else if (name === "llms.txt") {
    tokens = [...body.matchAll(/^\s*-\s+(https:\/\/fermatmind\.com\/\S+)\s*$/gim)]
      .map((match) => match[1]);
  } else if (name === "llms-full.txt") {
    tokens = [...body.matchAll(/^\s*-\s+URL:\s+(https:\/\/fermatmind\.com\/\S+)\s*$/gim)]
      .map((match) => match[1]);
  } else {
    throw new Error(`Unsupported feed: ${name}`);
  }
  return new Set(tokens.map(normalizedFeedUrl));
}

function writeFinalValidationHold(startedAt, sessionId = null) {
  const holdReport = {
    id: "MBTI-INDEX-52",
    artifact: "MBTI-INDEX-52-FULL-55-RELEASE-GATE",
    generated_at: startedAt,
    final_decision: "HOLD_MBTI_55_INCOMPLETE",
    gsc_dependency_unblocked: false,
    required_consecutive_runs: 2,
    completed_consecutive_runs: 0,
    validation_session_id: sessionId,
    target_count: 55,
    exact_new_targets: RELEASED_CROSS_TYPE,
    failure_reason: "validation_in_progress",
    records: [],
    safety_boundary: SAFETY_BOUNDARY,
  };
  fs.writeFileSync(ARTIFACT_PATHS.reportJson, `${JSON.stringify(holdReport, null, 2)}\n`);
  fs.writeFileSync(
    ARTIFACT_PATHS.reportMarkdown,
    [
      "# MBTI-INDEX-52 Full 55 URL Release Gate",
      "",
      "- Final decision: `HOLD_MBTI_55_INCOMPLETE`",
      "- Consecutive runs complete: `0/2`",
      "- Failure reason: `validation_in_progress`",
      "",
      "The previous ALLOW evidence is invalid while the current read-only validation is in progress.",
      "",
    ].join("\n"),
  );
  fs.writeFileSync(ARTIFACT_PATHS.reportCsv, "path,kind,result,blockers\n");
}

function writeRunValidationHold(startedAt, sessionId) {
  const holdRun = {
    id: "MBTI-INDEX-52",
    artifact: `MBTI-INDEX-52-FULL-55-RELEASE-GATE-RUN-${RUN}`,
    run: RUN,
    validation_session_id: sessionId,
    sequence_state: "in_progress",
    started_at: startedAt,
    completed_at: null,
    target_count: 55,
    evidence_scope: "read_only_production_network_revalidation",
    run_decision: "HOLD_MBTI_55_INCOMPLETE",
    failure_reason: "validation_in_progress",
    records: [],
  };
  fs.writeFileSync(
    RUN === 1 ? ARTIFACT_PATHS.run1 : ARTIFACT_PATHS.run2,
    `${JSON.stringify(holdRun, null, 2)}\n`,
  );
}

function writePreflightValidationFailure(startedAt, sessionId, error) {
  const completedAt = new Date().toISOString();
  const message = error instanceof Error ? error.message : String(error);
  const failureReason = `preflight_failed:${normalizeText(message).slice(0, 240)}`;
  const runReport = {
    id: "MBTI-INDEX-52",
    artifact: `MBTI-INDEX-52-FULL-55-RELEASE-GATE-RUN-${RUN}`,
    run: RUN,
    validation_session_id: sessionId,
    sequence_state: "failed",
    started_at: startedAt,
    completed_at: completedAt,
    target_count: 55,
    evidence_scope: "read_only_production_network_revalidation",
    run_decision: "HOLD_MBTI_55_INCOMPLETE",
    failure_reason: failureReason,
    validator_source_sha256: VALIDATOR_SOURCE_SHA256,
    records: [],
  };
  const finalReport = {
    id: "MBTI-INDEX-52",
    artifact: "MBTI-INDEX-52-FULL-55-RELEASE-GATE",
    generated_at: completedAt,
    final_decision: "HOLD_MBTI_55_INCOMPLETE",
    gsc_dependency_unblocked: false,
    required_consecutive_runs: 2,
    completed_consecutive_runs: 0,
    validation_session_id: sessionId,
    target_count: 55,
    exact_new_targets: RELEASED_CROSS_TYPE,
    failure_reason: failureReason,
    records: [],
    safety_boundary: SAFETY_BOUNDARY,
  };
  fs.writeFileSync(
    RUN === 1 ? ARTIFACT_PATHS.run1 : ARTIFACT_PATHS.run2,
    `${JSON.stringify(runReport, null, 2)}\n`,
  );
  fs.writeFileSync(ARTIFACT_PATHS.reportJson, `${JSON.stringify(finalReport, null, 2)}\n`);
  fs.writeFileSync(
    ARTIFACT_PATHS.reportMarkdown,
    [
      "# MBTI-INDEX-52 Full 55 URL Release Gate",
      "",
      "- Final decision: `HOLD_MBTI_55_INCOMPLETE`",
      "- Consecutive runs complete: `0/2`",
      `- Failure reason: \`${failureReason}\``,
      "",
    ].join("\n"),
  );
  fs.writeFileSync(ARTIFACT_PATHS.reportCsv, "path,kind,result,blockers\n");
}

function stableRecord(target, record) {
  const checks = Object.fromEntries(CHECK_KEYS.map((key) => [key, record?.checks?.[key] === true]));
  return {
    path: `/zh/personality/${target.slug}`,
    kind: target.kind,
    group: target.group,
    expected_section_count: target.expectedSectionCount,
    authority_fingerprint_sha256: record?.authorityFingerprintSha256 ?? "",
    source_revision_sha256: record?.sourceRevisionSha256 ?? "",
    checks,
    blockers: CHECK_KEYS.filter((key) => !checks[key]),
  };
}

const targetList = targets();
validateInventory(targetList);
if (DIAGNOSE_VISIBLE_ONLY) {
  const profileTargets = targetList.filter((target) => (
    target.kind === "profile" && (!diagnoseSlug || target.slug === diagnoseSlug)
  ));
  const profileResults = [];
  for (let offset = 0; offset < profileTargets.length; offset += MAX_CONCURRENCY) {
    const batch = profileTargets.slice(offset, offset + MAX_CONCURRENCY);
    profileResults.push(...await Promise.all(batch.map(async (target) => {
      const canonical = `${SITE_ORIGIN}/zh/personality/${target.slug}`;
      const apiUrl = `${API_ORIGIN}/${target.slug}?${PUBLIC_CONTEXT_QUERY}`;
      const [payload, page] = await Promise.all([fetchJson(apiUrl), fetchPage(canonical)]);
      const facts = documentFacts(page.html, page.xRobotsTag);
      return {
        slug: target.slug,
        visible_body: visibleBodyComplete(
          payload,
          target,
          facts.visibleText,
          facts.visibleAnchors,
        ),
      };
    })));
  }
  const failed = profileResults.filter((record) => !record.visible_body);
  console.log(JSON.stringify({
    checked_profile_count: profileResults.length,
    passed_profile_count: profileResults.length - failed.length,
    failed_profile_slugs: failed.map((record) => record.slug),
  }));
  process.exit(failed.length === 0 ? 0 : 1);
}
const runStartedAt = new Date().toISOString();
const RUN_TWO_CORRUPT_LOCK_GRACE_MS = 60_000;
let validationSessionId = RUN === 1 ? crypto.randomUUID() : null;
let runTwoLockDescriptor = null;
let runTwoLockIdentity = null;
function sameFileIdentity(left, right) {
  return left?.dev === right?.dev && left?.ino === right?.ino;
}
function processIsAlive(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    return error && typeof error === "object" && error.code !== "ESRCH";
  }
}
function processStartToken(pid) {
  if (!Number.isSafeInteger(pid) || pid <= 0) return null;
  try {
    const token = execFileSync("ps", ["-o", "lstart=", "-p", String(pid)], {
      encoding: "utf8",
      timeout: 5_000,
      maxBuffer: 4_096,
    }).trim();
    return token || null;
  } catch {
    return null;
  }
}
function lockOwnerPayload() {
  const processStartIdentity = processStartToken(process.pid);
  if (!nonemptyString(processStartIdentity)) {
    throw new Error("Unable to observe validator process start identity");
  }
  return {
    pid: process.pid,
    process_start_token: processStartIdentity,
  };
}
function parseLockOwner(contents) {
  try {
    const owner = JSON.parse(contents);
    return {
      pid: Number(owner?.pid),
      process_start_token: nonemptyString(owner?.process_start_token)
        ? owner.process_start_token
        : null,
    };
  } catch {
    return /^\d+$/.test(contents)
      ? { pid: Number(contents), process_start_token: null }
      : null;
  }
}
function lockOwnerMatchesObservedProcess(owner, observedPid, observedStartToken) {
  return owner?.pid === observedPid
    && nonemptyString(owner?.process_start_token)
    && owner.process_start_token === observedStartToken;
}
function lockOwnerIsActive(owner) {
  if (owner === null || !processIsAlive(owner.pid)) return false;
  if (!nonemptyString(owner.process_start_token)) return true;
  const observedStartToken = processStartToken(owner.pid);
  return observedStartToken === null
    || lockOwnerMatchesObservedProcess(owner, owner.pid, observedStartToken);
}
function writeLockOwner(descriptor) {
  fs.writeSync(descriptor, `${JSON.stringify(lockOwnerPayload())}\n`, null, "utf8");
  fs.fsyncSync(descriptor);
}
function reclaimStaleRunTwoLock() {
  let descriptor = null;
  let reclaimDescriptor = null;
  let reclaimIdentity = null;
  try {
    for (let attempt = 0; attempt < 2; attempt += 1) {
      try {
        reclaimDescriptor = fs.openSync(ARTIFACT_PATHS.runTwoReclaim, "wx", 0o600);
        writeLockOwner(reclaimDescriptor);
        reclaimIdentity = fs.fstatSync(reclaimDescriptor);
        break;
      } catch (error) {
        if (!(error && typeof error === "object" && error.code === "EEXIST")) throw error;
        let staleDescriptor = null;
        try {
          staleDescriptor = fs.openSync(ARTIFACT_PATHS.runTwoReclaim, "r");
          const contents = fs.readFileSync(staleDescriptor, "utf8").trim();
          const identity = fs.fstatSync(staleDescriptor);
          const owner = parseLockOwner(contents);
          const corruptClaimExpired = owner === null
            && Date.now() - identity.mtimeMs >= RUN_TWO_CORRUPT_LOCK_GRACE_MS;
          if (
            lockOwnerIsActive(owner)
            || (owner === null && !corruptClaimExpired)
          ) {
            return false;
          }
          const currentIdentity = fs.lstatSync(ARTIFACT_PATHS.runTwoReclaim);
          if (!sameFileIdentity(identity, currentIdentity)) return false;
          fs.unlinkSync(ARTIFACT_PATHS.runTwoReclaim);
        } catch (claimError) {
          if (!(claimError && typeof claimError === "object" && claimError.code === "ENOENT")) {
            throw claimError;
          }
        } finally {
          if (staleDescriptor !== null) fs.closeSync(staleDescriptor);
        }
      }
    }
    if (reclaimDescriptor === null) return false;
    descriptor = fs.openSync(ARTIFACT_PATHS.runTwoLock, "r");
    const contents = fs.readFileSync(descriptor, "utf8").trim();
    const identity = fs.fstatSync(descriptor);
    const owner = parseLockOwner(contents);
    const corruptLockExpired = owner === null
      && Date.now() - identity.mtimeMs >= RUN_TWO_CORRUPT_LOCK_GRACE_MS;
    if (
      lockOwnerIsActive(owner)
      || (owner === null && !corruptLockExpired)
    ) {
      return false;
    }
    const currentIdentity = fs.lstatSync(ARTIFACT_PATHS.runTwoLock);
    if (
      !sameFileIdentity(identity, currentIdentity)
    ) {
      return false;
    }
    fs.unlinkSync(ARTIFACT_PATHS.runTwoLock);
    return true;
  } catch (error) {
    if (error && typeof error === "object" && error.code === "ENOENT") return true;
    throw error;
  } finally {
    if (descriptor !== null) fs.closeSync(descriptor);
    if (reclaimDescriptor !== null) fs.closeSync(reclaimDescriptor);
    if (reclaimIdentity !== null) {
      try {
        const currentIdentity = fs.lstatSync(ARTIFACT_PATHS.runTwoReclaim);
        if (sameFileIdentity(reclaimIdentity, currentIdentity)) {
          fs.unlinkSync(ARTIFACT_PATHS.runTwoReclaim);
        }
      } catch (error) {
        if (!(error && typeof error === "object" && error.code === "ENOENT")) throw error;
      }
    }
  }
}
function releaseRunTwoLock() {
  if (runTwoLockDescriptor === null) return;
  try {
    const currentIdentity = fs.lstatSync(ARTIFACT_PATHS.runTwoLock);
    if (sameFileIdentity(runTwoLockIdentity, currentIdentity)) {
      fs.unlinkSync(ARTIFACT_PATHS.runTwoLock);
    }
  } catch (error) {
    if (!(error && typeof error === "object" && error.code === "ENOENT")) throw error;
  } finally {
    fs.closeSync(runTwoLockDescriptor);
    runTwoLockDescriptor = null;
    runTwoLockIdentity = null;
  }
}
function terminateValidationRun(signal, exitCode) {
  FEED_ABORT_CONTROLLER.abort(new Error(`validation_interrupted:${signal}`));
  writePreflightValidationFailure(
    runStartedAt,
    validationSessionId,
    new Error(`validation_interrupted:${signal}`),
  );
  releaseRunTwoLock();
  console.error(`HOLD_MBTI_55_INCOMPLETE: validation run interrupted by ${signal}`);
  process.exit(exitCode);
}
function acquireRunTwoLock() {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      runTwoLockDescriptor = fs.openSync(ARTIFACT_PATHS.runTwoLock, "wx", 0o600);
      writeLockOwner(runTwoLockDescriptor);
      runTwoLockIdentity = fs.fstatSync(runTwoLockDescriptor);
      return;
    } catch (error) {
      if (!(error && typeof error === "object" && error.code === "EEXIST")) throw error;
      if (attempt === 0 && reclaimStaleRunTwoLock()) continue;
      throw error;
    }
  }
}
if (RUN !== null) {
  try {
    acquireRunTwoLock();
    process.once("exit", releaseRunTwoLock);
    process.once("SIGINT", () => terminateValidationRun("SIGINT", 130));
    process.once("SIGTERM", () => terminateValidationRun("SIGTERM", 143));
    process.once("SIGHUP", () => terminateValidationRun("SIGHUP", 129));
  } catch (error) {
    if (error && typeof error === "object" && error.code === "EEXIST") {
      console.error("HOLD_MBTI_55_INCOMPLETE: another validation run owns the session lock");
      process.exit(1);
    }
    throw error;
  }
}
writeFinalValidationHold(runStartedAt);
let previousRun = null;
if (RUN === 2) {
  let runOneDescriptor = null;
  let consumptionError = null;
  try {
    runOneDescriptor = fs.openSync(ARTIFACT_PATHS.run1, "r+");
    previousRun = JSON.parse(fs.readFileSync(runOneDescriptor, "utf8"));
    validationSessionId = nonemptyString(previousRun?.validation_session_id)
      ? previousRun.validation_session_id
      : null;
    const consumedRun = `${JSON.stringify({
      ...previousRun,
      sequence_state: "consumed",
      consumed_by_run_2_at: runStartedAt,
    }, null, 2)}\n`;
    fs.ftruncateSync(runOneDescriptor, 0);
    fs.writeSync(runOneDescriptor, consumedRun, 0, "utf8");
    fs.fsyncSync(runOneDescriptor);
  } catch (error) {
    if (!(error && typeof error === "object" && error.code === "ENOENT")) {
      consumptionError = error;
    }
  } finally {
    if (runOneDescriptor !== null) fs.closeSync(runOneDescriptor);
  }
  if (consumptionError) {
    writePreflightValidationFailure(runStartedAt, validationSessionId, consumptionError);
    console.error("HOLD_MBTI_55_INCOMPLETE: run 2 validation session is already claimed");
    process.exit(1);
  }
}
writeRunValidationHold(runStartedAt, validationSessionId);
writeFinalValidationHold(runStartedAt, validationSessionId);
let frontendRevisionAtStart;
let feeds;
let comparisonListItemsBySlug;
try {
  frontendRevisionAtStart = await fetchFrontendRevision();
  const comparisonListPayload = await fetchJson(COMPARISON_LIST_URL);
  const atComparisonItems = comparisonListPayload?.at_comparisons;
  const expectedAtSlugs = targetList
    .filter(({ kind }) => kind === "at_comparison")
    .map(({ slug }) => slug);
  if (
    !Array.isArray(atComparisonItems)
    || atComparisonItems.length !== expectedAtSlugs.length
    || new Set(atComparisonItems.map(({ slug }) => slug)).size !== expectedAtSlugs.length
    || expectedAtSlugs.some((slug) => !atComparisonItems.some((item) => item?.slug === slug))
  ) {
    throw new Error("Production comparison list authority does not contain the exact 16 A/T targets");
  }
  comparisonListItemsBySlug = Object.fromEntries(
    atComparisonItems.map((item) => [item.slug, item]),
  );
  const feedEntries = [];
  for (const name of ["sitemap.xml", "llms.txt", "llms-full.txt"]) {
    feedEntries.push([name, await fetchFeed(name)]);
  }
  feeds = Object.fromEntries(feedEntries);
} catch (error) {
  writePreflightValidationFailure(runStartedAt, validationSessionId, error);
  console.error("HOLD_MBTI_55_INCOMPLETE: production preflight failed");
  process.exit(1);
}
const feedSets = Object.fromEntries(
  Object.entries(feeds).map(([name, body]) => [name, feedEntryUrls(name, body)]),
);
const privateUrlLeaks = [...new Set(Object.values(feeds).flatMap((body) => [...allFeedUrls(body)]))]
  .filter((url) => isSharedDiscoverabilityDeniedPath(new URL(url).pathname));

const records = new Array(targetList.length);
let cursor = 0;
async function worker() {
  while (cursor < targetList.length) {
    const index = cursor;
    cursor += 1;
    const target = targetList[index];
    const canonical = `${SITE_ORIGIN}/zh/personality/${target.slug}`;
    const apiUrl = target.kind === "profile"
      ? `${API_ORIGIN}/${target.slug}?${PUBLIC_CONTEXT_QUERY}`
      : `${API_ORIGIN}/comparisons/${target.slug}?${PUBLIC_CONTEXT_QUERY}`;
    try {
      const seoUrl = target.kind === "profile"
        ? `${API_ORIGIN}/${target.slug}/seo?locale=zh-CN&org_id=0&scale_code=MBTI`
        : null;
      const [payload, page, seoPayload] = await Promise.all([
        fetchJson(apiUrl),
        fetchPage(canonical),
        seoUrl ? fetchJson(seoUrl) : Promise.resolve(null),
      ]);
      const facts = documentFacts(page.html, page.xRobotsTag);
      const structured = structuredFacts(facts.jsonld);
      const faq = apiFaq(payload, target.kind);
      const authority = authorityFacts(
        payload,
        target,
        canonical,
        seoPayload,
        facts,
        comparisonListItemsBySlug[target.slug] ?? null,
      );
      const sectionCount = apiSections(payload, target.kind).length;
      const checks = {
        public_api: payload?.ok === true,
        authority: authority.present,
        authority_fingerprint: /^[0-9a-f]{64}$/.test(authority.authorityFingerprintSha256)
          && /^[0-9a-f]{64}$/.test(authority.sourceRevisionSha256)
          && authority.revisionPresent === true,
        visible_body: visibleBodyComplete(
          payload,
          target,
          facts.visibleText,
          facts.visibleAnchors,
        ),
        section_completeness: sectionCount === target.expectedSectionCount,
        faq: faqSchemaMatches(faq, structured.faq) && faq.every((row) => (
          facts.visibleText.includes(row.question)
          && facts.visibleText.includes(row.answer)
        )),
        jsonld: jsonLdValid(target.kind, structured, canonical),
        canonical: canonicalLinkValid(facts, canonical),
        robots_indexability: robotsIndexable(facts),
        sitemap: feedSets["sitemap.xml"].has(canonical),
        llms: feedSets["llms.txt"].has(canonical),
        llms_full: feedSets["llms-full.txt"].has(canonical),
        api_no_timeout: true,
      };
      records[index] = {
        checks,
        authorityFingerprintSha256: authority.authorityFingerprintSha256,
        sourceRevisionSha256: authority.sourceRevisionSha256,
      };
    } catch (error) {
      const timedOut = isTimeout(error);
      records[index] = {
        checks: {
          public_api: false,
          authority: false,
          authority_fingerprint: false,
          visible_body: false,
          section_completeness: false,
          faq: false,
          jsonld: false,
          canonical: false,
          robots_indexability: false,
          sitemap: feedSets["sitemap.xml"].has(canonical),
          llms: feedSets["llms.txt"].has(canonical),
          llms_full: feedSets["llms-full.txt"].has(canonical),
          api_no_timeout: !timedOut,
        },
      };
    }
  }
}
await Promise.all(Array.from({ length: MAX_CONCURRENCY }, () => worker()));
let frontendRevisionAtEnd;
try {
  frontendRevisionAtEnd = await fetchFrontendRevision();
} catch (error) {
  writePreflightValidationFailure(runStartedAt, validationSessionId, error);
  console.error("HOLD_MBTI_55_INCOMPLETE: production revision closeout failed");
  process.exit(1);
}
const frontendRevisionStable = sameFrontendRevisionAcrossSequence(
  null,
  frontendRevisionAtStart,
  frontendRevisionAtEnd,
);

const evidenceRecords = targetList.map((target, index) => stableRecord(target, records[index]));
const metrics = Object.fromEntries(CHECK_KEYS.map((key) => [
  key.toUpperCase(),
  evidenceRecords.filter((record) => record.checks[key]).length,
]));
metrics.API_TIMEOUTS = 55 - metrics.API_NO_TIMEOUT;
delete metrics.API_NO_TIMEOUT;
const aggregatePassed = Object.entries(metrics).every(([key, value]) => (
  key === "API_TIMEOUTS" ? value === 0 : value === 55
)) && privateUrlLeaks.length === 0 && frontendRevisionStable;
evidenceRecords.forEach((record) => {
  if (aggregatePassed) validateRecordEvidence(record);
});
const evidenceSignature = sha256({
  target_count: 55,
  metrics,
  private_url_leak_count: privateUrlLeaks.length,
  frontend_revision: frontendRevisionAtStart,
  validator_source_sha256: VALIDATOR_SOURCE_SHA256,
  records: evidenceRecords,
});
const runCompletedAt = new Date().toISOString();
const consecutivePass = Boolean(
  RUN === 2
  && aggregatePassed
  && previousRun?.run_decision === "PASS_MBTI_55_RUN"
  && previousRun?.sequence_state === "awaiting_run_2"
  && nonemptyString(validationSessionId)
  && previousRun?.validation_session_id === validationSessionId
  && previousRun?.target_count === 55
  && sameFrontendRevisionAcrossSequence(
    previousRun,
    frontendRevisionAtStart,
    frontendRevisionAtEnd,
  )
  && sameValidatorRevisionAcrossSequence(previousRun, VALIDATOR_SOURCE_SHA256)
  && previousRun?.evidence_signature === evidenceSignature
  && previousRun?.completed_at < runStartedAt,
);
const runPassed = validationRunPassed(RUN, aggregatePassed, consecutivePass);
const runReport = {
  id: "MBTI-INDEX-52",
  artifact: `MBTI-INDEX-52-FULL-55-RELEASE-GATE-RUN-${RUN}`,
  run: RUN,
  validation_session_id: validationSessionId,
  sequence_state: RUN === 1
    ? (aggregatePassed ? "awaiting_run_2" : "failed")
    : (runPassed ? "completed" : "failed"),
  started_at: runStartedAt,
  completed_at: runCompletedAt,
  target_count: 55,
  evidence_scope: "read_only_production_network_revalidation",
  run_decision: runPassed ? "PASS_MBTI_55_RUN" : "HOLD_MBTI_55_INCOMPLETE",
  evidence_signature: evidenceSignature,
  frontend_revision: frontendRevisionAtStart,
  frontend_revision_stable_within_run: frontendRevisionStable,
  validator_source_sha256: VALIDATOR_SOURCE_SHA256,
  source_revision_set_sha256: sha256(evidenceRecords.map((record) => record.source_revision_sha256)),
  authority_fingerprint_set_sha256: sha256(evidenceRecords.map((record) => record.authority_fingerprint_sha256)),
  metrics,
  private_url_leak_count: privateUrlLeaks.length,
  records: evidenceRecords,
};
fs.writeFileSync(RUN === 1 ? ARTIFACT_PATHS.run1 : ARTIFACT_PATHS.run2, `${JSON.stringify(runReport, null, 2)}\n`);

const finalDecision = consecutivePass
  ? "ALLOW_MBTI_55_COMPLETE"
  : (RUN === 1 && aggregatePassed ? "PASS_MBTI_55_RUN_PENDING_SECOND" : "HOLD_MBTI_55_INCOMPLETE");
const finalReport = {
  id: "MBTI-INDEX-52",
  artifact: "MBTI-INDEX-52-FULL-55-RELEASE-GATE",
  generated_at: runCompletedAt,
  final_decision: finalDecision,
  gsc_dependency_unblocked: consecutivePass,
  required_consecutive_runs: 2,
  completed_consecutive_runs: consecutivePass ? 2 : (RUN === 1 && aggregatePassed ? 1 : 0),
  validation_session_id: validationSessionId,
  target_count: 55,
  exact_new_targets: RELEASED_CROSS_TYPE,
  frontend_revision: frontendRevisionAtStart,
  run_1: previousRun ? {
    validation_session_id: previousRun.validation_session_id,
    started_at: previousRun.started_at,
    completed_at: previousRun.completed_at,
    decision: previousRun.run_decision,
    evidence_signature: previousRun.evidence_signature,
    frontend_revision: previousRun.frontend_revision,
    validator_source_sha256: previousRun.validator_source_sha256,
    source_revision_set_sha256: previousRun.source_revision_set_sha256,
    authority_fingerprint_set_sha256: previousRun.authority_fingerprint_set_sha256,
    metrics: previousRun.metrics,
  } : (RUN === 1 ? {
    validation_session_id: validationSessionId,
    started_at: runStartedAt,
    completed_at: runCompletedAt,
    decision: runReport.run_decision,
    evidence_signature: evidenceSignature,
    frontend_revision: frontendRevisionAtStart,
    validator_source_sha256: VALIDATOR_SOURCE_SHA256,
    source_revision_set_sha256: runReport.source_revision_set_sha256,
    authority_fingerprint_set_sha256: runReport.authority_fingerprint_set_sha256,
    metrics,
  } : null),
  run_2: RUN === 2 ? {
    validation_session_id: validationSessionId,
    started_at: runStartedAt,
    completed_at: runCompletedAt,
    decision: runReport.run_decision,
    evidence_signature: evidenceSignature,
    frontend_revision: frontendRevisionAtStart,
    validator_source_sha256: VALIDATOR_SOURCE_SHA256,
    source_revision_set_sha256: runReport.source_revision_set_sha256,
    authority_fingerprint_set_sha256: runReport.authority_fingerprint_set_sha256,
    metrics,
  } : null,
  metrics,
  private_url_leak_count: privateUrlLeaks.length,
  records: evidenceRecords,
  safety_boundary: SAFETY_BOUNDARY,
};

const metricLines = Object.entries(metrics).map(([key, value]) => (
  key === "API_TIMEOUTS" ? `${key}=${value}` : `${key}=${value}/55`
));
const markdown = [
  "# MBTI-INDEX-52 Full 55 URL Release Gate",
  "",
  `- Final decision: \`${finalDecision}\``,
  `- Consecutive runs complete: \`${finalReport.completed_consecutive_runs}/2\``,
  `- Target count: \`55\``,
  `- Private URL leaks: \`${privateUrlLeaks.length}\``,
  ...metricLines.map((line) => `- \`${line}\``),
  "",
  "This is read-only production evidence. It does not write CMS/DB data, mutate publication or indexability, deploy, submit sitemap/llms, or request search indexing.",
  "",
  "| Path | Kind | Expected sections | Result | Blockers |",
  "| --- | --- | ---: | --- | --- |",
  ...evidenceRecords.map((record) => `| ${record.path} | ${record.kind} | ${record.expected_section_count} | ${record.blockers.length ? "hold" : "pass"} | ${record.blockers.join(", ") || "none"} |`),
  "",
].join("\n");
const csvHeaders = [
  "path",
  "kind",
  "group",
  "expected_section_count",
  "result",
  ...CHECK_KEYS,
  "authority_fingerprint_sha256",
  "source_revision_sha256",
  "blockers",
];
const csv = [
  csvHeaders.map(csvEscape).join(","),
  ...evidenceRecords.map((record) => csvHeaders.map((header) => csvEscape(
    header === "result"
      ? (record.blockers.length ? "hold" : "pass")
      : header === "blockers"
        ? record.blockers.join("|")
        : (record[header] ?? record.checks[header] ?? ""),
  )).join(",")),
].join("\n") + "\n";

fs.writeFileSync(ARTIFACT_PATHS.reportJson, `${JSON.stringify(finalReport, null, 2)}\n`);
fs.writeFileSync(ARTIFACT_PATHS.reportMarkdown, markdown);
fs.writeFileSync(ARTIFACT_PATHS.reportCsv, csv);

console.log(finalDecision);
metricLines.forEach((line) => console.log(line));
console.log(`PRIVATE_URL_LEAKS=${privateUrlLeaks.length}`);
if ((RUN === 1 && !aggregatePassed) || (RUN === 2 && !consecutivePass)) process.exitCode = 1;
