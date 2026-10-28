/** Synthetic contract examples only. Never runtime Career or occupational-data authority. */
export function careerMatchRoleFixture(locale: "en" | "zh", slug = "contract-role-a", code = "ASE") {
  const hash = "a".repeat(64), language = locale === "zh" ? "zh-CN" : "en", path = `/${locale}/career/jobs/${slug}`;
  const subject = { canonical_slug: slug, name: locale === "zh" ? `契约样例 ${slug}` : `Contract example ${slug}`, summary: locale === "zh" ? "只用于契约测试的虚构职业说明。" : "A fictional occupation description for contract tests only." };
  const missing = (key: string) => ({ key, label: key, availability: "missing", fact_ref: null, fact: null });
  return {
    bundle_kind: "career_job_detail", bundle_version: "career.detail.page.v1",
    identity: { canonical_slug: slug }, locale_policy: { requested_locale: language },
    seo_contract: { canonical_path: path, canonical_target: path, metadata_fingerprint: hash, index_state: "indexable", index_eligible: true, reason_codes: [], robots_policy: "index,follow" },
    career_page: {
      contract_version: "career.detail.page.v1", locale: language, subject, source_content_sha256: hash,
      hero: { badges: [], metrics: ["us_pay", "us_growth", "us_employment", "us_openings", "china_pay"].map(missing), ai: missing("ai") },
      seo: { title: { availability: "available", text: subject.name }, description: { availability: "available", text: subject.summary } },
      content: {
        contract_version: "career.detail.content.v3", locale: language, subject, content_state: "enhanced", source_content_sha256: hash,
        blocks: [{ id: "profile", copy_key: "career.block.profile", content_state: "enhanced", availability: "available", items: [{ id: "example", copy_key: "career.item.example", type: "prose", availability: "available", data: { paragraphs: [subject.summary] } }] }],
      },
      display: { contract_version: "career.detail.display.v1", path, component_order: ["riasec_fit_block"], components: { riasec_fit_block: {
        riasec: code, riasec_short: locale === "zh" ? "合成样例兴趣标签" : "Synthetic interest labels",
        interest: locale === "zh" ? "这是合成样例的完整兴趣说明。" : "This is the full interest description for a synthetic example.",
        fit_interest: locale === "zh" ? "这里只比较主题，不估计能力或录用。" : "Compare themes only; no ability or hiring inference.",
      } } },
    },
  };
}

export function careerMatchDirectoryFixture(locale: "en" | "zh", slugs = ["contract-role-a", "contract-role-b", "contract-role-c"]) {
  return { bundle_kind: "career_job_index", bundle_version: "career.protocol.job_index.v1", items: slugs.map(slug => ({
    bundle_kind: "career_job_list_item", bundle_version: "career.protocol.job_list_item.v1", identity: { canonical_slug: slug },
    titles: { [locale === "zh" ? "canonical_zh" : "canonical_en"]: locale === "zh" ? `契约样例 ${slug}` : `Contract example ${slug}` },
    seo_contract: { canonical_path: `/career/jobs/${slug}` },
  })) };
}
