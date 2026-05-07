#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const VERSION = "mbti_core_topic_graph.readiness.v1";
const DEFAULT_GRAPH_INVENTORY_PATH = "docs/graph/generated/core-topic-graph-inventory.v1.json";
const DEFAULT_EDGE_SCHEMA_PATH = "tests/contracts/fixtures/graph/core-topic-graph-edge-schema.v1.json";
const DEFAULT_MBTI_GRAPH_PATH = "tests/contracts/fixtures/graph/mbti-core-topic-graph.v1.json";
const LOCALES = ["en", "zh"];

function parseArgs(argv) {
  const args = {
    graphInventory: DEFAULT_GRAPH_INVENTORY_PATH,
    edgeSchema: DEFAULT_EDGE_SCHEMA_PATH,
    mbtiGraph: DEFAULT_MBTI_GRAPH_PATH,
    output: "",
    csv: "",
    pretty: false,
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === "--pretty") {
      args.pretty = true;
    } else if (arg.startsWith("--graph-inventory=")) {
      args.graphInventory = arg.slice("--graph-inventory=".length);
    } else if (arg === "--graph-inventory") {
      args.graphInventory = argv[++index] || args.graphInventory;
    } else if (arg.startsWith("--edge-schema=")) {
      args.edgeSchema = arg.slice("--edge-schema=".length);
    } else if (arg === "--edge-schema") {
      args.edgeSchema = argv[++index] || args.edgeSchema;
    } else if (arg.startsWith("--mbti-graph=")) {
      args.mbtiGraph = arg.slice("--mbti-graph=".length);
    } else if (arg === "--mbti-graph") {
      args.mbtiGraph = argv[++index] || args.mbtiGraph;
    } else if (arg.startsWith("--output=")) {
      args.output = arg.slice("--output=".length);
    } else if (arg === "--output") {
      args.output = argv[++index] || "";
    } else if (arg.startsWith("--csv=")) {
      args.csv = arg.slice("--csv=".length);
    } else if (arg === "--csv") {
      args.csv = argv[++index] || "";
    }
  }

  return args;
}

function readJson(relOrAbsPath) {
  return JSON.parse(fs.readFileSync(path.resolve(ROOT, relOrAbsPath), "utf8"));
}

function unique(values) {
  return [...new Set(values)].sort();
}

function buildEdge(template, type, locale) {
  const replace = (value) =>
    String(value || "")
      .replaceAll("{type}", type)
      .replaceAll("{locale}", locale);

  return {
    edgeType: template.edge_type,
    sourceEntity: replace(template.source_entity || template.source_entity_template),
    targetEntity: replace(template.target_entity || template.target_entity_template),
    targetPath: template.target_path_template ? replace(template.target_path_template) : "",
    sourceAuthority: template.source_authority,
    owner: template.owner,
    reviewState: template.review_state,
    visibilityState: template.visibility_state,
    confidence: template.confidence,
    evidenceRequirement: template.evidence_requirement,
    renderedVisibility: template.rendered_visibility,
  };
}

