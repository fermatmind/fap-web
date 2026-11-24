#!/usr/bin/env node
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { isAbsolute, resolve } from "node:path";
import { parseArgs } from "node:util";

import {
  profileStandardDeviation,
  selectFlatRoutes,
  simulateRankedPool,
  validateCareerRecommendation,
} from "../lib/career/curatedPoolSchema.ts";

const root = new URL("../", import.meta.url);
const apiAssetDir = "backend/content_assets/career";
const sampleA = [50, 65, 60, 55, 52.5, 40];
const sampleB = [62.5, 55, 37.5, 72.5, 67.5, 75];

function jsonFromWeb(relative) {
  return JSON.parse(readFileSync(new URL(relative, root), "utf8"));
}

function sha256(data) {
  return createHash("sha256").update(data).digest("hex");
}

function uniqueScenes(chosen) {
  return new Set(chosen.map(({ scene_cluster }) => scene_cluster)).size === chosen.length;
}

function verifySimulations({ pool, routes, scenes }, release) {
  const entries = new Map(pool.entries.map((entry) => [entry.slug, entry]));
  const a = selectFlatRoutes(sampleA, routes);
  assert(profileStandardDeviation(sampleA) < 10);
  assert.deepEqual(a?.flatMap(({ example_slugs }) => example_slugs),
    ["market-research-analysts", "instructional-coordinators"]);
  const b = simulateRankedPool(sampleB, pool, scenes, release);
  assert.equal(b.topTwoGap, 2.5);
  assert.equal(b.chosen.length, 5);
  assert(uniqueScenes(b.chosen));
  assert(b.chosen.filter(({ exposure_tier }) => exposure_tier === "specialized_track").length <= 2);
  assert(b.chosen.filter(({ scene_cluster }) => scene_cluster === "funeral_memorial_services").length <= 1);
  assert(b.chosen.filter(({ slug }) => /(?:customer-service|call-center|telemarketers|telephone-operators)/u.test(slug)).length <= 1);
  assert(b.chosen.every(({ slug }) => !pool.baseline.excluded_slugs.p0_titles.includes(slug)));

  // Every realizable ordering with ties is represented once by its contiguous ranks.
  // Selection has no dependence on the numeric gaps once the profile passes the SD gate.
  let flatCases = 0;
  for (let encoding = 0; encoding < 6 ** 6; encoding += 1) {
    const ranks = Array.from({ length: 6 }, (_, index) => Math.floor(encoding / 6 ** index) % 6);
    if (new Set(ranks).size !== Math.max(...ranks) + 1) continue;
    const pair = selectFlatRoutes(ranks, routes);
    assert(pair?.length === 2);
    const [left, right] = pair.map(({ example_slugs }) =>
      example_slugs.map((slug) => entries.get(slug)?.scene_cluster));
    assert(left.length && right.length && left.every((scene) => scene && !right.includes(scene)));
    assert(right.every(Boolean));
    flatCases += 1;
  }
  assert.equal(flatCases, 4683);

  const summarize = ({ slug, display_name_zh, scene_cluster, exposure_tier }) =>
    ({ slug, display_name_zh, scene_cluster, exposure_tier });
  return {
    sampleA: { state: "flat", sd: profileStandardDeviation(sampleA), routes: a
      .map(({ example_slugs }) => example_slugs.map((slug) => summarize(entries.get(slug)))) },
    sampleB: { state: "ranked", topTwoGap: b.topTwoGap, topFive: b.chosen.map(summarize) },
    flatCases,
  };
}

