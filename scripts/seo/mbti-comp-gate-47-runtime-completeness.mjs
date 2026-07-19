import { createHash } from "node:crypto";
import { JSDOM } from "jsdom";

export const SECTION_KEYS = [
  "biggest_difference",
  "quick_judgment_table",
  "easy_misread",
  "work_scenarios",
  "relationship_scenarios",
  "stress_scenarios",
  "do_not_misjudge",
  "common_ground",
  "usage_boundary",
];

export const TARGETS = [
  ["intj-a-vs-intj-t", "43d8b1782a843284f0513dafac9a551c6fa98098634ba9a2f5d7383d455dc3fb", "00e02fb3c67aadc6af161f2634469d53aefe7ca316d619308627d49fb9012bab", "MBTI-CMS-APPROVAL-39"],
  ["intp-a-vs-intp-t", "6f7148e9787127ce128e19f0a37832be78119c7f1d9dcdf3a5f4d83aa8295ab9", "10b306f2dbac4f9a801a7718ec5584d84f56f6de601ada0f8f677bcb163f960e", "MBTI-COMP-RUNTIME-46"],
  ["entj-a-vs-entj-t", "0fdd85e5feda75cfe4c158b460e3e964b1c91da30db441457bbfaef123a6863b", "97d5ed6586f499276e5ed58cbd7eb09319106a3d79ec631378d0bc4dae706f6d", "MBTI-CMS-APPROVAL-39"],
  ["entp-a-vs-entp-t", "dc2cca38a742acfe7a85fc8e3f5c84256dfb543dcee4fa2d494d1dcd56eb63c7", "e9fe547dde966ca4bfe6db52a1626f625c7a9cd3164b83ef7eb433574844bdfa", "MBTI-CMS-APPROVAL-39"],
  ["infj-a-vs-infj-t", "2f6512f93aa40e2e26a3c8896b58c6785ba3d7afe10b440284c5c66085d1ff50", "b795b16530f40238334148a8db5439fa5927c429fec8936054934e2e2aef168e", "MBTI-CMS-APPROVAL-39"],
  ["infp-a-vs-infp-t", "8819126e1b4da65ec43e8acf4a8c4f8af1b52cd4fc4329ef14b688b56a7a3c89", "b264bfa6df960c77e1907e74f63dd721216aa37eb3246465ee6bb57b5986cfec", "MBTI-CMS-APPROVAL-39"],
  ["enfj-a-vs-enfj-t", "4199dc86522cb80202dc3949262fba90cf291329580451d1139799f2d846f467", "d64628608d9026a3b3b3956337d9a3bb8dc6c62fbd787a844a26d5fe5fe17b83", "MBTI-CMS-APPROVAL-39"],
  ["enfp-a-vs-enfp-t", "8c4b9dc23e57712462a3f44640791c338d642f581fd8cec0adca3fa55ffb33bd", "bd35274fe4cf88e26190627cad0e8355688ad419e446431bfe03c3893e78b93d", "MBTI-CMS-APPROVAL-39"],
  ["istj-a-vs-istj-t", "096c7847d8b51c54153660c0682cb08ae76d2411ff8cf1041e9b14d7f415a88d", "65082954ddbf95a148f3ca1bd448ca9ecea80ce7daf4a12a4e8f10aca31caa08", "MBTI-CMS-APPROVAL-39"],
  ["isfj-a-vs-isfj-t", "3f32e4682201418a58c555f0b16debff30139631101c04e8389fbbcb500f8394", "51d8bae63c391c7f8337d0d8e2bc4e25b1c29a229e3a983b73e2fafa8813b636", "MBTI-CMS-APPROVAL-39"],
  ["estj-a-vs-estj-t", "710891067e17a34c943cc74aaba7555e598ddf48c13217bab0b00e38e5f47677", "115f4581ebc3ebaec2e66080188066efc9c6e3086425c884d1b6f6c163865cf1", "MBTI-CMS-APPROVAL-39"],
  ["esfj-a-vs-esfj-t", "e1b2d407e815ad357d83023a438f52c30cb7a9bb910b27b0fa6f0e9764d661d3", "1160b4cb6d557e6b9534ebacaca7ac5bdc7966e5c073f0974831e77a80df3675", "MBTI-CMS-APPROVAL-39"],
  ["istp-a-vs-istp-t", "228509b5a2cd1781f57ed73eea8bd1263584486d4ecbfc0ec72fb327784a0420", "db08b160f7a60053fa762fcd9d05cbe7fa439bfff610f749e45bc600b09f09be", "MBTI-CMS-APPROVAL-39"],
  ["isfp-a-vs-isfp-t", "319743a7bd23c180dcff687d0e41db7f202c13323ab33cfff4e414829922ee03", "3e5b7ac466af367fd0516f2cc9221bfe425afa562958acaac2e3e96d592a773c", "MBTI-CMS-APPROVAL-39"],
  ["estp-a-vs-estp-t", "e0c79e4a90539948f6c5e90990ff957bded520c8dbf4d8a54ee92b9c73accfb5", "afca819008f78fa455d7890a91087936a888ce0fc5fed8036f6d309bd5f28815", "MBTI-CMS-APPROVAL-39"],
  ["esfp-a-vs-esfp-t", "5c6dcdc117989e987b493a39cc8cf929c31d96ea21f817d2de97fdbd05b13faf", "e57045cca70fb6990ca3cb714ca6a027ed4bc542340cd027357001c4d57eaa43", "MBTI-CMS-APPROVAL-39"],
].map(([slug, sectionsSha256, approvedPayloadSha256, reviewSource]) => ({ slug, sectionsSha256, approvedPayloadSha256, reviewSource }));

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.keys(value).sort().map((key) => [key, stable(value[key])]));
  }
  return value;
}

