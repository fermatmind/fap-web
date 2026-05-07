import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const FIXTURE_PATH = path.join(ROOT, "tests/contracts/fixtures/graph/core-topic-graph-edge-schema.v1.json");
const REQUIRED_EDGE_TYPES = [
  "topic_to_test",
  "topic_to_type",
  "type_to_career",
  "career_to_trait",
  "topic_to_article",
  "topic_to_faq",
  "topic_to_cta",
];

type GraphEdgeFixture = {
  edge_id: string;
  edge_type: string;
  source_entity: string;
  target_entity: string;
  source_authority: string;
  owner: string;
  review_state: string;
  visibility_state: string;
  confidence: number;
  evidence_requirement: string;
  rendered_visibility: string;
};

type GraphEdgeSchema = {
  version: string;
  authority_model: {
    graph_truth_owner: string;
    frontend_role: string;
    forbidden_authorities: string[];
  };
  entity_type_registry: string[];
  edge_type_registry: string[];
  governance_fields: {
    required: string[];
    review_states: string[];
    visibility_states: string[];
    source_authorities: string[];
    rendered_visibility_states: string[];
  };
  edge_fixtures: GraphEdgeFixture[];
  blocked_public_expansion_examples: Array<{
    source_entity: string;
    target_entity: string;
    reason: string;
  }>;
};

function readFixture(): GraphEdgeSchema {
  return JSON.parse(fs.readFileSync(FIXTURE_PATH, "utf8")) as GraphEdgeSchema;
}

describe("Core Topic Graph edge schema contract", () => {
  it("defines every Phase 1 edge type without authorizing public graph expansion", () => {
    const schema = readFixture();

    expect(schema.version).toBe("core_topic_graph.edge_schema.v1");
    expect(schema.authority_model.graph_truth_owner).toBe("backend_cms");
    expect(schema.authority_model.frontend_role).toBe("deterministic_render_only");
    expect(schema.authority_model.forbidden_authorities).toContain("frontend_local_graph_authority");
    expect(schema.authority_model.forbidden_authorities).toContain("hidden_schema_graph_stuffing");
    expect(schema.edge_type_registry.sort()).toEqual([...REQUIRED_EDGE_TYPES].sort());
    expect(schema.blocked_public_expansion_examples).toHaveLength(2);
  });

  it("requires governance fields for review, visibility, confidence, authority, and evidence", () => {
    const schema = readFixture();
    const required = schema.governance_fields.required;

    for (const field of [
      "edge_id",
      "edge_type",
      "source_entity",
      "target_entity",
      "source_authority",
      "owner",
      "review_state",
      "visibility_state",
      "confidence",
      "evidence_requirement",
      "rendered_visibility",
    ]) {
      expect(required).toContain(field);
    }

    expect(schema.governance_fields.source_authorities).not.toContain("frontend_local_graph_authority");
    expect(schema.governance_fields.rendered_visibility_states).not.toContain("hidden_schema_only");
  });

  it("keeps edge fixtures backend/CMS authoritative and visible-content gated", () => {
    const schema = readFixture();

    for (const edge of schema.edge_fixtures) {
      for (const field of schema.governance_fields.required) {
        expect(edge).toHaveProperty(field);
      }
      expect(REQUIRED_EDGE_TYPES).toContain(edge.edge_type);
      expect(schema.governance_fields.source_authorities).toContain(edge.source_authority);
      expect(edge.source_authority).not.toMatch(/^frontend/i);
      expect(schema.governance_fields.review_states).toContain(edge.review_state);
      expect(schema.governance_fields.visibility_states).toContain(edge.visibility_state);
      expect(schema.governance_fields.rendered_visibility_states).toContain(edge.rendered_visibility);
      expect(edge.confidence).toBeGreaterThanOrEqual(0);
      expect(edge.confidence).toBeLessThanOrEqual(1);
      expect(edge.evidence_requirement).toMatch(/^visible_/);
    }
  });

  it("does not allow public edges that are hidden from rendered content", () => {
    const schema = readFixture();
    const publicEdges = schema.edge_fixtures.filter((edge) => edge.visibility_state === "public");

    expect(publicEdges.length).toBeGreaterThan(0);
    expect(publicEdges.every((edge) => edge.rendered_visibility === "visible_content")).toBe(true);
    expect(schema.edge_fixtures.some((edge) => edge.edge_type === "topic_to_type" && edge.visibility_state === "candidate")).toBe(true);
    expect(schema.edge_fixtures.some((edge) => edge.edge_type === "type_to_career" && edge.visibility_state === "candidate")).toBe(true);
  });
});
