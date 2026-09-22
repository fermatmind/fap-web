import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const installer = readFileSync(new URL("./install-ossutil.sh", import.meta.url), "utf8");
const deployer = readFileSync(new URL("./deploy-web-release.sh", import.meta.url), "utf8");

test("ossutil bootstrap supports production hosts without unzip", () => {
  assert.match(installer, /command -v unzip/);
  assert.match(installer, /python3 -m zipfile -e/);
  assert.match(installer, /command -v bsdtar/);
  assert.match(installer, /sha256sum -c -/);
});

test("ossutil bootstrap failure still creates an exact-SHA transport receipt", () => {
  assert.match(deployer, /export OSS_BUCKET=/);
  assert.match(deployer, /! RUNNER_TEMP=.*install-ossutil\.sh/);
  assert.ok(deployer.includes("bash '$control/fetch-oss-release.sh'; exit \\$?;"));
});
