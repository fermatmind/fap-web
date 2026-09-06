import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const uploadArtifactV7 = "actions/upload-artifact@043fb46d1a93c77aae656e7c1c64a875d1fc6a0a # v7";
const workflowSources = ["ci.yml", "deploy.yml"].map((name) =>
  readFileSync(new URL(`../workflows/${name}`, import.meta.url), "utf8"),
);

test("pins every release artifact upload to the reviewed v7 commit", () => {
  const uploadArtifactUses = workflowSources.flatMap((source) =>
    source.match(/actions\/upload-artifact@[^\s]+(?: # v\d+)?/g) ?? [],
  );

  assert.equal(uploadArtifactUses.length, 6);
  assert.deepEqual(new Set(uploadArtifactUses), new Set([uploadArtifactV7]));
});
