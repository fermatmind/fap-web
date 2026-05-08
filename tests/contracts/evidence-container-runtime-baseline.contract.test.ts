import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  EVIDENCE_BLOCK_TYPES,
  EVIDENCE_PAGE_FAMILIES,
  EVIDENCE_READINESS_STATES,
  EVIDENCE_RUNTIME_BASELINE,
  getEvidenceRuntimeFamilyStatus,
} from "@/lib/geo/evidenceContainer";

const ROOT = process.cwd();
const ARTIFACT_PATH = path.join(ROOT, "docs/geo/generated/evidence-container-runtime-baseline.v1.json");
const DOC_PATH = path.join(ROOT, "docs/geo/evidence-container-runtime-baseline.md");
const STATE_PATH = path.join(ROOT, "docs/codex/pr-train-phase-1b-state.json");

type PageFamilyRow = {
  pageFamily: string;
  readiness: string;
  sourceType: string;
  requiredBlocks: string[];
  runtimeEvidence: string[];
  notes: string;
};

type Artifact = {
  version: string;
  scope: string;
  trainName: string;
  runtimeBehaviorChanged: boolean;
  contentExpanded: boolean;
  hiddenSchemaAdded: boolean;
  llmsExposureChanged: boolean;
  sitemapUrlSetChanged: boolean;
  readinessStates: string[];
  pageFamilies: PageFamilyRow[];
  hardRules: string[];
  mustNotTouch: string[];
};

function readArtifact(): Artifact {
  return JSON.parse(fs.readFileSync(ARTIFACT_PATH, "utf8")) as Artifact;
}

