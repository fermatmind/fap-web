import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(
  ROOT,
  "docs/seo/generated/global-en-zh-content-pages-discoverability-exposure-readiness-01.v1.json",
);

const TARGET_PAGES = ["brand", "charter", "foundation", "careers", "policies"];
const TARGET_PATHS = TARGET_PAGES.map((slug) => `/en/${slug}`);

type ReadinessArtifact = {
  task?: string;
  final_decision?: string;
  target_pages?: string[];
  public_runtime_state?: Record<string, { http_status?: number; canonical?: string; robots?: string }>;
  cms_api_state?: Record<string, { is_public?: boolean; is_indexable?: boolean }>;
  sitemap_exposure_check?: { exposed?: boolean; target_url_hits?: Record<string, number> };
  llms_exposure_check?: {
    exposed?: boolean;
    llms_txt?: { target_url_hits?: Record<string, number> };
    llms_full_txt?: { target_url_hits?: Record<string, number> };
  };
  footer_nav_exposure_check?: { exposed?: boolean; target_url_hits?: Record<string, number> };
  readiness_blockers?: string[];
  recommended_next_task?: string;
  no_cms_mutation?: boolean;
  no_publish?: boolean;
  no_deploy?: boolean;
  no_search_channel_action?: boolean;
  no_url_submission?: boolean;
  no_external_search_api_call?: boolean;
  no_sitemap_llms_footer_nav_change?: boolean;
  no_frontend_fallback_content?: boolean;
};

function readArtifact(): ReadinessArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as ReadinessArtifact;
}

describe("Wave 1 English content page discoverability exposure readiness", () => {
  it("records the scoped readiness artifact without mutating discoverability", () => {
    const artifact = readArtifact();

    expect(artifact.task).toBe("GLOBAL-EN-ZH-CONTENT-PAGES-DISCOVERABILITY-EXPOSURE-READINESS-01");
    expect(artifact.final_decision).toBe("content_pages_discoverability_exposure_readiness_completed_with_exposure_blockers");
    expect(artifact.target_pages).toEqual(TARGET_PAGES);
    expect(artifact.no_cms_mutation).toBe(true);
    expect(artifact.no_publish).toBe(true);
    expect(artifact.no_deploy).toBe(true);
    expect(artifact.no_search_channel_action).toBe(true);
    expect(artifact.no_url_submission).toBe(true);
    expect(artifact.no_external_search_api_call).toBe(true);
    expect(artifact.no_sitemap_llms_footer_nav_change).toBe(true);
    expect(artifact.no_frontend_fallback_content).toBe(true);
    expect(artifact.recommended_next_task).toBe("GLOBAL-EN-ZH-CONTENT-PAGES-DISCOVERABILITY-EXPOSURE-IMPLEMENTATION-01");
  });

  it("keeps CMS indexability and HTML robots blockers explicit", () => {
    const artifact = readArtifact();

    for (const slug of TARGET_PAGES) {
      expect(artifact.public_runtime_state?.[slug]?.http_status, slug).toBe(200);
      expect(artifact.public_runtime_state?.[slug]?.canonical, slug).toBe(`https://fermatmind.com/en/${slug}`);
      expect(artifact.public_runtime_state?.[slug]?.robots?.toLowerCase(), slug).toContain("noindex");
      expect(artifact.cms_api_state?.[slug]?.is_public, slug).toBe(true);
      expect(artifact.cms_api_state?.[slug]?.is_indexable, slug).toBe(false);
    }

    expect(artifact.readiness_blockers ?? []).toEqual(
      expect.arrayContaining([
        "CMS content_pages records are public but not indexable.",
        "HTML robots remains noindex/nofollow for all five target pages.",
      ]),
    );
  });

  it("records that sitemap, llms, and footer/nav exposure are still absent", () => {
    const artifact = readArtifact();

    expect(artifact.sitemap_exposure_check?.exposed).toBe(false);
    expect(artifact.llms_exposure_check?.exposed).toBe(false);
    expect(artifact.footer_nav_exposure_check?.exposed).toBe(false);

    for (const targetPath of TARGET_PATHS) {
      expect(artifact.sitemap_exposure_check?.target_url_hits?.[targetPath], targetPath).toBe(0);
      expect(artifact.llms_exposure_check?.llms_txt?.target_url_hits?.[targetPath], targetPath).toBe(0);
      expect(artifact.llms_exposure_check?.llms_full_txt?.target_url_hits?.[targetPath], targetPath).toBe(0);
      expect(artifact.footer_nav_exposure_check?.target_url_hits?.[targetPath], targetPath).toBe(0);
    }
  });

  it("allows only the scoped report, artifact, test, and PR-train files on this branch", () => {
    for (const file of [
      "docs/seo/global-en-zh-content-pages-discoverability-exposure-readiness-01.md",
      "docs/seo/generated/global-en-zh-content-pages-discoverability-exposure-readiness-01.v1.json",
      "tests/contracts/global-en-zh-content-pages-discoverability-exposure-readiness-01.contract.test.ts",
      "tests/contracts/helpers/currentPrScope.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ]) {
      expect(isCurrentRiasecPack12AllowedFile(file), file).toBe(true);
    }
  });
});