export function sha256(value) {
  return createHash("sha256").update(JSON.stringify(stable(value))).digest("hex");
}

export function projectApprovedSections(contentSections) {
  return contentSections.map(({ key, title, body, rows }) => ({
    id: key,
    title,
    body: [body],
    ...(Array.isArray(rows) ? { rows } : {}),
  }));
}

function textOf(value) {
  if (typeof value === "string") return value.trim();
  if (Array.isArray(value)) return value.map(textOf).filter(Boolean).join(" ");
  if (value && typeof value === "object") return Object.values(value).map(textOf).filter(Boolean).join(" ");
  return "";
}

function normalizedVisibleText(value) {
  return String(value ?? "").replace(/\s+/g, " ").trim();
}

export function visibleTextFromHtml(pageHtml) {
  const document = new JSDOM(pageHtml).window.document;
  document.querySelectorAll('script, style, template, noscript, [hidden], [aria-hidden="true"], input[type="hidden"]').forEach((node) => node.remove());
  return normalizedVisibleText(document.body?.textContent);
}

function faqFromJsonLd(jsonld) {
  if (!jsonld || typeof jsonld !== "object") return [];
  if (jsonld["@type"] === "FAQPage") return Array.isArray(jsonld.mainEntity) ? jsonld.mainEntity : [];
  for (const value of Object.values(jsonld)) {
    if (value && typeof value === "object") {
      const nested = faqFromJsonLd(value);
      if (nested.length > 0) return nested;
    }
  }
  return [];
}

