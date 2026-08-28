import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
  CareerDossierOutlookTransitions,
  CareerDossierProgression,
  CareerDossierWorkRisk,
  supportsCareerOutlookTransitions,
  supportsCareerProgression,
  supportsCareerWorkRisk,
} from "@/components/career/display/CareerDossierDecisionJourney";
import type {
  CareerPublishedOutlookTransitions,
  CareerPublishedProgression,
  CareerPublishedWorkRisk,
} from "@/lib/career/publishedComponentContract";

const sources = Array.from({ length: 4 }, (_, index) => ({ id: `s${index}`, label: `Source ${index}`, href: `https://example.com/${index}`, scope: "Evidence scope" }));

const risk: CareerPublishedWorkRisk = {
  schema_version: "career.work_risk.v1", heading: "Risk heading", direct_answer: "Direct risk answer", evidence_scope: "Evidence scope", boundary: "Boundary",
  context_links: [{ label: "AI context", href: "#career-visual-group-ai-impact" }], source_links: sources,
  risks: Array.from({ length: 6 }, (_, index) => ({ id: `r${index}`, title: `Risk ${index}`, scenario: "Scenario", affected_roles: "Roles", consequence: "Consequence", mitigation: "Mitigation", evidence_refs: ["s0"] })),
};

const progression: CareerPublishedProgression = {
  schema_version: "career.career_progression.v1", heading: "Progression heading", direct_answer: "Direct progression answer", boundary: "No guaranteed promotion",
  locale_requirements: { jurisdiction: "Jurisdiction", summary: "Requirements", credential_boundary: "Credential boundary" }, source_links: sources,
  tracks: Array.from({ length: 3 }, (_, track) => ({ id: `t${track}`, title: `Track ${track}`, stages: Array.from({ length: 4 }, (_, stage) => ({ role: `Role ${track}-${stage}`, responsibility: "Responsibility", readiness_evidence: "Readiness", credentials: "Credentials", next_moves: "Next move" })) })),
  competence_ladder: Array.from({ length: 4 }, (_, index) => ({ stage: `Level ${index}`, description: "Capability evidence" })),
};

const outlook: CareerPublishedOutlookTransitions = {
  schema_version: "career.outlook_transitions.v1", heading: "Outlook heading", direct_answer: "Direct outlook answer", source_links: sources,
  context_links: [{ label: "AI context", href: "#career-visual-group-ai-impact" }],
  outlook_evidence: Array.from({ length: 3 }, (_, index) => ({ source_id: `s${index}`, geography: "Geography", occupation_scope: "Occupation", horizon: "2030", metric: "Metric", value: `Value ${index}`, interpretation: "Interpretation", limitation: "Limitation" })),
  transitions: Array.from({ length: 6 }, (_, index) => ({ target_slug: `target-${index}`, target_title: `Target ${index}`, target_href: `/en/career/jobs/target-${index}`, shared_capabilities: "Shared", capability_gaps: "Gap", transition_distance: "Near" })),
};

describe("career dossier decision journey contract", () => {
  it("renders six structured risks without reverting to the legacy risk list", () => {
    expect(supportsCareerWorkRisk(risk)).toBe(true);
    render(<CareerDossierWorkRisk value={risk} locale="en" sectionLabel="Work pressure, risks, and professional boundaries" sectionLabelId="risk-label" />);
    expect(screen.getByText("Work pressure, risks, and professional boundaries")).toHaveAttribute("id", "risk-label");
    expect(screen.getByRole("heading", { name: "Risk heading" })).toBeInTheDocument();
    expect(screen.getAllByRole("article")).toHaveLength(6);
  });

  it("renders three career tracks with four evidence-led stages", () => {
    expect(supportsCareerProgression(progression)).toBe(true);
    render(<CareerDossierProgression value={progression} locale="en" sectionLabel="Entry, credentials, and career development" sectionLabelId="path-label" />);
    expect(screen.getAllByRole("heading", { name: /^Track / })).toHaveLength(3);
    expect(screen.getAllByRole("heading", { name: /^Role / })).toHaveLength(12);
  });

  it("renders contextual outlook evidence and crawlable transition links", () => {
    expect(supportsCareerOutlookTransitions(outlook)).toBe(true);
    render(<CareerDossierOutlookTransitions value={outlook} locale="en" sectionLabel="Career outlook and related transitions" sectionLabelId="outlook-label" />);
    expect(screen.getAllByRole("link", { name: /View career profile/ })).toHaveLength(6);
    expect(screen.getByRole("link", { name: /Target 0/ })).toHaveAttribute("href", "/en/career/jobs/target-0");
  });

  it("rejects invalid versions before specialized rendering", () => {
    expect(supportsCareerWorkRisk({ ...risk, schema_version: "career.work_risk.v0" })).toBe(false);
    expect(supportsCareerProgression({ ...progression, tracks: [] })).toBe(false);
    expect(supportsCareerOutlookTransitions({ ...outlook, transitions: null })).toBe(false);
  });
});