function verifyApi(pool, apiRoot, mode) {
  const repository = resolve(apiRoot);
  const gitRead = (...args) => execFileSync("git", ["--no-optional-locks", "-C", repository, ...args],
    { maxBuffer: 8 * 1024 * 1024 });
  const { api_commit, manifest_sha256, t2_fix_commit, t2_slugs } = pool.baseline;
  const read = (relative) => mode === "prod"
    ? gitRead("show", `${api_commit}:${apiAssetDir}/${relative}`)
    : readFileSync(resolve(repository, apiAssetDir, relative));
  const manifestRaw = read("current/manifest.json");
  const authority = JSON.parse(read("career_current_authority_release.v1.json"));
  assert.equal(sha256(manifestRaw), authority.manifest_sha256, "manifest must match its release authority");
  if (mode === "prod") {
    assert.equal(authority.manifest_sha256, manifest_sha256, "production manifest differs from signed baseline");
    const files = gitRead("diff-tree", "--no-commit-id", "--name-only", "-r", t2_fix_commit)
      .toString("utf8").trim().split("\n");
    const prefix = `${apiAssetDir}/current/careers/`;
    const actualT2 = new Set(files.filter((file) => file.startsWith(prefix) && file.endsWith(".json"))
      .map((file) => file.slice(prefix.length).split("/")[0]));
    assert.deepEqual([...actualT2].sort(), [...t2_slugs].sort(), "T2 membership differs from frozen patch");
  }
  assert(Array.isArray(authority.manual_hold_slugs), "invalid authority holds");
  const holds = new Set(authority.manual_hold_slugs);
  const zhFiles = JSON.parse(manifestRaw).files.filter((file) => file.locale === "zh-CN");
  const manifest = new Map(zhFiles.map((file) => [file.canonical_slug, file]));
  assert.equal(manifest.size, zhFiles.length, "duplicate Current identity");
  if (mode === "prod") assert.equal(manifest.size, 1046);
  for (const entry of pool.entries) {
    const { slug, evidence_meta, comparison_facets } = entry;
    assert(!holds.has(slug), `manual hold: ${slug}`);
    const file = manifest.get(slug);
    assert.equal(file?.path, `careers/${slug}/zh-CN.json`, `no canonical zh-CN Current file: ${slug}`);
    const bytes = read(`current/${file.path}`);
    assert.equal(bytes.length, file.bytes, `Current byte count mismatch: ${slug}`);
    assert.equal(sha256(bytes), file.sha256, `Current manifest hash mismatch: ${slug}`);
    assert.equal(file.sha256, evidence_meta.current_sha256, `Current evidence drift: ${slug}`);
    const current = JSON.parse(bytes);
    assert.equal(current.locale, "zh-CN");
    assert.equal(current.subject.canonical_slug, slug);
    const items = current.blocks.filter((block) => block.availability === "available")
      .flatMap((block) => block.items).filter((item) => item.availability === "available");
    const byId = new Map(items.map((item) => [item.id, item]));
    const urlsById = new Map(items.filter((item) => item.type === "sources")
      .flatMap((item) => item.data.entries.map(({ id, url }) => [id, url])));
    for (const source of evidence_meta.sources) {
      assert.equal(source.url, urlsById.get(source.id), `untraceable source: ${slug}/${source.id}`);
    }
    for (const field of ["tasks", "work_style", "work_conditions"]) {
      for (const { text, basis } of comparison_facets[field]) {
        const item = byId.get(basis.current_item_id);
        assert(item && basis.source_ids.every((id) => item.source_refs.includes(id)), `untraceable field: ${slug}/${field}`);
        if (field === "tasks") {
          assert(item.copy_key === "career.item.responsibilities-block" && item.data.entries.includes(text),
            `task differs from Current: ${slug}`);
        }
      }
    }
  }
}

try {
  const { values } = parseArgs({
    options: { "api-root": { type: "string" }, "api-mode": { type: "string" } },
  });
  const apiRoot = values["api-root"];
  const mode = values["api-mode"];
  assert(apiRoot === undefined && mode === undefined ||
    typeof apiRoot === "string" && isAbsolute(apiRoot) && (mode === "prod" || mode === "wave1"),
  "usage: validate-career-recommendation-pool.mjs [--api-root <absolute path> --api-mode=prod|wave1]");
  const release = jsonFromWeb("lib/career/interestRelease.json");
  const dir = "content/career-recommendation/";
  const assets = validateCareerRecommendation(jsonFromWeb(dir + "riasec-curated-pool.zh-CN.json"),
    jsonFromWeb(dir + "scene-clusters.zh-CN.json"), jsonFromWeb(dir + "riasec-flat-routes.zh-CN.json"), release);
  const simulations = verifySimulations(assets, release);
  if (apiRoot) verifyApi(assets.pool, apiRoot, mode);
  console.log(JSON.stringify({ mode: mode ?? "web-only",
    careers: assets.pool.entries.length, scenes: Object.keys(assets.scenes.clusters).length, ...simulations }, null, 2));
} catch (error) {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
