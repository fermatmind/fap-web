import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const repoRoot = process.cwd();

function readDoc(path: string): string {
  return readFileSync(join(repoRoot, path), "utf8");
}

describe("daily SEO release templates", () => {
  it("defaults full-chain article goals to complete SEO gates and queue item ids", () => {
    const stage4Template = readDoc(
      ".agents/skills/fermatmind-wechat-seo-article-editor/assets/CODEX_STAGE4_TO_SEO_AGENT_GOAL_TEMPLATE.md",
    );
    const fullReleaseTemplate = readDoc(
      ".agents/skills/fermatmind-seo-ops/assets/full_release_goal_template.md",
    );
    const docs = `${stage4Template}\n${fullReleaseTemplate}`;

    expect(docs).toContain("authorization_mode=full_chain_preapproved");
    expect(docs).toContain("queue_item_ids");
    expect(docs).not.toContain("schema=hold");
    expect(docs).not.toContain("hreflang=hold");
    expect(docs).toContain("schema=independent_gate");
    expect(docs).toContain("hreflang=independent_gate");
    expect(docs).toContain("--enable-article-schema --enable-breadcrumb-schema");
    expect(docs).toContain("--enable-hreflang");
    expect(docs).toContain("--hold-faq-schema");
    expect(docs).toContain("SEO_ENHANCEMENT_COMPLETE");
    expect(docs).toContain("SEO_ENHANCEMENT_HELD_REASON");
    expect(docs).toContain("--gsc-manual-json");
    expect(docs).toContain("--observation-json");
  });

  it("documents public sitemap parity without requiring frontend deploy by default", () => {
    const sitemapReference = readDoc(
      ".agents/skills/fermatmind-seo-ops/references/sitemap_llms_parity_check.md",
    );
    const discoverabilityReference = readDoc(
      ".agents/skills/fermatmind-seo-ops/references/discoverability_release_playbook.md",
    );
    const sitemapTemplate = readDoc(
      ".agents/skills/fermatmind-seo-ops/assets/sitemap_llms_parity_check_template.md",
    );
    const docs = `${sitemapReference}\n${discoverabilityReference}\n${sitemapTemplate}`;

    expect(docs).toContain("Public `/sitemap.xml`");
    expect(docs).toContain("NEEDS_PUBLIC_RUNTIME_REVALIDATION");
    expect(docs).not.toContain("NEEDS_FRONTEND_STATIC_REGEN_DEPLOY");
    expect(docs).not.toContain("frontend static sitemap");
    expect(docs).toContain("Frontend rebuild/deploy is not the default daily sitemap refresh path");
  });
});
