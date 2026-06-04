import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/operations/generated/support-flow-smoke.v1.json");
const ALLOWED_FILES = new Set([
  "docs/operations/support-flow-smoke.md",
  "docs/operations/generated/support-flow-smoke.v1.json",
  "tests/contracts/support-flow-smoke.contract.test.ts",
  "docs/codex/pr-train.yaml",
  "docs/codex/pr-train-state.json",
]);

type SupportFlowSmokeArtifact = {
  schema_version: string;
  pr_id: string;
  decision: string;
  runtime_changed: boolean;
  cms_mutation: boolean;
  content_generated: boolean;
  private_url_accessed: boolean;
  raw_identifier_added: boolean;
  public_support_routes: string[];
  route_behaviors: Array<{ route_family: string; routes: string[]; source_of_truth: string; status: string; gap: string }>;
  service_support_readiness: Array<{ theme: string; status: string; missing_fields: string[] }>;
  support_submission_boundary: {
    public_form_present: boolean;
    exact_support_contact_known: boolean;
    safe_submission_contract_present: boolean;
    raw_private_identifier_required: boolean;
    overcollection_risk: string;
  };
  private_surface_guard: {
    forbidden_route_fragments: string[];
    forbidden_identifier_fields: string[];
    private_urls_accessed: boolean;
    raw_identifiers_added: boolean;
  };
  deferred: string[];
};

function readArtifact(): SupportFlowSmokeArtifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as SupportFlowSmokeArtifact;
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

describe("SUPPORT-FLOW-SMOKE-01 contract", () => {
  it("keeps support-flow smoke as docs/contracts only", () => {
    const artifact = readArtifact();

    expect(artifact.schema_version).toBe("support_flow_smoke.v1");
    expect(artifact.pr_id).toBe("SUPPORT-FLOW-SMOKE-01");
    expect(artifact.decision).toBe("CONDITIONAL_PUBLIC_SUPPORT_HUB_EXISTS_BUT_SERVICE_SUPPORT_FLOW_NOT_READY");
    expect(artifact.runtime_changed).toBe(false);
    expect(artifact.cms_mutation).toBe(false);
    expect(artifact.content_generated).toBe(false);
    expect(artifact.private_url_accessed).toBe(false);
    expect(artifact.raw_identifier_added).toBe(false);
  });

  it("records only localized public canonical support routes", () => {
    const routes = readArtifact().public_support_routes;

    expect(routes).toEqual(
      expect.arrayContaining([
        "/en/support",
        "/zh/support",
        "/en/help",
        "/zh/help",
        "/en/help/faq",
        "/zh/help/faq",
        "/en/help/contact",
        "/zh/help/contact",
        "/en/support/articles/[slug]",
        "/zh/support/articles/[slug]",
        "/en/support/guides/[slug]",
        "/zh/support/guides/[slug]",
      ])
    );
    expect(routes.every((route) => route.startsWith("/en/") || route.startsWith("/zh/"))).toBe(true);
  });

  it("does not include private surfaces or raw identifiers in the route smoke artifact", () => {
    const artifact = readArtifact();
    const serialized = JSON.stringify(artifact);

    for (const route of artifact.public_support_routes) {
      for (const fragment of artifact.private_surface_guard.forbidden_route_fragments) {
        expect(route, `${route} must not contain ${fragment}`).not.toContain(fragment);
      }
    }
    for (const field of artifact.private_surface_guard.forbidden_identifier_fields) {
      expect(serialized, `${field} may be named only inside the forbidden identifier list`).toContain(field);
    }
    expect(artifact.private_surface_guard.private_urls_accessed).toBe(false);
    expect(artifact.private_surface_guard.raw_identifiers_added).toBe(false);
  });

  it("keeps commercial support readiness blocked for unresolved service workflows", () => {
    const readiness = readArtifact().service_support_readiness;

    expect(readiness.map((item) => item.theme)).toEqual(
      expect.arrayContaining(["unlock_failure", "payment_refund", "data_deletion"])
    );
    expect(readiness.every((item) => item.status === "no_go")).toBe(true);
    expect(readiness.flatMap((item) => item.missing_fields)).toEqual(
      expect.arrayContaining(["handling_time", "support_contact"])
    );
  });

  it("records submission boundaries without inventing a support form or contact", () => {
    const boundary = readArtifact().support_submission_boundary;

    expect(boundary.public_form_present).toBe(false);
    expect(boundary.exact_support_contact_known).toBe(false);
    expect(boundary.safe_submission_contract_present).toBe(false);
    expect(boundary.raw_private_identifier_required).toBe(false);
    expect(boundary.overcollection_risk).toBe("Unknown");
  });

  it("keeps the diff inside the authorized support-flow smoke scope", () => {
    const declaredScopeFiles = [
      "docs/operations/support-flow-smoke.md",
      "docs/operations/generated/support-flow-smoke.v1.json",
      "tests/contracts/support-flow-smoke.contract.test.ts",
      "docs/codex/pr-train.yaml",
      "docs/codex/pr-train-state.json",
    ];

    for (const file of [...new Set([...changedFiles(), ...declaredScopeFiles])].sort()) {
      expect(ALLOWED_FILES.has(file), `${file} is outside SUPPORT-FLOW-SMOKE-01 scope`).toBe(true);
      expect(file.startsWith("app/")).toBe(false);
      expect(file.startsWith("components/")).toBe(false);
      expect(file.startsWith("lib/")).toBe(false);
      expect(file.startsWith("public/")).toBe(false);
    }
  });

  it("records deferred non-smoke actions", () => {
    expect(readArtifact().deferred).toEqual(
      expect.arrayContaining([
        "support form implementation",
        "runtime support flow changes",
        "CMS draft creation",
        "CMS mutation",
        "content publish",
        "service Help route launch",
        "private URL access",
      ])
    );
  });
});
