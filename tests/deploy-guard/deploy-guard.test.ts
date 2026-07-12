import { describe, it, expect } from "vitest";
import {
  evaluateDeployGuard,
  validateManualRiskApproval,
  GuardContext,
  RISKY_PATH_PATTERNS,
  RISKY_LABEL_PATTERNS,
  DEPLOY_SHA_RE,
  classifyRequiredChecks,
} from "@/scripts/ci/deploy-guard";

const VALID_SHA = "a".repeat(40);
const PR_1639_SHA = "46d4fcd8ae81499d78cc665019e9a91cf4d8858e";
const APPROVAL_1639 = `APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:${PR_1639_SHA}`;

function safeCtx(overrides: Partial<GuardContext> = {}): GuardContext {
  return {
    isManualDispatch: false,
    deploySha: VALID_SHA,
    manualRiskApproval: "",
    associatedPull: {
      number: 1639,
      title: "ENNEAGRAM-LLMS-PERSONALITY-PROFILES-FEED-GATE-REPAIR-01",
      labels: [],
      changedFiles: ["app/index.ts"],
    },
    ...overrides,
  };
}

// === validateManualRiskApproval ===

describe("validateManualRiskApproval", () => {
  it("rejects empty approval", () => {
    expect(validateManualRiskApproval("", PR_1639_SHA)).toBe(false);
  });

  it("rejects approval without prefix", () => {
    expect(validateManualRiskApproval(PR_1639_SHA, PR_1639_SHA)).toBe(false);
  });

  it("rejects approval with wrong SHA", () => {
    expect(validateManualRiskApproval(`APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:${VALID_SHA}`, PR_1639_SHA)).toBe(
      false
    );
  });

  it("rejects truncated approval", () => {
    expect(validateManualRiskApproval("APPROVE_RISKY_FAP_WEB_PRODUCTION_DEPLOY:", PR_1639_SHA)).toBe(false);
  });

  it("accepts exact match", () => {
    expect(validateManualRiskApproval(APPROVAL_1639, PR_1639_SHA)).toBe(true);
  });
});

// === evaluateDeployGuard ===

describe("evaluateDeployGuard — basic validation", () => {
  it("fails when manual dispatch has no deploySha", () => {
    const r = evaluateDeployGuard(safeCtx({ isManualDispatch: true, deploySha: "" }));
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain("deploy_sha");
  });

  it("fails when deploy SHA is not 40 hex chars", () => {
    const r = evaluateDeployGuard(safeCtx({ deploySha: "abc123" }));
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain("40");
  });

  it("fails when no associated PR found", () => {
    const r = evaluateDeployGuard(safeCtx({ associatedPull: null }));
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain("merged main PR");
  });
});

describe("evaluateDeployGuard — non-risky passes", () => {
  it("passes for safe runtime-only change", () => {
    const r = evaluateDeployGuard(
      safeCtx({ associatedPull: { number: 1000, title: "fix: typo", labels: [], changedFiles: ["app/page.tsx"] } })
    );
    expect(r.allowed).toBe(true);
    expect(r.reason).toBe("passed");
    expect(r.manualRiskApprovalUsed).toBe(false);
  });
});

describe("evaluateDeployGuard — risky labels", () => {
  it.each(["no-auto-production", "cms", "llms", "search", "sitemap", "deploy", "content-release"])(
    'blocks risky label "%s"',
    (label) => {
      const r = evaluateDeployGuard(safeCtx({ associatedPull: { number: 1000, title: "fix", labels: [label], changedFiles: ["app/page.tsx"] } }));
      expect(r.allowed).toBe(false);
      expect(r.riskyLabels.length).toBeGreaterThan(0);
    }
  );
});

describe("evaluateDeployGuard — risky files", () => {
  it.each([
    "app/llms.txt/route.ts",
    "app/llms-full.txt/route.ts",
    "lib/seo/backendSitemapSource.ts",
    "app/sitemap.xml/route.ts",
    "app/api/content-release/route.ts",
    ".github/workflows/deploy-production.yml",
    "scripts/deploy_web_pm2.sh",
    "scripts/seo/warm-sitemap.ts",
  ])('blocks risky file "%s"', (file) => {
    const r = evaluateDeployGuard(
      safeCtx({ associatedPull: { number: 1639, title: "fix", labels: [], changedFiles: [file] } })
    );
    expect(r.allowed).toBe(false);
    expect(r.riskyFiles).toContain(file);
  });
});

describe("evaluateDeployGuard — manual risk approval", () => {
  const riskyFiles = [
    "app/llms.txt/route.ts",
    "app/llms-full.txt/route.ts",
    "lib/seo/backendSitemapSource.ts",
  ];

  it("bypasses risky check with valid approval on manual dispatch", () => {
    const r = evaluateDeployGuard(
      safeCtx({
        isManualDispatch: true,
        deploySha: PR_1639_SHA,
        manualRiskApproval: APPROVAL_1639,
        associatedPull: { number: 1639, title: "fix", labels: [], changedFiles: riskyFiles },
      })
    );
    expect(r.allowed).toBe(true);
    expect(r.manualRiskApprovalUsed).toBe(true);
    expect(r.reason).toContain("manual risk approval");
  });

  it("rejects when approval SHA does not match deploy SHA", () => {
    const r = evaluateDeployGuard(
      safeCtx({
        isManualDispatch: true,
        deploySha: VALID_SHA,
        manualRiskApproval: APPROVAL_1639,
        associatedPull: { number: 1639, title: "fix", labels: [], changedFiles: riskyFiles },
      })
    );
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain("invalid");
  });

  it("ignores approval on auto-deploy (workflow_run)", () => {
    const r = evaluateDeployGuard(
      safeCtx({
        isManualDispatch: false,
        deploySha: PR_1639_SHA,
        manualRiskApproval: APPROVAL_1639,
        associatedPull: { number: 1639, title: "fix", labels: [], changedFiles: riskyFiles },
      })
    );
    expect(r.allowed).toBe(false);
    expect(r.riskyFiles.length).toBeGreaterThan(0);
  });

  it("rejects missing deploySha even with approval", () => {
    const r = evaluateDeployGuard(
      safeCtx({ isManualDispatch: true, deploySha: "", manualRiskApproval: APPROVAL_1639 })
    );
    expect(r.allowed).toBe(false);
    expect(r.reason).toContain("deploy_sha");
  });
});