function buildReport(args) {
  const inventory = readJson(args.graphInventory);
  const edgeSchema = readJson(args.edgeSchema);
  const mbtiGraph = readJson(args.mbtiGraph);
  const mbtiEntities = inventory.entities.filter((entity) => entity.cluster === "mbti");
  const mbtiPersonalityEntities = mbtiEntities.filter((entity) => entity.type === "personality_type");
  const personalityTypes = unique(mbtiPersonalityEntities.map((entity) => entity.id.replace(/^personality:/, "")));
  const allowedAuthorities = new Set(edgeSchema.governance_fields.source_authorities);
  const allowedEdgeTypes = new Set([...edgeSchema.edge_type_registry, "personality_to_faq", "personality_to_cta"]);
  const expandedEdges = [];

  for (const template of mbtiGraph.edge_templates) {
    if (template.edge_type === "topic_to_test") {
      expandedEdges.push(buildEdge(template, "", ""));
      continue;
    }

    for (const type of personalityTypes) {
      if (template.target_path_template) {
        for (const locale of LOCALES) expandedEdges.push(buildEdge(template, type, locale));
      } else {
        expandedEdges.push(buildEdge(template, type, ""));
      }
    }
  }

  const authorityViolations = expandedEdges.filter((edge) => !allowedAuthorities.has(edge.sourceAuthority));
  const edgeTypeViolations = expandedEdges.filter((edge) => !allowedEdgeTypes.has(edge.edgeType));
  const hiddenPublicEdges = expandedEdges.filter(
    (edge) => edge.visibilityState === "public" && edge.renderedVisibility !== "visible_content"
  );
  const coveredEntities = new Set();
  for (const edge of expandedEdges) {
    if (edge.sourceEntity) coveredEntities.add(edge.sourceEntity);
    if (edge.targetEntity?.startsWith("personality:") || edge.targetEntity?.startsWith("test:")) {
      coveredEntities.add(edge.targetEntity);
    }
  }

  const baselineTrueOrphanMbtiEntities = mbtiEntities.filter((entity) => (entity.orphanState.true_orphan || 0) > 0);
  const governedOrphanMbtiEntities = mbtiEntities.filter(
    (entity) => ["topic", "test", "personality_type"].includes(entity.type) && !coveredEntities.has(entity.id)
  );
  const localizedPersonalityPathCount = mbtiPersonalityEntities.reduce(
    (count, entity) => count + entity.paths.filter((itemPath) => /^\/(en|zh)\/personality\//.test(itemPath)).length,
    0
  );

  return {
    version: VERSION,
    generatedAt: "offline-reproducible",
    source: {
      graphInventory: args.graphInventory,
      graphInventoryVersion: inventory.version || "",
      edgeSchema: args.edgeSchema,
      edgeSchemaVersion: edgeSchema.version || "",
      mbtiGraph: args.mbtiGraph,
      mbtiGraphVersion: mbtiGraph.version || "",
      limitation: "Contract-backed MBTI graph readiness only; no runtime links, routes, sitemap, or llms exposure are changed.",
    },
    authority: {
      sourceAuthority: mbtiGraph.source_authority,
      frontendRole: mbtiGraph.frontend_role,
      runtimeEffect: mbtiGraph.runtime_effect,
    },
    summary: {
      personalityVariantCount: personalityTypes.length,
      localizedPersonalityPathCount,
      expandedEdgeCount: expandedEdges.length,
      edgeTypeCounts: expandedEdges.reduce((acc, edge) => {
        acc[edge.edgeType] = (acc[edge.edgeType] || 0) + 1;
        return acc;
      }, {}),
      baselineTrueOrphanMbtiEntities: baselineTrueOrphanMbtiEntities.length,
      governedOrphanMbtiEntities: governedOrphanMbtiEntities.length,
      authorityViolations: authorityViolations.length,
      edgeTypeViolations: edgeTypeViolations.length,
      hiddenPublicEdges: hiddenPublicEdges.length,
    },
    coverage: {
      topicToTest: expandedEdges.filter((edge) => edge.edgeType === "topic_to_test").length,
      topicToType: expandedEdges.filter((edge) => edge.edgeType === "topic_to_type").length,
      typeToCareer: expandedEdges.filter((edge) => edge.edgeType === "type_to_career").length,
      personalityToFaq: expandedEdges.filter((edge) => edge.edgeType === "personality_to_faq").length,
      personalityToCta: expandedEdges.filter((edge) => edge.edgeType === "personality_to_cta").length,
    },
    blockedRuntimeEffects: mbtiGraph.coverage_requirements.forbidden_runtime_effects,
    governedOrphanMbtiEntities,
    expandedEdges,
  };
}

function toCsvValue(value) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

function buildCsv(edges) {
  const headers = ["edgeType", "sourceEntity", "targetEntity", "targetPath", "sourceAuthority", "visibilityState", "renderedVisibility"];
  return [headers.join(","), ...edges.map((edge) => headers.map((header) => toCsvValue(edge[header])).join(","))].join("\n");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const report = buildReport(args);
  const json = JSON.stringify(report, null, args.pretty ? 2 : 0);

  if (args.output) {
    fs.mkdirSync(path.dirname(path.resolve(ROOT, args.output)), { recursive: true });
    fs.writeFileSync(path.resolve(ROOT, args.output), `${json}\n`);
  }
  if (args.csv) {
    fs.mkdirSync(path.dirname(path.resolve(ROOT, args.csv)), { recursive: true });
    fs.writeFileSync(path.resolve(ROOT, args.csv), `${buildCsv(report.expandedEdges)}\n`);
  }

  process.stdout.write(`${json}\n`);
}

main();
