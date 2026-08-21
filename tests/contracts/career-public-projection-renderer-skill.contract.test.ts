import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const SKILLS_ROOT = path.join(ROOT, ".agents/skills");
const RENDERER_DIR = "fap-web-career-public-projection-renderer";
const SKILL_PATH = path.join(SKILLS_ROOT, RENDERER_DIR, "SKILL.md");
const CONTRACT_PATH = path.join(SKILLS_ROOT, RENDERER_DIR, "references/renderer-contract.md");

const EXPECTED_COMPONENTS = [
  "breadcrumb",
  "hero",
  "fermat_decision_card",
  "primary_cta",
  "career_snapshot_primary_locale",
  "career_snapshot_secondary_locale",
  "fit_decision_checklist",
  "riasec_fit_block",
  "personality_fit_block",
  "definition_block",
  "career_ai_description_block",
  "responsibilities_block",
  "work_context_block",
  "market_signal_card",
  "adjacent_career_comparison_table",
  "ai_impact_table",
  "career_risk_cards",
  "career_path_block",
  "contract_project_risk_block",
  "next_steps_block",
  "faq_block",
  "related_next_pages",
  "source_card",
  "review_validity_card",
  "boundary_notice",
  "final_cta",
];

describe("Career public projection renderer Skill", () => {
  it("keeps exactly one active Career Skill and no frontend content factories", () => {
    const careerSkillDirs = fs
      .readdirSync(SKILLS_ROOT, { withFileTypes: true })
      .filter((entry) => entry.isDirectory() && entry.name.toLowerCase().includes("career"))
      .map((entry) => entry.name)
      .sort();

    expect(careerSkillDirs).toEqual([RENDERER_DIR]);
    expect(careerSkillDirs.some((name) => name.endsWith("asset-factory"))).toBe(false);
  });

  it("has discoverable frontmatter and a narrow API-only responsibility", () => {
    const skill = fs.readFileSync(SKILL_PATH, "utf8");

    expect(skill).toMatch(/^---\nname: fap-web-career-public-projection-renderer\n/);
    expect(skill).toMatch(/description: .+published fap-api public projection/);
    expect(skill).toContain("sole content authority");
    expect(skill).toMatch(/never generates, repairs, completes, or publishes\s+Career content/);
    expect(skill).toContain("soft 404");
    expect(skill).toContain("fermatmind-frontend-deploy-sre");
  });

  it("locks the 26-component order and required rendering boundaries", () => {
    const contract = fs.readFileSync(CONTRACT_PATH, "utf8");
    const listed = [...contract.matchAll(/^\d+\. `([^`]+)`$/gm)].map((match) => match[1]);

    expect(listed).toEqual(EXPECTED_COMPONENTS);
    expect(contract).toMatch(/FAQ questions and\s+answers/);
    expect(contract).toMatch(/array\s+cardinality/);
    expect(contract).toMatch(/canonical, hreflang, and locale metadata/);
    expect(contract).toContain("Derived claim permissions");
    expect(contract).toMatch(/Do not reuse an earlier release's HTML/);
    expect(contract).toMatch(/Rendered-page caching must separately account/);
  });
});