describe("evaluateDeployGuard — #1639 Enneagram scenario", () => {
  const enneagramFiles = [
    "app/llms.txt/route.ts",
    "app/llms-full.txt/route.ts",
    "lib/seo/backendSitemapSource.ts",
  ];

  it("is blocked under auto-deploy (workflow_run)", () => {
    const r = evaluateDeployGuard(
      safeCtx({
        isManualDispatch: false,
        deploySha: PR_1639_SHA,
        associatedPull: { number: 1639, title: "ENNEAGRAM-LLMS-PERSONALITY-PROFILES-FEED-GATE-REPAIR-01", labels: [], changedFiles: enneagramFiles },
      })
    );
    expect(r.allowed).toBe(false);
    expect(r.riskyFiles).toEqual(enneagramFiles);
  });

  it("is blocked under manual dispatch without approval", () => {
    const r = evaluateDeployGuard(
      safeCtx({
        isManualDispatch: true,
        deploySha: PR_1639_SHA,
        associatedPull: { number: 1639, title: "ENNEAGRAM-LLMS-PERSONALITY-PROFILES-FEED-GATE-REPAIR-01", labels: [], changedFiles: enneagramFiles },
      })
    );
    expect(r.allowed).toBe(false);
  });

  it("is allowed under manual dispatch with valid approval", () => {
    const r = evaluateDeployGuard(
      safeCtx({
        isManualDispatch: true,
        deploySha: PR_1639_SHA,
        manualRiskApproval: APPROVAL_1639,
        associatedPull: { number: 1639, title: "ENNEAGRAM-LLMS-PERSONALITY-PROFILES-FEED-GATE-REPAIR-01", labels: [], changedFiles: enneagramFiles },
      })
    );
    expect(r.allowed).toBe(true);
    expect(r.manualRiskApprovalUsed).toBe(true);
  });
});

describe("DEPLOY_SHA_RE", () => {
  it("accepts valid 40-char hex", () => {
    expect(DEPLOY_SHA_RE.test("a".repeat(40))).toBe(true);
    expect(DEPLOY_SHA_RE.test(PR_1639_SHA)).toBe(true);
  });

  it("rejects short SHA", () => {
    expect(DEPLOY_SHA_RE.test("abc123")).toBe(false);
  });

  it("rejects uppercase", () => {
    expect(DEPLOY_SHA_RE.test("A".repeat(40))).toBe(false);
  });

  it("rejects non-hex", () => {
    expect(DEPLOY_SHA_RE.test("g".repeat(40))).toBe(false);
  });
});

describe("classifyRequiredChecks", () => {
  const required = ["build", "contracts"] as const;

  it("waits while required checks are missing or running", () => {
    expect(classifyRequiredChecks(required, [])).toEqual({
      state: "waiting",
      pending: ["build", "contracts"],
      failed: [],
    });
    expect(
      classifyRequiredChecks(required, [
        { id: 1, name: "build", status: "in_progress", conclusion: null },
        { id: 2, name: "contracts", status: "queued", conclusion: null },
      ]).state
    ).toBe("waiting");
  });

  it("is ready only when every newest required run succeeds", () => {
    expect(
      classifyRequiredChecks(required, [
        { id: 1, name: "build", status: "completed", conclusion: "success" },
        { id: 2, name: "contracts", status: "completed", conclusion: "success" },
      ])
    ).toEqual({ state: "ready", pending: [], failed: [] });
  });

  it.each(["failure", "cancelled", "timed_out", "skipped", "action_required"])(
    "fails closed for a %s conclusion",
    (conclusion) => {
      const result = classifyRequiredChecks(required, [
        { id: 1, name: "build", status: "completed", conclusion },
        { id: 2, name: "contracts", status: "completed", conclusion: "success" },
      ]);
      expect(result.state).toBe("failed");
      expect(result.failed).toEqual([{ name: "build", conclusion }]);
    }
  );

  it("uses a successful rerun instead of an older failed run", () => {
    expect(
      classifyRequiredChecks(required, [
        { id: 1, name: "build", status: "completed", conclusion: "failure" },
        { id: 3, name: "build", status: "completed", conclusion: "success" },
        { id: 2, name: "contracts", status: "completed", conclusion: "success" },
      ]).state
    ).toBe("ready");
  });
});

describe("RISKY_PATH_PATTERNS", () => {
  it("matches Enneagram #1639 changed files", () => {
    const files = ["app/llms.txt/route.ts", "app/llms-full.txt/route.ts", "lib/seo/backendSitemapSource.ts"];
    for (const f of files) {
      expect(RISKY_PATH_PATTERNS.some((p) => p.test(f))).toBe(true);
    }
  });
});

describe("RISKY_LABEL_PATTERNS", () => {
  it("matches no-auto-production label", () => {
    expect(RISKY_LABEL_PATTERNS.some((p) => p.test("no-auto-production"))).toBe(true);
  });
});