export function validateRuntimeRecord({ slug, expectedSectionsSha256, approvedPayloadSha256, reviewSource, apiStatus, payload, pageStatus, pageHtml }) {
  const projection = payload?.comparison_public_projection_v1;
  const authoritySource = projection?.overlay_source?.source ?? "missing_backend_projection";
  const failures = [];
  const fail = (field, expected, actual) => failures.push({
    slug,
    field,
    expected,
    actual,
    authority_source: authoritySource,
  });

  if (apiStatus !== 200) fail("api.http_status", 200, apiStatus);
  if (!projection || typeof projection !== "object") {
    fail("comparison_public_projection_v1", "backend-authoritative object", projection ?? null);
    return { slug, passed: false, authority_source: authoritySource, failures };
  }
  if (projection.comparison_slug !== slug) fail("comparison_slug", slug, projection.comparison_slug ?? null);
  if (!projection.overlay_source?.source) fail("overlay_source.source", "nonempty backend authority", null);

  const sections = projection.sections;
  if (!Array.isArray(sections)) {
    fail("sections", "array of exactly 9 approved sections", sections ?? null);
  } else {
    if (sections.length !== SECTION_KEYS.length) fail("sections.length", SECTION_KEYS.length, sections.length);
    const actualKeys = sections.map((section) => section?.key ?? section?.id ?? null);
    if (JSON.stringify(actualKeys) !== JSON.stringify(SECTION_KEYS)) fail("sections.keys", SECTION_KEYS, actualKeys);
    sections.forEach((section, index) => {
      const key = SECTION_KEYS[index] ?? `index_${index}`;
      const title = textOf(section?.title);
      const body = textOf(section?.body);
      if (!title) fail(`sections.${key}.title`, "nonempty", title);
      if (body.length < 40) fail(`sections.${key}.body`, "at least 40 visible characters", body.length);
    });
    const actualSha = sha256(sections);
    if (actualSha !== expectedSectionsSha256) fail("sections.sha256", expectedSectionsSha256, actualSha);
  }

  const faq = projection.faq;
  if (!Array.isArray(faq) || faq.length !== 5) fail("faq.length", 5, Array.isArray(faq) ? faq.length : null);
  else faq.forEach((item, index) => {
    if (!textOf(item?.question)) fail(`faq.${index}.question`, "nonempty", "");
    if (textOf(item?.answer).length < 20) fail(`faq.${index}.answer`, "at least 20 visible characters", textOf(item?.answer).length);
  });
  const jsonLdFaq = faqFromJsonLd(payload?.jsonld);
  if (jsonLdFaq.length !== 5) fail("jsonld.faq.length", 5, jsonLdFaq.length);
  else if (Array.isArray(faq)) {
    const apiFaqText = faq.map((item) => [textOf(item?.question), textOf(item?.answer)]);
    const jsonLdFaqText = jsonLdFaq.map((item) => [textOf(item?.name), textOf(item?.acceptedAnswer?.text)]);
    if (JSON.stringify(jsonLdFaqText) !== JSON.stringify(apiFaqText)) fail("jsonld.faq.parity", apiFaqText, jsonLdFaqText);
  }

  const expectedCanonical = `https://fermatmind.com/zh/personality/${slug}`;
  if (projection.canonical_url !== expectedCanonical) fail("canonical.api", expectedCanonical, projection.canonical_url ?? null);
  if (payload?.seo_meta?.robots !== "index,follow") fail("robots.api", "index,follow", payload?.seo_meta?.robots ?? null);
  if (pageStatus !== 200) fail("page.http_status", 200, pageStatus);
  if (typeof pageHtml === "string" && pageHtml.length > 0) {
    const document = new JSDOM(pageHtml).window.document;
    const pageCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;
    const pageRobots = document.querySelector('meta[name="robots"]')?.getAttribute("content") ?? null;
    if (pageCanonical !== expectedCanonical) fail("canonical.page", expectedCanonical, pageCanonical);
    if (pageRobots !== "index, follow") fail("robots.page", "index, follow", pageRobots);
    const visibleText = visibleTextFromHtml(pageHtml);
    for (const section of sections ?? []) {
      const title = textOf(section?.title);
      const sectionKey = section?.key ?? section?.id;
      if (title && !visibleText.includes(normalizedVisibleText(title))) fail(`page.visible_section.${sectionKey}.title`, title, "missing from visible DOM");
      const rows = Array.isArray(section?.rows) ? section.rows : [];
      const expectedBodies = rows.length > 0
        ? rows.flatMap((row) => Object.entries(row).map(([field, value]) => ({ field: `rows.${field}`, value: textOf(value) })))
        : (Array.isArray(section?.body) ? section.body : [section?.body]).map((value, index) => ({ field: `body.${index}`, value: textOf(value) }));
      for (const expectedBody of expectedBodies) {
        const expectedText = normalizedVisibleText(expectedBody.value);
        if (expectedText && !visibleText.includes(expectedText)) {
          fail(`page.visible_section.${sectionKey}.${expectedBody.field}`, expectedText, "missing or incomplete in visible DOM");
        }
      }
    }
  } else {
    fail("page.html", "nonempty public HTML", typeof pageHtml);
  }

  return {
    slug,
    passed: failures.length === 0,
    authority_source: authoritySource,
    approved_payload_sha256: approvedPayloadSha256,
    review_source: reviewSource,
    sections_sha256: Array.isArray(sections) ? sha256(sections) : null,
    failures,
  };
}
