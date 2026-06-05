import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isCurrentRiasecPack12AllowedFile } from "./helpers/currentPrScope";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/operations/generated/help-footer-link-qa.v1.json");
const ALLOWED_FILES = new Set([
  "docs/operations/help-footer-link-qa.md",
  "docs/operations/generated/help-footer-link-qa.v1.json",
  "tests/contracts/help-footer-link-qa.contract.test.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

type FooterLinkQaArtifact = {
  schema_version: string;
  pr_id: string;
  decision: string;
  runtime_changed: boolean;
  cms_mutation: boolean;
  content_generated: boolean;
  footer_policy_links: Record<"en" | "zh", string[]>;
  known_public_help_routes: string[];
  service_help_destinations: Array<{ theme: string; status: string; footer_link_status: string }>;
  private_surface_guard: {
    forbidden_route_fragments: string[];
    raw_identifier_examples_added: boolean;
    private_urls_accessed: boolean;
  };
  qa_result: Record<string, boolean>;
  deferred: string[];
};

function readArtifact(): FooterLinkQaArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as FooterLinkQaArtifact;
}

function changedFiles(): string[] {
  const files = new Set<string>();
  for (const args of [
    ["diff", "--name-only", "HEAD"],
    ["diff", "--cached", "--name-only"],
    ["diff", "--name-only", "origin/main...HEAD"],
    ["ls-files", "--others", "--exclude-standard"],
  ]) {
    try {
      const output = execFileSync("git", args, { cwd: ROOT, encoding: "utf8" });
      for (const line of output.split("\n")) {
        if (line.trim()) files.add(line.trim());
      }
    } catch {
      // CI and local clones expose different diff bases. Use whichever source exists.
    }
  }
  return [...files].sort();
}

function allArtifactRoutes(artifact: FooterLinkQaArtifact): string[] {
  return [
    ...artifact.footer_policy_links.en,
    ...artifact.footer_policy_links.zh,
    ...artifact.known_public_help_routes,
  ];
}

describe("HELP-FOOTER-LINK-QA-01 contract", () => {
  it("keeps footer QA as docs/contracts only", () => {
    const artifact = readArtifact();

    expect(artifact.schema_version).toBe("help_footer_link_qa.v1");
    expect(artifact.pr_id).toBe("HELP-FOOTER-LINK-QA-01");
    expect(artifact.decision).toBe("CONDITIONAL_EXISTING_FOOTER_REACHES_SUPPORT_POLICY_BUT_SERVICE_HELP_ROUTES_PENDING");
    expect(artifact.runtime_changed).toBe(false);
    expect(artifact.cms_mutation).toBe(false);
    expect(artifact.content_generated).toBe(false);
  });

  it("records current localized footer policy links as public canonical routes", () => {
    const artifact = readArtifact();

    expect(artifact.footer_policy_links.en).toEqual(
      expect.arrayContaining(["/en/support", "/en/privacy", "/en/terms", "/en/policies", "/en/method-boundaries"])
    );
    expect(artifact.footer_policy_links.zh).toEqual(
      expect.arrayContaining(["/zh/support", "/zh/privacy", "/zh/terms", "/zh/policies", "/zh/method-boundaries"])
    );
    expect(allArtifactRoutes(artifact).every((route) => route.startsWith("/en/") || route.startsWith("/zh/"))).toBe(true);
  });

  it("does not expose private service surfaces through footer QA routes", () => {
    const artifact = readArtifact();
    const routes = allArtifactRoutes(artifact);

    for (const route of routes) {
      for (const fragment of artifact.private_surface_guard.forbidden_route_fragments) {
        expect(route, `${route} must not contain ${fragment}`).not.toContain(fragment);
      }
    }
    expect(artifact.private_surface_guard.raw_identifier_examples_added).toBe(false);
    expect(artifact.private_surface_guard.private_urls_accessed).toBe(false);
  });

  it("keeps service Help destinations pending instead of inventing footer links", () => {
    const destinations = readArtifact().service_help_destinations;

    expect(destinations.map((destination) => destination.theme)).toEqual(
      expect.arrayContaining(["payment_refund", "unlock_failure", "result_recovery", "data_deletion"])
    );
    expect(destinations.every((destination) => destination.status === "pending_cms_backend_authority")).toBe(true);
    expect(destinations.every((destination) => destination.footer_link_status === "not_linked")).toBe(true);
  });

  it("records footer support and policy reachability without claiming service Help readiness", () => {
    const result = readArtifact().qa_result;

    expect(result.footer_support_reachable).toBe(true);
    expect(result.footer_privacy_reachable).toBe(true);
    expect(result.footer_terms_reachable).toBe(true);
    expect(result.footer_private_routes_exposed).toBe(false);
    expect(result.service_help_routes_ready_for_footer).toBe(false);
  });

  it("keeps the diff inside the authorized footer-link QA scope", () => {
    const files = changedFiles();
    if (files.length > 0 && files.every(isCurrentRiasecPack12AllowedFile)) {
      return;
    }

    const declaredScopeFiles = [
      "docs/operations/help-footer-link-qa.md",
      "docs/operations/generated/help-footer-link-qa.v1.json",
      "tests/contracts/help-footer-link-qa.contract.test.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ];

    for (const file of [...new Set([...files, ...declaredScopeFiles])].sort()) {
      expect(ALLOWED_FILES.has(file), `${file} is outside HELP-FOOTER-LINK-QA-01 scope`).toBe(true);
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });

  it("records deferred non-QA actions", () => {
    expect(readArtifact().deferred).toEqual(
      expect.arrayContaining([
        "runtime footer link changes",
        "CMS draft creation",
        "CMS mutation",
        "content publish",
        "service Help page route launch",
        "private URL access",
      ])
    );
  });
});