function readSource(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

describe("Evidence Container runtime baseline", () => {
  it("registers PR5 after merged PR4 without changing train order", () => {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, "utf8")) as {
      train_name: string;
      prs: Array<{ id: string; status: string; branch: string; depends_on: string[] }>;
    };
    const byId = new Map(state.prs.map((pr) => [pr.id, pr]));

    expect(state.train_name).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(byId.get("PR-PRA1B-04")).toMatchObject({
      status: "merged",
      branch: "codex/pr-pra1b-04-article-personality-jsonld-projection-gates",
    });
    expect(byId.get("PR-PRA1B-05")).toMatchObject({
      status: "in_progress",
      branch: "codex/pr-pra1b-05-evidence-container-runtime-baseline",
      depends_on: ["PR-PRA1B-04"],
    });
  });

  it("defines the baseline without content, schema, sitemap, or llms expansion", () => {
    const artifact = readArtifact();

    expect(artifact.version).toBe("geo.evidence_container_runtime_baseline.v1");
    expect(artifact.scope).toBe("PR-PRA1B-05");
    expect(artifact.trainName).toBe("public-runtime-authority-phase-1b-remediation-train");
    expect(artifact.runtimeBehaviorChanged).toBe(true);
    expect(artifact.contentExpanded).toBe(false);
    expect(artifact.hiddenSchemaAdded).toBe(false);
    expect(artifact.llmsExposureChanged).toBe(false);
    expect(artifact.sitemapUrlSetChanged).toBe(false);
    expect(artifact.readinessStates).toEqual([...EVIDENCE_READINESS_STATES]);
  });

  it("covers the required public page families with partial readiness, not asserted GEO completion", () => {
    const artifact = readArtifact();
    const rowsByFamily = new Map(artifact.pageFamilies.map((row) => [row.pageFamily, row]));

    expect(artifact.pageFamilies.map((row) => row.pageFamily)).toEqual([...EVIDENCE_PAGE_FAMILIES]);
    expect(EVIDENCE_RUNTIME_BASELINE.map((row) => row.pageFamily)).toEqual([...EVIDENCE_PAGE_FAMILIES]);

    for (const family of EVIDENCE_PAGE_FAMILIES) {
      const row = rowsByFamily.get(family);
      const runtimeStatus = getEvidenceRuntimeFamilyStatus(family);

      expect(row, family).toBeDefined();
      expect(row?.readiness, family).toBe(runtimeStatus.readiness);
      expect(row?.readiness, family).toBe("partial");
      expect(row?.requiredBlocks.length, family).toBeGreaterThan(0);
      expect(row?.notes.trim(), family).not.toBe("");

      for (const block of row?.requiredBlocks ?? []) {
        expect(EVIDENCE_BLOCK_TYPES).toContain(block);
      }
    }
  });

  it("anchors visible runtime markers on AnswerSurfaceSection and career evidence components", () => {
    const answerSurface = readSource("components/content/AnswerSurfaceSection.tsx");
    const evidenceDrawer = readSource("components/career/v1/EvidenceDrawer.tsx");
    const careerDisplayEvidence = readSource("components/career/display/EvidenceContainer.tsx");

    expect(answerSurface).toContain("data-evidence-container");
    expect(answerSurface).toContain("data-evidence-page-family");
    expect(answerSurface).toContain('data-evidence-block={pageFamily ? "quick_answer" : undefined}');
    expect(answerSurface).toContain('data-evidence-block={pageFamily ? "faq" : undefined}');
    expect(answerSurface).toContain('data-evidence-block={pageFamily ? "next_step" : undefined}');
    expect(evidenceDrawer).toContain("data-evidence-block={evidenceBlock}");
    expect(careerDisplayEvidence).toContain('data-evidence-page-family="career_job_detail"');
    expect(careerDisplayEvidence).toContain('data-evidence-block="evidence_facts"');
  });

  it("anchors initial page-family consumers without touching private/share flows", () => {
    const consumers = [
      ["app/(localized)/[locale]/topics/[slug]/page.tsx", 'pageFamily="topic_detail"'],
      ["app/(localized)/[locale]/articles/[slug]/page.tsx", 'pageFamily="article_detail"'],
      ["app/(localized)/[locale]/personality/[type]/page.tsx", 'pageFamily="personality_detail"'],
      ["app/(localized)/[locale]/career/guides/[slug]/page.tsx", 'pageFamily="career_guide"'],
      ["app/(localized)/[locale]/tests/[slug]/page.tsx", 'data-evidence-page-family="test_detail"'],
      ["app/(localized)/[locale]/career/jobs/[slug]/page.tsx", 'data-evidence-page-family="career_job_detail"'],
      [
        "app/(localized)/[locale]/career/recommendations/mbti/[type]/page.tsx",
        'data-evidence-page-family="career_recommendation_detail"',
      ],
    ] as const;

    for (const [sourcePath, token] of consumers) {
      expect(readSource(sourcePath), `${sourcePath} missing ${token}`).toContain(token);
    }

    const shareClient = readSource("app/(localized)/[locale]/share/[id]/ShareClient.tsx");
    expect(shareClient).not.toContain("data-evidence-container");
  });

  it("documents FAQ-only, hidden-schema, private-flow, and expansion boundaries", () => {
    const artifact = readArtifact();
    const doc = fs.readFileSync(DOC_PATH, "utf8");

    expect(artifact.hardRules).toEqual(
      expect.arrayContaining([
        "FAQ-only is not Evidence-ready",
        "hidden schema is not Evidence-ready",
        "Evidence must be visible",
        "private/result/pay/order/share/take flows are not public Evidence targets",
        "no content expansion",
        "no llms-full exposure expansion",
      ])
    );
    expect(artifact.mustNotTouch).toEqual(
      expect.arrayContaining(["generated content", "hidden FAQ/schema", "report/private flows", "llms-full exposure", "sitemap URL set"])
    );
    expect(doc).toContain("Runtime behavior changed: yes");
    expect(doc).toContain("FAQ-only pages are not Evidence-ready");
    expect(doc).toContain("No `llms-full` exposure is expanded");
  });
});
